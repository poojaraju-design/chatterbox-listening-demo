// Keep each A/B comparison audible on its own.
document.addEventListener('play', (event) => {
  if (!(event.target instanceof HTMLAudioElement)) return;
  document.querySelectorAll('audio').forEach((audio) => {
    if (audio !== event.target) audio.pause();
  });
}, true);
