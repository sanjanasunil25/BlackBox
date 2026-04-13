import type { GameConfig } from '@game-engine/types';

const MOCK_ROUNDS = {
  rounds: [
    {
      concept: 'Photosynthesis',
      clues: [
        'A transformation process fundamental to life on Earth',
        'It involves the conversion of one form of energy to another',
        'It occurs in organisms that contain special pigments',
        'Sunlight, water, and a gas are the key inputs',
        'The product includes glucose and oxygen',
        'Plants do this in their chloroplasts to make food',
      ],
    },
    {
      concept: 'Mitosis',
      clues: [
        'A process of duplication and division',
        'It produces two identical copies from one original',
        'It is essential for growth and tissue repair',
        'It takes place in the nucleus of eukaryotic cells',
        'It involves phases: prophase, metaphase, anaphase, telophase',
        'Cell division that keeps chromosome number the same',
      ],
    },
    {
      concept: 'ATP',
      clues: [
        'A carrier of something essential in living systems',
        'It stores and transfers a form of energy',
        'It is produced during cellular respiration',
        'It has three phosphate groups attached to a nucleoside',
        'Removing one phosphate group releases useful energy',
        'Adenosine triphosphate — the cell\'s main energy currency',
      ],
    },
    {
      concept: 'Osmosis',
      clues: [
        'Movement of particles from one place to another',
        'It follows a concentration gradient',
        'It involves a selectively permeable membrane',
        'No energy expenditure is required',
        'Water moves from low to high solute concentration',
        'The process by which plant roots absorb water from soil',
      ],
    },
    {
      concept: 'DNA',
      clues: [
        'A molecule that carries instructions',
        'It is found in almost every cell of an organism',
        'It is made of four chemical bases',
        'It forms a double helix structure',
        'It encodes proteins via codons',
        'Deoxyribonucleic acid — the blueprint of life',
      ],
    },
  ],
};

export class ClaudeService {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  private getMockResponse(): string {
    return JSON.stringify(MOCK_ROUNDS);
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    if (this.config.isDemo) {
      await new Promise((r) => setTimeout(r, 1500));
      return this.getMockResponse();
    }

    const apiKey = ((import.meta as any).env.VITE_OPENROUTER_API_KEY || '').trim();

    if (!apiKey) {
      throw new Error('API Key is not set in .env');
    }

    const url = `https://openrouter.ai/api/v1/chat/completions`;

    const MAX_CHARS = 4000;
    const safePrompt =
      prompt.length > MAX_CHARS
        ? prompt.substring(0, MAX_CHARS) + '\n[Truncated]'
        : prompt;

    const referer = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';

    console.log(`OpenRouter: Sending request with key starting with: ${apiKey.substring(0, 10)}...`);
    console.log(`OpenRouter: Using model: openrouter/free`);
    console.log(`OpenRouter: Referer: ${referer}`);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': referer,
            'X-Title': 'Black Box Game Engine',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openrouter/free',
            messages: [
              { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
              { role: 'user', content: safePrompt }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 4000,
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenRouter API error: ${response.status} - ${errorText}`
          );
        }

        const data = (await response.json()) as any;
        const rawText = data.choices?.[0]?.message?.content ?? '';
        console.log('OpenRouter: Response received');

        return rawText;
      } catch (err: any) {
        lastError = err;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError ?? new Error('OpenRouter API failed after retries');
  }
}
