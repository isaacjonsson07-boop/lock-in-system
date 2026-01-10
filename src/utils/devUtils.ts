export function isDevEnvironment(): boolean {
  if (import.meta.env.DEV) return true;

  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('bolt.new') ||
    hostname.includes('stackblitz') ||
    hostname.includes('webcontainer') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('.local')
  );
}

export type DevPlanOverride = 'free' | 'trial' | 'paid' | null;

export interface DevOverride {
  plan: DevPlanOverride;
  trialEndsAt: string | null;
}

const DEV_OVERRIDE_KEY = 'devPlanOverride';
const DEV_TRIAL_KEY = 'devTrialEndsAt';

export function getDevOverride(): DevOverride {
  if (!isDevEnvironment()) {
    return { plan: null, trialEndsAt: null };
  }

  const plan = localStorage.getItem(DEV_OVERRIDE_KEY) as DevPlanOverride;
  const trialEndsAt = localStorage.getItem(DEV_TRIAL_KEY);

  return {
    plan: plan || null,
    trialEndsAt: trialEndsAt || null
  };
}

export function setDevOverride(plan: DevPlanOverride, trialEndsAt: string | null = null): void {
  if (!isDevEnvironment()) return;

  if (plan === null) {
    localStorage.removeItem(DEV_OVERRIDE_KEY);
    localStorage.removeItem(DEV_TRIAL_KEY);
  } else {
    localStorage.setItem(DEV_OVERRIDE_KEY, plan);
    if (trialEndsAt) {
      localStorage.setItem(DEV_TRIAL_KEY, trialEndsAt);
    } else {
      localStorage.removeItem(DEV_TRIAL_KEY);
    }
  }
}

export function clearDevOverride(): void {
  localStorage.removeItem(DEV_OVERRIDE_KEY);
  localStorage.removeItem(DEV_TRIAL_KEY);
}
