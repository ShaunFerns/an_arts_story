import { nodes, chapters, places, leads, base, makeModules, missionInfo } from './source.mjs';
import { locationNames, scenePlace } from './locations.mjs';

const chapterWeeks = [0, 1, 2, 4, 6, 9, 12];
const phoneDestinations = { practiceTimetable:'timetable', practiceForm:'formA' };
export const encounters = [
  ...places.map(p=>({ id:p.id, title:missionInfo[p.mission], start:p.scene,
    lead:leads[p.mission], week:{formA:1,missing:2,pathway:2,workload:2,support:4,
      belonging:4,assessment:6,timetable:2,exploration:4,preparation:9}[p.mission] })),
  {id:'week3',title:'Earlier choices return',start:'week3',week:4},
];
const announcements = {
  ch1a: ['BA Arts', 'The welcome and first advising conversation are at Central Quad.'],
  ch2c: ['Timetable update · practice', 'Check the latest published timetable. A Tuesday seminar has moved and a Friday workshop has been added.'],
  ch5a: ['Academic Advising', 'Bring your timetable, the interests you want to explore and any questions you have.'],
};
const sceneTitle = id => nodes[id]?.title ?? id;
const unique = (arr,item) => { if (!arr.includes(item)) arr.push(item); };

export function newSemester() {
  return {...structuredClone(base), current:null, pending:null, started:false, mode:'semester',
    arrivalSeen:false, visitedScenes:[], received:[], readMessages:0, activeChapter:null,
    completion:null, within:null, selectedEncounter:null};
}

export function createProgress(saved, onChange = () => {}) {
  const state = {...newSemester(), ...saved};
  function deliver(id, from, body, scene = null) {
    if (state.received.includes(id)) return;
    state.received.push(id);
    state.messages.unshift({id, from, body, scene});
  }
  function apply(effect = {}, id) {
    if (effect.clearReferral) state.referral = null;
    if (effect.referral) {
      state.referral = {...effect.referral};
      const r = state.referral;
      deliver('referral:'+r.id, r.contact, r.why + ' · ' + locationNames[r.place], r.scene);
    }
    if (effect.appointment) {
      state.appointmentBooked = true;
      deliver('appointment', 'Academic advising · practice appointment',
        'Meet Dr Aoife Byrne at Central Quad.', 'exploreMeeting');
    }
    if (effect.flag) Object.assign(state.flags, effect.flag);
    if (effect.form) {
      Object.assign(state.formA, effect.form);
      if (effect.form.interest) unique(state.formA.interests,effect.form.interest);
      if (effect.form.completed) state.formA.modules = makeModules(state.formA);
    }
    if (effect.note) unique(state.notes, effect.note);
    if (effect.contact) unique(state.contacts, effect.contact);
    if (effect.message) deliver('choice:'+id,...effect.message);
    if (effect.done) unique(state.done,effect.done);
  }
  const placeFor = id => nodes[id] ? scenePlace(id,nodes[id],state) : null;
  const task = () => {
    const id = state.current && nodes[state.current] ? state.current : state.pending;
    const place = placeFor(id);
    return place ? {id,place,title:sceneTitle(id),detail:state.referral?.why} : null;
  };
  function at(id,place) {
    state.current = id;
    state.pending = null;
    state.within = place;
    unique(state.visited,place);
    unique(state.visitedScenes,id);
    if (announcements[id]) deliver('scene:'+id,...announcements[id]);
  }
  function travel(id, place = null) {
    const destination = placeFor(id);
    if (!destination) throw Error('Unknown semester scene: '+id);
    state.current = null;
    state.pending = id;
    state.within = null;
    if (place === destination) at(id,place);
  }
  function queueChapter() {
    const next = chapters.find(c=>!state.chapterDone.includes(c.id));
    if (!next) return;
    state.chapter = next.id;
    state.activeChapter = next.id;
    travel(next.scene);
  }
  function begin(name = 'Aisling', place = 'luas') {
    if (state.started) return;
    state.name = String(name).trim().slice(0,30)||'Aisling';
    state.started = true;
    state.activeChapter = 0;
    deliver('welcome','BA Arts','Welcome to Grangegorman. Your first semester is in What’s next.');
    travel('ch0a',place);
    onChange();
  }
  function enter(place) {
    if (!state.started || place !== task()?.place) return false;
    if (state.pending) {
      at(state.pending,place);
      if (state.referral?.scene===state.current) {
        unique(state.referralsCompleted,state.referral.id);
        state.referral = null;
      }
    } else state.within = place;
    onChange();
    return true;
  }
  function finishActivity() {
    state.current = null;
    state.within = null;
    state.activeChapter = null;
    state.selectedEncounter = null;
    queueChapter();
  }
  function choose(index) {
    const id = state.current, node = nodes[id], option = node?.options[index];
    if (!option || !state.within) return false;
    apply(option.effect,id+':'+index);
    if(id==='routeMissingStart'&&option.to==='practiceTimetable'){
      onChange();
      return 'planner';
    }
    if (node.chapterEnd===state.activeChapter) {
      unique(state.chapterDone,node.chapterEnd);
      state.week = Math.max(state.week,chapterWeeks[Math.min(node.chapterEnd+1,6)]);
    }
    if (nodes[option.to]) travel(option.to,state.within);
    else if (option.to==='hub' && state.referral) travel(state.referral.scene);
    else if (option.to==='ending') {
      state.within = null;
      state.current = 'ending';
      state.completion = id;
      state.activeChapter = null;
      state.selectedEncounter = null;
    } else finishActivity();
    onChange();
    return phoneDestinations[option.to] || true;
  }
  function leave() {
    if (state.current==='ending') finishActivity();
    else if (state.current) {
      state.pending = state.current;
      state.current = null;
    }
    state.within = null;
    onChange();
  }
  function schedule(entry, direct = false) {
    if (!canExplore() || state.week < entry.week) return false;
    const saved = places.find(p=>p.id===entry.id);
    const revisit = saved && state.done.includes(saved.mission) && !direct;
    if (revisit) state.flags.revisitPlace = saved.id;
    state.activeChapter = null;
    state.selectedEncounter = entry.id;
    travel(revisit?'revisit':direct?entry.start:entry.lead??entry.start);
    onChange();
    return true;
  }
  function canExplore() {
    return state.started && !state.referral && !state.selectedEncounter && !state.current &&
      (state.activeChapter===null || state.pending===chapters[state.activeChapter].scene);
  }
  function pauseEncounter() {
    if (!state.selectedEncounter || state.current) return false;
    state.pending = null;
    state.referral = null;
    finishActivity();
    onChange();
    return true;
  }
  return {state, task, begin, enter, choose, leave, schedule, pauseEncounter,
    setInterest(value) {
      if (!['undecided','creative','computing','culture'].includes(value)) return;
      state.pathwayInterest=value;
      unique(state.notes,'You explored an interest in the practice planner. Your adviser can help you check a viable route.');
      onChange();
    },
    arrivalSeen(){state.arrivalSeen=true;onChange();},
    get current(){return nodes[state.current];},
    get location(){return state.within;},
    get chapter(){return chapters[state.chapter];},
    get timetable(){return state.formA.completed ? state.formA.modules : [];},
    get unread(){return state.messages.length-state.readMessages;},
    readMessages(){state.readMessages=state.messages.length;onChange();},
    get canExplore(){return canExplore();},
  };
}
