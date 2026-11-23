import * as THREE from 'three';

export const academicFrontId='way/1361416599';

const stone=new THREE.MeshStandardMaterial({color:0xc8c6bf,roughness:.88});
const fillet=new THREE.MeshStandardMaterial({color:0x9f9e94,roughness:.89});
const glass=new THREE.MeshStandardMaterial({color:0x365760,metalness:.22,roughness:.28});
const frame=new THREE.MeshStandardMaterial({color:0x414445,roughness:.58});

export function addAcademicFront(scene,a,b,outward,base,entrance){
 // Local x increases towards the right-hand corner in the playing-fields view.
 const span=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const [ox,on]=outward;
 const group=new THREE.Group();
 group.name='Academic Hub · playing-fields frontage';
 group.position.set((a[0]+b[0])/2,base,-(a[1]+b[1])/2);
 group.rotation.y=Math.atan2(ox,-on);
 group.updateMatrixWorld(true);
 const [x,n]=entrance.door;
 const doorX=group.worldToLocal(new THREE.Vector3(x,base,-n)).x;
 const left=-span/2,right=span/2;
 const mesh=(geometry,material,x,y,z)=>{
  const part=new THREE.Mesh(geometry,material);
  part.position.set(x,y,z);
  part.receiveShadow=true;
  group.add(part);
  return part;
 };
 function block(l,r,b,t,back,front,material=stone){
  return mesh(new THREE.BoxGeometry(r-l,t-b,front-back),material,(l+r)/2,(b+t)/2,(front+back)/2);
 }
 const signStart=doorX+3.0;
 const soffit=4.25,projection=1.85;
 const windowLeft=left+5.3;
 // A deep band of stone and glazing above the recessed entry line.
 block(windowLeft,signStart,soffit,soffit+.33,-.06,projection).castShadow=true;
 block(windowLeft,signStart,7.54,8.12,-.06,projection);
 block(windowLeft,signStart,soffit+.33,7.54,.04,.15,glass);
 const lights=Math.round((signStart-windowLeft)/1.27),bay=(signStart-windowLeft)/lights;
 for(let i=0;i<=lights;i++){
  const at=windowLeft+i*bay;
  block(at-.13,at+.13,soffit+.33,7.54,.14,projection);
  block(at-.006,at+.006,soffit-.010,soffit,.025,projection,fillet);
 }
 for(const z of [.48,.94,1.40]){
  block(windowLeft,signStart,soffit-.01,soffit,z,z+.009,fillet);
 }
 // Pale limestone sign wall, and an opaque wall at the opposite end.
 block(left,windowLeft,0,8.12,-.04,.46);
 block(signStart,right,0,8.12,-.04,.63);
 for(let y=.72;y<8.12;y+=.73){
  block(signStart,right,y,y+.009,.628,.638,fillet);
  block(left,windowLeft,y,y+.009,.454,.464,fillet);
 }
 for(let at=signStart+1.35;at<right;at+=1.35)block(at,at+.012,0,8.12,.630,.642,fillet);

 const groundLeft=windowLeft+3.8;
 block(windowLeft,groundLeft,0,soffit,-.04,.24);
 block(groundLeft,signStart,.07,soffit,.06,.17,glass);
 for(let at=groundLeft;at<=signStart;at+=.94){
  if(Math.abs(at-doorX)<entrance.dimensions.width/2+.12)continue;
  block(at-.036,at+.036,.06,soffit,.17,.235,frame);
 }
 block(groundLeft,signStart,soffit-.19,soffit,.18,.258,frame);
 const pier=doorX-3.18;
 block(pier-.32,pier+.32,0,soffit,.12,.92,stone);

 // The two continuous ribbon windows and the upper reading-room lights.
 for(const y of [9.34,12.86]){
  block(left+.15,right-.16,y,y+1.09,.06,.16,glass);
  block(left-.04,right+.04,y-.24,y,.04,.72);
  block(left-.04,right+.04,y+1.09,y+1.29,.03,.56);
  for(let at=left+.6;at<right;at+=4.0)block(at,at+.15,y,y+1.09,.16,.39);
 }
 for(let at=left+.8;at<right-1;at+=3.14)block(at,at+1.17,11.05,12.13,.03,.155,glass);
 const tierBreak=right-11.8;
 for(const [l,r,bottom,top] of [[left+.10,tierBreak-.46,14.77,19.4],[tierBreak+.20,right-.12,15.20,22.3]]){
  block(l,r,bottom,top,.035,.13,glass);
  const count=Math.ceil((r-l)/1.75);
  for(let i=0;i<=count;i++){
   const at=l+(r-l)*i/count;
   block(at-.12,at+.12,bottom,top,.13,.45);
  }
  block(l,r,bottom-.42,bottom,.06,.48);
 }

 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=576;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#292c2c';ctx.textAlign='center';
 ctx.font='600 49px Arial';ctx.fillText('OLLSCOIL TEICNEOLAÍOCHTA',384,100);ctx.fillText('BHAILE ÁTHA CLIATH',384,151);
 ctx.font='bold 157px Arial';ctx.fillText('TU',384,288);ctx.fillText('DUBLIN',384,427);
 ctx.font='600 39px Arial';ctx.fillText('AN MOL ACADÚIL – ACADEMIC HUB',384,510);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const sign=mesh(new THREE.PlaneGeometry(Math.min(4.5,(right-signStart)*.79),2.9),
  new THREE.MeshBasicMaterial({map,transparent:true}), (right+signStart)/2,3.17,.65);
 sign.name='Academic Hub · lettering on limestone wall';
 scene.add(group);
 return lights+2+Math.floor((span-1.8)/3.14)+Math.ceil((tierBreak-.56-left)/1.75)+Math.ceil((right-tierBreak-.32)/1.75);
}
