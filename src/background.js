'use strict';

//handle translation, setting and pdf
//it communicate with popup.js(for setting) and contentScript.js(for translattion)
//for setting, it save and load from chrome storage
//for translation, it uses ajax to get translated  result
//for pdf, it intercept pdf url and redirect to translation tooltip pdf.js

//tooltip background===========================================================================
import $ from "jquery";
var isUrl = require('is-url');



var currentSetting = {};
var defaultList = {
  "useTooltip": "true",
  "useTTS": "false",
  "translateSource": "auto",
  "translateTarget": window.navigator.language,
  "keyDownTooltip": "null",
  "keyDownTTS": "null",
  "useOCR": "false",
  "ocrDetectionLang": "jpn_vert"
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
        currentAudio = null;
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
          audio.play();
        } else {
          prevAudio.addEventListener("ended", function() {
            currentAudio = audio;
            currentAudio.play();
          });
        }
        prevAudio = audio;
      });
    }
    sendResponse({});
  } else if (request.type === 'stopTTS') {
    if (currentAudio != null) { //stop current played tts
      currentAudio.pause();
      currentAudio = null;
    }
    sendResponse({});
  } else if (request.type === 'saveSetting') {
    chrome.storage.local.set(request.options, function() {
      currentSetting = request.options;
    });
  } else if (request.type === 'loadSetting') {
    loadSetting(sendResponse);
  } else if (request.type === 'ocr') {
    doOcr(request, sendResponse);
  }
  return true;
});


function loadSetting(callback) {
  chrome.storage.local.get(Object.keys(defaultList), function(options) { //load setting
    $.each(defaultList, function(key, item) {
      if (options[key]) { //if value exist, load. else load defualt val
        currentSetting[key] = options[key];
      } else {
        currentSetting[key] = defaultList[key];
      }
    });
    if (typeof callback !== 'undefined') {
      callback(currentSetting);
    };
  });
}
loadSetting();


// ocr ===========================================================
var ocrSchedulerList = {};
var recentText = "";
var recentMainUrl = "";
var recentLang = "";
var recentImage = document.createElement("canvas");
var recentCanvasCropped = document.createElement("canvas");


async function doOcr(request, sendResponse) {
  if (request.mainUrl != recentMainUrl) { // load image if mainurl diff
    recentImage = await loadImage(request.mainUrl);
    recentMainUrl = request.mainUrl;
  }

  var croppedImage = await cropText(recentImage, request.px, request.py); //crop image using opencv to only get mouse pointed area

  //if same as previouse image and same lang, skip ocr
  if (isMatch(croppedImage, recentCanvasCropped) && recentLang == currentSetting["ocrDetectionLang"]) {
    var currentText = recentText;
  } else {
    var currentText = await useTesseract(croppedImage);
    recentCanvasCropped = croppedImage;
    recentText = currentText;
    recentLang = currentSetting["ocrDetectionLang"];
  }
  sendResponse({
    "text": currentText,
    "mainUrl": request.mainUrl,
    "time": request.time
    // "crop": croppedImage.toDataURL()
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    var image = new Image(); //image get
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}


//use paint bucket brush method to
//fill mouse positioned bubble background
//and get that masked area
function cropText(img, x, y) {
  return new Promise(function(resolve, reject) {
    let src = cv.imread(img);
    let gray = new cv.Mat();
    let maskInside = new cv.Mat();
    let segmentedImg = new cv.Mat();

    //preprocessing, make gray
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    //paint bubble background
    let maskBubble = new cv.Mat(gray.rows + 2, gray.cols + 2, cv.CV_8U, [0, 0, 0, 0])
    cv.floodFill(gray, maskBubble, {
      x: x,
      y: y
    }, [130, 128, 0, 255], {}, [5, 5, 5, 5], [5, 5, 5, 5], 4 | (255 << 8));
    cv.threshold(maskBubble, maskBubble, 50, 255, cv.THRESH_BINARY) //use floolfill border as empty space

    //get only bubble inside area, (paint bubble outside and get inside using inverse
    let maskOutside = new cv.Mat(maskBubble.rows + 2, maskBubble.cols + 2, cv.CV_8U, [0, 0, 0, 0])
    cv.floodFill(maskBubble, maskOutside, {
      x: 1,
      y: 1
    }, [255, 255, 255, 255], {}, [0, 0, 0, 0], [0, 0, 0, 0], 4 | (255 << 8));
    maskOutside = maskOutside.roi(new cv.Rect(2, 2, maskOutside.cols - 4, maskOutside.rows - 4)); //previous two flood fill expand border, shrink it
    cv.bitwise_not(maskOutside, maskInside); //src,dst

    //crop image based on  bubble inside area mask
    src.copyTo(segmentedImg, maskInside); //dst, mask     //show only masked area
    let cropTextImg = segmentedImg.roi(cv.boundingRect(maskInside)); //crop to fit masked area

    // // crop without background bubble
    // //text crop
    // let maskBubbleInside = new cv.Mat();
    // let bubbleInside = new cv.Mat();
    // maskBubble = maskBubble.roi(new cv.Rect(1, 1, maskBubble.cols - 2, maskBubble.rows - 2)); //previous two flood fill expand border, shrink it
    // cv.bitwise_not(maskBubble, maskBubbleInside); //src,dst
    // src.copyTo(bubbleInside, maskBubbleInside); //dst, mask     //show only masked area
    // //give bound
    // var rect = cv.boundingRect(maskBubbleInside);
    // rect.x = Math.max(rect.x - 15, 0);
    // rect.y = Math.max(rect.y - 15, 0);
    // rect.width = Math.min(rect.width + 30, bubbleInside.rows - 1);
    // rect.height = Math.min(rect.height + 30, bubbleInside.cols - 1);
    // //white background
    // bubbleInside = bubbleInside.roi(rect); //crop to fit masked area
    // let gray2 = new cv.Mat();
    // let gray3 = new cv.Mat();
    // var maskOutsideCropped = maskBubble.roi(rect);
    // cv.cvtColor(bubbleInside, gray2, cv.COLOR_RGBA2GRAY, 0);
    // cv.add(gray2, maskOutsideCropped, gray3);

    let canvas = document.createElement("canvas");
    cv.imshow(canvas, cropTextImg);
    src.delete();
    gray.delete();
    maskBubble.delete();
    maskInside.delete();
    maskOutside.delete();
    segmentedImg.delete();
    cropTextImg.delete();
    resolve(canvas);
  });
}

function isMatch(data1, data2) { //compare canvas
  if (data1.width != data2.width || data1.height != data2.height) { //check length
    return false
  }
  for (var i = 0; i < data1.length; i++) { //check value
    if (data1[i] != data2[i]) return false;
  }
  return true;
}

//create ocr worker and processs ocr
function useTesseract(image) {
  return new Promise(async function(resolve, reject) {
    if (ocrSchedulerList[currentSetting["ocrDetectionLang"]] == null) {
      ocrSchedulerList[currentSetting["ocrDetectionLang"]] = Tesseract.createScheduler();
    }

    // var start = Math.floor(Date.now() / 1000);
    if (ocrSchedulerList[currentSetting["ocrDetectionLang"]].getNumWorkers() < 2) { //if no worker, create worker
      if (currentSetting["ocrDetectionLang"] == "jpn_vert") {
        var worker1 = Tesseract.createWorker({
          "workerPath": chrome.runtime.getURL("/tesseract/worker.min.js"),
          "corePath": chrome.runtime.getURL("/tesseract/tesseract-core.wasm.js"),
          "langPath": chrome.runtime.getURL("/traindata"), //https://github.com/zodiac3539/jpn_vert
          "gzip": false
        });
      } else {
        var worker1 = Tesseract.createWorker({
          "workerPath": chrome.runtime.getURL("/tesseract/worker.min.js"),
          "corePath": chrome.runtime.getURL("/tesseract/tesseract-core.wasm.js"),
          "langPath": "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_fast" //3.02,4.0.0_fast,4.0.0, 4.0.0_best //https://github.com/naptha/tessdata
        });
      }

      await worker1.load();
      await worker1.loadLanguage(currentSetting["ocrDetectionLang"]);
      await worker1.initialize(currentSetting["ocrDetectionLang"]);
      await worker1.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO_ONLY,
        tessjs_create_hocr: "0",
        tessjs_create_tsv: "0"
      });
      ocrSchedulerList[currentSetting["ocrDetectionLang"]].addWorker(worker1);
    }
    var {
      data: {
        text
      }
    } = await ocrSchedulerList[currentSetting["ocrDetectionLang"]].addJob('recognize', image); //do ocr
    text = text.replace(/[`~@#$%^&*()_|+\-=;:'"<>\{\}\[\]\\\/]/gi, ''); //remove speical char

    // var end = Math.floor(Date.now() / 1000);
    // console.log("time taken" + (end - start));
    // console.log(text);
    resolve(text);
  });
}


// intercept pdf url and redirect to translation tooltip pdf.js ===========================================================
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
