import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createProgress, encounters } from '../geo/assets/semester/progress.mjs';
import { chapters, nodes, modules, degreeMarkup } from '../geo/assets/semester/source.mjs';

const audit=JSON.parse(readFileSync(new URL('../docs/narrative-audit.json',import.meta.url),'utf8'));
assert.equal(Object.keys(nodes).length,156);
assert.equal(audit.count,156);
assert.deepEqual(audit.broken,[]);
assert.deepEqual(audit.unreachableInSource,['week3','week3End']);
assert(audit.records.every(record=>record.reachable&&record.location&&record.after==='implemented'));
const canFinish=new Set(['hub','ending','practiceTimetable','practiceForm']);
let count=0;
while(canFinish.size!==count){
  count=canFinish.size;
  for(const [id,node] of Object.entries(nodes))
    if(node.options.some(o=>canFinish.has(o.effect?.referral?.scene??o.to)))canFinish.add(id);
}
assert.deepEqual(Object.keys(nodes).filter(id=>!canFinish.has(id)),[]);

const flagsWritten = new Set(['revisitPlace']);
for(const node of Object.values(nodes))for(const option of node.options)
  for(const flag of Object.keys(option.effect?.flag??{}))flagsWritten.add(flag);
for(const record of audit.records)for(const read of record.stateReads)
  if(read.startsWith('flags.'))assert(flagsWritten.has(read.split('.')[1]),read+' read by '+record.id);

const chapterCoverage=new Set();
function resume(game) {
  if (game.state.pending) {
    const target=game.task();
    assert(target?.place,target?.id||'No destination');
    assert.equal(game.enter('unrelated'),false);
    assert(game.enter(target.place));
  }
}
function finishGuided(chooseIndex) {
  let game=createProgress();
  assert.equal(game.state.messages.length,0);
  game.begin('Aisling');
  assert.equal(game.state.messages.length,1);
  for(let count=0;count<100;count++){
    resume(game);
    if(game.state.current==='ending')return game;
    const node=game.current;
    assert(node,game.state.current);
    const id=game.state.current;
    chapterCoverage.add(id);
    // Reopen a scene from serialized progress without resending messages.
    if(id==='ch2c'){
      const messages=game.state.messages.length;
      game=createProgress(JSON.parse(JSON.stringify(game.state)));
      assert.equal(game.state.current,'ch2c');
      assert.equal(game.state.messages.length,messages);
      assert.equal(game.state.messages.filter(m=>m.id==='scene:ch2c').length,1);
    }
    const result=game.choose(chooseIndex(id,node));
    if(id==='faDone'){
      assert(['timetable','formA'].includes(result));
      assert.equal(game.timetable.length,6);
      assert.equal(new Set(game.timetable).size,6);
      assert.notEqual(modules[game.timetable[2]].day,modules[game.timetable[3]].day);
    }
  }
  assert.fail('Guided story failed to reach the reflection');
}
const direct=finishGuided(()=>0);
const exploratory=finishGuided((id,node)=>node.options.length-1);
for(const game of [direct,exploratory]){
  assert.deepEqual(game.state.chapterDone,chapters.map(c=>c.id));
  assert.equal(game.state.completion,'ch6c');
  assert.equal(game.state.flags.guidedFinished,true);
  assert(!game.task(),'Completed story retains a stale destination');
  assert(game.state.visited.includes('rathdown'));
}
assert.notDeepEqual(direct.timetable,exploratory.timetable);
assert.match(degreeMarkup(direct.state),/240 ECTS/);
assert.notEqual(direct.state.flags.past,exploratory.state.flags.past);
assert.equal(direct.state.messages.filter(m=>m.id==='scene:ch2c').length,1);

const optionalCoverage=new Set();
let edges=0;
const fullState=structuredClone(direct.state);
function openCampus(entry,direct) {
  const game=createProgress(structuredClone(fullState));
  game.leave();
  assert(game.schedule(entry,direct));
  resume(game);
  return game;
}
// Explore each scene from each reachable choice path. Deduplicate repeated nodes
// after exercising their inbound and outbound transitions.
function walk(start) {
  const queue=[start], seen=new Set();
  while(queue.length){
    const game=queue.shift(),id=game.state.current;
    if(id==='ending'){
      assert(['week3End','ch6c'].includes(game.state.completion));
      continue;
    }
    if(!game.current||seen.has(id))continue;
    seen.add(id);
    optionalCoverage.add(id);
    for(const [i,option] of game.current.options.entries()){
      const branch=createProgress(structuredClone(game.state));
      const before=branch.state.messages.length;
      assert(branch.choose(i),id);
      if(option.effect?.referral){
        const r=option.effect.referral;
        assert.equal(branch.task().place,r.place);
        assert.equal(branch.task().id,r.scene);
        assert(branch.state.messages.some(m=>m.scene===r.scene));
        assert(branch.state.messages.length>=before);
        const previousPlace=game.location;
        if(previousPlace!==r.place)assert.equal(branch.enter(previousPlace),false);
      }
      if(branch.state.pending)resume(branch);
      if(option.effect?.referral)assert.equal(branch.state.referral,null);
      edges++;
      queue.push(branch);
    }
  }
}
for(const entry of encounters){
  walk(openCampus(entry,true));
  if(entry.lead)walk(openCampus(entry,false));
}
const revisitProgress=createProgress({...structuredClone(fullState),done:['missing']});
revisitProgress.leave();
assert(revisitProgress.schedule(encounters.find(entry=>entry.id==='central')));
resume(revisitProgress);
assert.equal(revisitProgress.state.current,'revisit');
walk(revisitProgress);
const allCoverage=new Set([...chapterCoverage,...optionalCoverage]);
assert.deepEqual(Object.keys(nodes).filter(id=>!allCoverage.has(id)),[]);
const week3=openCampus(encounters.find(e=>e.id==='week3'),true);
assert(week3.choose(1)&&week3.choose(0));
assert.equal(week3.state.completion,'week3End');
week3.leave();
assert(!week3.task());
assert.equal(week3.state.messages.length,new Set(week3.state.messages.map(m=>m.id)).size);

const earlier = createProgress();
earlier.begin();
earlier.choose(0);earlier.choose(0);
assert.equal(earlier.state.week,1);
assert(!earlier.schedule(encounters.find(e=>e.id==='preparation')));
assert.equal(earlier.task().id,'welcomePaul');
assert.equal(earlier.task().meeting,'welcome');
assert(earlier.enter('east'));
assert(earlier.choose(1));
assert.equal(earlier.state.flags.welcomeConcern,'subjects');
assert(earlier.choose(0));
assert.equal(earlier.task().id,'ch1a');
assert.equal(earlier.state.pending,'ch1a');
assert.equal(earlier.task().speaker,'Julie · Academic Adviser');
assert(direct.state.trailNotes.bradogue);
assert(direct.recordTrail('printmaking',0));
assert(!direct.recordTrail('printmaking',1));
const trailSave=createProgress(JSON.parse(JSON.stringify(direct.state)));
assert.equal(trailSave.state.trailNotes.printmaking,direct.state.trailNotes.printmaking);
console.log('PASS: 156 scenes reached, '+edges+' case choices traversed, two guided profiles and both reflections tested.');
