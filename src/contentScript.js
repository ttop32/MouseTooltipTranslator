'use strict';
//inject translation tooltip based on user text hover event
//it gets translation and tts from background.js




//init environment======================================================================
import $ from "jquery";
require('popper.js');
require('bootstrap');

var clientX = 0;
var clientY = 0;
var clientXScroll = 0;
var clientYScroll = 0;
var clientTarget = null;
var activatedWord = null;
var keyDownList = { //use key down for enable translation partially
  17: false, //ctrl
  16: false, //shift
  18: false //alt
};




//use mouse position for tooltip position
$(document).mousemove(function(event) {
  clientX = event.clientX;
  clientY = event.clientY;
  clientXScroll = event.pageX;
  clientYScroll = event.pageY;
  clientTarget = event.target;
  setTooltipPosition();
});
document.addEventListener("visibilitychange", function() { //detect tab swtich to turn off key down
  keyDownList = {
    17: false, //ctrl
    16: false, //shift
    18: false //alt
  };
})
$(document).keydown(function(e) {
  for (var key in keyDownList) {
    if (e.which == key.toString()) {
      keyDownList[key] = true;
    }
  }
})
$(document).keyup(function(e) {
  for (var key in keyDownList) {
    if (e.which == key.toString()) {
      keyDownList[key] = false;
    }
  }
})




//tooltip core======================================================================
//tooltip: init
$(document).ready(function() {
  $('<div/>', {
    id: 'bubble',
    class: 'bootstrapiso',
    css: {
      "position": "absolute",
      "width": "200px",
      "top": "50%",
      "left": "50%",
      "margin-left": "-100px" /* Negative half of width. */
    }
  }).appendTo(document.body);

  $('#bubble').tooltip({
    placement: "top",
    container: "#bubble",
    animation: false
  });
});

//tooltip: word detection, show & hide
setInterval(function() {
  var word = getWordUnderMouse(clientX, clientY, clientTarget);

  if (word != null && word.length != 0 && activatedWord != word) { //show tooltip, if current word is changed and word is not none
    translateSentence(word, "auto", "ko", function(translatedSentence, lang) {
      if (translatedSentence.length != 0) { // only show tooltip when word lang is not user lang
        $('#bubble').attr('data-original-title', translatedSentence);
        tts(word, lang);
      } else {
        $('#bubble').attr('data-original-title', "");
        $('#bubble').tooltip("hide");
      }
      activatedWord = word;
    });
  } else if ((word == null || word.length == 0) && activatedWord != null) { //hide tooltip, if activated word exist and current word is none
    activatedWord = null;
    $('#bubble').attr('data-original-title', "");
    $('#bubble').tooltip("hide");
  }
  setTooltipPosition(); //tooltip movement
}, 700);

function setTooltipPosition() {
  if (activatedWord != null) {
    $('#bubble').css('left', clientXScroll).css('top', clientYScroll);
    $("#bubble").tooltip("show");
  }
}

function getWordUnderMouse(clientX, clientY, target) {
  var range = document.caretRangeFromPoint(clientX, clientY);
  //no mouse target,no range,is not text
  if (target == null || range == null || range.startContainer == null || range.startContainer.nodeType !== Node.TEXT_NODE)
    return null;
  range.expand('sentence'); //range.expand('word');
  var rect = range.getBoundingClientRect(); //mouse in word rect
  if (rect.left > clientX || rect.right < clientX ||
    rect.top > clientY || rect.bottom < clientY) {
    return null;
  }
  return range.toString();
}





//send to background.js ===========================================================================
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
