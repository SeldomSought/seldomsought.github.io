import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts on purpose: the scoring engine under test is
// plain TypeScript with zero DOM/React dependency (that's the whole point —
// see engine/scoring/index.ts's docstring), so the DEFAULT here stays node,
// not jsdom — no plugins, no build-output config needed for the vast
// majority of this suite. A handful of `.test.tsx` files exist purely to
// exercise real keyboard-event handling on the actual components (arrow-key
// navigation, Shift+digit rapid-answer) — those opt into jsdom individually
// via a `// @vitest-environment jsdom` pragma at the top of the file, so
// this default (and everything that doesn't need a DOM) is untouched.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
