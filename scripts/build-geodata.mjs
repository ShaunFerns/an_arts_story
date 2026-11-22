// Rathdown-centred 1 km static geographic extract. Source: OpenStreetMap via Overpass.
// A named Rathdown anchor is mandatory; fail closed rather than inventing coordinates.
import fs from 'node:fs/promises';
const api=['https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
async function request(q,seconds=55){
  const failed=[];
  for(const url of api){
    const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),seconds*1000);
    try{
      const r=await fetch(url,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','user-agent':'Academic-Advising-Arts-Story/0.10'},body:new URLSearchParams({data:q}),signal:ac.signal});
      if(!r.ok)throw Error('HTTP '+r.status);
      const j=await r.json();if(!Array.isArray(j.elements))throw Error('Invalid JSON');
      console.log('Overpass',url,'elements',j.elements.length);return {elements:j.elements,url};
    }catch(e){console.warn('Overpass',url,String(e).slice(0,130));failed.push(String(e))}
    finally{clearTimeout(timer)}
  }
  throw Error('OSM retrieval failed: '+failed.join('; '));
}
const box='(53.347,-6.291,53.364,-6.262)';
const names=await request(`[out:json][timeout:50];nwr["name"~"Rathdown House|Ráth an Dúin|Aras Rath an Duin",i]${box};out center tags;`);
const candidates=names.elements.filter(e=>{const n=(e.tags?.name||'').toLowerCase();return /rathdown house|ráth an dúin|rath an duin/.test(n)&&Number.isFinite(e.lat??e.center?.lat)&&Number.isFinite(e.lon??e.center?.lon)});
console.log('Anchor candidates',candidates.map(c=>[c.type,c.id,c.tags.name,c.lat??c.center.lat,c.lon??c.center.lon]));
if(!candidates.length)throw Error('Named Rathdown House geographic anchor unavailable; no invented fallback coordinates.');
candidates.sort((a,b)=>{const score=e=>(e.tags.name.toLowerCase()==='rathdown house'?10:0)+(e.tags.building?2:0);return score(b)-score(a)});
const anchor=candidates[0],lat=anchor.lat??anchor.center.lat,lon=anchor.lon??anchor.center.lon;
const dlat=1.04/111.195,dlon=dlat/Math.cos(lat*Math.PI/180);
const bbox=`(${(lat-dlat).toFixed(6)},${(lon-dlon).toFixed(6)},${(lat+dlat).toFixed(6)},${(lon+dlon).toFixed(6)})`;
const q=`[out:json][timeout:100];(way["building"]${bbox};way["highway"]${bbox};way["barrier"]${bbox};way["landuse"]${bbox};way["leisure"]${bbox};way["railway"]${bbox};way["natural"]${bbox};nwr["name"~"East Quad|Lower House|Central Quad|Broadstone|Rathdown House|Academic Hub|Glassmanogue",i]${bbox};);out geom center tags;`;
const data=await request(q,110),cos=Math.cos(lat*Math.PI/180);
const xy=(p)=>[Math.round((p.lon-lon)*111195*cos*10)/10,Math.round((p.lat-lat)*111195*10)/10];
const features=[];
for(const e of data.elements){
 const t=e.tags||{},kind=t.building?'building':t.highway?'road':t.barrier?'barrier':t.railway?'railway':t.landuse||t.leisure||t.natural?'land':'poi';
 const pts=e.geometry?.map(xy)||(e.center?[xy(e.center)]:Number.isFinite(e.lat)?[xy(e)]:[]);
 if(!pts.length)continue;
 const [x,y]=pts.reduce((a,p)=>[a[0]+p[0]/pts.length,a[1]+p[1]/pts.length],[0,0]);
 if(Math.hypot(x,y)>1020)continue;
 features.push({id:e.type+'/'+e.id,kind,name:t.name||t['name:en']||'',coords:pts,tags:Object.fromEntries(Object.entries(t).filter(([k])=>['building','height','building:levels','highway','surface','barrier','railway','landuse','leisure','natural','access','foot','area','historic','name','name:en','entrance'].includes(k)))});
}
const counts={};for(const f of features)counts[f.kind]=(counts[f.kind]||0)+1;
const out={version:1,source:'© OpenStreetMap contributors (ODbL 1.0)',sourceUrl:'https://www.openstreetmap.org/copyright',snapshotAt:new Date().toISOString(),anchor:{name:anchor.tags.name,id:anchor.type+'/'+anchor.id,lat,lon},radius:1000,units:'Metres: X east, Y north, Rathdown at (0,0)',counts,features};
console.log('Named features:',features.filter(f=>/Rathdown|East Quad|Lower House|Broadstone|Central Quad|Academic Hub/i.test(f.name)).slice(0,30).map(f=>[f.name,f.kind]));
await fs.mkdir('geo',{recursive:true});await fs.writeFile('geo/data.json',JSON.stringify(out));console.log('Written',JSON.stringify({anchor:out.anchor,counts,bytes:JSON.stringify(out).length}));