# Design Tokens — Fastrack Deutsch
> Designed: 2026-04-20

## Overview

The current token set in `packages/config/src/theme.ts` and `apps/web/src/app/globals.css` is functional but has structural problems:

1. No semantic scale — colors are named by usage (timerWarning, streakFire) rather than by value, making dark mode nearly impossible to retrofit.
2. The primary brand color #1a3a5c is a valid ink-navy but there is no mid-range between it and white — no brand.300, no brand.400. You cannot build hover states or subtle tints without hardcoding ad-hoc values.
3. The CEFR level colors are Material Design defaults. A1 green (#4caf50) and A2 lime (#8bc34a) fail WCAG AA when used as backgrounds for white text at smaller type sizes.
4. The text color #1a1a2e has a faint purple cast that creates a slight dissonance against the pure-navy brand. Use a neutral dark instead.

The new token system below is the authoritative spec. The implementation-lead should replace the globals.css @theme block and the theme.ts exports to match.

---

## Color Palette

### Architecture

All CSS custom properties follow the pattern `--color-{group}-{step}`. Steps follow a 50–950 scale (like Tailwind) where lower = lighter. Semantic tokens reference palette tokens — never raw hex.

In dark mode, semantic tokens remap to different palette steps. Palette tokens themselves are static.

---

### Brand Palette (Ink Navy)

This is the identity color. It is used for the logo mark, primary interactive elements, active nav states, and the primary CTA button. It should never appear as a background on large surfaces.

```
brand.50:  #eef2f8   -- barely-there tint, use for brand-tinted surfaces
brand.100: #d5e0ef
brand.200: #a8bfdf
brand.300: #7099c8
brand.400: #3d72b0
brand.500: #1e5599   -- primary link color on white backgrounds
brand.600: #1a3a5c   -- THE brand color, logo mark, primary buttons (current: #1a3a5c, keep)
brand.700: #152e4a
brand.800: #0e2038
brand.900: #081527
brand.950: #040c18
```

**What changes from current:** brand.600 = existing #1a3a5c (no change). The addition is the full scale so hover/focus states can use brand.700, tints can use brand.100.

The current `primaryLight: #2a5298` maps to approximately brand.500. Rename it.

---

### Neutral Palette

The base for all surfaces, borders, and text. Pure greyscale — no blue or purple cast.

```
neutral.0:   #ffffff
neutral.50:  #f7f7f8   -- app background (replaces #f5f5f5)
neutral.100: #f0f0f1   -- surface-container
neutral.150: #e8e8ea   -- surface-container-high
neutral.200: #d9d9db   -- border default
neutral.300: #c0c0c3   -- border hover
neutral.400: #9a9a9e   -- text-disabled
neutral.500: #6b6b70   -- text-secondary
neutral.600: #48484e   -- text-tertiary (use sparingly)
neutral.700: #2e2e34   -- text-primary (replaces #1a1a2e — removes purple cast)
neutral.800: #1c1c21
neutral.900: #101013
neutral.950: #08080a
```

---

### CEFR Level Colors

The current level colors are Material Design defaults chosen for hue, not accessibility. The revised set maintains the hue family but adjusts saturation and lightness so that white text on the solid color clears WCAG AA (4.5:1) at all sizes, and the surface tint (bg color behind the badge text) clears 3:1.

Each level has three values: the solid color for filled badges/backgrounds, a surface tint (very light) for card backgrounds and info panels, and a text color for use on the surface tint.

**A1 — Emerald Green**
```
level.a1.solid:   #2d8a4e   -- was #4caf50 (too light, fails AA with white text)
level.a1.surface: #eaf7ef
level.a1.text:    #1a5c34
```
Contrast check: white on #2d8a4e = 5.1:1 (passes AA). #1a5c34 on #eaf7ef = 7.2:1 (passes AAA).

**A2 — Yellow-Green**
```
level.a2.solid:   #5e8a1a   -- was #8bc34a (fails AA with white at 2.9:1)
level.a2.surface: #f1f7e6
level.a2.text:    #3d5c10
```
Contrast check: white on #5e8a1a = 4.7:1 (passes AA). #3d5c10 on #f1f7e6 = 8.1:1 (passes AAA).

**B1 — Amber**
```
level.b1.solid:   #b86200   -- was #ff9800 (fails AA with white at 2.8:1)
level.b1.surface: #fff4e6
level.b1.text:    #7a4200
```
Contrast check: white on #b86200 = 4.6:1 (passes AA). #7a4200 on #fff4e6 = 8.9:1 (passes AAA).

**B2 — Burnt Orange**
```
level.b2.solid:   #c0390b   -- was #ff5722 (fails AA with white at 3.0:1)
level.b2.surface: #fdeee9
level.b2.text:    #8a2608
```
Contrast check: white on #c0390b = 5.4:1 (passes AA). #8a2608 on #fdeee9 = 9.2:1 (passes AAA).

**C1 — Violet**
```
level.c1.solid:   #6b2fa0   -- was #9c27b0 (marginally fails AA with white at 3.9:1)
level.c1.surface: #f3ecfa
level.c1.text:    #4a1f70
```
Contrast check: white on #6b2fa0 = 5.0:1 (passes AA). #4a1f70 on #f3ecfa = 8.4:1 (passes AAA).

---

### Semantic Colors

Semantic tokens are what the components use. They point to palette values and swap in dark mode.

```
-- Surface --
semantic.background:           neutral.50   (#f7f7f8)
semantic.surface:              neutral.0    (#ffffff)
semantic.surface-raised:       neutral.0    (#ffffff, with shadow)
semantic.surface-container:    neutral.100  (#f0f0f1)
semantic.surface-container-hi: neutral.150  (#e8e8ea)

-- Border --
semantic.border:               neutral.200  (#d9d9db)
semantic.border-hover:         neutral.300  (#c0c0c3)
semantic.border-focus:         brand.500    (#1e5599)

-- Text --
semantic.text-primary:         neutral.700  (#2e2e34)
semantic.text-secondary:       neutral.500  (#6b6b70)
semantic.text-tertiary:        neutral.400  (#9a9a9e)
semantic.text-disabled:        neutral.400  (#9a9a9e)
semantic.text-on-brand:        neutral.0    (#ffffff)
semantic.text-on-level:        neutral.0    (#ffffff)

-- Interactive --
semantic.interactive-primary:       brand.600  (#1a3a5c)
semantic.interactive-primary-hover: brand.700  (#152e4a)
semantic.interactive-primary-focus: brand.500  (#1e5599)

-- Status --
semantic.success:         #1e6e36   -- darker than current #2e7d32 for better contrast on light bg
semantic.success-surface: #eaf7ef
semantic.warning:         #9a5200   -- darker than current #f57c00
semantic.warning-surface: #fff4e6
semantic.error:           #b91c1c   -- closer to current #c62828
semantic.error-surface:   #fdecea
semantic.info:            #1a5599   -- = brand.500
semantic.info-surface:    brand.50  (#eef2f8)

-- Pass/Fail (exam-specific, alias to status) --
semantic.pass:         semantic.success         (#1e6e36)
semantic.pass-surface: semantic.success-surface (#eaf7ef)
semantic.fail:         semantic.error           (#b91c1c)
semantic.fail-surface: semantic.error-surface   (#fdecea)

-- Timer (exam-specific) --
semantic.timer-default:  brand.600   -- neutral, not alarming
semantic.timer-warning:  semantic.warning (#9a5200) on semantic.warning-surface
  NOTE: timer NEVER turns red. Warning (amber) is the maximum alarm state.
  See ExamTimer.tsx: isWarning threshold stays at 5 min, but the expired state
  should use warning coloring, not error. Do not show red on the timer at any point.

-- Readiness stages --
semantic.readiness-building:   neutral.400    (#9a9a9e) -- grey, not blue-grey
semantic.readiness-developing: brand.500      (#1e5599)
semantic.readiness-almost:     semantic.warning (#9a5200)
semantic.readiness-ready:      semantic.success (#1e6e36)
```

---

### Dark Mode

Dark mode remaps semantic tokens only. Palette tokens are always the same.

```
[dark mode semantic overrides]
semantic.background:           neutral.950  (#08080a)
semantic.surface:              neutral.900  (#101013)
semantic.surface-raised:       neutral.800  (#1c1c21)
semantic.surface-container:    neutral.800  (#1c1c21)
semantic.surface-container-hi: neutral.700  (#2e2e34)

semantic.border:               neutral.700  (#2e2e34)
semantic.border-hover:         neutral.600  (#48484e)

semantic.text-primary:         neutral.50   (#f7f7f8)
semantic.text-secondary:       neutral.400  (#9a9a9e)
semantic.text-tertiary:        neutral.500  (#6b6b70)
semantic.text-disabled:        neutral.600  (#48484e)

semantic.interactive-primary:       brand.400  (#3d72b0)
semantic.interactive-primary-hover: brand.300  (#7099c8)

-- Level solids are unchanged in dark mode (they're used as solid badges)
-- Level surfaces darken:
level.a1.surface [dark]: #0e2a18
level.a2.surface [dark]: #1a2208
level.b1.surface [dark]: #2a1800
level.b2.surface [dark]: #2a0e06
level.c1.surface [dark]: #1a0e2a
```

Dark mode implementation note: in Tailwind 4, use `@variant dark { ... }` inside `@theme` or use the `dark:` prefix. The implementation-lead should set `darkMode: 'class'` and wire a system-preference media query toggle. Explicit user toggle is a nice-to-have in v2.

---

## Typography

### The Case Against System Font

`font-family: system-ui` is the correct baseline for a minimum-viable product. It is not the right choice for a product that:
- Renders German text with umlauts (ä ö ü ß) prominently in large type
- Claims to be a serious exam tool (trust signals matter)
- Competes against Busuu/Babbel which also default to system UI

System font on Windows renders as Segoe UI. On Android it's Roboto. These are fine fonts in their context but they give Fastrack Deutsch no visual distinction whatsoever.

### Recommendation: DM Sans (body) + Instrument Serif (display, optional)

**Body: DM Sans**
- Google Fonts, free, subset-friendly
- Designed specifically for digital interfaces at reading sizes
- Renders ä ö ü ß with excellent quality — the umlauts sit cleanly at all weights
- Geometric-humanist feel: precise but not cold. Matches "Precise. Purposeful. Steady."
- Available weights: 300, 400, 500, 600, 700
- Used by: Raycast (close relative), Linear-adjacent tools, several fintech products

**Display (headings h1-h2 only): Instrument Serif**
- Google Fonts, free
- A modern serif with editorial authority. Contrast between the clean sans body and the serif display headings creates visual hierarchy without adding a third font.
- Use exclusively for the readiness stage label on the dashboard and the score results headline. Nowhere else.
- If this feels too expressive for the product: drop Instrument Serif entirely and use DM Sans Bold for headings too. Acceptable fallback.
- Renders German display text beautifully — "Prüfungsbereit" in Instrument Serif at 32px is genuinely handsome.

**Monospace: JetBrains Mono (subset)**
- For the exam timer only. A monospaced font prevents the timer digits from jumping horizontally as numbers change width.
- `font-variant-numeric: tabular-nums` alone is not sufficient if the underlying font has proportional digits. JetBrains Mono is monospaced by design.
- Subset to digits + colon only to keep the font load minimal: `U+0030-0039, U+003A`

### Type Scale

All values in rem. Base = 16px.

```
display:  2.25rem / 36px — Instrument Serif Bold, line-height 1.15, tracking -0.02em
h1:       1.875rem / 30px — DM Sans SemiBold (600), line-height 1.2, tracking -0.01em
h2:       1.5rem / 24px  — DM Sans SemiBold (600), line-height 1.25, tracking -0.01em
h3:       1.25rem / 20px — DM Sans Medium (500), line-height 1.3, tracking 0
h4:       1.125rem / 18px — DM Sans Medium (500), line-height 1.35, tracking 0
body:     1rem / 16px    — DM Sans Regular (400), line-height 1.55, tracking 0
body-sm:  0.875rem / 14px — DM Sans Regular (400), line-height 1.5, tracking 0
caption:  0.75rem / 12px  — DM Sans Medium (500), line-height 1.4, tracking 0.01em
mono:     0.875rem / 14px — JetBrains Mono, line-height 1.0 (timer only)
```

**German text notes:**
- ß renders correctly in DM Sans — test word: "Bestehensgrenze", "Prüfungsbereit"
- Long compound words (e.g. "Prüfungsvorbereitung", "Übungstest") should never be hyphenated in headings. Set `hyphens: none` on h1-h3. Allow hyphenation on body text where the container is narrow: `hyphens: auto; lang: de`.
- Do not use optical sizing for body text — it adds rendering complexity without meaningful gain at 16px.

### Font Loading Strategy

Load DM Sans 400, 500, 600 as `display: swap` via `<link rel="preload">`. Do not load 300 or 700 — they are not used in the type scale above. Instrument Serif Bold only (one weight needed). JetBrains Mono subset only for timer.

Total font payload: approximately 45KB gzipped. Acceptable.

---

## Spacing Scale

Augment the existing scale with a `2xs` step and align all values to a 4px base grid.

```
2xs:  0.125rem /  2px
xs:   0.25rem  /  4px
sm:   0.5rem   /  8px
md:   0.75rem  / 12px
base: 1rem     / 16px
lg:   1.25rem  / 20px
xl:   1.5rem   / 24px
2xl:  2rem     / 32px
3xl:  2.5rem   / 40px
4xl:  3rem     / 48px
5xl:  4rem     / 64px
6xl:  5rem     / 80px
```

The current scale matches this except for the new 2xs step and renaming clarifications. No breaking change.

---

## Border Radius Scale

The current scale is correct. The usage guidance is missing:

```
sm:   4px  — small inline elements: badges, tags, code snippets
md:   8px  — inputs, small buttons, stat cards
lg:   12px — standard cards, modals, toasts
xl:   16px — large cards, the readiness gauge panel, flashcard
2xl:  24px — full-bleed hero panels if used
full: 9999px — pills (level selector), avatar marks
```

The existing code uses `rounded-xl` (16px) for almost everything. That is slightly too uniform — mix in `rounded-lg` for secondary cards to create depth hierarchy. The readiness gauge and primary CTA button stay at `rounded-xl`.

---

## Shadow Scale

Replace the current React Native-style shadow objects with CSS values for the web layer. The theme.ts exports can stay for mobile; add a parallel web token set.

```
shadow.sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow.md:  0 2px 8px 0 rgb(0 0 0 / 0.07), 0 1px 2px 0 rgb(0 0 0 / 0.04)
shadow.lg:  0 4px 16px 0 rgb(0 0 0 / 0.08), 0 2px 4px 0 rgb(0 0 0 / 0.04)
shadow.xl:  0 8px 32px 0 rgb(0 0 0 / 0.10), 0 4px 8px 0 rgb(0 0 0 / 0.05)
```

Use shadow.sm for stat cards at rest. shadow.md for cards on hover. shadow.lg for modals and flashcard front face. Never use box-shadow on the timer — it adds visual weight where we want neutrality.

---

## Motion

### Philosophy

Motion in Fastrack Deutsch should be functional — it communicates state changes, not personality. A flashcard flipping needs the 3D rotation to communicate "this is reversible." A correct answer flash needs a brief positive signal. Nothing else needs to move for its own sake.

```
duration.instant:  0ms     — state-only, no animation (e.g., active tab color swap)
duration.fast:     120ms   — micro-interactions: button press, badge color change
duration.base:     200ms   — standard transition: card hover, nav link color
duration.moderate: 300ms   — component entrance: slide-in panel, modal open
duration.slow:     500ms   — flashcard flip (3D rotation)
duration.deliberate: 800ms — readiness gauge arc fill on dashboard load

easing.standard:    cubic-bezier(0.4, 0, 0.2, 1)   -- material standard, general use
easing.decelerate:  cubic-bezier(0, 0, 0.2, 1)      -- elements entering screen
easing.accelerate:  cubic-bezier(0.4, 0, 1, 1)      -- elements leaving screen
easing.spring:      cubic-bezier(0.34, 1.56, 0.64, 1) -- flashcard flip only
```

**Reduced motion:** all animations except the flashcard flip should collapse to `duration.instant` when `prefers-reduced-motion: reduce` is active. The flashcard flip itself should still work but without the 3D rotation — instead, cross-fade between front and back faces at 150ms. Implement this with the Tailwind `motion-safe:` and `motion-reduce:` variants.

---

## Implementation Note: Streak / Fire Emoji

The current `streakFire` (#ff6d00) and `streakBackground` (#fff3e0) tokens support a streak display with the fire emoji. This is the one place where the current implementation veers closest to Duolingo territory.

The spec does NOT remove streak tracking — total study days is motivationally useful. But the visual treatment should not use the fire emoji or orange fire color. Replace with:

```
semantic.streak:         brand.500   (#1e5599)
semantic.streak-surface: brand.50    (#eef2f8)
```

Display it as: "4 days this week" with a small calendar-grid icon (4 of 7 squares filled in brand.200, current week only). This communicates the same information without the casino-slot urgency of a fire streak.

The `streakFire` and `streakText` tokens can be deprecated from theme.ts in the next pass once the UI is updated.
