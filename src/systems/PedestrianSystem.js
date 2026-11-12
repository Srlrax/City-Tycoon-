import THREE from '../vendor/three.js';

const makeMaterial = color => new THREE.MeshStandardMaterial({ color, roughness: 0.88 });
function addBox(parent, x, y, z, sx, sy, sz, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export class PedestrianSystem {
  constructor(scene, count = 12) {
    this.scene = scene;
    this.people = [];
    const shirts = [0x315d7b, 0x9a674e, 0x687f59, 0x6e668b, 0xa6a7a1, 0x8c4e4b, 0xc18b4b];
    const skins = [0xd6a17e, 0x9b684e, 0xe0b995, 0x754c3a];
    const trousers = [0x293746, 0x4b5260, 0x344f43, 0x6b6256];

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const shirt = makeMaterial(shirts[i % shirts.length]);
      const skin = makeMaterial(skins[i % skins.length]);
      const pants = makeMaterial(trousers[i % trousers.length]);
      const shoes = makeMaterial(0x1b242c);
      const hair = makeMaterial(i % 2 ? 0x34261f : 0x17191d);

      const torso = new THREE.Group();
      torso.position.y = 1.16;
      group.add(torso);
      addBox(torso, 0, 0, 0, 0.45, 0.65, 0.26, shirt);
      addBox(torso, 0, -0.27, 0.02, 0.46, 0.11, 0.28, makeMaterial(0x273a47));

      const head = new THREE.Group();
      head.position.set(0, 1.61, 0.015);
      group.add(head);
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), skin);
      headMesh.castShadow = true;
      head.add(headMesh);
      const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48), hair);
      hairMesh.position.y = 0.055;
      head.add(hairMesh);

      const leftLeg = new THREE.Group();
      const rightLeg = new THREE.Group();
      leftLeg.position.set(-0.13, 0.82, 0);
      rightLeg.position.set(0.13, 0.82, 0);
      group.add(leftLeg, rightLeg);
      addBox(leftLeg, 0, -0.2, 0, 0.17, 0.4, 0.19, pants);
      addBox(rightLeg, 0, -0.2, 0, 0.17, 0.4, 0.19, pants);
      addBox(leftLeg, 0, -0.42, 0.05, 0.2, 0.13, 0.31, shoes);
      addBox(rightLeg, 0, -0.42, 0.05, 0.2, 0.13, 0.31, shoes);

      const leftArm = new THREE.Group();
      const rightArm = new THREE.Group();
      leftArm.position.set(-0.29, 1.42, 0);
      rightArm.position.set(0.29, 1.42, 0);
      group.add(leftArm, rightArm);
      addBox(leftArm, 0, -0.2, 0, 0.13, 0.4, 0.15, shirt);
      addBox(rightArm, 0, -0.2, 0, 0.13, 0.4, 0.15, shirt);
      addBox(leftArm, 0, -0.42, 0, 0.12, 0.1, 0.12, skin);
      addBox(rightArm, 0, -0.42, 0, 0.12, 0.1, 0.12, skin);

      const side = i % 2 === 0 ? 1 : -1;
      const lane = i % 4 < 2 ? 1 : -1;
      group.position.set(-54 + (i * 13 % 108), 0, lane * 14.8 + side * 0.8);
      this.scene.add(group);
      this.people.push({
        group, head, torso, leftLeg, rightLeg, leftArm, rightArm,
        speed: 1.0 + (i % 4) * 0.18,
        direction: side,
        phase: i * 1.7,
        lane
      });
    }
  }

  update(dt) {
    for (const person of this.people) {
      person.phase += dt * person.speed * 6.8;
      person.group.position.x += person.direction * person.speed * dt;
      if (person.group.position.x > 62) person.group.position.x = -62;
      if (person.group.position.x < -62) person.group.position.x = 62;
      person.group.rotation.y = person.direction > 0 ? Math.PI / 2 : -Math.PI / 2;

      const swing = Math.sin(person.phase) * 0.42;
      person.leftLeg.rotation.x = swing;
      person.rightLeg.rotation.x = -swing;
      person.leftArm.rotation.x = -swing * 0.8;
      person.rightArm.rotation.x = swing * 0.8;
      person.torso.position.y = 1.16 + Math.abs(Math.sin(person.phase * 2)) * 0.025;
      person.head.rotation.z = Math.sin(person.phase * 0.5) * 0.025;
    }
  }
}
