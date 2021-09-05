'use strict';
// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js


import $ from "jquery";
import 'bootstrap/js/dist/tooltip';
import {enableSelectionEndEvent} from "./selection";
var isUrl = require('is-url');

//init environment======================================================================\
var currentSetting = {};
var tooltipContainer;
var clientX = 0;
var clientY = 0;
var mouseTarget = null;
var activatedWord = null;
var doProcessPos = false;
var mouseMoved = false;
var settingLoaded = false;
var keyDownList = { //use key down for enable translation partially
  17: false, //ctrl
  16: false, //shift
  18: false //alt
};
var style = $("<style>").appendTo("head");
let selectedText = "";

//use mouse position for tooltip position
$(document).mousemove(function(event) {
  clientX = event.clientX;
  clientY = event.clientY;
  mouseTarget = event.target;
  mouseMoved = true;
  setTooltipPosition();
});
$(document).keydown(function(e) {
  if ((e.keyCode == 65 || e.keyCode == 70) && e.ctrlKey) { //user pressed ctrl+f  ctrl+a, hide tooltip
    mouseMoved = false;
    hideTooltip();
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
    mouseMoved = false;
    hideTooltip();
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
      "z-index": "100000200",
      "width": "500px",
      "margin-left": "-250px",
    }
  }).appendTo(document.body);

  tooltipContainer = $('#mttContainer');
  tooltipContainer.tooltip({
    placement: "top",
    container: "#mttContainer",
    trigger: "manual"
  });
});

enableSelectionEndEvent();

document.addEventListener("selectionEnd", async function(event) {
  // if translate on selection is enabled
  if (document.visibilityState === "visible" && settingLoaded && currentSetting["translateOnSelection"] === "true") {
    selectedText = event.selectedText;
    await processWord(selectedText);
  }
}, false);

//determineTooltipShowHide : word detection, show & hide
setInterval(async function() {
  if (selectedText) {
    return;
  }

  // only work when tab is activated and when mousemove
  if (document.visibilityState == "visible"
      && mouseMoved
      && settingLoaded
      && currentSetting["translateOnHover"] === "true"
  ) {
    let word = getMouseOverWord(clientX, clientY); //get mouse positioned text
    await processWord(word);
  }
}, 700);

async function processWord(word) {
  word = filterWord(word); //filter out one that is url,over 1000length,no normal char

  if (word && activatedWord != word) { //show tooltip, if current word is changed and word is not none
    activatedWord = word;
    var response = await translate(word);

    //if empty
    //if tooltip is not on and activation key is not pressed,
    //then, hide
    if (response.translatedText == "" || (currentSetting["useTooltip"] == "false" && !keyDownList[currentSetting["keyDownTooltip"]])) {
      hideTooltip();
    } else {
      tooltipContainer.attr('data-original-title', response.translatedText);
      doProcessPos = true;
      setTooltipPosition();
      tooltipContainer.tooltip("show");
    }

    //if use_tts is on or activation key is pressed
    if (currentSetting["translateTarget"] != response.lang && (currentSetting["useTTS"] == "true" || keyDownList[currentSetting["keyDownTTS"]])) {
      tts(word, response.lang);
    }
  } else if (!word && activatedWord) { //hide tooltip, if activated word exist and current word is none
    activatedWord = null;
    hideTooltip();
  }
}

function getMouseOverWord(clientX, clientY) {
  //check is image
  var imageOutput = checkImage(clientX, clientY);
  if (imageOutput != null) {
    return imageOutput;
  }

  //get mouse positioned char
  var range = document.caretRangeFromPoint(clientX, clientY);
  //if no range or is not text, give null
  if (range == null || range.startContainer.nodeType !== Node.TEXT_NODE) {
    return "";
  }

  //expand char to get word,sentence,
  //if target is youtube caption, use container
  if (currentSetting["detectType"] == "container" || mouseTarget.className=="ytp-caption-segment") {
    //range.expand('textedit');
    range.setStartBefore(range.startContainer);
    range.setEndAfter(range.startContainer);
  } else if (currentSetting["detectType"] == "word") {
    range.expand('word');
  } else if (currentSetting["detectType"] == "sentence") {
    range.expand('sentence');
  }

  //check mouse is actually in text bound rect
  var rect = range.getBoundingClientRect(); //mouse in word rect
  if (rect.left > clientX || rect.right < clientX ||
    rect.top > clientY || rect.bottom < clientY) {
    return "";
  }
  return range.toString();
}

function filterWord(word) {
  word = word.replace(/\s+/g, ' '); //replace whitespace as single space
  word = word.trim(); // remove whitespaces from begin and end of word
  if (word.length > 1000 || //filter out text that has over 1000length
    isUrl(word) || //if it is url
    !/[^\s\d»«…~`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]/g.test(word)) { // filter one that only include num,space and special char(include currency sign) as combination
    word = "";
  }
  return word;
}

function hideTooltip() {
  doProcessPos = false;
  tooltipContainer.tooltip("hide");
}

function setTooltipPosition() {
  if (activatedWord != null && doProcessPos == true) {
    tooltipContainer.css("transform", "translate(" + clientX + "px," + clientY + "px)");
  }
}

async function translate(word) {
  var response = await translateSentence(word, currentSetting["translateTarget"]);

  //if lang are same, reverse translate
  if (currentSetting["translateTarget"] == response.lang) {
    if (currentSetting["translateReverseTarget"] != "null") {
      response = await translateSentence(word, currentSetting["translateReverseTarget"]);
    } else {
      response.translatedText = "";
    }
  }

  return response;
}


//send to background.js for background processing and setting handling ===========================================================================
function translateSentence(word, translateTarget) {
  return sendMessagePromise({
    type: 'translate',
    word: word,
    translateTarget: translateTarget
  });
}

function tts(word, lang) {
  chrome.runtime.sendMessage({
      type: 'tts',
      word: word,
      lang: lang
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

function getSetting() { //load  setting from background js
  chrome.runtime.sendMessage({
      type: 'loadSetting'
    },
    response => {
      currentSetting = response;
      changeTooltipStyle(currentSetting);
      settingLoaded = true;
    }
  );
}

chrome.storage.onChanged.addListener(function(changes, namespace) { //update current setting value,
  for (var key in changes) {
    currentSetting[key] = changes[key].newValue;
  }
  changeTooltipStyle(currentSetting);
});

function changeTooltipStyle(setting) {
  style.html(`
    .bootstrapiso .tooltip {
      font-size: ` + setting["tooltipFontSize"] + `px;
    }
    .bootstrapiso .tooltip-inner {
      max-width: ` + setting["tooltipWidth"] + `px;
    }
    `);
}


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
