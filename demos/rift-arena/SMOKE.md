# Rift Arena · 裂空擂台 — smoke test

## Local

```bash
cd demos/rift-arena
npm ci
npm run build
npm run preview
# open printed URL (base path /vincent-games-studio/demos/rift-arena/)
```

Or dev:

```bash
cd demos/rift-arena && npm ci && npm run dev
```

## Play steps (acceptance)

1. Open title **裂空擂台** → click **開始**
2. Pick any of **破鋒 / 弦鳴 / 定潮** → choose **一般** or **上級**
3. In match: **WASD** move, **mouse** aim, **LMB** basic, **Q / E / R** skills
4. Fight bot (magenta P2 art) until one side reaches **5 kills** (respawns between deaths)
5. **再戰** or **返回標題** from result screen
6. Confirm no critical errors in browser console (F12)

## GitHub Pages tip

After merge to `main` and Pages deploy:

`https://vincentsckan.github.io/vincent-games-studio/demos/rift-arena/?v=<shortsha>`

Catalog **試玩** on the studio site appends `?v=` from the main Vite build sha.

## Unit tests

```bash
cd demos/rift-arena && npm test
```
