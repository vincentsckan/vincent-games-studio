#!/usr/bin/env node
/**
 * GitHub Pages serves real files; SPA paths like /games must exist as
 * directories with index.html (not only 404.html fallback) so they return 200.
 */
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const indexHtml = join(dist, 'index.html')

if (!existsSync(indexHtml)) {
  console.error('spa-route-indexes: dist/index.html missing — run vite build first')
  process.exit(1)
}

const routes = new Set(['games', 'about', 'contact', 'admin', 'admin/login', 'admin/games/new'])

// Known public game detail slugs from source data
const gamesTs = readFileSync(join(root, 'src/data/games.ts'), 'utf8')
for (const m of gamesTs.matchAll(/slug:\s*'([^']+)'/g)) {
  routes.add(`games/${m[1]}`)
}

copyFileSync(indexHtml, join(dist, '404.html'))

for (const route of [...routes].sort()) {
  const dir = join(dist, route)
  mkdirSync(dir, { recursive: true })
  // Don't overwrite real demo index.html files
  const target = join(dir, 'index.html')
  copyFileSync(indexHtml, target)
  console.log('spa route →', route + '/index.html')
}

console.log(`spa-route-indexes: ${routes.size} routes ready`)
