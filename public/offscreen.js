var audio;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if ("play" in request) {
      // await playAudio(request.play);
      stopAudio();
      await play(
        request?.play?.source,
        request?.play?.rate,
        request?.play?.volume
      );
      sendResponse();
    }
    if ("stop" in request) {
      stopAudio();
      sendResponse();
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
    audio.play();
  });
}

function stopAudio() {
  if (!audio) {
    return;
  }
  audio.pause();
  audio.currentTime = 0;
}
