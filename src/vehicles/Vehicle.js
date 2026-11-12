import THREE from '../vendor/three.js';

const mat = (color, roughness = 0.55, metalness = 0.08, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

function addBox(parent, x, y, z, sx, sy, sz, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export class Vehicle {
  constructor(type = 'sedan', color = 0x3b6d88) {
    this.type = type;
    this.group = new THREE.Group();
    this.wheels = [];
    this.steeringWheels = [];
    this.speed = 0;

    const suv = type === 'suv';
    const sport = type === 'sport';
    const width = suv ? 2.18 : sport ? 1.96 : 2.02;
    const length = sport ? 4.55 : suv ? 4.65 : 4.35;
    const body = mat(color, 0.3, 0.32);
    const darkBody = mat(0x202a32, 0.38, 0.25);
    const glass = mat(0x5d8190, 0.16, 0.35, { transparent: true, opacity: 0.82 });
    const rubber = mat(0x11161b, 0.93, 0.02);
    const alloy = mat(0xb7c5ca, 0.28, 0.82);
    const trim = mat(0x27343d, 0.42, 0.42);
    const chrome = mat(0xd5dfe2, 0.24, 0.9);
    const headlight = new THREE.MeshStandardMaterial({ color: 0xfff3d7, emissive: 0xb68c4e, emissiveIntensity: 0.75, roughness: 0.25 });
    const tailLight = new THREE.MeshStandardMaterial({ color: 0xb82328, emissive: 0x5d0709, emissiveIntensity: 0.42, roughness: 0.28 });

    // Sculpted-looking lower body, hood, rear deck and bumpers.
    addBox(this.group, 0, 0.63, 0, width, 0.58, length, body);
    addBox(this.group, 0, 0.94, length * 0.27, width * 0.96, 0.2, length * 0.27, body);
    addBox(this.group, 0, 0.94, -length * 0.34, width * 0.94, 0.2, length * 0.23, body);
    addBox(this.group, 0, 0.39, length * 0.04, width * 1.02, 0.17, length * 0.82, darkBody);
    addBox(this.group, 0, 0.48, length * 0.52, width * 0.9, 0.24, 0.16, darkBody);
    addBox(this.group, 0, 0.48, -length * 0.52, width * 0.9, 0.24, 0.16, darkBody);

    // Roof and panoramic cabin glass.
    const roofLength = sport ? 1.7 : suv ? 2.25 : 2.0;
    const roofY = suv ? 1.75 : sport ? 1.48 : 1.62;
    addBox(this.group, 0, roofY, -0.1, width * 0.76, 0.16, roofLength, body);
    addBox(this.group, 0, 1.23, 0.42, width * 0.77, 0.58, 1.13, glass);
    addBox(this.group, 0, 1.22, -0.64, width * 0.77, 0.55, 0.86, glass);
    addBox(this.group, 0, 1.45, 0.01, width * 0.78, 0.08, 0.1, darkBody);
    for (const side of [-1, 1]) {
      addBox(this.group, side * width * 0.39, 1.21, -0.1, 0.075, 0.64, roofLength + 0.08, darkBody);
      addBox(this.group, side * width * 0.505, 0.98, -0.06, 0.045, 0.045, 1.2, chrome, false);
      addBox(this.group, side * width * 0.54, 1.08, 0.53, 0.22, 0.12, 0.27, body);
      addBox(this.group, side * width * 0.5, 0.76, -0.08, 0.035, 0.035, 0.72, trim, false);
    }

    // Windscreens, hood detailing, front grille and split headlamps.
    const windshield = addBox(this.group, 0, 1.22, 0.99, width * 0.73, 0.48, 0.07, glass, false);
    windshield.rotation.x = -0.2;
    const rearGlass = addBox(this.group, 0, 1.2, -1.08, width * 0.7, 0.44, 0.07, glass, false);
    rearGlass.rotation.x = 0.2;
    addBox(this.group, 0, 0.55, 2.13, 0.85, 0.3, 0.08, trim, false);
    for (let i = 0; i < 4; i++) addBox(this.group, -0.29 + i * 0.19, 0.55, 2.18, 0.035, 0.22, 0.025, chrome, false);
    for (const side of [-1, 1]) {
      addBox(this.group, side * 0.72, 0.83, 2.11, 0.48, 0.19, 0.08, headlight, false);
      addBox(this.group, side * 0.72, 0.83, -2.11, 0.42, 0.18, 0.08, tailLight, false);
      addBox(this.group, side * 0.86, 0.57, 2.16, 0.16, 0.09, 0.035, chrome, false);
      // Door handles and a subtle lower side sill.
      addBox(this.group, side * 1.01, 0.99, 0.38, 0.035, 0.045, 0.22, chrome, false);
      addBox(this.group, side * 1.01, 0.99, -0.55, 0.035, 0.045, 0.22, chrome, false);
      addBox(this.group, side * 1.02, 0.46, 0, 0.07, 0.1, 2.55, darkBody, false);
    }

    // Real wheel assemblies with alloy hubs and visible spokes.
    const wheelPositions = [
      [-width * 0.51, 0.42, 1.36], [width * 0.51, 0.42, 1.36],
      [-width * 0.51, 0.42, -1.36], [width * 0.51, 0.42, -1.36]
    ];
    for (let i = 0; i < wheelPositions.length; i++) {
      const [x, y, z] = wheelPositions[i];
      const wheel = new THREE.Group();
      wheel.position.set(x, y, z);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.24, 20), rubber);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheel.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.255, 18), alloy);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.27, 12), chrome);
      hub.rotation.z = Math.PI / 2;
      wheel.add(hub);
      for (let spoke = 0; spoke < 5; spoke++) {
        const angle = spoke * Math.PI * 2 / 5;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.22, 0.045), chrome);
        bar.position.set(0, Math.cos(angle) * 0.12, Math.sin(angle) * 0.12);
        bar.rotation.x = angle;
        wheel.add(bar);
      }
      this.group.add(wheel);
      this.wheels.push(wheel);
      if (i < 2) this.steeringWheels.push(wheel);
    }
    // Sidewall arches create a finished body silhouette.
    for (const side of [-1, 1]) {
      for (const z of [-1.36, 1.36]) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.055, 8, 18, Math.PI), darkBody);
        arch.position.set(side * width * 0.51, 0.43, z);
        arch.rotation.y = side === 1 ? Math.PI / 2 : -Math.PI / 2;
        arch.rotation.x = Math.PI;
        this.group.add(arch);
      }
    }
    this.group.traverse(obj => {
      if (obj.isMesh) obj.castShadow = true;
    });
  }

  update(dt, speed = 0, steering = 0) {
    const wheelSpin = speed * dt / 0.39;
    for (const wheel of this.wheels) wheel.rotation.x += wheelSpin;
    for (const wheel of this.steeringWheels) wheel.rotation.y = steering * 0.28;
    this.speed = speed;
  }
}
