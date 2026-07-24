const EDGE_MARGIN = 24;
const WALK_SPEED = 55; // px/sec
const IDLE_MIN_MS = 1800;
const IDLE_MAX_MS = 4200;
const WALK_MIN_MS = 1500;
const WALK_MAX_MS = 3800;
const SLEEP_MIN_MS = 6000;
const SLEEP_MAX_MS = 12000;
const IDLE_CYCLES_BEFORE_SLEEP = 3;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class PuppyMovement {
  constructor(puppyEl, flipEl) {
    this.puppyEl = puppyEl;
    this.flipEl = flipEl;
    this.bounds = { width: window.innerWidth, height: window.innerHeight };
    this.x = randomBetween(EDGE_MARGIN, this.bounds.width - EDGE_MARGIN - 140);
    this.state = 'idle';
    this.suspended = false;
    this.idleCycles = 0;
    this.timer = null;
    this.rafId = null;
    this.lastFrameTime = 0;

    this.applyPosition();
    this.setState('idle');
  }

  setBounds(bounds) {
    this.bounds = bounds;
    const maxX = Math.max(EDGE_MARGIN, bounds.width - EDGE_MARGIN - 140);
    this.x = Math.min(this.x, maxX);
    this.applyPosition();
  }

  applyPosition() {
    this.puppyEl.style.transform = `translateX(${this.x}px)`;
  }

  setState(state) {
    this.state = state;
    this.puppyEl.classList.remove('state-idle', 'state-walk', 'state-sleep');
    this.puppyEl.classList.add(`state-${state}`);
  }

  setFacing(direction) {
    this.flipEl.classList.toggle('facing-left', direction === 'left');
    this.flipEl.classList.toggle('facing-right', direction === 'right');
  }

  start() {
    this.scheduleIdle();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  suspend() {
    this.suspended = true;
    clearTimeout(this.timer);
  }

  resume() {
    if (!this.suspended) return;
    this.suspended = false;
    this.scheduleIdle();
  }

  scheduleIdle() {
    if (this.suspended) return;
    this.setState('idle');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.onIdleFinished(), randomBetween(IDLE_MIN_MS, IDLE_MAX_MS));
  }

  onIdleFinished() {
    if (this.suspended) return;
    this.idleCycles += 1;
    const shouldSleep = this.idleCycles >= IDLE_CYCLES_BEFORE_SLEEP && Math.random() < 0.5;
    if (shouldSleep) {
      this.scheduleSleep();
    } else {
      this.scheduleWalk();
    }
  }

  scheduleSleep() {
    if (this.suspended) return;
    this.idleCycles = 0;
    this.setState('sleep');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.scheduleIdle(), randomBetween(SLEEP_MIN_MS, SLEEP_MAX_MS));
  }

  scheduleWalk() {
    if (this.suspended) return;
    const maxX = Math.max(EDGE_MARGIN, this.bounds.width - EDGE_MARGIN - 140);
    this.targetX = randomBetween(EDGE_MARGIN, maxX);
    this.setFacing(this.targetX >= this.x ? 'right' : 'left');
    this.setState('walk');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.scheduleIdle(), randomBetween(WALK_MIN_MS, WALK_MAX_MS));
  }

  tick(time) {
    const dt = this.lastFrameTime ? (time - this.lastFrameTime) / 1000 : 0;
    this.lastFrameTime = time;

    if (!this.suspended && this.state === 'walk' && typeof this.targetX === 'number') {
      const distance = this.targetX - this.x;
      const step = WALK_SPEED * dt;
      if (Math.abs(distance) <= step) {
        this.x = this.targetX;
      } else {
        this.x += Math.sign(distance) * step;
      }
      this.applyPosition();
    }

    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  setPositionFromScreenX(clientX) {
    const maxX = Math.max(EDGE_MARGIN, this.bounds.width - EDGE_MARGIN - 140);
    this.x = Math.min(Math.max(clientX - 70, 0), maxX);
    this.applyPosition();
  }
}
