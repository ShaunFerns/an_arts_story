import * as THREE from 'three';

const membrane=new THREE.MeshStandardMaterial({color:0x686966,roughness:.96});
const slate=new THREE.MeshStandardMaterial({color:0x454a52,roughness:.91});
const copper=new THREE.MeshStandardMaterial({color:0x508575,roughness:.53,metalness:.25});
const clock=new THREE.MeshStandardMaterial({color:0xd5c7a7,roughness:.72});
const markings=new THREE.MeshStandardMaterial({color:0x343032,roughness:.85});

const heritage={
 'way/310375420':{stone:'chapelStone',levels:1,eaves:7.4,roof:'gable',rise:3.9},
 'way/310375422':{stone:'wardStone',levels:2,eaves:8.8,roof:'gable',rise:3.25},
 'way/516821746':{stone:'infirmaryStone',levels:2,eaves:7.8,roof:'hip',rise:3.0},
 'way/516821745':{stone:'infirmaryStone',levels:2,eaves:7.8,roof:'gable',rise:3.15},
 'way/396704720':{stone:'wardStone',levels:3,eaves:11.2,roof:'gable',rise:3.7},
 'way/307799384':{stone:'lowerStone',levels:3,eaves:11.0,roof:'hip',rise:3.0},
 'way/516824969':{stone:'clockStone',levels:3,eaves:11.3,roof:'hip',rise:3.5,cupola:true},
 'way/396704721':{stone:'infirmaryStone',levels:1,eaves:4.9,roof:'gable',rise:2.85},
};

export function buildingDesign(feature,palette,height) {
 const historic=heritage[feature.id];
 if(historic)return historic;
 if(palette==='central')return {stone:'centralBrick',levels:6,eaves:21.4,roof:'terrace',
  axis:[.10,1],cuts:[108,137],tiers:[21.4,24,26]};
 if(palette==='library'){
  const north=feature.id==='way/1457282385';
  return north?{stone:'harling',levels:4,eaves:12.8,roof:'terrace',
   axis:[.19,1],cuts:[147],tiers:[12.8,16.3]}:
   {stone:'harling',levels:5,eaves:17.8,roof:'terrace',
    axis:[1,.23],cuts:[-225,-197],tiers:[17.8,21.0,24]};
 }
 return {levels:null,eaves:height};
}

const dot=([x,n],[a,b])=>x*a+n*b;
const interpolate=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];

function clip(poly,value,at,keepHigh) {
 const kept=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],va=value(a)-at,vb=value(b)-at;
  const inside=v=>keepHigh?v>=-1e-6:v<=1e-6;
  if(inside(va))kept.push(a);
  if(inside(va)!==inside(vb))kept.push(interpolate(a,b,va/(va-vb)));
 }
 return kept;
}
function meshFromTriangles(scene,vertices,material,name) {
 if(vertices.length<9)return;
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 const uv=[];
 for(let i=0;i<vertices.length;i+=3){
  const [x,y,z]=vertices.slice(i,i+3);
  uv.push((x+z)*.72,y+(-z)*.19);
 }
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,material);
 mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=name;
 scene.add(mesh);
}
export function roofLevel(design,point) {
 if(design.roof!=='terrace')return design.eaves;
 const v=dot(point,design.axis);
 return design.tiers[design.cuts.filter(c=>v>=c).length];
}

function addCupola(scene,x,n,y) {
 function place(geom,material,height){
  const m=new THREE.Mesh(geom,material);
  m.position.set(x,height,-n);m.castShadow=true;scene.add(m);return m;
 }
 const drum=place(new THREE.CylinderGeometry(1.15,1.28,2.25,8),clock,y+1.08);
 drum.rotation.y=Math.PI/8;
 const profile=[[0,0],[1.17,0],[1.16,.24],[1.07,.55],[.83,.86],[.47,1.1],[.14,1.25],[0,1.29]]
  .map(p=>new THREE.Vector2(...p));
 place(new THREE.LatheGeometry(profile,12),copper,y+2.18);
 place(new THREE.CylinderGeometry(.045,.065,.55,8),copper,y+3.63);
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2,dx=Math.sin(a),dz=Math.cos(a);
  const dial=place(new THREE.CircleGeometry(.39,24),markings,y+1.24);
  dial.position.x+=dx*1.143;dial.position.z+=dz*1.143;dial.rotation.y=a;
  for(const [angle,height] of [[.16,.21],[1.86,.27]]){
   const hand=new THREE.Mesh(new THREE.PlaneGeometry(.031,height),clock);
   hand.rotation.z=angle;hand.position.set(-Math.sin(angle)*height/2,Math.cos(angle)*height/2,.006);
   dial.add(hand);
  }
 }
}

export function addBuildingRoof(scene,feature,design,base,wallMaterial) {
 if(!design.roof)return null;
 const plan=feature.coords.slice(0,-1);
 const triangles=THREE.ShapeUtils.triangulateShape(plan.map(p=>new THREE.Vector2(...p)),[])
  .map(indices=>indices.map(i=>plan[i]));
 const cap=[],walls=[];
 const v=(into,p,y)=>into.push(p[0],base+y,-p[1]);
 const horizontal=(region,height)=>{
  for(let i=1;i+1<region.length;i++){
   const [a,b,c]=[region[0],region[i],region[i+1]];
   // In east/north coordinates positive winding faces upwards in Three.js.
   const positive=(b[0]-a[0])*(c[1]-a[1])>(b[1]-a[1])*(c[0]-a[0]);
   for(const p of positive?[a,b,c]:[a,c,b])v(cap,p,height(p)+.022);
  }
 };
 const upright=(a,b,lowA,lowB,topA,topB)=>{
  if(topA-lowA<.01&&topB-lowB<.01)return;
  for(const [p,h] of [[a,lowA],[b,lowB],[b,topB],[a,lowA],[b,topB],[a,topA],
   [a,lowA],[b,topB],[b,lowB],[a,lowA],[a,topA],[b,topB]])v(walls,p,h);
 };
 let ridgeHeight=design.eaves;
 if(design.roof==='terrace'){
  const value=p=>dot(p,design.axis);
  for(const tri of triangles){
   for(let i=0;i<design.tiers.length;i++){
    const bottom=design.cuts[i-1],top=design.cuts[i];
    let part=tri;
    if(bottom!==undefined)part=clip(part,value,bottom,true);
    if(top!==undefined)part=clip(part,value,top,false);
    horizontal(part,()=>design.tiers[i]);
   }
   for(const [i,breakAt] of design.cuts.entries()){
    const hits=tri.flatMap((a,j)=>{
     const b=tri[(j+1)%3],u=value(a),w=value(b);
     return (u<breakAt&&w>=breakAt||w<breakAt&&u>=breakAt)?[interpolate(a,b,(breakAt-u)/(w-u))]:[];
    });
    if(hits.length===2)upright(...hits,design.tiers[i],design.tiers[i],design.tiers[i+1],design.tiers[i+1]);
   }
  }
  for(let i=0;i<plan.length;i++){
   const a=plan[i],b=plan[(i+1)%plan.length];
   for(const [j,tier] of design.tiers.entries()){
    const segment=[a,b];
    const pieces=[0,1,...design.cuts.map(c=>(c-value(a))/(value(b)-value(a))).filter(t=>t>0&&t<1)].sort((x,y)=>x-y);
    for(let k=0;k<pieces.length-1;k++){
     const p=interpolate(...segment,pieces[k]),q=interpolate(...segment,pieces[k+1]);
     if(roofLevel(design,interpolate(p,q,.5))===design.tiers[j])
      upright(p,q,design.eaves,design.eaves,tier+.42,tier+.42);
    }
   }
  }
  ridgeHeight=Math.max(...design.tiers);
 }else{
  const longest=plan.map((a,i)=>{const b=plan[(i+1)%plan.length];return [b[0]-a[0],b[1]-a[1]];})
   .sort((a,b)=>Math.hypot(...b)-Math.hypot(...a))[0];
  const length=Math.hypot(...longest),direction=longest.map(v=>v/length);
  const perpendicular=[-direction[1],direction[0]];
  const across=p=>dot(p,perpendicular),along=p=>dot(p,direction);
  const cross=plan.map(across),long=plan.map(along);
  const minCross=Math.min(...cross),maxCross=Math.max(...cross);
  const ridge=(minCross+maxCross)/2,half=(maxCross-minCross)/2;
  const minLong=Math.min(...long),maxLong=Math.max(...long);
  const hip=Math.min((maxLong-minLong)/3,half);
  const height=p=>{
   const pitch=1-Math.abs(across(p)-ridge)/half;
   const end=design.roof==='hip'?Math.min((along(p)-minLong)/hip,(maxLong-along(p))/hip):1;
   return design.eaves+design.rise*Math.max(0,Math.min(pitch,end));
  };
  // Split exactly at the ridge. A few longitudinal cuts keep the hip transitions on the main volume visible.
  for(const tri of triangles)for(const high of [false,true]){
   const face=clip(tri,across,ridge,high);
   if(design.roof==='hip'){
    const ends=[minLong+hip*.5,minLong+hip,maxLong-hip,maxLong-hip*.5];
    for(let i=0;i<=ends.length;i++){
     let strip=face;
     if(i>0)strip=clip(strip,along,ends[i-1],true);
     if(i<ends.length)strip=clip(strip,along,ends[i],false);
     horizontal(strip,height);
    }
   }else horizontal(face,height);
  }
  for(let i=0;i<plan.length;i++){
   const a=plan[i],b=plan[(i+1)%plan.length];
   const t=(ridge-across(a))/(across(b)-across(a));
   const sides=t>0&&t<1?[a,interpolate(a,b,t),b]:[a,b];
   for(let k=1;k<sides.length;k++)
    upright(sides[k-1],sides[k],design.eaves,design.eaves,height(sides[k-1]),height(sides[k]));
  }
  ridgeHeight=design.eaves+design.rise;
  if(design.cupola){
   const centre=plan.reduce(([x,n],p)=>[x+p[0]/plan.length,n+p[1]/plan.length],[0,0]);
   addCupola(scene,...centre,base+height(centre)-.16);
  }
 }
 const name=feature.name||'Academic Hub & Library';
 meshFromTriangles(scene,cap,design.roof==='terrace'?membrane:slate,'Roof · '+name);
 meshFromTriangles(scene,walls,design.roof==='hip'?slate:wallMaterial,'Roof edges · '+name);
 return {profile:design.roof,eaves:design.eaves,ridge:ridgeHeight,cupola:!!design.cupola};
}
