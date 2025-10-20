// Scoring utilities

export function computeScore(limit: number, used: number, streak = 0): number {
  if (!limit || limit <= 0) return 0;
  const base = Math.max(0, (limit - used) / limit) * 100;
  const bonus = used <= 0.5 * limit ? Math.min(5, Math.max(0, streak)) : 0;
  return Math.round(Math.min(100, Math.max(0, base + bonus)));
}

export function scoreColor(score: number): { text: string; ring: string } {
  if (score >= 80) return { text: "text-emerald-600", ring: "#10B981" };
  if (score >= 60) return { text: "text-amber-500", ring: "#F59E0B" };
  return { text: "text-rose-600", ring: "#E11D48" };
}

export function computeDelta(currentScore: number, previousScore: number): number {
  return currentScore - previousScore;
}
