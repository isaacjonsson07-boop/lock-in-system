export function isTrialActive(trialEndsAt: string | null): boolean {
  return false;
}

export function getJournalAccessDays(
  plan: 'free' | 'paid',
  trialEndsAt: string | null
): number {
  if (plan === 'paid') return 21;
  return 0;
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  return 0;
}
