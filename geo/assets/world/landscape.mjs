import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ribbon} from './exterior.mjs';

const bark=new THREE.MeshStandardMaterial({color:0x645042,roughness:1});
const foliage=new THREE.MeshStandardMaterial({roughness:.93,side:THREE.DoubleSide});
const wood=new THREE.CylinderGeometry(.57,1,1,7);
const leaf=new THREE.BufferGeometry();
leaf.setAttribute('position',new THREE.Float32BufferAttribute([
 0,0,0,-.43,.55,0,0,1,.07,.43,.55,-.07,
],3));
leaf.setIndex([0,1,2,0,2,3]);
leaf.computeVertexNormals();
const leafCluster=mergeGeometries([
 leaf.clone().scale(.57,.62,.64).rotateZ(-.62).rotateY(.2).translate(-.19,.30,.12),
 leaf.clone().scale(.55,.74,.55).rotateZ(.53).rotateY(1.16).translate(.22,.22,-.19),
 leaf.clone().scale(.69,.66,.67).rotateZ(.1).rotateY(-1.4).translate(.09,.63,.13),
 leaf.clone().scale(.57,.68,.53).rotateZ(-.46).rotateY(-.83).translate(-.22,-.16,-.22),
]);

function generator(seed) {
 return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
const vector=(x,y,z)=>new THREE.Vector3(x,y,z);
const vertical=vector(0,1,0);
const hues=[0x354923,0x47602d,0x586b33,0x6a7337,0x788443,0x72613a].map(c=>new THREE.Color(c));
const shrubHues=[0x454d2f,0x59623b,0x62623c,0x77704b,0x9a895b].map(c=>new THREE.Color(c));

export function addPlanting(parent,plants,name) {
 const branches=[],leaves=[];
 function branch(a,b,r){
  const delta=b.clone().sub(a);
  const rotation=new THREE.Quaternion().setFromUnitVectors(vertical,delta.clone().normalize());
  branches.push(new THREE.Matrix4().compose(a.clone().lerp(b,.5),rotation,vector(r,delta.length(),r)));
 }
 function spray(centre,radius,size,count,palette,random) {
  for(let i=0;i<count;i++){
   const angle=random()*Math.PI*2,span=random()**.5*radius;
   const point=centre.clone().add(vector(Math.cos(angle)*span,(random()-.46)*radius,Math.sin(angle)*span));
   const rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(random()*2.8-1.4,angle,random()*1.8-.9));
   const length=size*(.58+random()*.76);
   leaves.push([new THREE.Matrix4().compose(point,rotation,vector(.83*length,length,length)),
    palette[Math.floor(random()*palette.length)]]);
  }
 }
 for(const {x,y,z,height,width,young=false,shrub=false,seed} of plants){
  const random=generator(seed),ground=vector(x,y,z);
  if(shrub){
   const spread=width/2;
   for(let i=0;i<5;i++){
    const angle=random()*Math.PI*2,span=spread*(.18+random()*.5);
    const tip=ground.clone().add(vector(Math.cos(angle)*span,height*(.57+random()*.37),Math.sin(angle)*span));
    branch(ground,tip,.013);
    spray(tip,spread*.54,spread*.63,23,shrubHues,random);
    spray(ground.clone().lerp(tip,.57),spread*.45,spread*.6,12,shrubHues,random);
   }
   continue;
  }
  const radius=width/2,leanX=radius*(random()-.44)*.3,leanZ=radius*(random()-.44)*.3;
  const trunk=t=>ground.clone().add(vector(leanX*t*t,height*t,leanZ*t*t));
  branch(ground,trunk(.48),height*(young?.018:.023));
  branch(trunk(.48),trunk(.79),height*.013);
  branch(trunk(.79),trunk(.97),height*.008);
  const limbs=young?10:16;
  for(let i=0;i<limbs;i++){
   const angle=(i+random()*.55)*2.39996;
   const level=i/(limbs-1);
   const origin=trunk(.38+.47*level);
   const span=radius*(.44+.55*Math.sin(Math.PI*(.08+.92*level)));
   const tip=origin.clone().add(vector(Math.cos(angle)*span,height*(.12+.08*random()),Math.sin(angle)*span));
   branch(origin,tip,height*(.0105-.006*level));
   for(const direction of [-1,1]){
    const a=angle+direction*(.35+random()*.39);
    const twig=tip.clone().add(vector(Math.cos(a)*span*.28,height*.061,Math.sin(a)*span*.28));
    branch(origin.clone().lerp(tip,.61),twig,height*.0035);
    spray(twig,radius*(young?.24:.33),height*(young?.067:.079),young?29:47,hues,random);
   }
  }
 }
 const limbs=new THREE.InstancedMesh(wood,bark,branches.length);
 branches.forEach((matrix,i)=>limbs.setMatrixAt(i,matrix));
 limbs.name=name+' · trunks and branches';limbs.castShadow=true;limbs.receiveShadow=true;parent.add(limbs);
 const crowns=new THREE.InstancedMesh(leafCluster,foliage,leaves.length);
 leaves.forEach(([matrix,color],i)=>{crowns.setMatrixAt(i,matrix);crowns.setColorAt(i,color);});
 crowns.name=name+' · foliage';crowns.castShadow=true;crowns.receiveShadow=true;parent.add(crowns);
}

export function plantEastQuadIsland(parent) {
 addPlanting(parent,[
  {x:-1.95,y:.56,z:-.26,height:5.8,width:2.18,young:true,seed:8},
  {x:1.53,y:.56,z:.22,height:4.25,width:1.68,young:true,seed:19},
  ...Array.from({length:23},(_,i)=>{
   const random=generator(i+27),angle=i*2.39996,r=.32+.56*random();
   return {x:4.65*r*Math.cos(angle),y:.56,z:1.8*r*Math.sin(angle),
    height:.33+.53*random(),width:.53+.48*random(),shrub:true,seed:i+77};
  }),
 ],'East Quad · curved planter');
}

export function addCampusLandscape(scene,features,heightAt,blocked,pavedArea){
 const soil=new THREE.MeshStandardMaterial({color:0x514537,roughness:1});
 const stone=new THREE.MeshStandardMaterial({color:0xa8a69b,roughness:.95});
 const beds=[
  // The three planted islands north of East Quad are visible in the GDA
  // aerial and in the north forecourt photographs. Use their mapped outlines.
  {id:'way/1208522270',trees:[[102.5,-83.6,5.1,2.3],[107.3,-82.4,4.7,1.9]],count:24},
  {id:'way/1208522272',trees:[[126.1,-94.8,9,7.0],[134.7,-94.2,7.8,5.5],[137.5,-91,5.1,2.8]],count:34},
  {id:'way/1208522271',trees:[[148.9,-95.5,5.4,2.4]],count:14},
  // Broadstone plaza's bed borders the paved approach from Constitution Hill.
  {id:'way/1126932695',trees:[[390,-139,4.5,1.95],[401,-141.4,4.9,2.2]],count:33},
 ];
 function inside(poly,x,n){
  return poly.reduce((hit,[a,b],i)=>{
   const [c,d]=poly[(i+1)%poly.length];
   return (b>n)!==(d>n)&&x<a+(n-b)*(c-a)/(d-b)?!hit:hit;
  },false);
 }
 for(const [index,{id,trees,count}] of beds.entries()){
  const bed=features.find(f=>f.id===id);
  if(!bed)continue;
  const poly=bed.coords;
  const label=index===3?'Broadstone Plaza · planted bed':'East Quad · mapped planting island '+(index+1);
  const soilLevel=index===3?.119:.17;
  pavedArea(poly,soil,soilLevel,label+' soil');
  ribbon(scene,poly,[[.075,soilLevel-.09],[.075,soilLevel+.055],[-.075,soilLevel+.055],[-.075,soilLevel-.09]],
   stone,heightAt,label+' edge');
  const east=poly.map(p=>p[0]),north=poly.map(p=>p[1]);
  const [a,b]=[Math.min(...east),Math.min(...north)];
  const [w,d]=[Math.max(...east)-a,Math.max(...north)-b];
  const random=generator(11+index*91),plants=[];
  const margin=(x,n)=>[[x-.4,n],[x+.4,n],[x,n-.4],[x,n+.4]].every(p=>inside(poly,...p));
  const add=(x,n,height,width,shrub,young)=>{
   if(!blocked(x,n)&&margin(x,n))plants.push({x,y:heightAt(x,n)+soilLevel-.02,z:-n,height,width,shrub,young,seed:Math.floor(random()*1e8)});
  };
  for(const [x,n,h,width] of trees)add(x,n,h,width,false,h<6);
  for(let i=0,added=0;i<count*12&&added<count;i++){
   const before=plants.length;
   add(a+w*random(),b+d*random(),.38+.40*random(),.55+.35*random(),true,false);
   added+=plants.length-before;
  }
  if(plants.length)addPlanting(scene,plants,label);
 }
}
