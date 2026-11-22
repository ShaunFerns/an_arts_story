import * as THREE from 'three';
import {addBuildingRoof,buildingDesign,roofLevel} from './roofs.mjs';
export {buildingDesign} from './roofs.mjs';

const materials = {
  centralBrick:new THREE.MeshStandardMaterial({color:0xc9beb0,roughness:.92}),
  harling:new THREE.MeshStandardMaterial({color:0xc5c2b7,roughness:1}),
  lowerStone:new THREE.MeshStandardMaterial({color:0xb5a38b,roughness:.96}),
  rathdownStone:new THREE.MeshStandardMaterial({color:0xb4a994,roughness:.96}),
  wardStone:new THREE.MeshStandardMaterial({color:0xa9a69a,roughness:.96}),
  infirmaryStone:new THREE.MeshStandardMaterial({color:0x959698,roughness:.96}),
  chapelStone:new THREE.MeshStandardMaterial({color:0x817f7a,roughness:.96}),
  clockStone:new THREE.MeshStandardMaterial({color:0xa9a593,roughness:.96}),
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
  brickTrim:new THREE.MeshStandardMaterial({color:0x8b7163,roughness:.87}),
  steel:new THREE.MeshStandardMaterial({color:0x454b4a,roughness:.57}),
};

export function buildingPalette(feature) {
  const name = feature.name || '';
  if (/central quad/i.test(name)) return 'central';
  if (/academic hub/i.test(name) || ['way/1361416599','way/1457282385'].includes(feature.id)) return 'library';
  if (/greenway hub|goirtín/i.test(name)) return 'contemporary';
  if (feature.id==='way/281880562'||/laurence|glassmanogue|rathdown|clocktower|orchard|all saints|north house|bradogue|stanhope|grianán|lower house/i.test(name) ||
      feature.id==='way/307799384') return 'heritage';
  return 'context';
}

const masonryTypes={
 centralBrick:[32,8,5,2], harling:[100,62,20,1],
 lowerStone:[19,11,14,4], rathdownStone:[15,9,29,3], wardStone:[18,9,18,4],
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
 const rubble=['wardStone','rathdownStone','infirmaryStone','chapelStone'].includes(key);
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

function addRathdownReception(scene,door,base,design,finish) {
 const gable=new THREE.Group();
 const [x,n]=door.door,[ox,on]=door.outward;
 gable.position.set(x+ox*.49,base,-n-on*.49);
 gable.rotation.y=Math.atan2(ox,-on);
 const span=5.0,eaves=design.eaves,rise=2.62;
 const limestone=materials.historic;
 function block(w,h,d,x,y,z,material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);mesh.receiveShadow=true;gable.add(mesh);
  return mesh;
 }
 const body=block(span,eaves,.61,0,eaves/2,-.27,finish);
 const uv=body.geometry.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*span,uv.getY(i)*eaves);
 const shape=new THREE.Shape();
 shape.moveTo(-span/2,-.08);shape.lineTo(span/2,-.08);
 shape.lineTo(0,rise);shape.closePath();
 const pediment=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:2.60,bevelEnabled:false}),finish);
 pediment.position.set(0,eaves,-2.59);gable.add(pediment);
 for(const side of [-1,1]){
  const rake=block(Math.hypot(span/2,rise)+.20,.14,2.74,-side*span/4,eaves+rise/2,-1.26,materials.slate);
  rake.rotation.z=side*Math.atan2(rise,span/2);
  for(let row=0;row<12;row++)
   block(row%2?.22:.39,.43,.13,side*(span/2-.18),.46+row*.50,.101,limestone);
 }
 block(5.11,.17,.255,0,eaves-.13,.08,limestone);
 block(5.15,.16,.26,0,3.49,.10,limestone);
 const oculus=new THREE.Mesh(new THREE.CircleGeometry(.35,24),materials.glassLight);
 oculus.position.set(0,eaves+1.12,.022);gable.add(oculus);
 const ring=new THREE.Mesh(new THREE.RingGeometry(.34,.49,24),limestone);
 ring.position.set(0,eaves+1.12,.036);gable.add(ring);
 for(const [sx,width] of [[-1.25,.65],[0,1.19],[1.25,.65]]){
  block(width+.23,1.88,.19,sx,5.03,.12,limestone);
  block(width,1.66,.043,sx,5.03,.23,materials.glassLight);
  block(width,.049,.043,sx,5.22,.262,materials.sash);
  block(width+.31,.105,.26,sx,4.12,.18,limestone);
 }
 gable.name='Rathdown House · courtyard reception gable';
 scene.add(gable);
}

const secondaryRathdownDoor=[19.1,-16.94];
function addRathdownCourtDoor(scene,base) {
 // The small timber hood is on the rear wall of the photographed entrance court.
 const a=[11.7,-14],b=[25.3,-19.4],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const outward=[(b[1]-a[1])/length,-(b[0]-a[0])/length];
 const gable=new THREE.Group();
 gable.name='Rathdown House · secondary courtyard entrance';
 const [x,n]=secondaryRathdownDoor;
 gable.position.set(x+outward[0]*.10,base,-n-outward[1]*.10);
 gable.rotation.y=Math.atan2(outward[0],-outward[1]);
 const wood=new THREE.MeshStandardMaterial({color:0xc7b8a0,roughness:.92});
 const door=new THREE.MeshStandardMaterial({color:0x6a6358,roughness:.77});
 function block(w,h,d,x,y,z,finish){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),finish);
  mesh.position.set(x,y,z);mesh.receiveShadow=true;gable.add(mesh);
  return mesh;
 }
 block(1.46,2.43,.12,0,1.22,.047,materials.historic);
 block(1.09,2.19,.055,0,1.09,.12,door);
 block(.06,.33,.05,.32,1.07,.16,materials.steel);
 for(const side of [-1,1]){
  block(.09,2.44,.10,side*.82,1.23,.69,wood);
  const roof=block(1.27,.13,.82,-side*.46,2.93,.43,materials.slate);
  roof.rotation.z=side*.65;
  const brace=block(.62,.075,.085,side*.56,2.35,.69,wood);
  brace.rotation.z=side*.82;
 }
 block(1.84,.10,.10,0,2.48,.69,wood);
 scene.add(gable);
}

export function addCampusFacades(scene, buildings, groundHeight, entrances) {
  const box = new THREE.BoxGeometry(1,1,1);
  const rounded=new THREE.Shape();
  rounded.moveTo(-.5,-.5);rounded.lineTo(.5,-.5);rounded.lineTo(.5,.34);
  rounded.quadraticCurveTo(.21,.57,0,.5);rounded.quadraticCurveTo(-.21,.57,-.5,.34);
  rounded.closePath();
  const segmental=new THREE.ShapeGeometry(rounded);
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
    const historic=palette==='heritage';
    const rathdown=feature.id==='way/310375422',glassmanogue=feature.id==='way/516821746';
    const broadstone=feature.id==='way/281880562';
    const roof=addBuildingRoof(scene,feature,design,base,shellMaterial(palette,feature,height));
    const levels=design.levels||Math.max(1,Math.min(5,Math.floor(height/3.1)));
    const floor=(historic?design.eaves:height)/levels;
    if(rathdown&&door){
     addRathdownReception(scene,door,base,design,shellMaterial(palette,feature,height));
     addRathdownCourtDoor(scene,base);
    }
    let windowCount=rathdown&&door?3:0;
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
      const libraryFront=palette==='library'&&on<-.48&&len>14;
      for(let j=0;j<count;j++) {
        const t=(j+.5)/count;
        const [x,n]=point(t,0);
        const doorDistance=door?Math.hypot(x-door.door[0],n-door.door[1]):Infinity;
        if(rathdown&&doorDistance<3.07&&ox>.82)continue;
        const nearDoor=doorDistance<(door?.dimensions.width??0)*.58+1.25;
        const auxiliaryDoor=rathdown&&on<-.80&&Math.hypot(x-secondaryRathdownDoor[0],n-secondaryRathdownDoor[1])<1.62;
        const top=roofLevel(design,point(t,0));
        for(let k=0;k<levels;k++){
          if(k===0&&(nearDoor||auxiliaryDoor))continue;
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
            if(wide)part('steel',t+.12/count,.30,y,.045,h,.05);
            if(libraryFront&&(k===0||k===1||k===4))
             part('steel',t-.39/count,.40,y,.11,h+.25,.59);
          }else{
            const lowerHouse=feature.id==='way/307799384';
            const width=bay*(historic?(lowerHouse?.32:.36):palette==='contemporary'?.64:.36);
            const h=floor*(historic?.51:.58);
            if(rathdown&&k===0&&on<-.19){
             part('segmental historic',t,.19,y,width+.24,h+.25,1);
             part('segmental glassLight',t,.221,y,width,h,1);
             part('sash',t,.248,y-.07,.045,h*.88,.043);
             part('sash',t,.249,y+.05,width,.048,.043);
             part('historic',t,.14,y-h*.57,width+.27,.12,.28);
            }else{
             part(historic?'historic':'precast',t,.09,y,width+.20,h+.17,.20);
             part(historic?'glass':(j+k+i)%4?'glass':'glassLight',t,.223,y,width,h,.055);
             if(historic){
              part('sash',t,.264,y,.065,h,.053);
              part('sash',t,.267,y+h*.12,width,.06,.055);
              if(!lowerHouse)part('sash',t,.267,y-h*.18,width,.036,.045);
              part('historic',t,.16,y-h*.54,width+.24,.17,.34);
              part(glassmanogue?'brickTrim':'historic',t,.12,y+h*.53,width+.29,glassmanogue?.30:.12,.21);
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
      if(palette==='library'){
        part('polishedStone',.5,.16,.72,len,1.40,.32);
        if(libraryFront){
          part('harling',.5,.34,5.0,len,.63,.69);
          part('polishedStone',.5,.35,9.66,len,.25,.70);
          part('harling',.5,.21,14.55,len,.29,.40);
        }
      }
      if(broadstone&&on<-.28){
       for(const level of [1.05,floor-.12,design.eaves-.30])part('historic',.5,.24,level,len,.26,.45);
       const count=Math.max(2,Math.round(len/7));
       for(let j=0;j<=count;j++)part('historic',j/count,.21,design.eaves*.51,.56,design.eaves*.88,.36);
      }
      if(historic){
       part('slate',.5,.13,design.eaves-.06,len,.19,.42);
       for(const side of [.07,.93]){
        for(let course=0;course<Math.ceil(design.eaves/.58);course++){
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
    const [type,finish]=key.split(' ');
    const geometry=type==='segmental'?segmental:box;
    const mesh=new THREE.InstancedMesh(geometry,materials[finish??type],matrices.length);
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
    add(.18,.22,length,side*4.1,1.12,0,materials.precast);
    const glass=new THREE.MeshPhysicalMaterial({color:0x9ebbc3,transparent:true,opacity:.36,
      roughness:.25,side:THREE.DoubleSide,depthWrite:false});
    const bays=Math.ceil(length/2.18),spacing=length/bays;
    for(let i=0;i<bays;i++)add(.055,1.70,spacing-.045,side*4.1,2.02,(i+.5)*spacing-length/2,glass);
    for(let i=0;i<=bays;i++)add(.16,1.87,.085,side*4.1,1.98,i*spacing-length/2,materials.steel);
    add(.10,.105,length,side*4.1,2.88,0,materials.steel);
    // The abutments sit at the two ends, away from the tram and footway.
    const [px,pn]=side===-1?a:b;
    const pierHeight=underside-groundHeight(px,pn);
    add(8.5,pierHeight,1.12,0,-pierHeight/2,side*(length/2-.36),materials.limestone);
  }
  const canvas=document.createElement('canvas');
  canvas.width=1536;canvas.height=128;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#e8efeb';ctx.font='600 92px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const letters='GRANGEGORMAN';
  for(const [i,letter] of [...letters].entries())ctx.fillText(letter,(i+.5)*canvas.width/letters.length,68);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(30,1.72),
   new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}));
  sign.position.set(4.21,2.03,.9);sign.rotation.y=Math.PI/2;
  sign.name='Grangegorman bridge lettering';
  g.add(sign);
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
