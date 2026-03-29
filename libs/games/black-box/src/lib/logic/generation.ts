import type { BlackboxApiResponse } from '@game-engine/types';

export const BLACK_BOX_SYSTEM_PROMPT = `
You are a game content generator for an educational deduction game called Black Box.

TASK: Read the resource text and generate exactly 5 rounds.

Each round must have:
- One key concept from the resource (single word or short phrase, max 4 words)
- Exactly 6 clues ordered from MOST VAGUE to MOST SPECIFIC

CLUE RULES:
- Clue 1: Abstract, could apply to many things. NEVER name or imply the concept.
- Clue 2: Slightly more specific, still ambiguous.
- Clue 3: Hints at category or domain.
- Clue 4: Describes a key property of this specific concept.
- Clue 5: Very specific - only a few things match.
- Clue 6: Near-definitive - student who read this resource would know it.

CONCEPT RULES:
- Choose 5 DIFFERENT concepts central to the resource
- Prefer terms requiring understanding, not just recall
- Each concept must be unique - no repeats
- Avoid generic concepts like "system", "process", "science"

CRITICAL OUTPUT RULES:
- Respond with ONLY valid JSON
- Do NOT use markdown, headers, backticks, or any text outside JSON
- Do NOT start with # or any markdown
- Start your response directly with { and end with }

REQUIRED JSON FORMAT:
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

Generate exactly 5 rounds. Each round must have exactly 6 clues.
`.trim();

export function buildBlackboxPrompt(
  resourceText: string,
  _difficulty = 'medium'
): string {
  const MAX_CHARS = 4000;
  const safe =
    resourceText.length > MAX_CHARS
      ? resourceText.substring(0, MAX_CHARS) + '\n[Content truncated]'
      : resourceText;

  return `Resource content:\n${safe}\n\nGenerate 5 Black Box rounds from this resource.\nRespond with JSON only. Start with { and end with }.`;
}

export function cleanAndParseResponse(rawText: string): BlackboxApiResponse {
  // Remove markdown fences
  let cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '');

  // Remove markdown headers
  cleaned = cleaned.replace(/^#+\s+.*$/gm, '');

  // Extract JSON boundaries
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    console.error('Raw response that failed:', rawText);
    throw new Error('No valid JSON found in OpenRouter response');
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

  const parsed = JSON.parse(jsonString) as BlackboxApiResponse;

  if (!parsed.rounds || !Array.isArray(parsed.rounds)) {
    throw new Error('Response missing rounds array');
  }

  if (parsed.rounds.length < 1) {
    throw new Error('No rounds in response');
  }

  for (const round of parsed.rounds) {
    if (
      !round.concept ||
      !Array.isArray(round.clues) ||
      round.clues.length !== 6
    ) {
      throw new Error(
        `Invalid round structure - need concept + 6 clues (got ${round.clues?.length})`
      );
    }
  }

  return parsed;
}
