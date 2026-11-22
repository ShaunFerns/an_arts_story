import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1365,height:768}});
const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
const response=await page.goto('http://127.0.0.1:8765/geo/?start=luas',{waitUntil:'domcontentloaded',timeout:40000});
if(response.status()!==200)throw Error('Geo page returned '+response.status());
await page.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,{timeout:55000});
const g=await page.evaluate(()=>window.__artsGeo&&({rigged:window.__artsGeo.rigged,anchor:window.__artsGeo.origin,features:window.__artsGeo.features,counts:window.__artsGeo.counts,missions:window.__artsGeo.missions}));
console.log('Sourced geographic world:',JSON.stringify(g));
if(!g||g.anchor.id!=='way/310375422')throw Error('Rathdown must use verified OSM anchor');
if(!g.rigged)throw Error('Geo player must use actual rigged GLB, not capsule fallback');
const spawnNpcDistance=await page.evaluate(()=>window.__artsGeo.nearestNpcDistance);
const eyeHeight=await page.evaluate(()=>window.__artsGeo.cameraHeight);
console.log('Initial camera eye height and nearest NPC:',eyeHeight,spawnNpcDistance);
console.log('NPC RENDERED RIG BOUNDS:',JSON.stringify(await page.evaluate(()=>window.__artsGeo.npcVisualDiagnostics)));
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
const entries=await page.evaluate(()=>window.__artsGeo.entrancePrototypes);
console.log('East Quad exterior entrance:',JSON.stringify(entries));
if(entries.length!==2||!entries.some(e=>e.northFacing&&e.provisional&&e.interaction)||!entries.some(e=>!e.northFacing))throw Error('North main entrance and preserved secondary entry required');
if(entries.some(e=>e.wallLength<7))throw Error('Entrances not grounded in the mapped East Quad perimeter');
if(JSON.stringify(entries[0].face)===JSON.stringify(entries[1].face))throw Error('Photo-referenced northern entrance and retained secondary doors overlap');
if(entries[0].sign?.side!=='right when facing main entrance'||!entries[0].sign.mountedOnBrick)throw Error('Photo-referenced wall lettering must be to the right of the northern door');
const signBuild=await page.evaluate(()=>window.__artsGeo.eastQuadSignGeometry);
console.log('Mounted gold lettering and right-hand brick bay:',JSON.stringify(signBuild));
if(!signBuild||!signBuild.visible||!signBuild.wallVisible||signBuild.width<5||signBuild.height<4)throw Error('East Quad gold sign missing from scene');
if(Math.hypot(signBuild.position[0]-entries[0].mainWallMidpoint[0],signBuild.position[2]-entries[0].mainWallMidpoint[1])>12)throw Error('East Quad signage is not adjacent to northern doorway');
const paving=await page.evaluate(()=>window.__artsGeo.eastQuadPavingAudit);
console.log('East Quad paved forecourt:',JSON.stringify(paving));
if(!paving.created||paving.width<25||paving.lightMarkers<4)throw Error('Entrance forecourt is still bare grass');
const facade=await page.evaluate(()=>window.__artsGeo.eastQuadFacadeAudit);
console.log('Full East Quad facade build:',JSON.stringify(facade));
if(facade.wallFaces<4||facade.windowBays<20||facade.brickCoverageM<40)throw Error('East Quad still has untextured building sides');

const plaza=await page.evaluate(()=>window.__artsGeo.plazaFeatures);
console.log('Photo-referenced East Quad curved seating:',JSON.stringify(plaza));
if(plaza.length!==1||plaza[0].slats<30||plaza[0].dimensions.length<8)throw Error('Curved East Quad seating not built');
if(plaza[0].distanceToNpc<6||plaza[0].nearestPedestrianPath<2.4)throw Error('East Quad seating is not integrated into entrance pedestrian forecourt');
if(plaza[0].sideOfDoor!=='left when approaching northern entrance'||plaza[0].entranceDistance>18)throw Error('Curved seating still too far from northern entrance');
const planterSolid=await page.evaluate(p=>window.__artsGeo.plazaCollision(...p),plaza[0].position);
if(!planterSolid)throw Error('Player can walk through the seating planter');
const heightAudit=await page.evaluate(()=>window.__artsGeo.visualHeightAudit);
console.log('Campus visual height estimates:',JSON.stringify(heightAudit));
if(!heightAudit.some(x=>x.source==='visual_estimate_east_quad'&&x.height===arrival.height))throw Error('East Quad OSM footprint did not receive revised height');
if(heightAudit.some(x=>/west quad|broadstone gate/i.test(x.name)))throw Error('Proposed development must not be represented as existing');
if(arrival.dressed<3)throw Error('Expected multiple NPCs with clothing overlays');

// Keyboard-only play should not require a mouse/trackpad.
const beforeKeyboard=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,pitch:window.__artsGeo.lookPitch,position:window.__artsGeo.position}));
await page.keyboard.down('Space');
await page.keyboard.down('w');
await page.waitForTimeout(430);
const afterKeyboardLook=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,pitch:window.__artsGeo.lookPitch,position:window.__artsGeo.position,mode:window.__artsGeo.controlMode}));
await page.keyboard.up('w');
await page.keyboard.up('Space');
console.log('Keyboard look input',JSON.stringify({beforeKeyboard,afterKeyboardLook}));
if(afterKeyboardLook.mode!=='look'||afterKeyboardLook.pitch>=beforeKeyboard.pitch-.045)throw Error('Space+W should tilt camera up without mouse');
if(Math.hypot(afterKeyboardLook.position.x-beforeKeyboard.position.x,afterKeyboardLook.position.north-beforeKeyboard.position.north)>.1)throw Error('Space+W must not walk');
await page.keyboard.down('Space');await page.keyboard.down('d');await page.waitForTimeout(390);
const afterYaw=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,position:window.__artsGeo.position}));
await page.keyboard.up('d');await page.keyboard.up('Space');
console.log('Keyboard turn input',JSON.stringify({beforeYaw:afterKeyboardLook.yaw,afterYaw:afterYaw.yaw}));
if(Math.abs(afterYaw.yaw-afterKeyboardLook.yaw)<.07)throw Error('Space+D should turn right');
await page.keyboard.down('w');await page.waitForTimeout(350);await page.keyboard.up('w');
const afterWalk=await page.evaluate(()=>window.__artsGeo.position);
if(Math.hypot(afterWalk.x-afterYaw.position.x,afterWalk.north-afterYaw.position.north)<.01)throw Error('W without Space should walk');
const playerFacing=await page.evaluate(()=>window.__artsGeo.facingYaw);
const dx=afterWalk.x-afterYaw.position.x,dz=-(afterWalk.north-afterYaw.position.north);
const dot=((-Math.sin(playerFacing))*dx+(-Math.cos(playerFacing))*dz)/Math.hypot(dx,dz);
if(dot<.75)throw Error('Third-person student is facing backwards while walking');

const perspective=await page.evaluate(()=>window.__artsGeo.perspective);
const signCount=await page.evaluate(()=>window.__artsGeo.signCount);
if(signCount<1)throw Error('At least one mapped campus wayfinding prototype missing');
if(perspective!=='first-person')throw Error('Default camera must be first-person');
await page.keyboard.press('v');
if(await page.evaluate(()=>window.__artsGeo.perspective)!=='third-person')throw Error('V did not switch to third-person');
await page.waitForTimeout(200);
const chase=await page.evaluate(()=>({offset:window.__artsGeo.chaseCameraOffset,follow:window.__artsGeo.followDistance}));
if(chase.offset>5||chase.follow>9)throw Error('Third-person camera must not fly high above the human-scale scene');
await page.keyboard.press('v');
if(await page.evaluate(()=>window.__artsGeo.perspective)!=='first-person')throw Error('V did not restore first-person');
await page.mouse.move(650,410);await page.mouse.down();await page.mouse.move(650,160,{steps:10});await page.mouse.up();
const upwardPitch=await page.evaluate(()=>window.__artsGeo.lookPitch);
console.log('Upward camera pitch:',upwardPitch);
if(upwardPitch>-.95)throw Error('Camera cannot look sufficiently upwards');
await page.waitForTimeout(500);
const npcArmVerticalities=await page.evaluate(()=>window.__artsGeo.npcArmVerticalities);
console.log('NPC shoulder-to-elbow downward orientation (-1 = vertical down):',JSON.stringify(npcArmVerticalities));
// The mannequin is intentionally hidden in the default variant; there
// are no imported NPC rig shoulders to assert in the clothed prototype.
const npcVariant=await page.evaluate(()=>window.__artsGeo.npcVariant);
if(npcVariant==='original-mannequin'&&(npcArmVerticalities.length<2||npcArmVerticalities.some(v=>v>-.65)))throw Error('Original NPC rig retains a T-pose');
if(npcVariant!=='clothed-adult')throw Error('Default NPC comparison variant not active');
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
const npcHeightDifference=await page.evaluate(()=>window.__artsGeo.closestNpcVerticalDifference);
if(npcHeightDifference===null||Math.abs(npcHeightDifference)>.35)throw Error('East Quad interaction character is not at player standing elevation');
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

// Default game URL should now be a practical East Quad façade test, while
// ?start=luas preserves the original full-walk induction experience.
const eqReview=await browser.newPage({viewport:{width:1365,height:768}});
await eqReview.goto('http://127.0.0.1:8765/geo/',{waitUntil:'domcontentloaded',timeout:40000});
await eqReview.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,{timeout:55000});
const review=await eqReview.evaluate(()=>({location:window.__artsGeo.spawnLocation,distance:window.__artsGeo.startDistanceFromEastQuad,entries:window.__artsGeo.entrancePrototypes}));
console.log('East Quad direct-review spawn:',JSON.stringify(review));
const signLine=await eqReview.evaluate(()=>window.__artsGeo.eastQuadSignSightline);
console.log('North entrance sign visibility ray:',JSON.stringify(signLine));
if(!signLine||!signLine.hits.some(h=>h.sign))throw Error('Gold wall sign cannot be seen along the north entrance sightline');
const signHit=signLine.hits.findIndex(h=>h.sign);
if(signLine.hits.slice(0,signHit).some(h=>h.distance<signLine.distance-.5))throw Error('Gold East Quad identity sign is occluded from entrance approach');


const calibration=await eqReview.evaluate(()=>{
 const g=window.__artsGeo;
 return {npc:g.eastQuadNpcDimensions,variant:g.npcVariant,scale:g.npcPrototypeScale,eye:g.eyeHeightAboveGround};
});
console.log('East Quad NPC vs reference 2.10m door:',JSON.stringify(calibration));
if(calibration.variant!=='clothed-adult')throw Error('Wrong default NPC variant');
if(!calibration.npc||!(calibration.npc.height>1.55&&calibration.npc.height<1.80))throw Error('NPC is not shorter than reference 2.10m door');
if(calibration.npc.width>.9)throw Error('NPC shoulder width still disproportionate');
const thirdPerson=await eqReview.evaluate(()=>{
 const g=window.__artsGeo;
 g.setPerspective(false);
 return {body:g.playerVisualDiagnostics,npc:g.eastQuadNpcDimensions,eye:g.eyeHeightAboveGround};
});
console.log('Third-person player / NPC body comparison:',JSON.stringify(thirdPerson));
if(thirdPerson.body?.type!=='clothed-student'||!thirdPerson.body.visible)throw Error('Third-person still uses the giant untextured mannequin');
if(Math.abs(thirdPerson.body.height-thirdPerson.npc.height)>.09)throw Error('Third-person player and NPC do not have comparable height');
if(thirdPerson.body.width>.9)throw Error('Third-person player is disproportionately wide');
await eqReview.evaluate(()=>window.__artsGeo.setPerspective(true));

if(Math.abs(calibration.eye-1.65)>.06)throw Error('First-person eye height unexpectedly changed');
const comparison=await browser.newPage({viewport:{width:1365,height:768}});
await comparison.goto('http://127.0.0.1:8765/geo/?npc=original&scale=1',{waitUntil:'domcontentloaded',timeout:40000});
await comparison.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,{timeout:55000});
const original=await comparison.evaluate(()=>({variant:window.__artsGeo.npcVariant,visible:window.__artsGeo.humanReferenceVisible,dimensions:window.__artsGeo.eastQuadNpcDimensions}));
console.log('Original 1.74m mannequin comparison:',JSON.stringify(original));
if(original.variant!=='original-mannequin'||!original.visible||Math.abs(original.dimensions.height-1.74)>.12)throw Error('Original NPC comparison and human scale reference missing');
await comparison.close();
if(review.location!=='East Quad review'||review.distance>30)throw Error('Default direct test spawn must face north entrance of East Quad');
await eqReview.screenshot({path:'/tmp/arts-geo-north-entrance-review.png',fullPage:true});
await eqReview.close();
if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors.slice(0,8)));
console.log('Georeferenced 3D world, mission map and source-faithful map markers passed.');
await browser.close();
