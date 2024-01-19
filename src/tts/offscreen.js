var audio;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.type === "playTTSOffscreen") {
      stopAudio();
      await play(request?.source, request?.rate, request?.volume);
      sendResponse({});
    } else if (request.type === "stopTTSOffscreen") {
      stopAudio();
      sendResponse({});
    }
  })();

  return true;
});

function play(url, rate = 1.0, volume = 1.0) {
  return new Promise((resolve, reject) => {
    audio = new Audio(url);
    audio.volume = volume;
    audio.playbackRate = rate;
    audio.onended = () => resolve();
    audio.onloadeddata = () => audio.play();
  });
}

function stopAudio() {
  if (!audio) {
    return;
  }
  audio.pause();
  audio.currentTime = 0;
}
