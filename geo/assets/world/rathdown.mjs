import * as THREE from 'three';
import {groundFinish} from './surfaces.mjs';

// The photos locate the ramp between the approach and the open south court.
const foot=[36,-32],head=[15,-27];
const run=Math.hypot(head[0]-foot[0],head[1]-foot[1]);
const [dx,dn]=head.map((v,i)=>(v-foot[i])/run);
const halfWidth=4.5,rise=.78;
const clamp=(value)=>Math.max(0,Math.min(1,value));
const point=(along,side)=>[foot[0]+dx*along+dn*side,foot[1]+dn*along-dx*side];
const rails=[
 {start:1.0,end:run-2,side:-halfWidth,balusters:false},
 {start:1.0,end:run+1.6,side:halfWidth,balusters:true},
];

export function rathdownRise(x,n) {
 const along=(x-foot[0])*dx+(n-foot[1])*dn;
 const side=(x-foot[0])*dn-(n-foot[1])*dx;
 // Continue the upper landing into the forecourt, then meet the old terrain.
 const end=clamp((run+23-along)/7);
 const lateral=clamp((halfWidth+5-Math.abs(side))/5);
 return rise*clamp(along/run)*end*lateral;
}

export const rathdownBarriers=rails.map(({start,end,side},i)=>({
 id:'rathdown-ramp-rail-'+i,kind:'barrier',coords:[point(start,side),point(end,side)],
 tags:{barrier:'fence',width:.16,height:1.02},
}));

export function addRathdownApproach(scene,heightAt,stone,blocked) {
 const vertices=[],uv=[];
 const put=(a,s)=>{
  const [x,n]=point(a,s);
  vertices.push(x,heightAt(x,n)+.127,-n);
  uv.push(s,a);
 };
 for(let a=-1;a<run+5;a+=.5){
  const b=a+.5;
  put(a,-halfWidth);put(a,halfWidth);put(b,halfWidth);
  put(a,-halfWidth);put(b,halfWidth);put(b,-halfWidth);
 }
 // Fan the upper landing into the paved court and leave the planted island.
 for(let x=-10;x<30;x+=.6)for(let n=-38;n<-19;n+=.6){
  const mx=x+.3,mn=n+.3;
  if(blocked(mx,mn)||mn< -38+.10*Math.abs(mx-6)||mx>28+.52*(mn+24))continue;
  const a=(mx-foot[0])*dx+(mn-foot[1])*dn;
  const side=(mx-foot[0])*dn-(mn-foot[1])*dx;
  for(const [ex,no] of [[x,n],[x+.6,n],[x+.6,n+.6],[x,n],[x+.6,n+.6],[x,n+.6]]){
   vertices.push(ex,heightAt(ex,no)+.119,-no);
   uv.push(side+(ex-mx)*dn-(no-mn)*dx,a+(ex-mx)*dx+(no-mn)*dn);
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.computeVertexNormals();
 const deck=new THREE.Mesh(geometry,groundFinish('granite'));
 deck.name='Rathdown House · sloping granite approach';
 deck.receiveShadow=true;
 scene.add(deck);

 const metal=new THREE.MeshStandardMaterial({color:0x3c4140,roughness:.72});
 const cap=new THREE.MeshStandardMaterial({color:0xb3aea1,roughness:.94});
 const box=new THREE.BoxGeometry(1,1,1);
 const batches=new Map();
 function beam(a,b,width,depth,material) {
  const delta=b.clone().sub(a);
  const centre=a.clone().lerp(b,.5);
  const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
  if(!batches.has(material))batches.set(material,[]);
  batches.get(material).push(new THREE.Matrix4().compose(centre,rotation,new THREE.Vector3(width,delta.length(),depth)));
 }
 function at(a,s,offset) {
  const [x,n]=point(a,s);
  return new THREE.Vector3(x,heightAt(x,n)+offset,-n);
 }
 for(const {start,end,side,balusters} of rails){
  const breaks=[start,Math.min(run,end),end].filter((p,i,all)=>i===0||p>all[i-1]);
  const plinth=balusters?.23:.11;
  for(let i=1;i<breaks.length;i++){
   const a=breaks[i-1],b=breaks[i];
   const depth=balusters?.64:.35;
   beam(at(a,side,plinth-depth/2),at(b,side,plinth-depth/2),.32,depth,stone);
   beam(at(a,side,plinth-.035),at(b,side,plinth-.035),.36,.10,cap);
   for(const h of [.49,1.02])beam(at(a,side,h),at(b,side,h),.066,.055,metal);
  }
  const count=Math.ceil((end-start)/(balusters?.155:1.85));
  for(let i=0;i<=count;i++){
   const a=start+(end-start)*i/count;
   const width=balusters&&i%12!==0?.023:.062;
   beam(at(a,side,plinth),at(a,side,1.02),width,width,metal);
  }
 }
 for(const [material,matrices] of batches){
  const mesh=new THREE.InstancedMesh(box,material,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
  mesh.name='Rathdown House · ramp border and rails';
  mesh.receiveShadow=true;
  scene.add(mesh);
 }
 const sign=new THREE.Group();
 const [sx,sn]=point(.45,halfWidth+1.14);
 sign.position.set(sx,heightAt(sx,sn),-sn);
 sign.rotation.y=Math.atan2(dn,dx);
 const support=new THREE.Mesh(new THREE.BoxGeometry(.72,3.25,.46),cap);
 support.position.y=1.625;sign.add(support);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#444c49';ctx.font='27px sans-serif';ctx.textAlign='center';
 ctx.fillText('GRÁINSEACH GHORMÁIN',256,50);ctx.fillText('GRANGEGORMAN',256,91);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const lettering=new THREE.Mesh(new THREE.PlaneGeometry(.61,.16),new THREE.MeshBasicMaterial({map,transparent:true}));
 lettering.position.set(0,2.57,.234);sign.add(lettering);
 sign.name='Rathdown House · forecourt wayfinding pillar';scene.add(sign);
 return {foot,head,rise,width:halfWidth*2,rails:rathdownBarriers.map(f=>f.coords)};
}
