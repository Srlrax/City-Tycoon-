import THREE from '../vendor/three.js';
export class PedestrianSystem {
  constructor(scene){
    this.people=[];const colors=[0x315d7b,0x9a674e,0x687f59,0x6e668b,0xa6a7a1,0x8c4e4b];
    for(let i=0;i<10;i++){
      const group=new THREE.Group(),shirt=new THREE.MeshStandardMaterial({color:colors[i%colors.length],roughness:.9}),skin=new THREE.MeshStandardMaterial({color:0xc99475,roughness:.95}),pants=new THREE.MeshStandardMaterial({color:0x293746,roughness:.95});
      const torso=new THREE.Mesh(new THREE.BoxGeometry(.48,.72,.28),shirt);torso.position.y=1.12;torso.castShadow=true;group.add(torso);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),skin);head.position.y=1.62;head.castShadow=true;group.add(head);
      for(const x of [-.13,.13]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,.55,.18),pants);leg.position.set(x,.33,0);leg.castShadow=true;group.add(leg);}
      group.position.set(-48+i*10,0,i%2===0?15.5:-15.5);scene.add(group);
      this.people.push({group,speed:1.1+(i%3)*.25,direction:i%2===0?1:-1});
    }
  }
  update(dt){
    for(const person of this.people){person.group.position.x+=person.speed*dt*person.direction;if(person.group.position.x>60)person.group.position.x=-60;if(person.group.position.x<-60)person.group.position.x=60;person.group.rotation.y=person.direction>0?Math.PI/2:-Math.PI/2;}
  }
}
