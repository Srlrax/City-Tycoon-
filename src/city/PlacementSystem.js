import THREE from '../vendor/three.js';
import { BUILDINGS } from './BuildingCatalog.js';
const standard = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
function addBox(parent,x,y,z,sx,sy,sz,mat,cast=true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);
  mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function addTree(parent,x,z,scale=1) {
  addBox(parent,x,.85*scale,z,.22*scale,1.7*scale,.22*scale,standard(0x76543a));
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.95*scale,1),standard(0x3e8750));
  crown.position.set(x,2*scale,z); crown.castShadow=true; parent.add(crown);
}
export class PlacementSystem {
  constructor(scene,renderer,camera,tiles,onRequestPlace) {
    this.scene=scene;this.renderer=renderer;this.camera=camera;this.tiles=tiles;this.onRequestPlace=onRequestPlace;
    this.selected='house';this.occupied=new Set();this.objects=[];this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.onClick=event=>this.handleClick(event);renderer.domElement.addEventListener('click',this.onClick);this.setBuildingMode(true);
  }
  select(id){this.selected=id;this.setBuildingMode(true);}
  setBuildingMode(active){
    for(const tile of this.tiles){const occupied=this.occupied.has(tile.userData.key);tile.material.opacity = active && !occupied ? 0.19 : 0;tile.material.color.set(occupied?0x888888:0x73e8a6);}
  }
  handleClick(event){
    if(event.button!==0)return;
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.pointer.x=((event.clientX-rect.left)/rect.width)*2-1;this.pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hits=this.raycaster.intersectObjects(this.tiles,false);if(!hits.length)return;
    const data=hits[0].object.userData;if(this.occupied.has(data.key))return;
    this.onRequestPlace(this.selected,data.gx,data.gz);
  }
  place(typeId,gx,gz){
    const key=gx+','+gz;if(this.occupied.has(key))return false;
    const spec=BUILDINGS.find(item=>item.id===typeId);if(!spec)return false;
    const group=this.createBuilding(spec,gx,gz);this.scene.add(group);this.occupied.add(key);
    this.objects.push({type:typeId,gx,gz,group});this.setBuildingMode(true);return true;
  }
  createBuilding(spec,gx,gz){
    const group=new THREE.Group();
    group.position.set(gx,0,gz);
    const w=spec.width,d=spec.depth;
    const concrete=standard(0xb9b9ad,.94);
    const wall=standard(spec.color,.82);
    const trim=standard(0xe8e2d3,.55);
    const dark=standard(0x263943,.48,.18);
    const glass=new THREE.MeshStandardMaterial({color:0x8fc4d5,roughness:.2,metalness:.28,emissive:0x172c36,emissiveIntensity:.12});
    const roof=standard(spec.id==='house'?0x75483b:0x354751,.76);
    addBox(group,0,.18,0,16.4,.34,16.4,concrete,false);

    if(spec.id==='park'){
      addBox(group,0,.43,0,15.7,.18,15.7,standard(0x5e985c));
      const path=standard(0xd5c5a4,.98);
      addBox(group,0,.55,0,2.2,.06,14,path,false);
      addBox(group,0,.55,0,14,.06,2.2,path,false);
      for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]){
        addBox(group,x,.9,z,.28,1.5,.28,standard(0x705039));
        const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,2),standard(0x397b48));
        crown.position.set(x,2.15,z);crown.castShadow=true;group.add(crown);
      }
      for(const [x,z] of [[-2,-3],[3,2]]) {
        addBox(group,x,.95,z,2.1,.16,.55,standard(0x86664a));
        addBox(group,x,.65,z,1.7,.18,.42,dark);
      }
      return group;
    }

    const isHouse=spec.id==='house';
    const floors=Math.max(1,spec.floors);
    const floorH=isHouse?2.8:2.9;
    const height=floors*floorH;
    addBox(group,0,.42+height/2,0,w,height,d,wall);
    // Strong corner pilasters and continuous floor bands give the facade depth.
    for(const x of [-w/2+.12,w/2-.12]){
      addBox(group,x,.45+height/2,0,.22,height-.12,d+.08,trim,false);
    }
    for(let floor=1;floor<floors;floor++){
      addBox(group,0,.42+floor*floorH,w*0+0,w+.18,.13,d+.18,trim,false);
    }
    // Windows on all four sides, with deep frames and subtle lower sills.
    const cols=isHouse?2:Math.max(3,Math.floor(w/2.5));
    const rows=isHouse?2:floors;
    for(let row=0;row<rows;row++){
      const y=isHouse?1.65+row*2.65:1.85+row*floorH;
      for(let col=0;col<cols;col++){
        const x=-w/2+(col+.5)*w/cols;
        const ww=isHouse?1.35:Math.min(1.45,w/cols*.62);
        for(const side of [-1,1]){
          const z=side*(d/2+.055);
          addBox(group,x,y,z,ww,1.25,.11,glass,false);
          addBox(group,x,y,z+side*.075,ww+.18,1.42,.08,trim,false);
          addBox(group,x,y-.72,z+side*.09,ww+.25,.12,.2,trim,false);
        }
      }
      const sideCols=Math.max(2,Math.floor(d/2.8));
      for(let col=0;col<sideCols;col++){
        const z=-d/2+(col+.5)*d/sideCols;
        for(const side of [-1,1]){
          const x=side*(w/2+.055);
          addBox(group,x,y,z,.11,1.25,Math.min(1.4,d/sideCols*.62),glass,false);
          addBox(group,x+side*.075,y,z,.08,1.42,Math.min(1.58,d/sideCols*.62)+.18,trim,false);
        }
      }
    }

    // A recognizable entrance, stoop, canopy and lit storefront glazing.
    const front=d/2+.12;
    const doorMat=standard(isHouse?0x684532:0x263b45,.5);
    addBox(group,0,1.55,front,1.25,2.55,.18,doorMat,false);
    addBox(group,.38,1.55,front+.11,.055,.055,.04,standard(0xe2c27a,.3,.65),false);
    addBox(group,0,.25,front+.55,2.5,.28,1.05,concrete,false);
    if(spec.id==='shop'||spec.id==='cafe'){
      const awning=standard(spec.id==='shop'?0xb94f42:0x456f67,.7);
      addBox(group,0,3.05,front+.22,w*.9,.48,.5,awning,false);
      for(let x=-w*.42;x<=w*.42;x+=.85)addBox(group,x,2.98,front+.48,.055,.5,.05,trim,false);
      addBox(group,0,3.85,front+.12,w*.78,.42,.12,dark,false);
      // Sign panel is intentionally geometry-only so it stays crisp at any resolution.
      addBox(group,0,4.25,front+.13,w*.68,.08,.1,trim,false);
      addBox(group,0,2.15,front+.14,w*.78,1.35,.12,glass,false);
    }

    if(isHouse){
      const roofGeo=new THREE.ConeGeometry(w*.78,2.8,4);
      const roofMesh=new THREE.Mesh(roofGeo,roof);
      roofMesh.position.set(0,height+1.75,0);
      roofMesh.rotation.y=Math.PI/4;
      roofMesh.castShadow=true;group.add(roofMesh);
      addBox(group,0,height+.35,0,w+.35,.18,d+.35,trim,false);
      addBox(group,-w*.28,1.6,front+.12,1.35,2.45,.16,standard(0x76523d),false);
      for(const x of [-w*.28,w*.28])addBox(group,x,3.15,front+.13,.12,2.8,.14,trim,false);
    } else {
      // Flat roof parapet and rooftop mechanical units.
      addBox(group,0,height+.18,0,w+.35,.38,d+.35,roof,false);
      for(const [x,z] of [[-w*.25,-d*.2],[w*.2,d*.18]]){
        addBox(group,x,height+.62,z,1.5,.72,1.25,dark);
        addBox(group,x,height+1.02,z,1.1,.1,.9,trim,false);
      }
      if(spec.id==='tower'||spec.id==='office'){
        for(let floor=0;floor<floors;floor++){
          const y=.9+floor*floorH;
          addBox(group,0,y,front+.12,w*.92,.1,.18,trim,false);
        }
      }
    }
    return group;
  }
  clear() {
    for (const item of this.objects) {
      this.scene.remove(item.group);
      const geometries = new Set();
      const materials = new Set();
      item.group.traverse(object => {
        if (!object.isMesh) return;
        if (object.geometry) geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          if (material) materials.add(material);
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    }
    this.objects = [];
    this.occupied.clear();
    this.selected = 'house';
    this.setBuildingMode(true);
  }

  getSaveData(){return this.objects.map(item=>({type:item.type,gx:item.gx,gz:item.gz}));}
  dispose(){this.renderer.domElement.removeEventListener('click',this.onClick);}
}
