export const SCORE_LADDER: Record<number, number> = {
  1: 1000,
  2: 800,
  3: 600,
  4: 400,
  5: 200,
  6: 50,
};

const HINT_PENALTY = 100;

export function calculateBlackboxScore(
  clueIndex: number,
  hintUsed: boolean
): number {
  const base = SCORE_LADDER[clueIndex] ?? 0;
  const penalty = hintUsed ? HINT_PENALTY : 0;
  return Math.max(0, base - penalty);
}

export function getPotentialScore(
  clueIndex: number,
  hintUsed: boolean
): number {
  return calculateBlackboxScore(clueIndex, hintUsed);
}

export function validateGuess(
  playerGuess: string,
  correctConcept: string
): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

  const guessNorm = normalize(playerGuess);
  const conceptNorm = normalize(correctConcept);

  if (guessNorm === conceptNorm) return true;

  const conceptWords = conceptNorm
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (
    conceptWords.length > 0 &&
    conceptWords.every((w) => guessNorm.includes(w))
  ) {
    return true;
  }

  return false;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
