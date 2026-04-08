# Requirements — Black Box Game (G4) v2

> NX Monorepo | React + TypeScript | Gemini API | Indigo Theme
> PRD Reference: GameEngine PRD v1.0 · Section G4

---

## 1. Game Overview (from PRD §4)

Black Box is a **Deduction / Strategy** game.
- AI picks a key concept from the resource and delivers clues one at a time
- Most vague → most specific
- Player guesses after any clue — fewer clues = more points
- Maximum 6 clues per round
- Session length: **5–10 minutes**
- Difficulty: **Medium**
- Resource type: **Any text / PDF**

---

## 2. Functional Requirements

### 2.1 Resource Ingestion (PRD §5.1)

| ID | Requirement |
|----|-------------|
| FR-01 | Accept PDF files up to 10 MB, max 50 pages parsed |
| FR-02 | Accept plain text (.txt, .md) up to 200 KB, UTF-8 |
| FR-03 | Validate file type and size before processing |
| FR-04 | Extract text from PDF using PDF.js with worker from CDN |
| FR-05 | Split extracted text into chunks of ~2,000 tokens |
| FR-06 | Truncate prompt to max 4,000 characters before sending to AI |

### 2.2 AI Generation (PRD §5.1 + G4 spec)

| ID | Requirement |
|----|-------------|
| FR-07 | Use **Google Gemini API** (`gemini-1.5-pro` or `gemini-2.0-flash`) |
| FR-08 | API key stored in `.env` as `VITE_GEMINI_API_KEY` |
| FR-09 | API key passed via URL query param (no auth headers needed) |
| FR-10 | Generate exactly **5 rounds** per session |
| FR-11 | Each round: one unique concept + exactly **6 clues** |
| FR-12 | Clues ordered: most vague (clue 1) → most specific (clue 6) |
| FR-13 | Clue 1 must never name or obviously imply the answer |
| FR-14 | Response must be valid JSON — strip markdown before parsing |
| FR-15 | Retry up to 2 times on failure with exponential backoff |
| FR-16 | If generation fails after retries: show error with Retry button |
| FR-17 | Cache generated game data in `sessionStorage` |
| FR-18 | `isDemo` must be `false` when API key is present |

### 2.3 Gameplay Mechanics (PRD §4 G4)

| ID | Requirement |
|----|-------------|
| FR-19 | Show clues one at a time — player must click "Next Clue" |
| FR-20 | Player can submit a guess after ANY clue (from clue 1 onwards) |
| FR-21 | Submit button enabled from clue 1 — never disabled during active round |
| FR-22 | Maximum 6 clues per round |
| FR-23 | Guess validation: case-insensitive, trim whitespace, allow partial match |
| FR-24 | On correct guess: show round result screen with score |
| FR-25 | On wrong guess with clues remaining: flash red, allow next clue |
| FR-26 | On wrong guess at clue 6: round ends, show forfeit screen |
| FR-27 | After clue 6 with no guess: show forfeit, reveal answer |
| FR-28 | After each round result: show "Next Round" button |
| FR-29 | After round 5: show Final Summary screen |

### 2.4 Scoring System (PRD §5.4)

| ID | Requirement |
|----|-------------|
| FR-30 | Scoring ladder: Clue 1=1000, Clue 2=800, Clue 3=600, Clue 4=400, Clue 5=200, Clue 6=50 |
| FR-31 | Max score per round: 1,000 pts (PRD §5.4) |
| FR-32 | Forfeit = 0 points for that round |
| FR-33 | Session total = sum of all 5 round scores (max 5,000) |
| FR-34 | Potential score display updates immediately on "Next Clue" click |
| FR-35 | Hint deducts 100 pts from potential score |
| FR-36 | Fire `onScore` callback after each round |
| FR-37 | Fire `onGameComplete` callback after final round |

### 2.5 UI & Navigation (PRD §5.2, §5.3)

| ID | Requirement |
|----|-------------|
| FR-38 | Upload screen: drag-and-drop zone + paste text option |
| FR-39 | Loading screen: shown while Gemini generates clues |
| FR-40 | Top bar: Exit button, "🔍 BLACK BOX" title, Round badge "Round X of 5" |
| FR-41 | Score display: shows current potential score, updates on next clue |
| FR-42 | Progress bar: shows round progress (rounds completed / 5) |
| FR-43 | Clue counter: "Clue X of 6" pill badge |
| FR-44 | Clue card: displays current clue text with indigo left border |
| FR-45 | Guess input: text field + Submit button, always enabled during round |
| FR-46 | Next Clue button: disabled after clue 6 |
| FR-47 | Hint button: shows first letter + word length, costs 100 pts |
| FR-48 | Round result screen: correct (green) or forfeit (red) with all stats |
| FR-49 | Final summary: total score, round breakdown table, Play Again button |
| FR-50 | Exit confirmation modal when player clicks Exit during active round |

---

## 3. Non-Functional Requirements (PRD §9)

| ID | Area | Requirement |
|----|------|-------------|
| NFR-01 | Performance | Generation < 8s after upload |
| NFR-02 | Performance | Game launch < 200ms from ready state |
| NFR-03 | Bundle | Black Box lazy-loaded via dynamic import() |
| NFR-04 | Accessibility | WCAG 2.1 AA — keyboard nav + ARIA labels + colour contrast |
| NFR-05 | Browser | Chrome 100+, Firefox 100+, Safari 16+, Edge 100+ |
| NFR-06 | Security | API key never logged or stored in localStorage |
| NFR-07 | TypeScript | tsc --strict passes, no implicit any |
| NFR-08 | Error handling | All API failures show user-facing error + retry |
| NFR-09 | Responsive | Playable at 360px minimum width |

---

## 4. Theme Requirements (PRD §5.5)

- Default theme: **Indigo** (as specified in PRD)
- Primary colour: `#6366f1` (indigo-500)
- Secondary: `#8b5cf6` (violet-500)
- Accent: `#a855f7` (purple-500)
- Dark background: `#07070f`
- Card surface: `#0f0f1f`
- Success: `#10b981`
- Danger: `#f43f5e`
- Font: Inter, system-ui
- Border radius: 16–20px on cards, 14px on buttons, 999px on pills

---

## 5. API Configuration

- **AI Provider:** Google Gemini (free tier)
- **Model:** `gemini-1.5-pro` (primary) or `gemini-2.0-flash` (fallback)
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
- **Auth:** API key in URL — NO Authorization header needed
- **Max output tokens:** 2000
- **Temperature:** 0.7
- **Env variable:** `VITE_GEMINI_API_KEY`

---

## 6. Acceptance Criteria

- [ ] Paste text → Generate → 5 rounds load correctly
- [ ] Upload PDF → text extracts → 5 rounds generate
- [ ] Clues reveal one at a time, score drops correctly
- [ ] Submit button works from clue 1
- [ ] Correct guess → round result → Next Round → next concept loads
- [ ] After round 5 → Final Summary with total score
- [ ] All 5 round scores sum correctly
- [ ] Hint deducts 100 pts
- [ ] `onScore` and `onGameComplete` fire correctly
- [ ] UI matches indigo dark theme
- [ ] No API key in console logs