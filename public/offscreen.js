var audio;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((msg) => {
  if ("play" in msg) playAudio(msg.play);
  if ("stop" in msg) stopAudio();
});

// Play sound with access to DOM APIs
async function playAudio({ source, volume }) {
  audio = new Audio(source);
  audio.volume = volume;
  // audio.playbackRate=0.5;
  audio.play();
  // audio.onended = onended
}

function stopAudio() {
  if (!audio) {
    return;
  }
  audio.pause();
  audio.currentTime = 0;
}
