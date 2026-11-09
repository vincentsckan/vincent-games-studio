# Post-deploy fighter art defect — root cause (80954b1)

## Observed (live `?v=80954b1`)

| Symptom | Side |
|--------|------|
| Fighter ~few-pixel-wide dark vertical bar | P1 |
| Flat magenta filled circle + aim line | P2 |

Hero select busts and arena `arena-topdown-v2` loaded correctly.

## Causes (confirmed in source)

### 1. P2 full sprites never preloaded (→ magenta disc fallback)

`preloadAll()` in `src/assets.ts` loaded `heroFull(h, 1)` only.  
`drawFighter()` uses `getCached(heroFull(f.hero, f.team))`; team **2** cache miss → `else` branch (solid `#e879f9` circle).

**Not** missing assets on disk — all six `*-full-p{1,2}.png` files ship in `mm-real2d-v1/`.

### 2. P1 width crushed by draw math (→ “sliver”)

```ts
const w = h * aspect * 0.45
```

With `aspect ≈ 512/682` and `h ≈ 2.2 × 38 × cam.scale`, on-screen width ≈ **27px** at typical scale — entire full-body PNG including dark letterboxing compresses into a narrow bar.

**Not** primary failure of PNG alpha trim (assets are opaque 512×682 canvases).

## Fix (this branch)

- Preload **all** `heroFull(hero, 1|2)` for three heroes.
- Replace width rule with `fighterDrawSize()` — height `96 × cameraScale`, width from natural aspect **without** `0.45`.
- Regression: `src/fighterSprite.test.ts` (min width + six URL manifest).
