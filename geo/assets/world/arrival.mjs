import * as THREE from 'three';

export function createLuas(scene, stop, track, groundHeight) {
  const points=track.coords;
  const i=points.findIndex(p=>Math.hypot(p[0]-stop[0],p[1]-stop[1])<.5);
  const a=points[Math.max(0,i-1)],b=points[Math.min(i+1,points.length-1)];
  const angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
  const direction=[Math.cos(angle),Math.sin(angle)];
  const car=new THREE.Group();
  car.name='Broadstone Luas';
  car.rotation.y=angle;
  const ivory=new THREE.MeshStandardMaterial({color:0xc3c6c3,metalness:.16,roughness:.56});
  const plum=new THREE.MeshStandardMaterial({color:0x806199,roughness:.61});
  const yellow=new THREE.MeshStandardMaterial({color:0xbba746,roughness:.63});
  const dark=new THREE.MeshStandardMaterial({color:0x263d47,roughness:.25,metalness:.31});
  const warm=new THREE.MeshBasicMaterial({color:0xeab579});
  function block(w,h,d,x,y,z,material) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);car.add(mesh);return mesh;
  }
  const doors=[];
  for(const offset of [-7.9,0,7.9]){
    block(7.75,2.85,2.5,offset,1.59,0,ivory);
    block(7.75,.44,2.53,offset,1.04,0,plum);
    block(7.75,.105,2.55,offset,1.31,0,yellow);
    block(7.4,.29,2.55,offset,2.83,0,dark);
    for(const side of [-1,1]){
      const z=side*1.27;
      for(const x of [-2.35,2.35])block(1.94,.87,.06,offset+x,2.12,z,dark);
      block(1.49,2.18,.065,offset,1.45,z+.009*side,dark);
      for(const y of [-1,1]){
        const door=block(.70,2.11,.075,offset+y*.36,1.44,z+.051*side,ivory);
        const pane=block(.54,.82,.025,door.position.x,2.01,z+.095*side,dark);
        doors.push({door,pane,offset,y});
      }
    }
  }
  for(const side of [-1,1]){
    block(.11,1.12,2.13,side*11.81,2.08,0,dark);
    for(const z of [-.82,.82])block(.13,.16,.28,side*11.86,.91,z,warm);
  }
  for(const [x,y,angle] of [[-.45,3.32,.74],[.21,3.80,-.66]]){
    const arm=block(.92,.065,.085,x,y,0,dark);
    arm.rotation.z=angle;
  }
  block(.20,.055,1.08,.56,4.04,0,dark);
  scene.add(car);
  function pose(distance,open) {
    const [x,n]=stop.map((v,i)=>v+direction[i]*distance);
    car.position.set(x,groundHeight(x,n)+.10,-n);
    for(const {door,pane,offset,y} of doors)door.position.x=pane.position.x=offset+y*(.36+.69*open);
  }
  pose(0,0);
  return {car,direction,pose};
}

export function addLuasForecourt(scene,stop,direction,groundHeight) {
 const [dx,dn]=direction;
 const grey=new THREE.MeshStandardMaterial({color:0x898479,roughness:.94});
 const steel=new THREE.MeshStandardMaterial({color:0x7b8180,roughness:.76});
 const timber=new THREE.MeshStandardMaterial({color:0x8b8174,roughness:.90});
 const lamp=new THREE.MeshStandardMaterial({color:0xd1d0ba,roughness:.78});
 const group=new THREE.Group();
 group.name='Broadstone–University · platform street furniture';
 scene.add(group);
 function place(along,across){
  const x=stop[0]+dx*along+dn*across,n=stop[1]+dn*along-dx*across;
  const fixture=new THREE.Group();
  fixture.position.set(x,groundHeight(x,n)+.075,-n);
  fixture.rotation.y=Math.atan2(dn,dx);
  group.add(fixture);
  return fixture;
 }
 function box(fixture,w,h,d,x,y,z,material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);
  mesh.receiveShadow=true;fixture.add(mesh);
 }
 for(const along of [-25,-3,19,35]){
  const pole=place(along,-7.2);
  box(pole,.09,6.5,.09,0,3.25,0,steel);
  box(pole,.51,.09,.19,.23,6.44,0,lamp);
 }
 const seat=place(-12,-12.0);
 box(seat,6.4,.41,.55,0,.20,0,grey);
 for(let j=0;j<5;j++)box(seat,6.05,.047,.083,0,.43,-.18+j*.092,timber);
 for(let j=0;j<4;j++)box(seat,6.05,.074,.046,0,.57+j*.095,-.23,timber);
}
