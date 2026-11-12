import THREE from '../vendor/three.js';
const paint=color=>new THREE.MeshStandardMaterial({color,roughness:.42,metalness:.12});
function box(parent,x,y,z,sx,sy,sz,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
export class TrafficSystem {
  constructor(scene){
    this.root=new THREE.Group();scene.add(this.root);this.cars=[];const colors=[0xc64d42,0xe0e0dc,0x356b91,0x343b43,0xd4a64e,0x5d806b];
    for(let i=0;i<8;i++)this.addCar(i,colors[i%colors.length]);
  }
  addCar(index,color){
    const car=new THREE.Group(),body=paint(color),glass=new THREE.MeshStandardMaterial({color:0x8fb8c6,roughness:.22,metalness:.25});
    box(car,0,.62,0,2.05,.72,4.1,body);box(car,0,1.13,-.18,1.65,.72,2.15,glass);
    const tire=paint(0x171b20);
    for(const x of [-.96,.96])for(const z of [-1.25,1.25]){
      const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,12),tire);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.4,z);car.add(wheel);
    }
    const lamp=new THREE.MeshStandardMaterial({color:0xfff1c4,emissive:0x997b42,emissiveIntensity:.2});
    box(car,-.62,.68,2.07,.35,.2,.08,lamp);box(car,.62,.68,2.07,.35,.2,.08,lamp);
    this.root.add(car);
    const lane=index%4,axis=lane<2?'z':'x',fixed=lane===0?-22:lane===1?22:lane===2?-22:22,direction=index%2===0?1:-1,variable=-82+index*21;
    car.position.set(axis==='z'?fixed+(direction>0?2.7:-2.7):variable,0,axis==='z'?variable:fixed+(direction>0?-2.7:2.7));
    car.rotation.y=axis==='z'?(direction>0?0:Math.PI):(direction>0?Math.PI/2:-Math.PI/2);
    this.cars.push({car,axis,direction,speed:5+(index%3)*1.3});
  }
  update(dt){for(const item of this.cars){const axis=item.axis;item.car.position[axis]+=item.direction*item.speed*dt;if(item.car.position[axis]>102)item.car.position[axis]=-102;if(item.car.position[axis]<-102)item.car.position[axis]=102;}}
}
