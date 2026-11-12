import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
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
    for(const tile of this.tiles){const occupied=this.occupied.has(tile.userData.key);tile.material.opacity=active&&!occupied?.19:0;tile.material.color.set(occupied?0x888888:0x73e8a6);}
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
    const group=new THREE.Group();group.position.set(gx,0,gz);const w=spec.width,d=spec.depth;
    addBox(group,0,.22,0,16.2,.42,16.2,standard(0xaaa99d));
    if(spec.id==='park'){
      addBox(group,0,.48,0,15.5,.16,15.5,standard(0x60965a));
      for(const [x,z] of [[-4,-4],[4,-3],[-3,4],[4,4]])addTree(group,x,z,.8);
      addBox(group,0,.72,0,3.6,.18,.48,standard(0x98714e));
      addBox(group,0,.58,0,.55,.18,12.5,standard(0xc2ad81),false);return group;
    }
    const house=spec.id==='house',floors=Math.max(1,spec.floors),floorHeight=house?2.2:2.7,height=floors*floorHeight;
    const facade=standard(spec.color,.72),glass=new THREE.MeshStandardMaterial({color:0x9cc7d6,roughness:.24,metalness:.18});
    const trim=standard(house?0xeee1c9:0xd5dce0,.55),roof=standard(house?0x744c42:0x465965,.68);
    addBox(group,0,.5+height/2,0,w,height,d,facade);addBox(group,0,height+.62,0,w+.5,.25,d+.5,roof);
    addBox(group,0,1, d/2+.08,1.25,2,.16,standard(0x3a4b55));
    const columns=house?2:4;
    for(let floor=0;floor<floors;floor++){
      const y=1.45+floor*floorHeight;
      for(let i=0;i<columns;i++){
        const x=(i-(columns-1)/2)*(house?2.25:2.45);
        addBox(group,x,y,d/2+.055,house?.95:1.05,1,.09,glass,false);
        addBox(group,x,y,-d/2-.055,house?.95:1.05,1,.09,glass,false);
        addBox(group,x,y-.58,d/2+.08,house?1.05:1.15,.09,.12,trim,false);
      }
    }
    if(house){
      const roofShape=new THREE.Mesh(new THREE.ConeGeometry(w*.78,2.5,4),roof);
      roofShape.position.set(0,height+1.9,0);roofShape.rotation.y=Math.PI/4;roofShape.castShadow=true;group.add(roofShape);
      addBox(group,-w*.27,1.15,d/2+.16,1.1,2.3,.2,standard(0x705444));
    }else{
      for(let x=-w/2+1.2;x<w/2-.5;x+=2.6)addBox(group,x,height+.83,-d/2+1.1,.85,.65,.85,standard(0x68757a));
      if(spec.id==='shop'||spec.id==='cafe'){
        addBox(group,0,3,d/2+.14,w*.72,.42,.24,standard(spec.id==='shop'?0xb84f43:0x67483b));
        for(let x=-w/2+1;x<w/2;x+=1.6)addBox(group,x,1.55,d/2+.12,.12,2.5,.12,trim,false);
      }
      if(spec.id==='tower'||spec.id==='office')for(let floor=0;floor<floors;floor++)addBox(group,0,.7+floor*floorHeight,d/2+.09,w*.88,.08,.12,trim,false);
    }
    return group;
  }
  getSaveData(){return this.objects.map(item=>({type:item.type,gx:item.gx,gz:item.gz}));}
  dispose(){this.renderer.domElement.removeEventListener('click',this.onClick);}
}
