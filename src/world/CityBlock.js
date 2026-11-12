import THREE from '../vendor/three.js';

const facadeColors = [0x89969a, 0xb1a99b, 0x6c7e86, 0x9caaa9, 0x7f8989, 0x9f9d91, 0x647a84];
const facade = color => new THREE.MeshStandardMaterial({ color, roughness: 0.86 });
function addBox(parent, x, y, z, sx, sy, sz, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

export class CityBlock {
  constructor(parent) { this.parent = parent; }

  build() {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x8fb9c6,
      emissive: 0x243c48,
      emissiveIntensity: 0.18,
      roughness: 0.24,
      metalness: 0.32
    });
    const windowGeometry = new THREE.BoxGeometry(1.05, 0.95, 0.055);
    const windowInstances = new THREE.InstancedMesh(windowGeometry, windowMaterial, 14000);
    windowInstances.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    const dummy = new THREE.Object3D();
    let windowCount = 0;
    let buildingIndex = 0;

    const createBuilding = (x, z, width, depth, height, rotation = 0) => {
      const color = facade(facadeColors[buildingIndex % facadeColors.length]);
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotation;
      this.parent.add(group);
      addBox(group, 0, height / 2, 0, width, height, depth, color);
      addBox(group, 0, height + 0.12, 0, width + 0.35, 0.24, depth + 0.35, facade(0x48565c), false);
      addBox(group, 0, 0.7, depth / 2 + 0.04, width * 0.92, 1.2, 0.12, facade(0x35454d), false);

      const floors = Math.max(2, Math.floor(height / 3.1));
      const columns = Math.max(2, Math.floor(width / 2.4));
      for (let floor = 0; floor < floors; floor++) {
        const y = 1.8 + floor * (height - 2.2) / floors;
        for (let column = 0; column < columns; column++) {
          const px = -width / 2 + (column + 0.5) * width / columns;
          for (const side of [-1, 1]) {
            dummy.position.set(px, y, side * (depth / 2 + 0.035));
            dummy.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation).add(new THREE.Vector3(x, 0, z));
            dummy.rotation.set(0, rotation, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            windowInstances.setMatrixAt(windowCount++, dummy.matrix);
          }
          const sideColumns = Math.max(2, Math.floor(depth / 2.6));
          for (let s = 0; s < sideColumns; s++) {
            const pz = -depth / 2 + (s + 0.5) * depth / sideColumns;
            for (const side of [-1, 1]) {
              dummy.position.set(side * (width / 2 + 0.035), y, pz);
              dummy.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation).add(new THREE.Vector3(x, 0, z));
              dummy.rotation.set(0, rotation + Math.PI / 2, 0);
              dummy.updateMatrix();
              windowInstances.setMatrixAt(windowCount++, dummy.matrix);
            }
          }
        }
      }

      // Rooftop equipment makes the skyline less like plain boxes.
      for (let unit = 0; unit < (height > 28 ? 3 : 1); unit++) {
        const ux = -width * 0.25 + unit * width * 0.25;
        addBox(group, ux, height + 0.75, 0, 1.8, 0.9, 1.4, facade(0x56636a), true);
        addBox(group, ux, height + 1.25, 0, 1.35, 0.12, 0.95, facade(0x879398), false);
      }
      buildingIndex++;
    };

    // High-rise perimeter blocks frame the playable neighborhood.
    for (let i = 0; i < 14; i++) {
      const along = -126 + i * 19;
      const h1 = 18 + ((i * 13) % 7) * 5;
      const h2 = 15 + ((i * 17) % 8) * 4;
      createBuilding(along, -126, 12 + (i % 3) * 2, 11, h1);
      createBuilding(along + 4, 126, 13 + (i % 2) * 2, 12, h2);
      if (i % 2 === 0) {
        createBuilding(-126, along, 12, 13, 20 + ((i * 11) % 8) * 4, Math.PI / 2);
        createBuilding(126, along + 6, 13, 12, 17 + ((i * 9) % 9) * 4, Math.PI / 2);
      }
    }

    windowInstances.count = windowCount;
    this.parent.add(windowInstances);
  }
}
