# 裂空擂台 · Rift Arena (vertical slice)

Vite + TypeScript + Canvas 2D demo. Source lives here; production output goes to `../../public/demos/rift-arena/`.

```bash
npm install
npm run dev      # local dev
npm run build    # emits to public/demos/rift-arena
npm test
```

See [SMOKE.md](./SMOKE.md) for acceptance steps.

## Stage-1 3D preview (local only)

This branch keeps the self-tested 初入裂隙 flow and draws the six committed GLB figurines in the locked mm-arena-v2 scene. It does not publish GitHub Pages.

```bash
cd demos/rift-arena
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/vincent-games-studio/demos/rift-arena/`.

- 戰役 → 第 1 關 初入裂隙 → 破鋒 enters the match. WASD moves. The mouse still aims through the existing camera.
- 標題上的「立體公仔」 walks one mesh at a time. 1／2／3 switches 破鋒、弦鳴、定潮. F switches P1／P2. Drag orbits the camera. Esc returns to the title.
- Close-up stills: `?shot=pofeng&side=p1&angle=front` (angles: `front`, `back`, `left`, `right`, `threeq`).
