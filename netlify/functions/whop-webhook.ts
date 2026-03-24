import { Handler } from "@netlify/functions";
import { createHmac, timingSafeEqual } from "crypto";

export const handler: Handler = async (event) => {
  // 1. Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const rawBody = event.body || "";

  // 2. READ WHOP HEADERS — support both v1 (webhook-*) and v2 (svix-*) formats
  const webhookId = event.headers["webhook-id"] || event.headers["svix-id"];
  const webhookTimestamp = event.headers["webhook-timestamp"] || event.headers["svix-timestamp"];
  const webhookSignature = event.headers["webhook-signature"] || event.headers["svix-signature"];

  console.log("[Whop Webhook] Incoming request", {
    hasBody: rawBody.length > 0,
    webhookId: !!webhookId,
    webhookTimestamp: !!webhookTimestamp,
    webhookSignature: !!webhookSignature,
  });

  // 3. Ensure headers exist
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Missing signature" }),
    };
  }

  // 4. Load secret
  const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;
  if (!WHOP_WEBHOOK_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Webhook secret not configured" }),
    };
  }

  // 5. Build signing string EXACTLY as Whop expects
  const signingString = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  // Handle v2 secrets that start with whsec_ (base64 encoded)
  let secretKey: string | Buffer = WHOP_WEBHOOK_SECRET;
  if (WHOP_WEBHOOK_SECRET.startsWith("whsec_")) {
    secretKey = Buffer.from(WHOP_WEBHOOK_SECRET.slice(6), "base64");
  }

  const expectedSignature = createHmac("sha256", secretKey)
    .update(signingString)
    .digest("base64");

  // 6. Extract v1 signatures (Whop formats)
  const v1Signatures: string[] = [];
  const parts = webhookSignature.split(",").map((p) => p.trim());

  for (const part of parts) {
    if (part.startsWith("v1=")) {
      v1Signatures.push(part.slice(3));
    }
  }

  if (parts.length === 2 && parts[0] === "v1") {
    v1Signatures.push(parts[1]);
  }

  if (v1Signatures.length === 0) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid signature format" }),
    };
  }

  // 7. Constant-time comparison
  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  let valid = false;

  for (const sig of v1Signatures) {
    const providedBuf = Buffer.from(sig, "utf8");
    if (
      providedBuf.length === expectedBuf.length &&
      timingSafeEqual(providedBuf, expectedBuf)
    ) {
      valid = true;
      break;
    }
  }

  if (!valid) {
    console.log("[Whop Webhook] Invalid signature");
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid signature" }),
    };
  }

  // 8. Signature verified — process the event
  console.log("[Whop Webhook] Signature verified");

  const payload = JSON.parse(rawBody);

  // Whop uses different field names depending on API version
  const eventType = payload.action || payload.type || payload.event_type || payload.event || "";
  console.log("[Whop Webhook] Event type:", eventType);

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log("[Whop Webhook] Supabase env vars missing, skipping plan update");
    return { statusCode: 200, body: "ok" };
  }

  // 9. Extract email from Whop payload — check every possible location
  const email =
    payload?.data?.user?.email ||
    payload?.data?.customer?.email ||
    payload?.user?.email ||
    payload?.customer?.email ||
    payload?.data?.email ||
    payload?.email ||
    null;

  if (!email) {
    console.log("[Whop Webhook] No email found in payload");
    return { statusCode: 200, body: "ok" };
  }

  // 10. Determine plan from event type (handle both dot and underscore formats)
  const normalized = eventType.replace(/\./g, "_").toLowerCase();

  let plan: "free" | "paid" = "free";
  if (
    normalized === "membership_activated" ||
    normalized === "membership_went_valid" ||
    normalized === "payment_succeeded" ||
    normalized === "invoice_paid"
  ) {
    plan = "paid";
  }
  if (
    normalized === "membership_deactivated" ||
    normalized === "membership_went_invalid" ||
    normalized === "membership_canceled" ||
    normalized === "membership_expired"
  ) {
    plan = "free";
  }

  console.log("[Whop Webhook] Plan decision:", { email: email.toLowerCase(), plan, eventType, normalized });

  // 11. Find Supabase auth user by email
  const findUserRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users`,
    {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!findUserRes.ok) {
    console.log("[Whop Webhook] Failed to list users:", findUserRes.status);
    return { statusCode: 200, body: "ok" };
  }

  const usersData = await findUserRes.json();
  const users = usersData.users || usersData;
  const matchedUser = Array.isArray(users)
    ? users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
    : null;

  if (!matchedUser) {
    // No app account yet — store in pending_plans so it applies on signup
    console.log("[Whop Webhook] No Supabase user found, saving to pending_plans:", email);

    await fetch(
      `${SUPABASE_URL}/rest/v1/pending_plans`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          plan: plan,
          source: "lis",
          created_at: new Date().toISOString(),
        }),
      }
    );

    console.log("[Whop Webhook] Pending plan saved for", email);
    return { statusCode: 200, body: "ok" };
  }

  const userId = matchedUser.id;
  console.log("[Whop Webhook] Found user:", userId);

  // 12. Update user_profiles with the new plan
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan: plan,
        source: "lis",
        updated_at: new Date().toISOString(),
      }),
    }
  );

  const updateData = await updateRes.json();
  console.log("[Whop Webhook] Update result:", JSON.stringify(updateData));

  // If no row was updated, insert one
  if (Array.isArray(updateData) && updateData.length === 0) {
    console.log("[Whop Webhook] No profile row found, creating one");
    await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          id: userId,
          plan: plan,
          source: "lis",
          updated_at: new Date().toISOString(),
        }),
      }
    );
    console.log("[Whop Webhook] Profile created for", userId);
  }

  return { statusCode: 200, body: "ok" };
};
