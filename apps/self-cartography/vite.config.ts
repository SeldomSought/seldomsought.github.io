import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Source lives here; the built static output ships from ../../projects/self-cartography/
// (a sibling of every other /projects/<slug>/ page in the SeldomSought site) so the rest
// of the repo stays a zero-build static site. See apps/self-cartography/README.md.
export default defineConfig({
  base: '/projects/self-cartography/',
  plugins: [react()],
  build: {
    outDir: resolve(import.meta.dirname, '../../projects/self-cartography'),
    emptyOutDir: true,
  },
})
