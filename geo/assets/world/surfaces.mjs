import * as THREE from 'three';

const finishes={
 granite:{tones:['#a9a7a0','#b6b2a9','#bcb8af','#b4b0a7'],width:.60,length:.45},
 warm:{tones:['#beaa94','#c5b29d','#bba38d','#c4b1a3'],width:.60,length:.45},
 luas:{tones:['#b6b1a7','#aaa9a5','#a5a7a8','#b19882'],width:.32,length:.18},
 setts:{tones:['#aaa297','#b5ab9c','#b6afaa','#a59e91'],width:.30,length:.16},
 band:{tones:['#ad9083','#b69a89','#aa8e82','#ba9e8e'],width:.60,length:.32},
 railSetts:{tones:['#545456','#626164','#59595a','#777476'],width:.17,length:.12},
 platformTactile:{tones:['#a4a296','#a6a497','#a09d92','#a5a296'],width:.13,length:.13},
 grass:{tones:['#71865a','#7c9161','#768b5e','#829268'],width:1,length:1},
};
const surfaces=new Map();

export function groundFinish(type){
 if(surfaces.has(type))return surfaces.get(type);
 const {tones,width,length}=finishes[type];
 const canvas=document.createElement('canvas');
 canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');
 const w=64,h=32;
 ctx.fillStyle=type==='grass'?'#788c60':'#8e8a81';
 ctx.fillRect(0,0,512,256);
 for(let row=0;row<8;row++)for(let col=-1;col<8;col++){
  const column=(col+8)%8;
  const x=col*w+(['setts','luas'].includes(type)&&row%2?w/2:0),y=row*h;
  if(type==='grass')continue;
  ctx.fillStyle=tones[(column*7+row*13+(row*column)%7)%tones.length];
  ctx.fillRect(x+1,y+1,w-2,h-2);
  if(type==='platformTactile'){
   ctx.fillStyle='#5f5f586b';
   for(const position of [15,32,49])ctx.fillRect(x+position,y+3,4,26);
  }
 }
 let seed=71264;
 const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<14500;i++){
  ctx.fillStyle=i%2?'#ffffff14':'#35372918';
  ctx.fillRect(random()*512,random()*256,1+random()*2,1+random()*2);
 }
 const map=new THREE.CanvasTexture(canvas);
 map.colorSpace=THREE.SRGBColorSpace;
 map.wrapS=map.wrapT=THREE.RepeatWrapping;
 map.repeat.set(1/(width*8),1/(length*8));
 map.anisotropy=8;
 const material=new THREE.MeshStandardMaterial({map,roughness:1});
 surfaces.set(type,material);
 return material;
}

// Local approach extents follow the photographed façades and existing pedestrian edges.
const plazas={
 lower:{width:24,depth:11,finish:'granite',band:true},
 central:{width:16,depth:13,finish:'granite',band:true},
 glass:{width:12,depth:7,finish:'setts'},
 laurence:{width:5.2,depth:5.4,finish:'setts'},
 library:{width:29,depth:15,finish:'warm',band:true},
};

export function addEntrancePaving(scene,doors,heightAt,blocked){
 for(const door of doors){
  const p=plazas[door.id];
  if(!p)continue;
  const [x,n]=door.door,[ox,on]=door.outward;
  const position=(side,depth)=>[x+on*side+ox*depth,n-ox*side+on*depth];
  const vertices=[],uv=[];
  const columns=Math.ceil(p.width/.65),rows=Math.ceil(p.depth/.65);
  const edge=z=>p.width*.5*(.82+.18*z/p.depth);
  const add=(side,depth,layer)=>{
   const [east,north]=position(side,depth);
   vertices.push(east,heightAt(east,north)+layer,-north);
   uv.push(side,depth);
  };
  for(let iz=0;iz<rows;iz++){
   const z0=.22+(p.depth-.22)*iz/rows,z1=.22+(p.depth-.22)*(iz+1)/rows;
   for(let ix=0;ix<columns;ix++){
    const f0=2*ix/columns-1,f1=2*(ix+1)/columns-1;
    const z=(z0+z1)/2,s=(f0+f1)*edge(z)/2;
    if(blocked(...position(s,z),door))continue;
    add(f0*edge(z0),z0,.12);add(f1*edge(z0),z0,.12);add(f1*edge(z1),z1,.12);
    add(f0*edge(z0),z0,.12);add(f1*edge(z1),z1,.12);add(f0*edge(z1),z1,.12);
   }
  }
  function surface(v,u,kind,label){
   const geometry=new THREE.BufferGeometry();
   geometry.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
   geometry.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));
   geometry.computeVertexNormals();
   const mesh=new THREE.Mesh(geometry,groundFinish(kind));
   mesh.name=label+' · '+door.name;
   mesh.receiveShadow=true;scene.add(mesh);
  }
  surface(vertices,uv,p.finish,'Entrance paving');
  if(p.band){
   const bands=[],bandUv=[];
   for(const offset of [-3.6,3.6])for(let z=1;z<p.depth-1;z++){
    if(blocked(...position(offset,z+.5),door))continue;
    for(const [s,d] of [[offset-.18,z],[offset+.18,z],[offset+.18,z+1],
      [offset-.18,z],[offset+.18,z+1],[offset-.18,z+1]]){
     const [east,north]=position(s,d);
     bands.push(east,heightAt(east,north)+.126,-north);bandUv.push(s,d);
    }
   }
   surface(bands,bandUv,'band','Paving inlay');
  }
 }
}
