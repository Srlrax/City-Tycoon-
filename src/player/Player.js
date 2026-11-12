import THREE from '../vendor/three.js';
import { CharacterAnimator } from './CharacterAnimator.js';

const standard = (color, roughness = 0.78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
function box(parent, x, y, z, sx, sy, sz, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function sphere(parent, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

export class Player {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 13);
    scene.add(this.group);

    const skin = standard(0xb77e5d, 0.88);
    const shirt = standard(0x23627f, 0.72);
    const shirtDark = standard(0x173f56, 0.8);
    const pants = standard(0x253343, 0.9);
    const shoe = standard(0x101820, 0.7);
    const hair = standard(0x2b211d, 0.98);
    const white = new THREE.MeshStandardMaterial({ color: 0xf3f0e8, roughness: 0.6 });
    const black = new THREE.MeshBasicMaterial({ color: 0x17212a });

    this.body = new THREE.Group();
    this.group.add(this.body);
    this.body.position.y = 1.35;
    box(this.body, 0, 0, 0, 0.72, 0.86, 0.39, shirt);
    box(this.body, 0, -0.32, 0, 0.73, 0.12, 0.4, shirtDark, false);
    box(this.body, 0, 0.43, 0, 0.37, 0.13, 0.4, shirtDark, false);
    box(this.body, -0.2, -0.12, 0.205, 0.18, 0.23, 0.035, shirtDark, false);
    box(this.body, 0.2, -0.12, 0.205, 0.18, 0.23, 0.035, shirtDark, false);

    const head = new THREE.Group();
    head.position.set(0, 0.76, 0.01);
    this.body.add(head);
    sphere(head, 0, 0, 0, 0.255, 0.31, 0.25, skin);
    sphere(head, 0, 0.18, -0.015, 0.27, 0.16, 0.255, hair);
    sphere(head, 0, 0.06, -0.205, 0.19, 0.19, 0.07, hair);
    for (const side of [-1, 1]) {
      sphere(head, side * 0.265, -0.015, 0, 0.055, 0.085, 0.06, skin);
      sphere(head, side * 0.095, 0.025, 0.224, 0.052, 0.064, 0.025, white);
      sphere(head, side * 0.095, 0.025, 0.246, 0.022, 0.03, 0.012, black);
      box(head, side * 0.095, 0.102, 0.22, 0.095, 0.018, 0.025, hair, false);
    }
    sphere(head, 0, -0.055, 0.255, 0.04, 0.055, 0.04, skin);
    box(head, 0, -0.17, 0.23, 0.09, 0.018, 0.018, standard(0x704b3b), false);
    this.head = head;

    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();
    leftLeg.position.set(-0.19, -0.42, 0);
    rightLeg.position.set(0.19, -0.42, 0);
    this.group.add(leftLeg, rightLeg);
    for (const leg of [leftLeg, rightLeg]) {
      box(leg, 0, -0.23, 0, 0.24, 0.48, 0.28, pants);
    }
    const leftKnee = new THREE.Group();
    const rightKnee = new THREE.Group();
    leftKnee.position.y = -0.47;
    rightKnee.position.y = -0.47;
    leftLeg.add(leftKnee);
    rightLeg.add(rightKnee);
    box(leftKnee, 0, -0.23, 0, 0.22, 0.48, 0.25, pants);
    box(rightKnee, 0, -0.23, 0, 0.22, 0.48, 0.25, pants);
    box(leftKnee, 0, -0.45, 0.09, 0.27, 0.16, 0.42, shoe);
    box(rightKnee, 0, -0.45, 0.09, 0.27, 0.16, 0.42, shoe);

    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    leftArm.position.set(-0.4, 0.29, 0);
    rightArm.position.set(0.4, 0.29, 0);
    this.body.add(leftArm, rightArm);
    for (const arm of [leftArm, rightArm]) {
      sphere(arm, 0, 0, 0, 0.15, 0.16, 0.16, shirt);
      box(arm, 0, -0.22, 0, 0.2, 0.43, 0.22, shirt);
    }
    const leftElbow = new THREE.Group();
    const rightElbow = new THREE.Group();
    leftElbow.position.y = -0.43;
    rightElbow.position.y = -0.43;
    leftArm.add(leftElbow);
    rightArm.add(rightElbow);
    box(leftElbow, 0, -0.2, 0, 0.17, 0.38, 0.19, shirt);
    box(leftElbow, 0, -0.41, 0, 0.16, 0.15, 0.17, skin);
    box(rightElbow, 0, -0.2, 0, 0.17, 0.38, 0.19, shirt);
    box(rightElbow, 0, -0.41, 0, 0.16, 0.15, 0.17, skin);

    this.animator = new CharacterAnimator({
      body: this.body, head,
      leftLeg, rightLeg, leftKnee, rightKnee,
      leftArm, rightArm, leftElbow, rightElbow
    });
    this.velocityY = 0;
    this.jumpTime = 0;
    this.moving = false;
    this.sprinting = false;
    this.jumping = false;
  }

  update(dt, input, speed = 9) {
    const forward = new THREE.Vector3(-Math.sin(input.yaw), 0, -Math.cos(input.yaw));
    const right = new THREE.Vector3(Math.cos(input.yaw), 0, -Math.sin(input.yaw));
    const move = new THREE.Vector3();
    if (input.down('w', 'arrowup')) move.add(forward);
    if (input.down('s', 'arrowdown')) move.sub(forward);
    if (input.down('d', 'arrowright')) move.add(right);
    if (input.down('a', 'arrowleft')) move.sub(right);

    this.moving = move.lengthSq() > 0;
    this.sprinting = input.down('shift') && this.moving;
    if (this.moving) {
      move.normalize();
      this.group.position.addScaledVector(move, speed * (this.sprinting ? 1.55 : 1) * dt);
      this.group.rotation.y = Math.atan2(move.x, move.z);
    }

    if (input.consumePress(' ')) {
      if (this.group.position.y <= 0.001) this.velocityY = 6.1;
    }
    this.velocityY -= 15.5 * dt;
    this.group.position.y = Math.max(0, this.group.position.y + this.velocityY * dt);
    if (this.group.position.y === 0 && this.velocityY < 0) this.velocityY = 0;
    this.jumping = this.group.position.y > 0.02;

    this.group.position.x = THREE.MathUtils.clamp(this.group.position.x, -94, 94);
    this.group.position.z = THREE.MathUtils.clamp(this.group.position.z, -94, 94);
    this.animator.update(dt, this.moving, this.sprinting, this.jumping);
  }
}
