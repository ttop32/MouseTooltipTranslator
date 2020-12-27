'use strict';

//inject translation tooltip based on user text hover event
//it gets translation and tts from background.js

//init environment======================================================================
var $ = require("jquery");
window.$ = $;
require('popper.js');
require('bootstrap');


var clientX = 0;
var clientY = 0;
var clientXScroll = 0;
var clientYScroll = 0;
var clientTarget = null;
var activatedWord = null;

//use mouse position for tooltip position
window.onmousemove = function(event) {
  clientX = event.clientX;
  clientY = event.clientY;
  clientYScroll = clientY + (document.documentElement.scrollTop ?
    document.documentElement.scrollTop :
    document.body.scrollTop);
  clientXScroll = clientX + (document.documentElement.scrollLeft ?
    document.documentElement.scrollLeft :
    document.body.scrollLeft);
  clientTarget = event.target;
}

//use key down for enable translation partially
var keyDownList = { //ctrl, shift, alt
  17: false,
  16: false,
  18: false
};
document.addEventListener("keydown", event => {
  for (var key in keyDownList) {
    if (event.keyCode == key.toString()) {
      keyDownList[key] = true;
    }
  }
});
document.addEventListener("keyup", event => {
  for (var key in keyDownList) {
    if (event.keyCode == key.toString()) {
      keyDownList[key] = false;
    }
  }
});

//tooltip core======================================================================

function getWordUnderMouse(clientX, clientY, target) {
  if (target == null) //no mouse target
    return null;
  var range = document.caretRangeFromPoint(clientX, clientY);
  if (range == null) //no range detected
    return null;
  if (range.startContainer.nodeType !== Node.TEXT_NODE) //is not text
    return null;
  //range.expand('word');
  range.expand('sentence');
  var rect = range.getBoundingClientRect(); //mouse in word rect
  if (rect.left > clientX || rect.right < clientX ||
    rect.top > clientY || rect.bottom < clientY) {
    return null;
  }
  return range.toString();
}

//tooltip: word detection, show & hide
setInterval(function() {
  var word = getWordUnderMouse(clientX, clientY, clientTarget)
  // detect word language code
  // var franc = require('franc')
  // var iso639_1 = require('iso-639-3/to-1')
  // var lang = iso639_1[franc(word, {minLength: 1  })];

  if (word != null && word.length != 0 && activatedWord != word) { //show, if current word is changed and word is not none
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
  } else if ((word == null || word.length == 0) && activatedWord != null) { //hide, if activated word exist and current word is none
    activatedWord = null;
    $('#bubble').attr('data-original-title', "");
    $('#bubble').tooltip("hide");
  }
}, 700);

//tooltip: mouse move
setInterval(function() {
  if (activatedWord != null) {
    $('#bubble').css('left', clientXScroll).css('top', clientYScroll);
    $("#bubble").tooltip("show");
  }
}, 10);


//tooltip: init
$(document).ready(function() {
  var bubble = document.createElement('div');
  bubble.id = 'bubble';
  bubble.style.position = "absolute";
  bubble.style.visibility = "visible";
  bubble.className = 'bootstrapiso';
  document.body.appendChild(bubble);

  $('#bubble').tooltip({
    placement: "top",
    //container: "#bubble"
  })

  // $('#bubble').on('show.bs.tooltip', function() {
  //   $($(this).data('bs.tooltip').tip).addClass('bootstrapiso');
  // });
});



//send background.js ===========================================================================

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
