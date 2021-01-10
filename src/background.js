'use strict';

//handle translation, setting and pdf
//it communicate with popup.js(for setting) and contentScript.js(for translattion)
//for setting, it save and load from chrome storage
//for translation, it uses ajax to get translated  result
//for pdf, it intercept pdf url and redirect to translation tooltip pdf.js

//tooltip background===========================================================================
import $ from "jquery";
var isUrl = require('is-url');
//import Tesseract from 'tesseract.js';



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
        var lang = (data.src) ? data.src : null; //if data.src is exist, give data.src

        //if word is url
        //if source lang is equal to target lang
        //if tooltip is not on and activation key is not pressed,
        //then, clear translation
        if (isUrl(request.word) || currentSetting["translateTarget"] == lang || (currentSetting["useTooltip"] == "false" && !request.keyDownList[currentSetting["keyDownTooltip"]])) {
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
    if (currentSetting["translateTarget"] != request.lang && (currentSetting["useTTS"] == "true" || request.keyDownList[currentSetting["keyDownTTS"]])) {
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
    chrome.storage.local.set(request.options, function() {
      currentSetting = request.options;
    });
  } else if (request.type === 'loadSetting') {
    sendResponse(currentSetting);
  }

  return true;
});


function loadSetting() {
  var keys = Object.keys(defaultList);
  chrome.storage.local.get(keys, function(options) {
    for (var key in defaultList) {
      if (!options[key]) {
        currentSetting[key] = defaultList[key];
      } else {
        currentSetting[key] = options[key];
      }
    }
  });
}
loadSetting();

// //intercept pdf url and redirect to translation tooltip pdf.js ===========================================================
// for online pdf url
chrome.webRequest.onHeadersReceived.addListener(({
  url,
  method,
  responseHeaders
}) => {
  const header = responseHeaders.filter(h => h.name.toLowerCase() === 'content-type').shift();
  if (header) {
    const headerValue = header.value.toLowerCase().split(';', 1)[0].trim();
    if (headerValue === 'application/pdf') {
      return {
        redirectUrl: chrome.runtime.getURL('/pdfjs/web/viewer.html') + '?file=' + encodeURIComponent(url)
      }
    }
  }
}, {
  urls: ['<all_urls>'],
  types: ['main_frame', "sub_frame"]
}, ['blocking', 'responseHeaders']);


//for local pdf url
chrome.webRequest.onBeforeRequest.addListener(function({
  url,
  method
}) {
  if (/\.pdf$/i.test(url)) { // if the resource is a PDF file ends with ".pdf"
    return {
      redirectUrl: chrome.runtime.getURL('/pdfjs/web/viewer.html') + '?file=' + encodeURIComponent(url) //url
    };
  }
}, {
  urls: ["file:///*/*.pdf", "file:///*/*.PDF"],
  types: ['main_frame']
}, ['blocking']);
