export const formatCountdown = (targetDate: string): string => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) {
    const absDiffMs = Math.abs(diffMs);
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor(absDiffMs / (1000 * 60));

    if (days >= 1) {
      return `Overdue by ${days} day${days === 1 ? '' : 's'}`;
    } else if (hours >= 1) {
      return `Overdue by ${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
      return `Overdue by ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (days >= 1) {
    return `${days} day${days === 1 ? '' : 's'} left`;
  } else if (hours >= 1) {
    return `${hours} hour${hours === 1 ? '' : 's'} left`;
  } else {
    return `${minutes} minute${minutes === 1 ? '' : 's'} left`;
  }
};

export const calculateTargetDate = (preset: string, customDaysValue?: string): string => {
  const now = new Date();
  let targetDate = new Date(now);

  switch (preset) {
    case '1day':
      targetDate.setDate(now.getDate() + 1);
      break;
    case '1week':
      targetDate.setDate(now.getDate() + 7);
      break;
    case '1month':
      targetDate.setMonth(now.getMonth() + 1);
      break;
    case '1year':
      targetDate.setFullYear(now.getFullYear() + 1);
      break;
    case 'custom':
      const days = parseInt(customDaysValue || '0', 10);
      if (days > 0) {
        targetDate.setDate(now.getDate() + days);
      }
      break;
  }

  return targetDate.toISOString().split('T')[0];
};

export const isOverdue = (targetDate: string): boolean => {
  return new Date(targetDate) < new Date();
};
