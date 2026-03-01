export function isTrialActive(trialEndsAt: string | null): boolean {
  // Trial is active if the user has started it (trialEndsAt is set)
  // It lasts forever, providing access to 7 days until they upgrade
  return trialEndsAt !== null;
}

export function getJournalAccessDays(
  plan: 'free' | 'paid',
  trialEndsAt: string | null
): number {
  // DEV: unlocked for testing — restore paywall before launch
  return 21;
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  // Trial never expires - return 0 to indicate no countdown
  return 0;
}
