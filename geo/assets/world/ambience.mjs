const rate=22050;
const tau=2*Math.PI;
const clamp=(x)=>Math.max(0,Math.min(1,x));
const smooth=(x)=>{const t=clamp(x);return t*t*(3-2*t);};

export function campusMix(position,luas,eastQuad) {
 const cityDistance=Math.hypot(position[0]-luas[0],position[1]-luas[1]);
 const doorDistance=Math.hypot(position[0]-eastQuad[0],position[1]-eastQuad[1]);
 return {
  city:.37*(1-smooth((cityDistance-12)/95))+.018,
  tram:.66*(1-smooth((cityDistance-5)/42)),
  nature:.07+.58*smooth((cityDistance-42)/170),
  music:.145*(1-smooth((doorDistance-1.4)/25)),
 };
}

function noise(seed) {
 return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
}
function bed(context,duration,sample) {
 const buffer=context.createBuffer(1,Math.round(rate*duration),rate);
 const samples=buffer.getChannelData(0);
 for(let i=0;i<samples.length;i++){
  const t=i/rate;
  samples[i]=sample(t)*Math.min(1,t/.36,(duration-t)/.36);
 }
 return buffer;
}
function city(context) {
 const white=noise(1934);
 const passing=[[1,3.4,.30],[5.5,5.5,.59],[12.8,3.9,.75],[18.4,3.0,.32],[23,4.7,.52]];
 let low=0,tire=0;
 return bed(context,30,t=>{
  const next=white();low+=.009*(next-low);tire+=.11*(next-tire);
  let traffic=.12;
  for(const [start,duration,volume] of passing){
   const p=(t-start)/duration;
   if(p>0&&p<1)traffic+=volume*Math.sin(Math.PI*p)**2;
  }
  return low*(.09+.38*traffic)+tire*(.015+.17*traffic);
 });
}
function tram(context) {
 const white=noise(1935);
 let railNoise=0,phase=0;
 return bed(context,5.65,t=>{
  const travel=clamp((t-.18)/5.2),approach=Math.sin(Math.PI*travel)**2;
  phase+=tau*(89+87*travel-38*travel**2)/rate;
  railNoise+=.09*(white()-railNoise);
  const motor=approach*(.024*Math.sin(phase)+.009*Math.sin(2*phase)+.023*railNoise);
  const braking=Math.sin(Math.PI*clamp((t-2.28)/1.17))**2;
  return motor+braking*.006*Math.sin(tau*(640*t+6*Math.sin(t*1.2)));
 });
}
function nature(context) {
 const white=noise(502);
 const calls=[1.64,1.93,4.6,7.95,8.2,8.62,12.36,16.75,17.11,21.42,21.68,25.94,28.3];
 let breeze=0,rustle=0,slow=0;
 return bed(context,32,t=>{
  const next=white();breeze+=.018*(next-breeze);rustle+=.16*(next-rustle);slow+=.006*(breeze-slow);
  let birds=0;
  for(const [i,start] of calls.entries()){
   const time=t-start,duration=i%3===0?.17:.25;
   if(time<0||time>duration)continue;
   const arch=Math.sin(Math.PI*time/duration)**1.6;
   const phase=tau*((1950+170*(i%4))*time+(i%2?1040:-1380)*time*time);
   birds+=arch*(.034*Math.sin(phase)+.007*Math.sin(phase*2));
  }
  const gust=.55+.24*Math.sin(t*.77)+.14*Math.cos(t*1.41);
  return gust*(.31*(breeze-slow)+.058*rustle)+birds;
 });
}

function classical(context) {
 // Original synthesized performance of the opening of Bach's public-domain
 // C major Prelude, BWV 846. The source sits just inside the East Quad door.
 const bars=[
  [60,64,67,72,76],[60,62,69,74,77],[59,62,67,74,77],[60,64,67,72,76],
  [60,64,69,76,81],[60,62,66,69,74],[59,62,67,74,79],[59,60,64,67,72],
 ];
 const beat=.19,notes=bars.flatMap(([a,b,c,d,e])=>[a,b,c,d,e,c,d,e,a,b,c,d,e,c,d,e]);
 const frequencies=notes.map(note=>440*2**((note-69)/12));
 return bed(context,notes.length*beat+.85,t=>{
  const last=Math.min(notes.length-1,Math.floor(t/beat));
  let sound=0;
  for(let i=Math.max(0,last-7);i<=last;i++){
   const age=t-i*beat;
   const envelope=Math.min(age/.018,1)*Math.exp(-age*(notes[i]<65?3.2:4.9));
   const phase=tau*frequencies[i]*age;
   sound+=envelope*(.074*Math.sin(phase)+.022*Math.sin(phase*2.001)+.009*Math.sin(phase*3.004));
  }
  return sound;
 });
}

export function createCampusAmbience(buttons,luas,eastQuad) {
 const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;
 let context,master,panner,layers,filter,tramSource,enabled=false,nextUpdate=0;
 let listener=luas,heading=0,foreground=true;
 const label=()=>{
  for(const button of buttons){
   button.setAttribute('aria-pressed',String(enabled));
   button.textContent=enabled?'Sound on':'Sound off';
  }
 };
 function setMaster() {
  master?.gain.setTargetAtTime(enabled&&!document.hidden?(foreground?.72:.40):0,context.currentTime,.15);
 }
 function update(position,yaw,active=true) {
  listener=position;heading=yaw;
  if(foreground!==active){foreground=active;setMaster();}
  if(!enabled||context.currentTime<nextUpdate)return;
  const now=context.currentTime;
  nextUpdate=now+.10;
  const mix=campusMix(position,luas,eastQuad);
  for(const [name,node] of Object.entries(layers))node.gain.setTargetAtTime(mix[name],now,.22);
  const [dx,dn]=eastQuad.map((v,i)=>v-position[i]);
  const distance=Math.hypot(dx,dn);
  panner?.pan.setTargetAtTime(.76*(dx*Math.cos(yaw)-dn*Math.sin(yaw))/Math.max(2,distance),now,.17);
  filter.frequency.setTargetAtTime(1000+900*(1-smooth(distance/24)),now,.20);
 }
 async function toggle() {
  if(enabled){enabled=false;setMaster();label();return;}
  for(const button of buttons)button.disabled=true;
  try{
   if(!context){
    context=new Audio();
    master=context.createGain();master.gain.value=0;master.connect(context.destination);
    filter=context.createBiquadFilter();filter.type='lowpass';filter.Q.value=.45;
    panner=context.createStereoPanner?.();
    if(panner){filter.connect(panner);panner.connect(master);}else filter.connect(master);
    layers=Object.fromEntries(Object.entries({city,nature,music:classical}).map(([name,make])=>{
     const source=context.createBufferSource(),gain=context.createGain();
     source.buffer=make(context);source.loop=true;gain.gain.value=0;
     source.connect(gain);gain.connect(name==='music'?filter:master);
     source.start();
     return [name,gain];
    }));
    layers.tram=context.createGain();
    layers.tram.gain.value=0;layers.tram.connect(master);
    tramSource=context.createBufferSource();
    tramSource.buffer=tram(context);tramSource.connect(layers.tram);
   }
   await context.resume();
   enabled=true;nextUpdate=0;
   update(listener,heading,foreground);setMaster();
   if(tramSource){
    if(Math.hypot(listener[0]-luas[0],listener[1]-luas[1])<38)tramSource.start();
    else tramSource.disconnect();
    tramSource=null;
   }
  }catch{
   context?.close().catch(()=>{});
   context=master=tramSource=null;
  }finally{
   label();
   for(const button of buttons)button.disabled=false;
  }
 }
 for(const button of buttons){button.hidden=!Audio;button.addEventListener('click',toggle);}
 document.addEventListener('visibilitychange',setMaster);
 return {update};
}
