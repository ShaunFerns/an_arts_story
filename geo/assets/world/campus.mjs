import * as THREE from 'three';
import {addBuildingRoof,buildingDesign,roofLevel} from './roofs.mjs';
export {buildingDesign} from './roofs.mjs';

const materials = {
  centralBrick:new THREE.MeshStandardMaterial({color:0xc9beb0,roughness:.92}),
  harling:new THREE.MeshStandardMaterial({color:0xc5c2b7,roughness:1}),
  lowerStone:new THREE.MeshStandardMaterial({color:0xb5a38b,roughness:.96}),
  wardStone:new THREE.MeshStandardMaterial({color:0xa9a69a,roughness:.96}),
  infirmaryStone:new THREE.MeshStandardMaterial({color:0x959698,roughness:.96}),
  chapelStone:new THREE.MeshStandardMaterial({color:0x817f7a,roughness:.96}),
  clockStone:new THREE.MeshStandardMaterial({color:0xa59a86,roughness:.96}),
  sash:new THREE.MeshStandardMaterial({color:0x70716d,roughness:.75}),
  terracotta:new THREE.MeshStandardMaterial({color:0x9d7850,roughness:.85}),
  polishedStone:new THREE.MeshStandardMaterial({color:0x858a86,roughness:.73}),
  shade:new THREE.MeshStandardMaterial({color:0x33393d,roughness:.78}),
  precast:new THREE.MeshStandardMaterial({color:0xb9b4a7,roughness:.85}),
  limestone:new THREE.MeshStandardMaterial({color:0x696d68,roughness:.9}),
  render:new THREE.MeshStandardMaterial({color:0xc0bbac,roughness:1}),
  glass:new THREE.MeshStandardMaterial({color:0x395764,metalness:.28,roughness:.25}),
  glassLight:new THREE.MeshStandardMaterial({color:0x69828b,metalness:.16,roughness:.33}),
  historic:new THREE.MeshStandardMaterial({color:0x9a8e7d,roughness:.95}),
  slate:new THREE.MeshStandardMaterial({color:0x50575a,roughness:.91}),
  steel:new THREE.MeshStandardMaterial({color:0x454b4a,roughness:.57}),
};

export function buildingPalette(feature) {
  const name = feature.name || '';
  if (/central quad/i.test(name)) return 'central';
  if (/academic hub/i.test(name) || ['way/1361416599','way/1457282385'].includes(feature.id)) return 'library';
  if (/greenway hub|goirtín/i.test(name)) return 'contemporary';
  if (/laurence|glassmanogue|rathdown|clocktower|orchard|all saints|north house|bradogue|stanhope|grianán|lower house/i.test(name) ||
      feature.id==='way/307799384') return 'heritage';
  return 'context';
}

const masonryTypes={
 centralBrick:[32,8,5,2], harling:[100,62,20,1],
 lowerStone:[19,11,14,4], wardStone:[18,9,18,4],
 infirmaryStone:[20,10,22,4], chapelStone:[18,11,20,4], clockStone:[16,9,20,4],
};
function setMasonryMap(key,material){
 if(material.map||!masonryTypes[key])return;
 const [courses,bays,variation,joint]=masonryTypes[key];
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#98938c';ctx.fillRect(0,0,512,256);
 let seed=7301;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const rubble=['wardStone','infirmaryStone','chapelStone'].includes(key);
 const rows=Array.from({length:courses},()=>rubble?.70+random()*.60:1);
 const height=256/rows.reduce((sum,h)=>sum+h,0),width=512/bays;
 let y=0;
 for(const [row,scale] of rows.entries()){
  let x=-width*(row%2)*.5;
  while(x<512){
   const cut=width*(key==='harling'?1:rubble?.48+random()*.98:.78+random()*.42);
   const tone=Math.round(231+(random()-.5)*variation*2);
   ctx.fillStyle=`rgb(${tone},${tone},${tone})`;
   const end=y+scale*height;
   if(rubble){
    ctx.beginPath();
    ctx.moveTo(x+joint*.4,y+random()*2);
    ctx.lineTo(x+cut-joint*.35,y+random()*2);
    ctx.lineTo(x+cut-joint*.45,end-joint*.42);
    ctx.lineTo(x+joint*.36,end-joint*.50);
    ctx.closePath();ctx.fill();
   }else ctx.fillRect(x+joint/2,y,cut-joint,scale*height-joint/2);
   if(joint>1){
    ctx.fillStyle='#ffffff19';
    ctx.fillRect(x+joint,y+.5,Math.max(0,cut-joint*2.3),1.0);
   }
   x+=cut;
  }
  y+=scale*height;
 }
 material.map=new THREE.CanvasTexture(canvas);
 material.map.colorSpace=THREE.SRGBColorSpace;
 material.map.wrapS=material.map.wrapT=THREE.RepeatWrapping;
 material.map.repeat.set(.34,.39);
 material.map.anisotropy=8;
}
export function shellMaterial(palette,feature,height) {
 const design=buildingDesign(feature,palette,height);
 const key=design.stone||{heritage:'historic',contemporary:'steel',context:'precast'}[palette];
 const material=materials[key];
 setMasonryMap(key,material);
 return material;
}

export function outsideNormal(a,b,orientation) {
  const dx=b[0]-a[0], dn=b[1]-a[1], length=Math.hypot(dx,dn);
  return [orientation*dn/length,-orientation*dx/length];
}

export function winding(poly) {
  return Math.sign(poly.slice(1).reduce((area,b,i)=>{
    const a=poly[i];
    return area+a[0]*b[1]-b[0]*a[1];
  },0));
}

export function addCampusFacades(scene, buildings, groundHeight, entrances) {
  const box = new THREE.BoxGeometry(1,1,1);
  const pointed = new THREE.Shape();
  pointed.moveTo(-.5,-.5);
  pointed.lineTo(.5,-.5);
  pointed.lineTo(.5,.05);
  pointed.quadraticCurveTo(.37,.3,0,.5);
  pointed.quadraticCurveTo(-.37,.3,-.5,.05);
  pointed.closePath();
  const arch = new THREE.ShapeGeometry(pointed);
  const prototype = new THREE.Object3D();
  const batches = {};
  const labels = [];
  function panel(key,x,y,n,w,h,d,yaw) {
    prototype.position.set(x,y,-n);
    prototype.rotation.y=yaw;
    prototype.scale.set(w,h,d);
    prototype.updateMatrix();
    (batches[key]??=[]).push(prototype.matrix.clone());
  }
  for (const {feature,height,base,palette,design} of buildings) {
    const poly=feature.coords, orientation=winding(poly);
    const door=entrances.find(e=>e.source===feature.id);
    const historic=palette==='heritage',chapel=feature.id==='way/310375420';
    const roof=addBuildingRoof(scene,feature,design,base,shellMaterial(palette,feature,height));
    const levels=design.levels||Math.max(1,Math.min(5,Math.floor(height/3.1)));
    const floor=(historic?design.eaves:height)/levels;
    let windowCount=0;
    for(let i=1;i<poly.length;i++) {
      const a=poly[i-1], b=poly[i], [ox,on]=outsideNormal(a,b,orientation);
      const len=Math.hypot(a[0]-b[0],a[1]-b[1]);
      if(len<2.8)continue;
      const yaw=Math.atan2(ox,-on);
      const point=(s,offset)=>[a[0]+(b[0]-a[0])*s+ox*offset,a[1]+(b[1]-a[1])*s+on*offset];
      const part=(key,s,offset,y,w,h,d)=>{
       const [x,n]=point(s,offset);
       panel(key,x,base+y,n,w,h,d,yaw);
      };
      const count=Math.max(1,Math.floor(len/(palette==='central'?3.65:palette==='library'?3.1:3.35)));
      const bay=len/count;
      const high=roofLevel(design,point(.5,0));
      const libraryFront=palette==='library'&&on<-.48&&len>14;
      const centralFront=palette==='central'&&len>14;
      for(let j=0;j<count;j++) {
        const t=(j+.5)/count;
        const [x,n]=point(t,0);
        const nearDoor=door&&Math.hypot(x-door.door[0],n-door.door[1])<door.dimensions.width*.58+1.25;
        const top=roofLevel(design,point(t,0));
        for(let k=0;k<levels;k++){
          if(k===0&&nearDoor)continue;
          const y=floor*(k+.55);
          if(y+floor*.40>top+.05)continue;
          if(palette==='central'){
            const width=bay*.81,h=floor*.80;
            part('shade',t,.075,y,width,h,.16);
            part((j+k)%5?'glass':'glassLight',t,.19,y,width-.22,h-.19,.07);
            part('steel',t+.10/count,.25,y,.055,h,.07);
            part('steel',t,.25,y-h*.20,width,.06,.05);
            if((j+k)%3===0)part('precast',t-.37/count,.31,y,.17,h,.34);
          }else if(palette==='library'){
            const horizontal=k===2||k===3;
            const wide=libraryFront&&(k===0||k===1);
            const width=bay*(wide?.82:horizontal?.74:k===4?.66:.28);
            const h=floor*(horizontal?.29:wide?.66:.69);
            part('shade',t,.105,y,width+.24,h+.26,.28);
            part((j+k)%4?'glass':'glassLight',t,.262,y,width,h,.052);
            part('polishedStone',t,.25,y-h*.55,width+.27,.16,.40);
            if(libraryFront&&(k===0||k===1||k===4))
             part('steel',t-.39/count,.40,y,.11,h+.25,.59);
          }else{
            const width=bay*(historic?.38:palette==='contemporary'?.64:.36);
            const h=floor*(chapel?.52:historic?.51:.58);
            if(chapel){
             part('arch historic',t,.255,y,width+.24,h+.26,1);
             part('arch glass',t,.28,y,width,h,1);
             part('sash',t,.30,y-.17,.052,h*.76,.05);
             part('historic',t,.21,y-h*.54,width+.29,.18,.42);
            }else{
             part(historic?'historic':'precast',t,.09,y,width+.20,h+.17,.20);
             part(historic?'glass':(j+k+i)%4?'glass':'glassLight',t,.223,y,width,h,.055);
             if(historic){
              part('sash',t,.264,y,.065,h,.053);
              part('sash',t,.267,y+h*.12,width,.06,.055);
              part('historic',t,.16,y-h*.54,width+.24,.17,.34);
             }
            }
          }
          windowCount++;
        }
        if(palette==='central'){
          const column=j/count,[east,north]=point(column,0);
          const clearDoor=door&&Math.hypot(east-door.door[0],north-door.door[1])<door.dimensions.width/2+.70;
          const start=clearDoor?door.dimensions.height+1.65:0;
          part('precast',column,.26,(top+start)/2,.43,top-start,.62);
          for(let k=0;k<=levels;k++){
           const level=k*floor;
           if(level<=top-.1)part('precast',t,.30,level+.17,bay,.29,.67);
          }
        }
      }
      if(centralFront)part('precast',.5,.26,high-.18,len,.32,.5);
      if(palette==='library'){
        part('polishedStone',.5,.16,.72,len,1.40,.32);
        if(libraryFront){
          part('harling',.5,.34,5.0,len,.63,.69);
          part('polishedStone',.5,.35,8.5,len,.25,.70);
          part('harling',.5,.21,12.55,len,.29,.40);
          part('harling',.5,.21,16.25,len,.26,.40);
        }
      }
      if(historic){
       part('slate',.5,.13,design.eaves-.06,len,.19,.42);
       for(const side of [.07,.93]){
        if(chapel)part('historic',side,.19,2.28,.52,4.56,.38);
        else for(let course=0;course<Math.ceil(design.eaves/.58);course++){
         part(feature.id==='way/396704721'?'terracotta':'historic',side,.084,course*.58+.24,
          course%2?.34:.53,.47,.13);
        }
       }
      }
    }
    const name=feature.name||(palette==='library'?(feature.id==='way/1457282385'?'Academic Hub · north wing':'Academic Hub & Library'):null);
    labels.push({id:feature.id,name,palette,windowCount,wallMaterial:design.stone??palette,roof});
  }
  for (const [key,matrices] of Object.entries(batches)) {
    const gothic=key.startsWith('arch ');
    const mesh=new THREE.InstancedMesh(gothic?arch:box,materials[gothic?key.slice(5):key],matrices.length);
    for(const [i,matrix] of matrices.entries())mesh.setMatrixAt(i,matrix);
    mesh.receiveShadow=true;
    mesh.name='Campus façade '+key;
    scene.add(mesh);
  }
  return labels;
}

// Provisional deck over the mapped track and the adjoining pedestrian corridor.
const bridgeEnds=[[321,-96],[347,-145]];
const [a,b]=bridgeEnds;
const span=Math.hypot(b[0]-a[0],b[1]-a[1]);
const direction=[(b[0]-a[0])/span,(b[1]-a[1])/span];
export const bridgeSupports=bridgeEnds.map(([x,n],i)=>{
  const along=i===0?.36:-.36;
  const [dx,dn]=direction;
  const coords=[[-4.25,-.56],[4.25,-.56],[4.25,.56],[-4.25,.56],[-4.25,-.56]]
    .map(([side,depth])=>[x+dx*(along+depth)+dn*side,n+dn*(along+depth)-dx*side]);
  return {id:'broadstone-bridge-support-'+i,kind:'building',coords};
});
export function addUnderpass(scene, groundHeight) {
  const clear=9;
  const x=(a[0]+b[0])/2,n=(a[1]+b[1])/2;
  const length=span;
  const underside=groundHeight(x,n)+clear;
  const g=new THREE.Group();
  g.name='Broadstone access-road underpass';
  g.position.set(x,underside,-n);
  g.rotation.y=Math.atan2(b[0]-a[0],a[1]-b[1]);
  function add(w,h,d,x,y,z,material) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    m.position.set(x,y,z);m.receiveShadow=true;g.add(m);
  }
  add(8.6,1.06,length,0,.53,0,materials.limestone);
  add(7.5,.12,length,0,1.11,0,materials.slate);
  for(const side of [-1,1]){
    add(.36,.91,length,side*4.1,1.55,0,materials.precast);
    // The abutments sit at the two ends, away from the tram and footway.
    const [px,pn]=side===-1?a:b;
    const pierHeight=underside-groundHeight(px,pn);
    add(8.5,pierHeight,1.12,0,-pierHeight/2,side*(length/2-.36),materials.limestone);
  }
  scene.add(g);
  return {centre:[x,n],ends:[a,b],clearance:clear,underside};
}

// The source snapshot still encloses the Academic Hub site with construction
// fencing. The open library needs one pedestrian passage on its campus side.
export function openLibraryApproach(features) {
  const zone=features.flatMap(feature=>{
    if(feature.id!=='way/1331424721')return [feature];
    const i=feature.coords.findIndex(([x,n])=>x===-195.4&&n===147.3);
    if(i===-1)throw Error('The library fence geometry has changed. Recheck the entrance approach.');
    const a=feature.coords[i],b=feature.coords[i+1];
    const t=(115-a[1])/(b[1]-a[1]),half=2.8/Math.hypot(a[0]-b[0],a[1]-b[1]);
    const edge=fraction=>a.map((value,j)=>value+(b[j]-value)*fraction);
    return [
      {...feature,coords:feature.coords.slice(0,i+1).concat([edge(t-half)])},
      {...feature,id:feature.id+'/open-library',coords:[edge(t+half)].concat(feature.coords.slice(i+1))},
    ];
  });
  zone.push({id:'prototype/library-approach',kind:'road',name:'',
    coords:[[-217,112.7],[-201.7,115],[-188,113]],
    tags:{highway:'footway',surface:'paving_stones'}});
  return zone;
}
