import THREE from '../vendor/three.js';

const material = (color, roughness = 0.86, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
function addBox(parent, x, y, z, sx, sy, sz, mat, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function addCylinder(parent, x, y, z, top, bottom, height, mat, segments = 10) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), mat);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

export class StreetProps {
  constructor(parent) { this.parent = parent; }

  build() {
    const trunk = material(0x65452f);
    const leafMats = [material(0x39784a), material(0x4a8c50), material(0x568f59)];
    const sidewalkGreen = material(0x58764b);
    const lightPole = material(0x34404a, 0.5, 0.55);
    const lamp = new THREE.MeshStandardMaterial({ color: 0xffefc9, emissive: 0xe0b66b, emissiveIntensity: 0.65, roughness: 0.3 });
    const benchWood = material(0x866448);
    const benchMetal = material(0x303b43, 0.52, 0.58);
    const binMat = material(0x516b68, 0.72, 0.25);

    // Trees have varied crowns and small ground planters.
    for (const road of [-66, -22, 22, 66]) {
      for (let along = -92; along <= 92; along += 23) {
        if (Math.abs(along) < 15) continue;
        for (const side of [-1, 1]) {
          const x = along;
          const z = road + side * 8.25;
          addBox(this.parent, x, 0.12, z, 3.1, 0.18, 3.1, sidewalkGreen, false);
          addCylinder(this.parent, x, 1.15, z, 0.19, 0.28, 2.1, trunk, 9);
          const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.22 + (Math.abs(along) % 3) * 0.1, 1), leafMats[Math.abs(along / 23) % 3 | 0]);
          crown.position.set(x, 2.75, z); crown.scale.set(1, 1.05, 1); crown.castShadow = true; this.parent.add(crown);
          const crown2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), leafMats[(Math.abs(along / 23) + 1) % 3 | 0]);
          crown2.position.set(x + 0.55, 2.95, z - 0.28); crown2.castShadow = true; this.parent.add(crown2);
        }
      }
    }

    // Tall street lamps and small urban furniture.
    for (const road of [-66, -22, 22, 66]) {
      for (let along = -88; along <= 88; along += 44) {
        for (const side of [-1, 1]) {
          const x = road + side * 8.3;
          const z = along;
          addCylinder(this.parent, x, 3.2, z, 0.065, 0.105, 6.4, lightPole, 8);
          addBox(this.parent, x + 0.48, 6.31, z, 0.96, 0.1, 0.12, lightPole);
          const head = addBox(this.parent, x + 0.92, 6.18, z, 0.28, 0.2, 0.32, lamp);
          head.castShadow = false;
        }
      }
    }

    for (const [x, z] of [[-31, -12], [31, 12], [-12, 31], [12, -31], [-75, 12], [75, -12]]) {
      addBox(this.parent, x, 0.28, z, 0.95, 0.56, 0.8, binMat);
      addBox(this.parent, x, 0.58, z, 1.02, 0.08, 0.86, lightPole, false);
    }

    // Benches along sidewalks, away from road crossings.
    for (const [x, z, rotation] of [[-36, -14, 0], [36, 14, Math.PI], [-14, 36, Math.PI / 2], [14, -36, -Math.PI / 2]]) {
      const bench = new THREE.Group(); bench.position.set(x, 0, z); bench.rotation.y = rotation; this.parent.add(bench);
      addBox(bench, 0, 0.55, 0, 1.9, 0.14, 0.52, benchWood);
      addBox(bench, 0, 1.02, -0.2, 1.9, 0.72, 0.12, benchWood);
      for (const side of [-0.72, 0.72]) {
        addBox(bench, side, 0.28, 0, 0.12, 0.56, 0.42, benchMetal);
      }
    }
  }
}
