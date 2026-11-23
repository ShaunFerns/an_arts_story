import * as THREE from 'three';
import {groundFinish} from './surfaces.mjs';
import {addPlanting} from './landscape.mjs';

export const rathdownFenceIds=new Set(['way/1355378351','way/1355378352','way/1355378353']);
const foot=[44.55,-55.4],head=[33.85,-51.0];
const run=Math.hypot(head[0]-foot[0],head[1]-foot[1]);
const [east,north]=head.map((v,i)=>(v-foot[i])/run);
const rise=.66;
const along=(x,n)=>(x-foot[0])*east+(n-foot[1])*north;
const across=(x,n)=>(x-foot[0])*north-(n-foot[1])*east;
const clamp=t=>Math.max(0,Math.min(1,t));

export function rathdownRise(x,n) {
 const distance=along(x,n),side=across(x,n);
 const spread=3.75+Math.max(0,distance-run)*.63;
 return rise*clamp(distance/run)*clamp((spread+7-side)/7)*clamp((side+10)/6)*clamp((86-distance)/22);
}

// Traced from the aerial paving edge and matched to the mapped gateway
// rails and footprints. Paving reaches the Bradogue side of the forecourt.
const court=[[-45,-6],[-34,2],[-22,-2],[-7,-9],[8,-14],[24,-21],
 [34,-24],[42,-30],[46,-39],[45.3,-48],[45.6,-51.8],[44.6,-51.8],
 [45.7,-55.8],[43.1,-59.3],[29.5,-57.8],[22.25,-55.16],[7.12,-51.07],
 [-2.14,-45.73],[-14.24,-42.7],[-26.7,-35.05],[-39.6,-33],[-45,-25]];
const island=[.4,-31.5];
export const rathdownTreeObstacle={id:'rathdown-forecourt-tree',kind:'building',
 coords:[[-.01,-31.90],[.81,-31.90],[.81,-31.10],[-.01,-31.10],[-.01,-31.90]]};
const contains=(polygon,x,n)=>polygon.reduce((inside,[ax,an],i)=>{
 const [bx,bn]=polygon[(i+1)%polygon.length];
 return (an>n)!==(bn>n)&&x<ax+(n-an)*(bx-ax)/(bn-an)?!inside:inside;
},false);

export function addRathdownApproach(scene,heightAt,stone,features,blocked) {
 const rails=features.filter(f=>rathdownFenceIds.has(f.id));
 const islandShape=features.find(f=>f.id==='way/1208632446').coords;
 const grey=new THREE.MeshStandardMaterial({color:0xadaaa0,roughness:.91});
 const steel=new THREE.MeshStandardMaterial({color:0x424746,roughness:.7});
 const vertices=[],uv=[],inlay=[],inlayUv=[];
 const pitch=.6;
 function put(x,n,y,points,texture){
  points.push(x,heightAt(x,n)+y,-n);
  texture.push(across(x,n),along(x,n));
 }
 for(let x=-45;x<46;x+=pitch)for(let n=-60;n<3;n+=pitch){
  const ex=x+pitch/2,no=n+pitch/2;
  if(!contains(court,ex,no)||contains(islandShape,ex,no)||blocked(ex,no))continue;
  const s=across(ex,no);
  const band=Math.abs(s/3.65-Math.round(s/3.65))<.069;
  for(const [p,q] of [[x,n],[x+pitch,n],[x+pitch,n+pitch],[x,n],[x+pitch,n+pitch],[x,n+pitch]]){
   put(p,q,.111,band?inlay:vertices,band?inlayUv:uv);
  }
 }
 for(const [points,texture,material] of [[vertices,uv,groundFinish('granite')],[inlay,inlayUv,grey]]){
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(texture,2));
  geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name=points===vertices?'Entrance paving · Rathdown House':'Rathdown House · paving inlay';
  mesh.receiveShadow=true;scene.add(mesh);
 }

 const box=new THREE.BoxGeometry(1,1,1),batches=new Map();
 function beam(a,b,w,d,finish){
  const dir=b.clone().sub(a);
  const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
  const matrix=new THREE.Matrix4().compose(a.clone().lerp(b,.5),rotation,new THREE.Vector3(w,dir.length(),d));
  if(!batches.has(finish))batches.set(finish,[]);
  batches.get(finish).push(matrix);
 }
 const at=([x,n],h)=>new THREE.Vector3(x,heightAt(x,n)+h,-n);
 for(const feature of rails){
  const retaining=feature.id==='way/1355378351';
  for(let i=1;i<feature.coords.length;i++){
   const a=feature.coords[i-1],b=feature.coords[i],span=Math.hypot(b[0]-a[0],b[1]-a[1]);
   const plinth=retaining?.49:.10;
   beam(at(a,plinth-.37),at(b,plinth-.37),.36,.74,retaining?grey:stone);
   beam(at(a,plinth),at(b,plinth),.38,.095,grey);
   const top=retaining?1.34:1.02;
   for(const h of [retaining?.63:.52,top])beam(at(a,h),at(b,h),.056,.053,steel);
   const count=Math.ceil(span/(retaining?.16:1.9));
   for(let j=0;j<=count;j++){
    const p=a.map((v,k)=>v+(b[k]-v)*j/count);
    const w=retaining&&j%12!==0?.027:.067;
    beam(at(p,plinth),at(p,top+.015),w,w,steel);
   }
  }
 }
 for(const [material,matrices] of batches){
  const mesh=new THREE.InstancedMesh(box,material,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
  mesh.name='Grangegorman Lower · mapped gateway railings';mesh.receiveShadow=true;scene.add(mesh);
 }
 const sign=new THREE.Group();
 const [sx,sn]=[46.15,-52.2];
 sign.position.copy(at([sx,sn],0));
 sign.rotation.y=Math.atan2(-east,north);
 const panel=new THREE.Mesh(new THREE.BoxGeometry(.64,3.18,.44),grey);
 panel.position.y=1.59;sign.add(panel);
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;
 const ctx=canvas.getContext('2d');
 ctx.translate(110,885);ctx.rotate(-Math.PI/2);
 ctx.fillStyle='#484b48';ctx.font='33px sans-serif';
 ctx.fillText('GRÁINSEACH GHORMÁIN',0,0);ctx.fillText('GRANGEGORMAN',0,57);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const lettering=new THREE.Mesh(new THREE.PlaneGeometry(.64,2.88),
  new THREE.MeshBasicMaterial({map,transparent:true}));
 lettering.position.set(0,1.58,.222);sign.add(lettering);
 sign.name='Grangegorman Lower · wayfinding pillar';scene.add(sign);

 const tree=new THREE.Group();
 tree.name='Rathdown House · forecourt tree and planted island';
 tree.position.copy(at(island,.07));
 addPlanting(tree,[
  {x:0,y:.18,z:0,height:10.2,width:9.8,seed:38},
  ...Array.from({length:16},(_,i)=>({
   x:2.7*Math.cos(i*2.39996),y:.19,z:2.1*Math.sin(i*2.39996),
   height:.31+(i%4)*.11,width:.71,shrub:true,seed:41+i,
  })),
 ],'Rathdown House · forecourt tree and underplanting');
 const kerb=new THREE.Mesh(new THREE.CylinderGeometry(3.98,4.02,.18,32),stone);
 kerb.position.y=.07;kerb.scale.z=.84;kerb.receiveShadow=true;tree.add(kerb);
 const planting=new THREE.Mesh(new THREE.CylinderGeometry(3.80,3.81,.045,32),groundFinish('grass'));
 planting.position.y=.178;planting.scale.z=.84;tree.add(planting);
 scene.add(tree);
 return {foot,head,rise,rails:rails.map(f=>f.coords),railSources:rails.map(f=>f.id)};
}
