// One-time manual placement tool for the brain-scene cards. Loaded on demand
// via ?edit in the URL — not part of the normal app bundle path.
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { CARDS } from './content.js';

function round(n) {
  return Math.round(n * 1000) / 1000;
}

export function initEditor({ scene, camera, renderer, cardMeshes }) {
  const controls = new TransformControls(camera, renderer.domElement);
  controls.setSize(0.85);
  scene.add(controls.getHelper());

  let selected = 0;

  const panel = document.createElement('div');
  panel.id = 'card-editor';
  panel.innerHTML = `
    <style>
      #card-editor { position:fixed; top:16px; left:16px; z-index:200; background:rgba(20,20,24,0.94);
        color:#eee; font:12px/1.4 -apple-system,sans-serif; padding:14px; border-radius:10px; width:300px; }
      #card-editor h3 { margin:0 0 10px; font-size:13px; }
      #card-editor .row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
      #card-editor button { background:#333; color:#eee; border:1px solid #555; border-radius:5px;
        padding:5px 9px; font:inherit; cursor:pointer; }
      #card-editor button.active { background:#b5544b; border-color:#b5544b; }
      #card-editor textarea { width:100%; height:150px; font:10px/1.35 ui-monospace,monospace;
        background:#111; color:#9f9; border:1px solid #444; border-radius:5px; padding:6px; box-sizing:border-box; }
      #card-editor .hint { color:#aaa; margin-top:8px; }
    </style>
    <h3>Card placement editor</h3>
    <div class="row" id="ce-cards"></div>
    <div class="row">
      <button data-mode="translate">Move (G)</button>
      <button data-mode="rotate">Rotate (R)</button>
    </div>
    <div class="row">
      <button id="ce-copy">Copy JSON</button>
      <button id="ce-download">Download</button>
      <button id="ce-exit">Exit</button>
    </div>
    <textarea id="ce-json" readonly spellcheck="false"></textarea>
    <div class="hint">Select a card, drag the gizmo. Keep each figure's feet pointing at the brain.
      When done, paste the JSON into <code>src/card-transforms.json</code>.</div>
  `;
  document.body.appendChild(panel);

  const cardsRow = panel.querySelector('#ce-cards');
  CARDS.forEach((c, i) => {
    const b = document.createElement('button');
    b.textContent = c.label;
    b.addEventListener('click', () => select(i));
    cardsRow.appendChild(b);
  });

  function updateButtons() {
    [...cardsRow.children].forEach((b, i) => b.classList.toggle('active', i === selected));
  }

  function select(i) {
    selected = i;
    controls.attach(cardMeshes[i]);
    updateButtons();
    updateReadout();
  }

  panel.querySelectorAll('[data-mode]').forEach((b) => {
    b.addEventListener('click', () => controls.setMode(b.dataset.mode));
  });
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'g') controls.setMode('translate');
    if (e.key === 'r') controls.setMode('rotate');
  });

  function serialize() {
    const out = {};
    CARDS.forEach((c, i) => {
      const m = cardMeshes[i];
      out[c.id] = {
        position: [round(m.position.x), round(m.position.y), round(m.position.z)],
        quaternion: [round(m.quaternion.x), round(m.quaternion.y), round(m.quaternion.z), round(m.quaternion.w)],
      };
    });
    return JSON.stringify(out, null, 2);
  }

  const jsonBox = panel.querySelector('#ce-json');
  function updateReadout() { jsonBox.value = serialize(); }
  controls.addEventListener('objectChange', updateReadout);

  panel.querySelector('#ce-copy').addEventListener('click', () => {
    updateReadout();
    jsonBox.select();
    navigator.clipboard?.writeText(jsonBox.value).catch(() => {});
  });
  panel.querySelector('#ce-download').addEventListener('click', () => {
    updateReadout();
    const blob = new Blob([jsonBox.value], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'card-transforms.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  panel.querySelector('#ce-exit').addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.delete('edit');
    location.href = url.toString();
  });

  select(0);
  return controls;
}
