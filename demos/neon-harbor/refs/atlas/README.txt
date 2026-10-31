Neon Harbor Clash — Mesh Atlas / Parallax Refs
Map: signs (霓虹招牌街)
Dir: public/demos/neon-harbor/refs/atlas/

These are TILEABLE MESH ATLASES and PARALLAX PLANES for collidable textured
buildings — NOT full-screen skybox plates. Apply via UV repeat / billboard
meshes / parallax layers.

=============================================================================
TILEABLE ALBEDO ATLASES (UV wrap on box / building / ground meshes)
=============================================================================

atlas-tonglau-wall.jpg
  Size: 1024x1024
  Type: seamless tileable
  Use:  Tong-lau (唐樓) night facade albedo. Worn plaster, window frames,
        pipes, magenta/cyan neon spill. Set wrapS/wrapT = Repeat.
        Prefer as wall material on collidable building boxes.

atlas-wet-pavement.jpg
  Size: 1024x1024
  Type: seamless tileable
  Use:  Wet asphalt/tile street ground. Puddle neon reflections.
        UV-repeat on ground / road plane collision mesh.

atlas-iron-gate.jpg
  Size: 1024x1024
  Type: tileable / single-panel
  Use:  Iron rolling gate / 鐵閘 shutter. Rust, chipped paint, neon spill.
        Apply to shop-front shutter box face (or tile horizontally).

=============================================================================
STRIP / BILLBOARD TEXTURE (flat on sign mesh — not meant to tile as sky)
=============================================================================

atlas-neon-sign-strip.jpg
  Size: 2048x512
  Type: horizontal strip (non-skybox)
  Use:  Flat neon shop-sign strip for billboard / box-front mesh UVs.
        Fictional Traditional Chinese only (江記東江菜／安和堂涼茶／港南米線／
        金蝠當舖／翠鳳茶餐廳／永發海鮮). Magenta/cyan neon. Clamp or
        slice UVs per sign panel; do not use as environment sky.

=============================================================================
PARALLAX PLANES (secondary — distant / near layers, can be non-tileable)
=============================================================================

parallax-far-signs.jpg
  Size: 1920x1080
  Type: far parallax plate (non-tileable OK)
  Use:  Soft dense neon canyon for distant parallax plane behind playable
        street. Keep soft / slightly blurred; scroll slowly.

parallax-near-awning.jpg
  Size: 1920x540
  Type: near parallax strip (non-tileable OK)
  Use:  Foreground awning / scaffold strip. Overlay near camera with
        faster parallax scroll; mask alpha or crop as needed.

=============================================================================
NOTES FOR CODING
=============================================================================
- Prefer atlas_* first for collidable textured buildings on map "signs".
- Do NOT treat these as wallpaper + solid color blocks; sample albedo
  from the atlases on mesh materials.
- Style: photoreal HK neon night. Fictional TC shop names only.
- No git commit required for this asset drop.
