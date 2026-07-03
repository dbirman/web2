import { MODALS } from './content.js';

const root = document.getElementById('modal-root');
let onClose = null;

export function openModal(id, closeCb) {
  const data = MODALS[id];
  if (!data) return;
  onClose = closeCb;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" aria-label="Close">&times;</button>
      <img class="modal-hero" src="${data.hero}" alt="" />
      <div class="modal-body">${data.body}</div>
    </div>`;
  root.appendChild(backdrop);

  // Animate in
  requestAnimationFrame(() => backdrop.classList.add('show'));

  const close = () => {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 250);
    document.removeEventListener('keydown', onKey);
    if (onClose) onClose();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };

  backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', onKey);
}

export function anyModalOpen() {
  return root.childElementCount > 0;
}
