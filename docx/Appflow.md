# App Flow — Black Box Game (G4) v2

> Every screen, button, card, and interaction — updated with correct game flow

---

## 1. Complete Screen Flow

```
Start Screen (Upload)
      │
      ▼
Loading Screen ("Generating...")
      │
      ▼
Round Active (Clue 1 of 6)
      │
      ├── Next Clue → Clue 2, 3, 4, 5, 6 (score drops each time)
      ├── Submit Guess (any time from clue 1)
      │       ├── Correct → Round Result (Correct)
      │       └── Wrong + clue 6 → Round Result (Forfeit)
      └── Hint → shows first letter + word length (−100 pts)
            │
            ▼
      Round Result Screen
            │
            ├── [Round 1–4] → Next Round → Round Active (new concept)
            └── [Round 5] → Final Summary Screen
                                │
                                ├── Play Again → Start Screen
                                └── (session ends)
```

---

## 2. Screen 1 — Start Screen

```
┌─────────────────────────────────────────────┐
│           (dark page: #07070f)              │
│                                             │
│              ┌──────────┐                  │
│              │    🔍    │  ← glowing       │
│              │  (glow)  │    indigo circle  │
│              └──────────┘                  │
│                                             │
│           BLACK BOX                        │
│     (gradient white→indigo text)           │
│                                             │
│  Upload a resource. Crack the concept.     │
│         (muted grey subtitle)              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │   │
│  │       📄                           │   │
│  │  │  Drop PDF here or click        │  │   │
│  │       to browse                   │   │
│  │  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │   │
│  │                                     │   │
│  │  ─────────── OR ───────────         │   │
│  │                                     │   │
│  │  ┌─────────────────────────────┐   │   │
│  │  │ Paste context here...       │   │   │
│  │  │                             │   │   │
│  │  └─────────────────────────────┘   │   │
│  │                                     │   │
│  │  [  Generate My Challenge →  ]      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Elements

| Element | Style | Behaviour |
|---------|-------|-----------|
| Page background | `#07070f` full viewport | Static |
| 🔍 Icon container | 100px circle, indigo glow, `rgba(99,102,241,0.2)` bg | Static |
| Title "BLACK BOX" | `3rem`, `900` weight, gradient text white→indigo | Static |
| Subtitle | `1.1rem`, `#94a3b8` | Static |
| Main card | `#0f0f1f`, `border-radius: 20px`, `padding: 36px` | Container |
| PDF drop zone | Dashed indigo border, `border-radius: 14px` | Click to browse OR drag PDF |
| OR divider | Two lines + "OR" text in `#4b5563` | Static |
| Paste textarea | Dark bg, indigo focus ring, `min-height: 120px` | Text input |
| Generate button | Indigo-violet-purple gradient, full width, `font-weight: 700` | Triggers generation |

---

## 3. Screen 2 — Loading Screen

```
┌─────────────────────────────────────────────┐
│                                             │
│         ┌──────────────────────┐           │
│         │                      │           │
│         │   🧠                 │           │
│         │                      │           │
│         │  Crafting Your       │           │
│         │  Challenge...        │           │
│         │                      │           │
│         │  Analysing your      │           │
│         │  document...         │           │
│         │                      │           │
│         │     • • •            │           │
│         │  (animated dots)     │           │
│         └──────────────────────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

### Elements

| Element | Style | Behaviour |
|---------|-------|-----------|
| Brain emoji | `64px` | Static |
| Title | Gradient text, `1.8rem`, `800` weight | Static |
| Subtitle | `#94a3b8`, `15px` | Static |
| 3 dots | Indigo, pulse animation staggered | Animated |

---

## 4. Screen 3 — Active Round

```
┌─────────────────────────────────────────────┐
│  [← Exit]   🔍 BLACK BOX   [Round 2 of 5]  │ ← Top bar
├─────────────────────────────────────────────┤
│  ████████░░░░░░░░░░░░░░░  (progress bar)   │ ← 3px indigo bar
├─────────────────────────────────────────────┤
│                                             │
│   800 pts              [Clue 2 of 6]       │ ← Score + clue counter
│  POTENTIAL SCORE                            │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  ║  "This process occurs in organisms  ║  │ ← Clue card
│  ║   that contain special pigments..."  ║  │   (indigo left border)
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────┐  [Submit]        │ ← Guess row
│  │ Your guess...        │                  │
│  └──────────────────────┘                  │
│                                             │
│  [Next Clue (−200 pts)]  [💡 Hint]         │ ← Action row
│                                             │
└─────────────────────────────────────────────┘
```

### Top Bar Elements

| Element | Style | Behaviour |
|---------|-------|-----------|
| Exit button | Ghost, `rgba(255,255,255,0.05)`, small | Opens exit modal |
| Title | `900` weight, `16px`, `letter-spacing: 0.15em` | Static |
| Round badge | Indigo pill `rgba(99,102,241,0.15)` | Shows "Round X of 5" |

### Score + Clue Counter Row

| Element | Style | Behaviour |
|---------|-------|-----------|
| Score number | `2.5rem`, `900` weight, gradient text | Updates on next clue click |
| "POTENTIAL SCORE" label | `12px`, `#4b5563`, uppercase | Static |
| Clue counter pill | Indigo outline pill | Shows "Clue X of 6" |

### Clue Card

| Element | Style | Behaviour |
|---------|-------|-----------|
| Card | Indigo gradient bg, `border-left: 4px solid #6366f1`, `border-radius: 20px` | Slide-in animation on new clue |
| Clue text | `1.15rem`, `line-height: 1.9`, `#f1f5f9` | New clue replaces old |

### Guess Input Row

| Element | Style | Behaviour |
|---------|-------|-----------|
| Text input | Dark bg, indigo focus border, full width | Autofocus on round start |
| Submit button | Indigo gradient, `font-weight: 700` | **ALWAYS enabled from clue 1** |
| Wrong flash | Red border flash briefly | On wrong guess |
| Correct flash | Green border → transition | On correct guess |

### Action Buttons Row

| Element | Style | Behaviour |
|---------|-------|-----------|
| Next Clue | Indigo outline, `flex: 1` | Shows score drop amount. Disabled after clue 6 |
| Hint | Amber outline, `flex: 1` | Shows first letter + word length. Costs 100 pts. Disabled after use |

---

## 5. Screen 4 — Round Result (Correct)

```
┌─────────────────────────────────────────────┐
│                                             │
│           ┌──────────┐                     │
│           │    ✅    │  ← green glow circle │
│           └──────────┘                     │
│                                             │
│              Correct!                      │
│         (emerald #10b981)                  │
│                                             │
│           The answer was:                  │
│         "Photosynthesis"                   │
│      (white, large, bold)                  │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Clues    │ │ Hint     │ │  Score   │   │
│  │ Used: 2  │ │ Used: No │ │  Earned  │   │
│  │          │ │          │ │   800    │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  [      Next Round →      ]                │
│  [         Exit           ]                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Screen 5 — Round Result (Forfeit)

```
┌─────────────────────────────────────────────┐
│                                             │
│           ┌──────────┐                     │
│           │    ❌    │  ← red glow circle   │
│           └──────────┘                     │
│                                             │
│          Not this time!                    │
│            (rose #f43f5e)                  │
│                                             │
│       The answer was: "Osmosis"            │
│                                             │
│  All clues:                                │
│  ┌─────────────────────────────────────┐   │
│  │ [1] "A fundamental process..."      │   │
│  │ [2] "Occurs across membranes..."    │   │
│  │ [3] "Involves water movement..."    │   │
│  │ [4] "From low to high conc..."      │   │
│  │ [5] "No energy required..."         │   │
│  │ [6] "The opposite of active..."     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [      Next Round →      ]                │
│  [         Exit           ]                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 7. Screen 6 — Final Summary

```
┌─────────────────────────────────────────────┐
│                                             │
│           ┌──────────┐                     │
│           │    🎯    │  ← indigo glow       │
│           └──────────┘                     │
│                                             │
│        Challenge Complete!                 │
│       (gradient text, 2.5rem)              │
│                                             │
│              3,400                         │
│           TOTAL SCORE                      │
│       (giant gradient number)              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Round │ Concept        │Clues│Score │   │
│  │───────│────────────────│─────│──────│   │
│  │   1   │ Photosynthesis │  2  │  800 │   │
│  │   2   │ Mitosis        │  1  │ 1000 │   │
│  │   3   │ ATP            │  4  │  400 │   │
│  │   4   │ Osmosis        │  6  │    0 │   │
│  │   5   │ DNA            │  3  │  600 │   │  ← green scores, red 0s
│  └─────────────────────────────────────┘   │
│                                             │
│  [      Play Again 🔄      ]               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 8. Exit Confirmation Modal

```
┌─────────────────────────────┐
│  Exit Black Box?            │
│                             │
│  Your current round         │
│  progress will be lost.     │
│                             │
│  [Keep Playing] [Exit]      │
└─────────────────────────────┘
```

---

## 9. Complete Button Reference

| Button | Screen | Enabled When | Action |
|--------|--------|--------------|--------|
| Generate My Challenge | Start | Input has content | Trigger Gemini API |
| Submit | Active Round | **Always — from clue 1** | Validate guess |
| Next Clue | Active Round | Clue index < 6 | Reveal next clue, drop score |
| Hint | Active Round | Not yet used, clue < 6 | Show hint, deduct 100 |
| Next Round | Round Result | Rounds 1–4 complete | Load next round |
| Exit (result screen) | Round Result | Always | Go to Final Summary |
| Play Again | Final Summary | Always | Reset to Start Screen |
| Keep Playing | Exit Modal | Always | Close modal |
| Exit (modal) | Exit Modal | Always | Go to Final Summary |
| Retry | Error Screen | Always | Re-trigger generation |