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
    const concrete=standard(0xc5c3b8,.96);
    const trim=standard(0xf0e9dc,.58);
    const dark=standard(0x1c303a,.42,.2);
    const glass=new THREE.MeshStandardMaterial({color:0x9bcbd9,roughness:.16,metalness:.3,emissive:0x1a3440,emissiveIntensity:.16});
    const roof=standard(spec.id==='house'?0x653d34:0x263b49,.72);
    const wall=standard(spec.color,.86);
    addBox(group,0,.18,0,16.4,.34,16.4,concrete,false);

    if(spec.id==='park'){
      addBox(group,0,.43,0,15.7,.18,15.7,standard(0x5c965b));
      const path=standard(0xd8c8a8,.98);
      addBox(group,0,.55,0,2.3,.06,14,path,false);
      addBox(group,0,.55,0,14,.06,2.3,path,false);
      for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]){
        addBox(group,x,.9,z,.25,1.5,.25,standard(0x705039));
        const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,2),standard(0x397b48));
        crown.position.set(x,2.1,z);crown.castShadow=true;group.add(crown);
      }
      for(const [x,z] of [[-2,-3],[3,2]]){
        addBox(group,x,.95,z,2.1,.16,.55,standard(0x86664a));
        addBox(group,x,.65,z,1.7,.18,.42,dark);
      }
      return group;
    }

    const isHouse=spec.id==='house';
    const isStore=spec.id==='shop'||spec.id==='cafe';
    const floors=Math.max(1,spec.floors);
    const floorH=isHouse?2.8:2.9;
    const height=floors*floorH;
    addBox(group,0,.42+height/2,0,w,height,d,wall);
    // Corner columns, floor ledges and a proper raised foundation break up the plain box.
    for(const x of [-w/2+.12,w/2-.12]){
      addBox(group,x,.45+height/2,0,.24,height-.12,d+.12,trim,false);
    }
    addBox(group,0,.72,d/2+.035,w+.14,.22,.14,trim,false);
    for(let floor=1;floor<floors;floor++){
      addBox(group,0,.42+floor*floorH,0,w+.22,.16,d+.22,trim,false);
    }

    // Recessed framed windows on every side, with visible sills and mullions.
    const cols=isHouse?2:Math.max(3,Math.floor(w/2.45));
    const rows=isHouse?2:floors;
    for(let row=0;row<rows;row++){
      const y=isHouse?1.65+row*2.65:1.85+row*floorH;
      for(let col=0;col<cols;col++){
        const x=-w/2+(col+.5)*w/cols;
        const ww=isHouse?1.28:Math.min(1.5,w/cols*.68);
        for(const side of [-1,1]){
          const z=side*(d/2+.07);
          addBox(group,x,y,z,ww,1.28,.12,glass,false);
          addBox(group,x-ww/2-.07,y,z+side*.07,.12,1.48,.13,trim,false);
          addBox(group,x+ww/2+.07,y,z+side*.07,.12,1.48,.13,trim,false);
          addBox(group,x,y+.7,z+side*.07,ww+.24,.1,.13,trim,false);
          addBox(group,x,y-.7,z+side*.07,ww+.24,.12,.18,trim,false);
          addBox(group,x,y,z+side*.09,.055,1.25,.06,trim,false);
        }
      }
      const sideCols=Math.max(2,Math.floor(d/2.8));
      for(let col=0;col<sideCols;col++){
        const z=-d/2+(col+.5)*d/sideCols;
        for(const side of [-1,1]){
          const x=side*(w/2+.07);
          const ww=Math.min(1.45,d/sideCols*.66);
          addBox(group,x,y,z,.12,1.28,ww,glass,false);
          addBox(group,x+side*.07,y,z,.13,1.48,ww+.2,trim,false);
        }
      }
    }

    const front=d/2+.14;
    // Door, entry canopy, steps and a glazed shopfront.
    addBox(group,0,1.55,front,1.18,2.45,.2,standard(isHouse?0x67442f:0x203943,.5),false);
    addBox(group,.37,1.55,front+.12,.055,.055,.045,standard(0xe2c27a,.3,.65),false);
    addBox(group,0,.28,front+.62,2.7,.28,1.2,concrete,false);
    if(isStore){
      addBox(group,0,2.0,front+.06,w*.82,1.65,.16,glass,false);
      addBox(group,0,3.1,front+.24,w*.94,.48,.58,standard(spec.id==='shop'?0xb44c3e:0x376f68,.68),false);
      for(let x=-w*.43;x<=w*.43;x+=.8)addBox(group,x,3.03,front+.53,.045,.5,.05,trim,false);
      const signCanvas=document.createElement('canvas');
      signCanvas.width=512;signCanvas.height=128;
      const ctx=signCanvas.getContext('2d');
      ctx.fillStyle=spec.id==='shop'?'#9e382f':'#28574f';ctx.fillRect(0,0,512,128);
      ctx.fillStyle='#fff8e9';ctx.font='bold 54px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(spec.id==='shop'?'MARKET':'COFFEE',256,65);
      const signTex=new THREE.CanvasTexture(signCanvas);signTex.colorSpace=THREE.SRGBColorSpace;
      const signMat=new THREE.MeshStandardMaterial({map:signTex,roughness:.7});
      addBox(group,0,4.0,front+.12,w*.76,.62,.14,signMat,false);
    }

    if(isHouse){
      // Twin sloped roof planes create a recognizable gable instead of a pyramid cap.
      const roofPanelA=addBox(group,-w*.245,height+1.18,0,w*.58,.2,d+1.0,roof);
      roofPanelA.rotation.z=0.52;
      const roofPanelB=addBox(group,w*.245,height+1.18,0,w*.58,.2,d+1.0,roof);
      roofPanelB.rotation.z=-0.52;
      addBox(group,0,height+2.5,0,.22,.24,d+1.15,standard(0x4a302a),false);
      addBox(group,0,height+.25,0,w+.25,.18,d+.25,trim,false);
      // Porch posts and a warm front awning.
      addBox(group,-w*.34,1.75,front+.48,.14,3.0,.14,trim,false);
      addBox(group,w*.34,1.75,front+.48,.14,3.0,.14,trim,false);
      addBox(group,0,3.28,front+.48,w*.82,.18,1.0,roof,false);
      addBox(group,-w*.27,1.7,front+.13,1.1,2.3,.16,standard(0x76523d),false);
    }else{
      // Flat commercial roof, parapet, HVAC units and a rooftop sign frame.
      addBox(group,0,height+.18,0,w+.38,.42,d+.38,roof,false);
      for(const [x,z] of [[-w*.25,-d*.2],[w*.2,d*.18]]){
        addBox(group,x,height+.68,z,1.55,.78,1.25,dark);
        addBox(group,x,height+1.1,z,1.12,.1,.92,trim,false);
      }
      if(spec.id==='tower'||spec.id==='office'){
        for(let floor=0;floor<floors;floor++){
          const y=.9+floor*floorH;
          addBox(group,0,y,front+.13,w*.92,.1,.18,trim,false);
          if(floor>0){
            addBox(group,0,y+.42,front+.28,w*.72,.12,.5,dark,false);
          }
        }
      }
    }

    // Low clipped hedges and a short paved approach make the property sit in the lot.
    const hedgeMat=standard(0x39734b,.95);
    for(const side of [-1,1]){
      const hedge=new THREE.Mesh(new THREE.BoxGeometry(2.6,.55,.55),hedgeMat);
      hedge.position.set(side*(w/2+1.15),.55,-d*.25);hedge.castShadow=true;group.add(hedge);
    }
    addBox(group,0,.27,front+1.55,2.4,.12,2.1,standard(0xb9b6aa,.95),false);
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
