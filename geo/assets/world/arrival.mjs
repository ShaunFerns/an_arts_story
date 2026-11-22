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
  scene.add(car);
  function pose(distance,open) {
    const [x,n]=stop.map((v,i)=>v+direction[i]*distance);
    car.position.set(x,groundHeight(x,n)+.10,-n);
    for(const {door,pane,offset,y} of doors)door.position.x=pane.position.x=offset+y*(.36+.69*open);
  }
  pose(0,0);
  return {car,direction,pose};
}
