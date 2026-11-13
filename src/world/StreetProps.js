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
    cylinder(this.parent,x,1.28,z,.18,.3,2.45,bark,10);
    // A tapered trunk, visible scaffold branches and a broad, layered leafy crown.
    for(const [dx,dz,lean] of [[-.55,.12,-.48],[.48,-.2,.42],[.12,.52,.18],[-.18,-.5,-.22]]){
      const branch=cylinder(this.parent,x+dx*.48,2.05,z+dz*.48,.075,.13,1.18,bark,7);
      branch.rotation.z=lean;branch.rotation.x=dz*.45;
    }
    const crownParts=[
      [0,3.12,0,1.25,0],[.78,3.22,.12,.88,1],[-.72,3.18,-.18,.9,2],
      [.12,3.68,-.48,.82,3],[-.28,3.48,.58,.78,1],[.52,3.72,.48,.68,2],
      [-.62,3.62,.38,.7,0],[.08,4.02,.02,.62,3]
    ];
    for(const [ox,oy,oz,s,k] of crownParts){
      const crown=new THREE.Mesh(new THREE.SphereGeometry(s,12,10),leaf[(Math.abs(along/22)+k)%leaf.length]);
      crown.position.set(x+ox,oy,z+oz);crown.scale.set(1.08,1,.96);crown.castShadow=true;crown.receiveShadow=true;this.parent.add(crown);
    }
    // Low groundcover and a dark mulch ring finish the base of each street tree.
    const mulch=new THREE.Mesh(new THREE.CylinderGeometry(1.03,1.03,.055,18),mat(0x4a4035,1));
    mulch.position.set(x,.245,z);mulch.receiveShadow=true;this.parent.add(mulch);
    for(let q=0;q<5;q++){
      const tuft=new THREE.Mesh(new THREE.SphereGeometry(.23,8,6),leaf[(q+1)%leaf.length]);
      const a=q*Math.PI*2/5;tuft.position.set(x+Math.cos(a)*.78,.39,z+Math.sin(a)*.78);tuft.scale.set(1,.58,1);this.parent.add(tuft);
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

  // Layered neighborhood landscaping: raised flower beds, clipped shrubs and ornamental stones.
  const soil=mat(0x51483d,1), shrubMats=[mat(0x285f3c),mat(0x397b48),mat(0x4c8b50)], flowerMats=[mat(0xe7c77b),mat(0xd98f86),mat(0xe8e2c5)];
  const gardenSpots=[[-112,-34],[112,34],[-34,112],[34,-112]];
  for(let i=0;i<gardenSpots.length;i++){
   const [x,z]=gardenSpots[i], bed=new THREE.Group();bed.position.set(x,0,z);this.parent.add(bed);
   box(bed,0,.16,0,8.2,.28,2.25,planter,false);
   box(bed,0,.32,0,7.75,.12,1.82,soil,false);
   for(let n=0;n<7;n++){
    const px=-3.15+n*1.05, shrub=new THREE.Mesh(new THREE.SphereGeometry(.58+(n%2)*.1,10,8),shrubMats[(n+i)%shrubMats.length]);
    shrub.position.set(px,.78,(n%2?-.28:.28));shrub.scale.y=.78;shrub.castShadow=true;bed.add(shrub);
    if(n%2===0){const bloom=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),flowerMats[(n+i)%flowerMats.length]);bloom.position.set(px,.98,(n%2?-.28:.28));bed.add(bloom);}
   }
  }
  // Small ornamental rock groups soften the greenbelt edges.
  const stoneMats=[mat(0x89918c,.95),mat(0x737d78,.95)];
  for(const [x,z] of [[-124,-122],[124,-122],[-124,122],[124,122],[-118,0],[118,0]]){
   for(let i=0;i<3;i++){
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.48+i*.12,0),stoneMats[i%2]);
    rock.position.set(x+(i-1)*.72,.34,z+(i%2)*.32);rock.scale.set(1.25,.72,.9);rock.rotation.y=i*.8;rock.castShadow=true;this.parent.add(rock);
   }
  }
  // Continuous planted verges between street trees make sidewalks feel
  // maintained and lived-in, while keeping the walking surface clear.
  const vergeShrubs=[mat(0x2f6e43),mat(0x427f4c),mat(0x568c51)];
  const bloomColors=[mat(0xf0d58b),mat(0xd98982),mat(0xe8e5cf),mat(0xb9a6d7)];
  for(const road of [-66,-22,22,66])for(const side of [-1,1]){
   for(let along=-88;along<=88;along+=22){
    const x=along+11,z=road+side*9.15;
    for(let n=0;n<3;n++){
     const bush=new THREE.Mesh(new THREE.SphereGeometry(.43+(n%2)*.08,9,7),vergeShrubs[(n+Math.abs(along/22))%vergeShrubs.length]);
     bush.position.set(x-.8+n*.8,.43,z+(n%2?-.34:.34));bush.scale.y=.76;bush.castShadow=true;this.parent.add(bush);
    }
    for(let n=0;n<4;n++){
     cylinder(this.parent,x-1.05+n*.7,.27,z+side*.9,.025,.025,.42,vergeShrubs[0],5);
     const bloom=new THREE.Mesh(new THREE.SphereGeometry(.12,7,6),bloomColors[(n+Math.abs(along/22))%bloomColors.length]);
     bloom.position.set(x-1.05+n*.7,.51,z+side*.9);this.parent.add(bloom);
    }
   }
  }

  // Bike racks, fire hydrants and picnic tables add recognizable human-scale
  // details away from intersections and traffic lanes.
  const red=mat(0xb64e3d,.72), concrete=mat(0x9b9b91,.94), picnicWood=mat(0x98724d);
  for(const [x,z,rot] of [[-48,-13,0],[48,13,Math.PI],[-13,48,Math.PI/2],[13,-48,-Math.PI/2]]){
   const rack=new THREE.Group();rack.position.set(x,0,z);rack.rotation.y=rot;this.parent.add(rack);
   for(const offset of [-.58,.58]){
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(.34,.055,7,16,Math.PI),steel);
    hoop.rotation.z=Math.PI;hoop.position.set(offset,.56,0);rack.add(hoop);
    cylinder(rack,offset,.23,0,.055,.055,.46,steel,8);
   }
  }
  for(const [x,z] of [[-59,-74],[59,-74],[-59,74],[59,74],[-74,-15],[74,15],[-15,-74],[15,74]]){
   cylinder(this.parent,x,.48,z,.19,.16,.92,red,9);
   cylinder(this.parent,x,.94,z,.13,.13,.12,red,9);
   box(this.parent,x,.67,z,.42,.12,.3,red,false);
   box(this.parent,x,.99,z,.24,.08,.24,concrete,false);
  }
  for(const [x,z,rot] of [[-91,-42,0],[91,42,Math.PI],[-42,91,Math.PI/2],[42,-91,-Math.PI/2]]){
   const table=new THREE.Group();table.position.set(x,0,z);table.rotation.y=rot;this.parent.add(table);
   box(table,0,.86,0,2.5,.16,1.05,picnicWood);
   for(const side of [-1,1]){
    box(table,0,.55,side*.78,2.35,.13,.32,picnicWood);
    for(const end of [-.88,.88])box(table,end,.42,side*.78,.12,.8,.12,steel);
   }
   for(const end of [-.9,.9])box(table,end,.42,0,.12,.8,.12,steel);
  }

  // Stone-edged planting islands break up the open corners between blocks.
  const islandSoil=mat(0x554b3c,1), islandEdge=mat(0x8c958b,.95);
  for(const [x,z] of [[-91,-13],[91,13],[-13,91],[13,-91],[-91,13],[91,-13],[13,91],[-13,-91]]){
   const island=new THREE.Group();island.position.set(x,0,z);this.parent.add(island);
   box(island,0,.14,0,5.2,.24,2.4,islandEdge,false);
   box(island,0,.28,0,4.82,.1,2.02,islandSoil,false);
   for(let n=0;n<5;n++){
    const shrub=new THREE.Mesh(new THREE.SphereGeometry(.42+(n%2)*.1,9,7),vergeShrubs[n%vergeShrubs.length]);
    shrub.position.set(-1.7+n*.85,.67,(n%2?-.24:.24));shrub.scale.y=.8;shrub.castShadow=true;island.add(shrub);
    if(n===1||n===3){
     const flower=new THREE.Mesh(new THREE.SphereGeometry(.14,7,6),bloomColors[(n+1)%bloomColors.length]);
     flower.position.set(shrub.position.x,.93,shrub.position.z);island.add(flower);
    }
   }
  }

  // Signature park-like planting pockets: curved stone paths, layered perennial beds,
  // ornamental grasses and flowering shrubs create deliberate landscape composition.
  const pathMat=mat(0xb6b1a1,.98), pathEdge=mat(0x777d72,.96);
  const perennial=[mat(0x385f3d),mat(0x477c49),mat(0x638b50),mat(0x8c9b59)];
  const bloom=[mat(0xf1d28b),mat(0xd58b91),mat(0xd6c6e8),mat(0xf0eee0),mat(0xe6a65f)];
  const parkCenters=[[-94,-94],[-94,94],[94,-94],[94,94]];
  for(let p=0;p<parkCenters.length;p++){
    const [cx,cz]=parkCenters[p], park=new THREE.Group();park.position.set(cx,0,cz);this.parent.add(park);
    // A gently bending pale gravel walk, edged with small stone pavers.
    const pts=[new THREE.Vector3(-4.2,.075,-2.6),new THREE.Vector3(-2.2,.075,-1.4),new THREE.Vector3(-.4,.075,-1.7),new THREE.Vector3(1.5,.075,-.55),new THREE.Vector3(4.1,.075,.9)];
    const curve=new THREE.CatmullRomCurve3(pts);
    const walk=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.48,7,false),pathMat);walk.receiveShadow=true;park.add(walk);
    for(let n=0;n<13;n++){
      const t=n/12, point=curve.getPoint(t);
      for(const side of [-1,1]){
        const pebble=new THREE.Mesh(new THREE.BoxGeometry(.48,.12,.24),pathEdge);
        pebble.position.set(point.x+side*.55,.08,point.z);pebble.rotation.y=-.35;park.add(pebble);
      }
    }
    // Curved beds with mixed-height shrubs and flower drifts.
    for(let bed=0;bed<2;bed++){
      const bx=bed===0?-2.3:2.6, bz=bed===0?2.45:-2.3;
      for(let n=0;n<9;n++){
        const px=bx+(n-4)*.58, pz=bz+Math.sin(n*.55+bed)*.36;
        const bush=new THREE.Mesh(new THREE.SphereGeometry(.38+(n%3)*.08,10,8),perennial[(n+p+bed)%perennial.length]);
        bush.position.set(px,.42,pz);bush.scale.y=.82;bush.castShadow=true;park.add(bush);
        if(n%2===0){
          const stem=cylinder(park,px,.73,pz,.018,.025,.48,perennial[2],5);
          const head=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),bloom[(n+p)%bloom.length]);
          head.position.set(px,.99,pz);head.scale.set(1,1.25,1);park.add(head);
        }
      }
    }
    // Upright ornamental grass fans add height and movement to the planting.
    for(let n=0;n<8;n++){
      const gx=(n%4)*1.8-2.7, gz=(n<4?-3.8:3.7);
      for(let blade=0;blade<5;blade++){
        const grassBlade=new THREE.Mesh(new THREE.ConeGeometry(.09,.92,5),perennial[(blade+n)%perennial.length]);
        const a=blade*Math.PI*2/5;grassBlade.position.set(gx+Math.cos(a)*.18,.49,gz+Math.sin(a)*.18);
        grassBlade.rotation.z=Math.cos(a)*.24;grassBlade.rotation.x=Math.sin(a)*.24;park.add(grassBlade);
      }
    }
    // A low timber seat gives each pocket a clear human-scale focal point.
    box(park,0,.47,4.1,2.1,.14,.48,wood);
    for(const sx of [-.78,.78])box(park,sx,.24,4.1,.12,.48,.38,steel);
    for(let n=0;n<6;n++){
      const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.22+(n%2)*.08,0),stoneMats[n%2]);
      rock.position.set(-3.7+n*1.45,.2,4.65+(n%2)*.28);rock.scale.set(1.4,.7,1);park.add(rock);
    }
  }
  // Flowering groundcover ribbons run along the outer greenbelt in natural clusters.
  for(let side of [-1,1]){
    for(let n=0;n<34;n++){
      const x=-126+n*7.6,z=side*133;
      for(let k=0;k<3;k++){
        const plant=new THREE.Mesh(new THREE.SphereGeometry(.2+(k%2)*.06,8,6),perennial[(n+k)%perennial.length]);
        plant.position.set(x+(k-1)*.48,.25,z+(k%2?-.55:.55));plant.scale.y=.7;this.parent.add(plant);
      }
      if(n%2===0){
        const flower=new THREE.Mesh(new THREE.SphereGeometry(.12,7,6),bloom[n%bloom.length]);
        flower.position.set(x,.46,z);this.parent.add(flower);
      }
    }
  }

 }
}