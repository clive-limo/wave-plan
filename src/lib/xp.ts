export type Priority = "urgent" | "normal" | "low";

const BASE_XP: Record<Priority, number> = {
  low: 25,
  normal: 50,
  urgent: 100,
};

const OVERDUE_BONUS = 25;

export function getStreakMultiplier(streak: number): number {
  if (streak >= 7) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function calculateXp(
  priority: Priority,
  isOverdue: boolean,
  streak: number
): number {
  let xp = BASE_XP[priority];
  if (isOverdue) xp += OVERDUE_BONUS;
  xp = Math.floor(xp * getStreakMultiplier(streak));
  return xp;
}

const DAY_BLOCK_XP: Record<Priority, number> = {
  low: 15,
  normal: 25,
  urgent: 50,
};

export function calculateDayBlockXp(priority: Priority): number {
  return DAY_BLOCK_XP[priority];
}
