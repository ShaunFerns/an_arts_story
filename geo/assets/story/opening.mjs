export const paul = 'Paul · Programme Operations Lead';
export const julie = 'Julie · Academic Adviser';
export const lecturer = 'Róisín · subject lecturer';

export const welcome = {
  title:'Welcome to BA Arts',
  text:'Paul has a campus map folded down to about the size of his hand. He is giving someone directions when he notices you waiting.\n\n“Hi. Are you here for Arts? I’m Paul. I’ve sent two people round the wrong side of this building already, so if you’ve done a lap, you’re in good company.”\n\nHe makes room beside him. “How are you getting on?”',
  choices:['“I thought I’d missed the start.”','“I’m trying to work out if I’ve picked the right subjects.”'],
};

export const welcomeReply = concern => concern === 'subjects'
  ? '“Which one are you unsure about?” Paul asks.\n\n“Music. I put it down because I’m interested, but I don’t know what everyone else will have done before. And I haven’t seen it on a timetable.”\n\n“Has a timetable come through at all?”\n\n“No. I thought maybe I’d missed an email.”\n\n“You’re on time. The first timetable is due out on Friday. If something you expected is missing, come back to Operations and we’ll check what happened.” He starts to fold the map again, then stops. “Are you still deciding if Music is for you?”\n\n“A bit.”\n\n“Bring that to Julie when you see her here after the welcome. She’ll help you think about how it fits with your other interests. If you want to know what the class actually involves, Róisín is outside Central Quad.”'
  : '“You’re fine. People are still coming up from the Luas,” Paul says. “A few of us are going in together in a minute. Where did you come in?”\n\n“Broadstone. I walked past the entrance first time.”\n\nSomeone beside you says they took the long way round too. Paul glances at the map. “Right. That might have been my fault.”\n\nYou ask when you’ll know where you’re supposed to go on Monday. “The first timetable is due out on Friday. If something’s missing or you can’t make sense of a room or time, come back to Programme Operations.”\n\nHe points a little farther along the East Quad forecourt. “Julie will meet you here after the welcome. You can tell her what you’re interested in, even if you’re still figuring it out.”';

export const lecturerIntro = 'You find Róisín outside Central Quad. She’s stopped to talk to a student who’s holding a notebook full of questions. When it’s your turn, you ask how you’d know whether a subject is for you.\n\n“What are you picturing you’d be doing in the first class?” she asks.\n\n“I’m not sure. Listening? Maybe everyone else will already know how to do it.”\n\n“That’s worth asking about. I’d start with what students actually do in the first few weeks and what they’re expected to bring. The module descriptor will tell you what you’ll learn and how you’ll be assessed. If something’s unclear, ask the lecturer a specific question.”\n\nShe glances toward the square. “If you have time before you go, the campus trail starts at Bradogue. The first sign is out by the building. You can do it on your own.”';

export const campusTrail = [
  {id:'bradogue',name:'Bradogue',position:[21,-47.3],title:'Two former infirmaries',
    source:'https://ggda.ie/what-we-do/projects/an-croi/',
    text:'Bradogue and Glassmanogue both served as infirmaries in the Richmond Asylum complex. After restoration, the two buildings took on different university uses. Glassmanogue became a gym.\n\nLook across the square towards Glassmanogue. What do the two buildings still have in common?',
    observations:[
      {label:'The projecting gables still give both fronts a similar shape.',tag:'reuse',note:'Bradogue and Glassmanogue retain a similar arrangement of projecting gables even though their uses have changed.'},
      {label:'I can compare the stonework and the rhythm of the windows.',tag:'history',note:'The stonework and window arrangement help me read Bradogue and Glassmanogue as a pair.'},
    ]},
  {id:'laurence',name:'St Laurence’s',title:'The former asylum church',
    source:'https://ggda.ie/what-we-do/projects/an-croi/',
    text:'St Laurence’s served the former asylum. It is now used as a university event space. Look at the outside of the building. What still tells you what it was built for?',
    observations:[
      {label:'The tall pointed windows give it away.',tag:'history',note:'The pointed windows at St Laurence’s hint at the building’s earlier use as a church.'},
      {label:'The roof and the entrance make it stand apart from the nearby buildings.',tag:'reuse',note:'The shape of St Laurence’s remains distinct even as the university uses it for events.'},
    ]},
  {id:'lower',name:'Lower House',title:'One side of a quadrangle',
    source:'https://www.ggda.ie/what-we-do/projects/the-lower-house/',
    text:'Lower House is the surviving wing of the original Richmond Asylum quadrangle. It was restored and now houses the Students’ Union, music practice rooms and other student facilities. Stand back far enough to see its length. Imagine three other wings enclosing a courtyard.',
    observations:[
      {label:'The long building would have made one edge of an enclosed space.',tag:'history',note:'Lower House makes more sense to me once I picture it as one wing of a four-sided complex.'},
      {label:'A single surviving wing can still hold many different uses.',tag:'reuse',note:'The surviving Lower House has been adapted for several student activities.'},
    ]},
  {id:'printmaking',name:'Printmaking Workshop',position:[149,-80.1],title:'A studio for printmaking',
    source:'https://ggda.ie/what-we-do/projects/print-making-workshop/',
    text:'The Printmaking Workshop first moved into a reused historic building on campus. It later moved into this purpose-built fine art printmaking studio beside East Quad, which the Grangegorman Development Agency describes as the site’s first near-zero-carbon building. Think about the equipment and space a printmaking class might need.',
    observations:[
      {label:'A building that’s reused might need changes to suit the work.',tag:'reuse',note:'Reusing a building for specialist teaching raises questions about how to adapt the space and services.'},
      {label:'A new workshop can be designed around its equipment and energy use.',tag:'sustainability',note:'The purpose-built Printmaking Workshop connects specialist teaching needs with how a building uses energy.'},
    ]},
  {id:'broadstoneTrail',name:'Broadstone Plaza',position:[351,-119],title:'From harbour to campus gateway',
    source:'https://ggda.ie/what-we-do/projects/broadstone-plaza/',
    text:'Broadstone Plaza occupies part of the former railway station and Royal Canal harbour site. Today it links Constitution Hill and the Luas to St Brendan’s Way, the main pedestrian route through campus. Look back towards the platform and trace the route you took into Grangegorman.',
    observations:[
      {label:'I can follow the walking route from the Luas towards East Quad.',tag:'sustainability',note:'Broadstone Plaza makes the connection from public transport to a walk through campus.'},
      {label:'The ground levels and routes tell me more than the address did.',tag:'places',note:'Tracing the route at Broadstone helped me understand how the campus entrance fits into the city.'},
    ]},
];
