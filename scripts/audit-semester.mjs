import { readFileSync, writeFileSync } from 'node:fs';
import { nodes, chapters, places, leads, base } from '../geo/assets/semester/source.mjs';
import { locationNames, physicalPlace, scenePlace } from '../geo/assets/semester/locations.mjs';

const archived = readFileSync(new URL('../story/index.html', import.meta.url), 'utf8')
  .split('const nodes = {')[1].split('function openNode(id)')[0];
const archivedIds = [...archived.matchAll(/^\s{6}(\w+):\s*\{/gm)].map(m => m[1]);
const baseline = { support1:'support1', missing1:'cian1', path1:'saoirse1',
  routeMissingStart:'cian1', routeMissingAdviser:'adviser1', routeMissingSupport:'support1',
  routeMissingFinal:'adviserReturn', routeExplorationStart:'saoirse1',
  routeExplorationAdviser:'adviserSecond', routeExplorationSchool:'lecturer1',
  routeExplorationFinal:'saoirseWrap', ch1a:'induction1', fa1:'inductionAdviser',
  faDone:'inductionPreferenceRecorded', ch2c:'friday' };
const chapterEntry = Object.fromEntries(chapters.map(c=>[c.scene,c.id]));
const appTargets = {practiceTimetable:'Timetable',practiceForm:'Advising'};
const terminal = new Set(['hub','ending','practiceTimetable','practiceForm']);
const roots = [...new Set([...chapters.map(c => c.scene), ...places.map(p => p.scene),
  ...Object.values(leads), 'revisit'])];
const visited = new Set();
function visit(id) {
  if (!nodes[id] || visited.has(id)) return;
  visited.add(id);
  for (const option of nodes[id].options) {
    visit(option.to);
    visit(option.effect?.referral?.scene);
  }
}
roots.forEach(visit);
const linked = new Set(Object.values(nodes).flatMap(n => n.options.flatMap(o =>
  [o.to, o.effect?.referral?.scene])).filter(Boolean));
const expanded = roots.concat('week3');
const unreachableInSource = Object.keys(nodes).filter(id => !visited.has(id));
visit('week3');
function value(v) {
  return typeof v === 'function'
    ? { expression:v.toString(), defaultValue:v(base) }
    : v ?? null;
}
const records = Object.entries(nodes).map(([id, node]) => ({
  id, title:node.title, sourcePlace:value(node.place), physicalPlace:scenePlace(id,node,base),
  location:locationNames[scenePlace(id,node,base)], speaker:value(node.speaker), text:value(node.text),
  stateReads:[...new Set([node.place,node.speaker,node.text].filter(v=>typeof v==='function')
    .flatMap(fn=>Array.from(fn.toString().matchAll(/\bs\.(\w+(?:\??\.\w+)*)/g),m=>m[1])))],
  entryCondition:id==='week3'?'Week 4 or later':Object.hasOwn(chapterEntry,id)
    ? 'Previous guided chapters completed' : 'Choice, optional campus case or active referral',
  choices:node.options.map(o=>({
    label:o.label,to:o.to,condition:null,effects:o.effect??null,
    destination:o.effect?.referral?physicalPlace(o.effect.referral.place):nodes[o.to]?scenePlace(o.to,nodes[o.to],base):null,
    app:id==='routeMissingStart'&&o.to==='practiceTimetable'?'Planner (then resume case)':appTargets[o.to]??null,
  })),
  chapterEnd:node.chapterEnd??null, ending:node.options.some(o=>o.to==='ending'),
  before:baseline[id]?'partially implemented':'missing', comparableLegacyNode:baseline[id]??null,
  after:'implemented', reachable:visited.has(id),
  navigation: id==='revisit'?'Location varies with the selected encounter':scenePlace(id,node,base),
  phone:node.options.some(o=>o.effect?.message||o.effect?.appointment||o.effect?.referral||o.to.startsWith('practice'))||
    ['ch1a','ch2c','ch5a','exploreProfile','prepRecord','ch1b','ch1c'].includes(id),
}));
const broken = [...linked].filter(id => !nodes[id] && !terminal.has(id));
if (broken.length || records.some(row=>!row.reachable||!row.location)) throw Error('Unresolved graph audit');
const audit = { source:'First_Semester_An_Arts_Story_Playable_v1_3.html',
  count:records.length, canonicalRoots:roots, integratedRoots:expanded,
  broken, unreachableInSource, archivedIds, records };
writeFileSync(new URL('../docs/narrative-audit.json', import.meta.url), JSON.stringify(audit,null,2)+'\n');
console.log({canonical:records.length, archived:archivedIds.length, partial:records.filter(r=>r.before==='partially implemented').length, broken, unreachableInSource});
