import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {groundFinish} from './surfaces.mjs';

const silver=new THREE.MeshStandardMaterial({color:0xb6babb,metalness:.35,roughness:.35});
const yellow=new THREE.MeshStandardMaterial({color:0xd6ac36,roughness:.55});
const charcoal=new THREE.MeshStandardMaterial({color:0x292a2d,roughness:.78});
const rubber=new THREE.MeshStandardMaterial({color:0x343335,roughness:.94});
const glazing=new THREE.MeshStandardMaterial({color:0x233f48,metalness:.35,roughness:.23});
const steel=new THREE.MeshStandardMaterial({color:0x777d7d,roughness:.43,metalness:.45});
const warm=new THREE.MeshBasicMaterial({color:0xffe1aa});
const red=new THREE.MeshBasicMaterial({color:0xa82419});
const wheelRadius=.315;
const carLengths=[7.15,4.60,6.60,4.75,8.50,4.75,6.60,4.60,7.15];
const totalLength=carLengths.reduce((sum,len)=>sum+len,0);
const gauge=1.435;
const contactHeight=5.22;
const railHeight=.128;
const platformHeight=railHeight+.28;
const platformIds=['way/542016185','way/542016186'];
export const isLuasPlatform=id=>platformIds.includes(id);

function block(parent,w,h,d,x,y,z,material) {
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
function rod(parent,a,b,r,material) {
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),7),material);
 mesh.position.copy(start.lerp(end,.5));
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
 parent.add(mesh);
 return mesh;
}
function batchChildren(group) {
 const batches=new Map();
 for(const mesh of [...group.children]){
  if(!mesh.isMesh)continue;
  mesh.updateMatrix();
  const geom=mesh.geometry.clone().applyMatrix4(mesh.matrix);
  if(!batches.has(mesh.material))batches.set(mesh.material,[]);
  batches.get(mesh.material).push(geom.index?geom.toNonIndexed():geom);
  if(geom.index)geom.dispose();
  group.remove(mesh);mesh.geometry.dispose();
 }
 for(const [material,parts] of batches){
  const mesh=new THREE.Mesh(mergeGeometries(parts),material);
  mesh.receiveShadow=true;group.add(mesh);
  parts.forEach(geom=>geom.dispose());
 }
}
function trackPath(stop,source,tracks) {
 // The animation runs eastbound along the mapped track. Attach the continuation
 // at its western end so that the rear cars articulate around the approach curve.
 const points=[...source.coords];
 if(points[0][0]>points.at(-1)[0])points.reverse();
 const first=points[0];
 const continuation=tracks.find(f=>f!==source&&f.coords.some((p,i)=>i===0||i===f.coords.length-1?Math.hypot(p[0]-first[0],p[1]-first[1])<.15:false));
 if(continuation){
  const from=continuation.coords;
  const west=Math.hypot(from[0][0]-first[0],from[0][1]-first[1])<.15?from.slice(1).reverse():from.slice(0,-1);
  points.unshift(...west);
 }
 const metres=[0];
 for(let i=1;i<points.length;i++)metres.push(metres[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
 const anchor=metres[points.findIndex(p=>Math.hypot(p[0]-stop[0],p[1]-stop[1])<.15)];
 function sample(distance){
  const target=THREE.MathUtils.clamp(anchor+distance,0,metres.at(-1));
  const i=Math.min(points.length-2,metres.findLastIndex(s=>s<=target));
  const a=points[i],b=points[i+1],f=(target-metres[i])/(metres[i+1]-metres[i]);
  return a.map((q,j)=>THREE.MathUtils.lerp(q,b[j],f));
 }
 return sample;
}
function signTexture(text,colour,background,subheading=''){
 const canvas=document.createElement('canvas');
 canvas.width=512;canvas.height=104;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle=background;ctx.fillRect(0,0,512,104);
 ctx.textAlign='center';ctx.fillStyle=colour;
 ctx.font='600 48px Arial';ctx.fillText(text,256,subheading?53:69,490);
 if(subheading){ctx.font='26px Arial';ctx.fillText(subheading,256,87,486);}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide});
}
function sheet(parent,w,h,x,y,z,material,yaw=0){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
 mesh.position.set(x,y,z);mesh.rotation.y=yaw;parent.add(mesh);
 return mesh;
}
function cab(group,tip,side){
 const front=new THREE.Group();
 front.position.x=tip;
 front.rotation.y=side>0?0:Math.PI;
 group.add(front);
 // Transverse profile stations follow the rounded cab and raked windscreen.
 const ring=[
  {x:-2.26,w:1.198,floor:.42,shoulder:2.93,top:3.35},
  {x:-.78,w:1.19,floor:.42,shoulder:2.93,top:3.34},
  {x:-.20,w:1.085,floor:.46,shoulder:2.77,top:3.22},
  {x:0,w:.91,floor:.55,shoulder:2.53,top:2.97},
 ];
 const outline=({x,w,floor,shoulder,top})=>[
  [x,floor,-w*.80],[x,floor+.19,-w],[x,shoulder,-w],[x,top,-w*.70],
  [x,top,w*.70],[x,shoulder,w],[x,floor+.19,w],[x,floor,w*.80],
 ];
 const vertices=[];
 for(let i=1;i<ring.length;i++){
  const a=outline(ring[i-1]),b=outline(ring[i]);
  for(let j=0;j<a.length;j++){
   const k=(j+1)%a.length;
   for(const p of [a[j],a[k],b[k],a[j],b[k],b[j]])vertices.push(...p);
  }
 }
 const nose=outline(ring.at(-1));
 for(let i=1;i<nose.length-1;i++)for(const p of [nose[0],nose[i+1],nose[i]])vertices.push(...p);
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geometry.computeVertexNormals();
 const shell=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({
  color:silver.color,metalness:.32,roughness:.38,side:THREE.DoubleSide,
 }));
 front.add(shell);
 const lampGlass=new THREE.MeshStandardMaterial({color:0x454849,metalness:.4,roughness:.4});
 block(front,.062,1.62,1.70,.029,1.96,0,glazing);
 block(front,.064,.27,1.91,.027,.99,0,yellow);
 for(const z of [-.57,.57]){
  const housing=new THREE.Mesh(new THREE.CylinderGeometry(.184,.184,.068,18),lampGlass);
  housing.scale.x=.75;housing.rotation.z=Math.PI/2;housing.position.set(.068,1.04,z);front.add(housing);
  const light=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8),side>0?warm:red);
  light.scale.x=.37;light.position.set(.106,1.05,z);front.add(light);
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.062,10,6),red);
  marker.scale.x=.45;marker.position.set(.026,.70,z*.93);front.add(marker);
 }
 const dest=signTexture(side>0?'BROOMBRIDGE':'BRIDES GLEN','#a9da7b','#19251e');
 sheet(front,1.30,.23,.066,2.63,0,dest,Math.PI/2);
 const badge=signTexture('5005','#f0f0e9','#29424a');
 sheet(front,.32,.105,.067,2.37,-.65,badge,Math.PI/2);
 rod(front,[.07,1.24,-.34],[.075,1.95,-.53],.014,charcoal);
 for(const z of [-1,1]){
  const sideWindow=block(front,1.35,1.22,.045,-1.12,2.04,z*1.159,glazing);
  sideWindow.rotation.y=z*.095;
  block(front,1.92,.075,.05,-1.21,1.18,z*1.167,yellow);
 }
}
export function createLuas(scene,stop,track,groundHeight,tracks=[track]){
 const sample=trackPath(stop,track,tracks);
 const car=new THREE.Group();car.name='Broadstone Luas · Citadis 502';
 const modules=[];
 let cursor=-totalLength/2;
 for(const [i,length] of carLengths.entries()){
  const section=new THREE.Group(),fixed=new THREE.Group(),leaves=[];
  section.name='Luas · articulated section '+(i+1);
  section.add(fixed);car.add(section);
  const cabSide=i===0?-1:i===carLengths.length-1?1:0;
  const start=-length/2+(i===0?2.25:.102),end=length/2-(i===carLengths.length-1?2.25:.102);
  const bodyLength=end-start,mid=(start+end)/2;
  const doorway=bodyLength>4?mid:null;
  block(fixed,bodyLength,.25,2.27,mid,.54,0,silver);
  block(fixed,bodyLength,.30,2.33,mid,3.04,0,silver);
  block(fixed,bodyLength-.02,.14,2.07,mid,3.24,0,silver);
  block(fixed,bodyLength-.05,.21,2.14,mid,2.96,0,charcoal);
  if(i<carLengths.length-1){
   block(fixed,.28,2.52,2.19,length/2,1.80,0,rubber);
   for(const z of [-1.097,1.097])for(const x of [-.10,-.033,.033,.10])block(fixed,.018,2.45,.042,length/2+x,1.79,z,charcoal);
  }
  for(const side of [-1,1]){
   const z=side*1.19;
   const spans=doorway===null?[[start,end]]:[[start,doorway-.675],[doorway+.675,end]];
   for(const [a,b] of spans){
    const w=b-a;
    block(fixed,w,2.28,.057,(a+b)/2,1.78,z-.024*side,silver);
    block(fixed,w,.082,.026,(a+b)/2,1.18,z+.018*side,yellow);
    const lights=Math.max(1,Math.round(w/1.55));
    for(let j=0;j<lights;j++){
     const width=w/lights,at=a+(j+.5)*width;
     block(fixed,width-.12,1.20,.044,at,2.02,z+.021*side,charcoal);
     block(fixed,width-.19,1.10,.021,at,2.025,z+.050*side,glazing);
    }
   }
   if(doorway===null)continue;
   block(fixed,1.35,2.25,.07,doorway,1.77,-.67*side,charcoal);
   block(fixed,1.37,.055,.27,doorway,.465,z-.11*side,steel);
   for(const dir of [-1,1]){
    const leaf=new THREE.Group();
    leaf.position.z=z+.065*side;
    block(leaf,.650,2.18,.07,0,1.70,0,charcoal);
    block(leaf,.543,1.22,.033,0,2.02,.045*side,glazing);
    block(leaf,.65,.082,.027,0,1.18,.051*side,yellow);
    block(leaf,.036,.19,.036,-dir*.19,1.30,.054*side,steel);
    batchChildren(leaf);section.add(leaf);
    leaves.push({leaf,dir,doorway,platform:side===-1});
   }
  }
  if(i%2===0)for(const side of [-1,1])for(const x of [mid-.66,mid+.66]){
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius,wheelRadius,.11,12),charcoal);
   wheel.rotation.x=Math.PI/2;wheel.position.set(x,wheelRadius,side*gauge/2);fixed.add(wheel);
  }
  if(cabSide)cab(section,cabSide*length/2,cabSide);
  if(i===4){
   block(fixed,3.14,.23,1.78,-1.34,3.38,0,charcoal);
   for(const z of [-.32,.32]){
    rod(fixed,[.35,3.35,z],[1.56,4.18,z],.045,charcoal);
    rod(fixed,[1.56,4.18,z],[.82,contactHeight-railHeight-.06,z*.64],.038,steel);
   }
   rod(fixed,[.82,contactHeight-railHeight-.02,-.59],[.82,contactHeight-railHeight-.02,.59],.032,charcoal);
  }
  batchChildren(fixed);
  modules.push({section,leaves,offset:cursor+length/2,half:length/2});
  cursor+=length;
 }
 scene.add(car);
 function pose(distance,open){
  const [x,n]=sample(distance);
  const base=groundHeight(x,n)+railHeight;
  car.position.set(x,base,-n);
  for(const {section,leaves,offset,half} of modules){
   const d=distance+offset,[px,pn]=sample(d);
   const a=sample(d-half*.72),b=sample(d+half*.72);
   section.position.set(px-x,groundHeight(px,pn)+railHeight-base,n-pn);
   section.rotation.y=Math.atan2(b[1]-a[1],b[0]-a[0]);
   for(const {leaf,dir,doorway,platform} of leaves){
    const slide=platform?open:0;
    leaf.position.x=doorway+dir*(.337+.63*slide);
   }
  }
 }
 const a=sample(-2),b=sample(2),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
 const direction=[Math.cos(angle),Math.sin(angle)];
 pose(0,0);
 return {car,direction,pose,sections:modules.length,length:totalLength,gauge};
}

const ivory=new THREE.MeshStandardMaterial({color:0xb9b6a9,roughness:.90});
const groove=new THREE.MeshStandardMaterial({color:0x292d2d,roughness:.95});
const rail=new THREE.MeshStandardMaterial({color:0x969c9c,metalness:.68,roughness:.32});
const shelterGlass=new THREE.MeshPhysicalMaterial({color:0x9ab6b1,transparent:true,
 opacity:.25,roughness:.26,depthWrite:false,side:THREE.DoubleSide});
const ticketBlue=new THREE.MeshStandardMaterial({color:0x536782,roughness:.67});
const ticketCase=new THREE.MeshStandardMaterial({color:0xc2c1b7,roughness:.80});
const screen=new THREE.MeshBasicMaterial({color:0x57757a});
const green=new THREE.MeshBasicMaterial({color:0x539388});

function ribbon(scene,rows,material,name){
 const pos=[],uv=[];
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i];
  for(const [row,s] of [[a,0],[b,1],[b,0],[a,0],[a,1],[b,1]]){
   pos.push(...row[s]);
   uv.push(row[2],row[3][s]);
  }
 }
 if(!pos.length)return;
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,material);
 mesh.name=name;mesh.receiveShadow=true;scene.add(mesh);
 return mesh;
}

export function addLuasTracks(scene,stop,ways,heightAt){
 const surface=groundFinish('railSetts');
 function trackRows(vertices,low,high,height){
  return vertices.map(({point,offset,distance})=>[...[low,high].map(s=>{
   const x=point[0]+offset[0]*s,n=point[1]+offset[1]*s;
   return [x,heightAt(...point)+height,-n];
  }),distance,[low,high]]);
 }
 for(const {coords} of ways){
  let distance=0;
  const vertices=[];
  function perpendicular(a,b){
   const dx=b[0]-a[0],dn=b[1]-a[1],length=Math.hypot(dx,dn);
   return [dn/length,-dx/length];
  }
  for(let i=1;i<coords.length;i++){
   const a=coords[i-1],b=coords[i];
   if(Math.min(Math.hypot(a[0]-stop[0],a[1]-stop[1]),Math.hypot(b[0]-stop[0],b[1]-stop[1]))>175){
    if(vertices.length)break;
    continue;
   }
   const len=Math.hypot(b[0]-a[0],b[1]-a[1]);
   if(len<.08)continue;
   const normal=perpendicular(a,b);
   if(!vertices.length)vertices.push({point:a,offset:normal,distance});
   else{
    const before=perpendicular(coords[i-2],a);
    vertices.at(-1).offset=normal.map((v,j)=>(v+before[j])/(1+normal[0]*before[0]+normal[1]*before[1]));
   }
   const count=Math.ceil(len/2.25);
   for(let j=1;j<=count;j++){
    const t=j/count;
    const point=a.map((value,k)=>THREE.MathUtils.lerp(value,b[k],t));
    vertices.push({point,offset:normal,distance:distance+len*t});
   }
   distance+=len;
  }
  if(vertices.length<2)continue;
  ribbon(scene,trackRows(vertices,-1.31,1.31,.098),surface,'Luas · embedded stone setts');
  for(const side of [-1,1]){
   const c=side*gauge/2;
   ribbon(scene,trackRows(vertices,c-.092,c+.092,.110),groove,'Luas · flangeway');
   ribbon(scene,trackRows(vertices,c-.029,c+.029,railHeight),rail,'Luas · steel running rail');
   const inner=c-side*.069;
   ribbon(scene,trackRows(vertices,inner-.011,inner+.011,.119),rail,'Luas · check lip');
  }
 }
}

export function luasPlatformLayout(stop,track,features){
 const sampleTrack=trackPath(stop,track,[track]);
 const b=sampleTrack(2),a=sampleTrack(-2),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
 const dx=Math.cos(angle),dn=Math.sin(angle);
 const toWorld=(along,across)=>[stop[0]+dx*along+dn*across,stop[1]+dn*along-dx*across];
 const toLocal=(x,n)=>[(x-stop[0])*dx+(n-stop[1])*dn,(x-stop[0])*dn-(n-stop[1])*dx];
 const adjacent=features.find(f=>f.kind==='poi'&&f.tags.railway==='tram_stop'
  &&f.name==='Broadstone - University'&&Math.hypot(f.coords[0][0]-stop[0],f.coords[0][1]-stop[1])>1);
 const otherTrack=adjacent?toLocal(...adjacent.coords[0])[1]:3.38;
 const trackSides=[Math.min(0,otherTrack),Math.max(0,otherTrack)];
 const platforms=features.filter(f=>isLuasPlatform(f.id)).map(f=>{
  const local=f.coords.map(p=>toLocal(...p));
  const lo=Math.min(...local.map(p=>p[0])),hi=Math.max(...local.map(p=>p[0]));
  const side=local[0][1]<0?-1:1;
  const edge=trackSides[side===1?1:0]+side*1.36;
  return {lo,hi,side,edge,back:edge+side*3.64};

 });
 const grade=(along,platform)=>THREE.MathUtils.clamp(Math.min(along-platform.lo,platform.hi-along)/5.5,0,1);
 const lift=(x,n)=>{
  const [along,across]=toLocal(x,n);
  const platform=platforms.find(p=>along>=p.lo&&along<=p.hi&&across*p.side>=p.edge*p.side&&across*p.side<=(p.back+.85*p.side)*p.side);
  if(!platform)return 0;
  const edge=THREE.MathUtils.clamp((platform.back+.85*platform.side-across)*platform.side/.85,0,1);
  return platformHeight*grade(along,platform)*edge;
 };
 return {toWorld,angle,platforms,grade,lift,trackSides};
}

export function addLuasForecourt(scene,layout,groundHeight) {
 const {toWorld,angle,platforms,grade,trackSides}=layout;
 const timber=new THREE.MeshStandardMaterial({color:0x8b8174,roughness:.9});
 const lamp=new THREE.MeshStandardMaterial({color:0xd1d0ba,roughness:.78});
 const group=new THREE.Group();group.name='Broadstone–University · shelters and platform furniture';scene.add(group);
 function place(along,across,yaw=angle,lift=0){
  const [x,n]=toWorld(along,across);
  const fixture=new THREE.Group();fixture.position.set(x,groundHeight(x,n)+lift,-n);
  fixture.rotation.y=yaw;group.add(fixture);return fixture;
 }
 function heightPoint(along,across,height){
  const [x,n]=toWorld(along,across);return [x,groundHeight(x,n)+height,-n];
 }
 const stationName=signTexture('Broadstone – University','#183d35','#d7e4dc','An Chloch Leathan – Ollscoil');
 const tickets=signTexture('Ticéid  •  Tickets','#e6e3df','#344b67','LUAS');
 const nextTram=signTexture('GREEN LINE','#eac275','#242829','Líne Uaine · Green Line');
 const mapLabel=signTexture('Luas Green Line','#34413d','#e1e3d8','Broadstone – University');
 for(const platform of platforms){
  const {lo,hi,side,edge,back}=platform;
  const rows=[],tactileRows=[],kerbRows=[];
  const low=Math.min(edge,back),high=Math.max(edge,back);
  for(let i=0,count=Math.ceil((hi-lo)/1.3);i<=count;i++){
   const at=THREE.MathUtils.lerp(lo,hi,i/count),height=.012+platformHeight*grade(at,platform);
   rows.push([heightPoint(at,low,height),heightPoint(at,high,height),at,[low,high]]);
   const edgeA=side>0?edge+.16:edge-.55,edgeB=side>0?edge+.55:edge-.16;
   tactileRows.push([heightPoint(at,edgeA,height+.017),heightPoint(at,edgeB,height+.017),at,[edgeA,edgeB]]);
   const lower=heightPoint(at,edge,.022),upper=heightPoint(at,edge,height);
   kerbRows.push([...(side===1?[lower,upper]:[upper,lower]),at,[0,.28]]);
  }
  ribbon(scene,rows,groundFinish('luas'),'Broadstone–University · paved platform');
  ribbon(scene,tactileRows,groundFinish('platformTactile'),'Broadstone–University · tactile boarding strip');
  ribbon(scene,kerbRows,ivory,'Broadstone–University · platform kerb').material.side=THREE.DoubleSide;
  const at=side===-1?1:-12;
  const backLine=back-.31*side;
  const shelter=place(at,backLine,angle,platformHeight);
  shelter.name='Broadstone–University · glass shelter';
  // North shelter is set against the cutting wall. The island side has open access.
  const span=side<0?12.2:8.6;
  const depth=side<0?2.32:1.97;
  for(const post of [-span/2,0,span/2]){
   block(shelter,.095,2.74,.09,post,1.37,0,steel);
   block(shelter,.091,2.75,.091,post,1.375,-side*depth,steel);
   block(shelter,.083,.11,depth,post,2.77,-side*depth/2,steel);
  }
  block(shelter,span+.21,.115,.088,0,2.80,-side*depth,steel);
  block(shelter,span+.21,.115,.088,0,2.80,0,steel);
  block(shelter,span+.24,.063,depth+.18,0,2.84,-side*depth/2,shelterGlass);
  for(const x of [-span/4,span/4]){
   block(shelter,span/2-.10,1.80,.043,x,1.34,-side*.032,shelterGlass);
   block(shelter,span/2-.11,.053,.045,x,1.37,-side*.058,ivory);
  }
  for(const post of [-span/2,span/2]){
   block(shelter,.044,1.72,depth-.19,post,1.32,-side*depth/2,shelterGlass);
  }
  sheet(shelter,3.9,.48,span/2-2.14,2.43,-side*.14,stationName,side<0?0:Math.PI);
  sheet(shelter,1.35,.70,-span/2+1.23,1.67,-side*.17,mapLabel,side<0?0:Math.PI);
  block(shelter,2.55,.10,.37,-span/2+2.52,.45,-side*.39,timber);
  for(const x of [-span/2+1.52,-span/2+3.52])block(shelter,.086,.47,.26,x,.24,-side*.39,steel);

  const vendingX=span/2-1.22;
  for(const x of [vendingX-.89,vendingX]){
   const machine=new THREE.Group();machine.name='Broadstone–University · Luas ticket machine';
   machine.position.set(x,0,-side*.49);
   machine.rotation.y=side<0?0:Math.PI;
   shelter.add(machine);
   block(machine,.78,1.91,.44,0,.955,0,ticketBlue);
   block(machine,.78,.36,.45,0,.18,0,steel);
   block(machine,.75,1.08,.043,0,1.17,.231,ticketCase);
   sheet(machine,.752,.17,0,1.77,.234,tickets);
   block(machine,.39,.30,.047,-.125,1.08,.265,charcoal);
   block(machine,.345,.251,.016,-.125,1.08,.294,screen);
   block(machine,.45,.096,.053,-.102,.72,.267,charcoal);
   block(machine,.086,.106,.040,.234,1.11,.26,green);
   block(machine,.086,.026,.043,.224,1.38,.27,charcoal);
   batchChildren(machine);
  }
  const information=place(side>0?6:-13,back-.58*side,angle,platformHeight);
  block(information,.48,2.58,.20,0,1.29,0,charcoal);
  sheet(information,.40,.31,0,2.12,-side*.106,nextTram,side<0?0:Math.PI);
  for(const x of [-28,27]){
   const validator=place(x,back-.69*side,angle,platformHeight);
   block(validator,.15,1.20,.13,0,.60,0,steel);
   block(validator,.186,.20,.15,0,1.18,0,ticketBlue);
   block(validator,.116,.083,.021,0,1.20,-side*.082,green);
  }
  batchChildren(shelter);
 }

 // The contact lines and support cables lie over the two mapped tracks.
 const wireGroup=new THREE.Group();wireGroup.name='Broadstone–University · overhead line';
 group.add(wireGroup);
 for(const position of [-47,-16,17,49,73]){
  const foot=heightPoint(position,-5.45,0),top=heightPoint(position,-5.45,6.6);
  rod(wireGroup,foot,top,.086,steel);
  rod(wireGroup,heightPoint(position,-5.45,6.19),heightPoint(position,8.30,6.03),.016,steel);
  for(const lateral of trackSides)rod(wireGroup,heightPoint(position,lateral,6.08),heightPoint(position,lateral,contactHeight),.013,steel);
 }
 for(const lateral of trackSides)for(const h of [contactHeight,5.91]){
  for(let at=-47;at<73;at+=5){
   rod(wireGroup,heightPoint(at,lateral,h),heightPoint(at+5,lateral,h),h===contactHeight?.013:.009,charcoal);
  }
 }
 batchChildren(wireGroup);

 for(const along of [-25,-3,19,35]){
  const pole=place(along,6.3);
  block(pole,.09,6.5,.09,0,3.25,0,steel);
  block(pole,.51,.09,.19,.23,6.44,0,lamp);
 }
 const seat=place(-12,12.0);
 block(seat,6.4,.41,.55,0,.20,0,ivory);
 for(let j=0;j<5;j++)block(seat,6.05,.047,.083,0,.43,-.18+j*.092,timber);
 for(let j=0;j<4;j++)block(seat,6.05,.074,.046,0,.57+j*.095,-.23,timber);
 return {shelters:platforms.length,ticketMachines:2*platforms.length,platformStep:.28};
}
