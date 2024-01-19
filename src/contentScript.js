// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js
//intercept pdf url

import $ from "jquery";
import tippy, { sticky, hideAll } from "tippy.js";
import { encode } from "he";
import matchUrl from "match-url-wildcard";
import { debounce } from "throttle-debounce";

import {
  enableSelectionEndEvent,
  getSelectionText,
} from "/src/event/selection";
import { enableMouseoverTextEvent } from "/src/event/mouseover";
import * as util from "/src/util";
import * as ocrView from "/src/ocr/ocrView.js";
import video from "./subtitle/subtitle.js";

//init environment var======================================================================\
var setting;
var tooltip;
var clientX = 0;
var clientY = 0;
var mouseTarget = null;
var activatedWord = null;
var mouseMoved = false;
var mouseMovedCount = 0;
var keyDownList = { always: true }; //use key down for enable translation partially
var style;
let selectedText = "";
var destructionEvent = "destructmyextension_MouseTooltipTranslator"; // + chrome.runtime.id;
const controller = new AbortController();
const { signal } = controller;
var mouseoverInterval;
var delayTime = 700;
var isBlobPdf = false;
var prevWordParam = [];
var mouseKeyMap = ["ClickLeft", "ClickMiddle", "ClickRight"];
var prevTooltipText = "";
var tooltipContainer;
var tooltipContainerEle;

//tooltip core======================================================================
$(async function initMouseTooltipTranslator() {
  try {
    loadDestructor(); //remove previous tooltip script
    await getSetting(); //load setting
    if (checkExcludeUrl()) {
      return;
    }
    await detectPDF(); //check current page is pdf
    checkVideo();
    checkGoogleDocs();
    addElementEnv(); //add tooltip container
    applyStyleSetting(); //add tooltip style
    addBackgroundListener();
    loadEventListener(); //load event listener to detect mouse move
    startMouseoverDetector(); // start current mouseover text detector
    startTextSelectDetector(); // start current text select detector
  } catch (error) {
    console.log(error);
  }
});

//determineTooltipShowHide based on hover, check mouse over word on every 700ms
function startMouseoverDetector() {
  enableMouseoverTextEvent();
  addEventHandler("mouseoverText", async function (event) {
    // if no selected text
    if (setting["translateWhen"].includes("mouseover") && !selectedText) {
      var mouseoverText = event?.mouseoverText?.[getDetectType()];
      var mouseoverRange = event?.mouseoverText?.[getDetectType() + "_range"];
      await processWord(mouseoverText, "mouseover", mouseoverRange);
    }
  });
}

//determineTooltipShowHide based on selection
function startTextSelectDetector() {
  enableSelectionEndEvent(window); //set mouse drag text selection event
  addEventHandler("selectionEnd", async function (event) {
    // if translate on selection is enabled
    if (setting["translateWhen"].includes("select")) {
      selectedText = event?.selectedText;
      await processWord(selectedText, "select");
    }
  });
}

//process detected word
async function processWord(word, actionType, range) {
  prevWordParam = Array.prototype.slice.call(arguments); //record args
  word = util.filterWord(word); //filter out one that is url,no normal char
  var isTooltipOn = keyDownList[setting["showTooltipWhen"]];
  var isTtsOn = keyDownList[setting["TTSWhen"]];

  // skip if mouse target is tooltip or no text, if no new word or  tab is not activated
  // hide tooltip, if  no text
  // if tooltip is off, hide tooltip
  if (
    !checkWindowFocus() ||
    checkMouseTargetIsTooltip() ||
    activatedWord == word
  ) {
    return;
  } else if (!word) {
    activatedWord = word;
    hideTooltip();
    return;
  } else if (!isTooltipOn) {
    hideTooltip();
  }

  //stage current processing word
  activatedWord = word;
  var { translatedText, sourceLang, targetLang, transliteration } =
    await translateWithReverse(
      word,
      setting["translateSource"],
      setting["translateTarget"],
      setting["translateReverseTarget"]
    );

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
  if (isTooltipOn) {
    var tooltipTransliteration =
      setting["useTransliteration"] == "true" ? transliteration : "";
    var tooltipLang =
      setting["showSourceLang"] == "true"
        ? util.langListOpposite[sourceLang]
        : "";
    var tooltipText = wrapRtlHtml(translatedText, targetLang);
    tooltipText += concatTooltipText(tooltipTransliteration, tooltipLang);
    var resetPrevTooltip = prevTooltipText != tooltipText;
    prevTooltipText = tooltipText;

    showTooltip(tooltipText, resetPrevTooltip);
    requestRecordTooltipText(
      word,
      translatedText,
      sourceLang,
      targetLang,
      actionType
    );
    highlightText(range);
  }

  //if use_tts is on or activation key is pressed, do tts
  if (isTtsOn) {
    var wordWithoutEmoji = util.filterEmoji(word);
    requestTTS(wordWithoutEmoji, sourceLang, translatedText, targetLang);
  }
}

function highlightText(range) {
  if (!range || setting["highlightMouseoverText"] == "false") {
    return;
  }
  hideHighlight();
  var rects = range.getClientRects();
  rects = util.filterOverlappedRect(rects);
  var adjustX = window.scrollX;
  var adjustY = window.scrollY;
  if (util.isEbookReader()) {
    var ebookViewerRect = util.getEbookIframe()?.getBoundingClientRect();
    adjustX += ebookViewerRect?.left;
    adjustY += ebookViewerRect?.top;
  }

  for (var rect of rects) {
    $("<div/>", {
      class: "mtt-highlight",
      css: {
        position: "absolute",
        left: rect.left + adjustX,
        top: rect.top + adjustY,
        width: rect.width,
        height: rect.height,
      },
    }).appendTo("body");
  }
}

function restartWordProcess() {
  //trigger mouseover text by reset activate word
  //restart selected text
  activatedWord = null;
  if (selectedText) {
    processWord(...prevWordParam);
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
  // if mouse targeted web element contain particular class name, return true
  //mousetooltip ocr block
  return ["ocr_text_div", "textFitted"].some((className) =>
    mouseTarget?.classList?.contains(className)
  );
}

function checkMouseTargetIsTooltip() {
  try {
    return $(tooltip?.popper)?.get(0)?.contains(mouseTarget);
  } catch (error) {
    return false;
  }
}

function checkWindowFocus() {
  return mouseMoved && document.visibilityState == "visible";
}

function showTooltip(text, resetPrevTooltip) {
  hideTooltip(resetPrevTooltip); //reset tooltip arrow
  tooltip?.setContent(text);
  tooltip?.show();
}

function hideTooltip(resetPrevTooltip = false) {
  if (resetPrevTooltip) {
    hideAll({ duration: 0 }); //hide all tippy
  }
  tooltip?.hide();
  hideHighlight();
}

function hideHighlight() {
  $(".mtt-highlight")?.remove();
}

async function translateWithReverse(word, sourceLang, targetLang, reverseLang) {
  var response = await requestTranslate(word, sourceLang, targetLang);
  //if to,from lang are same and reverse translate on
  if (
    !response.isBroken &&
    targetLang == response.sourceLang &&
    reverseLang != "null" &&
    targetLang != reverseLang
  ) {
    response = await requestTranslate(word, response.sourceLang, reverseLang);
  }
  return response;
}

function wrapRtlHtml(translatedText, targetLang) {
  var text = `<span dir=${util.isRtl(targetLang)} class="notranslate">${encode(
    translatedText
  )}</span>`;
  return text;
}

function concatTooltipText(...texts) {
  texts = texts.filter((text) => text);
  var concatText = "";
  for (var text of texts) {
    concatText += `<br><span style="font-weight:bold;">${encode(text)}</span>`;
  }
  return concatText;
}

//Translate Writing feature==========================================================================================
async function translateWriting() {
  //check current focus is write box and hot key pressed
  // if is google doc do not check writing box
  if (
    !keyDownList[setting["keyDownTranslateWriting"]] ||
    (!util.getFocusedWritingBox() && !util.isGoogleDoc())
  ) {
    return;
  }

  // get writing text
  var writingText = getWritingText();
  if (!writingText) {
    return;
  }
  // translate
  var { translatedText, isBroken } = await translateWithReverse(
    writingText,
    "auto",
    setting["writingLanguage"],
    setting["translateTarget"]
  );
  if (isBroken) {
    return;
  }

  insertText(translatedText);
}

function getWritingText() {
  // get current selected text, if no select, select all to get all
  if (window.getSelection().type == "Caret") {
    document.execCommand("selectAll", false, null);
  }
  return getSelectionText(true);
}

function insertText(inputText) {
  if (!inputText) {
    return;
  }
  document.execCommand("insertHTML", false, inputText);
  pasteTextGoogleDoc(inputText);
}

function pasteTextGoogleDoc(text) {
  if (!util.isGoogleDoc()) {
    return;
  }
  // https://github.com/matthewsot/docs-plus
  var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0];
  el = el.contentDocument.querySelector("[contenteditable=true]");

  var data = new DataTransfer();
  data.setData("text/plain", text);
  var paste = new ClipboardEvent("paste", {
    clipboardData: data,
    data: text,
    dataType: "text/plain",
  });
  paste.docs_plus_ = true;

  el.dispatchEvent(paste);
}

// Listener - detect mouse move, key press, mouse press, tab switch==========================================================================================
function loadEventListener() {
  //use mouse position for tooltip position
  addEventHandler("mousemove", handleMousemove);
  addEventHandler("touchstart", handleTouchstart);

  //detect activation hold key pressed
  addEventHandler("keydown", handleKeydown);
  addEventHandler("keyup", handleKeyup);
  addEventHandler("mousedown", handleMouseKeyDown);
  addEventHandler("mouseup", handleMouseKeyUp);

  //detect tab switching to reset env
  addEventHandler("blur", handleBlur);
}

function handleMousemove(e) {
  //if mouse moved far distance two times, check as mouse moved
  if (!checkMouseOnceMoved(e.clientX, e.clientY)) {
    setMouseStatus(e);
    return;
  }
  setMouseStatus(e);
  setTooltipPosition(e.clientX, e.clientY);
  ocrView.checkImage(mouseTarget, setting, keyDownList);
  checkWritingBox();
}

function handleTouchstart(e) {
  mouseMoved = true;
}

function handleKeydown(e) {
  //if user pressed ctrl+f  ctrl+a, hide tooltip
  if (/KeyA|KeyF/.test(e.code) && e.ctrlKey) {
    mouseMoved = false;
    hideTooltip();
  } else if (e.code == "Escape") {
    requestStopTTS();
  } else if (e.key == "Alt") {
    e.preventDefault(); // prevent alt site unfocus
  }

  holdKeydownList(e.code);
}

function handleKeyup(e) {
  releaseKeydownList(e.code);
}

function handleMouseKeyDown(e) {
  holdKeydownList(mouseKeyMap[e.button]);
}
function handleMouseKeyUp(e) {
  releaseKeydownList(mouseKeyMap[e.button]);
}

function holdKeydownList(key) {
  // skip text key
  if (key && !keyDownList[key] && !/Key|Digit|Numpad/.test(key)) {
    keyDownList[key] = true;
    restartWordProcess();
    translateWriting();
  }
}

function releaseKeydownList(key) {
  keyDownList[key] = false;
}

function handleBlur(e) {
  keyDownList = { always: true }; //reset key press
  mouseMoved = false;
  mouseMovedCount = 0;
  selectedText = "";
  activatedWord = null;
  hideTooltip();
  ocrView.removeAllOcrEnv();
}

function setMouseStatus(e) {
  clientX = e.clientX;
  clientY = e.clientY;
  mouseTarget = e.target;
}
function setTooltipPosition(x, y) {
  tooltipContainer?.css("transform", `translate(${x}px,${y}px)`);
}

const checkWritingBox = debounce(delayTime, () => {
  // if mouse target is not writing box or already bound, return
  // make key bind for preventDefault
  var $writingField = $(util.writingField);
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

// setting handling===============================================================

async function getSetting() {
  setting = await util.loadSetting(function settingCallbackFn() {
    applyStyleSetting();
    selectedText = "";
    ocrView.removeAllOcrEnv();
    checkVideo();
  });
}

function applyStyleSetting() {
  var isSticky = setting["tooltipPosition"] == "follow";
  tooltip.setProps({
    offset: [0, setting["tooltipDistance"]],
    sticky: isSticky ? "reference" : "popper",
    appendTo: isSticky ? tooltipContainerEle : document.body,
    animation: setting["tooltipAnimation"],
  });

  var cssText = `
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
      visibility: visible  !important;
    }
    .tippy-box[data-theme~="custom"] {
      font-size: ${setting["tooltipFontSize"]}px  !important;
      max-width: ${setting["tooltipWidth"]}px  !important;
      text-align: ${setting["tooltipTextAlign"]} !important;
      backdrop-filter: blur(${setting["tooltipBackgroundBlur"]}px) !important;
      background-color: ${setting["tooltipBackgroundColor"]} !important;
      color: ${setting["tooltipFontColor"]} !important;
      overflow-wrap: break-word !important;
      font-family: Arial !important;
    }
    [data-tippy-root] {
      display: inline-block !important;
      visibility: visible  !important;
      position: absolute !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='top'] > .tippy-arrow::before {
      border-top-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='bottom'] > .tippy-arrow::before {
      border-bottom-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='left'] > .tippy-arrow::before {
      border-left-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='right'] > .tippy-arrow::before {
      border-right-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .mtt-highlight{
      background-color: ${setting["highlightColor"]}  !important;
      position: absolute !important;   
      z-index: 100000100 !important;
      pointer-events: none !important;
      display: inline !important;
      border-radius: 3px !important;
    }
    .ocr_text_div{
      position: absolute;
      opacity: 0.7;
      color: transparent !important;
      border: 2px solid CornflowerBlue;
      background: none !important;
    }`;

  cssText +=
    setting["enableYoutube"] != "null"
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
        .ytp-pause-overlay {
          display: none !important;
        }
        .ytp-expand-pause-overlay .caption-window {
          display: block !important;
        }
      `
      : "";

  style.html(cssText);
}

// url check and element env===============================================================
async function detectPDF() {
  if (
    setting["detectPDF"] == "true" &&
    document?.body?.children?.[0]?.type == "application/pdf"
  ) {
    addPdfListener();
    openPdfIframe(window.location.href);
  }
}
function addPdfListener() {
  //if pdf not working message come, try open using blob url
  util.addFrameListener("pdfErrorLoadDocument", openPdfIframeBlob);
}

async function openPdfIframeBlob() {
  if (isBlobPdf) {
    return;
  }
  isBlobPdf = true;
  // wrap url for bypass referrer check, sciencedirect
  var url = window.location.href;
  var blob = await fetch(url).then((r) => r.blob());
  var url = URL.createObjectURL(blob);
  openPdfIframe(url);
}

function openPdfIframe(url) {
  $("embed").remove();

  $("<embed/>", {
    src: chrome.runtime.getURL(
      `/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`
    ),
    css: {
      display: "block",
      border: "none",
      height: "100vh",
      width: "100vw",
    },
  }).appendTo("body");
}

function checkExcludeUrl() {
  // iframe parent url check
  var url =
    window.location != window.parent.location
      ? document.referrer
      : document.location.href;
  return matchUrl(url, setting["websiteExcludeList"]);
}

async function addElementEnv() {
  tooltipContainer = $("<div/>", {
    id: "mttContainer",
  }).appendTo(document.body);
  tooltipContainerEle = tooltipContainer.get(0);

  style = $("<style/>", {
    id: "mttstyle",
  }).appendTo("head");

  tooltip = tippy(tooltipContainerEle, {
    content: "",
    trigger: "manual",
    allowHTML: true,
    theme: "custom",
    zIndex: 100000200,
    hideOnClick: false,
    role: "mtttooltip",
    interactive: true,
    plugins: [sticky],
  });
}

async function checkGoogleDocs() {
  if (!util.isGoogleDoc()) {
    return;
  }

  interceptGoogleDocKeyEvent();
}

async function interceptGoogleDocKeyEvent() {
  await util.waitUntilForever(() => $(".docs-texteventtarget-iframe")?.get(0));
  var iframe = $(".docs-texteventtarget-iframe")?.get(0);

  ["keydown", "keyup"].forEach((eventName) => {
    iframe?.contentWindow.addEventListener(eventName, (e) => {
      var evt = new CustomEvent(eventName, {
        bubbles: true,
        cancelable: false,
      });
      evt.key = e?.key;
      evt.code = e?.code;
      evt.ctrlKey = e?.ctrlKey;
      window.dispatchEvent(evt);
      document.dispatchEvent(evt);
    });
  });
}

// youtube================================
async function checkVideo() {
  video["Youtube"].handleVideo(setting);
  video["YoutubeNoCookie"].handleVideo(setting);
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
  tooltip?.destroy();
  ocrView.removeAllOcrEnv();
}
