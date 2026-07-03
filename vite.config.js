import { defineConfig } from 'vite'

// Relative base so the build works both on the custom domain root
// (danbirman.com) and under a project path when previewing.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    target: 'es2020',
  },
})
