import './styles.css';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { parseCSV } from './csv.js';
import { CARDS } from './content.js';
import { openModal, anyModalOpen } from './modals.js';
import savedCardTransforms from './card-transforms.json';

const DEG = Math.PI / 180;
const IDLE_MS = 5000; // resume auto-spin after this much inactivity

// ---------------------------------------------------------------- renderer
const host = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
const canvas = renderer.domElement;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.02, 100);
const BASE_DIST = 3.4;
camera.position.set(0, 0, BASE_DIST);

// Lighting — soft and neutral so the pink brain reads cleanly.
scene.add(new THREE.HemisphereLight(0xffffff, 0x8090a0, 0.95));
const key = new THREE.DirectionalLight(0xffffff, 1.5);
key.position.set(2.5, 3.5, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 20;
key.shadow.camera.left = key.shadow.camera.bottom = -1.8;
key.shadow.camera.right = key.shadow.camera.top = 1.8;
key.shadow.normalBias = 0.03;
key.shadow.radius = 4;
scene.add(key);
const fill = new THREE.DirectionalLight(0xdfe6ee, 0.45);
fill.position.set(-3, -1, -2);
scene.add(fill);
// Front fill for the earth (enabled only in the earth scene, off for the brain).
const earthFill = new THREE.DirectionalLight(0xffffff, 1.5);
earthFill.position.set(0, 0.6, 5);
earthFill.visible = false;
scene.add(earthFill);

// ------------------------------------------------------ rotation controller
// Turntable + tilt: drag X yaws about the object's vertical, drag Y pitches
// relative to the camera. Auto-spins when idle.
class Rotator {
  constructor(target, { autoSpin = 0.18, pitchLimit = 80 * DEG, base = new THREE.Euler() } = {}) {
    this.target = target;
    this.autoSpin = autoSpin;
    this.pitchLimit = pitchLimit;
    this.base = new THREE.Quaternion().setFromEuler(base);
    this.yaw = 0;
    this.pitch = 0;
    this.enabled = true;
    this.apply();
  }
  apply() {
    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    // yaw first (turntable), then pitch about camera-horizontal, then base tilt
    this.target.quaternion.copy(qx).multiply(qy).multiply(this.base);
  }
  drag(dx, dy) {
    this.yaw += dx * 0.005;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.005, -this.pitchLimit, this.pitchLimit);
    this.apply();
  }
  idleSpin(dt) {
    this.yaw += this.autoSpin * dt;
    this.apply();
  }
}

// ----------------------------------------------------------------- scenes
const brainGroup = new THREE.Group();
const earthGroup = new THREE.Group();
earthGroup.visible = false;
scene.add(brainGroup, earthGroup);

const cardMeshes = []; // clickable brain-scene cards
const pinMeshes = [];   // hoverable earth pins

let brainRot, earthRot;
let mode = 'brain';

// --- brain + cards ---
// Sample the actual (centered + normalized) brain geometry so cards can be
// planted right at the real surface instead of guessing a fixed radius.
function collectBrainVertices(obj, offset, scale) {
  const verts = [];
  const v = new THREE.Vector3();
  obj.traverse((c) => {
    if (!c.isMesh) return;
    const pos = c.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).add(offset).multiplyScalar(scale);
      verts.push(v.clone());
    }
  });
  return verts;
}

// Find the brain-surface point most aligned with direction `dir`, i.e. the
// outermost vertex within a cone around it — a cheap stand-in for a ray cast
// against the (fairly convex, lobed) brain mesh.
function surfacePointNear(vertices, dir, coneCos = 0.86) {
  let best = null;
  let bestDot = -Infinity;
  for (const v of vertices) {
    const d = v.dot(dir);
    if (d < 0) continue;
    const align = v.clone().normalize().dot(dir);
    if (align < coneCos) continue;
    if (d > bestDot) { bestDot = d; best = v; }
  }
  return best;
}

// Build a rotation whose local +Y axis (the "up"/head direction of the plane
// texture) points along `normal`, so a standing figure's feet land toward the
// brain center. X/Z are derived from a stable reference so the figure doesn't
// twist arbitrarily, then a small multi-axis jitter is layered on top.
function orientFeetToward(normal, jitter = 0) {
  const ref = Math.abs(normal.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(ref, normal).normalize();
  const z = new THREE.Vector3().crossVectors(x, normal).normalize();
  const m = new THREE.Matrix4().makeBasis(x, normal, z);
  const base = new THREE.Quaternion().setFromRotationMatrix(m);
  if (jitter > 0) {
    const wiggle = new THREE.Euler(
      (Math.random() * 2 - 1) * jitter,
      (Math.random() * 2 - 1) * jitter * 1.6,
      (Math.random() * 2 - 1) * jitter,
    );
    base.multiply(new THREE.Quaternion().setFromEuler(wiggle));
  }
  return base;
}

function buildCards(brainVerts, savedTransforms = {}) {
  const loader = new THREE.TextureLoader();
  // Cards are flat, double-sided, unlit planes planted right on the brain's
  // real surface (sampled from its geometry) and rotate WITH the brain — not
  // billboards. Feet point toward the brain by default; a saved transform
  // (from the placement editor, ?edit) overrides this entirely.
  const CARD_H = 0.62;
  const EMBED = CARD_H * 0.22; // how far the card sinks into the surface
  const geo = new THREE.PlaneGeometry(CARD_H, CARD_H);

  CARDS.forEach((card, i) => {
    const tex = loader.load(card.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      depthWrite: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const saved = savedTransforms[card.id];

    if (saved) {
      mesh.position.fromArray(saved.position);
      mesh.quaternion.fromArray(saved.quaternion);
    } else {
      const theta = (i / CARDS.length) * Math.PI * 2;
      const elevation = (Math.random() * 2 - 1) * 0.4;
      const dir = new THREE.Vector3(
        Math.cos(theta) * Math.cos(elevation),
        Math.sin(elevation),
        Math.sin(theta) * Math.cos(elevation),
      ).normalize();

      const surface = surfacePointNear(brainVerts, dir) ?? dir.clone();
      const normal = surface.clone().normalize();
      mesh.position.copy(surface).addScaledVector(normal, CARD_H / 2 - EMBED);
      mesh.quaternion.copy(orientFeetToward(normal, 0.35));
    }

    mesh.userData = { card, baseScale: 1 };
    brainGroup.add(mesh);
    cardMeshes.push(mesh);
  });
}

function buildBrain(obj, savedTransforms) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff4bab,
    emissive: 0xdb2f92,
    emissiveIntensity: 0.28,
    roughness: 0.5,
    metalness: 0.0,
  });
  obj.traverse((c) => {
    if (c.isMesh) {
      c.material = mat;
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });

  // center + normalize scale
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const offset = center.clone().negate();
  const radius = 0.5 * Math.max(size.x, size.y, size.z);
  const scale = 1 / radius;

  const brainVerts = collectBrainVertices(obj, offset, scale);

  obj.position.copy(offset);
  const wrap = new THREE.Group();
  wrap.add(obj);
  wrap.scale.setScalar(scale);
  brainGroup.add(wrap);

  buildCards(brainVerts, savedTransforms);

  brainRot = new Rotator(brainGroup, {
    autoSpin: 0.22,
    base: new THREE.Euler(0.15 + 25 * DEG, -0.4 + Math.PI, 0),
  });
}

// --- earth + photo pins ---
function buildEarth(texture, rows) {
  texture.colorSpace = THREE.SRGBColorSpace;
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 48),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 1.0, metalness: 0.0 }),
  );
  earthGroup.add(globe);

  const pinGeo = new THREE.SphereGeometry(0.014, 10, 10);
  const R = 1.008;
  rows.forEach((row) => {
    const lat = parseFloat(row.lat);
    const lon = parseFloat(row.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;
    const phi = (90 - lat) * DEG;
    const theta = (lon + 180) * DEG;
    const pos = new THREE.Vector3(
      -R * Math.sin(phi) * Math.cos(theta),
      R * Math.cos(phi),
      R * Math.sin(phi) * Math.sin(theta),
    );
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pin = new THREE.Mesh(pinGeo, mat);
    pin.position.copy(pos);
    pin.userData = { row, mat };
    earthGroup.add(pin);
    pinMeshes.push(pin);
  });

  earthRot = new Rotator(earthGroup, { autoSpin: 0.06, base: new THREE.Euler(0, 2.1, 0) });
}

// ----------------------------------------------------------------- input
const raycaster = new THREE.Raycaster();
raycaster.params.Points = { threshold: 0.02 };
const ptr = new THREE.Vector2();
let dragging = false;
let moved = false;
let downPos = null;
let lastInteraction = 0;
let editMode = false; // true while the ?edit card-placement tool owns the scene

function setPointer(e) {
  const r = canvas.getBoundingClientRect();
  ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
}

// --- zoom (dolly) ---
const ZOOM = {
  brain: { min: 1.9, max: 6.0, base: BASE_DIST },
  earth: { min: 1.05, max: 6.0, base: 3.0 },
};
let camDist = BASE_DIST;
function applyZoom() {
  camera.position.z = camDist;
  if (mode === 'earth') updatePinScale();
}
// Rotation slows as you zoom in, so fine movements stay controllable up close.
// The earth falls off much more sharply since its min zoom sits right at the surface.
function speedScale() {
  const t = THREE.MathUtils.clamp(camDist / ZOOM[mode].base, 0, 1.4);
  if (mode === 'earth') return THREE.MathUtils.clamp(Math.pow(t, 2.6), 0.035, 1.4);
  return THREE.MathUtils.clamp(t, 0.22, 1.4);
}
canvas.addEventListener('wheel', (e) => {
  if (anyModalOpen() || editMode) return;
  e.preventDefault();
  const lim = ZOOM[mode];
  // Multiplicative zoom: steps shrink automatically as you get closer.
  camDist = THREE.MathUtils.clamp(camDist * Math.exp(e.deltaY * 0.0012), lim.min, lim.max);
  applyZoom();
  lastInteraction = performance.now();
}, { passive: false });

// Pins shrink as the camera moves in, so they don't dominate the view up close.
let pinScale = 1;
function updatePinScale() {
  const t = THREE.MathUtils.clamp(camDist / ZOOM.earth.base, 0, 1);
  pinScale = THREE.MathUtils.clamp(Math.pow(t, 2.2), 0.045, 1);
  pinMeshes.forEach((p) => p.scale.setScalar(p === hoveredPin ? pinScale * 1.7 : pinScale));
}

canvas.addEventListener('pointerdown', (e) => {
  if (anyModalOpen() || editMode) return;
  dragging = true;
  moved = false;
  downPos = { x: e.clientX, y: e.clientY, t: performance.now() };
  canvas.classList.add('grabbing');
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', (e) => {
  if (editMode) return;
  setPointer(e);
  if (dragging) {
    const dx = e.movementX || 0;
    const dy = e.movementY || 0;
    if (Math.abs(e.clientX - downPos.x) + Math.abs(e.clientY - downPos.y) > 4) moved = true;
    const k = speedScale();
    (mode === 'brain' ? brainRot : earthRot)?.drag(dx * k, dy * k);
    lastInteraction = performance.now();
  } else {
    hover();
  }
});

canvas.addEventListener('pointerup', (e) => {
  if (editMode) return;
  canvas.classList.remove('grabbing');
  const quick = performance.now() - (downPos?.t ?? 0) < 300;
  if (dragging && !moved && quick) click();
  dragging = false;
  lastInteraction = performance.now();
});

let hoveredPin = null;
function hover() {
  if (anyModalOpen() || editMode) return;
  raycaster.setFromCamera(ptr, camera);
  if (mode === 'brain') {
    const hit = raycaster.intersectObjects(cardMeshes, false)[0];
    cardMeshes.forEach((s) => s.scale.setScalar(s.userData.baseScale));
    if (hit) hit.object.scale.setScalar(hit.object.userData.baseScale * 1.12);
    canvas.classList.toggle('pointer', !!hit);
  } else {
    const hit = raycaster.intersectObjects(pinMeshes, false)[0];
    const pin = hit ? hit.object : null;
    if (pin !== hoveredPin) {
      if (hoveredPin) { hoveredPin.userData.mat.color.set(0xffffff); hoveredPin.scale.setScalar(pinScale); }
      hoveredPin = pin;
      if (pin) {
        pin.userData.mat.color.set(0xb5544b);
        pin.scale.setScalar(pinScale * 1.7);
        showViewer(pin.userData.row);
      }
    }
    canvas.classList.toggle('pointer', !!pin);
    lastInteraction = performance.now(); // keep globe still while inspecting a pin
  }
}

function click() {
  if (mode !== 'brain') return;
  raycaster.setFromCamera(ptr, camera);
  const hit = raycaster.intersectObjects(cardMeshes, false)[0];
  if (!hit) return;
  const card = hit.object.userData.card;
  if (card.action === 'modal') openModal(card.id, () => {});
  else if (card.action === 'link') window.open(card.href, '_blank', 'noopener');
  else if (card.action === 'earth') toEarth();
}

// ----------------------------------------------------------------- UI
const hint = document.getElementById('hint');
const backBtn = document.getElementById('back-btn');
const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewer-img');
const viewerCap = document.getElementById('viewer-cap');

function showViewer(row) {
  viewerImg.src = 'photos/' + row.image;
  const year = row.year ? ` <span class="cap-year">· ${row.year}</span>` : '';
  const desc = row.desc ? `<span class="cap-desc">${row.desc}</span>` : '';
  viewerCap.innerHTML = `<strong>${row.name}</strong>${year}${desc}`;
  viewer.hidden = false;
  requestAnimationFrame(() => viewer.classList.add('show'));
}

function toEarth() {
  mode = 'earth';
  brainGroup.visible = false;
  earthGroup.visible = true;
  earthFill.visible = true;
  backBtn.hidden = false;
  hint.textContent = 'scroll to zoom · hover a point to see a photo';
  hint.style.opacity = '';
  camDist = ZOOM.earth.base;
  applyZoom();
  updatePinScale();
  lastInteraction = performance.now();
}

function toBrain() {
  mode = 'brain';
  earthGroup.visible = false;
  earthFill.visible = false;
  brainGroup.visible = true;
  backBtn.hidden = true;
  viewer.classList.remove('show');
  viewer.hidden = true;
  hint.textContent = 'drag to rotate · click a photo';
  camDist = ZOOM.brain.base;
  applyZoom();
  lastInteraction = performance.now();
}
backBtn.addEventListener('click', toBrain);

// ----------------------------------------------------------------- loop
const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta();
  const idle = !dragging && !anyModalOpen() && !editMode && performance.now() - lastInteraction > IDLE_MS;
  if (idle) {
    if (mode === 'brain') brainRot?.idleSpin(dt);
    else if (!hoveredPin) earthRot?.idleSpin(dt);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ----------------------------------------------------------------- boot
async function boot() {
  const objLoader = new OBJLoader();
  const texLoader = new THREE.TextureLoader();

  const [obj, earthTex, csvText] = await Promise.all([
    objLoader.loadAsync('models/brain.obj'),
    texLoader.loadAsync('textures/earth.jpg'),
    fetch('data/photos.csv').then((r) => r.text()),
  ]);

  buildBrain(obj, savedCardTransforms);
  buildEarth(earthTex, parseCSV(csvText));

  resize();
  lastInteraction = performance.now();
  animate();

  document.getElementById('loader').classList.add('hide');

  if (new URLSearchParams(location.search).has('edit')) {
    editMode = true;
    hint.textContent = '';
    const { initEditor } = await import('./editor.js');
    initEditor({ scene, camera, renderer, cardMeshes });
    return;
  }

  hint.textContent = 'drag to rotate · click a photo';
  setTimeout(() => { hint.style.opacity = '0'; }, 8000);

  if (location.hash === '#earth') toEarth();
}

boot();
