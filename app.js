const shortTurns = [
  {scenario:'Neutral', file:'neutral', patient:'I started taking metformin recently. I have a few questions about how I have been feeling.'},
  {scenario:'Sad / low', file:'sad', patient:'It has been a difficult week. I have been feeling low, and it is affecting my day.'},
  {scenario:'Frustrated', file:'frustrated', patient:'I am frustrated because I have several concerns and I am not sure where to start.'},
  {scenario:'Positive / relieved', file:'positive', patient:'I have been feeling better lately, which is a relief.'},
];
const names = {kokoro:'Kokoro · 70% Bella + 30% Heart', eleven:'ElevenLabs · Carly J'};
const selector = document.getElementById('assistant-reference');
const sessionChoice = document.getElementById('session-choice');
const patientSelector = document.getElementById('patient-reference');
const patientNames = {grandma:'Older female · American English', grandpa:'Older male · American English'};
function patientKey() {return patientSelector.value === 'grandpa' ? 'grandpa' : 'grandma';}
function patientFile(i) {return `audio/patient-${patientKey()}-${String(i+1).padStart(2,'0')}.mp3`;}
let fullMode = true;
let turns = fullSession.turns;
function voiceLabel() {return fullMode ? fullSession.referenceLabel : names[selector.value];}
function readyMessage() {return `Ready · ${turns.length} assistant recordings and ${turns.length} patient responses`;}
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
  readPatient.disabled = !fullMode && !patientVoice;
  patientStatus.textContent = fullMode ? `Recorded patient: ${patientNames[patientKey()]}` : patientVoice ? `Patient only: ${patientVoice.name}` : 'Local English device voice unavailable; patient turns appear as text.';
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
    const patientRow = `<div class="chat-row patient-row"><span class="avatar">P</span><div class="bubble patient-bubble"><span class="speaker-label">Patient${fullMode ? '' : ' · illustrative'}</span><p class="patient-text"></p>${fullMode ? `<audio class="patient-audio" controls preload="metadata" aria-label="Patient reply ${i+1}, ${patientNames[patientKey()]}" src="${patientFile(i)}"></audio>` : ''}</div></div>`;
    const assistantRow = `<div class="chat-row assistant-row"><span class="avatar assistant-avatar">A</span><div class="bubble assistant-bubble"><span class="speaker-label">Assistant · same reference voice</span>${fullMode ? '<p class="assistant-text"></p>' : ''}<audio controls preload="metadata" aria-label="Assistant reply ${i+1}, ${turn.scenario}, ${voiceLabel()}" src="${fullMode ? turn.file : `audio/${turn.file}-${selector.value}.wav`}"></audio></div></div>`;
    exchange.innerHTML = `<div class="exchange-label">EXCHANGE ${i+1} <span>${turn.scenario}</span></div>` + (fullMode ? assistantRow + patientRow : patientRow + assistantRow);
    exchange.querySelector('.patient-text').textContent = turn.patient;
    if (fullMode) exchange.querySelector('.assistant-text').textContent = turn.assistant;
    thread.append(exchange);
  });
  document.getElementById('patient-picker').hidden = !fullMode;
  document.getElementById('patient-read-label').textContent = fullMode ? 'Play recorded patient replies' : 'Read patient lines aloud with a separate device voice';
  updateVoices();
  selector.disabled = fullMode;
  selector.parentElement.hidden = fullMode;
  document.getElementById('identity-name').textContent = voiceLabel();
  document.getElementById('reference-playback').hidden = fullMode && !fullSession.referenceKey;
  const reference = document.getElementById('conversation-reference');
  const key = fullMode ? fullSession.referenceKey : selector.value;
  if (key) reference.src = `audio/reference-${key}.${key === 'eleven' ? 'mp3' : 'wav'}`;
  else reference.removeAttribute('src');
  document.getElementById('session-note').textContent = fullMode
    ? 'Agent and patient wording follows the supplied transcript. Assistant audio uses the 15 uploaded recordings; patient replies use fixed recordings in the selected older American voice. Recordings have not been independently transcribed.'
    : 'Patient lines are illustrative, not verified transcripts paired with these recordings. Assistant turns play your existing Chatterbox clips. Device speech is used only for the patient.';
  document.getElementById('session-end-note').textContent = fullMode
    ? 'End of supplied transcript. The final patient response is preserved; no extra assistant reply has been added.'
    : 'Listen for the same speaker across all four replies, with changes in delivery rather than changes in identity.';
  status.textContent = readyMessage();
}
function highlight(i, patient) {
  thread.querySelectorAll('.active-turn').forEach(el => el.classList.remove('active-turn'));
  const exchange = thread.children[i];
  const row = exchange.querySelector(patient ? '.patient-row' : '.assistant-row');
  row.classList.add('active-turn');
  row.scrollIntoView({behavior:'smooth', block:'center'});
}
async function speakPatient(text, id, index) {
  if (fullMode && readPatient.checked) {
    await playAssistant(thread.children[index].querySelector('.patient-audio'));
    return;
  }
  if (fullMode || !readPatient.checked || !patientVoice || !synth) {
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
      for (const patient of (fullMode ? [false, true] : [true, false])) {
        if (id !== runId) return;
        highlight(i, patient);
        status.textContent = `Exchange ${i+1} of ${turns.length} · ${patient ? 'Patient' : 'Assistant · ' + voiceLabel()}`;
        if (patient) await speakPatient(turns[i].patient, id, i);
        else await playAssistant(thread.children[i].querySelector('audio'));
        if (id !== runId) return;
        currentAudio = null;
        await wait(600);
      }
      if (id !== runId) return;
      if (i < turns.length-1) await wait(500);
    }
    if (id === runId) stop(fullMode ? 'Full session complete · end of supplied transcript.' : 'Conversation complete. Switch the reference voice to compare the same sequence.');
  } catch (error) {
    if (id === runId) stop(`Playback stopped: ${error.message} You can play each assistant recording individually.`);
  }
});
stopButton.addEventListener('click', () => stop());
patientSelector.addEventListener('change', () => {stop();render();});
selector.addEventListener('change', () => {stop();render();});
sessionChoice.addEventListener('change', () => {stop();fullMode = sessionChoice.value !== 'short';turns = fullMode ? fullSession.turns : shortTurns;render();});
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
    stop(readyMessage());
    for (const view of ['conversation','comparison']) {
      document.getElementById(`${view}-panel`).hidden = view !== mode;
      document.getElementById(`${view}-view`).setAttribute('aria-pressed', String(view === mode));
    }
  });
}
window.addEventListener('pagehide', () => stop());
render();
