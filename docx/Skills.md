# Skills & Tech Stack — Black Box Game (G4) v2

---

## 1. NX Commands You Need

```bash
# Daily commands
npx nx serve game-engine-host --port 4200   # run the app
npx nx reset                                 # clear cache (use when UI not updating)
npx nx build <library-name>                  # build a specific lib

# Build order (always this order)
npx nx build types
npx nx build utils
npx nx build session
npx nx build resource
npx nx build claude
npx nx build ui
npx nx build black-box

# When something breaks badly
Remove-Item -Recurse -Force ".\node_modules\@game-engine"
npm install
npx nx reset
# then rebuild in order above
```

---

## 2. Gemini API — Key Facts

```typescript
// ✅ CORRECT — key in URL, no Authorization header
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // ONLY this header
  body: JSON.stringify({
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
  })
});

// Response parsing
const data = await response.json();
const rawText = data.candidates[0].content.parts[0].text;
```

```typescript
// ❌ WRONG — do not add these headers (they're for Anthropic/OpenRouter)
headers: {
  'x-api-key': apiKey,           // ❌ Anthropic header
  'Authorization': `Bearer ${apiKey}`, // ❌ OpenRouter header
  'anthropic-version': '...',    // ❌ Anthropic header
}
```

---

## 3. Gemini Models (free tier)

| Model | Status | Notes |
|-------|--------|-------|
| `gemini-1.5-pro` | ✅ Use this | Best quality, free |
| `gemini-2.0-flash` | ⚠️ Limited | Low free quota |
| `gemini-1.5-flash-8b` | ❌ Broken | 404 error |
| `gemini-1.5-flash-latest` | ⚠️ Try if pro fails | |

---

## 4. React Patterns Used

### useReducer for game state
```typescript
type Action =
  | { type: 'GENERATION_SUCCESS'; payload: BlackboxGameData }
  | { type: 'REVEAL_CLUE' }
  | { type: 'SUBMIT_GUESS'; payload: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'USE_HINT' };

function gameReducer(state: BlackboxGameState, action: Action): BlackboxGameState {
  switch (action.type) {
    case 'REVEAL_CLUE':
      const newIndex = state.currentClueIndex + 1;
      return {
        ...state,
        currentClueIndex: newIndex,
        potentialScore: SCORE_LADDER[newIndex] - (state.currentRound?.hintUsed ? 100 : 0)
      };
    // ... etc
  }
}
```

### Score ladder
```typescript
const SCORE_LADDER: Record<number, number> = {
  1: 1000, 2: 800, 3: 600, 4: 400, 5: 200, 6: 50
};
```

---

## 5. Indigo Theme Inline Styles

Copy-paste these directly into components:

```typescript
// Page background
style={{ background: '#07070f', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}

// Card
style={{ background: '#0f0f1f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '36px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}

// Primary gradient button
style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)', color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '17px', fontWeight: 700, width: '100%', cursor: 'pointer' }}

// Gradient text (title)
style={{ background: 'linear-gradient(135deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3rem', fontWeight: 900 }}

// Indigo pill badge
style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', padding: '6px 16px', color: '#a5b4fc', fontSize: '13px', fontWeight: 600 }}

// Clue card
style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))', borderLeft: '4px solid #6366f1', borderRadius: '20px', padding: '36px', fontSize: '1.15rem', lineHeight: 1.9 }}

// Outline button (Next Clue)
style={{ background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.3)', color: '#818cf8', borderRadius: '14px', padding: '14px', fontWeight: 600, cursor: 'pointer', flex: 1 }}

// Amber button (Hint)
style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: '14px', padding: '14px', fontWeight: 600, cursor: 'pointer', flex: 1 }}

// Success circle (Correct)
style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}

// Danger circle (Forfeit)
style={{ width: '80px', height: '80px', background: 'rgba(244,63,94,0.15)', border: '2px solid #f43f5e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(244,63,94,0.3)' }}

// Progress bar container
style={{ height: '3px', background: 'rgba(255,255,255,0.06)', width: '100%' }}

// Progress bar fill
style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'width 0.5s ease', width: `${(currentRoundIndex / 5) * 100}%` }}

// Dark input
style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px 20px', color: 'white', fontSize: '16px', width: '100%', outline: 'none' }}
```

---

## 6. Common Bugs & Fixes

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Submit only works on clue 6 | `disabled={clueIndex < 6}` condition | Remove disabled condition entirely |
| Score not updating on Next Clue | State not updating potentialScore | Update in REVEAL_CLUE reducer action |
| Only 1 round plays | Prompt requests 1 concept | Update prompt to request 5 rounds |
| JSON parse error `#` | Gemini returned markdown | Use `cleanAndParseResponse()` |
| `isDemo: true` | `.env` not loaded | Restart dev server |
| Old UI after changes | NX cache | `npx nx reset` |

---

## 7. PDF Extraction (pdfjs-dist)

```typescript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  const maxPages = Math.min(pdf.numPages, 50);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}
```