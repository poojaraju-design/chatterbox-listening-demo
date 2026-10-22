const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../session-data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function setup() {
  const played = [], elements = {}, audios = [], statuses = [];
  let document;
  class Element extends EventTarget {
    constructor() {super();this.children=[];this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.textContent='';this.classList={add(){},remove(){}};}
    replaceChildren(){this.children=[];}
    append(el){this.children.push(el);}
    setAttribute(name,value){this[name]=value;}
    removeAttribute(name){delete this[name];}
    scrollIntoView(){}
    set innerHTML(value){this.audio=new Audio();this.audio.src=/src="([^"]+)"/.exec(value)[1];const patientMatch=/class="patient-audio"[^>]*src="([^"]+)"/.exec(value);this.patientAudio=patientMatch?new Audio():null;if(this.patientAudio)this.patientAudio.src=patientMatch[1];this.line=new Element();this.assistantLine=new Element();this.row=new Element();this.markup=value;}
    querySelector(selector){return selector==='audio'?this.audio:selector==='.patient-audio'?this.patientAudio:selector==='.patient-text'?this.line:selector==='.assistant-text'?this.assistantLine:this.row;}
    querySelectorAll(){return [];}
  }
  class Audio extends Element {
    constructor(){super();this.paused=true;this.ended=false;audios.push(this);}
    pause(){if(!this.paused){this.paused=true;const e=new Event('pause');Object.defineProperty(e,'target',{value:this});document.dispatchEvent(e);}}
    play(){this.paused=false;this.ended=false;played.push(this.src);const e=new Event('play');Object.defineProperty(e,'target',{value:this});document.dispatchEvent(e);setImmediate(()=>{this.ended=true;this.paused=true;this.dispatchEvent(new Event('ended'));});return Promise.resolve();}
  }
  document=new EventTarget();
  document.getElementById=id=>elements[id] ||= new Element();
  document.querySelectorAll=()=>audios;
  document.createElement=()=>new Element();
  elements['assistant-reference']=new Element();elements['assistant-reference'].value='kokoro';elements['assistant-reference'].parentElement=new Element();
  elements['conversation-status']=new Element();
  Object.defineProperty(elements['conversation-status'],'textContent',{set(value){statuses.push(value);this.last=value;},get(){return this.last;}});
  elements['read-patient']=new Element();elements['read-patient'].checked=true;
  const reference=new Audio();elements['conversation-reference']=reference;
  vm.runInNewContext(code,{document,window:{speechSynthesis:null,addEventListener(){}},HTMLAudioElement:Audio,setTimeout:(fn)=>setTimeout(fn,0),clearTimeout,console});
  return {elements,played,statuses};
}
async function finish(elements) {
  for(let i=0;i<100 && elements['play-conversation'].disabled;i++) await new Promise(resolve=>setTimeout(resolve,2));
  assert.equal(elements['play-conversation'].disabled,false);
}
test('entire sequence keeps the Kokoro reference fixed',async()=>{
  const {elements,played}=setup();elements['session-choice'].value='short';elements['session-choice'].dispatchEvent(new Event('change'));elements['play-conversation'].dispatchEvent(new Event('click'));await finish(elements);
  assert.deepEqual(played,['neutral','sad','frustrated','positive'].map(name=>`audio/${name}-kokoro.wav`));
  assert.match(elements['conversation-status'].textContent,/complete/);
});
test('switching identity routes every assistant turn to ElevenLabs reference',async()=>{
  const {elements,played}=setup();elements['session-choice'].value='short';elements['session-choice'].dispatchEvent(new Event('change'));elements['assistant-reference'].value='eleven';elements['assistant-reference'].dispatchEvent(new Event('change'));
  assert.equal(elements['conversation-reference'].src,'audio/reference-eleven.mp3');
  elements['play-conversation'].dispatchEvent(new Event('click'));await finish(elements);
  assert.deepEqual(played,['neutral','sad','frustrated','positive'].map(name=>`audio/${name}-eleven.wav`));
});
test('stop cancels sequence before any assistant audio starts',async()=>{
  const {elements,played}=setup();elements['session-choice'].value='short';elements['session-choice'].dispatchEvent(new Event('change'));elements['play-conversation'].dispatchEvent(new Event('click'));elements['stop-conversation'].dispatchEvent(new Event('click'));
  await new Promise(resolve=>setTimeout(resolve,20));assert.deepEqual(played,[]);assert.equal(elements['stop-conversation'].disabled,true);
});
test('individual recording view remains available and local speech absence is explained',()=>{
  const {elements}=setup();assert.equal(elements['read-patient'].disabled,false);
  elements['session-choice'].value='short';elements['session-choice'].dispatchEvent(new Event('change'));assert.equal(elements['read-patient'].disabled,true);
  elements['comparison-view'].dispatchEvent(new Event('click'));
  assert.equal(elements['comparison-panel'].hidden,false);assert.equal(elements['conversation-panel'].hidden,true);
});

test('full session plays 15 numbered recordings in assistant-then-patient order',async()=>{
  const {elements,played,statuses}=setup();
  assert.equal(elements['conversation-thread'].children.length,15);
  assert.equal(elements['assistant-reference'].disabled,true);
  assert.equal(elements['reference-playback'].hidden,false);
  assert.equal(elements['conversation-reference'].src,'audio/reference-kokoro.wav');
  assert.equal(elements['identity-name'].textContent,'Kokoro · 70% Bella + 30% Heart');
  const first=elements['conversation-thread'].children[0];
  assert.ok(first.markup.indexOf('assistant-row')<first.markup.indexOf('patient-row'));
  assert.match(first.assistantLine.textContent,/Hi there, it's good to see you today!/);
  assert.equal(first.line.textContent,"Yeah it's pretty much same as before");
  assert.equal(elements['conversation-thread'].children[14].line.textContent,"probably missed most of them the past couple weeks, maybe only took it once or twice");
  elements['play-conversation'].dispatchEvent(new Event('click'));await finish(elements);
  assert.deepEqual(played,Array.from({length:15},(_,i)=>{const n=String(i+1).padStart(2,'0');return [`audio/assistant_${n}.wav`,`audio/patient-grandma-${n}.mp3`];}).flat());
  const flow=statuses.filter(s=>s.startsWith('Exchange'));
  assert.equal(flow.length,30);
  assert.match(flow[0],/Exchange 1 of 15 · Assistant/);
  assert.equal(flow[1],'Exchange 1 of 15 · Patient');
  assert.equal(flow[29],'Exchange 15 of 15 · Patient');
  assert.match(elements['conversation-status'].textContent,/Full session complete/);
});

test('older male selection changes patient recordings only',async()=>{
  const {elements,played}=setup();
  elements['patient-reference'].value='grandpa';elements['patient-reference'].dispatchEvent(new Event('change'));
  elements['play-conversation'].dispatchEvent(new Event('click'));await finish(elements);
  assert.equal(played.length,30);
  for(let i=0;i<15;i++){const n=String(i+1).padStart(2,'0');assert.equal(played[2*i],`audio/assistant_${n}.wav`);assert.equal(played[2*i+1],`audio/patient-grandpa-${n}.mp3`);}
});
