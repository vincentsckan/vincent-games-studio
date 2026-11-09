import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: '/vincent-games-studio/demos/rift-arena/',
  build: {
    outDir: resolve(__dirname, '../../public/demos/rift-arena'),
    emptyOutDir: true,
  },
  publicDir: 'public',
})
