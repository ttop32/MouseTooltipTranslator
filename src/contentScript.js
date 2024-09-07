// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js
//intercept pdf url

import $ from "jquery";
import tippy, { sticky, hideAll } from "tippy.js";
import matchUrl from "match-url-wildcard";
import delay from "delay";
import browser from "webextension-polyfill";

import {
  enableSelectionEndEvent,
  getSelectionText,
} from "/src/event/selection";
import { enableMouseoverTextEvent } from "/src/event/mouseover";
import * as util from "/src/util";
import * as dom_util from "/src/util/dom";

import * as ocrView from "/src/ocr/ocrView.js";
import subtitle from "/src/subtitle/subtitle.js";
import { langListOpposite } from "/src/util/lang.js";

//init environment var======================================================================\
var setting;
var tooltip;
var style;
var styleSubtitle;
var tooltipContainer;
var tooltipContainerEle;

var clientX = 0;
var clientY = 0;
var mouseTarget = null;
var mouseMoved = false;
var mouseMovedCount = 0;
var keyDownList = { always: true }; //use key down for enable translation partially
var mouseKeyMap = ["ClickLeft", "ClickMiddle", "ClickRight"];

var destructionEvent = "destructmyextension_MouseTooltipTranslator"; // + chrome.runtime.id;
const controller = new AbortController();
const { signal } = controller;
var isBlobPdfOpened = false;

var selectedText = "";
var prevSelected = "";
var hoveredData = {};
var stagedText = null;
var prevTooltipText = "";

var tooltipRemoveTimeoutId = "";
var tooltipRemoveTime = 3000;

var listenText = "";

//tooltip core======================================================================

(async function initMouseTooltipTranslator() {
  try {
    injectGoogleDocAnnotation(); //check google doc and add annotation env var
    loadDestructor(); //remove previous tooltip script
    await getSetting(); //load setting
    if (checkExcludeUrl()) {
      return;
    }
    await waitJquery(); //wait jquery load
    detectPDF(); //check current page is pdf
    checkVideo(); // check  video  site for subtitle
    checkGoogleDocs(); // check google doc
    addElementEnv(); //add tooltip container
    applyStyleSetting(); //add tooltip style
    addBackgroundListener(); // get background listener for copy request
    loadEventListener(); //load event listener to detect mouse move
    loadSpeechRecognition();
    startMouseoverDetector(); // start current mouseover text detector
    startTextSelectDetector(); // start current text select detector
  } catch (error) {
    console.log(error);
  }
})();

//determineTooltipShowHide based on hover, check mouse over word on every 700ms
function startMouseoverDetector() {
  enableMouseoverTextEvent(window, setting["tooltipEventInterval"]);
  addEventHandler("mouseoverText", stageTooltipTextHover);
}

//determineTooltipShowHide based on selection
function startTextSelectDetector() {
  enableSelectionEndEvent(window, setting["tooltipEventInterval"]); //set mouse drag text selection event
  addEventHandler("selectionEnd", stageTooltipTextSelect);
}

function stageTooltipTextHover(event, useEvent = true) {
  hoveredData = useEvent ? event?.mouseoverText : hoveredData;
  // if mouseover detect setting is on and
  // if no selected text
  if (
    setting["translateWhen"].includes("mouseover") &&
    !selectedText &&
    !listenText &&
    hoveredData
  ) {
    var mouseoverType = getMouseoverType();
    var mouseoverText = hoveredData[mouseoverType];
    var mouseoverRange = hoveredData[mouseoverType + "_range"];
    stageTooltipText(mouseoverText, "mouseover", mouseoverRange);
  }
}

function stageTooltipTextSelect(event, useEvent = true) {
  // if translate on selection is enabled
  if (setting["translateWhen"].includes("select") && !listenText) {
    prevSelected = selectedText;
    selectedText = useEvent ? event?.selectedText : selectedText;
    stageTooltipText(selectedText, "select");
  }
}

//process detected word
async function stageTooltipText(text, actionType, range) {
  text = util.filterWord(text); //filter out one that is url,no normal char
  var isTtsOn =
    keyDownList[setting["TTSWhen"]] ||
    (setting["TTSWhen"] == "select" && actionType == "select");

  var isTooltipOn = keyDownList[setting["showTooltipWhen"]];
  var timestamp = Number(Date.now());
  // skip if mouse target is tooltip or no text, if no new word or  tab is not activated
  // hide tooltip, if  no text
  // if tooltip is off, hide tooltip
  if (
    !checkWindowFocus() ||
    checkMouseTargetIsTooltip() ||
    stagedText == text ||
    !util.isExtensionOnline() ||
    (selectedText == prevSelected && !text && actionType == "select") //prevent select flicker
  ) {
    return;
  } else if (!text) {
    stagedText = text;
    hideTooltip();
    return;
  } else if (!isTooltipOn && !isTtsOn) {
    hideTooltip();
    return;
  } else if (!isTooltipOn) {
    hideTooltip();
  }

  //stage current processing word
  stagedText = text;
  var translatedData = await util.requestTranslate(
    text,
    setting["translateSource"],
    setting["translateTarget"],
    setting["translateReverseTarget"]
  );
  var { targetText, sourceLang, targetLang } = translatedData;

  // if translation is not recent one, do not update
  //if translated text is empty, hide tooltip
  if (stagedText != text) {
    return;
  } else if (
    !targetText ||
    sourceLang == targetLang ||
    setting["langExcludeList"].includes(sourceLang)
  ) {
    hideTooltip();
    return;
  }

  //if tooltip is on or activation key is pressed, show tooltip
  if (isTooltipOn) {
    handleTooltip(text, translatedData, actionType, range);
  }
  //if use_tts is on or activation key is pressed, do tts
  if (isTtsOn) {
    util.requestTTS(text, sourceLang, targetText, targetLang, timestamp);
  }
}

function getMouseoverType() {
  //if swap key pressed, swap detect type
  //if mouse target is special web block, handle as block
  var detectType = setting["mouseoverTextType"];
  detectType = keyDownList[setting["keyDownMouseoverTextSwap"]]
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
  var classList = mouseTarget?.classList;
  return ["ocr_text_div", "textFitted"].some((className) =>
    classList?.contains(className)
  );
}

function checkMouseTargetIsTooltip() {
  try {
    return $(tooltip?.popper)?.get(0)?.contains(mouseTarget);
  } catch (error) {
    return false;
  }
}

//tooltip show hide logic=========================================================
function showTooltip(text) {
  if (prevTooltipText != text) {
    hideTooltip(true);
  }
  prevTooltipText = text;
  cancelRemoveTooltipContainer();
  checkTooltipContainerInit();
  tooltip?.setContent(text);
  tooltip?.show();
}

function hideTooltip(resetAll = false) {
  if (resetAll) {
    hideAll({ duration: 0 }); //hide all tippy
  }
  tooltip?.hide();
  hideHighlight();
  removeTooltipContainer();
}

function removeTooltipContainer() {
  cancelRemoveTooltipContainer();
  tooltipRemoveTimeoutId = setTimeout(() => {
    $("#mttContainer").remove();
  }, tooltipRemoveTime);
}

function cancelRemoveTooltipContainer() {
  clearTimeout(tooltipRemoveTimeoutId);
}

function checkTooltipContainerInit() {
  checkTooltipContainer();
  checkStyleContainer();
}
function checkTooltipContainer() {
  if (!$("#mttContainer").get(0)) {
    tooltipContainer.appendTo(document.body);
  }
}

function checkStyleContainer() {
  if (!$("#mttstyle").get(0)) {
    style.appendTo("head");
  }
}

function hideHighlight() {
  $(".mtt-highlight")?.remove();
}

function handleTooltip(text, translatedData, actionType, range) {
  var { targetText, sourceLang, targetLang, transliteration, dict, imageUrl } =
    translatedData;
  var isShowOriTextOn = setting["tooltipInfoSourceText"] == "true";
  var isShowLangOn = setting["tooltipInfoSourceLanguage"] == "true";
  var isTransliterationOn = setting["tooltipInfoTransliteration"] == "true";
  var tooltipTransliteration = isTransliterationOn ? transliteration : "";
  var tooltipLang = isShowLangOn ? langListOpposite[sourceLang] : "";
  var tooltipOriText = isShowOriTextOn ? text : "";
  var isDictOn = setting["tooltipWordDictionary"] == "true";
  var dictData = isDictOn ? wrapDict(dict, targetLang) : "";

  var tooltipMainText =
    wrapMainImage(imageUrl) || dictData || wrapMain(targetText, targetLang);
  var tooltipSubText =
    wrapInfoText(tooltipOriText, "i", sourceLang) +
    wrapInfoText(tooltipTransliteration, "b") +
    wrapInfoText(tooltipLang, "sup");
  var tooltipText = tooltipMainText + tooltipSubText;

  showTooltip(tooltipText);

  util.requestRecordTooltipText(
    text,
    sourceLang,
    targetText,
    targetLang,
    dict,
    actionType
  );
  highlightText(range);
}

function wrapMain(targetText, targetLang) {
  if (!targetText) {
    return "";
  }
  return $("<span/>", {
    dir: util.getRtlDir(targetLang),
    text: targetText,
  }).prop("outerHTML");
}

function wrapDict(dict, targetLang) {
  if (!dict) {
    return "";
  }
  var htmlText = wrapMain(dict, targetLang);
  // wrap first text as bold
  dict
    .split("\n")
    .map((line) => line.split(":")[0])
    .map(
      (text) =>
        (htmlText = htmlText.replace(
          text,
          $("<b/>", {
            text,
          }).prop("outerHTML")
        ))
    );
  return htmlText;
}

function wrapInfoText(text, type, dirLang = null) {
  if (!text) {
    return "";
  }
  return $(`<${type}/>`, {
    dir: util.getRtlDir(dirLang),
    text: "\n" + text,
  }).prop("outerHTML");
}

function wrapMainImage(imageUrl) {
  if (!imageUrl) {
    return "";
  }
  return $("<img/>", {
    src: imageUrl,
    class: "mtt-image",
  }).prop("outerHTML");
}

function highlightText(range) {
  if (!range || setting["mouseoverHighlightText"] == "false") {
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

//Translate Writing feature==========================================================================================
async function translateWriting() {
  //check current focus is write box and hot key pressed
  // if is google doc do not check writing box
  if (
    !keyDownList[setting["keyDownTranslateWriting"]] ||
    (!dom_util.getFocusedWritingBox() && !util.isGoogleDoc())
  ) {
    return;
  }
  // get writing text
  var writingText = await getWritingText();
  if (!writingText) {
    return;
  }
  // translate
  var { targetText, isBroken } = await util.requestTranslate(
    writingText,
    "auto",
    setting["writingLanguage"],
    setting["translateTarget"]
  );
  //skip no translation or is too late to respond
  if (isBroken) {
    return;
  }
  insertText(targetText);
}

async function getWritingText() {
  // get current selected text,
  if (hasSelection() && getSelectionText()?.length>1) {
    return getSelectionText();
  }
  // if no select, select all to get all
  document.execCommand("selectAll", false, null);
  var text = getSelectionText();
  await makeNonEnglishTypingFinish();
  return text;
}

function hasSelection() {
  return window.getSelection().type != "Caret";
}

async function makeNonEnglishTypingFinish() {
  // IME fix
  //refocus input text to prevent prev remain typing
  await delay(10);
  var ele = util.getActiveElement();
  window.getSelection().removeAllRanges();
  ele?.blur();
  await delay(10);
  ele?.focus();
  await delay(50);
  document.execCommand("selectAll", false, null);
  await delay(50);
}

async function insertText(text) {
  var writingBox = dom_util.getFocusedWritingBox();
  if (!text) {
    return;
  } else if (util.isGoogleDoc()) {
    pasteTextGoogleDoc(text);
  } else if ($(writingBox).is("[spellcheck='true']")) {
    //for discord twitch
    await pasteTextInputBox(text);
    await pasteTextExecCommand(text);
  } else {
    //for bard , butterflies.ai
    await pasteTextExecCommand(text);
    await pasteTextInputBox(text);
  } 
}

async function pasteTextExecCommand(text){
  if (!hasSelection()) {
    return;
  }
  document.execCommand("insertText", false, text);
  await delay(300);
}

async function pasteTextInputBox(text) {
  if (!hasSelection()) {
    return;
  }
  var ele = util.getActiveElement();
  pasteText(ele, text);
  await delay(300);
}

function pasteTextGoogleDoc(text) {
  // https://github.com/matthewsot/docs-plus
  var el = document.getElementsByClassName("docs-texteventtarget-iframe")?.[0];
  el = el.contentDocument.querySelector("[contenteditable=true]");
  pasteText(el, text);
}
function pasteText(ele, text) {
  var clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", text);
  var paste = new ClipboardEvent("paste", {
    clipboardData,
    data: text,
    dataType: "text/plain",
    bubbles: true,
    cancelable: true,
  });
  paste.docs_plus_ = true;
  ele.dispatchEvent(paste);
  clipboardData.clearData();
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
  addEventHandler("mouseup", disableEdgeMiniMenu, false);

  //detect tab switching to reset env
  addEventHandler("blur", resetTooltipStatus);
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
    util.requestStopTTS();
  } else if (e.key == "HangulMode" || e.key == "Process") {
    return;
  } else if (e.key == "Alt") {
    e.preventDefault(); // prevent alt site unfocus
  }

  holdKeydownList(e.code);
}

function handleKeyup(e) {
  releaseKeydownList(e.code);
  stopSpeechRecognitionByKey(e.code);
}

function handleMouseKeyDown(e) {
  holdKeydownList(mouseKeyMap[e.button]);
}
function handleMouseKeyUp(e) {
  releaseKeydownList(mouseKeyMap[e.button]);
}

function holdKeydownList(key) {
  if (key && !keyDownList[key] && !util.isCharKey(key)) {
    keyDownList[key] = true;

    restartWordProcess();
    translateWriting();
    startSpeechRecognitionByKey(key);
  }
  stopTTSbyCombKey(key);
}

function disableEdgeMiniMenu(e) {
  //prevent mouse tooltip overlap with edge mini menu
  if (util.isEdge() && mouseKeyMap[e.button] == "ClickLeft") {
    e.preventDefault();
  }
}

async function stopTTSbyCombKey(key) {
  // stop tts if char key like crtl +c
  if (util.isCharKey(key)) {
    util.requestStopTTS(Date.now() + 500);
  }
}

async function releaseKeydownList(key) {
  await delay(20);
  keyDownList[key] = false;
}

function resetTooltipStatus() {
  keyDownList = { always: true }; //reset key press
  mouseMoved = false;
  mouseMovedCount = 0;
  selectedText = "";
  stagedText = null;
  hideTooltip();
  ocrView.removeAllOcrEnv();
  listenText = "";
  util.stopSpeechRecognition();
}

async function restartWordProcess() {
  //rerun staged text
  await delay(10); //wait for select changed by click
  var selectedText = getSelectionText();
  stagedText = null;
  if (selectedText) {
    stageTooltipTextSelect("", false);
  } else {
    stageTooltipTextHover("", false);
  }
}

function setMouseStatus(e) {
  clientX = e.clientX;
  clientY = e.clientY;
  mouseTarget = e.target;
}
function setTooltipPosition(x, y) {
  tooltipContainer?.css("transform", `translate(${x}px,${y}px)`);
}

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

function checkWindowFocus() {
  return mouseMoved && document.visibilityState == "visible";
}

function addBackgroundListener() {
  //handle copy
  util.addMessageListener("CopyRequest", (message) => {
    util.copyTextToClipboard(message.text);
  });
}

function waitJquery() {
  return new Promise(async (resolve, reject) => {
    $(() => {
      resolve();
    });
  });
}

function checkExcludeUrl() {
  var url = util.getCurrentUrl();
  return matchUrl(url, setting["websiteExcludeList"]);
}

// setting handling & container style===============================================================

async function getSetting() {
  setting = await util.loadSetting(function settingCallbackFn() {
    resetTooltipStatus();
    applyStyleSetting();
    checkVideo();
    initSpeechRecognitionLang();
  });
}

async function addElementEnv() {
  tooltipContainer = $("<div/>", {
    id: "mttContainer",
    class: "notranslate",
  });
  tooltipContainerEle = tooltipContainer.get(0);

  style = $("<style/>", {
    id: "mttstyle",
  }).appendTo("head");
  styleSubtitle = $("<style/>", {
    id: "mttstyleSubtitle",
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

function applyStyleSetting() {
  var isSticky = setting["tooltipPosition"] == "follow";
  tooltip.setProps({
    offset: [0, setting["tooltipDistance"]],
    sticky: isSticky ? "reference" : "popper",
    appendTo: isSticky ? tooltipContainerEle : document.body,
    animation: setting["tooltipAnimation"],
  });

  style.html(`
    #mttContainer {
      left: 0 !important;
      top: 0 !important;
      width: 1000px !important;
      margin: 0px !important;
      margin-left: -500px !important;
      position: fixed !important;
      z-index: 100000200 !important;
      background: none !important;
      pointer-events: none !important;
      display: inline-block !important;
      visibility: visible  !important;
      white-space: pre-line;
    }
    .tippy-box[data-theme~="custom"], .tippy-content *{
      font-size: ${setting["tooltipFontSize"]}px  !important;
      text-align: ${setting["tooltipTextAlign"]} !important;
      overflow-wrap: break-word !important;
      color: ${setting["tooltipFontColor"]} !important;
      font-family: 
        -apple-system, BlinkMacSystemFont,
        "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans",
        "Droid Sans", "Helvetica Neue", sans-serif  !important;
      white-space: pre-line;
    }
    .tippy-box[data-theme~="custom"]{
      max-width: ${setting["tooltipWidth"]}px  !important;
      backdrop-filter: blur(${setting["tooltipBackgroundBlur"]}px) !important;
      background-color: ${setting["tooltipBackgroundColor"]} !important;
      border: 1px solid ${setting["tooltipBorderColor"]}; 
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
      background-color: ${setting["mouseoverTextHighlightColor"]}  !important;
      position: absolute !important;   
      z-index: 100000100 !important;
      pointer-events: none !important;
      display: inline !important;
      border-radius: 3px !important;
    }
    .mtt-image{
      width: ${Number(setting["tooltipWidth"]) - 20}px  !important;
      border-radius: 3px !important;
    }
    .ocr_text_div{
      position: absolute;
      opacity: 0.5;
      color: transparent !important;
      border: 2px solid CornflowerBlue;
      background: none !important;
      border-radius: 3px !important;
    }`);
  styleSubtitle
    .html(
      `
    #ytp-caption-window-container .ytp-caption-segment {
      cursor: text !important;
      user-select: text !important;
      font-family: 
      -apple-system, BlinkMacSystemFont,
      "Segoe UI", "Roboto", "Oxygen",
      "Ubuntu", "Cantarell", "Fira Sans",
      "Droid Sans", "Helvetica Neue", sans-serif  !important;
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
    )
    .prop("disabled", setting["detectSubtitle"] == "null");
}

// url check and element env===============================================================
async function detectPDF() {
  if (
    setting["detectPDF"] == "true" &&
    document?.body?.children?.[0]?.type == "application/pdf"
  ) {
    addPdfListener();
    openPdfIframe(window.location.href);
    // var url = "file:///D:/dummy.pd";
    // openPdfIframe(url);
    // redirectToPDFViewer();
  }
}

function redirectToPDFViewer() {
  window.location.replace(
    util.getUrlExt(
      `/pdfjs/web/viewer.html?file=${encodeURIComponent(window.location.href)}`
    )
  );
}
function addPdfListener() {
  //if pdf not working message come, try open using blob url
  util.addFrameListener("pdfErrorLoadDocument", openPdfIframeBlob);
}

async function openPdfIframeBlob() {
  if (isBlobPdfOpened) {
    return;
  }
  // wrap url for bypass referrer check, sciencedirect
  isBlobPdfOpened = true;
  var url = window.location.href;
  var blob = await fetch(url).then((r) => r.blob());
  var url = URL.createObjectURL(blob);
  openPdfIframe(url);
}

function openPdfIframe(url) {
  $("embed").remove();

  $("<embed/>", {
    src: browser.runtime.getURL(
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

//check google docs=========================================================
function checkGoogleDocs() {
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

function injectGoogleDocAnnotation() {
  if (!util.isGoogleDoc()) {
    return;
  }
  var s = document.createElement("script");
  s.src = browser.runtime.getURL("googleDocInject.js"); //chrome.runtime.getURL("js/docs-canvas.js");
  document.documentElement.appendChild(s);
}

// youtube================================
function checkVideo() {
  subtitle["Youtube"].handleVideo(setting);
  subtitle["YoutubeNoCookie"].handleVideo(setting);
}

//destruction ===================================
function loadDestructor() {
  // Unload previous content script if needed
  window.dispatchEvent(new CustomEvent(destructionEvent)); //call destructor to remove script
  addEventHandler(destructionEvent, destructor); //add destructor listener for later remove
}

function destructor() {
  resetTooltipStatus();
  removePrevElement(); //remove element
  controller.abort(); //clear all event Listener by controller signal
}

function addEventHandler(eventName, callbackFunc, capture = true) {
  //record event for later event signal kill
  return window.addEventListener(eventName, callbackFunc, {
    capture: capture,
    signal,
  });
}

function removePrevElement() {
  $("#mttstyle").remove();
  $("#mttstyleSubtitle").remove();
  tooltip?.destroy();
}

// speech recognition ====================================================

function loadSpeechRecognition() {
  util.initSpeechRecognition(
    (speechText, isFinal) => {
      if (isFinal) {
        listenText = speechText;
        stageTooltipText(listenText, "listen");
      }
    },
    () => {
      listenText = "";
    }
  );
  initSpeechRecognitionLang();
}

function initSpeechRecognitionLang() {
  util.setSpeechRecognitionLang(setting["speechRecognitionLanguage"]);
}
function stopSpeechRecognitionByKey(key) {
  if (key == setting["keySpeechRecognition"]) {
    util.stopSpeechRecognition();
  }
}
function startSpeechRecognitionByKey(key) {
  if (key == setting["keySpeechRecognition"]) {
    util.startSpeechRecognition();
  }
}
