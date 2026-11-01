# pulse-arena expand-v1 — Multimedia visual pack

**Date:** 2026-11-01 (Asia/Hong_Kong)  
**Aligns to:** `/workspace/pulse-arena-expansion-brief.md` (Searching)  
**Style:** low-poly arcade FPS (Veck/Krunker *patterns only*, original Pulse Circuit IP). NOT photoreal / NOT Neon Harbor.  
**SFX:** out of scope for this pack (speech/Coding).

**Roots**
- Assets: `/workspace/vincent-games-studio-assets/pulse-arena/expand-v1/`
- Prod refs: `/workspace/vincent-games-studio/public/demos/pulse-arena/refs/expand/`

Chroma: bots/bosses hard-keyed from `#00FF00`; pickups from `#FF00FF` (so intentional health greens survive). Leftover g-dominant fringe on characters forced to pulse orange `#FF8C00`.

---

## maps/ — mood plates (JPG 1280×720 + 640×360 thumbs)

| File | mapId | Notes |
|---|---|---|
| `expand-map-containers.jpg` (+ `-thumb`) | `containers` | Reuse of `mood/mb-arena-containers.jpg` |
| `expand-map-oasis.jpg` (+ `-thumb`) | `oasis` | Reuse of `mood/mb-arena-oasis.jpg` |
| `expand-map-platforms.jpg` (+ `-thumb`) | `platforms` | Reuse of `mood/mb-arena-platforms.jpg` |
| `expand-map-neon-alley.jpg` (+ `-thumb`) | `neon-alley` | **NEW** arcade neon alleys (not Harbor) |
| `expand-map-dunes.jpg` (+ `-thumb`) | `dunes` | **NEW** sand outpost + radio tower |
| `expand-map-pulse-coliseum.jpg` (+ `-thumb`) | `pulse-coliseum` | **NEW** circular boss showcase |
| `MAP_IDS.txt` | — | slug list; keep baseline `yard` (no new plate) |

**Coding:** lobby map cards → these JPGs as thumbs; `?map=` / `MAPS` registry ids above. Yard stays smoke baseline.

---

## bots/ — skins E–J (hard PNG + JPG source)

Atlas size matched to A–D plates: **312×577** RGBA.

| File | Tag | Role / cue |
|---|---|---|
| `bot-e.png` / `bot-e-guerrilla.png` | E 方塊游擊 | Purple hoodie flanker |
| `bot-f.png` / `bot-f-tank.png` | F 重裝磚塊 | Grey armor + red stripe tank |
| `bot-g.png` / `bot-g-glider.png` | G 滑翔刺客 | Black + cyan slide rusher |
| `bot-h.png` / `bot-h-nest.png` | H 塔樓狙 | Cape + orange scope nest sniper |
| `bot-i.png` / `bot-i-bee.png` | I 干擾蜂 | Yellow antenna disruptor |
| `bot-j.png` / `bot-j-shield.png` | J 盾衛 | Blue energy door shield |
| `bots-efij-sheet.png` (+ `.jpg`) | — | Contact sheet E–J |

Each also has `.jpg` charcoal-backed source next to the PNG.

**Coding:** extend bot skin slots E–H…J; billboard / atlas same treatment as A–D. Prefer short `bot-e.png` … `bot-j.png` paths under `refs/expand/bots/`.

---

## bosses/ — silhouettes + weak-point glow cubes

| File | Brief id | Affinity |
|---|---|---|
| `boss-container-titan.png` (+ `.jpg`) | `Boss_ContainerTitan` | `containers` / coliseum |
| `boss-dune-beacon.png` (+ `.jpg`) | `Boss_DuneBeacon` | `dunes` |
| `boss-ring-arbiter.png` (+ `.jpg`) | `Boss_RingArbiter` | `platforms` / `pulse-coliseum` |

Size **512×768** RGBA. Orange/cyan glow cubes mark weak points.

**Coding:** boss entities + nameplate / HP bar; telegraph colors already in silhouette accents.

---

## pickups/ — floor icons (512 + 256)

| File | ID | Effect cue |
|---|---|---|
| `pickup-hp_s.png` (+ `-256`) | `hp_s` | Small green cross |
| `pickup-hp_m.png` (+ `-256`) | `hp_m` | Large green plus |
| `pickup-armor.png` (+ `-256`) | `armor` | Blue brick |
| `pickup-ammo.png` (+ `-256`) | `ammo` | Yellow crate |
| `pickup-quad.png` (+ `-256`) | `quad` | Magenta orb |
| `pickup-haste.png` (+ `-256`) | `haste` | Cyan streak |
| `pickup-ghost.png` (+ `-256`) | `ghost` | White ghost cube |
| `pickup-overheal.png` (+ `-256`) | `overheal` | Red heart mega |
| `pickup-jump_pad.png` (+ `-256`) | `jump_pad` | Arrow pad **decal** (map prop) |

**Coding:** billboard sprites / atlas; `jump_pad` is fixed socket decal, not inventory. One buff at a time per brief.

---

## src/ — unkeyed GenerateImage sources

Raw JPG greenscreen / magentascreen sources for re-key if Coding needs different sizes.

---

## Integration checklist (Coding)

1. Map thumbs: `refs/expand/maps/expand-map-<id>.jpg` (+ optional `-thumb`).
2. Bot skins E–J: `refs/expand/bots/bot-<letter>.png` hard-edge.
3. Bosses: three PNGs under `refs/expand/bosses/`.
4. Pickups: `refs/expand/pickups/pickup-<id>.png` (use `-256` for HUD if needed).
5. Do **not** wire Neon Harbor paths. SFX separate pack.

## Explicit non-deliverables

- No `game.js` edits, no deploy, no SFX WAV/MP3 in this pack.
- Discarded earlier mismatched mood gens (rooftops / subway / harbor-crates) — not promoted; archived under `/workspace/pulse-arena-expand-v1-work/discard-*.jpg`.
