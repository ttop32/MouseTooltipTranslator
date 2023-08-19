"use strict";
// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js
//intercept pdf url

import $ from "jquery";
import "bootstrap/js/dist/tooltip";
var isUrl = require("is-url");
import { enableSelectionEndEvent, getSelectionText } from "./selection";
import { Setting } from "./setting";
import * as util from "./util.js";
import { encode } from "he";

//init environment var======================================================================\
var setting;
var tooltipContainer;
var clientX = 0;
var clientY = 0;
var mouseTarget = null;
var activatedWord = null;
var mouseMoved = false;
var mouseMovedCount = 0;
var keyDownList = {}; //use key down for enable translation partially
var style;
let selectedText = "";
var destructionEvent = "destructmyextension_MouseTooltipTranslator"; // + chrome.runtime.id;
const controller = new AbortController();
const { signal } = controller;
var mouseoverInterval;
var mouseoverIntervalTime = 700;
var rtlLangList = [
  "ar", //Arabic
  "iw", //Hebrew
  "ku", //Kurdish
  "fa", //Persian
  "ur", //Urdu
  "yi", //Yiddish
]; //right to left language system list

//tooltip core======================================================================
//tooltip init

$(async function() {
  loadDestructor(); //remove previous tooltip script
  addElementEnv(); //add tooltip container
  await getSetting(); //load setting
  applyStyleSetting(); //add tooltip style
  detectPDF(); //check current page is pdf
  loadEventListener(); //load event listener to detect mouse move
  startMouseoverDetector(); // start current mouseover text detector
  startTextSelectDetector(); // start current text select detector
});

//determineTooltipShowHide based on hover, check mouse over word on every 700ms
function startMouseoverDetector() {
  mouseoverInterval = setInterval(async function() {
    // only work when tab is activated and when mousemove and no selected text
    if (
      !selectedText &&
      mouseMoved &&
      document.visibilityState == "visible" &&
      setting["translateWhen"].includes("mouseover")
    ) {
      let word = getMouseOverWord(clientX, clientY);
      await processWord(word, "mouseover");
    }
  }, mouseoverIntervalTime);
}

//determineTooltipShowHide based on selection
function startTextSelectDetector() {
  enableSelectionEndEvent(); //set mouse drag text selection event
  addEventHandler("selectionEnd", async function(event) {
    // if translate on selection is enabled
    if (
      document.visibilityState === "visible" &&
      setting["translateWhen"].includes("select")
    ) {
      selectedText = event.selectedText;
      await processWord(selectedText, "select");
    }
  });
}

//process detected word
async function processWord(word, actionType) {
  // skip if mouse target is tooltip
  if (checkMouseTargetIsTooltip()) {
    return;
  }

  word = filterWord(word); //filter out one that is url,over 1000length,no normal char

  //hide tooltip, if activated word exist and current word is none
  //do nothing, if no new word or no word change
  if (!word && activatedWord) {
    activatedWord = word;
    hideTooltip();
    return;
  } else if (activatedWord == word || !word) {
    return;
  }

  //stage current processing word
  activatedWord = word;
  var {
    translatedText,
    sourceLang,
    targetLang,
    transliteration,
  } = await translate(word);
  //if translated text is empty, hide tooltip
  // if translation is not recent one, do not update
  if (
    !translatedText ||
    sourceLang == targetLang ||
    setting["langExcludeList"].includes(sourceLang) ||
    word == translatedText
  ) {
    hideTooltip();
    return;
  } else if (activatedWord != word) {
    return;
  }

  //if tooltip is on or activation key is pressed, show tooltip
  //if current word is recent activatedWord
  if (
    setting["useTooltip"] == "true" ||
    keyDownList[setting["keyDownTooltip"]]
  ) {
    var tooltipText = concatTransliteration(translatedText, transliteration);
    showTooltip(tooltipText, targetLang);
    updateRecentTranslated(word, translatedText, actionType);
  }

  //if use_tts is on or activation key is pressed, do tts
  if (setting["useTTS"] == "true" || keyDownList[setting["keyDownTTS"]]) {
    tts(word, sourceLang);
  }
}

function getMouseOverWord(x, y) {
  var range = util.caretRangeFromPoint(x, y);
  var range = range ? range : util.caretRangeFromPointOnShadowDom(x, y);
  //if no range, skip
  if (range == null) {
    return "";
  }

  //expand char to get word,sentence based on setting
  //if swap key pressed, swap detect type
  //if mouse target is special web block, handle as block
  var detectType = setting["detectType"];
  detectType = keyDownList[setting["keyDownDetectSwap"]]
    ? detectType == "word"
      ? "sentence"
      : "word"
    : detectType;
  detectType = checkMouseTargetIsSpecialWebBlock() ? "container" : detectType;
  expandRange(range, detectType);

  if (!util.checkXYInElement(range, x, y)) {
    return "";
  }
  return range.toString();
}

function expandRange(range, type) {
  try {
    if (type == "container") {
      range.setStartBefore(range.startContainer);
      range.setEndAfter(range.startContainer);
      range.setStart(range.startContainer, 0);
    } else {
      range.expand(type); // "word" or "sentence"
    }
  } catch (error) {
    console.log(error);
  }
}

function checkMouseTargetIsSpecialWebBlock() {
  var specialClassNameList = [
    "ytp-caption-segment", //youtube caption
    "ocr_text_div", //mousetooltip ocr block
  ];
  // if mouse targeted web element contain particular class name, return true
  return specialClassNameList.some((className) =>
    mouseTarget.classList.contains(className)
  );
}

function checkMouseTargetIsTooltip() {
  if (tooltipContainer.has(mouseTarget).length) {
    return true;
  }
  return false;
}

function filterWord(word) {
  if (!word) {
    return "";
  }
  // filter one that only include num,space and special char(include currency sign) as combination
  word = word.replace(/\s+/g, " "); //replace whitespace as single space
  word = word.trim(); // remove whitespaces from begin and end of word
  if (
    word.length > 1000 || //filter out text that has over 1000length
    isUrl(word) || //if it is url
    !/[^\s\d»«…~`!@#$%^&*()‑_+\-=\[\]{};、':"\\|,.<>\/?\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6\p{Extended_Pictographic}]/gu.test(
      word
    )
  ) {
    word = "";
  }
  return word;
}

function showTooltip(text, lang) {
  hideTooltip(); //reset tooltip arrow
  checkTooltipContainer();
  setTooltipPosition("showTooltip");
  applyLangAlignment(lang);
  tooltipContainer.attr("data-original-title", text); //place text on tooltip
  tooltipContainer.tooltip("show");
}

function hideTooltip() {
  tooltipContainer.tooltip("hide");
}

function applyLangAlignment(lang) {
  var isRtl = rtlLangList.includes(lang) ? "rtl" : "ltr";
  tooltipContainer.attr("dir", isRtl);
}

function checkTooltipContainer() {
  //restart container if not exist
  if (!tooltipContainer.parent().is("body")) {
    tooltipContainer.appendTo(document.body);
    style.appendTo("head");
  }
}

function setTooltipPosition(calledFrom = "") {
  if (calledFrom == "showTooltip" && setting["tooltipPosition"] == "follow") {
    return;
  } else if (
    calledFrom == "mousemove" &&
    setting["tooltipPosition"] == "fixed"
  ) {
    return;
  }

  tooltipContainer.css(
    "transform",
    "translate(" + clientX + "px," + clientY + "px)"
  );
}

async function translate(word) {
  var response = await translateSentence(word, setting["translateTarget"]);

  //if to,from lang are same and reverse translate on
  if (
    setting["translateTarget"] == response.sourceLang &&
    setting["translateReverseTarget"] != "null"
  ) {
    response = await translateSentence(word, setting["translateReverseTarget"]);
  }

  return response;
}

function concatTransliteration(translatedText, transliteration) {
  // if no transliteration or setting is off, skip
  if (!transliteration || setting["useTransliteration"] == "false") {
    return encode(translatedText);
  }
  return `${encode(translatedText)}<br><br> <h5>${encode(
    transliteration
  )}</h5>`;
}

//event Listener - detect mouse move, key press, mouse press, tab switch==========================================================================================

function loadEventListener() {
  //use mouse position for tooltip position
  addEventHandler("mousemove", (e) => {
    //if mouse moved far distance two times, check as mouse moved
    if (
      mouseMoved == false &&
      Math.abs(e.clientX - clientX) + Math.abs(e.clientY - clientY) > 3
    ) {
      if (mouseMovedCount < 2) {
        mouseMovedCount += 1;
      } else {
        mouseMoved = true;
      }
    }
    clientX = e.clientX;
    clientY = e.clientY;
    mouseTarget = e.target;
    checkImage();
    setTooltipPosition("mousemove");
  });

  //detect activation hold key pressed
  addEventHandler("keydown", (e) => {
    //if user pressed ctrl+f  ctrl+a, hide tooltip
    if ((e.code == "KeyF" || e.code == "KeyA") && e.ctrlKey) {
      mouseMoved = false;
      hideTooltip();
      return;
    }

    if (keyDownList[e.code] == true) {
      return;
    }
    keyDownList[e.code] = true;

    if (
      [
        setting["keyDownTooltip"],
        setting["keyDownTTS"],
        setting["keyDownDetectSwap"],
      ].includes(e.code)
    ) {
      // check activation hold key pressed, run tooltip again with key down value
      activatedWord = null; //restart word process
      if (selectedText != "") {
        //restart select if selected value exist
        processWord(selectedText, "select");
      }
    }
  });

  addEventHandler("keyup", (e) => {
    if (keyDownList.hasOwnProperty(e.code)) {
      keyDownList[e.code] = false;
    }
  });

  //detect tab switching to reset env
  addEventHandler("blur", (e) => {
    keyDownList = {}; //reset key press
    mouseMoved = false;
    mouseMovedCount = 0;
    selectedText = "";
    activatedWord = null;
    hideTooltip();
    stopTTS();
  });

  // when refresh web site, stop tts
  addEventHandler("beforeunload", (e) => {
    stopTTS();
  });
}

//send to background.js for background processing  ===========================================================================
function sendMessagePromise(params) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(params, (response) => {
        resolve(response);
      });
    } catch (e) {
      if (e.message == "Extension context invalidated.") {
        console.log();
      } else {
        console.log(e);
      }
    }
  });
}

async function translateSentence(word, translateTarget) {
  return await sendMessagePromise({
    type: "translate",
    word: word,
    translateTarget: translateTarget,
  });
}

async function tts(word, lang) {
  return await sendMessagePromise({
    type: "tts",
    word: word,
    lang: lang,
  });
}

async function stopTTS() {
  return await sendMessagePromise({
    type: "stopTTS",
  });
}

//send history to background.js
async function updateRecentTranslated(sourceText, targetText, actionType) {
  return await sendMessagePromise({
    type: "updateRecentTranslated",
    sourceText,
    targetText,
    actionType,
  });
}

// setting handling===============================================================

function settingUpdateCallbackFn(changes) {
  applyStyleSetting();
  selectedText = "";
  removeOcrBlock();
  initIframeTesseract();
}

async function getSetting() {
  setting = await Setting.loadSetting(await util.getDefaultData());
  setting.addUpdateCallback(settingUpdateCallbackFn);
}

function applyStyleSetting() {
  style.html(
    `
    #mttContainer {
      left: 0 !important;
      top: 0 !important;
      width: 1000px !important;
      margin-left: -500px !important;
      height: ` +
      setting["tooltipDistance"] * 2 +
      `px  !important;
      margin-top: ` +
      -setting["tooltipDistance"] +
      `px  !important;
      position: fixed !important;
      z-index: 100000200 !important;
      background: none !important;
      pointer-events: none !important;
      display: inline-block !important;
    }
    .bootstrapiso .tooltip {
      width:auto  !important;
      height:auto  !important;
      background: none !important;
      border:none !important;
      border-radius: 0px !important;
      visibility: visible  !important;
      pointer-events: none !important;
    }
    .bootstrapiso .tooltip-inner {
      font-size: ` +
      setting["tooltipFontSize"] +
      `px  !important;
      max-width: ` +
      setting["tooltipWidth"] +
      `px  !important;
      text-align: ` +
      setting["tooltipTextAlign"] +
      ` !important;
      backdrop-filter: blur(` +
      setting["tooltipBackgroundBlur"] +
      `px)  !important; 
      background-color: ` +
      setting["tooltipBackgroundColor"] +
      ` !important;
      color: ` +
      setting["tooltipFontColor"] +
      ` !important;
      pointer-events: auto;
    }
    .bootstrapiso .arrow::before {
      border-top-color: ` +
      setting["tooltipBackgroundColor"] +
      ` !important;
    }
    .bootstrapiso .arrow::after {
      display:none !important;
    }
    .ocr_text_div{
      position: absolute;
      opacity: 0.7;
      font-size: 20px;
      overflow: hidden;
      border: 2px solid CornflowerBlue;
      color: transparent !important;
      background: none !important;
    }
    `
  );
}

function detectPDF() {
  if (setting["detectPDF"] == "true") {
    if (document.body.children[0].type == "application/pdf") {
      window.location.replace(
        chrome.runtime.getURL("/pdfjs/web/viewer.html") +
          "?file=" +
          encodeURIComponent(window.location.href)
      );
    }
  }
}

function addElementEnv() {
  tooltipContainer = $("<div/>", {
    id: "mttContainer",
    class: "bootstrapiso notranslate", //use bootstrapiso class to apply bootstrap isolation css, prevent google web translate
    "data-html": "true",
  }).appendTo(document.body);

  tooltipContainer.tooltip({
    placement: "top",
    container: "#mttContainer",
    trigger: "manual",
  });

  style = $("<style/>", {
    id: "mttstyle",
  }).appendTo("head");
}

//destruction ===================================

function loadDestructor() {
  // https://stackoverflow.com/questions/25840674/chrome-runtime-sendmessage-throws-exception-from-content-script-after-reloading/25844023#25844023
  // Unload previous content script if needed
  window.dispatchEvent(new CustomEvent(destructionEvent)); //call destructor to remove script
  addEventHandler(destructionEvent, destructor); //add destructor listener for later remove
}

function destructor() {
  clearInterval(mouseoverInterval); //clear mouseover interval
  removePrevElement(); //remove element
  controller.abort(); //clear all event Listener by controller signal
}

function addEventHandler(eventName, callbackFunc) {
  //record event for later event signal kill
  return window.addEventListener(eventName, callbackFunc, { signal });
}

function removePrevElement() {
  $("#mttstyle").remove();
  $("#mttContainer").tooltip("dispose");
  $("#mttContainer").remove();
  for (let key in iFrames) {
    iFrames[key].remove();
  }
  removeOcrBlock();
}

//ocr==================================================================================
var ocrHistory = {};
var iFrames = {};
var ocrBlock = [];

//detect mouse positioned image to process ocr in ocr.html iframe
//create text box from ocr result
async function checkImage() {
  // if mouse target is not image or ocr is not on, skip
  // if already ocr processed,skip
  if (
    setting["useOCR"] == "false" ||
    !checkMouseTargetIsImage() ||
    (ocrHistory[mouseTarget.src] &&
      ocrHistory[mouseTarget.src]["lang"] == setting["ocrDetectionLang"])
  ) {
    return;
  }
  var ratio = 1;
  var ele = mouseTarget;
  var url = ele.src;
  var ocrBaseData = {
    mainUrl: url,
    lang: setting["ocrDetectionLang"],
  };
  ocrHistory[url] = ocrBaseData;

  setElementMouseStatusLoading(ele);
  await initOCR();

  var base64Url = await getBase64Image(url);

  //run both,  ocr with opencv rect, ocr without opencv
  // const start = Date.now();
  await Promise.all([
    processOcr(ocrBaseData, base64Url, ele, "BLUE", ratio),
    processOcr(ocrBaseData, base64Url, ele, "RED", ratio, "segment"),
  ]);
  // const end = Date.now();
  // console.log(`Execution time: ${end - start} ms`);

  setElementMouseStatusIdle(ele);
}

async function base64Resize(base64Url) {
  return await getMessageResponse({ type: "resizeImage", base64Url });
}

function setElementMouseStatusLoading(ele) {
  ele.style.cursor = "wait"; //show mouse loading
}
function setElementMouseStatusIdle(ele) {
  ele.style.cursor = "";
}

async function processOcr(
  ocrBaseData,
  base64Url,
  mouseTarget,
  color,
  ratio,
  mode = ""
) {
  var bboxList = [];

  //ocr process with opencv , then display
  if (mode == "segment") {
    var { bboxList, base64Url, cvratio } = await requestSegmentBox(
      ocrBaseData,
      base64Url
    );
    if (bboxList.length == 0) {
      return;
    }
    ratio *= cvratio;
    await Promise.all(
      bboxList.map(async (bbox) => {
        await getOcrAndShow(ocrBaseData, base64Url, mouseTarget, color, ratio, [
          bbox,
        ]);
      })
    );
  } else {
    await getOcrAndShow(
      ocrBaseData,
      base64Url,
      mouseTarget,
      color,
      ratio,
      bboxList
    );
  }
}

async function getOcrAndShow(
  ocrBaseData,
  base64Url,
  mouseTarget,
  color,
  ratio,
  bboxList
) {
  var res = await requestOcr(ocrBaseData, bboxList, base64Url);
  showOcrData(mouseTarget, res.ocrData, ratio, color);
}

async function initOCR() {
  await createIframe("ocrFrame", "/ocr.html");
  await createIframe("opencvFrame", "/opencvHandler.html");
  initIframeTesseract();
}

function initIframeTesseract() {
  getMessageResponse({
    type: "initTesseract",
    lang: setting["ocrDetectionLang"],
  });
}

async function createIframe(name, htmlPath) {
  return new Promise(function(resolve, reject) {
    if (iFrames[name]) {
      resolve();
      return;
    }

    var showFrame = false;
    var css = showFrame
      ? {
          width: "700",
          height: "700",
        }
      : { display: "none" };

    iFrames[name] = $("<iframe />", {
      name: name,
      id: name,
      src: chrome.runtime.getURL(htmlPath),
      css,
    })
      .appendTo("body")
      .on("load", function() {
        resolve();
      })
      .get(0);
  });
}

function showOcrData(target, ocrData, ratio, color) {
  var textBoxList = getTextBoxList(ocrData);

  for (var textBox of textBoxList) {
    createOcrTextBlock(target, textBox, ratio, color);
  }
}

function getTextBoxList(ocrData) {
  var textBoxList = [];
  for (var ocrDataItem of ocrData) {
    var { data } = ocrDataItem;
    for (var block of data.blocks) {
      // for (var paragraph of block.paragraphs) {
      var text = filterOcrText(block["text"]);
      text = filterWord(text); //filter out one that is url,over 1000length,no normal char
      // console.log(text);
      // console.log(block["confidence"]);

      //if string contains only whitespace, skip
      if (/^\s*$/.test(text) || text.length < 3 || block["confidence"] < 60) {
        continue;
      }

      block["confidence"] = parseInt(block["confidence"]);
      block["text"] = text;
      textBoxList.push(block);
      // }
    }
  }
  return textBoxList;
}

function createOcrTextBlock(target, textBox, ratio, color) {
  //init bbox
  var $div = $("<div/>", {
    class: "ocr_text_div notranslate",
    text: textBox["text"],
    css: {
      border: "2px solid " + color,
    },
  }).appendTo(target.parentElement);

  // change z-index
  var zIndex =
    Math.max(0, 100000 - getBboxSize(textBox["bbox"])) + textBox["confidence"];
  $div.css("z-index", zIndex);

  // position
  setLeftTopWH(target, textBox["bbox"], $div, ratio);
  $(window).on("resize", (e) => {
    setLeftTopWH(target, textBox["bbox"], $div, ratio);
  });

  //record current ocr block list for future delete
  ocrBlock.push($div);
}

function getBboxSize(bbox) {
  return (bbox["x1"] - bbox["x0"]) * (bbox["y1"] - bbox["y0"]);
}

function setLeftTopWH(target, bbox, $div, ratio) {
  var offsetLeft = target.offsetLeft;
  var offsetTop = target.offsetTop;
  var widthRatio = target.offsetWidth / target.naturalWidth;
  var heightRatio = target.offsetHeight / target.naturalHeight;
  var x = (widthRatio * bbox["x0"]) / ratio;
  var y = (heightRatio * bbox["y0"]) / ratio;
  var w = (widthRatio * (bbox["x1"] - bbox["x0"])) / ratio;
  var h = (heightRatio * (bbox["y1"] - bbox["y0"])) / ratio;
  var left = offsetLeft + x;
  var top = offsetTop + y;

  $div.css({
    left: left + "px",
    top: top + "px",
    width: w + "px",
    height: h + "px",
  });
}

function filterOcrText(text) {
  return text.replace(
    /[`・〉«¢~「」〃ゝゞヽヾ●▲♩ヽ÷①↓®▽■◆『£〆∴∞▼™↑←~@#$%^&“*()_|+\-=;【】:'"<>\{\}\[\]\\\/]/gi,
    ""
  ); //remove special char
}

function getBase64Image(url) {
  return new Promise(function(resolve, reject) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        var reader = new FileReader();
        reader.onload = function() {
          resolve(this.result); // <--- `this.result` contains a base64 data URI
        };
        reader.readAsDataURL(blob);
      })
      .catch(async (error) => {
        // console.error('Error:', error);
        var { base64Url } = await getMessageResponse({
          type: "getBase64",
          url,
        });
        resolve(base64Url);
      });
  });
}

async function requestOcr(ocrBaseData, bboxList, base64Url) {
  return await getMessageResponse(
    $.extend(ocrBaseData, { type: "ocr", bboxList, base64Url })
  );
}
async function requestSegmentBox(ocrBaseData, base64Url) {
  return await getMessageResponse(
    $.extend(ocrBaseData, { type: "segmentBox", base64Url })
  );
}

async function getMessageResponse(data) {
  return new Promise(function(resolve, reject) {
    var timeId = Date.now() + Math.random();
    data["timeId"] = timeId;

    //listen iframe response
    addEventHandler("message", function namedListener(response) {
      if (response.data.timeId == timeId) {
        window.removeEventListener("click", namedListener);
        resolve(response.data);
      }
    });

    //broadcast message to iframe
    for (var key in iFrames) {
      iFrames[key].contentWindow.postMessage(data, "*");
    }
  });
}

function checkMouseTargetIsImage() {
  // loaded image that has big enough size,
  if (
    mouseTarget != null &&
    mouseTarget.src &&
    mouseTarget.tagName === "IMG" &&
    mouseTarget.complete &&
    mouseTarget.naturalHeight !== 0 &&
    mouseTarget.width > 300 &&
    mouseTarget.height > 300
  ) {
    return true;
  }
  return false;
}

function removeOcrBlock() {
  ocrBlock.forEach((block, i) => block.remove());
}
