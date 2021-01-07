'use strict';
//inject translation tooltip based on user text hover event
//it gets translation and tts from background.js
//and also it handle pdf line break when current url is pdf url



//init environment======================================================================
import $ from "jquery";
require('popper.js');
require('bootstrap');





var clientX = 0;
var clientY = 0;
var clientXScroll = 0;
var clientYScroll = 0;
var activatedWord = null;
var translatedSentenceLen = 0;
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
    id: 'mttContainer',
    class: 'bootstrapiso',
    css: {
      "position": "absolute",
      "width": "200px",
      "top": "50%",
      "left": "50%",
      "margin-left": "-100px" /* Negative half of width. */
    }
  }).appendTo(document.body);

  $('#mttContainer').tooltip({
    placement: "top",
    container: "#mttContainer"
  });
});

//tooltip: word detection, show & hide
setInterval(function() {
  var word = getMouseOverWord(clientX, clientY);

  if (word.length != 0 && activatedWord != word) { //show tooltip, if current word is changed and word is not none
    translateSentence(word, "auto", "ko", function(translatedSentence, lang) {
      $('#mttContainer').attr('data-original-title', translatedSentence);
      activatedWord = word;
      translatedSentenceLen = translatedSentence.length;
      setTooltipPosition();
      if (translatedSentenceLen == 0) { //if no translated text given( when it is off), hide
        $("#mttContainer").tooltip("hide");
      }
      tts(word, lang);
    });
  } else if (word.length == 0 && activatedWord != null) { //hide tooltip, if activated word exist and current word is none
    activatedWord = null;
    $('#mttContainer').tooltip("hide");
  }
}, 700);

function setTooltipPosition() {
  if (activatedWord != null && translatedSentenceLen != 0) {
    $('#mttContainer').css('left', clientXScroll).css('top', clientYScroll);
    $("#mttContainer").tooltip("show");
  }
}

function getMouseOverWord(clientX, clientY) {
  var range = document.caretRangeFromPoint(clientX, clientY);
  //if no range or is not text, give null
  if (range == null || range.startContainer == null || range.startContainer.nodeType !== Node.TEXT_NODE) {
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




//pdf.js does not support new line, we need to add line break to show tooltip correctly
//pdf add line break space ===========================================================================
if (/\.pdf$/i.test(document.URL)) { //if current url is pdf
  document.addEventListener("webviewerloaded", function() {
    PDFViewerApplication.initializedPromise.then(function() {
      PDFViewerApplication.eventBus.on("documentloaded", function(event) { //when pdf loaded
        window.PDFViewerApplication.eventBus.on('textlayerrendered', function pagechange(evt) { //when textlayerloaded

          var lastY;
          var lastItem;
          $(".page span").each(function(index, item) { //for each span in page, iterate to give line break based on y pos
            var currentY = parseFloat($(this).css("top"));
            var currentFontSize = parseFloat($(this).css("font-size"));

            if (index === 0) { //skip first index

            } else {
              if (lastY < currentY - currentFontSize * 2 || currentY + currentFontSize * 2 < lastY) { //if y diff double, give end line
                if (!(/\n $/.test($(lastItem).text()))) { //if no end line, give end line
                  $(lastItem).text($(lastItem).text() + "\n ");
                }
              } else if (lastY < currentY - currentFontSize || currentY + currentFontSize < lastY) { // if y diff, give end space
                if (!(/ $/.test($(lastItem).text()))) { //if no end space, give end space
                  $(lastItem).text($(lastItem).text() + " ");
                }
              }
            }
            lastY = currentY
            lastItem = item;
          })
        })
      });
    });
  });
}