import { Puppy3D } from './puppy3d.js';

const YAW_LEFT = -1.15;
const YAW_RIGHT = 1.15;
const YAW_LERP_SPEED = 6;
const PET_BOUNCE_DURATION = 0.5;

function blinkScale(t, period = 4.6) {
  const phase = (t % period) / period;
  return phase > 0.92 && phase < 0.97 ? 0.15 : 1;
}

export class PuppyView {
  constructor(canvas, width, height) {
    this.model = new Puppy3D(canvas, width, height);
    this.state = 'idle';
    this.clock = 0;
    this.targetYaw = YAW_RIGHT;
    this.currentYaw = YAW_RIGHT;
    this.petBounceStart = null;
  }

  setState(name) {
    if (this.state !== name) this.clock = 0;
    this.state = name;
  }

  setFacing(direction) {
    this.targetYaw = direction === 'left' ? YAW_LEFT : YAW_RIGHT;
  }

  resize(width, height) {
    this.model.resize(width, height);
  }

  triggerPetBounce() {
    this.petBounceStart = this.clock;
  }

  tick(dt) {
    this.clock += dt;
    this.currentYaw += (this.targetYaw - this.currentYaw) * Math.min(YAW_LERP_SPEED * dt, 1);
    this.model.root.rotation.y = this.currentYaw;

    this.applyPose();
    this.applyPetBounce();

    this.model.render();
  }

  applyPose() {
    switch (this.state) {
      case 'walk':
        return this.poseGait(2.6, 0.32, 0.05);
      case 'run':
        return this.poseGait(5.4, 0.55, 0.11);
      case 'sleep':
        return this.poseSleep();
      case 'eat':
        return this.poseEat();
      case 'play':
        return this.poseShake();
      case 'drag':
        return this.poseDrag();
      default:
        return this.poseIdle();
    }
  }

  poseIdle() {
    const t = this.clock;
    const breathe = 1 + Math.sin(t * 1.8) * 0.02;
    this.model.root.rotation.z = 0;
    this.model.body.scale.y = 0.86 * breathe;
    this.model.body.position.y = this.model.bodyBaseY;
    this.model.head.position.y = this.model.headBaseY;
    this.model.head.rotation.x = 0;
    this.model.tail.rotation.z = Math.sin(t * 1.4) * 0.22;
    this.setBlink(t);
    this.resetLegs();
  }

  poseGait(speed, swingAmp, bounceAmp) {
    const t = this.clock;
    const swing = Math.sin(t * speed);
    this.model.root.rotation.z = 0;
    this.model.legs.fl.rotation.x = swing * swingAmp;
    this.model.legs.br.rotation.x = swing * swingAmp;
    this.model.legs.fr.rotation.x = -swing * swingAmp;
    this.model.legs.bl.rotation.x = -swing * swingAmp;
    this.model.body.scale.y = 0.86;
    this.model.body.position.y = this.model.bodyBaseY + Math.abs(swing) * bounceAmp;
    this.model.head.position.y = this.model.headBaseY + Math.abs(swing) * bounceAmp * 0.6;
    this.model.head.rotation.x = 0;
    this.model.tail.rotation.z = Math.sin(t * speed * 1.2) * 0.35;
    this.setBlink(t);
  }

  poseSleep() {
    this.model.root.rotation.z = 0;
    this.model.body.scale.y = 0.62;
    this.model.body.position.y = this.model.bodyBaseY - 0.18;
    this.model.head.position.y = this.model.headBaseY - 0.22;
    this.model.head.rotation.x = 0.3;
    this.model.tail.rotation.z = 0.05;
    this.model.eyeL.scale.y = 0.1;
    this.model.eyeR.scale.y = 0.1;
    this.resetLegs();
  }

  poseEat() {
    const t = this.clock;
    const bob = Math.abs(Math.sin(t * 4.5));
    this.model.root.rotation.z = 0;
    this.model.head.position.y = this.model.headBaseY - 0.18 - bob * 0.12;
    this.model.head.rotation.x = 0.35 + bob * 0.2;
    this.model.body.position.y = this.model.bodyBaseY - 0.04;
    this.model.tail.rotation.z = Math.sin(t * 2) * 0.3;
    this.setBlink(t);
    this.resetLegs();
  }

  poseShake() {
    const t = this.clock;
    this.model.root.rotation.z = Math.sin(t * 24) * 0.12;
    this.model.tail.rotation.z = Math.sin(t * 20) * 0.5;
    this.model.body.position.y = this.model.bodyBaseY;
    this.model.head.position.y = this.model.headBaseY;
    this.model.head.rotation.x = 0;
    this.model.eyeL.scale.y = 1;
    this.model.eyeR.scale.y = 1;
    this.resetLegs();
  }

  poseDrag() {
    const t = this.clock;
    this.model.root.rotation.z = -0.18;
    Object.values(this.model.legs).forEach((pivot, i) => {
      pivot.rotation.x = Math.sin(t * 3 + i) * 0.3;
    });
    this.model.tail.rotation.z = 0.1;
    this.model.head.position.y = this.model.headBaseY;
    this.model.head.rotation.x = 0;
    this.model.body.position.y = this.model.bodyBaseY;
    this.model.eyeL.scale.y = 1;
    this.model.eyeR.scale.y = 1;
  }

  applyPetBounce() {
    if (this.petBounceStart === null) return;
    const elapsed = this.clock - this.petBounceStart;
    if (elapsed >= PET_BOUNCE_DURATION) {
      this.petBounceStart = null;
      return;
    }
    const bounce = Math.sin((elapsed / PET_BOUNCE_DURATION) * Math.PI) * 0.22;
    this.model.body.position.y += bounce;
    this.model.tail.rotation.z += Math.sin(elapsed * 30) * 0.3;
  }

  setBlink(t) {
    const scale = blinkScale(t);
    this.model.eyeL.scale.y = scale;
    this.model.eyeR.scale.y = scale;
  }

  resetLegs() {
    Object.values(this.model.legs).forEach((pivot) => {
      pivot.rotation.x = 0;
    });
  }
}
