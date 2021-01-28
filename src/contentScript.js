'use strict';
//inject translation tooltip based on user text hover event
//it gets translation and tts from background.js


import $ from "jquery";
require('popper.js');
require('bootstrap');


//init environment======================================================================\
var currentSetting = {};
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
    hasTranslation = false;
    $('#mttContainer').tooltip("hide");
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
document.addEventListener("visibilitychange", function() { //detect tab swtich to turn off key down
  if (document.visibilityState === "hidden") {
    for (var key in keyDownList) { //reset key press when swtich
      keyDownList[key] = false;
    }
    stopTTS(); //stop tts when tab swtiching
  }
});

//tooltip core======================================================================
//tooltip: init
$(document).ready(function() {
  $(".dropdown-toggle").dropdown(); //if site has drop down run again
  getSetting(); //load setting from background js

  $('<div/>', {
    id: 'mttContainer',
    class: 'bootstrapiso',
    css: {
      "position": "fixed",
      "z-index": "1070",
      "width": "200px",
      "margin-left": "-100px" /* Negative half of width. */
    }
  }).appendTo(document.body);

  $('#mttContainer').tooltip({
    placement: "top",
    container: "#mttContainer"
  });
});

//determineTooltipShowHide : word detection, show & hide
setInterval(function() {
  if (document.visibilityState == "visible") { //only work when tab is activated
    var word = getMouseOverWord(clientX, clientY); //get mouse positioned text
    if (word.length > 1000) {
      word = "";
    }

    if (word.length != 0 && activatedWord != word) { //show tooltip, if current word is changed and word is not none
      translateSentence(word, "auto", "ko", function(translatedSentence, lang) {
        $('#mttContainer').attr('data-original-title', translatedSentence);
        activatedWord = word;
        hasTranslation = translatedSentence.length > 0 ? true : false;
        setTooltipPosition();
        if (hasTranslation == false) { //if no translated text given( when it is off), hide
          $("#mttContainer").tooltip("hide");
        }
        tts(word, lang);
      });
    } else if (word.length == 0 && activatedWord != null) { //hide tooltip, if activated word exist and current word is none
      activatedWord = null;
      $('#mttContainer').tooltip("hide");
    }
  }
}, 700);


function setTooltipPosition() {
  if (activatedWord != null && hasTranslation) {
    $('#mttContainer').css({
      "left": clientX,
      "top": clientY
    });
    $("#mttContainer").tooltip("show");
  }
}


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


//send to background.js for background processing and setting handling ===========================================================================
function translateSentence(word, sourceLang, targetLang, callbackFunc) {
  var word = word.replace(/\s+/g, ' ').trim(); //replace whitespace
  chrome.runtime.sendMessage({
      type: 'translate',
      word: word,
      keyDownList: keyDownList
    },
    function(response) {
      callbackFunc(response.translatedText, response.lang);
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
var currentImageOcrData = null; //text
var currentImgCheckClientX = 0;
var currentImgCheckClientY = 0;
var currentImgCheckTimeSend = 0;
var currentImgCheckTimeReceive = 0;
var currentImgCheckMainUrl = "";


//detect mouse positioned image to process ocr using background js
//send image when mouse pointing
//recieve ocr processed text and return recent recieved text
function checkImage(clientX, clientY) { //if mouse target on image, process ocr
  if (currentSetting["useOCR"] != null && currentSetting["useOCR"] == "true" && //when use ocr setting on
    mouseTarget != null && mouseTarget.tagName === 'IMG' && //when mouse over on img
    mouseTarget.complete && mouseTarget.naturalHeight !== 0) { //if image is loaded

    if (currentImgCheckClientX != clientX || currentImgCheckClientY != clientY) { //if mouse move, do ocr using background js
      //mouse position on image width height
      var bounds = mouseTarget.getBoundingClientRect();
      var x = clientX - bounds.left;
      var y = clientY - bounds.top;
      var px = x / mouseTarget.clientWidth * mouseTarget.naturalWidth;
      var py = y / mouseTarget.clientHeight * mouseTarget.naturalHeight;
      currentImgCheckClientX = clientX;
      currentImgCheckClientY = clientY;
      var currentTime = Date.now(); //current sending time
      currentImgCheckTimeSend = currentTime;
      if (mouseTarget.src != currentImgCheckMainUrl) { //reset ocr data if new image
        currentImageOcrData = null;
        currentImgCheckMainUrl = mouseTarget.src;
      }
      mouseTarget.style.cursor = 'wait'; //show mouse loading


      chrome.runtime.sendMessage({
          type: 'ocr',
          "mainUrl": mouseTarget.src,
          "time": currentTime,
          "px": px,
          "py": py
        },
        function(response) {
          if (response.mainUrl == currentImgCheckMainUrl && currentImgCheckTimeReceive < response.time) { //check url and is recent one
            currentImageOcrData = response.text;
            currentImgCheckTimeReceive = response.time;
            if (response.time == currentImgCheckTimeSend) { //if get most recent one, stop mouse loading
              mouseTarget.style.cursor = '';
            }
          }
          // // show cropped image
          // const image = new Image();
          // image.src = response.crop;
          // image.onload = () => {
          //   document.body.appendChild(image);
          // }
        }
      );
    }
    if (mouseTarget.src == currentImgCheckMainUrl && currentImageOcrData != null) { //if selected image is processed and recieved
      return currentImageOcrData;
    }
  }
  return null
}
