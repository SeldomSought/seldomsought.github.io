# Design system

`tokens.css` is the explicit design system for Direction C — "The Celestial
Instrument" — with one loan from Direction A's bearing/route vocabulary for
progress, per the recommendation in the `Three Cartographies` direction
exploration. It's the real, shipped stylesheet (`main.tsx` imports it,
every component reads from it) — not a parallel unwired draft like
`schema/`.

## What's in it

Surface hierarchy, border hierarchy, line widths, radius, shadow hierarchy,
type scale, spacing scale, animation timing/easing, and three named width
tokens (`--sc-width-question`, `--sc-width-result`, `--sc-width-shell`) —
each documented in place with a comment explaining when to reach for it.
Every value already existed in a shipped component before being formalized
here; nothing was invented for the sake of having a token.

**Breakpoints are documented, not enforced.** CSS custom properties can't
drive `@media` conditions, so the four-step scale (`--sc-bp-sm` 560px,
`--sc-bp-md` 760px, `--sc-bp-header` 860px, `--sc-bp-lg` 1024px) lives as a
comment block in `tokens.css`, and every `@media` rule in this app now
carries an inline comment naming which step it matches. `--sc-bp-header` is
inherited from the site-wide `assets/css/global.css` header breakpoint —
it's not this app's to change independently.

## No rainbow color coding

This is the one constraint worth calling out explicitly, because it's the
default almost every personality-assessment UI reaches for and the brief
explicitly rejects it: **a construct never gets its own color.** The
palette stays exactly what's already in `tokens.css` — one ink, one
accent, three functional colors reserved for confidence/validity
(`--sc-high`/`--sc-medium`/`--sc-low`, never a construct identity).

Instead, constructs differentiate through the toolkit documented in
`tokens.css`'s DIFFERENTIATION TOOLKIT section:

- **Line** — `--sc-dash-solid` / `--sc-dash-dotted` / `--sc-dash-dashed`, real tokens, usable in `stroke-dasharray`.
- **Texture** — `--sc-texture-hatch` / `--sc-texture-hatch-dense` / `--sc-texture-dot`, real tokens, CSS `background-image` gradients in `currentColor` so they inherit the one ink rather than adding a hue.
- **Position** — not a CSS token; already the primary differentiator in `RadarDiagram.tsx`, where each facet owns a fixed angle around the circle.
- **Labeling** — not a CSS token; already the primary differentiator everywhere else, via the mono micro-label convention (`.sc-marginalia`, `Continuum`'s pole labels).
- **Shape** — not CSS-expressible (a marker is markup, not a property). The vocabulary is fixed at four — circle, diamond, triangle, square — documented in `tokens.css` for whenever the first multi-series diagram needs it.
- **Diagrammatic treatment** — not a CSS token; already true today. Personality facets get a radar polygon, values get stacked bars, autonomy/structure/risk/ambiguity get a dial-style badge. The diagram *type* carries the category, not a color key.

If a future screen seems to need a second color to tell two things apart,
that's a signal to reach for one of the six above first — not to add a hex
value.
