'use strict';

//handle translation, setting and pdf
//it communicate with popup.js(for setting) and contentScript.js(for translattion,tts and ocr)
//for setting, it save and load from chrome storage
//for translation, it uses ajax to get translated  result
//for ocr, it get image src and return text
//for pdf, it intercept pdf url and redirect to translation tooltip pdf.js

//tooltip background===========================================================================
import $ from "jquery";
var loadScriptOnce = require('load-script-once');
const axios = require('axios');
// var crxHotreload = require('crx-hotreload');


var currentSetting = {};
var defaultList = {
  "useTooltip": "true",
  "useTTS": "false",
  "translateSource": "auto",
  "translateTarget": window.navigator.language,
  "translatorVendor": "google",
  "keyDownTooltip": "null",
  "keyDownTTS": "null",
  "tooltipFontSize": "14",
  "tooltipWidth":"200",
  'detectType': 'sentence',
  "translateReverseTarget" :"null",
  "useOCR": "false",
  "ocrDetectionLang": "jpn_vert",
}
var currentAudio = null;
var bingLangCode = {
  "auto": "auto-detect",
  'af': 'af',
  'am': 'am',
  'ar': 'ar',
  'az': 'az',
  'bg': 'bg',
  'bs': 'bs',
  'ca': 'ca',
  'cs': 'cs',
  'cy': 'cy',
  'da': 'da',
  'de': 'de',
  'el': 'el',
  'en': 'en',
  'es': 'es',
  'et': 'et',
  'fa': 'fa',
  'fi': 'fi',
  'fr': 'fr',
  'ga': 'ga',
  'gu': 'gu',
  'hi': 'hi',
  'hmn': 'mww',
  'hr': 'hr',
  'ht': 'ht',
  'hu': 'hu',
  'hy': 'hy',
  'id': 'id',
  'is': 'is',
  'it': 'it',
  'iw': 'he',
  'ja': 'ja',
  'kk': 'kk',
  'km': 'km',
  'kn': 'kn',
  'ko': 'ko',
  'ku': 'ku',
  'lo': 'lo',
  'lt': 'lt',
  'lv': 'lv',
  'mg': 'mg',
  'mi': 'mi',
  'ml': 'ml',
  'mr': 'mr',
  'ms': 'ms',
  'mt': 'mt',
  'my': 'my',
  'ne': 'ne',
  'nl': 'nl',
  'no': 'nb',
  'pa': 'pa',
  'pl': 'pl',
  'ps': 'ps',
  'pt': 'pt',
  'ro': 'ro',
  'ru': 'ru',
  'sk': 'sk',
  'sl': 'sl',
  'sm': 'sm',
  'sq': 'sq',
  'sr': 'sr-Cyrl',
  'sv': 'sv',
  'sw': 'sw',
  'ta': 'ta',
  'te': 'te',
  'th': 'th',
  'tl': 'fil',
  'tr': 'tr',
  'uk': 'uk',
  'ur': 'ur',
  'vi': 'vi',
  'zh-cn': 'zh-Hans',
  'zh-tw': 'zh-Hant'
};

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

var bingLangCodeOpposite = swap(bingLangCode); // swap key value



//listen from contents js and background js =========================================================================================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'translate') {
    doTranslate(request, sendResponse);

  } else if (request.type === 'tts') {
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
      loadOcrScript();
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
    loadOcrScript();
  });
}
loadSetting();





// translate ===========================================================

let bingGlobalConfig;
async function fetchBingGlobalConfig() {
  // https://github.com/plainheart/bing-translate-api
  function isTokenExpired() {
    if (!bingGlobalConfig) {
      return true
    }
    const { key, tokenExpiryInterval } = bingGlobalConfig
    return Date.now() - key > tokenExpiryInterval
  }

  if(isTokenExpired()){ //get new token if expired
    let token
    let key
    let tokenTs
    let tokenExpiryInterval
    try {
      const {data, headers}=await axios.get('https://www.bing.com/translator', );
      const [_key, _token, interval] = new Function(`return ${data.match(/params_RichTranslateHelper\s?=\s?([^\]]+\])/)[1]}`)();
      key =  _key;
      token = _token;
      tokenExpiryInterval = interval;
    } catch (e) {
      console.error('failed to fetch global config', e)
      throw e
    }
    return {
      key,
      token,
      tokenExpiryInterval,
    }
  }else{
    return bingGlobalConfig;
  }
}


async function doTranslate(request, sendResponse) {
  var detectedLang = "";
  var translatedText = "";

  if (currentSetting["translatorVendor"] == "google") {
    var translatorUrl = "https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex";
    var translatorData = {
      q: request.word,
      sl: currentSetting["translateSource"], //source lang
      tl: request.translateTarget //target lang
    };

  } else {
    bingGlobalConfig=await fetchBingGlobalConfig();
    var translatorUrl = "https://www.bing.com/ttranslatev3";
    var translatorData = {
      text: request.word,
      fromLang: bingLangCode[currentSetting["translateSource"]], //source lang
      to: bingLangCode[request.translateTarget], //target lang
      token:bingGlobalConfig.token,
      key:bingGlobalConfig.key,
    };
  }

  $.ajax({
    type: "POST",
    dataType: "json",
    url: translatorUrl,
    data: translatorData,
    success: function(data) {
      if (currentSetting["translatorVendor"] == "google") {
        if (data.sentences) {
          data.sentences.forEach(function(sentences) {
            if (sentences.trans) {
              translatedText += sentences.trans;
            }
          })
        }
        detectedLang = data.src;
      } else {  //if bing
        detectedLang = bingLangCodeOpposite[data[0]["detectedLanguage"]["language"]];
        translatedText = data[0]["translations"][0]["text"];
      }

      sendResponse({
        "translatedText": translatedText,
        "lang": detectedLang
      });
    },
    error: function(xhr, status, error) {
      console.log({
        error: error,
        xhr: xhr
      });
      sendResponse({
        "translatedText": "",
        "lang": "en"
      });
    }
  });
}


// ocr ===========================================================
var ocrSchedulerList = {};
var recentMainUrl = "";
var recentText = "";
var recentLang = "";
var recentImage = document.createElement("canvas");
var recentCanvasCropped = document.createElement("canvas");

function loadOcrScript() {
  if (currentSetting["useOCR"] == "true") {
    loadScriptOnce(chrome.extension.getURL("/opencv/opencv.js"));
    loadScriptOnce(chrome.extension.getURL("/tesseract/tesseract.min.js"));
  }
}

async function doOcr(request, sendResponse) {
  try {
    await loadScriptOnce(chrome.extension.getURL("/opencv/opencv.js")); //load script for ocr, if already loaded, it just go
    await loadScriptOnce(chrome.extension.getURL("/tesseract/tesseract.min.js"));

    if (request.mainUrl != recentMainUrl) { // load image if mainurl diff
      recentMainUrl = request.mainUrl;
      recentImage = await loadImage(request.mainUrl);
    } else if (request.base64Url != "") { //if same url and base64 received, use base64
      recentImage = await loadImage(request.base64Url);
    }

    var px = request.pxRatio * recentImage.naturalWidth;
    var py = request.pyRatio * recentImage.naturalHeight;
    var croppedImage = await cropText(recentImage, px, py); //crop image using opencv to only get mouse pointed area
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
      "success": "true",
      "text": currentText,
      "mainUrl": request.mainUrl,
      "time": request.time,
      "crop": "" //croppedImage.toDataURL()
    });
  } catch (err) {
    sendResponse({
      "success": "false",
      "text": "",
      "mainUrl": request.mainUrl,
      "time": request.time,
      "crop": "" //croppedImage.toDataURL()
    });
  }
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
    let cropTextImgResize = new cv.Mat();

    //preprocessing, make gray
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.adaptiveThreshold(gray, gray, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 61, 4);
    // cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU)

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

    //resize image to fit 350px
    //too small image need to be larger to recognize correctly
    //too large image's ocr speed is slow
    var maxSize = 350;
    var rowsNew = cropTextImg.rows;
    var colsNew = cropTextImg.cols;
    colsNew = colsNew * maxSize / rowsNew;
    rowsNew = maxSize;
    if (maxSize < colsNew) {
      rowsNew = rowsNew * maxSize / colsNew;
      colsNew = maxSize;
    }
    cv.resize(cropTextImg, cropTextImgResize, new cv.Size(colsNew, rowsNew), 0, 0, cv.INTER_AREA);

    let canvas = document.createElement("canvas");
    cv.imshow(canvas, cropTextImgResize);
    src.delete();
    gray.delete();
    maskBubble.delete();
    maskInside.delete();
    maskOutside.delete();
    segmentedImg.delete();
    cropTextImg.delete();
    cropTextImgResize.delete();
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
    text = text.replace(/[`・〉«¢~「」〃ゝゞヽヾ●▲♩ヽ÷①↓®▽■◆『£〆∴∞▼™↑←~@#$%^&*()_|+\-=;:'"<>\{\}\[\]\\\/]/gi, ''); //remove speical char

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
  //skip download header
  const header1 = responseHeaders.filter(h => h.name.toLowerCase() === 'content-disposition').shift();
  if (header1) {
    if (header1.value.toLowerCase().includes("attachment")) {
      return;
    }
  }

  //check content type is pdf
  const header2 = responseHeaders.filter(h => h.name.toLowerCase() === 'content-type').shift();
  if (header2) {
    if (header2.value.toLowerCase().includes("application/pdf") ) {
      return {
        redirectUrl: chrome.runtime.getURL('/pdfjs/web/viewer.html') + '?file=' + encodeURIComponent(url)
      }
    }
  }
}, {
  urls: ['<all_urls>'],
  types: ['main_frame', 'sub_frame']
}, ['blocking', 'responseHeaders']);


//for local pdf url
chrome.webRequest.onBeforeRequest.addListener(function({
  url,
  method
}) {
  return {
    redirectUrl: chrome.runtime.getURL('/pdfjs/web/viewer.html') + '?file=' + encodeURIComponent(url) //url
  };
}, {
  urls: ["file:///*/*.pdf", "file:///*/*.PDF"],
  types: ['main_frame']
}, ['blocking']);
