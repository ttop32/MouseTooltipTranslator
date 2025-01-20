import browser from "webextension-polyfill";
// import * as util from "/src/util";
import SettingUtil from "/src/util/setting_util.js";

var audio;
const speech = window.speechSynthesis;
var stopTtsTimestamp = 0;

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
  } else if (request.type == "startSpeechRecognition") {
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});   
  } else if (request.type == "stopSpeechRecognition") {
    sendResponse({windowPostMessageProxy: request?.windowPostMessageProxy});   
  }
}

function playAudio({ source, rate = 1.0, volume = 1.0, timestamp }) {
  return new Promise(async (resolve, reject) => {
    try {
      audio = new Audio(source);
      audio.volume = volume;
      audio.playbackRate = rate;
      audio.onended = () => resolve();
      audio.onpause = () => resolve();
      audio.onloadeddata = () => {
        if (Number(timestamp) < stopTtsTimestamp) {
          stopAudioHTML();
          resolve();
          return;
        }
        audio.play();
      };
    } catch (error) {
      console.log(error);
      resolve();
    }
  });
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
    if (!audio) {
      resolve();
      return;
    }
    audio.pause();
    audio.currentTime = 0;
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
