// speech recognition================================

var listenEngine;
var listening = false;

export function initSpeechRecognition(recognitionCallbackFn, finCallbackFn) {
  // future plan, migration to background service worker
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return;
  }
  listenEngine = new SpeechRecognition();
  listenEngine.continuous = true;
  listenEngine.interimResults = true;
  listenEngine.onstart = function () {
    listening = true;
  };
  listenEngine.onerror = function (event) {
    console.log(event);
  };
  listenEngine.onend = function () {
    listening = false;
    finCallbackFn();
  };

  listenEngine.onresult = function (event) {
    var isFinal = false;
    var interimTranscript = "";
    var finalTranscript = "";
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript = event.results[i][0].transcript;
        isFinal = true;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    recognitionCallbackFn(finalTranscript || interimTranscript, isFinal);
    // console.log("-------------------------------");
    // console.log(finalTranscript);
    // console.log(interimTranscript);
  };
}

export function initSpeechRecognitionLang(setting) {
  setSpeechRecognitionLang(setting["speechRecognitionLanguage"]);
}

export function setSpeechRecognitionLang(lang) {
  if (!listenEngine) {
    return;
  }
  listenEngine.lang = lang;
}

export function stopSpeechRecognition() {
  if (!listening) {
    return;
  }
  // console.log("stop listen");
  listenEngine?.stop();
}

export function startSpeechRecognition() {
  if (listening || !listenEngine) {
    return;
  }
  // console.log("start listen");
  listenEngine?.start();
}
