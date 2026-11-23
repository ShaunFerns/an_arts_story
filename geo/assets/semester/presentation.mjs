import {campusTrail} from '../story/opening.mjs';
import { degreeMarkup, exitSurveyMarkup, guideMarkup, modules, renderEnding, storyMarkup } from './source.mjs';
import { encounters } from './progress.mjs';
import { locationNames } from './locations.mjs';

export const phoneLabels = {
  map:'Map', next:'What’s next', messages:'Messages', timetable:'Timetable',
  formA:'Advising', planner:'Planner', campus:'Campus', trail:'Field Notes', notes:'Notes',
};

export function presentScene(progress, onChoose) {
  const {state, current:node} = progress;
  const read = value => typeof value==='function'?value(state):value;
  return {
    speaker:read(node.speaker)||'Narrator', title:node.title,
    location:progress.location==='luas'?'The evening before induction · recollection':locationNames[progress.location],
    markup:storyMarkup(read(node.text))+(['ch1b','ch1c'].includes(state.current)?degreeMarkup(state):''),
    choices:node.options.map((o,i)=>({text:o.label,select:()=>onChoose(i)})),
  };
}

export function phoneEntries(progress, actions) {
  const {state} = progress;
  const task = progress.task();
  const button = (text,select) => ({text,select});
  const modulesForInterests = state.formA.interests.map(i=>modules[i]?.title??i);
  switch(actions.tab) {
    case 'next': {
      const current = task ? [{
        title:locationNames[task.place],text:task.detail||task.title,
        button:button('Show on map',actions.map),
      }] : [{
        title:state.started?'Your semester':'Broadstone–University',
        text:state.started?'All seven chapters completed. You can keep exploring.':'Begin your story after the Luas arrives.',
      }];
      return [...current,
        ...(state.started?[{title:progress.chapter?.period,text:state.chapterDone.length+' of 7 chapters completed.'}]:[]),
        ...(state.selectedEncounter&&!state.current?[{button:button('Return to the main story',actions.pause)}]:[]),
        ...(progress.canExplore?[{button:button('See optional campus conversations',()=>actions.tabTo('campus'))}]:[]),
      ];
    }
    case 'campus': {
      const extras=progress.canExplore ? encounters.filter(e=>state.week>=e.week).map(e=>({
        title:e.title, text:e.lead?'Follow a conversation across campus.':'',
        buttons:[button(e.lead?'Follow the conversation':'Find on campus',()=>actions.encounter(e,false)),
          ...(e.lead?[button('Try the original case',()=>actions.encounter(e,true))]:[])],
      })) : [];
      return [
        {title:'Campus orientation', text:'Meet Paul and Julie, then explore the campus trail.',
          button:button('Open campus orientation',actions.orientation)},
        ...extras,
        ...(!progress.canExplore?[{text:'Optional conversations are available between chapters.'}]:[]),
      ];
    }
    case 'messages':
      return state.messages.length ? state.messages.map(m=>({
        title:m.from,text:m.body,
        button:m.scene&&m.scene===task?.id ? button('Show destination',actions.map) : null,
      })) : [{text:'You have no new conversations yet.'}];
    case 'timetable':
      return progress.timetable.length ? [
        {title:'Semester 1 · practice timetable',text:'Six 5 ECTS modules. Example sessions and rooms for the story.'},
        ...(state.visitedScenes.includes('ch2c')?[{title:'Update',text:'The Tuesday seminar moved and a Friday workshop was added to the story’s published timetable. Check the activity details with your lecturer.'}]:[]),
        ...progress.timetable.map(id=>{
          const m=modules[id];
          const revision=state.visitedScenes.includes('ch2c')&&m.day==='Tue';
          return {title:m.title,text:m.day+' '+(revision?'12:00–14:00 · updated':m.start+'–'+m.end)+' · '+m.room};
        }),
        ...(state.visitedScenes.includes('ch2c')?[{title:'Additional workshop',
          text:'Fri 15:00–16:00 · East Quad · example studio'}]:[]),
      ] : [{title:'Awaiting publication',text:'Your practice timetable will be available after the Form A conversation.'}];
    case 'planner': {
      const interests={undecided:'Media Studies / Musicology',creative:'Graphic Design / Musicology',
        computing:'Computer Science / Musicology',culture:'Media Studies / Irish Cultural Studies'};
      return [
        {title:'Practice curriculum planner',text:'BA Arts · fictional student profile'},
        {title:'Possible pathways',text:interests[state.pathwayInterest],
          buttons:Object.entries(interests).map(([id,label])=>button(label,()=>actions.interest(id)))},
        {title:'Current practice build',text:progress.timetable.length
          ? '30 ECTS · '+progress.timetable.map(id=>modules[id].title).join(' · ')
          : 'Complete the first Form A conversation to generate your practice build.'},
        {button:button('Open timetable',()=>actions.tabTo('timetable'))},
        {button:button('Open programme guide',actions.guide)},
      ];
    }
    case 'formA':
      return [
        {title:'Practice Form A',text:state.formA.completed?'Advising record · interests and next steps':'Discuss your interests and practical constraints with your adviser.'},
        ...(state.formA.completed?[
          {title:'Interests',text:modulesForInterests.join(', ')||'Still exploring'},
          {title:'Options discussed',text:'Minor: '+state.formA.minor+' · SAR interests: '+state.formA.sar},
          {title:'Practical constraints',text:state.formA.constraint},
          {title:'Follow-up',text:[state.formA.question,state.formA.followup].filter(Boolean).join(' · ')},
        ]:[]),
        {title:'Programme information',button:button('Read the BA Arts guide',actions.guide)},
      ];
    case 'trail':
      return !state.trailNotes.bradogue
        ? [{title:'Campus trail',text:'Begin at the Bradogue sign after meeting Róisín outside Central Quad.',
          button:button('Show Bradogue on map',()=>actions.map('bradogue'))}]
        : [{title:'Campus trail',text:Object.keys(state.trailNotes).length+' of '+campusTrail.length+' observations saved. Visit the other signs in any order.'},
          ...campusTrail.map(stop=>({title:stop.name,text:state.trailNotes[stop.id]||stop.title,source:stop.source,
            button:button('Show on map',()=>actions.map(stop.id))}))];
    case 'notes':
      return [...(state.notes.length?state.notes.map(text=>({text})): [{text:'Notes from your conversations will appear here.'}]),
        ...(state.contacts.length?[{title:'People you have met',text:state.contacts.join(' · ')}]:[]),
        ...(state.completion?[{button:button('Read your reflection',actions.ending)}]:[]),
        {button:button('Optional private feedback',actions.survey)},
        {button:button('Text size: '+(state.readingMode==='comfortable'?'larger':'standard'),actions.readingMode)},
        {button:button('Clear this semester’s progress',actions.reset)},
      ];
    default: return [];
  }
}

export function resourceMarkup(type,state) {
  const markup=type==='guide'?guideMarkup():type==='survey'?exitSurveyMarkup(state):renderEnding(state);
  return markup.replace(/<button[^>]*(?:onclick=|data-next="hub")[^>]*>.*?<\/button>/g,'');
}
