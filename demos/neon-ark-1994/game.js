import * as THREE from 'three';
import { WEAPON_SPECS, LORE_NOTES, getOracleHint, createInitialWorld } from './world_data.js';

// ============================================================================
// PROCEDURAL WEB AUDIO SYNTHESIZER (PS1 Survival Horror SFX & Save Room Pad)
// ============================================================================
class RetroWebAudio {
  constructor() {
    this.ctx = null;
    this.bgmMode = '';
    this.bgmTimer = null;
  }
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq, dur = 0.18, type = 'sine', vol = 0.18, slideTo = null) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }
  noise(dur = 0.25, vol = 0.22) {
    if (!this.ctx) return;
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * dur, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * dur * 0.35));
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start();
  }
  play(name) {
    this.init();
    if (name === 'pistol') { this.noise(0.22, 0.28); this.tone(190, 0.18, 'triangle', 0.25, 45); }
    else if (name === 'shotgun') { this.noise(0.42, 0.38); this.tone(110, 0.32, 'sawtooth', 0.3, 32); }
    else if (name === 'flamer') { this.noise(0.16, 0.16); this.tone(320, 0.12, 'sine', 0.1, 480); }
    else if (name === 'magnum') { this.noise(0.48, 0.42); this.tone(440, 0.38, 'sawtooth', 0.32, 55); }
    else if (name === 'explosion') { this.noise(0.75, 0.48); this.tone(80, 0.65, 'sawtooth', 0.38, 22); }
    else if (name === 'pickup') { this.tone(523.25, 0.14, 'sine', 0.2); setTimeout(() => this.tone(783.99, 0.24, 'sine', 0.22), 110); }
    else if (name === 'unlock') { this.tone(330, 0.12, 'triangle', 0.22); setTimeout(() => this.tone(659.25, 0.32, 'sine', 0.25), 110); }
    else if (name === 'locked') { this.tone(120, 0.16, 'square', 0.18, 90); }
    else if (name === 'beep') { this.tone(880, 0.07, 'sine', 0.14); }
    else if (name === 'heal') { this.tone(392, 0.38, 'sine', 0.22, 784); }
    else if (name === 'hurt') { this.noise(0.24, 0.3); this.tone(240, 0.25, 'sawtooth', 0.25, 85); }
    else if (name === 'oracle') {
      [440, 554.37, 659.25, 880].forEach((f, idx) => setTimeout(() => this.tone(f, 0.28, 'sine', 0.18), idx * 120));
    }
    else if (name === 'note_C') this.tone(261.63, 0.42, 'triangle', 0.26);
    else if (name === 'note_E') this.tone(329.63, 0.42, 'triangle', 0.26);
    else if (name === 'note_G') this.tone(392.00, 0.42, 'triangle', 0.26);
    else if (name === 'note_B') this.tone(493.88, 0.42, 'triangle', 0.26);
  }
  setBgm(mode) {
    if (this.bgmMode === mode) return;
    this.bgmMode = mode;
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    let step = 0;
    this.bgmTimer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running') return;
      if (mode === 'saveroom') {
        const arp = [220, 261.63, 329.63, 392.0, 493.88, 392.0];
        this.tone(arp[step % arp.length], 1.4, 'sine', 0.05);
      } else if (mode === 'boss') {
        const bass = [65.4, 73.4, 65.4, 82.4];
        this.tone(bass[step % bass.length], 0.65, 'sawtooth', 0.06);
      } else {
        this.tone(step % 2 === 0 ? 55.0 : 82.4, 1.8, 'sine', 0.045);
      }
      step++;
    }, mode === 'boss' ? 700 : 1500);
  }
}

// ============================================================================
// MAIN GAME STATE & THREE.JS DIORAMA ENGINE
// ============================================================================
const audio = new RetroWebAudio();
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080b16);
scene.fog = new THREE.FogExp2(0x080b16, 0.024);

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.5, 80);
const raycaster = new THREE.Raycaster();
const aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.0);
const mouseNDC = new THREE.Vector2();

const state = {
  rooms: createInitialWorld(),
  roomId: 'entrance_gate',
  px: 0, pz: 5.2, pYaw: Math.PI, // Facing North (-Z)
  hp: 100, maxHp: 100,
  invuln: 0,
  walkAnim: 0,
  camYaw: 45, camTargetYaw: 45,
  ps1Crt: true,
  tankControls: false,
  explorationMode: false,
  isAiming: false,
  aimFocus: 0,
  fireCd: 0,
  weapons: ['pistol'],
  curWeapon: 'pistol',
  ammo: { ammo_pistol: 24, ammo_shotgun: 0, ammo_flamer: 0, ammo_magnum: 0 },
  medkits: 2,
  grenades: 1,
  keyItems: new Set(),
  keyNames: {},
  notesRead: ['note_10_vera_truth'],
  secretsFound: new Set(),
  solvedPuzzles: new Set(),
  hasLaserUpgrade: false,
  oracleTokens: 10,
  oracleUses: 0,
  playTime: 0,
  damageTaken: 0,
  healsUsed: 0,
  savesCount: 0,
  modal: 'TITLE', // 'NONE', 'TITLE', 'MAP', 'INV', 'NOTE', 'KEYPAD', 'ORGAN', 'ORACLE', 'DIALOGUE', 'VICTORY', 'GAMEOVER'
  activeNoteId: 'note_10_vera_truth',
  keypadId: '', keypadTarget: '', keypadInput: '', keypadTitle: '',
  organSeq: [],
  oracleCard: ['', ''],
  dialogueNpc: null, dialogueLine: '',
  laserHit: new THREE.Vector3(0, 1, 0),
};

// Scene Groups
const roomGroup = new THREE.Group();
const dynamicGroup = new THREE.Group();
scene.add(roomGroup);
scene.add(dynamicGroup);

const ambientLight = new THREE.AmbientLight(0x88aaff, 0.75);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.position.set(10, 22, 12);
scene.add(dirLight);

// Build Player 3D Mesh (Vera Lin + Glowing Temporal Coral Arm + Flashlight Cone + Laser Sight)
const playerMesh = new THREE.Group();
const coatMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
const skinMat = new THREE.MeshLambertMaterial({ color: 0xf5d0ba });
const hairMat = new THREE.MeshLambertMaterial({ color: 0x1e1b2e });
const coralArmMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.68, 0.30), coatMat);
torso.position.y = 0.82;
playerMesh.add(torso);

const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.40), skinMat);
head.position.y = 1.38;
playerMesh.add(head);

const hair = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.44), hairMat);
hair.position.set(0, 1.50, -0.02);
playerMesh.add(hair);

const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.46, 0.16), coralArmMat);
leftArm.position.set(-0.32, 0.82, 0);
playerMesh.add(leftArm);

const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.46, 0.16), coatMat);
rightArm.position.set(0.32, 0.82, 0.12);
playerMesh.add(rightArm);

const gunMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.46), new THREE.MeshLambertMaterial({ color: 0x64748b }));
gunMesh.position.set(0.32, 0.92, 0.38);
playerMesh.add(gunMesh);

// Volumetric Floor Flashlight Cone
const coneGeo = new THREE.ConeGeometry(2.2, 6.5, 16, 1, true);
coneGeo.rotateX(Math.PI / 2);
coneGeo.translate(0, 0.06, 3.4);
const coneMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false });
playerMesh.add(new THREE.Mesh(coneGeo, coneMat));
scene.add(playerMesh);

// 3D Laser Sight Line & Target Reticle
const laserMat = new THREE.LineBasicMaterial({ color: 0xff2942 });
const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const laserLine = new THREE.Line(laserGeo, laserMat);
scene.add(laserLine);

const laserDot = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: 0xff2942, wireframe: true }));
scene.add(laserDot);

// ============================================================================
// BUILD 3D DIORAMA FOR CURRENT ROOM
// ============================================================================
let frontWalls = {};
let propMeshes = [];
let pickupMeshes = [];
let hazardMeshes = [];
let enemyMeshes = [];
let npcMeshes = [];
let particles = [];

function rebuildRoom3D() {
  while (roomGroup.children.length) roomGroup.remove(roomGroup.children[0]);
  while (dynamicGroup.children.length) dynamicGroup.remove(dynamicGroup.children[0]);
  frontWalls = {};
  propMeshes = [];
  pickupMeshes = [];
  hazardMeshes = [];
  enemyMeshes = [];
  npcMeshes = [];

  const rm = state.rooms[state.roomId];
  const hw = rm.w / 2, hd = rm.d / 2;

  // Base Diorama Slab
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(rm.w + 1.2, 1.2, rm.d + 1.2),
    new THREE.MeshLambertMaterial({ color: 0x0f172a })
  );
  slab.position.y = -0.62;
  roomGroup.add(slab);

  // Checkered Floor Tiles
  const tileSize = 2;
  const nx = Math.floor(rm.w / tileSize), nz = Math.floor(rm.d / tileSize);
  const c1 = new THREE.Color(rm.floorCol);
  const c2 = c1.clone().multiplyScalar(1.22);
  for (let ix = 0; ix < nx; ix++) {
    for (let iz = 0; iz < nz; iz++) {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize - 0.04, 0.08, tileSize - 0.04),
        new THREE.MeshLambertMaterial({ color: (ix + iz) % 2 === 0 ? c2 : c1 })
      );
      tile.position.set(-hw + ix * tileSize + 1, -0.02, -hd + iz * tileSize + 1);
      roomGroup.add(tile);
    }
  }

  // 4 Diorama Cutaway Walls
  const wallMat = new THREE.MeshLambertMaterial({ color: rm.wallCol });
  const wallConfigs = [
    ['north', 0, -hd, rm.w, 0.45],
    ['south', 0, hd, rm.w, 0.45],
    ['west', -hw, 0, 0.45, rm.d],
    ['east', hw, 0, 0.45, rm.d],
  ];
  for (const [dir, wx, wz, sx, sz] of wallConfigs) {
    const wMesh = new THREE.Mesh(new THREE.BoxGeometry(sx, 3.2, sz), wallMat);
    wMesh.position.set(wx, 1.6, wz);
    roomGroup.add(wMesh);
    frontWalls[dir] = wMesh;

    if (rm.doors[dir]) {
      const door = rm.doors[dir];
      const dGroup = new THREE.Group();
      if (dir === 'north') dGroup.position.set(door.offset, 0, -hd);
      if (dir === 'south') dGroup.position.set(door.offset, 0, hd);
      if (dir === 'west') { dGroup.position.set(-hw, 0, door.offset); dGroup.rotation.y = Math.PI / 2; }
      if (dir === 'east') { dGroup.position.set(hw, 0, door.offset); dGroup.rotation.y = Math.PI / 2; }

      const isOpen = door.unlocked || !door.lockId;
      const archCol = isOpen ? 0x34d399 : (door.lockId === 'gold_key' ? 0xfbbf24 : (door.lockId === 'silver_key' ? 0x38bdf8 : 0xf43f5e));
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 0.65), new THREE.MeshBasicMaterial({ color: archCol, wireframe: true }));
      frame.position.y = 1.25;
      dGroup.add(frame);
      const mat = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 1.4), new THREE.MeshBasicMaterial({ color: archCol, transparent: true, opacity: 0.45 }));
      mat.position.y = 0.04;
      dGroup.add(mat);
      roomGroup.add(dGroup);
    }
  }

  // Props
  for (const p of rm.props) {
    const g = new THREE.Group();
    g.position.set(p.x, 0, p.z);
    if (p.kind === 'fountain') {
      const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.2, 0.55, 12), new THREE.MeshLambertMaterial({ color: 0x334155 }));
      pool.position.y = 0.28;
      const water = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.58, 12), new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.75 }));
      water.position.y = 0.30;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: false }));
      gem.position.y = 1.5;
      g.add(pool, water, gem);
      p._spinMesh = gem;
    } else if (p.kind === 'oracle') {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.9), new THREE.MeshLambertMaterial({ color: 0x6b21a8 }));
      box.position.y = 0.95;
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      star.position.y = 1.45;
      g.add(box, star);
      p._spinMesh = star;
    } else if (p.kind === 'save_terminal') {
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 0.9), new THREE.MeshLambertMaterial({ color: 0x475569 }));
      desk.position.y = 0.42;
      const crt = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 0.65), new THREE.MeshBasicMaterial({ color: 0x34d399 }));
      crt.position.y = 1.15;
      g.add(desk, crt);
    } else if (p.kind === 'vein_crystal') {
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshBasicMaterial({ color: 0xd946ef, wireframe: false }));
      core.position.y = 1.8;
      const ring = new THREE.Mesh(new THREE.OctahedronGeometry(1.95, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true }));
      ring.position.y = 1.8;
      g.add(core, ring);
      p._spinMesh = core;
    } else if (p.kind === 'giant_dolphin' || p.kind === 'dolphin_gate') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), new THREE.MeshLambertMaterial({ color: 0x334155 }));
      base.position.y = 0.4;
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.9, 8), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }));
      body.position.y = 1.65;
      g.add(base, body);
    } else if (p.kind === 'organ') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 1.0), new THREE.MeshLambertMaterial({ color: 0x78350f }));
      body.position.y = 0.6;
      const pipes = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.1, 0.25), new THREE.MeshLambertMaterial({ color: 0xfbbf24 }));
      pipes.position.set(0, 1.6, -0.3);
      g.add(body, pipes);
    } else {
      const col = p.kind === 'heal_station' ? 0x10b981 : (p.kind === 'coral_plaque' ? 0xf43f5e : 0x64748b);
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.25, 1.0), new THREE.MeshLambertMaterial({ color: col }));
      m.position.y = 0.62;
      g.add(m);
    }
    roomGroup.add(g);
    propMeshes.push({ def: p, group: g });
  }

  // Pickups
  for (const pk of rm.pickups) {
    if (pk.collected) continue;
    const col = pk.kind === 'key_item' ? 0xfacc15 : (pk.kind === 'weapon' ? 0xf97316 : (pk.kind === 'medkit' ? 0x34d399 : (pk.isSecret ? 0xe879f9 : 0x38bdf8)));
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), new THREE.MeshBasicMaterial({ color: col }));
    mesh.position.set(pk.x, 0.45, pk.z);
    dynamicGroup.add(mesh);
    pickupMeshes.push({ def: pk, mesh });
  }

  // Hazards
  for (const hz of rm.hazards) {
    if (!hz.active) continue;
    if (hz.kind === 'explosive_barrel') {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.15, 10), new THREE.MeshLambertMaterial({ color: 0xef4444 }));
      b.position.set(hz.x, 0.58, hz.z);
      dynamicGroup.add(b);
      hazardMeshes.push({ def: hz, mesh: b });
    } else if (hz.kind === 'electric_puddle') {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(hz.r, hz.r, 0.05, 18), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55 }));
      p.position.set(hz.x, 0.03, hz.z);
      dynamicGroup.add(p);
      hazardMeshes.push({ def: hz, mesh: p });
    }
  }

  // NPCs
  for (const npc of rm.npcs) {
    const ng = new THREE.Group();
    ng.position.set(npc.x, 0, npc.z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.15, 0.32), new THREE.MeshLambertMaterial({ color: npc.color }));
    body.position.y = 0.58;
    const hdMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
    hdMesh.position.y = 1.35;
    const mark = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    mark.position.y = 1.95;
    ng.add(body, hdMesh, mark);
    dynamicGroup.add(ng);
    npcMeshes.push({ def: npc, group: ng, mark });
  }

  // Enemies
  for (const en of rm.enemies) {
    if (!en.alive) continue;
    const eg = new THREE.Group();
    eg.position.set(en.x, 0, en.z);
    const isBoss = en.kind === 'boss_swan';
    const scale = isBoss ? 1.65 : (en.kind === 'mascot_brute' ? 1.25 : 1.0);
    eg.scale.set(scale, scale, scale);

    const bCol = isBoss ? 0x9333ea : (en.kind === 'acid_spitter' ? 0x22c55e : (en.kind === 'mascot_brute' ? 0x0284c7 : 0xbe185d));
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.25, 0.44), new THREE.MeshLambertMaterial({ color: bCol }));
    body.position.y = 0.62;
    const coral = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), new THREE.MeshBasicMaterial({ color: 0xf43f5e, wireframe: isBoss }));
    coral.position.set(0.15, 1.38, 0);
    eg.add(body, coral);
    dynamicGroup.add(eg);
    enemyMeshes.push({ def: en, group: eg, coral });
  }

  audio.setBgm(rm.isSaveRoom ? 'saveroom' : (state.roomId === 'pelagic_core' && rm.enemies.some(e => e.alive) ? 'boss' : 'explore'));
  updateHUD();
}

// ============================================================================
// SMART MAP COMPLETION STATUS
// ============================================================================
function getRoomCompletion(rid) {
  const rm = state.rooms[rid];
  if (!rm.visited) return { status: 'UNVISITED', rem: 0 };
  let rem = rm.pickups.filter(p => !p.collected).length;
  if (rid === 'entrance_gate' && !state.solvedPuzzles.has('door_keypad_1986')) rem++;
  if (rid === 'dolphinarium' && !state.solvedPuzzles.has('organ_solved')) rem++;
  if (rid === 'marine_biolab' && !state.solvedPuzzles.has('coral_melted')) rem++;
  if (rid === 'director_suite' && !state.solvedPuzzles.has('safe_2142_opened')) rem++;
  if (rid === 'coolant_tunnel') {
    if (!state.solvedPuzzles.has('flooded_drained')) rem++;
    if (!state.solvedPuzzles.has('astral_unlocked')) rem++;
  }
  return { status: rem === 0 ? 'CLEARED' : 'REMAINING', rem };
}

// ============================================================================
// TOAST & HUD UPDATES
// ============================================================================
let toastTimeout = null;
function showToast(msg, ms = 4200) {
  const el = document.getElementById('toastBox');
  el.textContent = msg;
  el.classList.add('on');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('on'), ms);
}

function updateHUD() {
  const hpEl = document.getElementById('hpText');
  const stEl = document.getElementById('statusText');
  hpEl.textContent = `HP ${state.hp}/${state.maxHp}`;
  if (state.hp >= 65) { hpEl.style.color = '#4ade80'; stEl.textContent = 'FINE · 狀態正常'; }
  else if (state.hp >= 35) { hpEl.style.color = '#fbbf24'; stEl.textContent = 'CAUTION · 輕度創傷'; }
  else { hpEl.style.color = '#f43f5e'; stEl.textContent = 'DANGER · 瀕臨結晶化'; }

  document.getElementById('secretText').textContent = `神諭: ${state.oracleTokens}/10 · 秘密: ${state.secretsFound.size}/8`;

  const rm = state.rooms[state.roomId];
  const comp = getRoomCompletion(state.roomId);
  const banner = document.getElementById('roomBanner');
  banner.textContent = comp.status === 'CLEARED'
    ? `【${rm.name}】 ★ 區域已完全搜刮清空`
    : `【${rm.name}】 ◆ 尚餘 ${comp.rem} 項線索或物資`;
  banner.style.color = comp.status === 'CLEARED' ? '#34d399' : '#fde047';

  const spec = WEAPON_SPECS[state.curWeapon];
  document.getElementById('weapName').textContent = `武器：${spec.name}`;
  document.getElementById('ammoText').textContent = `彈藥：${state.ammo[spec.ammoKey] || 0}`;

  const strip = document.getElementById('weaponSlots');
  strip.innerHTML = '';
  for (const wid of state.weapons) {
    const w = WEAPON_SPECS[wid];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot-pill' + (state.curWeapon === wid ? ' on' : '');
    b.textContent = w.short;
    b.onclick = () => { state.curWeapon = wid; audio.play('beep'); updateHUD(); };
    strip.appendChild(b);
  }
  const medBtn = document.createElement('button');
  medBtn.type = 'button';
  medBtn.className = 'slot-pill';
  medBtn.textContent = `[H]急救:${state.medkits}`;
  medBtn.onclick = useMedkit;
  strip.appendChild(medBtn);

  // Boss Bar
  const boss = rm.enemies.find(e => e.alive && e.kind === 'boss_swan');
  const bossWrap = document.getElementById('bossBarWrap');
  if (boss) {
    bossWrap.classList.add('on');
    document.getElementById('bossName').textContent = `${boss.name} (${boss.hp}/${boss.maxHp})`;
    document.getElementById('bossFill').style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
  } else {
    bossWrap.classList.remove('on');
  }
}

// Animated ECG Canvas
const ecgCanvas = document.getElementById('ecgCanvas');
const ecgCtx = ecgCanvas.getContext('2d');
function drawECG(t) {
  ecgCtx.clearRect(0, 0, 128, 36);
  ecgCtx.strokeStyle = state.hp >= 65 ? '#4ade80' : (state.hp >= 35 ? '#fbbf24' : '#f43f5e');
  ecgCtx.lineWidth = 2;
  ecgCtx.beginPath();
  const speed = state.hp >= 50 ? 6 : 11;
  for (let x = 0; x < 128; x++) {
    const ph = (x * 0.12 - t * speed) % (Math.PI * 2);
    let y = 18;
    if (ph > 2.5 && ph < 2.9) y -= 12 * Math.sin(((ph - 2.5) / 0.4) * Math.PI);
    else if (ph >= 2.9 && ph < 3.2) y += 8 * Math.sin(((ph - 2.9) / 0.3) * Math.PI);
    if (x === 0) ecgCtx.moveTo(x, y);
    else ecgCtx.lineTo(x, y);
  }
  ecgCtx.stroke();
}

// ============================================================================
// INTERACTION & PUZZLES
// ============================================================================
function getNearestInteractable() {
  const rm = state.rooms[state.roomId];
  for (const p of rm.pickups) {
    if (!p.collected && Math.hypot(state.px - p.x, state.pz - p.z) < 1.9) {
      return { type: 'pickup', obj: p, label: `⚡ [E] 拾取：${p.name}` };
    }
  }
  for (const npc of rm.npcs) {
    if (Math.hypot(state.px - npc.x, state.pz - npc.z) < 2.3) {
      return { type: 'npc', obj: npc, label: `💬 [E] 交談：${npc.name}` };
    }
  }
  for (const prop of rm.props) {
    if (prop.interactId && Math.hypot(state.px - prop.x, state.pz - prop.z) < prop.r + 1.5) {
      return { type: 'prop', obj: prop, label: `🔍 [E] ${prop.label}` };
    }
  }
  const hw = rm.w / 2, hd = rm.d / 2;
  for (const [dir, door] of Object.entries(rm.doors)) {
    let dx = 0, dz = 0;
    if (dir === 'north') { dx = door.offset; dz = -hd + 0.8; }
    if (dir === 'south') { dx = door.offset; dz = hd - 0.8; }
    if (dir === 'west') { dx = -hw + 0.8; dz = door.offset; }
    if (dir === 'east') { dx = hw - 0.8; dz = door.offset; }
    if (Math.hypot(state.px - dx, state.pz - dz) < 2.4) {
      const tName = state.rooms[door.target].name;
      const open = door.unlocked || !door.lockId;
      return {
        type: 'door',
        obj: door,
        label: open ? `🚪 [E] 進入：${tName}` : `🔒 [E] 鎖定：${door.lockName} (${tName})`,
      };
    }
  }
  return null;
}

function triggerInteract() {
  if (state.modal !== 'NONE') return;
  const hit = getNearestInteractable();
  if (!hit) return;

  if (hit.type === 'pickup') {
    const p = hit.obj;
    p.collected = true;
    audio.play('pickup');
    if (p.isSecret) state.secretsFound.add(p.uid);
    if (p.kind.startsWith('ammo_')) {
      state.ammo[p.kind] = (state.ammo[p.kind] || 0) + p.amount;
      showToast(`獲得彈藥：${p.name}`);
    } else if (p.kind === 'medkit') {
      state.medkits += p.amount;
      showToast(`獲得：${p.name} (按 [H] 治療)`);
    } else if (p.kind === 'weapon') {
      if (!state.weapons.includes(p.itemId)) state.weapons.push(p.itemId);
      state.curWeapon = p.itemId;
      showToast(`獲得新武器：${p.name}！`);
    } else if (p.kind === 'key_item') {
      state.keyItems.add(p.itemId);
      state.keyNames[p.itemId] = p.name;
      showToast(`獲得關鍵道具：${p.name}！`);
    } else if (p.kind === 'upgrade') {
      state.hasLaserUpgrade = true;
      showToast(`獲得改裝零件：${p.name}！雷射瞄準收束速度提升 50%！`);
    } else if (p.kind === 'secret') {
      showToast(`發現隱藏秘密：${p.name}！(${state.secretsFound.size}/8)`);
    } else if (p.kind === 'note') {
      if (!state.notesRead.includes(p.noteId)) state.notesRead.push(p.noteId);
      state.activeNoteId = p.noteId;
      openModal('NOTE');
    }
    rebuildRoom3D();
    return;
  }

  if (hit.type === 'npc') {
    const npc = hit.obj;
    state.dialogueNpc = npc;
    state.dialogueLine = npc.lines[npc.idx];
    npc.idx = (npc.idx + 1) % npc.lines.length;
    audio.play('beep');
    openModal('DIALOGUE');
    return;
  }

  if (hit.type === 'door') {
    const door = hit.obj;
    if (door.unlocked || !door.lockId) {
      changeRoom(door.target, door.spawn);
    } else if (door.lockId === 'keypad_1986') {
      state.keypadId = 'door_keypad_1986';
      state.keypadTarget = '1986';
      state.keypadInput = '';
      state.keypadTitle = '北側安檢電子鎖 (提示：博覽館開幕年份)';
      audio.play('beep');
      openModal('KEYPAD');
    } else if (state.keyItems.has(door.lockId)) {
      door.unlocked = true;
      state.solvedPuzzles.add(`door_${door.lockId}`);
      audio.play('unlock');
      showToast(`使用 ${state.keyNames[door.lockId]} 解鎖了大門！`);
      changeRoom(door.target, door.spawn);
    } else {
      audio.play('locked');
      showToast(`門鎖著：需要【${door.lockName}】。`);
    }
    return;
  }

  if (hit.type === 'prop') {
    const iid = hit.obj.interactId;
    if (iid === 'use_oracle') {
      if (state.oracleTokens <= 0) { showToast('星象神諭機代幣已用盡！'); return; }
      state.oracleTokens--;
      state.oracleUses++;
      audio.play('oracle');
      state.oracleCard = getOracleHint(state.keyItems, state.solvedPuzzles);
      openModal('ORACLE');
    } else if (iid === 'save_game') {
      saveGameLocal();
    } else if (iid === 'heal_station') {
      state.hp = state.maxHp;
      audio.play('heal');
      showToast('【戰術補給醫療站】HP 已完全恢復！');
      updateHUD();
    } else if (iid === 'puzzle_keypad_1986') {
      state.keypadId = 'door_keypad_1986';
      state.keypadTarget = '1986';
      state.keypadInput = '';
      state.keypadTitle = '北側安檢電子鎖 (提示：博覽館開幕年份)';
      audio.play('beep');
      openModal('KEYPAD');
    } else if (iid === 'puzzle_safe_2142') {
      if (state.solvedPuzzles.has('safe_2142_opened')) { showToast('鈦金保險箱已經打開。'); return; }
      state.keypadId = 'safe_2142_opened';
      state.keypadTarget = '2142';
      state.keypadInput = '';
      state.keypadTitle = '館長室鈦金保險箱 (提示：未來難民毀滅年份)';
      audio.play('beep');
      openModal('KEYPAD');
    } else if (iid === 'door_to_dolphinarium') {
      if (state.keyItems.has('bronze_key') || state.solvedPuzzles.has('door_bronze')) {
        state.solvedPuzzles.add('door_bronze');
        audio.play('unlock');
        changeRoom('dolphinarium', [0, 7.2]);
      } else {
        audio.play('locked');
        showToast('需要【青銅海豚徽章】（位於新星廣場西側的員工安全室）。');
      }
    } else if (iid === 'puzzle_organ') {
      if (state.solvedPuzzles.has('organ_solved')) { showToast('諧波管風琴已解鎖。'); return; }
      state.organSeq = [];
      audio.play('beep');
      openModal('ORGAN');
    } else if (iid === 'puzzle_melt_coral') {
      if (state.solvedPuzzles.has('coral_melted')) { showToast('鈣化時間珊瑚已溶解。'); return; }
      if (state.keyItems.has('acid_vial')) {
        state.solvedPuzzles.add('coral_melted');
        if (!state.weapons.includes('flamer')) state.weapons.push('flamer');
        state.curWeapon = 'flamer';
        state.ammo.ammo_flamer += 60;
        state.keyItems.add('moon_medallion');
        state.keyNames.moon_medallion = '【星象】深海新月浮雕';
        audio.play('unlock');
        showToast('使用強酸溶解鈣化珊瑚！獲得【極光熱熔噴射器】與【深海新月浮雕】！');
        rebuildRoom3D();
      } else {
        audio.play('locked');
        showToast('展示櫃被鈣化珊瑚封死！需要實驗台上的【深海強酸試劑】。');
      }
    } else if (iid === 'puzzle_drain_flood') {
      if (state.solvedPuzzles.has('flooded_drained')) { showToast('積水已排乾。'); return; }
      if (state.keyItems.has('hydraulic_crank')) {
        state.solvedPuzzles.add('flooded_drained');
        state.rooms.coolant_tunnel.hazards.forEach(h => { if (h.kind === 'electric_puddle') h.active = false; });
        audio.play('unlock');
        showToast('使用【液壓搖柄】轉動排水閥！走廊中央的帶電積水已排乾！');
        rebuildRoom3D();
      } else {
        audio.play('locked');
        showToast('缺少把手！需要【液壓搖柄】（位於海豚劇場貴賓後台）。');
      }
    } else if (iid === 'puzzle_astral_gate') {
      if (state.keyItems.has('gold_key') && state.keyItems.has('moon_medallion')) {
        state.solvedPuzzles.add('astral_unlocked');
        state.rooms.coolant_tunnel.doors.north.unlocked = true;
        audio.play('oracle');
        showToast('嵌入黃金日冕徽章與深海新月浮雕——北側【零號時間晶簇核心】大門開啟！');
        rebuildRoom3D();
      } else {
        audio.play('locked');
        showToast('三曜星盤祭壇需要同時持有【黃金日冕徽章】與【深海新月浮雕】。');
      }
    } else if (iid === 'claim_serum_ending') {
      const bossAlive = state.rooms.pelagic_core.enemies.some(e => e.alive && e.kind === 'boss_swan');
      if (bossAlive) {
        audio.play('locked');
        showToast('必須先擊敗【時空融合體・維克多·斯旺】才能奪取逆熵穩定血清！');
      } else {
        audio.play('oracle');
        openModal('VICTORY');
      }
    } else {
      showToast(`調查了 ${hit.obj.label}。`);
    }
  }
}

function changeRoom(targetId, spawnXZ) {
  state.roomId = targetId;
  state.rooms[targetId].visited = true;
  state.px = spawnXZ[0];
  state.pz = spawnXZ[1];
  audio.play('beep');
  rebuildRoom3D();
  showToast(`進入區域：【${state.rooms[targetId].name}】`);
}

function useMedkit() {
  if (state.medkits <= 0) { showToast('沒有急救噴霧罐了！'); return; }
  if (state.hp >= state.maxHp) { showToast('目前體力充沛。'); return; }
  state.medkits--;
  state.healsUsed++;
  state.hp = Math.min(state.maxHp, state.hp + 65);
  audio.play('heal');
  showToast('使用急救噴霧罐，恢復 65 點 HP！');
  updateHUD();
}

// ============================================================================
// COMBAT & LASER-SIGHT RAYCAST
// ============================================================================
function fireWeapon() {
  if (state.modal !== 'NONE' || !state.isAiming || state.fireCd > 0) return;
  const spec = WEAPON_SPECS[state.curWeapon];
  if ((state.ammo[spec.ammoKey] || 0) <= 0) {
    audio.play('locked');
    showToast(`【彈藥耗盡】${spec.name} 沒有子彈了！`);
    state.fireCd = 0.25;
    return;
  }
  state.ammo[spec.ammoKey]--;
  state.fireCd = spec.cooldown;
  audio.play(state.curWeapon);

  const isCrit = state.aimFocus >= 0.82;
  const dx = Math.sin(state.pYaw), dz = Math.cos(state.pYaw);
  const rm = state.rooms[state.roomId];

  // Check barrel hit
  for (const hz of rm.hazards) {
    if (hz.active && hz.kind === 'explosive_barrel') {
      const hx = hz.x - state.px, hzZ = hz.z - state.pz;
      const proj = hx * dx + hzZ * dz;
      const perp = Math.abs(hx * dz - hzZ * dx);
      if (proj > 0.2 && proj < spec.range && perp < 0.85) {
        detonateBarrel(hz);
        state.aimFocus = Math.max(0, state.aimFocus - 0.5);
        updateHUD();
        return;
      }
    }
  }

  // Damage enemies in cone
  for (let p = 0; p < spec.pellets; p++) {
    const spread = ((Math.random() - 0.5) * 2 * spec.spreadDeg * Math.PI) / 180;
    const pdx = Math.sin(state.pYaw + spread), pdz = Math.cos(state.pYaw + spread);
    let bestEn = null, bestDist = spec.range;
    for (const en of rm.enemies) {
      if (!en.alive) continue;
      const ex = en.x - state.px, ez = en.z - state.pz;
      const proj = ex * pdx + ez * pdz;
      const perp = Math.abs(ex * pdz - ez * pdx);
      const hitRad = en.kind === 'boss_swan' ? 1.35 : 0.9;
      if (proj > 0.2 && proj < bestDist && perp < hitRad) {
        bestDist = proj;
        bestEn = en;
      }
    }
    if (bestEn) {
      const dmg = Math.round(spec.damage * (isCrit ? spec.critMult : 1));
      damageEnemy(bestEn, dmg);
    }
  }

  state.aimFocus = Math.max(0, state.aimFocus - 0.45);
  updateHUD();
}

function detonateBarrel(hz) {
  if (!hz.active) return;
  hz.active = false;
  audio.play('explosion');
  showToast('💥 引爆高壓瓦斯桶！對周圍迴響體造成巨額範圍傷害！');
  const rm = state.rooms[state.roomId];
  for (const en of rm.enemies) {
    if (en.alive && Math.hypot(en.x - hz.x, en.z - hz.z) <= 4.8) {
      damageEnemy(en, 95);
    }
  }
  rebuildRoom3D();
}

function damageEnemy(en, dmg) {
  en.hp -= dmg;
  const dx = en.x - state.px, dz = en.z - state.pz;
  const dist = Math.max(0.1, Math.hypot(dx, dz));
  en.x += (dx / dist) * 0.35;
  en.z += (dz / dist) * 0.35;
  if (en.hp <= 0) {
    en.alive = false;
    if (en.kind === 'boss_swan') {
      showToast('🏆【最終首領擊破！】維克多·斯旺已崩解！快前往左上角實驗台領取【逆熵穩定血清】！', 7000);
    }
    rebuildRoom3D();
  } else if (en.kind === 'boss_swan' && en.hp < en.maxHp * 0.5 && en.phase === 1) {
    en.phase = 2;
    en.speed = 3.0;
    showToast('⚠️ 維克多·斯旺進入第二階段『2142時間暴走』！');
  }
  updateHUD();
}

// ============================================================================
// MODALS RENDERER (TITLE, SMART MAP, INVENTORY, KEYPAD, ORGAN, ORACLE, S-RANK)
// ============================================================================
const modalBackdrop = document.getElementById('modalBackdrop');
const modalContent = document.getElementById('modalContent');

function openModal(mode) {
  state.modal = mode;
  if (mode === 'NONE') {
    modalBackdrop.classList.remove('on');
    return;
  }
  modalBackdrop.classList.add('on');

  if (mode === 'TITLE') {
    modalContent.innerHTML = `
      <h1>《 霓虹方舟：1994 · NEON ARK: 1994 》</h1>
      <div class="modal-sub">A 32-BIT RETRO SURVIVAL HORROR DIORAMA — 致敬《Crow Country》微縮箱庭生存恐怖</div>
      <div class="story-block">
        <b>【1994年・東海人工島「太陽神穹頂博覽館」】</b><br/>
        科技大亨維克多·斯旺博士兩年前突然封鎖博覽館後人間蒸發。自稱海事保險調查員的少女<b>【林薇拉 (Vera Lin)】</b>獨自登島，卻在微笑的80年代海豚吉祥物與霓虹展館間遭遇長滿時間珊瑚的扭曲怪物「迴響體」。<br/>
        揭開<b>西元 2142 年淹沒世紀難民</b>與薇拉左臂<b>「09號接觸者」</b>的雙重真相，奪取逆熵穩定血清！
      </div>
      <div class="story-block" style="border-color:#fde04766;color:#fef08a">
        <b>🎮 操作指南（支援鍵盤滑鼠 & 手機觸控）：</b><br/>
        ・<b>移動與視角</b>：[WASD / 方向鍵] 移動 ｜ [Q / C] 360°旋轉等距箱庭鏡頭 ｜ [E / F] 調查 / 拾取 / 開門<br/>
        ・<b>停步雷射瞄準</b>：按住 [滑鼠右鍵 / 空白鍵 / Shift] 啟動 3D 雷射瞄準線（準星收束變紅爆頭雙倍傷害）+ [左鍵 / Enter] 射擊<br/>
        ・<b>智慧地圖與切換</b>：[TAB / M] 顏色編碼智慧地圖 ｜ [I] 文獻與物品 ｜ [F1] CRT濾鏡 ｜ [F2] 現代/坦克操作 ｜ [F3] 生存/探索無敵模式
      </div>
      <div class="btn-row">
        <button type="button" class="btn-primary" id="btnStartNow">▶ 立即在瀏覽器開始 3D 試玩</button>
        <a class="btn-sec" href="./neon-ark-1994-pc-opengl.zip" download>⬇ 下載 PC 原生 Python+OpenGL 完整版 (.zip)</a>
      </div>
    `;
    document.getElementById('btnStartNow').onclick = () => {
      audio.init();
      audio.play('unlock');
      openModal('NONE');
      rebuildRoom3D();
      showToast('歡迎來到 1994 年太陽神穹頂！先調查桌上的《安檢亭值班日誌》找出 4 位數開幕年份密碼。', 5500);
    };
  } else if (mode === 'MAP') {
    let cellsHtml = '';
    const gridMap = {};
    Object.values(state.rooms).forEach(r => { gridMap[`${r.grid[0]},${r.grid[1]}`] = r; });
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        const rm = gridMap[`${col},${row}`];
        if (!rm) {
          cellsHtml += `<div class="map-cell" style="opacity:0.25"></div>`;
          continue;
        }
        const comp = getRoomCompletion(rm.id);
        let cls = 'map-cell';
        let stTxt = '？？？ (未探索)';
        if (rm.visited) {
          if (rm.isSaveRoom && comp.status === 'CLEARED') { cls += ' saveroom'; stTxt = '★ 安全屋 (已清空)'; }
          else if (comp.status === 'CLEARED') { cls += ' cleared'; stTxt = '★ CLEAR (搜刮完畢)'; }
          else { cls += ' remaining'; stTxt = `◆ 尚餘 ${comp.rem} 項謎題/物資`; }
        }
        if (rm.id === state.roomId) cls += ' current';
        cellsHtml += `
          <div class="${cls}">
            <b>${rm.visited ? rm.name : '未知展區'}</b>
            <small>${stTxt}</small>
            ${rm.id === state.roomId ? '<small style="color:#fde047">▲ 林薇拉目前位置</small>' : ''}
          </div>
        `;
      }
    }
    modalContent.innerHTML = `
      <h2>🗺️ 太陽神穹頂・顏色編碼智慧地圖 (SMART MAP)</h2>
      <p style="font-size:12px;color:#cbd5e1">圖例：[亮青綠] 已完全清空 ｜ [琥珀橘] 尚有未解謎題或物資 ｜ [翡翠藍] 安全屋存檔點</p>
      <div class="smart-map-grid">${cellsHtml}</div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnCloseModal">返回遊戲 [TAB / ESC]</button></div>
    `;
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'INV') {
    const keysList = state.keyItems.size
      ? [...state.keyItems].map(k => `<li>◆ ${state.keyNames[k] || k}</li>`).join('')
      : '<li>尚未取得特殊徽章或工具</li>';
    const notesList = state.notesRead.map(nid => {
      const n = LORE_NOTES[nid];
      return `<div class="story-block"><b>${n.title}</b> <small>(${n.date})</small><br/>${n.body.replace(/\n/g, '<br/>')}</div>`;
    }).join('');
    modalContent.innerHTML = `
      <h2>📁 戰術手提箱與機密文獻檔案 (${state.notesRead.length}/12)</h2>
      <div class="story-block"><b>【持有關鍵鑰匙與星象印記】</b><ul style="margin-top:6px;padding-left:18px">${keysList}</ul></div>
      <div style="max-height:340px;overflow-y:auto">${notesList}</div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnCloseModal">關閉檔案欄 [I / ESC]</button></div>
    `;
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'NOTE') {
    const n = LORE_NOTES[state.activeNoteId] || { title: '檔案', date: '', body: '' };
    modalContent.innerHTML = `
      <h2>${n.title}</h2>
      <div class="modal-sub">檔案日期：${n.date}</div>
      <div class="story-block" style="font-size:14px">${n.body.replace(/\n/g, '<br/>')}</div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnCloseModal">收起文獻 [E / ENTER]</button></div>
    `;
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'KEYPAD') {
    const disp = state.keypadInput.padEnd(4, '_').split('').join(' ');
    modalContent.innerHTML = `
      <h2 style="text-align:center">${state.keypadTitle}</h2>
      <div class="keypad-led" id="kpLed">${disp}</div>
      <div class="keypad-grid" id="kpGrid"></div>
      <div class="btn-row"><button type="button" class="btn-sec" id="btnCloseModal">取消離開 [ESC]</button></div>
    `;
    const grid = document.getElementById('kpGrid');
    ['1','2','3','4','5','6','7','8','9','CLR','0','OK'].forEach(k => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kp-btn';
      b.textContent = k;
      b.onclick = () => pressKeypad(k);
      grid.appendChild(b);
    });
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'ORGAN') {
    const seq = state.organSeq.length ? state.organSeq.join(' ➔ ') : '（請依序彈奏 C - E - G - B）';
    modalContent.innerHTML = `
      <h2 style="text-align:center">🎹 仿生海豚劇場・諧波管風琴控制台</h2>
      <div class="modal-sub">目前共鳴序列：${seq}</div>
      <div class="organ-grid" id="organGrid"></div>
      <div class="btn-row"><button type="button" class="btn-sec" id="btnCloseModal">離開控制台 [ESC]</button></div>
    `;
    const notes = [
      ['C', '1 / C<br/>深海之底 Do', '#2563eb'],
      ['E', '2 / E<br/>珊瑚微光 Mi', '#059669'],
      ['G', '3 / G<br/>潮汐湧動 Sol', '#d97706'],
      ['B', '4 / B<br/>星辰倒影 Si', '#9333ea'],
    ];
    const og = document.getElementById('organGrid');
    notes.forEach(([code, label, col]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'organ-key';
      b.style.background = col;
      b.innerHTML = label;
      b.onclick = () => pressOrgan(code);
      og.appendChild(b);
    });
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'ORACLE') {
    modalContent.innerHTML = `
      <h1>★ 星象神諭機 ASTRO-ORACLE 86 ★</h1>
      <div class="modal-sub">${state.oracleCard[0]}</div>
      <div class="story-block" style="font-size:15px;text-align:center">${state.oracleCard[1]}</div>
      <p style="text-align:center;font-size:12px;color:#fbbf24">剩餘神諭代幣：${state.oracleTokens} / 10 枚</p>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnCloseModal">收起神諭籤 [E / ENTER]</button></div>
    `;
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'DIALOGUE') {
    modalContent.innerHTML = `
      <h2>💬 ${state.dialogueNpc.name} <small style="font-size:13px;color:#38bdf8">(${state.dialogueNpc.role})</small></h2>
      <div class="story-block" style="font-size:15px">${state.dialogueLine}</div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnCloseModal">繼續 [E / ENTER]</button></div>
    `;
    document.getElementById('btnCloseModal').onclick = () => openModal('NONE');
  } else if (mode === 'VICTORY') {
    const score = Math.max(50, 100 - state.healsUsed * 5 - state.oracleUses * 5 + state.secretsFound.size * 5 - Math.floor(state.damageTaken / 50) * 3);
    const rank = score >= 105 ? 'S+' : (score >= 90 ? 'S' : (score >= 75 ? 'A' : 'B'));
    const mins = Math.floor(state.playTime / 60), secs = Math.floor(state.playTime % 60);
    modalContent.innerHTML = `
      <h1>🏆 《 NEON ARK : 1994 》 通關結算報告</h1>
      <div class="modal-sub">${state.secretsFound.size >= 5 ? '【真結局 TRUE ENDING：跨越淹沒世紀的黎明】' : '【標準結局 GOOD ENDING：逃離太陽神穹頂】'}</div>
      <div class="story-block">
        林薇拉（1992年零號接觸者・林克拉拉）將【逆熵穩定血清】注入左臂，藍紫色的時間珊瑚結晶逐漸消退。<br/>
        她帶著艾蕾娜與生還者乘船駛離東海人工島，而海底三千公尺下的零號時間晶簇已被永久封存——2142年的未來將由活著的人類親手改寫。
      </div>
      <div class="story-block" style="text-align:center;border-color:#fde047">
        <h2 style="font-size:28px;color:#fde047">最終評價 RANK：【 ${rank} 】 (${score} pts)</h2>
        <p>通關耗時：${mins}分 ${secs}秒 ｜ 醫療噴霧：${state.healsUsed} 次 ｜ 神諭提示：${state.oracleUses}/10 次 ｜ 秘密收集：${state.secretsFound.size}/8</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn-primary" id="btnRestart">🔄 再玩一次 (挑戰 S+ Rank)</button>
        <a class="btn-sec" href="./neon-ark-1994-pc-opengl.zip" download>⬇ 下載 PC 原生 OpenGL 版</a>
      </div>
    `;
    document.getElementById('btnRestart').onclick = () => window.location.reload();
  } else if (mode === 'GAMEOVER') {
    modalContent.innerHTML = `
      <h1 style="color:#f43f5e">YOU WERE CONSUMED BY THE PELAGIC VEIN</h1>
      <div class="modal-sub">林薇拉體內的時間珊瑚徹底結晶化……意識永遠迷失於 1994 與 2142 的夾縫中</div>
      <div class="btn-row">
        <button type="button" class="btn-primary" id="btnRetry">🔄 重新開始</button>
      </div>
    `;
    document.getElementById('btnRetry').onclick = () => window.location.reload();
  }
}

function pressKeypad(k) {
  audio.play('beep');
  if (k === 'CLR') { state.keypadInput = ''; openModal('KEYPAD'); return; }
  if (k !== 'OK' && state.keypadInput.length < 4) state.keypadInput += k;
  const el = document.getElementById('kpLed');
  if (el) el.textContent = state.keypadInput.padEnd(4, '_').split('').join(' ');
  if (state.keypadInput.length === 4 || k === 'OK') {
    if (state.keypadInput === state.keypadTarget) {
      audio.play('unlock');
      state.solvedPuzzles.add(state.keypadId);
      if (state.keypadId === 'door_keypad_1986') {
        state.rooms.entrance_gate.doors.north.unlocked = true;
        showToast('🔓【密碼正確：1986】北側通往新星中央廣場的大門已解鎖！');
      } else if (state.keypadId === 'safe_2142_opened') {
        if (!state.weapons.includes('magnum')) state.weapons.push('magnum');
        state.curWeapon = 'magnum';
        state.ammo.ammo_magnum += 8;
        showToast('🔓【保險箱開啟：2142】獲得終極武器【脈衝麥格農 .44】！');
      }
      openModal('NONE');
      rebuildRoom3D();
    } else if (state.keypadInput.length === 4) {
      audio.play('locked');
      state.keypadInput = '';
      showToast('密碼錯誤！請檢查收集到的文獻筆記。');
      openModal('KEYPAD');
    }
  }
}

function pressOrgan(note) {
  audio.play(`note_${note}`);
  state.organSeq.push(note);
  if (state.organSeq.length > 4) state.organSeq = state.organSeq.slice(-4);
  if (state.organSeq.join('') === 'CEGB') {
    state.solvedPuzzles.add('organ_solved');
    state.keyItems.add('silver_key');
    state.keyNames.silver_key = '【鑰匙】白銀星光徽章';
    audio.play('unlock');
    openModal('NONE');
    showToast('🎵【深海搖籃曲共鳴成功！】機械海豚張開巨顎，獲得【白銀星光徽章】（可開啟中央廣場東門）！', 6000);
    rebuildRoom3D();
  } else {
    openModal('ORGAN');
  }
}

function saveGameLocal() {
  state.savesCount++;
  try {
    localStorage.setItem('neon_ark_1994_save', JSON.stringify({
      roomId: state.roomId, px: state.px, pz: state.pz, hp: state.hp,
      weapons: state.weapons, curWeapon: state.curWeapon, ammo: state.ammo,
      medkits: state.medkits, keyItems: [...state.keyItems], keyNames: state.keyNames,
      notesRead: state.notesRead, secretsFound: [...state.secretsFound], solvedPuzzles: [...state.solvedPuzzles],
    }));
    audio.play('oracle');
    showToast(`💾【存檔成功】進度已寫入瀏覽器磁帶終端機 (第 ${state.savesCount} 次存檔)。`);
  } catch (e) {
    showToast('存檔完成。');
  }
}

// ============================================================================
// INPUT BINDINGS (KEYBOARD, MOUSE & TOUCH)
// ============================================================================
const keys = {};
let mouseButtons = { left: false, right: false };
let touchAim = false;

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'F1') { e.preventDefault(); toggleCRT(); }
  else if (e.code === 'F2') { e.preventDefault(); toggleCtrlMode(); }
  else if (e.code === 'F3') { e.preventDefault(); toggleExploreMode(); }

  if (state.modal !== 'NONE') {
    if (e.code === 'Escape' && state.modal !== 'TITLE' && state.modal !== 'VICTORY' && state.modal !== 'GAMEOVER') {
      openModal('NONE');
    } else if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') && ['NOTE', 'ORACLE', 'DIALOGUE'].includes(state.modal)) {
      openModal('NONE');
    } else if (state.modal === 'KEYPAD' && e.key >= '0' && e.key <= '9') {
      pressKeypad(e.key);
    } else if (state.modal === 'ORGAN') {
      if (e.code === 'Digit1' || e.code === 'KeyC') pressOrgan('C');
      if (e.code === 'Digit2' || e.code === 'KeyE') pressOrgan('E');
      if (e.code === 'Digit3' || e.code === 'KeyG') pressOrgan('G');
      if (e.code === 'Digit4' || e.code === 'KeyB') pressOrgan('B');
    }
    return;
  }

  if (e.code === 'Tab' || e.code === 'KeyM') { e.preventDefault(); audio.play('beep'); openModal('MAP'); }
  else if (e.code === 'KeyI') { e.preventDefault(); audio.play('beep'); openModal('INV'); }
  else if (e.code === 'KeyE' || e.code === 'KeyF') { triggerInteract(); }
  else if (e.code === 'KeyH') { useMedkit(); }
  else if (e.code === 'Digit1' && state.weapons.includes('pistol')) { state.curWeapon = 'pistol'; updateHUD(); }
  else if (e.code === 'Digit2' && state.weapons.includes('shotgun')) { state.curWeapon = 'shotgun'; updateHUD(); }
  else if (e.code === 'Digit3' && state.weapons.includes('flamer')) { state.curWeapon = 'flamer'; updateHUD(); }
  else if (e.code === 'Digit4' && state.weapons.includes('magnum')) { state.curWeapon = 'magnum'; updateHUD(); }
  else if (e.code === 'Enter' && state.isAiming) { fireWeapon(); }
});

window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('mousemove', e => {
  mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
canvas.addEventListener('mousedown', e => {
  audio.init();
  if (e.button === 2) mouseButtons.right = true;
  if (e.button === 0) {
    mouseButtons.left = true;
    if (state.isAiming) fireWeapon();
  }
});
window.addEventListener('mouseup', e => {
  if (e.button === 2) mouseButtons.right = false;
  if (e.button === 0) mouseButtons.left = false;
});

function toggleCRT() {
  state.ps1Crt = !state.ps1Crt;
  document.getElementById('crtOverlay').classList.toggle('off', !state.ps1Crt);
  document.getElementById('btnCrt').classList.toggle('active', state.ps1Crt);
  showToast(`PS1 CRT 掃描線濾鏡：${state.ps1Crt ? '開啟' : '關閉'}`);
}
function toggleCtrlMode() {
  state.tankControls = !state.tankControls;
  const btn = document.getElementById('btnCtrl');
  btn.textContent = state.tankControls ? '🎮 坦克操作' : '🎮 現代360°';
  btn.classList.toggle('active', state.tankControls);
  showToast(`操作模式已切換為：${state.tankControls ? '經典坦克式操作' : '現代 360° 鏡頭相對操作'}`);
}
function toggleExploreMode() {
  state.explorationMode = !state.explorationMode;
  const btn = document.getElementById('btnMode');
  btn.textContent = state.explorationMode ? '🕊️ 探索無敵' : '💀 生存恐怖';
  btn.classList.toggle('active', state.explorationMode);
  showToast(`難度切換：${state.explorationMode ? '探索模式 (敵人不會攻擊)' : '生存恐怖模式'}`);
}

document.getElementById('btnMap').onclick = () => { audio.play('beep'); openModal(state.modal === 'MAP' ? 'NONE' : 'MAP'); };
document.getElementById('btnInv').onclick = () => { audio.play('beep'); openModal(state.modal === 'INV' ? 'NONE' : 'INV'); };
document.getElementById('btnCrt').onclick = toggleCRT;
document.getElementById('btnCtrl').onclick = toggleCtrlMode;
document.getElementById('btnMode').onclick = toggleExploreMode;
document.getElementById('btnRotL').onclick = () => { state.camTargetYaw = (state.camTargetYaw - 45 + 360) % 360; };
document.getElementById('btnRotR').onclick = () => { state.camTargetYaw = (state.camTargetYaw + 45) % 360; };
document.getElementById('promptBanner').onclick = triggerInteract;

// Touch buttons
const tAim = document.getElementById('tAim');
tAim.addEventListener('touchstart', e => { e.preventDefault(); touchAim = !touchAim; tAim.classList.toggle('fire', touchAim); });
tAim.onclick = () => { touchAim = !touchAim; tAim.classList.toggle('fire', touchAim); };
document.getElementById('tFire').onclick = () => { state.isAiming = true; fireWeapon(); };
document.getElementById('tAct').onclick = triggerInteract;
document.getElementById('tHeal').onclick = useMedkit;

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ============================================================================
// MAIN GAME LOOP
// ============================================================================
function collides(x, z, r = 0.55) {
  const rm = state.rooms[state.roomId];
  const hw = rm.w / 2 - 0.8, hd = rm.d / 2 - 0.8;
  if (x < -hw || x > hw || z < -hd || z > hd) return true;
  for (const p of rm.props) {
    if (Math.hypot(x - p.x, z - p.z) < r + p.r * 0.7) return true;
  }
  return false;
}

let lastTime = performance.now();
rebuildRoom3D();
openModal('TITLE');

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  const tSec = now * 0.001;

  drawECG(tSec);

  if (state.modal === 'TITLE') {
    state.camTargetYaw = (state.camTargetYaw + 12 * dt) % 360;
    state.camYaw = state.camTargetYaw;
  } else if (state.modal === 'NONE') {
    state.playTime += dt;
    if (state.invuln > 0) state.invuln = Math.max(0, state.invuln - dt);
    if (state.fireCd > 0) state.fireCd = Math.max(0, state.fireCd - dt);

    // Camera orbit [Q / C]
    if (keys['KeyQ']) state.camTargetYaw = (state.camTargetYaw - 90 * dt + 360) % 360;
    if (keys['KeyC']) state.camTargetYaw = (state.camTargetYaw + 90 * dt) % 360;
    const cDiff = ((state.camTargetYaw - state.camYaw + 540) % 360) - 180;
    state.camYaw = (state.camYaw + cDiff * Math.min(1, dt * 10) + 360) % 360;

    // Movement input
    let ix = 0, iy = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) ix -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) ix += 1;
    if (keys['KeyW'] || keys['ArrowUp']) iy += 1;
    if (keys['KeyS'] || keys['ArrowDown']) iy -= 1;

    state.isAiming = mouseButtons.right || keys['Space'] || keys['ShiftLeft'] || keys['ShiftRight'] || touchAim;

    if (state.isAiming) {
      const rate = state.hasLaserUpgrade ? 1.8 : 1.2;
      state.aimFocus = Math.min(1, state.aimFocus + dt * rate);

      // Raycast mouse to Y=1.0 plane
      raycaster.setFromCamera(mouseNDC, camera);
      const hitPt = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(aimPlane, hitPt)) {
        const dx = hitPt.x - state.px, dz = hitPt.z - state.pz;
        if (Math.hypot(dx, dz) > 0.1) {
          state.pYaw = Math.atan2(dx, dz);
        }
      }
      if (Math.abs(ix) > 0.05) state.pYaw -= ix * 2.2 * dt;
      if (mouseButtons.left && state.curWeapon === 'flamer') fireWeapon();
    } else {
      state.aimFocus = Math.max(0, state.aimFocus - dt * 3);
      const speed = 5.5;
      let vx = 0, vz = 0;
      if (state.tankControls) {
        if (Math.abs(ix) > 0.05) state.pYaw -= ix * 2.5 * dt;
        if (Math.abs(iy) > 0.05) {
          const mult = iy > 0 ? 1 : -0.65;
          vx = Math.sin(state.pYaw) * speed * mult;
          vz = Math.cos(state.pYaw) * speed * mult;
        }
      } else if (Math.abs(ix) > 0.05 || Math.abs(iy) > 0.05) {
        const cRad = THREE.MathUtils.degToRad(state.camYaw);
        const fx = -Math.sin(cRad), fz = -Math.cos(cRad);
        const rx = Math.cos(cRad), rz = -Math.sin(cRad);
        let dx = fx * iy + rx * ix, dz = fz * iy + rz * ix;
        const mag = Math.hypot(dx, dz);
        if (mag > 0.001) {
          dx /= mag; dz /= mag;
          vx = dx * speed; vz = dz * speed;
          state.pYaw = Math.atan2(dx, dz);
        }
      }
      if (Math.abs(vx) > 0.01 || Math.abs(vz) > 0.01) {
        state.walkAnim += dt * 10;
        const nx = state.px + vx * dt, nz = state.pz + vz * dt;
        if (!collides(nx, state.pz)) state.px = nx;
        if (!collides(state.px, nz)) state.pz = nz;
      }
    }

    // Focus Bar UI
    const fFill = document.getElementById('focusFill');
    fFill.style.width = `${state.aimFocus * 100}%`;
    fFill.style.background = state.aimFocus >= 0.82 ? '#f43f5e' : '#38bdf8';

    // Update Enemies & Electric Puddles
    const rm = state.rooms[state.roomId];
    for (const hz of rm.hazards) {
      if (hz.active && hz.kind === 'electric_puddle') {
        if (Math.hypot(state.px - hz.x, state.pz - hz.z) < hz.r && state.invuln <= 0 && !state.explorationMode) {
          state.hp = Math.max(0, state.hp - 10);
          state.damageTaken += 10;
          state.invuln = 1.0;
          audio.play('hurt');
          updateHUD();
          if (state.hp <= 0) openModal('GAMEOVER');
        }
      }
    }

    if (!state.explorationMode) {
      for (const em of enemyMeshes) {
        const en = em.def;
        if (!en.alive) continue;
        const dx = state.px - en.x, dz = state.pz - en.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.95) {
          const nx = en.x + (dx / dist) * en.speed * dt;
          const nz = en.z + (dz / dist) * en.speed * dt;
          if (!collides(nx, en.z, 0.5)) en.x = nx;
          if (!collides(en.x, nz, 0.5)) en.z = nz;
        } else if (state.invuln <= 0) {
          state.hp = Math.max(0, state.hp - en.dmg);
          state.damageTaken += en.dmg;
          state.invuln = 1.15;
          audio.play('hurt');
          updateHUD();
          if (state.hp <= 0) openModal('GAMEOVER');
        }
        em.group.position.set(en.x, 0, en.z);
        em.group.rotation.y = Math.atan2(dx, dz);
        em.coral.rotation.y += dt * 3;
      }
    }

    // Prompt Banner
    const prompt = getNearestInteractable();
    const pBanner = document.getElementById('promptBanner');
    if (prompt) {
      pBanner.textContent = prompt.label;
      pBanner.classList.add('on');
    } else {
      pBanner.classList.remove('on');
    }
  }

  // Update Player Mesh & Laser Sight
  playerMesh.position.set(state.px, 0, state.pz);
  playerMesh.rotation.y = state.pYaw;

  if (state.isAiming && state.modal === 'NONE') {
    const spec = WEAPON_SPECS[state.curWeapon];
    laserMat.color.setHex(spec.laserColor);
    const sx = state.px + Math.sin(state.pYaw) * 0.45;
    const sz = state.pz + Math.cos(state.pYaw) * 0.45;
    const ex = state.px + Math.sin(state.pYaw) * spec.range;
    const ez = state.pz + Math.cos(state.pYaw) * spec.range;
    laserGeo.setFromPoints([new THREE.Vector3(sx, 0.95, sz), new THREE.Vector3(ex, 0.95, ez)]);
    laserLine.visible = true;
    laserDot.position.set(ex, 0.95, ez);
    laserDot.rotation.y += dt * 6;
    laserDot.visible = true;
  } else {
    laserLine.visible = false;
    laserDot.visible = false;
  }

  // Animate Pickups & Props
  for (const pm of pickupMeshes) {
    pm.mesh.rotation.y += dt * 2.5;
    pm.mesh.position.y = 0.42 + Math.sin(tSec * 4 + pm.def.x) * 0.1;
  }
  for (const pr of propMeshes) {
    if (pr.def._spinMesh) pr.def._spinMesh.rotation.y += dt * 1.8;
  }
  for (const nm of npcMeshes) {
    nm.mark.rotation.y += dt * 2.5;
  }

  // Update Rotatable Isometric Diorama Camera & Smart Cutaway Walls
  const camDist = state.isAiming ? 14.5 : 17.5;
  const pitchRad = THREE.MathUtils.degToRad(36);
  const yawRad = THREE.MathUtils.degToRad(state.camYaw);
  const horiz = camDist * Math.cos(pitchRad);
  camera.position.set(
    state.px + horiz * Math.sin(yawRad),
    1.2 + camDist * Math.sin(pitchRad),
    state.pz + horiz * Math.cos(yawRad)
  );
  camera.lookAt(state.px, 1.0, state.pz);

  // Lower walls facing camera so view is never obstructed
  const cdx = Math.sin(yawRad), cdz = Math.cos(yawRad);
  if (frontWalls.north) { frontWalls.north.scale.y = cdz < -0.25 ? 0.22 : 1; frontWalls.north.position.y = cdz < -0.25 ? 0.35 : 1.6; }
  if (frontWalls.south) { frontWalls.south.scale.y = cdz > 0.25 ? 0.22 : 1; frontWalls.south.position.y = cdz > 0.25 ? 0.35 : 1.6; }
  if (frontWalls.west) { frontWalls.west.scale.y = cdx < -0.25 ? 0.22 : 1; frontWalls.west.position.y = cdx < -0.25 ? 0.35 : 1.6; }
  if (frontWalls.east) { frontWalls.east.scale.y = cdx > 0.25 ? 0.22 : 1; frontWalls.east.position.y = cdx > 0.25 ? 0.35 : 1.6; }

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
