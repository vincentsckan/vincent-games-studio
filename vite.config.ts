import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages: set base to '/<repo-name>/' when deploying.
// Example: base: '/vincent-games-studio/'
// Leave as '/' for local preview or custom domain.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/vincent-games-studio/',
})
