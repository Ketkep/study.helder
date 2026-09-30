export type MasteryLevel = "needs_work" | "learning" | "strong" | "mastered";

/**
 * Maps a 0 to 100 mastery score to its label (SPEC 10). The score itself is
 * computed elsewhere; this only decides which band it falls in.
 */
export function masteryLevel(score: number): MasteryLevel {
  const value = clampScore(score);
  if (value >= 90) return "mastered";
  if (value >= 70) return "strong";
  if (value >= 40) return "learning";
  return "needs_work";
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}
