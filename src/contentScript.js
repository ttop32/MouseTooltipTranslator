'use strict';
// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js


import $ from "jquery";
import 'bootstrap/js/dist/tooltip';
var isUrl = require('is-url');

//init environment======================================================================\
var currentSetting = {};
var tooltipContainer;
var clientX = 0;
var clientY = 0;
var mouseTarget = null;
var activatedWord = null;
var hasTranslation = false;
var keyDownList = { //use key down for enable translation partially
  17: false, //ctrl
  16: false, //shift
  18: false //alt
};

//use mouse position for tooltip position
$(document).mousemove(function(event) {
  clientX = event.clientX;
  clientY = event.clientY;
  mouseTarget = event.target;
  setTooltipPosition();
});
$(document).keydown(function(e) {
  if ((e.keyCode == 65 || e.keyCode == 70) && e.ctrlKey) { //user pressed ctrl+f  ctrl+a, hide tooltip
    hideTooltipAndSetNoPositioning();
    clientX = 0;
    clientY = 0;
  } else {
    for (var key in keyDownList) { // check activation hold key pressed and record
      if (e.which == key.toString() && keyDownList[key] == false) { //run tooltip again with keydown on
        keyDownList[key] = true;
        activatedWord = null;
      }
    }
  }
});
$(document).keyup(function(e) {
  for (var key in keyDownList) {
    if (e.which == key.toString()) {
      keyDownList[key] = false;
    }
  }
});
document.addEventListener("visibilitychange", function() { //detect tab switching to turn off key down
  if (document.visibilityState === "hidden") { //reset all env value
    for (var key in keyDownList) { //reset key press when switching
      keyDownList[key] = false;
    }
    stopTTS(); //stop tts when tab swtiching
    hideTooltipAndSetNoPositioning();
    clientX = 0;
    clientY = 0;
  } else {
    activatedWord = null;
  }
});

//tooltip core======================================================================
//tooltip: init
$(document).ready(function() {
  getSetting(); //load setting from background js

  $('<div/>', {
    id: 'mttContainer',
    class: 'bootstrapiso', //apply bootstrap isolation css using bootstrapiso class
    css: {
      "left": 0,
      "top": 0,
      "position": "fixed",
      "z-index": "1070",
      "width": "200px",
      "margin-left": "-100px" /* Negative half of width. */
    }
  }).appendTo(document.body);

  tooltipContainer = $('#mttContainer');
  tooltipContainer.tooltip({
    placement: "top",
    container: "#mttContainer",
    trigger: "manual"
  });
});

//determineTooltipShowHide : word detection, show & hide
setInterval(function() {
  if (document.visibilityState == "visible") { //only work when tab is activated
    var word = getMouseOverWord(clientX, clientY); //get mouse positioned text
    word = filterWord(word); //filter out one that is url,over 1000length,no normal char

    if (word.length != 0 && activatedWord != word) { //show tooltip, if current word is changed and word is not none
      translateSentence(word, function(response) {
        tooltipContainer.attr('data-original-title', response.translatedText);
        activatedWord = word;
        tts(word, response.lang);

        if (response.translatedText.length > 0) { //if no translated text given( when it is off), hide
          hasTranslation = true;
          setTooltipPosition();
          tooltipContainer.tooltip("show");
        } else {
          hideTooltipAndSetNoPositioning();
        }
      });
    } else if (word.length == 0 && activatedWord != null) { //hide tooltip, if activated word exist and current word is none
      activatedWord = null;
      tooltipContainer.tooltip("hide");
    }
  }
}, 700);

function getMouseOverWord(clientX, clientY) {
  //check is image
  var imageOutput = checkImage(clientX, clientY);
  if (imageOutput != null) {
    return imageOutput;
  }

  var range = document.caretRangeFromPoint(clientX, clientY);
  //if no range or is not text, give null
  if (range == null || range.startContainer.nodeType !== Node.TEXT_NODE) {
    return "";
  }
  range.expand('sentence'); //range.expand('word');
  var rect = range.getBoundingClientRect(); //mouse in word rect
  if (rect.left > clientX || rect.right < clientX ||
    rect.top > clientY || rect.bottom < clientY) {
    return "";
  }
  return range.toString();
}

function filterWord(word) {
  word = word.replace(/\s+/g, ' ').trim(); //replace whitespace as single space
  if (word.length > 1000 || //filter out text that has over 1000length
    isUrl(word) || //if it is url
    !/[^\s\d»«…~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/g.test(word)) { // filter one that only include num,space and special char(include currency sign) as combination
    word = "";
  }
  return word;
}

function hideTooltipAndSetNoPositioning() {
  hasTranslation = false;
  tooltipContainer.tooltip("hide");
}

function setTooltipPosition() {
  if (activatedWord != null && hasTranslation) {
    tooltipContainer.css("transform", "translate(" + clientX + "px," + clientY + "px)");
  }
}

//send to background.js for background processing and setting handling ===========================================================================
function translateSentence(word, callbackFunc) {
  chrome.runtime.sendMessage({
      type: 'translate',
      word: word,
      keyDownList: keyDownList
    },
    function(response) {
      callbackFunc(response);
    }
  );
}

function tts(word, lang) {
  chrome.runtime.sendMessage({
      type: 'tts',
      word: word,
      lang: lang,
      keyDownList: keyDownList
    },
    function(data) {}
  );
}

function stopTTS() {
  chrome.runtime.sendMessage({
      type: 'stopTTS'
    },
    function(data) {}
  );
}

function getSetting() {
  chrome.runtime.sendMessage({
      type: 'loadSetting'
    },
    response => {
      currentSetting = response;
    }
  );
}

chrome.storage.onChanged.addListener(function(changes, namespace) { //update current setting value,
  for (var key in changes) {
    currentSetting[key] = changes[key].newValue;
  }
});


//ocr==================================================================================
var currentImgOcrData = null; //text
var currentImgCheckClientX = 0;
var currentImgCheckClientY = 0;
var currentImgCheckTimeSend = 0;
var currentImgCheckTimeReceive = 0;
var currentImgCheckMainUrl = "";


//detect mouse positioned image to process ocr using background js
//send image when mouse pointing
//recieve ocr processed text and return recent recieved text
function checkImage(clientX, clientY) { //if mouse target on image, process ocr
  if (currentSetting != null && currentSetting["useOCR"] != null && currentSetting["useOCR"] == "true" && //when use ocr setting on
    mouseTarget != null && mouseTarget.tagName === 'IMG' && //when mouse over on img
    mouseTarget.complete && mouseTarget.naturalHeight !== 0) { //if image is loaded
    if (currentImgCheckClientX != clientX || currentImgCheckClientY != clientY) { //if mouse move, do ocr using background js
      //mouse position on image width height
      var bounds = mouseTarget.getBoundingClientRect();
      var x = clientX - bounds.left;
      var y = clientY - bounds.top;
      var pxRatio = x / mouseTarget.clientWidth;
      var pyRatio = y / mouseTarget.clientHeight;
      currentImgCheckClientX = clientX;
      currentImgCheckClientY = clientY;
      var currentTime = Date.now(); //current sending time
      currentImgCheckTimeSend = currentTime;
      if (mouseTarget.src != currentImgCheckMainUrl) { //reset ocr data if new image
        currentImgOcrData = null;
        currentImgCheckMainUrl = mouseTarget.src;
      }
      mouseTarget.style.cursor = 'wait'; //show mouse loading


      (async () => {
        var response = await sendMessagePromise({
          type: 'ocr',
          "mainUrl": mouseTarget.src,
          "base64Url": "",
          "time": currentTime,
          "pxRatio": pxRatio,
          "pyRatio": pyRatio
        });
        if (response.success == "false") { //if fail, try again with base64
          var base64Url = await getBase64(response.mainUrl);
          var response = await sendMessagePromise({
            type: 'ocr',
            "mainUrl": response.mainUrl,
            "base64Url": base64Url,
            "time": currentTime,
            "pxRatio": pxRatio,
            "pyRatio": pyRatio
          });
        }

        if (response.mainUrl == currentImgCheckMainUrl && currentImgCheckTimeReceive < response.time) { //check url and is recent one
          currentImgOcrData = response.text;
          currentImgCheckTimeReceive = response.time;
          if (response.time == currentImgCheckTimeSend) { //if get most recent one, stop mouse loading
            mouseTarget.style.cursor = '';
          }
          // // show cropped image
          // const image = new Image();
          // image.src = response.crop;
          // document.body.appendChild(image);
        }
      })();
    }
    if (mouseTarget.src == currentImgCheckMainUrl && currentImgOcrData != null) { //if selected image is processed and recieved
      return currentImgOcrData;
    }
  }
  return null;
}

function sendMessagePromise(item) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(item, response => {
      resolve(response);
    });
  });
}

function getBase64(url) {
  return new Promise(function(resolve, reject) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        var reader = new FileReader();
        reader.onload = function() {
          resolve(this.result) // <--- `this.result` contains a base64 data URI
        };
        reader.readAsDataURL(blob);
      });
  });
}
