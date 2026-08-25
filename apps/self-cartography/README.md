# The Self Cartography Project — source

React/TypeScript/Vite source for the assessment. This is the **only** part of
the seldomsought.github.io repo with a build step — everything else is plain
HTML/CSS/JS committed directly. Keep it that way: don't introduce a build
step anywhere else in the repo for this project's sake.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs static files directly into `../../projects/self-cartography/`
(`vite.config.ts` sets `outDir` there and `emptyOutDir: true`) — that's the
folder that actually ships on GitHub Pages, as a sibling of every other
`/projects/<slug>/` page on the site. Commit the rebuilt output together with
any source change; nothing rebuilds it automatically.

The Vite `index.html` template here ships the same `site-header` markup used
by other project sub-pages (brand + "← Projects" back-link) and links the
site's shared `/assets/css/global.css` and `/assets/js/nav.js` directly by
absolute path — those are never bundled, so the page's outer chrome stays
byte-identical to the rest of the site regardless of what changes inside the
React app.

## Architecture

- `src/engine/` — types, state/reducer, localStorage persistence, journey
  navigation, the scoring engine, and the background validity/bias checks.
  Pure logic, no content, no JSX.
- `src/content/` — every region, instrument, item, career, and piece of copy.
  Pure data. Add a question by adding a row to `content/instruments/*.items.ts`
  — never touch a component to do it.
- `src/components/` — `journey/` (map, region intro/item screens, shell),
  `items/` (one renderer per measurement format), `results/` (the Synthesis
  report), `motifs/` (the SVG decorative primitives — contour lines, compass
  mark, graph-paper backdrop), `shared/` (Button, `ScoreBadge` — the one
  place a score is ever rendered, `SavedIndicator`).
- `src/engine/analytics/` — behavioral event capture (section timing,
  response timing, career clicks), deliberately separate from
  `persistence.ts` and never touching response content. See `ANALYTICS.md`
  for exactly what's collected, what isn't, and how the separation is
  enforced.

See `/Users/williampokorny/.claude/plans/synthetic-shimmying-naur.md` for the
full foundation-build plan, including what's deliberately deferred (full
HEXACO/RIASEC/career-anchor item banks, career database growth beyond the
16-entry seed set, copy polish, cross-browser QA).
