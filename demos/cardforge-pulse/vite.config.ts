import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  base: '/vincent-games-studio/demos/cardforge-pulse/',
  root: '.',
  build: {
    outDir: path.resolve(__dirname, '../../public/demos/cardforge-pulse'),
    emptyOutDir: true,
  },
})
