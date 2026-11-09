# Acceptance test matrix — fighter art fix branch

Environment: local `npm run build` + `npx vite preview --host 127.0.0.1 --port 4173` (not deployed).

| Case | Method | Result |
|------|--------|--------|
| Root cause documented | `ROOT_CAUSE.md` | **PASS** |
| P2 full sprites preloaded (6 URLs) | `vitest` `fighterSprite.test.ts` | **PASS** |
| Draw width ≥55px @ scale 0.92 (no sliver math) | `vitest` `fighterSprite.test.ts` | **PASS** |
| All 6 `*-full-p{1,2}.png` exist on disk | `vitest` `assets.fs.test.ts` | **PASS** |
| Cover collision (each rect + pillar block) | `vitest` `arena.collision.test.ts` | **PASS** (movement block; not full pathing sweep) |
| Kill win threshold / respawn constants | `vitest` `combat.rules.test.ts` | **PASS** |
| In-arena art — 破鋒 | Playwright screenshot + pixel heuristic | **PASS** → `/opt/cursor/artifacts/rift-arena-acceptance/combat-pofeng-after.png` |
| In-arena art — 弦鳴 | Playwright | **PASS** → `combat-xianming-after.png` |
| In-arena art — 定潮 | Playwright | **PASS** → `combat-dingchao-after.png` |
| Map / arena-topdown-v2 loads | Playwright (visible in screenshots) | **PASS** |
| Hero select busts | Playwright flow (pre-combat) | **PASS** (implicit in flow) |
| LMB/Q/E/R damage per hero | Interactive | **NOT TESTED** (no exposed test hook yet) |
| Advanced difficulty bot | Interactive | **NOT TESTED** |
| Player win at 5 kills | Interactive | **NOT TESTED** |
| Player defeat at 5 kills | Interactive | **NOT TESTED** |
| Replay / reset | Interactive | **NOT TESTED** |
| Left boundary / full obstacle sweep | Interactive | **NOT TESTED** |

### Commands (exact)

```bash
cd demos/rift-arena
npm install
npm test                    # 10+ vitest tests
npm run build
npx vite preview --host 127.0.0.1 --port 4173 &
npm run test:browser        # exit 0 = art heuristic pass
```

### Before / after screenshots

| | Path |
|---|------|
| **Before (live 80954b1)** | `/opt/cursor/artifacts/rift-arena-combat-before.png` |
| **After (fix build)** | `/opt/cursor/artifacts/rift-arena-acceptance/combat-*-after.png` |
