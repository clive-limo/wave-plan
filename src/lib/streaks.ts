export const STREAK_PENALTY_PER_DAY = 10;
export const STREAK_PENALTY_CAP = 200;
export const SHIELD_INTERVAL_DAYS = 7;
export const SHIELD_MAX = 2;

export function calculateStreak(
  activityDates: string[],
  today: string
): number {
  if (activityDates.length === 0) return 0;

  const sorted = [...new Set(activityDates)].sort().reverse();
  const todayDate = new Date(today);

  // Check if the most recent activity is today or yesterday
  const mostRecent = new Date(sorted[0]);
  const diffDays = Math.floor(
    (todayDate.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const gap = Math.floor(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStreakPenalty(brokenStreak: number): number {
  if (brokenStreak <= 0) return 0;
  return Math.min(brokenStreak * STREAK_PENALTY_PER_DAY, STREAK_PENALTY_CAP);
}

export function isStreakBroken(
  lastActivityDate: string | null,
  today: string
): boolean {
  if (!lastActivityDate) return false;
  return daysBetween(lastActivityDate, today) > 1;
}

export function shouldEarnShield(
  newStreak: number,
  currentShields: number
): boolean {
  return (
    newStreak > 0 &&
    newStreak % SHIELD_INTERVAL_DAYS === 0 &&
    currentShields < SHIELD_MAX
  );
}

export function nextStreakValue(
  prevStreak: number,
  lastActivityDate: string | null,
  today: string
): number {
  if (!lastActivityDate) return 1;
  const diff = daysBetween(lastActivityDate, today);
  if (diff <= 0) return prevStreak === 0 ? 1 : prevStreak;
  if (diff === 1) return prevStreak + 1;
  return 1;
}
