import { PuppyMotion } from './motion.js';
import { getHouseFrontSpot, getBowlSpot } from './house.js';

const CHASE_OFFSET = { x: -55, y: 35 };
const CHASE_SPEED = 250;
const WALK_SPEED = 65;
const RUN_SPEED = 220;
const CURSOR_IDLE_MS = 4000;
const AUTO_NAP_DELAY_MS = 30000;
const ROAM_IDLE_RANGE_MS = [1500, 3200];
const ROAM_WALK_EDGE_MARGIN = 40;
const GROUND_BAND_RATIO = 0.32;
const EAT_DURATION_MS = 4200;
const GRAB_DURATION_MS = 500;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class PuppyBehavior {
  constructor({ puppyEl, puppyView, toyEl, leashEl, bounds }) {
    this.puppyEl = puppyEl;
    this.puppyView = puppyView;
    this.toyEl = toyEl;
    this.leashEl = leashEl;
    this.bounds = bounds;
    this.motion = new PuppyMotion(puppyEl, bounds);
    this.mode = 'auto';
    this.phase = 'roam-idle';
    this.cursor = { x: bounds.width / 2, y: bounds.height / 2 };
    this.lastCursorMoveAt = 0;
    this.idleCursorMs = 0;
    this.roamTarget = null;
    this.roamCountdown = 0;
    this.phaseTimer = 0;
    this.preDragMode = 'auto';

    this.setState('idle');
    document.addEventListener('mousemove', (event) => this.onCursorMove(event));
  }

  onCursorMove(event) {
    this.cursor = { x: event.clientX, y: event.clientY };
    this.lastCursorMoveAt = performance.now();
  }

  setBounds(bounds) {
    this.bounds = bounds;
    this.motion.setBounds(bounds);
  }

  setState(name) {
    this.puppyView.setState(name);
    this.puppyEl.classList.toggle('is-sleeping', name === 'sleep');
  }

  faceToward(target) {
    this.puppyView.setFacing(target.x >= this.motion.x ? 'right' : 'left');
  }

  triggerPetBounce() {
    this.puppyView.triggerPetBounce();
  }

  pickRoamTarget(upperScreen) {
    const x = randomBetween(ROAM_WALK_EDGE_MARGIN, this.bounds.width - ROAM_WALK_EDGE_MARGIN);
    const groundTop = this.bounds.height * (1 - GROUND_BAND_RATIO);
    const y = upperScreen
      ? randomBetween(this.bounds.height * 0.15, groundTop)
      : randomBetween(groundTop, this.bounds.height - 40);
    return { x, y };
  }

  // ---- tray commands ----
  toggleSleep() {
    if (this.mode === 'sleep') {
      this.mode = 'auto';
      this.phase = 'roam-idle';
      return;
    }
    this.mode = 'sleep';
    this.phase = 'approaching';
  }

  toggleBehave() {
    if (this.mode === 'behave') {
      this.mode = 'auto';
      this.phase = 'roam-idle';
      this.setLeashVisible(false);
      return;
    }
    this.mode = 'behave';
    this.phase = 'approaching';
  }

  startEating() {
    if (this.mode === 'drag') return;
    this.mode = 'eat';
    this.phase = 'approaching';
  }

  startPlaying() {
    if (this.mode === 'drag') return;
    this.mode = 'play';
    this.phase = 'toToy';
    this.toy = this.pickRoamTarget(true);
    this.setToyVisible(true, this.toy);
  }

  isSleeping() {
    return this.mode === 'sleep';
  }

  isBehaving() {
    return this.mode === 'behave';
  }

  // ---- drag lifecycle (driven by interactions.js) ----
  beginDrag() {
    this.preDragMode = this.mode;
    this.mode = 'drag';
    this.setLeashVisible(false);
    this.setState('drag');
  }

  dragTo(x, y) {
    this.motion.teleportTo(x, y);
  }

  endDrag() {
    this.mode = this.preDragMode === 'drag' ? 'auto' : this.preDragMode;
    this.phase = this.mode === 'auto' ? 'roam-idle' : 'approaching';
  }

  setLeashVisible(visible) {
    if (this.leashEl) this.leashEl.classList.toggle('visible', visible);
  }

  setToyVisible(visible, position) {
    if (!this.toyEl) return;
    this.toyEl.classList.toggle('visible', visible);
    if (position) {
      this.toyEl.style.left = `${position.x}px`;
      this.toyEl.style.top = `${position.y}px`;
    }
  }

  // ---- per-frame update ----
  tick(dt) {
    if (this.mode === 'sleep') this.tickSleep(dt);
    else if (this.mode === 'behave') this.tickBehave(dt);
    else if (this.mode === 'eat') this.tickEat(dt);
    else if (this.mode === 'play') this.tickPlay(dt);
    else if (this.mode !== 'drag') this.tickAuto(dt);
    // mode === 'drag': position is driven externally via dragTo(); state was set by beginDrag()

    this.puppyView.tick(dt);
  }

  tickSleep(dt) {
    const target = getHouseFrontSpot(this.bounds);
    if (this.phase === 'approaching') {
      this.faceToward(target);
      this.setState('walk');
      if (this.motion.stepToward(target, WALK_SPEED, dt)) {
        this.phase = 'settled';
      }
      return;
    }
    this.setState('sleep');
  }

  tickBehave(dt) {
    const target = getHouseFrontSpot(this.bounds);
    if (this.phase === 'approaching') {
      this.faceToward(target);
      this.setState('walk');
      if (this.motion.stepToward(target, WALK_SPEED, dt)) {
        this.phase = 'settled';
        this.setLeashVisible(true);
      }
      return;
    }
    this.setState('behave');
  }

  tickEat(dt) {
    const target = getBowlSpot(this.bounds);
    if (this.phase === 'approaching') {
      this.faceToward(target);
      this.setState('walk');
      if (this.motion.stepToward(target, WALK_SPEED, dt)) {
        this.phase = 'eating';
        this.phaseTimer = EAT_DURATION_MS;
      }
      return;
    }
    this.setState('eat');
    this.phaseTimer -= dt * 1000;
    if (this.phaseTimer <= 0) {
      this.mode = 'auto';
      this.phase = 'roam-idle';
    }
  }

  tickPlay(dt) {
    if (this.phase === 'toToy') {
      this.faceToward(this.toy);
      this.setState('run');
      if (this.motion.stepToward(this.toy, RUN_SPEED, dt)) {
        this.phase = 'grab';
        this.phaseTimer = GRAB_DURATION_MS;
        this.setToyVisible(false);
      }
      return;
    }
    if (this.phase === 'grab') {
      this.setState('play');
      this.phaseTimer -= dt * 1000;
      if (this.phaseTimer <= 0) {
        this.phase = 'returning';
        this.returnTarget = getHouseFrontSpot(this.bounds);
      }
      return;
    }
    this.faceToward(this.returnTarget);
    this.setState('run');
    if (this.motion.stepToward(this.returnTarget, RUN_SPEED, dt)) {
      this.mode = 'auto';
      this.phase = 'roam-idle';
    }
  }

  tickAuto(dt) {
    const now = performance.now();
    const cursorActive = this.lastCursorMoveAt !== 0 && now - this.lastCursorMoveAt < CURSOR_IDLE_MS;

    if (cursorActive) {
      this.idleCursorMs = 0;
      const target = {
        x: this.motion.clampX(this.cursor.x + CHASE_OFFSET.x),
        y: this.motion.clampY(this.cursor.y + CHASE_OFFSET.y),
      };
      this.faceToward(target);
      const arrived = this.motion.stepToward(target, CHASE_SPEED, dt);
      this.setState(arrived ? 'idle' : 'run');
      return;
    }

    this.idleCursorMs += dt * 1000;
    if (this.idleCursorMs > AUTO_NAP_DELAY_MS) {
      this.mode = 'sleep';
      this.phase = 'approaching';
      this.idleCursorMs = 0;
      return;
    }
    this.tickRoam(dt);
  }

  tickRoam(dt) {
    if (this.phase !== 'roam-walk') {
      this.setState('idle');
      this.roamCountdown -= dt * 1000;
      if (this.roamCountdown <= 0) {
        this.phase = 'roam-walk';
        this.roamTarget = this.pickRoamTarget(false);
      }
      return;
    }
    this.faceToward(this.roamTarget);
    this.setState('walk');
    if (this.motion.stepToward(this.roamTarget, WALK_SPEED, dt)) {
      this.phase = 'roam-idle';
      this.roamCountdown = randomBetween(...ROAM_IDLE_RANGE_MS);
    }
  }
}
