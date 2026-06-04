// inject translation tooltip based on user text hover event
//it gets translation and tts from background.js
//intercept pdf url
import $ from "jquery";
import tippy, { sticky, hideAll } from "tippy.js";
import matchUrl from "match-url-wildcard";
import delay from "delay";
import browser from "webextension-polyfill";
import TextUtil from "/src/util/text_util.js";
import SettingUtil from "/src/util/setting_util.js";
import { getRtlDir } from "/src/util/lang.js";

import {
  enableSelectionEndEvent,
  getSelectionText,
} from "/src/event/selection";
import {
  enableMouseoverTextEvent,
  getNextExpandedRange,
  getFirstExpandedRangeInDoc,
  getMouseoverText,
  forceTriggerMouseoverText
} from "/src/event/mouseover";
import * as util from "/src/util";
import * as dom_util from "/src/util/dom";
import {
  refreshSavedWordHighlight,
  cleanupSavedWordHighlight,
} from "/src/event/savedHighlight.js";
import { togglePageTranslate } from "/src/event/pageTranslate.js";

import * as ocrView from "/src/ocr/ocrView.js";
import subtitle from "/src/subtitle/subtitle.js";
import { langListOpposite } from "/src/util/lang.js";
import * as speech from "/src/speech";

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
var keyDownDoublePress = {};
var keyDownPressTime = {};
var mouseKeyMap = ["ClickLeft", "ClickMiddle", "ClickRight"];

var destructionEvent = "destructmyextension_MouseTooltipTranslator"; // + chrome.runtime.id;
const controller = new AbortController();
const { signal } = controller;

var selectedText = "";
var prevSelected = "";
var hoveredData = {};
var stagedText = null;
var prevTooltipText = "";
var isAutoReaderRunning = false;
var isStopAutoReaderOn = false;

var tooltipRemoveTimeoutId = "";
var tooltipRemoveTime = 3000;
var autoReaderScrollTime = 400;
var bookFusionActiveIframe = null;

var listenText = "";

//tooltip core======================================================================

(async function initMouseTooltipTranslator() {
  try {
    injectGoogleDocAnnotation(); //check google doc and add annotation env var
    bindBookFusionIframe(); // bridge bookfusion iframe events
    loadDestructor(); //remove previous tooltip script
    await getSetting(); //load setting
    if (checkExcludeUrl()) {
      return;
    }
    await dom_util.waitJquery(); //wait jquery load
    detectPDF(); //check current page is pdf
    checkVideo(); // check  video  site for subtitle
    checkGoogleDocs(); // check google doc
    addElementEnv(); //add tooltip container
    applyStyleSetting(); //add tooltip style
    addMsgListener(); // get background listener for copy request
    loadEventListener(); //load event listener to detect mouse move
    loadSpeechRecognition();
    startMouseoverDetector(); // start current mouseover text detector
    startTextSelectDetector(); // start current text select detector
    refreshSavedWordHighlight(setting); // highlight saved words (enabled groups only)
  } catch (error) {
    console.log(error);
  }
})();

//determineTooltipShowHide based on hover, check mouse over word on every 700ms
function startMouseoverDetector() {
  enableMouseoverTextEvent(window, setting, () => keyDownList);
  addEventHandler("mouseoverText", stageTooltipTextHover);
}

//determineTooltipShowHide based on selection
function startTextSelectDetector() {
  if (!util.isBookFusion()) {
    enableSelectionEndEvent(window, setting["tooltipEventInterval"]); //set mouse drag text selection event
  }
  addEventHandler("selectionEnd", stageTooltipTextSelect);
}

function stageTooltipTextHover(event, useEvent = true, resetStaged = false) {
  if (resetStaged) {
    stagedText = null;
  }
  hoveredData = useEvent ? event?.mouseoverText : hoveredData;
  // if mouseover detect setting is on and
  // if no selected text
  if (
    setting["translateWhen"].includes("mouseover") &&
    hoveredData &&
    !isOtherServiceActive() &&
    !isTooltipSuppressedWhileWriting()
  ) {
    var { mouseoverText, mouseoverRange } = hoveredData;
    stageTooltipText(mouseoverText, "mouseover", mouseoverRange);
  }
}

// #186: optionally suppress the mouseover tooltip while the user is typing in an
// input / textarea / contenteditable, so it doesn't obscure what they type.
// Google Docs is excluded so translation keeps working there (its editor is a
// contenteditable surface but users still want the tooltip).
function isTooltipSuppressedWhileWriting() {
  return (
    setting["mouseoverWhileWriting"] === "false" &&
    !util.isGoogleDoc() &&
    !!dom_util.getFocusedWritingBox()
  );
}

function stageTooltipTextSelect(event, useEvent = true) {
  // if translate on selection is enabled
  if (
    setting["translateWhen"].includes("select") &&
    !isOtherServiceActive(true)
  ) {
    prevSelected = selectedText;
    selectedText = useEvent ? event?.selectedText : selectedText;
    stageTooltipText(selectedText, "select");
  }
}

function isOtherServiceActive(excludeSelect = false) {
  return listenText || isAutoReaderRunning || (!excludeSelect && selectedText);
}

//process detected word
async function stageTooltipText(text, actionType, range) {
  var isTtsOn =
    keyDownList[setting["TTSWhen"]] ||
    (setting["TTSWhen"] == "select" && actionType == "select");
  var isTtsSwap = keyDownDoublePress[setting["TTSWhen"]];
  var useSecondary =
    setting["keySecondaryLang"] != "null" &&
    keyDownList[setting["keySecondaryLang"]] &&
    setting["translateTarget2"] != "null";
  var isTooltipOn = keyDownList[setting["showTooltipWhen"]] || useSecondary;
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
    useSecondary ? setting["translateTarget2"] : setting["translateTarget"],
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
    handleTTS(
      text,
      sourceLang,
      targetText,
      targetLang,
      timestamp,
      false,
      isTtsSwap
    );
  }
}

async function handleTTS(
  text,
  sourceLang,
  targetText,
  targetLang,
  timestamp,
  noInterrupt,
  isTtsSwap
) {
  //kill auto reader if tts is on
  util.requestKillAutoReaderTabs(true);
  await delay(50);
  //tts
  callTTS(
    text,
    sourceLang,
    targetText,
    targetLang,
    timestamp,
    noInterrupt,
    isTtsSwap
  );
}

async function callTTS(
  text,
  sourceLang,
  targetText,
  targetLang,
  timestamp,
  noInterrupt,
  isTtsSwap
) {
  if (isTtsSwap) {
    await util.requestTTS(
      targetText,
      targetLang,
      text,
      sourceLang,
      timestamp + 100,
      noInterrupt
    );
    return;
  }
  await util.requestTTS(
    text,
    sourceLang,
    targetText,
    targetLang,
    timestamp + 100,
    noInterrupt
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
    // hideAll({ duration: 0 }); //hide all tippy
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

function hideHighlight(checkSkipCase) {
  if (checkSkipCase && isAutoReaderRunning) {
    return;
  }
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
    dir: getRtlDir(targetLang),
    text: targetText,
  }).prop("outerHTML");
}

function wrapDict(dict, targetLang) {
  if (!dict) {
    return "";
  }
  // bold the "part-of-speech:" label at the start of each line. Done per line
  // (not a global string replace) so repeated/substring/definition-embedded
  // labels render correctly for any source (translator dict, Wiktionary, ...).
  var html = dict
    .split("\n")
    .map((line) => {
      var idx = line.indexOf(":");
      if (idx === -1) {
        return $("<span/>", { text: line }).prop("outerHTML");
      }
      return (
        $("<b/>", { text: line.slice(0, idx + 1) }).prop("outerHTML") +
        $("<span/>", { text: line.slice(idx + 1) }).prop("outerHTML")
      );
    })
    .join("\n");
  return $("<span/>", { dir: getRtlDir(targetLang) })
    .html(html)
    .prop("outerHTML");
}

function wrapInfoText(text, type, dirLang = null) {
  if (!text) {
    return "";
  }
  return $(`<${type}/>`, {
    dir: getRtlDir(dirLang),
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

function highlightText(range, force = false) {
  if (!force && (!range || setting["mouseoverHighlightText"] == "false")) {
    return;
  }
  hideHighlight();
  var rects = range.getClientRects();
  rects = util.filterOverlappedRect(rects);
  var adjustX = window.scrollX;
  var adjustY = window.scrollY;
  var scaleX = 1, scaleY = 1;
  if (util.isEbookReader()) {
    var ebookViewerRect = util.getEbookIframe()?.getBoundingClientRect();
    adjustX += ebookViewerRect?.left;
    adjustY += ebookViewerRect?.top;
  } else if (util.isBookFusion() && bookFusionActiveIframe) {
    var bfRect = bookFusionActiveIframe.getBoundingClientRect();
    scaleX = bfRect.width / (bookFusionActiveIframe.offsetWidth || 1);
    scaleY = bfRect.height / (bookFusionActiveIframe.offsetHeight || 1);
    adjustX += bfRect.left;
    adjustY += bfRect.top;
  }

  for (var rect of rects) {
    $("<div/>", {
      class: "mtt-highlight",
      css: {
        position: "absolute",
        left: rect.left * scaleX + adjustX,
        top: rect.top * scaleY + adjustY,
        width: rect.width * scaleX,
        height: rect.height * scaleY,
      },
    }).appendTo("body");
  }
}
//Translate Writing feature==========================================================================================
async function translateWriting() {
  //check current focus is write box and hot key pressed
  // if is google doc do not check writing box
  if (!dom_util.getFocusedWritingBox() && !util.isGoogleDoc()) {
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
  if (hasSelection() && getSelectionText()?.length > 1) {
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
    await pasteTextExecCommand(text, false);
  } else {
    //for bard , butterflies.ai
    await pasteTextExecCommand(text);
    await pasteTextInputBox(text, false);
  }
}

async function pasteTextExecCommand(text, firstTry = true) {
  if (!hasSelection() && !firstTry) {
    return;
  }
  document.execCommand("insertText", false, text);
  await delay(300);
}

async function pasteTextInputBox(text, firstTry = true) {
  if (!hasSelection() && !firstTry) {
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

  addEventHandler("scroll", () => hideHighlight(true));
  //detect activation hold key pressed
  addEventHandler("keydown", handleKeydown);
  addEventHandler("keyup", handleKeyup);
  addEventHandler("mousedown", handleMouseKeyDown);
  addEventHandler("mouseup", handleMouseKeyUp);
  
  //detect tab switching to reset env
  addEventHandler("blur", resetTooltipStatus);
  addEventHandler("beforeunload", killAutoReader);
}

function handleMousemove(e) {
  //if mouse moved far distance two times, check as mouse moved
  if (!checkMouseOnceMoved(e.clientX, e.clientY)) {
    setMouseStatus(e);
    return;
  }
  setMouseStatus(e);
  setTooltipPosition(e.clientX, e.clientY);
  ocrView.checkImage(e.clientX, e.clientY, setting, keyDownList);
}

function handleTouchstart(e) {
  mouseMoved = true;
}

function handleKeydown(e) {
  // Ctrl+Shift+0..9 -> save into the group whose shortcut matches.
  // A group's effective key defaults to "CtrlShift<id>" when unset.
  if (e.ctrlKey && e.shiftKey && /^Digit[0-9]$/.test(e.code)) {
    var combo = "CtrlShift" + e.code.replace("Digit", "");
    var group = (setting["wordGroups"] || []).find(
      (g) => (g.key ?? "CtrlShift" + g.id) === combo
    );
    if (group) {
      e.preventDefault();
      util.requestSaveTranslation(group.id);
      return;
    }
  }
  //if user pressed ctrl+f  ctrl+a, hide tooltip
  if (/KeyA|KeyF/.test(e.code) && e.ctrlKey) {
    mouseMoved = false;
    hideTooltip();
  } else if (e.code == "Escape") {
    util.requestStopTTS();
    util.requestKillAutoReaderTabs(true);
  } else if (e.key == "HangulMode" || e.key == "Process") {
    return;
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
  var detectKeyDown = recordKeydownList(key);
  recordDoublePress(key);
  runKeydownPostProcess(key, detectKeyDown);
}

function recordKeydownList(key) {
  var detectKeyDown = false;
  if (key && !keyDownList[key] && !util.isCharKey(key)) {
    keyDownList[key] = true;
    detectKeyDown = true;
  }
  return detectKeyDown;
}

function recordDoublePress(key) {
  if (keyDownList[key]) {
    const now = Date.now();
    if (now - keyDownPressTime[key] < 1000) {
      keyDownDoublePress[key] = true;
    } else {
      keyDownDoublePress[key] = false;
    }
    keyDownPressTime[key] = Date.now();
  } else {
    keyDownList[key] = { lastPressed: Date.now() };
  }
}

async function runKeydownPostProcess(key, detectKeyDown) {
  // run keydown process
  if (detectKeyDown) {
    if (setting["keyDownTranslateWriting"]==key) {
      translateWriting();
    }
    if (setting["keySpeechRecognition"]==key) {
      speech.startSpeechRecognition();
    }
    if (setting["keyDownAutoReader"]==key) {
      startAutoReader();
    }
    if (setting["keyDownTranslatePage"]==key) {
      togglePageTranslate(setting);
    }
    // per-group save shortcut using a single allowed key (Ctrl/Alt/F2/click...)
    var saveGroup = (setting["wordGroups"] || []).find((g) => g.key === key);
    if (saveGroup) {
      util.requestSaveTranslation(saveGroup.id);
    }
    // if (setting["keyHoldMouseoverTextType"]==key) {
    //   setting["mouseoverTextType"] = setting["mouseoverTextType"] == "word" ? "sentence" : "word";
    //   setting.save();
    // }
    if (setting["keySecondaryLang"]==key && setting["translateTarget2"] != "null") {
      stageTooltipTextHover(null, false, true);
    } else {
      restartWordProcess();
    }
  }

  if (util.isCharKey(key)) {
    util.requestStopTTS(Date.now() + 500);
    killAutoReader();
  }
}

async function startAutoReader() {
  if (!keyDownList[setting["keyDownAutoReader"]]) {
    return;
  }
  var isTtsSwap = keyDownDoublePress[setting["keyDownAutoReader"]];
  util.clearSelection();
  util.requestKillAutoReaderTabs();
  await killAutoReader();
  // hoveredData.mouseoverRange was detected with correct iframe-local coords;
  // re-detecting via clientX/clientY fails for scaled iframes (BookFusion)
  // because those are outer-page coords, not iframe-local coords.
  var mouseoverRange =
    hoveredData?.mouseoverRange ||
    (await getMouseoverText(clientX, clientY)).mouseoverRange;
  processAutoReader(mouseoverRange, isTtsSwap);
}

function syncBookFusionActiveIframe(range) {
  if (!util.isBookFusion() || !range) return;
  for (const iframe of document.querySelectorAll('iframe[id^="bf-epub-view-"]')) {
    if (iframe.contentDocument?.contains(range.startContainer)) {
      bookFusionActiveIframe = iframe;
      return;
    }
  }
}

async function processAutoReader(stagedRange, isTtsSwap) {
  if (!stagedRange || isStopAutoReaderOn) {
    hideTooltip();
    isStopAutoReaderOn = false;
    isAutoReaderRunning = false;
    return;
  }
  syncBookFusionActiveIframe(stagedRange);
  isAutoReaderRunning = true;
  var text = util.extractTextFromRange(stagedRange);
  var translatedData = await util.requestTranslate(
    text,
    setting["translateSource"],
    setting["translateTarget"],
    setting["translateReverseTarget"]
  );
  var { targetText, sourceLang, targetLang } = translatedData;

  scrollAutoReader(stagedRange);
  setTimeout(() => {
    highlightText(stagedRange, true);
  }, autoReaderScrollTime);
  showTooltip(targetText);

  var nextStagedRange =
    getNextExpandedRange(stagedRange, setting["mouseoverTextType"]) ||
    getNextBookFusionChapterRange(stagedRange, setting["mouseoverTextType"]);
  preloadNextTranslation(nextStagedRange);
  await callTTS(
    text,
    sourceLang,
    targetText,
    targetLang,
    Date.now(),
    true,
    isTtsSwap
  );

  processAutoReader(nextStagedRange, isTtsSwap);
}

function getNextBookFusionChapterRange(currentRange, detectType) {
  if (!util.isBookFusion() || !currentRange) return null;
  const iframes = Array.from(document.querySelectorAll('iframe[id^="bf-epub-view-"]'));
  const idx = iframes.findIndex((f) => f.contentDocument?.contains(currentRange.startContainer));
  if (idx < 0 || idx >= iframes.length - 1) return null;
  return getFirstExpandedRangeInDoc(iframes[idx + 1].contentDocument, detectType);
}

async function preloadNextTranslation(stagedRange) {
  if (!stagedRange) {
    return;
  }
  await delay(700);
  var text = util.extractTextFromRange(stagedRange);
  util.requestTranslate(
    text,
    setting["translateSource"],
    setting["translateTarget"],
    setting["translateReverseTarget"]
  );
}

function scrollAutoReader(range) {
  var rect = range.getBoundingClientRect();
  if (util.isBookFusion()) {
    if (!bookFusionActiveIframe) return;
    var bfRect = bookFusionActiveIframe.getBoundingClientRect();
    var bfScaleY = bfRect.height / (bookFusionActiveIframe.offsetHeight || 1);
    var bfScrollTop = window.scrollY + bfRect.top + rect.top * bfScaleY - window.innerHeight / 2;
    $("body,html").animate({ scrollTop: bfScrollTop }, autoReaderScrollTime);
    return;
  }
  const scrollContainer = util.isPDFViewer()
    ? $("#viewerContainer")
    : $("body,html");
  const scrollTopValue = util.isPDFViewer()
    ? $("#viewerContainer").scrollTop() +
      rect.top -
      $("#viewerContainer").height() / 2
    : window.scrollY + rect.top - window.innerHeight / 2;

  scrollContainer.animate({ scrollTop: scrollTopValue }, autoReaderScrollTime);
}

async function killAutoReader() {
  if (!isAutoReaderRunning || isStopAutoReaderOn) {
    return;
  }
  isStopAutoReaderOn = true;
  util.requestStopTTS(Date.now(), true);
  await util.waitUntilForever(() => !isAutoReaderRunning);
  isStopAutoReaderOn = false;
}
function disableEdgeMiniMenu(e) {
  if (util.isEdge() && mouseKeyMap[e.button] == "ClickLeft") {
    e.preventDefault();
  }
}


async function releaseKeydownList(key) {
  await delay(20);
  keyDownList[key] = false;
  if (key == setting["keySpeechRecognition"]) {
    speech.stopSpeechRecognition();
  }
  if (key == setting["keySecondaryLang"] && setting["translateTarget2"] != "null") {
    stageTooltipTextHover(null, false, true);
  }
  if (key == setting["keyHoldMouseoverTextType"]) {
    restartWordProcess();
  }
}

function resetTooltipStatus(keyReset=true, mouseReset=true) {
  if (keyReset){
    keyDownList = { always: true }; //reset key press
  }
  if (mouseReset) {
    mouseMoved = false;
    mouseMovedCount = 0;
  }
  selectedText = "";
  stagedText = null;
  hideTooltip();
  ocrView.removeAllOcrEnv();
  listenText = "";
  speech.stopSpeechRecognition();
}

async function restartWordProcess() {
  //rerun staged text
  await delay(10); //wait for select changed by click
  var outerSelectedText = getSelectionText();
  stagedText = null;
  if (outerSelectedText || selectedText) {
    stageTooltipTextSelect("", false);
  } else {
    forceTriggerMouseoverText();
    // stageTooltipTextHover("", false);
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

function addMsgListener() {
  //handle copy
  util.addMessageListener("CopyRequest", (message) => {
    TextUtil.copyTextToClipboard(message.text);
  });
  util.addMessageListener("killAutoReaderTabs", killAutoReader);
}

function checkExcludeUrl() {
  var url = util.getCurrentUrl();
  var isExcludeBan = matchSite(url, setting["websiteExcludeList"]);
  var isWhiteListBan =
    setting["websiteWhiteList"]?.length != 0 &&
    !matchSite(url, setting["websiteWhiteList"]);

  // #297: choose whether the blacklist (exclude list), the whitelist, or both
  // govern. "auto" keeps the legacy behavior (both apply).
  var mode = setting["websiteFilterMode"];
  if (mode === "blacklist") {
    return isExcludeBan;
  }
  if (mode === "whitelist") {
    return isWhiteListBan;
  }
  if (isExcludeBan || isWhiteListBan) {
    return true;
  }
}

// Match a URL against a user site list. In addition to match-url-wildcard's
// exact-host / explicit-wildcard rules, a bare domain entry ("example.com")
// also matches its subdomains ("www.example.com", "m.example.com"), which is
// what users expect when excluding/whitelisting a site (#197).
function matchSite(url, list) {
  if (!list || !list.length) {
    return false;
  }
  if (matchUrl(url, list)) {
    return true;
  }
  return list.some((entry) => {
    var host = String(entry)
      .replace(/^\w+:\/\//, "") // strip protocol
      .replace(/[\/?#].*$/, "") // strip path/query/hash
      .replace(/:\d+$/, ""); // strip port
    return host && matchUrl(url, "*." + host);
  });
}

// setting handling & container style===============================================================

async function getSetting() {
  setting = await SettingUtil.loadSetting(function settingCallbackFn() {
    resetTooltipStatus(true, false);
    applyStyleSetting();
    checkVideo();
    speech.initSpeechRecognitionLang(setting);
    refreshSavedWordHighlight(setting); // re-highlight on group enable/color change
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

  // The tippy popper is appended to <body> (not inside #mttContainer), so mark
  // it as non-translatable too; otherwise Chrome's "translate this page" keeps
  // re-translating our translated tooltip and it flickers (#19).
  tooltip.popper?.classList.add("notranslate");
  tooltip.popper?.setAttribute("translate", "no");
}

function applyStyleSetting() {
  var isSticky = setting["tooltipPosition"] == "follow";
  tooltip.setProps({
    offset: [0, setting["tooltipDistance"]],
    sticky: isSticky ? "reference" : "popper",
    // function form so tippy re-evaluates the live <body> on every show; a
    // static reference goes stale when an SPA / View Transitions navigation
    // swaps document.body, leaving the tooltip appended to the detached old
    // body (worked again only after a full reload). (#80)
    appendTo: isSticky ? tooltipContainerEle : () => document.body,
    animation: setting["tooltipAnimation"],
  });
  var rtlDirection = getRtlDir(setting["translateTarget"]);

  style.html(`
    #mttContainer {
      left: 0 !important;
      top: 0 !important;
      width: 1000px !important;
      margin: 0px !important;
      margin-left: -500px !important;
      position: fixed !important;
      z-index: 2147483647 !important; /* Maximum z-index to overcome overlays */
      background: none !important;
      pointer-events: none !important;
      display: inline-block !important;
      visibility: visible  !important;
      white-space: pre-line;
    }
    .tippy-box[data-theme~="custom"], .tippy-box[data-theme~="ocr"], .tippy-content *{
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
      box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
      opacity: 1.0; /* Adjusted opacity for transparency */
    }
    .tippy-box[data-theme~="ocr"]{
      max-width: $1000px  !important;
      backdrop-filter: blur(${setting["tooltipBackgroundBlur"]}px) !important;
      background-color: ${setting["tooltipBackgroundColor"]} !important;
      border: 1px solid ${setting["tooltipBorderColor"]}; 
      box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
      opacity: 1.0; /* Adjusted opacity for transparency */
    }
    .tippy-box[data-theme~="transparent"] {
      max-width: $1000px  !important;
      backdrop-filter: blur(${setting["tooltipBackgroundBlur"]}px) !important;
      background-color: ${setting["tooltipBackgroundColor"]} !important;
      border: 1px solid ${setting["tooltipBorderColor"]}; 
      box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
      opacity: 0.0; /* Adjusted opacity for transparency */
      transition: opacity 0.3s ease-in-out; /* Added transition for opacity */
    }
    [data-tippy-root] {
      display: inline-block !important;
      visibility: visible  !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='top'] > .tippy-arrow::before, .tippy-box[data-theme~='ocr'][data-placement^='top'] > .tippy-arrow::before { 
      border-top-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='bottom'] > .tippy-arrow::before, .tippy-box[data-theme~='ocr'][data-placement^='bottom'] > .tippy-arrow::before {
      border-bottom-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='left'] > .tippy-arrow::before, .tippy-box[data-theme~='ocr'][data-placement^='left'] > .tippy-arrow::before {
      border-left-color: ${setting["tooltipBackgroundColor"]} !important;
    }
    .tippy-box[data-theme~='custom'][data-placement^='right'] > .tippy-arrow::before, .tippy-box[data-theme~='ocr'][data-placement^='right'] > .tippy-arrow::before {
      border-right-color: ${setting["tooltipBackgroundColor"]} !important;
    }

    .mtt-highlight{
      background-color: ${setting["mouseoverTextHighlightColor"]}  !important;
      position: absolute !important;   
      z-index: 2147483646 !important; /* Slightly lower than tooltip */
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
      opacity: 0.4;
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
      direction: ${rtlDirection}
    }
    .captions-text .caption-visual-line:first-of-type:after {
      content: '⣿⣿';
      border-radius: 3px !important;
      color: white !important;
      background: transparent !important;
      box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
      display: inline-block;
      vertical-align: top;
      opacity:0;
      transition: opacity 0.7s ease-in-out;
    }
    .ytp-caption-segment{
      color: white !important;
      text-shadow: 1px 1px 2px black !important;
      backdrop-filter: blur(3px) !important;
      background: rgba(8, 8, 8, 0.1)  !important;
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
  if (setting["detectPDF"] == "true" && util.isPDF()) {
    util.addFrameListener("pdfErrorLoadDocument", openPdfIframeBlob);
    openPdfIframe(window.location.href);
  }
}

async function openPdfIframeBlob() {
  var url = window.location.href;
  var url = await util.getBlobUrl(url);
  openPdfIframe(url);
}

function openPdfIframe(url) {
  $("embed").remove();

  $("<embed/>", {
    id: "mttPdfIframe",
    src: util.getPDFUrl(url),
    css: {
      display: "block",
      border: "none",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
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

//bookfusion=========================================================
function bindBookFusionIframe() {
  if (!util.isBookFusion()) return;
  const bound = new WeakSet();
  // clear polling on content script reload/destruct (controller.abort)
  const bindInterval = setInterval(() => {
    const iframes = document.querySelectorAll('iframe[id^="bf-epub-view-"]');
    for (const iframe of iframes) {
      if (bound.has(iframe) || !iframe.contentWindow) continue;
      bound.add(iframe);
      const win = iframe.contentWindow;
      const dispatchSelect = (text) => {
        const evt = new CustomEvent("selectionEnd", { bubbles: true, cancelable: false });
        evt.selectedText = text;
        document.dispatchEvent(evt);
      };
      let selectTimer;
      let lastGoodSelection = "";
      let selectionDispatchLock = false;
      let lockTimer;
      win.document.addEventListener("selectionchange", () => {
        const text = win.getSelection()?.toString() || "";
        if (text) lastGoodSelection = text;
        clearTimeout(selectTimer);
        selectTimer = setTimeout(() => {
          const current = win.getSelection()?.toString() || "";
          if (current) {
            dispatchSelect(current);
          } else if (!selectionDispatchLock) {
            lastGoodSelection = "";
            dispatchSelect("");
          }
        }, 700);
      }, { signal });
      // capture=true: fires before BookFusion's bubble handlers that may clear selection
      win.document.addEventListener("mouseup", () => {
        clearTimeout(selectTimer);
        const text = win.getSelection()?.toString() || lastGoodSelection || "";
        lastGoodSelection = "";
        if (text) {
          selectionDispatchLock = true;
          clearTimeout(lockTimer);
          lockTimer = setTimeout(() => { selectionDispatchLock = false; }, 3000);
        }
        dispatchSelect(text);
      }, { capture: true, signal });
      win.document.addEventListener("mousemove", (e) => {
        bookFusionActiveIframe = iframe;
        const clRect = iframe.getBoundingClientRect();
        const scaleX = clRect.width / (iframe.offsetWidth || 1);
        const scaleY = clRect.height / (iframe.offsetHeight || 1);
        const evt = new CustomEvent("mousemove", { bubbles: true, cancelable: false });
        evt.ebookWindow = iframe.contentWindow;
        evt.clientX = e.clientX * scaleX + clRect.left;
        evt.clientY = e.clientY * scaleY + clRect.top;
        evt.iframeX = e.clientX;
        evt.iframeY = e.clientY;
        window.dispatchEvent(evt);
        document.dispatchEvent(evt);
      }, { signal });
      ["keydown", "keyup"].forEach((eventName) => {
        win.addEventListener(eventName, (e) => {
          const evt = new CustomEvent(eventName, { bubbles: true, cancelable: false });
          evt.key = e?.key;
          evt.code = e?.code;
          evt.ctrlKey = e?.ctrlKey;
          window.dispatchEvent(evt);
          document.dispatchEvent(evt);
        }, { signal });
      });
    }
  }, 1000);
  signal.addEventListener("abort", () => clearInterval(bindInterval));
}

// youtube================================
function checkVideo() {
  for (var key in subtitle) {
    subtitle[key].handleVideo(setting);
  }
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
  cleanupSavedWordHighlight(); //disconnect highlight observer + unwrap highlights
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
  speech.initSpeechRecognition(
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
  speech.initSpeechRecognitionLang(setting);
}
