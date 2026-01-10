export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}

export function getJournalAccessDays(
  plan: 'free' | 'paid',
  trialEndsAt: string | null
): number {
  if (plan === 'paid') return 21;
  if (isTrialActive(trialEndsAt)) return 7;
  return 0;
}

export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt || !isTrialActive(trialEndsAt)) return 0;

  const now = new Date();
  const endsAt = new Date(trialEndsAt);
  const diffTime = endsAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
