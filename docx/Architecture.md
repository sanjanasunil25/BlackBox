# Architecture — Black Box Game (G4) v2

> NX Monorepo | React + TypeScript | Gemini API | Indigo Theme

---

## 1. NX Monorepo Structure

```
game-engine/                                    ← NX workspace root
├── .env                                        ← VITE_GEMINI_API_KEY=your_key
├── nx.json
├── package.json
├── tsconfig.base.json
│
├── apps/
│   └── game-engine-host/                       ← Host app
│       └── src/app/
│           ├── app.tsx                         ← Sets isDemo: !apiKey
│           ├── app.css
│           └── game-registry.ts
│
└── libs/
    ├── shared/
    │   ├── types/src/lib/
    │   │   ├── types.ts                        ← GameConfig, BlackboxRound etc
    │   │   └── shared-types.ts
    │   ├── services/
    │   │   ├── claude/src/lib/
    │   │   │   └── claude.service.ts           ← ⭐ GEMINI API CALL LIVES HERE
    │   │   ├── resource/src/lib/
    │   │   │   └── resource.service.ts         ← PDF.js extraction
    │   │   └── session/src/lib/
    │   │       └── session.service.ts          ← sessionStorage read/write
    │   ├── ui/src/lib/
    │   │   ├── Button/Button.tsx
    │   │   ├── Card/Card.tsx
    │   │   ├── Input/Input.tsx
    │   │   └── GameLauncher/GameLauncher.tsx
    │   └── utils/src/lib/
    │       └── game-utils.ts                   ← scoring calculations
    │
    └── games/
        └── black-box/src/lib/                  ← ✅ YOUR MODULE
            ├── components/
            │   ├── StartScreen.tsx
            │   ├── GameScreen.tsx
            │   ├── ResultScreen.tsx
            │   └── FinalSummary.tsx
            ├── logic/
            │   └── generation.ts               ← builds prompt, calls ClaudeService
            ├── useBlackBoxGame.ts              ← core state hook
            └── BlackBox.tsx                    ← root component
```

---

## 2. Critical File: `claude.service.ts`

This is the **only file** that makes the Gemini API call. It must look exactly like this:

```typescript
export class ClaudeService {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    // isDemo must be FALSE when VITE_GEMINI_API_KEY is set
    if (this.config.isDemo) {
      return this.getMockResponse();
    }

    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

    // Gemini uses key in URL — NO Authorization header needed
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const MAX_CHARS = 4000;
    const safePrompt = prompt.length > MAX_CHARS
      ? prompt.substring(0, MAX_CHARS) + '\n[Truncated]'
      : prompt;

    const fullPrompt = (systemPrompt || '') + '\n\n' + safePrompt;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
```

---

## 3. Critical File: `app.tsx`

```typescript
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';

const G4_CONFIG = {
  apiKey,
  isDemo: !apiKey  // false when key exists, true when missing
};
```

---

## 4. Critical File: `.env`

```
VITE_GEMINI_API_KEY=AIzaSyBpaG8AF8jQ9GKnwIysXB0xgekW2clUiQ0
```

Must be in the **workspace root** (same level as `nx.json`).

---

## 5. Layer Architecture

```
┌────────────────────────────────────────────┐
│  PRESENTATION                              │
│  StartScreen, GameScreen,                 │
│  ResultScreen, FinalSummary               │
└──────────────────┬─────────────────────────┘
                   │ uses
┌──────────────────▼─────────────────────────┐
│  STATE                                     │
│  useBlackBoxGame hook                      │
│  manages: phase, clueIndex,               │
│  potentialScore, rounds, currentRound      │
└──────────────────┬─────────────────────────┘
                   │ calls
┌──────────────────▼─────────────────────────┐
│  SERVICE                                   │
│  generation.ts → ClaudeService             │
│  (builds prompt, parses JSON response)     │
└──────────────────┬─────────────────────────┘
                   │ calls
┌──────────────────▼─────────────────────────┐
│  API                                       │
│  Google Gemini API                         │
│  gemini-1.5-pro via URL key auth          │
└────────────────────────────────────────────┘
```

---

## 6. Data Flow

```
.env (VITE_GEMINI_API_KEY)
    │
    ▼
app.tsx (G4_CONFIG.isDemo = false)
    │
    ▼
BlackBox.tsx → useBlackBoxGame
    │
    ▼
generation.ts
    │  builds prompt: SYSTEM_PROMPT + resource text (max 4000 chars)
    ▼
ClaudeService.generate()
    │  POST to Gemini URL with key
    ▼
Gemini API → raw text response
    │
    ▼
cleanJsonResponse() → JSON.parse()
    │  validates: 5 rounds, 6 clues each
    ▼
BlackboxGameData stored in sessionStorage
    │
    ▼
useBlackBoxGame state updates
    │  currentRoundIndex: 0→1→2→3→4
    ▼
React components render
    │
    ▼
onScore / onGameComplete callbacks → host app
```

---

## 7. Build Commands (in order)

```bash
# After any source change to shared services:
npx nx build types
npx nx build utils
npx nx build session
npx nx build resource
npx nx build claude      # ← builds Gemini API wrapper
npx nx build ui
npx nx build black-box

# Serve
npx nx serve game-engine-host --port 4200
```

---

## 8. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `isDemo: true` / preview mode | `.env` not loaded | Restart server after editing `.env` |
| 401 Missing Auth header | Old OpenRouter dist still cached | Delete `libs/shared/services/claude/dist` and rebuild |
| 404 model not found | Wrong model name | Use `gemini-1.5-pro` |
| 429 quota exceeded | Too many requests | Wait 2 mins or use `gemini-1.5-pro` |
| Old UI showing | NX cache serving old build | Run `npx nx reset` then rebuild |
| `@game-engine/ui` not found | `node_modules/@game-engine` deleted | Run `npm install` then rebuild all |