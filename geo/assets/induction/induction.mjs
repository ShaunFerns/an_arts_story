import {dialogueCopy, huntStops, timetable} from './dialogue.mjs';

export const places = {
  east: {name:'East Quad', landmark:'East Quad'},
  rathdown: {name:'Student Hub', landmark:'Rathdown House'},
  lower: {name:'Students’ Union', landmark:'Lower House'},
  glass: {name:'Glassmanogue gym', landmark:'Glassmanogue'},
  laurence: {name:'St Laurence’s', landmark:'St Laurence’s'},
  library: {name:'Academic Hub & Library', landmark:'Academic Hub & Library'},
};

export const characters = {
  induction: {place:'east', name:'Bríd · Arts induction', offset:[2.1,1.2]},
  adviser: {place:'east', name:'Dr Aoife Byrne · academic adviser', offset:[-2.8,1.5]},
  sustainability: {place:'east', name:'Sustainability team', offset:[11.8,8.5]},
  cian: {place:'east', name:'Cian · fellow student', offset:[5.4,4]},
  lecturer: {place:'east', name:'Róisín · subject lecturer', offset:[7.5,1.8]},
  support: {place:'rathdown', name:'Niamh · Student Hub', offset:[-.8,0]},
  union: {place:'lower', name:'Students’ Union representative', offset:[.8,0]},
  saoirse: {place:'lower', name:'Saoirse · classmate', offset:[-3.5,0]},
  gym: {place:'glass', name:'Gym staff', offset:[.8,0]},
};

const missions = {
  welcome: {npc:'induction', node:'induction1', objective:'Walk from Broadstone–University to East Quad and meet Bríd.'},
  preferences: {npc:'adviser', node:'inductionAdviser', objective:'Speak with Dr Aoife Byrne outside East Quad about Semester 1.'},
  joinHunt: {npc:'sustainability', node:'huntStart', objective:'Join the sustainability team in the East Quad forecourt.'},
  hunt: {npc:'induction', objective:'Explore the five scavenger-hunt stops in any order.'},
  friday: {npc:'induction', node:'friday', objective:'Continue to the Friday timetable publication.'},
  cian: {npc:'cian', node:'cian1', objective:'Find Cian outside East Quad and look at his timetable question.'},
  cianAdviser: {npc:'adviser', node:'adviser1', objective:'Ask Dr Byrne how Cian’s timetable relates to his academic options.'},
  cianSupport: {npc:'support', node:'support1', objective:'Find Niamh at the Student Hub in Rathdown House.'},
  cianReturn: {npc:'adviser', node:'adviserReturn', objective:'Take the clarified question back to Dr Byrne.'},
  cianWrap: {npc:'adviser', node:'wrapUp', objective:'Finish Cian’s advising discussion at East Quad.'},
  saoirse: {npc:'saoirse', node:'saoirse1', objective:'Meet Saoirse near the Students’ Union at Lower House.'},
  lecturer: {npc:'lecturer', node:'lecturer1', objective:'Ask Róisín outside East Quad about the subject and prerequisites.'},
  saoirseReturn: {npc:'adviser', node:'adviserSecond', objective:'Discuss the new interest with Dr Byrne outside East Quad.'},
  complete: {objective:'Both advising cases are complete. You can keep exploring Grangegorman.'},
};

const fallbackNodes = {induction:'inductionWaiting', cian:'cianWaiting', saoirse:'saoirseWaiting',
  lecturer:'lecturerWaiting', union:'unionTalk', gym:'gymTalk'};
const tabs = ['map','hunt','fieldnotes','timetable','formA','casefile'];
const labels = {map:'Campus map', hunt:'Scavenger hunt', fieldnotes:'Field notes',
  timetable:'Timetable', formA:'Advising record', casefile:'Cian’s case file'};
const preferences = [
  ['Media and design','Creative practice'],
  ['Music','Culture and society'],
  ['Society and culture','History'],
  ['Broad exploration','Several possible subject areas'],
];

export function createInduction({storage, saveKey, ui}) {
  const freshState = () => ({
    stage:'welcome', node:'intro', huntDone:[], huntEvidence:{}, huntTarget:null,
    formA:{interests:[], constraints:'', followUp:''}, timetablePublished:false,
    caseChecked:false, chosenResponse:null, decisions:{}, notes:[],
  });
  let saved;
  try { saved=JSON.parse(storage.getItem(saveKey)); } catch {}
  const state = Object.assign(freshState(), saved?.story);
  if (!Object.hasOwn(missions,state.stage)) Object.assign(state,freshState());
  let tab='map';
  let returnNode=null;
  const persist = () => {
    try { storage.setItem(saveKey,JSON.stringify({story:state, pose:ui.pose()})); }
    catch { ui.saveUnavailable(); }
  };
  const nextStop = () => huntStops.find(stop=>stop.id===state.huntTarget && !state.huntEvidence[stop.id])
    || huntStops.find(stop=>!state.huntEvidence[stop.id]);
  const huntSummary = () => {
    const tags=Object.values(state.huntEvidence).map(entry=>entry.tag);
    if (tags.some(tag=>['people','belonging','voice'].includes(tag))) return 'You noticed the ways people connect and look after one another, as well as where the buildings are.';
    if (tags.some(tag=>['study','support','roles'].includes(tag))) return 'You paid attention to where students can find help and where they can work independently.';
    return 'You have started to connect the spaces, routes and older buildings into a campus you can navigate.';
  };

  const copy = dialogueCopy(state,{places,currentHuntStop:nextStop,huntSummary});
  copy.friday = {
    speaker:'Programme Operations', title:'Friday before teaching begins',
    text:'Your initial Semester 1 timetable is now available. It reflects module availability, capacity, programme requirements and your preferences. Contact the programme team for allocation questions.\n\nThis is an illustrative timetable for the game. It contains no live TU Dublin registration or module availability.',
    choices:['Open my timetable','Find Cian outside East Quad'],
  };
  copy.constraints = {
    speaker:copy.inductionAdviser.speaker, title:'Any constraints to record?',
    text:'Would you like to record a timetable or other practical constraint for your Semester 1 planning?',
    choices:['Save and continue','Continue without recording a constraint'],
  };

  function waypoint() {
    if (state.stage==='hunt' && nextStop()) return nextStop().id;
    return characters[missions[state.stage].npc]?.place;
  }
  function objective() {
    if (state.stage==='cianAdviser' && state.chosenResponse==='swap')
      return 'Check with Dr Byrne whether Stage 1 exploration means registered modules can be changed freely.';
    if (state.stage==='lecturer' && state.decisions.saoirse1===1)
      return 'Check the subject sequence with Róisín before assuming a current module can be exchanged.';
    if (state.stage==='saoirseReturn' && state.decisions.lecturer1===1)
      return 'Check with Dr Byrne how to preserve possible options for the new interest.';
    if (state.stage!=='hunt') return missions[state.stage].objective;
    if (!nextStop()) return 'Return to Bríd at East Quad with your five field notes.';
    return `${state.huntDone.length} of 5 stops explored. Next waypoint: ${places[nextStop().id].name}. Choose any stop on the map.`;
  }
  function transition(stage) {
    state.stage=stage;
    ui.refresh(true);
  }
  function close() {
    state.node=null;
    ui.hideDialogue();
    persist();
  }
  function phone(which=tab) {
    returnNode=state.node;
    ui.hideDialogue();
    tab=which;
    ui.openPhone();
    persist();
  }
  function resumePhone() {
    const node=returnNode;
    returnNode=null;
    if (node) open(node);
  }
  function advance(stage) { transition(stage); close(); }
  const branches = new Set(['cian1','adviser1','support1','saoirse1','lecturer1']);
  const actions = {
    intro: [close],
    induction1: [()=>advance('preferences')],
    inductionAdviser: preferences.map(interests=>()=>{state.formA.interests=[...interests];open('constraints');}),
    constraints: [
      ()=>{state.formA.constraints=ui.constraint().trim();open('inductionPreferenceRecorded');},
      ()=>{state.formA.constraints='';open('inductionPreferenceRecorded');},
    ],
    inductionPreferenceRecorded: [()=>advance('joinHunt')],
    huntStart: [()=>advance('hunt'),()=>{advance('hunt');phone('hunt');}],
    huntKeepGoing: [close,()=>phone('map')],
    huntFeedback: [()=>phone('hunt'),close],
    huntFinish: [()=>{
      state.timetablePublished=true;
      transition('friday');
      open('friday');
    }],
    friday: [()=>{advance('cian');phone('timetable');},()=>advance('cian')],
    cian1: [
      ()=>{state.chosenResponse='check';transition('cianAdviser');open('cian2');},
      ()=>{state.chosenResponse='swap';transition('cianAdviser');open('cian2');},
      ()=>phone('casefile'),
    ],
    cian2: [close,()=>phone('map')],
    adviser1: [
      ()=>{transition('cianSupport');open('adviser2');},
      ()=>{transition('cianSupport');open('adviser2');},
    ],
    adviser2: [close,()=>phone('map')],
    support1: [
      ()=>{state.formA.followUp='Review the timetable and ask what it means for future pathway options before requesting any change.';transition('cianReturn');open('support2');},
      ()=>{transition('cianReturn');open('support2');},
    ],
    support2: [close,()=>phone('map')],
    adviserReturn: [
      ()=>{transition('cianWrap');open('wrapUp');phone('timetable');},
      ()=>{transition('cianWrap');open('wrapUp');phone('formA');},
      ()=>{transition('cianWrap');open('wrapUp');},
    ],
    wrapUp: [()=>advance('saoirse'),()=>phone('map')],
    saoirse1: [
      ()=>{transition('lecturer');open('saoirse2');},
      ()=>{transition('lecturer');open('saoirse2');},
    ],
    saoirse2: [close,()=>phone('map')],
    lecturer1: [
      ()=>continueFromLecturer('A new interest may shape a Major, Minor or SAR decision. Check sequencing and prerequisites before promising a module change.'),
      ()=>continueFromLecturer('Enjoying a taster class does not confirm capacity, registration or a future pathway.'),
    ],
    lecturer2: [close,()=>phone('map')],
    adviserSecond: [()=>{
      state.formA.followUp='Check pathway requirements for the new subject while continuing with current modules.';
      state.formA.newInterest=['Media','Music','Irish culture'];
      transition('complete');open('saoirseWrap');
    }],
    saoirseWrap: [close,()=>phone('formA')],
    cianWaiting: [()=>addNote('Met Cian during induction. Other students are exploring different subjects too.')],
    saoirseWaiting: [()=>addNote('Met Saoirse and other students near Lower House. Our interests overlap in unexpected ways.')],
    unionTalk: [()=>{remember('Lower House has Students’ Union facilities and shared spaces; Glassmanogue has the gym.');open('unionNext');},close],
    gymTalk: [()=>addNote('Glassmanogue: gym and fitness facilities, near St Laurence’s.')],
  };

  function remember(note) { if (!state.notes.includes(note)) state.notes.push(note); }
  function addNote(note) { remember(note); close(); }
  function continueFromLecturer(note) {
    remember(note);transition('saoirseReturn');open('lecturer2');
  }
  function open(id) {
    const node=copy[id];
    if (!node) return;
    state.node=id;
    const stop=id==='huntQuestion'?nextStop():null;
    const choices=stop
      ? stop.observations.map(observation=>({text:observation.label,select:()=>{
          state.huntDone.push(stop.id);
          state.huntEvidence[stop.id]=observation;
          state.huntTarget=null;
          ui.refresh(true);
          open('huntFeedback');
        }}))
      : node.choices.map((text,index)=>({text,select:()=>{
          if (branches.has(id) && index<2) state.decisions[id]=index;
          (actions[id]?.[index]||close)();
        }}));
    ui.showDialogue({...node,text:typeof node.text==='function'?node.text():node.text,choices,
      constraints:id==='constraints'?state.formA.constraints:null});
    persist();
  }
  function nodeFor(npc) {
    const mission=missions[state.stage];
    if (npc===mission.npc) {
      if (state.stage==='hunt') return nextStop()?'huntKeepGoing':'huntFinish';
      return mission.node;
    }
    if (npc==='cian' && state.timetablePublished) return null;
    if (npc==='saoirse' && ['lecturer','saoirseReturn','complete'].includes(state.stage)) return null;
    return fallbackNodes[npc];
  }
  function observe(id) {
    if (!stopAvailable(id)) return;
    state.huntTarget=id;
    open('huntQuestion');
  }
  function stopAvailable(id) {
    return state.stage==='hunt' && huntStops.some(stop=>stop.id===id) && !state.huntEvidence[id];
  }
  function selectStop(id) {
    if (!stopAvailable(id)) return;
    state.huntTarget=id;
    tab='map';
    ui.refresh(true);
    persist();
  }
  function setTab(which) { tab=which; ui.refresh(false); }
  function phoneContent() {
    const preferred=state.formA.interests.join(' and ');
    const notes=['fieldnotes','hunt'].includes(tab) ? huntStops.flatMap(stop=>{
      const entry=state.huntEvidence[stop.id];
      if (tab==='fieldnotes' && !entry) return [];
      return [{title:places[stop.id].name,text:entry?.note||stop.clue,
        button:stopAvailable(stop.id)?{text:'Set waypoint',select:()=>selectStop(stop.id)}:null}];
    }) : [];
    switch (tab) {
      case 'hunt': {
        const text=state.huntDone.length===huntStops.length
          ? 'All five field notes are saved.'
          : state.stage==='hunt'?'Choose your own route. Stop nearby and press E to record an observation.'
          : 'The scavenger hunt begins after your first advising conversation.';
        return [{title:`${state.huntDone.length} of 5 places explored`,text},...notes];
      }
      case 'fieldnotes': return [...(notes.length?notes:[{text:'Your observations from the scavenger hunt will appear here.'}]),...state.notes.map(text=>({text}))];
      case 'timetable': return state.timetablePublished
        ? [{title:'Semester 1 · illustrative timetable',text:'Published by Programme Operations on Friday. This fictional example contains no live TU Dublin module availability or registration.'},
          {title:'Preferences from induction',text:preferred},
          ...timetable.map(row=>({title:`${row.code} · ${row.name}`,text:`${row.day} · ${row.time} · ${row.place}` }))]
        : [{title:'Awaiting publication',text:'Programme Operations will publish the initial timetable on the Friday before classes.'}];
      case 'formA': return preferred
        ? [{title:'Indicative Semester 1 interests',text:preferred},
          {title:'Constraints',text:state.formA.constraints||'None recorded.'},
          ...(state.formA.newInterest?[{title:'Interest explored in the second advising case',text:state.formA.newInterest.join(', ')}]:[]),
          {title:'Follow-up',text:state.formA.followUp||'Review the published timetable and discuss possible pathways with your adviser.'}]
        : [{text:'Your interests will appear here after your first advising conversation.'}];
      case 'casefile': return !state.timetablePublished || state.stage==='friday'
        ? [{text:'This case opens after Programme Operations publishes the first timetables.'}]
        : [{title:'Cian’s ranked preference list',text:'Ranked highly · The subject Cian hoped to study.'},
          {title:'Screenshot of Cian’s current timetable',text:'No class entry · The subject Cian ranked highly.'},
          {title:'What Cian remembers',text:'He attended a taster session and is wondering whether that tells him anything about his registration.'},
          {title:'Your investigation',text:state.caseChecked?'You compared Cian’s ranked preference and published timetable. Programme Operations can check his formal record.':'Compare what Cian hoped to study with what appears on the current timetable.',
            button:state.caseChecked?null:{text:'Compare the details and save a note',select:()=>{
              state.caseChecked=true;
              remember('Cian: a ranked preference is not the same as a module appearing in the current build. Confirm the exact record with Programme Operations.');
              ui.refresh(false);persist();
            }}}];
      default: return [];
    }
  }

  return {
    get savedPose(){return saved?.pose;},
    get stage(){return state.stage;},
    get snapshot(){return structuredClone(state);},
    start(){if (state.node) open(state.node);},
    objective, waypoint, get targetCharacter(){return missions[state.stage].npc;},
    persist, close, resumePhone, phoneContent, stopAvailable, nodeFor, observe, selectStop,
    talk(npc){open(nodeFor(npc));},
    get tab(){return tab;},
    tabs, labels, setTab,
  };
}
