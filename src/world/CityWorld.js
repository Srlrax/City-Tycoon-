import THREE from '../vendor/three.js';
import { Roads } from './Roads.js';
import { CityBlock } from './CityBlock.js';
import { StreetProps } from './StreetProps.js';

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
    const grass = material(0x5e8058, 0.98);
    const soil = material(0x786f5b, 1);
    addBox(this.root, 0, -0.48, 0, 360, 0.8, 360, soil, false, true);
    addBox(this.root, 0, -0.045, 0, 280, 0.08, 280, grass, false, true);

    new Roads(this.root).build();
    this.createPlots();
    new StreetProps(this.root).build();
    new CityBlock(this.root).build();
    return { tiles: this.tiles, tileByKey: this.tileByKey };
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
