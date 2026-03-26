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
