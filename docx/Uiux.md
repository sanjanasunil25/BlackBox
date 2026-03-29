# UI/UX Reference — Black Box Game (G4) v2

> Indigo theme (PRD §5.5 default) | Bold, vibrant, premium design

---

## 1. Design Philosophy

Inspired by award-winning design studios — **bold typography, vivid gradients, dark immersive background, smooth transitions**. Think: professional game UI, not a basic form.

PRD specifies: **indigo as the default theme** with `ThemeConfig` prop.

---

## 2. Design Tokens

```css
/* Colors */
--page-bg:        #07070f;
--card-bg:        #0f0f1f;
--card-border:    rgba(255,255,255,0.07);
--indigo:         #6366f1;
--violet:         #8b5cf6;
--purple:         #a855f7;
--success:        #10b981;
--danger:         #f43f5e;
--warning:        #f59e0b;
--text-primary:   #ffffff;
--text-secondary: #94a3b8;
--text-muted:     #4b5563;
--text-indigo:    #a5b4fc;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
--gradient-text:    linear-gradient(135deg, #ffffff, #a5b4fc);
--gradient-clue:    linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05));
--gradient-progress: linear-gradient(90deg, #6366f1, #a855f7);

/* Shadows */
--glow-indigo:  0 0 40px rgba(99,102,241,0.3);
--glow-success: 0 0 40px rgba(16,185,129,0.3);
--glow-danger:  0 0 40px rgba(244,63,94,0.3);
--shadow-card:  0 8px 40px rgba(0,0,0,0.6);
--shadow-btn:   0 4px 24px rgba(99,102,241,0.4);

/* Radius */
--radius-card:   20px;
--radius-btn:    14px;
--radius-pill:   999px;
--radius-circle: 50%;

/* Typography */
--font: 'Inter', system-ui, sans-serif;
--weight-black: 900;
--weight-bold:  700;
--weight-semi:  600;
```

---

## 3. Component Specifications

### 3.1 Start Screen

```
Layout: Full viewport, flex center, dark background
Max width of content: 560px, centered

Hero Section:
  - Glow circle: 100px × 100px, indigo bg + glow shadow
  - Inside: 🔍 emoji at 48px
  - Below: "BLACK BOX" title in gradient text (white→indigo)
    Font size: 3rem, weight: 900, letter-spacing: -0.02em
  - Subtitle: "Upload a resource. Crack the concept."
    Color: #94a3b8, size: 1.1rem

Card:
  - bg: #0f0f1f, border: 1px rgba(255,255,255,0.07)
  - radius: 20px, padding: 36px, shadow: card shadow

Upload Zone (inside card):
  - border: 2px dashed rgba(99,102,241,0.4)
  - radius: 14px, padding: 32px 20px, text-align: center
  - Icon: 📄 at 32px
  - Primary text: "Drop PDF here or click to browse" (white, bold)
  - Sub text: "or click to browse" (indigo, 13px)

OR Divider:
  - Two flex lines (rgba(255,255,255,0.08) bg, 1px height)
  - "OR" text in #4b5563

Paste Textarea:
  - bg: rgba(255,255,255,0.03)
  - border: 1px rgba(255,255,255,0.08), radius: 14px
  - color: white, min-height: 120px
  - placeholder color: #4b5563

Generate Button:
  - bg: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)
  - Full width, radius: 14px, padding: 16px
  - Text: "Generate My Challenge →" weight: 700, size: 17px
  - Shadow: 0 4px 24px rgba(99,102,241,0.4)
```

---

### 3.2 Loading Screen

```
Layout: Full viewport, flex center

Card: max-width 400px, centered, padding 48px 36px

Content (centered):
  - 🧠 emoji at 64px, margin-bottom: 24px
  - "Crafting Your Challenge..." in gradient text
    Size: 1.8rem, weight: 800
  - Subtitle in #94a3b8, size: 15px
  - 3 animated dots in indigo (#6366f1)
    Animation: pulse, staggered delay
```

---

### 3.3 Game Screen (Active Round)

```
Layout: Full dark page

TOP BAR (max-width 760px, centered):
  Left: Exit button
    - bg: rgba(255,255,255,0.05), border: rgba(255,255,255,0.1)
    - radius: 10px, padding: 8px 16px, color: #94a3b8, size: 13px
  
  Center: "🔍 BLACK BOX"
    - weight: 900, size: 16px, letter-spacing: 0.15em
  
  Right: Round badge "Round X of 5"
    - bg: rgba(99,102,241,0.15), border: rgba(99,102,241,0.3)
    - radius: 999px, padding: 6px 16px, color: #a5b4fc, size: 13px

PROGRESS BAR:
  - Full width, height: 3px
  - bg: rgba(255,255,255,0.06)
  - Fill: linear-gradient(90deg, #6366f1, #a855f7)
  - Width: (roundIndex / 5) × 100%
  - Transition: width 0.5s ease

CONTENT AREA (max-width 680px, centered, padding: 0 24px):

  Score + Clue Row:
    - justify: space-between, align: center
    Left side:
      - Score number: 2.5rem, weight: 900, gradient text
      - "POTENTIAL SCORE": 11px, #4b5563, uppercase
    Right side:
      - "Clue X of 6" pill: indigo bg+border, radius: 999px

  Clue Card:
    - bg: gradient (indigo→purple subtle)
    - border-left: 4px solid #6366f1
    - border: 1px rgba(99,102,241,0.2)
    - radius: 20px, padding: 36px
    - Text: 1.15rem, line-height: 1.9, color: #f1f5f9
    - Animation: slide in from right on new clue

  Guess Input Row (flex, gap: 12px):
    - Input: dark bg, indigo focus border, white text, flex: 1
    - Submit: gradient bg, white, weight: 700
    - Submit ALWAYS enabled from clue 1

  Action Row (flex, gap: 12px):
    - Next Clue: indigo outline, flex: 1
      Disabled after clue 6
    - Hint: amber outline, flex: 1
      Disabled after use or at clue 6
```

---

### 3.4 Round Result — Correct

```
Layout: centered, max-width 560px, padding: 48px 24px, text-align: center

Result Circle:
  - 80×80px, bg: rgba(16,185,129,0.15)
  - border: 2px solid #10b981, radius: 50%
  - glow: 0 0 40px rgba(16,185,129,0.3)
  - Inside: ✅ at 36px

"Correct!" heading: #10b981, 2.5rem, weight: 900

"The answer was:" subtext: #94a3b8, 15px

Concept name: white, 2rem, weight: 800

Stat Cards Grid (3 columns):
  Each card: dark bg, border, radius: 16px, padding: 20px
  - "CLUES USED" / value: white, 1.8rem, bold
  - "HINT USED" / value: white
  - "SCORE EARNED" / value: #10b981, 1.8rem, bold

Next Round Button: full gradient, full width, padding: 18px
Exit Button: ghost, full width, color: #4b5563
```

---

### 3.5 Round Result — Forfeit

```
Same layout as Correct but:
- Red glow circle with ❌
- "Not this time!" in #f43f5e
- Clue review list (dark bg card)
  Each item: clue number pill (indigo) + clue text (#94a3b8)
```

---

### 3.6 Final Summary

```
Layout: centered, max-width 600px, padding: 48px 24px

Trophy circle (same as result circles but indigo glow):
  - bg: rgba(99,102,241,0.15), border: #6366f1
  - glow: indigo, inside: 🎯

"Challenge Complete!" gradient text, 2.5rem, weight: 900

Total score number: 4rem, weight: 900, gradient text

"TOTAL SCORE" label: muted, uppercase, small

Round Breakdown Table:
  Headers: muted, uppercase, small
  Rows: alternating slight shade
  Score column: green for scored rounds, red for 0

Play Again Button: gradient, full width, padding: 18px
```

---

## 4. Animation Reference

| Animation | Where | CSS |
|-----------|-------|-----|
| Clue slide in | New clue card | `transform: translateX(40px)` → `translateX(0)`, `opacity: 0→1`, `0.3s ease` |
| Score count down | Score display | Number animates down when Next Clue clicked |
| Dot pulse | Loading screen | `@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }` staggered |
| Button hover | All buttons | `opacity: 0.9`, `transform: translateY(-1px)` |
| Result circle | Result screens | Fade in + scale from 0.8→1 |
| Progress bar | Top of game | `transition: width 0.5s ease` |

---

## 5. Responsive Breakpoints

| Width | Changes |
|-------|---------|
| 360px+ | All content fits, buttons stack if needed |
| 640px+ | Cards at comfortable width |
| 768px+ | Stat cards in 3 columns |
| 1024px+ | Max widths kick in, content centered |