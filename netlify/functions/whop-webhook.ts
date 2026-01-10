import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createHmac } from 'crypto';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('[Whop Webhook] Incoming request', {
    method: event.httpMethod,
    headers: {
      'content-type': event.headers['content-type'],
      'user-agent': event.headers['user-agent'],
      'x-whop-signature': event.headers['x-whop-signature'] ? '[REDACTED]' : undefined,
    },
    bodyLength: event.body?.length || 0,
    timestamp: new Date().toISOString()
  });

  if (event.httpMethod !== 'POST') {
    console.log('[Whop Webhook] Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const rawBody = event.body || '';
    const signature = event.headers['x-whop-signature'];

    console.log('[Whop Webhook] Request received', {
      bodyLength: rawBody.length,
      hasBody: rawBody.length > 0,
      hasSignature: !!signature
    });

    const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!WHOP_WEBHOOK_SECRET) {
      console.error('[Whop Webhook] WHOP_WEBHOOK_SECRET not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Webhook secret not configured' })
      };
    }

    if (!signature) {
      console.log('[Whop Webhook] Missing signature header');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing signature' })
      };
    }

    const expectedSignature = createHmac('sha256', WHOP_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.log('[Whop Webhook] Invalid Whop signature');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    console.log('[Whop Webhook] Signature verified successfully');

    const payload = JSON.parse(rawBody);
    const eventType = payload.type || payload.event_type || 'unknown';

    console.log('[Whop Webhook] Event type:', eventType);
    console.log('[Whop Webhook] Payload data:', {
      type: eventType,
      action: payload.action,
      hasData: !!payload.data
    });

    // TODO: Update user subscription status in Supabase based on event type

    console.log('[Whop Webhook] Returning OK response');

    return {
      statusCode: 200,
      body: 'ok'
    };
  } catch (error) {
    console.error('[Whop Webhook] Error processing webhook:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };
