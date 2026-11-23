import * as THREE from 'three';

const membrane=new THREE.MeshStandardMaterial({color:0x686966,roughness:.96});
const slate=new THREE.MeshStandardMaterial({color:0x454a52,roughness:.91});

const heritage={
 'way/281880562':{stone:'lowerStone',levels:2,eaves:9.5,roof:'hip',rise:1.65},
 'way/310375420':{stone:'chapelStone',levels:1,eaves:7.4,roof:'gable',rise:3.9},
 'way/310375422':{stone:'rathdownStone',levels:2,eaves:6.85,roof:'gable',rise:4.12,ranges:true},
 'way/516821746':{stone:'infirmaryStone',levels:2,eaves:7.8,roof:'hip',rise:3.0},
 'way/516821745':{stone:'infirmaryStone',levels:2,eaves:7.8,roof:'gable',rise:4.65,ranges:true},
 'way/396704720':{stone:'wardStone',levels:3,eaves:11.2,roof:'gable',rise:3.7},
 'way/307799384':{stone:'lowerStone',levels:3,eaves:11.0,roof:'hip',rise:3.0},
 'way/516824969':{stone:'clockStone',levels:3,eaves:11.3,roof:'hip',rise:3.5},
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
 if(design.ranges){
  // Each wing gets its own ridge. All slopes are trimmed against the mapped outline.
  const bradogue=feature.id==='way/516821745';
  const direction=bradogue?[14.9,-6.1]:[8.8,-3.6];
  const axis=direction.map(v=>v/Math.hypot(...direction));
  const side=[-axis[1],axis[0]];
  const [x,n]=bradogue?[-1.6,-63.7]:[2,-25.6];
  const offset=p=>[p[0]-x,p[1]-n];
  const u=p=>dot(offset(p),axis),d=p=>dot(offset(p),side);
  const wings=bradogue?[
   {width:[-.1,25.75],depth:[1.06,9.02],pitch:'cross',rise:4.25},
   {width:[-.05,6.54],depth:[-.08,16.26],pitch:'long',rise:4.65},
   {width:[10.07,15.25],depth:[7.75,16.05],pitch:'long',rise:3.76},
   {width:[19.19,25.76],depth:[.04,16.27],pitch:'long',rise:4.62},
  ]:[
   {width:[-63.4,-26.8],depth:[20.5,33.8],pitch:'cross',rise:4.02},
   {width:[-27.5,27.25],depth:[14.35,24.3],pitch:'cross',rise:3.23},
   {width:[-27.6,-15.0],depth:[9.5,24.1],pitch:'long',rise:4.00,hip:true},
   {width:[18.3,27.25],depth:[10,27.72],pitch:'long',rise:3.85,hip:true},
   {width:[-4.85,4.85],depth:[-.1,20.4],pitch:'long',rise:3.92},
   {width:[-6.8,5.9],depth:[20,34.05],pitch:'long',rise:4.10,hip:true},
   {width:[-15.4,-6.5],depth:[20.8,34.1],pitch:'cross',rise:3.03,hip:true},
   {width:[-28.8,-19.3],depth:[26.2,37.7],pitch:'long',rise:3.65},
   {width:[-46.6,-35],depth:[27.6,42.4],pitch:'long',rise:3.72,hip:true},
   {width:[-56.2,-46.9],depth:[28,37.6],pitch:'long',rise:3.58},
  ];
  const perimeter=plan.map((a,j)=>[a,plan[(j+1)%plan.length]]);
  const onPerimeter=(a,b)=>perimeter.some(([q,r])=>{
   const dx=r[0]-q[0],dn=r[1]-q[1],span=dx*dx+dn*dn;
   if(span<1e-9)return false;
   return [a,b].every(([x,n])=>{
    const t=((x-q[0])*dx+(n-q[1])*dn)/span;
    return t>=-.0001&&t<=1.0001&&Math.abs((x-q[0])*dn-(n-q[1])*dx)<.01;
   });
  });
  for(const {width:[w0,w1],depth:[d0,d1],pitch,rise,hip} of wings){
   const cross=pitch==='long'?u:d,along=pitch==='long'?d:u;
   const [min,max]=pitch==='long'?[w0,w1]:[d0,d1];
   const [start,end]=pitch==='long'?[d0,d1]:[w0,w1];
   const slope=rise/((max-min)/2);
   const planes=[p=>(cross(p)-min)*slope,p=>(max-cross(p))*slope];
   if(hip)planes.push(p=>(along(p)-start)*slope,p=>(end-along(p))*slope);
   for(const tri of triangles){
    const bounds=clip(clip(clip(clip(tri,u,w0,true),u,w1,false),d,d0,true),d,d1,false);
    for(const plane of planes){
     const face=planes.filter(next=>next!==plane).reduce((poly,next)=>clip(poly,p=>next(p)-plane(p),0,true),bounds);
     horizontal(face,p=>design.eaves+Math.max(0,plane(p)));
     for(let j=0;j<face.length;j++){
      const a=face[j],b=face[(j+1)%face.length];
      const va=[u(a),d(a)],vb=[u(b),d(b)];
      const atEdge=[w0,w1,d0,d1].some((edge,k)=>Math.abs(va[k>>1]-edge)<.001&&Math.abs(vb[k>>1]-edge)<.001);
      if(atEdge||onPerimeter(a,b))upright(a,b,design.eaves,design.eaves,design.eaves+Math.max(0,plane(a)),design.eaves+Math.max(0,plane(b)));
     }
    }
   }
  }
  ridgeHeight=design.eaves+design.rise;
 }else if(design.roof==='terrace'){
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

 }
 const name=feature.name||'Academic Hub & Library';
 meshFromTriangles(scene,cap,design.roof==='terrace'?membrane:slate,'Roof · '+name);
 meshFromTriangles(scene,walls,design.roof==='hip'?slate:wallMaterial,'Roof edges · '+name);
 return {profile:design.roof,eaves:design.eaves,ridge:ridgeHeight,...(feature.id==='way/516821745'?{crossGables:3}:{})};
}
