const turns = [
  {scenario:'Neutral', file:'neutral', patient:'I started taking metformin recently. I have a few questions about how I have been feeling.'},
  {scenario:'Sad / low', file:'sad', patient:'It has been a difficult week. I have been feeling low, and it is affecting my day.'},
  {scenario:'Frustrated', file:'frustrated', patient:'I am frustrated because I have several concerns and I am not sure where to start.'},
  {scenario:'Positive / relieved', file:'positive', patient:'I have been feeling better lately, which is a relief.'},
];
const names = {kokoro:'Kokoro · 70% Bella + 30% Heart', eleven:'ElevenLabs · Carly J'};
const selector = document.getElementById('assistant-reference');
const thread = document.getElementById('conversation-thread');
const playButton = document.getElementById('play-conversation');
const stopButton = document.getElementById('stop-conversation');
const status = document.getElementById('conversation-status');
const readPatient = document.getElementById('read-patient');
const patientStatus = document.getElementById('patient-voice-status');
const synth = window.speechSynthesis;
let runId = 0, running = false, currentAudio = null, timer = null;
let releaseWait = null, patientVoice = null, sequencedPlay = false;

function updateVoices() {
  const voices = synth ? synth.getVoices().filter(v => v.localService && /^en(?:-|_)/i.test(v.lang)) : [];
  patientVoice = voices.find(v => /^en-US$/i.test(v.lang)) || voices[0] || null;
  readPatient.disabled = !patientVoice;
  patientStatus.textContent = patientVoice ? `Patient only: ${patientVoice.name}` : 'Local English device voice unavailable; patient turns appear as text.';
}
updateVoices();
if (synth) synth.addEventListener('voiceschanged', updateVoices);

function stop(message = 'Stopped. Play conversation restarts from the beginning.', keepAudio = null) {
  running = false;
  runId++;
  if (timer) clearTimeout(timer);
  timer = null;
  if (releaseWait) { const done = releaseWait; releaseWait = null; done(); }
  if (synth) synth.cancel();
  sequencedPlay = false;
  document.querySelectorAll('audio').forEach(audio => {if (audio !== keepAudio) audio.pause();});
  currentAudio = null;
  playButton.disabled = false;
  stopButton.disabled = true;
  thread.querySelectorAll('.active-turn').forEach(el => el.classList.remove('active-turn'));
  status.textContent = message;
}
function wait(ms) {
  return new Promise(resolve => {
    releaseWait = resolve;
    timer = setTimeout(() => { releaseWait = null; timer = null; resolve(); }, ms);
  });
}
function render() {
  thread.replaceChildren();
  turns.forEach((turn, i) => {
    const exchange = document.createElement('article');
    exchange.className = 'exchange';
    exchange.innerHTML = `<div class="exchange-label">TURN ${i+1} <span>${turn.scenario}</span></div><div class="chat-row patient-row"><span class="avatar">P</span><div class="bubble patient-bubble"><span class="speaker-label">Patient · illustrative</span><p></p></div></div><div class="chat-row assistant-row"><span class="avatar assistant-avatar">A</span><div class="bubble assistant-bubble"><span class="speaker-label">Assistant · same reference voice</span><audio controls preload="metadata" aria-label="Assistant turn ${i+1}, ${turn.scenario}, ${names[selector.value]}" src="audio/${turn.file}-${selector.value}.wav"></audio></div></div>`;
    exchange.querySelector('.patient-bubble p').textContent = turn.patient;
    thread.append(exchange);
  });
  document.getElementById('identity-name').textContent = names[selector.value];
  const reference = document.getElementById('conversation-reference');
  reference.src = `audio/reference-${selector.value}.${selector.value === 'eleven' ? 'mp3' : 'wav'}`;
}
function highlight(i, patient) {
  thread.querySelectorAll('.active-turn').forEach(el => el.classList.remove('active-turn'));
  const exchange = thread.children[i];
  const row = exchange.querySelector(patient ? '.patient-row' : '.assistant-row');
  row.classList.add('active-turn');
  row.scrollIntoView({behavior:'smooth', block:'center'});
}
async function speakPatient(text, id) {
  if (!readPatient.checked || !patientVoice || !synth) {
    await wait(Math.max(3000, text.split(/\s+/).length * 260));
    return;
  }
  await new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = patientVoice;
    utterance.lang = patientVoice.lang;
    utterance.rate = 0.95;
    let doneAlready = false;
    const done = () => {
      if (doneAlready) return;
      doneAlready = true;
      clearTimeout(timer); timer = null; releaseWait = null; resolve();
    };
    releaseWait = done;
    utterance.onend = done;
    utterance.onerror = () => {
      if (id === runId) patientStatus.textContent = 'Patient speech unavailable; continuing with text turns.';
      done();
    };
    timer = setTimeout(() => {synth.cancel();done();}, Math.max(15000, text.length * 150));
    synth.speak(utterance);
  });
}
async function playAssistant(audio) {
  await new Promise((resolve, reject) => {
    const cleanup = () => {audio.removeEventListener('ended', done);audio.removeEventListener('error', fail);releaseWait = null;};
    const done = () => {cleanup();resolve();};
    const fail = () => {cleanup();reject(new Error('Audio playback failed. Try this turn’s play button, or check the recording file.'));};
    releaseWait = done;
    audio.addEventListener('ended', done);
    audio.addEventListener('error', fail);
    audio.currentTime = 0;
    currentAudio = audio;
    sequencedPlay = true;
    const request = audio.play();
    if (request) request.catch(error => {cleanup();reject(error);});
  });
}
playButton.addEventListener('click', async () => {
  stop('Starting conversation…');
  const id = runId;
  running = true; playButton.disabled = true; stopButton.disabled = false;
  try {
    for (let i=0; i<turns.length; i++) {
      if (id !== runId) return;
      highlight(i, true);
      status.textContent = `Turn ${i+1} of 4 · Patient`;
      await speakPatient(turns[i].patient, id);
      if (id !== runId) return;
      await wait(500);
      if (id !== runId) return;
      highlight(i, false);
      status.textContent = `Turn ${i+1} of 4 · Assistant · ${names[selector.value]}`;
      await playAssistant(thread.children[i].querySelector('audio'));
      if (id !== runId) return;
      currentAudio = null;
      if (i < turns.length-1) await wait(1100);
    }
    if (id === runId) stop('Conversation complete. Switch the reference voice to compare the same sequence.');
  } catch (error) {
    if (id === runId) stop(`Playback stopped: ${error.message} You can play each assistant recording individually.`);
  }
});
stopButton.addEventListener('click', () => stop());
selector.addEventListener('change', () => {stop(`Ready · ${names[selector.value]} selected for all four assistant turns.`);render();});
readPatient.addEventListener('change', () => {if (running) stop('Patient playback preference changed. Press Play conversation to restart.');});

// Manual playback takes over from the sequence; never overlap speakers.
document.addEventListener('play', event => {
  if (!(event.target instanceof HTMLAudioElement)) return;
  const fromSequence = running && event.target === currentAudio && sequencedPlay;
  sequencedPlay = false;
  if (running && !fromSequence) stop('Manual recording selected. Press Play conversation to restart the sequence.', event.target);
  document.querySelectorAll('audio').forEach(audio => {if (audio !== event.target) audio.pause();});
}, true);
document.addEventListener('pause', event => {
  if (running && event.target === currentAudio && !event.target.ended) stop('Conversation paused. Press Play conversation to restart, or play recordings individually.');
}, true);
for (const mode of ['conversation','comparison']) {
  document.getElementById(`${mode}-view`).addEventListener('click', () => {
    stop('Ready · 4 patient turns and 4 assistant recordings');
    for (const view of ['conversation','comparison']) {
      document.getElementById(`${view}-panel`).hidden = view !== mode;
      document.getElementById(`${view}-view`).setAttribute('aria-pressed', String(view === mode));
    }
  });
}
window.addEventListener('pagehide', () => stop());
render();
