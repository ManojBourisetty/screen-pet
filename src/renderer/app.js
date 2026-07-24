import { PuppyBehavior } from './puppy/behaviorController.js';
import { PuppyView } from './puppy/puppyView.js';
import { setupInteractions } from './puppy/interactions.js';

const SIZE_DIMENSIONS = {
  small: { width: 96, height: 74 },
  medium: { width: 140, height: 108 },
  large: { width: 190, height: 147 },
};

const puppyEl = document.getElementById('puppy');
const canvasEl = document.getElementById('puppy-canvas');
const heartsEl = document.getElementById('hearts');
const toyEl = document.getElementById('toy');
const leashEl = document.getElementById('leash');

const initialBounds = { width: window.innerWidth, height: window.innerHeight };
const puppyView = new PuppyView(canvasEl, SIZE_DIMENSIONS.medium.width, SIZE_DIMENSIONS.medium.height);

const behavior = new PuppyBehavior({
  puppyEl,
  puppyView,
  toyEl,
  leashEl,
  bounds: initialBounds,
});

setupInteractions({
  puppyEl,
  hitTestEl: puppyEl,
  heartsEl,
  behavior,
});

let lastFrameTime = 0;
let lastSyncedMode = null;
function loop(time) {
  const dt = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.1) : 0;
  lastFrameTime = time;
  behavior.tick(dt);

  if (behavior.mode !== lastSyncedMode) {
    lastSyncedMode = behavior.mode;
    window.petAPI.syncState({ sleeping: behavior.isSleeping(), behaving: behavior.isBehaving() });
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

window.petAPI.onBounds((bounds) => {
  behavior.setBounds(bounds);
});

window.petAPI.onSize((size) => {
  puppyEl.classList.remove('size-small', 'size-medium', 'size-large');
  puppyEl.classList.add(`size-${size}`);
  const dimensions = SIZE_DIMENSIONS[size] ?? SIZE_DIMENSIONS.medium;
  puppyView.resize(dimensions.width, dimensions.height);
});

window.petAPI.onCommand((command) => {
  switch (command.type) {
    case 'sleep-toggle':
      behavior.toggleSleep();
      break;
    case 'behave-toggle':
      behavior.toggleBehave();
      break;
    case 'eat':
      behavior.startEating();
      break;
    case 'play':
      behavior.startPlaying();
      break;
    default:
      break;
  }
});
