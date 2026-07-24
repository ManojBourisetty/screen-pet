const FOOTPRINT_W = 140;
const FOOTPRINT_H = 108;
const EDGE_MARGIN = 12;

export class PuppyMotion {
  constructor(puppyEl, bounds) {
    this.puppyEl = puppyEl;
    this.bounds = bounds;
    this.x = bounds.width / 2;
    this.y = bounds.height - FOOTPRINT_H - 18;
    this.applyPosition();
  }

  setBounds(bounds) {
    this.bounds = bounds;
    this.x = this.clampX(this.x);
    this.y = this.clampY(this.y);
    this.applyPosition();
  }

  clampX(x) {
    return Math.min(Math.max(x, EDGE_MARGIN), Math.max(EDGE_MARGIN, this.bounds.width - EDGE_MARGIN - FOOTPRINT_W));
  }

  clampY(y) {
    return Math.min(Math.max(y, EDGE_MARGIN), Math.max(EDGE_MARGIN, this.bounds.height - EDGE_MARGIN - FOOTPRINT_H));
  }

  distanceTo(target) {
    return Math.hypot(target.x - this.x, target.y - this.y);
  }

  /** Steps toward target at speed (px/sec); returns true once arrived (within 4px). */
  stepToward(target, speed, dt) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 4) {
      this.x = target.x;
      this.y = target.y;
      this.applyPosition();
      return true;
    }
    const step = speed * dt;
    if (step >= distance) {
      this.x = target.x;
      this.y = target.y;
    } else {
      this.x += (dx / distance) * step;
      this.y += (dy / distance) * step;
    }
    this.x = this.clampX(this.x);
    this.y = this.clampY(this.y);
    this.applyPosition();
    return false;
  }

  teleportTo(x, y) {
    this.x = this.clampX(x);
    this.y = this.clampY(y);
    this.applyPosition();
  }

  applyPosition() {
    this.puppyEl.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}
