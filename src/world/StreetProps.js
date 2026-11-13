import THREE from '../vendor/three.js';
const mat=(color,roughness=.86,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function box(parent,x,y,z,sx,sy,sz,m,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(parent,x,y,z,r1,r2,h,m,n=10){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,n),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
export class StreetProps{
 constructor(parent){this.parent=parent;}
 build(){
  const bark=mat(0x62432f),leaf=[mat(0x286b43),mat(0x347d4a),mat(0x438b50),mat(0x57945a)];
  const planter=mat(0x68786a),steel=mat(0x26343c,.48,.62),wood=mat(0x89684a),lamp=new THREE.MeshStandardMaterial({color:0xffe9bd,emissive:0xffc66e,emissiveIntensity:.8,roughness:.28});
  // Trees sit on the outer sidewalk verge. Every intersection gets a generous clear zone.
  for(const road of [-66,-22,22,66])for(let along=-92;along<=92;along+=22){
   if([-66,-22,22,66].some(c=>Math.abs(along-c)<13))continue;
   for(const side of [-1,1]){
    const x=along,z=road+side*9.15;
    box(this.parent,x,.12,z,2.05,.2,2.05,planter,false);
    cylinder(this.parent,x,1.18,z,.2,.31,2.15,bark,10);
    // Three overlapping canopy clusters make the tree less like a single polygon ball.
    for(const [ox,oy,oz,s,k] of [[0,2.75,0,1.12,0],[.62,2.92,.08,.78,1],[-.5,2.85,-.22,.72,2],[.08,3.35,-.1,.66,3]]){
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(s,2),leaf[(Math.abs(along/22)+k)%leaf.length]);
      crown.position.set(x+ox,oy,z+oz);crown.scale.set(1,1.06,.96);crown.castShadow=true;crown.receiveShadow=true;this.parent.add(crown);
    }
   }
  }
  // Modern curved-arm streetlights with warm lanterns.
  for(const road of [-66,-22,22,66])for(let along=-88;along<=88;along+=44)for(const side of [-1,1]){
   const x=road+side*8.35,z=along;
   cylinder(this.parent,x,3.15,z,.075,.12,6.3,steel,10);
   const arm=box(this.parent,x+side*.48,6.2,z,.95,.09,.12,steel);arm.rotation.z=-side*.12;
   box(this.parent,x+side*.92,6.08,z,.34,.2,.4,lamp,false);
  }
  // Benches, litter bins and small planted beds in pedestrian pockets.
  for(const [x,z,r] of [[-35,-13,0],[35,13,Math.PI],[-13,35,Math.PI/2],[13,-35,-Math.PI/2],[-79,13,0],[79,-13,Math.PI]]){
   const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=r;this.parent.add(g);
   box(g,0,.58,0,1.9,.13,.55,wood);box(g,0,1.03,-.2,1.9,.68,.12,wood);
   for(const sx of [-.72,.72]){box(g,sx,.3,0,.12,.6,.45,steel);box(g,sx,.83,-.2,.12,.7,.1,steel);}
  }
  for(const [x,z] of [[-31,-12],[31,12],[-12,31],[12,-31],[-79,13],[79,-13]]){
   box(this.parent,x,.42,z,.68,.82,.66,mat(0x425f60,.68,.28));
   box(this.parent,x,.86,z,.72,.08,.7,steel,false);
  }
  // Decorative low hedges in the park-side green strips, not on the road surface.
  const hedge=mat(0x367348);
  for(const [x,z,rot] of [[-34,-9,0],[34,9,0],[-9,34,Math.PI/2],[9,-34,Math.PI/2]]){
   const h=box(this.parent,x,.48,z,5.5,.82,.8,hedge);h.rotation.y=rot;
  }
 }
}