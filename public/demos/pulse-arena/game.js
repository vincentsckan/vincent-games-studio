/**
 * Pulse Arena · 脈衝槍戰
 * Original low-poly FPS demo for Vincent Games Studio.
 * Veck.io–inspired arcade feel; original IP (no asset copies).
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

const MATCH_SECONDS = 180;
const BOT_COUNT = 4;
const GRAVITY = 28;
const PLAYER_RADIUS = 0.42;
const PLAYER_HEIGHT = 1.65;
const CROUCH_HEIGHT = 1.05;
const SLIDE_BOOST = 1.55;
const SLIDE_DURATION = 0.55;
const MOVE_SPEED = 9.2;
const JUMP_V = 9.8;
const WIN_KILLS = 15;

const WEAPONS = [
  { id: 'ar', nameZh: '脈衝步槍', nameEn: 'Pulse Rifle', damage: 22, firerate: 9.5, spread: 0.028, mag: 30, reserve: 90, reload: 1.45, pellets: 1, adsSpread: 0.01, adsFov: 58 },
  { id: 'pistol', nameZh: '脈衝手槍', nameEn: 'Pulse Pistol', damage: 34, firerate: 3.6, spread: 0.018, mag: 12, reserve: 48, reload: 1.2, pellets: 1, adsSpread: 0.008, adsFov: 55 },
  { id: 'sniper', nameZh: '脈衝狙擊', nameEn: 'Pulse Sniper', damage: 92, firerate: 1.05, spread: 0.004, mag: 5, reserve: 25, reload: 2.1, pellets: 1, adsSpread: 0.0008, adsFov: 32 },
  { id: 'shotgun', nameZh: '方塊散彈', nameEn: 'Block Shotgun', damage: 16, firerate: 1.25, spread: 0.11, mag: 6, reserve: 24, reload: 2.2, pellets: 7, adsSpread: 0.07, adsFov: 60 },
  { id: 'knife', nameZh: '脈衝短刃', nameEn: 'Pulse Blade', damage: 55, firerate: 1 / 0.5, spread: 0, mag: 1, reserve: 99, reload: 0.05, pellets: 1, melee: true, range: 2.6, cone: 0.72, adsFov: 70 },
];

const BOT_NAMES = ['方塊A', '方塊B', '方塊C', '方塊D', '方塊E'];

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
  hp: 100, kills: 0, deaths: 0,
  weapon: 0,
  ammo: 30, reserve: 90,
  shootCd: 0, reloading: false, reloadT: 0,
  onGround: true, crouching: false, sliding: false, slideT: 0,
  ads: false, invuln: 0, timeLeft: MATCH_SECONDS,
  name: '你',
};

let scene, camera, renderer, clock;
let solidBoxes = [];
let bots = [];
let spawnPoints = [];
let bulletTraces = [];
let worldRoot = null;
let armsRoot = null;
let gunParts = null;
let muzzleFlash = null;
let raycaster = new THREE.Raycaster();
let tmpV = new THREE.Vector3();
let tmpV2 = new THREE.Vector3();

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

function syncHud() {
  document.getElementById('hp').textContent = String(Math.max(0, Math.ceil(state.hp)));
  document.getElementById('ammo').textContent = String(state.ammo);
  document.getElementById('reserve').textContent = String(state.reserve);
  document.getElementById('kills').textContent = String(state.kills);
  document.getElementById('deaths').textContent = String(state.deaths);
  document.getElementById('gunHud').textContent = WEAPONS[state.weapon].nameZh;
  const m = Math.floor(state.timeLeft / 60);
  const s = Math.floor(state.timeLeft % 60);
  document.getElementById('time').textContent = `${m}:${String(s).padStart(2, '0')}`;
  slideTag.classList.toggle('on', state.sliding);
  cross.classList.toggle('ads', state.ads);
}

function boxSolid(x, y, z, w, h, d) {
  return {
    minX: x - w / 2, maxX: x + w / 2,
    minY: y, maxY: y + h,
    minZ: z - d / 2, maxZ: z + d / 2,
  };
}

function addBox(group, x, y, z, w, h, d, color, solid = true) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  group.add(mesh);
  if (solid) solidBoxes.push(boxSolid(x, y, z, w, h, d));
  return mesh;
}

function makeGridFloor(size, divisions, colorA, colorB) {
  const canvas2 = document.createElement('canvas');
  canvas2.width = 256; canvas2.height = 256;
  const ctx = canvas2.getContext('2d');
  ctx.fillStyle = colorA;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = colorB;
  ctx.lineWidth = 2;
  const step = 256 / 8;
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(256, i * step); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas2);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(divisions, divisions);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshLambertMaterial({ map: tex }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  return mesh;
}

function buildArena() {
  if (worldRoot) scene.remove(worldRoot);
  solidBoxes = [];
  spawnPoints = [];
  worldRoot = new THREE.Group();
  scene.add(worldRoot);

  // bright sky-ish clear
  scene.background = new THREE.Color(0x6eb7ff);
  scene.fog = new THREE.Fog(0x9ecfff, 40, 90);

  const floor = makeGridFloor(56, 14, '#8a8e96', '#6e727a');
  worldRoot.add(floor);
  solidBoxes.push(boxSolid(0, -0.5, 0, 56, 0.5, 56));

  // outer walls (coral / cyan blocks)
  const wallH = 6;
  addBox(worldRoot, 0, 0, -27, 56, wallH, 1.2, 0x6a7078);
  addBox(worldRoot, 0, 0, 27, 56, wallH, 1.2, 0x6a7078);
  addBox(worldRoot, -27, 0, 0, 1.2, wallH, 56, 0x6a7078);
  addBox(worldRoot, 27, 0, 0, 1.2, wallH, 56, 0x6a7078);

  // central gray path
  addBox(worldRoot, 0, 0.02, 0, 6, 0.08, 40, 0x8a8a96, false);

  // cover blocks — bright arcade palette
  const covers = [
    [ -8, 0, -6, 5.2, 2.6, 2.4, 0xe23b3b ],
    [ 8, 0, -6, 5.2, 2.6, 2.4, 0x2f6fe0 ],
    [ -8, 0, 8, 5.2, 2.6, 2.4, 0xf0c42e ],
    [ 8, 0, 8, 5.2, 2.6, 2.4, 0xe23b3b ],
    [ 0, 0, -12, 5.2, 2.6, 2.4, 0xf0c42e ],
    [ 0, 0, 12, 5.2, 2.6, 2.4, 0x2f6fe0 ],
    [ -14, 0, 0, 2.4, 2.6, 5.2, 0xf0c42e ],
    [ 14, 0, 0, 2.4, 2.6, 5.2, 0xe23b3b ],
    [ -4, 0, 0, 2.2, 1.1, 2.2, 0xe07020 ],
    [ 4, 0, -2, 2.2, 1.1, 2.2, 0xe07020 ],
  ];
  for (const c of covers) addBox(worldRoot, c[0], c[1], c[2], c[3], c[4], c[5], c[6]);

  // ramps / wedges as stepped boxes
  for (let i = 0; i < 4; i++) {
    addBox(worldRoot, -18 + i * 0.9, i * 0.45, -18, 2.2, 0.45, 3.2, 0xff9ad4);
    addBox(worldRoot, 18 - i * 0.9, i * 0.45, 18, 2.2, 0.45, 3.2, 0x7ef0ff);
  }

  // raised platforms
  addBox(worldRoot, -18, 0, 12, 6, 2.4, 6, 0x4a90d9);
  addBox(worldRoot, 18, 0, -12, 6, 2.4, 6, 0xd94a90);

  // center pad (objective look)
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 0.18, 24),
    new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x2244aa, emissiveIntensity: 0.35 }),
  );
  pad.position.set(0, 0.12, 0);
  worldRoot.add(pad);

  // cargo-ish crates
  for (const [x, z, col] of [[-10, -14, 0xe23b3b], [10, 14, 0x2f6fe0], [-16, -8, 0xf0c42e], [16, 8, 0xe23b3b]]) {
    addBox(worldRoot, x, 0, z, 2.4, 2.4, 2.4, col);
  }

  spawnPoints = [
    { x: 0, z: 18 }, { x: 0, z: -18 }, { x: 18, z: 0 }, { x: -18, z: 0 },
    { x: 12, z: 12 }, { x: -12, z: -12 }, { x: 12, z: -12 }, { x: -12, z: 12 },
  ];

  // soft fill lights already on scene
}

function makeBotMesh(color) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.9, 0.45),
    new THREE.MeshLambertMaterial({ color }),
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
  return g;
}

function buildArms() {
  if (armsRoot) camera.remove(armsRoot);
  armsRoot = new THREE.Group();
  camera.add(armsRoot);

  // right arm blocky
  const skin = new THREE.MeshLambertMaterial({ color: 0xffd0a8 });
  const sleeve = new THREE.MeshLambertMaterial({ color: 0xe07020 }); // Multimedia fp-arms orange jacket vibe
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.55), sleeve);
  arm.position.set(0.28, -0.28, -0.45);
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.18), skin);
  hand.position.set(0.28, -0.32, -0.78);
  armsRoot.add(arm, hand);

  gunParts = new THREE.Group();
  armsRoot.add(gunParts);
  rebuildGunMesh();

  muzzleFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffee88 }),
  );
  muzzleFlash.position.set(0.22, -0.22, -1.15);
  muzzleFlash.visible = false;
  armsRoot.add(muzzleFlash);
}

function rebuildGunMesh() {
  while (gunParts.children.length) {
    const c = gunParts.children.pop();
    c.geometry?.dispose?.();
    c.material?.dispose?.();
  }
  const w = WEAPONS[state.weapon];
  const mat = new THREE.MeshLambertMaterial({ color: 0xb8c0cc });
  const dark = new THREE.MeshLambertMaterial({ color: 0x222830 });
  const accent = new THREE.MeshLambertMaterial({ color: 0xff6bcb });

  if (w.melee) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.28), dark);
    handle.position.set(0.22, -0.28, -0.85);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.42), accent);
    blade.position.set(0.22, -0.24, -1.15);
    gunParts.add(handle, blade);
    return;
  }

  const bodyLen = w.id === 'sniper' ? 0.95 : w.id === 'shotgun' ? 0.7 : w.id === 'pistol' ? 0.38 : 0.72;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, bodyLen), mat);
  body.position.set(0.22, -0.24, -0.75 - bodyLen * 0.15);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.12), dark);
  mag.position.set(0.22, -0.4, -0.72);
  gunParts.add(body, mag);
  if (w.id === 'sniper') {
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.28), dark);
    scope.position.set(0.22, -0.1, -0.9);
    gunParts.add(scope);
  }
  if (w.id === 'shotgun') {
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.22), dark);
    pump.position.set(0.22, -0.32, -1.0);
    gunParts.add(pump);
  }
}

function randomSpawn() {
  const sp = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
  return { x: sp.x + (Math.random() - 0.5) * 1.5, z: sp.z + (Math.random() - 0.5) * 1.5 };
}

function spawnBots() {
  for (const b of bots) {
    if (b.mesh) scene.remove(b.mesh);
  }
  bots = [];
  const colors = [0xff6b6b, 0x6bc5ff, 0x7dff9a, 0xffd36a, 0xc08cff];
  for (let i = 0; i < BOT_COUNT; i++) {
    const sp = randomSpawn();
    const mesh = makeBotMesh(colors[i % colors.length]);
    mesh.position.set(sp.x, 0, sp.z);
    scene.add(mesh);
    bots.push({
      id: i,
      name: BOT_NAMES[i] || `BOT${i + 1}`,
      x: sp.x, y: 1.65, z: sp.z,
      vx: 0, vz: 0, vy: 0,
      hp: 100, alive: true, kills: 0, deaths: 0,
      mesh, shootCd: 0.5 + Math.random(),
      aimYaw: Math.random() * Math.PI * 2,
      thinkT: 0, target: null, respawnT: 0,
      onGround: true,
    });
  }
}

function collideXZ(x, z, r = PLAYER_RADIUS) {
  for (const b of solidBoxes) {
    if (b.maxY < 0.4) continue; // skip floor
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    const dx = x - cx, dz = z - cz;
    const dist2 = dx * dx + dz * dz;
    if (dist2 < r * r) {
      const dist = Math.sqrt(dist2) || 0.0001;
      const push = (r - dist) / dist;
      x += dx * push;
      z += dz * push;
    }
  }
  x = Math.max(-25.5, Math.min(25.5, x));
  z = Math.max(-25.5, Math.min(25.5, z));
  return { x, z };
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
    if (state.slideT <= 0 || !crouchHeld || !state.onGround) state.sliding = false;
  }

  const wpn = WEAPONS[state.weapon];
  let targetSpeed = MOVE_SPEED * (state.ads ? 0.72 : 1) * (wpn.id === 'sniper' ? 0.88 : 1);
  if (state.crouching) targetSpeed *= 0.55;
  if (state.sliding) targetSpeed = MOVE_SPEED * SLIDE_BOOST;

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

  const moved = collideXZ(state.x + state.vx * dt, state.z + state.vz * dt);
  state.x = moved.x;
  state.z = moved.z;
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

function damageBot(bot, dmg, fromPlayer) {
  if (!bot.alive) return;
  bot.hp -= dmg;
  flashHit();
  if (bot.hp <= 0) {
    bot.alive = false;
    bot.deaths += 1;
    bot.respawnT = 2.4;
    bot.mesh.visible = false;
    if (fromPlayer) {
      state.kills += 1;
      feedKill(`你 擊殺了 ${bot.name}`);
      if (state.kills >= WIN_KILLS) endMatch(true);
    }
    syncHud();
  }
}

function damagePlayer(dmg, byName) {
  if (state.invuln > 0 || matchOver) return;
  state.hp -= dmg;
  flashDmg();
  syncHud();
  if (state.hp <= 0) {
    state.deaths += 1;
    state.hp = 100;
    const killer = bots.find((b) => b.name === byName);
    if (killer) killer.kills += 1;
    feedKill(`${byName || 'BOT'} 擊殺了 你`);
    respawnPlayer();
    syncHud();
  }
}

function respawnPlayer() {
  const sp = randomSpawn();
  state.x = sp.x; state.y = eyeHeight(); state.z = sp.z;
  state.vx = state.vz = state.vy = 0;
  state.hp = 100;
  state.invuln = 1.4;
  state.sliding = false;
  const w = WEAPONS[state.weapon];
  state.ammo = w.mag;
  state.reserve = w.reserve;
  state.reloading = false;
  syncHud();
}

function switchWeapon(idx) {
  if (idx < 0 || idx >= WEAPONS.length) return;
  state.weapon = idx;
  const w = WEAPONS[idx];
  state.ammo = w.melee ? 1 : w.mag;
  state.reserve = w.reserve;
  state.reloading = false;
  rebuildGunMesh();
  syncHud();
}

function startReload() {
  const w = WEAPONS[state.weapon];
  if (w.melee || state.reloading || state.ammo >= w.mag || state.reserve <= 0) return;
  state.reloading = true;
  state.reloadT = w.reload;
}

function tryShoot(dt) {
  const w = WEAPONS[state.weapon];
  state.shootCd = Math.max(0, state.shootCd - dt);
  if (state.reloading) {
    state.reloadT -= dt;
    if (state.reloadT <= 0) {
      if (w.melee) {
        state.ammo = 1;
      } else {
        const need = w.mag - state.ammo;
        const take = Math.min(need, state.reserve);
        state.ammo += take;
        state.reserve -= take;
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
  if (!w.melee && state.ammo <= 0) {
    startReload();
    return;
  }

  if (!w.melee) {
    state.ammo -= 1;
    syncHud();
  }
  state.shootCd = 1 / w.firerate;

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
    return;
  }

  for (let p = 0; p < w.pellets; p++) {
    const sx = dx + (Math.random() - 0.5) * spread * 2;
    const sy = dy + (Math.random() - 0.5) * spread * 2;
    const sz = dz + (Math.random() - 0.5) * spread * 2;
    const inv = 1 / (Math.hypot(sx, sy, sz) || 1);
    const rdx = sx * inv, rdy = sy * inv, rdz = sz * inv;

    let best = null;
    let bestDist = maxRange;
    for (const b of bots) {
      if (!b.alive) continue;
      // sphere hit approx at chest
      const cx = b.x - eye.x, cy = (b.y - 0.45) - eye.y, cz = b.z - eye.z;
      const a = rdx * rdx + rdy * rdy + rdz * rdz;
      const bb = 2 * (cx * rdx + cy * rdy + cz * rdz);
      // actually ray-sphere: origin eye, center bot
      const ocx = eye.x - b.x, ocy = eye.y - (b.y - 0.45), ocz = eye.z - b.z;
      const bdot = ocx * rdx + ocy * rdy + ocz * rdz;
      const c = ocx * ocx + ocy * ocy + ocz * ocz - 0.55 * 0.55;
      const disc = bdot * bdot - c;
      if (disc < 0) continue;
      const t = -bdot - Math.sqrt(disc);
      if (t > 0.05 && t < bestDist) {
        bestDist = t;
        best = b;
      }
    }
    const wallT = rayHitsWall(eye.x, eye.y, eye.z, rdx, rdy, rdz, bestDist);
    if (wallT !== null && wallT < bestDist) {
      bulletTraces.push({
        x0: eye.x, y0: eye.y, z0: eye.z,
        x1: eye.x + rdx * wallT, y1: eye.y + rdy * wallT, z1: eye.z + rdz * wallT,
        t: 0.08,
      });
      continue;
    }
    if (best) {
      damageBot(best, w.damage, true);
      bulletTraces.push({
        x0: eye.x, y0: eye.y, z0: eye.z,
        x1: best.x, y1: best.y - 0.4, z1: best.z,
        t: 0.06,
      });
    } else {
      bulletTraces.push({
        x0: eye.x, y0: eye.y, z0: eye.z,
        x1: eye.x + rdx * Math.min(40, maxRange), y1: eye.y + rdy * Math.min(40, maxRange), z1: eye.z + rdz * Math.min(40, maxRange),
        t: 0.05,
      });
    }
  }
}

function updateBots(dt) {
  for (const b of bots) {
    if (!b.alive) {
      b.respawnT -= dt;
      if (b.respawnT <= 0) {
        const sp = randomSpawn();
        b.x = sp.x; b.z = sp.z; b.y = 1.65;
        b.hp = 100; b.alive = true;
        b.mesh.visible = true;
        b.mesh.position.set(b.x, 0, b.z);
        b.shootCd = 0.8;
      }
      continue;
    }

    b.thinkT -= dt;
    if (b.thinkT <= 0) {
      b.thinkT = 0.35 + Math.random() * 0.55;
      // simple: chase player or wander
      const toPlayer = Math.hypot(state.x - b.x, state.z - b.z);
      if (toPlayer < 28 && Math.random() < 0.75) {
        b.target = 'player';
        b.aimYaw = Math.atan2(-(state.x - b.x), -(state.z - b.z));
      } else {
        b.target = null;
        b.aimYaw += (Math.random() - 0.5) * 1.4;
      }
    }

    const speed = 5.5 + Math.random() * 1.5;
    let wishX = -Math.sin(b.aimYaw);
    let wishZ = -Math.cos(b.aimYaw);
    if (b.target === 'player') {
      const dx = state.x - b.x, dz = state.z - b.z;
      const dist = Math.hypot(dx, dz) || 1;
      // strafe a bit
      wishX = dx / dist;
      wishZ = dz / dist;
      if (dist < 6) { wishX *= -0.4; wishZ *= -0.4; }
      b.aimYaw = Math.atan2(-dx, -dz);
    }
    b.vx = wishX * speed;
    b.vz = wishZ * speed;
    const moved = collideXZ(b.x + b.vx * dt, b.z + b.vz * dt, 0.4);
    b.x = moved.x; b.z = moved.z;
    b.mesh.position.set(b.x, 0, b.z);
    b.mesh.rotation.y = b.aimYaw;

    // shoot at player
    b.shootCd -= dt;
    const dist = Math.hypot(state.x - b.x, state.z - b.z);
    if (b.shootCd <= 0 && dist < 22 && dist > 1.2) {
      const dx = state.x - b.x, dy = state.y - b.y, dz = state.z - b.z;
      const inv = 1 / (Math.hypot(dx, dy, dz) || 1);
      const wall = rayHitsWall(b.x, b.y - 0.2, b.z, dx * inv, dy * inv, dz * inv, dist);
      if (!wall) {
        // accuracy falloff
        if (Math.random() < 0.45 / (1 + dist * 0.04)) {
          damagePlayer(12 + Math.random() * 10, b.name);
        }
        b.shootCd = 0.55 + Math.random() * 0.7;
      } else {
        b.shootCd = 0.25;
      }
    }
  }
}

function updateScoreboard() {
  const rows = [
    { name: state.name, kills: state.kills, deaths: state.deaths, you: true },
    ...bots.map((b) => ({ name: b.name, kills: b.kills, deaths: b.deaths, you: false })),
  ].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  sbBody.innerHTML = rows.map((r, i) =>
    `<tr class="${r.you ? 'you' : ''}"><td>${i + 1}</td><td>${r.name}</td><td>${r.kills}</td><td>${r.deaths}</td></tr>`
  ).join('');
}

function endMatch(won) {
  matchOver = true;
  running = false;
  document.exitPointerLock?.();
  hud.classList.remove('on');
  cross.classList.remove('on');
  overlay.classList.remove('hidden');
  showPanel('panelEnd');
  document.getElementById('endTitle').textContent = won ? '勝利！' : '時間到';
  document.getElementById('endSub').textContent = won ? `先達 ${WIN_KILLS} 殺` : 'FFA 結束';
  const stats = document.getElementById('endStats');
  stats.innerHTML = `
    <div><b>${state.kills}</b><span>擊殺</span></div>
    <div><b>${state.deaths}</b><span>死亡</span></div>
    <div><b>${bots.filter((b) => !b.alive).length}</b><span>倒地 BOT</span></div>`;
}

function startMatch() {
  matchOver = false;
  running = true;
  state.kills = 0; state.deaths = 0; state.hp = 100;
  state.weapon = 0; state.ammo = WEAPONS[0].mag; state.reserve = WEAPONS[0].reserve;
  state.reloading = false; state.sliding = false; state.ads = false;
  state.timeLeft = MATCH_SECONDS; state.invuln = 1.2;
  yaw = 0; pitch = 0;
  buildArena();
  buildArms();
  rebuildGunMesh();
  spawnBots();
  const sp = randomSpawn();
  state.x = sp.x; state.y = PLAYER_HEIGHT; state.z = sp.z;
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
  camera = new THREE.PerspectiveCamera(75, 2, 0.05, 120);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  clock = new THREE.Clock();

  const hemi = new THREE.HemisphereLight(0xffe8ff, 0x406040, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(12, 24, 8);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
  fill.position.set(-10, 8, -12);
  scene.add(fill);

  buildArena();
  buildArms();

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
  camera.position.set(state.x, state.y, state.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // bob arms slightly
  if (armsRoot) {
    const moving = Math.hypot(state.vx, state.vz) > 1 && state.onGround;
    const t = performance.now() * 0.01;
    armsRoot.position.y = moving ? Math.sin(t) * 0.012 : 0;
    armsRoot.position.x = state.ads ? -0.08 : 0;
    armsRoot.position.z = state.ads ? 0.08 : 0;
  }
}

function drawTraces(dt) {
  // lightweight: store as lines briefly via scene helpers
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
  const dt = Math.min(0.05, clock.getDelta());
  if (!running) {
    // idle orbit preview
    if (!matchOver && overlay && !overlay.classList.contains('hidden')) {
      const t = performance.now() * 0.00025;
      camera.position.set(Math.sin(t) * 28, 16, Math.cos(t) * 28);
      camera.lookAt(0, 1, 0);
    }
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
  tryShoot(dt);
  updateBots(dt);
  updateCamera(dt);
  drawTraces(dt);
  syncHud();
  if (scoreboard.classList.contains('on')) updateScoreboard();
  renderer.render(scene, camera);
}

// —— input ——
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Tab') {
    e.preventDefault();
    if (running) {
      scoreboard.classList.add('on');
      updateScoreboard();
    }
  }
  if (e.code === 'KeyR' && running) startReload();
  if (e.code === 'Digit1') switchWeapon(0);
  if (e.code === 'Digit2') switchWeapon(1);
  if (e.code === 'Digit3') switchWeapon(2);
  if (e.code === 'Digit4') switchWeapon(3);
  if (e.code === 'Digit5') switchWeapon(4);
  if (e.code === 'KeyE' && running && wantPointer && !pointerLocked) canvas.requestPointerLock?.();
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'Tab') scoreboard.classList.remove('on');
});
window.addEventListener('mousedown', (e) => {
  if (!running) return;
  if (!pointerLocked) {
    canvas.requestPointerLock?.();
    return;
  }
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
  switchWeapon((state.weapon + dir + WEAPONS.length) % WEAPONS.length);
}, { passive: false });

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
});

document.getElementById('btnStart').addEventListener('click', () => startMatch());
document.getElementById('btnAgain').addEventListener('click', () => startMatch());
document.getElementById('btnLobby').addEventListener('click', () => {
  showPanel('panelLobby');
});

// —— debug / smoke hooks ——
window.__dbg = () => ({
  running,
  matchOver,
  x: state.x, y: state.y, z: state.z,
  hp: state.hp, kills: state.kills, deaths: state.deaths,
  weapon: WEAPONS[state.weapon].id,
  weaponIndex: state.weapon,
  ammo: state.ammo, reserve: state.reserve,
  sliding: state.sliding, onGround: state.onGround, ads: state.ads,
  botsAlive: bots.filter((b) => b.alive).length,
  botCount: bots.length,
  timeLeft: state.timeLeft,
  pointerLocked,
});
window.__setKey = (code, down) => { keys[code] = !!down; };
window.__setMouse = (btn, down) => {
  if (btn === 0) keys.Mouse0 = !!down;
  if (btn === 2) keys.Mouse2 = !!down;
};
window.__forceLook = (y, p) => { yaw = y; pitch = p ?? pitch; };
window.__switchWeapon = (i) => switchWeapon(i);
window.__startMatch = () => startMatch();
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
  // Ensure grounded, accelerate, then slide with Shift
  state.vy = 0;
  state.onGround = true;
  state.y = eyeHeight();
  state.sliding = false;
  keys.Space = false;
  keys.KeyW = true;
  keys.ShiftLeft = false;
  return new Promise((resolve) => {
    setTimeout(() => {
      keys.ShiftLeft = true;
      keys.KeyC = true;
      setTimeout(() => {
        const ok = state.sliding === true;
        const speed = Math.hypot(state.vx, state.vz);
        keys.KeyW = false;
        keys.ShiftLeft = false;
        keys.KeyC = false;
        resolve({ ok, sliding: state.sliding, speed, onGround: state.onGround });
      }, 180);
    }, 500);
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
  // face bot
  yaw = Math.atan2(-(best.x - state.x), -(best.z - state.z));
  pitch = 0;
  const before = state.kills;
  damageBot(best, 999, true);
  return { ok: state.kills > before, kills: state.kills, bot: best.name };
};
window.__teleport = (x, z) => { state.x = x; state.z = z; state.y = eyeHeight(); };

initThree();
frame();
