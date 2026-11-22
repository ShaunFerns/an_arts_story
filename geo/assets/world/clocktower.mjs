import * as THREE from 'three';

export const clockTowerId='way/516824969';
const centre=[83,-16];
const length=Math.hypot(8,25.2);
const north=[8/length,25.2/length];
const east=[north[1],-north[0]];
const planPoint=([x,n])=>[(x-centre[0])*north[0]+(n-centre[1])*north[1],
                         (x-centre[0])*east[0]+(n-centre[1])*east[1]];
const worldPoint=(u,d)=>centre.map((v,i)=>v+north[i]*u+east[i]*d);
const material=(color,roughness=.89)=>new THREE.MeshStandardMaterial({color,roughness});
const slate=material(0x47494a);
const granite=material(0xb6afa2);
const brick=material(0x805e50);
const timber=material(0x454036);
const iron=material(0x313431);
const glass=material(0x435e64,.34);
const sash=material(0x9d9c91);
const copper=material(0x648f7e,.55);
const dial=material(0x343733);
const gilt=material(0xc3ab70,.61);
const frontEaves=10.55, centreHalf=length/2;

// The street fronts due west in this building's local frame. Sections follow
// the bends in the mapped perimeter and Figure A2a:4's connected ranges.
const wings=[
 {from:-44.12,to:-centreHalf,depth:1.92,bays:[-41.7,-36.7,-31.4,-24.9,-20.5,-15.8]},
 {from:-centreHalf,to:centreHalf,depth:0,bays:[-9.45,-4.72,0,4.72,9.45]},
 {from:centreHalf,to:44.65,depth:2.63,bays:[15.8,20.5,24.9,31.4,36.7,41.7]},
];
const rearSections=[
 {name:'Canted spine and former chapel',bounds:[-14,14,10.72,22.66],eaves:10.08,rise:2.28,axis:0},
 {name:'Connecting corridor',bounds:[-12,13,22.66,31.48],eaves:7.18,rise:1.43,axis:0},
 {name:'North return',bounds:[2.47,30,31.48,43.45],eaves:9.32,rise:2.22,axis:1},
 {name:'East range',bounds:[-13,16,31.48,78],eaves:8.61,rise:2.45,axis:0},
];
const split=(polygon,plane)=>{
 const part=[];
 for(const [i,a] of polygon.entries()){
  const b=polygon[(i+1)%polygon.length],f=plane(a),g=plane(b);
  if(f>=-1e-8)part.push(a);
  if((f>=0)!==(g>=0))part.push(a.map((v,j)=>v+(b[j]-v)*f/(f-g)));
 }
 return part;
};

export function addClockTower(scene,feature,heightAt,masonry) {
 const group=new THREE.Group();
 group.name='Clock Tower Building · surviving ranges';
 group.position.set(centre[0],heightAt(...centre)+.02,-centre[1]);
 group.rotation.y=Math.atan2(-east[0],east[1]);
 scene.add(group);
 const box=new THREE.BoxGeometry(1,1,1);
 const parts=new Map();
 function block(u,d,y,w,depth,h,finish,angle=0) {
  if(w<.01||depth<.01||h<.01)return;
  const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle);
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(-u,y,-d),q,new THREE.Vector3(w,h,depth));
  if(!parts.has(finish))parts.set(finish,[]);
  parts.get(finish).push(matrix);
 }
 const geometry=new Map();
 function triangle(a,b,c,finish) {
  if(!geometry.has(finish))geometry.set(finish,{points:[],uv:[]});
  const {points,uv}=geometry.get(finish);
  for(const [u,d,y] of [a,b,c]){
   points.push(-u,y,-d);
   uv.push(u+.32*d,finish===slate?d:y);
  }
 }
 function quad(a,b,c,d,finish){triangle(a,b,c,finish);triangle(a,c,d,finish);}
 function wall(u1,u2,d,bottom,top,finish=masonry){
  if(u2-u1<.01||top-bottom<.01)return;
  quad([u2,d,bottom],[u1,d,bottom],[u1,d,top],[u2,d,top],finish);
 }
 function window(u,d,y,w,h,paneCount=2) {
  block(u,d-.035,y,w+.24,.15,h+.16,granite);
  block(u,d-.127,y,w+.07,.052,h+.04,iron);
  block(u,d-.159,y,w,.034,h,glass);
  for(let i=1;i<paneCount;i++)block(u-w/2+w*i/paneCount,d-.184,y,.037,.035,h,sash);
  for(const t of [-.26,0,.26])block(u,d-.186,y+h*t,w,.034,t===0?.075:.031,sash);
  block(u,d-.10,y-h/2-.10,w+.26,.32,.135,granite);
 }

 // All street bays are positioned explicitly in the surveyed 6 + 5 + 6 rhythm.
 for(const wing of wings){
  const {from,to,depth,bays}=wing;
  const middle=depth===0;
  const segments=[from,...bays.slice(1).map((v,i)=>(v+bays[i])/2),to];
  for(const [i,u] of bays.entries()){
   const endBay=Math.abs(u)>40;
   const d=depth-(endBay?.39:0);
   if(endBay){
    const edge=u>0?segments[i]:segments[i+1];
    quad([edge,d,0],[edge,depth,0],[edge,depth,frontEaves],[edge,d,frontEaves],masonry);
   }
   for(const [level,y] of [1.63,5.03,8.40].entries()){
    const door=level===0&&u===0;
    const northGate=level===0&&u===24.9;
    const southGate=level===0&&u===-24.9;
    const gate=northGate||southGate;
    const w=gate?3.02:door?2.18:endBay?1.39:1.49;
    const h=gate?3.1:door?2.62:level===2?1.66:1.93;
    const low=level===0?0:level===1?3.43:6.82;
    const high=level===0?3.43:level===1?6.82:frontEaves;
    const sill=gate||door?0:y-h/2-.07;
    const head=gate||door?h:y+h/2+.07;
    const left=u-w/2,right=u+w/2;
    wall(segments[i],left,d,low,high);
    wall(right,segments[i+1],d,low,high);
    wall(left,right,d,low,sill);
    wall(left,right,d,head,high);
    if(gate||door){
     block(u,d+.26,h/2,w,.19,h,timber);
     for(const side of [-1,1])block(u+side*(w/2+.20),d-.06,h/2,.39,.42,h,granite);
     block(u,d-.10,h+.105,w+.84,.48,.27,granite);
     for(let offset=-w/2+.13;offset<w/2;offset+=.145)block(u+offset,d+.149,h/2,.019,.026,h-.09,iron);
    }else{
     window(u,d,y,w,h,middle&&i%2?1:endBay?3:2);
     if(level===0){
      for(let offset=-w/2+.12;offset<w/2;offset+=.16)block(u+offset,d-.27,.84,.021,.024,1.07,iron);
      block(u,d-.28,1.38,w+.16,.036,.046,iron);
     }
    }
   }
   block((segments[i]+segments[i+1])/2,d-.12,10.45,segments[i+1]-segments[i],.35,.20,granite);
   if(middle||endBay)block((segments[i]+segments[i+1])/2,d-.105,3.64,segments[i+1]-segments[i],.28,.16,granite);
  }
 }
 // Projecting three-bay porch with stone arch and a rail to the balcony.
 block(0,-.94,.135,6.7,2.40,.27,granite);
 block(0,-1.36,.075,6.98,2.10,.15,granite);
 for(const u of [-2.43,2.43]){
  block(u,-.63,1.25,1.25,1.39,2.50,masonry);
  window(u,-1.34,1.47,.68,1.28);
 }
 for(let i=0;i<15;i++){
  const a=Math.PI*.13+i*Math.PI*.74/15,b=a+Math.PI*.74/15;
  const vertex=(angle,r)=>[Math.cos(angle)*r,-1.40,1.45+Math.sin(angle)*r*.62];
  quad(vertex(a,2.04),vertex(b,2.04),vertex(b,2.43),vertex(a,2.43),granite);
 }
 block(0,-.81,3.24,6.06,1.57,.26,granite);
 for(let u=-2.90;u<=2.91;u+=.16)block(u,-1.57,3.86,.035,.039,.91,iron);
 block(0,-1.57,4.32,5.92,.056,.057,iron);

 // Roofs are clipped to the same coordinates as the collision footprint.
 const outline=feature.coords.slice(0,-1).map(planPoint);
 const planTriangles=THREE.ShapeUtils.triangulateShape(outline.map(p=>new THREE.Vector2(...p)),[])
  .map(piece=>piece.map(i=>outline[i]));
 const roofRegions=[
  ...wings.map(({from,to,depth},i)=>({
   name:i===1?'Pedimented breakfront':'Hipped west wing',
   bounds:[from,to,-.05,10.72],eaves:frontEaves,rise:i===1?2.56:2.65,axis:i===1?1:0,
   openWest:i===1,westDepth:depth,
  })),
  ...rearSections,
 ];
 function planesFor({bounds:[lo,hi,near,far],rise,axis,openWest,westDepth}){
  const width=axis===0?far-(westDepth??near):hi-lo;
  const slope=rise/(width/2);
  return axis===0?[
   p=>rise,p=>slope*(p[1]-(westDepth??near)),p=>slope*(far-p[1]),
   p=>slope*(p[0]-lo),p=>slope*(hi-p[0]),
  ]:[p=>rise,p=>slope*(p[0]-lo),p=>slope*(hi-p[0]),
     ...(openWest?[]:[p=>slope*(p[1]-near)]),p=>slope*(far-p[1])*1.5];
 }
 for(const region of roofRegions){
  const [lo,hi,near,far]=region.bounds;
  const bounds=[p=>p[0]-lo,p=>hi-p[0],p=>p[1]-near,p=>far-p[1]];
  const planes=planesFor(region);
  const outerSection=region.name==='East range';
  for(const tri of planTriangles){
   // The north return is cut out of the east range, giving each its own roof.
   const clipped=bounds.reduce(split,tri);
   const pieces=outerSection?[
    split(clipped,p=>2.47-p[0]),
    split(split(clipped,p=>p[0]-2.47),p=>p[1]-43.45),
   ]:[clipped];
   for(const piece of pieces){
    if(piece.length<3)continue;
    for(const plane of planes){
     const face=planes.filter(p=>p!==plane).reduce((poly,test)=>split(poly,p=>test(p)-plane(p)),piece);
     const v=([u,d])=>[u,d,region.eaves+Math.max(0,plane([u,d]))];
     for(let i=1;i<face.length-1;i++){
      const [a,b,c]=[face[0],face[i],face[i+1]];
      const sign=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      if(Math.abs(sign)>1e-7)triangle(v(a),v(sign>0?c:b),v(sign>0?b:c),slate);
     }
     for(let i=0;i<face.length;i++){
      const a=face[i],b=face[(i+1)%face.length];
      if(!bounds.some(f=>Math.abs(f(a))<1e-6&&Math.abs(f(b))<1e-6))continue;
      // Wall at each change of roof height, above the adjacent lower roof only.
       if(region.openWest&&Math.abs(a[1])<.1&&Math.abs(b[1])<.1)continue;
      quad([a[0],a[1],region.eaves-.03],[b[0],b[1],region.eaves-.03],v(b),v(a),masonry);
     }
    }
   }
  }
 }
 // Pediment spans the full five-bay front. The tower stands over its middle bay.
 triangle([centreHalf,0,frontEaves],[-centreHalf,0,frontEaves],[0,0,frontEaves+2.56],masonry);
 for(const side of [-1,1]){
  const L=Math.hypot(centreHalf,2.56);
  const trim=new THREE.Mesh(new THREE.BoxGeometry(L+.18,.22,.30),granite);
  trim.rotation.z=side*Math.atan2(2.56,centreHalf);
  trim.position.set(-side*centreHalf/2,frontEaves+1.30,.095);
  group.add(trim);
 }
 const towerD=5.35,plinth=13.10;
 block(0,towerD,plinth+.23,5.62,5.62,.55,granite);
 // A chamfered square granite drum with four broad cardinal faces.
 const corners=[[-2.28,-1.73],[-1.73,-2.28],[1.73,-2.28],[2.28,-1.73],
                [2.28,1.73],[1.73,2.28],[-1.73,2.28],[-2.28,1.73]];
 const towerShape=new THREE.Shape(corners.map(([x,y])=>new THREE.Vector2(x,y)));
 const drum=new THREE.Mesh(new THREE.ExtrudeGeometry(towerShape,{depth:4.02,bevelEnabled:false}),granite);
 drum.rotation.x=-Math.PI/2;drum.position.set(0,plinth+.43,-towerD);group.add(drum);
 for(const y of [plinth+.62,plinth+4.40])block(0,towerD,y,4.95,4.95,.23,granite);
 const profile=[[2.03,0],[2.02,.27],[1.95,.69],[1.72,1.14],[1.28,1.60],[.82,1.94],[.48,2.18],[.25,2.40],[.06,2.57]];
 const dome=new THREE.Mesh(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32),copper);
 dome.position.set(0,plinth+4.47,-towerD);group.add(dome);
 block(0,towerD,plinth+7.46,.075,.075,.97,iron);
 block(0,towerD,plinth+7.77,.66,.10,.105,iron);
 for(let i=0;i<4;i++){
  const angle=i*Math.PI/2;
  const face=new THREE.Group();
  face.position.set(2.294*Math.sin(angle),plinth+2.61,-towerD+2.294*Math.cos(angle));
  face.rotation.y=angle;
  group.add(face);
  const circle=new THREE.Mesh(new THREE.CircleGeometry(1.07,48),dial);face.add(circle);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.059,1.14,48),gilt);ring.position.z=.008;face.add(ring);
  for(let tick=0;tick<12;tick++){
   const a=tick*Math.PI/6;
   const marker=new THREE.Mesh(new THREE.PlaneGeometry(.062,.14),gilt);
   marker.position.set(.89*Math.sin(a),.89*Math.cos(a),.015);marker.rotation.z=-a;face.add(marker);
  }
  for(const [angle,len] of [[-.55,.55],[1.08,.78]]){
   const hand=new THREE.Mesh(new THREE.PlaneGeometry(.066,len),gilt);
   hand.rotation.z=angle;hand.position.set(-Math.sin(angle)*len/2,Math.cos(angle)*len/2,.022);face.add(hand);
  }
 }
 for(const [u,d] of [[-33,7],[-18,7],[-8.2,8.9],[9.7,7.8],[19,7.2],[34,7.5],[-5,17],[6,14]]){
   const roof=roofRegions.find(({bounds:[a,b,c,e]})=>u>=a&&u<=b&&d>=c&&d<=e);
  const eaves=roof.eaves+Math.max(0,Math.min(...planesFor(roof).map(f=>f([u,d]))))-.12;
  block(u,d,eaves+.61,1.24,.89,1.61,granite);
  block(u,d,eaves+1.40,1.39,.99,.15,granite);
  for(const s of [-.35,0,.35])block(u+s,d,eaves+1.62,.21,.21,.37,brick);
 }

 // Remaining sides retain the mapped boundary, including the two rear courts.
 const courtyardRoof=(u,d)=>rearSections.find(({bounds:[lo,hi,near,far]})=>
  u>=lo&&u<=hi&&d>=near&&d<=far);
 function sideWall(a,b) {
  const du=b[0]-a[0],dd=b[1]-a[1];
  const len=Math.hypot(du,dd);
  if(len<.04)return;
  const [u,d]=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const section=courtyardRoof(u,d);
  const h=section?.eaves??frontEaves;
  quad([a[0],a[1],0],[b[0],b[1],0],[b[0],b[1],h],[a[0],a[1],h],masonry);
  const bays=Math.round(len/4.4);
  const n1=-dd/len,n2=du/len;
  const angle=Math.atan2(-dd,du);
  for(let j=0;j<bays;j++){
   const t=(j+.5)/bays,x=a[0]+t*du+n1*.08,z=a[1]+t*dd+n2*.08;
   for(const y of h>8?[1.67,4.5,7.36]:[1.62,4.42]){
    if(section===rearSections[0]&&y===7.36&&d>13){
     const pointed=new THREE.Shape();
     pointed.moveTo(-.51,-.86);pointed.lineTo(.51,-.86);pointed.lineTo(.51,.23);
     pointed.quadraticCurveTo(.39,.59,0,.94);
     pointed.quadraticCurveTo(-.39,.59,-.51,.23);pointed.closePath();
     const reveal=new THREE.Mesh(new THREE.ShapeGeometry(pointed),brick);
     reveal.material=brick.clone();reveal.material.side=THREE.DoubleSide;
     reveal.position.set(-x,y,-z);reveal.rotation.y=angle;group.add(reveal);
     const light=new THREE.Mesh(reveal.geometry,glass);
     light.material=glass.clone();light.material.side=THREE.DoubleSide;
     light.position.set(-x-n1*.024,y,-z-n2*.024);light.rotation.y=angle;light.scale.set(.76,.83,1);
     group.add(light);
     continue;
    }
    const trim=section?brick:granite;
    block(x,z,y,1.28,.20,1.58,trim,angle);
    block(x+n1*.13,z+n2*.13,y,1.01,.075,1.36,glass,angle);
    block(x+n1*.18,z+n2*.18,y,1.01,.048,.061,sash,angle);
   }
  }
 }
 const depthBreaks=[10.72,22.66,31.48,43.45];
 for(const [i,a] of outline.entries()){
  const b=outline[(i+1)%outline.length];
  if(a[1]<2.75&&b[1]<2.75)continue;
  const cuts=[0,1,...depthBreaks.map(d=>(d-a[1])/(b[1]-a[1])).filter(t=>t>0&&t<1)].sort((a,b)=>a-b);
  for(let j=1;j<cuts.length;j++){
   const at=t=>a.map((v,k)=>v+t*(b[k]-v));
   sideWall(at(cuts[j-1]),at(cuts[j]));
  }
 }
 for(const [finish,{points,uv}] of geometry){
  const meshGeometry=new THREE.BufferGeometry();
  meshGeometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  meshGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  meshGeometry.computeVertexNormals();
  const surface=finish.clone();
  surface.side=THREE.DoubleSide;
  const mesh=new THREE.Mesh(meshGeometry,surface);
  mesh.receiveShadow=true;
  mesh.castShadow=true;
  group.add(mesh);
 }
 for(const [finish,matrices] of parts){
  const mesh=new THREE.InstancedMesh(box,finish,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
  mesh.receiveShadow=true;group.add(mesh);
 }
 return {id:feature.id,name:feature.name,palette:'heritage',wallMaterial:'clockStone',
  windowCount:wings.reduce((total,{bays})=>total+bays.length*3,0)-3,streetBays:wings.map(wing=>wing.bays.length),storeys:3,
  front:worldPoint(0,0),tower:worldPoint(0,towerD),streetNormal:east.map(x=>-x),
  rearSections:rearSections.map(s=>s.name),
  roof:{profile:'hip',eaves:frontEaves,ridge:frontEaves+2.65,cupola:true}};
}
