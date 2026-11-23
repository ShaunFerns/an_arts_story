import * as THREE from 'three';
import {alignment,campusStreetWays,grangegormanAsphalt,ribbon} from './exterior.mjs';
import {groundFinish} from './surfaces.mjs';

const finish=(color)=>new THREE.MeshStandardMaterial({color,roughness:.91});
const kerb=finish(0xaaa298),paint=finish(0xe6e4da),bayBlue=finish(0x315a77),post=finish(0x697171);
const interpolate=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

function symbolTexture(draw,width=128,height=128) {
 const canvas=document.createElement('canvas');
 canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');
 draw(ctx,width,height);
 const map=new THREE.CanvasTexture(canvas);
 map.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
}

function wheelchair(ctx) {
 ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.arc(60,24,7,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.arc(57,78,22,.37,4.26);ctx.stroke();
 ctx.beginPath();ctx.moveTo(59,37);ctx.lineTo(64,66);ctx.lineTo(83,66);ctx.lineTo(96,92);
 ctx.lineTo(106,87);ctx.moveTo(63,49);ctx.lineTo(82,49);ctx.stroke();
}

function bicycle(ctx) {
 ctx.strokeStyle='#eeeae0';ctx.lineWidth=5;ctx.lineJoin='round';ctx.lineCap='round';
 for(const x of [33,96]){ctx.beginPath();ctx.arc(x,80,19,0,Math.PI*2);ctx.stroke();}
 ctx.beginPath();ctx.moveTo(33,80);ctx.lineTo(49,54);ctx.lineTo(81,54);
 ctx.lineTo(64,80);ctx.closePath();ctx.moveTo(64,80);ctx.lineTo(47,47);
 ctx.moveTo(40,47);ctx.lineTo(54,47);ctx.moveTo(96,80);ctx.lineTo(76,40);
 ctx.lineTo(88,40);ctx.stroke();
}

function decal(scene,centre,forward,width,length,y,heightAt,material,name) {
 const right=[forward[1],-forward[0]];
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([side,end])=>
  centre.map((v,i)=>v+side*width/2*right[i]+end*length/2*forward[i]));
 const geom=new THREE.BufferGeometry();
 geom.setAttribute('position',new THREE.Float32BufferAttribute(corners.flatMap(([x,n])=>[x,heightAt(x,n)+y,-n]),3));
 geom.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));
 geom.setIndex([0,1,2,0,2,3]);geom.computeVertexNormals();
 const mesh=new THREE.Mesh(geom,material);
 mesh.name=name;mesh.receiveShadow=true;scene.add(mesh);
}

function sign(scene,heightAt,point,right,boards,name) {
 const holder=new THREE.Group();
 holder.position.set(point[0],heightAt(...point),-point[1]);
 holder.rotation.y=Math.atan2(right[1],right[0]);
 holder.name=name;
 const stem=new THREE.Mesh(new THREE.BoxGeometry(.078,boards[0].y+.32,.078),post);
 stem.position.y=(boards[0].y+.32)/2;holder.add(stem);
 for(const {width,height,x=0,y,draw,bothSides=false} of boards){
  const depth=bothSides?.09:.035;
  const backing=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),post);
  backing.position.set(x,y,0);holder.add(backing);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(width,height),symbolTexture(draw,512,Math.round(512*height/width)));
  label.position.set(x,y,depth/2+.0025);holder.add(label);
  if(bothSides){
   const rear=label.clone();
   rear.rotation.y=Math.PI;
   rear.position.z=-label.position.z;holder.add(rear);
  }
 }
 scene.add(holder);
}

function wayfindingLabel(irish,english,arrow='') {
 return (ctx,w,h)=>{
  ctx.fillStyle='#28474b';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#f2f1e8';
  ctx.font='italic 40px Arial';ctx.fillText(irish,18,h*.40,arrow?w-112:w-36);
  ctx.font='bold 46px Arial';ctx.fillText(english,18,h*.81,arrow?w-112:w-36);
  if(arrow){ctx.font='70px Arial';ctx.fillText(arrow,w-88,h*.73);}
 };
}

export function addCampusStreet(scene,features,heightAt) {
 const surface=grangegormanAsphalt(),paving=groundFinish('granite');
 const coords=[...campusStreetWays].flatMap((id,i)=>features.find(f=>f.id===id).coords.slice(i?1:0));
 const stations=alignment(coords);
 const at=(north,off=0)=>{
  const i=stations.findIndex(({p})=>p[1]<=north);
  const a=stations[i-1],b=stations[i];
  const t=(north-a.p[1])/(b.p[1]-a.p[1]);
  return interpolate(a.p,b.p,t).map((v,j)=>v+interpolate(a.out,b.out,t)[j]*off);
 };
 const between=(from,to,off=0)=>[at(from,off),...stations.filter(({p})=>p[1]<from&&p[1]>to)
  .map(({p,out})=>p.map((v,j)=>v+out[j]*off)),at(to,off)];
 const strip=(points,a,b,lift,material,name)=>ribbon(scene,points,[[a,lift],[b,lift]],material,heightAt,name);
 const direction=(north)=>{
  const a=at(north-.45),b=at(north+.45),v=b.map((p,i)=>p-a[i]);
  return v.map(p=>p/Math.hypot(...v));
 };
 const blueBadge=symbolTexture(wheelchair);
 const bike=symbolTexture(bicycle);
 const parking=[];
 function parkingBay(position,forward,street) {
  const atOffset=(side,end)=>[position[0]+forward[1]*side+forward[0]*end,
                             position[1]-forward[0]*side+forward[1]*end];
  const y=street?.092:.124,halfWidth=street?1.10:1.20,halfLength=street?3.1:2.40;
  decal(scene,position,forward,halfWidth*2,halfLength*2,y,heightAt,bayBlue,'Accessible parking · bay');
  for(const side of [-1,1]){
   strip([atOffset(side*halfWidth,-halfLength),atOffset(side*halfWidth,halfLength)],.04,-.04,y+.007,paint,'Accessible parking · edge');
   strip([atOffset(-halfWidth,side*halfLength),atOffset(halfWidth,side*halfLength)],.04,-.04,y+.007,paint,'Accessible parking · end line');
  }
  decal(scene,position,forward,1.28,1.28,y+.014,heightAt,blueBadge,'Accessible parking · wheelchair marking');
  parking.push(position);
 }

 strip(coords,3.75,-3.75,.075,surface,'Grangegorman Lower · carriageway');
 for(const side of [-1,1]){
  for(const [from,to] of [[34,-9.5],[-14.5,-65.5],[-70.5,-120.6]]){
   strip(between(from,to),side>0?5.02:-3.75,side>0?3.75:-5.02,.096,paving,'Grangegorman Lower · footway');
   const edge=between(from,to,side*3.73);
   ribbon(scene,edge,[[.10,.066],[.10,.132],[-.10,.132],[-.10,.066]],kerb,heightAt,'Grangegorman Lower · kerb');
  }
  for(const [from,to] of [[34,-5],[-20,-59],[-75,-95],[-116,-120]])
   strip(between(from,to,side*2.3),.045,-.045,.081,paint,'Grangegorman Lower · cycle edge marking');
  for(const north of [21,-34,-52,-84,-114]){
   decal(scene,at(north,side*1.33),direction(north).map(v=>v*-side),.98,1.58,.085,heightAt,bike,'Grangegorman Lower · bicycle marking');
  }
 }
 for(const [from,to] of [[27,-8],[-19,-64],[-75,-119]]){
  for(let n=from;n-2.3>=to;n-=7.2)
   strip(between(n,n-2.3),.053,-.053,.083,paint,'Grangegorman Lower · dashed centre marking');
 }
 for(const north of [-12,-68]){
  strip(between(north+2.5,north-2.5),5,-5,.101,paving,'Grangegorman Lower · full-width crossing');
  for(const side of [-1,1]){
   const marker=at(north,side*4.64);
   decal(scene,marker,direction(north),.64,2.15,.108,heightAt,finish(0x9a6255),'Grangegorman Lower · tactile crossing paving');
  }
 }
 for(const [north,side] of [[-101,1],[-107,-1]]){
  const forward=direction(north);
  parkingBay(at(north,side*2.57),forward,true);
  const pin=at(north+3.3,side*3.99);
  sign(scene,heightAt,pin,[forward[1],-forward[0]],[{width:.39,height:.45,y:1.68,bothSides:true,draw(ctx,w,h){
   ctx.fillStyle='#1f4875';ctx.fillRect(0,0,w,h);
   ctx.save();ctx.translate(w*.24,h*.14);ctx.scale(w/235,w/235);wheelchair(ctx);ctx.restore();
   ctx.fillStyle='#fff';ctx.font='bold 64px Arial';ctx.textAlign='center';ctx.fillText('P',w/2,h*.86);
  }}],'Grangegorman Lower · Blue Badge parking sign');
 }

 // The two campus bays sit inside the Rathdown House forecourt. They
 // are distinct from the two bays on Grangegorman Lower at East Quad.
 // Mapped rows at the southern approach represent individual posts,
 // with clear gaps where the two on-street bays are marked.
 const bollards=new THREE.InstancedMesh(new THREE.CylinderGeometry(.084,.093,.81,10),post,50);
 bollards.count=0;
 for(const id of ['way/1342953793','way/1342953794']){
  const [a,b]=features.find(f=>f.id===id).coords;
  const count=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/1.45);
  for(let i=0;i<=count;i++){
   const [x,n]=interpolate(a,b,i/count);
   if(parking.some(([px,pn])=>Math.hypot(x-px,n-pn)<3.8))continue;
   bollards.setMatrixAt(bollards.count++,new THREE.Matrix4().makeTranslation(x,heightAt(x,n)+.45,-n));
  }
 }
 bollards.name='Grangegorman Lower · cycle street bollards';bollards.castShadow=true;scene.add(bollards);

 const length=Math.hypot(.381,.924),bayForward=[.381/length,.924/length];
 for(const position of [[18.9,-46.35],[21.3,-47.34]])parkingBay(position,bayForward,false);

 // Bilingual fingers by the East Quad approach, based on the
 // Grangegorman Lower street photograph and the campus access map.
 const north=-77,forward=direction(north);
 sign(scene,heightAt,at(north,-7.2),forward.map(v=>-v),[
  {width:1.65,height:.30,x:.82,y:2.46,draw:wayfindingLabel('An tÁras Íochtair','Lower House','→')},
  {width:1.42,height:.28,x:.71,y:2.13,draw:wayfindingLabel('Margadh na Feirme','Smithfield','→')},
  {width:1.69,height:.29,x:-.84,y:1.81,draw:wayfindingLabel('Cúram Príomhúil FSS','HSE Primary Care','←')},
 ],'Grangegorman · bilingual campus wayfinding');
 const streetNorth=-54;
 sign(scene,heightAt,at(streetNorth,5.18),direction(streetNorth),[
  {width:1.69,height:.30,y:1.48,draw:wayfindingLabel('Gráinseach Ghormáin Íochtarach','Grangegorman Lower')},
 ],'Grangegorman Lower · bilingual street name');
 return {parking,signs:4,crossings:[-12,-68]};
}
