import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'

function buildSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return String(Date.now())
  }
}

const sha = buildSha()

// GitHub Pages: set base to '/<repo-name>/' when deploying.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/vincent-games-studio/',
  define: {
    'import.meta.env.VITE_VGS_BUILD_SHA': JSON.stringify(sha),
  },
})
