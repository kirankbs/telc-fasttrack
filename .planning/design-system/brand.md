# Brand — Fastrack Deutsch
> Designed: 2026-04-20

## The Problem with the Current Brand

"Fastrack Deutsch" in plain bold next to a lighter-weight "Deutsch" is not a brand. It's a title. There is no mark, no visual signature, no moment where someone sees the product and recognises it without reading. The dark navy + green-accent combination is competent but anonymous — it reads like a fintech dashboard that happened to be about German. That's not wrong, but it's also not memorable.

The good news: the product positioning is already strong and honest. "Spend X hours. Pass telc." is a real promise, not marketing speak. The design job is to make the visual identity match that directness.

---

## Brand Positioning

### Three Adjectives

**Precise. Purposeful. Steady.**

- Precise: we are about a specific exam, specific pass thresholds, specific outcomes. Not "learn German" — pass telc.
- Purposeful: every minute of the user's study time is directed. No filler content, no mascots, no daily streaks designed to pad engagement metrics.
- Steady: the opposite of exam anxiety. Calm forward motion. The visual language should never feel urgent or panicked.

### Voice and Tone

The product speaks like a knowledgeable colleague who has passed this exam and knows exactly what you need to do next. Not a tutor performing enthusiasm. Not a startup doing cheerful UX copy. Think: the difference between a Duolingo owl and a quiet, precise reference tool that you trust because it is always right.

**Voice characteristics:**
- Direct. "You scored 72% — above the 60% threshold." Not "Great job, you're making progress!"
- German-aware. Mix of German section names (Hören, Lesen, Schreiben) with English UI scaffolding is correct and intentional. Do not anglicise German exam terminology.
- Numerically confident. Specific numbers, not vague encouragement. "14 hours practiced" not "You've been working hard."
- Calm on bad days. A failing score report should feel honest and actionable, not shameful.

**Tone varies by context:**
- Dashboard: matter-of-fact. State where they are.
- Mid-exam: nearly silent. Get out of the way.
- Results: warm-factual. Lead with what they got right.
- Flashcard correct: brief positive acknowledgement, then move on.
- Flashcard wrong: neutral. Show the answer. No commentary.

---

## Logo / Wordmark Direction

### The Problem

The current wordmark is split: "Fastrack" bold + "Deutsch" medium-weight. This creates a confusing hierarchy — is the product called Fastrack? Fastrack Deutsch? The "Deutsch" reads like a subtitle or category label, not a proper noun.

### Recommendation: Monogram Mark + Single-weight Wordmark

**Option A — Recommended: "fd" Monogram Mark**

A small geometric ligature mark: lowercase "fd" where the descender of "f" and the ascender of "d" share a vertical stroke, creating a compact but distinctive unit. This works at 16px favicon size and at 48px nav size equally. Render it in brand.600 (the new ink navy, see tokens). Place it to the left of the full wordmark.

The wordmark itself becomes single-weight: "Fastrack Deutsch" in one weight — semibold, not bold. Drop the two-weight split. "Fastrack" and "Deutsch" are equal partners.

At mobile nav sizes: show the monogram mark only. At desktop: mark + full wordmark.

**Why not a bold display serif for the logo?**

Because the product is used in-session for hours at a time. A heavy expressive logo would feel performative — you'd see it on the dashboard every day. The mark should be quiet enough to be unnoticed in flow, but distinctive enough to be recognised on first sight.

**Colour of the mark:** brand.600 at all times. No gradient. No outline. Never the level colour.

---

## Tagline

"Spend X hours. Pass telc." is strong. Keep it. The only refinement: make X concrete per level in context. On the A1 dashboard it should read "20 hours to exam-ready" — not the generic X. The tagline with X is for marketing surfaces (meta description, open graph). In the product, replace X with the real number.

**Secondary tagline option for marketing surfaces:**
"The fastest path to your telc certificate." — direct, outcome-focused, no fluff.

Do not use either tagline inside the running exam. During an exam, the only job is the exam.

---

## What to Avoid

- Do not add any illustration characters, mascots, or celebratory imagery. Duolingo has a monopoly on that register and we are explicitly not competing there.
- Do not use stock photography of people studying. It will look like every other language app.
- Flag emojis for level selection (currently using emoji icons for sections) are fine as a temporary measure but should be replaced by proper SVG icons before any public-facing launch. The emoji fallback rendering across OS versions is unpredictable and looks unfinished.
- The current fire emoji (streak) is a liability at launch. See tokens.md for how to handle streak display without resorting to emoji.
