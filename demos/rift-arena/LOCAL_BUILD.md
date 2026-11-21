# Test unmerged fix build locally (no GitHub Pages)

## Option A — preview from repo

```bash
cd demos/rift-arena
npm install
npm run build
npx vite preview --host 127.0.0.1 --port 4173
```

Open: http://127.0.0.1:4173/vincent-games-studio/demos/rift-arena/

## Option B — static archive

After `npm run build`, unpack the release tarball (see PR) under any static server, e.g.:

```bash
cd rift-arena-fix-static
python3 -m http.server 8765
```

Open: http://127.0.0.1:8765/vincent-games-studio/demos/rift-arena/

Base path `/vincent-games-studio/demos/rift-arena/` must match `vite.config.ts` `base`.
