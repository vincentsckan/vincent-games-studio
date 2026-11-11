import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { PLAYER_RADIUS, blocked, buildArena } from "./arena.js";

const TITLE = "裂空擂台";
if (TITLE.codePointAt(2) !== 0x64c2) {
  throw new Error("title glyph drifted");
}

const HEROES = [
  { id: "pofeng", name: "破鋒" },
  { id: "xianming", name: "弦鳴" },
  { id: "dingchao", name: "定潮" },
];
const SIDES = ["p1", "p2"];
const ANGLE_LABEL = {
  front: "正前",
  back: "正後",
  left: "左側",
  right: "右側",
  threeq: "四分之三側",
};

const params = new URLSearchParams(location.search);
const shotHero = params.get("shot");
const shotSide = params.get("side") || "p1";
const shotAngle = params.get("angle") || "front";
const shotMode = Boolean(shotHero);

const canvas = document.getElementById("view");
const who = document.getElementById("who");
const caption = document.getElementById("caption");
const errorBox = document.getElementById("error");
const panel = document.getElementById("panel");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, shotMode ? 1.5 : 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = shotMode ? 1.05 : 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07060f);
scene.fog = new THREE.FogExp2(0x07060f, 0.038);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.08, 80);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const hemi = new THREE.HemisphereLight(0x24304a, 0x100c10, 0.55);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff2e4, 1.65);
key.position.set(-4.5, 8.5, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.near = 1;
key.shadow.camera.far = 28;
key.shadow.camera.left = -12;
key.shadow.camera.right = 12;
key.shadow.camera.top = 12;
key.shadow.camera.bottom = -12;
key.shadow.bias = -0.0004;
scene.add(key);
const fill = new THREE.DirectionalLight(0xb9c6ff, 0.7);
fill.position.set(5, 3.2, 4);
scene.add(fill);

const arena = buildArena();
scene.add(arena.group);

const loader = new GLTFLoader();
const figurines = new Map();
let heroId = shotHero || "pofeng";
let side = shotMode ? shotSide : "p1";
let current = null;
const body = {
  x: arena.spawn.x,
  z: arena.spawn.z,
  yaw: 0,
};
let camYaw = Math.PI * 0.82;
let camPitch = 0.38;
let camDist = shotMode ? 3.15 : 5.4;

const keys = new Set();
const heroButtons = new Map();
const sideButtons = new Map();

function showError(message) {
  errorBox.style.display = "grid";
  errorBox.textContent = message;
}

function fitMaterials(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    for (const material of materials) {
      material.side = THREE.DoubleSide;
      if (material.color) material.color.setRGB(1.0, 1.0, 1.0);
      if ("roughness" in material) material.roughness = Math.max(material.roughness ?? 0.6, 0.48);
      if ("metalness" in material) material.metalness = Math.min(material.metalness ?? 0.05, 0.2);
      if ("envMapIntensity" in material) material.envMapIntensity = 0.55;
    }
  });
}

async function loadFigurines() {
  const jobs = [];
  for (const hero of HEROES) {
    for (const variant of SIDES) {
      const key = `${hero.id}-${variant}`;
      jobs.push(
        loader.loadAsync(`assets/models/${key}.glb`).then((gltf) => {
          fitMaterials(gltf.scene);
          gltf.scene.visible = false;
          gltf.scene.traverse((node) => {
            node.frustumCulled = false;
          });
          scene.add(gltf.scene);
          figurines.set(key, gltf.scene);
        }),
      );
    }
  }
  await Promise.all(jobs);
}

function select(nextHero, nextSide) {
  heroId = nextHero;
  side = nextSide;
  if (current) current.visible = false;
  current = figurines.get(`${heroId}-${side}`);
  if (!current) return;
  current.visible = true;
  const hero = HEROES.find((item) => item.id === heroId);
  const label = `${hero.name} · ${side.toUpperCase()}`;
  who.textContent = label;
  for (const [id, button] of heroButtons) button.setAttribute("aria-pressed", String(id === heroId));
  for (const [id, button] of sideButtons) button.setAttribute("aria-pressed", String(id === side));
  if (shotMode) {
    caption.hidden = false;
    caption.textContent = `${TITLE} · ${label} · ${ANGLE_LABEL[shotAngle] || shotAngle}`;
    panel.hidden = true;
  }
}

function buildUi() {
  const heroes = document.getElementById("heroes");
  const sides = document.getElementById("sides");
  for (const hero of HEROES) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = hero.name;
    button.addEventListener("click", () => select(hero.id, side));
    heroes.appendChild(button);
    heroButtons.set(hero.id, button);
  }
  for (const variant of SIDES) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = variant.toUpperCase();
    button.className = variant === "p2" ? "side-p2" : "side-p1";
    button.addEventListener("click", () => select(heroId, variant));
    sides.appendChild(button);
    sideButtons.set(variant, button);
  }
}

function tryMove(nx, nz) {
  if (!blocked(nx, nz, arena.circles, arena.boxes)) return [nx, nz];
  if (!blocked(nx, body.z, arena.circles, arena.boxes)) return [nx, body.z];
  if (!blocked(body.x, nz, arena.circles, arena.boxes)) return [body.x, nz];
  return [body.x, body.z];
}

function shortest(from, to) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return from + delta;
}

function applyShotCamera() {
  const table = {
    front: Math.PI,
    back: 0,
    left: -Math.PI / 2,
    right: Math.PI / 2,
    threeq: Math.PI * 0.78,
  };
  camYaw = table[shotAngle] ?? Math.PI;
  camPitch = shotAngle === "threeq" ? 0.34 : 0.22;
  camDist = 3.2;
  body.x = 0;
  body.z = 0;
  body.yaw = 0;
}

function updateCamera() {
  const lookY = 0.92;
  const horizontal = Math.cos(camPitch) * camDist;
  camera.position.set(
    body.x + Math.sin(camYaw) * horizontal,
    lookY + Math.sin(camPitch) * camDist,
    body.z + Math.cos(camYaw) * horizontal,
  );
  camera.lookAt(body.x, lookY, body.z);
}

function placeFigurine() {
  if (!current) return;
  current.position.set(body.x, 0, body.z);
  current.rotation.set(0, body.yaw, 0);
}

const clock = new THREE.Clock();
let readyFrames = 0;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!shotMode && current) {
    const forwardX = -Math.sin(camYaw);
    const forwardZ = -Math.cos(camYaw);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    let ix = 0;
    let iz = 0;
    if (keys.has("KeyW") || keys.has("ArrowUp")) {
      ix += forwardX;
      iz += forwardZ;
    }
    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      ix -= forwardX;
      iz -= forwardZ;
    }
    if (keys.has("KeyD") || keys.has("ArrowRight")) {
      ix += rightX;
      iz += rightZ;
    }
    if (keys.has("KeyA") || keys.has("ArrowLeft")) {
      ix -= rightX;
      iz -= rightZ;
    }
    const length = Math.hypot(ix, iz);
    if (length > 0.001) {
      const speed = (keys.has("ShiftLeft") || keys.has("ShiftRight") ? 5.4 : 3.35) * dt;
      const nx = body.x + (ix / length) * speed;
      const nz = body.z + (iz / length) * speed;
      [body.x, body.z] = tryMove(nx, nz);
      const facing = Math.atan2(ix, -iz);
      const delta = shortest(0, facing - body.yaw);
      body.yaw += delta * Math.min(1, dt * 10);
    }
  }
  if (shotMode) applyShotCamera();
  placeFigurine();
  updateCamera();
  arena.dust.rotation.y += dt * 0.02;
  renderer.render(scene, camera);
  if (shotMode && current) {
    readyFrames += 1;
    if (readyFrames === 3) window.__SHOT_READY = true;
  }
  requestAnimationFrame(frame);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Digit1") select("pofeng", side);
  if (event.code === "Digit2") select("xianming", side);
  if (event.code === "Digit3") select("dingchao", side);
  if (event.code === "KeyF") select(heroId, side === "p1" ? "p2" : "p1");
  if (event.code === "KeyR") {
    body.x = arena.spawn.x;
    body.z = arena.spawn.z;
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.code));

let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener("pointerdown", (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointerup", () => {
  dragging = false;
});
canvas.addEventListener("pointermove", (event) => {
  if (!dragging || shotMode) return;
  camYaw -= (event.clientX - lastX) * 0.005;
  camPitch = Math.max(0.18, Math.min(1.15, camPitch - (event.clientY - lastY) * 0.004));
  lastX = event.clientX;
  lastY = event.clientY;
});
canvas.addEventListener(
  "wheel",
  (event) => {
    if (shotMode) return;
    camDist = Math.max(2.4, Math.min(9, camDist + Math.sign(event.deltaY) * 0.35));
    event.preventDefault();
  },
  { passive: false },
);
canvas.addEventListener("contextmenu", (event) => event.preventDefault());

buildUi();
loadFigurines()
  .then(() => {
    select(heroId, side);
    if (shotMode) applyShotCamera();
    requestAnimationFrame(frame);
  })
  .catch((error) => {
    console.error(error);
    showError(`立體公仔未能載入。請在本機從樣本資料夾開啟。 ${error.message || ""}`);
  });

window.__arenaSample = {
  title: TITLE,
  playerRadius: PLAYER_RADIUS,
  select,
};
