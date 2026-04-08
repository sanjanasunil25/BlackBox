# Black Box 🔍

> **G4 — Deduction / Strategy Game**
> GameEngine NX Monorepo | React + TypeScript | Google Gemini API

---

## What is Black Box?

An educational deduction game. The AI reads your uploaded resource and secretly picks a key concept. It delivers up to 6 clues — vague to specific. Guess the concept early = more points.

**5 rounds per session. Max 1,000 pts per round. Max 5,000 pts total.**

| Clue guessed after | Score |
|--------------------|-------|
| Clue 1 | 1,000 pts |
| Clue 2 | 800 pts |
| Clue 3 | 600 pts |
| Clue 4 | 400 pts |
| Clue 5 | 200 pts |
| Clue 6 | 50 pts |
| No correct guess | 0 pts |

---

## Setup

### 1. Environment

Create `.env` in the workspace root (`game-engine/`):

```
VITE_GEMINI_API_KEY=your_gemini_key_here
```

Get a free key at: **aistudio.google.com** → Get API Key → Create API key

### 2. Install & Build

```bash
npm install
npx nx build types
npx nx build utils
npx nx build session
npx nx build resource
npx nx build claude
npx nx build ui
npx nx build black-box
```

### 3. Run

```bash
npx nx serve game-engine-host --port 4200
```

Open `http://localhost:4200`

---

## AI Provider

This game uses **Google Gemini API** (free tier).

| Setting | Value |
|---------|-------|
| Model | `gemini-1.5-pro` |
| Auth | API key in URL (no headers needed) |
| Max tokens | 2000 |
| Free quota | 1,500 req/day |

The company will replace the Gemini key with their preferred AI provider key when integrating into their app.

---

## Theme (PRD §5.5 — Indigo default)

| Token | Value |
|-------|-------|
| Page background | `#07070f` |
| Card surface | `#0f0f1f` |
| Primary gradient | `linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)` |
| Success | `#10b981` |
| Danger | `#f43f5e` |
| Text primary | `#ffffff` |
| Text muted | `#94a3b8` |
| Border radius (cards) | `20px` |
| Border radius (buttons) | `14px` |
| Border radius (pills) | `999px` |

---

## Project Structure

```
libs/games/black-box/src/lib/
├── components/
│   ├── StartScreen.tsx      ← Upload + paste UI
│   ├── GameScreen.tsx       ← Active round UI
│   ├── ResultScreen.tsx     ← Correct/forfeit result
│   └── FinalSummary.tsx     ← End of 5 rounds
├── logic/
│   └── generation.ts        ← Prompt + JSON parser
├── useBlackBoxGame.ts        ← Core state hook
└── BlackBox.tsx              ← Root component
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Preview Mode" banner | Restart server after editing `.env` |
| 401 error | Delete `libs/shared/services/claude/dist`, rebuild |
| 404 model error | Change model to `gemini-1.5-pro` |
| 429 quota exceeded | Wait 2 min (free tier limit) |
| Old UI showing | Run `npx nx reset` then rebuild |
| `@game-engine/ui` not found | Run `npm install` then rebuild all |
| Only 1 round showing | Check generation.ts requests 5 rounds |
| Submit button disabled | Remove disabled condition from clue 1+ |

---

## PRD Reference

- Game spec: §4 G4 Black Box
- Scoring: §5.4 (max 1,000 per round)
- Theme: §5.5 (indigo default)
- Session length: 5–10 min
- Difficulty: Medium