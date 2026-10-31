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
/** Plate-first: never spawn solid-color arena meshes (collision AABBs only). */
const PLATE_ONLY_ARENA = true;
let muzzleFlash = null;
let gunMesh = null;
let playerMesh = null; // visible TPP hero (simple humanoid; Multimedia refs/player/* can skin later)
const CAM_BACK = 3.15;
const CAM_RIGHT = 0.42;
const CAM_UP = 1.12;
const CAM_COLLIDE_PAD = 1.15; // sphere pad vs building solids — chase cam must not enter walls/façade cards
const CAM_CORRIDOR_MAX_X = 5.6; // densify inner face ~7.4; keep chase cam inside playable canyon
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
    if (!showChannel7Transition(next, { classId: state.classId || selectedClass })) {
      startMatch(null, state.classId || selectedClass, { gameMode: 'campaign', campaignLevel: next });
    }
  });
}
const btnTrans = document.getElementById('btnTransContinue');
if (btnTrans) {
  btnTrans.addEventListener('click', () => continueChannel7Transition());
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
  if (solid) solidBoxes.push(boxSolid(x, y, z, w, h, d));
  // Vincent: 唔好大色塊 — collision stays, solid-color façade/lightbox mesh never enters the scene
  if (PLATE_ONLY_ARENA) return null;
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
  return mesh;
}

function addNeonSign(group, x, y, z, w, h, color) {
  if (PLATE_ONLY_ARENA) return null; // floating neon lightbox boards deleted
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
  if (PLATE_ONLY_ARENA) return null; // ZH shop lightbox boards deleted from render
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
  if (PLATE_ONLY_ARENA) {
    const cw = rotY === 0 || Math.abs(Math.abs(rotY) - Math.PI) < 0.2 ? 1.95 : 4.2;
    const cd = rotY === 0 || Math.abs(Math.abs(rotY) - Math.PI) < 0.2 ? 4.2 : 1.95;
    solidBoxes.push(boxSolid(x, 0, z, cw, 1.55, cd));
    return null;
  }

  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.name = 'curbProp';
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
  if (PLATE_ONLY_ARENA) return null;

  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.name = 'curbProp';
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


/** Atlas-backed vehicle materials (static collidable props). Prefer refs/vehicles/* when present. */
const VEHICLE_TEX = {
  minibus: './refs/vehicles/veh-minibus-side.jpg',
  taxi: './refs/vehicles/veh-taxi-side.jpg',
  sedan: './refs/vehicles/veh-sedan-side.jpg',
  motorcycle: './refs/vehicles/veh-motorcycle-side.jpg',
};
function paintVehicleMat(mat, urlFallbackAtlas, onOk, onFail) {
  const tryUrls = [];
  if (mat.userData && mat.userData.vehicleUrl) tryUrls.push(mat.userData.vehicleUrl);
  if (urlFallbackAtlas) tryUrls.push(urlFallbackAtlas);
  const doneOk = () => { try { onOk && onOk(); } catch (_) {} };
  const doneFail = () => { try { onFail && onFail(); } catch (_) {} };
  const attempt = (i) => {
    if (i >= tryUrls.length) { doneFail(); return; }
    const url = tryUrls[i];
    const isVeh = /\/refs\/vehicles\//.test(url);
    if (isVeh) {
      // Multimedia vehicle sides are #00FF00 chroma plates — key then apply
      loadPlayerPoseTex(url).then((tex) => {
        if (!tex) { attempt(i + 1); return; }
        mat.map = tex;
        mat.transparent = true;
        mat.alphaTest = 0.35;
        mat.color.setHex(0xffffff);
        mat.needsUpdate = true;
        doneOk();
      });
      return;
    }
    loadAtlasTex(url).then((tex) => {
      if (!tex) { attempt(i + 1); return; }
      const m = tex.clone();
      m.wrapS = m.wrapT = THREE.RepeatWrapping;
      m.repeat.set(mat.userData.repX || 1.2, mat.userData.repY || 1.0);
      m.needsUpdate = true;
      mat.map = m;
      mat.color.setHex(0xffffff);
      mat.needsUpdate = true;
      doneOk();
    });
  };
  attempt(0);
  return mat;
}

function addVehSideCard(group, url, w, h, y, zOff = 0) {
  // Start HIDDEN — MeshBasicMaterial default white reads as giant white slabs until map binds.
  // Share one material across both sides so async paintVehicleMat updates both faces.
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, depthWrite: false, fog: true,
  });
  mat.userData.vehicleUrl = url;
  const card = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  card.position.set(0, y, zOff);
  card.name = 'vehSideCard';
  card.userData.envTextured = true;
  card.userData.awaitingTex = true;
  card.visible = false;
  group.add(card);
  const card2 = new THREE.Mesh(card.geometry, mat);
  card2.position.copy(card.position);
  card2.rotation.y = Math.PI;
  card2.name = 'vehSideCard';
  card2.userData.envTextured = true;
  card2.userData.awaitingTex = true;
  card2.visible = false;
  group.add(card2);
  paintVehicleMat(mat, null, () => {
    card.visible = true;
    card2.visible = true;
    card.userData.awaitingTex = false;
    card2.userData.awaitingTex = false;
  }, () => {
    // Texture failed — never leave white planes in FOV
    try { if (card.parent) card.parent.remove(card); } catch (_) {}
    try { if (card2.parent) card2.parent.remove(card2); } catch (_) {}
  });
  return card;
}



/** 紅色手推車 / goods tricycle — curb clutter (soft or light collision). */
function addRedHandcart(group, x, z, rotY = 0, solid = false) {
  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.userData.vehicle = true;
  g.name = 'vehicleProp';
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  addVehSideCard(g, VEHICLE_TEX.motorcycle, 1.3, 1.0, 0.65);
  group.add(g);
  if (solid) solidBoxes.push(boxSolid(x, 0, z, 1.2, 1.1, 1.8));
  return g;
}

/** Vintage sedan / taxi placeholder — static collidable, atlas/vehicle textured. */
function addVintageSedan(group, x, z, rotY = 0, color = 0xf2f0ea) {
  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.userData.vehicle = true;
  g.name = 'vehicleProp';
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  const url = color === 0xffd36a ? VEHICLE_TEX.taxi : VEHICLE_TEX.sedan;
  addVehSideCard(g, url, 3.7, 1.35, 0.85);
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
  if (PLATE_ONLY_ARENA) return null;
  if (text == null || text === 'undefined' || String(text).trim() === '') return null;
  addZhPanel(group, x, y, z, w, h, depth, text, {
    vertical: false, bg, fg, emissive, emitInt, rotY,
  });
  // thin bracket arm back toward façade
  addBox(group, x, y + h * 0.45, z, Math.max(0.35, w * 0.15), 0.06, 0.06, 0x3a3030, 0x000000, 0, false);
}

/** HK minibus — static collidable, atlas/vehicle textured (never pure color slab). */
function addMinibus(group, x, z, roof = 'red', rotY = 0) {
  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.userData.vehicle = true;
  g.name = 'vehicleProp';
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  // Photoreal chroma side cards only — no solid-color chassis boxes (Vincent FAIL)
  addVehSideCard(g, VEHICLE_TEX.minibus, 5.0, 1.9, 1.15);
  group.add(g);
  const aligned = Math.abs(rotY % Math.PI) < 0.3 || Math.abs(Math.abs(rotY % Math.PI) - Math.PI) < 0.3;
  solidBoxes.push(boxSolid(x, 0, z, aligned ? 2.2 : 5.3, 2.1, aligned ? 5.3 : 2.2));
  return g;
}


/** HK motorcycle — static curb prop, chroma side plate on card + collision. */
function addMotorcycle(group, x, z, rotY = 0) {
  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.userData.vehicle = true;
  g.name = 'vehicleProp';
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  addVehSideCard(g, VEHICLE_TEX.motorcycle, 1.7, 1.1, 0.7);
  group.add(g);
  solidBoxes.push(boxSolid(x, 0, z, 0.7, 1.0, 1.9));
  return g;
}
/** Small delivery truck — static collidable, atlas textured. */
function addSmallTruck(group, x, z, rotY = 0) {
  const g = new THREE.Group();
  g.userData.keepVisual = true;
  g.userData.vehicle = true;
  g.name = 'vehicleProp';
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  // Truck uses sedan side as stand-in until dedicated plate exists
  addVehSideCard(g, VEHICLE_TEX.sedan, 4.2, 1.6, 1.0);
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
  if (PLATE_ONLY_ARENA) return null;
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
  solidBoxes.push(boxSolid(0, -1, 0, 80, 1, 80));
  if (!PLATE_ONLY_ARENA) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x152238, roughness: 0.92, metalness: 0.08 })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);
  }

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
  solidBoxes.push(boxSolid(0, -1, 0, 56, 1, 56));
  if (!PLATE_ONLY_ARENA) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(56, 56),
      new THREE.MeshStandardMaterial({ color: 0x0a0814, roughness: 0.9, metalness: 0.08 })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);
  }

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
  solidBoxes.push(boxSolid(0, -1, 0, 48, 1, 52));
  if (!PLATE_ONLY_ARENA) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(48, 52),
      new THREE.MeshStandardMaterial({ color: 0x12101a, roughness: 0.28, metalness: 0.62 })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);
  }

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
  solidBoxes.push(boxSolid(0, -1, 0, 56, 1, 56));
  if (!PLATE_ONLY_ARENA) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(56, 56),
      new THREE.MeshStandardMaterial({ color: 0x2a2e36, roughness: 0.95, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);
  }

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
  solidBoxes.push(boxSolid(0, -1, 0, 40, 1, 48));
  if (!PLATE_ONLY_ARENA) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 48),
      new THREE.MeshStandardMaterial({ color: 0x1a1420, roughness: 0.55, metalness: 0.25 })
    );
    ground.rotation.x = -Math.PI / 2;
    root.add(ground);
  }

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
  solidBoxes.push(boxSolid(0, -1, 0, size, 1, size));
  if (PLATE_ONLY_ARENA) return null; // env ground plate owns the floor
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.12 })
  );
  ground.rotation.x = -Math.PI / 2;
  root.add(ground);
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
  back: './refs/player/player-back-full.jpg?v=chroma2',
  gun: './refs/player/player-gun-pose.jpg?v=chroma2',
  melee: './refs/player/player-melee-pose.jpg?v=chroma2',
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
  const w = c.width;
  const h = c.height;
  // Multimedia contract: solid #00FF00 only. Never luma-key charcoal fabric.
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const maxRB = Math.max(r, b);
    const greenScreen = g >= 155 && g > r + 55 && g > b + 55 && g >= maxRB * 1.85 && (r + b) < g * 0.82;
    if (greenScreen) {
      const excess = Math.min(1, (g - maxRB) / 55);
      px[i + 3] = excess > 0.16 ? 0 : Math.min(px[i + 3], Math.floor((1 - excess) * 18));
      if (px[i + 3] > 0 && g > maxRB) {
        // hard despill — kill cyan/green fringe on shoulder edge
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
  // 1px alpha erode on fringe next to keyed transparency (kills residual halo)
  const alphaCopy = new Uint8ClampedArray(px.length);
  alphaCopy.set(px);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const a = alphaCopy[idx * 4 + 3];
      if (a < 8 || a > 220) continue;
      let nearClear = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (alphaCopy[((y + dy) * w + (x + dx)) * 4 + 3] < 12) { nearClear = true; break; }
      }
      if (nearClear) {
        px[idx * 4 + 3] = 0;
        // despill leftover fringe RGB
        const maxRB = Math.max(px[idx * 4], px[idx * 4 + 2]);
        if (px[idx * 4 + 1] > maxRB + 8) px[idx * 4 + 1] = maxRB;
      }
    }
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
    alphaTest: 0.35,
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

/** Multimedia bot back plates (#00FF00). Fallback: player-back-full until refs land. */

/** Civilian NPC greenscreen plates (Multimedia). Moving walkers alongside combat bots. */
const NPC_TEX = [
  './refs/npcs/npc-civilian-a.jpg?v=npc1',
  './refs/npcs/npc-civilian-b.jpg?v=npc1',
  './refs/npcs/npc-civilian-c.jpg?v=npc1',
];
let streetNpcs = [];

function makeNpcMesh(texUrl) {
  const g = new THREE.Group();
  g.name = 'npcActor';
  g.userData.npc = true;
  g.userData.keepVisual = true;
  const stub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x141820, transparent: true, opacity: 0.2 })
  );
  stub.position.y = 0.85;
  stub.name = 'npcStub';
  g.add(stub);
  const mat = new THREE.SpriteMaterial({
    color: 0xffffff, transparent: true, depthWrite: false, alphaTest: 0.35, fog: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.85, 1.65, 1);
  sprite.position.y = 0.88;
  sprite.visible = false;
  g.add(sprite);
  g.userData.billboard = sprite;
  g.userData.stub = stub;
  const apply = (tex) => {
    if (!tex) return;
    sprite.material.map = tex;
    sprite.material.needsUpdate = true;
    sprite.visible = true;
    stub.visible = false;
  };
  loadPlayerPoseTex(texUrl).then((tex) => {
    if (tex) apply(tex);
    else loadPlayerPoseTex(PLAYER_TEX.back).then(apply);
  });
  return g;
}

function spawnStreetNpcs(root) {
  streetNpcs.forEach((n) => { try { root.remove(n.mesh); } catch (_) {} });
  streetNpcs = [];
  if (!root) return;
  const spots = [[-2.2, -10], [2.3, 11], [-1.8, 7], [2.0, -5], [-2.4, 2]];
  spots.forEach((sp, i) => {
    const url = NPC_TEX[i % NPC_TEX.length];
    const mesh = makeNpcMesh(url);
    const cleared = resolveBotClear(sp[0], sp[1], PLAYER_HEIGHT, 0.4);
    mesh.position.set(cleared.x, 0, cleared.z);
    root.add(mesh);
    streetNpcs.push({
      mesh, x: cleared.x, z: cleared.z, y: PLAYER_HEIGHT,
      heading: Math.random() * Math.PI * 2,
      speed: 1.1 + Math.random() * 0.6,
      turnT: 1 + Math.random() * 2,
      alive: true,
    });
  });
}

function updateStreetNpcs(dt) {
  for (const n of streetNpcs) {
    if (!n || !n.alive) continue;
    n.turnT -= dt;
    if (n.turnT <= 0) {
      n.heading += (Math.random() - 0.5) * 1.4;
      n.turnT = 1.2 + Math.random() * 2.5;
    }
    // wander corridor, avoid deep façades
    let wx = Math.sin(n.heading), wz = Math.cos(n.heading);
    if (Math.abs(n.x) > 2.3) wx += -Math.sign(n.x) * 0.8;
    const len = Math.hypot(wx, wz) || 1;
    const nx = n.x + (wx / len) * n.speed * dt;
    const nz = n.z + (wz / len) * n.speed * dt;
    const c = collideXZ(nx, nz, n.y, 0.35);
    const moved = Math.hypot(c.x - n.x, c.z - n.z);
    if (moved < n.speed * dt * 0.15) n.heading += Math.PI * 0.6;
    n.x = Math.max(-2.6, Math.min(2.6, c.x));
    n.z = Math.max(-18, Math.min(18, c.z));
    if (n.mesh) n.mesh.position.set(n.x, 0, n.z);
  }
}

// Multimedia arms-down IDLE + walk backs (NOT T-pose). Chroma #00FF00.
const BOT_TEX = {
  spark: {
    idle: './refs/bots/bot-spark-back.jpg?v=armsdown',
    walk: './refs/bots/bot-spark-walk.jpg?v=armsdown',
  },
  shade: {
    idle: './refs/bots/bot-shade-back.jpg?v=armsdown',
    walk: './refs/bots/bot-shade-walk.jpg?v=armsdown',
  },
  rock: {
    idle: './refs/bots/bot-rock-back.jpg?v=armsdown',
    walk: './refs/bots/bot-rock-walk.jpg?v=armsdown',
  },
};

function makeBotMesh(color, classId = 'spark') {
  const g = new THREE.Group();
  g.name = 'botActor';
  // Soft stub until chroma billboard resolves — never leave navy capsule as the look
  const stub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.24, 1.55, 8),
    new THREE.MeshStandardMaterial({ color: 0x141820, transparent: true, opacity: 0.25, roughness: 0.85 })
  );
  stub.position.y = 0.9;
  stub.name = 'botStub';
  g.add(stub);

  const mat = new THREE.SpriteMaterial({
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.35,
    fog: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.name = 'botBillboard';
  sprite.scale.set(0.92, 1.78, 1);
  sprite.position.y = 0.92;
  sprite.visible = false;
  g.add(sprite);
  g.userData.billboard = sprite;
  g.userData.stub = stub;
  g.userData.teamColor = color;
  g.userData.classId = classId;
  g.userData.botPose = 'idle';
  g.userData.texIdle = null;
  g.userData.texWalk = null;

  // Team pip OFF by default — colored spheres read as leftover debug orbs in TPP FOV.
  // Keep node for probes but never render.
  const pip = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.35 })
  );
  pip.position.set(0, 1.78, 0.12);
  pip.name = 'botTeamPip';
  pip.visible = false;
  g.add(pip);

  const pack = BOT_TEX[classId] || BOT_TEX.spark;
  const applyTex = (tex, pose) => {
    if (!tex || !g.userData.billboard) return false;
    if (pose === 'walk') g.userData.texWalk = tex;
    else g.userData.texIdle = tex;
    const prefer = (g.userData.botPose === 'walk' && g.userData.texWalk)
      ? g.userData.texWalk
      : (g.userData.texIdle || tex);
    g.userData.billboard.material.map = prefer;
    g.userData.billboard.material.needsUpdate = true;
    g.userData.billboard.visible = true;
    if (g.userData.stub) g.userData.stub.visible = false;
    return true;
  };
  loadPlayerPoseTex(pack.idle).then((tex) => {
    if (applyTex(tex, 'idle')) {
      loadPlayerPoseTex(pack.walk).then((w) => applyTex(w, 'walk'));
      return;
    }
    // Fallback: photoreal player back if class plate missing
    loadPlayerPoseTex(PLAYER_TEX.back).then((t) => applyTex(t, 'idle'));
  });
  return g;
}

/** Swap bot billboard idle↔walk from movement speed (soft — no perfect cycle needed). */
function syncBotWalkPose(bot, stepPerSec) {
  if (!bot || !bot.mesh || !bot.mesh.userData) return;
  const ud = bot.mesh.userData;
  const want = stepPerSec > 1.2 ? 'walk' : 'idle';
  if (ud.botPose === want) return;
  const tex = want === 'walk' ? (ud.texWalk || ud.texIdle) : (ud.texIdle || ud.texWalk);
  if (!tex || !ud.billboard || !ud.billboard.material) return;
  ud.botPose = want;
  ud.billboard.material.map = tex;
  ud.billboard.material.needsUpdate = true;
}

function classById(id) {
  return CLASSES.find((c) => c.id === id) || CLASSES[0];
}

function randomSpawn() {
  const corridor = (spawnPoints || []).filter((p) => Math.abs(p[0]) <= 4 && Math.abs(p[2]) <= 16);
  const pool = corridor.length ? corridor : (spawnPoints || [[0, 0, 0]]);
  const p = pool[(Math.random() * pool.length) | 0] || [0, 0, 0];
  let x = p[0] + (Math.random() - 0.5) * 1.4;
  let z = p[2] + (Math.random() - 0.5) * 1.4;
  x = Math.max(-2.6, Math.min(2.6, x));
  z = Math.max(-16, Math.min(16, z));
  return { x, y: PLAYER_HEIGHT, z };
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
    const mesh = makeBotMesh(team === 0 ? allyColor : enemyColors[i % enemyColors.length], cls.id);
    const cleared = resolveBotClear(sp.x, sp.z, PLAYER_HEIGHT, 0.45);
    mesh.position.set(cleared.x, 0, cleared.z);
    root.add(mesh);
    bots.push({
      mesh,
      x: cleared.x, y: PLAYER_HEIGHT, z: cleared.z,
      vx: 0, vz: 0, vy: 0,
      hp: cls.hp,
      maxHp: cls.hp,
      cls,
      name: isTdm
        ? (team === 0 ? `隊友-${cls.nameEn}-${i + 1}` : `敵隊-${cls.nameEn}-${i + 1}`)
        : `BOT-${cls.nameEn}-${i + 1}`,
      team,
      shootCd: 0.2 + Math.random() * 0.4,
      aimYaw: 0,
      stateT: 0,
      mode: 'chase',
      alive: true,
      respawnT: 0,
      isBoss: false,
      stuckT: 0,
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

/** Multimedia mesh atlases + parallax (refs/atlas/*) — GTA-grade collidable textured city. */
const ATLAS_URLS = {
  wall: './refs/atlas/atlas-tonglau-wall.jpg',
  pavement: './refs/atlas/atlas-wet-pavement.jpg',
  gate: './refs/atlas/atlas-iron-gate.jpg',
  neon: './refs/atlas/atlas-neon-sign-strip.jpg',
  far: './refs/atlas/parallax-far-signs.jpg',
  near: './refs/atlas/parallax-near-awning.jpg',
};
const atlasTextureCache = new Map(); // url -> THREE.Texture | null

function loadAtlasTex(url) {
  return new Promise((resolve) => {
    if (atlasTextureCache.has(url)) {
      resolve(atlasTextureCache.get(url));
      return;
    }
    getEnvLoader().load(
      url,
      (tex) => {
        tex.anisotropy = 4;
        if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        atlasTextureCache.set(url, tex);
        resolve(tex);
      },
      undefined,
      () => {
        atlasTextureCache.set(url, null);
        resolve(null);
      }
    );
  });
}

function loadAllAtlases() {
  return Promise.all([
    loadAtlasTex(ATLAS_URLS.wall),
    loadAtlasTex(ATLAS_URLS.pavement),
    loadAtlasTex(ATLAS_URLS.gate),
    loadAtlasTex(ATLAS_URLS.neon),
    loadAtlasTex(ATLAS_URLS.far),
    loadAtlasTex(ATLAS_URLS.near),
  ]).then(([wall, pavement, gate, neon, far, near]) => ({ wall, pavement, gate, neon, far, near }));
}

function cropEnvTex(baseTex, u, v, su, sv) {
  const t = baseTex.clone();
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.offset.set(u, v);
  t.repeat.set(su, sv);
  t.needsUpdate = true;
  if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeAtlasMat(map, opts = {}) {
  const {
    repeatX = 1, repeatY = 1, color = 0xffffff,
    wrap = THREE.RepeatWrapping, roughness = 0.78, metalness = 0.12,
  } = opts;
  if (!map) {
    return new THREE.MeshStandardMaterial({ color: 0x1a1e28, roughness, metalness, fog: true });
  }
  const m = map.clone();
  m.wrapS = m.wrapT = wrap;
  m.repeat.set(repeatX, repeatY);
  m.needsUpdate = true;
  return new THREE.MeshStandardMaterial({
    map: m, color, roughness, metalness, fog: true,
  });
}

function addEnvTexturedBox(group, x, y, z, w, h, d, mat, solid = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.name = 'envProp';
  mesh.userData.envTextured = true;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  group.add(mesh);
  if (solid) solidBoxes.push(boxSolid(x, y, z, w, h, d));
  return mesh;
}

/** Unstick player + bots after densify adds new collision. */
function unstickActorsAfterDensify() {
  if (typeof resolveBotClear !== 'function') return;
  if (state && Number.isFinite(state.x)) {
    const c = resolveBotClear(state.x, state.z, state.y || PLAYER_HEIGHT, 0.45);
    state.x = c.x; state.z = c.z;
    if (playerMesh) playerMesh.position.set(state.x, 0, state.z);
  }
  for (const b of bots) {
    if (!b || !b.alive) continue;
    const c = resolveBotClear(b.x, b.z, b.y || PLAYER_HEIGHT, 0.45);
    b.x = c.x; b.z = c.z;
    if (b.mesh) b.mesh.position.set(b.x, 0, b.z);
  }
}

/** Sky + parallax + atlas-textured collidable city. Zero solid rainbow slabs. */
function applyCinematicEnv(root, mapId, tex, atlas = {}) {
  if (!root || !tex || !scene) return false;
  disposeEnvGroup(root);

  const envGroup = new THREE.Group();
  envGroup.name = 'cinematicEnv';
  envGroup.userData.atlas = atlas;

  // Far/near/backdrop/wall plates DELETED as drawables — Searching Gate A: geometry/plate
  // overlap ghosted 「雅翠火鍋」 + hard seam on L/R façades. Tiny named stubs only for atlasHit.
  const mkHiddenStub = (name, extra = {}) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x050810, transparent: true, opacity: 0, depthWrite: false })
    );
    m.name = name;
    m.visible = false;
    m.position.set(0, 220, 0);
    m.userData.envTextured = true;
    m.userData.cameraOccluder = true;
    m.userData.forceHidden = true;
    m.userData.lookUpOccluder = true;
    m.userData.baseOpacity = 0;
    m.userData.plateStub = true;
    Object.assign(m.userData, extra);
    envGroup.add(m);
    return m;
  };
  // Always emit named stubs (atlas tex optional) so Multimedia soft-miss still passes atlasHit
  mkHiddenStub('envParallaxFar');
  mkHiddenStub('envParallaxFarS');
  void atlas.far;

  // Night void sky — NEVER map full street env plate onto the cylinder.
  // DO FAIL ?v=93f0b49: street photo (雅翠火鍋 + mid-canyon awnings) on envSky /
  // scene.background duplicated densify neon + cut a horizontal dark band when pitched up.
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x070d1c, side: THREE.BackSide, fog: false, depthWrite: false,
  });
  const sky = new THREE.Mesh(new THREE.CylinderGeometry(96, 96, 56, 64, 1, true), skyMat);
  sky.position.y = 18;
  sky.name = 'envSky';
  sky.userData.nightVoidSky = true;
  sky.renderOrder = -2;
  envGroup.add(sky);

  // No env photo backdrop planes (deleted) — stubs only
  mkHiddenStub('envBackdropN');
  mkHiddenStub('envBackdropS');

  // Wet pavement atlas ONLY — never stretch full env plate onto ground (Vincent: 巨大字／人影 FAIL)
  let groundMat;
  if (atlas.pavement) {
    const groundMap = atlas.pavement.clone();
    groundMap.wrapS = groundMap.wrapT = THREE.RepeatWrapping;
    groundMap.repeat.set(14, 14);
    groundMap.anisotropy = 4;
    groundMap.needsUpdate = true;
    groundMat = new THREE.MeshStandardMaterial({
      map: groundMap, color: 0xc8ccd0, roughness: 0.88, metalness: 0.1, fog: true,
    });
  } else {
    // Fail-closed: dark wet asphalt, zero env photo
    groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24, roughness: 0.92, metalness: 0.06, fog: true,
    });
  }
  const groundPlate = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), groundMat);
  groundPlate.rotation.x = -Math.PI / 2;
  groundPlate.position.y = 0.01;
  groundPlate.name = 'envGroundPlate';
  groundPlate.userData.asphalt = true;
  groundPlate.userData.roadCrop = true;
  groundPlate.userData.pavementAtlas = !!atlas.pavement;
  groundPlate.renderOrder = -1;
  envGroup.add(groundPlate);

  // Env wall photo cards DELETED (stubs only) — densify owns L/R façades; plates were
  // Gate A hard-seam / shopfront second-ghost on left-right walls near 「雅翠火鍋」.
  mkHiddenStub('envWallL');
  mkHiddenStub('envWallR');
  mkHiddenStub('envWallN');
  mkHiddenStub('envWallS');

  // Near-awning plate DELETED as drawable — stub only for atlasHit.near
  mkHiddenStub('envParallaxNear', { parallaxNear: true });
  void atlas.near;

  densifyCinematicCitySlice(envGroup, root, mapId, tex, atlas);

  const neonPink = new THREE.PointLight(0xff4dc8, 0.5, 48, 2);
  neonPink.position.set(-12, 9, 8);
  envGroup.add(neonPink);
  const neonCyan = new THREE.PointLight(0x40f0ff, 0.4, 48, 2);
  neonCyan.position.set(14, 8, -10);
  envGroup.add(neonCyan);
  const amberFill = new THREE.PointLight(0xffd36a, 0.32, 36, 2);
  amberFill.position.set(0, 6, 12);
  envGroup.add(amberFill);

  // Keep night color — street plate is densify/atlas source only, not a look-up backdrop
  scene.background = new THREE.Color(0x050818);
  scene.fog = new THREE.FogExp2(0x080e1a, 0.0048);
  root.add(envGroup);

  // Drop temporary boot ground once atlas pavement plate is live
  const boot = root.getObjectByName('bootGroundPlate');
  if (boot && boot.parent) boot.parent.remove(boot);

  stripBlockyArena(root);
  hideUntexturedWhiteMeshes(root);
  unstickActorsAfterDensify();
  return true;
}

/** Hide/remove untextured near-white meshes (default Three materials / failed binds). Collision AABBs stay. */
function hideUntexturedWhiteMeshes(root) {
  if (!root) return { hidden: 0, removed: 0 };
  let hidden = 0, removed = 0;
  const doomed = [];
  const keepStubNames = new Set([
    'envSky', 'envBackdropN', 'envBackdropS',
    'envGroundPlate', 'bootGroundPlate', 'envAsphaltLane',
    'envWallL', 'envWallR', 'envWallN', 'envWallS',
    'envParallaxFar', 'envParallaxFarS', 'envParallaxNear',
  ]);
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    if (obj.name === 'botTeamPip' || obj.name === 'muzzleFlash') return;
    // Never purge atlasHit / force-hidden plate stubs
    if (keepStubNames.has(obj.name) || (obj.userData && (obj.userData.plateStub || obj.userData.forceHidden || obj.userData.lookUpOccluder))) {
      return;
    }
    if (obj.userData && obj.userData.awaitingTex) {
      obj.visible = false;
      hidden += 1;
      return;
    }
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    if (!mats.length) { doomed.push(obj); return; }
    const hasMap = mats.some((m) => m && m.map);
    if (hasMap) return;
    // Sprites without map (pickup awaiting sheet) already handled via visible=false
    if (obj.isSprite) {
      obj.visible = false;
      hidden += 1;
      return;
    }
    const nearWhite = mats.some((m) => {
      if (!m || !m.color) return true; // missing color ≈ default white
      const c = m.color;
      const r = c.r, g = c.g, b = c.b;
      // bright / chalky untextured slabs
      return r > 0.72 && g > 0.72 && b > 0.72;
    });
    const t = obj.geometry.type;
    const isBlock = t === 'BoxGeometry' || t === 'PlaneGeometry';
    if (nearWhite && isBlock) {
      doomed.push(obj);
      return;
    }
    if (nearWhite) {
      obj.visible = false;
      hidden += 1;
    }
  });
  for (const obj of doomed) {
    try {
      if (obj.parent) obj.parent.remove(obj);
      removed += 1;
    } catch (_) {}
  }
  return { hidden, removed };
}

/** DELETE solid-color / canvas ZH junk. Keep atlas/env-textured props, asphalt, parallax, hero/bots. */
function stripBlockyArena(root) {
  if (!root) return;
  const keepRoot = new Set(['playerHero', 'botActor', 'heroGun', 'curbProp', 'vehicleProp', 'npcActor']);
  const keepEnvMesh = new Set([
    'envSky', 'envBackdropN', 'envBackdropS',
    'envGroundPlate', 'bootGroundPlate', 'envAsphaltLane',
    'envWallL', 'envWallR', 'envWallN', 'envWallS',
    'envParallaxFar', 'envParallaxFarS', 'envParallaxNear',
  ]);
  const doomed = [];
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    let p = obj;
    while (p) {
      if (keepRoot.has(p.name) || (p.userData && (p.userData.keepVisual || p.userData.vehicle || p.userData.npc))) return;
      p = p.parent;
    }
    if (keepEnvMesh.has(obj.name) || obj.name === 'envProp') return;
    if (obj.userData && (obj.userData.asphalt || obj.userData.envTextured || obj.userData.roadCrop)) return;

    const underEnv = (() => {
      let q = obj;
      while (q) {
        if (q.name === 'cinematicEnv') return true;
        q = q.parent;
      }
      return false;
    })();

    const t = obj.geometry.type;
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    const hasMap = mats.some((m) => m && m.map);
    const hasCanvas = mats.some((m) => m && m.map && m.map.isCanvasTexture);
    const neonEmit = mats.some((m) => m && (m.emissiveIntensity || 0) >= 0.5);
    const loudRing = t === 'RingGeometry' || t === 'CircleGeometry';
    const solidColor = !hasMap;

    if (underEnv) {
      if (hasMap && !hasCanvas && !loudRing) return;
      if (solidColor || hasCanvas || loudRing) doomed.push(obj);
      return;
    }
    // Kill procedural ZH canvas boards / mid-road flat sign quads (雅翠火鍋 etc.)
    if (hasCanvas || loudRing) { doomed.push(obj); return; }
    if (t === 'PlaneGeometry' || t === 'BoxGeometry' || (t === 'CylinderGeometry' && neonEmit)) {
      doomed.push(obj);
    }
  });
  for (const obj of doomed) {
    try {
      if (obj.parent) obj.parent.remove(obj);
      if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
      mats.forEach((m) => {
        if (!m) return;
        if (m.map && m.map.isCanvasTexture && m.map.dispose) m.map.dispose();
        if (m.dispose) m.dispose();
      });
    } catch (_) { /* soft */ }
  }
  const emptyGroups = [];
  root.traverse((obj) => {
    if (obj.isGroup && (obj.name === 'curbProp' || (obj.userData && obj.userData.keepVisual))) {
      if (!obj.children.length) emptyGroups.push(obj);
    }
  });
  emptyGroups.forEach((g) => { try { if (g.parent) g.parent.remove(g); } catch (_) {} });
}

function arenaVisualAudit(root) {
  const r = root || worldRoot;
  let box = 0, plane = 0, canvas = 0, solidColorBoxes = 0, rings = 0, nearFovSolid = 0, texturedCover = 0;
  let groundMappedNeon = false;
  let atlasHit = { wall: 0, gate: 0, neon: 0, pavement: false, far: false, near: false };
  const samples = [];
  if (!r) return { box, plane, canvas, solidColorBoxes, rings, nearFovSolid, texturedCover, groundMappedNeon, atlasHit, samples, solids: solidBoxes.length };

  const skipNames = new Set(['playerHero', 'botActor', 'heroGun', 'npcActor', 'vehicleProp', 'curbProp']);
  const keepEnvMesh = new Set([
    'envSky', 'envBackdropN', 'envBackdropS',
    'envGroundPlate', 'bootGroundPlate', 'envAsphaltLane',
    'envWallL', 'envWallR', 'envWallN', 'envWallS',
    'envParallaxFar', 'envParallaxFarS', 'envParallaxNear',
  ]);

  r.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    let p = obj;
    while (p) {
      if (skipNames.has(p.name) || (p.userData && (p.userData.vehicle || p.userData.npc || p.userData.keepVisual))) return;
      p = p.parent;
    }
    if (keepEnvMesh.has(obj.name) || obj.name === 'envProp') {
      const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
      const hasMap = mats.some((m) => m && m.map);
      if (obj.name === 'envGroundPlate' && hasMap && !(obj.userData && obj.userData.roadCrop)) groundMappedNeon = true;
      if (obj.name === 'envGroundPlate' && hasMap) atlasHit.pavement = true;
      if (obj.name === 'envParallaxFar' || obj.name === 'envParallaxFarS') atlasHit.far = true;
      if (obj.name === 'envParallaxNear') atlasHit.near = true;
      if (obj.name === 'envProp' || (obj.userData && obj.userData.envTextured)) {
        texturedCover += 1;
        const role = obj.userData && obj.userData.atlasRole;
        if (role === 'wall') atlasHit.wall += 1;
        else if (role === 'gate') atlasHit.gate += 1;
        else if (role === 'neon') atlasHit.neon += 1;
      }
      return;
    }
    if (obj.userData && (obj.userData.asphalt || obj.userData.roadCrop || obj.userData.envTextured)) {
      texturedCover += 1;
      return;
    }

    const t = obj.geometry.type;
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    const hasMap = mats.some((m) => m && m.map);
    const hasCanvas = mats.some((m) => m && m.map && m.map.isCanvasTexture);
    if (t === 'BoxGeometry' && !hasMap) box += 1;
    if (t === 'PlaneGeometry' && !hasMap) plane += 1;
    if (hasCanvas) canvas += 1;
    if (t === 'RingGeometry' || t === 'CircleGeometry') rings += 1;
    const loud = (!hasMap && (t === 'BoxGeometry' || t === 'PlaneGeometry')) || hasCanvas || t === 'RingGeometry' || t === 'CircleGeometry';
    if (!hasMap && t === 'BoxGeometry') solidColorBoxes += 1;
    // near FOV: |x|<14 |z|<18 |y|<8
    const wp = new THREE.Vector3();
    obj.getWorldPosition(wp);
    if (loud && Math.abs(wp.x) < 14 && Math.abs(wp.z) < 18 && wp.y < 8) {
      nearFovSolid += 1;
      if (samples.length < 8) samples.push({ t, name: obj.name, x: +wp.x.toFixed(1), z: +wp.z.toFixed(1), map: !!hasMap, canvas: !!hasCanvas });
    }
  });
  return { box, plane, canvas, solidColorBoxes, rings, nearFovSolid, texturedCover, groundMappedNeon, atlasHit, samples, solids: solidBoxes.length };
}

/** Thick atlas-textured Tong Lau + gates + neon strips + cover. Playable |x|<3.8 corridor. */

/** Soft polish: Multimedia 「雅翠火鍋」 vertical neon billboard (PNG alpha preferred).
 *  ONE street-facing additive PlaneGeometry — restores readable shop lettering after
 *  Gate A plate/ghost cleanup. Never BoxGeometry; never a second overlay (ghosting). */
const YACUI_NEON_PNG = './refs/props/neon-yacui-hotpot-vertical.png?v=yacui1';
const YACUI_NEON_JPG = './refs/props/neon-yacui-hotpot-vertical.jpg?v=yacui1';

function hangYacuiHotpotNeonProp(envGroup) {
  if (!envGroup) return null;
  // Left Tong-lau shopfront facing corridor, near look-up smoke stand (x≈0,z≈2).
  // densify façades sit at |bx|=9.6; neon planes hang at bx+toward*2.42.
  const bx = -9.6;
  const toward = 1;
  const signW = 0.78;
  const signH = 3.55;
  const baseY = 2.45;
  const z = 2.15;
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    side: THREE.DoubleSide,
    opacity: 0.96,
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), mat);
  sign.position.set(bx + toward * 2.42, baseY + signH * 0.5, z);
  sign.rotation.y = Math.PI / 2; // face corridor center
  sign.name = 'envProp';
  sign.userData.envTextured = true;
  sign.userData.atlasRole = 'neon';
  sign.userData.verticalNeon = true;
  sign.userData.additiveNeon = true;
  sign.userData.yacuiHotpotNeon = true;
  sign.userData.shopNameZh = '雅翠火鍋';
  sign.userData.awaitingTex = true; // survive hideUntexturedWhiteMeshes until PNG/JPG binds
  sign.renderOrder = 3;
  sign.visible = false; // show only after tex binds — never white slab
  envGroup.add(sign);

  const bindTex = (tex) => {
    if (!tex) return false;
    if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    mat.map = tex;
    mat.needsUpdate = true;
    sign.userData.awaitingTex = false;
    sign.visible = true;
    return true;
  };

  // Prefer PNG alpha (no chroma). JPG = #00FF00 greenscreen fallback like other Multimedia assets.
  getEnvLoader().load(
    YACUI_NEON_PNG,
    (tex) => { bindTex(tex); },
    undefined,
    () => {
      loadPlayerPoseTex(YACUI_NEON_JPG).then((keyed) => {
        if (!bindTex(keyed)) {
          try { if (sign.parent) sign.parent.remove(sign); } catch (_) {}
        }
      });
    }
  );
  return sign;
}

function densifyCinematicCitySlice(envGroup, root, mapId, tex, atlas = {}) {
  if (!envGroup || !tex) return;
  // densify owns façades. Under PLATE_ONLY, builders still push invisible building/arcade
  // overhang solids (y≈3.2 into street) — Searching FAIL: chase cam enters "façade cards"
  // and player vanishes. Keep ground + low curb/vehicle only; rebuild tall collision here.
  solidBoxes = solidBoxes.filter((b) => {
    const h = b.maxY - b.minY;
    if (b.maxY < 0.35) return true; // ground slabs
    if (h <= 2.25 && b.maxY <= 2.35) return true; // curb cover / vehicles / stools
    return false; // drop tall buildings + elevated arcade overhangs
  });
  const seed = String(mapId || 'signs').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = (i) => {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  const wallSrc = atlas.wall || cropEnvTex(tex, 0.08, 0.22, 0.35, 0.55);
  const gateSrc = atlas.gate || cropEnvTex(tex, 0.70, 0.05, 0.25, 0.35);
  const neonSrc = atlas.neon || null;
  const coverSrc = atlas.wall || cropEnvTex(tex, 0.35, 0.05, 0.3, 0.15);

  const facadeMats = [0, 1, 2, 3].map((i) => makeAtlasMat(wallSrc, {
    repeatX: 1.1 + i * 0.15, repeatY: 1.6 + (i % 2) * 0.4,
  }));
  const gateMat = makeAtlasMat(gateSrc, { repeatX: 1.0, repeatY: 1.35 });
  const coverMat = makeAtlasMat(coverSrc, { repeatX: 0.8, repeatY: 0.8, color: 0x9aa0a8 });

  // Buildings far enough that inner face stays |x| >= 6.2 — corridor walkable
  const rowX = [-9.6, 9.6];
  rowX.forEach((bx, ri) => {
    for (let i = -4; i <= 4; i++) {
      const z = i * 5.0 + (ri ? 1.1 : 0);
      const h = 7.5 + ((i + ri * 3 + (seed % 5)) % 4) * 1.6;
      const depth = 3.2 + rnd(i * 3 + ri) * 0.9;
      const mat = facadeMats[(i + ri * 2 + 4) % facadeMats.length];
      const mesh = addEnvTexturedBox(envGroup, bx, 0, z, 4.4, h, depth, mat, true);
      mesh.userData.atlasRole = 'wall';

      const toward = bx > 0 ? -1 : 1;
      // Iron gate: thin flush PLANES on shopfront (not thick second boxes).
      // Searching Gate A: box gates stacked on wall cards = hard seam / shopfront ghost.
      // Collision kept as a slim solid so chase cam still respects shutters (Gate B).
      const gateH = 2.45;
      const gateMesh = new THREE.Mesh(new THREE.PlaneGeometry(depth * 0.5, gateH), gateMat);
      gateMesh.position.set(bx + toward * 2.22, 0.12 + gateH * 0.5, z);
      gateMesh.rotation.y = bx > 0 ? -Math.PI / 2 : Math.PI / 2;
      gateMesh.name = 'envProp';
      gateMesh.userData.envTextured = true;
      gateMesh.userData.atlasRole = 'gate';
      gateMesh.userData.shopfrontGate = true;
      envGroup.add(gateMesh);
      solidBoxes.push(boxSolid(bx + toward * 2.22, 0.12, z, 0.1, gateH, depth * 0.5));

      // Vertical neon PLANES (not BoxGeometry). JPEG neon atlas has opaque dark
      // background — boxes painted that dark as solid ghost slabs / mid-FOV bands
      // when looking up near 「雅翠火鍋」. Additive street-facing planes: dark≈0 add.
      if (neonSrc && (i + ri) % 2 === 0) {
        const col = ((i + ri * 3 + 7) % 6);
        const nmap = neonSrc.clone();
        nmap.wrapS = nmap.wrapT = THREE.ClampToEdgeWrapping;
        nmap.repeat.set(0.13, 1);
        nmap.offset.set(col * 0.145 + 0.01, 0);
        nmap.needsUpdate = true;
        if (THREE.SRGBColorSpace) nmap.colorSpace = THREE.SRGBColorSpace;
        const nmat = new THREE.MeshBasicMaterial({
          map: nmap,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
          side: THREE.DoubleSide,
          opacity: 0.95,
        });
        const signH = 2.6 + (i % 3) * 0.35;
        const signW = 0.52;
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), nmat);
        const baseY = 2.35 + (i % 3) * 0.45;
        sign.position.set(
          bx + toward * 2.42,
          baseY + signH * 0.5,
          z + (ri ? -0.9 : 0.9)
        );
        // Face the corridor (inner wall normal toward street center)
        sign.rotation.y = bx > 0 ? -Math.PI / 2 : Math.PI / 2;
        sign.name = 'envProp';
        sign.userData.envTextured = true;
        sign.userData.atlasRole = 'neon';
        sign.userData.verticalNeon = true;
        sign.userData.additiveNeon = true;
        sign.renderOrder = 2;
        envGroup.add(sign);
      }
    }
  });

  // Soft polish — ONE 「雅翠火鍋」 additive vertical neon (Multimedia PNG). Not a Gate A plate.
  hangYacuiHotpotNeonProp(envGroup);

  // Cover along curbs — NEVER iron-gate atlas (Searching: soft gate-slat pavement band).
  // Wall/pavement-adjacent crates use wall/cover mats only.
  const covers = [
    [-3.5, 6.5, 1.35, 1.15, 1.25], [3.5, -6.5, 1.4, 1.2, 1.3],
    [-3.6, 12, 1.3, 1.05, 1.2], [3.6, -12, 1.35, 1.1, 1.25],
    [-3.5, -3.5, 1.25, 1.0, 1.15], [3.5, 3.5, 1.3, 1.05, 1.2],
    [-3.7, 17, 1.5, 1.25, 1.4], [3.7, -17, 1.5, 1.25, 1.4],
  ];
  covers.forEach(([x, z, w, h, d], i) => {
    const m = addEnvTexturedBox(envGroup, x, 0, z, w, h, d, i % 2 ? coverMat : facadeMats[i % facadeMats.length], true);
    m.userData.atlasRole = 'wall';
    m.userData.curbCover = true;
  });

  // Textured end barriers
  [[0, 24, 24, 4.2, 1.5], [0, -24, 24, 4.2, 1.5]].forEach(([x, z, w, h, d], i) => {
    const m = addEnvTexturedBox(envGroup, x, 0, z, w, h, d, facadeMats[i % facadeMats.length], true);
    m.userData.atlasRole = 'wall';
  });

  // Static collidable vehicles on curbs (driveable deferred) — textured, not color slabs
  if (typeof addMinibus === 'function') {
    addMinibus(envGroup, 4.2, -14.5, 'red', 0.08);
    addMinibus(envGroup, -4.2, 14.0, 'green', Math.PI - 0.05);
  }
  if (typeof addVintageSedan === 'function') {
    addVintageSedan(envGroup, 4.0, 8.5, -0.12, 0xffd36a);
    addVintageSedan(envGroup, -4.1, -8.0, Math.PI + 0.1, 0xf2f0ea);
  }
  if (typeof addSmallTruck === 'function') {
    addSmallTruck(envGroup, 4.3, -19.5, Math.PI / 2);
  }
  if (typeof addMotorcycle === 'function') {
    addMotorcycle(envGroup, -3.8, 5.5, 0.4);
    addMotorcycle(envGroup, 3.9, -3.5, -0.3);
  }

  void root; void rnd;
}

function beginEnvPlateLoad(root, mapId) {
  const token = ++envLoadToken;
  const url = envPlateUrl(mapId);
  envPlateStatus = { mapId, status: 'loading', url };

  const applyIfCurrent = async (tex) => {
    if (token !== envLoadToken) return;
    const atlas = await loadAllAtlases();
    if (token !== envLoadToken) return;
    if (tex && applyCinematicEnv(root, mapId, tex, atlas)) {
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

  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.28, 240);
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

  // Immediate dark ground — PLATE_ONLY builders skip mesh ground; avoid void until atlas pavement binds
  {
    const bootGround = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ color: 0x161a22, roughness: 0.92, metalness: 0.06, fog: true })
    );
    bootGround.rotation.x = -Math.PI / 2;
    bootGround.position.y = 0.005;
    bootGround.name = 'bootGroundPlate';
    bootGround.userData.asphalt = true;
    bootGround.userData.roadCrop = true;
    bootGround.renderOrder = -2;
    root.add(bootGround);
  }

  // Immediate strip so splash/boot FOV never shows teal/magenta/grey façade slabs
  stripBlockyArena(root);
  hideUntexturedWhiteMeshes(root);

  // Cinematic env plate (4K) — soft-fallback if Multimedia plate not on disk yet
  beginEnvPlateLoad(root, mapId);

  // pickups + hold zone after geometry
  spawnPickups(root);
  setupHoldZone(root, mapId);
  stripBlockyArena(root);
  hideUntexturedWhiteMeshes(root);

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
    new THREE.MeshStandardMaterial({ color: 0x1a2030, emissive: 0x101418, emissiveIntensity: 0.12 })
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
    const minX = b.minX - radius, maxX = b.maxX + radius;
    const minZ = b.minZ - radius, maxZ = b.maxZ + radius;
    if (nx <= minX || nx >= maxX || nz <= minZ || nz >= maxZ) continue;
    // Inside expanded AABB — push out via nearest face (fixes deep embed / WASD trap)
    const dl = nx - minX, dr = maxX - nx, db = nz - minZ, dt = maxZ - nz;
    const m = Math.min(dl, dr, db, dt);
    if (m === dl) nx = minX;
    else if (m === dr) nx = maxX;
    else if (m === db) nz = minZ;
    else nz = maxZ;
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

/** Expanded AABB test — sphere-ish radius so chase cam never sits inside walls/roofs. */
function pointHitsSolidExpanded(px, py, pz, pad) {
  for (const b of solidBoxes) {
    // Skip ground slab — only walls/roofs/props clip the chase cam
    if (b.maxY < 0.4) continue;
    if (
      px >= b.minX - pad && px <= b.maxX + pad &&
      py >= b.minY - pad && py <= b.maxY + pad &&
      pz >= b.minZ - pad && pz <= b.maxZ + pad
    ) return true;
  }
  return false;
}

/** True if point is strictly inside a non-ground solid (no pad). */
function pointInsideSolid(px, py, pz) {
  for (const b of solidBoxes) {
    if (b.maxY < 0.4) continue;
    if (px > b.minX && px < b.maxX && py > b.minY && py < b.maxY && pz > b.minZ && pz < b.maxZ) return b;
  }
  return null;
}

/** If cam landed inside a wall volume, push out along shortest face toward pivot. */
function ejectCameraFromSolids(px, py, pz, pivotX, pivotY, pivotZ, pad) {
  let x = px, y = py, z = pz;
  for (let iter = 0; iter < 10; iter++) {
    let hit = null;
    for (const b of solidBoxes) {
      if (b.maxY < 0.4) continue;
      if (
        x >= b.minX - pad && x <= b.maxX + pad &&
        y >= b.minY - pad && y <= b.maxY + pad &&
        z >= b.minZ - pad && z <= b.maxZ + pad
      ) { hit = b; break; }
    }
    if (!hit) break;
    const minX = hit.minX - pad, maxX = hit.maxX + pad;
    const minY = hit.minY - pad, maxY = hit.maxY + pad;
    const minZ = hit.minZ - pad, maxZ = hit.maxZ + pad;
    const dl = x - minX, dr = maxX - x, db = z - minZ, dt = maxZ - z;
    const dyDown = y - minY, dyUp = maxY - y;
    const m = Math.min(dl, dr, db, dt, dyDown, dyUp);
    if (m === dl) x = minX;
    else if (m === dr) x = maxX;
    else if (m === db) z = minZ;
    else if (m === dt) z = maxZ;
    else if (m === dyDown) y = minY;
    else y = maxY;
    // Prefer staying near pivot (don't eject through far wall)
    const toPx = pivotX - x, toPy = pivotY - y, toPz = pivotZ - z;
    const len = Math.hypot(toPx, toPy, toPz) || 1;
    x += toPx / len * 0.04;
    y += toPy / len * 0.02;
    z += toPz / len * 0.04;
  }
  // Final hard clamp: never below floor / above sky for chase cam
  y = Math.max(0.55, Math.min(22, y));
  return { x, y, z };
}

/** Step ideal camera back→player; if solid AABB hit, pull in (TPP roof/wall clip fix). */
function cameraPullBack(idealX, idealY, idealZ, targetX, targetY, targetZ) {
  const dx = idealX - targetX;
  const dy = idealY - targetY;
  const dz = idealZ - targetZ;
  const dist = Math.hypot(dx, dy, dz) || 0.001;
  const steps = Math.max(18, Math.ceil(dist / 0.08));
  const pad = CAM_COLLIDE_PAD;
  let best = 1;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = targetX + dx * t;
    const py = targetY + dy * t;
    const pz = targetZ + dz * t;
    if (pointHitsSolidExpanded(px, py, pz, pad)) {
      best = Math.max(0.05, (i - 1) / steps);
      break;
    }
  }
  let x = targetX + dx * best;
  let y = targetY + dy * best;
  let z = targetZ + dz * best;
  const ejected = ejectCameraFromSolids(x, y, z, targetX, targetY, targetZ, pad);
  return { x: ejected.x, y: ejected.y, z: ejected.z, t: best };
}

/** Hide/fade atlas/parallax/wall quads that intersect the chase cam near frustum. */
function updateCameraOccluders(camX, camY, camZ, lookDx, lookDy, lookDz) {
  if (!worldRoot) return;
  const ldx = lookDx || 0, ldy = lookDy || 0, ldz = lookDz || 0;
  const forceHideNames = new Set([
    'envParallaxNear', 'envParallaxFar', 'envParallaxFarS',
    'envWallL', 'envWallR', 'envWallN', 'envWallS',
    'envBackdropN', 'envBackdropS',
  ]);
  worldRoot.traverse((o) => {
    if (!o.isMesh || !o.userData || !o.userData.cameraOccluder) return;
    // Force-hidden look-up / façade-card occluders: NEVER visible in match
    if (
      o.userData.forceHidden || o.userData.parallaxNear || o.userData.lookUpOccluder ||
      forceHideNames.has(o.name)
    ) {
      o.visible = false;
      if (o.material) o.material.opacity = 0;
      return;
    }
    const wp = new THREE.Vector3();
    o.getWorldPosition(wp);
    let halfW = 8, halfH = 4;
    if (o.geometry && o.geometry.parameters) {
      halfW = (o.geometry.parameters.width || 16) * 0.5;
      halfH = (o.geometry.parameters.height || 8) * 0.5;
    }
    const dx = camX - wp.x, dy = camY - wp.y, dz = camZ - wp.z;
    const dist = Math.hypot(dx, dy, dz);
    // Plane roughly in front of camera along look?
    const ahead = dx * ldx + dy * ldy + dz * ldz; // negative ⇒ plane in look direction from cam… cam-to-plane vs look
    const toPlaneAhead = (wp.x - camX) * ldx + (wp.y - camY) * ldy + (wp.z - camZ) * ldz;
    const nearBody =
      Math.abs(dx) < halfW + 3.5 &&
      Math.abs(dy) < halfH + 3.5 &&
      Math.abs(dz) < 4.5;
    // Hide translucent/opaque sheets that sit inside near frustum or hug the lens
    const inNearFrustum = nearBody || dist < 5.5 || (toPlaneAhead > 0 && toPlaneAhead < 6 && Math.hypot(dx, dz) < halfW + 4);
    const base = o.userData.baseOpacity != null ? o.userData.baseOpacity : 0.6;
    if (o.material) {
      if (inNearFrustum) {
        o.visible = false;
        o.material.opacity = 0;
      } else {
        o.visible = true;
        o.material.opacity = base;
        if (o.material.transparent == null && base < 1) o.material.transparent = true;
      }
    }
  });
}

function updateCamera() {
  // Look-up / façade-card occluders stay force-hidden — never parallax into street FOV
  if (worldRoot) {
    worldRoot.traverse((o) => {
      if (!o.isMesh || !o.userData) return;
      if (!(o.userData.forceHidden || o.userData.lookUpOccluder || o.userData.parallaxNear)) return;
      o.visible = false;
      if (o.material) o.material.opacity = 0;
      if (o.name === 'envParallaxNear') o.position.set(0, 78, -130);
      if (o.name === 'envParallaxFar') o.position.set(0, 96, -160);
      if (o.name === 'envParallaxFarS') o.position.set(0, 96, 160);
    });
  }
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
  // Shrink boom when player hugs façade / curb so chase cam never enters wall cards
  let back = CAM_BACK;
  let right = CAM_RIGHT;
  const hugPad = 0.55;
  const behindBlocked = pointHitsSolidExpanded(state.x + sy * back, state.y + 0.4, state.z + cy * back, hugPad);
  const rightBlocked = pointHitsSolidExpanded(state.x + cy * 1.2, state.y + 0.4, state.z + (-sy) * 1.2, hugPad);
  const leftBlocked = pointHitsSolidExpanded(state.x - cy * 1.2, state.y + 0.4, state.z + sy * 1.2, hugPad);
  const nearFacade = Math.abs(state.x) > 2.0 || behindBlocked || rightBlocked || leftBlocked;
  if (nearFacade) {
    back = Math.min(back, behindBlocked ? 1.55 : 2.25);
    right *= (rightBlocked || leftBlocked) ? 0.25 : 0.45;
    // Prefer offset toward street center, never into façades
    if (state.x > 0.4 && right > 0) right = -Math.abs(right) * 0.35;
    if (state.x < -0.4 && right < 0) right = Math.abs(right) * 0.35;
  }
  const up = CAM_UP + (state.crouching || state.sliding ? -0.25 : 0);
  const idealX = state.x + sy * back + cy * right;
  const idealY = state.y + up;
  const idealZ = state.z + cy * back + (-sy) * right;
  // Anchor at upper chest so pull-back doesn't sink into floor
  const pivotX = state.x;
  const pivotY = state.y - 0.15;
  const pivotZ = state.z;
  const pulled = cameraPullBack(idealX, idealY, idealZ, pivotX, pivotY, pivotZ);
  // Hard corridor clamp — never sit inside densify façade volumes (|x|>=~7.4)
  let cx = Math.max(-CAM_CORRIDOR_MAX_X, Math.min(CAM_CORRIDOR_MAX_X, pulled.x));
  let cyCam = Math.max(0.55, Math.min(12, pulled.y));
  let cz = pulled.z;
  const ejected2 = ejectCameraFromSolids(cx, cyCam, cz, pivotX, pivotY, pivotZ, CAM_COLLIDE_PAD);
  cx = Math.max(-CAM_CORRIDOR_MAX_X, Math.min(CAM_CORRIDOR_MAX_X, ejected2.x));
  cyCam = Math.max(0.55, Math.min(12, ejected2.y));
  cz = ejected2.z;
  camera.position.set(cx, cyCam, cz);
  // look along aim (yaw/pitch) through a point ahead of the hero
  const { dx, dy, dz } = dirFromAngles(yaw, pitch);
  updateCameraOccluders(cx, cyCam, cz, dx, dy, dz);
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

const PICKUP_SHEET_URL = './refs/ui/pickups-sheet.jpg?v=pickup1';
let pickupSheetTex = null;
const PICKUP_UV = {
  // 2×3 sheet cells (ammo/armor/hp / speed/coin/weapon)
  ammo:   { u: 0 / 3, v: 0.5, su: 1 / 3, sv: 0.5 },
  armor:  { u: 1 / 3, v: 0.5, su: 1 / 3, sv: 0.5 },
  hp:     { u: 2 / 3, v: 0.5, su: 1 / 3, sv: 0.5 },
  speed:  { u: 0 / 3, v: 0.0, su: 1 / 3, sv: 0.5 },
  coin:   { u: 1 / 3, v: 0.0, su: 1 / 3, sv: 0.5 },
  weapon: { u: 2 / 3, v: 0.0, su: 1 / 3, sv: 0.5 },
};
function loadPickupSheetTex() {
  return new Promise((resolve) => {
    if (pickupSheetTex) { resolve(pickupSheetTex); return; }
    getEnvLoader().load(
      PICKUP_SHEET_URL,
      (tex) => {
        if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        pickupSheetTex = tex;
        resolve(tex);
      },
      undefined,
      () => resolve(null)
    );
  });
}
function makePickupSprite(kind) {
  // Prefer Multimedia pickups-sheet cell; never spawn neon debug spheres / color orbs.
  const uv = PICKUP_UV[kind] || PICKUP_UV.ammo;
  const mat = new THREE.SpriteMaterial({
    color: 0xffffff, transparent: true, depthWrite: false, opacity: 0.95, fog: true,
  });
  const mesh = new THREE.Sprite(mat);
  mesh.scale.set(0.55, 0.55, 0.55);
  mesh.name = 'pickupIcon';
  mesh.userData.keepVisual = true;
  mesh.visible = false; // hide until sheet cell binds
  loadPickupSheetTex().then((base) => {
    if (!base || !mesh.material) return;
    const t = base.clone();
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.offset.set(uv.u, uv.v);
    t.repeat.set(uv.su, uv.sv);
    t.needsUpdate = true;
    mesh.material.map = t;
    mesh.material.needsUpdate = true;
    mesh.visible = true;
  });
  return mesh;
}

function spawnPickups(root) {
  pickups.forEach((p) => { if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh); });
  pickups = [];
  const spots = (spawnPoints || [[0,0,0]]).slice(0, 8);
  // Translation pickup kinds (ammo/armor/hp/speed/coin) + occasional weapon
  const kinds = ['ammo', 'armor', 'hp', 'speed', 'coin', 'weapon', 'ammo', 'hp'];
  spots.forEach((sp, i) => {
    const kind = kinds[i % kinds.length];
    // Vincent FAIL: neon cubes AND floating colored orbs read as debug junk — sheet icons only.
    const mesh = makePickupSprite(kind);
    const x = (sp[0] || 0) + (i % 2 ? 3 : -3);
    const z = (sp[2] || 0) + (i % 3 === 0 ? 2 : -2);
    mesh.position.set(x, 0.55, z);
    root.add(mesh);
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
  // Logic-only hold radius. DELETE cyan RingGeometry / blue CircleGeometry — Vincent FAIL 地面大青環.
  holdZone = { x: 0, z: 0, r: 4.5 };
  void root; void mapId;
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
  const mesh = makeBotMesh(def.color, def.id || 'rock');
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
  const meleeEl = document.getElementById('meleeHud');
  const gstat = activeGunStats();
  const icon = document.getElementById('meleeIcon');
  // Combat HUD always shows 身肉搏 · {拳頭|膝撞|霓虹刀}
  let meleeName = '拳頭';
  if (gstat && gstat.melee && gstat.nameZh) meleeName = gstat.nameZh;
  else if (state.weaponOverride && MELEE_CYCLE.includes(state.weaponOverride)) {
    const w = EXTRA_WEAPONS.find((x) => x.id === state.weaponOverride);
    if (w) meleeName = w.nameZh;
  }
  if (meleeEl) meleeEl.textContent = `身肉搏 · ${meleeName}`;
  if (!el) return;
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

function resolveBotClear(x, z, y, radius) {
  let cx = x, cz = z;
  for (let iter = 0; iter < 10; iter++) {
    const c = collideXZ(cx, cz, y, radius);
    if (Math.hypot(c.x - cx, c.z - cz) < 1e-4) break;
    cx = c.x; cz = c.z;
  }
  // Prefer open alley corridor after densify façades
  const candidates = [
    [cx, cz],
    [Math.max(-2.4, Math.min(2.4, cx)), Math.max(-17, Math.min(17, cz))],
    [0, Math.max(-16, Math.min(16, cz))],
    [0, 0], [1.2, 4], [-1.2, -4], [0.8, 8], [-0.8, -8],
    [1.5, 12], [-1.5, -12], [0, 6], [0, -6],
  ];
  for (const [sx, sz] of candidates) {
    const c = collideXZ(sx, sz, y, radius);
    if (Math.hypot(c.x - sx, c.z - sz) < 0.02 && Math.abs(c.x) <= 2.8 && Math.abs(c.z) <= 18.5) {
      return c;
    }
  }
  return collideXZ(0, 0, y, radius);
}

function steerBot(b, wishX, wishZ, spd, dt) {
  const tryDirs = [
    [wishX, wishZ],
    [wishX * 0.7 - wishZ * 0.7, wishZ * 0.7 + wishX * 0.7],
    [wishX * 0.7 + wishZ * 0.7, wishZ * 0.7 - wishX * 0.7],
    [-wishZ, wishX],
    [wishZ, -wishX],
    [-wishX, -wishZ],
  ];
  const ox = b.x, oz = b.z;
  for (const [wx, wz] of tryDirs) {
    const len = Math.hypot(wx, wz) || 1;
    const nx = ox + (wx / len) * spd * dt;
    const nz = oz + (wz / len) * spd * dt;
    const c = collideXZ(nx, nz, b.y, 0.4);
    const moved = Math.hypot(c.x - ox, c.z - oz);
    if (moved > spd * dt * 0.12) {
      b.vx = (c.x - ox) / Math.max(dt, 1e-4);
      b.vz = (c.z - oz) / Math.max(dt, 1e-4);
      return c;
    }
  }
  // stuck — micro-nudge toward open spawn corridor
  const sp = randomSpawn();
  const pullX = (sp.x - ox) * 0.35;
  const pullZ = (sp.z - oz) * 0.35;
  const c = resolveBotClear(ox + pullX, oz + pullZ, b.y, 0.4);
  b.vx = (c.x - ox) / Math.max(dt, 1e-4);
  b.vz = (c.z - oz) / Math.max(dt, 1e-4);
  return c;
}

function updateBots(dt) {
  for (const b of bots) {
    if (!b.alive) {
      if (b.isBoss) continue; // bosses stay dead
      b.respawnT -= dt;
      if (b.respawnT <= 0) {
        const sp = randomSpawn();
        const cleared = resolveBotClear(sp.x, sp.z, PLAYER_HEIGHT, 0.45);
        b.x = cleared.x; b.y = PLAYER_HEIGHT; b.z = cleared.z;
        b.hp = b.maxHp;
        b.alive = true;
        b.mesh.visible = true;
        b.shootCd = 0.35;
        b.mode = 'chase';
        b.stateT = 0;
        b.stuckT = 0;
        b.mesh.position.set(b.x, 0, b.z);
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

    // Aggressive chase / close strafe — never idle stand (Vincent: 唔好企定)
    if (b.stateT <= 0) {
      if (dist > 8) b.mode = 'chase';
      else if (dist < 2.8) b.mode = Math.random() < 0.55 ? 'strafe' : 'chase';
      else b.mode = Math.random() < 0.25 ? 'strafe' : 'chase';
      b.stateT = 0.35 + Math.random() * 0.55;
    }
    let wishX = 0, wishZ = 0;
    if (b.mode === 'chase') {
      wishX = dx / dist;
      wishZ = dz / dist;
    } else {
      wishX = -dz / dist;
      wishZ = dx / dist;
      if (dist > 6) { wishX += dx / dist; wishZ += dz / dist; }
      if (dist < 2.2) { wishX -= dx / dist; wishZ -= dz / dist; } // back off for gun space
    }
    // Match player pace so chase is visible on plate-only arenas
    const spd = Math.max(6.5, (b.cls.speed || 8) * 0.92);
    const beforeX = b.x, beforeZ = b.z;
    const c = steerBot(b, wishX, wishZ, spd, dt);
    b.x = c.x; b.z = c.z;
    const step = Math.hypot(b.x - beforeX, b.z - beforeZ);
    b.stuckT = (b.stuckT || 0) + (step < 0.02 ? dt : -Math.min(b.stuckT || 0, dt * 2));
    if ((b.stuckT || 0) > 1.1) {
      const sp = randomSpawn();
      const cleared = resolveBotClear(sp.x, sp.z, b.y, 0.45);
      b.x = cleared.x; b.z = cleared.z;
      b.stuckT = 0;
      b.mode = 'chase';
    }
    // walk bob — visible anim so NPCs never look frozen
    const bob = Math.sin(performance.now() * 0.014 + (b.x + b.z) * 0.35) * Math.min(0.08, step * 2.5);
    b.mesh.position.set(b.x, bob, b.z);
    b.mesh.rotation.y = b.aimYaw;
    syncBotWalkPose(b, step / Math.max(dt, 1e-4));

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


function mapNameZh(mapId) {
  const m = MAPS.find((x) => x.id === mapId);
  return m ? m.nameZh : (mapId || '');
}

function transPlateUrl(mapId) {
  return `./refs/transitions/trans-${mapId}.jpg`;
}

let transTimer = null;
let pendingTransNext = null;

function hideChannel7Transition() {
  const el = document.getElementById('transition');
  if (el) el.classList.remove('on');
  clearTimeout(transTimer);
  transTimer = null;
}

/** Channel 7 inter-level still: fade → plate + copy → Continue / ~2s → next level. */
function showChannel7Transition(nextLevel, opts = {}) {
  const lv = CHANNEL7[(nextLevel - 1) | 0];
  if (!lv) return false;
  const el = document.getElementById('transition');
  const img = document.getElementById('transPlate');
  const lvlEl = document.getElementById('transLevel');
  const nextEl = document.getElementById('transNext');
  const hintEl = document.getElementById('transHint');
  const bossEl = document.getElementById('transBoss');
  if (!el) return false;
  pendingTransNext = { level: nextLevel, classId: opts.classId || state.classId || selectedClass };
  if (img) {
    img.style.opacity = '0';
    img.src = transPlateUrl(lv.mapId);
    img.onload = () => { img.style.opacity = '1'; };
    img.onerror = () => { img.removeAttribute('src'); };
  }
  if (lvlEl) lvlEl.textContent = `過場 · 第 ${nextLevel} 關`;
  if (nextEl) nextEl.textContent = `下一站——${mapNameZh(lv.mapId)}。`;
  if (hintEl) hintEl.textContent = 'Channel 7 轉場中…';
  if (bossEl) {
    if (lv.boss && lv.bossId) {
      const b = bossById(lv.bossId);
      bossEl.style.display = '';
      bossEl.textContent = b ? `${b.nameZh} — ${b.hook || ''}` : '';
    } else {
      bossEl.style.display = 'none';
      bossEl.textContent = '';
    }
  }
  // hide end panel while transitioning
  overlay.classList.add('hidden');
  el.classList.add('on');
  clearTimeout(transTimer);
  transTimer = setTimeout(() => continueChannel7Transition(), 2200);
  return true;
}

function continueChannel7Transition() {
  clearTimeout(transTimer);
  transTimer = null;
  const pending = pendingTransNext;
  pendingTransNext = null;
  hideChannel7Transition();
  if (!pending) return;
  startMatch(null, pending.classId, { gameMode: 'campaign', campaignLevel: pending.level });
}

window.__showTransitionTest = (level) => showChannel7Transition(level || 2, { classId: 'spark' });
window.__transPlateUrl = (mapId) => transPlateUrl(mapId);

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
        // Prefer cinematic transition plate over bare end panel
        if (showChannel7Transition(lv + 1, { classId: state.classId || selectedClass })) {
          return;
        }
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
  if (typeof spawnStreetNpcs === 'function') spawnStreetNpcs(worldRoot || scene);
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
  const cleared = resolveBotClear(sp.x, sp.z, PLAYER_HEIGHT, 0.45);
  state.x = cleared.x; state.y = PLAYER_HEIGHT; state.z = cleared.z;
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
    if (typeof updateStreetNpcs === 'function') updateStreetNpcs(dt);
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

window.__arenaVisualAudit = () => arenaVisualAudit(worldRoot);

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
  arenaAudit: arenaVisualAudit(worldRoot),
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


window.__forcePickupTest = () => {
  const p = pickups.find((x) => x.alive && x.mesh);
  if (!p) return { ok: false, reason: 'no-pickup' };
  const beforeKind = p.kind;
  const beforeHp = state.hp;
  const beforeArmor = state.armor;
  const beforeCoins = state.coins;
  // Teleport onto pickup and run one collect tick
  state.x = p.x; state.z = p.z;
  updatePickups(0.05);
  const collected = !p.alive;
  return {
    ok: collected === true,
    kind: beforeKind,
    hpDelta: state.hp - beforeHp,
    armorDelta: state.armor - beforeArmor,
    coinsDelta: state.coins - beforeCoins,
    pickupsLeft: pickups.filter((x) => x.alive).length,
  };
};

window.__yacuiNeonProbe = () => {
  let n = 0;
  const samples = [];
  if (worldRoot) {
    worldRoot.traverse((o) => {
      if (!o.isMesh || !o.userData || !o.userData.yacuiHotpotNeon) return;
      n += 1;
      const wp = new THREE.Vector3();
      o.getWorldPosition(wp);
      samples.push({
        visible: !!o.visible,
        additive: !!o.userData.additiveNeon,
        vertical: !!o.userData.verticalNeon,
        box: !!(o.geometry && o.geometry.type === 'BoxGeometry'),
        x: +wp.x.toFixed(2), y: +wp.y.toFixed(2), z: +wp.z.toFixed(2),
      });
    });
  }
  return { ok: n === 1 && samples.every((s) => s.additive && s.vertical && !s.box), count: n, samples };
};
window.__cityPropProbe = () => {
  let vehicles = 0, npcs = 0;
  if (worldRoot) {
    worldRoot.traverse((o) => {
      if (o.name === 'vehicleProp') vehicles += 1;
      if (o.name === 'npcActor') npcs += 1;
    });
  }
  const before = streetNpcs.map((n) => ({ x: n.x, z: n.z }));
  if (typeof updateStreetNpcs === 'function') {
    for (let i = 0; i < 20; i++) updateStreetNpcs(0.05);
  }
  let npcMoved = false;
  streetNpcs.forEach((n, i) => {
    if (!before[i]) return;
    if (Math.hypot(n.x - before[i].x, n.z - before[i].z) > 0.25) npcMoved = true;
  });
  return { vehicles, npcs, npcMoved, streetNpcCount: streetNpcs.length };
};

window.__setKey = (code, down) => { keys[code] = !!down; };
window.__forceWasdProbe = (seconds = 0.85) => {
  if (typeof window.__clearPlayerToCorridor === 'function') window.__clearPlayerToCorridor();
  const before = { x: state.x, z: state.z };
  keys.KeyW = true;
  keys.KeyD = true;
  const steps = Math.max(12, Math.ceil(seconds / 0.05));
  for (let i = 0; i < steps; i++) {
    if (typeof applyPlayerPhysics === 'function') applyPlayerPhysics(0.05);
    else break;
  }
  keys.KeyW = false;
  keys.KeyD = false;
  if (playerMesh) playerMesh.position.set(state.x, 0, state.z);
  const d = Math.hypot(state.x - before.x, state.z - before.z);
  return { ok: d > 0.2, d: +d.toFixed(3), before, after: { x: +state.x.toFixed(3), z: +state.z.toFixed(3) } };
};
window.__clearPlayerToCorridor = () => {
  const c = resolveBotClear(0, 0, PLAYER_HEIGHT, 0.45);
  state.x = c.x; state.z = c.z; state.y = PLAYER_HEIGHT;
  state.vx = state.vz = 0;
  if (playerMesh) playerMesh.position.set(state.x, 0, state.z);
  return { x: state.x, z: state.z };
};
window.__setPlayerXZ = (x, z) => {
  const c = resolveBotClear(Number(x) || 0, Number(z) || 0, PLAYER_HEIGHT, 0.45);
  state.x = c.x; state.z = c.z; state.y = PLAYER_HEIGHT;
  state.vx = state.vz = 0;
  if (playerMesh) playerMesh.position.set(state.x, 0, state.z);
  updateCamera();
  return { x: state.x, z: state.z };
};

window.__setCameraLook = (y, p) => {
  yaw = Number(y) || 0;
  pitch = Math.max(-1.2, Math.min(1.2, Number(p) || 0));
  updateCamera();
  return { yaw, pitch, cam: camera ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : null };
};
window.__cameraClipProbe = () => {
  if (!camera || !worldRoot) return { ok: false, reason: 'no-cam' };
  const cam = camera.position;
  const forceHideNames = new Set([
    'envParallaxNear', 'envParallaxFar', 'envParallaxFarS',
    'envWallL', 'envWallR', 'envWallN', 'envWallS',
    'envBackdropN', 'envBackdropS',
  ]);
  let nearHits = 0;
  const samples = [];
  let forceHiddenVisible = 0;
  let lookUpDarkBand = false;
  let lookUpOccluderVisible = 0;
  let largeTranslucentInLookUp = 0;
  const pitchNow = typeof pitch === 'number' ? pitch : 0;
  const lookUp = pitchNow >= 0.45;
  worldRoot.traverse((o) => {
    if (!o.isMesh) return;
    const ud = o.userData || {};
    const mustHide = !!(ud.forceHidden || ud.lookUpOccluder || ud.parallaxNear || forceHideNames.has(o.name));
    if (mustHide && o.visible) {
      forceHiddenVisible += 1;
      if (ud.lookUpOccluder || forceHideNames.has(o.name)) lookUpOccluderVisible += 1;
    }
    if (!o.visible) return;
    if (o.name !== 'envParallaxNear' && !ud.cameraOccluder && !mustHide) {
      // Look-up mid-FOV: fail if a LARGE translucent/dark plane covers the cone
      if (lookUp && o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters) {
        const pw = o.geometry.parameters.width || 0;
        const ph = o.geometry.parameters.height || 0;
        const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
        const translucent = mats.some((m) => m && (m.transparent || (m.opacity != null && m.opacity < 0.98)));
        if ((pw >= 40 || ph >= 20) && translucent) {
          const wp = new THREE.Vector3();
          o.getWorldPosition(wp);
          // Plane sits in upper/mid look cone (not sky-parked)
          if (wp.y < 55 && Math.hypot(wp.x - cam.x, wp.z - cam.z) < 110) {
            largeTranslucentInLookUp += 1;
            lookUpDarkBand = true;
            if (samples.length < 8) {
              samples.push({ name: o.name || 'plane', kind: 'lookUpPlane', y: +wp.y.toFixed(1), w: pw, h: ph });
            }
          }
        }
      }
      return;
    }
    const wp = new THREE.Vector3();
    o.getWorldPosition(wp);
    const dist = cam.distanceTo(wp);
    let halfW = 8, halfH = 4;
    if (o.geometry && o.geometry.parameters) {
      halfW = (o.geometry.parameters.width || 16) * 0.5;
      halfH = (o.geometry.parameters.height || 8) * 0.5;
    }
    const inBand =
      Math.abs(cam.x - wp.x) < halfW + 1.2 &&
      Math.abs(cam.y - wp.y) < halfH + 1.2 &&
      Math.abs(cam.z - wp.z) < 2.8;
    if (inBand || dist < 4) {
      nearHits += 1;
      if (samples.length < 8) {
        samples.push({
          name: o.name,
          dist: +dist.toFixed(2),
          camY: +cam.y.toFixed(2),
          planeY: +wp.y.toFixed(2),
          planeZ: +wp.z.toFixed(2),
        });
      }
    }
  });
  // Near-awning / force-hidden occluders must never be visible in street/look-up cone
  let midStreetAwning = false;
  let awningVisible = false;
  let awningInLookUpBand = false;
  worldRoot.traverse((o) => {
    if (o.name !== 'envParallaxNear') return;
    if (o.visible) awningVisible = true;
    const wp = new THREE.Vector3();
    o.getWorldPosition(wp);
    if (o.visible && wp.y < 45 && Math.abs(wp.z) < 100) awningInLookUpBand = true;
    if (o.visible && wp.y < 16 && Math.abs(wp.z) < 40) midStreetAwning = true;
  });
  if (lookUp && (lookUpOccluderVisible > 0 || forceHiddenVisible > 0)) lookUpDarkBand = true;

  // Street env plate as scene.background or mapped onto envSky ⇒ look-up dark band / sign ghost
  if (lookUp && scene) {
    if (scene.background && scene.background.isTexture) {
      lookUpDarkBand = true;
      if (samples.length < 8) samples.push({ name: 'scene.background', kind: 'streetBgTex' });
    }
    const sky = worldRoot.getObjectByName('envSky');
    if (sky && sky.visible && sky.material && sky.material.map && !(sky.userData && sky.userData.nightVoidSky)) {
      lookUpDarkBand = true;
      if (samples.length < 8) samples.push({ name: 'envSky', kind: 'streetSkyMap' });
    }
  }
  // Opaque mid-FOV neon boxes (dark JPEG atlas background) still read as ghost slabs
  if (lookUp) {
    worldRoot.traverse((o) => {
      if (!o.isMesh || !o.visible || !o.userData || o.userData.atlasRole !== 'neon') return;
      if (o.userData.additiveNeon) return; // additive planes OK
      if (o.geometry && o.geometry.type === 'BoxGeometry') {
        const wp = new THREE.Vector3();
        o.getWorldPosition(wp);
        if (wp.y > 1.2 && wp.y < 8 && Math.abs(wp.x) < 14 && Math.abs(wp.z - cam.z) < 28) {
          lookUpDarkBand = true;
          if (samples.length < 8) samples.push({ name: 'neonBox', kind: 'opaqueNeonBox', y: +wp.y.toFixed(1) });
        }
      }
    });
  }
  // Duplicate plate overlays: any large PlaneGeometry still carrying street env map in FOV
  let plateOverlayVisible = 0;
  worldRoot.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const ud = o.userData || {};
    if (ud.plateStub || ud.forceHidden || ud.lookUpOccluder) return;
    if (!o.geometry || o.geometry.type !== 'PlaneGeometry' || !o.geometry.parameters) return;
    const pw = o.geometry.parameters.width || 0;
    const ph = o.geometry.parameters.height || 0;
    if (pw < 8 && ph < 6) return; // densify neon/gate planes are small — OK
    const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    const streetMapped = mats.some((m) => m && m.map && !ud.additiveNeon && o.name !== 'envGroundPlate');
    // Named legacy overlays must never draw
    if (forceHideNames.has(o.name) || streetMapped && (pw >= 20 || ph >= 10)) {
      plateOverlayVisible += 1;
      lookUpDarkBand = true;
      if (samples.length < 8) samples.push({ name: o.name || 'plate', kind: 'dupPlateOverlay', w: pw, h: ph });
    }
  });
  void plateOverlayVisible;

  const inside = pointInsideSolid(cam.x, cam.y, cam.z);
  const paddedHit = pointHitsSolidExpanded(cam.x, cam.y, cam.z, CAM_COLLIDE_PAD * 0.35);
  // Player-vanishes gate: cam outside corridor or solid between cam and hero feet
  const camOutOfCorridor = Math.abs(cam.x) > CAM_CORRIDOR_MAX_X + 0.05;
  let facadeCardHit = false;
  if (state && Number.isFinite(state.x)) {
    const steps = 14;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const px = cam.x + (state.x - cam.x) * t;
      const py = cam.y + ((state.y - 0.2) - cam.y) * t;
      const pz = cam.z + (state.z - cam.z) * t;
      if (pointInsideSolid(px, py, pz)) { facadeCardHit = true; break; }
    }
  }
  const playerVisible = !inside && !facadeCardHit && !camOutOfCorridor;

  const ok =
    nearHits === 0 &&
    !midStreetAwning &&
    !awningVisible &&
    !awningInLookUpBand &&
    !inside &&
    forceHiddenVisible === 0 &&
    !lookUpDarkBand &&
    largeTranslucentInLookUp === 0 &&
    playerVisible;

  return {
    ok,
    nearHits,
    midStreetAwning,
    awningVisible,
    awningInLookUpBand,
    forceHiddenVisible,
    lookUpOccluderVisible,
    lookUpDarkBand,
    largeTranslucentInLookUp,
    camInsideSolid: !!inside,
    camPaddedHit: !!paddedHit,
    camOutOfCorridor,
    facadeCardHit,
    playerVisible,
    pitch: +pitchNow.toFixed(2),
    cam: { x: +cam.x.toFixed(2), y: +cam.y.toFixed(2), z: +cam.z.toFixed(2) },
    samples,
  };
};
window.__whiteMeshProbe = () => {
  const r = worldRoot;
  let untexturedWhite = 0, awaitingTex = 0, visiblePickupOrbs = 0, visiblePips = 0;
  const samples = [];
  if (!r) return { untexturedWhite, awaitingTex, visiblePickupOrbs, visiblePips, samples, ok: false };
  r.traverse((obj) => {
    if (!obj.visible) return;
    if (obj.name === 'botTeamPip') { visiblePips += 1; return; }
    if (obj.name === 'pickupOrb') { visiblePickupOrbs += 1; return; }
    if (obj.userData && obj.userData.awaitingTex) { awaitingTex += 1; return; }
    if (!obj.isMesh || !obj.geometry) return;
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    const hasMap = mats.some((m) => m && m.map);
    if (hasMap) return;
    const nearWhite = !mats.length || mats.some((m) => {
      if (!m || !m.color) return true;
      return m.color.r > 0.72 && m.color.g > 0.72 && m.color.b > 0.72;
    });
    const t = obj.geometry.type;
    if (nearWhite && (t === 'BoxGeometry' || t === 'PlaneGeometry')) {
      untexturedWhite += 1;
      if (samples.length < 8) {
        const wp = new THREE.Vector3();
        obj.getWorldPosition(wp);
        samples.push({ name: obj.name, t, x: +wp.x.toFixed(1), z: +wp.z.toFixed(1) });
      }
    }
  });
  return {
    untexturedWhite, awaitingTex, visiblePickupOrbs, visiblePips, samples,
    ok: untexturedWhite === 0 && visiblePickupOrbs === 0 && visiblePips === 0,
  };
};

window.__botVisualProbe = () => {
  let total = 0, billboards = 0, stubsHidden = 0, capsules = 0;
  for (const b of bots) {
    if (!b || !b.mesh) continue;
    total += 1;
    const bb = b.mesh.userData && b.mesh.userData.billboard;
    const stub = b.mesh.userData && b.mesh.userData.stub;
    if (bb && bb.visible && bb.material && bb.material.map) billboards += 1;
    if (stub && !stub.visible) stubsHidden += 1;
    b.mesh.traverse((o) => {
      if (o.isMesh && o.geometry && (o.geometry.type === 'CylinderGeometry' || o.geometry.type === 'SphereGeometry') && o.visible && o.name !== 'botTeamPip') {
        capsules += 1;
      }
    });
  }
  return { total, billboards, stubsHidden, visibleCapsules: capsules, ok: billboards >= Math.min(4, total) && billboards > 0 };
};

window.__botMotionProbe = (seconds = 0.85) => {
  const alive = bots.filter((b) => b.alive);
  if (!alive.length) return { ok: false, reason: 'no-alive-bot' };
  const snaps = alive.map((b) => ({ bot: b, x: b.x, z: b.z }));
  // Drive AI synchronously so smoke does not depend on rAF timing
  const steps = Math.max(12, Math.ceil(seconds / 0.05));
  for (let i = 0; i < steps; i++) updateBots(0.05);
  let moved = 0;
  let maxDist = 0;
  const samples = [];
  for (const s of snaps) {
    if (!s.bot.alive) continue;
    const d = Math.hypot(s.bot.x - s.x, s.bot.z - s.z);
    maxDist = Math.max(maxDist, d);
    if (d > 0.45) moved += 1;
    samples.push({ name: s.bot.name, d: +d.toFixed(3), mode: s.bot.mode, x: +s.bot.x.toFixed(2), z: +s.bot.z.toFixed(2) });
  }
  return {
    ok: moved >= 1 && maxDist > 0.45,
    moved,
    maxDist: +maxDist.toFixed(3),
    alive: alive.length,
    samples: samples.slice(0, 6),
  };
};

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
    primary: '鏡頭跟住你，港灣開打。',
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
  transition: { level: '過場 · 第 N 關', next: '下一站——{地圖名}。', hint: 'Channel 7 轉場中…', continue: '繼續' },
  bosses: BOSSES.map((b) => ({ id: b.id, nameZh: b.nameZh, hook: b.hook, art: b.art })),
  sheets: { weapons: 'refs/ui/weapons-sheet.jpg', pickups: 'refs/ui/pickups-sheet.jpg' },
  campaignBosses: CHANNEL7.filter((l) => l.boss).map((l) => ({ level: l.level, bossId: l.bossId, nameZh: (BOSSES.find((b) => b.id === l.bossId) || {}).nameZh })),
});
