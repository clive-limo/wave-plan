export interface CheckinData {
  energy: number;
  mood: string;
  sleep_quality: number;
}

const MOOD_SCORES: Record<string, number> = {
  stressed: 1,
  drained: 2,
  neutral: 3,
  motivated: 4,
  energized: 5,
};

function moodToScore(mood: string): number {
  return MOOD_SCORES[mood] ?? 3;
}

export function calculateHp(checkins: CheckinData[]): number {
  if (checkins.length === 0) return 50;

  const recent = checkins.slice(-7);
  let total = 0;

  for (const c of recent) {
    const energyNorm = (c.energy - 1) / 4;
    const moodNorm = (moodToScore(c.mood) - 1) / 4;
    const sleepNorm = (c.sleep_quality - 1) / 4;
    total += energyNorm * 0.4 + moodNorm * 0.3 + sleepNorm * 0.3;
  }

  return Math.round((total / recent.length) * 100);
}

export function getHpColor(hp: number): string {
  if (hp < 30) return "#FF5A5A";
  if (hp < 60) return "#FF8F4D";
  return "#4EDD8E";
}

export function getHpLabel(hp: number): string {
  if (hp < 20) return "Critical";
  if (hp < 30) return "Burnout Risk";
  if (hp < 50) return "Low Energy";
  if (hp < 70) return "Steady";
  if (hp < 85) return "Strong";
  return "Thriving";
}
