import { playHappyChirp, playYip } from './sound.js';

const DRAG_THRESHOLD_PX = 6;
const HEART_EMOJIS = ['💗', '💕', '✨'];

function spawnHeart(container, originX, originY) {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  heart.style.left = `${originX}px`;
  heart.style.top = `${originY}px`;
  heart.style.setProperty('--drift', `${(Math.random() - 0.5) * 40}px`);
  container.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

export function setupInteractions({ puppyEl, hitTestEl, heartsEl, behavior }) {
  let dragging = false;
  let dragMoved = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let hoverIgnoring = true;

  function updateHoverHitTest(event) {
    if (dragging) return;
    const rect = hitTestEl.getBoundingClientRect();
    const isOver =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (isOver && hoverIgnoring) {
      hoverIgnoring = false;
      window.petAPI.setIgnoreMouseEvents(false);
    } else if (!isOver && !hoverIgnoring) {
      hoverIgnoring = true;
      window.petAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  }

  function onPointerDown(event) {
    dragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    const rect = puppyEl.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    behavior.beginDrag();
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!dragging) {
      updateHoverHitTest(event);
      return;
    }
    const traveled = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
    if (traveled > DRAG_THRESHOLD_PX) {
      dragMoved = true;
    }
    behavior.dragTo(event.clientX - dragOffsetX, event.clientY - dragOffsetY);
  }

  function onPointerUp(event) {
    if (!dragging) return;
    dragging = false;

    if (!dragMoved) {
      triggerPet(event);
    } else {
      playYip();
    }
    behavior.endDrag();
  }

  function triggerPet(event) {
    puppyEl.classList.add('state-pet');
    playHappyChirp();
    const rect = puppyEl.getBoundingClientRect();
    const originX = (event.clientX ?? rect.left + rect.width / 2) - rect.left;
    const originY = 10;
    for (let i = 0; i < 4; i += 1) {
      setTimeout(() => spawnHeart(heartsEl, originX + (Math.random() - 0.5) * 20, originY), i * 90);
    }
    setTimeout(() => puppyEl.classList.remove('state-pet'), 520);
  }

  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  hitTestEl.addEventListener('mousedown', onPointerDown);
}
