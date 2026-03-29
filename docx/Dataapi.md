# Data & API — Black Box Game (G4) v2

> Gemini API integration, TypeScript contracts, prompts, session storage

---

## 1. API Configuration

| Property | Value |
|----------|-------|
| Provider | Google Gemini (free tier) |
| Model | `gemini-1.5-pro` |
| Endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}` |
| Auth method | API key in URL query param — NO headers needed |
| Max output tokens | 2000 |
| Temperature | 0.7 |
| Env variable | `VITE_GEMINI_API_KEY` |
| Retries | 2 retries with exponential backoff (1s, 2s) |

---

## 2. TypeScript Types

```typescript
// libs/shared/types/src/lib/types.ts

export interface GameConfig {
  apiKey: string;
  isDemo: boolean;  // true only when VITE_GEMINI_API_KEY is missing
}

export type GameStatus = 
  | 'idle' 
  | 'generating' 
  | 'ready' 
  | 'playing' 
  | 'complete' 
  | 'error';

export type GamePhase = 
  | 'start'
  | 'loading'
  | 'round_active'
  | 'round_result'
  | 'game_complete'
  | 'error';

export interface BlackboxRound {
  roundId: string;
  roundNumber: number;        // 1–5
  concept: string;            // The secret answer
  clues: string[];            // Exactly 6 clues
  cluesRevealed: number;      // 1–6
  hintUsed: boolean;
  scoreEarned: number;
  isCorrect: boolean;
}

export interface BlackboxGameData {
  gameId: string;
  rounds: BlackboxRound[];    // Always 5 rounds
  status: GameStatus;
  totalScore: number;
  currentRoundIndex: number;  // 0–4
  startedAt?: Date;
  completedAt?: Date;
}

export interface BlackboxGameState {
  gameData: BlackboxGameData | null;
  phase: GamePhase;
  currentRound: BlackboxRound | null;
  currentClueIndex: number;   // 1–6 (1-based)
  potentialScore: number;     // Updates on each next clue click
  hintAvailable: boolean;
  errorMessage: string | null;
}

export interface ScoreEvent {
  gameId: string;
  roundId: string;
  roundScore: number;
  sessionTotal: number;
  cluesUsed: number;
  hintUsed: boolean;
  isCorrect: boolean;
}

export interface SessionResult {
  gameId: string;
  gameType: 'black-box';
  totalScore: number;
  roundsPlayed: number;
  rounds: BlackboxRound[];
  completedAt: Date;
}
```

---

## 3. Gemini System Prompt

```typescript
export const BLACK_BOX_SYSTEM_PROMPT = `
You are a game content generator for an educational deduction game called Black Box.

TASK: Read the resource text and generate exactly 5 rounds. Each round has:
- One key concept from the resource (a single word or short phrase, max 4 words)
- Exactly 6 clues ordered from most vague to most specific

CLUE RULES:
- Clue 1: Abstract, could apply to many things. NEVER name the concept.
- Clue 2: Slightly more specific, still ambiguous.
- Clue 3: Hints at category or domain.
- Clue 4: Describes a key property specific to this concept.
- Clue 5: Very specific - only a few things match.
- Clue 6: Near-definitive - a student who read this resource should know it.

CONCEPT RULES:
- Choose concepts central to the resource, not trivial details
- Prefer terms requiring understanding, not just recall
- Each concept must be different - no repeats
- Avoid concepts too generic (e.g. "science", "system")

CRITICAL: Respond with ONLY valid JSON. No markdown, no headers, no explanation.
Start directly with { and end with }.
Do not use # or ``` in your response.

JSON FORMAT:
{
  "rounds": [
    {
      "concept": "the secret answer",
      "clues": [
        "Clue 1 - most vague",
        "Clue 2",
        "Clue 3",
        "Clue 4",
        "Clue 5",
        "Clue 6 - most specific"
      ]
    }
  ]
}

Generate exactly 5 rounds. Each must have exactly 6 clues.
`.trim();
```

---

## 4. User Prompt Builder

```typescript
export function buildBlackboxPrompt(
  resourceText: string,
  difficulty: string = 'medium'
): string {
  const MAX_CHARS = 4000;
  const safeText = resourceText.length > MAX_CHARS
    ? resourceText.substring(0, MAX_CHARS) + '\n[Content truncated]'
    : resourceText;

  return `
Resource content:
${safeText}

Generate 5 Black Box rounds from this resource.
Difficulty: ${difficulty}
Return exactly 5 rounds, each with exactly 6 clues.
Respond with JSON only - no markdown, no preamble, start with {
`.trim();
}
```

---

## 5. JSON Response Parser

```typescript
export function cleanAndParseResponse(rawText: string): BlackboxApiResponse {
  // Step 1: Remove markdown fences
  let cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '');

  // Step 2: Remove markdown headers (lines starting with #)
  cleaned = cleaned.replace(/^#+\s+.*$/gm, '');

  // Step 3: Extract JSON by finding first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    console.error('Raw response that failed:', rawText);
    throw new Error('No valid JSON found in Gemini response');
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (!parsed.rounds || !Array.isArray(parsed.rounds)) {
      throw new Error('Response missing rounds array');
    }
    if (parsed.rounds.length !== 5) {
      throw new Error(`Expected 5 rounds, got ${parsed.rounds.length}`);
    }
    for (const round of parsed.rounds) {
      if (!round.concept || !Array.isArray(round.clues) || round.clues.length !== 6) {
        throw new Error('Invalid round structure');
      }
    }

    return parsed;
  } catch (err) {
    console.error('Raw response:', rawText);
    throw err;
  }
}
```

---

## 6. Scoring Utility

```typescript
// libs/shared/utils/src/lib/game-utils.ts

const SCORE_LADDER: Record<number, number> = {
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
```

---

## 7. Guess Validation

```typescript
export function validateGuess(
  playerGuess: string,
  correctConcept: string
): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

  const guessNorm = normalize(playerGuess);
  const conceptNorm = normalize(correctConcept);

  // Exact match
  if (guessNorm === conceptNorm) return true;

  // All significant words present
  const conceptWords = conceptNorm
    .split(/\s+/)
    .filter(w => w.length > 2);

  if (conceptWords.length > 0 &&
      conceptWords.every(w => guessNorm.includes(w))) {
    return true;
  }

  return false;
}
```

---

## 8. Session Storage

```typescript
const KEY_PREFIX = 'game_engine_black_box_';

export function saveGame(gameData: BlackboxGameData): void {
  try {
    sessionStorage.setItem(
      KEY_PREFIX + gameData.gameId,
      JSON.stringify(gameData)
    );
  } catch (e) {
    console.warn('Session storage save failed:', e);
  }
}

export function loadGame(gameId: string): BlackboxGameData | null {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + gameId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
```

---

## 9. Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Missing Authentication | Old dist using OpenRouter | Delete claude/dist, rebuild |
| 404 model not found | Wrong model name | Use `gemini-1.5-pro` |
| 429 Quota exceeded | Rate limit hit | Wait 2 min, use `gemini-1.5-pro` |
| `isDemo: true` | `.env` not loaded | Restart dev server |
| JSON parse error | Gemini returned markdown | `cleanAndParseResponse()` handles this |
| 5 rounds not loading | Prompt asked for wrong count | Update prompt to request exactly 5 |