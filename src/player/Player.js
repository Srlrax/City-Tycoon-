import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

function box(parent, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export class Player {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 13);
    scene.add(this.group);
    const skin = new THREE.MeshStandardMaterial({ color: 0xc88e68, roughness: 0.9 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x2c7ba0, roughness: 0.75 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x263747, roughness: 0.9 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0x18232c, roughness: 0.8 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x382b25, roughness: 1 });
    box(this.group, 0, 1.32, 0, 0.72, 0.92, 0.4, shirt);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 18, 14), skin);
    head.position.set(0, 2.02, 0.015); head.castShadow = true; this.group.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.275, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), hair);
    cap.position.set(0, 2.1, 0); this.group.add(cap);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x17232d });
    for (const x of [-0.09, 0.09]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
      eye.position.set(x, 2.02, 0.255); this.group.add(eye);
    }
    this.legs = [];
    this.arms = [];
    for (const x of [-0.19, 0.19]) this.legs.push(box(this.group, x, 0.52, 0, 0.24, 0.72, 0.28, pants));
    for (const x of [-0.49, 0.49]) this.arms.push(box(this.group, x, 1.36, 0, 0.2, 0.72, 0.22, shirt));
    for (const x of [-0.19, 0.19]) box(this.group, x, 0.13, 0.09, 0.27, 0.2, 0.4, shoe);
    this.walkTime = 0;
    this.moving = false;
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
    if (this.moving) {
      move.normalize();
      this.group.position.addScaledVector(move, speed * dt);
      this.group.rotation.y = Math.atan2(move.x, move.z);
      this.walkTime += dt * 10;
    }
    this.group.position.x = THREE.MathUtils.clamp(this.group.position.x, -94, 94);
    this.group.position.z = THREE.MathUtils.clamp(this.group.position.z, -94, 94);
    const swing = this.moving ? Math.sin(this.walkTime) * 0.48 : 0;
    this.legs[0].rotation.x = swing;
    this.legs[1].rotation.x = -swing;
    this.arms[0].rotation.x = -swing * 0.75;
    this.arms[1].rotation.x = swing * 0.75;
    this.group.position.y = this.moving ? Math.abs(Math.sin(this.walkTime * 2)) * 0.035 : 0;
  }
}
