# Vincent Games Studio

Professional indie game studio showcase for **Vincent Games Studio**.

Built with **Vite · React · TypeScript · Tailwind CSS · Framer Motion · Supabase**.  
Traditional Chinese (HK) primary, English secondary. Dark immersive aesthetic with scroll reveals and hover previews. Respects `prefers-reduced-motion`.

## Quick start

```bash
cd vincent-games-studio
npm install
cp .env.example .env.local   # optional — without it, site uses src/data/games.ts
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173/vincent-games-studio/`).

> **Note:** `base` is set to `/vincent-games-studio/` for GitHub Pages. The dev server uses the same base, so visit paths under that prefix.

```bash
npm run build:pages   # production build → dist/ (+ 404.html for SPA)
npm run preview
```

## Phase 1 · Supabase + Admin

### 1. Create a Supabase project

1. Open [supabase.com](https://supabase.com) → New project.
2. **Project Settings → API**：複製 `Project URL` 與 `anon` `public` key。
3. 填入本機環境變數：

```bash
cp .env.example .env.local
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Run the migration

在 Supabase Dashboard → **SQL Editor**，貼上並執行：

`supabase/migrations/001_games_admin.sql`

這會建立：

- `games` 表（slug / title / type 2D|3D / cover_path / demo_path / build_path / price_cents / store_links jsonb / published …）
- Storage buckets：`covers` · `demos` · `builds`（public read）
- RLS：匿名只能讀 `published = true`；寫入僅 `authenticated`

### 3. Create an admin user

**Authentication → Users → Add user**（Email + Password）。  
用該帳號登入 Admin：

- 本機：`http://localhost:5173/vincent-games-studio/admin/login`
- Pages：`https://vincentsckan.github.io/vincent-games-studio/admin/login`

### 4. Publish games

登入後到 `/admin`：新增遊戲、上傳封面／試玩／建置檔、勾選 **Published**。  
公開站在 env 有設定時會從 Supabase 載入；否則 fallback `src/data/games.ts`。

### Schema (Data Org)

| Column | Notes |
|--------|--------|
| `id` | uuid |
| `slug` | unique URL key |
| `title` / `tagline` / `description` | copy |
| `type` | `2D` \| `3D` |
| `cover_path` / `demo_path` / `build_path` | storage object paths |
| `trailer_url` | optional |
| `price_cents` / `currency` | store pricing (Stripe stub only in Phase 1) |
| `store_links` | jsonb `{ steam?, itch? }` |
| `published` / `sort_order` | catalogue control |
| `created_at` / `updated_at` | timestamps |

Stripe checkout is a stub only (`src/lib/stripe.ts`) — no live payments yet.

## Project structure

```
src/
  data/games.ts           ← local fallback catalogue + studio copy
  lib/supabase.ts         ← client + DbGame types
  lib/gamesCatalog.ts     ← Supabase fetch or local fallback
  lib/stripe.ts           ← checkout stub
  pages/admin/            ← login, list, create/edit + uploads
  components/admin/       ← RequireAuth, AdminShell
supabase/migrations/      ← 001_games_admin.sql
```

## GitHub Pages deploy

`vite.config.ts` sets:

```ts
base: '/vincent-games-studio/',
```

```bash
npm run build:pages
npx gh-pages -d dist -b gh-pages
```

Enable **Settings → Pages → Deploy from branch → gh-pages / root**.

SPA deep links use `dist/404.html` (copied from `index.html` by `build:pages`).  
Router: `createBrowserRouter` + `basename` from `import.meta.env.BASE_URL`.

For Pages builds that need live Supabase data, set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in the CI or local env **before** `build:pages` (Vite inlines them at build time).

## Demo games (local fallback)

| 中文 | English | Dim | Status |
|------|---------|-----|--------|
| 霧港燈影 | Mist Harbor Lights | 2D | Demo |
| 斷層行者 | Faultline Walker | 3D | Early Access |
| 紙鶴紀元 | Paper Crane Epoch | 2D | Coming Soon |
| 深空遺音 | Echoes of Void | 3D | Demo |

## Licence

Showcase template for Vincent Kan. Demo copy and placeholder art are free to replace.
