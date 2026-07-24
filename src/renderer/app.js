import { PuppyMovement } from './puppy/movement.js';
import { setupInteractions } from './puppy/interactions.js';

const puppyEl = document.getElementById('puppy');
const flipEl = document.getElementById('puppy-flip');
const heartsEl = document.getElementById('hearts');

const movement = new PuppyMovement(puppyEl, flipEl);
movement.start();

setupInteractions({
  puppyEl,
  hitTestEl: puppyEl,
  heartsEl,
  movement,
});

window.petAPI.onBounds((bounds) => {
  movement.setBounds(bounds);
});

window.petAPI.onSize((size) => {
  puppyEl.classList.remove('size-small', 'size-medium', 'size-large');
  puppyEl.classList.add(`size-${size}`);
});

window.petAPI.onPaused((paused) => {
  if (paused) {
    movement.suspend();
    puppyEl.classList.add('state-sleep');
  } else {
    puppyEl.classList.remove('state-sleep');
    movement.resume();
  }
});
