import * as THREE from "three";

const INNER_X = 8.7;
const INNER_Z = 5.55;
const CORNER = 1.45;

export const PLAYER_RADIUS = 0.34;

export function insideWalkable(x, z, pad = 0) {
  const hx = INNER_X - pad;
  const hz = INNER_Z - pad;
  const r = Math.max(0.2, CORNER - pad * 0.3);
  const ax = Math.abs(x);
  const az = Math.abs(z);
  if (ax > hx || az > hz) return false;
  if (ax <= hx - r || az <= hz - r) return true;
  const dx = ax - (hx - r);
  const dz = az - (hz - r);
  return dx * dx + dz * dz <= r * r;
}

function roundedRect(hx, hz, radius) {
  const shape = new THREE.Shape();
  const r = Math.min(radius, hx, hz);
  shape.moveTo(-hx + r, -hz);
  shape.lineTo(hx - r, -hz);
  shape.absarc(hx - r, -hz + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hx, hz - r);
  shape.absarc(hx - r, hz - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hx + r, hz);
  shape.absarc(-hx + r, hz - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hx, -hz + r);
  shape.absarc(-hx + r, -hz + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

function extrude(shape, depth) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function crystalMesh(material) {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.12, 0.08),
    new THREE.Vector2(0.46, 0.62),
    new THREE.Vector2(0.3, 1.35),
    new THREE.Vector2(0.1, 1.95),
    new THREE.Vector2(0.0, 2.35),
  ];
  const geo = new THREE.LatheGeometry(points, 6);
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function starShape(outer, inner) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 8; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const ang = -Math.PI / 2 + (i * Math.PI) / 4;
    const x = Math.cos(ang) * radius;
    const y = Math.sin(ang) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function buildArena() {
  const group = new THREE.Group();
  group.name = "arena";
  const circles = [];
  const boxes = [];

  const stone = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.08,
    vertexColors: true,
  });
  const stoneDark = new THREE.MeshStandardMaterial({
    color: 0x12141c,
    roughness: 0.96,
    metalness: 0.04,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x2a2e3a,
    roughness: 0.42,
    metalness: 0.78,
  });
  const cyanMat = new THREE.MeshStandardMaterial({
    color: 0x12343c,
    emissive: 0x39e7ff,
    emissiveIntensity: 2.4,
    roughness: 0.28,
    metalness: 0.2,
  });
  const magentaMat = new THREE.MeshStandardMaterial({
    color: 0x3a1230,
    emissive: 0xff3d92,
    emissiveIntensity: 2.4,
    roughness: 0.28,
    metalness: 0.2,
  });

  const slab = new THREE.Mesh(extrude(roundedRect(10.15, 6.85, 1.85), 1.15), stoneDark);
  slab.position.y = -1.15;
  slab.receiveShadow = true;
  slab.castShadow = true;
  group.add(slab);

  const wallShape = roundedRect(9.85, 6.55, 1.7);
  wallShape.holes.push(roundedRect(INNER_X, INNER_Z, CORNER));
  const wall = new THREE.Mesh(extrude(wallShape, 1.18), metal);
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  const tileGeo = new THREE.BoxGeometry(0.86, 0.08, 0.86);
  const positions = [];
  for (let x = -8; x <= 8; x += 1) {
    for (let z = -5; z <= 5; z += 1) {
      if (insideWalkable(x, z, 0.15)) positions.push([x, z]);
    }
  }
  const tiles = new THREE.InstancedMesh(tileGeo, stone, positions.length);
  const dummy = new THREE.Object3D();
  positions.forEach(([x, z], index) => {
    dummy.position.set(x, 0.04, z);
    dummy.rotation.y = ((x * 3 + z * 5) % 3) * 0.015;
    dummy.updateMatrix();
    tiles.setMatrixAt(index, dummy.matrix);
    const shade = 0.72 + ((x * 7 + z * 13) % 5) * 0.04;
    tiles.setColorAt(index, new THREE.Color(shade * 0.16, shade * 0.17, shade * 0.22));
  });
  tiles.instanceColor.needsUpdate = true;
  tiles.receiveShadow = true;
  tiles.castShadow = false;
  group.add(tiles);

  function neonRun(sign) {
    const mat = sign < 0 ? cyanMat : magentaMat;
    const samples = 28;
    for (let i = 0; i < samples; i += 1) {
      const t = (i + 0.5) / samples;
      const ang = sign < 0 ? Math.PI / 2 + t * Math.PI : -Math.PI / 2 + t * Math.PI;
      const x = Math.cos(ang) * (INNER_X - 0.08);
      const z = Math.sin(ang) * (INNER_Z - 0.08);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.045, 0.07), mat);
      strip.position.set(x, 0.12, z);
      strip.lookAt(0, 0.12, 0);
      group.add(strip);
    }
  }
  neonRun(-1);
  neonRun(1);

  function pedestal(x, material, lightColor) {
    const base = new THREE.Group();
    const step = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.08, 0.28, 8), metal);
    step.position.y = 0.16;
    step.castShadow = true;
    step.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.035, 8, 24), material);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.32;
    const crystal = crystalMesh(material);
    crystal.position.y = 0.32;
    base.add(step, ring, crystal);
    base.position.set(x, 0, 0);
    group.add(base);
    const light = new THREE.PointLight(lightColor, 8, 9, 1.6);
    light.position.set(x, 1.8, 0);
    group.add(light);
    circles.push({ x, z: 0, r: 1.05 });
  }
  pedestal(-8.15, cyanMat, 0x39e7ff);
  pedestal(8.15, magentaMat, 0xff3d92);

  const pillarSpots = [
    [-3.85, 2.35, -1],
    [-3.85, -2.35, -1],
    [3.85, 2.35, 1],
    [3.85, -2.35, 1],
  ];
  for (const [x, z, side] of pillarSpots) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.62, 6), metal);
    pillar.position.set(x, 0.81, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    const gemMat = side < 0 ? cyanMat : magentaMat;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), gemMat);
    gem.scale.set(1, 1.35, 0.28);
    gem.position.set(x, 1.05, z + Math.sign(-z || 1) * 0.28);
    gem.lookAt(0, 1.05, 0);
    group.add(pillar, gem);
    circles.push({ x, z, r: 0.48 });
  }

  const covers = [
    [-6.35, 3.15, 0],
    [-6.35, -3.15, Math.PI],
    [6.35, 3.15, 0],
    [6.35, -3.15, Math.PI],
  ];
  for (const [x, z, rot] of covers) {
    const piece = new THREE.Group();
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.72, 0.36), metal);
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.72, 0.95), metal);
    a.position.set(0.2, 0.36, 0);
    b.position.set(-0.42, 0.36, 0.28);
    a.castShadow = b.castShadow = true;
    a.receiveShadow = b.receiveShadow = true;
    const slitMat = x < 0 ? cyanMat : magentaMat;
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.035, 0.04), slitMat);
    slit.position.set(0.2, 0.55, -0.16);
    piece.add(a, b, slit);
    piece.position.set(x, 0, z);
    piece.rotation.y = rot + (x < 0 ? 0 : Math.PI);
    group.add(piece);
    boxes.push({
      minX: x - 0.85,
      maxX: x + 0.85,
      minZ: z - 0.7,
      maxZ: z + 0.7,
    });
  }

  const rune = new THREE.Group();
  const runeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    uniforms: {},
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      void main() {
        vec3 cyan = vec3(0.25, 0.90, 1.0);
        vec3 magenta = vec3(1.0, 0.28, 0.62);
        float side = smoothstep(-0.08, 0.08, vPos.x);
        vec3 color = mix(cyan, magenta, side);
        gl_FragColor = vec4(color, 0.95);
      }
    `,
  });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.025, 8, 48, Math.PI), runeMat);
  const ringB = ringA.clone();
  ringB.rotation.z = Math.PI;
  const ringInner = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.015, 8, 40), runeMat);
  const star = new THREE.Mesh(new THREE.ShapeGeometry(starShape(0.42, 0.16)), runeMat);
  for (const mesh of [ringA, ringB, ringInner, star]) {
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.095;
    rune.add(mesh);
  }
  group.add(rune);

  const gate = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.28), metal);
  frame.position.set(0, 0.7, 6.35);
  const chevL = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 3), cyanMat);
  chevL.rotation.z = Math.PI / 2;
  chevL.position.set(-0.35, 0.72, 6.18);
  const chevR = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 3), magentaMat);
  chevR.rotation.z = -Math.PI / 2;
  chevR.position.set(0.35, 0.72, 6.18);
  gate.add(frame, chevL, chevR);
  group.add(gate);

  const dustGeo = new THREE.BufferGeometry();
  const dustCount = 180;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPos[i * 3] = (Math.random() - 0.5) * 22;
    dustPos[i * 3 + 1] = 0.4 + Math.random() * 3.2;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0x8899cc, size: 0.035, transparent: true, opacity: 0.45 }),
  );
  group.add(dust);

  return {
    group,
    circles,
    boxes,
    dust,
    spawn: new THREE.Vector3(0, 0, 1.35),
  };
}

export function blocked(x, z, circles, boxes) {
  if (!insideWalkable(x, z, PLAYER_RADIUS)) return true;
  for (const circle of circles) {
    const dx = x - circle.x;
    const dz = z - circle.z;
    const reach = circle.r + PLAYER_RADIUS * 0.85;
    if (dx * dx + dz * dz < reach * reach) return true;
  }
  for (const box of boxes) {
    if (
      x > box.minX - PLAYER_RADIUS &&
      x < box.maxX + PLAYER_RADIUS &&
      z > box.minZ - PLAYER_RADIUS &&
      z < box.maxZ + PLAYER_RADIUS
    ) {
      return true;
    }
  }
  return false;
}
