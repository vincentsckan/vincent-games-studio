/**
 * 霓虹港戰 Neon Harbor Clash — Vincent Games Studio
 * Local Three.js FPS demo (Krunker-like movement + FFA vs AI)
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

const MAPS = [
  {
    id: 'cargo',
    nameZh: '貨櫃碼頭',
    nameEn: 'Cargo Pier',
    desc: '貨櫃堆疊、碼頭長廊——掩體多、遠近皆宜。',
    thumb: 'refs/map-cargo.jpg',
  },
  {
    id: 'temple',
    nameZh: '霓虹廟市',
    nameEn: 'Neon Temple',
    desc: '廟街霓虹、窄巷檔口——近戰混戰天堂。',
    thumb: 'refs/map-mongkok.jpg',
  },
  {
    id: 'signs',
    nameZh: '霓虹招牌街',
    nameEn: 'Neon Sign Street',
    desc: '呢度啲燈仲亮緊——不過人已經唔同。',
    thumb: 'refs/map-neon-sign-street.jpg',
  },
  {
    id: 'estate',
    nameZh: '公屋天台',
    nameEn: 'Estate Roof',
    desc: '晾衫未收——天台已經係賽場。',
    thumb: 'refs/map-estate-roof.jpg',
  },
  {
    id: 'teahouse',
    nameZh: '茶餐廳後巷',
    nameEn: 'Cha Chaan Back',
    desc: '花磚仲在，霓虹只剩半個字。',
    thumb: 'refs/map-cha-chaan-back.jpg',
  },
];

const CLASSES = [
  {
    id: 'spark',
    nameZh: '閃 · Spark',
    nameEn: 'Spark',
    desc: '突擊步槍 · 均衡攻防，適合大多數戰況。',
    hp: 100,
    speed: 9.2,
    jump: 9.5,
    damage: 24,
    firerate: 9.5,
    spread: 0.028,
    mag: 30,
    reserve: 90,
    reload: 1.45,
    pellets: 1,
  },
  {
    id: 'falcon',
    nameZh: '隼 · Falcon',
    nameEn: 'Falcon',
    desc: '狙擊步槍 · 高傷害慢射速，走位稍慢。',
    hp: 90,
    speed: 7.6,
    jump: 9.0,
    damage: 95,
    firerate: 1.15,
    spread: 0.004,
    mag: 5,
    reserve: 25,
    reload: 2.1,
    pellets: 1,
  },
  {
    id: 'rock',
    nameZh: '石 · Rock',
    nameEn: 'Rock',
    desc: '散彈重裝 · 高血量、近距爆發，移動較慢。',
    hp: 160,
    speed: 6.4,
    jump: 8.4,
    damage: 18,
    firerate: 1.4,
    spread: 0.12,
    mag: 8,
    reserve: 32,
    reload: 2.4,
    pellets: 7,
  },
  {
    id: 'shade',
    nameZh: '影 · Shade',
    nameEn: 'Shade',
    desc: '衝鋒槍 · 高機動低血量，近身掃射。',
    hp: 70,
    speed: 11.4,
    jump: 10.2,
    damage: 15,
    firerate: 13.5,
    spread: 0.055,
    mag: 35,
    reserve: 105,
    reload: 1.25,
    pellets: 1,
  },
];

const MATCH_SECONDS = 150;
const WIN_KILLS = 20;
const BOT_COUNT = 6;
const GRAVITY = 28;
const PLAYER_RADIUS = 0.45;
const PLAYER_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.05;
const SLIDE_BOOST = 1.55;
const SLIDE_DURATION = 0.55;

let selectedMap = null;
let selectedClass = null;
let running = false;
let matchOver = false;

const keys = Object.create(null);
let pointerLocked = false;
let yaw = 0;
let pitch = 0;

const state = {
  x: 0, y: PLAYER_HEIGHT, z: 0,
  vx: 0, vy: 0, vz: 0,
  onGround: true,
  crouching: false,
  sliding: false,
  slideT: 0,
  hp: 100,
  kills: 0,
  deaths: 0,
  ammo: 30,
  reserve: 90,
  reloading: false,
  reloadT: 0,
  shootCd: 0,
  invuln: 0,
  classId: 'spark',
  mapId: 'cargo',
  timeLeft: MATCH_SECONDS,
};

let scene, camera, renderer, clock;
let solidBoxes = [];
let bots = [];
let neonMats = [];
let muzzleFlash = null;
let gunMesh = null;
let spawnPoints = [];
let bulletTraces = [];
let bloodBursts = [];

function showPanel(id) {
  document.querySelectorAll('.panel').forEach((p) => p.classList.remove('on'));
  document.getElementById(id).classList.add('on');
}

function fillPickers() {
  const mapGrid = document.getElementById('mapGrid');
  mapGrid.innerHTML = '';
  MAPS.forEach((m) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick';
    btn.dataset.id = m.id;
    btn.innerHTML = `<img src="${m.thumb}" alt=""/><b>${m.nameZh}</b><span>${m.nameEn}<br/>${m.desc}</span>`;
    btn.addEventListener('click', () => {
      selectedMap = m.id;
      mapGrid.querySelectorAll('.pick').forEach((el) => el.classList.toggle('sel', el.dataset.id === m.id));
      document.getElementById('btnMapNext').disabled = false;
    });
    mapGrid.appendChild(btn);
  });

  const classGrid = document.getElementById('classGrid');
  classGrid.innerHTML = '';
  CLASSES.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick';
    btn.dataset.id = c.id;
    btn.innerHTML = `<b>${c.nameZh}</b><span>${c.desc}<br/>HP ${c.hp} · 速 ${c.speed.toFixed(1)}</span>`;
    btn.addEventListener('click', () => {
      selectedClass = c.id;
      classGrid.querySelectorAll('.pick').forEach((el) => el.classList.toggle('sel', el.dataset.id === c.id));
      document.getElementById('btnStart').disabled = false;
    });
    classGrid.appendChild(btn);
  });
}

document.getElementById('btnEnter').addEventListener('click', () => {
  showPanel('panelMap');
});
document.getElementById('btnMapBack').addEventListener('click', () => showPanel('panelSplash'));
document.getElementById('btnMapNext').addEventListener('click', () => {
  if (!selectedMap) return;
  showPanel('panelClass');
});
document.getElementById('btnClassBack').addEventListener('click', () => showPanel('panelMap'));
document.getElementById('btnStart').addEventListener('click', () => {
  if (!selectedMap || !selectedClass) return;
  startMatch(selectedMap, selectedClass);
});
document.getElementById('btnAgain').addEventListener('click', () => {
  startMatch(state.mapId || selectedMap, state.classId || selectedClass);
});
document.getElementById('btnMenu').addEventListener('click', () => {
  running = false;
  matchOver = false;
  hud.classList.remove('on');
  cross.classList.remove('on');
  overlay.classList.remove('hidden');
  showPanel('panelSplash');
  try { document.exitPointerLock(); } catch (_) {}
});

fillPickers();

function boxSolid(x, y, z, w, h, d) {
  return {
    minX: x - w / 2, maxX: x + w / 2,
    minY: y, maxY: y + h,
    minZ: z - d / 2, maxZ: z + d / 2,
  };
}

function addBox(group, x, y, z, w, h, d, color, emissive, emitInt = 0, solid = true) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: emissive || 0x000000,
    emissiveIntensity: emitInt,
    roughness: 0.72,
    metalness: 0.18,
  });
  if (emitInt > 0) neonMats.push(mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  group.add(mesh);
  if (solid) solidBoxes.push(boxSolid(x, y, z, w, h, d));
  return mesh;
}

function addNeonSign(group, x, y, z, w, h, color) {
  addBox(group, x, y, z, w, h, 0.18, 0x111118, color, 2.8, false);
  addBox(group, x, y - 0.05, z + 0.02, w * 0.92, h * 0.08, 0.1, 0x080810, color, 1.2, false);
}

/** Canvas texture with locked Traditional Chinese (zh-Hant) — never Simplified. */
function makeZhTexture(text, opts = {}) {
  const {
    vertical = true,
    bg = '#b01028',
    fg = '#ffe8a0',
    pad = 10,
    fontPx = 42,
  } = opts;
  const chars = String(text).split('');
  const canvas = document.createElement('canvas');
  if (vertical) {
    canvas.width = 96;
    canvas.height = Math.max(160, chars.length * (fontPx + 10) + pad * 2);
  } else {
    canvas.width = Math.max(160, chars.length * (fontPx + 4) + pad * 2);
    canvas.height = fontPx + pad * 2;
  }
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontPx}px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif`;
  if (vertical) {
    const step = (canvas.height - pad * 2) / chars.length;
    chars.forEach((ch, i) => {
      ctx.fillText(ch, canvas.width / 2, pad + step * (i + 0.5));
    });
  } else {
    ctx.fillText(String(text), canvas.width / 2, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function addZhPanel(group, x, y, z, w, h, d, text, opts = {}) {
  const {
    vertical = true,
    bg = '#b01028',
    fg = '#ffe8a0',
    emissive = 0xff2d3a,
    emitInt = 1.6,
    solid = false,
    rotY = 0,
    color = 0xffffff,
  } = opts;
  const tex = makeZhTexture(text, { vertical, bg, fg });
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    color,
    emissive,
    emissiveIntensity: emitInt,
    roughness: 0.55,
    metalness: 0.15,
  });
  if (emitInt > 0) neonMats.push(mat);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.rotation.y = rotY;
  group.add(mesh);
  if (solid) solidBoxes.push(boxSolid(x, y, z, w, h, d));
  return mesh;
}

/** 綠窗框 — green window frames + dark panes on a façade face. */
function addGreenWindows(group, faceX, baseY, z, rows, cols, toward, opts = {}) {
  const {
    frame = 0x1a5c3a,
    glass = 0x0a1820,
    winW = 0.85,
    winH = 1.05,
    gapX = 1.15,
    gapY = 1.55,
  } = opts;
  const startZ = z - ((cols - 1) * gapX) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wy = baseY + r * gapY;
      const wz = startZ + c * gapX;
      // frame (slightly proud of wall)
      addBox(group, faceX, wy, wz, 0.08, winH, winW, frame, 0x000000, 0, false);
      // glass inset
      addBox(group, faceX + toward * 0.04, wy + 0.06, wz, 0.04, winH - 0.14, winW - 0.14, glass, 0x40f0ff, 0.08, false);
      // mullion cross
      addBox(group, faceX + toward * 0.05, wy + winH * 0.45, wz, 0.05, 0.06, winW - 0.1, frame, 0x000000, 0, false);
      addBox(group, faceX + toward * 0.05, wy + 0.1, wz, 0.05, winH - 0.2, 0.06, frame, 0x000000, 0, false);
    }
  }
}

/** 外掛冷氣 — small external AC unit. */
function addACUnit(group, x, y, z, toward = 1) {
  addBox(group, x + toward * 0.35, y, z, 0.7, 0.45, 0.55, 0x8a949c, 0x000000, 0, false);
  addBox(group, x + toward * 0.55, y + 0.12, z, 0.12, 0.22, 0.4, 0x2a3038, 0x000000, 0, false);
  addBox(group, x + toward * 0.2, y + 0.38, z, 0.35, 0.08, 0.2, 0x5a6068, 0x000000, 0, false);
}

/** 竹竿晾衫 — bamboo laundry poles spanning overhead + hanging clothes. */
function addLaundrySpan(group, x0, z, x1, y = 5.2) {
  const midX = (x0 + x1) / 2;
  const span = Math.abs(x1 - x0);
  // bamboo pole
  addBox(group, midX, y, z, span, 0.07, 0.07, 0xc4a574, 0x000000, 0, false);
  const clothCols = [0xf0e8e0, 0x40f0ff, 0xff6a8a, 0xffd36a, 0xa78bfa, 0x7dff9a, 0xe8e0d0];
  const n = 5 + ((Math.abs((z * 10) | 0)) % 3);
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    const cx = x0 + (x1 - x0) * t;
    const ch = 0.7 + (k % 3) * 0.25;
    const col = clothCols[(k + ((z * 3) | 0)) % clothCols.length];
    addBox(group, cx, y - ch - 0.05, z, 0.55, ch, 0.05, 0x202028, col, 0.25, false);
  }
}

/** 紅膠凳 — classic HK red plastic stool (soft cover / clutter). */
function addRedStool(group, x, z, solid = true) {
  addBox(group, x, 0.32, z, 0.42, 0.06, 0.42, 0xd62828, 0x000000, 0, solid);
  addBox(group, x - 0.14, 0, z - 0.14, 0.06, 0.34, 0.06, 0xb01018, 0x000000, 0, false);
  addBox(group, x + 0.14, 0, z - 0.14, 0.06, 0.34, 0.06, 0xb01018, 0x000000, 0, false);
  addBox(group, x - 0.14, 0, z + 0.14, 0.06, 0.34, 0.06, 0xb01018, 0x000000, 0, false);
  addBox(group, x + 0.14, 0, z + 0.14, 0.06, 0.34, 0.06, 0xb01018, 0x000000, 0, false);
}

/** 垃圾桶 / trash bags. */
function addTrashBin(group, x, z, kind = 0) {
  if (kind % 2 === 0) {
    addBox(group, x, 0, z, 0.7, 0.95, 0.7, 0x2a3038, 0x000000, 0, true);
    addBox(group, x, 0.95, z, 0.75, 0.08, 0.75, 0x1a2030, 0x000000, 0, false);
  } else {
    // lumpy black bag
    addBox(group, x, 0, z, 0.55, 0.5, 0.45, 0x151518, 0x000000, 0, true);
    addBox(group, x + 0.05, 0.45, z, 0.4, 0.25, 0.35, 0x101014, 0x000000, 0, false);
  }
}

/** 黃的 — yellow HK taxi as cover prop WITH collision box. */
function addYellowTaxi(group, x, z, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf5c400, roughness: 0.55, metalness: 0.25 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4, metalness: 0.3 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xf5c400, roughness: 0.55, metalness: 0.2, emissive: 0x332200, emissiveIntensity: 0.15 });
  // chassis / body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 4.1), bodyMat);
  body.position.y = 0.55;
  g.add(body);
  // cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.2), cabinMat);
  cabin.position.set(0, 1.15, -0.15);
  g.add(cabin);
  // windows
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.5, 1.9), darkMat);
  win.position.set(0, 1.2, -0.15);
  g.add(win);
  // roof light
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.18, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xffe080, emissive: 0xffd36a, emissiveIntensity: 1.4 })
  );
  lamp.position.set(0, 1.6, 0.1);
  g.add(lamp);
  neonMats.push(lamp.material);
  // wheels
  [[-0.75, -1.25], [0.75, -1.25], [-0.75, 1.25], [0.75, 1.25]].forEach(([wx, wz]) => {
    const wh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.55), darkMat);
    wh.position.set(wx, 0.28, wz);
    g.add(wh);
  });
  group.add(g);
  // collision AABB in world space (axis-aligned approx — keep taxi near axis-aligned spawns)
  const cw = rotY === 0 || Math.abs(Math.abs(rotY) - Math.PI) < 0.2 ? 1.95 : 4.2;
  const cd = rotY === 0 || Math.abs(Math.abs(rotY) - Math.PI) < 0.2 ? 4.2 : 1.95;
  solidBoxes.push(boxSolid(x, 0, z, cw, 1.55, cd));
  return g;
}

/** Wet stone zebra crossing bands. */
function addZebraCrossing(group, x, z, acrossX = true) {
  for (let i = 0; i < 6; i++) {
    if (acrossX) {
      addBox(group, x + (i - 2.5) * 0.55, 0.03, z, 0.4, 0.04, 2.8, 0xe8e0d0, 0x000000, 0, false);
    } else {
      addBox(group, x, 0.03, z + (i - 2.5) * 0.55, 2.8, 0.04, 0.4, 0xe8e0d0, 0x000000, 0, false);
    }
  }
}

/** Overlapping rectangular hanging shop board (upper canyon fill). */
function addHangSign(group, x, y, z, w, h, text, opts = {}) {
  const {
    bg = '#b01028',
    fg = '#fff4d0',
    emissive = 0xff2d3a,
    emitInt = 1.5,
    rotY = 0,
    depth = 0.12,
  } = opts;
  addZhPanel(group, x, y, z, w, h, depth, text, {
    vertical: false, bg, fg, emissive, emitInt, rotY,
  });
  // thin bracket arm back toward façade
  addBox(group, x, y + h * 0.45, z, Math.max(0.35, w * 0.15), 0.06, 0.06, 0x3a3030, 0x000000, 0, false);
}

// Locked zh-Hant sign copy (Translation) — fictional / non-trademark
const ZH_VERT_NEON = '富龍大茶樓';
const ZH_WALL = ['罐頭食品', '名茶', '茶莊禮品', '乾餅菓'];
const ZH_BANNERS = ['公合記食家', '喜筵壽宴', '理髮', '涼茶', '燒味'];


function buildCargoPier(root) {
  spawnPoints = [
    [0, 0, 0], [18, 0, 12], [-16, 0, 14], [14, 0, -16],
    [-12, 0, -14], [0, 0, 22], [22, 0, 0], [-20, 0, -4],
  ];
  // ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x152238, roughness: 0.92, metalness: 0.08 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, 80, 1, 80));

  // pier edge water glow strips
  for (let i = -3; i <= 3; i++) {
    addBox(root, i * 10, 0.02, 36, 8, 0.08, 0.4, 0x081018, 0x00e8ff, 1.6, false);
    addBox(root, i * 10, 0.02, -36, 8, 0.08, 0.4, 0x081018, 0xff2d9b, 1.4, false);
  }

  // container stacks
  const cols = [0x2a6088, 0x886028, 0x286050, 0x682848, 0x385878];
  const layouts = [
    [-22, -18], [-22, -8], [-22, 4], [-22, 14],
    [22, -16], [22, -4], [22, 8], [22, 18],
    [-8, -22], [4, -22], [14, -22],
    [-10, 22], [6, 22], [16, 22],
  ];
  layouts.forEach(([cx, cz], i) => {
    const stacks = 1 + (i % 3);
    for (let s = 0; s < stacks; s++) {
      const c = cols[(i + s) % cols.length];
      addBox(root, cx, s * 2.6, cz, 5.2, 2.5, 2.6, c, 0x000000, 0, true);
    }
    if (i % 2 === 0) addNeonSign(root, cx, stacks * 2.6 + 0.4, cz + 1.4, 3.2, 0.7, i % 4 === 0 ? 0xff2d9b : 0x00e8ff);
  });

  // crane pillars / towers
  addBox(root, 0, 0, -30, 1.2, 14, 1.2, 0x2a3344, 0x40f0ff, 0.4, true);
  addBox(root, 0, 13, -30, 16, 0.6, 1.2, 0x2a3344, 0xff4dc8, 0.5, true);
  addBox(root, -28, 0, 0, 1.2, 12, 1.2, 0x2a3344, 0xff4dc8, 0.35, true);
  addBox(root, -28, 11, 0, 1.2, 0.6, 14, 0x2a3344, 0x00e8ff, 0.45, true);

  // mid cover crates
  [[-4, 2], [5, -3], [0, 8], [-6, -8], [10, 6], [-12, 0]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 2.2, 1.4 + (i % 2) * 0.6, 2.2, 0x243040, 0x000000, 0, true);
  });

  // warehouse walls low
  addBox(root, 0, 0, 38, 50, 4, 1.2, 0x121820, 0x00e8ff, 0.25, true);
  addBox(root, 0, 0, -38, 50, 4, 1.2, 0x121820, 0xff2d9b, 0.25, true);
  addBox(root, 38, 0, 0, 1.2, 4, 50, 0x121820, 0x40f0ff, 0.2, true);
  addBox(root, -38, 0, 0, 1.2, 4, 50, 0x121820, 0xff4dc8, 0.2, true);
}

function buildNeonTemple(root) {
  spawnPoints = [
    [0, 0, 0], [10, 0, 8], [-10, 0, 8], [10, 0, -8],
    [-10, 0, -8], [0, 0, 14], [16, 0, 0], [-16, 0, 0],
  ];
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 56),
    new THREE.MeshStandardMaterial({ color: 0x0a0814, roughness: 0.9, metalness: 0.08 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, 56, 1, 56));

  // alley buildings
  const rows = [-18, -10, 10, 18];
  rows.forEach((z, ri) => {
    for (let i = -3; i <= 3; i++) {
      if (i === 0 && (ri === 1 || ri === 2)) continue;
      const x = i * 7;
      const h = 6 + ((i + ri) % 4) * 2.2;
      addBox(root, x, 0, z, 5.5, h, 4.5, 0x14101e, 0x000000, 0, true);
      const neon = (i + ri) % 2 === 0 ? 0xff2d9b : 0x00e8ff;
      addNeonSign(root, x, 3.2, z + (z > 0 ? -2.3 : 2.3), 3.8, 1.1, neon);
      if (h > 8) addNeonSign(root, x, 6.5, z + (z > 0 ? -2.3 : 2.3), 2.4, 0.7, neon === 0xff2d9b ? 0x00e8ff : 0xff2d9b);
    }
  });

  // center temple gate / stalls
  addBox(root, 0, 0, 0, 3.5, 5.5, 1.2, 0x2a1830, 0xff4dc8, 0.6, true);
  addBox(root, -2.4, 0, 0, 1.0, 5.5, 1.0, 0x221428, 0xffd36a, 0.8, true);
  addBox(root, 2.4, 0, 0, 1.0, 5.5, 1.0, 0x221428, 0xffd36a, 0.8, true);
  addBox(root, 0, 5.2, 0, 6.5, 0.6, 1.6, 0x301838, 0xff2d9b, 1.5, true);

  // market stalls
  [[-6, 4], [6, 4], [-6, -4], [6, -4], [0, 8], [0, -8]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 2.8, 1.2, 1.6, 0x1c1428, 0x000000, 0, true);
    addBox(root, x, 1.2, z, 3.0, 0.15, 1.8, 0x101018, i % 2 ? 0x00e8ff : 0xff2d9b, 1.8, false);
  });

  // side walls
  addBox(root, 0, 0, 26, 40, 5, 1, 0x100c18, 0xff2d9b, 0.3, true);
  addBox(root, 0, 0, -26, 40, 5, 1, 0x100c18, 0x00e8ff, 0.3, true);
  addBox(root, 26, 0, 0, 1, 5, 40, 0x100c18, 0x40f0ff, 0.25, true);
  addBox(root, -26, 0, 0, 1, 5, 40, 0x100c18, 0xff4dc8, 0.25, true);

  // hanging light strips along alley
  for (let i = -4; i <= 4; i++) {
    addBox(root, i * 4.5, 4.5, 0, 2.5, 0.12, 0.12, 0x080810, 0xff4dc8, 2.2, false);
  }
}


function buildNeonSignStreet(root) {
  // 霓虹招牌街 — densified Tong Lau alley (綠窗/冷氣/密霓虹/晾衫/黃的)
  spawnPoints = [
    [0, 0, 0], [6, 0, 10], [-6, 0, 10], [6, 0, -10],
    [-6, 0, -10], [0, 0, 16], [0, 0, -16], [4, 0, 4],
  ];
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 52),
    new THREE.MeshStandardMaterial({ color: 0x12101a, roughness: 0.28, metalness: 0.62 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, 48, 1, 52));

  // wet-ground neon reflections down the alley
  for (let i = -5; i <= 5; i++) {
    addBox(root, 0, 0.02, i * 4.2, 2.2, 0.04, 3.4, 0x080810, i % 2 ? 0xff2d9b : 0x00e8ff, 1.15, false);
  }
  // zebra crossing mid-alley
  addZebraCrossing(root, 0, 0, false);

  const neonPalette = [0xff2d9b, 0x00e8ff, 0xffd36a, 0xff4dc8, 0x40f0ff, 0xffa040];
  const facade = 0xe4ddd0; // rounded white Tong Lau feel
  const rowX = [-9.5, 9.5];
  rowX.forEach((bx, ri) => {
    for (let i = -4; i <= 4; i++) {
      const z = i * 5.2;
      const h = 7 + ((i + ri * 2) % 4) * 1.8;
      const toward = bx > 0 ? -1 : 1;
      // building mass — off-white Tong Lau
      addBox(root, bx, 0, z, 6.2, h, 4.6, facade, 0x000000, 0, true);
      // soft rounded corner hint (lighter edge strip)
      addBox(root, bx + toward * 3.05, 0, z, 0.18, h, 4.5, 0xf0ebe2, 0x000000, 0, false);
      // arcade / 騎樓 overhang
      addBox(root, bx + toward * 3.6, 3.2, z, 1.6, 0.22, 4.4, 0xd8d0c4, 0x000000, 0, true);
      addBox(root, bx + toward * 4.2, 0, z - 1.8, 0.4, 3.2, 0.4, 0xe8e2d8, 0x000000, 0, true);
      addBox(root, bx + toward * 4.2, 0, z + 1.8, 0.4, 3.2, 0.4, 0xe8e2d8, 0x000000, 0, true);

      const faceX = bx + toward * 3.15;
      // 綠窗框
      addGreenWindows(root, faceX, 3.6, z, Math.min(3, 1 + ((h / 4) | 0)), 2, toward, {
        winW: 0.9, winH: 1.0, gapX: 1.35, gapY: 1.7,
      });
      // 外掛冷氣 under a few windows
      if ((i + ri) % 2 === 0) addACUnit(root, faceX, 3.1, z - 0.55, toward);
      if ((i + ri) % 3 === 0) addACUnit(root, faceX, 4.8, z + 0.7, toward);

      // 直寫牆字 on pillars / between floors (locked copy)
      const wallTxt = ZH_WALL[(i + ri + 4) % ZH_WALL.length];
      addZhPanel(root, faceX + toward * 0.02, 5.5 + (i % 2) * 0.2, z + (ri ? 1.6 : -1.6), 0.12, 2.2, 0.55, wallTxt, {
        vertical: true, bg: '#e8e0d4', fg: '#8b1515', emissive: 0x401010, emitInt: 0.15, rotY: 0,
      });

      // pillar vertical red shop signs
      const banner = ZH_BANNERS[(i + ri * 2) % ZH_BANNERS.length];
      addZhPanel(root, bx + toward * 4.2, 0.4, z + (ri ? -1.8 : 1.8), 0.12, 2.4, 0.42, banner, {
        vertical: true, bg: '#b01028', fg: '#fff4d0', emissive: 0xff2d3a, emitInt: 1.2,
      });

      // dense horizontal neon boards
      const c0 = neonPalette[(i + 4 + ri * 5) % neonPalette.length];
      const c1 = neonPalette[(i + 6 + ri * 3) % neonPalette.length];
      const c2 = neonPalette[(i + 1 + ri) % neonPalette.length];
      addNeonSign(root, faceX, 4.0 + (i % 3) * 0.15, z - 0.9, 2.6 + (i % 2) * 0.4, 0.95, c0);
      addNeonSign(root, faceX, 5.4, z + 0.85, 1.8, 0.7, c1);
      if (h > 9) addNeonSign(root, faceX, 7.2, z, 2.2, 0.55, c2);

      // 密排垂直霓虹 strips (red / cyan / amber)
      const stripCols = [0xff2d3a, 0x00e8ff, 0xffd36a];
      for (let s = 0; s < 3; s++) {
        const sc = stripCols[(i + s + ri) % 3];
        addBox(root, faceX, 2.0 + s * 0.15, z + (ri ? -1.9 : 1.9) + s * 0.35, 0.1, 3.8 + s * 0.4, 0.1, 0x080810, sc, 2.6, false);
      }
    }
  });

  // hero vertical neon: 富龍大茶樓
  addZhPanel(root, -5.8, 2.2, -2.5, 0.55, 4.6, 0.22, ZH_VERT_NEON, {
    vertical: true, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 2.4,
  });
  addZhPanel(root, 5.8, 2.4, 4.0, 0.5, 4.2, 0.2, ZH_VERT_NEON, {
    vertical: true, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 2.2,
  });

  // horizontal banner boards with locked names
  addZhPanel(root, 0, 4.6, -8.5, 3.6, 0.7, 0.16, ZH_BANNERS[0], {
    vertical: false, bg: '#0a3a7a', fg: '#ffffff', emissive: 0x2080ff, emitInt: 1.8,
  });
  addZhPanel(root, 0, 5.0, 8.5, 2.8, 0.55, 0.14, ZH_BANNERS[1], {
    vertical: false, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 1.7,
  });

  // 竹竿晾衫 spanning overhead
  for (let i = -4; i <= 4; i++) {
    addLaundrySpan(root, -6.2, i * 4.5, 6.2, 5.0 + (i % 3) * 0.35);
    if (i % 2 === 0) addLaundrySpan(root, -5.5, i * 4.5 + 1.2, 5.5, 5.8);
  }

  // mid-alley cover: dumpsters / planters + 紅膠凳 + 垃圾桶
  [[-2.5, 6], [2.5, -6], [0, 12], [0, -12], [-2.2, -2], [2.2, 2]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 1.6, 1.1 + (i % 2) * 0.4, 1.4, 0x1c2430, 0x000000, 0, true);
    if (i % 2 === 0) addBox(root, x, 1.15, z, 1.5, 0.08, 1.3, 0x101018, i % 4 ? 0xffd36a : 0xff2d9b, 1.4, false);
  });
  [[-1.8, 4], [1.6, -3.5], [-1.2, 9], [1.4, -9], [0.8, 1.5], [-0.9, -5]].forEach(([x, z], i) => {
    addRedStool(root, x, z, i % 3 !== 0);
  });
  [[-2.8, 8], [2.6, -8], [-2.4, -14], [2.2, 14]].forEach(([x, z], i) => addTrashBin(root, x, z, i));

  // 黃的 — yellow HK taxi cover (collision)
  addYellowTaxi(root, 2.4, -15.5, 0);
  addYellowTaxi(root, -2.6, 15.2, Math.PI);

  // === HANGING SIGN CANYON (day ref: overlapping boards fill upper 2/3) ===
  const hangStyles = [
    { bg: '#b01028', fg: '#fff4d0', em: 0xff2d3a },
    { bg: '#0a3a7a', fg: '#ffffff', em: 0x2080ff },
    { bg: '#0d5c3a', fg: '#ffe8a0', em: 0x40f080 },
    { bg: '#f0e8d8', fg: '#8b1515', em: 0x401010 },
    { bg: '#1a1a22', fg: '#ff4dc8', em: 0xff2d9b },
    { bg: '#c47800', fg: '#ffffff', em: 0xffa040 },
  ];
  const hangTexts = [...ZH_BANNERS, ...ZH_WALL, ZH_VERT_NEON];
  for (let side = 0; side < 2; side++) {
    const toward = side === 0 ? 1 : -1;
    const baseX = side === 0 ? -5.4 : 5.4;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 9; col++) {
        const z = -18 + col * 4.4 + (row % 2) * 0.7 + side * 0.35;
        const y = 3.4 + row * 0.95 + ((col + side) % 3) * 0.2;
        const st = hangStyles[(col + row * 2 + side) % hangStyles.length];
        const txt = hangTexts[(col + row + side * 3) % hangTexts.length];
        const w = 1.4 + (col % 3) * 0.55;
        const h = 0.45 + (row % 2) * 0.2;
        const x = baseX + toward * (0.4 + (row % 3) * 0.35 + (col % 2) * 0.25);
        addHangSign(root, x, y, z, w, h, txt, {
          bg: st.bg, fg: st.fg, emissive: st.em, emitInt: 1.35 + (row % 3) * 0.25,
        });
      }
    }
  }
  // vertical drain pipes + cable clutter along façades
  for (let i = -4; i <= 4; i++) {
    addBox(root, -6.2, 0, i * 5.2, 0.12, 8.5, 0.12, 0x3a4048, 0x000000, 0, false);
    addBox(root, 6.2, 0, i * 5.2 + 1.1, 0.12, 9.0, 0.12, 0x3a4048, 0x000000, 0, false);
    // cable strands
    addBox(root, 0, 6.8 + (i % 3) * 0.15, i * 4.5, 11, 0.04, 0.04, 0x1a1a20, 0x000000, 0, false);
  }
  // extra ACs packed on mid façades
  for (let i = -3; i <= 3; i++) {
    addACUnit(root, -6.1, 2.4 + (i % 3) * 1.5, i * 5.5, 1);
    addACUnit(root, 6.1, 3.0 + ((i + 1) % 3) * 1.4, i * 5.5 + 0.8, -1);
  }
  // shopfront clutter: crates, stool clusters, menu boards
  [[-3.2, 3], [3.0, -4], [-3.4, -7], [3.2, 7], [-3.0, 11], [2.8, -11]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 0.9, 0.7 + (i % 2) * 0.3, 0.7, 0x5a4030, 0x000000, 0, true);
    addRedStool(root, x + 0.7, z + 0.4, true);
    if (i % 2 === 0) {
      const bt = ZH_BANNERS[i % ZH_BANNERS.length];
      addZhPanel(root, x, 1.0, z, 0.9, 0.55, 0.08, bt, {
        vertical: false, bg: '#f0e8d8', fg: '#8b1515', emissive: 0x301010, emitInt: 0.2,
      });
    }
  });

    // end walls
  addBox(root, 0, 0, 24, 28, 6, 1.2, 0x100c18, 0xff2d9b, 0.35, true);
  addBox(root, 0, 0, -24, 28, 6, 1.2, 0x100c18, 0x00e8ff, 0.35, true);
  addBox(root, 16, 0, 0, 1.2, 6, 48, 0x100c18, 0x40f0ff, 0.2, true);
  addBox(root, -16, 0, 0, 1.2, 6, 48, 0x100c18, 0xff4dc8, 0.2, true);

  // hanging cross-street neon wires + denser strips
  for (let i = -4; i <= 4; i++) {
    addBox(root, 0, 5.2, i * 4.5, 14, 0.06, 0.06, 0x080810, 0xff4dc8, 1.8, false);
    addBox(root, -3 + (i % 3), 4.8, i * 4.5, 0.5, 0.5, 0.12, 0x111118, i % 2 ? 0x00e8ff : 0xffd36a, 2.6, false);
    addBox(root, 2.5 - (i % 2), 6.0, i * 4.5, 0.1, 2.8, 0.1, 0x080810, i % 3 === 0 ? 0xff2d3a : 0x00e8ff, 2.4, false);
  }
}

function buildEstateRoof(root) {
  // 公屋天台 — water tanks, denser 晾衫, 冷氣, iron gates (no new map)
  spawnPoints = [
    [0, 0, 0], [12, 0, 10], [-12, 0, 10], [12, 0, -10],
    [-12, 0, -10], [0, 0, 16], [18, 0, 0], [-18, 0, 0],
  ];
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(56, 56),
    new THREE.MeshStandardMaterial({ color: 0x2a2e36, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, 56, 1, 56));

  // rooftop parapet walls
  addBox(root, 0, 0, 26, 52, 1.4, 0.8, 0x3a4048, 0x000000, 0, true);
  addBox(root, 0, 0, -26, 52, 1.4, 0.8, 0x3a4048, 0x000000, 0, true);
  addBox(root, 26, 0, 0, 0.8, 1.4, 52, 0x3a4048, 0x000000, 0, true);
  addBox(root, -26, 0, 0, 0.8, 1.4, 52, 0x3a4048, 0x000000, 0, true);
  for (let i = -5; i <= 5; i++) {
    addBox(root, i * 4.5, 1.35, 26, 3.5, 0.08, 0.2, 0x101018, 0xffd36a, 1.2, false);
    addBox(root, i * 4.5, 1.35, -26, 3.5, 0.08, 0.2, 0x101018, 0x00e8ff, 1.0, false);
  }

  // stair/machine rooms — off-white with green window hints
  [[-16, -14], [14, -12], [-14, 14], [16, 12], [0, -18]].forEach(([x, z], i) => {
    const h = 3.2 + (i % 2) * 1.2;
    addBox(root, x, 0, z, 5.5, h, 4.5, 0xd8d4cc, 0x000000, 0, true);
    addBox(root, x, h, z, 5.8, 0.25, 4.8, 0x2a3038, 0x000000, 0, true);
    addBox(root, x + (i % 2 ? 2.6 : -2.6), 0.2, z, 0.15, 2.0, 1.2, 0x101018, i % 2 ? 0xff2d9b : 0x40f0ff, 1.6, false);
    addGreenWindows(root, x + (i % 2 ? 2.75 : -2.75), 1.4, z, 1, 2, i % 2 ? 1 : -1, {
      winW: 0.75, winH: 0.9, gapX: 1.1, gapY: 1.4,
    });
  });

  // water tanks
  [[-8, 8], [10, 6], [-6, -8], [8, -6]].forEach(([x, z]) => {
    addBox(root, x, 0, z, 3.2, 2.8, 3.2, 0x5a6870, 0x000000, 0, true);
    addBox(root, x, 2.8, z, 3.4, 0.2, 3.4, 0x3a4850, 0x40f0ff, 0.4, true);
    addBox(root, x, 0, z, 0.5, 3.4, 0.5, 0x2a3038, 0x000000, 0, true);
  });

  // denser 竹竿晾衫 racks
  [[-4, 0], [4, 4], [0, -4], [-10, -2], [12, -14], [8, 10], [-14, 4], [2, 12]].forEach(([x, z], i) => {
    addBox(root, x - 2.5, 0, z, 0.15, 2.4, 0.15, 0x8890a0, 0x000000, 0, true);
    addBox(root, x + 2.5, 0, z, 0.15, 2.4, 0.15, 0x8890a0, 0x000000, 0, true);
    addLaundrySpan(root, x - 2.4, z, x + 2.4, 2.2);
    if (i % 2 === 0) addLaundrySpan(root, x - 2.2, z + 0.25, x + 2.2, 1.85);
  });

  // iron gate / fence mid cover
  [[0, 8], [0, -10], [-18, 0], [18, 4]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, i < 2 ? 8 : 0.2, 2.2, i < 2 ? 0.2 : 8, 0x1a2030, 0x000000, 0, true);
    addBox(root, x, 2.0, z, i < 2 ? 8.2 : 0.25, 0.12, i < 2 ? 0.25 : 8.2, 0x101018, 0xffd36a, 1.3, false);
  });

  // more 外掛冷氣 / vent cover
  [[6, 14], [-12, 6], [14, -4], [-4, 16], [4, -16], [-8, -14], [10, 16], [-16, -6]].forEach(([x, z]) => {
    addBox(root, x, 0, z, 1.8, 1.2, 1.4, 0x3a4450, 0x000000, 0, true);
  });

  // 紅膠凳 + 垃圾桶 clutter
  [[-2, 3], [3, -2], [7, 8], [-9, 2]].forEach(([x, z], i) => addRedStool(root, x, z, true));
  [[5, -12], [-7, 12], [15, 2]].forEach(([x, z], i) => addTrashBin(root, x, z, i));

  // night sky glow posts
  for (let i = -2; i <= 2; i++) {
    addBox(root, i * 10, 0, 24.5, 0.25, 4.5, 0.25, 0x2a3038, 0x000000, 0, true);
    addBox(root, i * 10, 4.3, 24.5, 0.8, 0.2, 0.8, 0x101018, 0xffd36a, 2.2, false);
  }
}

function buildTeahouseBack(root) {
  // 茶餐廳後巷 — white Tong Lau, 綠窗, pillar 直寫, 富龍 neon, 黃的, stools
  spawnPoints = [
    [0, 0, 0], [5, 0, 8], [-5, 0, 8], [5, 0, -8],
    [-5, 0, -8], [0, 0, 14], [8, 0, 0], [-8, 0, 0],
  ];
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 48),
    new THREE.MeshStandardMaterial({ color: 0x1a1420, roughness: 0.55, metalness: 0.25 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, 40, 1, 48));

  // 花磚 checker
  for (let ix = -3; ix <= 3; ix++) {
    for (let iz = -4; iz <= 4; iz++) {
      if ((ix + iz) % 2 !== 0) continue;
      addBox(root, ix * 2.4, 0.03, iz * 2.4, 1.1, 0.04, 1.1, 0x2a1830, (ix + iz) % 4 === 0 ? 0xff4dc8 : 0x40f0ff, 0.45, false);
    }
  }
  addZebraCrossing(root, 0, -6, true);

  const facade = 0xe8e2d6;
  const wallX = [-7.5, 7.5];
  wallX.forEach((bx, ri) => {
    for (let i = -3; i <= 3; i++) {
      const z = i * 5.5;
      const h = 6 + ((i + ri) % 3) * 2;
      addBox(root, bx, 0, z, 5.5, h, 4.8, facade, 0x000000, 0, true);
      const toward = bx > 0 ? -1 : 1;
      const faceX = bx + toward * 2.8;
      // 綠窗框
      addGreenWindows(root, faceX, 3.2, z, 2, 2, toward, {
        winW: 0.85, winH: 1.0, gapX: 1.25, gapY: 1.65,
      });
      if ((i + ri) % 2 === 0) addACUnit(root, faceX, 2.7, z - 0.6, toward);
      if ((i + ri) % 3 !== 0) addACUnit(root, faceX, 4.5, z + 0.5, toward);

      // pillar 直寫牆字
      const wallTxt = ZH_WALL[(i + ri + 2) % ZH_WALL.length];
      addZhPanel(root, faceX, 1.2, z + (ri ? 1.7 : -1.7), 0.1, 2.4, 0.5, wallTxt, {
        vertical: true, bg: '#e8e0d4', fg: '#8b1515', emissive: 0x301010, emitInt: 0.12,
      });
      const banner = ZH_BANNERS[(i + ri) % ZH_BANNERS.length];
      addZhPanel(root, faceX, 0.3, z + (ri ? -1.9 : 1.9), 0.12, 2.0, 0.38, banner, {
        vertical: true, bg: '#b01028', fg: '#fff4d0', emissive: 0xff2d3a, emitInt: 1.1,
      });

      const neon = [0xff2d9b, 0x00e8ff, 0xffd36a][(i + ri + 3) % 3];
      const halfW = 1.2 + (i % 2) * 0.6;
      addNeonSign(root, faceX, 3.0 + (i % 2) * 0.4, z - 0.5, halfW, 0.85, neon);
      if (i % 2 === 0) {
        addBox(root, faceX, 4.6, z + 1.0, 0.9, 0.55, 0.12, 0x111118, neon, 1.6, false);
        addBox(root, faceX + toward * 0.1, 5.1, z + 1.0, 0.08, 0.5, 0.08, 0x080810, neon, 1.0, false);
      }
      // kitchen vent
      addBox(root, faceX, 1.6, z + 1.5, 1.4, 0.9, 0.2, 0x101018, 0xffa040, 0.8, false);
      // vertical neon strips
      addBox(root, faceX, 2.0, z + (ri ? -2.0 : 2.0), 0.1, 3.4, 0.1, 0x080810, neon, 2.3, false);
    }
  });

  // 富龍大茶樓 hero neon
  addZhPanel(root, -4.6, 1.8, 3.5, 0.5, 4.0, 0.2, ZH_VERT_NEON, {
    vertical: true, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 2.5,
  });
  addZhPanel(root, 0, 3.8, -3.2, 2.6, 0.55, 0.14, ZH_BANNERS[0], {
    vertical: false, bg: '#0a3a7a', fg: '#ffffff', emissive: 0x2080ff, emitInt: 1.7,
  });

  // light laundry overhead
  for (let i = -2; i <= 2; i++) {
    addLaundrySpan(root, -4.5, i * 6, 4.5, 4.6 + (i % 2) * 0.3);
  }

  // trash / crates + 紅膠凳
  [[-2, 5], [2.2, -4], [0, 10], [-2.5, -10], [2.5, 2], [-1.5, -1], [1.8, 14], [-2, -14]].forEach(([x, z], i) => {
    const h = 1.0 + (i % 3) * 0.35;
    addBox(root, x, 0, z, 1.5, h, 1.3, i % 2 ? 0x2a4030 : 0x243040, 0x000000, 0, true);
    if (i % 3 === 0) addBox(root, x, h, z, 1.55, 0.08, 1.35, 0x101018, 0xff2d9b, 0.9, false);
  });
  [[-1.4, 3], [1.2, -2.5], [-0.8, 7], [1.5, -7]].forEach(([x, z], i) => addRedStool(root, x, z, true));
  [[-2.6, 12], [2.4, -12], [2.0, 6]].forEach(([x, z], i) => addTrashBin(root, x, z, i));

  // 黃的 at alley end
  addYellowTaxi(root, 0, 17.5, Math.PI / 2);

  // back kitchen doorway
  addBox(root, 0, 0, 0, 2.2, 2.6, 0.8, 0x221828, 0xff4dc8, 0.35, true);
  addBox(root, 0, 2.5, 0, 2.6, 0.15, 1.0, 0x101018, 0xffd36a, 1.5, false);

  // alley end walls
  addBox(root, 0, 0, 22, 24, 5, 1, 0x100c18, 0xff2d9b, 0.3, true);
  addBox(root, 0, 0, -22, 24, 5, 1, 0x100c18, 0x00e8ff, 0.3, true);
  addBox(root, 13, 0, 0, 1, 5, 44, 0x100c18, 0x40f0ff, 0.2, true);
  addBox(root, -13, 0, 0, 1, 5, 44, 0x100c18, 0xff4dc8, 0.2, true);

  for (let i = -3; i <= 3; i++) {
    addBox(root, 0, 4.2, i * 5, 10, 0.08, 0.08, 0x080810, i % 2 ? 0xff4dc8 : 0x40f0ff, 1.5, false);
  }
}

function makeBotMesh(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.1, 0.45),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25, roughness: 0.6 })
  );
  body.position.y = 0.95;
  g.add(body);
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.42, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x1a2030, emissive: 0x40f0ff, emissiveIntensity: 0.5 })
  );
  head.position.y = 1.7;
  g.add(head);
  const gun = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x222830, metalness: 0.6, roughness: 0.4 })
  );
  gun.position.set(0.35, 1.15, -0.35);
  g.add(gun);
  return g;
}

function classById(id) {
  return CLASSES.find((c) => c.id === id) || CLASSES[0];
}

function randomSpawn() {
  const p = spawnPoints[(Math.random() * spawnPoints.length) | 0] || [0, 0, 0];
  return { x: p[0] + (Math.random() - 0.5) * 2, y: PLAYER_HEIGHT, z: p[2] + (Math.random() - 0.5) * 2 };
}

function spawnBots(root) {
  bots.forEach((b) => root.remove(b.mesh));
  bots = [];
  const colors = [0xff4dc8, 0x40f0ff, 0xffd36a, 0x7dff9a, 0xff6a8a, 0xa78bfa, 0xf472b6];
  const classPool = CLASSES;
  for (let i = 0; i < BOT_COUNT; i++) {
    const cls = classPool[i % classPool.length];
    const sp = randomSpawn();
    const mesh = makeBotMesh(colors[i % colors.length]);
    mesh.position.set(sp.x, 0, sp.z);
    root.add(mesh);
    bots.push({
      mesh,
      x: sp.x, y: PLAYER_HEIGHT, z: sp.z,
      vx: 0, vz: 0, vy: 0,
      hp: cls.hp,
      maxHp: cls.hp,
      cls,
      name: `BOT-${cls.nameEn}-${i + 1}`,
      shootCd: 0.5 + Math.random(),
      aimYaw: 0,
      stateT: 0,
      mode: 'chase',
      alive: true,
      respawnT: 0,
    });
  }
}

function initRenderer() {
  if (renderer) return;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
  } catch (err) {
    console.warn('WebGL init failed', err);
    renderer = null;
    clock = new THREE.Clock();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x050818, 1);
  clock = new THREE.Clock();
}

function buildWorld(mapId) {
  solidBoxes = [];
  neonMats = [];
  if (scene) {
    while (scene.children.length) scene.remove(scene.children[0]);
  }
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050818);
  scene.fog = new THREE.FogExp2(0x050818, 0.012);

  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.08, 200);
  camera.position.set(0, PLAYER_HEIGHT, 0);

  const hemi = new THREE.HemisphereLight(0x80a0ff, 0x201030, 1.45);
  scene.add(hemi);
  const amb = new THREE.AmbientLight(0x405080, 0.75);
  scene.add(amb);
  const key = new THREE.DirectionalLight(0xffa0d0, 0.65);
  key.position.set(10, 20, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x40f0ff, 0.45);
  fill.position.set(-12, 14, -10);
  scene.add(fill);

  // stars / city glow points
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  for (let i = 0; i < 400; i++) {
    starPos.push((Math.random() - 0.5) * 180, 20 + Math.random() * 60, (Math.random() - 0.5) * 180);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xaaccff, size: 0.35 })));

  const root = new THREE.Group();
  scene.add(root);
  if (mapId === 'temple') buildNeonTemple(root);
  else if (mapId === 'signs') buildNeonSignStreet(root);
  else if (mapId === 'estate') buildEstateRoof(root);
  else if (mapId === 'teahouse') buildTeahouseBack(root);
  else buildCargoPier(root);

  // viewmodel gun
  gunMesh = new THREE.Group();
  const barrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x1a2030, metalness: 0.7, roughness: 0.35 })
  );
  barrel.position.set(0.22, -0.18, -0.45);
  gunMesh.add(barrel);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.16, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x2a3040, emissive: 0x40f0ff, emissiveIntensity: 0.35 })
  );
  body.position.set(0.22, -0.2, -0.22);
  gunMesh.add(body);
  muzzleFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe080 })
  );
  muzzleFlash.position.set(0.22, -0.18, -0.75);
  muzzleFlash.visible = false;
  gunMesh.add(muzzleFlash);
  camera.add(gunMesh);
  scene.add(camera);

  spawnBots(root);
}

function resize() {
  if (!renderer || !camera) return;
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
addEventListener('resize', resize);

function collideXZ(x, z, y, radius) {
  let nx = x, nz = z;
  for (const b of solidBoxes) {
    if (y + 0.2 < b.minY || y - PLAYER_HEIGHT + 0.3 > b.maxY) continue;
    const cx = Math.max(b.minX, Math.min(nx, b.maxX));
    const cz = Math.max(b.minZ, Math.min(nz, b.maxZ));
    let dx = nx - cx, dz = nz - cz;
    const dist2 = dx * dx + dz * dz;
    if (dist2 < radius * radius) {
      if (dist2 < 1e-8) { dx = radius; dz = 0; }
      const dist = Math.sqrt(dx * dx + dz * dz) || radius;
      const push = radius - dist;
      nx += (dx / dist) * push;
      nz += (dz / dist) * push;
    }
  }
  // soft bounds
  const lim = state.mapId === 'temple' || state.mapId === 'signs' || state.mapId === 'teahouse'
    ? 22
    : state.mapId === 'estate' ? 25 : 36;
  nx = Math.max(-lim, Math.min(lim, nx));
  nz = Math.max(-lim, Math.min(lim, nz));
  return { x: nx, z: nz };
}

function groundYAt(x, z) {
  let gy = 0;
  for (const b of solidBoxes) {
    if (b.minY >= 0.5) continue; // floor slabs only roughly
    if (x >= b.minX - 0.2 && x <= b.maxX + 0.2 && z >= b.minZ - 0.2 && z <= b.maxZ + 0.2) {
      if (b.maxY <= 0.2) gy = Math.max(gy, b.maxY);
    }
  }
  // stand on tops of boxes if feet near
  for (const b of solidBoxes) {
    if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
      if (state.y - PLAYER_HEIGHT <= b.maxY + 0.35 && state.y - PLAYER_HEIGHT >= b.maxY - 0.2 && state.vy <= 0) {
        gy = Math.max(gy, b.maxY);
      }
    }
  }
  return gy;
}

function applyPlayerPhysics(dt) {
  const cls = classById(state.classId);
  const wish = new THREE.Vector3();
  if (keys.KeyW || keys.ArrowUp) wish.z -= 1;
  if (keys.KeyS || keys.ArrowDown) wish.z += 1;
  if (keys.KeyA || keys.ArrowLeft) wish.x -= 1;
  if (keys.KeyD || keys.ArrowRight) wish.x += 1;

  const crouchHeld = !!(keys.KeyC || keys.ControlLeft || keys.ControlRight);
  state.crouching = crouchHeld && state.onGround && !state.sliding;

  // start slide: crouch while moving fast on ground
  const speedXZ = Math.hypot(state.vx, state.vz);
  if (crouchHeld && state.onGround && speedXZ > 6 && !state.sliding) {
    state.sliding = true;
    state.slideT = SLIDE_DURATION;
    const boost = SLIDE_BOOST;
    if (speedXZ > 0.1) {
      state.vx = (state.vx / speedXZ) * cls.speed * boost;
      state.vz = (state.vz / speedXZ) * cls.speed * boost;
    } else {
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      state.vx = fx * cls.speed * boost;
      state.vz = fz * cls.speed * boost;
    }
  }
  if (state.sliding) {
    state.slideT -= dt;
    if (state.slideT <= 0 || !crouchHeld || !state.onGround) state.sliding = false;
  }
  slideTag.classList.toggle('on', state.sliding);

  let targetSpeed = cls.speed;
  if (state.crouching) targetSpeed *= 0.55;
  if (state.sliding) targetSpeed = cls.speed * SLIDE_BOOST;

  if (wish.lengthSq() > 0) {
    wish.normalize();
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    const wx = wish.x * cy + wish.z * sy;
    const wz = -wish.x * sy + wish.z * cy;
    const accel = state.onGround ? 38 : 12;
    state.vx += wx * accel * dt;
    state.vz += wz * accel * dt;
  } else if (state.onGround && !state.sliding) {
    state.vx *= Math.pow(0.01, dt);
    state.vz *= Math.pow(0.01, dt);
  } else {
    state.vx *= Math.pow(0.3, dt);
    state.vz *= Math.pow(0.3, dt);
  }

  const maxSp = state.sliding ? cls.speed * SLIDE_BOOST * 1.05 : (state.onGround ? targetSpeed : targetSpeed * 1.15);
  const sp = Math.hypot(state.vx, state.vz);
  if (sp > maxSp) {
    state.vx = (state.vx / sp) * maxSp;
    state.vz = (state.vz / sp) * maxSp;
  }

  if ((keys.Space) && state.onGround) {
    state.vy = cls.jump;
    state.onGround = false;
    // slide-hop lite: keep some horizontal if sliding/crouch
    if (crouchHeld) {
      const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      state.vx += fx * 2.5;
      state.vz += fz * 2.5;
    }
    keys.Space = false;
  }

  state.vy -= GRAVITY * dt;
  state.y += state.vy * dt;

  let eyeH = state.crouching || state.sliding ? CROUCH_HEIGHT : PLAYER_HEIGHT;
  const feet = state.y - eyeH;
  // land on ground / boxes
  let landY = 0;
  for (const b of solidBoxes) {
    if (state.x > b.minX && state.x < b.maxX && state.z > b.minZ && state.z < b.maxZ) {
      if (feet <= b.maxY + 0.15 && feet >= b.maxY - 0.55 && state.vy <= 0) {
        landY = Math.max(landY, b.maxY);
      }
    }
  }
  if (feet <= landY && state.vy <= 0) {
    state.y = landY + eyeH;
    state.vy = 0;
    state.onGround = true;
  } else {
    state.onGround = false;
  }

  // ceiling soft clamp
  if (state.y > 28) { state.y = 28; state.vy = 0; }

  const nx = state.x + state.vx * dt;
  const nz = state.z + state.vz * dt;
  const c = collideXZ(nx, nz, state.y, PLAYER_RADIUS);
  state.x = c.x;
  state.z = c.z;
}

function updateCamera() {
  const eyeH = state.crouching || state.sliding ? CROUCH_HEIGHT : PLAYER_HEIGHT;
  // keep y as eye height already
  camera.position.set(state.x, state.y, state.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
  if (gunMesh) {
    const bob = running ? Math.sin(performance.now() * 0.012) * (state.sliding ? 0.01 : 0.012) : 0;
    gunMesh.position.set(0, bob, 0);
  }
}

function rayHitscan(ox, oy, oz, dx, dy, dz, maxDist, ignoreBot) {
  // DDA-ish against bots (spheres) + box solids for walls
  let hitBot = null;
  let hitDist = maxDist;
  let hitPoint = null;

  for (const b of bots) {
    if (!b.alive || b === ignoreBot) continue;
    // sphere at chest
    const bx = b.x, by = b.y - 0.35, bz = b.z;
    const r = 0.55;
    const ocx = ox - bx, ocy = oy - by, ocz = oz - bz;
    const bcoef = ocx * dx + ocy * dy + ocz * dz;
    const ccoef = ocx * ocx + ocy * ocy + ocz * ocz - r * r;
    const disc = bcoef * bcoef - ccoef;
    if (disc < 0) continue;
    const t = -bcoef - Math.sqrt(disc);
    if (t > 0.05 && t < hitDist) {
      hitDist = t;
      hitBot = b;
      hitPoint = { x: ox + dx * t, y: oy + dy * t, z: oz + dz * t };
    }
  }

  // wall check — step along ray
  const steps = Math.ceil(Math.min(hitDist, maxDist) / 0.35);
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * Math.min(hitDist, maxDist);
    const px = ox + dx * t, py = oy + dy * t, pz = oz + dz * t;
    for (const box of solidBoxes) {
      if (px >= box.minX && px <= box.maxX && py >= box.minY && py <= box.maxY && pz >= box.minZ && pz <= box.maxZ) {
        // blocked before bot
        if (t < hitDist - 0.05) {
          return { bot: null, dist: t, point: { x: px, y: py, z: pz } };
        }
      }
    }
  }
  return { bot: hitBot, dist: hitDist, point: hitPoint };
}

function dirFromAngles(y, p) {
  const cp = Math.cos(p), sp = Math.sin(p);
  return {
    dx: -Math.sin(y) * cp,
    dy: sp,
    dz: -Math.cos(y) * cp,
  };
}

function feedKill(text) {
  const el = document.createElement('div');
  el.textContent = text;
  killfeed.prepend(el);
  while (killfeed.children.length > 5) killfeed.removeChild(killfeed.lastChild);
  setTimeout(() => el.remove(), 3500);
}

function showHit() {
  hitmark.style.opacity = '1';
  clearTimeout(showHit._t);
  showHit._t = setTimeout(() => { hitmark.style.opacity = '0'; }, 120);
}

function damageBot(bot, dmg, fromPlayer) {
  if (!bot.alive) return;
  bot.hp -= dmg;
  showHit();
  // blood burst
  bloodBursts.push({ x: bot.x, y: bot.y - 0.2, z: bot.z, t: 0.25 });
  if (bot.hp <= 0) {
    bot.alive = false;
    bot.respawnT = 1.6;
    bot.mesh.visible = false;
    if (fromPlayer) {
      state.kills += 1;
      feedKill(`你 擊殺了 ${bot.name}`);
      document.getElementById('kills').textContent = String(state.kills);
      if (state.kills >= WIN_KILLS) endMatch(true);
    }
  }
}

function damagePlayer(dmg, byName) {
  if (state.invuln > 0 || matchOver || !running) return;
  state.hp -= dmg;
  dmgFlash.style.opacity = '1';
  setTimeout(() => { dmgFlash.style.opacity = '0'; }, 120);
  document.getElementById('hp').textContent = String(Math.max(0, state.hp | 0));
  if (state.hp <= 0) {
    state.deaths += 1;
    document.getElementById('deaths').textContent = String(state.deaths);
    feedKill(`${byName || 'BOT'} 擊殺了 你`);
    respawnPlayer();
  }
}

function respawnPlayer() {
  const sp = randomSpawn();
  const cls = classById(state.classId);
  state.x = sp.x; state.y = PLAYER_HEIGHT; state.z = sp.z;
  state.vx = state.vz = state.vy = 0;
  state.hp = cls.hp;
  state.ammo = cls.mag;
  state.reserve = cls.reserve;
  state.reloading = false;
  state.invuln = 1.5;
  state.sliding = false;
  document.getElementById('hp').textContent = String(state.hp);
  document.getElementById('ammo').textContent = String(state.ammo);
  document.getElementById('reserve').textContent = String(state.reserve);
}

function tryShoot(dt) {
  const cls = classById(state.classId);
  state.shootCd = Math.max(0, state.shootCd - dt);
  if (state.reloading) {
    state.reloadT -= dt;
    if (state.reloadT <= 0) {
      const need = cls.mag - state.ammo;
      const take = Math.min(need, state.reserve);
      state.ammo += take;
      state.reserve -= take;
      state.reloading = false;
      document.getElementById('ammo').textContent = String(state.ammo);
      document.getElementById('reserve').textContent = String(state.reserve);
    }
    return;
  }
  if (!(keys.Mouse0 || keys.shoot) || state.shootCd > 0 || state.ammo <= 0) {
    if ((keys.Mouse0 || keys.shoot) && state.ammo <= 0) startReload();
    return;
  }
  state.ammo -= 1;
  document.getElementById('ammo').textContent = String(state.ammo);
  state.shootCd = 1 / cls.firerate;
  if (muzzleFlash) {
    muzzleFlash.visible = true;
    setTimeout(() => { if (muzzleFlash) muzzleFlash.visible = false; }, 40);
  }

  const eye = { x: state.x, y: state.y, z: state.z };
  for (let p = 0; p < cls.pellets; p++) {
    const sy = yaw + (Math.random() - 0.5) * cls.spread * 2;
    const sp = pitch + (Math.random() - 0.5) * cls.spread * 2;
    const { dx, dy, dz } = dirFromAngles(sy, sp);
    const hit = rayHitscan(eye.x, eye.y, eye.z, dx, dy, dz, 120, null);
    if (hit.point) {
      bulletTraces.push({
        x0: eye.x, y0: eye.y, z0: eye.z,
        x1: hit.point.x, y1: hit.point.y, z1: hit.point.z,
        t: 0.08,
      });
    }
    if (hit.bot) {
      // distance falloff light
      const fall = Math.max(0.55, 1 - hit.dist / 100);
      damageBot(hit.bot, cls.damage * fall, true);
    }
  }
}

function startReload() {
  const cls = classById(state.classId);
  if (state.reloading || state.ammo >= cls.mag || state.reserve <= 0) return;
  state.reloading = true;
  state.reloadT = cls.reload;
}

function updateBots(dt) {
  for (const b of bots) {
    if (!b.alive) {
      b.respawnT -= dt;
      if (b.respawnT <= 0) {
        const sp = randomSpawn();
        b.x = sp.x; b.y = PLAYER_HEIGHT; b.z = sp.z;
        b.hp = b.maxHp;
        b.alive = true;
        b.mesh.visible = true;
        b.shootCd = 0.8;
      }
      continue;
    }

    b.stateT -= dt;
    const dx = state.x - b.x;
    const dz = state.z - b.z;
    const dist = Math.hypot(dx, dz) + 0.001;
    b.aimYaw = Math.atan2(-dx, -dz);

    // simple chase / strafe
    if (b.stateT <= 0) {
      b.mode = dist > 14 ? 'chase' : (Math.random() < 0.4 ? 'strafe' : 'chase');
      b.stateT = 0.6 + Math.random() * 1.2;
    }
    let wishX = 0, wishZ = 0;
    if (b.mode === 'chase') {
      wishX = dx / dist;
      wishZ = dz / dist;
    } else {
      wishX = -dz / dist;
      wishZ = dx / dist;
      if (dist > 10) { wishX += dx / dist; wishZ += dz / dist; }
    }
    const spd = b.cls.speed * 0.72;
    b.vx = wishX * spd;
    b.vz = wishZ * spd;
    const nx = b.x + b.vx * dt;
    const nz = b.z + b.vz * dt;
    const c = collideXZ(nx, nz, b.y, 0.4);
    b.x = c.x; b.z = c.z;
    b.mesh.position.set(b.x, 0, b.z);
    b.mesh.rotation.y = b.aimYaw;

    // shoot at player if LOS roughly
    b.shootCd -= dt;
    if (b.shootCd <= 0 && dist < 42) {
      b.shootCd = 1 / (b.cls.firerate * 0.55) + Math.random() * 0.15;
      const ey = b.y - 0.1;
      const dir = dirFromAngles(b.aimYaw + (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.05);
      // aim toward player vertical
      const pdy = state.y - ey;
      const len = Math.hypot(dx, pdy, dz);
      const rdx = dx / len, rdy = pdy / len, rdz = dz / len;
      const hit = rayHitscan(b.x, ey, b.z, rdx, rdy, rdz, 80, b);
      // if nothing solid closer than player distance, hit player
      const toPlayer = dist;
      if (!hit.bot && hit.dist >= toPlayer - 0.5) {
        // check wall before player
        let blocked = false;
        const steps = 20;
        for (let i = 1; i < steps; i++) {
          const t = (i / steps) * toPlayer;
          const px = b.x + rdx * t, py = ey + rdy * t, pz = b.z + rdz * t;
          for (const box of solidBoxes) {
            if (px >= box.minX && px <= box.maxX && py >= box.minY && py <= box.maxY && pz >= box.minZ && pz <= box.maxZ) {
              blocked = true; break;
            }
          }
          if (blocked) break;
        }
        if (!blocked && Math.random() < 0.55) {
          const dmg = b.cls.damage * (b.cls.pellets > 1 ? 2.2 : 1) * 0.35;
          damagePlayer(dmg, b.name);
        }
      }
      bulletTraces.push({
        x0: b.x, y0: ey, z0: b.z,
        x1: b.x + rdx * Math.min(hit.dist, 30),
        y1: ey + rdy * Math.min(hit.dist, 30),
        z1: b.z + rdz * Math.min(hit.dist, 30),
        t: 0.06,
      });
    }
  }
}

const traceMeshes = [];
function updateTraces(dt) {
  // recycle simple line meshes
  while (traceMeshes.length < bulletTraces.length) {
    const mat = new THREE.LineBasicMaterial({ color: 0xffe080, transparent: true, opacity: 0.85 });
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    traceMeshes.push(line);
  }
  for (let i = bulletTraces.length - 1; i >= 0; i--) {
    const tr = bulletTraces[i];
    tr.t -= dt;
    const line = traceMeshes[i];
    if (line) {
      const pos = line.geometry.attributes.position;
      pos.setXYZ(0, tr.x0, tr.y0, tr.z0);
      pos.setXYZ(1, tr.x1, tr.y1, tr.z1);
      pos.needsUpdate = true;
      line.visible = tr.t > 0;
      line.material.opacity = Math.max(0, tr.t * 10);
    }
    if (tr.t <= 0) bulletTraces.splice(i, 1);
  }
  for (let i = bulletTraces.length; i < traceMeshes.length; i++) {
    traceMeshes[i].visible = false;
  }
}

function formatTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const m = (s / 60) | 0;
  const r = s % 60;
  return m + ':' + String(r).padStart(2, '0');
}

function endMatch(wonByKills) {
  if (matchOver) return;
  matchOver = true;
  running = false;
  try { document.exitPointerLock(); } catch (_) {}
  hud.classList.remove('on');
  cross.classList.remove('on');
  document.getElementById('endTitle').textContent = wonByKills ? '勝利！' : '時間到';
  document.getElementById('endSub').textContent = wonByKills ? 'FIRST TO 20' : 'TIME UP';
  document.getElementById('endKills').textContent = String(state.kills);
  document.getElementById('endDeaths').textContent = String(state.deaths);
  document.getElementById('endKD').textContent = (state.kills / Math.max(1, state.deaths)).toFixed(1);
  overlay.classList.remove('hidden');
  showPanel('panelEnd');
}

function startMatch(mapId, classId) {
  initRenderer();
  state.mapId = mapId;
  state.classId = classId;
  selectedMap = mapId;
  selectedClass = classId;
  const cls = classById(classId);
  buildWorld(mapId);
  resize();

  const sp = randomSpawn();
  state.x = sp.x; state.y = PLAYER_HEIGHT; state.z = sp.z;
  state.vx = state.vz = state.vy = 0;
  state.hp = cls.hp;
  state.ammo = cls.mag;
  state.reserve = cls.reserve;
  state.kills = 0;
  state.deaths = 0;
  state.reloading = false;
  state.shootCd = 0;
  state.invuln = 1.2;
  state.sliding = false;
  state.timeLeft = MATCH_SECONDS;
  matchOver = false;
  running = true;
  yaw = 0; pitch = 0;

  document.getElementById('kills').textContent = '0';
  document.getElementById('deaths').textContent = '0';
  document.getElementById('hp').textContent = String(state.hp);
  document.getElementById('ammo').textContent = String(state.ammo);
  document.getElementById('reserve').textContent = String(state.reserve);
  document.getElementById('time').textContent = formatTime(state.timeLeft);
  killfeed.innerHTML = '';

  overlay.classList.add('hidden');
  hud.classList.add('on');
  cross.classList.add('on');

  canvas.focus();
  requestPointer();
  clock.getDelta();
}

function requestPointer() {
  try {
    canvas.requestPointerLock();
  } catch (_) {}
}

canvas.addEventListener('click', () => {
  if (running && !matchOver) requestPointer();
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (e) => {
  if (!running || !pointerLocked) return;
  const sens = 0.0022;
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-1.4, Math.min(1.4, pitch));
});

addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['Space', 'KeyC', 'ControlLeft', 'ControlRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyR' && running) startReload();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
addEventListener('mousedown', (e) => {
  if (e.button === 0) keys.Mouse0 = true;
});
addEventListener('mouseup', (e) => {
  if (e.button === 0) keys.Mouse0 = false;
});
// prevent context menu during play
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock ? clock.getDelta() : 0.016);
  if (!renderer || !scene) return;

  if (running && !matchOver) {
    state.invuln = Math.max(0, state.invuln - dt);
    state.timeLeft -= dt;
    document.getElementById('time').textContent = formatTime(state.timeLeft);
    if (state.timeLeft <= 0) endMatch(false);

    applyPlayerPhysics(dt);
    updateCamera();
    tryShoot(dt);
    updateBots(dt);
    updateTraces(dt);

    // neon pulse
    const t = performance.now() * 0.001;
    neonMats.forEach((m, i) => {
      m.emissiveIntensity = 1.6 + Math.sin(t * 3 + i) * 0.7;
    });
  } else if (camera && scene) {
    // idle spin preview if world exists but not running — still render last frame
  }

  if (scene && camera) renderer.render(scene, camera);
}

// bootstrap empty scene so first paint isn't black forever after start
initRenderer();
clock = new THREE.Clock();
buildWorld('cargo');
resize();
// park camera for splash
running = false;
camera.position.set(12, 8, 18);
camera.lookAt(0, 2, 0);
requestAnimationFrame(loop);

window.__dbg = () => ({
  x: +state.x.toFixed(3),
  y: +state.y.toFixed(3),
  z: +state.z.toFixed(3),
  kills: state.kills,
  deaths: state.deaths,
  hp: state.hp,
  className: classById(state.classId).nameEn,
  map: state.mapId,
  running,
  ammo: state.ammo,
  sliding: state.sliding,
});

// expose start helpers for automated tests

window.__forceHitTest = () => {
  const bot = bots.find((b) => b.alive);
  if (!bot) return { ok: false, reason: 'no-bot' };
  const beforeKills = state.kills;
  // Open arena center — avoid solid boxes
  bot.x = 0; bot.y = PLAYER_HEIGHT; bot.z = -4;
  bot.mesh.position.set(bot.x, 0, bot.z);
  state.x = 0; state.y = PLAYER_HEIGHT; state.z = 0;
  yaw = 0; // look -Z toward bot
  pitch = 0;
  updateCamera();
  const eye = { x: state.x, y: state.y, z: state.z };
  const { dx, dy, dz } = dirFromAngles(yaw, pitch);
  const hit = rayHitscan(eye.x, eye.y, eye.z, dx, dy, dz, 120, null);
  if (hit.bot) damageBot(hit.bot, 250, true);
  return {
    ok: (!bot.alive) || state.kills > beforeKills || (hit.bot && hit.bot.hp <= 0),
    kills: state.kills,
    beforeKills,
    hitBot: !!hit.bot,
    hitDist: hit.dist,
    botAlive: bot.alive,
    botHp: bot.hp,
    dir: { dx, dy, dz },
  };
};

window.__startForTest = (mapId, classId) => {
  selectedMap = mapId || 'cargo';
  selectedClass = classId || 'spark';
  startMatch(selectedMap, selectedClass);
};
