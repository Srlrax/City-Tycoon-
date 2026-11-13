import THREE from '../vendor/three.js';
import { Roads } from './Roads.js';
import { CityBlock } from './CityBlock.js';
import { StreetProps } from './StreetProps.js';
import { createNoiseTexture } from '../core/AssetLoader.js';

const material = (color, roughness = 0.86) => new THREE.MeshStandardMaterial({ color, roughness });
function addBox(parent, x, y, z, sx, sy, sz, mat, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
}

export class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.tiles = [];
    this.tileByKey = new Map();
    this.lotMaterial = new THREE.MeshStandardMaterial({
      color: 0x71d69e,
      transparent: true,
      opacity: 0,
      roughness: 1,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }

  build() {
    const grass = new THREE.MeshStandardMaterial({ color: 0xffffff, map: createNoiseTexture('#6f8b61', 34, 34, 42), roughness: 1 });
    const soil = material(0x655d50, 1);
    addBox(this.root, 0, -0.48, 0, 360, 0.8, 360, soil, false, true);
    addBox(this.root, 0, -0.045, 0, 280, 0.08, 280, grass, false, true);\n    // Broad, low-contrast greenbelt beyond the playable blocks softens the city edge.\n    const verge = material(0x78916a, 1);\n    addBox(this.root, 0, -0.012, -137, 280, 0.035, 6, verge, false, true);\n    addBox(this.root, 0, -0.012, 137, 280, 0.035, 6, verge, false, true);

    new Roads(this.root).build();
    this.createPlots();
    new StreetProps(this.root).build();
    this.createGroundDetails();
    new CityBlock(this.root).build();
    return { tiles: this.tiles, tileByKey: this.tileByKey };
  }

  createGroundDetails() {
    // Instanced grass clumps and tiny wildflowers break up the large green spaces
    // without adding hundreds of individual draw calls.
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x789d61, roughness: 1 });
    const bladeGeo = new THREE.ConeGeometry(0.075, 0.42, 4);
    const blades = new THREE.InstancedMesh(bladeGeo, bladeMat, 1250);
    const flowerGeo = new THREE.SphereGeometry(0.075, 5, 4);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xe7d99b, roughness: 0.8 });
    const flowers = new THREE.InstancedMesh(flowerGeo, flowerMat, 170);
    const dummy = new THREE.Object3D();
    let bladeCount = 0;
    let flowerCount = 0;
    let seed = 78231;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 1250; i++) {
      const x = (rand() - 0.5) * 258;
      const z = (rand() - 0.5) * 258;
      const onRoad = [-66, -22, 22, 66].some(v => Math.abs(x - v) < 7.5 || Math.abs(z - v) < 7.5);
      const onLot = [-44, 0, 44].some(gx => [-44, 0, 44].some(gz => Math.abs(x - gx) < 9.5 && Math.abs(z - gz) < 9.5));
      if (onRoad || onLot) continue;
      dummy.position.set(x, 0.13, z);
      dummy.rotation.set((rand() - 0.5) * 0.18, rand() * Math.PI, (rand() - 0.5) * 0.18);
      const scale = 0.55 + rand() * 0.8;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      blades.setMatrixAt(bladeCount++, dummy.matrix);
      if (flowerCount < 170 && rand() > 0.78) {
        dummy.position.set(x + 0.18, 0.16, z - 0.12);
        dummy.scale.setScalar(0.65 + rand() * 0.5);
        dummy.updateMatrix();
        flowers.setMatrixAt(flowerCount++, dummy.matrix);
      }
    }
    blades.count = bladeCount;
    flowers.count = flowerCount;
    this.root.add(blades, flowers);
  }

  createPlots() {
    const centers = [-44, 0, 44];
    const geometry = new THREE.PlaneGeometry(17.5, 17.5);
    for (const x of centers) for (const z of centers) {
      const tile = new THREE.Mesh(geometry, this.lotMaterial.clone());
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x, 0.035, z);
      tile.userData = { gx: x, gz: z, key: x + ',' + z };
      this.root.add(tile);
      this.tiles.push(tile);
      this.tileByKey.set(tile.userData.key, tile);
    }
  }
}
