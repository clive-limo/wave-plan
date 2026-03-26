export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  xpForNext: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "Novice" },
  { level: 2, xp: 100, title: "Apprentice" },
  { level: 3, xp: 250, title: "Apprentice II" },
  { level: 4, xp: 400, title: "Apprentice III" },
  { level: 5, xp: 600, title: "Journeyman" },
  { level: 6, xp: 850, title: "Journeyman II" },
  { level: 7, xp: 1150, title: "Journeyman III" },
  { level: 8, xp: 1500, title: "Journeyman IV" },
  { level: 9, xp: 1900, title: "Expert" },
  { level: 10, xp: 2400, title: "Expert II" },
  { level: 15, xp: 5000, title: "Expert III" },
  { level: 20, xp: 8000, title: "Master" },
  { level: 25, xp: 12000, title: "Master II" },
  { level: 30, xp: 18000, title: "Master III" },
  { level: 40, xp: 30000, title: "Grandmaster" },
  { level: 50, xp: 50000, title: "Legend" },
];

export function getLevelInfo(totalXp: number): LevelInfo {
  let current = LEVEL_THRESHOLDS[0];

  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
    } else {
      return {
        level: current.level,
        title: current.title,
        xpRequired: current.xp,
        xpForNext: LEVEL_THRESHOLDS[i].xp,
      };
    }
  }

  return {
    level: current.level,
    title: current.title,
    xpRequired: current.xp,
    xpForNext: current.xp + 10000,
  };
}

export function getXpProgress(totalXp: number): number {
  const info = getLevelInfo(totalXp);
  const xpInLevel = totalXp - info.xpRequired;
  const xpNeeded = info.xpForNext - info.xpRequired;
  return Math.min(xpInLevel / xpNeeded, 1);
}
