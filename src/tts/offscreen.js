import browser from "webextension-polyfill";
import * as util from "/src/util";

var audio;
const speech = window.speechSynthesis;

// Listen for messages from the extension
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.type === "playTTSOffscreen") {
      stopAudio();
      await play(request?.source, request?.rate, request?.volume);
      sendResponse({});
    } else if (request.type === "playSpeechTTS") {
      await playBrowserTts(request.browserTTSData);
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

async function playBrowserTts({ text, voice, lang, rate = 1.0, volume = 1.0 }) {
  return new Promise(async (resolve, reject) => {
    var voices = await util.getSpeechVoices();
    let voiceSelected = voices.filter((voiceData) => {
      return voiceData.name == voice;
    })[0];
    if (!voiceSelected) {
      resolve();
    }

    var msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.voice = voiceSelected;
    msg.lang = lang;
    msg.rate = rate;
    msg.volume = volume;
    speech.speak(msg);
    msg.onend = resolve;
    msg.onerror = resolve;
  });
}

function stopAudio() {
  // speech?.cancel();
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
