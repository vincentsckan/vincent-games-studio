# Deploy · 部署

Public site / 公開站：https://vincentsckan.github.io/vincent-games-studio/

## Automatic (recommended) · 自動部署

1. Push (or merge) to **`main`**
2. GitHub Actions runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):
   - `npm ci` → `npm run build:pages` → publish `dist/` to the **`gh-pages`** branch
3. GitHub Pages serves that branch → live in about **1–2 minutes**

Manual trigger: **Actions → Deploy GitHub Pages → Run workflow**.

### One-time GitHub setup · 首次設定

| Item | Where |
|------|--------|
| Pages source = branch **`gh-pages`** / root | Settings → Pages |
| Actions enabled for the repo | Settings → Actions → General |
| First Actions run may need **Write** approval for the workflow (or “Allow GitHub Actions to create and approve pull requests” is unrelated; for `contents: write` the default `GITHUB_TOKEN` works once Actions is on) | — |
| Optional CI secrets so the live build keeps Supabase catalog | Settings → Secrets and variables → Actions → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon key is client-public) |

Without those secrets, the site still builds and falls back to `src/data/games.ts`.

## Cache · 快取

- GitHub Pages CDN may still cache HTML briefly; you **cannot** set arbitrary `Cache-Control` response headers on plain project Pages.
- SPA + demo HTML include `<meta http-equiv="Cache-Control" …>` / `Pragma` / `Expires` as a best-effort hint.
- Catalog **試玩** links append `?v=<git sha>` (see `src/lib/demoPlay.ts` + `vite.config.ts`) so browsers fetch a fresh demo URL after each deploy.
- If the UI looks stale: hard refresh, or open a 試玩 link that already has `?v=…`.

## Manual deploy (fallback) · 手動

```bash
npm run build:pages
npx gh-pages -d dist -b gh-pages --dotfiles
```

## After deploy · 部署後

Still post/check the live links (process, not code), e.g.:

- https://vincentsckan.github.io/vincent-games-studio/
- https://vincentsckan.github.io/vincent-games-studio/games
- Demo 試玩 URLs with `?v=<sha>` from the catalog
