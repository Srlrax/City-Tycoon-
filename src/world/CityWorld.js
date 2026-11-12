import THREE from '../vendor/three.js';

const material = (color, roughness = 0.86) => new THREE.MeshStandardMaterial({ color, roughness });
function addBox(parent, x, y, z, sx, sy, sz, mat, cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}
function addCylinder(parent, x, y, z, rt, rb, h, mat, segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segments), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

export class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.tiles = [];
    this.tileByKey = new Map();
    this.roadMaterial = material(0x303941);
    this.sidewalkMaterial = material(0xb8b9ae);
    this.lotMaterial = new THREE.MeshStandardMaterial({ color: 0x71d69e, transparent: true, opacity: 0.0, roughness: 1 });
  }
  build() {
    const grass = material(0x66865f);
    const asphalt = this.roadMaterial;
    const sidewalk = this.sidewalkMaterial;
    const roadLine = material(0xe8e0c4);
    const concrete = material(0x8e9796);
    addBox(this.root, 0, -0.42, 0, 220, 0.7, 220, grass, false, true);

    // A connected street grid with sidewalks and painted lane markings.
    const roadCenters = [-66, -22, 22, 66];
    for (const p of roadCenters) {
      addBox(this.root, p, -0.035, 0, 11, 0.12, 205, asphalt, false, true);
      addBox(this.root, 0, -0.035, p, 205, 0.12, 11, asphalt, false, true);
      for (const s of [-1, 1]) {
        addBox(this.root, p + s * 6.3, 0.025, 0, 1.4, 0.18, 205, sidewalk, false, true);
        addBox(this.root, 0, 0.025, p + s * 6.3, 205, 0.18, 1.4, sidewalk, false, true);
      }
      for (let k = -9; k <= 9; k++) {
        if (k % 2 === 0) {
          addBox(this.root, p, 0.035, k * 10, 0.14, 0.025, 3.6, roadLine, false, false);
          addBox(this.root, k * 10, 0.035, p, 3.6, 0.025, 0.14, roadLine, false, false);
        }
      }
    }
    // Crosswalks at major intersections.
    for (const x of roadCenters) for (const z of roadCenters) {
      for (let n = -3; n <= 3; n++) {
        addBox(this.root, x + n * 1.45, 0.045, z - 7.1, 0.72, 0.025, 1.3, roadLine, false, false);
        addBox(this.root, x - 7.1, 0.045, z + n * 1.45, 1.3, 0.025, 0.72, roadLine, false, false);
      }
    }

    // Plots sit inside city blocks; their subtle green outline appears while building.
    const centers = [-44, 0, 44];
    const tileGeometry = new THREE.PlaneGeometry(17.5, 17.5);
    for (let ix = 0; ix < centers.length; ix++) {
      for (let iz = 0; iz < centers.length; iz++) {
        const x = centers[ix], z = centers[iz];
        const tile = new THREE.Mesh(tileGeometry, this.lotMaterial.clone());
        tile.rotation.x = -Math.PI / 2;
        tile.position.set(x, 0.025, z);
        tile.userData = { gx: x, gz: z, key: x + ',' + z };
        this.root.add(tile);
        this.tiles.push(tile);
        this.tileByKey.set(tile.userData.key, tile);
      }
    }

    // Distant neighborhood massing gives the skyline depth without heavy assets.
    const farColors = [0x8197a0, 0x9caaa8, 0x7d9095, 0xb5b3a4, 0x71868d];
    for (let i = 0; i < 54; i++) {
      const side = i % 4;
      const along = -92 + (i * 37 % 184);
      const x = side === 0 ? -101 : side === 1 ? 101 : along;
      const z = side === 2 ? -101 : side === 3 ? 101 : along;
      const h = 8 + (i * 17 % 34);
      const w = 8 + (i * 7 % 12);
      const b = addBox(this.root, x, h / 2 - 0.05, z, w, h, w, material(farColors[i % farColors.length]), true, true);
      b.position.y = h / 2 - 0.1;
    }
    this.addTreesAndStreetFurniture();
    return { tiles: this.tiles, tileByKey: this.tileByKey };
  }

  addTreesAndStreetFurniture() {
    const trunk = material(0x76533a), leaves = material(0x34784a), leaves2 = material(0x4f9559);
    for (let x = -90; x <= 90; x += 22) {
      for (const z of [-15.5, 15.5]) {
        if (Math.abs(x) < 16) continue;
        addCylinder(this.root, x, 1.15, z, 0.2, 0.28, 2.3, trunk, 8);
        addCylinder(this.root, x, 3, z, 0.08, 1.25, 2.5, leaves, 9);
        addCylinder(this.root, x + 0.15, 3.8, z, 0.03, 0.85, 1.6, leaves2, 9);
      }
    }
    const pole = material(0x33414a), lamp = new THREE.MeshStandardMaterial({ color: 0xffefc5, emissive: 0xd6a55d, emissiveIntensity: 0.25 });
    for (const p of [-66, -22, 22, 66]) {
      for (const side of [-1, 1]) {
        const x = p + side * 8.1;
        addCylinder(this.root, x, 3.1, -10, 0.09, 0.12, 6.2, pole, 8);
        addBox(this.root, x + 0.55, 6.12, -10, 1.1, 0.12, 0.14, pole, true, false);
        addBox(this.root, x + 1.0, 5.98, -10, 0.3, 0.17, 0.3, lamp, false, false);
      }
    }
  }
}
