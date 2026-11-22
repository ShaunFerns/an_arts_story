import * as THREE from 'three';

const materials = {
  brick:new THREE.MeshStandardMaterial({color:0x795d4e,roughness:.91}),
  precast:new THREE.MeshStandardMaterial({color:0xb9b4a7,roughness:.85}),
  limestone:new THREE.MeshStandardMaterial({color:0x696d68,roughness:.9}),
  render:new THREE.MeshStandardMaterial({color:0xc0bbac,roughness:1}),
  glass:new THREE.MeshStandardMaterial({color:0x395764,metalness:.28,roughness:.25}),
  glassLight:new THREE.MeshStandardMaterial({color:0x69828b,metalness:.16,roughness:.33}),
  historic:new THREE.MeshStandardMaterial({color:0x9a8e7d,roughness:.95}),
  slate:new THREE.MeshStandardMaterial({color:0x50575a,roughness:.91}),
  steel:new THREE.MeshStandardMaterial({color:0x454b4a,roughness:.57}),
};

export function buildingPalette(feature) {
  const name = feature.name || '';
  if (/central quad/i.test(name)) return 'central';
  if (/academic hub/i.test(name) || feature.id==='way/1361416599') return 'library';
  if (/greenway hub|goirtín/i.test(name)) return 'contemporary';
  if (/laurence|glassmanogue|rathdown|clocktower|orchard|all saints|north house|bradogue|stanhope|grianán|lower house/i.test(name) ||
      feature.id==='way/307799384') return 'heritage';
  return 'context';
}

export function shellMaterial(palette) {
  return {central:materials.brick,library:materials.render,heritage:materials.historic,
    contemporary:materials.steel,context:materials.precast}[palette];
}

export function outsideNormal(a,b,orientation) {
  const dx=b[0]-a[0], dn=b[1]-a[1], length=Math.hypot(dx,dn);
  return [orientation*dn/length,-orientation*dx/length];
}

export function winding(poly) {
  return Math.sign(poly.slice(1).reduce((area,b,i)=>{
    const a=poly[i];
    return area+a[0]*b[1]-b[0]*a[1];
  },0));
}

export function addCampusFacades(scene, buildings, groundHeight, entrances) {
  const box = new THREE.BoxGeometry(1,1,1);
  const pointed = new THREE.Shape();
  pointed.moveTo(-.5,-.5);
  pointed.lineTo(.5,-.5);
  pointed.lineTo(.5,.05);
  pointed.quadraticCurveTo(.37,.3,0,.5);
  pointed.quadraticCurveTo(-.37,.3,-.5,.05);
  pointed.closePath();
  const arch = new THREE.ShapeGeometry(pointed);
  const prototype = new THREE.Object3D();
  const batches = {};
  const labels = [];
  function panel(key,x,y,n,w,h,d,yaw) {
    prototype.position.set(x,y,-n);
    prototype.rotation.y=yaw;
    prototype.scale.set(w,h,d);
    prototype.updateMatrix();
    (batches[key]??=[]).push(prototype.matrix.clone());
  }
  for (const {feature,height,base,palette} of buildings) {
    const poly=feature.coords, orientation=winding(poly);
    const door=entrances.find(e=>e.source===feature.id);
    const tall=palette==='central'||palette==='library';
    const historic=palette==='heritage';
    const chapel=/laurence/i.test(feature.name||'');
    const levels=tall?(palette==='central'?6:5):chapel?1:
      /glassmanogue|rathdown/i.test(feature.name||'')?2:Math.max(1,Math.min(4,Math.floor(height/3.1)));
    if(chapel)addChapelRoof(scene,poly,base+height);
    const floor=height/levels;
    const windows=[];
    for(let i=1;i<poly.length;i++) {
      const a=poly[i-1], b=poly[i], [ox,on]=outsideNormal(a,b,orientation);
      const len=Math.hypot(a[0]-b[0],a[1]-b[1]);
      if(len<3.5)continue;
      const yaw=Math.atan2(ox,-on);
      const point=(t,offset)=>[a[0]+(b[0]-a[0])*t+ox*offset,a[1]+(b[1]-a[1])*t+on*offset];
      const count=Math.max(1,Math.floor(len/(tall?4.15:3.8)));
      const bay=len/count;
      for(let j=0;j<count;j++) {
        const t=(j+.5)/count;
        const [x,n]=point(t,.11);
        const nearDoor=door&&Math.hypot(x-door.door[0],n-door.door[1])<door.dimensions.width*.55+1;
        for(let k=0;k<levels;k++){
          if(k===0&&nearDoor)continue;
          const broadlyGlazed=palette==='central'||palette==='contemporary'||(palette==='library'&&(k===0||i%5===0));
          const width=bay*(broadlyGlazed?.69:historic?.34:(j+k)%3===0?.37:.23);
          const h=floor*(broadlyGlazed?.63:historic?.47:.55);
          const y=base+floor*(k+.56);
          const frame=palette==='library'?'limestone':historic?'historic':'precast';
          panel(chapel?'arch historic':frame,x+(chapel?ox*.132:0),y,n+(chapel?on*.132:0),width+.21,h+.19,.23,yaw);
          const [gx,gn]=point(t,.26);
          panel(chapel?'arch glass':(j+k+i)%4===0?'glassLight':'glass',gx,y,gn,width,h,.06,yaw);
          if(broadlyGlazed)panel('steel',gx+ox*.035,y,gn+on*.035,.055,h,.07,yaw);
          windows.push([gx,gn]);
        }
        if(palette==='central'&&j>0) {
          const [ux,un]=point(j/count,.10);
          panel('precast',ux,base+height/2,un,.32,height,.35,yaw);
        }
      }
      const [x,n]=point(.5,.08);
      if(historic||tall||palette==='contemporary') {
        panel(historic?'slate':palette==='library'?'limestone':'precast',x,base+height-.12,n,len,.31,.36,yaw);
        if(palette==='central')for(let k=1;k<levels;k++)
          panel('precast',x,base+k*floor,n,len,.22,.32,yaw);
        if(palette==='library'){
          const [sx,sn]=point(.5,.12);
          panel('limestone',sx,base+.55,sn,len,1.06,.28,yaw);
        }
      }
    }
    labels.push({id:feature.id,name:feature.name||(palette==='library'?'Academic Hub & Library':null),palette,windowCount:windows.length});
  }
  for (const [key,matrices] of Object.entries(batches)) {
    const gothic=key.startsWith('arch ');
    const mesh=new THREE.InstancedMesh(gothic?arch:box,materials[gothic?key.slice(5):key],matrices.length);
    for(const [i,matrix] of matrices.entries())mesh.setMatrixAt(i,matrix);
    mesh.receiveShadow=true;
    mesh.name='Campus façade '+key;
    scene.add(mesh);
  }
  return labels;
}

function addChapelRoof(scene,poly,eave) {
  const longest=poly.slice(1).map((b,i)=>{
    const a=poly[i];
    return [b[0]-a[0],b[1]-a[1]];
  }).sort((a,b)=>Math.hypot(...b)-Math.hypot(...a))[0];
  const length=Math.hypot(...longest);
  const dx=-longest[1]/length,dn=longest[0]/length;
  const offset=point=>point[0]*dx+point[1]*dn;
  const ymin=Math.min(...poly.map(offset)),ymax=Math.max(...poly.map(offset)),ridge=(ymin+ymax)/2;
  const rise=Math.min(4,(ymax-ymin)*.31);
  const height=p=>eave+rise*Math.max(0,1-Math.abs(offset(p)-ridge)/(ymax-ridge));
  for(const side of [-1,1]){
    const face=[];
    for(let i=1;i<poly.length;i++){
      const a=poly[i-1],b=poly[i],u=offset(a)-ridge,v=offset(b)-ridge;
      if(u*side>=0)face.push(a);
      if(u*v<0)face.push(a.map((value,j)=>value+(b[j]-value)*u/(u-v)));
    }
    if(face.length<3)continue;
    const roofGeometry=new THREE.ShapeGeometry(new THREE.Shape(face.map(p=>new THREE.Vector2(...p))));
    roofGeometry.rotateX(-Math.PI/2);
    const points=roofGeometry.attributes.position;
    for(let i=0;i<points.count;i++)points.setY(i,height([points.getX(i),-points.getZ(i)]));
    roofGeometry.computeVertexNormals();
    const roof=new THREE.Mesh(roofGeometry,materials.slate);
    roof.castShadow=true;roof.receiveShadow=true;scene.add(roof);
  }
}

// Provisional deck over the mapped track and the adjoining pedestrian corridor.
const bridgeEnds=[[321,-96],[347,-145]];
const [a,b]=bridgeEnds;
const span=Math.hypot(b[0]-a[0],b[1]-a[1]);
const direction=[(b[0]-a[0])/span,(b[1]-a[1])/span];
export const bridgeSupports=bridgeEnds.map(([x,n],i)=>{
  const along=i===0?.36:-.36;
  const [dx,dn]=direction;
  const coords=[[-4.25,-.56],[4.25,-.56],[4.25,.56],[-4.25,.56],[-4.25,-.56]]
    .map(([side,depth])=>[x+dx*(along+depth)+dn*side,n+dn*(along+depth)-dx*side]);
  return {id:'broadstone-bridge-support-'+i,kind:'building',coords};
});
export function addUnderpass(scene, groundHeight) {
  const clear=9;
  const x=(a[0]+b[0])/2,n=(a[1]+b[1])/2;
  const length=span;
  const underside=groundHeight(x,n)+clear;
  const g=new THREE.Group();
  g.name='Broadstone access-road underpass';
  g.position.set(x,underside,-n);
  g.rotation.y=Math.atan2(b[0]-a[0],a[1]-b[1]);
  function add(w,h,d,x,y,z,material) {
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    m.position.set(x,y,z);m.receiveShadow=true;g.add(m);
  }
  add(8.6,1.06,length,0,.53,0,materials.limestone);
  add(7.5,.12,length,0,1.11,0,materials.slate);
  for(const side of [-1,1]){
    add(.36,.91,length,side*4.1,1.55,0,materials.precast);
    // The abutments sit at the two ends, away from the tram and footway.
    const [px,pn]=side===-1?a:b;
    const pierHeight=underside-groundHeight(px,pn);
    add(8.5,pierHeight,1.12,0,-pierHeight/2,side*(length/2-.36),materials.limestone);
  }
  scene.add(g);
  return {centre:[x,n],ends:[a,b],clearance:clear,underside};
}

// The source snapshot still encloses the Academic Hub site with construction
// fencing. The open library needs one pedestrian passage on its campus side.
export function openLibraryApproach(features) {
  const zone=features.flatMap(feature=>{
    if(feature.id!=='way/1331424721')return [feature];
    const i=feature.coords.findIndex(([x,n])=>x===-195.4&&n===147.3);
    if(i===-1)throw Error('The library fence geometry has changed. Recheck the entrance approach.');
    const a=feature.coords[i],b=feature.coords[i+1];
    const t=(115-a[1])/(b[1]-a[1]),half=2.8/Math.hypot(a[0]-b[0],a[1]-b[1]);
    const edge=fraction=>a.map((value,j)=>value+(b[j]-value)*fraction);
    return [
      {...feature,coords:feature.coords.slice(0,i+1).concat([edge(t-half)])},
      {...feature,id:feature.id+'/open-library',coords:[edge(t+half)].concat(feature.coords.slice(i+1))},
    ];
  });
  zone.push({id:'prototype/library-approach',kind:'road',name:'',
    coords:[[-217,112.7],[-201.7,115],[-188,113]],
    tags:{highway:'footway',surface:'paving_stones'}});
  return zone;
}
