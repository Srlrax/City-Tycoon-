import THREE from '../vendor/three.js';
import { createNoiseTexture } from '../core/AssetLoader.js';

function addBox(parent, x, y, z, sx, sy, sz, material, cast = false) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh);
  return mesh;
}

export class Roads {
  constructor(parent) {
    this.parent = parent;
    this.centers = [-66, -22, 22, 66];
  }

  build() {
    const asphalt = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: createNoiseTexture('#454b4d', 17, 4, 36),
      roughness: 0.98,
      metalness: 0.02
    });
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: createNoiseTexture('#bfc0b7', 12, 5, 28),
      roughness: 0.94
    });
    const curb = new THREE.MeshStandardMaterial({ color: 0x9b9e98, roughness: 0.9 });
    const white = new THREE.MeshStandardMaterial({ color: 0xe8e7dd, roughness: 0.8 });
    const yellow = new THREE.MeshStandardMaterial({ color: 0xe4c56d, roughness: 0.8 });

    for (const p of this.centers) {
      addBox(this.parent, p, -0.025, 0, 11, 0.12, 218, asphalt);
      addBox(this.parent, 0, -0.025, p, 218, 0.12, 11, asphalt);
      for (const side of [-1, 1]) {
        addBox(this.parent, p + side * 6.3, 0.02, 0, 1.55, 0.16, 218, sidewalkMat);
        addBox(this.parent, 0, 0.02, p + side * 6.3, 218, 0.16, 1.55, sidewalkMat);
        addBox(this.parent, p + side * 5.58, 0.06, 0, 0.16, 0.24, 218, curb);
        addBox(this.parent, 0, 0.06, p + side * 5.58, 218, 0.24, 0.16, curb);
      }
    }

    // Lane markings are instanced so the detailed road network stays light.
    const dashGeometry = new THREE.BoxGeometry(0.14, 0.025, 3.2);
    const dashes = new THREE.InstancedMesh(dashGeometry, white, 400);
    const yellowGeometry = new THREE.BoxGeometry(0.13, 0.028, 5.5);
    const centerLines = new THREE.InstancedMesh(yellowGeometry, yellow, 400);
    const dummy = new THREE.Object3D();
    let dashCount = 0, yellowCount = 0;

    for (const p of this.centers) {
      for (let z = -104; z <= 104; z += 11) {
        dummy.position.set(p - 2.7, 0.055, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); dashes.setMatrixAt(dashCount++, dummy.matrix);
        dummy.position.set(p + 2.7, 0.055, z); dummy.updateMatrix(); dashes.setMatrixAt(dashCount++, dummy.matrix);
      }
      for (let x = -104; x <= 104; x += 11) {
        dummy.position.set(x, 0.055, p - 2.7); dummy.rotation.set(0, Math.PI / 2, 0); dummy.updateMatrix(); dashes.setMatrixAt(dashCount++, dummy.matrix);
        dummy.position.set(x, 0.055, p + 2.7); dummy.updateMatrix(); dashes.setMatrixAt(dashCount++, dummy.matrix);
      }
      for (let z = -104; z <= 104; z += 11) {
        dummy.position.set(p - 0.18, 0.058, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); centerLines.setMatrixAt(yellowCount++, dummy.matrix);
        dummy.position.set(p + 0.18, 0.058, z); dummy.updateMatrix(); centerLines.setMatrixAt(yellowCount++, dummy.matrix);
      }
      for (let x = -104; x <= 104; x += 11) {
        dummy.position.set(x, 0.058, p - 0.18); dummy.rotation.set(0, Math.PI / 2, 0); dummy.updateMatrix(); centerLines.setMatrixAt(yellowCount++, dummy.matrix);
        dummy.position.set(x, 0.058, p + 0.18); dummy.updateMatrix(); centerLines.setMatrixAt(yellowCount++, dummy.matrix);
      }
    }
    dashes.count = dashCount; centerLines.count = yellowCount;
    this.parent.add(dashes, centerLines);

    // Crosswalks at each street junction.
    const stripe = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.026, 1), white, 520);
    let stripeCount = 0;
    for (const x of this.centers) for (const z of this.centers) {
      for (const side of [-1, 1]) {
        for (let n = -3; n <= 3; n++) {
          dummy.position.set(x + n * 1.25, 0.067, z + side * 7.5);
          dummy.rotation.set(0, 0, 0); dummy.scale.set(0.78, 1, 1.2); dummy.updateMatrix(); stripe.setMatrixAt(stripeCount++, dummy.matrix);
          dummy.position.set(x + side * 7.5, 0.067, z + n * 1.25);
          dummy.rotation.set(0, Math.PI / 2, 0); dummy.scale.set(0.78, 1, 1.2); dummy.updateMatrix(); stripe.setMatrixAt(stripeCount++, dummy.matrix);
        }
      }
    }
    stripe.count = stripeCount;
    this.parent.add(stripe);
  }
}
