import THREE from '../vendor/three.js';
export function createLighting(scene){
 scene.background=new THREE.Color(0x9bc8d8);
 scene.fog=new THREE.Fog(0xaac4c8,155,345);
 const hemi=new THREE.HemisphereLight(0xe7f4ff,0x59664b,1.25);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffe1bd,2.35);sun.position.set(-95,135,75);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-150;sun.shadow.camera.right=150;sun.shadow.camera.top=150;sun.shadow.camera.bottom=-150;sun.shadow.camera.near=1;sun.shadow.camera.far=290;sun.shadow.bias=-.0002;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xa9d9ff,.62);fill.position.set(70,45,-85);scene.add(fill);
 const bounce=new THREE.DirectionalLight(0xffc99c,.24);bounce.position.set(-35,18,90);scene.add(bounce);
 const disc=new THREE.Mesh(new THREE.SphereGeometry(5,24,16),new THREE.MeshBasicMaterial({color:0xffe6c3}));disc.position.set(-145,112,-205);scene.add(disc);
 return {sun,hemi,coolFill:fill,warmBounce:bounce,sunDisc:disc};
}