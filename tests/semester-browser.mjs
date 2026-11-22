import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const base='http://127.0.0.1:8765/geo/?test';
const page=await browser.newPage({viewport:{width:1152,height:768}});
const errors=[];
page.on('pageerror',e=>errors.push(e.stack||e.message));
page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
const model=fn=>page.evaluate(fn);
const button=name=>page.getByRole('button',{name,exact:true});
const choice=()=>page.locator('#npcChoices button').first().click();
const state=()=>model(()=>window.__artsGeo.semester);
const panelTitle=()=>page.locator('#npcTitle').textContent();

try {
  assert.equal((await page.goto(base,{waitUntil:'domcontentloaded'})).status(),200);
  await page.waitForFunction(()=>window.__artsGeo?.ready);
  await button('Skip arrival').waitFor();
  const from=await model(()=>window.__artsGeo.tramPosition);
  await page.waitForFunction(initial=>window.__artsGeo.tramPosition[0]>initial+.35,from[0]);
  await page.screenshot({path:'/tmp/arts-geo-luas.png'});
  await button('Skip arrival').click();
  assert.equal(await panelTitle(),'Your story so far');
  await page.keyboard.press('m');
  await button('Messages (1)').click();
  await page.getByText('Welcome to Grangegorman.',{exact:false}).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await panelTitle(),'Your story so far');
  await choice();await choice();
  assert.equal((await state()).pending,'ch1a');

  const spawn=await model(()=>window.__artsGeo.position);
  const facing=await model(()=>window.__artsGeo.lookYaw);
  await page.keyboard.down('w');
  await page.waitForFunction(({spawn,facing})=>{
    const p=window.__artsGeo.position;
    return (p.x-spawn.x)*-Math.sin(facing)+(p.north-spawn.north)*Math.cos(facing)>.15;
  },{spawn,facing});
  await page.keyboard.up('w');
  const afterW=await model(()=>window.__artsGeo.position);
  await page.keyboard.down('s');
  await page.waitForFunction(({afterW,facing})=>{
    const p=window.__artsGeo.position;
    return (p.x-afterW.x)*Math.sin(facing)+(p.north-afterW.north)*-Math.cos(facing)>.15;
  },{afterW,facing});
  await page.keyboard.up('s');

  const audit=await model(()=>{
    const g=window.__artsGeo;
    return {doors:g.missionDoorRegistry,bridge:g.underpass,facades:g.campusFacadeAudit,paving:g.entrancePaving,rathdown:g.rathdownApproach,
      missions:g.missions,spawn:g.position};
  });
  console.log('World snapshots: '+JSON.stringify({doors:audit.doors,bridge:audit.bridge,missions:audit.missions,spawn:audit.spawn}));
  assert.equal(audit.paving?.length,6);
  assert(audit.paving.every(surface=>surface.triangles>30));
  const chapelDoor=audit.doors.find(door=>door.id==='laurence');
  assert(chapelDoor.door[1]<-62&&chapelDoor.outward[0]>.8,'Chapel entrance should face east from the south end');
  assert.equal(audit.doors.length,8);
  assert(audit.bridge.clearance>=8&&audit.bridge.clearance<=10);
  assert(audit.facades.some(f=>f.palette==='central'&&f.windowCount>120&&f.wallMaterial==='centralBrick'&&f.roof.profile==='terrace'));
  assert(audit.facades.some(f=>f.id==='way/1361416599'&&f.windowCount>70&&f.wallMaterial==='harling'&&f.roof.eaves<f.roof.ridge));
  for(const id of ['way/310375422','way/516821746','way/396704720','way/307799384','way/310375420','way/516824969']){
    const historic=audit.facades.find(f=>f.id===id);
    assert(historic?.roof&&['gable','hip'].includes(historic.roof.profile)&&historic.roof.ridge>historic.roof.eaves);
    assert.match(historic.wallMaterial,/Stone$/);
  }

  // Search around the current player using the game's actual collision probes.
  // The browser then walks every segment with the live movement function at a
  // fixed timestep, preserving sliding, world boundaries and terrain height.
  async function walk(goal) {
    const result=await page.evaluate(goal=>{
      const g=window.__artsGeo, p=g.position;
      const start=[p.x,p.north];
      const safe=(a,b)=>{
        const d=Math.hypot(a[0]-b[0],a[1]-b[1]),count=Math.ceil(d/.22);
        for(let i=1;i<=count;i++){
          const t=i/count,x=a[0]+(b[0]-a[0])*t,n=a[1]+(b[1]-a[1])*t;
          if(g.collisionProbe(x,n).blocked||g.plazaCollision(x,n))return false;
        }
        return true;
      };
      const side=2.25,ix=Math.round(start[0]/side),iy=Math.round(start[1]/side);
      const node=(x,y)=>x+','+y;
      const toWorld=(x,y)=>[x*side,y*side];
      const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
      const pred=new Map(),costs=new Map(),queue=[];
      function put(x,y,gap,previous){
        const hash=node(x,y);
        if((costs.get(hash)??Infinity)<=gap)return;
        costs.set(hash,gap);pred.set(hash,previous);
        queue.push({x,y,hash,gap,estimate:gap+dist(toWorld(x,y),goal)});
      }
      if(safe(start,goal))return {goal,reached:g.testWalk(...goal),segments:1};
      for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){
        const point=toWorld(ix+dx,iy+dy);
        if(safe(start,point))put(ix+dx,iy+dy,dist(start,point),null);
      }
      let found=null;
      for(let attempts=0;attempts<50000&&queue.length;attempts++){
        let best=0;
        for(let i=1;i<queue.length;i++)if(queue[i].estimate<queue[best].estimate)best=i;
        const q=queue[best];
        queue[best]=queue.at(-1);queue.pop();
        if(q.gap!==costs.get(q.hash))continue;
        const point=toWorld(q.x,q.y);
        if(dist(point,goal)<side*3&&safe(point,goal)){found=q.hash;break;}
        for(const dx of [-1,0,1])for(const dy of [-1,0,1]){
          if(!dx&&!dy)continue;
          const x=q.x+dx,y=q.y+dy;
          if((costs.get(node(x,y))??Infinity)<=q.gap+Math.hypot(dx,dy)*side)continue;
          if(safe(point,toWorld(x,y)))put(x,y,q.gap+Math.hypot(dx,dy)*side,q.hash);
        }
      }
      if(!found)return {start,goal,blocked:true,probes:costs.size};
      const route=[goal];
      for(let current=found;current;current=pred.get(current)){
        route.push(toWorld(...current.split(',').map(Number)));
      }
      let reached=null;
      for(const next of route.reverse())reached=g.testWalk(...next);
      return {goal,reached,segments:route.length};
    },goal);
    assert(result.reached&&Math.hypot(goal[0]-result.reached[0],goal[1]-result.reached[1])<.23,
      'Could not walk route: '+JSON.stringify(result));
    return result.segments;
  }
  let segments=0;
  const ramp=await model(()=>{
    const g=window.__artsGeo,{foot,head,rails}=g.rathdownApproach;
    const midpoint=rails[0][0].map((value,i)=>(value+rails[0][1][i])/2);
    return {rise:g.terrain.heightAt(...head)-g.terrain.heightAt(...foot),midpoint};
  });
  assert(Math.abs(ramp.rise-audit.rathdown.rise)<.04);
  const rathdown=audit.doors.find(d=>d.id==='rathdown');
  assert(rathdown.outward[1]<-.85&&rathdown.door[1]<-24);

  for(const point of [[352,-119],[335,-129],[313,-132]])segments+=await walk(point);
  const height=await model(()=>{
    const g=window.__artsGeo;
    return g.underpass.underside-g.terrain.heightAt(335,-129);
  });
  assert(height>=8&&height<=10);
  const central=audit.doors.find(d=>d.id==='central');
  const [east,eastSouth]=audit.doors.filter(d=>d.id==='east');
  const library=audit.doors.find(d=>d.id==='library');
  async function walkToDoor(door){
    segments+=await walk(door.exit);
    segments+=await walk(door.interaction);
    await page.waitForFunction(expected=>{
      const hint=document.querySelector('#npcHint');
      return !hint.hidden&&hint.textContent===expected;
    },'E — Enter '+door.name);
    await page.keyboard.press('e');
  }
  async function walkToMeeting(door){
    const contact=await model(()=>window.__artsGeo.semesterMeetingPlaces);
    const meeting=contact[door.id];
    assert(meeting?.visible);
    assert(Math.hypot(meeting.position[0]-door.interaction[0],meeting.position[1]-door.interaction[1])>2);
    segments+=await walk(door.exit);
    segments+=await walk(meeting.position);
    await page.waitForFunction(()=>{
      const hint=document.querySelector('#npcHint');
      return !hint.hidden&&/^E — (Talk to |Continue outside )/.test(hint.textContent);
    });
    await page.keyboard.press('e');
    assert((await state()).visited.includes(door.id));
  }
  async function lookAtFacade(door) {
    const x=door.door[0]+door.outward[0]*13,n=door.door[1]+door.outward[1]*13;
    const shot=await page.evaluate(([x,n,tx,tn])=>window.__artsGeo.reviewPose(x,n,tx,tn,2.5),[x,n,...door.door]);
    if(shot)await page.screenshot({path:'/tmp/arts-geo-'+door.id+'.png'});
  }

  await walkToDoor(east);
  assert.equal(await panelTitle(),'East Quad entrance');
  await button('Exit to campus').click();
  await walkToMeeting(central);
  assert.equal(await panelTitle(),'What have I joined?');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__artsGeo?.ready);
  assert.equal(await panelTitle(),'What have I joined?');
  for(let n=0;n<15&&(await state()).activeChapter===1;n++){
    if((await state()).current==='ch1b')assert(await page.locator('.degree-segments').isVisible());
    await choice();
  }
  assert((await state()).formA.completed);
  await page.getByText('Semester 1 · practice timetable',{exact:true}).waitFor();
  assert.equal((await state()).formA.modules.length,6);
  await page.screenshot({path:'/tmp/arts-geo-semester-timetable.png'});
  await button('Close (M)').click();
  await walkToMeeting(east);
  assert.equal(await panelTitle(),'Your first module');
  await choice();
  assert.equal((await state()).pending,'ch2b');
  await walkToMeeting(library);
  assert.equal(await panelTitle(),'What does 5 ECTS mean?');
  await choice();
  await walkToMeeting(east);
  assert.equal(await panelTitle(),'Your first two weeks');
  await choice();
  assert.equal((await state()).pending,'ch3a');
  await page.keyboard.press('m');
  await button('Messages (2)').click();
  await page.getByText('Timetable update · practice',{exact:true}).waitFor();
  await button('Timetable').click();
  await page.getByText('Additional workshop',{exact:true}).waitFor();

  await page.setViewportSize({width:390,height:690});
  await button('Map').click();
  assert(await page.getByText('▲ You are here',{exact:true}).isVisible());
  await page.screenshot({path:'/tmp/arts-geo-semester-phone-mobile.png'});
  const projection=await model(()=>{
    const g=window.__artsGeo;
    return {p:g.position,map:g.mapPlayer};
  });
  assert(Math.abs(projection.map.x-((projection.p.x-projection.map.centre[0])*projection.map.scale+500))<.01);
  assert(Math.abs(projection.map.y-((projection.map.centre[1]-projection.p.north)*projection.map.scale+500))<.01);
  await button('Zoom in').click();
  await button('Close (M)').click();
  await page.setViewportSize({width:1152,height:768});
  await walkToMeeting(audit.doors.find(d=>d.id==='lower'));
  assert.equal(await panelTitle(),'I thought Stage 1 meant I could change anything');
  await choice();
  segments+=await walk(audit.rathdown.foot);
  const reachedRampHead=await page.evaluate(head=>window.__artsGeo.testWalk(...head),audit.rathdown.head);
  assert(Math.hypot(reachedRampHead[0]-audit.rathdown.head[0],reachedRampHead[1]-audit.rathdown.head[1])<.23);
  const reachedRail=await page.evaluate(point=>window.__artsGeo.testWalk(...point),ramp.midpoint);
  assert(Math.hypot(reachedRail[0]-ramp.midpoint[0],reachedRail[1]-ramp.midpoint[1])>.25);
  await walkToMeeting(rathdown);
  assert((await state()).visited.includes('rathdown'));
  await page.keyboard.press('Escape');
  for(const door of [eastSouth,...audit.doors.filter(d=>['glass','laurence'].includes(d.id))]){
    await walkToDoor(door);
    assert.equal(await panelTitle(),door.name+' entrance');
    await button('Exit to campus').click();
    const exit=await model(()=>({pos:window.__artsGeo.position,yaw:window.__artsGeo.lookYaw}));
    assert(Math.hypot(exit.pos.x-door.exit[0],exit.pos.north-door.exit[1])<.13);
    assert(door.outward[0]*-Math.sin(exit.yaw)+door.outward[1]*Math.cos(exit.yaw)>.99);
  }

  for(let i=0;i<28;i++){
    const progress=await state();
    if(progress.current==='ending')break;
    if(progress.pending){
      const task=await model(()=>window.__artsGeo.activeTask);
      await walkToMeeting(audit.doors.find(d=>d.id===task.place));
    } else await choice();
  }
  assert.deepEqual((await state()).chapterDone,[0,1,2,3,4,5,6]);
  assert.equal((await state()).completion,'ch6c');
  await page.getByText('7 of 7 chapters completed.',{exact:false}).waitFor();
  await button('Back to campus').click();
  assert.equal(await model(()=>window.__artsGeo.activeTask),null);
  await page.keyboard.press('m');
  await button('Campus').click();
  await page.locator('#missionList section').filter({hasText:'Earlier choices return'})
    .getByRole('button',{name:'Find on campus'}).click();
  await button('Close (M)').click();
  await walkToMeeting(audit.doors.find(d=>d.id==='lower'));
  assert.match(await panelTitle(),/Earlier choices return/);
  await choice();
  await choice();
  assert.equal((await state()).completion,'week3End');
  await button('Back to campus').click();
  for(const door of [central,library,...audit.doors.filter(d=>['glass','laurence'].includes(d.id))])await lookAtFacade(door);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.keyboard.press('m');
  await button('Notes').click();
  page.once('dialog',dialog=>dialog.accept());
  const reloaded=page.waitForNavigation({waitUntil:'domcontentloaded'});
  await button('Clear this semester’s progress').click();
  await reloaded;
  await page.waitForFunction(()=>window.__artsGeo?.ready);
  assert.deepEqual((await state()).chapterDone,[]);
  assert.equal(await panelTitle(),'Your story so far');
  assert(await page.locator('#arrival').isHidden());
  assert.deepEqual(errors,[]);
  console.log('PASS: animated arrival, W/S, underpass, '+segments+
    ' walked segments, eight entrances, full semester and two reflections, Form A, phone, resizing and save/resume/reset.');
} catch(error) {
  if(errors.length)console.error(errors);
  throw error;
} finally {
  await browser.close();
}
