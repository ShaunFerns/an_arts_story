// Dialogue and field observations adapted from the archived story (story/index.html).
export const huntStops = [
      {id:'rathdown',clue:'Find the Student Hub',prompt:'You reach Rathdown House. What would be most useful to remember?',observations:[
        {label:'Where I would start if I needed help finding a university service',tag:'support',note:'I found a place to ask where to go when a problem does not belong to one lecturer.'},
        {label:'How the Student Hub differs from the people running my programme',tag:'roles',note:'The Student Hub can help me navigate services; programme questions may need the programme team.'},
        {label:'The people arriving here with very different questions',tag:'people',note:'Other students are finding their feet too; asking for help is ordinary.'}]},
      {id:'lower',clue:'Find the Students’ Union',prompt:'Outside Lower House, what catches your attention?',observations:[
        {label:'How a student could find somebody with similar interests',tag:'belonging',note:'The Students’ Union and activities can help students connect in different ways.'},
        {label:'That students have a voice beyond their classes',tag:'voice',note:'Student representation is part of university life, alongside social activities.'},
        {label:'The different ways people spend a gap between classes',tag:'people',note:'Campus life is not only timetabled teaching.'}]},
      {id:'glass',clue:'Discover Glassmanogue',prompt:'You arrive at Glassmanogue. What might matter later in the semester?',observations:[
        {label:'A place to be active and reset between assignments',tag:'wellbeing',note:'I found a place where movement might become part of my weekly routine.'},
        {label:'Something I could try even if I do not know anybody yet',tag:'belonging',note:'Shared activity may be another way into campus life.'},
        {label:'How this building relates to St Laurence’s and Lower House',tag:'places',note:'I can connect the gym with the nearby historic and social spaces.'}]},
      {id:'laurence',clue:'Find St Laurence’s',prompt:'Standing near St Laurence’s, what do you notice?',observations:[
        {label:'Old and new buildings sharing the same campus',tag:'places',note:'Grangegorman includes historic buildings as well as newer teaching spaces.'},
        {label:'People moving through a place that is not a classroom',tag:'people',note:'Learning a campus also means noticing the spaces between classes.'},
        {label:'How the grounds and routes connect different parts of Grangegorman',tag:'sustainability',note:'Walking routes and shared green spaces shape how people experience campus.'}]},
      {id:'library',clue:'Find the Academic Hub & Library',prompt:'The library looks busy. What would you want to come back for?',observations:[
        {label:'A study space for days when I do not have many scheduled classes',tag:'study',note:'My timetable does not show all the study, preparation and assessment work I need to do.'},
        {label:'Help with finding and using academic information',tag:'support',note:'Library resources can help me find and use evidence for assignments.'},
        {label:'A quiet place to work alongside other students',tag:'belonging',note:'I can study independently while still feeling part of university life.'}]}
    ];
export const timetable = [
        { code: 'ARTS 1001', name: 'Arts & Society', day: 'Mon', time: '09:00', place: 'Central Quad' },
        { code: 'MDIA 1002', name: 'Media Forms', day: 'Mon', time: '12:00', place: 'East Quad' },
        { code: 'MUSC 1003', name: 'Listening & Culture', day: 'Tue', time: '11:00', place: 'Academic Hub & Library' },
        { code: 'SPIN 1001', name: 'Mind, Body and Technology', day: 'Wed', time: '10:00', place: 'East Quad' },
        { code: 'WRIT 1001', name: 'Writing & Ideas', day: 'Thu', time: '14:00', place: 'Central Quad' },
        { code: 'SAR 1004', name: 'Sustainability in Practice', day: 'Fri', time: '11:00', place: 'Lower House' },
      ];

export function dialogueCopy(state, {places, currentHuntStop, huntSummary}) {
  return {
    intro: {speaker: "Narrator", title: "Your first morning at Grangegorman",
      text: `You step away from the Luas stop and look out across Grangegorman. The walkways and buildings stretch further than you expected. Students are moving towards East Quad, where the BA Arts induction is taking place.

Today is about getting oriented: meeting other first years, finding out what the university offers, meeting staff and your academic adviser, and learning how to find your way around. The sustainability team has also organised a campus challenge.`,
      choices: ["Find the Arts induction welcome point"]},
    induction1: {speaker: "Bríd · Arts induction", title: "Welcome to BA Arts",
      text: `“Great to see you. Have you met many people yet?” Bríd asks. Nearby, other first years are introducing themselves and comparing what they might enjoy studying.

“Today you'll meet some of the people and services you'll use throughout the year. Take your time getting to know the campus. You will also meet your academic adviser to talk through the subjects and directions that interest you for this first semester.”

“Those conversations help Operations build the initial module allocations and timetables. Your preferences are important, but they're not a guarantee of a place in every subject. The first timetables will be published on the Friday before teaching begins.”

“Your adviser is outside Central Quad. Go and have a chat. Then the sustainability team will help you discover the rest of Grangegorman.”`,
      choices: ["Meet my academic adviser"]},
    inductionAdviser: {speaker: "Dr Aoife Byrne · academic adviser", title: "Which directions interest you?",
      text: `Dr Byrne welcomes you to Arts. “We don't need you to decide on a Major today. I'd like to understand what you'd most like to explore during your first semester, and what options you hope to keep open.”

She explains how the programme's breadth and pathway requirements will shape the choices available. She also asks about any timetable or other constraints you want the team to know about.

You think about which subjects you would place near the top of your initial preference list.`,
      choices: [
        "I am drawn to media, design and creative practice",
        "Music and cultural subjects are catching my attention",
        "I want to explore people, society and history",
        "I have several interests and need help narrowing them",
      ]},
    inductionPreferenceRecorded: {speaker: "Dr Aoife Byrne · academic adviser", title: "Your initial preferences",
      text: ()=>`Dr Byrne records your provisional areas of interest: ${state.formA.interests.join(' and ')}.

“Thank you. This is a starting point for your first-semester planning, not a final Major decision or confirmed module allocation. We'll consider viable combinations, subject availability and any constraints when preparing the timetable.”

She reminds you that Programme Operations will publish initial timetables on the Friday before the first classes, and that you can return to advising as your understanding develops.

Outside East Quad, the sustainability team is gathering students for a challenge. It is a chance to find university services and talk to others while exploring the campus.`,
      choices: ["Join the sustainability team’s scavenger hunt"]},
    huntKeepGoing: {speaker: "Bríd · Arts induction", title: "Keep exploring",
      text: ()=>`“You’re doing well,” Bríd says. “You have ${state.huntDone.length} of five places checked off. Go find the next one, and we’ll see you back here.”`,
      choices: [
        "Back to the hunt",
        "Check the campus map",
      ]},
    huntStart: {speaker: "Sustainability team · induction", title: "The campus is your first challenge",
      text: `“Before we get buried in timetables, we want you to see the place,” says a member of the sustainability team. “Grangegorman is bigger than East Quad, and you’ll use more of it than you think.”

Five places appear on your phone: the Student Hub, the Students’ Union, the gym, St Laurence’s and the library. Pick the order yourself.

At each stop, look around and record something you might want to remember. Everyone will notice different things.`,
      choices: [
        "Start exploring",
        "Look at the scavenger hunt on my phone",
      ]},
    huntQuestion: {speaker: "Sustainability team · scavenger hunt", title: "What do you notice?",
      text: ()=>{const stop=currentHuntStop();return `${places[stop.id].name} — ${stop.prompt}`;},
      choices: []},
    huntTryAgain: {speaker:'Sustainability team · scavenger hunt',title:'Look around',
      text:'The useful detail may be a building, a person, or a route you can remember later.',
      choices:['Choose an observation']},
    induction2: {speaker:'Bríd · Arts induction',title:'The day is underway',
      text:`“There’s a lot to take in,” Bríd says, “but you don't need to remember it all now. Start with the people around you. Cian said he wanted to ask something after induction.”

You hear people leaving for different buildings. The campus has begun to feel less like a map and more like somewhere you might belong.`,
      choices:['Find Cian','Check my phone']},
    defaultTalk: {speaker:'Narrator',title:'A brief encounter',
      text:'People are coming and going between classes. You can return here later, or use your phone to find the next person you need.',
      choices:['Back']},
    huntFeedback: {speaker: "Sustainability team · scavenger hunt", title: "Added to your field notes",
      text: ()=>{const id=state.huntDone[state.huntDone.length-1],note=state.huntEvidence[id];return `${note.note}

${state.huntDone.length<5?'You can choose any of the places you have not visited.':'You have been to all five. Take your field notes back to East Quad.'}`;},
      choices: [
        "Choose my next stop",
        "Continue exploring",
      ]},
    huntFinish: {speaker: "Bríd · Arts induction", title: "Welcome back to East Quad",
      text: ()=>`Bríd looks at your phone. “Five stops. What stayed with you?”

${huntSummary()}

You recognise the route you took, even if someone else might have chosen differently. Bríd asks if you could help another student find one of those places next week. You think you could.

“You'll hear from Operations when the first timetable is ready,” she adds. “Then classes begin. Remember, you can always come back to your adviser with new questions.”`,
      choices: ["Finish induction · move to the Friday before classes"]},
    inductionWaiting: {speaker: "Bríd · Arts induction", title: "Arts induction",
      text: "Bríd points towards the East Quad entrance. “You’re right where you need to be. Talk to the others, get your bearings and ask whatever you need to.”",
      choices: ["Back to campus"]},
    cianWaiting: {speaker: "Cian · fellow student", title: "Someone else finding their way",
      text: "“Are you new to Arts too?” Cian asks. “I’m trying to remember everyone’s names and work out where everything is. I’ve picked some subjects I’d really like to try, but we won’t see our first timetables until the Friday before classes.” He smiles. “Good to know I’m not the only one figuring it out.”",
      choices: ["Introduce yourself and compare interests"]},
    cian1: {speaker: "Cian · fellow student", title: "The missing module",
      text: `“I thought I had this sorted,” Cian says, turning his phone towards you. “One of the subjects I ranked highly just isn’t there. I keep hearing that Stage 1 is exploratory, so I assumed I could swap things around once I saw the timetable.”

He isn't panicking, but you can tell he is worried. He shows you his list of preferences and a screenshot of his timetable. You're not yet sure what either one proves.`,
      choices: [
        "“Let’s not assume the timetable is wrong. We should ask what is missing and why.”",
        "“If Stage 1 is exploratory, maybe you can just pick something else now.”",
        "Look at Cian’s preference and timetable before deciding",
      ]},
    cian2: {speaker: "Cian · fellow student", title: "First step: ask the right question",
      text: `You and Cian agree to find out what the timetable represents, rather than assuming it is wrong. You already know that one conversation won't change module registration.

Dr Aoife Byrne is outside Central Quad. Go over and ask how the current position connects to future pathways.`,
      choices: [
        "Go and find Dr Byrne",
        "Open my phone and review the mission",
      ]},
    adviser1: {speaker: "Dr Aoife Byrne · academic adviser", title: "What do you actually know?",
      text: ()=>`Dr Byrne turns the question back to you. “What have you checked so far?”

${state.caseChecked?'You can tell her what Cian ranked and what appears in the current timetable. She nods. “That gives us something specific. We still need the programme team to confirm the formal record.”':'You realise that you cannot yet say whether Cian was allocated the module. Dr Byrne asks you to compare the preference and timetable carefully before assuming anything changed.'}

“Stage 1 is a chance to explore,” she says, “but not every possible route has the same sequence, prerequisites or available places. We can discuss the academic implications while programme operations checks the formal position.”`,
      choices: [
        "“So the next step is to check the current build and the registration side?”",
        "“Couldn’t you just tell him what to take?”",
      ]},
    adviser2: {speaker: "Dr Aoife Byrne · academic adviser", title: "Different roles, different answers",
      text: `“I can help with the pathway question,” Dr Byrne says, “but programme operations must confirm any registration or allocation issue. Let's make sure Cian knows where to raise that.”

She suggests Rathdown House, where the Student Hub can point you to the correct service. Then you can return to advising with a clearer question about future choices.`,
      choices: [
        "Go to Rathdown House",
        "Open the phone first",
      ]},
    support1: {speaker: "Niamh · Student Hub", title: "Finding the right route",
      text: `Niamh listens at the Student Hub. “There are a few different questions here,” she says. “Your current timetable, the module allocation or registration record, and what you hope to study later aren't exactly the same thing.”

She points you towards the programme team for a formal allocation or registration check, while explaining that an academic adviser can help with pathway implications. The Student Hub can help you find the appropriate route, but it doesn't change your modules. You make a note of the questions to take back to advising.`,
      choices: [
        "“So we should ask programme operations about the record and advising about the pathway.”",
        "“So the Student Hub can help us find the right people.”",
      ]},
    support2: {speaker: "Niamh · Student Hub", title: "One step at a time",
      text: "You leave Rathdown House knowing which queries belong to programme operations and which belong to academic advising. Nothing has been altered on a student record. But you now know what to ask, and whom to ask.",
      choices: [
        "Go back to Dr Byrne",
        "Open my phone",
      ]},
    adviserReturn: {speaker: "Dr Aoife Byrne · academic adviser", title: "Your advising record and timetable",
      text: `Back at Central Quad, Dr Byrne helps you separate the actions. The registration query belongs to programme operations; advising can consider what the current timetable may mean for future pathways. “We can decide what needs checking now and what can wait,” she says.

She notes the present interests, the uncertainty that came up, and the practical watchpoint about not confusing preferences with registration. The timetable Programme Operations published on Friday is still on your phone, with six modules spread across the week. You can review it alongside the interests you recorded at induction.`,
      choices: [
        "Open my timetable",
        "Open my advising record",
        "Finish the mission",
      ]},
    wrapUp: {speaker: "Narrator", title: "One question, several people",
      text: ()=>`You did not resolve Cian's question through a single conversation. You spoke to different people because each could help with a different part of it.

${state.caseChecked?'Checking the two records first helped you ask more precise questions.':'You can see now why comparing the preferences and timetable at the beginning would have made the conversations more useful.'}

${state.chosenResponse==='swap'?'Your first instinct was to assume a swap would be easy. Cian now knows why a preference cannot be treated as a registration confirmation.':'Cian is less worried now that he knows which question belongs to which team.'}

There is still a real next step for Cian: the programme team needs to confirm any formal registration issue.`,
      choices: [
        "Find Saoirse at Lower House",
        "Open my phone",
      ]},
    saoirse1: {speaker: "Saoirse · classmate", title: "Something unexpected",
      text: `“I went to a taster session in East Quad and ended up staying to talk about a project that mixes Irish culture, music and media,” Saoirse tells you. “I didn't expect to enjoy it that much. Now I'm wondering if I've made a mistake with my subjects.”

She pauses. “Could I just swap a module? Or is it more about what I might study later?”`,
      choices: [
        "“Let’s find out how that interest fits into the degree before changing anything.”",
        "“If you like it, surely you can change your timetable now.”",
      ]},
    saoirse2: {speaker: "Saoirse · classmate", title: "A direction worth exploring",
      text: `Saoirse looks relieved. “I can see why I should check. I don't want to lose the subjects I started with either.”

Róisín, the subject lecturer, is at East Quad. Go over and ask what the subject might lead to.`,
      choices: [
        "Go to East Quad",
        "Open the campus map",
      ]},
    lecturer1: {speaker: "Róisín · subject lecturer", title: "A possible pathway",
      text: `Róisín describes the kind of work students undertake in the subject: reading, making connections between ideas, practical work and a small collaborative project.

“It's good to discover something new,” she says. “But if you're thinking about taking it further, the important question is which modules and prerequisites belong to that pathway. The current timetable isn't something I can rearrange from this conversation.”`,
      choices: [
        "Ask what needs checking now, and what can wait until Stage 2",
        "Ask whether an enjoyable taster guarantees a place next semester",
      ]},
    lecturer2: {speaker: "Róisín · subject lecturer", title: "Information to bring along",
      text: "You leave with a clearer picture of the subject's learning activities and a list of questions for academic advising. One enjoyable class has opened a possibility without requiring an immediate final decision.",
      choices: [
        "Go to Central Quad",
        "Check the phone map",
      ]},
    adviserSecond: {speaker: "Dr Aoife Byrne · academic adviser", title: "Exploration with a plan",
      text: `Dr Byrne looks at what you discovered in East Quad. “This is what we hoped would happen in Stage 1,” she says. “You encounter subjects you didn't know you would enjoy. We can explore whether this interest might develop into part of your degree.”

She helps identify possible Major, Minor and SAR questions. She also checks whether any early module sequence matters. Your existing timetable doesn't change in the conversation; the follow-up goes into your advising notes.`,
      choices: ["Record the new interest and agree what to check next"]},
    saoirseWrap: {speaker: "Narrator", title: "Another direction opens",
      text: `Saoirse started with uncertainty and ended with a question she can pursue. You visited different people because each could answer a different part of it.

The subject remains an opportunity to explore. It has not become a registered module through conversation alone.`,
      choices: [
        "Explore more of Grangegorman",
        "Review the advising record",
      ]},
    saoirseWaiting: {speaker: "Saoirse · classmate", title: "Getting to know each other",
      text: "Saoirse is sitting outside Lower House with a couple of other students. “We just met at induction,” she says. “We all came in thinking we would study different things. It is actually nice having people to explore with.” She asks what has caught your interest so far.",
      choices: ["Talk about what you hope to explore this semester"]},
    lecturerWaiting: {speaker: "Róisín · subject lecturer", title: "Meeting academic staff",
      text: "Róisín is speaking with students outside East Quad. “You will meet lecturers from quite a few subjects during Arts,” she says. “Ask questions as you explore. It helps to know how a subject works, not just whether you like the sound of it.”",
      choices: ["Thank her and continue exploring"]},
    unionTalk: {speaker: "Students’ Union representative", title: "A place to find your people",
      text: `“The Students’ Union is based here in Lower House,” the representative says. “You might come looking for a society, representation, a conversation or somewhere to spend a bit of time between classes.”

There are different ways to feel part of university life. You don't need to arrive knowing everyone.`,
      choices: [
        "Ask what else is nearby",
        "Head back outside",
      ]},
    unionNext: {speaker: "Students’ Union representative", title: "Around the campus",
      text: "“Glassmanogue is where you'll find the gym, and St Laurence’s is one of the historic buildings nearby. There are lots of ways to find something outside your course that interests you.”",
      choices: ["Add that to my notes"]},
    gymTalk: {speaker: "Gym staff", title: "Looking after yourself",
      text: `“Welcome to Glassmanogue,” says a member of the gym team. “The gym is here, and there are other fitness activities on campus as well.”

You look around and make a mental note that some people are here for the first time too.`,
      choices: ["Save the location"]},
  };
}
