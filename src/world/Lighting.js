import THREE from '../vendor/three.js';

export function createLighting(scene) {
  scene.background = new THREE.Color(0x9fbfce);
  scene.fog = new THREE.Fog(0x9fbfce, 80, 235);
  const hemi = new THREE.HemisphereLight(0xdcefff, 0x53634e, 1.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe4bf, 2.5);
  sun.position.set(-55, 85, 38);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -110;
  sun.shadow.camera.right = 110;
  sun.shadow.camera.top = 110;
  sun.shadow.camera.bottom = -110;
  sun.shadow.bias = -0.00025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xa8d8ff, 0.45);
  fill.position.set(45, 25, -55);
  scene.add(fill);
  return { sun, hemi, fill };
}
