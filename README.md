# Vincent Games Studio

Professional indie game studio showcase for **簡瑞聰 / Vincent Kan**.

Built with **Vite · React · TypeScript · Tailwind CSS · Framer Motion**.  
Traditional Chinese (HK) primary, English secondary. Dark immersive aesthetic with scroll reveals and hover previews. Respects `prefers-reduced-motion`.

## Quick start

```bash
cd vincent-games-studio
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173/vincent-games-studio/`).

> **Note:** `base` is set to `/vincent-games-studio/` for GitHub Pages. The dev server uses the same base, so visit paths under that prefix.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Project structure

```
src/
  data/games.ts      ← all demo games + studio copy (swap for real titles)
  components/        ← Hero, GameCard, CTAs, art placeholders, layout
  pages/             ← Home, Games, GameDetail, About, Contact
  hooks/             ← reduced-motion helper
  lib/motion.ts      ← shared Framer Motion variants
```

## Add a game

1. Open `src/data/games.ts`.
2. Append an object to the `games` array matching the `Game` interface:

```ts
{
  id: 'my-game',
  slug: 'my-game-slug',          // URL: /games/my-game-slug
  titleZh: '中文標題',
  titleEn: 'English Title',
  taglineZh: '一句鉤子。',
  taglineEn: 'One-line hook.',
  dimension: '2D',               // or '3D'
  status: 'demo',                // demo | early-access | released | coming-soon
  year: 2026,
  genres: ['探索', '敘事'],
  hookZh: '...',
  hookEn: '...',
  gameplayZh: '...',
  gameplayEn: '...',
  features: [
    { titleZh: '...', titleEn: '...', bodyZh: '...', bodyEn: '...' },
  ],
  palette: {
    from: '#0a1628',
    via: '#1a3a5c',
    to: '#0d9488',
    accent: '#f0c14a',
    pattern: 'harbor',           // harbor | fault | crane | void
  },
  links: {
    play: '#play-demo',
    download: '#download',
    steam: 'https://store.steampowered.com/...',
    itch: 'https://itch.io/...',
  },
}
```

3. Replace CSS/SVG placeholders in `GameArt.tsx` with real screenshots when ready (keep aspect ratios).

## GitHub Pages deploy

`vite.config.ts` documents and sets:

```ts
base: '/vincent-games-studio/',
```

If your repository name differs, change `base` to `'/<repo-name>/'`.  
For a custom domain at the site root, use `base: '/'`.

### Option A — `gh-pages` branch

```bash
npm run build
# publish the contents of dist/ to the gh-pages branch
npx gh-pages -d dist
```

Enable **Settings → Pages → Deploy from branch → gh-pages / root**.

### Option B — GitHub Actions

Add `.github/workflows/deploy.yml` that builds and uploads `dist/` with `actions/upload-pages-artifact` + `actions/deploy-pages`. Ensure the workflow uses the same `base` as `vite.config.ts`.

### SPA routing on Pages

GitHub Pages has no server rewrite for client routes. After build you can copy `dist/index.html` to `dist/404.html` so deep links (`/games/...`) fall back to the SPA:

```bash
npm run build && cp dist/index.html dist/404.html
```

`BrowserRouter` already uses `import.meta.env.BASE_URL` as `basename`.

## Demo games (placeholders)

| 中文 | English | Dim | Status |
|------|---------|-----|--------|
| 霧港燈影 | Mist Harbor Lights | 2D | Demo |
| 斷層行者 | Faultline Walker | 3D | Early Access |
| 紙鶴紀元 | Paper Crane Epoch | 2D | Coming Soon |
| 深空遺音 | Echoes of Void | 3D | Demo |

All art is CSS gradient + SVG only — no copyrighted assets.

## Licence

Showcase template for Vincent Kan. Demo copy and placeholder art are free to replace.
