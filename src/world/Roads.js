import THREE from '../vendor/three.js';
import { createNoiseTexture } from '../core/AssetLoader.js';

function box(parent,x,y,z,sx,sy,sz,mat,cast=false){
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);
  m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;
}
export class Roads{
  constructor(parent){this.parent=parent;this.centers=[-66,-22,22,66];}
  build(){
    const asphalt=new THREE.MeshStandardMaterial({color:0xffffff,map:createNoiseTexture('#343b40',21,5,42),roughness:.96,metalness:.03});
    const sidewalk=new THREE.MeshStandardMaterial({color:0xffffff,map:createNoiseTexture('#c6c6bd',14,7,32),roughness:.92});
    const curb=new THREE.MeshStandardMaterial({color:0x858d8d,roughness:.9});
    const white=new THREE.MeshStandardMaterial({color:0xf2f0e7,roughness:.8});
    const yellow=new THREE.MeshStandardMaterial({color:0xe7c96e,roughness:.8});
    const seam=new THREE.MeshStandardMaterial({color:0x252c30,roughness:1});
    const drain=new THREE.MeshStandardMaterial({color:0x354047,metalness:.45,roughness:.65});
    for(const p of this.centers){
      box(this.parent,p,-.025,0,11,.12,218,asphalt);
      box(this.parent,0,-.025,p,218,.12,11,asphalt);
      for(const side of [-1,1]){
        box(this.parent,p+side*6.3,.025,0,1.65,.19,218,sidewalk);
        box(this.parent,0,.025,p+side*6.3,218,.19,1.65,sidewalk);
        box(this.parent,p+side*5.52,.055,0,.18,.25,218,curb);
        box(this.parent,0,.055,p+side*5.52,218,.25,.18,curb);
        // Thin dark gutter seam makes the curb read as a separate raised edge.
        box(this.parent,p+side*5.36,.045,0,.08,.035,218,seam,false);
        box(this.parent,0,.045,p+side*5.36,218,.035,.08,seam,false);
      }
    }
    const dummy=new THREE.Object3D();
    const dashGeo=new THREE.BoxGeometry(.13,.025,3.1);
    const dashes=new THREE.InstancedMesh(dashGeo,white,360);
    const yellowGeo=new THREE.BoxGeometry(.13,.028,5.1);
    const center=new THREE.InstancedMesh(yellowGeo,yellow,360);
    let dc=0,yc=0;
    for(const p of this.centers){
      for(let q=-104;q<=104;q+=10.5){
        dummy.position.set(p-2.65,.055,q);dummy.rotation.set(0,0,0);dummy.updateMatrix();dashes.setMatrixAt(dc++,dummy.matrix);
        dummy.position.set(p+2.65,.055,q);dummy.updateMatrix();dashes.setMatrixAt(dc++,dummy.matrix);
        dummy.position.set(q,.055,p-2.65);dummy.rotation.y=Math.PI/2;dummy.updateMatrix();dashes.setMatrixAt(dc++,dummy.matrix);
        dummy.position.set(q,.055,p+2.65);dummy.updateMatrix();dashes.setMatrixAt(dc++,dummy.matrix);
      }
      for(let q=-104;q<=104;q+=10.5){
        dummy.position.set(p-.16,.058,q);dummy.rotation.y=0;dummy.updateMatrix();center.setMatrixAt(yc++,dummy.matrix);
        dummy.position.set(p+.16,.058,q);dummy.updateMatrix();center.setMatrixAt(yc++,dummy.matrix);
        dummy.position.set(q,.058,p-.16);dummy.rotation.y=Math.PI/2;dummy.updateMatrix();center.setMatrixAt(yc++,dummy.matrix);
        dummy.position.set(q,.058,p+.16);dummy.updateMatrix();center.setMatrixAt(yc++,dummy.matrix);
      }
    }
    dashes.count=dc;center.count=yc;this.parent.add(dashes,center);
    const stripes=new THREE.InstancedMesh(new THREE.BoxGeometry(.82,.028,1.15),white,500);
    let sc=0;
    for(const x of this.centers)for(const z of this.centers){
      for(const side of [-1,1])for(let n=-3;n<=3;n++){
        dummy.position.set(x+n*1.18,.073,z+side*7.55);dummy.rotation.y=0;dummy.scale.set(1,1,1);dummy.updateMatrix();stripes.setMatrixAt(sc++,dummy.matrix);
        dummy.position.set(x+side*7.55,.073,z+n*1.18);dummy.rotation.y=Math.PI/2;dummy.updateMatrix();stripes.setMatrixAt(sc++,dummy.matrix);
      }
      // Stop bars before pedestrian crossings.
      for(const side of [-1,1]){
        box(this.parent,x,.071,z+side*6.25,8.4,.035,.22,white,false);
        box(this.parent,x+side*6.25,.071,z, .22,.035,8.4,white,false);
      }
    }
    stripes.count=sc;this.parent.add(stripes);
    // Storm drains along curb edges and subtle manhole covers away from crossings.
    for(const p of this.centers){
      for(let q=-88;q<=88;q+=44)for(const side of [-1,1]){
        box(this.parent,p+side*5.15,.078,q, .62,.035,.22,drain,false);
        box(this.parent,q,.078,p+side*5.15,.22,.035,.62,drain,false);
      }
    }
    const manholeMat=new THREE.MeshStandardMaterial({color:0x596164,metalness:.55,roughness:.7});
    for(const [x,z] of [[-54,-54],[-10,10],[34,-54],[78,34],[-54,78]]){
      const m=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.045,20),manholeMat);
      m.position.set(x,.055,z);m.receiveShadow=true;this.parent.add(m);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.61,.045,6,24),drain);ring.rotation.x=Math.PI/2;ring.position.set(x,.085,z);this.parent.add(ring);
    }
  }
}