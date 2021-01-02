'use strict';

//handle translation and setting
//it communicate with popup.js(for setting) and contentScript.js(for translattion)
//for setting, it save and load from chrome storage
//for translation, it uses ajax to get translated  result


//tooltip background===========================================================================
import $ from "jquery";
var currentSetting = {};
var defaultList = {
  "useTooltip": "true",
  "useTTS": "false",
  "translateSource": "auto",
  "translateTarget": window.navigator.language,
  "keyDownTooltip": "null",
  "keyDownTTS": "null"
}
var currentAudio = null;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'translate') {
    $.ajax({
      url: 'https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex',
      data: {
        q: request.word,
        sl: currentSetting["translateSource"], //source lang
        tl: currentSetting["translateTarget"] //target lang
      },
      dataType: 'json',
      success: function(data) {
        var translatedText = "";
        if (data.sentences) {
          data.sentences.forEach(function(sentences) {
            if (sentences.trans) {
              translatedText += sentences.trans;
            }
          })
        }
        var lang = null;
        if (data.src) {
          var lang = data.src;
        }
        //if source lang is equal to target lang
        //if tooltip is not on and activation key is not pressed,  clear translation
        if (currentSetting["translateTarget"] == lang || (currentSetting["useTooltip"] == "false" && !request.keyDownList[currentSetting["keyDownTooltip"]])) {
          translatedText = "";
        }

        sendResponse({
          "translatedText": translatedText,
          "lang": lang
        });
      },
      error: function(xhr, status, error) {
        console.log({
          error: error,
          xhr: xhr
        })
      }
    });
  } else if (request.type === 'tts') {
    //if use_tts is on or activation key is pressed
    if (currentSetting["useTTS"] == "true" || request.keyDownList[currentSetting["keyDownTTS"]]) {
      if (currentAudio != null) { //stop current played tts
        currentAudio.pause();
      }
      //split word in 200 length
      //play 200 leng tts seqeuntly using ended callback
      var splittedWord = request.word.match(/.{1,200}/g); //split word in 200length
      var prevAudio = null;
      splittedWord.forEach(function(value, i) {
        var soundUrl = "https://translate.googleapis.com/translate_tts?client=dict-chrome-ex&ie=UTF-8&tl=" + request.lang + "&q=" + encodeURIComponent(value);
        var audio = new Audio(soundUrl);
        if (i == 0) {
          currentAudio = audio;
        } else {
          prevAudio.addEventListener("ended", function() {
            currentAudio = audio;
            currentAudio.play();
          });
        }
        prevAudio = audio;
      });
      currentAudio.play();
    }
    sendResponse({});
  } else if (request.type === 'saveSetting') {
    saveSetting(request.options);
  } else if (request.type === 'loadSetting') {
    sendResponse(currentSetting);
  }
  return true;
});


function saveSetting(options) {
  chrome.storage.local.set(options, function() {
    currentSetting = options;
  });
}

function loadSetting() {
  var keys = Object.keys(defaultList);
  chrome.storage.local.get(keys, function(options) {
    if (!options["useTooltip"]) {
      currentSetting = defaultList
    } else {
      currentSetting = options;
    }
  });
}
loadSetting();
