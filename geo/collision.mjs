// Plan-view collision system for the georeferenced Grangegorman prototype. Terrain elevation is handled by the shared groundHeight function in geo/index.html; collisions use horizontal footprints.
// A vertical 1.74m player capsule has a circular 0.34m horizontal footprint.
// Geometry is measured in metres in OSM east/north coordinates.
export const DEFAULT_RADIUS = 0.34;
export const BARRIER_SIZES = Object.freeze({
  wall:{width:0.65,height:2.0}, retaining_wall:{width:0.85,height:2.1},
  fence:{width:0.13,height:1.7}, hedge:{width:0.85,height:1.5},
});
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
export function barrierDimensions(tags={}) {
 const base=BARRIER_SIZES[tags.barrier]||BARRIER_SIZES.wall;
 const parsed=(v)=>{const m=String(v??'').match(/^(\d+(?:\.\d+)?)\s*(?:m|metres|meters)?$/i);return m?Number(m[1]):NaN};
 const h=parsed(tags.height),w=parsed(tags.width);
 return {height:Number.isFinite(h)&&h>0&&h<12?h:base.height,
 width:Number.isFinite(w)&&w>0&&w<6?w:base.width,estimatedHeight:!(h>0),estimatedWidth:!(w>0)};
}
function segmentDistanceSquared(x,y,a,b) {
 const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy;
 const t=d>1e-10?clamp(((x-a[0])*dx+(y-a[1])*dy)/d,0,1):0;
 return (x-a[0]-t*dx)**2+(y-a[1]-t*dy)**2;
}
function inPolygon(x,y,p) {
 let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){
 const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside;
}
export function makeCollisionWorld(features,{playerRadius=DEFAULT_RADIUS,worldRadius=990,worldExtent=550,cellSize=18}={}) {
 const obstacles=[];const cells=new Map();const sizes={barriers:0,buildingEdges:0};
 const key=(i,j)=>i+','+j;
 const add=(o)=>{
  const id=obstacles.length;obstacles.push(o);
  for(let i=Math.floor(o.minX/cellSize);i<=Math.floor(o.maxX/cellSize);i++)
   for(let j=Math.floor(o.minY/cellSize);j<=Math.floor(o.maxY/cellSize);j++){
    const k=key(i,j);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(id);
   }
 };
 for(const f of features){
  const pts=f.coords||[],tag=f.tags||{};if(pts.length<2)continue;
  const mx=pts.reduce((a,p)=>a+p[0],0)/pts.length,my=pts.reduce((a,p)=>a+p[1],0)/pts.length;
  if(Math.hypot(mx,my)>worldExtent)continue;
  if(f.kind==='building'&&pts.length>=4){
   const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
   add({kind:'building',id:f.id,poly:pts,minX:Math.min(...xs)-playerRadius,maxX:Math.max(...xs)+playerRadius,
     minY:Math.min(...ys)-playerRadius,maxY:Math.max(...ys)+playerRadius});sizes.buildingEdges+=pts.length-1;
  }
  if(f.kind==='barrier'&&BARRIER_SIZES[tag.barrier]){
   const dim=barrierDimensions(tag),margin=dim.width/2+playerRadius;
   for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];
    if(Math.hypot(b[0]-a[0],b[1]-a[1])<.05)continue;
    add({kind:'barrier',id:f.id,type:tag.barrier,a,b,width:dim.width,height:dim.height,
      minX:Math.min(a[0],b[0])-margin,maxX:Math.max(a[0],b[0])+margin,
      minY:Math.min(a[1],b[1])-margin,maxY:Math.max(a[1],b[1])+margin});
    sizes.barriers++;
   }
  }
 }
 function query(x,y,r=playerRadius){
  if(Math.hypot(x,y)>worldRadius-r)return {kind:'limit'};
  const ids=new Set();for(let i=Math.floor((x-r)/cellSize);i<=Math.floor((x+r)/cellSize);i++)
   for(let j=Math.floor((y-r)/cellSize);j<=Math.floor((y+r)/cellSize);j++)
    for(const id of cells.get(key(i,j))||[])ids.add(id);
  for(const id of ids){const o=obstacles[id];
   if(x<o.minX||x>o.maxX||y<o.minY||y>o.maxY)continue;
   if(o.kind==='barrier'){if(segmentDistanceSquared(x,y,o.a,o.b)<(r+o.width/2)**2)return o;}
   else {if(inPolygon(x,y,o.poly))return o;
    for(let i=1;i<o.poly.length;i++)if(segmentDistanceSquared(x,y,o.poly[i-1],o.poly[i])<r*r)return o;
   }
  }return null;
 }
 function move(x,y,dx,dy){
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.23));
  const sx=dx/steps,sy=dy/steps;let collisions=0;
  for(let i=0;i<steps;i++){
   if(!query(x+sx,y+sy)){x+=sx;y+=sy;continue;}
   collisions++;
   if(!query(x+sx,y))x+=sx;
   else if(!query(x,y+sy))y+=sy;
  }return {x,y,collisions};
 }
 return {query,move,sizes,obstacles,playerRadius,cellSize};
}