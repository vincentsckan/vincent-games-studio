Neon Harbor Clash — Vehicle billboard / texture refs (collidable props)
======================================================================
Dir: public/demos/neon-harbor/refs/vehicles/
Format: JPEG RGB 1280x720 (16:9), solid #00FF00 chroma backdrop
Use: side-profile sprites on box meshes; chroma-key green out for alpha

Files (web paths from demo root):
  /demos/neon-harbor/refs/vehicles/veh-minibus-side.jpg
    HK red/cream public light bus, full side profile, fictional plate/route marks
    size ~234 KB

  /demos/neon-harbor/refs/vehicles/veh-taxi-side.jpg
    HK red taxi sedan, silver roof + TAXI lightbox, fictional plate
    size ~180 KB

  /demos/neon-harbor/refs/vehicles/veh-sedan-side.jpg
    Dark civilian sedan, generic unmarked, neon rim highlights, fictional plate
    size ~176 KB

  /demos/neon-harbor/refs/vehicles/veh-motorcycle-side.jpg
    HK alley underbone scooter/motorcycle, full side, fictional plate
    size ~208 KB

Filesystem (workspace):
  /workspace/vincent-games-studio/public/demos/neon-harbor/refs/vehicles/

Coding notes:
  - Chroma key #00FF00 (pure green). Prefer keying over hard masks; check
    green spill in window glass / wheel arches and despill if needed.
  - Map as billboard texture on thin box colliders (or plane + box collider).
  - Aspect 16:9; scale mesh width to vehicle length, height to vehicle height.
  - Fictional plates / generic marks only — no real brand logos intended.
