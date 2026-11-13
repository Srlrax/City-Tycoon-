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
    if(event.button!==0 || document.pointerLockElement)return;
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
      // Two correctly oriented roof planes meet at a raised ridge. Their outer
      // edges land at the wall top instead of dipping below the eaves.
      const roofRise = 2.5;
      const roofRun = w / 2;
      const roofLength = Math.hypot(roofRun, roofRise);
      const roofAngle = Math.atan2(roofRise, roofRun);
      const roofCenterY = height + .42 + roofRise / 2;
      const roofPanelA = addBox(group, -w*.25, roofCenterY, 0, roofLength, .24, d+1.05, roof);
      roofPanelA.rotation.z = roofAngle;
      const roofPanelB = addBox(group, w*.25, roofCenterY, 0, roofLength, .24, d+1.05, roof);
      roofPanelB.rotation.z = -roofAngle;
      addBox(group,0,height+.42+roofRise,0,.3,.28,d+1.18,standard(0x49302b),false);
      // Dark fascia makes the roof edge read clearly against the walls.
      for (const side of [-1,1]) {
        const fascia = addBox(group, side*w*.49, height+.52, 0, .18,.28,d+1.18,standard(0x49302b),false);
      }
      addBox(group,0,height+.25,0,w+.25,.18,d+.25,trim,false);
      // Chimney and cap sit behind the ridge.
      addBox(group,w*.29,height+1.55,-d*.18,.72,2.0,.78,standard(0x8b5947),true);
      addBox(group,w*.29,height+2.58,-d*.18,.92,.16,.96,standard(0x493b36),false);
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

    // Finish each lot as a cared-for property rather than a building floating
    // on a square pad: paving, planted borders, shrubs, and a small street tree.
    const hedgeMat=standard(0x39734b,.95);
    const pathMat=standard(0xbab8ad,.98);
    const soilMat=standard(0x51483d,1);
    const flowerMats=[standard(0xe7c77b),standard(0xd98f86),standard(0xe8e2c5)];
    for(const side of [-1,1]){
      const hedge=new THREE.Mesh(new THREE.BoxGeometry(2.6,.55,.55),hedgeMat);
      hedge.position.set(side*(w/2+1.15),.55,-d*.25);hedge.castShadow=true;group.add(hedge);
      // Raised flower border alongside the entry approach.
      const bedX=side*(w/2+1.15), bedZ=front+1.5;
      addBox(group,bedX,.2,bedZ,1.55,.28,2.8,trim,false);
      addBox(group,bedX,.36,bedZ,1.32,.08,2.55,soilMat,false);
      for(let n=0;n<4;n++){
        const shrub=new THREE.Mesh(new THREE.SphereGeometry(.28+(n%2)*.05,9,7),hedgeMat);
        shrub.position.set(bedX-.42+n*.28,.67,bedZ-.75+(n%2)*.38);
        shrub.scale.y=.78;shrub.castShadow=true;group.add(shrub);
        if(n%2===0){
          const bloom=new THREE.Mesh(new THREE.SphereGeometry(.105,7,6),flowerMats[(n+(side>0?1:0))%flowerMats.length]);
          bloom.position.set(shrub.position.x,.88,shrub.position.z);group.add(bloom);
        }
      }
    }
    // A straight front walk links the porch to the sidewalk-facing lot edge.
    addBox(group,0,.265,front+1.55,2.4,.12,2.1,pathMat,false);
    addBox(group,0,.255,front+3.35,1.35,.1,2.25,pathMat,false);
    // Small stepping-stone joints add scale and detail to the approach.
    for(let n=0;n<4;n++) addBox(group,0,.315,front+2.45+n*.48,1.42,.025,.035,standard(0x8e918b),false);
    if(isHouse){
      // Compact front lawn and a low picket fence frame the home without
      // blocking the driveway or the path to the front door.
      addBox(group,0,.205,-d*.5-1.55,w*.76,.12,2.0,standard(0x638b59),false);
      const fence=standard(0xe5dfcf,.86);
      for(let x=-7.2;x<=7.21;x+=1.2){
        addBox(group,x,.72,-7.78,.09,1.0,.09,fence,false);
        const picket=addBox(group,x,.98,-7.78,.16,.22,.12,fence,false);
        picket.rotation.z=0;
      }
      addBox(group,0,.47,-7.78,14.6,.1,.1,fence,false);
      addBox(group,0,.88,-7.78,14.6,.1,.1,fence,false);
      // A leafy ornamental tree and mailbox complete the front garden.
      addBox(group,-6.55,.82,-4.9,.18,1.6,.18,standard(0x76543a),false);
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.92,1),standard(0x397b49));
      crown.position.set(-6.55,2.05,-4.9);crown.castShadow=true;group.add(crown);
      addBox(group,6.7,.62,front+2.1,.16,1.0,.16,standard(0x34444b),false);
      addBox(group,6.7,1.12,front+2.1,.62,.38,.52,standard(0x9a6548),false);
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
