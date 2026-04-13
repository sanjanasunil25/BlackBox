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
[
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

  return `Resource content:\n${safe}\n\nGenerate 5 Black Box rounds from this resource.\nReturn ONLY a valid complete JSON array. Do not truncate. Do not add any text before or after the JSON array.`;
}

export function cleanAndParseResponse(response: string): any[] {
  try {
    // find the first [ and last ] to extract just the JSON array
    const jsonStart = response.indexOf('[');
    const jsonEnd = response.lastIndexOf(']') + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON array found in response');
    }
    const jsonString = response.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not a JSON array');
    }

    if (parsed.length < 1) {
      throw new Error('No rounds found in response');
    }

    return parsed;
  } catch (error: any) {
    throw new Error('Failed to parse AI response: ' + error.message);
  }
}
