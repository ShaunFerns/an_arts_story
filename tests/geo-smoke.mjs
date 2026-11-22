import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1365,height:768}});
const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
const response=await page.goto('http://127.0.0.1:8765/geo/',{waitUntil:'domcontentloaded',timeout:40000});
if(response.status()!==200)throw Error('Geo page returned '+response.status());
await page.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,{timeout:55000});
const g=await page.evaluate(()=>window.__artsGeo&&({rigged:window.__artsGeo.rigged,anchor:window.__artsGeo.origin,features:window.__artsGeo.features,counts:window.__artsGeo.counts,missions:window.__artsGeo.missions}));
console.log('Sourced geographic world:',JSON.stringify(g));
if(!g||g.anchor.id!=='way/310375422')throw Error('Rathdown must use verified OSM anchor');
if(!g.rigged)throw Error('Geo player must use actual rigged GLB, not capsule fallback');
const spawnNpcDistance=await page.evaluate(()=>window.__artsGeo.nearestNpcDistance);
const eyeHeight=await page.evaluate(()=>window.__artsGeo.cameraHeight);
console.log('Initial camera eye height and nearest NPC:',eyeHeight,spawnNpcDistance);
if(spawnNpcDistance<3.5)throw Error('First-person starts too close to an NPC');
if(!Number.isFinite(eyeHeight))throw Error('First-person camera height is not finite');
const terrainChecks=await page.evaluate(()=>{
 const t=window.__artsGeo.terrain;
 return {source:t.model.source,grade:t.model.difference,routeLength:t.routeLength,
  luasY:t.heightAt(...t.luas),eastY:t.heightAt(...t.eastQuad),
  eyeAboveGround:window.__artsGeo.eyeHeightAboveGround,
  playerGround:window.__artsGeo.terrainPlayerHeight};
});
console.log('Provisional 3D terrain and player:',JSON.stringify(terrainChecks));
if(terrainChecks.source!=='provisional_luas_to_east_quad')throw Error('Missing graded terrain implementation');
if(Math.abs(terrainChecks.luasY+4)>.05||Math.abs(terrainChecks.eastY)>.05)throw Error('Provisional Luas-to-East Quad grade does not match model anchors');
if(terrainChecks.eyeAboveGround<1.45||terrainChecks.eyeAboveGround>1.8)throw Error('Player eyes must track local terrain');
if(terrainChecks.routeLength<40||terrainChecks.routeLength>900)throw Error('Unreasonable route anchor distance');

const arrival=await page.evaluate(()=>({
 location:window.__artsGeo.spawnLocation,
 distance:window.__artsGeo.startDistanceFromLuas,
 zoom:window.__artsGeo.mapZoom,
 height:window.__artsGeo.eastQuadHeight,
 dressed:window.__artsGeo.dressedNpcs
}));
console.log('Induction arrival, map and temporary NPC clothing:',JSON.stringify(arrival));
if(arrival.location!=='Broadstone–University'||arrival.distance>13)throw Error('Induction must start close to Broadstone Luas');
if(arrival.zoom<1.7)throw Error('Main campus mission map should be zoomed in from the old overview');
if(arrival.height<23||arrival.height>27)throw Error('East Quad revised provisional 22-28m height missing');
const heightAudit=await page.evaluate(()=>window.__artsGeo.visualHeightAudit);
console.log('Campus visual height estimates:',JSON.stringify(heightAudit));
if(!heightAudit.some(x=>x.source==='visual_estimate_east_quad'&&x.height===arrival.height))throw Error('East Quad OSM footprint did not receive revised height');
if(heightAudit.some(x=>/west quad|broadstone gate/i.test(x.name)))throw Error('Proposed development must not be represented as existing');
if(arrival.dressed<3)throw Error('Expected multiple NPCs with clothing overlays');

// Keyboard-only play should not require a mouse/trackpad.
const beforeKeyboard=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,pitch:window.__artsGeo.lookPitch,position:window.__artsGeo.position}));
await page.keyboard.down('Space');
await page.keyboard.down('KeyW');
await page.waitForTimeout(430);
const afterKeyboardLook=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,pitch:window.__artsGeo.lookPitch,position:window.__artsGeo.position,mode:window.__artsGeo.controlMode}));
await page.keyboard.up('KeyW');
await page.keyboard.up('Space');
if(afterKeyboardLook.mode!=='look'||afterKeyboardLook.pitch>=beforeKeyboard.pitch-.25)throw Error('Space+W should tilt camera up without mouse');
if(Math.hypot(afterKeyboardLook.position.x-beforeKeyboard.position.x,afterKeyboardLook.position.north-beforeKeyboard.position.north)>.1)throw Error('Space+W must not walk');
await page.keyboard.down('Space');await page.keyboard.down('KeyD');await page.waitForTimeout(390);
const afterYaw=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,position:window.__artsGeo.position}));
await page.keyboard.up('KeyD');await page.keyboard.up('Space');
if(Math.abs(afterYaw.yaw-afterKeyboardLook.yaw)<.3)throw Error('Space+D should turn right');
await page.keyboard.down('KeyW');await page.waitForTimeout(350);await page.keyboard.up('KeyW');
const afterWalk=await page.evaluate(()=>window.__artsGeo.position);
if(Math.hypot(afterWalk.x-afterYaw.position.x,afterWalk.north-afterYaw.position.north)<.03)throw Error('W without Space should walk');
const perspective=await page.evaluate(()=>window.__artsGeo.perspective);
if(perspective!=='first-person')throw Error('Default camera must be first-person');
await page.keyboard.press('v');
if(await page.evaluate(()=>window.__artsGeo.perspective)!=='third-person')throw Error('V did not switch to third-person');
await page.keyboard.press('v');
if(await page.evaluate(()=>window.__artsGeo.perspective)!=='first-person')throw Error('V did not restore first-person');
await page.mouse.move(650,410);await page.mouse.down();await page.mouse.move(650,160,{steps:10});await page.mouse.up();
const upwardPitch=await page.evaluate(()=>window.__artsGeo.lookPitch);
console.log('Upward camera pitch:',upwardPitch);
if(upwardPitch>-.95)throw Error('Camera cannot look sufficiently upwards');
await page.waitForTimeout(500);
const npcArmVerticalities=await page.evaluate(()=>window.__artsGeo.npcArmVerticalities);
console.log('NPC shoulder-to-elbow downward orientation (-1 = vertical down):',JSON.stringify(npcArmVerticalities));
if(npcArmVerticalities.length<2||npcArmVerticalities.some(v=>v>-.65))throw Error('NPCs retain raised or T-pose upper arms');
const animationStates=await page.evaluate(()=>window.__artsGeo.animationStates);
console.log('Rigged player animation states:',JSON.stringify(animationStates));
if(!['idle','walk','run'].every(x=>animationStates.includes(x)))throw Error('Rigged player missing idle/walk/run AnimationMixer clips');
const luas=g.missions.find(m=>m.name==='Broadstone–University');
if(!luas?.found||!luas.source?.startsWith('node/'))throw Error('Broadstone must be pinned to a mapped tram stop node, not a bus garage');
if(Math.hypot(luas.position[0]-382,luas.position[1]+100)>45)throw Error('Broadstone waypoint appears far from its OSM Luas stop');

if(g.features<1000||g.counts.building<50||g.counts.barrier<5)throw Error('Source data lacks building/wall coverage');
if(!g.missions.some(m=>m.name==='East Quad'&&m.found))throw Error('East Quad OSM building waypoint missing');
const lower=g.missions.find(m=>m.name==='Lower House');
if(!lower?.found||!lower.provisional||lower.source!=='way/307799384')throw Error('Lower House provisional waypoint missing or wrongly represented');
await page.evaluate(()=>window.__artsGeo.openMap());
if(await page.locator('#overlay').getAttribute('hidden')!==null)throw Error('Map should be open');
await page.screenshot({path:'/tmp/arts-geo-mission-map.png',fullPage:true});
await page.keyboard.press('m');
if(await page.locator('#overlay').getAttribute('hidden')===null)throw Error('M did not close map');
const eastIndex=g.missions.findIndex(m=>m.name==='East Quad');
await page.evaluate(i=>window.__artsGeo.visit(i),eastIndex);
const pos=await page.evaluate(()=>window.__artsGeo.position);
const eastHeight=await page.evaluate(()=>window.__artsGeo.terrainPlayerHeight);
if(Math.abs(eastHeight)>.7)throw Error('East Quad player floor did not track terrain');
console.log('Player location after east-quad waypoint:',JSON.stringify(pos));
await page.screenshot({path:'/tmp/arts-geo-east-quad.png',fullPage:true});
const numberOfNpcs=await page.evaluate(()=>window.__artsGeo.npcs);
console.log('Authored campus NPCs:',numberOfNpcs);
if(numberOfNpcs<3)throw Error('Expected multiple campus NPCs at mapped walkable destinations');
await page.waitForTimeout(300);
await page.keyboard.press('e');
if(await page.locator('#npcDialog').getAttribute('hidden')!==null)throw Error('E-to-talk dialogue did not open near mapped campus NPC');
const spoken=await page.locator('#npcText').innerText();
if(!spoken.includes('Semester 1')&&!spoken.includes('preferences'))throw Error('East Quad student ambassador dialogue missing the programme-specific induction message');
await page.locator('#npcClose').click();
if(await page.locator('#npcDialog').getAttribute('hidden')===null)throw Error('Closing NPC dialogue failed');

if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors.slice(0,8)));
console.log('Georeferenced 3D world, mission map and source-faithful map markers passed.');
await browser.close();
