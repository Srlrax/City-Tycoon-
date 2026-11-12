export class CharacterAnimator {
  constructor(parts) {
    this.parts = parts;
    this.phase = 0;
    this.blend = 0;
  }

  update(dt, moving, sprinting, jumping) {
    const p = this.parts;
    const targetBlend = moving ? 1 : 0;
    this.blend += (targetBlend - this.blend) * Math.min(1, dt * 10);
    if (moving) this.phase += dt * (sprinting ? 14 : 9);

    const stride = Math.sin(this.phase) * this.blend;
    const counter = Math.sin(this.phase + Math.PI) * this.blend;
    const power = sprinting ? 0.86 : 0.58;

    p.leftLeg.rotation.x = stride * power;
    p.rightLeg.rotation.x = counter * power;
    p.leftKnee.rotation.x = Math.max(0, -stride) * 0.9;
    p.rightKnee.rotation.x = Math.max(0, -counter) * 0.9;
    p.leftArm.rotation.x = -stride * 0.72;
    p.rightArm.rotation.x = -counter * 0.72;
    p.leftElbow.rotation.x = 0.12 + Math.max(0, stride) * 0.5;
    p.rightElbow.rotation.x = 0.12 + Math.max(0, counter) * 0.5;
    p.body.rotation.z = moving ? Math.sin(this.phase) * 0.035 : 0;
    p.body.position.y = 1.35 + (moving ? Math.abs(Math.sin(this.phase * 2)) * 0.035 : Math.sin(performance.now() * 0.0018) * 0.012);
    p.head.rotation.y = Math.sin(performance.now() * 0.0007) * 0.035;
    p.head.rotation.x = jumping ? -0.08 : 0;
  }
}
