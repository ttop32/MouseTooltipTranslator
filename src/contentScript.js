// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js
//intercept pdf url

import $ from "jquery";
import "bootstrap/js/dist/tooltip";
import { enableSelectionEndEvent } from "/src/event/selection";
import { enableMouseoverTextEvent } from "/src/event/mouseover";
import { encode } from "he";
import matchUrl from "match-url-wildcard";
import * as util from "/src/util";
import * as ocrView from "/src/ocr/ocrView.js";
import delay from "delay";
import { debounce } from "throttle-debounce";

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
var writingField =
  'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable="true"], [role=textbox], [spellcheck]';
var isYoutubeDetected = false;
var delayTime = 700;

//tooltip core======================================================================
$(async function initMouseTooltipTranslator() {
  loadDestructor(); //remove previous tooltip script
  await getSetting(); //load setting
  if (checkExcludeUrl()) {
    return;
  }
  detectPDF(); //check current page is pdf
  checkYoutube();
  addElementEnv(); //add tooltip container
  applyStyleSetting(); //add tooltip style
  addBackgroundListener();
  loadEventListener(); //load event listener to detect mouse move
  startMouseoverDetector(); // start current mouseover text detector
  startTextSelectDetector(); // start current text select detector
});

//determineTooltipShowHide based on hover, check mouse over word on every 700ms
function startMouseoverDetector() {
  enableMouseoverTextEvent();
  addEventHandler("mouseoverText", async function (event) {
    // only work when tab is activated and when mousemove and no selected text
    if (
      checkWindowFocus() &&
      !selectedText &&
      setting["translateWhen"].includes("mouseover")
    ) {
      var mouseoverText = event.mouseoverText[getDetectType()];
      await processWord(mouseoverText, "mouseover");
    }
  });
}

//determineTooltipShowHide based on selection
function startTextSelectDetector() {
  enableSelectionEndEvent(); //set mouse drag text selection event
  addEventHandler("selectionEnd", async function (event) {
    // if translate on selection is enabled
    if (checkWindowFocus() && setting["translateWhen"].includes("select")) {
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
  word = util.filterWord(word); //filter out one that is url,no normal char

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
  var { translatedText, sourceLang, targetLang, transliteration } =
    await translateWithReverse(word);

  //if translated text is empty, hide tooltip
  // if translation is not recent one, do not update
  if (
    !translatedText ||
    sourceLang == targetLang ||
    setting["langExcludeList"].includes(sourceLang)
  ) {
    hideTooltip();
    return;
  } else if (activatedWord != word) {
    return;
  }

  //if tooltip is on or activation key is pressed, show tooltip
  //if current word is recent activatedWord
  if (
    setting["showTooltipWhen"] == "always" ||
    keyDownList[setting["showTooltipWhen"]]
  ) {
    var tooltipText = concatTransliteration(translatedText, transliteration);
    showTooltip(tooltipText, targetLang);
    requestRecordTooltipText(
      word,
      translatedText,
      sourceLang,
      targetLang,
      actionType
    );
  } else {
    hideTooltip();
  }

  //if use_tts is on or activation key is pressed, do tts
  if (setting["TTSWhen"] == "always" || keyDownList[setting["TTSWhen"]]) {
    requestTTS(word, sourceLang, translatedText, targetLang);
  }
}

function restartWordProcess() {
  var word = activatedWord;
  activatedWord = null;
  if (selectedText) {
    processWord(selectedText, "select");
  } else {
    processWord(word, "mouseover");
  }
}

function getDetectType() {
  //if swap key pressed, swap detect type
  //if mouse target is special web block, handle as block
  var detectType = setting["detectType"];
  detectType = keyDownList[setting["keyDownDetectSwap"]]
    ? detectType == "word"
      ? "sentence"
      : "word"
    : detectType;

  detectType = checkMouseTargetIsSpecialWebBlock() ? "container" : detectType;
  return detectType;
}

function checkMouseTargetIsSpecialWebBlock() {
  var specialClassNameList = [
    "ocr_text_div", //mousetooltip ocr block
  ];
  // if mouse targeted web element contain particular class name, return true
  return specialClassNameList.some((className) =>
    mouseTarget.classList?.contains(className)
  );
}

function checkMouseTargetIsTooltip() {
  if (tooltipContainer.has(mouseTarget).length) {
    return true;
  }
  return false;
}

function checkWindowFocus() {
  return mouseMoved && document.visibilityState == "visible";
}

function showTooltip(text, lang) {
  hideTooltip(); //reset tooltip arrow
  checkTooltipContainer();
  setTooltipPosition("showTooltip");
  applyRtl(lang);
  tooltipContainer.attr("data-original-title", text); //place text on tooltip
  tooltipContainer.tooltip("show");
}

function hideTooltip() {
  tooltipContainer.tooltip("hide");
}

function applyRtl(lang) {
  tooltipContainer.attr("dir", util.isRtl(lang));
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

async function translateWithReverse(word) {
  var response = await requestTranslate(
    word,
    setting["translateSource"],
    setting["translateTarget"]
  );
  //if to,from lang are same and reverse translate on
  if (
    setting["translateTarget"] == response.sourceLang &&
    setting["translateReverseTarget"] != "null"
  ) {
    response = await requestTranslate(
      word,
      response.sourceLang,
      setting["translateReverseTarget"]
    );
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

//Translate Writing feature==========================================================================================
async function translateWriting(keyInput) {
  //check current focus is write box
  if (
    setting["keyDownTranslateWriting"] != keyInput ||
    !getFocusedWritingBox()
  ) {
    return;
  }

  // get writing text
  var writingText = getWritingText();
  if (!writingText) {
    return;
  }
  // translate
  var { translatedText, isBroken } = await requestTranslate(
    writingText,
    "auto",
    setting["writingLanguage"]
  );

  if (isBroken) {
    return;
  }

  insertText(translatedText);
}

function insertText(inputText) {
  if (!inputText) {
    return;
  }
  // document.execCommand("delete", false, null);
  document.execCommand("insertHTML", false, inputText);
  // document.execCommand("insertText", false, inputText);
}

function getFocusedWritingBox() {
  var writingBox = $(":focus");
  return writingBox.is(writingField) ? writingBox : null;
}

function getWritingText() {
  // get current selected text, if no select, get all
  if (window.getSelection().type == "Caret") {
    document.execCommand("selectAll", false, null);
  }

  //get html
  var writingText = "";
  var sel = window.getSelection();
  var html = "";
  if (sel.rangeCount) {
    var container = document.createElement("div");
    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
      container.appendChild(sel.getRangeAt(i).cloneContents());
    }
    html = container.innerHTML;
  }

  // if no html format text , get as string
  writingText = html.toString() ? html : window.getSelection().toString();
  return writingText;
}

// Listener - detect mouse move, key press, mouse press, tab switch==========================================================================================
function loadEventListener() {
  //use mouse position for tooltip position
  addEventHandler("mousemove", handleMousemove);
  //detect activation hold key pressed
  addEventHandler("keydown", handleKeydown);
  addEventHandler("keyup", handleKeyup);
  //detect tab switching to reset env
  addEventHandler("blur", handleBlur);
  // when refresh web site, stop tts
  addEventHandler("beforeunload", handleBeforeunload);
}

function handleMousemove(e) {
  //if mouse moved far distance two times, check as mouse moved
  if (!checkMouseOnceMoved(e.clientX, e.clientY)) {
    setMouseStatus(e);
    return;
  }
  setMouseStatus(e);
  ocrView.checkImage(setting, mouseTarget, keyDownList);
  checkWritingBox();
  setTooltipPosition("mousemove");
  checkMouseTargetIsYoutubeSubtitle();
}

function handleKeydown(e) {
  //if user pressed ctrl+f  ctrl+a, hide tooltip
  if ((e.code == "KeyF" || e.code == "KeyA") && e.ctrlKey) {
    mouseMoved = false;
    hideTooltip();
    return;
  }
  if (e.key == "Escape") {
    requestStopTTS();
  }

  // check already pressed or key is not setting key
  if (
    keyDownList[e.code] ||
    ![
      setting["showTooltipWhen"],
      setting["TTSWhen"],
      setting["keyDownDetectSwap"],
      setting["keyDownTranslateWriting"],
      setting["keyDownOCR"],
    ].includes(e.code)
  ) {
    return;
  }

  //reset status to restart process with keybind
  keyDownList[e.code] = true;
  restartWordProcess();
  translateWriting(e.code);
  if (e.key == "Alt") {
    e.preventDefault(); // prevent alt site unfocus
  }
}

function handleKeyup(e) {
  if (keyDownList.hasOwnProperty(e.code)) {
    keyDownList[e.code] = false;
  }
}

function handleBlur(e) {
  keyDownList = {}; //reset key press
  mouseMoved = false;
  mouseMovedCount = 0;
  selectedText = "";
  activatedWord = null;
  hideTooltip();
  requestStopTTS();
  requestRemoveAllContext();
  ocrView.removeAllOcrEnv();
}
function handleBeforeunload() {
  requestStopTTS();
  requestRemoveAllContext();
}

function setMouseStatus(e) {
  clientX = e.clientX;
  clientY = e.clientY;
  mouseTarget = e.target;
}

const checkWritingBox = debounce(delayTime, () => {
  // if mouse target is not writing box or already bound, return
  // make key bind for preventDefault
  var $writingField = $(writingField);
  if (!$writingField.is(mouseTarget) || $writingField.data("mttBound")) {
    return;
  }
  $writingField
    .data("mttBound", true)
    .on("keydown", handleKeydown)
    .on("keyup", handleKeyup);
});

function checkMouseOnceMoved(x, y) {
  if (
    mouseMoved == false &&
    Math.abs(x - clientX) + Math.abs(y - clientY) > 3 &&
    mouseMovedCount < 3
  ) {
    mouseMovedCount += 1;
  } else if (3 <= mouseMovedCount) {
    mouseMoved = true;
  }
  return mouseMoved;
}

function addBackgroundListener() {
  //handle copy
  util.addMessageListener("CopyRequest", (message) => {
    util.copyTextToClipboard(message.text);
  });
}

//send to background.js for background processing  ===========================================================================

async function requestTranslate(word, translateSource, translateTarget) {
  return await util.sendMessage({
    type: "translate",
    word: word,
    translateSource,
    translateTarget,
  });
}

async function requestTTS(sourceText, sourceLang, targetText, targetLang) {
  return await util.sendMessage({
    type: "tts",
    sourceText,
    sourceLang,
    targetText,
    targetLang,
  });
}

async function requestStopTTS() {
  return await util.sendMessage({
    type: "stopTTS",
  });
}

//send history to background.js
async function requestRecordTooltipText(
  sourceText,
  targetText,
  sourceLang,
  targetLang,
  actionType
) {
  return await util.sendMessage({
    type: "recordTooltipText",
    sourceText,
    targetText,
    sourceLang,
    targetLang,
    actionType,
  });
}

async function requestRemoveAllContext() {
  return await util.sendMessage({
    type: "removeContextAll",
  });
}

// setting handling===============================================================

async function getSetting() {
  setting = await util.loadSetting(function settingCallbackFn() {
    applyStyleSetting();
    selectedText = "";
    ocrView.removeAllOcrEnv();
    initYoutubePlayer();
  });
}

function applyStyleSetting() {
  style.html(
    `
    #mttContainer {
      left: 0 !important;
      top: 0 !important;
      width: 1000px !important;
      margin-left: -500px !important;
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
    .bootstrapiso  .bs-tooltip-top {
      margin-bottom: ${setting["tooltipDistance"]}px  !important;
    }
    .bootstrapiso  .bs-tooltip-bottom {
      margin-top: ${setting["tooltipDistance"]}px  !important;
    }
    .bootstrapiso .tooltip-inner {
      font-size: ${setting["tooltipFontSize"]}px  !important;
      max-width: ${setting["tooltipWidth"]}px  !important;
      text-align: ${setting["tooltipTextAlign"]} !important;
      backdrop-filter: blur(${setting["tooltipBackgroundBlur"]}px) !important;
      background-color: ${setting["tooltipBackgroundColor"]} !important;
      color: ${setting["tooltipFontColor"]} !important;
      pointer-events: auto;
    }
    .bootstrapiso .arrow::before {
      border-top-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .bootstrapiso .arrow {
      font-size: 14px  !important;
      margin: auto  !important;
    }
    .bootstrapiso .arrow::after {
      display:none !important;
    }
    .ocr_text_div{
      position: absolute;
      opacity: 0.7;
      font-size: calc(100% + 1cqw);
      overflow: hidden;
      border: 2px solid CornflowerBlue;
      color: transparent !important;
      background: none !important;
    }

    ` +
      (isYoutubeDetected
        ? `
      #ytp-caption-window-container .ytp-caption-segment {
        cursor: text !important;
        user-select: text !important;
      }
      .caption-visual-line{
        display: flex  !important;
        align-items: stretch  !important;
      }
      .captions-text .caption-visual-line:first-of-type:after {
        content: '⣿⣿';
        background-color: #000000b8;
        display: inline-block;
        vertical-align: top;
        opacity:0;
        transition: opacity 0.7s ease-in-out;
      }
      .captions-text:hover .caption-visual-line:first-of-type:after {
        opacity:1;
      }
    `
        : "")
  );
}

// url check and element env===============================================================
function detectPDF() {
  if (setting["detectPDF"] == "true") {
    if (
      document.body.children[0] &&
      document.body.children[0].type == "application/pdf"
    ) {
      window.location.replace(
        chrome.runtime.getURL("/pdfjs/web/viewer.html") +
          "?file=" +
          encodeURIComponent(window.location.href)
      );
    }
  }
}

function checkExcludeUrl() {
  // iframe parent url check
  var url =
    window.location != window.parent.location
      ? document.referrer
      : document.location.href;
  return matchUrl(url, setting["websiteExcludeList"]);
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
    boundary: "document",
  });

  style = $("<style/>", {
    id: "mttstyle",
  }).appendTo("head");
}

// youtube================================
async function checkYoutube() {
  if (
    !matchUrl(document.location.href, "www.youtube.com") ||
    setting["enableYoutube"] == "null"
  ) {
    return;
  }
  isYoutubeDetected = true;
  await util.injectScript("youtube.js");
  initYoutubePlayer();
  addCaptionButtonListener();
}

async function addCaptionButtonListener() {
  await delay(2000);
  $(".ytp-subtitles-button").on("click", (e) => {
    handleCaptionOnOff();
  });
  $(document).on("keydown", (e) => {
    if (e.code == "KeyC") {
      handleCaptionOnOff();
    }
  });
}

function handleCaptionOnOff() {
  var captionOnStatusByUser = $(".ytp-subtitles-button").attr("aria-pressed");
  setting["captionOnStatusByUser"] = captionOnStatusByUser;
  setting.save();
}

function pausePlayer() {
  util.postMessage({ type: "pausePlayer" });
}
function playPlayer() {
  util.postMessage({ type: "playPlayer" });
}
function initYoutubePlayer() {
  if (isYoutubeDetected) {
    util.postMessage({
      type: "initYoutubePlayer",
      targetLang: setting["translateTarget"],
      subSetting: setting["enableYoutube"],
      captionOnStatusByUser: setting["captionOnStatusByUser"],
    });
  }
}

function checkMouseTargetIsYoutubeSubtitle() {
  if (!isYoutubeDetected || !$(mouseTarget).is(".ytp-caption-segment")) {
    return;
  }
  // make subtitle selectable
  $(".ytp-caption-segment")
    .off()
    .on("contextmenu", (e) => {
      e.stopPropagation();
    })
    .on("mousedown", (e) => {
      $(".caption-window").attr("draggable", "false");
      e.stopPropagation();
    });

  // skip embed video
  if (document.location.href.includes("www.youtube.com/embed")) {
    return;
  }
  // add auto pause when mouseover
  $(".caption-window")
    .off()
    .on("mouseenter", (e) => {
      pausePlayer();
    })
    .on("mouseleave", (e) => {
      playPlayer();
    });
  pausePlayer();
}

//destruction ===================================
function loadDestructor() {
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
  ocrView.removeAllOcrEnv();
}
