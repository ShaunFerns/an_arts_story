import * as THREE from 'three';

export const saintLaurenceId='way/310375420';
const south=[-15.55,-69];
const north=[8.4,21].map(v=>v/Math.hypot(8.4,21));
const east=[north[1],-north[0]];
const point=(u,v)=>south.map((p,i)=>p+u*east[i]+v*north[i]);
const nave={width:10.42,length:22.62,eaves:7.12,rise:4.68};
const porch={along:2.8,width:2.94,depth:1.68,eaves:2.72,rise:1.55};
export const chapelPorches=[1,-1].map(side=>{
 const u=nave.width/2*side,end=u+side*porch.depth;
 const half=porch.width/2,v=porch.along;
 const coords=[[u,v-half],[end,v-half],[end,v+half],[u,v+half],[u,v-half]].map(p=>point(...p));
 return {side,coords,door:point(end,v),outward:east.map(x=>x*side)};
});
export const chapelPorchObstacles=chapelPorches.map(({coords,side})=>({
 id:saintLaurenceId+'/porch/'+side,kind:'building',coords,
}));

export function addSaintLaurence(scene,heightAt,stone) {
 const group=new THREE.Group();
 group.name='St Laurence’s · nave, chancel, sacristy and porches';
 group.position.set(south[0],heightAt(...south)+.035,-south[1]);
 group.rotation.y=Math.atan2(-north[0],north[1]);
 scene.add(group);
 const finish=(color,roughness=.90)=>new THREE.MeshStandardMaterial({color,roughness});
 const slate=finish(0x51565b),limestone=finish(0x99988c),ridge=finish(0x805a4e);
 const wood=finish(0x4d3029),iron=finish(0x363b39),glass=finish(0x3c555c,.38);
 function mesh(parent,geometry,material,x,y,z){
  const piece=new THREE.Mesh(geometry,material);
  piece.position.set(x,y,z);piece.receiveShadow=true;parent.add(piece);
  return piece;
 }
 function box(parent,w,h,d,x,y,z,material){
  const geometry=new THREE.BoxGeometry(w,h,d);
  if(material===stone){
   const uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(w,d),uv.getY(i)*h);
  }
  return mesh(parent,geometry,material,x,y,z);
 }
 function profile(w,h,shoulder,type=THREE.Shape,bottom=0){
  const arch=new type(),half=w/2;
  const curve=(shoulder+h)*.55+bottom;
  arch.moveTo(-half,bottom);arch.lineTo(half,bottom);arch.lineTo(half,shoulder+bottom);
  arch.quadraticCurveTo(.375*w,curve,0,h+bottom);
  arch.quadraticCurveTo(-.375*w,curve,-half,shoulder+bottom);
  arch.closePath();
  return arch;
 }
 function pitched(parent,w,length,eaves,rise,x,z){
  const section=new THREE.Shape();
  section.moveTo(-w/2,-.045);section.lineTo(w/2,-.045);section.lineTo(0,rise);section.closePath();
  const roofEnd=mesh(parent,new THREE.ExtrudeGeometry(section,{depth:length,bevelEnabled:false}),stone,x,eaves,z-length/2);
  roofEnd.castShadow=true;
  for(const side of [-1,1]){
   const pitch=Math.atan2(rise,w/2);
   const slope=box(parent,Math.hypot(w/2,rise)+.14,.12,length+.16,x-side*w/4,eaves+rise/2,z,slate);
   slope.rotation.z=side*pitch;
   slope.castShadow=true;
   box(parent,.10,.11,length,x+side*w/2,eaves-.075,z,iron);
  }
  box(parent,.135,.11,length+.12,x,eaves+rise+.026,z,ridge);
 }
 const {width,length,eaves,rise}=nave;
 box(group,width,eaves,length,0,eaves/2,-length/2,stone).castShadow=true;
 pitched(group,width,length,eaves,rise,0,-length/2);
 // The northern chancel and sacristy occupy lower roof volumes.
 for(const [x,start,w,d,wall,peak] of [[-.62,22.60,5.80,1.89,5.54,2.85],[5.16,18.39,5.70,9.88,3.92,2.15]]){
  const z=-start-d/2;
  box(group,w,wall,d,x,wall/2,z,stone).castShadow=true;
  pitched(group,w,d,wall,peak,x,z);
 }
 box(group,.65,1.35,.71,7.25,5.33,-27.2,stone);

 function lancet(parent,x,y,z,w,h) {
  mesh(parent,new THREE.ShapeGeometry(profile(w+.22,h+.18,h*.69)),limestone,x,y-.08,z);
  mesh(parent,new THREE.ShapeGeometry(profile(w,h,h*.70)),glass,x,y,z+.018);
  box(parent,.033,h*.74,.022,x,y+h*.38,z+.027,iron);
  box(parent,w,.043,.033,x,y+h*.27,z+.032,iron);
 }
 for(const {side} of chapelPorches){
  const wall=new THREE.Group();
  wall.position.x=side*width/2;
  wall.rotation.y=side*Math.PI/2;
  group.add(wall);
  for(const [bay,d] of [6.7,10.85,15,19.1].entries()){
   for(const shift of bay%2===0?[-.53,.53]:[0]){
    const x=side*d+shift;
    lancet(wall,x,2.25,.054,bay%2===0?.66:.96,2.86);
   }
  }
  for(const distance of [.28,4.9,8.8,13,17,21.9]){
   if(side===1&&distance===21.9)continue;
   box(wall,.42,3.91,.55,side*distance,1.95,.22,stone);
   box(wall,.47,.17,.60,side*distance,3.91,.24,limestone);
  }
  const entrance=new THREE.Group();
  entrance.name=side>0?'St Laurence’s · east porch doorway':'St Laurence’s · west porch doorway';
  entrance.position.set(side*width/2,0,-porch.along);
  entrance.rotation.y=side*Math.PI/2;
  group.add(entrance);
  const {width:w,depth:d,eaves:h,rise:r}=porch;
  // The stone arch is an actual gap in the porch front, with the leaves set back.
  const front=new THREE.Shape();
  front.moveTo(-w/2,0);front.lineTo(w/2,0);front.lineTo(w/2,h);front.lineTo(0,h+r);
  front.lineTo(-w/2,h);front.closePath();
  const opening=profile(1.60,2.64,1.86,THREE.Path,.04);
  front.holes.push(opening);
  mesh(entrance,new THREE.ExtrudeGeometry(front,{depth:.16,bevelEnabled:false}),stone,0,0,d-.16).castShadow=true;
  const surround=profile(2.04,3.10,2.14);
  surround.holes.push(opening);
  mesh(entrance,new THREE.ExtrudeGeometry(surround,{depth:.08,bevelEnabled:false}),limestone,0,0,d+.004);
  for(const offset of [-1,1]){
   box(entrance,.19,h,d,offset*(w/2-.09),h/2,d/2,stone);
   const trim=box(entrance,Math.hypot(w/2,r)+.31,.12,d+.15,-offset*w/4,h+r/2,d/2,slate);
   trim.rotation.z=offset*Math.atan2(r,w/2);
  }
  box(entrance,.14,.09,d+.14,0,h+r+.05,d/2,ridge);
  const leaves=mesh(entrance,new THREE.ShapeGeometry(profile(1.57,2.65,1.89)),wood,0,.04,d-.28);
  leaves.name='St Laurence’s · recessed timber leaves';
  for(const x of [-.58,-.38,-.20,0,.20,.38,.58])box(entrance,.019,1.92,.024,x,1.01,d-.253,iron);
  for(const x of [-.105,.105])box(entrance,.041,.18,.05,x,1.08,d-.228,iron);
  box(entrance,1.83,.08,.48,0,.032,d-.035,limestone);
 }
 for(const [x,h] of [[-.93,2.95],[0,3.76],[.93,2.95]])lancet(group,x,3.14,.052,.68,h);
 // The stone bellcote rises from the north (chancel) gable.
 const bellcote=new THREE.Group();
 bellcote.name='St Laurence’s · north bellcote';
 bellcote.position.set(0,eaves+rise-.38,-length+.13);
 bellcote.rotation.y=Math.PI;
 group.add(bellcote);
 const silhouette=new THREE.Shape();
 silhouette.moveTo(-.91,0);silhouette.lineTo(.91,0);silhouette.lineTo(.72,1.58);
 silhouette.lineTo(0,2.38);silhouette.lineTo(-.72,1.58);silhouette.closePath();
 const opening=profile(.84,1.19,.82,THREE.Path,.32);
 silhouette.holes.push(opening);
 mesh(bellcote,new THREE.ExtrudeGeometry(silhouette,{depth:.45,bevelEnabled:false}),stone,0,0,0);
 mesh(bellcote,new THREE.CylinderGeometry(.15,.26,.31,12),iron,0,.67,.23);
 for(const side of [-1,1]){
  const coping=box(bellcote,1.17,.12,.59,-side*.36,1.99,.22,limestone);
  coping.rotation.z=side*.83;
 }
 box(bellcote,.10,.57,.11,0,2.62,.25,limestone);
 box(bellcote,.37,.095,.11,0,2.67,.25,limestone);
 return {id:saintLaurenceId,name:'St Laurence’s',palette:'heritage',wallMaterial:'chapelStone',
  windowCount:15,porches:chapelPorches.map(p=>p.door),
  roof:{profile:'gable',eaves,ridge:eaves+rise,volumes:['nave','chancel','sacristy'],bellcote:'north'}};
}
