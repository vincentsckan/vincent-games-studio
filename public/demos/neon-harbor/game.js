/**
 * 霓虹港戰 Neon Harbor Clash — Vincent Games Studio
 * Local Three.js TPP (third-person OTS) demo — arcade movement + multi-mode vs AI
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
  { id: 'signs', nameZh: '霓虹招牌街', nameEn: 'Neon Sign Street', desc: '呢度啲燈仲亮緊——不過人已經唔同。', thumb: 'refs/map-signs.jpg' },
  { id: 'minibus', nameZh: '夜間小巴巷', nameEn: 'Night Minibus Alley', desc: '小巴未埋站，槍火先到。', thumb: 'refs/map-minibus.jpg' },
  { id: 'tonglau', nameZh: '唐樓轉角', nameEn: 'Tong Lau Bend', desc: '轉角有燈，轉角有槍。', thumb: 'refs/map-tonglau.jpg' },
  { id: 'tram', nameZh: '電車街', nameEn: 'Tram Street', desc: '叮叮未到，槍口先響。', thumb: 'refs/map-tram.jpg' },
  { id: 'nightstall', nameZh: '夜市檔口', nameEn: 'Night Stall Market', desc: '檔燈未熄，收檔先收屍。', thumb: 'refs/map-nightstall.jpg' },
  { id: 'neonroof', nameZh: '霓虹屋頂', nameEn: 'Neon Rooftop', desc: '屋頂燈火，唔見天光。', thumb: 'refs/map-neonroof.jpg' },
  { id: 'kaitak', nameZh: '啟德天台', nameEn: 'Kai Tak Roof', desc: '飛機唔再落，晾衫仲在。', thumb: 'refs/map-kaitak.jpg' },
  { id: 'estate', nameZh: '公屋天台', nameEn: 'Estate Roof', desc: '晾衫未收——天台已經係賽場。', thumb: 'refs/map-estate.jpg' },
  { id: 'skybridge', nameZh: '天橋連廊', nameEn: 'Skybridge Link', desc: '兩棟樓之間，只得一條命。', thumb: 'refs/map-skybridge.jpg' },
  { id: 'watertower', nameZh: '水塔跳台', nameEn: 'Water Tower', desc: '水塔頂，風大槍更準。', thumb: 'refs/map-watertower.jpg' },
  { id: 'cargo', nameZh: '貨櫃碼頭', nameEn: 'Cargo Pier', desc: '貨櫃堆疊、碼頭長廊——掩體多、遠近皆宜。', thumb: 'refs/map-cargo.jpg' },
  { id: 'temple', nameZh: '霓虹廟市', nameEn: 'Neon Temple', desc: '廟街霓虹、窄巷檔口——近戰混戰天堂。', thumb: 'refs/map-temple.jpg' },
  { id: 'teahouse', nameZh: '茶餐廳後巷', nameEn: 'Cha Chaan Back', desc: '花磚仲在，霓虹只剩半個字。', thumb: 'refs/map-teahouse.jpg' },
  { id: 'loading', nameZh: '卸貨區', nameEn: 'Loading Bay', desc: '月台升高，子彈橫飛。', thumb: 'refs/map-loading.jpg' },
  { id: 'crane', nameZh: '塔吊場', nameEn: 'Crane Yard', desc: '吊臂之下，無人倖免。', thumb: 'refs/map-crane.jpg' },
  { id: 'pawnarcade', nameZh: '當舖街機廊', nameEn: 'Pawn Arcade', desc: '押字燈亮，街機繼續投幣。', thumb: 'refs/map-pawnarcade.jpg' },
  { id: 'signcanyon', nameZh: '招牌峽谷', nameEn: 'Sign Canyon', desc: '抬頭只見字，低頭只見血。', thumb: 'refs/map-signcanyon.jpg' },
  { id: 'doubletram', nameZh: '雙軌電車', nameEn: 'Double Tram', desc: '雙軌并行，左右都係戰場。', thumb: 'refs/map-doubletram.jpg' },
  { id: 'ch7studio', nameZh: 'Channel 7 片場', nameEn: 'Channel 7 Studio', desc: '直播開波——觀眾等緊你收視。', thumb: 'refs/map-ch7studio.jpg' },
  { id: 'harbourfinal', nameZh: '維港終章', nameEn: 'Harbour Finale', desc: '今晚收視你贏晒。', thumb: 'refs/map-harbourfinal.jpg' },
];

const CLASSES = [
  {
    id: 'spark',
    nameZh: '閃 · 港灣AR',
    nameEn: 'Spark',
    desc: '港灣AR · 均衡攻防，適合大多數戰況。',
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
    nameZh: '隼 · 天台狙擊',
    nameEn: 'Falcon',
    desc: '天台狙擊 · 高傷害慢射速，走位稍慢。',
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
    nameZh: '石 · 茶記散彈',
    nameEn: 'Rock',
    desc: '茶記散彈 · 高血量、近距爆發，移動較慢。',
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
    nameZh: '影 · 旺角衝鋒＋霓虹刀',
    nameEn: 'Shade',
    desc: '旺角衝鋒＋霓虹刀 · 高機動近戰。',
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


// Translation-locked firearm lexicon (exact Translation rename table)
const EXTRA_WEAPONS = [
  { id: 'burst', nameZh: '港灣AR', nameEn: 'Harbor AR', damage: 28, firerate: 6.5, spread: 0.022, mag: 24, reserve: 72, reload: 1.5, pellets: 1, speedMul: 1 },
  { id: 'lmg', nameZh: '鐵閘機槍', nameEn: 'Gate LMG', damage: 18, firerate: 11, spread: 0.045, mag: 60, reserve: 120, reload: 2.8, pellets: 1, speedMul: 0.85 },
  { id: 'revolver', nameZh: '巷口手槍', nameEn: 'Alley Pistol', damage: 55, firerate: 2.2, spread: 0.018, mag: 6, reserve: 30, reload: 1.8, pellets: 1, speedMul: 1.05 },
  { id: 'carbine', nameZh: '旺角衝鋒', nameEn: 'Mong Kok SMG', damage: 32, firerate: 7.5, spread: 0.02, mag: 25, reserve: 75, reload: 1.55, pellets: 1, speedMul: 1.02 },
  { id: 'rocket', nameZh: '貨櫃火箭', nameEn: 'Cargo Rocket', damage: 120, firerate: 0.75, spread: 0.04, mag: 1, reserve: 8, reload: 2.4, pellets: 1, speedMul: 0.88, splash: 3.2 },
  // 身肉搏 — Translation-locked melee (V). Fist always; knee unarmed alt; knife stronger/longer.
  { id: 'fist', nameZh: '拳頭', nameEn: 'Fist', damage: 28, firerate: 1 / 0.45, spread: 0, mag: 1, reserve: 99, reload: 0.05, pellets: 1, speedMul: 1.12, melee: true, range: 2.2, cone: 0.85, icon: 'refs/ui/ui-fist.jpg' },
  { id: 'knee', nameZh: '膝撞', nameEn: 'Knee', damage: 32, firerate: 1 / 0.5, spread: 0, mag: 1, reserve: 99, reload: 0.05, pellets: 1, speedMul: 1.1, melee: true, range: 2.15, cone: 0.75, icon: 'refs/ui/ui-knee.jpg' },
  { id: 'knife', nameZh: '霓虹刀', nameEn: 'Neon Knife', damage: 48, firerate: 1 / 0.55, spread: 0, mag: 1, reserve: 99, reload: 0.05, pellets: 1, speedMul: 1.18, melee: true, range: 2.8, cone: 0.7, icon: 'refs/ui/ui-neon-knife.jpg' },
];

const MELEE_CYCLE = ['fist', 'knee', 'knife'];
const MELEE_HIT_FX = 'refs/ui/fx-melee-hitspark.jpg';

// 槍階亂鬥 ladder
const GUN_LADDER = [
  { id: 'revolver', nameZh: '巷口手槍', damage: 55, firerate: 2.2, spread: 0.018, mag: 6, reserve: 30, reload: 1.8, pellets: 1, speedMul: 1.05 },
  { id: 'carbine', nameZh: '旺角衝鋒', damage: 15, firerate: 13.5, spread: 0.055, mag: 35, reserve: 105, reload: 1.25, pellets: 1, speedMul: 1.1 },
  { id: 'burst', nameZh: '港灣AR', damage: 24, firerate: 9.5, spread: 0.028, mag: 30, reserve: 90, reload: 1.45, pellets: 1, speedMul: 1 },
  { id: 'shotgun', nameZh: '茶記散彈', damage: 18, firerate: 1.4, spread: 0.12, mag: 8, reserve: 32, reload: 2.4, pellets: 7, speedMul: 0.92 },
  { id: 'lmg', nameZh: '鐵閘機槍', damage: 18, firerate: 11, spread: 0.045, mag: 60, reserve: 120, reload: 2.8, pellets: 1, speedMul: 0.85 },
  { id: 'sniper', nameZh: '天台狙擊', damage: 95, firerate: 1.15, spread: 0.004, mag: 5, reserve: 25, reload: 2.1, pellets: 1, speedMul: 0.9 },
  { id: 'rocket', nameZh: '貨櫃火箭', damage: 120, firerate: 0.75, spread: 0.04, mag: 1, reserve: 8, reload: 2.4, pellets: 1, speedMul: 0.88, splash: 3.2 },
  { id: 'knife', nameZh: '霓虹刀', damage: 48, firerate: 1 / 0.55, spread: 0, mag: 1, reserve: 99, reload: 0.05, pellets: 1, speedMul: 1.18, melee: true, range: 2.8, cone: 0.7, icon: 'refs/ui/ui-neon-knife.jpg' },
];

const BOSSES = [
  { id: 'gate', nameZh: '鐵閘阿爺', hook: '鐵閘一落，成巷封死。', color: 0xff2040, hpBase: 320, art: 'refs/ui/boss-gate-grandpa.jpg' },
  { id: 'sign', nameZh: '招牌鬼手', hook: '牌影裡伸手。', color: 0xff4dc8, hpBase: 300, art: 'refs/ui/boss-sign-ghosthand.jpg' },
  { id: 'tower', nameZh: '天台水塔怪', hook: '水塔爆開先出手。', color: 0x40f0ff, hpBase: 340, art: 'refs/ui/boss-watertower.jpg' },
  { id: 'cargo', nameZh: '貨櫃鐵甲', hook: '箱門打開就係槍口。', color: 0xffd36a, hpBase: 380, art: 'refs/ui/boss-container-armor.jpg' },
  { id: 'cranearm', nameZh: '吊機鐵臂', hook: '吊臂一掃，無人企得穩。', color: 0xff8a3c, hpBase: 400, art: 'refs/ui/boss-crane-arm.jpg' },
  { id: 'canyon', nameZh: '峽谷鬼牌', hook: '字縫裡閃過一張鬼牌。', color: 0xb388ff, hpBase: 360, art: 'refs/ui/boss-canyon-sign.jpg' },
  { id: 'producer', nameZh: '製片人', hook: '鏡頭一紅，全場開打。', color: 0xff6a20, hpBase: 480, art: 'refs/ui/boss-producer.jpg' },
  { id: 'ratings', nameZh: '收視魔王', hook: '收視一爆，全城開打。', color: 0xff1040, hpBase: 560, art: 'refs/ui/boss-ratings-king.jpg' },
];

const CHANNEL7 = [
  { level: 1, mapId: 'signs', mode: 'kill', target: 10, time: 150, boss: false, bossId: null },
  { level: 2, mapId: 'minibus', mode: 'survive', target: 90, time: 90, boss: false, bossId: null },
  { level: 3, mapId: 'tonglau', mode: 'kill', target: 15, time: 180, boss: true, bossId: 'gate' },
  { level: 4, mapId: 'tram', mode: 'hold', target: 60, time: 60, boss: false, bossId: null },
  { level: 5, mapId: 'nightstall', mode: 'kill', target: 12, time: 150, boss: false, bossId: null },
  { level: 6, mapId: 'neonroof', mode: 'kill', target: 20, time: 180, boss: true, bossId: 'sign' },
  { level: 7, mapId: 'kaitak', mode: 'survive', target: 120, time: 120, boss: false, bossId: null },
  { level: 8, mapId: 'estate', mode: 'hold', target: 90, time: 90, boss: false, bossId: null },
  { level: 9, mapId: 'skybridge', mode: 'kill', target: 18, time: 180, boss: true, bossId: 'tower' },
  { level: 10, mapId: 'watertower', mode: 'survive', target: 90, time: 90, boss: false, bossId: null },
  { level: 11, mapId: 'cargo', mode: 'kill', target: 15, time: 180, boss: false, bossId: null },
  { level: 12, mapId: 'temple', mode: 'hold', target: 60, time: 60, boss: true, bossId: 'cargo' },
  { level: 13, mapId: 'teahouse', mode: 'kill', target: 20, time: 180, boss: false, bossId: null },
  { level: 14, mapId: 'loading', mode: 'survive', target: 120, time: 120, boss: false, bossId: null },
  { level: 15, mapId: 'crane', mode: 'kill', target: 25, time: 200, boss: true, bossId: 'cranearm' },
  { level: 16, mapId: 'pawnarcade', mode: 'hold', target: 90, time: 90, boss: false, bossId: null },
  { level: 17, mapId: 'signcanyon', mode: 'kill', target: 30, time: 220, boss: true, bossId: 'canyon' },
  { level: 18, mapId: 'doubletram', mode: 'survive', target: 150, time: 150, boss: false, bossId: null },
  { level: 19, mapId: 'ch7studio', mode: 'hold', target: 120, time: 120, boss: true, bossId: 'producer' },
  { level: 20, mapId: 'harbourfinal', mode: 'kill', target: 40, time: 300, boss: true, bossId: 'ratings' },
];

const GAME_MODES = [
  { id: 'ffa', nameZh: '混戰', nameEn: 'Free-for-All' },
  { id: 'tdm', nameZh: '團隊死鬥', nameEn: 'Team Deathmatch' },
  { id: 'hold', nameZh: '據點爭奪', nameEn: 'Point Control' },
  { id: 'gungame', nameZh: '槍階亂鬥', nameEn: 'Gun Ladder' },
  { id: 'bosshunt', nameZh: 'Boss 狩獵', nameEn: 'Boss Hunt' },
  { id: 'campaign', nameZh: 'Channel 7', nameEn: 'Channel 7 Campaign' },
];

const TDM_WIN_KILLS = 25;
const BOSS_HUNT_ROSTER = ['gate', 'sign', 'tower', 'cargo', 'cranearm', 'canyon', 'producer', 'ratings'];

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
  gameMode: 'ffa', // ffa | tdm | hold | gungame | bosshunt | campaign
  campaignLevel: 0, // 1..20 when campaign
  objective: null, // { type, target, progress, holdScore }
  weaponOverride: null, // EXTRA_WEAPONS / ladder id or null (= class gun)
  meleeSwing: 0, // alternates fist/knee flavour when needed
  holdProgress: 0,
  team: 0, // player team for TDM
  teamKills: 0,
  enemyTeamKills: 0,
  gunIndex: 0, // 槍階亂鬥 ladder index
  armor: 0,
  speedBoost: 0,
  coins: 0,
  bossId: null,
};

let scene, camera, renderer, clock;
let solidBoxes = [];
let bots = [];
let neonMats = [];
let muzzleFlash = null;
let gunMesh = null;
let playerMesh = null; // visible TPP hero (simple humanoid; Multimedia refs/player/* can skin later)
const CAM_BACK = 3.35;
const CAM_RIGHT = 0.72;
const CAM_UP = 0.55;
let spawnPoints = [];
let bulletTraces = [];
let bloodBursts = [];
let pickups = [];
let holdZone = null; // {x,z,r}
let selectedMode = 'ffa';
let campaignIdx = 0;
let worldRoot = null;
let envTextureCache = new Map(); // mapId -> THREE.Texture (success only)
let envLoader = null;
let envLoadToken = 0;
let envPlateStatus = { mapId: null, status: 'idle', url: null }; // idle|loading|ready|missing

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

function fillModePicker() {
  const grid = document.getElementById('modeGrid');
  if (!grid) return;
  grid.innerHTML = '';
  GAME_MODES.forEach((m) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pick';
    btn.dataset.id = m.id;
    btn.innerHTML = `<b>${m.nameZh}</b><span>${m.nameEn}</span>`;
    btn.addEventListener('click', () => {
      selectedMode = m.id;
      state.gameMode = m.id;
      grid.querySelectorAll('.pick').forEach((el) => el.classList.toggle('sel', el.dataset.id === m.id));
      document.getElementById('btnModeNext').disabled = false;
    });
    grid.appendChild(btn);
  });
}

document.getElementById('btnEnter').addEventListener('click', () => {
  showPanel('panelMode');
});
document.getElementById('btnModeBack').addEventListener('click', () => showPanel('panelSplash'));
document.getElementById('btnModeNext').addEventListener('click', () => {
  if (!selectedMode) return;
  state.gameMode = selectedMode;
  if (selectedMode === 'campaign') {
    state.campaignLevel = 1;
    // skip map select — campaign dictates maps; still allow class
    selectedMap = CHANNEL7[0].mapId;
    showPanel('panelClass');
    return;
  }
  showPanel('panelMap');
});
document.getElementById('btnMapBack').addEventListener('click', () => showPanel('panelMode'));
document.getElementById('btnMapNext').addEventListener('click', () => {
  if (!selectedMap) return;
  showPanel('panelClass');
});
document.getElementById('btnClassBack').addEventListener('click', () => {
  showPanel(state.gameMode === 'campaign' ? 'panelMode' : 'panelMap');
});
document.getElementById('btnStart').addEventListener('click', () => {
  if (!selectedClass) return;
  if (state.gameMode === 'campaign') {
    startMatch(CHANNEL7[0].mapId, selectedClass, { gameMode: 'campaign', campaignLevel: 1 });
    return;
  }
  if (!selectedMap) return;
  startMatch(selectedMap, selectedClass, { gameMode: selectedMode || 'ffa' });
});
document.getElementById('btnAgain').addEventListener('click', () => {
  startMatch(state.mapId || selectedMap, state.classId || selectedClass, {
    gameMode: state.gameMode,
    campaignLevel: state.campaignLevel,
  });
});
const btnNext = document.getElementById('btnNextLevel');
if (btnNext) {
  btnNext.addEventListener('click', () => {
    const next = (state.campaignLevel | 0) + 1;
    startMatch(null, state.classId || selectedClass, { gameMode: 'campaign', campaignLevel: next });
  });
}
document.getElementById('btnMenu').addEventListener('click', () => {
  running = false;
  matchOver = false;
  hud.classList.remove('on');
  cross.classList.remove('on');
  overlay.classList.remove('hidden');
  showPanel('panelSplash');
  try { document.exitPointerLock(); } catch (_) {}
});

fillModePicker();
fillPickers();
fillBossSplashStrip();

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
  const raw = (text == null || text === 'undefined') ? '' : String(text).trim();
  const safeText = raw || '·';
  const chars = safeText.split('');
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
    ctx.fillText(safeText, canvas.width / 2, canvas.height / 2);
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
  if (text == null || text === 'undefined' || String(text).trim() === '') return null;
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

/** 理髮旋轉燈 — red/white/blue barber pole (soft prop). */
function addBarberPole(group, x, z, h = 2.4) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, h, 12),
    new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.45 })
  );
  pole.position.y = h / 2;
  g.add(pole);
  const stripes = [0xc41828, 0xf0f4f8, 0x1a5c9a];
  for (let i = 0; i < 8; i++) {
    const col = stripes[i % 3];
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.135, 0.135, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.4 })
    );
    band.position.y = 0.35 + i * 0.26;
    g.add(band);
    neonMats.push(band.material);
  }
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xe8e0d0, emissive: 0xffe080, emissiveIntensity: 0.6 })
  );
  cap.position.y = h + 0.08;
  g.add(cap);
  neonMats.push(cap.material);
  group.add(g);
  return g;
}

/** 紅色手推車 / goods tricycle — curb clutter (soft or light collision). */
function addRedHandcart(group, x, z, rotY = 0, solid = false) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.45, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xc41828, roughness: 0.55, metalness: 0.2 })
  );
  bed.position.set(0, 0.55, 0.15);
  g.add(bed);
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.35, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x8b1515 })
  );
  rail.position.set(0, 0.85, -0.55);
  g.add(rail);
  // front wheel + rear pair (blocky)
  const whMat = new THREE.MeshStandardMaterial({ color: 0x111118 });
  [[0, -0.85], [-0.4, 0.7], [0.4, 0.7]].forEach(([wx, wz], i) => {
    const wh = new THREE.Mesh(new THREE.BoxGeometry(i === 0 ? 0.18 : 0.16, 0.4, 0.4), whMat);
    wh.position.set(wx, 0.22, wz);
    g.add(wh);
  });
  // cargo crate on bed
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.45, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.7 })
  );
  crate.position.set(0, 0.95, 0.2);
  g.add(crate);
  group.add(g);
  if (solid) solidBoxes.push(boxSolid(x, 0, z, 1.2, 1.1, 1.8));
  return g;
}

/** Vintage white + yellow sedan scale prop (soft cover companion to 黃的). */
function addVintageSedan(group, x, z, rotY = 0, color = 0xf2f0ea) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.25 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.4, metalness: 0.3 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.5, 3.8), bodyMat);
  body.position.y = 0.5;
  g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 2.0), bodyMat);
  cabin.position.set(0, 1.05, -0.1);
  g.add(cabin);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.45, 1.7), darkMat);
  win.position.set(0, 1.1, -0.1);
  g.add(win);
  [[-0.7, -1.15], [0.7, -1.15], [-0.7, 1.15], [0.7, 1.15]].forEach(([wx, wz]) => {
    const wh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.5), darkMat);
    wh.position.set(wx, 0.25, wz);
    g.add(wh);
  });
  group.add(g);
  const aligned = Math.abs(rotY % Math.PI) < 0.3 || Math.abs(Math.abs(rotY % Math.PI) - Math.PI) < 0.3;
  solidBoxes.push(boxSolid(x, 0, z, aligned ? 1.85 : 3.9, 1.4, aligned ? 3.9 : 1.85));
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
  if (text == null || text === 'undefined' || String(text).trim() === '') return null;
  addZhPanel(group, x, y, z, w, h, depth, text, {
    vertical: false, bg, fg, emissive, emitInt, rotY,
  });
  // thin bracket arm back toward façade
  addBox(group, x, y + h * 0.45, z, Math.max(0.35, w * 0.15), 0.06, 0.06, 0x3a3030, 0x000000, 0, false);
}

/** HK minibus — red-roof or green-roof cover with collision. */
function addMinibus(group, x, z, roof = 'red', rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const bodyCol = 0xf2f0ea;
  const roofCol = roof === 'green' ? 0x1a8f4a : 0xc41828;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.55, 5.2),
    new THREE.MeshStandardMaterial({ color: bodyCol, roughness: 0.55, metalness: 0.2 })
  );
  body.position.y = 1.05;
  g.add(body);
  const rf = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.22, 5.25),
    new THREE.MeshStandardMaterial({ color: roofCol, roughness: 0.5, metalness: 0.25, emissive: roofCol, emissiveIntensity: 0.15 })
  );
  rf.position.y = 1.95;
  g.add(rf);
  neonMats.push(rf.material);
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(1.95, 0.7, 4.6),
    new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: 0.3, metalness: 0.4 })
  );
  win.position.y = 1.35;
  g.add(win);
  [[-0.85, -1.6], [0.85, -1.6], [-0.85, 1.6], [0.85, 1.6]].forEach(([wx, wz]) => {
    const wh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.55, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x111118 })
    );
    wh.position.set(wx, 0.35, wz);
    g.add(wh);
  });
  group.add(g);
  const aligned = Math.abs(rotY % Math.PI) < 0.3 || Math.abs(Math.abs(rotY % Math.PI) - Math.PI) < 0.3;
  solidBoxes.push(boxSolid(x, 0, z, aligned ? 2.2 : 5.3, 2.1, aligned ? 5.3 : 2.2));
  return g;
}

/** Small delivery truck at alley far end. */
function addSmallTruck(group, x, z, rotY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.5, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.6 })
  );
  cab.position.set(0, 1.0, -1.5);
  g.add(cab);
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 1.1, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x3a6088, roughness: 0.55 })
  );
  bed.position.set(0, 0.9, 0.7);
  g.add(bed);
  group.add(g);
  solidBoxes.push(boxSolid(x, 0, z, 2.0, 1.7, 4.6));
  return g;
}

/** Bamboo scaffold + blue/white tarp — soft, leave sight gaps. */
function addBambooScaffold(group, x, zStart, zEnd, toward = 1) {
  for (let z = zStart; z <= zEnd; z += 1.6) {
    addBox(group, x, 0, z, 0.12, 9.5, 0.12, 0xc4a574, 0x000000, 0, false);
    addBox(group, x + toward * 1.2, 0, z, 0.12, 9.5, 0.12, 0xc4a574, 0x000000, 0, false);
    for (let y = 1.5; y < 9; y += 1.5) {
      addBox(group, x + toward * 0.6, y, z, 1.3, 0.08, 0.08, 0xc4a574, 0x000000, 0, false);
    }
  }
  for (let y = 2; y < 9; y += 2) {
    addBox(group, x, y, (zStart + zEnd) / 2, 0.08, 0.08, zEnd - zStart, 0xc4a574, 0x000000, 0, false);
    addBox(group, x + toward * 1.2, y, (zStart + zEnd) / 2, 0.08, 0.08, zEnd - zStart, 0xc4a574, 0x000000, 0, false);
  }
  let bay = 0;
  for (let z = zStart; z < zEnd - 0.5; z += 1.6) {
    if (bay % 2 === 0) {
      const stripe = bay % 4 === 0 ? 0x2a6db0 : 0xf0f4f8;
      addBox(group, x + toward * 0.6, 3.5, z + 0.8, 1.15, 3.2, 1.4, stripe, 0x000000, 0, false);
      addBox(group, x + toward * 0.6, 7.0, z + 0.8, 1.15, 2.0, 1.4, bay % 4 === 0 ? 0xf0f4f8 : 0x2a6db0, 0x000000, 0, false);
    }
    bay++;
  }
}

/** Circular pawn-shop style sign — fictional 金蝠當舖 with large 「押」. */
function addPawnSign(group, x, y, z) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  // red disc + gold rim
  ctx.fillStyle = '#b01028';
  ctx.beginPath(); ctx.arc(128, 128, 122, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a8f4a'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.arc(128, 128, 112, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#ffe8a0'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(128, 128, 100, 0, Math.PI * 2); ctx.stroke();
  // bat-coin hint above 押
  ctx.fillStyle = '#ffe8a0';
  ctx.beginPath(); ctx.ellipse(128, 58, 28, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b01028';
  ctx.beginPath(); ctx.ellipse(128, 58, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
  // large 「押」
  ctx.font = 'bold 110px "Noto Sans TC",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe8a0';
  ctx.fillText('押', 128, 128);
  // shop name under
  ctx.font = 'bold 22px "Noto Sans TC",sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('金蝠當舖', 128, 228);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({
    map: tex, color: 0xffffff, emissive: 0xff2d3a, emissiveIntensity: 1.4, roughness: 0.5,
  });
  neonMats.push(mat);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 24), mat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}


// Locked zh-Hant sign copy (Translation) — fully fictional / non-trademark
const ZH_VERT_NEON = '江記東江菜';
const ZH_WALL = ['罐頭食品', '名茶', '茶莊禮品', '乾餅菓', '生興白米生油'];
const ZH_BANNERS = ['德成合記', '喜筵壽宴', '上海理髮', '安和堂涼茶', '燒味'];


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
  // keep spawns in central walk corridor (signs soft-only; avoid arcade pillars)
  spawnPoints = [
    [0, 0, 0], [1.2, 0, 6], [-1.2, 0, 6], [1.2, 0, -6],
    [-1.2, 0, -6], [0, 0, 9], [0, 0, -9], [0.8, 0, 3],
  ];
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 52),
    new THREE.MeshStandardMaterial({ color: 0x12101a, roughness: 0.28, metalness: 0.62 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, 48, 1, 52));

  // subtle wet-ground sheen (low emit — was loud cyan/pink slabs)
  for (let i = -2; i <= 2; i++) {
    addBox(root, 0, 0.02, i * 8.5, 1.6, 0.03, 2.4, 0x0c1018, i % 2 ? 0x401828 : 0x102030, 0.25, false);
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

      // one façade neon board + one strip (was dense forest)
      const c0 = neonPalette[(i + 4 + ri * 5) % neonPalette.length];
      if ((i + ri) % 2 === 0) {
        addNeonSign(root, faceX, 4.2, z, 2.2, 0.7, c0);
      }
      const stripCols = [0xff2d3a, 0x00e8ff, 0xffd36a];
      const sc = stripCols[(i + ri) % 3];
      addBox(root, faceX, 2.2, z + (ri ? -1.7 : 1.7), 0.08, 3.2, 0.08, 0x080810, sc, 1.4, false);
    }
  });

  // hero vertical neon pushed to façades (not center lane)
  addZhPanel(root, -6.4, 2.2, -2.5, 0.45, 4.0, 0.18, ZH_VERT_NEON, {
    vertical: true, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 1.6,
  });
  addZhPanel(root, 6.4, 2.4, 4.0, 0.42, 3.8, 0.16, ZH_VERT_NEON, {
    vertical: true, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 1.5,
  });

  // horizontal banners on side façades only
  addZhPanel(root, -6.0, 5.0, -8.5, 2.4, 0.55, 0.14, ZH_BANNERS[0], {
    vertical: false, bg: '#0a3a7a', fg: '#ffffff', emissive: 0x2080ff, emitInt: 1.2,
  });
  addZhPanel(root, 6.0, 5.0, 8.5, 2.2, 0.5, 0.12, ZH_BANNERS[1], {
    vertical: false, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 1.1,
  });

  // 竹竿晾衫 spanning overhead
  for (let i = -4; i <= 4; i++) {
    addLaundrySpan(root, -6.2, i * 4.5, 6.2, 5.0 + (i % 3) * 0.35);
    if (i % 2 === 0) addLaundrySpan(root, -5.5, i * 4.5 + 1.2, 5.5, 5.8);
  }

  // mid-alley cover: dumpsters / planters + 紅膠凳 + 垃圾桶
  [[-2.8, 6], [2.8, -6], [-2.6, 12], [2.6, -12], [-2.5, -2], [2.5, 2]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 1.35, 1.1 + (i % 2) * 0.4, 1.2, 0x1c2430, 0x000000, 0, true);
    if (i % 2 === 0) addBox(root, x, 1.15, z, 1.5, 0.08, 1.3, 0x101018, i % 4 ? 0xffd36a : 0xff2d9b, 1.4, false);
  });
  [[-2.8, 4], [2.6, -3.5], [-2.6, 9], [2.5, -9], [2.4, 1.5], [-2.5, -5]].forEach(([x, z], i) => {
    addRedStool(root, x, z, false); // soft clutter — corridor stay shootable
  });
  [[-2.8, 8], [2.6, -8], [-2.4, -14], [2.2, 14]].forEach(([x, z], i) => addTrashBin(root, x, z, i));

  // 黃的 — yellow HK taxi cover (collision)
  addYellowTaxi(root, 3.2, -17.5, 0);
  addYellowTaxi(root, -3.2, 17.2, Math.PI);

  // Sparse hanging signs on façades only (was a dense canyon that buried the env plate)
  const hangStyles = [
    { bg: '#b01028', fg: '#fff4d0', em: 0xff2d3a },
    { bg: '#0a3a7a', fg: '#ffffff', em: 0x2080ff },
    { bg: '#0d5c3a', fg: '#ffe8a0', em: 0x40f080 },
    { bg: '#c47800', fg: '#ffffff', em: 0xffa040 },
  ];
  const hangTexts = [...ZH_BANNERS, ...ZH_WALL, ZH_VERT_NEON];
  for (let side = 0; side < 2; side++) {
    const toward = side === 0 ? 1 : -1;
    const baseX = side === 0 ? -6.2 : 6.2;
    for (let col = 0; col < 2; col++) {
      const z = -10 + col * 14;
      const y = 4.2;
      const st = hangStyles[(col + side * 2) % hangStyles.length];
      const txt = hangTexts[(col + side * 3) % hangTexts.length];
      if (!txt) continue;
      const x = baseX + toward * 0.35;
      addHangSign(root, x, y, z, 1.5, 0.4, txt, {
        bg: st.bg, fg: st.fg, emissive: st.em, emitInt: 0.9,
      });
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
  [[-3.6, 3], [3.6, -4], [-3.8, -7], [3.8, 7], [-3.6, 11], [3.5, -11]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 0.85, 0.7 + (i % 2) * 0.3, 0.65, 0x5a4030, 0x000000, 0, true);
    addRedStool(root, x + (x > 0 ? 0.55 : -0.55), z + 0.35, i % 2 === 0);
    if (i % 2 === 0) {
      const bt = ZH_BANNERS[i % ZH_BANNERS.length];
      addZhPanel(root, x, 1.0, z, 0.9, 0.55, 0.08, bt, {
        vertical: false, bg: '#f0e8d8', fg: '#8b1515', emissive: 0x301010, emitInt: 0.2,
      });
    }
  });

  // Sparse lexicon lightboxes on sides only (V4 forest removed — buried env plate)
  const ZH_LIGHTBOX = [
    '安和堂涼茶', '港南米線', '雅翠火鍋', '晶明鏡架', '星河書局',
    '跌打專科', '上海理髮', '足底舒壓 24H', '豬扒包 $26', '五金漆油',
    '江記東江菜', '生興白米生油', '德成合記', '燒味', '金蝠當舖',
  ];
  const lbStyles = [
    { bg: '#b01028', fg: '#fff4d0', em: 0xff2d3a },
    { bg: '#0d5c3a', fg: '#ffe8a0', em: 0x40f080 },
    { bg: '#c47800', fg: '#1a1a22', em: 0xffa040 },
    { bg: '#0a3a7a', fg: '#ffffff', em: 0x2080ff },
  ];
  for (let side = 0; side < 2; side++) {
    const toward = side === 0 ? 1 : -1;
    const baseX = side === 0 ? -6.4 : 6.4;
    for (let col = 0; col < 2; col++) {
      const z = -8 + col * 14;
      const y = 3.8;
      const st = lbStyles[(col + side) % lbStyles.length];
      const txt = ZH_LIGHTBOX[(col + side * 4) % ZH_LIGHTBOX.length];
      if (!txt) continue;
      addHangSign(root, baseX + toward * 0.25, y, z, 1.6, 0.42, txt, {
        bg: st.bg, fg: st.fg, emissive: st.em, emitInt: 1.0,
      });
    }
  }
  // A few hero lexicon signs parked on façades (not center lane)
  const heroRow = [
    [-6.0, 5.2, -4, '安和堂涼茶', '#0d5c3a', '#ffffff', 0x40f080],
    [6.0, 5.2, -4, '港南米線', '#ffe060', '#0a3a7a', 0xffd36a],
    [-6.0, 4.2, 4, '上海理髮', '#f0e8d8', '#8b1515', 0x401010],
    [6.0, 4.2, 4, '足底舒壓 24H', '#ff4dc8', '#ffffff', 0xff2d9b],
    [-6.0, 3.4, 12, '江記東江菜', '#b01028', '#ffe8a0', 0xff2d3a],
    [6.0, 3.4, 12, '德成合記', '#0a3a7a', '#ffffff', 0x2080ff],
  ];
  heroRow.forEach(([x, y, z, txt, bg, fg, em]) => {
    addHangSign(root, x, y, z, 2.0, 0.5, txt, { bg, fg, emissive: em, emitInt: 1.35 });
  });
  addPawnSign(root, -6.2, 5.4, 16);
  // barber pole + 上海理髮 near arcade
  addBarberPole(root, -4.6, -6.5, 2.5);
  addZhPanel(root, -4.6, 0.35, -5.6, 0.12, 1.6, 0.35, '上海理髮', {
    vertical: true, bg: '#f0e8d8', fg: '#8b1515', emissive: 0x401010, emitInt: 0.4,
  });
  // red goods handcarts + vintage white car (v5 curb props)
  addRedHandcart(root, 2.8, -10.5, 0.2, false);
  addRedHandcart(root, -2.9, 9.5, Math.PI + 0.15, false);
  addRedHandcart(root, 3.0, 5.0, -0.4, false);
  addVintageSedan(root, -3.0, -14.5, Math.PI, 0xf2f0ea);

  // bamboo scaffold + blue/white tarp (left) — soft sight gaps
  addBambooScaffold(root, -7.0, -12, 6, 1);

  // yellow price boards
  [[-3.5, 1.5], [3.3, -2], [-3.3, 5], [3.1, 8]].forEach(([x, z]) => {
    addZhPanel(root, x, 1.2, z, 0.7, 0.9, 0.06, '豬扒包 $26', {
      vertical: true, bg: '#ffe060', fg: '#8b1515', emissive: 0xffd36a, emitInt: 0.55,
    });
  });

  // red-roof + green-roof minibuses at alley mouths (collision cover)
  addMinibus(root, 3.4, -20.5, 'red', 0);
  addMinibus(root, -3.4, 20.2, 'green', Math.PI);
  addSmallTruck(root, 3.0, 22.0, Math.PI / 2);


  // dark end barriers — no loud cyan/pink emissive walls near FOV
  addBox(root, 0, 0, 24, 28, 5, 1.2, 0x0c1018, 0x000000, 0, true);
  addBox(root, 0, 0, -24, 28, 5, 1.2, 0x0c1018, 0x000000, 0, true);
  addBox(root, 16, 0, 0, 1.2, 5, 48, 0x0c1018, 0x000000, 0, true);
  addBox(root, -16, 0, 0, 1.2, 5, 48, 0x0c1018, 0x000000, 0, true);

  // light cross-street cables only (no floating neon boxes in center)
  for (let i = -2; i <= 2; i++) {
    addBox(root, 0, 6.0, i * 8, 12, 0.04, 0.04, 0x1a1a20, 0x000000, 0, false);
  }
}

function buildKaiTakRoof(root) {
  // 啟德天台 — water-tower emphasis, denser 晾衫, 冷氣, iron gates
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

  // water towers (Kai Tak emphasis) — larger tanks + elevated stilts
  [[-8, 8], [10, 6], [-6, -8], [8, -6], [0, 0]].forEach(([x, z], ti) => {
    const s = ti === 4 ? 4.2 : 3.6;
    const h = ti === 4 ? 4.0 : 3.2;
    addBox(root, x, 0, z, s, h, s, 0x5a6870, 0x000000, 0, true);
    addBox(root, x, h, z, s + 0.25, 0.25, s + 0.25, 0x3a4850, 0x40f0ff, 0.55, true);
    addBox(root, x, 0, z, 0.55, h + 0.8, 0.55, 0x2a3038, 0x000000, 0, true);
    // cyan rim glow ring
    addBox(root, x, h + 0.15, z, s + 0.5, 0.08, s + 0.5, 0x101018, 0x40f0ff, 1.4, false);
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


function buildTramStreet(root) {
  // 電車街 — Tong Lau façades + light tram poles / track stripes
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

  // 江記東江菜 hero neon
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

  // 黃的 + light v5 curb props at alley end
  addYellowTaxi(root, 0, 17.5, Math.PI / 2);
  addRedHandcart(root, 3.2, 12.0, -0.3, false);
  addBarberPole(root, -5.2, -4.0, 2.2);
  addZhPanel(root, -5.2, 0.3, -3.2, 0.1, 1.4, 0.32, '上海理髮', {
    vertical: true, bg: '#f0e8d8', fg: '#8b1515', emissive: 0x301010, emitInt: 0.3,
  });
  addPawnSign(root, 5.0, 4.2, -8.0);
  addHangSign(root, 5.0, 3.2, -8.0, 1.4, 0.35, '金蝠當舖', {
    bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 1.3,
  });
  addHangSign(root, -3.5, 3.5, 6, 1.8, 0.45, '安和堂涼茶', {
    bg: '#0d5c3a', fg: '#ffffff', emissive: 0x40f080, emitInt: 1.6,
  });
  addHangSign(root, 3.5, 3.3, -5, 1.8, 0.45, '港南米線', {
    bg: '#ffe060', fg: '#0a3a7a', emissive: 0xffd36a, emitInt: 1.5,
  });


  // tram track stripes down the street center + poles
  for (let i = -8; i <= 8; i++) {
    addBox(root, -0.55, 0.02, i * 2.4, 0.18, 0.04, 2.2, 0x3a3a42, 0x000000, 0, false);
    addBox(root, 0.55, 0.02, i * 2.4, 0.18, 0.04, 2.2, 0x3a3a42, 0x000000, 0, false);
  }
  [[-3.2, -12], [3.2, -6], [-3.2, 0], [3.2, 6], [-3.2, 12], [3.2, 16]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 0.22, 5.2, 0.22, 0x2a3038, 0x000000, 0, true);
    addBox(root, x, 5.0, z, 1.6, 0.12, 0.12, 0x1a2030, 0xffd36a, 1.4, false);
    addBox(root, 0, 4.6, z, Math.abs(x) * 2, 0.06, 0.06, 0x080810, i % 2 ? 0xff4dc8 : 0x40f0ff, 1.2, false);
  });

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



function addPerimeter(root, half, h = 5, neonA = 0xff2d9b, neonB = 0x00e8ff) {
  addBox(root, 0, 0, half, half * 2, h, 1.2, 0x100c18, neonA, 0.3, true);
  addBox(root, 0, 0, -half, half * 2, h, 1.2, 0x100c18, neonB, 0.3, true);
  addBox(root, half, 0, 0, 1.2, h, half * 2, 0x100c18, 0x40f0ff, 0.25, true);
  addBox(root, -half, 0, 0, 1.2, h, half * 2, 0x100c18, 0xff4dc8, 0.25, true);
}

function addGroundPlane(root, size, color = 0x12101a) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.12 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
  solidBoxes.push(boxSolid(0, -1, 0, size, 1, size));
}

/** 夜間小巴巷 — queue of minibuses + wider road, sparse neon (≠ signs) */
function buildMinibusAlley(root) {
  spawnPoints = [[0,0,0],[4,0,8],[-4,0,8],[4,0,-8],[-4,0,-8],[0,0,14],[6,0,0],[-6,0,0]];
  addGroundPlane(root, 56, 0x1a1c22);
  // road stripe
  for (let i = -8; i <= 8; i++) {
    addBox(root, 0, 0.02, i * 2.8, 0.25, 0.04, 1.8, 0xe8e0d0, 0x000000, 0, false);
  }
  // twin rows of minibuses as cover
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    addMinibus(root, -7.5, i * 5.5, i % 2 ? 'red' : 'green', 0);
    addMinibus(root, 7.5, i * 5.5 + 1.2, i % 2 ? 'green' : 'red', Math.PI);
  }
  // low shop fronts along sides (short, not tall Tong Lau canyon)
  [-12, 12].forEach((bx, ri) => {
    for (let i = -3; i <= 3; i++) {
      const z = i * 6;
      addBox(root, bx, 0, z, 4.5, 3.2 + (i % 2), 4.2, 0xd8d4cc, 0x000000, 0, true);
      const toward = bx > 0 ? -1 : 1;
      addNeonSign(root, bx + toward * 2.2, 2.4, z, 2.4, 0.7, i % 2 ? 0xffd36a : 0x00e8ff);
    }
  });
  addYellowTaxi(root, 0, -18, Math.PI / 2);
  addSmallTruck(root, 0, 18, -Math.PI / 2);
  addPerimeter(root, 26, 4, 0xffd36a, 0x00e8ff);
}

/** 唐樓轉角 — L-shaped corner plaza (≠ tram corridor) */
function buildTongLauBend(root) {
  spawnPoints = [[0,0,0],[6,0,6],[-4,0,8],[8,0,-4],[-6,0,-6],[10,0,2],[-2,0,12],[4,0,-10]];
  addGroundPlane(root, 52, 0x18141c);
  // L-building mass: south + east wings
  for (let i = -3; i <= 1; i++) {
    const h = 8 + (i % 3) * 1.5;
    addBox(root, i * 5.5 - 4, 0, -12, 5, h, 5, 0xe4ddd0, 0x000000, 0, true);
    addGreenWindows(root, i * 5.5 - 4, 3, -9.5, 2, 2, 1, { winW: 0.8, winH: 0.95, gapX: 1.2, gapY: 1.6 });
  }
  for (let i = -1; i <= 3; i++) {
    const h = 7 + ((i + 1) % 3) * 1.8;
    addBox(root, 12, 0, i * 5.5 - 2, 5, h, 5, 0xe4ddd0, 0x000000, 0, true);
    addGreenWindows(root, 9.5, 3, i * 5.5 - 2, 2, 2, -1, { winW: 0.8, winH: 0.95, gapX: 1.2, gapY: 1.6 });
  }
  // open plaza props
  [[-2, 2], [2, -2], [4, 4], [-6, 4]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 1.6, 1.1, 1.4, 0x243040, 0x000000, 0, true);
  });
  addPawnSign(root, -8, 4.5, -8);
  addBarberPole(root, 6, -6, 2.4);
  addZhPanel(root, -6, 2, -9.2, 0.5, 3.5, 0.18, ZH_VERT_NEON, {
    vertical: true, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 2.2,
  });
  addHangSign(root, 9.2, 4, 0, 2.2, 0.55, '安和堂涼茶', { bg: '#0d5c3a', fg: '#fff', emissive: 0x40f080, emitInt: 1.8 });
  addYellowTaxi(root, -2, 14, 0.4);
  addPerimeter(root, 24, 5);
}

/** 茶餐廳後巷 — tiled courtyard + kitchen vents (≠ tram) */
function buildTeahouseBack(root) {
  spawnPoints = [[0,0,0],[3,0,5],[-3,0,5],[3,0,-5],[-3,0,-5],[0,0,10],[5,0,0],[-5,0,0]];
  addGroundPlane(root, 44, 0x2a1830);
  // 花磚 checker denser
  for (let ix = -5; ix <= 5; ix++) {
    for (let iz = -5; iz <= 5; iz++) {
      if ((ix + iz) % 2) continue;
      addBox(root, ix * 1.8, 0.03, iz * 1.8, 0.85, 0.04, 0.85, 0x3a2040, (ix + iz) % 4 === 0 ? 0xff4dc8 : 0xffd36a, 0.35, false);
    }
  }
  // U-shaped kitchen walls (open north)
  [[-8, 0, 4, 10], [8, 0, 4, 10], [0, -10, 14, 4]].forEach(([x, z, w, d], i) => {
    addBox(root, x, 0, z, w, 5.5 + i, d, 0xe8e2d6, 0x000000, 0, true);
  });
  // booth tables mid
  [[-2, 2], [2, 2], [-2, -2], [2, -2], [0, 4]].forEach(([x, z]) => {
    addBox(root, x, 0, z, 1.4, 0.85, 1.4, 0x5a4030, 0x000000, 0, true);
    addRedStool(root, x + 0.7, z, false);
    addRedStool(root, x - 0.7, z, false);
  });
  addZhPanel(root, 0, 3.5, -7.8, 3.2, 0.7, 0.14, '喜筵壽宴', {
    vertical: false, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 1.8,
  });
  for (let i = -2; i <= 2; i++) addBox(root, i * 2.5, 1.5, 7.5, 1.2, 0.8, 0.3, 0x101018, 0xffa040, 0.9, false);
  addPerimeter(root, 20, 5, 0xffd36a, 0xff4dc8);
}

/** 霓虹屋頂 — billboard roof (≠ kaitak water towers) */
function buildNeonRooftop(root) {
  spawnPoints = [[0,0,0],[10,0,8],[-10,0,8],[10,0,-8],[-10,0,-8],[0,0,14],[14,0,0],[-14,0,0]];
  addGroundPlane(root, 52, 0x1a2030);
  // parapet
  addBox(root, 0, 0, 24, 48, 1.2, 0.7, 0x2a3038, 0x000000, 0, true);
  addBox(root, 0, 0, -24, 48, 1.2, 0.7, 0x2a3038, 0x000000, 0, true);
  addBox(root, 24, 0, 0, 0.7, 1.2, 48, 0x2a3038, 0x000000, 0, true);
  addBox(root, -24, 0, 0, 0.7, 1.2, 48, 0x2a3038, 0x000000, 0, true);
  // giant neon billboards as cover walls
  const boards = [[-12, -8, 10, 6], [12, 6, 10, 6], [0, 14, 14, 5], [-8, 10, 8, 5], [10, -12, 9, 5]];
  boards.forEach(([x, z, w, h], i) => {
    const col = [0xff2d9b, 0x00e8ff, 0xffd36a, 0xff4dc8, 0x40f0ff][i % 5];
    addBox(root, x, 0, z, w, h, 0.6, 0x101018, col, 2.2, true);
    addBox(root, x, h, z, w + 0.4, 0.3, 0.8, 0x080810, col, 1.5, true);
  });
  // AC clusters + stair hut
  [[-16, 0], [16, 4], [0, -16]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 4, 3.5, 3.5, 0xd0ccc4, 0x000000, 0, true);
  });
  for (let i = 0; i < 8; i++) addACUnit(root, -6 + i * 1.5, 0.2, 4, 1);
  addPerimeter(root, 25, 2, 0xff2d9b, 0x00e8ff);
}

/** 公屋天台 — twin H-block roofs + clothes lines (≠ kaitak) */
function buildEstateRoof(root) {
  spawnPoints = [[0,0,0],[8,0,6],[-8,0,6],[8,0,-6],[-8,0,-6],[0,0,12],[12,0,0],[-12,0,0]];
  addGroundPlane(root, 56, 0x3a3e46);
  // twin H-blocks (two parallel buildings)
  [-14, 14].forEach((bx) => {
    addBox(root, bx, 0, 0, 8, 4.5, 28, 0xc8c4bc, 0x000000, 0, true);
    addBox(root, bx, 0, -14, 14, 4.5, 6, 0xc8c4bc, 0x000000, 0, true);
    addBox(root, bx, 0, 14, 14, 4.5, 6, 0xc8c4bc, 0x000000, 0, true);
  });
  // laundry between blocks
  for (let i = -4; i <= 4; i++) {
    addLaundrySpan(root, -9, i * 3.5, 9, 3.2 + (i % 2) * 0.3);
  }
  // low water tanks small
  [[0, 8], [0, -8], [0, 0]].forEach(([x, z]) => {
    addBox(root, x, 0, z, 2.5, 2.2, 2.5, 0x5a6870, 0x000000, 0, true);
  });
  // iron rails mid
  addBox(root, 0, 0, 0, 0.15, 1.8, 20, 0x1a2030, 0x000000, 0, true);
  addPerimeter(root, 26, 1.5, 0xffd36a, 0x40f0ff);
}

/** 夜市檔口 — stall grid + lantern strings */
function buildNightStall(root) {
  spawnPoints = [[0,0,0],[5,0,6],[-5,0,6],[5,0,-6],[-5,0,-6],[0,0,12],[8,0,0],[-8,0,0]];
  addGroundPlane(root, 48, 0x140c18);
  for (let ix = -3; ix <= 3; ix++) {
    for (let iz = -3; iz <= 3; iz++) {
      if (Math.abs(ix) + Math.abs(iz) < 1) continue; // open center
      if (ix === 0 || iz === 0) continue; // cross lanes
      const x = ix * 5.5, z = iz * 5.5;
      addBox(root, x, 0, z, 3.2, 1.3, 2.4, 0x1c1428, 0x000000, 0, true);
      addBox(root, x, 1.3, z, 3.4, 0.12, 2.6, 0x101018, (ix + iz) % 2 ? 0xff2d9b : 0xffd36a, 1.8, false);
    }
  }
  // lantern strings
  for (let i = -4; i <= 4; i++) {
    addBox(root, 0, 3.8, i * 4, 28, 0.05, 0.05, 0x080810, 0xff4dc8, 1.2, false);
    for (let j = -3; j <= 3; j++) {
      addBox(root, j * 4, 3.4, i * 4, 0.35, 0.45, 0.35, 0xff6020, 0xffa040, 2.0, false);
    }
  }
  addPerimeter(root, 22, 4);
}

/** 天橋連廊 — two towers + elevated bridges */
function buildSkybridge(root) {
  spawnPoints = [[0,0,0],[8,0,0],[-8,0,0],[0,0,10],[0,0,-10],[12,0,8],[-12,0,8],[0,3.5,0]];
  addGroundPlane(root, 56, 0x121820);
  // two towers
  addBox(root, -16, 0, 0, 10, 12, 10, 0xd8d4cc, 0x000000, 0, true);
  addBox(root, 16, 0, 0, 10, 12, 10, 0xd8d4cc, 0x000000, 0, true);
  // skybridges at y≈3.5 and y≈7
  addBox(root, 0, 3.5, 0, 22, 0.4, 3.5, 0x2a3038, 0x00e8ff, 0.4, true);
  addBox(root, 0, 7.0, 2, 22, 0.4, 2.8, 0x2a3038, 0xff2d9b, 0.4, true);
  // bridge rails
  addBox(root, 0, 3.9, 1.6, 22, 0.9, 0.15, 0x1a2030, 0x000000, 0, true);
  addBox(root, 0, 3.9, -1.6, 22, 0.9, 0.15, 0x1a2030, 0x000000, 0, true);
  // ground cover crates
  [[-4, 8], [4, -8], [0, 14], [0, -14]].forEach(([x, z]) => addBox(root, x, 0, z, 2, 1.4, 2, 0x243040, 0x000000, 0, true));
  addPerimeter(root, 26, 5);
}

/** 水塔跳台 — single giant tower arena */
function buildWaterTower(root) {
  spawnPoints = [[10,0,10],[-10,0,10],[10,0,-10],[-10,0,-10],[14,0,0],[-14,0,0],[0,0,14],[0,0,-14]];
  addGroundPlane(root, 52, 0x2a2e36);
  // giant central water tower
  addBox(root, 0, 0, 0, 8, 10, 8, 0x5a6870, 0x000000, 0, true);
  addBox(root, 0, 10, 0, 9, 0.5, 9, 0x3a4850, 0x40f0ff, 0.8, true);
  addBox(root, 0, 10.4, 0, 9.5, 0.15, 9.5, 0x101018, 0x40f0ff, 1.6, false);
  // pipe rings / platforms
  [[0, 12], [12, 0], [0, -12], [-12, 0]].forEach(([x, z], i) => {
    addBox(root, x, 0, z, 3, 2.5, 3, 0x4a5860, 0x000000, 0, true);
    addBox(root, x * 0.5, 4 + i * 0.2, z * 0.5, 1.2, 0.4, 1.2, 0x3a4850, 0x00e8ff, 0.5, true);
  });
  // radial pipes (soft visual + some solid)
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    const x = Math.cos(ang) * 16, z = Math.sin(ang) * 16;
    addBox(root, x * 0.5, 1.5, z * 0.5, 0.5, 0.5, 14, 0x3a4850, 0x000000, 0, a % 2 === 0);
  }
  addPerimeter(root, 24, 2, 0x40f0ff, 0x00e8ff);
}

/** 卸貨區 — dock platforms + ramps */
function buildLoadingBay(root) {
  spawnPoints = [[0,0,0],[10,0,6],[-10,0,6],[8,0,-8],[-8,0,-8],[0,0,12],[14,0,0],[-14,0,0]];
  addGroundPlane(root, 60, 0x1a2030);
  // raised loading docks
  addBox(root, -18, 0, 0, 8, 1.6, 30, 0x2a3344, 0x000000, 0, true);
  addBox(root, 18, 0, 0, 8, 1.6, 30, 0x2a3344, 0x000000, 0, true);
  // warehouse backs
  addBox(root, -22, 0, 0, 2, 8, 32, 0x121820, 0xff2d9b, 0.3, true);
  addBox(root, 22, 0, 0, 2, 8, 32, 0x121820, 0x00e8ff, 0.3, true);
  // cargo stacks mid
  for (let i = -2; i <= 2; i++) {
    addBox(root, i * 5, 0, -10, 3.5, 2.2 + (i % 2), 2.5, 0x2a6088, 0x000000, 0, true);
    addBox(root, i * 5, 0, 10, 3.5, 2.0, 2.5, 0x886028, 0x000000, 0, true);
  }
  addSmallTruck(root, 0, 0, 0);
  addPerimeter(root, 28, 5);
}

/** 塔吊場 — crane skeleton centerpiece */
function buildCraneYard(root) {
  spawnPoints = [[8,0,8],[-8,0,8],[8,0,-8],[-8,0,-8],[14,0,0],[-14,0,0],[0,0,14],[0,0,-14]];
  addGroundPlane(root, 56, 0x152238);
  // crane mast
  addBox(root, 0, 0, 0, 1.4, 18, 1.4, 0xffa040, 0xffa040, 0.35, true);
  // jib
  addBox(root, 8, 16, 0, 18, 0.8, 1.2, 0xffa040, 0xffd36a, 0.5, true);
  addBox(root, -4, 14, 0, 10, 0.6, 0.8, 0xc47800, 0x000000, 0, true);
  // counterweight
  addBox(root, -10, 14.5, 0, 4, 2.5, 2.5, 0x2a3038, 0x000000, 0, true);
  // container stacks around
  [[-16, -12], [-16, 8], [16, -8], [16, 12], [0, -18], [0, 18]].forEach(([x, z], i) => {
    const stacks = 1 + (i % 3);
    for (let s = 0; s < stacks; s++) addBox(root, x, s * 2.5, z, 5, 2.4, 2.5, [0x2a6088, 0x886028, 0x286050][s % 3], 0x000000, 0, true);
  });
  addPerimeter(root, 26, 4, 0xffa040, 0x00e8ff);
}

/** 當舖街機廊 — pawn + arcade cabinets corridor */
function buildPawnArcade(root) {
  spawnPoints = [[0,0,0],[2,0,6],[-2,0,6],[2,0,-6],[-2,0,-6],[0,0,10],[0,0,-10],[1,0,3]];
  addGroundPlane(root, 40, 0x0a0814);
  // corridor walls
  [-6.5, 6.5].forEach((bx, ri) => {
    for (let i = -4; i <= 4; i++) {
      addBox(root, bx, 0, i * 4.2, 4, 6 + (i % 2), 3.8, 0x14101e, 0x000000, 0, true);
      const toward = bx > 0 ? -1 : 1;
      addNeonSign(root, bx + toward * 2, 2.5, i * 4.2, 2, 0.8, i % 2 ? 0xff2d9b : 0x00e8ff);
    }
  });
  addPawnSign(root, -4, 3.5, -8);
  addPawnSign(root, 4, 3.5, 8);
  // arcade cabinets as cover
  for (let i = -3; i <= 3; i++) {
    const x = (i % 2 ? 2.2 : -2.2);
    addBox(root, x, 0, i * 3.5, 1.1, 1.8, 0.9, 0x1a1028, 0xff4dc8, 0.8, true);
    addBox(root, x, 1.5, i * 3.5, 0.9, 0.5, 0.15, 0x101018, 0x40f0ff, 2.0, false);
  }
  addZhPanel(root, 0, 4.2, 0, 2.8, 0.6, 0.12, '金蝠當舖', {
    vertical: false, bg: '#b01028', fg: '#ffe8a0', emissive: 0xff2d3a, emitInt: 2.0,
  });
  addPerimeter(root, 18, 5);
}

/** 招牌峽谷 — extreme tall narrow canyon (≠ signs densify) */
function buildSignCanyon(root) {
  spawnPoints = [[0,0,0],[1,0,5],[-1,0,5],[1,0,-5],[-1,0,-5],[0,0,8],[0,0,-8],[0.5,0,2]];
  addGroundPlane(root, 36, 0x0c0a12);
  // ultra-tall façades close in
  [-4.2, 4.2].forEach((bx, ri) => {
    for (let i = -5; i <= 5; i++) {
      const z = i * 3.2;
      const h = 14 + (i % 4) * 2;
      addBox(root, bx, 0, z, 3.5, h, 3.0, 0xe4ddd0, 0x000000, 0, true);
      const toward = bx > 0 ? -1 : 1;
      const faceX = bx + toward * 1.7;
      for (let t = 0; t < 2; t++) {
        const col = [0xff2d9b, 0x00e8ff, 0xffd36a, 0xff4dc8][(i + t) % 4];
        const label = ZH_BANNERS[(i + t) % ZH_BANNERS.length];
        if (!label) continue;
        addHangSign(root, faceX + toward * (0.25 + t * 0.12), 3.2 + t * 1.6, z, 1.5, 0.4,
          label, { bg: '#111', fg: '#fff', emissive: col, emitInt: 1.2 });
      }
    }
  });
  for (let i = -4; i <= 4; i++) addLaundrySpan(root, -3.2, i * 3.5, 3.2, 8 + (i % 2));
  addPerimeter(root, 16, 8);
}

/** 雙軌電車 — two parallel track corridors */
function buildDoubleTram(root) {
  spawnPoints = [[0,0,0],[6,0,6],[-6,0,6],[6,0,-6],[-6,0,-6],[0,0,12],[8,0,0],[-8,0,0]];
  addGroundPlane(root, 48, 0x1a1420);
  // two track pairs at x=±3.5
  [-3.5, 3.5].forEach((tx) => {
    for (let i = -9; i <= 9; i++) {
      addBox(root, tx - 0.55, 0.02, i * 2.2, 0.16, 0.04, 2.0, 0x3a3a42, 0x000000, 0, false);
      addBox(root, tx + 0.55, 0.02, i * 2.2, 0.16, 0.04, 2.0, 0x3a3a42, 0x000000, 0, false);
    }
  });
  // island platforms mid
  addBox(root, 0, 0, -8, 3, 0.9, 8, 0x2a3038, 0x000000, 0, true);
  addBox(root, 0, 0, 8, 3, 0.9, 8, 0x2a3038, 0x000000, 0, true);
  // façades further out
  [-11, 11].forEach((bx, ri) => {
    for (let i = -3; i <= 3; i++) {
      addBox(root, bx, 0, i * 5.5, 5, 7 + (i % 2) * 2, 4.5, 0xe8e2d6, 0x000000, 0, true);
      const toward = bx > 0 ? -1 : 1;
      addNeonSign(root, bx + toward * 2.5, 3.5, i * 5.5, 2.5, 0.9, i % 2 ? 0xff2d9b : 0x00e8ff);
    }
  });
  // tram poles
  for (let i = -3; i <= 3; i++) {
    addBox(root, -3.5, 0, i * 6, 0.2, 5, 0.2, 0x2a3038, 0x000000, 0, true);
    addBox(root, 3.5, 0, i * 6, 0.2, 5, 0.2, 0x2a3038, 0x000000, 0, true);
  }
  addPerimeter(root, 22, 5);
}

/** Channel 7 片場 — studio lights + camera sets */
function buildCh7Studio(root) {
  spawnPoints = [[0,0,0],[6,0,6],[-6,0,6],[6,0,-6],[-6,0,-6],[0,0,10],[10,0,0],[-10,0,0]];
  addGroundPlane(root, 48, 0x0a0a12);
  // cyclorama / back wall
  addBox(root, 0, 0, -20, 36, 10, 1.5, 0x1a1028, 0xff2d9b, 0.6, true);
  // stage risers
  addBox(root, 0, 0, -8, 16, 0.8, 8, 0x2a1830, 0x000000, 0, true);
  addBox(root, 0, 0.8, -10, 10, 0.6, 4, 0x3a2040, 0x000000, 0, true);
  // camera towers
  [[-12, 8], [12, 8], [-12, -4], [12, -4]].forEach(([x, z]) => {
    addBox(root, x, 0, z, 1.2, 4.5, 1.2, 0x2a3038, 0x000000, 0, true);
    addBox(root, x, 4.2, z - 0.8, 1.5, 0.8, 2.2, 0x111118, 0x40f0ff, 0.5, true);
  });
  // softbox lights hanging
  for (let i = -3; i <= 3; i++) {
    addBox(root, i * 4, 7, 0, 2.5, 0.3, 1.5, 0xf0f0f0, 0xffe080, 2.5, false);
  }
  addZhPanel(root, 0, 6, -19, 8, 1.2, 0.2, 'CHANNEL 7', {
    vertical: false, bg: '#0a0a12', fg: '#40f0ff', emissive: 0x40f0ff, emitInt: 2.5,
  });
  // set dressing crates
  [[-4, 4], [4, 2], [0, 12], [-8, -2], [8, -2]].forEach(([x, z]) => addBox(root, x, 0, z, 2, 1.5, 1.8, 0x243040, 0x000000, 0, true));
  addPerimeter(root, 22, 6, 0x40f0ff, 0xff2d9b);
}

/** 維港終章 — pier edge + skyline finale */
function buildHarbourFinal(root) {
  spawnPoints = [[0,0,0],[12,0,8],[-12,0,8],[10,0,-10],[-10,0,-10],[0,0,16],[18,0,0],[-18,0,0]];
  addGroundPlane(root, 72, 0x0a1528);
  // pier planks stripes
  for (let i = -6; i <= 6; i++) {
    addBox(root, i * 5, 0.02, 0, 4.2, 0.05, 50, i % 2 ? 0x1a2838 : 0x152030, 0x000000, 0, false);
  }
  // water edge glow
  for (let i = -4; i <= 4; i++) {
    addBox(root, i * 8, 0.02, 32, 7, 0.08, 0.5, 0x081018, 0x00e8ff, 1.8, false);
  }
  // skyline wall of neon towers (north)
  for (let i = -5; i <= 5; i++) {
    const h = 8 + Math.abs(i) * 1.5 + (i % 2) * 3;
    addBox(root, i * 5.5, 0, -30, 4.5, h, 4, 0x121820, 0x000000, 0, true);
    addNeonSign(root, i * 5.5, h * 0.55, -27.8, 3.5, 1.2, i % 2 ? 0xff2d9b : 0x00e8ff);
  }
  // mid containers + crane echo
  [[-16, -8], [16, 6], [0, 10], [-8, 18], [10, -14]].forEach(([x, z], i) => {
    for (let s = 0; s < 1 + (i % 3); s++) addBox(root, x, s * 2.5, z, 5, 2.4, 2.6, [0x2a6088, 0x682848, 0x286050][s % 3], 0x000000, 0, true);
  });
  addBox(root, 20, 0, -10, 1.2, 14, 1.2, 0x2a3344, 0x40f0ff, 0.4, true);
  addBox(root, 20, 13, -10, 14, 0.6, 1.2, 0x2a3344, 0xff4dc8, 0.5, true);
  addZhPanel(root, 0, 8, -27.5, 10, 1.4, 0.25, '今晚收視你贏晒', {
    vertical: false, bg: '#050818', fg: '#ffd36a', emissive: 0xffd36a, emitInt: 2.8,
  });
  addPerimeter(root, 34, 5, 0x00e8ff, 0xff2d9b);
}


/** Photoreal TPP hero billboard from Multimedia refs/player/* (NOT low-poly chars.jpg).
 *  player-back-full = follow-cam skin; gun-pose / melee-pose swap on combat; ots is framing ref. */
const PLAYER_TEX = {
  back: './refs/player/player-back-full.jpg',
  gun: './refs/player/player-gun-pose.jpg',
  melee: './refs/player/player-melee-pose.jpg',
};
const playerTexCache = new Map(); // url -> THREE.Texture (alpha-keyed)

function chromaKeyPlayerTexture(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    // key near-black studio backdrop → alpha
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum < 18) px[i + 3] = 0;
    else if (lum < 36) px[i + 3] = Math.min(px[i + 3], ((lum - 18) / 18) * 255);
  }
  ctx.putImageData(data, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function loadPlayerPoseTex(url) {
  return new Promise((resolve) => {
    if (playerTexCache.has(url)) {
      resolve(playerTexCache.get(url));
      return;
    }
    const loader = getEnvLoader();
    loader.load(
      url,
      (tex) => {
        const img = tex.image;
        const keyed = chromaKeyPlayerTexture(img);
        tex.dispose?.();
        playerTexCache.set(url, keyed);
        resolve(keyed);
      },
      undefined,
      () => resolve(null)
    );
  });
}

function makePlayerMesh() {
  const g = new THREE.Group();
  g.name = 'playerHero';

  // Soft placeholder until textures resolve — thin dark capsule, never a teal cube head
  const stub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.8, transparent: true, opacity: 0.3 })
  );
  stub.position.y = 0.95;
  stub.name = 'heroStub';
  g.add(stub);

  const mat = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.12,
    fog: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.name = 'heroBillboard';
  // 864×1152 portrait → ~0.95m × 1.85m human silhouette
  sprite.scale.set(0.95, 1.85, 1);
  sprite.position.y = 0.95;
  sprite.visible = false;
  g.add(sprite);
  g.userData.billboard = sprite;
  g.userData.stub = stub;
  g.userData.pose = 'back';

  // Kick off Multimedia pose loads
  loadPlayerPoseTex(PLAYER_TEX.back).then((tex) => {
    if (!tex || !g.userData.billboard) return;
    g.userData.billboard.material.map = tex;
    g.userData.billboard.material.needsUpdate = true;
    g.userData.billboard.visible = true;
    if (g.userData.stub) g.userData.stub.visible = false;
  });
  // warm gun/melee caches
  loadPlayerPoseTex(PLAYER_TEX.gun);
  loadPlayerPoseTex(PLAYER_TEX.melee);

  return g;
}

function syncPlayerPoseBillboard() {
  if (!playerMesh || !playerMesh.userData.billboard) return;
  const gun = activeGunStats();
  const want = gun && gun.melee ? 'melee' : ((keys.Mouse0 || keys.shoot) ? 'gun' : 'back');
  if (playerMesh.userData.pose === want) return;
  const url = want === 'melee' ? PLAYER_TEX.melee : want === 'gun' ? PLAYER_TEX.gun : PLAYER_TEX.back;
  const apply = (tex) => {
    if (!tex || !playerMesh?.userData?.billboard) return;
    playerMesh.userData.billboard.material.map = tex;
    playerMesh.userData.billboard.material.needsUpdate = true;
    playerMesh.userData.billboard.visible = true;
    if (playerMesh.userData.stub) playerMesh.userData.stub.visible = false;
    playerMesh.userData.pose = want;
  };
  if (playerTexCache.has(url)) apply(playerTexCache.get(url));
  else loadPlayerPoseTex(url).then(apply);
}

function makeBotMesh(color) {
  const g = new THREE.Group();
  g.name = 'botActor';
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
  const allyColor = 0x40f0ff;
  const enemyColors = [0xff4dc8, 0xffd36a, 0xff6a8a, 0xa78bfa, 0xf472b6, 0xff2040];
  const classPool = CLASSES;
  const isTdm = state.gameMode === 'tdm';
  const count = state.gameMode === 'bosshunt' ? 4 : BOT_COUNT;
  for (let i = 0; i < count; i++) {
    const cls = classPool[i % classPool.length];
    const sp = randomSpawn();
    const team = isTdm ? (i < 3 ? 0 : 1) : 1; // TDM: 3 allies + rest enemies
    const mesh = makeBotMesh(team === 0 ? allyColor : enemyColors[i % enemyColors.length]);
    mesh.position.set(sp.x, 0, sp.z);
    root.add(mesh);
    bots.push({
      mesh,
      x: sp.x, y: PLAYER_HEIGHT, z: sp.z,
      vx: 0, vz: 0, vy: 0,
      hp: cls.hp,
      maxHp: cls.hp,
      cls,
      name: isTdm
        ? (team === 0 ? `隊友-${cls.nameEn}-${i + 1}` : `敵隊-${cls.nameEn}-${i + 1}`)
        : `BOT-${cls.nameEn}-${i + 1}`,
      team,
      shootCd: 0.5 + Math.random(),
      aimYaw: 0,
      stateT: 0,
      mode: 'chase',
      alive: true,
      respawnT: 0,
      isBoss: false,
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


/** Cinematic 4K env plates from Multimedia: refs/env/env-<mapId>.jpg */
const ENV_MAP_IDS = MAPS.map((m) => m.id);

function envPlateUrl(mapId) {
  return `./refs/env/env-${mapId}.jpg`;
}

function getEnvLoader() {
  if (!envLoader) envLoader = new THREE.TextureLoader();
  return envLoader;
}

function loadEnvPlate(mapId) {
  return new Promise((resolve) => {
    if (envTextureCache.has(mapId)) {
      resolve(envTextureCache.get(mapId));
      return;
    }
    const url = envPlateUrl(mapId);
    getEnvLoader().load(
      url,
      (tex) => {
        if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.anisotropy = 4;
        envTextureCache.set(mapId, tex);
        resolve(tex);
      },
      undefined,
      () => {
        // Soft miss — keep procedural map playable; do not cache so a later drop can succeed
        resolve(null);
      }
    );
  });
}

function disposeEnvGroup(root) {
  if (!root) return;
  const stale = root.getObjectByName('cinematicEnv');
  if (!stale) return;
  root.remove(stale);
  stale.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        // do not dispose shared envTextureCache maps
        if (m.map && !envTextureCache.has(state.mapId)) {
          /* leave shared */
        }
        m.dispose?.();
      });
    }
  });
}

/** Apply photographic plate onto sky + ground + near side walls. Plate must dominate — no teal slabs. */
function applyCinematicEnv(root, mapId, tex) {
  if (!root || !tex || !scene) return false;
  disposeEnvGroup(root);

  const envGroup = new THREE.Group();
  envGroup.name = 'cinematicEnv';

  // Photographic sky cylinder (far)
  const skyMat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(new THREE.CylinderGeometry(96, 96, 56, 64, 1, true), skyMat);
  sky.position.y = 18;
  sky.renderOrder = -2;
  envGroup.add(sky);

  // Distant backdrop
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 48),
    new THREE.MeshBasicMaterial({ map: tex, fog: false, depthWrite: false })
  );
  backdrop.position.set(0, 18, -70);
  backdrop.renderOrder = -3;
  envGroup.add(backdrop);

  // Ground / road plate — env photo owns the floor (not skybox-only)
  const groundPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(78, 78),
    new THREE.MeshBasicMaterial({ map: tex, fog: true })
  );
  groundPlate.rotation.x = -Math.PI / 2;
  groundPlate.position.y = 0.01;
  groundPlate.name = 'envGroundPlate';
  groundPlate.renderOrder = -1;
  envGroup.add(groundPlate);

  // Near side wall plates — walking-in-photo city, not procedural boxes
  const wallMatL = new THREE.MeshBasicMaterial({ map: tex, fog: true, side: THREE.DoubleSide });
  const wallMatR = new THREE.MeshBasicMaterial({ map: tex, fog: true, side: THREE.DoubleSide });
  const wallMatF = new THREE.MeshBasicMaterial({ map: tex, fog: true, side: THREE.DoubleSide });
  const wallMatB = new THREE.MeshBasicMaterial({ map: tex, fog: true, side: THREE.DoubleSide });
  const sideL = new THREE.Mesh(new THREE.PlaneGeometry(70, 30), wallMatL);
  sideL.position.set(-8.8, 13, 0);
  sideL.rotation.y = Math.PI / 2;
  sideL.name = 'envWallL';
  envGroup.add(sideL);
  const sideR = new THREE.Mesh(new THREE.PlaneGeometry(70, 30), wallMatR);
  sideR.position.set(8.8, 13, 0);
  sideR.rotation.y = -Math.PI / 2;
  sideR.name = 'envWallR';
  envGroup.add(sideR);
  const endN = new THREE.Mesh(new THREE.PlaneGeometry(40, 28), wallMatF);
  endN.position.set(0, 12, -26);
  endN.name = 'envWallN';
  envGroup.add(endN);
  const endS = new THREE.Mesh(new THREE.PlaneGeometry(40, 28), wallMatB);
  endS.position.set(0, 12, 26);
  endS.rotation.y = Math.PI;
  endS.name = 'envWallS';
  envGroup.add(endS);

  // Thin lane marks only (do not bury the plate under asphalt slabs)
  for (let i = -5; i <= 5; i++) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 1.5),
      new THREE.MeshBasicMaterial({ color: 0xc8b060, transparent: true, opacity: 0.55 })
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.03, i * 4.5);
    envGroup.add(dash);
  }

  // Sparse curb silhouettes (plate stays the hero)
  densifyCinematicCitySlice(envGroup, root, mapId);

  // Soft cinematic fill
  const neonPink = new THREE.PointLight(0xff4dc8, 0.7, 48, 2);
  neonPink.position.set(-12, 9, 8);
  envGroup.add(neonPink);
  const neonCyan = new THREE.PointLight(0x40f0ff, 0.6, 48, 2);
  neonCyan.position.set(14, 8, -10);
  envGroup.add(neonCyan);
  const amberFill = new THREE.PointLight(0xffd36a, 0.45, 36, 2);
  amberFill.position.set(0, 6, 12);
  envGroup.add(amberFill);
  const rim = new THREE.DirectionalLight(0xff80c8, 0.28);
  rim.position.set(-8, 22, -14);
  envGroup.add(rim);

  scene.background = tex;
  scene.fog = new THREE.FogExp2(0x080e1a, 0.0048);
  root.add(envGroup);

  // Hide untextured building boxes / cyclorama leftovers so plates dominate
  stripBlockyArena(root);
  return true;
}

/** Hide large untextured procedural slabs / neon lightbox forests; keep collision + curb props + hero/bots. */
function stripBlockyArena(root) {
  if (!root) return;
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    let p = obj;
    while (p) {
      if (p.name === 'cinematicEnv' || p.name === 'playerHero' || p.name === 'botActor') return;
      p = p.parent;
    }
    const g = obj.geometry;
    const params = g.parameters || {};
    if (g.type === 'PlaneGeometry') {
      const w = params.width || 0;
      const h = params.height || 0;
      // builder ground planes (large flat grey/teal floors)
      if (w >= 20 && h >= 20) obj.visible = false;
      return;
    }
    if (g.type === 'BoxGeometry') {
      const w = params.width || 0;
      const h = params.height || 0;
      const d = params.depth || 0;
      // tall/wide building masses, perimeter cyclorama walls, container stacks
      const isBuilding = (h >= 2.35 && (w >= 2.8 || d >= 2.8));
      const isPerimeter = (h >= 3.2 && ((w >= 16 && d <= 2.2) || (d >= 16 && w <= 2.2)));
      const isTower = (h >= 8 && w <= 6 && d <= 6);
      // floating neon lightbox boards / hang canopies that bury the plate
      const isNeonBoard = (h <= 1.35 && h >= 0.28 && w >= 1.1 && d <= 0.35);
      if (isBuilding || isPerimeter || isTower || isNeonBoard) {
        obj.visible = false;
      }
    }
    // hide canvas-textured hang panels that somehow still say undefined
    if (obj.material && obj.material.map && obj.material.map.isCanvasTexture) {
      // already guarded at create; leave small valid lexicon signs that survived size filter
    }
  });
}

/** Sparse HK curb silhouettes when env plate is live — plate stays the main visual. */
function densifyCinematicCitySlice(envGroup, root, mapId) {
  const seed = String(mapId || 'cargo').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = (i) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Fewer parked vehicles, curb-only (never center lane)
  const vehicleSlots = [
    [-10.5, -16, 0], [10.5, -8, Math.PI], [-10.5, 6, 0], [10.5, 16, Math.PI],
  ];
  vehicleSlots.forEach(([x, z, rot], i) => {
    const pick = Math.floor(rnd(i + 1) * 4);
    try {
      if (pick === 0) addYellowTaxi(root, x, z, rot);
      else if (pick === 1) addMinibus(root, x, z, rnd(i + 2) > 0.5 ? 'red' : 'green', rot);
      else if (pick === 2) addVintageSedan(root, x, z, rot, rnd(i + 3) > 0.5 ? 0xf2f0ea : 0x2a3344);
      else addSmallTruck(root, x, z, rot);
    } catch (_) { /* soft */ }
  });

  // 3 soft neon accents only — far curb, never center FOV / never bury plate
  const billboardCols = [0xff2d9b, 0x00e8ff, 0xffd36a];
  for (let i = 0; i < 3; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (15.5 + rnd(i + 41) * 1.5);
    const z = -12 + i * 11 + rnd(i + 42) * 1.2;
    const y = 3.5 + rnd(i + 43) * 1.8;
    const col = billboardCols[i % billboardCols.length];
    addNeonSign(root, x, y, z, 1.4 + rnd(i + 44) * 0.6, 0.4 + rnd(i + 45) * 0.2, col);
  }

  // Light curb clutter
  for (let i = 0; i < 4; i++) {
    const side = rnd(i + 80) > 0.5 ? 1 : -1;
    const x = side * (8.5 + rnd(i + 81) * 1.2);
    const z = -18 + i * 10;
    const kind = Math.floor(rnd(i + 82) * 3);
    if (kind === 0) addTrashBin(root, x, z, i % 2);
    else if (kind === 1) addRedStool(root, x, z, false);
    else addBarberPole(root, x, z, 2.0 + rnd(i + 83) * 0.4);
  }

  try {
    addZebraCrossing(root, 0, 0, true);
  } catch (_) {}
  // no distant untextured façade frames — those read as teal/grey slabs against the plate
}

function beginEnvPlateLoad(root, mapId) {
  const token = ++envLoadToken;
  const url = envPlateUrl(mapId);
  envPlateStatus = { mapId, status: 'loading', url };

  const applyIfCurrent = (tex) => {
    if (token !== envLoadToken) return;
    if (tex && applyCinematicEnv(root, mapId, tex)) {
      envPlateStatus = { mapId, status: 'ready', url };
    } else {
      envPlateStatus = { mapId, status: 'missing', url };
    }
  };

  if (envTextureCache.has(mapId)) {
    applyIfCurrent(envTextureCache.get(mapId));
    return;
  }
  loadEnvPlate(mapId).then(applyIfCurrent);
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

  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.12, 220);
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
  worldRoot = root;
  if (mapId === 'pier') mapId = 'cargo';
  const builders = {
    signs: buildNeonSignStreet,
    minibus: buildMinibusAlley,
    tonglau: buildTongLauBend,
    tram: buildTramStreet,
    nightstall: buildNightStall,
    neonroof: buildNeonRooftop,
    kaitak: buildKaiTakRoof,
    estate: buildEstateRoof,
    skybridge: buildSkybridge,
    watertower: buildWaterTower,
    cargo: buildCargoPier,
    temple: buildNeonTemple,
    teahouse: buildTeahouseBack,
    loading: buildLoadingBay,
    crane: buildCraneYard,
    pawnarcade: buildPawnArcade,
    signcanyon: buildSignCanyon,
    doubletram: buildDoubleTram,
    ch7studio: buildCh7Studio,
    harbourfinal: buildHarbourFinal,
  };
  const builder = builders[mapId] || buildCargoPier;
  builder(root);

  // Cinematic env plate (4K) — soft-fallback if Multimedia plate not on disk yet
  beginEnvPlateLoad(root, mapId);

  // pickups + hold zone after geometry
  spawnPickups(root);
  setupHoldZone(root, mapId);

  // Third-person hero (visible body) + world gun on right hand
  if (playerMesh && playerMesh.parent) playerMesh.parent.remove(playerMesh);
  playerMesh = makePlayerMesh();
  root.add(playerMesh);

  gunMesh = new THREE.Group();
  gunMesh.name = 'heroGun';
  const barrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x1a2030, metalness: 0.7, roughness: 0.35 })
  );
  barrel.position.set(0, 0, -0.28);
  gunMesh.add(barrel);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.16, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x2a3040, emissive: 0x40f0ff, emissiveIntensity: 0.35 })
  );
  body.position.set(0, 0, 0);
  gunMesh.add(body);
  muzzleFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe080 })
  );
  muzzleFlash.position.set(0, 0, -0.55);
  muzzleFlash.visible = false;
  gunMesh.add(muzzleFlash);
  gunMesh.position.set(0.38, 1.15, -0.28);
  playerMesh.add(gunMesh);

  scene.add(camera);

  spawnBots(root);
  updateCamera();
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
  // soft bounds — larger playable envelopes per family (Vincent: 很大地圖)
  const tight = new Set(['signs', 'signcanyon', 'pawnarcade', 'teahouse', 'nightstall']);
  const mid = new Set(['minibus', 'tonglau', 'tram', 'temple', 'doubletram', 'ch7studio', 'skybridge']);
  const roof = new Set(['kaitak', 'neonroof', 'estate', 'watertower']);
  const lim = tight.has(state.mapId) ? 42 : mid.has(state.mapId) ? 48 : roof.has(state.mapId) ? 52 : 62;
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

  const gun = activeGunStats();
  let targetSpeed = cls.speed * (gun.speedMul || 1) * (state.speedBoost > 0 ? 1.35 : 1);
  if (state.crouching) targetSpeed *= 0.55;
  if (state.sliding) targetSpeed = cls.speed * SLIDE_BOOST * (state.speedBoost > 0 ? 1.2 : 1);

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
  const feetY = state.y - eyeH;

  // Photoreal billboard hero at feet — Sprite auto-faces camera (OTS sees back-full)
  if (playerMesh) {
    playerMesh.visible = true;
    playerMesh.position.set(state.x, feetY, state.z);
    const crouch = state.crouching || state.sliding;
    playerMesh.scale.set(crouch ? 0.92 : 1, crouch ? 0.78 : 1, 1);
    syncPlayerPoseBillboard();
  }

  // GTA-like OTS chase: behind + slightly above + right of player
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const back = CAM_BACK;
  const right = CAM_RIGHT;
  const up = CAM_UP + (state.crouching || state.sliding ? -0.25 : 0);
  const camX = state.x + sy * back + cy * right;
  const camY = state.y + up;
  const camZ = state.z + cy * back + (-sy) * right;
  camera.position.set(camX, camY, camZ);
  // look along aim (yaw/pitch) through a point ahead of the hero
  const { dx, dy, dz } = dirFromAngles(yaw, pitch);
  const lookDist = 22;
  camera.lookAt(
    state.x + dx * lookDist,
    state.y + dy * lookDist,
    state.z + dz * lookDist
  );

  // Muzzle flash anchor only — photoreal poses already include the weapon; hide blocky gun mesh
  if (gunMesh) {
    gunMesh.visible = false;
    const bob = running ? Math.sin(performance.now() * 0.012) * 0.01 : 0;
    gunMesh.position.set(0.25, 1.25 + bob, -0.45);
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


function activeGunStats() {
  if (state.gameMode === 'gungame') {
    return GUN_LADDER[Math.min(state.gunIndex, GUN_LADDER.length - 1)] || GUN_LADDER[0];
  }
  if (state.weaponOverride) {
    const w = EXTRA_WEAPONS.find((x) => x.id === state.weaponOverride)
      || GUN_LADDER.find((x) => x.id === state.weaponOverride);
    if (w) return w;
  }
  return classById(state.classId);
}

function applyGunLoadout(gun) {
  if (!gun) return;
  state.ammo = gun.melee ? 1 : gun.mag;
  state.reserve = gun.melee ? 99 : gun.reserve;
  state.reloading = false;
  const a = document.getElementById('ammo');
  const r = document.getElementById('reserve');
  if (a) a.textContent = String(state.ammo);
  if (r) r.textContent = String(state.reserve);
}

function bossById(id) {
  return BOSSES.find((b) => b.id === id) || BOSSES[0];
}

function spawnPickups(root) {
  pickups.forEach((p) => { if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh); });
  pickups = [];
  const spots = (spawnPoints || [[0,0,0]]).slice(0, 8);
  // Translation pickup kinds (ammo/armor/hp/speed/coin) + occasional weapon
  const kinds = ['ammo', 'armor', 'hp', 'speed', 'coin', 'weapon', 'ammo', 'hp'];
  const kindColor = {
    hp: 0x5dff9a,
    ammo: 0xffd36a,
    armor: 0x7ec8ff,
    speed: 0xff9a3c,
    coin: 0xffe566,
    weapon: 0x40f0ff,
  };
  spots.forEach((sp, i) => {
    const kind = kinds[i % kinds.length];
    const col = kindColor[kind] || 0x40f0ff;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4, roughness: 0.4 })
    );
    const x = (sp[0] || 0) + (i % 2 ? 3 : -3);
    const z = (sp[2] || 0) + (i % 3 === 0 ? 2 : -2);
    mesh.position.set(x, 0.55, z);
    root.add(mesh);
    neonMats.push(mesh.material);
    pickups.push({
      kind,
      x, z,
      mesh,
      alive: true,
      weaponId: (() => {
        const pool = EXTRA_WEAPONS.filter((w) => !w.melee || w.id === 'knife');
        return pool[i % pool.length].id;
      })(),
      respawnT: 0,
    });
  });
}

function setupHoldZone(root, mapId) {
  holdZone = { x: 0, z: 0, r: 4.5 };
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(holdZone.r - 0.15, holdZone.r + 0.15, 32),
    new THREE.MeshBasicMaterial({ color: 0x40f0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(holdZone.x, 0.08, holdZone.z);
  root.add(ring);
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(holdZone.r - 0.2, 24),
    new THREE.MeshBasicMaterial({ color: 0x2080ff, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(holdZone.x, 0.06, holdZone.z);
  root.add(pad);
}

function updatePickups(dt) {
  if (state.speedBoost > 0) state.speedBoost = Math.max(0, state.speedBoost - dt);
  for (const p of pickups) {
    if (!p.alive) {
      p.respawnT -= dt;
      if (p.respawnT <= 0) {
        p.alive = true;
        if (p.mesh) p.mesh.visible = true;
      }
      continue;
    }
    if (p.mesh) p.mesh.rotation.y += dt * 2.2;
    const dx = state.x - p.x, dz = state.z - p.z;
    if (dx * dx + dz * dz < 1.4) {
      if (p.kind === 'hp') {
        const cls = classById(state.classId);
        state.hp = Math.min(cls.hp, state.hp + 40);
        document.getElementById('hp').textContent = String(state.hp | 0);
        feedKill('取得醫療包');
      } else if (p.kind === 'ammo') {
        const g = activeGunStats();
        state.reserve += g.melee ? 0 : g.mag;
        document.getElementById('reserve').textContent = String(state.reserve);
        feedKill('取得彈藥箱');
      } else if (p.kind === 'armor') {
        state.armor = Math.min(100, state.armor + 40);
        feedKill('取得護甲片');
      } else if (p.kind === 'speed') {
        state.speedBoost = Math.max(state.speedBoost, 8);
        feedKill('取得速度飲料');
      } else if (p.kind === 'coin') {
        state.coins += 1;
        feedKill('取得金幣');
      } else if (p.kind === 'weapon' && state.gameMode !== 'gungame') {
        state.weaponOverride = p.weaponId;
        const w = EXTRA_WEAPONS.find((x) => x.id === p.weaponId);
        if (w) {
          applyGunLoadout(w);
          feedKill(`取得 · ${w.nameZh}`);
        }
      }
      p.alive = false;
      p.respawnT = 18;
      if (p.mesh) p.mesh.visible = false;
    }
  }
}

function spawnBoss(root, level, bossId) {
  const def = bossById(bossId || BOSS_HUNT_ROSTER[(Math.max(1, level) - 1) % BOSS_HUNT_ROSTER.length]);
  state.bossId = def.id;
  const sp = randomSpawn();
  const mesh = makeBotMesh(def.color);
  mesh.scale.set(1.5, 1.55, 1.5);
  mesh.position.set(sp.x, 0, sp.z);
  root.add(mesh);
  const hp = def.hpBase + Math.max(0, level) * 28;
  bots.push({
    mesh,
    x: sp.x, y: PLAYER_HEIGHT * 1.1, z: sp.z,
    vx: 0, vz: 0, vy: 0,
    hp, maxHp: hp,
    cls: { ...CLASSES[2], speed: 7.4, damage: 30, firerate: 3.8, pellets: 1 },
    name: def.nameZh,
    bossHook: def.hook,
    bossId: def.id,
    team: 1,
    shootCd: 0.35,
    aimYaw: 0,
    stateT: 0,
    mode: 'chase',
    alive: true,
    respawnT: 0,
    isBoss: true,
  });
  return def;
}

function showBossHud() {
  const wrap = document.getElementById('bossHud');
  const img = document.getElementById('bossPortrait');
  const nm = document.getElementById('bossNameHud');
  const hk = document.getElementById('bossHookHud');
  if (!wrap) return;
  const boss = bots.find((b) => b.isBoss && b.alive);
  if (!boss) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  if (nm) nm.textContent = boss.name;
  if (hk) hk.textContent = boss.bossHook || '';
  const def = boss.bossId ? bossById(boss.bossId) : null;
  if (img) {
    if (def && def.art) { img.src = def.art; img.style.display = ''; }
    else {
      img.removeAttribute('src');
      img.style.display = 'none';
    }
  }
}

function fillBossSplashStrip() {
  const strip = document.getElementById('bossSplashStrip');
  if (!strip) return;
  strip.innerHTML = '';
  BOSSES.forEach((b) => {
    if (!b.art) return;
    const fig = document.createElement('figure');
    fig.className = 'bossCard';
    fig.innerHTML = `<img src="${b.art}" alt="${b.nameZh}" loading="lazy"/><figcaption>${b.nameZh}</figcaption>`;
    strip.appendChild(fig);
  });
}

let bossIntroTimer = 0;
function showBossIntro(def) {
  const el = document.getElementById('bossIntro');
  if (!el || !def) return;
  const img = document.getElementById('bossIntroPortrait');
  const nm = document.getElementById('bossIntroName');
  const hk = document.getElementById('bossIntroHook');
  if (img) {
    if (def.art) { img.src = def.art; img.style.display = ''; }
    else { img.removeAttribute('src'); img.style.display = 'none'; }
  }
  if (nm) nm.textContent = def.nameZh;
  if (hk) hk.textContent = def.hook || '';
  el.classList.add('on');
  clearTimeout(bossIntroTimer);
  bossIntroTimer = setTimeout(() => el.classList.remove('on'), 2600);
}

function syncGunHud() {
  const el = document.getElementById('gunHud');
  if (!el) return;
  const gstat = activeGunStats();
  const icon = document.getElementById('meleeIcon');
  if (gstat && gstat.melee) {
    el.textContent = `身肉搏 · ${gstat.nameZh}`;
    if (icon) {
      icon.src = gstat.icon || 'refs/ui/ui-fist.jpg';
      icon.alt = gstat.nameZh;
      icon.style.display = 'inline-block';
    }
  } else {
    el.textContent = gstat && gstat.nameZh ? gstat.nameZh : '';
    if (icon) icon.style.display = 'none';
  }
}

function syncHudObjective() {
  const el = document.getElementById('objHud');
  if (!el) return;
  showBossHud();
  syncGunHud();
  const o = state.objective;
  if (!o) {
    if (state.gameMode === 'ffa') el.textContent = '混戰 · 先到 20 殺';
    else if (state.gameMode === 'tdm') el.textContent = `團隊 ${state.teamKills}/${TDM_WIN_KILLS}`;
    else if (state.gameMode === 'gungame') el.textContent = `槍階 ${state.gunIndex + 1}/${GUN_LADDER.length}`;
    else if (state.gameMode === 'bosshunt') el.textContent = 'Boss 狩獵';
    else el.textContent = '據點爭奪';
    return;
  }
  if (o.type === 'kill') el.textContent = `擊殺 ${state.kills}/${o.target}`;
  else if (o.type === 'survive') el.textContent = `存活 ${formatTime(state.timeLeft)}`;
  else if (o.type === 'hold') el.textContent = `據點 ${Math.floor(state.holdProgress)}/${o.target}s`;
  else if (o.type === 'tdm') el.textContent = `團隊 ${state.teamKills}/${o.target} · 敵 ${state.enemyTeamKills}`;
  else if (o.type === 'gungame') {
    const g = GUN_LADDER[Math.min(state.gunIndex, GUN_LADDER.length - 1)];
    el.textContent = `槍階 ${state.gunIndex + 1}/${GUN_LADDER.length} · ${g ? g.nameZh : ''}`;
  } else if (o.type === 'boss') {
    const alive = bots.some((b) => b.isBoss && b.alive);
    el.textContent = alive ? `狩獵 · ${state.bossId ? bossById(state.bossId).nameZh : 'Boss'}` : 'Boss 倒下';
  }
}

function configureObjectiveForMatch() {
  state.holdProgress = 0;
  state.weaponOverride = null;
  state.teamKills = 0;
  state.enemyTeamKills = 0;
  state.gunIndex = 0;
  state.armor = 0;
  state.speedBoost = 0;
  state.coins = 0;
  if (state.gameMode === 'campaign') {
    const lv = CHANNEL7[(state.campaignLevel - 1) | 0] || CHANNEL7[0];
    state.objective = { type: lv.mode, target: lv.target };
    state.timeLeft = lv.mode === 'survive' || lv.mode === 'hold' ? lv.target : (lv.time || MATCH_SECONDS);
  } else if (state.gameMode === 'hold') {
    state.objective = { type: 'hold', target: 90 };
    state.timeLeft = 150;
  } else if (state.gameMode === 'tdm') {
    state.objective = { type: 'tdm', target: TDM_WIN_KILLS };
    state.timeLeft = MATCH_SECONDS;
  } else if (state.gameMode === 'gungame') {
    state.objective = { type: 'gungame', target: GUN_LADDER.length };
    state.timeLeft = 240;
    state.weaponOverride = GUN_LADDER[0].id;
    applyGunLoadout(GUN_LADDER[0]);
  } else if (state.gameMode === 'bosshunt') {
    state.objective = { type: 'boss', target: 1 };
    state.timeLeft = 240;
  } else {
    state.objective = { type: 'kill', target: WIN_KILLS };
    state.timeLeft = MATCH_SECONDS;
  }
  syncHudObjective();
}

function checkObjectives() {
  if (matchOver || !running) return;
  const o = state.objective;
  if (!o) return;
  if (state.gameMode === 'ffa') {
    if (state.kills >= WIN_KILLS) endMatch(true);
    return;
  }
  if (o.type === 'kill' && state.kills >= o.target) endMatch(true);
  if (o.type === 'survive' && state.timeLeft <= 0) endMatch(true);
  if (o.type === 'hold' && state.holdProgress >= o.target) endMatch(true);
  if (o.type === 'tdm' && state.teamKills >= o.target) endMatch(true);
  if (o.type === 'gungame' && state.gunIndex >= GUN_LADDER.length) endMatch(true);
  if (o.type === 'boss') {
    const bosses = bots.filter((b) => b.isBoss);
    if (bosses.length && bosses.every((b) => !b.alive)) endMatch(true);
  }
}

function updateHold(dt) {
  if (!holdZone) return;
  const needHold = state.gameMode === 'hold' || (state.objective && state.objective.type === 'hold');
  if (!needHold) return;
  const dx = state.x - holdZone.x, dz = state.z - holdZone.z;
  const inside = dx * dx + dz * dz <= holdZone.r * holdZone.r;
  if (inside) {
    state.holdProgress += dt;
    syncHudObjective();
  }
}

function damageBot(bot, dmg, fromPlayer) {
  if (!bot.alive) return;
  // no friendly fire on TDM allies
  if (fromPlayer && state.gameMode === 'tdm' && bot.team === state.team) return;
  bot.hp -= dmg;
  showHit();
  bloodBursts.push({ x: bot.x, y: bot.y - 0.2, z: bot.z, t: 0.25 });
  if (bot.hp <= 0) {
    bot.alive = false;
    bot.respawnT = bot.isBoss ? 9999 : 1.6;
    bot.mesh.visible = false;
    if (fromPlayer) {
      state.kills += 1;
      if (state.gameMode === 'tdm' && bot.team !== state.team) {
        state.teamKills += 1;
      }
      {
        const g = activeGunStats();
        if (g && g.melee) feedKill(`肉搏擊倒 · ${bot.name}`);
        else feedKill(`你 擊殺了 ${bot.name}`);
      }
      if (bot.isBoss && bot.bossHook) feedKill(`${bot.name}——${bot.bossHook}`);
      document.getElementById('kills').textContent = String(state.kills);
      if (state.gameMode === 'gungame') {
        state.gunIndex += 1;
        if (state.gunIndex < GUN_LADDER.length) {
          const g = GUN_LADDER[state.gunIndex];
          state.weaponOverride = g.id;
          applyGunLoadout(g);
          feedKill(`槍階升級 · ${g.nameZh}`);
        } else {
          feedKill('槍階通關 · 霓虹刀收工');
        }
      }
      syncHudObjective();
      checkObjectives();
    }
  }
}

function damagePlayer(dmg, byName) {
  if (state.invuln > 0 || matchOver || !running) return;
  let remain = dmg;
  if (state.armor > 0) {
    const soak = Math.min(state.armor, remain * 0.6);
    state.armor -= soak;
    remain -= soak;
  }
  state.hp -= remain;
  dmgFlash.style.opacity = '1';
  setTimeout(() => { dmgFlash.style.opacity = '0'; }, 120);
  document.getElementById('hp').textContent = String(Math.max(0, state.hp | 0));
  if (state.hp <= 0) {
    state.deaths += 1;
    if (state.gameMode === 'tdm') state.enemyTeamKills += 1;
    document.getElementById('deaths').textContent = String(state.deaths);
    feedKill(`${byName || 'BOT'} 擊殺了 你`);
    syncHudObjective();
    if (state.gameMode === 'tdm' && state.enemyTeamKills >= TDM_WIN_KILLS) {
      endMatch(false);
      return;
    }
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
  const cls = activeGunStats();
  state.shootCd = Math.max(0, state.shootCd - dt);
  if (state.reloading) {
    state.reloadT -= dt;
    if (state.reloadT <= 0) {
      if (cls.melee) {
        state.ammo = 1;
      } else {
        const need = cls.mag - state.ammo;
        const take = Math.min(need, state.reserve);
        state.ammo += take;
        state.reserve -= take;
      }
      state.reloading = false;
      document.getElementById('ammo').textContent = String(state.ammo);
      document.getElementById('reserve').textContent = String(state.reserve);
    }
    return;
  }
  const needAmmo = !cls.melee;
  if (!(keys.Mouse0 || keys.shoot) || state.shootCd > 0 || (needAmmo && state.ammo <= 0)) {
    if ((keys.Mouse0 || keys.shoot) && needAmmo && state.ammo <= 0) startReload();
    return;
  }
  if (needAmmo) {
    state.ammo -= 1;
    document.getElementById('ammo').textContent = String(state.ammo);
  }
  state.shootCd = 1 / cls.firerate;
  if (muzzleFlash && !cls.melee) {
    muzzleFlash.visible = true;
    setTimeout(() => { if (muzzleFlash) muzzleFlash.visible = false; }, 40);
  }

  const eye = { x: state.x, y: state.y, z: state.z };
  const maxRange = cls.melee ? (cls.range || 2.2) : 120;

  // 身肉搏 — wide forward cone (not single hairline ray)
  if (cls.melee) {
    const { dx, dy, dz } = dirFromAngles(yaw, pitch);
    const cone = cls.cone || 0.8;
    let hitAny = false;
    for (const b of bots) {
      if (!b.alive) continue;
      if (state.gameMode === 'tdm' && b.team === state.team) continue;
      const bx = b.x - eye.x, by = (b.y - 0.35) - eye.y, bz = b.z - eye.z;
      const dist = Math.hypot(bx, by, bz);
      if (dist > maxRange || dist < 0.15) continue;
      const inv = 1 / dist;
      const dot = bx * inv * dx + by * inv * dy + bz * inv * dz;
      if (dot < Math.cos(cone)) continue;
      // soft wall block along segment
      let blocked = false;
      const steps = Math.max(3, Math.ceil(dist / 0.4));
      for (let i = 1; i < steps; i++) {
        const t = (i / steps) * dist;
        const px = eye.x + bx * inv * t, py = eye.y + by * inv * t, pz = eye.z + bz * inv * t;
        for (const box of solidBoxes) {
          if (px >= box.minX && px <= box.maxX && py >= box.minY && py <= box.maxY && pz >= box.minZ && pz <= box.maxZ) {
            blocked = true; break;
          }
        }
        if (blocked) break;
      }
      if (blocked) continue;
      damageBot(b, cls.damage, true);
      hitAny = true;
      bloodBursts.push({ x: b.x, y: b.y - 0.2, z: b.z, t: 0.2 });
    }
    // short swing trace for feedback
    bulletTraces.push({
      x0: eye.x, y0: eye.y, z0: eye.z,
      x1: eye.x + dx * maxRange, y1: eye.y + dy * maxRange, z1: eye.z + dz * maxRange,
      t: 0.06,
    });
    if (hitAny) showHit();
    return;
  }

  for (let p = 0; p < cls.pellets; p++) {
    const sy = yaw + (Math.random() - 0.5) * cls.spread * 2;
    const sp = pitch + (Math.random() - 0.5) * cls.spread * 2;
    const { dx, dy, dz } = dirFromAngles(sy, sp);
    const hit = rayHitscan(eye.x, eye.y, eye.z, dx, dy, dz, maxRange, null);
    if (hit.point) {
      bulletTraces.push({
        x0: eye.x, y0: eye.y, z0: eye.z,
        x1: hit.point.x, y1: hit.point.y, z1: hit.point.z,
        t: 0.08,
      });
    }
    if (hit.bot) {
      const fall = Math.max(0.55, 1 - hit.dist / 100);
      damageBot(hit.bot, cls.damage * fall, true);
    }
    // rocket splash — nearby bots around impact
    if (cls.splash && hit.point) {
      for (const b of bots) {
        if (!b.alive || b === hit.bot) continue;
        const ddx = b.x - hit.point.x, ddz = b.z - hit.point.z;
        const d = Math.hypot(ddx, ddz);
        if (d < cls.splash) damageBot(b, cls.damage * (1 - d / cls.splash) * 0.55, true);
      }
    }
  }
}

function startReload() {
  const cls = activeGunStats();
  if (cls.melee) return;
  if (state.reloading || state.ammo >= cls.mag || state.reserve <= 0) return;
  state.reloading = true;
  state.reloadT = cls.reload;
}

function updateBots(dt) {
  for (const b of bots) {
    if (!b.alive) {
      if (b.isBoss) continue; // bosses stay dead
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
    // TDM allies hunt enemy bots; everyone else hunts the player
    let tx = state.x, tz = state.z;
    let targetIsPlayer = true;
    if (state.gameMode === 'tdm' && b.team === state.team) {
      const foe = bots.find((o) => o.alive && o.team !== b.team && !o.isBoss) || bots.find((o) => o.alive && o.team !== b.team);
      if (foe) { tx = foe.x; tz = foe.z; targetIsPlayer = false; }
      else { targetIsPlayer = false; }
    }
    const dx = tx - b.x;
    const dz = tz - b.z;
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

    // shoot at target if LOS roughly (allies never shoot player)
    b.shootCd -= dt;
    // close-range 身肉搏 punch when on top of player
    if (b.shootCd <= 0 && targetIsPlayer && dist < 2.3 && !(state.gameMode === 'tdm' && b.team === state.team)) {
      b.shootCd = 0.55;
      damagePlayer(18, b.name);
      bloodBursts.push({ x: state.x, y: state.y - 0.3, z: state.z, t: 0.15 });
      continue;
    }
    if (b.shootCd <= 0 && dist < 42 && !(state.gameMode === 'tdm' && b.team === state.team && targetIsPlayer)) {
      b.shootCd = 1 / (b.cls.firerate * 0.55) + Math.random() * 0.15;
      const ey = b.y - 0.1;
      const dir = dirFromAngles(b.aimYaw + (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.05);
      // aim toward player vertical
      const pdy = state.y - ey;
      const len = Math.hypot(dx, pdy, dz);
      const rdx = dx / len, rdy = pdy / len, rdz = dz / len;
      const hit = rayHitscan(b.x, ey, b.z, rdx, rdy, rdz, 80, b);
      const toTarget = dist;
      let blocked = false;
      const steps = 20;
      for (let i = 1; i < steps; i++) {
        const t = (i / steps) * toTarget;
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
        if (targetIsPlayer) {
          if (!hit.bot && hit.dist >= toTarget - 0.5) damagePlayer(dmg, b.name);
        } else if (hit.bot && hit.bot.team !== b.team) {
          hit.bot.hp -= dmg;
          if (hit.bot.hp <= 0) {
            hit.bot.alive = false;
            hit.bot.respawnT = 1.6;
            hit.bot.mesh.visible = false;
            if (b.team === state.team) {
              state.teamKills += 1;
              syncHudObjective();
              checkObjectives();
            }
          }
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
  const isCampaign = state.gameMode === 'campaign';
  const lv = state.campaignLevel | 0;
  let title = wonByKills ? '勝利！' : '時間到';
  let sub = wonByKills ? 'FIRST TO 20' : 'TIME UP';
  const again = document.getElementById('btnAgain');
  const nextBtn = document.getElementById('btnNextLevel');
  if (nextBtn) nextBtn.style.display = 'none';
  if (isCampaign) {
    if (wonByKills) {
      if (lv >= 20) {
        title = '今晚收視你贏晒';
        sub = 'CHANNEL 7 FINALE CLEAR';
      } else {
        title = 'Channel 7 下一場';
        sub = `第 ${lv} 關通過 · 下一關 ${lv + 1}/20`;
        if (nextBtn) nextBtn.style.display = '';
      }
    } else {
      title = '收視失敗';
      sub = `第 ${lv} 關未通過`;
    }
  } else if (state.gameMode === 'hold') {
    title = wonByKills ? '據點爭奪成功' : '據點失守';
    sub = wonByKills ? 'POINT SECURED' : 'POINT LOST';
  } else if (state.gameMode === 'tdm') {
    title = wonByKills ? '團隊死鬥勝利' : '團隊死鬥敗北';
    sub = wonByKills ? `TEAM ${state.teamKills}` : `ENEMY ${state.enemyTeamKills}`;
  } else if (state.gameMode === 'gungame') {
    title = wonByKills ? '槍階亂鬥通關' : '槍階未完成';
    sub = wonByKills ? 'LADDER CLEAR' : `階 ${state.gunIndex}/${GUN_LADDER.length}`;
  } else if (state.gameMode === 'bosshunt') {
    title = wonByKills ? 'Boss 狩獵成功' : '狩獵失敗';
    const bn = state.bossId ? bossById(state.bossId).nameZh : 'Boss';
    sub = wonByKills ? bn : 'BOSS ESCAPED';
  } else if (state.gameMode === 'ffa') {
    title = wonByKills ? '混戰勝利' : '混戰結束';
    sub = wonByKills ? 'FIRST TO 20' : 'TIME UP';
  }
  document.getElementById('endTitle').textContent = title;
  document.getElementById('endSub').textContent = sub;
  document.getElementById('endKills').textContent = String(state.kills);
  document.getElementById('endDeaths').textContent = String(state.deaths);
  document.getElementById('endKD').textContent = (state.kills / Math.max(1, state.deaths)).toFixed(1);
  overlay.classList.remove('hidden');
  showPanel('panelEnd');
}

function startMatch(mapId, classId, opts = {}) {
  initRenderer();
  if (opts.gameMode) state.gameMode = opts.gameMode;
  if (opts.campaignLevel) state.campaignLevel = opts.campaignLevel;
  if (state.gameMode === 'campaign') {
    const lv = CHANNEL7[(state.campaignLevel - 1) | 0] || CHANNEL7[0];
    mapId = lv.mapId;
    state.campaignLevel = lv.level;
  }
  state.mapId = mapId;
  state.classId = classId;
  selectedMap = mapId;
  selectedClass = classId;
  const cls = classById(classId);
  // set mode before buildWorld so spawnBots can team-split
  buildWorld(mapId);
  // bosses for campaign / boss hunt
  if (state.gameMode === 'campaign') {
    const lv = CHANNEL7[(state.campaignLevel - 1) | 0];
    if (lv && lv.boss) spawnBoss(worldRoot || scene, lv.level, lv.bossId);
  } else if (state.gameMode === 'bosshunt') {
    const bid = opts.bossId || BOSS_HUNT_ROSTER[(Math.random() * BOSS_HUNT_ROSTER.length) | 0];
    spawnBoss(worldRoot || scene, 12, bid);
  }
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
  state.weaponOverride = null;
  state.team = 0;
  configureObjectiveForMatch();
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
  syncHudObjective();
  const bossBot = bots.find((b) => b.isBoss && b.alive);
  if (bossBot) feedKill(`${bossBot.name}——${bossBot.bossHook || ''}`);
  showBossHud();
  if (bossBot && bossBot.bossId) showBossIntro(bossById(bossBot.bossId));
  syncGunHud();

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
  // 身肉搏 — V cycles 拳頭 → 膝撞 → 霓虹刀 → gun (disabled in gungame)
  if (e.code === 'KeyV' && running && state.gameMode !== 'gungame') {
    const cur = state.weaponOverride;
    let next = null;
    if (!cur || !MELEE_CYCLE.includes(cur)) next = 'fist';
    else {
      const i = MELEE_CYCLE.indexOf(cur);
      next = i < MELEE_CYCLE.length - 1 ? MELEE_CYCLE[i + 1] : null;
    }
    if (next) {
      state.weaponOverride = next;
      const w = EXTRA_WEAPONS.find((x) => x.id === next);
      applyGunLoadout(w);
      feedKill(next === 'knife' ? '切換 · 霓虹刀' : `身肉搏 · ${w ? w.nameZh : next}`);
    } else {
      state.weaponOverride = null;
      applyGunLoadout(classById(state.classId));
      feedKill('切換 · 槍械');
    }
    syncGunHud();
  }
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
    if (state.timeLeft <= 0) {
      if (state.objective && state.objective.type === 'survive') endMatch(true);
      else if (state.objective && state.objective.type === 'hold') endMatch(state.holdProgress >= (state.objective.target || 0));
      else endMatch(false);
    }

    applyPlayerPhysics(dt);
    updateCamera();
    tryShoot(dt);
    updateBots(dt);
    updateTraces(dt);
    updatePickups(dt);
    updateHold(dt);
    checkObjectives();

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
  cameraMode: 'tpp',
  playerVisible: !!(playerMesh && playerMesh.visible),
  playerBillboard: !!(playerMesh && playerMesh.userData && playerMesh.userData.billboard && playerMesh.userData.billboard.visible),
  playerPose: playerMesh?.userData?.pose || null,
  ammo: state.ammo,
  sliding: state.sliding,
  gameMode: state.gameMode,
  campaignLevel: state.campaignLevel,
  objective: state.objective,
  holdProgress: state.holdProgress,
  weaponOverride: state.weaponOverride,
  pickups: pickups.filter((p) => p.alive).length,
  bots: bots.length,
  bosses: bots.filter((b) => b.isBoss).length,
  bossId: state.bossId,
  bossName: bots.find((b) => b.isBoss)?.name || null,
  teamKills: state.teamKills,
  gunIndex: state.gunIndex,
  armor: state.armor,
  coins: state.coins,
  allyBots: bots.filter((b) => b.team === 0 && !b.isBoss).length,
  enemyBots: bots.filter((b) => b.team === 1 && !b.isBoss).length,
  builderUnique: true,
  envPlate: { ...envPlateStatus },
});

window.__envPlateStatus = (mapId) => {
  const id = mapId || state.mapId || envPlateStatus.mapId;
  return {
    mapId: id,
    url: envPlateUrl(id),
    status: id === envPlateStatus.mapId ? envPlateStatus.status : (envTextureCache.has(id) ? 'ready' : 'unknown'),
    cached: envTextureCache.has(id),
    envMapIds: ENV_MAP_IDS.slice(),
  };
};

window.__mapBuilders = () => ({
  signs: 'buildNeonSignStreet',
  minibus: 'buildMinibusAlley',
  tonglau: 'buildTongLauBend',
  tram: 'buildTramStreet',
  nightstall: 'buildNightStall',
  neonroof: 'buildNeonRooftop',
  kaitak: 'buildKaiTakRoof',
  estate: 'buildEstateRoof',
  skybridge: 'buildSkybridge',
  watertower: 'buildWaterTower',
  cargo: 'buildCargoPier',
  temple: 'buildNeonTemple',
  teahouse: 'buildTeahouseBack',
  loading: 'buildLoadingBay',
  crane: 'buildCraneYard',
  pawnarcade: 'buildPawnArcade',
  signcanyon: 'buildSignCanyon',
  doubletram: 'buildDoubleTram',
  ch7studio: 'buildCh7Studio',
  harbourfinal: 'buildHarbourFinal',
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
  startMatch(selectedMap, selectedClass, { gameMode: 'ffa' });
};

window.__startCampaignTest = (level, classId) => {
  selectedClass = classId || 'spark';
  startMatch(null, selectedClass, { gameMode: 'campaign', campaignLevel: level || 1 });
  return window.__dbg();
};

window.__startHoldTest = (mapId, classId) => {
  selectedMap = mapId || 'cargo';
  selectedClass = classId || 'spark';
  startMatch(selectedMap, selectedClass, { gameMode: 'hold' });
  return window.__dbg();
};

window.__startTdmTest = (mapId, classId) => {
  selectedMap = mapId || 'cargo';
  selectedClass = classId || 'spark';
  startMatch(selectedMap, selectedClass, { gameMode: 'tdm' });
  return window.__dbg();
};

window.__startGunGameTest = (mapId, classId) => {
  selectedMap = mapId || 'cargo';
  selectedClass = classId || 'spark';
  startMatch(selectedMap, selectedClass, { gameMode: 'gungame' });
  return window.__dbg();
};

window.__startBossHuntTest = (mapId, classId, bossId) => {
  selectedMap = mapId || 'cargo';
  selectedClass = classId || 'spark';
  startMatch(selectedMap, selectedClass, { gameMode: 'bosshunt', bossId: bossId || 'producer' });
  return window.__dbg();
};

window.__lexicon = () => ({
  splash: {
    primary: '霓虹未熄，港灣已開打——鏡頭一開就係戰場。',
    secondary: 'Channel 7 開波，今晚收視你話事。',
  },
  modes: GAME_MODES.map((m) => m.nameZh),
  guns: [
    ...CLASSES.map((c) => c.nameZh),
    ...EXTRA_WEAPONS.map((w) => w.nameZh),
  ],
  ladder: GUN_LADDER.map((g) => g.nameZh),
  pickups: ['取得彈藥箱', '取得護甲片', '取得醫療包', '取得速度飲料', '取得金幣'],
  melee: { hud: '身肉搏', fist: '拳頭', knee: '膝撞', knife: '霓虹刀', feed: '肉搏擊倒', tip: '近身可肉搏', icons: { fist: 'refs/ui/ui-fist.jpg', knee: 'refs/ui/ui-knee.jpg', knife: 'refs/ui/ui-neon-knife.jpg', fx: 'refs/ui/fx-melee-hitspark.jpg', sheet: 'refs/ui/melee-sheet.jpg' } },
  bosses: BOSSES.map((b) => ({ id: b.id, nameZh: b.nameZh, hook: b.hook, art: b.art })),
  sheets: { weapons: 'refs/ui/weapons-sheet.jpg', pickups: 'refs/ui/pickups-sheet.jpg' },
  campaignBosses: CHANNEL7.filter((l) => l.boss).map((l) => ({ level: l.level, bossId: l.bossId, nameZh: (BOSSES.find((b) => b.id === l.bossId) || {}).nameZh })),
});
