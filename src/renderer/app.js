import { PuppyBehavior } from './puppy/behaviorController.js';
import { setupInteractions } from './puppy/interactions.js';

const puppyEl = document.getElementById('puppy');
const flipEl = document.getElementById('puppy-flip');
const heartsEl = document.getElementById('hearts');
const toyEl = document.getElementById('toy');
const leashEl = document.getElementById('leash');

const initialBounds = { width: window.innerWidth, height: window.innerHeight };

const behavior = new PuppyBehavior({
  puppyEl,
  flipEl,
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
