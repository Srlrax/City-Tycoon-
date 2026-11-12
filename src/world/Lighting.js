import THREE from '../vendor/three.js';

export function createLighting(scene) {
  const sky = new THREE.Color(0x94bdcf);
  scene.background = sky;
  scene.fog = new THREE.Fog(0xa7c4cb, 115, 275);

  const hemi = new THREE.HemisphereLight(0xdff3ff, 0x455b45, 1.55);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffedcf, 2.25);
  sun.position.set(-72, 105, 54);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -145;
  sun.shadow.camera.right = 145;
  sun.shadow.camera.top = 145;
  sun.shadow.camera.bottom = -145;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 260;
  sun.shadow.bias = -0.00018;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);

  const coolFill = new THREE.DirectionalLight(0x9dcfff, 0.48);
  coolFill.position.set(65, 38, -72);
  scene.add(coolFill);

  const warmBounce = new THREE.DirectionalLight(0xffd4aa, 0.22);
  warmBounce.position.set(-25, 12, 75);
  scene.add(warmBounce);

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(5, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xffedce })
  );
  sunDisc.position.set(-130, 95, -185);
  scene.add(sunDisc);

  return { sun, hemi, coolFill, warmBounce, sunDisc };
}
