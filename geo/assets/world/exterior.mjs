import * as THREE from 'three';
import {boundaryStoneMaterial} from './campus.mjs';
import {groundFinish} from './surfaces.mjs';

const stoneCap=new THREE.MeshStandardMaterial({color:0x696966,roughness:.97});
const roadPaint=new THREE.MeshStandardMaterial({color:0xd8d5c9,roughness:.96});
const rackSteel=new THREE.MeshStandardMaterial({color:0x929996,metalness:.46,roughness:.45});
const kerbStone=new THREE.MeshStandardMaterial({color:0xa6a39a,roughness:.95});
const gateSteel=new THREE.MeshStandardMaterial({color:0x56605a,metalness:.28,roughness:.72});

const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const normal=(a,b)=>{
 const d=length(a,b);
 return [(b[1]-a[1])/d,(a[0]-b[0])/d];
};

export function alignment(coords){
 const points=coords.filter((p,i)=>i===0||length(coords[i-1],p)>.025);
 const stations=[];
 let distance=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],span=length(a,b),out=normal(a,b);
  const before=i>1?normal(points[i-2],a):out;
  const sum=out.map((v,j)=>v+before[j]);
  const scale=Math.max(1.25,1+out[0]*before[0]+out[1]*before[1]);
  stations.push({p:a,out:sum.map(v=>v/scale),distance});
  const pieces=Math.ceil(span/2);
  for(let j=1;j<pieces;j++)stations.push({p:mix(a,b,j/pieces),out,distance:distance+span*j/pieces});
  distance+=span;
 }
 if(points.length>1)stations.push({p:points.at(-1),out:normal(points.at(-2),points.at(-1)),distance});
 return stations;
}

export function ribbon(scene,coords,profile,material,heightAt,name){
 const stations=alignment(coords);
 const vertices=[],uv=[];
 const shape=stations.map(({p,out,distance})=>profile.map(([width,lift])=>{
  const [x,n]=p.map((v,i)=>v+out[i]*width);
  return {x,n,y:heightAt(x,n)+lift,distance,lift};
 }));
 function face(a,b,c,d,top=false){
  for(const {x,n,y,distance,lift} of [a,b,c,a,c,d]){
   vertices.push(x,y,-n);
   uv.push(...(top?[x,n]:[distance,lift]));
  }
 }
 for(let i=1;i<shape.length;i++){
  const a=shape[i-1],b=shape[i];
  for(let j=1;j<profile.length;j++)
   face(a[j-1],b[j-1],b[j],a[j],profile[j-1][1]===profile[j][1]);
 }
 if(!vertices.length)return;
 if(profile.length===4){
  const first=shape[0],last=shape.at(-1);
  face(first[0],first[1],first[2],first[3]);
  face(last[3],last[2],last[1],last[0]);
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,material);
 mesh.name=name;
 mesh.receiveShadow=true;
 scene.add(mesh);
 return mesh;
}

// The existing OSM ways on both sides of Grangegorman Lower and around the
// former entrance lane. Appendix 2a.12 shows flat and upright-stone coping.
const historicWalls=new Map([
 ['way/1331021999','flat'],
 ['way/1308293956','upright'],['way/1308293958','upright'],
 ['way/1308293960','upright'],['way/1308293965','upright'],
 ['way/1308293967','upright'],
]);

export function addHistoricBoundary(scene,feature,width,height,heightAt){
 const style=historicWalls.get(feature.id);
 if(!style)return false;
 const half=width/2,cap=style==='flat'?.15:.28;
 const stone=boundaryStoneMaterial();
 ribbon(scene,feature.coords,[[half,0],[half,height-cap],[-half,height-cap],[-half,0]],
  stone,heightAt,'Historic masonry · '+feature.id);
 if(style==='flat'){
  ribbon(scene,feature.coords,[[half,height-cap],[half,height],[-half,height],[-half,height-cap]],
   stoneCap,heightAt,'Flat coping · '+feature.id);
 }else{
  ribbon(scene,feature.coords,[[half,height-cap],[half*.72,height],[-half*.72,height],[-half,height-cap]],
   stone,heightAt,'Upright stone coping · '+feature.id);
 }
 return true;
}

let streetAsphalt;
export function grangegormanAsphalt(){
 if(!streetAsphalt){
  streetAsphalt=groundFinish('asphalt').clone();
  streetAsphalt.color.setHex(0xa9adb1);
 }
 return streetAsphalt;
}

export const campusStreetWays=new Set(['way/64270039','way/1099938546']);
const parkingWays=new Set(['way/1129967347','way/1129967324','way/1129967325']);
const parkingGates=new Set(['way/1308293962','way/1308293963']);

export function addParkingGate(scene,feature,heightAt){
 if(!parkingGates.has(feature.id))return false;
 const [hinge,meeting]=feature.coords;
 const span=length(hinge,meeting);
 const gate=new THREE.Group();
 gate.name='Grangegorman Lower · open car park gate';
 gate.position.set(hinge[0],heightAt(...hinge),-hinge[1]);
 gate.rotation.y=-.31;
 function bar(x,y,width,height,depth){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),gateSteel);
  mesh.position.set(x,y,0);
  gate.add(mesh);
 }
 bar(0,1.04,.12,2.08,.12);
 for(const y of [.20,2.02])bar(span/2,y,span,.055,.044);
 for(let i=1;i<=18;i++)bar(i*span/18,1.11,.028,1.86,.036);
 scene.add(gate);
 return true;
}

export function addMappedSurface(scene,feature,width,heightAt,centre){
 if(campusStreetWays.has(feature.id))return true;
 const [x,n]=centre;
 const {surface}=feature.tags;
 if(x<-110||x>170||n<-280||n>5)return false;
 if(parkingWays.has(feature.id))return true; // Covered by the aerial-traced road and lot below.
 const finish={asphalt:'asphalt',paving_stones:'setts',compacted:'compacted'}[surface];
 if(!finish||feature.tags.highway==='steps')return false;
 const material=feature.name==='Grangegorman Lower'&&finish==='asphalt'?grangegormanAsphalt():groundFinish(finish);
 ribbon(scene,feature.coords,[[width/2,.075],[-width/2,.075]],
  material,heightAt,'Mapped '+finish+' · '+feature.id);
 return true;
}

// Aerial trace keyed to the mapped Grangegorman Lower junction and service
// ways. Bay dimensions and edges are read from imagery, at visual accuracy.
const access=[
 [17.5,-145.2],[21.1,-143.7],[24.6,-144.6],[43.0,-152.4],[48.0,-157.2],[51.0,-163.6],
 [54.4,-169.1],[56.3,-177.2],[56.1,-181.6],[44.8,-181.9],[45.1,-175.7],[43.5,-168.8],
 [41.4,-162.6],[37.1,-157.8],[20.9,-153.3],[17.5,-151.5],
];
const parking=[
 [44.8,-180.6],[55.9,-180.6],[57.6,-185],[72.5,-185.7],[74.9,-187.3],[72.7,-195.1],
 [70.9,-244.2],[40.3,-242.3],[34,-245.3],[36.5,-232],[40.8,-206.9],
];
const crossings=[
 [[41.5,-160.2],[49.4,-157.0],[51.2,-160.1],[43.7,-163.8]],
 [[44.9,-169.7],[54.7,-171.3],[56.1,-177.7],[46.0,-175.7]],
];

const rackStart=[63.4,-250.1],rackEnd=[69.1,-252.2];
export const parkingFurnitureObstacle={
 id:'lower-house-cycle-racks',kind:'barrier',coords:[rackStart,rackEnd],tags:{barrier:'fence',width:1.35,height:.8},
};

export function addLowerHouseParking(scene,heightAt,pavedArea){
 const asphalt=groundFinish('asphalt');
 pavedArea(access,asphalt,.082,'Lower House car park · access from Grangegorman Lower');
 pavedArea(parking,asphalt,.079,'Lower House car park · surface');
 const marks=[];
 function band(a,b,width){
  const [dx,dn]=normal(a,b).map(v=>v*width/2);
  const around=([x,n],side)=>[x+dx*side,n+dn*side];
  marks.push(...[around(a,1),around(b,1),around(b,-1),around(a,1),around(b,-1),around(a,-1)]);
 }
 for(const [a,b,c,d] of crossings){
  for(let i=0;i<10;i++)band(mix(a,b,(i+.5)/10),mix(d,c,(i+.5)/10),.31);
 }
 function row(frontStart,frontEnd,backStart,backEnd,count){
  band(backStart,backEnd,.085);
  for(let i=0;i<=count;i++)band(mix(frontStart,frontEnd,i/count),mix(backStart,backEnd,i/count),.092);
 }
 row([52.4,-188.8],[46.7,-236.5],[56.0,-189.4],[50.0,-237.1],14);
 row([59.7,-190.0],[54.3,-237.4],[56.0,-189.4],[50.0,-237.1],14);
 row([67.3,-188],[66.8,-243],[72.0,-188.4],[70.8,-243.3],16);
 const stripeGeometry=new THREE.BufferGeometry();
 stripeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(
  marks.flatMap(([x,n])=>[x,heightAt(x,n)+.094,-n]),3));
 stripeGeometry.computeVertexNormals();
 const stripes=new THREE.Mesh(stripeGeometry,roadPaint);
 stripes.name='Lower House car park · bay lines and crossings';
 stripes.receiveShadow=true;
 scene.add(stripes);

 // Discontinuous edging follows the planted margins and stops before both crossings.
 for(const edge of [
  [[26.4,-145.4],[42.9,-152.2],[47.7,-156.7]],
  [[22.2,-153.7],[37.1,-157.8],[40.6,-160.9]],
  [[43.8,-164.0],[44.8,-169.0]],
  [[75.0,-187.8],[72.9,-195.8],[71.1,-243.5]],
 ]){
  ribbon(scene,edge,[[.09,.07],[.09,.16],[-.09,.16],[-.09,.07]],kerbStone,heightAt,'Lower House car park · stone edging');
 }

 // The Lower House racks are visible beside the south-east corner of the lot.
 const rackLength=length(rackStart,rackEnd);
 const frameAngle=Math.atan2(rackEnd[1]-rackStart[1],rackEnd[0]-rackStart[0]);
 const tubeShape=new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,0,-.39),new THREE.Vector3(0,.68,-.39),
  new THREE.Vector3(0,.78,-.29),new THREE.Vector3(0,.78,.29),
  new THREE.Vector3(0,.68,.39),new THREE.Vector3(0,0,.39),
 ],false,'centripetal');
 const racks=new THREE.InstancedMesh(new THREE.TubeGeometry(tubeShape,20,.025,6,false),rackSteel,7);
 const matrix=new THREE.Matrix4();
 for(let i=0;i<racks.count;i++){
  const [x,n]=mix(rackStart,rackEnd,i*.92/rackLength);
  matrix.makeRotationY(frameAngle);matrix.setPosition(x,heightAt(x,n)+.03,-n);
  racks.setMatrixAt(i,matrix);
 }
 racks.name='Lower House · cycle stands';
 scene.add(racks);
}
