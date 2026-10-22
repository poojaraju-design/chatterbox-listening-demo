const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function setup() {
  const played = [], elements = {}, audios = [];
  let document;
  class Element extends EventTarget {
    constructor() {super();this.children=[];this.value='';this.checked=false;this.hidden=false;this.disabled=false;this.textContent='';this.classList={add(){},remove(){}};}
    replaceChildren(){this.children=[];}
    append(el){this.children.push(el);}
    setAttribute(name,value){this[name]=value;}
    scrollIntoView(){}
    set innerHTML(value){this.audio=new Audio();this.audio.src=/src="([^"]+)"/.exec(value)[1];this.line=new Element();this.row=new Element();}
    querySelector(selector){return selector==='audio'?this.audio:selector==='.patient-bubble p'?this.line:this.row;}
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
  elements['assistant-reference']=new Element();elements['assistant-reference'].value='kokoro';
  const reference=new Audio();elements['conversation-reference']=reference;
  vm.runInNewContext(code,{document,window:{speechSynthesis:null,addEventListener(){}},HTMLAudioElement:Audio,setTimeout:(fn)=>setTimeout(fn,0),clearTimeout,console});
  return {elements,played};
}
async function finish(elements) {
  for(let i=0;i<100 && elements['play-conversation'].disabled;i++) await new Promise(resolve=>setTimeout(resolve,2));
  assert.equal(elements['play-conversation'].disabled,false);
}
test('entire sequence keeps the Kokoro reference fixed',async()=>{
  const {elements,played}=setup();elements['play-conversation'].dispatchEvent(new Event('click'));await finish(elements);
  assert.deepEqual(played,['neutral','sad','frustrated','positive'].map(name=>`audio/${name}-kokoro.wav`));
  assert.match(elements['conversation-status'].textContent,/complete/);
});
test('switching identity routes every assistant turn to ElevenLabs reference',async()=>{
  const {elements,played}=setup();elements['assistant-reference'].value='eleven';elements['assistant-reference'].dispatchEvent(new Event('change'));
  assert.equal(elements['conversation-reference'].src,'audio/reference-eleven.mp3');
  elements['play-conversation'].dispatchEvent(new Event('click'));await finish(elements);
  assert.deepEqual(played,['neutral','sad','frustrated','positive'].map(name=>`audio/${name}-eleven.wav`));
});
test('stop cancels sequence before any assistant audio starts',async()=>{
  const {elements,played}=setup();elements['play-conversation'].dispatchEvent(new Event('click'));elements['stop-conversation'].dispatchEvent(new Event('click'));
  await new Promise(resolve=>setTimeout(resolve,20));assert.deepEqual(played,[]);assert.equal(elements['stop-conversation'].disabled,true);
});
test('individual recording view remains available and local speech absence is explained',()=>{
  const {elements}=setup();assert.equal(elements['read-patient'].disabled,true);
  elements['comparison-view'].dispatchEvent(new Event('click'));
  assert.equal(elements['comparison-panel'].hidden,false);assert.equal(elements['conversation-panel'].hidden,true);
});
