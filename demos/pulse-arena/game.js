/**
 * Pulse Arena · 脈衝槍戰
 * Original low-poly FPS — Vincent Games Studio.
 * expand-v1 per pulse-arena-expansion-brief.md
 * Maps: yard|containers|oasis|platforms|neon-alley|dunes|pulse-coliseum
 * Bots A–J · Boss×3 · Pickups · SFX · hit-blood · death-tip · scene-VQ · perf · FENCE_R sky-clear
 * mm6-realism: hit spark/blood spray sprites · kill bot-fall + ground decal · expand-v1-realism maps
 * expand-v1-weaponswitch: instant 1–5 / wheel / Q firearm switch · per-slot ammo bags · HUD strip · recoil kick
 * mm7-weapon-switch: HUD hotbar icons + slot-selected frame (ui-weapon-*); vm-* FP plates unchanged
 */
import * as THREE from 'three';

const canvas = document.getElementById('c');
const overlay = document.getElementById('overlay');
const hud = document.getElementById('hud');
const cross = document.getElementById('cross');
const dmgFlash = document.getElementById('dmgFlash');
const hitmark = document.getElementById('hitmark');
const killfeed = document.getElementById('killfeed');
const slideTag = document.getElementById('slideTag');
const scoreboard = document.getElementById('scoreboard');
const sbBody = document.getElementById('sbBody');
const bossHud = document.getElementById('bossHud');
const buffHud = document.getElementById('buffHud');
const levelHud = document.getElementById('levelHud');
const flashOverlay = document.getElementById('flashOverlay');
const weapStrip = document.getElementById('weapStrip');

const ENABLE_BOSSES = true;
const ENABLE_PICKUPS = true;
const ENABLE_SFX = true;

const MATCH_SECONDS = 240;
const GRAVITY = 28;
const PLAYER_RADIUS = 0.58;
const PLAYER_HEIGHT = 1.65;
const CROUCH_HEIGHT = 1.05;
const FENCE_R = 32;
const FENCE_THICK = 2.4;
const FENCE_INNER = FENCE_R - FENCE_THICK / 2;
const MIN_FENCE_VIEW_CLEAR = 6.2;
const ARENA_BOUND = FENCE_INNER - MIN_FENCE_VIEW_CLEAR;
const CAM_SOLID_PAD = 1.2;
const SLIDE_BOOST = 1.55;
const SLIDE_DURATION = 0.55;
const MOVE_SPEED = 9.2;
const JUMP_V = 9.8;
const MAX_TRACES = 14;
const MAX_PARTICLES = 36;
const CULL_DIST = 52;
const AUDIO_POOL_CAP = 10;

const WEAPONS = [
  { id: 'ar', nameZh: '脈衝步槍', nameEn: 'Pulse Rifle', damage: 22, firerate: 9.5, spread: 0.022, mag: 30, reserve: 90, reload: 1.45, pellets: 1, adsSpread: 0.006, adsFov: 58, recoil: 0.018 },
  { id: 'pistol', nameZh: '脈衝手槍', nameEn: 'Pulse Pistol', damage: 34, firerate: 3.6, spread: 0.012, mag: 12, reserve: 48, reload: 1.2, pellets: 1, adsSpread: 0.004, adsFov: 55, recoil: 0.028 },
  { id: 'sniper', nameZh: '脈衝狙擊', nameEn: 'Pulse Sniper', damage: 92, firerate: 1.05, spread: 0.003, mag: 5, reserve: 25, reload: 2.1, pellets: 1, adsSpread: 0.0002, adsFov: 32, recoil: 0.075 },
  { id: 'shotgun', nameZh: '方塊散彈', nameEn: 'Block Shotgun', damage: 16, firerate: 1.25, spread: 0.09, mag: 6, reserve: 24, reload: 2.2, pellets: 7, adsSpread: 0.05, adsFov: 60, recoil: 0.055 },
  { id: 'knife', nameZh: '脈衝短刃', nameEn: 'Pulse Blade', damage: 55, firerate: 1 / 0.5, spread: 0, mag: 1, reserve: 99, reload: 0.05, pellets: 1, melee: true, range: 2.6, cone: 0.72, adsFov: 70, recoil: 0.01 },
];

const MAPS = [
  // sky/fog tuned for grounded arcade (Veck-like), not Harbor photoreal
  { id: 'yard', nameZh: '訓練圍場', nameEn: 'Yard', fragLimit: 20,
  bossAlive: false, sky: 0x87b8e0, fog: 0xb0c8d8, fogNear: 28, fogFar: 82, botCount: 5, bossId: null, mode: 'ffa',
  hemiTop: 0xfff2e8, hemiGround: 0x4a5548, sun: 0xfff0d0, sunI: 1.15, hemiI: 0.72, fillI: 0.28 },
  { id: 'containers', nameZh: '貨櫃峽谷', nameEn: 'Containers', fragLimit: 25, sky: 0x6aa0c8, fog: 0x8eb0c4, fogNear: 26, fogFar: 78, botCount: 6, bossId: 'Boss_ContainerTitan', mode: 'ffa',
  hemiTop: 0xe8f0ff, hemiGround: 0x3a4540, sun: 0xffe8c8, sunI: 1.2, hemiI: 0.68, fillI: 0.32 },
  { id: 'oasis', nameZh: '綠洲平台', nameEn: 'Oasis', fragLimit: 20,
  bossAlive: false, sky: 0xf0c878, fog: 0xe8d0a0, fogNear: 30, fogFar: 88, botCount: 5, bossId: null, mode: 'ffa',
  hemiTop: 0xffe8c0, hemiGround: 0x6a6040, sun: 0xffd890, sunI: 1.25, hemiI: 0.7, fillI: 0.22 },
  { id: 'platforms', nameZh: '懸浮階環', nameEn: 'Platforms', fragLimit: 30, sky: 0x7a9ad0, fog: 0x9ab0d8, fogNear: 24, fogFar: 80, botCount: 6, bossId: 'Boss_RingArbiter', mode: 'ffa',
  hemiTop: 0xe0e8ff, hemiGround: 0x384858, sun: 0xf0f4ff, sunI: 1.05, hemiI: 0.75, fillI: 0.4 },
  { id: 'neon-alley', nameZh: '霓虹巷戰', nameEn: 'Neon Alley', fragLimit: 20,
  bossAlive: false, sky: 0x1a0c30, fog: 0x2a1450, fogNear: 18, fogFar: 70, botCount: 6, bossId: null, mode: 'ffa',
  hemiTop: 0x8060b0, hemiGround: 0x201028, sun: 0xff66cc, sunI: 0.55, hemiI: 0.55, fillI: 0.55 },
  { id: 'dunes', nameZh: '沙丘前哨', nameEn: 'Dunes', fragLimit: 25, sky: 0xe0b868, fog: 0xd0b070, fogNear: 30, fogFar: 90, botCount: 6, bossId: 'Boss_DuneBeacon', mode: 'ffa',
  hemiTop: 0xffe0b0, hemiGround: 0x8a7040, sun: 0xffd080, sunI: 1.3, hemiI: 0.65, fillI: 0.2 },
  { id: 'pulse-coliseum', nameZh: '脈衝競技場', nameEn: 'Pulse Coliseum', fragLimit: 15, sky: 0x141028, fog: 0x221838, fogNear: 20, fogFar: 72, botCount: 4, bossId: 'Boss_RingArbiter', mode: 'boss',
  hemiTop: 0xa080c0, hemiGround: 0x181020, sun: 0xff88cc, sunI: 0.7, hemiI: 0.6, fillI: 0.45 },
];

const ARCHETYPES = [
  { tag: 'A', id: 'tactical', nameZh: '戰術橘', role: 'rusher', hp: 100, speed: 6.2, damage: 14, shootCd: [0.5, 0.85], preferDist: 7, accuracy: 0.42, scale: 1, color: 0xff6b6b, skinIndex: 0 },
  { tag: 'B', id: 'medic', nameZh: '醫療青', role: 'support', hp: 110, speed: 5.6, damage: 11, shootCd: [0.55, 0.9], preferDist: 11, accuracy: 0.4, scale: 1, color: 0x7dff9a, skinIndex: 1, selfHeal: true },
  { tag: 'C', id: 'police', nameZh: '藍警', role: 'anchor', hp: 120, speed: 5.0, damage: 15, shootCd: [0.7, 1.1], preferDist: 10, accuracy: 0.5, scale: 1.02, color: 0x6bc5ff, skinIndex: 2 },
  { tag: 'D', id: 'desert', nameZh: '沙漠老兵', role: 'midlong', hp: 100, speed: 5.2, damage: 20, shootCd: [0.85, 1.3], preferDist: 16, accuracy: 0.52, scale: 1, color: 0xffd36a, skinIndex: 3 },
  { tag: 'E', id: 'flanker', nameZh: '方塊游擊', role: 'flanker', hp: 90, speed: 8.0, damage: 16, shootCd: [0.4, 0.65], preferDist: 4, accuracy: 0.36, scale: 0.95, color: 0xc08cff, skinIndex: 4 },
  { tag: 'F', id: 'tank', nameZh: '重裝磚塊', role: 'tank', hp: 180, speed: 3.8, damage: 22, shootCd: [0.9, 1.4], preferDist: 6, accuracy: 0.4, scale: 1.2, color: 0x889099, skinIndex: 5 },
  { tag: 'G', id: 'slider', nameZh: '滑翔刺客', role: 'slide', hp: 85, speed: 8.5, damage: 14, shootCd: [0.35, 0.6], preferDist: 3, accuracy: 0.34, scale: 0.92, color: 0x223344, skinIndex: 6 },
  { tag: 'H', id: 'nest', nameZh: '塔樓狙', role: 'nest', hp: 95, speed: 4.0, damage: 32, shootCd: [1.1, 1.7], preferDist: 20, accuracy: 0.58, scale: 1.05, color: 0x556677, skinIndex: 7 },
  { tag: 'I', id: 'disruptor', nameZh: '干擾蜂', role: 'disruptor', hp: 80, speed: 7.0, damage: 8, shootCd: [0.9, 1.4], preferDist: 9, accuracy: 0.35, scale: 0.9, color: 0xffe66d, skinIndex: 8 },
  { tag: 'J', id: 'shield', nameZh: '盾衛', role: 'shield', hp: 150, speed: 4.4, damage: 12, shootCd: [0.65, 1.0], preferDist: 7, accuracy: 0.4, scale: 1.12, color: 0x4488ff, skinIndex: 9, frontalShield: true },
];

const BOSSES = {
  Boss_ContainerTitan: { id: 'Boss_ContainerTitan', nameZh: '貨櫃巨擘', nameEn: 'Container Titan', hp: 1200, speed: 3.8, damage: 28, scale: 2.6, color: 0xe07020, telegraph: 0.8, attackCd: 2.0, scoreBonus: 6 },
  Boss_DuneBeacon: { id: 'Boss_DuneBeacon', nameZh: '沙丘廣播塔', nameEn: 'Dune Beacon', hp: 1000, speed: 0, damage: 24, scale: 2.8, color: 0xd4a017, telegraph: 1.0, attackCd: 2.4, scoreBonus: 6 },
  Boss_RingArbiter: { id: 'Boss_RingArbiter', nameZh: '環階仲裁者', nameEn: 'Ring Arbiter', hp: 1400, speed: 4.2, damage: 30, scale: 2.4, color: 0xff6bcb, telegraph: 0.9, attackCd: 1.8, scoreBonus: 8 },
};

const PICKUP_DEFS = {
  hp_s: { id: 'hp_s', nameZh: '小血包', kind: 'heal', amount: 25, color: 0x6dff9a, respawn: 20 },
  hp_m: { id: 'hp_m', nameZh: '大血包', kind: 'heal', amount: 50, color: 0x2dff7a, respawn: 30 },
  armor: { id: 'armor', nameZh: '護甲磚', kind: 'armor', amount: 50, color: 0x7ef0ff, respawn: 35 },
  ammo: { id: 'ammo', nameZh: '彈藥箱', kind: 'ammo', amount: 1, color: 0xffe66d, respawn: 18 },
  quad: { id: 'quad', nameZh: '四倍脈衝', kind: 'power', power: 'quad', duration: 12, color: 0xff6bcb, respawn: 90 },
  haste: { id: 'haste', nameZh: '疾步', kind: 'power', power: 'haste', duration: 10, color: 0x7ef0ff, respawn: 75 },
  ghost: { id: 'ghost', nameZh: '殘影', kind: 'power', power: 'ghost', duration: 8, color: 0xffffff, respawn: 90 },
  overheal: { id: 'overheal', nameZh: '過載心', kind: 'overheal', amount: 150, color: 0xff4466, respawn: 120 },
};

const MM_VER = 'mm7'; // mm7-weapon-switch hotbar/highlight; vm-* / atlas paths unchanged (query bust only)
const MM_EXPAND = 'expand-v1-weaponswitch'; // was expand-v1-realism; map/bot/pickup plates still resolve via same files
const MM_SCENE = 'mm6-realism'; // keep b4c9b88 hit/FX sprites
const PICKUP_GRAB_R = 3.5; // meters — soft tip: walk-into cubes were missing 1.16m radius
const MM_URLS = {
  armsAtlas: [`./refs/atlas/fp-arms-atlas.png?v=${MM_VER}`, `./refs/atlas/fp-arms-atlas.jpg?v=${MM_VER}`],
  weaponsAtlas: [`./refs/atlas/weapons-view-atlas.png?v=${MM_VER}`, `./refs/atlas/weapons-view-atlas.jpg?v=${MM_VER}`],
  fpCombined: [`./refs/fp/fp-viewmodel-rifle.png?v=${MM_VER}`, `./refs/atlas/fp-viewmodel-rifle.png?v=${MM_VER}`],
  uiCrosshair: [`./refs/ui/ui-crosshair.png?v=${MM_VER}`],
  uiWeaponIcons: {
    ar: `./refs/ui/ui-weapon-ar.png?v=${MM_VER}`,
    pistol: `./refs/ui/ui-weapon-pistol.png?v=${MM_VER}`,
    sniper: `./refs/ui/ui-weapon-sniper.png?v=${MM_VER}`,
    shotgun: `./refs/ui/ui-weapon-shotgun.png?v=${MM_VER}`,
    knife: `./refs/ui/ui-weapon-knife.png?v=${MM_VER}`,
  },
  uiWeaponHotbar: `./refs/ui/ui-weapons-hotbar.png?v=${MM_VER}`,
  uiWeaponSlotSelected: `./refs/ui/ui-weapon-slot-selected.png?v=${MM_VER}`,
  weapons: {
    ar: [`./refs/atlas/vm-rifle.png?v=${MM_VER}`],
    pistol: [`./refs/atlas/vm-pistol.png?v=${MM_VER}`],
    sniper: [`./refs/atlas/vm-sniper.png?v=${MM_VER}`],
    shotgun: [`./refs/atlas/vm-shotgun.png?v=${MM_VER}`],
    knife: [`./refs/atlas/vm-knife.png?v=${MM_VER}`],
  },
  arenaMats: [`./refs/arena/arena-materials.png?v=${MM_VER}`, `./refs/arena/arena-materials.jpg?v=${MM_VER}`],
  bots: [
    [`./refs/bots/bot-a-tactical.png?v=${MM_VER}`, `./refs/bots/bot-a-tactical.jpg?v=${MM_VER}`],
    [`./refs/bots/bot-b-medic.png?v=${MM_VER}`, `./refs/bots/bot-b-medic.jpg?v=${MM_VER}`],
    [`./refs/bots/bot-c-police.png?v=${MM_VER}`, `./refs/bots/bot-c-police.jpg?v=${MM_VER}`],
    [`./refs/bots/bot-d-desert.png?v=${MM_VER}`, `./refs/bots/bot-d-desert.jpg?v=${MM_VER}`],
  ],
  expandBots: {
    E: [`./refs/expand/bots/bot-e-guerrilla.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-e.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-e-flanker.png?v=${MM_EXPAND}`],
    F: [`./refs/expand/bots/bot-f-tank.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-f.png?v=${MM_EXPAND}`],
    G: [`./refs/expand/bots/bot-g-glider.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-g.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-g-slider.png?v=${MM_EXPAND}`],
    H: [`./refs/expand/bots/bot-h-nest.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-h.png?v=${MM_EXPAND}`],
    I: [`./refs/expand/bots/bot-i-bee.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-i.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-i-disruptor.png?v=${MM_EXPAND}`],
    J: [`./refs/expand/bots/bot-j-shield.png?v=${MM_EXPAND}`, `./refs/expand/bots/bot-j.png?v=${MM_EXPAND}`],
  },
  expandBosses: {
    Boss_ContainerTitan: [`./refs/expand/bosses/boss-container-titan.png?v=${MM_EXPAND}`, `./refs/expand/bosses/boss-container-titan.jpg?v=${MM_EXPAND}`],
    Boss_DuneBeacon: [`./refs/expand/bosses/boss-dune-beacon.png?v=${MM_EXPAND}`, `./refs/expand/bosses/boss-dune-beacon.jpg?v=${MM_EXPAND}`],
    Boss_RingArbiter: [`./refs/expand/bosses/boss-ring-arbiter.png?v=${MM_EXPAND}`, `./refs/expand/bosses/boss-ring-arbiter.jpg?v=${MM_EXPAND}`],
  },
  expandPickups: {
    hp_s: [`./refs/expand/pickups/pickup-hp-s.png?v=${MM_EXPAND}`, `./refs/expand/pickups/pickup-hp_s.png?v=${MM_EXPAND}`],
    hp_m: [`./refs/expand/pickups/pickup-hp-m.png?v=${MM_EXPAND}`, `./refs/expand/pickups/pickup-hp_m.png?v=${MM_EXPAND}`],
    armor: [`./refs/expand/pickups/pickup-armor.png?v=${MM_EXPAND}`],
    ammo: [`./refs/expand/pickups/pickup-ammo.png?v=${MM_EXPAND}`],
    quad: [`./refs/expand/pickups/pickup-quad.png?v=${MM_EXPAND}`],
    haste: [`./refs/expand/pickups/pickup-haste.png?v=${MM_EXPAND}`],
    ghost: [`./refs/expand/pickups/pickup-ghost.png?v=${MM_EXPAND}`],
    overheal: [`./refs/expand/pickups/pickup-overheal.png?v=${MM_EXPAND}`],
  },
  expandMaps: {
    containers: [`./refs/expand/maps/expand-map-containers.jpg?v=${MM_EXPAND}`, `./refs/mood/mb-arena-containers.jpg?v=${MM_EXPAND}`],
    oasis: [`./refs/expand/maps/expand-map-oasis.jpg?v=${MM_EXPAND}`, `./refs/mood/mb-arena-oasis.jpg?v=${MM_EXPAND}`],
    platforms: [`./refs/expand/maps/expand-map-platforms.jpg?v=${MM_EXPAND}`, `./refs/mood/mb-arena-platforms.jpg?v=${MM_EXPAND}`],
    'neon-alley': [`./refs/expand/maps/expand-map-neon-alley.jpg?v=${MM_EXPAND}`],
    dunes: [`./refs/expand/maps/expand-map-dunes.jpg?v=${MM_EXPAND}`],
    'pulse-coliseum': [`./refs/expand/maps/expand-map-pulse-coliseum.jpg?v=${MM_EXPAND}`],
  },
  fx: {
    hitSpark: [`./refs/fx/fx-hit-spark.png?v=${MM_SCENE}`],
    bloodSpray: [`./refs/fx/fx-blood-spray.png?v=${MM_SCENE}`],
    bloodDecal: [`./refs/fx/fx-blood-decal.png?v=${MM_SCENE}`],
    botFall: [`./refs/fx/fx-bot-fall.png?v=${MM_SCENE}`],
  },
};

const mm = {
  ready: false, armsSleeve: null, armsSkin: null, weapons: Object.create(null), fpCombined: null,
  botSkins: [], expandBotSkins: Object.create(null), bossSkins: Object.create(null),
  pickupIcons: Object.create(null), expandMapMoods: Object.create(null), mats: Object.create(null),
  crosshairImg: null,
  fx: { hitSpark: null, bloodSpray: null, bloodDecal: null, botFall: null },
};

function srgbTex(tex) {
  if (tex && 'colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function chromaKeyToCanvas(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  const w = c.width;
  const h = c.height;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const maxRB = Math.max(r, b);
    const greenScreen = g >= 155 && g > r + 55 && g > b + 55 && g >= maxRB * 1.85 && (r + b) < g * 0.82;
    if (greenScreen) {
      const excess = Math.min(1, (g - maxRB) / 55);
      px[i + 3] = excess > 0.16 ? 0 : Math.min(px[i + 3], Math.floor((1 - excess) * 18));
      if (px[i + 3] > 0 && g > maxRB) {
        px[i + 1] = Math.min(g, maxRB + 2);
        px[i] = Math.min(r, maxRB);
        px[i + 2] = Math.min(b, maxRB);
      }
    }
  }
  const isGreenPlate = (idx) => {
    const i = idx * 4;
    if (px[i + 3] < 16) return true;
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const maxRB = Math.max(r, b);
    return g >= 130 && g > r + 45 && g > b + 45 && g >= maxRB * 1.65;
  };
  const n = w * h;
  const seen = new Uint8Array(n);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (seen[idx]) return;
    if (!isGreenPlate(idx)) return;
    seen[idx] = 1;
    stack.push(idx);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const idx = stack.pop();
    px[idx * 4 + 3] = 0;
    const x = idx % w;
    const y = (idx / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function canvasToTex(c, opts = {}) {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = opts.wrapS ?? THREE.ClampToEdgeWrapping;
  tex.wrapT = opts.wrapT ?? THREE.ClampToEdgeWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.anisotropy = renderer ? Math.min(4, renderer.capabilities.getMaxAnisotropy()) : 4;
  if (opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  return srgbTex(tex);
}

function cropCanvas(srcCanvas, sx, sy, sw, sh) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.floor(sw));
  c.height = Math.max(1, Math.floor(sh));
  const ctx = c.getContext('2d');
  ctx.drawImage(srcCanvas, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c;
}

/** Tight crop opaque pixels (for weapon / bot plates). */
function tightAlphaCrop(srcCanvas, pad = 4) {
  const ctx = srcCanvas.getContext('2d', { willReadFrequently: true });
  const { width: w, height: h } = srcCanvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return srcCanvas;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  return cropCanvas(srcCanvas, minX, minY, maxX - minX + 1, maxY - minY + 1);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`load fail ${url}`));
    img.src = url;
  });
}

/** Try URLs in order (PNG first). */
async function loadImagePrefer(urls) {
  const list = Array.isArray(urls) ? urls : [urls];
  let lastErr;
  for (const url of list) {
    try {
      const img = await loadImage(url);
      return { img, url };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('loadImagePrefer: empty');
}

function isPngUrl(url) {
  return /\.png(\?|$)/i.test(url || '');
}

function applyCrosshairImage(canvas) {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL();
  cross.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    width: 32px;
    height: 32px;
    margin: -16px 0 0 -16px;
    pointer-events: none;
    z-index: 5;
    opacity: 0;
    background: url(${dataUrl}) center/contain no-repeat;
  `;
  const style = document.createElement('style');
  style.textContent = '#cross.img-crosshair::before, #cross.img-crosshair::after { display: none; }';
  document.head.appendChild(style);
  cross.classList.add('img-crosshair');
}

/** PNG with alpha → copy as-is; JPEG greenscreen → chroma key. */
function plateToCanvas(img, url) {
  if (isPngUrl(url)) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c;
  }
  return chromaKeyToCanvas(img);
}


async function softLoadTex(urls) {
  try {
    const { img, url } = await loadImagePrefer(urls);
    return canvasToTex(tightAlphaCrop(plateToCanvas(img, url), 2));
  } catch (_) { return null; }
}

/** FX plates keep full framing (hard-edge PNG overlays). */
async function softLoadFx(urls) {
  try {
    const { img, url } = await loadImagePrefer(urls);
    return canvasToTex(plateToCanvas(img, url));
  } catch (_) { return null; }
}

let mmPromise = null;
function ensureMultimedia() {
  if (!mmPromise) mmPromise = loadMultimedia();
  return mmPromise;
}

async function loadMultimedia() {
  try {
    const armsLoaded = await loadImagePrefer(MM_URLS.armsAtlas);
    const weapAtlasLoaded = await loadImagePrefer(MM_URLS.weaponsAtlas);
    const matsLoaded = await loadImagePrefer(MM_URLS.arenaMats);
    const botLoaded = await Promise.all(MM_URLS.bots.map((u) => loadImagePrefer(u)));
    let fpCombinedLoaded = null;
    try { fpCombinedLoaded = await loadImagePrefer(MM_URLS.fpCombined); } catch (_) {}
    
    let crosshairLoaded = null;
    try { crosshairLoaded = await loadImagePrefer(MM_URLS.uiCrosshair); } catch (_) {}

    const armsKeyed = plateToCanvas(armsLoaded.img, armsLoaded.url);
    const cell = armsKeyed.width / 6;
    mm.armsSleeve = canvasToTex(cropCanvas(armsKeyed, cell * 0.12, cell * 0.12, cell * 0.76, cell * 0.76), {
      wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [1, 1],
    });
    mm.armsSkin = canvasToTex(cropCanvas(armsKeyed, cell * 4.12, cell * 0.12, cell * 0.76, cell * 0.76), {
      wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat: [1, 1],
    });

    const ids = ['ar', 'pistol', 'sniper', 'shotgun', 'knife'];
    const weapKeyed = plateToCanvas(weapAtlasLoaded.img, weapAtlasLoaded.url);
    const sliceW = weapKeyed.width / 5;
    for (let i = 0; i < 5; i++) {
      const id = ids[i];
      let tex = null;
      const prefer = MM_URLS.weapons[id];
      if (prefer) {
        try {
          const w = await loadImagePrefer(prefer);
          tex = canvasToTex(tightAlphaCrop(plateToCanvas(w.img, w.url), 4));
        } catch (_) {}
      }
      if (!tex) {
        const slice = cropCanvas(weapKeyed, sliceW * i, 0, sliceW, weapKeyed.height);
        tex = canvasToTex(tightAlphaCrop(slice, 6));
      }
      mm.weapons[id] = tex;
    }
    if (fpCombinedLoaded) {
      mm.fpCombined = canvasToTex(tightAlphaCrop(plateToCanvas(fpCombinedLoaded.img, fpCombinedLoaded.url), 2));
    }
    if (crosshairLoaded) {
      mm.crosshairImg = plateToCanvas(crosshairLoaded.img, crosshairLoaded.url);
      applyCrosshairImage(mm.crosshairImg);
    }
    mm.botSkins = botLoaded.map(({ img, url }) => canvasToTex(tightAlphaCrop(plateToCanvas(img, url), 2)));

    const matsImg = matsLoaded.img;
    const mw = matsImg.naturalWidth || matsImg.width;
    const mh = matsImg.naturalHeight || matsImg.height;
    const cw = mw / 3, ch = mh / 3;
    const inset = 0.08;
    const matCanvas = document.createElement('canvas');
    matCanvas.width = mw; matCanvas.height = mh;
    matCanvas.getContext('2d').drawImage(matsImg, 0, 0);
    const tile = (col, row, repeat = [1, 1]) => {
      const sx = cw * (col + inset), sy = ch * (row + inset);
      const sw = cw * (1 - inset * 2), sh = ch * (1 - inset * 2);
      return canvasToTex(cropCanvas(matCanvas, sx, sy, sw, sh), {
        wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, repeat,
      });
    };
    mm.mats.containerR = tile(0, 0, [1, 1]);
    mm.mats.containerB = tile(1, 0, [1, 1]);
    mm.mats.containerY = tile(2, 0, [1, 1]);
    mm.mats.concrete = tile(0, 1, [4, 4]);
    mm.mats.sand = tile(1, 1, [3, 3]);
    mm.mats.hazard = tile(2, 1, [2, 2]);
    mm.mats.fence = tile(0, 2, [2, 2]);
    mm.mats.sand2 = tile(1, 2, [2, 2]);
    mm.mats.water = tile(2, 2, [2, 2]);

    for (const [tag, urls] of Object.entries(MM_URLS.expandBots)) {
      mm.expandBotSkins[tag] = await softLoadTex(urls);
    }
    for (const [id, urls] of Object.entries(MM_URLS.expandBosses)) {
      mm.bossSkins[id] = await softLoadTex(urls);
    }
    for (const [id, urls] of Object.entries(MM_URLS.expandPickups)) {
      mm.pickupIcons[id] = await softLoadTex(urls);
    }
    for (const [id, urls] of Object.entries(MM_URLS.expandMaps)) {
      mm.expandMapMoods[id] = await softLoadTex(urls);
    }
    for (const [id, urls] of Object.entries(MM_URLS.fx)) {
      mm.fx[id] = await softLoadFx(urls);
    }

    mm.ready = true;
    if (armsRoot) buildArms();
    if (worldRoot) buildArena(state.mapIndex || 0);
    if (bots.length) spawnBots();
  } catch (err) {
    console.warn('[pulse-arena] multimedia load failed; using solid fallbacks', err);
    mm.ready = false;
  }
}



// —— WebAudio SFX pool (mp3 preferred, oscillator fallback) ——
let audioCtx = null;
let audioActive = 0;
const sfxBuffers = Object.create(null); // id -> AudioBuffer
const sfxReady = { ok: false };
let slideLoopSrc = null;
let slideLoopGain = null;

const SFX_FILES = {
  shoot: ['./refs/sfx/shoot.mp3', './refs/sfx/sfx_fire_ar.mp3', './refs/sfx/fire_ar.mp3'],
  reload: ['./refs/sfx/reload.mp3', './refs/sfx/sfx_reload.mp3'],
  slide: ['./refs/sfx/slide.mp3', './refs/sfx/sfx_slide_loop.mp3'],
  kill: ['./refs/sfx/kill.mp3', './refs/sfx/sfx_kill_confirm.mp3'],
  pickup: ['./refs/sfx/pickup.mp3', './refs/sfx/sfx_pickup_power.mp3'],
  boss: ['./refs/sfx/boss.mp3', './refs/sfx/sfx_boss_intro.mp3'],
  hit: ['./refs/sfx/sfx_hit.mp3', './refs/sfx/hit.mp3'],
  hit_armor: ['./refs/sfx/sfx_hit_armor.mp3', './refs/sfx/hit_armor.mp3'],
  death: ['./refs/sfx/sfx_death.mp3', './refs/sfx/death.mp3'],
};

function ensureAudio() {
  if (!ENABLE_SFX) return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function makeFleshHitBuffer(ctx) {
  // Procedural wet impact — used when no hit.mp3 ships yet
  const dur = 0.11;
  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    const t = i / ctx.sampleRate;
    const env = Math.exp(-t * 32);
    const thump = Math.sin(2 * Math.PI * (85 + t * 40) * t) * 0.62;
    const mid = Math.sin(2 * Math.PI * 210 * t) * 0.22 * Math.exp(-t * 18);
    const noise = (Math.random() * 2 - 1) * 0.5 * Math.exp(-t * 48);
    const click = Math.sin(2 * Math.PI * 980 * t) * 0.12 * Math.exp(-t * 90);
    d[i] = (thump + mid + noise + click) * env;
  }
  return buf;
}

async function loadSfxBuffers() {
  const ctx = ensureAudio();
  if (!ctx) return;
  for (const [id, urls] of Object.entries(SFX_FILES)) {
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const arr = await res.arrayBuffer();
        sfxBuffers[id] = await ctx.decodeAudioData(arr.slice(0));
        break;
      } catch (_) { /* try next */ }
    }
  }
  if (!sfxBuffers.hit) sfxBuffers.hit = makeFleshHitBuffer(ctx);
  if (!sfxBuffers.hit_armor) sfxBuffers.hit_armor = sfxBuffers.hit;
  if (!sfxBuffers.death && sfxBuffers.kill) sfxBuffers.death = sfxBuffers.kill;
  sfxReady.ok = Object.keys(sfxBuffers).length > 0;
}

function playBuf(id, opts = {}) {
  const ctx = ensureAudio();
  if (!ctx || !sfxBuffers[id] || audioActive >= AUDIO_POOL_CAP) return false;
  audioActive++;
  const src = ctx.createBufferSource();
  src.buffer = sfxBuffers[id];
  src.loop = !!opts.loop;
  const g = ctx.createGain();
  g.gain.value = opts.vol ?? 0.55;
  src.connect(g); g.connect(ctx.destination);
  const offset = opts.offset || 0;
  try { src.start(0, offset); } catch (_) { src.start(0); }
  if (!opts.loop) {
    const dur = (sfxBuffers[id].duration - offset) * 1000 / (opts.rate || 1);
    setTimeout(() => { audioActive = Math.max(0, audioActive - 1); }, Math.min(dur, 4000) + 30);
  }
  if (opts.rate) src.playbackRate.value = opts.rate;
  return { src, g };
}

function tone(freq, dur, type = 'square', vol = 0.12, slideTo = null) {
  const ctx = ensureAudio();
  if (!ctx || audioActive >= AUDIO_POOL_CAP) return;
  audioActive++;
  const t0 = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo != null) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
  setTimeout(() => { audioActive = Math.max(0, audioActive - 1); }, (dur + 0.05) * 1000);
}
function noiseBurst(dur = 0.08, vol = 0.1) {
  const ctx = ensureAudio();
  if (!ctx || audioActive >= AUDIO_POOL_CAP) return;
  audioActive++;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g); g.connect(ctx.destination);
  src.start();
  setTimeout(() => { audioActive = Math.max(0, audioActive - 1); }, (dur + 0.05) * 1000);
}

function stopSlideLoop() {
  if (slideLoopSrc) {
    try { slideLoopSrc.stop(); } catch (_) {}
    slideLoopSrc = null;
    slideLoopGain = null;
    audioActive = Math.max(0, audioActive - 1);
  }
}

const SFX = {
  shoot() {
    if (!ENABLE_SFX) return;
    if (playBuf('shoot', { vol: 0.5 })) return;
    tone(440, 0.045, 'square', 0.1, 160); tone(900, 0.025, 'triangle', 0.05); noiseBurst(0.035, 0.055);
  },
  reload() {
    if (!ENABLE_SFX) return;
    if (playBuf('reload', { vol: 0.55 })) return;
    tone(240, 0.07, 'triangle', 0.09); tone(150, 0.1, 'sine', 0.06, 80);
  },
  hit() {
    if (!ENABLE_SFX) return;
    // confirmed flesh impact (Multimedia provisional sfx_hit)
    if (playBuf('hit', { vol: 0.66, rate: 0.94 + Math.random() * 0.14 })) return;
    tone(140, 0.06, 'sine', 0.12, 70);
    tone(620, 0.03, 'square', 0.07, 220);
    noiseBurst(0.045, 0.09);
  },
  hitArmor() {
    if (!ENABLE_SFX) return;
    if (playBuf('hit_armor', { vol: 0.58, rate: 0.96 + Math.random() * 0.1 })) return;
    tone(880, 0.03, 'triangle', 0.08, 420);
    noiseBurst(0.03, 0.06);
  },
  death() {
    if (!ENABLE_SFX) return;
    // Multimedia provisional sfx_death, then kill confirm as secondary
    if (playBuf('death', { vol: 0.7 })) return;
    if (playBuf('kill', { vol: 0.6 })) return;
    tone(160, 0.22, 'sawtooth', 0.13, 55); noiseBurst(0.16, 0.1);
  },
  slideStart() {
    if (!ENABLE_SFX) return;
    stopSlideLoop();
    const played = playBuf('slide', { vol: 0.35, loop: true });
    if (played) { slideLoopSrc = played.src; slideLoopGain = played.g; return; }
    noiseBurst(0.14, 0.09); tone(130, 0.1, 'sawtooth', 0.055, 70);
  },
  slideStop() { stopSlideLoop(); },
  slide() { this.slideStart(); },
  jump() { if (!ENABLE_SFX) return; tone(300, 0.07, 'triangle', 0.1, 520); },
  land() { if (!ENABLE_SFX) return; tone(120, 0.04, 'sine', 0.06); noiseBurst(0.03, 0.04); },
  pickup_hp() { if (!ENABLE_SFX) return; if (playBuf('pickup', { vol: 0.45, rate: 1.15 })) return; tone(520, 0.06, 'sine', 0.1); },
  pickup_armor() { if (!ENABLE_SFX) return; if (playBuf('pickup', { vol: 0.45, rate: 0.95 })) return; tone(400, 0.07, 'square', 0.09); },
  pickup_ammo() { if (!ENABLE_SFX) return; if (playBuf('pickup', { vol: 0.4, rate: 0.85 })) return; tone(350, 0.05, 'triangle', 0.08); },
  pickup_power() { if (!ENABLE_SFX) return; if (playBuf('pickup', { vol: 0.65 })) return; tone(523, 0.08, 'sine', 0.11); tone(659, 0.1, 'triangle', 0.1); },
  power_end() { if (!ENABLE_SFX) return; tone(400, 0.1, 'sine', 0.07, 120); },
  boss_intro() { if (!ENABLE_SFX) return; if (playBuf('boss', { vol: 0.7 })) return; tone(90, 0.4, 'sawtooth', 0.15, 55); },
  boss_telegraph() { if (!ENABLE_SFX) return; tone(200, 0.15, 'square', 0.1, 140); },
  boss_hurt() { if (!ENABLE_SFX) return; tone(100, 0.1, 'sawtooth', 0.12, 60); noiseBurst(0.08, 0.08); },
  boss_death() { if (!ENABLE_SFX) return; if (playBuf('boss', { vol: 0.55, rate: 0.8 })) return; tone(80, 0.45, 'sawtooth', 0.14, 40); },
  level_clear() { if (!ENABLE_SFX) return; tone(392, 0.1, 'triangle', 0.1); setTimeout(() => tone(523, 0.1, 'triangle', 0.1), 90); setTimeout(() => tone(659, 0.16, 'sine', 0.12), 180); },
  ui_start() { if (!ENABLE_SFX) return; tone(440, 0.08, 'sine', 0.08); tone(660, 0.1, 'triangle', 0.07); },
  flash() { if (!ENABLE_SFX) return; noiseBurst(0.12, 0.12); tone(1200, 0.08, 'sine', 0.05); },
};

let running = false;
let matchOver = false;
const keys = Object.create(null);
let pointerLocked = false;
let yaw = 0;
let pitch = 0;
let wantPointer = false;

const state = {
  x: 0, y: PLAYER_HEIGHT, z: 0,
  vx: 0, vy: 0, vz: 0,
  hp: 100, armor: 0, kills: 0, deaths: 0, streak: 0,
  weapon: 0, ammo: 30, reserve: 90,
  shootCd: 0, reloading: false, reloadT: 0,
  onGround: true, crouching: false, sliding: false, slideT: 0,
  ads: false, invuln: 0, timeLeft: MATCH_SECONDS,
  name: '你',
  mapIndex: 0,
  power: null, powerT: 0,
  dmgMul: 1, speedMul: 1, ghost: false,
  fragLimit: 20,
  bossAlive: false,
  switchFlashT: 0,
  recoilKick: 0,
};

/** Per-slot mag/reserve so 1–5 / wheel / Q is a true instant loadout swap. */
let weaponBags = WEAPONS.map((w) => ({ ammo: w.melee ? 1 : w.mag, reserve: w.reserve }));

let scene, camera, renderer, clock;
let solidBoxes = [];
let bots = [];
let boss = null;
let pickups = [];
let jumpPads = [];
let spawnPoints = [];
let highPoints = [];
let bulletTraces = [];
let particles = [];
let bloodPool = [];
let bloodReady = false;
const MAX_FX_SPRITES = 28;
const MAX_FX_DECALS = 14;
let fxSprites = [];
let fxDecals = [];
let fxReady = false;
let worldRoot = null;
let hemiLight = null;
let sunLight = null;
let fillLight = null;
let _hudAcc = 0;
let _hudDirty = true;
let gritTexCache = null;
let armsRoot = null;
let gunParts = null;
let muzzleFlash = null;
let raycaster = new THREE.Raycaster();
let tmpV = new THREE.Vector3();
let tmpV2 = new THREE.Vector3();
let _wasSliding = false;
let _wasOnGround = true;
let _aiTick = 0;
let pickupSockets = [];

const geoPool = new Map();
const matPool = new Map();
function pooledBox(w, h, d) {
  const k = `${w.toFixed(2)}x${h.toFixed(2)}x${d.toFixed(2)}`;
  let g = geoPool.get(k);
  if (!g) { g = new THREE.BoxGeometry(w, h, d); geoPool.set(k, g); }
  return g;
}
function pooledMat(color, mapTex = null) {
  const k = mapTex ? `tex:${color}:${mapTex.uuid || 'm'}` : `col:${color}`;
  let m = matPool.get(k);
  if (!m) {
    m = mapTex ? new THREE.MeshLambertMaterial({ map: mapTex }) : new THREE.MeshLambertMaterial({ color });
    matPool.set(k, m);
  }
  return m;
}

function showPanel(id) {
  for (const p of document.querySelectorAll('.panel')) p.classList.toggle('on', p.id === id);
}
function feedKill(text) {
  const d = document.createElement('div');
  d.textContent = text;
  killfeed.prepend(d);
  while (killfeed.children.length > 6) killfeed.lastChild.remove();
  setTimeout(() => d.remove(), 4200);
}
function flashHit() {
  hitmark.style.opacity = '1';
  setTimeout(() => { hitmark.style.opacity = '0'; }, 90);
}
function flashDmg() {
  dmgFlash.style.opacity = '1';
  setTimeout(() => { dmgFlash.style.opacity = '0'; }, 120);
}
function currentMap() { return MAPS[state.mapIndex] || MAPS[0]; }

function syncBuffHud() {
  if (!buffHud) return;
  const bits = [];
  if (state.armor > 0) bits.push(`甲 ${Math.ceil(state.armor)}`);
  if (state.power === 'quad' && state.powerT > 0) bits.push(`四倍 ${state.powerT.toFixed(0)}s`);
  if (state.power === 'haste' && state.powerT > 0) bits.push(`疾步 ${state.powerT.toFixed(0)}s`);
  if (state.power === 'ghost' && state.powerT > 0) bits.push(`殘影 ${state.powerT.toFixed(0)}s`);
  buffHud.textContent = bits.join(' · ');
  buffHud.style.opacity = bits.length ? '1' : '0';
}
function syncBossHud() {
  if (!bossHud) return;
  if (boss && boss.alive) {
    const pct = Math.max(0, boss.hp / boss.maxHp) * 100;
    bossHud.style.opacity = '1';
    bossHud.innerHTML = `<div class="bn">${boss.nameZh} · ${boss.nameEn}</div><div class="bb"><i style="width:${pct.toFixed(1)}%"></i></div>`;
  } else {
    bossHud.style.opacity = '0';
    bossHud.innerHTML = '';
  }
}
function markHud() { _hudDirty = true; }
function syncHud() {
  _hudDirty = false;
  const hpVal = Math.max(0, Math.ceil(state.hp));
  const hpHost = document.querySelector('#hudBot .hp');
  if (hpHost) {
    const armorBit = state.armor > 0 ? ` · 甲 ${Math.ceil(state.armor)}` : '';
    hpHost.innerHTML = `HP <b id="hp">${hpVal}</b>${armorBit}`;
  } else {
    document.getElementById('hp').textContent = String(hpVal);
  }
  document.getElementById('ammo').textContent = String(state.ammo);
  document.getElementById('reserve').textContent = String(state.reserve);
  document.getElementById('kills').textContent = String(state.kills);
  document.getElementById('deaths').textContent = String(state.deaths);
  document.getElementById('gunHud').textContent = WEAPONS[state.weapon].nameZh;
  syncWeaponStrip();
  const m = Math.floor(state.timeLeft / 60);
  const s = Math.floor(state.timeLeft % 60);
  document.getElementById('time').textContent = `${m}:${String(s).padStart(2, '0')}`;
  slideTag.classList.toggle('on', state.sliding);
  cross.classList.toggle('ads', state.ads);
  const map = currentMap();
  if (levelHud) levelHud.textContent = `${map.nameZh} · ${map.nameEn}`;
  syncBuffHud();
  syncBossHud();
}

function syncWeaponStrip() {
  if (!weapStrip) return;
  const selUrl = MM_URLS.uiWeaponSlotSelected;
  const bits = WEAPONS.map((w, i) => {
    const bag = weaponBags[i] || { ammo: w.mag, reserve: w.reserve };
    const ammoTxt = w.melee ? '—' : String(i === state.weapon ? state.ammo : bag.ammo);
    const on = i === state.weapon ? ' on' : '';
    const ico = MM_URLS.uiWeaponIcons[w.id] || '';
    const sel = i === state.weapon
      ? `<span class="ws-sel" style="background-image:url('${selUrl}')" aria-hidden="true"></span>`
      : `<span class="ws-sel" aria-hidden="true"></span>`;
    return `<button type="button" class="ws${on}" data-w="${i}" title="${w.nameZh}" tabindex="-1">`
      + `<img class="ws-ico" src="${ico}" alt="" width="56" height="56" draggable="false"/>`
      + sel
      + `<b>${i + 1}</b>`
      + `<i>${ammoTxt}</i>`
      + `</button>`;
  });
  weapStrip.innerHTML = bits.join('');
  // ui-weapons-hotbar.png kept in pack for optional strip BG; per-slot icons + selected frame are primary.
}

function boxSolid(x, y, z, w, h, d) {
  return { minX: x - w / 2, maxX: x + w / 2, minY: y, maxY: y + h, minZ: z - d / 2, maxZ: z + d / 2 };
}
function addBox(group, x, y, z, w, h, d, color, solid = true, mapTex = null) {
  const mesh = new THREE.Mesh(pooledBox(w, h, d), pooledMat(color, mapTex));
  mesh.position.set(x, y + h / 2, z);
  group.add(mesh);
  if (solid) solidBoxes.push(boxSolid(x, y, z, w, h, d));
  return mesh;
}
function makeGridFloor(size, divisions, colorA, colorB) {
  const canvas2 = document.createElement('canvas');
  canvas2.width = 256; canvas2.height = 256;
  const ctx = canvas2.getContext('2d');
  ctx.fillStyle = colorA; ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = colorB; ctx.lineWidth = 2;
  const step = 256 / 8;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(256, i * step); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas2);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(divisions, divisions);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ map: tex }));
  mesh.rotation.x = -Math.PI / 2; mesh.position.y = 0.01;
  return mesh;
}
function getGritTexture() {
  if (gritTexCache) return gritTexCache;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6a6e72';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    const v = 70 + Math.random() * 70;
    ctx.fillStyle = `rgba(${v},${v * 0.95},${v * 0.9},${0.08 + Math.random() * 0.18})`;
    ctx.fillRect(x, y, 1 + (Math.random() > 0.85 ? 2 : 1), 1);
  }
  // subtle cracks
  ctx.strokeStyle = 'rgba(30,30,28,0.18)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    let x = Math.random() * 256, y = Math.random() * 256;
    ctx.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (Math.random() - 0.5) * 40;
      y += (Math.random() - 0.5) * 40;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.anisotropy = renderer ? Math.min(4, renderer.capabilities.getMaxAnisotropy()) : 4;
  gritTexCache = tex;
  return tex;
}

function addGritFloor(size = 70, tint = 0x6a7078) {
  const mat = new THREE.MeshLambertMaterial({ map: getGritTexture(), color: tint });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.005;
  worldRoot.add(floor);
  return floor;
}

function addMapMoodBackdrop(mapId) {
  const tex = mm.expandMapMoods[mapId];
  if (!tex) return;
  // Distant mood plates — arcade depth, not photoreal skybox
  const mat = new THREE.MeshBasicMaterial({
    map: tex, fog: true, depthWrite: false, transparent: true, opacity: 0.88, side: THREE.DoubleSide,
  });
  const geo = new THREE.PlaneGeometry(72, 34);
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(geo, mat);
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    p.position.set(Math.sin(a) * 46, 11, Math.cos(a) * 46);
    p.lookAt(0, 8, 0);
    p.renderOrder = -2;
    worldRoot.add(p);
  }
}

function applyMapAtmosphere(map) {
  scene.background = new THREE.Color(map.sky);
  scene.fog = new THREE.Fog(map.fog, map.fogNear ?? 28, map.fogFar ?? 85);
  if (hemiLight) {
    hemiLight.color.setHex(map.hemiTop ?? 0xfff0e0);
    hemiLight.groundColor.setHex(map.hemiGround ?? 0x3a4538);
    hemiLight.intensity = map.hemiI ?? 0.75;
  }
  if (sunLight) {
    sunLight.color.setHex(map.sun ?? 0xfff2d6);
    sunLight.intensity = map.sunI ?? 1.1;
  }
  if (fillLight) {
    fillLight.intensity = map.fillI ?? 0.3;
  }
}

function ensureBloodPool() {
  if (bloodReady) return;
  bloodReady = true;
  const geo = new THREE.SphereGeometry(0.055, 5, 4);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0x6a0a12 : (i % 3 === 1 ? 0xa01018 : 0x3a0508),
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    scene.add(mesh);
    bloodPool.push({ mesh, vx: 0, vy: 0, vz: 0, life: 0 });
  }
}

function spawnBloodBurst(x, y, z, count = 10, power = 1) {
  ensureBloodPool();
  let spawned = 0;
  for (const p of bloodPool) {
    if (p.life > 0) continue;
    p.life = 0.28 + Math.random() * 0.35;
    p.vx = (Math.random() - 0.5) * 4.5 * power;
    p.vy = (1.2 + Math.random() * 3.2) * power;
    p.vz = (Math.random() - 0.5) * 4.5 * power;
    p.mesh.position.set(x + (Math.random() - 0.5) * 0.2, y + (Math.random() - 0.5) * 0.25, z + (Math.random() - 0.5) * 0.2);
    p.mesh.scale.setScalar(0.7 + Math.random() * 1.4);
    p.mesh.material.opacity = 0.95;
    p.mesh.visible = true;
    spawned++;
    if (spawned >= count) break;
  }
}

function updateBlood(dt) {
  if (!bloodReady) return;
  for (const p of bloodPool) {
    if (p.life <= 0) continue;
    p.life -= dt;
    p.vy -= 18 * dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    if (p.mesh.position.y < 0.04) {
      p.mesh.position.y = 0.04;
      p.vy *= -0.15;
      p.vx *= 0.55;
      p.vz *= 0.55;
    }
    p.mesh.material.opacity = Math.max(0, Math.min(0.95, p.life * 2.2));
    if (p.life <= 0) p.mesh.visible = false;
  }
}

function ensureFxPools() {
  if (fxReady) return;
  fxReady = true;
  for (let i = 0; i < MAX_FX_SPRITES; i++) {
    const mat = new THREE.SpriteMaterial({
      transparent: true, depthWrite: false, opacity: 0, fog: true,
    });
    const spr = new THREE.Sprite(mat);
    spr.visible = false;
    spr.frustumCulled = false;
    spr.renderOrder = 6;
    scene.add(spr);
    fxSprites.push({ spr, life: 0, maxLife: 0.4, baseScale: 1, additive: false });
  }
  const decalGeo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < MAX_FX_DECALS; i++) {
    const mat = new THREE.MeshBasicMaterial({
      transparent: true, depthWrite: false, opacity: 0, fog: true, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(decalGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    scene.add(mesh);
    fxDecals.push({ mesh, life: 0, maxLife: 3.2 });
  }
}

function acquireFxSprite() {
  ensureFxPools();
  for (const s of fxSprites) if (s.life <= 0) return s;
  // steal oldest
  let worst = fxSprites[0];
  for (const s of fxSprites) if (s.life < worst.life) worst = s;
  return worst;
}

function acquireFxDecal() {
  ensureFxPools();
  for (const d of fxDecals) if (d.life <= 0) return d;
  let worst = fxDecals[0];
  for (const d of fxDecals) if (d.life < worst.life) worst = d;
  return worst;
}

function spawnFxSprite(tex, x, y, z, scale, life, opts = {}) {
  if (!tex) return;
  const slot = acquireFxSprite();
  const mat = slot.spr.material;
  mat.map = tex;
  mat.needsUpdate = true;
  mat.opacity = opts.opacity ?? 1;
  mat.blending = opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending;
  mat.depthTest = opts.depthTest !== false;
  slot.spr.position.set(x, y, z);
  slot.spr.scale.set(scale, scale, 1);
  slot.spr.visible = true;
  slot.life = life;
  slot.maxLife = life;
  slot.baseScale = scale;
  slot.additive = !!opts.additive;
  if (opts.grow) slot.grow = opts.grow;
  else slot.grow = 0;
}

function spawnFxDecal(tex, x, z, size, life) {
  if (!tex) return;
  const slot = acquireFxDecal();
  const mat = slot.mesh.material;
  mat.map = tex;
  mat.needsUpdate = true;
  mat.opacity = 0.92;
  slot.mesh.position.set(x, 0.03 + Math.random() * 0.01, z);
  slot.mesh.scale.set(size, size, 1);
  slot.mesh.rotation.z = Math.random() * Math.PI * 2;
  slot.mesh.visible = true;
  slot.life = life;
  slot.maxLife = life;
}

/** Hit: spark + blood spray billboards (augments eng sphere blood). */
function spawnHitFx(x, y, z, hitArmor = false) {
  const sparkScale = hitArmor ? 0.55 : 0.85;
  const sprayScale = hitArmor ? 0.9 : 1.35;
  spawnFxSprite(mm.fx.hitSpark, x, y, z, sparkScale, 0.18 + Math.random() * 0.08, {
    additive: true, opacity: 1, grow: 0.6,
  });
  spawnFxSprite(
    mm.fx.bloodSpray,
    x + (Math.random() - 0.5) * 0.15,
    y + (Math.random() - 0.5) * 0.12,
    z + (Math.random() - 0.5) * 0.15,
    sprayScale,
    0.28 + Math.random() * 0.12,
    { opacity: 0.95, grow: 0.35 },
  );
}

/** Kill: bot-fall overlay + ground blood decal. */
function spawnKillFx(x, y, z, scaleMul = 1) {
  spawnFxSprite(mm.fx.botFall, x, 0.95 * scaleMul, z, 1.7 * scaleMul, 0.75 + Math.random() * 0.2, {
    opacity: 0.98, grow: 0.05,
  });
  spawnFxDecal(mm.fx.bloodDecal, x + (Math.random() - 0.5) * 0.35, z + (Math.random() - 0.5) * 0.35, (0.85 + Math.random() * 0.45) * scaleMul, 3.4 + Math.random() * 1.2);
  // extra spray punch on kill
  spawnFxSprite(mm.fx.bloodSpray, x, y, z, 1.55 * scaleMul, 0.4, { opacity: 1, grow: 0.45 });
  spawnFxSprite(mm.fx.hitSpark, x, y + 0.15, z, 1.05 * scaleMul, 0.22, { additive: true, opacity: 1, grow: 0.7 });
}

function updateFx(dt) {
  if (!fxReady) return;
  for (const s of fxSprites) {
    if (s.life <= 0) continue;
    s.life -= dt;
    const t = Math.max(0, s.life) / (s.maxLife || 0.3);
    const fade = t < 0.35 ? t / 0.35 : 1;
    s.spr.material.opacity = Math.max(0, fade * (s.additive ? 1 : 0.98));
    const grow = 1 + (1 - t) * (s.grow || 0);
    const sc = s.baseScale * grow;
    s.spr.scale.set(sc, sc, 1);
    if (s.life <= 0) {
      s.spr.visible = false;
      s.spr.material.opacity = 0;
    }
  }
  for (const d of fxDecals) {
    if (d.life <= 0) continue;
    d.life -= dt;
    const t = Math.max(0, d.life) / (d.maxLife || 3);
    // linger then fade last 35%
    d.mesh.material.opacity = t > 0.35 ? 0.9 : Math.max(0, (t / 0.35) * 0.9);
    if (d.life <= 0) {
      d.mesh.visible = false;
      d.mesh.material.opacity = 0;
    }
  }
}

function addOuterFence(wallH = 5.2) {
  const fence = mm.mats.fence || null;
  const fenceSpan = FENCE_R * 2 + FENCE_THICK;
  addBox(worldRoot, 0, 0, -FENCE_R, fenceSpan, wallH, FENCE_THICK, 0x6a7078, true, fence);
  addBox(worldRoot, 0, 0, FENCE_R, fenceSpan, wallH, FENCE_THICK, 0x6a7078, true, fence);
  addBox(worldRoot, -FENCE_R, 0, 0, FENCE_THICK, wallH, fenceSpan, 0x6a7078, true, fence);
  addBox(worldRoot, FENCE_R, 0, 0, FENCE_THICK, wallH, fenceSpan, 0x6a7078, true, fence);
  const bumpR = ARENA_BOUND + PLAYER_RADIUS + 0.05;
  const bumpT = 0.9;
  solidBoxes.push(boxSolid(0, 0, -(bumpR + bumpT / 2), fenceSpan, wallH, bumpT));
  solidBoxes.push(boxSolid(0, 0, (bumpR + bumpT / 2), fenceSpan, wallH, bumpT));
  solidBoxes.push(boxSolid(-(bumpR + bumpT / 2), 0, 0, bumpT, wallH, fenceSpan));
  solidBoxes.push(boxSolid((bumpR + bumpT / 2), 0, 0, bumpT, wallH, fenceSpan));
}
function defaultSpawns() {
  spawnPoints = [
    { x: 0, z: 14 }, { x: 0, z: -14 }, { x: 14, z: 0 }, { x: -14, z: 0 },
    { x: 9, z: 9 }, { x: -9, z: -9 }, { x: 9, z: -9 }, { x: -9, z: 9 },
  ];
}
function addJumpPad(x, z, vy = 14) {
  const pad = addBox(worldRoot, x, 0.02, z, 2.2, 0.12, 2.2, 0xffe66d, false, mm.mats.hazard);
  jumpPads.push({ x, z, r: 1.3, vy, mesh: pad });
}
function socket(type, x, z, y = 0.6) {
  pickupSockets.push({ type, x, y, z });
}


function buildArenaYard() {
  const concrete = mm.mats.concrete, sand = mm.mats.sand, sand2 = mm.mats.sand2;
  const water = mm.mats.water, hazard = mm.mats.hazard;
  const cR = mm.mats.containerR, cB = mm.mats.containerB, cY = mm.mats.containerY;
  if (concrete) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshLambertMaterial({ map: concrete }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; worldRoot.add(floor);
  } else worldRoot.add(makeGridFloor(70, 16, '#8a8e96', '#6e727a'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence();
  addGritFloor(70, 0x6a7078);
  addBox(worldRoot, 0, 0.02, 0, 6, 0.08, 40, 0x8a8a96, false, concrete);
  const covers = [
    [-8, 0, -6, 5.2, 2.6, 2.4, 0xe23b3b, cR], [8, 0, -6, 5.2, 2.6, 2.4, 0x2f6fe0, cB],
    [-8, 0, 8, 5.2, 2.6, 2.4, 0xf0c42e, cY], [8, 0, 8, 5.2, 2.6, 2.4, 0xe23b3b, cR],
    [0, 0, -12, 5.2, 2.6, 2.4, 0xf0c42e, cY], [0, 0, 12, 5.2, 2.6, 2.4, 0x2f6fe0, cB],
    [-14, 0, 0, 2.4, 2.6, 5.2, 0xf0c42e, cY], [14, 0, 0, 2.4, 2.6, 5.2, 0xe23b3b, cR],
    [-4, 0, 0, 2.2, 1.1, 2.2, 0xe07020, cR], [4, 0, -2, 2.2, 1.1, 2.2, 0xe07020, cB],
  ];
  for (const c of covers) addBox(worldRoot, c[0], c[1], c[2], c[3], c[4], c[5], c[6], true, c[7]);
  for (let i = 0; i < 4; i++) {
    addBox(worldRoot, -18 + i * 0.9, i * 0.45, -18, 2.2, 0.45, 3.2, 0xff9ad4, true, hazard);
    addBox(worldRoot, 18 - i * 0.9, i * 0.45, 18, 2.2, 0.45, 3.2, 0x7ef0ff, true, hazard);
  }
  addBox(worldRoot, -18, 0, 12, 6, 2.4, 6, 0x4a90d9, true, sand);
  addBox(worldRoot, 18, 0, -12, 6, 2.4, 6, 0xd94a90, true, sand2 || sand);
  highPoints.push({ x: -18, z: 12, y: 2.4 }, { x: 18, z: -12, y: 2.4 });
  if (water) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.18, 24), new THREE.MeshLambertMaterial({ map: water, transparent: true, opacity: 0.92 }));
    pad.position.set(0, 0.12, 0); worldRoot.add(pad);
  }
  for (const [x, z, tex, col] of [[-10, -14, cR, 0xe23b3b], [10, 14, cB, 0x2f6fe0], [-16, -8, cY, 0xf0c42e], [16, 8, cR, 0xe23b3b]]) {
    addBox(worldRoot, x, 0, z, 2.4, 2.4, 2.4, col, true, tex);
  }
  defaultSpawns();
  addJumpPad(0, 0, 12);
  socket('hp_s', 6, 6); socket('ammo', -6, -6); socket('armor', 10, -10); socket('quad', -12, 12);
  socket('haste', 12, 4); socket('hp_m', -4, 14);
}

function buildArenaContainers() {
  const cR = mm.mats.containerR, cB = mm.mats.containerB, cY = mm.mats.containerY, concrete = mm.mats.concrete;
  if (concrete) {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshLambertMaterial({ map: concrete }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; worldRoot.add(floor);
  } else worldRoot.add(makeGridFloor(70, 16, '#6a7078', '#4a5058'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence(6);
  addGritFloor(70, 0x5a6068);
  // stacked shipping containers — canyon lanes
  const stacks = [
    [-10, 0, -8, 3], [-10, 0, 0, 2], [-10, 0, 8, 3],
    [10, 0, -8, 2], [10, 0, 0, 3], [10, 0, 8, 2],
    [0, 0, -16, 2], [0, 0, 16, 2], [-16, 0, -4, 2], [16, 0, 4, 2],
  ];
  const cols = [cR, cB, cY];
  const colsHex = [0xe23b3b, 0x2f6fe0, 0xf0c42e];
  for (let si = 0; si < stacks.length; si++) {
    const [x, , z, n] = stacks[si];
    for (let s = 0; s < n; s++) {
      const tex = cols[s % 3], col = colsHex[s % 3];
      addBox(worldRoot, x, s * 2.6, z, 5.4, 2.6, 2.5, col, true, tex);
    }
    highPoints.push({ x, z, y: n * 2.6 });
  }
  // mid lane crates
  for (const [x, z] of [[-3, -3], [3, 3], [-3, 5], [3, -5]]) addBox(worldRoot, x, 0, z, 2, 1.2, 2, 0xe07020, true, cR);
  defaultSpawns();
  spawnPoints = [{ x: 0, z: 10 }, { x: 0, z: -10 }, { x: 6, z: 0 }, { x: -6, z: 0 }, { x: 12, z: 12 }, { x: -12, z: -12 }, { x: 12, z: -12 }, { x: -12, z: 12 }];
  addJumpPad(-10, -8, 13); addJumpPad(10, 8, 13);
  socket('hp_s', 0, 4); socket('ammo', 0, -4); socket('armor', 8, 0); socket('quad', 0, 0);
  socket('haste', -14, 0); socket('hp_m', 14, 0); socket('ghost', -8, 14);
}

function buildArenaOasis() {
  const sand = mm.mats.sand, sand2 = mm.mats.sand2, water = mm.mats.water, concrete = mm.mats.concrete;
  worldRoot.add(makeGridFloor(70, 14, '#c8a878', '#a88858'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence();
  addGritFloor(70, 0xc4a878);
  // roofs / platforms
  addBox(worldRoot, -12, 0, -10, 8, 2.2, 8, 0xd4b070, true, sand);
  addBox(worldRoot, 12, 0, 10, 8, 2.2, 8, 0xc4a060, true, sand2 || sand);
  addBox(worldRoot, -12, 0, 12, 6, 3.0, 6, 0xb49050, true, sand);
  addBox(worldRoot, 12, 0, -12, 6, 3.0, 6, 0xb49050, true, sand2 || sand);
  highPoints.push({ x: -12, z: -10, y: 2.2 }, { x: 12, z: 10, y: 2.2 }, { x: -12, z: 12, y: 3 }, { x: 12, z: -12, y: 3 });
  // palm block props
  for (const [x, z] of [[-6, 0], [6, 0], [0, -8], [0, 8]]) {
    addBox(worldRoot, x, 0, z, 0.6, 3.2, 0.6, 0x4a8030, true);
    addBox(worldRoot, x, 3.2, z, 2.4, 0.4, 2.4, 0x6ab040, false);
  }
  // center water pit (slow zone — shallow solid floor slightly lower via visual only)
  if (water) {
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.3, 24), new THREE.MeshLambertMaterial({ map: water, transparent: true, opacity: 0.85 }));
    pit.position.set(0, 0.05, 0); worldRoot.add(pit);
  } else {
    addBox(worldRoot, 0, 0.02, 0, 10, 0.08, 10, 0x4488cc, false);
  }
  defaultSpawns();
  addJumpPad(0, -14, 11);
  socket('hp_s', -8, -8); socket('hp_m', 8, 8); socket('ammo', 8, -8); socket('armor', -8, 8);
  socket('haste', 0, 14); socket('quad', 14, 0); socket('overheal', -14, 0);
}

function buildArenaPlatforms() {
  const hazard = mm.mats.hazard, concrete = mm.mats.concrete;
  worldRoot.add(makeGridFloor(70, 12, '#304060', '#203050'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence(4);
  addGritFloor(70, 0x5a6880);
  // floating pads ring
  const pads = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 14;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const h = 1.5 + (i % 3) * 1.2;
    addBox(worldRoot, x, h, z, 5, 0.5, 5, 0x7ef0ff, true, concrete);
    pads.push({ x, z, y: h + 0.5 });
    highPoints.push({ x, z, y: h + 0.5 });
    if (i % 2 === 0) addJumpPad(x, z, 15);
  }
  addBox(worldRoot, 0, 3.5, 0, 7, 0.5, 7, 0xff6bcb, true, hazard);
  highPoints.push({ x: 0, z: 0, y: 4 });
  addJumpPad(0, 0, 16);
  spawnPoints = pads.map((p) => ({ x: p.x, z: p.z }));
  while (spawnPoints.length < 8) spawnPoints.push({ x: 0, z: 10 });
  socket('hp_s', 5, 5); socket('ammo', -5, -5); socket('quad', 0, 8); socket('haste', 8, 0);
  socket('ghost', -8, 0); socket('armor', 0, -8);
}

function buildArenaNeonAlley() {
  // Original arcade neon alleys — NOT Neon Harbor IP
  const cR = mm.mats.containerR, cB = mm.mats.containerB;
  worldRoot.add(makeGridFloor(70, 16, '#1a1028', '#2a1840'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence(5.5);
  addGritFloor(70, 0x2a1838);
  // parallel alley walls
  for (let z = -18; z <= 18; z += 6) {
    addBox(worldRoot, -8, 0, z, 2.5, 4.5, 5, 0x3a2060, true, cB);
    addBox(worldRoot, 8, 0, z, 2.5, 4.5, 5, 0x602040, true, cR);
  }
  // billboard neon props (emissive boxes)
  for (const [x, y, z, col] of [[-6.5, 3, -9, 0xff6bcb], [6.5, 3, -3, 0x7ef0ff], [-6.5, 3, 3, 0xffe66d], [6.5, 3, 9, 0xff6bcb], [0, 2.5, -14, 0x7ef0ff], [0, 2.5, 14, 0xff6bcb]]) {
    const m = addBox(worldRoot, x, y, z, 3, 1.2, 0.3, col, false);
    m.material = new THREE.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 0.55 });
  }
  // cross lanes
  addBox(worldRoot, 0, 0, 0, 4, 0.15, 36, 0x2a1848, false);
  addBox(worldRoot, -3, 0, -6, 1.5, 1.5, 1.5, 0x444466, true);
  addBox(worldRoot, 3, 0, 6, 1.5, 1.5, 1.5, 0x444466, true);
  spawnPoints = [{ x: 0, z: 12 }, { x: 0, z: -12 }, { x: 0, z: 0 }, { x: -4, z: 4 }, { x: 4, z: -4 }, { x: -4, z: -10 }, { x: 4, z: 10 }, { x: 0, z: 6 }];
  highPoints.push({ x: -8, z: 0, y: 4.5 }, { x: 8, z: 0, y: 4.5 });
  addJumpPad(0, 0, 12);
  socket('hp_s', 0, 8); socket('ammo', 0, -8); socket('armor', -4, 0); socket('quad', 4, 0);
  socket('haste', 0, 16); socket('ghost', 0, -16);
}

function buildArenaDunes() {
  const sand = mm.mats.sand, sand2 = mm.mats.sand2, cY = mm.mats.containerY;
  worldRoot.add(makeGridFloor(70, 12, '#d8b878', '#b89858'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence();
  addGritFloor(70, 0xc8a868);
  // low dunes
  for (const [x, z, w, h, d] of [[-14, -10, 10, 1.4, 8], [12, 8, 12, 1.6, 9], [-8, 14, 9, 1.2, 7], [10, -14, 8, 1.5, 8], [0, 0, 6, 0.8, 6]]) {
    addBox(worldRoot, x, 0, z, w, h, d, 0xc8a868, true, sand || sand2);
  }
  // bunkers + radio tower
  addBox(worldRoot, -16, 0, 4, 5, 2.2, 5, 0x8a8070, true, cY);
  addBox(worldRoot, 16, 0, -4, 5, 2.2, 5, 0x8a8070, true, cY);
  addBox(worldRoot, 0, 0, -18, 2, 8, 2, 0x889098, true); // tower
  addBox(worldRoot, 0, 8, -18, 4, 0.4, 4, 0xd4a017, false); // dish
  highPoints.push({ x: -16, z: 4, y: 2.2 }, { x: 16, z: -4, y: 2.2 }, { x: 0, z: -18, y: 8 });
  defaultSpawns();
  socket('hp_s', 6, 6); socket('ammo', -6, -6); socket('armor', 14, 0); socket('quad', -14, 0);
  socket('haste', 0, 12); socket('hp_m', 0, -8);
}

function buildArenaColiseum() {
  const hazard = mm.mats.hazard, concrete = mm.mats.concrete, cR = mm.mats.containerR;
  worldRoot.add(makeGridFloor(70, 14, '#201828', '#301838'));
  solidBoxes.push(boxSolid(0, -0.5, 0, 70, 0.5, 70));
  addOuterFence(6);
  addGritFloor(70, 0x2a2038);
  // circular pit ring (approx with boxes)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.cos(a) * 16, z = Math.sin(a) * 16;
    addBox(worldRoot, x, 0, z, 4, 2.4, 3, 0x4a3060, true, concrete);
  }
  // gallery balconies
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const x = Math.cos(a) * 20, z = Math.sin(a) * 20;
    addBox(worldRoot, x, 2.4, z, 5, 0.4, 4, 0x7ef0ff, true, hazard);
    highPoints.push({ x, z, y: 2.8 });
  }
  // center boss pad
  addBox(worldRoot, 0, 0, 0, 8, 0.35, 8, 0xff6bcb, true, cR);
  spawnPoints = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    spawnPoints.push({ x: Math.cos(a) * 10, z: Math.sin(a) * 10 });
  }
  addJumpPad(10, 0, 13); addJumpPad(-10, 0, 13);
  socket('hp_m', 8, 8); socket('ammo', -8, -8); socket('armor', 8, -8); socket('quad', -8, 8);
  socket('overheal', 0, 12); socket('haste', 0, -12);
}

function buildArena(mapIndex = 0) {
  if (worldRoot) {
    scene.remove(worldRoot);
    // dispose previous dynamic children lightly — pooled geos/mats kept
  }
  solidBoxes = [];
  spawnPoints = [];
  highPoints = [];
  jumpPads = [];
  pickupSockets = [];
  clearPickups();
  clearBoss();
  worldRoot = new THREE.Group();
  scene.add(worldRoot);
  const map = MAPS[mapIndex] || MAPS[0];
  state.mapIndex = mapIndex;
  state.fragLimit = map.fragLimit;
  applyMapAtmosphere(map);
  const builders = {
    yard: buildArenaYard,
    containers: buildArenaContainers,
    oasis: buildArenaOasis,
    platforms: buildArenaPlatforms,
    'neon-alley': buildArenaNeonAlley,
    dunes: buildArenaDunes,
    'pulse-coliseum': buildArenaColiseum,
  };
  (builders[map.id] || buildArenaYard)();
  addMapMoodBackdrop(map.id);
  if (ENABLE_PICKUPS) spawnPickupsFromSockets();
  if (ENABLE_BOSSES && map.bossId) spawnBoss(map.bossId);
}


function makeBotMesh(skinTex, fallbackColor) {
  const g = new THREE.Group();
  if (skinTex) {
    const img = skinTex.image;
    const aspect = (img && img.width && img.height) ? (img.width / img.height) : (312 / 577);
    const h = 1.85;
    const w = h * aspect;
    const mat = new THREE.MeshBasicMaterial({
      map: skinTex,
      transparent: true,
      alphaTest: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    plane.position.y = h * 0.5;
    // Face local -Z (movement/aim forward) so skins read from the front
    plane.rotation.y = Math.PI;
    plane.name = 'botSkin';
    g.add(plane);
    // thin shadow disc so feet read on sand/concrete
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 12),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    g.add(shadow);
  } else {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.45),
      new THREE.MeshLambertMaterial({ color: fallbackColor }),
    );
    body.position.y = 0.95;
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.45, 0.45),
      new THREE.MeshLambertMaterial({ color: 0xffe0c0 }),
    );
    head.position.y = 1.6;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.3), new THREE.MeshLambertMaterial({ color: 0x333344 }));
    legL.position.set(-0.16, 0.28, 0);
    const legR = legL.clone(); legR.position.x = 0.16;
    g.add(body, head, legL, legR);
  }
  return g;
}

function vmMat(map, color) {
  if (map) {
    return new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      alphaTest: 0.18,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }
  return new THREE.MeshBasicMaterial({
    color: color ?? 0xb8c0cc,
    depthTest: false,
    depthWrite: false,
  });
}

function buildArms() {
  if (!camera) return;
  if (armsRoot) camera.remove(armsRoot);
  armsRoot = new THREE.Group();
  armsRoot.name = 'armsRoot';
  armsRoot.renderOrder = 1000;
  // Keep viewmodel in lower FOV; bob applied later
  armsRoot.position.set(0, -0.02, 0);
  camera.add(armsRoot);

  const sleeveMat = vmMat(mm.armsSleeve, 0xe07020);
  const skinMat = vmMat(mm.armsSkin, 0xffd0a8);

  // Blocky FP arms — always visible under/ beside gun for all 5 weapons
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.62), sleeveMat);
  arm.position.set(0.34, -0.32, -0.42);
  arm.rotation.x = 0.12;
  arm.name = 'armR';
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.2), skinMat);
  hand.position.set(0.34, -0.36, -0.78);
  hand.name = 'handR';
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.5), sleeveMat);
  armL.position.set(-0.18, -0.38, -0.52);
  armL.rotation.x = 0.18;
  armL.rotation.y = -0.1;
  armL.name = 'armL';
  const handL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), skinMat);
  handL.position.set(-0.14, -0.4, -0.82);
  handL.name = 'handL';
  armsRoot.add(arm, hand, armL, handL);

  gunParts = new THREE.Group();
  gunParts.name = 'gunParts';
  gunParts.renderOrder = 1001;
  armsRoot.add(gunParts);
  rebuildGunMesh();

  muzzleFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffee88, depthTest: false, depthWrite: false }),
  );
  muzzleFlash.position.set(0.28, -0.22, -1.05);
  muzzleFlash.visible = false;
  muzzleFlash.renderOrder = 1002;
  armsRoot.add(muzzleFlash);

  // Ensure every mesh draws above world
  armsRoot.traverse((o) => {
    if (o.isMesh) {
      o.renderOrder = 1000;
      if (o.material) {
        o.material.depthTest = false;
        o.material.depthWrite = false;
      }
    }
  });
}

function rebuildGunMesh() {
  if (!gunParts) return;
  while (gunParts.children.length) {
    const c = gunParts.children.pop();
    c.geometry?.dispose?.();
    if (c.material && !c.material.map) c.material.dispose?.();
  }
  // Always show blocky orange arms (W2–5 PASS path). W1 uses flat vm-rifle —
  // never the wide fpCombined plate (mm3 yard-baked slab = Searching opaque FAIL).
  for (const name of ['armR', 'handR', 'armL', 'handL']) {
    const n = armsRoot?.getObjectByName(name);
    if (n) n.visible = true;
  }

  const w = WEAPONS[state.weapon];

  const viewTex = mm.weapons[w.id];
  if (viewTex) {
    const img = viewTex.image;
    const aspect = (img && img.width && img.height) ? (img.width / img.height) : 0.45;
    // Tall vm-* plates (256×720) → keep readable height in lower FOV
    const h = w.melee ? 0.48 : (w.id === 'sniper' ? 0.52 : w.id === 'pistol' ? 0.42 : w.id === 'shotgun' ? 0.5 : 0.48);
    const ww = Math.max(0.22, h * Math.min(aspect, 0.85));
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(ww, h), vmMat(viewTex));
    // Lower-right FOV — must NOT cover half the frame (opaque plate FAIL)
    plane.position.set(0.32, -0.36, -0.78);
    plane.rotation.y = 0.12;
    plane.rotation.x = 0.04;
    plane.name = 'fpWeapon';
    gunParts.add(plane);
    if (muzzleFlash) {
      muzzleFlash.position.set(0.3 + (w.melee ? 0 : ww * 0.15), -0.2, -0.7 - h * 0.05);
    }
    return;
  }

  // Solid fallback if atlas missing
  const mat = vmMat(null, 0xb8c0cc);
  const dark = vmMat(null, 0x222830);
  const accent = vmMat(null, 0xff6bcb);

  if (w.melee) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.28), dark);
    handle.position.set(0.28, -0.3, -0.75);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.42), accent);
    blade.position.set(0.28, -0.26, -1.05);
    gunParts.add(handle, blade);
    return;
  }

  const bodyLen = w.id === 'sniper' ? 0.95 : w.id === 'shotgun' ? 0.7 : w.id === 'pistol' ? 0.38 : 0.72;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, bodyLen), mat);
  body.position.set(0.28, -0.26, -0.7 - bodyLen * 0.12);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.12), dark);
  mag.position.set(0.28, -0.42, -0.68);
  gunParts.add(body, mag);
  if (w.id === 'sniper') {
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.28), dark);
    scope.position.set(0.28, -0.12, -0.85);
    gunParts.add(scope);
  }
  if (w.id === 'shotgun') {
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.22), dark);
    pump.position.set(0.28, -0.34, -0.95);
    gunParts.add(pump);
  }
}


function isSpawnClear(x, z, r = 1.35) {
  for (const b of solidBoxes) {
    if (b.maxY < 0.55) continue;
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    const dx = x - cx, dz = z - cz;
    if (dx * dx + dz * dz < r * r) return false;
  }
  return Math.abs(x) < 23.5 && Math.abs(z) < 23.5;
}

function randomSpawn() {
  for (let i = 0; i < 28; i++) {
    const sp = spawnPoints[Math.floor(Math.random() * spawnPoints.length)] || { x: 0, z: 14 };
    const x = sp.x + (Math.random() - 0.5) * 1.1;
    const z = sp.z + (Math.random() - 0.5) * 1.1;
    if (isSpawnClear(x, z)) return { x, z };
  }
  return { x: 0, z: 14 };
}

function distToFenceInner(x, z) {
  // Distance from point to nearest outer-fence inner face
  return Math.min(FENCE_INNER - Math.abs(x), FENCE_INNER - Math.abs(z));
}

/** True when eye is far enough from fence that 75° FOV still shows sky above lattice. */
function fenceViewClear(x, z) {
  return distToFenceInner(x, z) >= MIN_FENCE_VIEW_CLEAR - 0.05;
}

function pushAwayFromFence(x, z) {
  // Soft radial push if somehow past ARENA_BOUND toward lattice
  const lim = ARENA_BOUND;
  if (Math.abs(x) > lim) x = Math.sign(x) * lim;
  if (Math.abs(z) > lim) z = Math.sign(z) * lim;
  // Corner: also shrink to inscribed square so corner diagonal isn't closer to lattice
  const cornerLim = lim * 0.92;
  if (Math.abs(x) > cornerLim && Math.abs(z) > cornerLim) {
    const ax = Math.abs(x), az = Math.abs(z);
    if (ax >= az) x = Math.sign(x) * cornerLim;
    else z = Math.sign(z) * cornerLim;
  }
  return { x, z };
}

function nudgeEyeOutOfSolids(x, y, z, pad = CAM_SOLID_PAD) {

  // Expanded-AABB nearest-face push (handles deep embed; FOV never inside geometry)
  for (let iter = 0; iter < 6; iter++) {
    let pushed = false;
    for (const b of solidBoxes) {
      if (b.maxY < 0.35) continue;
      if (y < b.minY - 0.05 || y > b.maxY + 0.05) continue;
      const minX = b.minX - pad, maxX = b.maxX + pad;
      const minZ = b.minZ - pad, maxZ = b.maxZ + pad;
      if (x <= minX || x >= maxX || z <= minZ || z >= maxZ) continue;
      const dl = x - minX, dr = maxX - x, db = z - minZ, dt = maxZ - z;
      const m = Math.min(dl, dr, db, dt);
      if (m === dl) x = minX;
      else if (m === dr) x = maxX;
      else if (m === db) z = minZ;
      else z = maxZ;
      pushed = true;
    }
    if (!pushed) break;
  }
  const p = pushAwayFromFence(x, z);
  return { x: p.x, y, z: p.z };
}


function bodyYRange(y = state.y) {
  const live = eyeHeight();
  const top = y + 0.12;
  const bottom = y - live + 0.12;
  return { bottom, top };
}

/** True if point is inside any non-floor solid (camera/body embed check). */
function pointInSolid(x, y, z, pad = 0.02) {
  for (const b of solidBoxes) {
    if (b.maxY < 0.4) continue;
    if (y < b.minY - pad || y > b.maxY + pad) continue;
    if (x >= b.minX - pad && x <= b.maxX + pad && z >= b.minZ - pad && z <= b.maxZ + pad) return true;
  }
  return false;
}

/**
 * Nearest-face push out of expanded AABB. Fixes deep embed (circle vs AABB
 * fails when center is inside the box — the sprint/slide fence FAIL).
 */
function collideXZ(x, z, y = state.y, r = PLAYER_RADIUS) {
  let nx = x, nz = z;
  const { bottom, top } = bodyYRange(y);
  for (let iter = 0; iter < 5; iter++) {
    let hit = false;
    for (const b of solidBoxes) {
      if (b.maxY < 0.4) continue; // skip floor
      // no vertical overlap with body capsule
      if (top < b.minY + 0.02 || bottom > b.maxY - 0.05) continue;
      // standing on top of this box — skip side push
      if (bottom >= b.maxY - 0.22) continue;
      const minX = b.minX - r, maxX = b.maxX + r;
      const minZ = b.minZ - r, maxZ = b.maxZ + r;
      if (nx <= minX || nx >= maxX || nz <= minZ || nz >= maxZ) continue;
      const dl = nx - minX, dr = maxX - nx, db = nz - minZ, dt = maxZ - nz;
      const m = Math.min(dl, dr, db, dt);
      if (m === dl) nx = minX;
      else if (m === dr) nx = maxX;
      else if (m === db) nz = minZ;
      else nz = maxZ;
      hit = true;
    }
    if (!hit) break;
  }
  const p = pushAwayFromFence(nx, nz);
  return { x: p.x, z: p.z };
}

function eyeHeight() {
  return state.crouching || state.sliding ? CROUCH_HEIGHT : PLAYER_HEIGHT;
}

function applyPlayerPhysics(dt) {
  const wish = { x: 0, z: 0 };
  if (keys.KeyW || keys.ArrowUp) wish.z -= 1;
  if (keys.KeyS || keys.ArrowDown) wish.z += 1;
  if (keys.KeyA || keys.ArrowLeft) wish.x -= 1;
  if (keys.KeyD || keys.ArrowRight) wish.x += 1;

  const crouchHeld = !!(keys.KeyC || keys.ShiftLeft || keys.ShiftRight || keys.ControlLeft);
  state.crouching = crouchHeld && state.onGround && !state.sliding;

  const speedXZ = Math.hypot(state.vx, state.vz);
  // Slide: Shift/C while moving fast
  if (crouchHeld && state.onGround && speedXZ > 5.5 && !state.sliding) {
    state.sliding = true;
    state.slideT = SLIDE_DURATION;
    SFX.slideStart();
    // Snap eye to crouch height so feet don't appear airborne (which used to
    // clear sliding next frame and break slide probes / near-wall slides).
    state.y = CROUCH_HEIGHT;
    if (speedXZ > 0.1) {
      state.vx = (state.vx / speedXZ) * MOVE_SPEED * SLIDE_BOOST;
      state.vz = (state.vz / speedXZ) * MOVE_SPEED * SLIDE_BOOST;
    } else {
      state.vx = -Math.sin(yaw) * MOVE_SPEED * SLIDE_BOOST;
      state.vz = -Math.cos(yaw) * MOVE_SPEED * SLIDE_BOOST;
    }
  }
  if (state.sliding) {
    state.slideT -= dt;
    // Only cancel early if jump-launched; brief air from eye-height snap must not kill slide
    if (state.slideT <= 0 || !crouchHeld || (state.vy > 2)) state.sliding = false;
  }

  const wpn = WEAPONS[state.weapon];
  let targetSpeed = MOVE_SPEED * (state.speedMul || 1) * (state.ads ? 0.72 : 1) * (wpn.id === 'sniper' ? 0.88 : 1);
  if (state.crouching) targetSpeed *= 0.55;
  if (state.sliding) {
    const edge = distToFenceInner(state.x, state.z);
    const edgeMul = edge < MIN_FENCE_VIEW_CLEAR + 2 ? Math.max(0.35, (edge - 2) / (MIN_FENCE_VIEW_CLEAR)) : 1;
    targetSpeed = MOVE_SPEED * SLIDE_BOOST * edgeMul;
  }

  if (wish.x || wish.z) {
    const len = Math.hypot(wish.x, wish.z) || 1;
    wish.x /= len; wish.z /= len;
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    const wx = wish.x * cy + wish.z * sy;
    const wz = -wish.x * sy + wish.z * cy;
    const accel = state.onGround ? 40 : 12;
    state.vx += wx * accel * dt;
    state.vz += wz * accel * dt;
  } else if (state.onGround && !state.sliding) {
    state.vx *= Math.pow(0.01, dt);
    state.vz *= Math.pow(0.01, dt);
  } else {
    state.vx *= Math.pow(0.25, dt);
    state.vz *= Math.pow(0.25, dt);
  }

  const maxSp = state.sliding ? MOVE_SPEED * SLIDE_BOOST * 1.05 : (state.onGround ? targetSpeed : targetSpeed * 1.12);
  const sp = Math.hypot(state.vx, state.vz);
  if (sp > maxSp) {
    state.vx = (state.vx / sp) * maxSp;
    state.vz = (state.vz / sp) * maxSp;
  }

  if (keys.Space && state.onGround) {
    state.vy = JUMP_V;
    state.onGround = false;
    SFX.jump();
    if (crouchHeld) {
      state.vx += -Math.sin(yaw) * 2.2;
      state.vz += -Math.cos(yaw) * 2.2;
    }
    keys.Space = false;
  }

  state.vy -= GRAVITY * dt;
  state.y += state.vy * dt;

  const eh = eyeHeight();
  const feet = state.y - eh;
  let landY = 0;
  for (const b of solidBoxes) {
    if (state.x > b.minX && state.x < b.maxX && state.z > b.minZ && state.z < b.maxZ) {
      if (feet <= b.maxY + 0.15 && feet >= b.maxY - 0.55 && state.vy <= 0) {
        landY = Math.max(landY, b.maxY);
      }
    }
  }
  if (feet <= landY && state.vy <= 0) {
    state.y = landY + eh;
    state.vy = 0;
    state.onGround = true;
  } else {
    state.onGround = false;
  }

  // Sub-step XZ so slide/sprint cannot tunnel into thin fence/containers
  const stepDist = Math.hypot(state.vx * dt, state.vz * dt);
  const steps = Math.max(1, Math.min(10, Math.ceil(stepDist / 0.22)));
  const sdt = dt / steps;
  for (let i = 0; i < steps; i++) {
    const ix = state.x + state.vx * sdt;
    const iz = state.z + state.vz * sdt;
    const moved = collideXZ(ix, iz, state.y, PLAYER_RADIUS);
    // Only kill the blocked axis when we actually tried to enter a solid
    if (moved.x !== ix && Math.sign(state.vx) === Math.sign(ix - moved.x)) state.vx = 0;
    if (moved.z !== iz && Math.sign(state.vz) === Math.sign(iz - moved.z)) state.vz = 0;
    state.x = moved.x;
    state.z = moved.z;
  }
}

function dirFromAngles(y, p) {
  const cp = Math.cos(p);
  return { dx: -Math.sin(y) * cp, dy: Math.sin(p), dz: -Math.cos(y) * cp };
}

function rayHitsWall(ox, oy, oz, dx, dy, dz, maxDist) {
  const steps = Math.max(4, Math.ceil(maxDist / 0.45));
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * maxDist;
    const px = ox + dx * t, py = oy + dy * t, pz = oz + dz * t;
    for (const box of solidBoxes) {
      if (box.maxY < 0.3) continue;
      if (px >= box.minX && px <= box.maxX && py >= box.minY && py <= box.maxY && pz >= box.minZ && pz <= box.maxZ) {
        return t;
      }
    }
  }
  return null;
}



function clearBoss() {
  if (boss && boss.mesh) scene.remove(boss.mesh);
  boss = null;
  state.bossAlive = false;
}

function makeBossMesh(def) {
  const g = new THREE.Group();
  const skin = mm.bossSkins[def.id];
  if (skin) {
    const h = 2.8 * (def.scale / 2.5);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(h * 0.7, h),
      new THREE.MeshBasicMaterial({ map: skin, transparent: true, alphaTest: 0.12, side: THREE.DoubleSide, depthWrite: false }),
    );
    plane.position.y = h * 0.5;
    plane.rotation.y = Math.PI;
    g.add(plane);
  }
  const body = new THREE.Mesh(pooledBox(1.6 * def.scale / 2.5, 2.2 * def.scale / 2.5, 1.2 * def.scale / 2.5), pooledMat(def.color));
  body.position.y = 1.2 * def.scale / 2.5;
  g.add(body);
  // weak-point glow cubes
  const wpMat = new THREE.MeshLambertMaterial({ color: 0xffe66d, emissive: 0xffaa00, emissiveIntensity: 0.8 });
  const wp1 = new THREE.Mesh(pooledBox(0.45, 0.45, 0.45), wpMat);
  wp1.position.set(-0.9 * def.scale / 2.5, 2.0 * def.scale / 2.5, 0.3);
  wp1.name = 'weak';
  const wp2 = wp1.clone(); wp2.position.x *= -1;
  g.add(wp1, wp2);
  // telegraph ring (hidden)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 3.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xff2244, transparent: true, opacity: 0.0, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.08; ring.name = 'telegraph';
  g.add(ring);
  return g;
}

function spawnBoss(bossId) {
  clearBoss();
  const def = BOSSES[bossId];
  if (!def) return;
  const mesh = makeBossMesh(def);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);
  boss = {
    ...def,
    x: 0, y: 1.8 * def.scale / 2.5, z: 0,
    hp: def.hp, maxHp: def.hp, alive: true, mesh,
    attackCd: 2.5, telegraphT: 0, phase: 0, aimYaw: 0,
    weakMul: 2,
  };
  state.bossAlive = true;
  SFX.boss_intro();
  feedKill(`⚠ ${def.nameZh} · ${def.nameEn}`);
  syncBossHud();
}

function clearPickups() {
  for (const p of pickups) { if (p.mesh) scene.remove(p.mesh); }
  pickups = [];
}

function makePickupMesh(def) {
  const g = new THREE.Group();
  const icon = mm.pickupIcons[def.id];
  if (icon) {
    const pl = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.85),
      new THREE.MeshBasicMaterial({ map: icon, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    );
    pl.position.y = 0.55; g.add(pl);
  }
  const cube = new THREE.Mesh(pooledBox(0.7, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 0.35 }));
  cube.position.y = 0.45;
  g.add(cube);
  return g;
}

/** If a pickup socket sits inside a solid volume (container / crate), push XZ to nearest face. */
function nudgePickupOutOfSolids(x, z, y = 0.6, pad = 0.85) {
  for (let iter = 0; iter < 8; iter++) {
    let pushed = false;
    for (const b of solidBoxes) {
      if (b.maxY < 0.4) continue; // floor
      if (y < b.minY || y > b.maxY) continue;
      if (x <= b.minX || x >= b.maxX || z <= b.minZ || z >= b.maxZ) continue;
      const dl = x - b.minX, dr = b.maxX - x, db = z - b.minZ, dt = b.maxZ - z;
      const m = Math.min(dl, dr, db, dt);
      if (m === dl) x = b.minX - pad;
      else if (m === dr) x = b.maxX + pad;
      else if (m === db) z = b.minZ - pad;
      else z = b.maxZ + pad;
      pushed = true;
    }
    if (!pushed) break;
  }
  return { x, z };
}

function spawnPickupsFromSockets() {
  clearPickups();
  for (const s of pickupSockets) {
    const def = PICKUP_DEFS[s.type];
    if (!def) continue;
    const nz = nudgePickupOutOfSolids(s.x, s.z, s.y || 0.6);
    const mesh = makePickupMesh(def);
    mesh.position.set(nz.x, 0, nz.z);
    scene.add(mesh);
    pickups.push({ ...def, x: nz.x, y: s.y || 0.6, z: nz.z, mesh, alive: true, respawnT: 0 });
  }
}

function applyPower(power, duration) {
  if (state.power && state.powerT > 0) SFX.power_end();
  state.power = power;
  state.powerT = duration;
  state.dmgMul = power === 'quad' ? 2 : 1;
  state.speedMul = power === 'haste' ? 1.35 : 1;
  state.ghost = power === 'ghost';
  SFX.pickup_power();
  syncBuffHud();
}

function grabPickup(p) {
  if (!p.alive) return;
  p.alive = false;
  p.mesh.visible = false;
  p.respawnT = p.respawn || 25;
  if (p.kind === 'heal') {
    // Always feedKill even at full HP so smoke / players see feedback
    state.hp = Math.min(100, state.hp + (p.amount || 25));
    SFX.pickup_hp();
  } else if (p.kind === 'armor') {
    state.armor = Math.min(100, state.armor + (p.amount || 50));
    SFX.pickup_armor();
  } else if (p.kind === 'ammo') {
    const w = WEAPONS[state.weapon];
    if (!w.melee) {
      state.reserve += w.mag;
      saveWeaponBag();
    }
    SFX.pickup_ammo();
  } else if (p.kind === 'power') {
    applyPower(p.power, p.duration || 10);
  } else if (p.kind === 'overheal') {
    state.hp = p.amount || 150;
    SFX.pickup_power();
  }
  feedKill(`＋ ${p.nameZh}`);
  syncBuffHud();
  syncHud();
}

function updatePickups(dt) {
  if (!ENABLE_PICKUPS) return;
  for (const p of pickups) {
    if (!p.alive) {
      p.respawnT -= dt;
      if (p.respawnT <= 0) {
        p.alive = true; p.mesh.visible = true;
      }
      continue;
    }
    p.mesh.rotation.y += dt * 2.2;
    p.mesh.position.y = 0.15 + Math.sin(performance.now() * 0.004 + p.x) * 0.12;
    const d2 = (p.x - state.x) ** 2 + (p.z - state.z) ** 2;
    if (d2 < PICKUP_GRAB_R * PICKUP_GRAB_R) grabPickup(p);
  }
}

function updateJumpPads() {
  for (const jp of jumpPads) {
    const d2 = (jp.x - state.x) ** 2 + (jp.z - state.z) ** 2;
    if (d2 < jp.r * jp.r && state.onGround) {
      state.vy = jp.vy;
      state.onGround = false;
      SFX.jump();
    }
  }
}

function updatePowers(dt) {
  if (state.power && state.powerT > 0) {
    state.powerT -= dt;
    if (state.powerT <= 0) {
      state.power = null; state.dmgMul = 1; state.speedMul = 1; state.ghost = false;
      SFX.power_end();
    }
  }
  if (state.hp > 100) {
    state.hp = Math.max(100, state.hp - 5 * dt);
  }
  // slide loop manage
  if (state.sliding && !_wasSliding) SFX.slideStart();
  if (!state.sliding && _wasSliding) SFX.slideStop();
  _wasSliding = state.sliding;
  if (state.onGround && !_wasOnGround) SFX.land();
  _wasOnGround = state.onGround;
}

function botSkinFor(arch) {
  if (arch.tag <= 'D' || arch.skinIndex < 4) return mm.botSkins[arch.skinIndex % Math.max(1, mm.botSkins.length)] || null;
  return mm.expandBotSkins[arch.tag] || null;
}

function pickArchetypes(count, mapId) {
  const pool = ARCHETYPES.slice();
  // map affinity weights
  let prefer = [];
  if (mapId === 'dunes') prefer = ['D', 'H', 'F'];
  else if (mapId === 'platforms') prefer = ['G', 'E', 'H'];
  else if (mapId === 'containers') prefer = ['E', 'F', 'A'];
  else if (mapId === 'neon-alley') prefer = ['E', 'G', 'I'];
  else if (mapId === 'pulse-coliseum') prefer = ['F', 'J', 'C'];
  const out = [];
  let tanks = 0;
  for (let i = 0; i < count; i++) {
    let arch;
    if (i < prefer.length) arch = pool.find((a) => a.tag === prefer[i]) || pool[i % pool.length];
    else arch = pool[Math.floor(Math.random() * pool.length)];
    if ((arch.tag === 'F' || arch.tag === 'J') && tanks >= 2) {
      arch = pool.find((a) => a.tag !== 'F' && a.tag !== 'J') || arch;
    }
    if (arch.tag === 'F' || arch.tag === 'J') tanks++;
    out.push(arch);
  }
  // guarantee ≥1 new archetype E+ when count>=4
  if (count >= 4 && !out.some((a) => a.tag >= 'E')) out[out.length - 1] = ARCHETYPES[4];
  return out;
}

function spawnBots() {
  for (const b of bots) { if (b.mesh) scene.remove(b.mesh); }
  bots = [];
  const map = currentMap();
  const count = map.botCount || 5;
  const archs = pickArchetypes(count, map.id);
  for (let i = 0; i < count; i++) {
    const arch = archs[i];
    const sp = randomSpawn();
    const skin = botSkinFor(arch);
    const mesh = makeBotMesh(skin, arch.color);
    mesh.scale.setScalar(arch.scale || 1);
    mesh.position.set(sp.x, 0, sp.z);
    scene.add(mesh);
    // shield prop for J
    if (arch.frontalShield) {
      const sh = new THREE.Mesh(pooledBox(0.15, 1.2, 0.9), new THREE.MeshLambertMaterial({ color: 0x4488ff, transparent: true, opacity: 0.55, emissive: 0x2266ff, emissiveIntensity: 0.4 }));
      sh.position.set(0, 1.0, 0.45); sh.name = 'shield';
      mesh.add(sh);
    }
    bots.push({
      id: i, arch, tag: arch.tag, name: arch.nameZh, role: arch.role,
      x: sp.x, y: 1.65, z: sp.z, vx: 0, vz: 0, vy: 0,
      hp: arch.hp, maxHp: arch.hp, alive: true, kills: 0, deaths: 0,
      mesh, shootCd: 0.4 + Math.random(), aimYaw: Math.random() * Math.PI * 2,
      thinkT: Math.random() * 0.4, target: null, respawnT: 0, onGround: true,
      shieldHp: arch.frontalShield ? 80 : 0, healCd: 0, flashCd: 0, slideT: 0,
      dying: false, deathT: 0, deathDur: 0.55, deathSign: 1,
      nestAnchor: arch.role === 'nest' ? (highPoints[i % Math.max(1, highPoints.length)] || sp) : null,
    });
  }
}



function damageBot(bot, dmg, fromPlayer, isWeak = false) {
  if (!bot.alive || bot.dying) return;
  let d = dmg * (fromPlayer ? (state.dmgMul || 1) : 1);
  let hitArmor = false;
  // frontal shield J
  if (bot.shieldHp > 0 && fromPlayer) {
    const fx = -Math.sin(bot.aimYaw), fz = -Math.cos(bot.aimYaw);
    const dx = state.x - bot.x, dz = state.z - bot.z;
    const inv = 1 / (Math.hypot(dx, dz) || 1);
    if (fx * dx * inv + fz * dz * inv > 0.25) {
      bot.shieldHp -= d;
      d *= 0.5;
      hitArmor = true;
      if (bot.shieldHp <= 0) {
        bot.shieldHp = 0;
        const sh = bot.mesh.getObjectByName('shield');
        if (sh) sh.visible = false;
      }
    }
  }
  bot.hp -= d;
  flashHit();
  if (fromPlayer) {
    if (hitArmor) SFX.hitArmor();
    else SFX.hit();
  }
  // eng blood spheres + mm6-realism spark/spray sprites
  const hitY = 1.05 + Math.random() * 0.35;
  spawnBloodBurst(bot.x, hitY, bot.z, hitArmor ? 6 : 11, hitArmor ? 0.7 : 1);
  spawnHitFx(bot.x, hitY, bot.z, hitArmor);
  if (bot.hp <= 0) {
    bot.alive = false;
    bot.dying = true;
    bot.deathDur = 0.45 + Math.random() * 0.3;
    bot.deathT = bot.deathDur;
    bot.deathSign = Math.random() < 0.5 ? 1 : -1;
    bot.deaths += 1;
    bot.respawnT = 2.6;
    bot.mesh.visible = true;
    bot.vx = bot.vz = 0;
    spawnBloodBurst(bot.x, 1.2, bot.z, 16, 1.35);
    spawnKillFx(bot.x, 1.15, bot.z, bot.arch?.scale || 1);
    SFX.death();
    if (fromPlayer) {
      state.kills += 1;
      state.streak += 1;
      applyStreakBonus();
      feedKill(`你 擊殺了 ${bot.name}`);
      if (state.kills >= state.fragLimit) endMatch(true);
    }
    markHud();
    syncHud();
  }
}

function applyStreakBonus() {
  if (state.streak === 3) {
    const w = WEAPONS[state.weapon];
    if (!w.melee) { state.reserve += w.mag; saveWeaponBag(); }
    feedKill('連殺×3 彈藥補給');
    SFX.pickup_ammo();
  } else if (state.streak === 5) {
    state.armor = Math.min(100, state.armor + 50);
    feedKill('連殺×5 護甲');
    SFX.pickup_armor();
  } else if (state.streak === 7) {
    applyPower('quad', 8);
    feedKill('連殺×7 四倍脈衝');
  } else if (state.streak === 10) {
    state.hp = 150;
    feedKill('連殺×10 過載心');
    SFX.pickup_power();
  }
}

function damageBoss(dmg, weak) {
  if (!boss || !boss.alive) return;
  const mul = weak ? boss.weakMul : 1;
  boss.hp -= dmg * (state.dmgMul || 1) * mul;
  flashHit();
  SFX.hit();
  SFX.boss_hurt();
  const bossHitY = 1.4 * (boss.scale || 1);
  spawnBloodBurst(boss.x, bossHitY, boss.z, 14, 1.4);
  spawnHitFx(boss.x, bossHitY, boss.z, false);
  syncBossHud();
  if (boss.hp <= 0) {
    boss.alive = false;
    state.bossAlive = false;
    boss.dying = true;
    boss.deathDur = 0.7;
    boss.deathT = boss.deathDur;
    boss.deathSign = 1;
    boss.mesh.visible = true;
    spawnBloodBurst(boss.x, 1.6 * (boss.scale || 1), boss.z, 22, 1.8);
    spawnKillFx(boss.x, 1.5 * (boss.scale || 1), boss.z, boss.scale || 1.4);
    state.kills += boss.scoreBonus || 5;
    SFX.death();
    SFX.boss_death();
    feedKill(`✔ 擊敗 ${boss.nameZh}`);
    // loot rain
    if (ENABLE_PICKUPS) {
      for (const t of ['hp_m', 'quad', 'armor', 'ammo']) {
        const def = PICKUP_DEFS[t];
        const mesh = makePickupMesh(def);
        const ang = Math.random() * Math.PI * 2;
        const x = boss.x + Math.cos(ang) * 3, z = boss.z + Math.sin(ang) * 3;
        mesh.position.set(x, 0, z);
        scene.add(mesh);
        pickups.push({ ...def, x, y: 0.6, z, mesh, alive: true, respawnT: 9999 });
      }
    }
    syncHud();
    const map = currentMap();
    if (map.mode === 'boss') endMatch(true);
    else if (state.kills >= state.fragLimit) endMatch(true);
  }
  // phase adds
  const pct = boss.hp / boss.maxHp;
  if (boss.id === 'Boss_ContainerTitan' && boss.phase === 0 && pct < 0.66) {
    boss.phase = 1;
    // summon 2 flankers
    for (let i = 0; i < 2; i++) {
      const arch = ARCHETYPES[4]; // E
      const sp = randomSpawn();
      const mesh = makeBotMesh(botSkinFor(arch), arch.color);
      mesh.position.set(sp.x, 0, sp.z); scene.add(mesh);
      bots.push({
        id: bots.length, arch, tag: 'E', name: arch.nameZh, role: 'flanker',
        x: sp.x, y: 1.65, z: sp.z, vx: 0, vz: 0, vy: 0,
        hp: arch.hp, maxHp: arch.hp, alive: true, kills: 0, deaths: 0,
        mesh, shootCd: 0.3, aimYaw: 0, thinkT: 0, target: 'player', respawnT: 0, onGround: true,
        shieldHp: 0, healCd: 0, flashCd: 0, slideT: 0, dying: false, deathT: 0, deathDur: 0.55, deathSign: 1, nestAnchor: null,
      });
    }
    feedKill('貨櫃巨擘召喚游擊單位');
  }
}

function damagePlayer(dmg, byName) {
  if (state.invuln > 0 || matchOver) return;
  let d = dmg;
  if (state.armor > 0) {
    const absorb = Math.min(state.armor, d * 0.5);
    state.armor -= absorb;
    d -= absorb;
  }
  state.hp -= d;
  flashDmg();
  syncHud();
  if (state.hp <= 0) {
    state.deaths += 1;
    state.streak = 0;
    state.hp = 100;
    state.armor = 0;
    const killer = bots.find((b) => b.name === byName);
    if (killer) killer.kills += 1;
    feedKill(`${byName || 'BOT'} 擊殺了 你`);
    SFX.death();
    respawnPlayer();
    syncHud();
  }
}

function respawnPlayer() {
  const sp = randomSpawn();
  state.x = sp.x; state.y = eyeHeight(); state.z = sp.z;
  state.vx = state.vz = state.vy = 0;
  state.hp = Math.max(state.hp, 100);
  if (state.hp > 100) state.hp = 100;
  state.invuln = 1.4;
  state.sliding = false;
  SFX.slideStop();
  resetWeaponBags();
  loadWeaponBag(state.weapon);
  state.reloading = false;
  state.reloadT = 0;
  state.shootCd = 0;
  syncHud();
}

function resetWeaponBags() {
  weaponBags = WEAPONS.map((w) => ({ ammo: w.melee ? 1 : w.mag, reserve: w.reserve }));
}

function saveWeaponBag() {
  const i = state.weapon;
  if (i < 0 || i >= WEAPONS.length) return;
  weaponBags[i] = { ammo: state.ammo, reserve: state.reserve };
}

function loadWeaponBag(idx) {
  const w = WEAPONS[idx];
  const bag = weaponBags[idx] || { ammo: w.melee ? 1 : w.mag, reserve: w.reserve };
  state.ammo = w.melee ? 1 : bag.ammo;
  state.reserve = bag.reserve;
}

/** Instant firearm/melee switch — no blocking swap anim; tiny flash only. */
function switchWeapon(idx, opts = {}) {
  if (idx < 0 || idx >= WEAPONS.length) return false;
  if (idx === state.weapon && !opts.force) return false;
  saveWeaponBag();
  state.weapon = idx;
  loadWeaponBag(idx);
  state.reloading = false;
  state.reloadT = 0;
  // Drop prior RoF gate so sniper→AR is fire-ready immediately (instant switch gate).
  state.shootCd = 0;
  state.switchFlashT = 0.06;
  state.recoilKick = Math.min(state.recoilKick, 0.02);
  if (flashOverlay) {
    flashOverlay.style.background = '#7ef0ff';
    flashOverlay.style.opacity = '0.18';
    setTimeout(() => {
      if (flashOverlay) {
        flashOverlay.style.opacity = '0';
        flashOverlay.style.background = '#fff';
      }
    }, 45);
  }
  rebuildGunMesh();
  syncHud();
  return true;
}

function cycleWeapon(dir) {
  const n = WEAPONS.length;
  switchWeapon((state.weapon + dir + n) % n);
}

function startReload() {
  const w = WEAPONS[state.weapon];
  if (w.melee || state.reloading || state.ammo >= w.mag || state.reserve <= 0) return;
  state.reloading = true;
  state.reloadT = w.reload;
  SFX.reload();
}

function tryShoot(dt) {
  const w = WEAPONS[state.weapon];
  state.shootCd = Math.max(0, state.shootCd - dt);
  if (state.reloading) {
    state.reloadT -= dt;
    if (state.reloadT <= 0) {
      if (w.melee) state.ammo = 1;
      else {
        const need = w.mag - state.ammo;
        const take = Math.min(need, state.reserve);
        state.ammo += take; state.reserve -= take;
      }
      state.reloading = false;
      syncHud();
    }
    return;
  }
  const firing = !!(keys.Mouse0);
  if (!firing || state.shootCd > 0) {
    if (firing && !w.melee && state.ammo <= 0) startReload();
    return;
  }
  if (!w.melee && state.ammo <= 0) { startReload(); return; }
  if (!w.melee) { state.ammo -= 1; markHud(); syncHud(); }
  state.shootCd = 1 / w.firerate;
  SFX.shoot();
  const kick = (w.recoil || 0.02) * (state.ads ? 0.55 : 1);
  state.recoilKick = Math.min(0.14, state.recoilKick + kick);
  pitch = Math.max(-1.4, Math.min(1.4, pitch + kick * 0.65));
  if (muzzleFlash && !w.melee) {
    muzzleFlash.visible = true;
    setTimeout(() => { if (muzzleFlash) muzzleFlash.visible = false; }, 35);
  }
  const eye = { x: state.x, y: state.y, z: state.z };
  const { dx, dy, dz } = dirFromAngles(yaw, pitch);
  const maxRange = w.melee ? (w.range || 2.5) : 130;
  const spread = state.ads ? (w.adsSpread ?? w.spread * 0.35) : w.spread;

  if (w.melee) {
    const cone = w.cone || 0.7;
    for (const b of bots) {
      if (!b.alive) continue;
      const bx = b.x - eye.x, by = (b.y - 0.4) - eye.y, bz = b.z - eye.z;
      const dist = Math.hypot(bx, by, bz);
      if (dist > maxRange || dist < 0.1) continue;
      const inv = 1 / dist;
      const dot = bx * inv * dx + by * inv * dy + bz * inv * dz;
      if (dot < Math.cos(cone)) continue;
      if (rayHitsWall(eye.x, eye.y, eye.z, bx * inv, by * inv, bz * inv, dist - 0.2)) continue;
      damageBot(b, w.damage, true);
    }
    if (boss && boss.alive) {
      const bx = boss.x - eye.x, by = boss.y - eye.y, bz = boss.z - eye.z;
      const dist = Math.hypot(bx, by, bz);
      if (dist < maxRange + 1) damageBoss(w.damage, true);
    }
    return;
  }

  for (let p = 0; p < w.pellets; p++) {
    const sx = dx + (Math.random() - 0.5) * spread * 2;
    const sy = dy + (Math.random() - 0.5) * spread * 2;
    const sz = dz + (Math.random() - 0.5) * spread * 2;
    const inv = 1 / (Math.hypot(sx, sy, sz) || 1);
    const rdx = sx * inv, rdy = sy * inv, rdz = sz * inv;
    let best = null, bestDist = maxRange, bestWeak = false;
    for (const b of bots) {
      if (!b.alive) continue;
      const ocx = eye.x - b.x, ocy = eye.y - (b.y - 0.45), ocz = eye.z - b.z;
      const bdot = ocx * rdx + ocy * rdy + ocz * rdz;
      const c = ocx * ocx + ocy * ocy + ocz * ocz - 0.55 * 0.55;
      const disc = bdot * bdot - c;
      if (disc < 0) continue;
      const t = -bdot - Math.sqrt(disc);
      if (t > 0.05 && t < bestDist) { bestDist = t; best = b; bestWeak = false; }
    }
    // boss sphere + weak bias if aiming high
    if (boss && boss.alive) {
      const ocx = eye.x - boss.x, ocy = eye.y - boss.y, ocz = eye.z - boss.z;
      const rad = 1.1 * boss.scale / 2.5;
      const bdot = ocx * rdx + ocy * rdy + ocz * rdz;
      const c = ocx * ocx + ocy * ocy + ocz * ocz - rad * rad;
      const disc = bdot * bdot - c;
      if (disc >= 0) {
        const t = -bdot - Math.sqrt(disc);
        if (t > 0.05 && t < bestDist) {
          bestDist = t; best = null;
          const hitY = eye.y + rdy * t;
          bestWeak = hitY > boss.y + 0.6;
          // mark as boss hit via sentinel
          const wallT = rayHitsWall(eye.x, eye.y, eye.z, rdx, rdy, rdz, bestDist);
          if (!(wallT !== null && wallT < bestDist)) {
            damageBoss(w.damage, bestWeak);
            bulletTraces.push({ x0: eye.x, y0: eye.y, z0: eye.z, x1: boss.x, y1: boss.y, z1: boss.z, t: 0.06 });
            if (bulletTraces.length > MAX_TRACES) bulletTraces.shift();
            continue;
          }
        }
      }
    }
    const wallT = rayHitsWall(eye.x, eye.y, eye.z, rdx, rdy, rdz, bestDist);
    if (wallT !== null && wallT < bestDist) {
      bulletTraces.push({ x0: eye.x, y0: eye.y, z0: eye.z, x1: eye.x + rdx * wallT, y1: eye.y + rdy * wallT, z1: eye.z + rdz * wallT, t: 0.08 });
      if (bulletTraces.length > MAX_TRACES) bulletTraces.shift();
      continue;
    }
    if (best) {
      damageBot(best, w.damage, true);
      bulletTraces.push({ x0: eye.x, y0: eye.y, z0: eye.z, x1: best.x, y1: best.y - 0.4, z1: best.z, t: 0.06 });
    } else {
      bulletTraces.push({ x0: eye.x, y0: eye.y, z0: eye.z, x1: eye.x + rdx * Math.min(40, maxRange), y1: eye.y + rdy * Math.min(40, maxRange), z1: eye.z + rdz * Math.min(40, maxRange), t: 0.05 });
    }
    if (bulletTraces.length > MAX_TRACES) bulletTraces.shift();
  }
}

function updateBots(dt) {
  _aiTick++;
  for (let bi = 0; bi < bots.length; bi++) {
    const b = bots[bi];
    // stagger AI think across frames
    const doThink = ((_aiTick + bi) % 2) === 0;
    if (!b.alive) {
      // tip-over death anim then hide; respawn after timer
      if (b.dying) {
        b.deathT -= dt;
        const t = 1 - Math.max(0, b.deathT) / (b.deathDur || 0.55);
        const ease = t * t * (3 - 2 * t);
        b.mesh.rotation.x = ease * (Math.PI * 0.5) * (b.deathSign || 1);
        b.mesh.position.y = Math.sin(ease * Math.PI) * 0.12;
        b.mesh.visible = true;
        if (b.deathT <= 0) {
          b.dying = false;
          b.mesh.visible = false;
          b.mesh.rotation.x = 0;
          b.mesh.position.y = 0;
        }
      }
      b.respawnT -= dt;
      if (b.respawnT <= 0) {
        const sp = randomSpawn();
        b.x = sp.x; b.z = sp.z; b.y = 1.65;
        b.hp = b.maxHp; b.alive = true; b.dying = false;
        b.shieldHp = b.arch.frontalShield ? 80 : 0;
        b.mesh.visible = true;
        b.mesh.rotation.x = 0;
        b.mesh.position.set(b.x, 0, b.z);
        const sh = b.mesh.getObjectByName('shield');
        if (sh) sh.visible = true;
        b.shootCd = 0.8;
      }
      continue;
    }

    // frustum / distance cull
    const distCam = Math.hypot(b.x - state.x, b.z - state.z);
    if (!b.dying) b.mesh.visible = distCam < CULL_DIST;

    if (doThink) {
      b.thinkT -= dt * 2;
      if (b.thinkT <= 0) {
        b.thinkT = 0.3 + Math.random() * 0.5;
        const toPlayer = Math.hypot(state.x - b.x, state.z - b.z);
        if (toPlayer < 32 && Math.random() < 0.8) {
          b.target = 'player';
          b.aimYaw = Math.atan2(-(state.x - b.x), -(state.z - b.z));
        } else {
          b.target = null;
          b.aimYaw += (Math.random() - 0.5) * 1.4;
        }
      }
    }

    const arch = b.arch;
    let speed = arch.speed;
    let wishX = -Math.sin(b.aimYaw);
    let wishZ = -Math.cos(b.aimYaw);
    const dx = state.x - b.x, dz = state.z - b.z;
    const dist = Math.hypot(dx, dz) || 1;

    if (b.role === 'nest' && b.nestAnchor) {
      const ax = b.nestAnchor.x - b.x, az = b.nestAnchor.z - b.z;
      if (Math.hypot(ax, az) > 2) { wishX = ax; wishZ = az; }
      else { wishX = 0; wishZ = 0; speed = 0; }
      b.aimYaw = Math.atan2(-dx, -dz);
    } else if (b.target === 'player') {
      wishX = dx / dist; wishZ = dz / dist;
      const prefer = arch.preferDist;
      if (b.role === 'flanker') {
        // circle
        wishX = -dz / dist; wishZ = dx / dist;
        if (dist > prefer + 2) { wishX += dx / dist; wishZ += dz / dist; }
      } else if (b.role === 'slide') {
        if (dist > 3) { wishX = dx / dist; wishZ = dz / dist; speed *= 1.15; }
      } else if (dist < prefer - 2) { wishX *= -0.5; wishZ *= -0.5; }
      else if (dist > prefer + 4) { /* chase */ }
      else { wishX = -dz / dist * 0.6; wishZ = dx / dist * 0.6; }
      b.aimYaw = Math.atan2(-dx, -dz);
      // medic self-heal
      if (arch.selfHeal && b.hp < b.maxHp * 0.4 && b.healCd <= 0) {
        b.hp = Math.min(b.maxHp, b.hp + 25);
        b.healCd = 6;
        wishX *= -1; wishZ *= -1;
      }
    }
    if (b.healCd > 0) b.healCd -= dt;

    const len = Math.hypot(wishX, wishZ) || 1;
    const tvx = (wishX / len) * speed;
    const tvz = (wishZ / len) * speed;
    // lerp velocity for smooth bot motion (cuts stutter)
    const accel = 1 - Math.exp(-14 * dt);
    b.vx += (tvx - b.vx) * accel;
    b.vz += (tvz - b.vz) * accel;
    const moved = collideXZ(b.x + b.vx * dt, b.z + b.vz * dt, b.y, 0.4);
    b.x = moved.x; b.z = moved.z;
    const follow = 1 - Math.exp(-18 * dt);
    b.mesh.position.x += (b.x - b.mesh.position.x) * follow;
    b.mesh.position.z += (b.z - b.mesh.position.z) * follow;
    b.mesh.position.y = 0;
    let dyaw = b.aimYaw - b.mesh.rotation.y;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    b.mesh.rotation.y += dyaw * (1 - Math.exp(-12 * dt));

    b.shootCd -= dt;
    if (b.shootCd <= 0 && dist < 26 && dist > 1.2) {
      const ddx = state.x - b.x, ddy = state.y - b.y, ddz = state.z - b.z;
      const inv = 1 / (Math.hypot(ddx, ddy, ddz) || 1);
      const wall = rayHitsWall(b.x, b.y - 0.2, b.z, ddx * inv, ddy * inv, ddz * inv, dist);
      if (!wall) {
        let acc = arch.accuracy / (1 + dist * 0.035);
        if (state.ghost) acc *= 0.45;
        if (b.role === 'disruptor' && b.flashCd <= 0 && dist < 12) {
          // pulse flash
          if (flashOverlay) {
            flashOverlay.style.opacity = '0.85';
            setTimeout(() => { flashOverlay.style.opacity = '0'; }, 400);
          }
          SFX.flash();
          b.flashCd = 7;
          b.shootCd = 1.2;
        } else if (Math.random() < acc) {
          damagePlayer(arch.damage + Math.random() * 4, b.name);
        }
        const cd = arch.shootCd;
        b.shootCd = cd[0] + Math.random() * (cd[1] - cd[0]);
      } else b.shootCd = 0.25;
    }
    if (b.flashCd > 0) b.flashCd -= dt;
  }
}

function updateBoss(dt) {
  if (!boss) return;
  if (!boss.alive) {
    if (boss.dying && boss.mesh) {
      boss.deathT -= dt;
      const t = 1 - Math.max(0, boss.deathT) / (boss.deathDur || 0.7);
      const ease = t * t * (3 - 2 * t);
      boss.mesh.rotation.x = ease * (Math.PI * 0.55) * (boss.deathSign || 1);
      boss.mesh.position.y = Math.sin(ease * Math.PI) * 0.2;
      if (boss.deathT <= 0) {
        boss.dying = false;
        boss.mesh.visible = false;
        boss.mesh.rotation.x = 0;
        boss.mesh.position.y = 0;
      }
    }
    return;
  }
  const def = boss;
  boss.attackCd -= dt;
  // face player
  boss.aimYaw = Math.atan2(-(state.x - boss.x), -(state.z - boss.z));
  boss.mesh.rotation.y = boss.aimYaw;
  if (def.speed > 0) {
    const dx = state.x - boss.x, dz = state.z - boss.z;
    const dist = Math.hypot(dx, dz) || 1;
    if (dist > 6) {
      const moved = collideXZ(boss.x + (dx / dist) * def.speed * dt, boss.z + (dz / dist) * def.speed * dt, boss.y, 0.9);
      boss.x = moved.x; boss.z = moved.z;
      boss.mesh.position.set(boss.x, 0, boss.z);
    }
  }
  const ring = boss.mesh.getObjectByName('telegraph');
  if (boss.telegraphT > 0) {
    boss.telegraphT -= dt;
    if (ring) ring.material.opacity = 0.35 + Math.sin(performance.now() * 0.02) * 0.2;
    if (boss.telegraphT <= 0) {
      if (ring) ring.material.opacity = 0;
      // slam / shockwave
      const dist = Math.hypot(state.x - boss.x, state.z - boss.z);
      if (dist < 5.5) damagePlayer(def.damage, def.nameZh);
      // dune laser sweep — damage if roughly in line
      if (def.id === 'Boss_DuneBeacon' && dist < 28) {
        const ang = Math.abs(Math.atan2(state.x - boss.x, state.z - boss.z) - boss.aimYaw);
        if (ang < 0.25 || ang > Math.PI * 2 - 0.25) damagePlayer(def.damage * 0.8, def.nameZh);
      }
      boss.attackCd = def.attackCd;
    }
  } else if (boss.attackCd <= 0) {
    boss.telegraphT = def.telegraph;
    SFX.boss_telegraph();
    if (ring) ring.material.opacity = 0.45;
  }
}



function updateScoreboard() {
  const rows = [
    { name: state.name, kills: state.kills, deaths: state.deaths, you: true },
    ...bots.map((b) => ({ name: b.name, kills: b.kills, deaths: b.deaths, you: false })),
  ];
  if (boss) rows.push({ name: boss.nameZh, kills: 0, deaths: boss.alive ? 0 : 1, you: false });
  rows.sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  sbBody.innerHTML = rows.map((r, i) =>
    `<tr class="${r.you ? 'you' : ''}"><td>${i + 1}</td><td>${r.name}</td><td>${r.kills}</td><td>${r.deaths}</td></tr>`
  ).join('');
}

function endMatch(won) {
  matchOver = true;
  running = false;
  SFX.slideStop();
  document.exitPointerLock?.();
  hud.classList.remove('on');
  cross.classList.remove('on');
  overlay.classList.remove('hidden');
  showPanel('panelEnd');
  document.getElementById('endTitle').textContent = won ? '勝利！' : '時間到';
  const map = currentMap();
  document.getElementById('endSub').textContent = won
    ? (map.mode === 'boss' ? `擊敗 ${boss?.nameZh || 'Boss'}` : `先達 ${state.fragLimit} 殺 · ${map.nameZh}`)
    : `${map.nameZh} FFA 結束`;
  const stats = document.getElementById('endStats');
  stats.innerHTML = `
    <div><b>${state.kills}</b><span>擊殺</span></div>
    <div><b>${state.deaths}</b><span>死亡</span></div>
    <div><b>${bots.filter((b) => !b.alive).length}</b><span>倒地 BOT</span></div>`;
  if (won) SFX.level_clear();
}

function selectMap(index) {
  state.mapIndex = Math.max(0, Math.min(MAPS.length - 1, index));
  // update lobby UI selection
  document.querySelectorAll('[data-map]').forEach((el) => {
    el.classList.toggle('sel', Number(el.getAttribute('data-map')) === state.mapIndex);
  });
}

/** Apply ?map= into lobby selection once (or on popstate). Never inside startMatch. */
function applyUrlMap(force = false) {
  if (applyUrlMap._done && !force) return applyUrlMap._applied;
  applyUrlMap._done = true;
  const q = new URLSearchParams(location.search).get('map');
  if (!q) { applyUrlMap._applied = false; return false; }
  const idx = MAPS.findIndex((m) => m.id === q);
  if (idx < 0) { applyUrlMap._applied = false; return false; }
  selectMap(idx);
  applyUrlMap._applied = true;
  return true;
}
applyUrlMap._done = false;
applyUrlMap._applied = false;

function goLobby() {
  matchOver = false;
  running = false;
  SFX.slideStop?.();
  document.exitPointerLock?.();
  hud.classList.remove('on');
  cross.classList.remove('on');
  scoreboard.classList.remove('on');
  if (overlay) overlay.classList.remove('hidden');
  showPanel('panelLobby');
}

async function startMatch() {
  ensureAudio();
  loadSfxBuffers();
  await ensureMultimedia();
  SFX.ui_start();
  matchOver = false;
  running = true;
  state.kills = 0; state.deaths = 0; state.streak = 0;
  state.hp = 100; state.armor = 0;
  resetWeaponBags();
  state.weapon = 0; loadWeaponBag(0);
  state.reloading = false; state.reloadT = 0; state.shootCd = 0;
  state.sliding = false; state.ads = false; state.recoilKick = 0; state.switchFlashT = 0;
  state.timeLeft = MATCH_SECONDS; state.invuln = 1.2;
  state.power = null; state.powerT = 0; state.dmgMul = 1; state.speedMul = 1; state.ghost = false;
  yaw = 0; pitch = 0;
  if (camera) { camera.rotation.order = 'YXZ'; camera.rotation.set(0, 0, 0); }
  // lobby / prior selectMap owns mapIndex — do not re-read ?map= here
  buildArena(state.mapIndex);
  buildArms();
  rebuildGunMesh();
  spawnBots();
  const sp = randomSpawn();
  const cleared = nudgeEyeOutOfSolids(sp.x, PLAYER_HEIGHT, sp.z);
  state.x = cleared.x; state.y = cleared.y; state.z = cleared.z;
  state.vx = state.vy = state.vz = 0;
  overlay.classList.add('hidden');
  hud.classList.add('on');
  cross.classList.add('on');
  syncHud();
  wantPointer = true;
  canvas.focus();
  canvas.requestPointerLock?.();
}

function initThree() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 2, 0.08, 120);
  scene.add(camera);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2.0));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  else if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
  clock = new THREE.Clock();
  hemiLight = new THREE.HemisphereLight(0xfff2e8, 0x4a5548, 0.75);
  scene.add(hemiLight);
  sunLight = new THREE.DirectionalLight(0xfff0d0, 1.1);
  sunLight.position.set(14, 26, 10);
  scene.add(sunLight);
  fillLight = new THREE.DirectionalLight(0x88aaff, 0.3);
  fillLight.position.set(-12, 9, -14);
  scene.add(fillLight);
  ensureBloodPool();
  buildArena(state.mapIndex || 0);
  buildArms();
  ensureMultimedia();
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();
}

function updateCamera(dt) {
  const targetFov = state.ads ? (WEAPONS[state.weapon].adsFov || 55) : 75;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 12);
  camera.updateProjectionMatrix();
  const body = collideXZ(state.x, state.z, state.y, PLAYER_RADIUS);
  state.x = body.x; state.z = body.z;
  let eye = nudgeEyeOutOfSolids(state.x, state.y, state.z, CAM_SOLID_PAD);
  if (!fenceViewClear(eye.x, eye.z)) {
    const p = pushAwayFromFence(eye.x, eye.z);
    let guard = 0;
    while (!fenceViewClear(p.x, p.z) && guard++ < 8) { p.x *= 0.92; p.z *= 0.92; }
    eye = { x: p.x, y: eye.y, z: p.z };
  }
  state.x = eye.x; state.z = eye.z;
  camera.position.set(eye.x, eye.y, eye.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.set(pitch, yaw, 0);
  if (armsRoot) {
    const moving = Math.hypot(state.vx, state.vz) > 1 && state.onGround;
    const t = performance.now() * 0.01;
    state.recoilKick = Math.max(0, state.recoilKick - dt * 1.8);
    const kick = state.recoilKick;
    const flashLift = state.switchFlashT > 0 ? 0.04 : 0;
    armsRoot.position.y = -0.02 + (moving ? Math.sin(t) * 0.012 : 0) + kick * 0.35 + flashLift;
    armsRoot.position.x = (state.ads ? -0.06 : 0) + kick * 0.08;
    armsRoot.position.z = (state.ads ? 0.06 : 0) - kick * 0.25;
    armsRoot.visible = true;
  }
  if (state.switchFlashT > 0) state.switchFlashT = Math.max(0, state.switchFlashT - dt);
}

function drawTraces(dt) {
  for (let i = bulletTraces.length - 1; i >= 0; i--) {
    const tr = bulletTraces[i];
    tr.t -= dt;
    if (!tr.line) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(tr.x0, tr.y0, tr.z0),
        new THREE.Vector3(tr.x1, tr.y1, tr.z1),
      ]);
      tr.line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffe66d, transparent: true, opacity: 0.85 }));
      scene.add(tr.line);
    }
    if (tr.t <= 0) {
      scene.remove(tr.line);
      tr.line.geometry.dispose();
      tr.line.material.dispose();
      bulletTraces.splice(i, 1);
    }
  }
}

function frame() {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  // tighter clamp reduces hitch cascades on mid-laptops
  const dt = Math.min(0.033, clock.getDelta());
  if (!running) {
    if (!matchOver && overlay && !overlay.classList.contains('hidden')) {
      const t = performance.now() * 0.00025;
      camera.position.set(Math.sin(t) * 18, 12, Math.cos(t) * 18);
      camera.rotation.order = 'YXZ';
      camera.rotation.set(-0.45, t + Math.PI, 0);
    }
    updateBlood(dt);
    updateFx(dt);
    renderer.render(scene, camera);
    return;
  }
  state.invuln = Math.max(0, state.invuln - dt);
  state.ads = !!(keys.Mouse2) && !WEAPONS[state.weapon].melee;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    endMatch(false);
    renderer.render(scene, camera);
    return;
  }
  applyPlayerPhysics(dt);
  updateJumpPads();
  tryShoot(dt);
  updateBots(dt);
  updateBoss(dt);
  updatePickups(dt);
  updatePowers(dt);
  updateBlood(dt);
  updateFx(dt);
  updateCamera(dt);
  drawTraces(dt);
  _hudAcc += dt;
  if (_hudDirty || _hudAcc >= 0.12) {
    syncHud();
    _hudAcc = 0;
  }
  if (scoreboard.classList.contains('on')) updateScoreboard();
  renderer.render(scene, camera);
}

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Tab') {
    e.preventDefault();
    if (running) { scoreboard.classList.add('on'); updateScoreboard(); }
  }
  if (e.code === 'KeyR' && running) startReload();
  if (running) {
    if (e.code === 'Digit1' || e.code === 'Numpad1') switchWeapon(0);
    if (e.code === 'Digit2' || e.code === 'Numpad2') switchWeapon(1);
    if (e.code === 'Digit3' || e.code === 'Numpad3') switchWeapon(2);
    if (e.code === 'Digit4' || e.code === 'Numpad4') switchWeapon(3);
    if (e.code === 'Digit5' || e.code === 'Numpad5') switchWeapon(4);
    // Q cycles loadout (no collide with slide/sprint/reload binds)
    if (e.code === 'KeyQ') { e.preventDefault(); cycleWeapon(1); }
  }
  if (e.code === 'KeyN') {
    // cycle map: mid-match remaps in place; end/lobby starts the next map
    selectMap((state.mapIndex + 1) % MAPS.length);
    if (running) {
      buildArena(state.mapIndex);
      spawnBots();
      const sp = randomSpawn();
      state.x = sp.x; state.z = sp.z; state.y = eyeHeight();
      syncHud();
    } else {
      // from end card or lobby — leave stuck end screen without a perfect click
      startMatch();
    }
  }
  if (e.code === 'Escape' && matchOver) {
    e.preventDefault();
    goLobby();
  }
  if (e.code === 'KeyE' && running && wantPointer && !pointerLocked) canvas.requestPointerLock?.();
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'Tab') scoreboard.classList.remove('on');
});
window.addEventListener('mousedown', (e) => {
  if (!running) return;
  ensureAudio();
  if (!pointerLocked) { canvas.requestPointerLock?.(); return; }
  if (e.button === 0) keys.Mouse0 = true;
  if (e.button === 2) keys.Mouse2 = true;
});
window.addEventListener('mouseup', (e) => {
  if (e.button === 0) keys.Mouse0 = false;
  if (e.button === 2) keys.Mouse2 = false;
});
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('mousemove', (e) => {
  if (!pointerLocked || !running) return;
  const sens = state.ads ? 0.0014 : 0.0022;
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-1.4, Math.min(1.4, pitch));
});
window.addEventListener('wheel', (e) => {
  if (!running) return;
  e.preventDefault();
  const dir = e.deltaY > 0 ? 1 : -1;
  cycleWeapon(dir);
}, { passive: false });

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
});

document.getElementById('btnStart').addEventListener('click', () => { ensureAudio(); loadSfxBuffers(); startMatch(); });
document.getElementById('btnAgain').addEventListener('click', () => startMatch());
document.getElementById('btnLobby').addEventListener('click', () => { goLobby(); });
document.querySelectorAll('[data-map]').forEach((el) => {
  el.addEventListener('click', () => selectMap(Number(el.getAttribute('data-map'))));
});
applyUrlMap(false);
window.addEventListener('popstate', () => applyUrlMap(true));

// —— debug / smoke hooks ——
window.__dbg = () => ({
  running, matchOver,
  mmScene: MM_SCENE, mmExpand: MM_EXPAND, mmVer: MM_VER,
  sfxHit: !!sfxBuffers.hit, sfxHitArmor: !!sfxBuffers.hit_armor, sfxDeath: !!sfxBuffers.death,
  bloodPool: bloodPool.filter((p) => p.life > 0).length,
  fxSprites: fxSprites.filter((p) => p.life > 0).length,
  fxDecals: fxDecals.filter((p) => p.life > 0).length,
  fxReady: !!(mm.fx.hitSpark && mm.fx.bloodSpray && mm.fx.bloodDecal && mm.fx.botFall),
  x: state.x, y: state.y, z: state.z,
  hp: state.hp, armor: state.armor, kills: state.kills, deaths: state.deaths, streak: state.streak,
  weapon: WEAPONS[state.weapon].id, weaponIndex: state.weapon,
  ammo: state.ammo, reserve: state.reserve,
  weaponBags: weaponBags.map((b) => ({ ...b })),
  switchFlashT: state.switchFlashT, recoilKick: state.recoilKick,
  sliding: state.sliding, onGround: state.onGround, ads: state.ads,
  botsAlive: bots.filter((b) => b.alive).length,
  botCount: bots.length,
  botTags: bots.map((b) => b.tag),
  hasNewArchetype: bots.some((b) => b.tag >= 'E'),
  timeLeft: state.timeLeft,
  pointerLocked,
  mapId: currentMap().id,
  mapIndex: state.mapIndex,
  mapCount: MAPS.length,
  maps: MAPS.map((m) => m.id),
  pickupCount: pickups.length,
  pickupsAlive: pickups.filter((p) => p.alive).length,
  bossId: boss ? boss.id : null,
  bossAlive: !!(boss && boss.alive),
  bossHp: boss ? boss.hp : 0,
  power: state.power, powerT: state.powerT, dmgMul: state.dmgMul, speedMul: state.speedMul,
  sfxReady: sfxReady.ok,
  sfxBuffers: Object.keys(sfxBuffers),
  mmReady: mm.ready,
  mmWeapons: Object.keys(mm.weapons).length,
  mmBotSkins: mm.botSkins.length,
  mmMats: Object.keys(mm.mats).length,
  mmFpCombined: !!mm.fpCombined,
  cameraInScene: !!(camera && camera.parent === scene),
  armsVisible: !!(armsRoot && armsRoot.parent === camera && armsRoot.visible && armsRoot.children.length > 0),
  armsChildCount: armsRoot ? armsRoot.children.length : 0,
  viewmodelGun: gunParts ? gunParts.children.length : 0,
  spawnClear: isSpawnClear(state.x, state.z, 1.0),
  eyeInSolid: pointInSolid(state.x, state.y, state.z, 0.05),
  camPad: CAM_SOLID_PAD,
  arenaBound: ARENA_BOUND,
  fenceInner: FENCE_INNER,
  fenceDist: distToFenceInner(state.x, state.z),
  fenceViewClear: fenceViewClear(state.x, state.z),
  fenceR: FENCE_R,
  enableBosses: ENABLE_BOSSES,
  enablePickups: ENABLE_PICKUPS,
  enableSfx: ENABLE_SFX,
  pickupGrabR: PICKUP_GRAB_R,
});
window.__setKey = (code, down) => { keys[code] = !!down; };
window.__setMouse = (btn, down) => {
  if (btn === 0) keys.Mouse0 = !!down;
  if (btn === 2) keys.Mouse2 = !!down;
};
window.__forceLook = (y, p) => { yaw = y; pitch = p ?? pitch; };
window.__switchWeapon = (i) => switchWeapon(i, { force: true });
window.__cycleWeapon = (dir) => cycleWeapon(dir || 1);
window.__weaponBags = () => weaponBags.map((b) => ({ ...b }));
window.__startMatch = () => startMatch();
window.__selectMap = (i) => { selectMap(i); };
window.__loadMap = async (idOrIndex) => {
  const idx = typeof idOrIndex === 'number' ? idOrIndex : MAPS.findIndex((m) => m.id === idOrIndex);
  if (idx < 0) return { ok: false, mapId: null, botCount: 0, pickups: 0, bossId: null };
  selectMap(idx);
  if (running) {
    // mid-match remap: rebuild arena (pickups/boss via buildArena) and keep running
    buildArena(state.mapIndex);
    spawnBots();
    const sp = randomSpawn();
    state.x = sp.x; state.z = sp.z; state.y = eyeHeight();
    syncHud();
  } else {
    // lobby / end card / smoke: reliably enter the selected map
    await startMatch();
  }
  return {
    ok: true,
    mapId: currentMap().id,
    botCount: bots.length,
    pickups: pickups.length,
    bossId: boss?.id || currentMap().bossId || null,
  };
};
window.__forceWasdProbe = (secs = 0.6) => {
  const before = { x: state.x, z: state.z };
  keys.KeyW = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      keys.KeyW = false;
      const after = { x: state.x, z: state.z };
      const d = Math.hypot(after.x - before.x, after.z - before.z);
      resolve({ ok: d > 0.4, d, before, after });
    }, secs * 1000);
  });
};
window.__forceJumpProbe = () => {
  const y0 = state.y;
  keys.Space = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ok: state.y > y0 + 0.3 || state.vy > 1, y0, y: state.y, vy: state.vy });
    }, 80);
  });
};
window.__forceSlideProbe = () => {
  const c = collideXZ(0, 8, eyeHeight(), PLAYER_RADIUS);
  state.x = c.x; state.z = c.z;
  state.vy = 0; state.vx = 0; state.vz = 0;
  state.onGround = true; state.y = eyeHeight();
  state.sliding = false; state.slideT = 0;
  yaw = 0; pitch = 0;
  keys.Space = false; keys.KeyW = true; keys.ShiftLeft = false; keys.KeyC = false;
  return new Promise((resolve) => {
    setTimeout(() => {
      const sp0 = Math.hypot(state.vx, state.vz) || MOVE_SPEED;
      state.vx = (state.vx || 0) / (sp0 || 1) * MOVE_SPEED * SLIDE_BOOST || -Math.sin(yaw) * MOVE_SPEED * SLIDE_BOOST;
      state.vz = (state.vz || -MOVE_SPEED) / (sp0 || 1) * MOVE_SPEED * SLIDE_BOOST;
      if (Math.hypot(state.vx, state.vz) < 1) { state.vx = 0; state.vz = -MOVE_SPEED * SLIDE_BOOST; }
      state.sliding = true; state.slideT = SLIDE_DURATION;
      keys.ShiftLeft = true; keys.KeyC = true;
      setTimeout(() => {
        const speed = Math.hypot(state.vx, state.vz);
        const ok = state.sliding === true || speed > MOVE_SPEED * 1.15;
        keys.KeyW = false; keys.ShiftLeft = false; keys.KeyC = false;
        resolve({ ok, sliding: state.sliding, speed, onGround: state.onGround, x: state.x, z: state.z });
      }, 120);
    }, 480);
  });
};
window.__killNearestBot = () => {
  let best = null, bestD = 1e9;
  for (const b of bots) {
    if (!b.alive) continue;
    const d = Math.hypot(b.x - state.x, b.z - state.z);
    if (d < bestD) { bestD = d; best = b; }
  }
  if (!best) return { ok: false };
  yaw = Math.atan2(-(best.x - state.x), -(best.z - state.z));
  pitch = 0;
  const before = state.kills;
  damageBot(best, 999, true);
  return { ok: state.kills > before, kills: state.kills, bot: best.name, tag: best.tag };
};
window.__grabNearestPickup = () => {
  let best = null, bestD = 1e9;
  for (const p of pickups) {
    if (!p.alive) continue;
    const d = Math.hypot(p.x - state.x, p.z - state.z);
    if (d < bestD) { bestD = d; best = p; }
  }
  if (!best) return { ok: false };
  state.x = best.x; state.z = best.z;
  grabPickup(best);
  return { ok: true, id: best.id, power: state.power, hp: state.hp, armor: state.armor };
};
window.__spawnBossNow = (id) => {
  spawnBoss(id || currentMap().bossId || 'Boss_ContainerTitan');
  return { ok: !!(boss && boss.alive), bossId: boss?.id, hp: boss?.hp };
};
window.__damageBoss = (n = 200) => {
  if (!boss || !boss.alive) return { ok: false };
  damageBoss(n, true);
  return { ok: true, hp: boss.hp, alive: boss.alive };
};
window.__teleport = (x, z) => {
  const c = collideXZ(x, z, eyeHeight(), PLAYER_RADIUS);
  state.x = c.x; state.z = c.z; state.y = eyeHeight();
  state.vx = state.vz = state.vy = 0;
};
function _wallProbeSnapshot(tag) {
  const fd = distToFenceInner(state.x, state.z);
  return {
    tag, x: state.x, z: state.z, y: state.y,
    inSolid: pointInSolid(state.x, state.y, state.z, 0.08),
    beyondBound: Math.abs(state.z) > ARENA_BOUND + 0.15 || Math.abs(state.x) > ARENA_BOUND + 0.15,
    fenceDist: fd,
    skyClear: fd >= MIN_FENCE_VIEW_CLEAR - 0.15,
    fenceViewClear: fenceViewClear(state.x, state.z),
  };
}
window.__forceWallEmbedProbe = async () => {
  const near = ARENA_BOUND - 0.35;
  state.x = 0; state.z = near; state.y = eyeHeight();
  state.vx = 0; state.vz = 0; state.vy = 0;
  state.onGround = true; state.sliding = false;
  yaw = Math.PI; pitch = 0;
  keys.KeyW = true; keys.ShiftLeft = false; keys.KeyC = false;
  await new Promise((r) => setTimeout(r, 900));
  const afterSprint = _wallProbeSnapshot('sprint');
  state.x = 0; state.z = near; state.y = eyeHeight();
  state.vx = 0; state.vz = MOVE_SPEED * SLIDE_BOOST;
  state.onGround = true; state.sliding = false; state.slideT = 0;
  yaw = Math.PI; pitch = 0;
  keys.KeyW = true; keys.ShiftLeft = true; keys.KeyC = true;
  await new Promise((r) => setTimeout(r, 700));
  const afterSlide = _wallProbeSnapshot('slide');
  keys.KeyW = false; keys.ShiftLeft = false; keys.KeyC = false;
  state.x = near; state.z = near; state.y = eyeHeight();
  state.vx = MOVE_SPEED * SLIDE_BOOST; state.vz = MOVE_SPEED * SLIDE_BOOST;
  state.onGround = true; state.sliding = true; state.slideT = SLIDE_DURATION;
  yaw = Math.PI * 0.75; pitch = 0;
  await new Promise((r) => setTimeout(r, 650));
  const afterCorner = _wallProbeSnapshot('corner');
  state.sliding = false; state.vx = state.vz = 0;
  const shots = [afterSprint, afterSlide, afterCorner];
  const ok = shots.every((s) => !s.inSolid && !s.beyondBound && s.skyClear && s.fenceViewClear);
  return { ok, minFenceClear: MIN_FENCE_VIEW_CLEAR, arenaBound: ARENA_BOUND, fenceInner: FENCE_INNER, afterSprint, afterSlide, afterCorner };
};

applyUrlMap(false);
initThree();
selectMap(state.mapIndex || 0);
ensureMultimedia();
frame();
