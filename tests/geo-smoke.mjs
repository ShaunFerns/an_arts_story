import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1365,height:768}});
const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
const response=await page.goto('http://127.0.0.1:8765/geo/?review',{waitUntil:'domcontentloaded',timeout:40000});
if(response.status()!==200)throw Error('Geo page returned '+response.status());
await page.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,undefined,{timeout:55000});
const g=await page.evaluate(()=>window.__artsGeo&&({rigged:window.__artsGeo.rigged,anchor:window.__artsGeo.origin,features:window.__artsGeo.features,counts:window.__artsGeo.counts,missions:window.__artsGeo.missions}));
console.log('Sourced geographic world:',JSON.stringify(g));
if(!g||g.anchor.id!=='way/310375422')throw Error('Rathdown must use verified OSM anchor');
await page.getByRole('button',{name:'Find the Arts induction welcome point'}).click();
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
if(!signBuild||!signBuild.visible||!signBuild.wallVisible||signBuild.width<4||signBuild.height<2||signBuild.frontOffset<=0||signBuild.frontOffset>.08)throw Error('East Quad gold sign missing from scene');
const signHeight=await page.evaluate(()=>{
 const g=window.__artsGeo,[x,y,n]=g.eastQuadSignGeometry.position;
 return y-g.terrain.heightAt(x,n);
});
if(signHeight<3.35||signHeight>3.6)throw Error('East Quad sign should sit about 3.5 m above the paving');
if(Math.hypot(signBuild.position[0]-entries[0].mainWallMidpoint[0],signBuild.position[2]-entries[0].mainWallMidpoint[1])>12)throw Error('East Quad signage is not adjacent to northern doorway');
const paving=await page.evaluate(()=>window.__artsGeo.eastQuadPavingAudit);
console.log('East Quad paved forecourt:',JSON.stringify(paving));
if(!paving.created||paving.width<25||paving.lightMarkers<4)throw Error('Entrance forecourt is still bare grass');
const doors=await page.evaluate(()=>window.__artsGeo.missionDoorRegistry);
console.log('Other mission-building exterior doors:',JSON.stringify(doors));
for(const name of ['Central Quad','Rathdown House','Lower House']){
 const d=doors.find(x=>x.name===name);
 if(!d||d.dimensions.height<2.1||Math.hypot(d.door[0]-d.interaction[0],d.door[1]-d.interaction[1])>10)throw Error(name+' mission entry and nearby NPC missing');
}
const facade=await page.evaluate(()=>window.__artsGeo.eastQuadFacadeAudit);
console.log('Full East Quad facade build:',JSON.stringify(facade));
if(facade.signWallWindows?.columns!==5||facade.signWallWindows.bronzePanels!==4||
 facade.signWallWindows.glassOn!=='viewer’s right')throw Error('East Quad’s first window row lost its bronze panels and right-hand glazing');
if(facade.wallFaces<4||facade.windowBays<20||facade.brickCoverageM<40)throw Error('East Quad still has untextured building sides');

const plaza=await page.evaluate(()=>window.__artsGeo.plazaFeatures);
console.log('Photo-referenced East Quad curved seating:',JSON.stringify(plaza));
if(plaza.length!==1||plaza[0].slats<30||plaza[0].dimensions.length<12)throw Error('Verified East Quad curved seating is missing');
if(plaza[0].distanceToNpc<6||plaza[0].nearestPedestrianPath<2.4)throw Error('East Quad seating is not integrated into entrance pedestrian forecourt');
if(plaza.some(p=>p.entranceDistance>39))throw Error('Curved seating too far from northern entrance');
const planterSolid=await page.evaluate(p=>window.__artsGeo.plazaCollision(...p),plaza[0].position);
if(!planterSolid)throw Error('Player can walk through the seating planter');
for(const p of plaza.slice(1))if(!await page.evaluate(pos=>window.__artsGeo.plazaCollision(...pos),p.position))throw Error('Second seating island is not collidable');
const heightAudit=await page.evaluate(()=>window.__artsGeo.visualHeightAudit);
console.log('Campus visual height estimates:',JSON.stringify(heightAudit));
if(!heightAudit.some(x=>x.source==='visual_estimate_east_quad'&&x.height===arrival.height))throw Error('East Quad OSM footprint did not receive revised height');
if(heightAudit.some(x=>/west quad|broadstone gate/i.test(x.name)))throw Error('Proposed development must not be represented as existing');
if(arrival.dressed<3)throw Error('Expected multiple NPCs with clothing overlays');

// Keyboard-only play should not require a mouse/trackpad.
const beforeKeyboard=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,pitch:window.__artsGeo.lookPitch,position:window.__artsGeo.position}));
await page.keyboard.down('Space');
await page.keyboard.down('w');
await page.waitForFunction(before=>window.__artsGeo.lookPitch<before-.045,beforeKeyboard.pitch);
const afterKeyboardLook=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,pitch:window.__artsGeo.lookPitch,position:window.__artsGeo.position,mode:window.__artsGeo.controlMode}));
await page.keyboard.up('w');
await page.keyboard.up('Space');
console.log('Keyboard look input',JSON.stringify({beforeKeyboard,afterKeyboardLook}));
if(afterKeyboardLook.mode!=='look'||afterKeyboardLook.pitch>=beforeKeyboard.pitch-.045)throw Error('Space+W should tilt camera up without mouse');
if(Math.hypot(afterKeyboardLook.position.x-beforeKeyboard.position.x,afterKeyboardLook.position.north-beforeKeyboard.position.north)>.1)throw Error('Space+W must not walk');
await page.keyboard.down('Space');await page.keyboard.down('d');
await page.waitForFunction(before=>Math.abs(window.__artsGeo.lookYaw-before)>.07,afterKeyboardLook.yaw);
const afterYaw=await page.evaluate(()=>({yaw:window.__artsGeo.lookYaw,position:window.__artsGeo.position}));
await page.keyboard.up('d');await page.keyboard.up('Space');
console.log('Keyboard turn input',JSON.stringify({beforeYaw:afterKeyboardLook.yaw,afterYaw:afterYaw.yaw}));
if(Math.abs(afterYaw.yaw-afterKeyboardLook.yaw)<.07)throw Error('Space+D should turn right');
await page.keyboard.down('w');
await page.waitForFunction(before=>Math.hypot(window.__artsGeo.position.x-before.x,window.__artsGeo.position.north-before.north)>.04,afterYaw.position);
await page.keyboard.up('w');
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
// Place the player at real exterior trigger points. An E keypress must
// still resolve the correct local NPC or observation and unlock its next step.
async function place(group,id){
 const placed=await page.evaluate(([group,id])=>{
  const g=window.__artsGeo,[x,n]=g.encounterPoints[group][id];
  return g.reviewPose(x,n,x,n-5);
 },[group,id]);
 if(!placed)throw Error('Blocked encounter point: '+id);
}
const choose=name=>page.getByRole('button',{name,exact:false}).click();
const closePhone=()=>page.locator('#closeMap').click();
const checkStory=async (predicate,message)=>{
 if(!await page.evaluate(predicate))throw Error(message);
};
async function talk(npc,title){
 await place('characters',npc);
 await page.keyboard.press('e');
 if(await page.locator('#npcTitle').innerText()!==title)throw Error('Wrong conversation at '+npc);
}
await page.keyboard.press('m');
await choose('Timetable');
if(!await page.getByText('Awaiting publication').isVisible())throw Error('Timetable published before induction');
await closePhone();

await talk('induction','Welcome to BA Arts');
const npcHeightDifference=await page.evaluate(()=>window.__artsGeo.closestNpcVerticalDifference);
if(npcHeightDifference===null||Math.abs(npcHeightDifference)>.35)throw Error('East Quad character elevation differs from the player');
if(Math.abs(await page.evaluate(()=>window.__artsGeo.terrainPlayerHeight))>.7)throw Error('East Quad player floor did not track terrain');
await choose('Meet my academic adviser');
const outdoorLocations=await page.evaluate(()=>{
 const geo=window.__artsGeo;
 const people=geo.encounterPoints.characters;
 const doors=geo.missionDoorRegistry;
 return ['adviser','cian','support'].map(id=>{
  const [x,n]=people[id];
  return doors.filter(d=>d.id!=='east').sort((a,b)=>
   Math.hypot(a.door[0]-x,a.door[1]-n)-Math.hypot(b.door[0]-x,b.door[1]-n))[0].id;
 });
});
if(outdoorLocations.join()!=='central,lower,rathdown')throw Error('Archived outdoor conversations are not distributed around campus');
await talk('adviser','Which directions interest you?');
await choose('I want to explore people, society and history');
await page.locator('#constraintNote').fill('Travel to campus');
await choose('Save and continue');
if(!await page.getByText('Society and culture and History',{exact:false}).isVisible())throw Error('Induction preference did not affect adviser response');
await choose('Join the sustainability team');
await talk('sustainability','The campus is your first challenge');
await choose('Start exploring');
await talk('induction','Keep exploring');
await choose('Back to the hunt');
const order=['library','laurence','lower','glass','rathdown'];
for(const id of order){
 await place('stops',id);
 await page.keyboard.press('e');
 const observe=page.getByRole('button',{name:'Record an observation',exact:true});
 if(await observe.isVisible())await observe.click();
 if(await page.locator('#npcTitle').innerText()!=='What do you notice?')throw Error('Hunt stop not playable: '+id);
 if(id==='library'){
  await choose('Take another look first');
  await choose('Choose an observation');
 }
 await page.locator('#npcChoices button').first().click();
 await choose('Continue exploring');
 if(id==='laurence'){
  await page.reload();
  await page.waitForFunction(()=>window.__artsGeo?.ready);
  await checkStory(()=>window.__artsGeo.story.huntDone.join() === 'library,laurence','Reload lost hunt notes or allowed the wrong order');
 }
}
await checkStory(()=>!window.__artsGeo.story.timetablePublished,'Timetable published before the debrief');
await talk('induction','Welcome back to East Quad');
await choose('Finish induction');
if(await page.locator('#npcTitle').innerText()!=='Friday before teaching begins')throw Error('Missing Friday publication scene');
await choose('Open my timetable');
if(!await page.getByText('Semester 1 · illustrative timetable').isVisible())throw Error('Missing illustrative timetable');
await closePhone();
if(await page.locator('#npcTitle').innerText()!=='The day is underway')throw Error('Missing Bríd’s restored post-induction scene');
await choose('Find Cian');

await talk('cian','The missing module');
await choose('Look at Cian’s preference and timetable before deciding');
await choose('Compare the details and save a note');
await closePhone();
await choose('maybe you can just pick something else now');
await choose('Go and find Dr Byrne');
await talk('adviser','What do you actually know?');
if(!await page.getByText('You can tell her what Cian ranked',{exact:false}).isVisible())throw Error('Case evidence did not affect the advising discussion');
await choose('Couldn’t you just tell him what to take?');
await choose('Go to Rathdown House');
await talk('support','Finding the right route');
await choose('programme operations about the record');
await choose('Go back to Dr Byrne');
await talk('adviser','Your advising record and timetable');
await choose('Finish the mission');
if(!await page.getByText('Your first instinct was to assume a swap would be easy',{exact:false}).isVisible())throw Error('Cian choice missing from reflection');
await choose('Find Saoirse at Lower House');
await talk('union','A place to find your people');
await choose('Ask what else is nearby');
await choose('Add that to my notes');
await talk('gym','Looking after yourself');
await choose('Save the location');
await talk('saoirse','Something unexpected');
await choose('surely you can change your timetable now');
await choose('Go to East Quad');
await talk('lecturer','A possible pathway');
await choose('Ask whether an enjoyable taster guarantees a place next semester');
await choose('Go to Central Quad');
await talk('adviser','Exploration with a plan');
await choose('Record the new interest and agree what to check next');
await choose('Review the advising record');
if(!await page.getByText('Travel to campus',{exact:true}).isVisible())throw Error('Original advising constraint missing');
await closePhone();
await choose('Explore more of Grangegorman');
await page.reload();
await page.waitForFunction(()=>window.__artsGeo?.ready);
await checkStory(()=>{
 const story=window.__artsGeo.story;
 return story.stage==='complete'&&story.caseChecked&&story.decisions.saoirse1===1&&
  story.formA.interests[0]==='Society and culture'&&!!story.formA.newInterest&&
  Object.keys(story.huntEvidence).length===5&&story.timetablePublished;
},'Reload lost completion, decisions or field notes');
await page.close();

const eqReview=await browser.newPage({viewport:{width:1365,height:768}});
await eqReview.goto('http://127.0.0.1:8765/geo/?start=east-quad&review',{waitUntil:'domcontentloaded',timeout:40000});
await eqReview.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,undefined,{timeout:55000});
await eqReview.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const review=await eqReview.evaluate(()=>({location:window.__artsGeo.spawnLocation,distance:window.__artsGeo.startDistanceFromEastQuad,entries:window.__artsGeo.entrancePrototypes}));
console.log('East Quad direct-review spawn:',JSON.stringify(review));
const signLine=await eqReview.evaluate(()=>window.__artsGeo.eastQuadSignSightline);
const screenSign=await eqReview.evaluate(()=>window.__artsGeo.eastQuadSignRelativeScreenPosition);
console.log('Real screen sign relative to door:',JSON.stringify(screenSign));
if(!screenSign||!screenSign.screenRight||screenSign.delta<.04)throw Error('Gold identity lettering is left of the main door in the actual camera image');
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
if(calibration.scale!==1)throw Error('NPCs must remain at 1:1 visual scale');
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
if(review.location!=='East Quad review'||review.distance>30)throw Error('Direct review spawn must face the north entrance of East Quad');
for (const [view,pose] of [
 ['luas-approach',[116,-74,95,-99,5]],
 ['north-entrance',[94,-88,91,-103,4.2]],
 ['doors-and-sign',[98,-94,89,-101,3]],
]){
 if(!await eqReview.evaluate(pose=>window.__artsGeo.reviewPose(...pose),pose))throw Error('Blocked photo review position: '+view);
 await eqReview.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await eqReview.screenshot({path:'/tmp/arts-geo-'+view+'.png'});
}
await eqReview.close();

const comparison=await browser.newPage({viewport:{width:1365,height:768}});
await comparison.goto('http://127.0.0.1:8765/geo/?start=east-quad&npc=original&scale=1',{waitUntil:'domcontentloaded',timeout:40000});
await comparison.waitForFunction(()=>window.__artsGeo?.ready||!document.querySelector('#error').hidden,undefined,{timeout:55000});
const original=await comparison.evaluate(()=>({variant:window.__artsGeo.npcVariant,visible:window.__artsGeo.humanReferenceVisible,dimensions:window.__artsGeo.eastQuadNpcDimensions}));
console.log('Original 1.74m mannequin comparison:',JSON.stringify(original));
if(original.variant!=='original-mannequin'||!original.visible||Math.abs(original.dimensions.height-1.74)>.12)throw Error('Original NPC comparison and human scale reference missing');
await comparison.close();
if(errors.length)throw Error('Browser errors: '+JSON.stringify(errors.slice(0,8)));
console.log('Georeferenced 3D world, mission map and source-faithful map markers passed.');
await browser.close();
