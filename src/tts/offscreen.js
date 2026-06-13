import browser from "webextension-polyfill";
// import * as util from "/src/util";
import SettingUtil from "/src/util/setting_util.js";

var audio;
const speech = window.speechSynthesis;
var stopTtsTimestamp = 0;
var isUserPaused = false; // #124: true while the user paused (don't end the play promise)
var audioResolve = null; // resolve fn of the in-flight playAudio promise

// resolve the current play promise once (on real end / stop), and clear it so a
// later user-pause can't end the queue.
function finishAudio() {
  var resolve = audioResolve;
  audioResolve = null;
  resolve?.();
}

(function initListener() {
  if (isFirefox()) {
    initOffscreenListener();
  }else{
    initBrowserListener();
  }  
})()

async function handleMessage(request, sender, sendResponse) {
  if (request.type == "playAudioOffscreen") {
    await playAudio(request.data);
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});   
  } else if (request.type == "playSpeechTTSOffscreen") {
    await playSpeechTTS(request.data);
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});   
  } else if (request.type == "stopTTSOffscreen") {
    await stopAudio(request.data);
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});
  } else if (request.type == "pauseResumeTTSOffscreen") {
    pauseResumeTTS(request.data);
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});
  } else if (request.type == "startSpeechRecognition") {
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});   
  } else if (request.type == "stopSpeechRecognition") {
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});   
  }
}

function playAudio({ source, rate = 1.0, volume = 1.0, timestamp }) {
  return new Promise(async (resolve, reject) => {
    try {
      isUserPaused = false;
      audioResolve = resolve;
      audio = new Audio(source);
      audio.volume = volume;
      audio.playbackRate = rate;
      audio.onended = () => finishAudio();
      // a user pause must NOT end the play promise (queue would advance and we
      // couldn't resume); only a real stop ends it (#124).
      audio.onpause = () => {
        if (!isUserPaused) {
          finishAudio();
        }
      };
      audio.onloadeddata = () => {
        if (Number(timestamp) < stopTtsTimestamp) {
          stopAudioHTML();
          return;
        }
        audio.play();
      };
    } catch (error) {
      console.log(error);
      finishAudio();
    }
  });
}

// #124: pause/resume the current TTS, preserving position. action = pause|resume
function pauseResumeTTS({ action }) {
  if (action == "pause") {
    isUserPaused = true;
    if (speech?.speaking && !speech.paused) {
      speech.pause();
    }
    if (audio && !audio.paused && !audio.ended) {
      audio.pause(); // keeps currentTime -> resume continues from here
    }
  } else {
    isUserPaused = false;
    if (speech?.paused) {
      speech.resume();
    }
    if (audio && audio.paused && !audio.ended) {
      audio.play();
    }
  }
}

async function playSpeechTTS({ text, voice, lang, rate = 1.0, volume = 1.0 }) {
  return new Promise(async (resolve, reject) => {
    var voices = await SettingUtil.getSpeechVoices();
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

async function stopAudio({ timestamp }) {
  if (Number(timestamp) < stopTtsTimestamp) {
    return;
  }
  stopTtsTimestamp = Number(timestamp);
  stopAudioSpeech();
  await stopAudioHTML();
}
function stopAudioSpeech() {
  speech?.cancel();
}
function stopAudioHTML() {
  return new Promise((resolve, reject) => {
    isUserPaused = false; // a stop overrides any pause
    if (!audio) {
      finishAudio();
      resolve();
      return;
    }
    var wasPaused = audio.paused;
    audio.pause();
    audio.currentTime = 0;
    // if it was already paused, no 'pause' event fires -> end the play promise here
    if (wasPaused) {
      finishAudio();
    }
    resolve();
  });
}


// firefox

function initBrowserListener() {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender, sendResponse);    
    return true;
  });
}
function initOffscreenListener(){
  window.addEventListener(
    "message",
    async function ({ data }) {
      handleMessage(data, null, postMessage);        
    },
    false
  );
  
}

function isFirefox() {
  return typeof InstallTrigger !== "undefined";
}


function postMessage(data) {
  window.parent.postMessage(data, "*");
}
