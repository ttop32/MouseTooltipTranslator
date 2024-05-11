import $ from "jquery";
import isUrl from "is-url";
import _ from "lodash";
import { iso6393To1 } from "iso-639-3";
import { francAll } from "franc";
import { parse } from "bcp-47";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}
import delay from "delay";

import { Setting } from "./setting.js";

import {
  rtlLangList,
  bingTtsVoiceList,
  googleTranslateTtsLangList,
} from "/src/util/lang.js";

export var defaultData = {
  showTooltipWhen: "always",
  TTSWhen: "ControlLeft",
  translateWhen: "mouseoverselect",
  translateSource: "auto",
  //translateTarget: getDefaultLang(),
  translatorVendor: "google",
  mouseoverTextType: "sentence",
  writingLanguage: "en",
  ocrLang: "jpn_vert",
  translateReverseTarget: "null",

  // voice
  voiceVolume: "1.0",
  voiceRate: "1.0",
  voiceTarget: "source",
  voiceRepeat: "1",

  // graphic
  tooltipFontSize: "18",
  tooltipWidth: "200",
  tooltipDistance: "20",
  tooltipAnimation: "fade",
  tooltipPosition: "follow",
  tooltipTextAlign: "center",
  tooltipBackgroundBlur: "4",
  mouseoverHighlightText: "false",
  tooltipFontColor: "#ffffffff",
  tooltipBackgroundColor: "#000000b8",
  tooltipBorderColor: "#ffffff00",
  mouseoverTextHighlightColor: "#21dc6d40",

  // speech
  speechRecognitionLanguage: "en-US",
  keySpeechRecognition: "ControlRight",
  voicePanelTranslateLanguage: "default",
  voicePanelTextTarget: "sourcetarget",
  voicePanelPadding: "20",
  voicePanelTextAlign: "center",
  voicePanelSourceFontSize: "18",
  voicePanelTargetFontSize: "18",
  voicePanelSourceFontColor: "#ffffffff",
  voicePanelTargetFontColor: "#ffffffff",
  voicePanelSourceBorderColor: "#000000b8",
  voicePanelTargetBorderColor: "#000000b8",
  voicePanelBackgroundColor: "#002918",

  //advanced
  keyDownTranslateWriting: "AltRight",
  keyDownOCR: "ShiftLeft",
  detectSubtitle: "dualsub",
  detectPDF: "true",
  mouseoverPauseSubtitle: "true",
  keyDownMouseoverTextSwap: "null",
  tooltipInfoSourceText: "false",
  tooltipInfoSourceLanguage: "false",
  tooltipInfoTransliteration: "false",
  tooltipWordDictionary: "true",

  // exclude
  langExcludeList: [],
  websiteExcludeList: ["*.example.com"],

  // remains
  subtitleButtonToggle: "true",
  historyList: [],
  historyRecordActions: [],
  ignoreCallbackOptionList: ["historyList"],
  popupCount: "0",
  langPriority: { auto: 9999999, null: 9999999 },
  tooltipEventInterval: "0.3",

  cardPlayMeta: ["image"],
  cardTagSelected: [],
  deckStatus: {},
  cardLen: {},
};

var reviewUrlJson = {
  nnodgmifnfgkolmakhcfkkbbjjcobhbl:
    "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl",
  hmigninkgibhdckiaphhmbgcghochdjc:
    "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
};

export var writingField =
  'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable], [contenteditable="true"], [role=textbox], [spellcheck]';

var listenEngine;
var listening = false;

//setting util======================================

export async function loadSetting(settingUpdateCallbackFn) {
  var settingDefault = await getDefaultDataAll();
  return await Setting.loadSetting(settingDefault, settingUpdateCallbackFn);
}

export async function getDefaultDataAll() {
  var defaultList = {};
  defaultList = concatJson(defaultList, defaultData);
  defaultList["translateTarget"] = getDefaultLang();
  defaultList = concatJson(defaultList, await getDefaultVoice());
  return defaultList;
}

export function getDefaultLang() {
  return parseLocaleLang(navigator.language);
}

export function parseLocaleLang(localeLang) {
  var langCovert = {
    zh: "zh-CN",
    he: "iw",
    fil: "tl",
  };
  var lang = parse(localeLang).language;
  lang = langCovert[lang] || lang;
  lang = localeLang == "zh-TW" ? "zh-TW" : lang;
  return lang;
}

export async function getDefaultVoice() {
  var defaultVoice = {};
  var voiceList = await getAllVoiceList();
  for (var key in voiceList) {
    defaultVoice["ttsVoice_" + key] = voiceList[key][0];
  }
  return defaultVoice;
}

export async function getAllVoiceList() {
  var browserVoices = await getBrowserTtsVoiceList();
  var bingVoices = getBingTtsVoiceList();
  var googleTranslateVoices = getgoogleTranslateTtsVoiceList();
  var voiceList = concatVoice(browserVoices, bingVoices);
  var voiceList = concatVoice(voiceList, googleTranslateVoices);
  voiceList = sortJsonByKey(voiceList);
  return voiceList;
}

export function getBrowserTtsVoiceList() {
  return new Promise(async (resolve) => {
    var voiceList = {};
    try {
      // get voice list
      //get one that include remote, lang, voiceName
      //sort remote first;
      var voices = await browser.tts.getVoices();
      let filtered = voices
        .filter((e) => {
          return e.remote != null && e.lang != null && e.voiceName != null;
        })
        .sort((x, y) => {
          return y.remote - x.remote;
        });
      //find matched lang voice and speak
      for (var item of filtered) {
        var lang = parseLocaleLang(item.lang);
        voiceList[lang] = voiceList[lang] || [];
        voiceList[lang].push(item.voiceName);
      }
      resolve(voiceList);
    } catch (err) {
      resolve(voiceList);
    }
  });
}

export async function getSpeechTTSVoiceList() {
  if (isBacgroundServiceWorker()) {
    return {};
  }
  // get voice list
  //get one that include remote, lang, voiceName
  //sort remote first;
  var voiceList = {};
  var voices = await getSpeechVoices();
  let filtered = voices
    .filter((i) => i.lang && i.name)
    .sort((x, y) => {
      return y.localService - x.localService;
    });
  //find matched lang voice and speak
  for (var item of filtered) {
    var lang = parseLocaleLang(item.lang);
    voiceList[lang] = voiceList[lang] || [];
    voiceList[lang].push(item.name);
  }
  return voiceList;
}

export async function getSpeechVoices() {
  return new Promise(function (resolve, reject) {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", function () {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
}

export function getBingTtsVoiceList() {
  var bingTaggedVoiceList = {};
  for (var key in bingTtsVoiceList) {
    var voiceList = [...bingTtsVoiceList[key]];
    voiceList = voiceList.map((voiceName) => "BingTTS_" + voiceName);
    bingTaggedVoiceList[key] = voiceList;
  }
  return bingTaggedVoiceList;
}

export function getgoogleTranslateTtsVoiceList() {
  var voiceList = {};
  for (var lang of googleTranslateTtsLangList) {
    voiceList[lang] = ["GoogleTranslateTTS_" + lang];
  }
  return voiceList;
}

function concatVoice(voiceList1, voiceList2) {
  var voiceNewList = {};
  for (var key in voiceList1) {
    voiceNewList[key] = voiceList1[key];
  }
  for (var key in voiceList2) {
    if (key in voiceNewList) {
      voiceNewList[key] = voiceNewList[key].concat(voiceList2[key]);
    } else {
      voiceNewList[key] = voiceList2[key];
    }
  }
  return voiceNewList;
}

// range util====================================================================================

export function getAllShadows(el = document.body) {
  // https://stackoverflow.com/questions/38701803/how-to-get-element-in-user-agent-shadow-root-with-javascript
  // recurse on childShadows
  const childShadows = Array.from(el.querySelectorAll("*"))
    .map((el) => el.shadowRoot)
    .filter(Boolean);
  const childResults = childShadows.map((child) => getAllShadows(child));
  const result = Array.from(childShadows);
  return result.concat(childResults).flat();
}

// text util==================================

export function concatJson(x, y) {
  return Object.assign(x, y);
}

export function copyJson(json) {
  return JSON.parse(JSON.stringify(json));
}

export function sortJsonByKey(json) {
  return Object.keys(json)
    .sort()
    .reduce((obj, key) => {
      obj[key] = json[key];
      return obj;
    }, {});
}

export function getJsonFromList(list) {
  var json = {};
  for (const [key, val] of Object.entries(list)) {
    json[val] = val;
  }
  return json;
}

export function filterWord(word) {
  // filter one that only include num,space and special char(include currency sign) as combination
  word = trimAllSpace(word);
  // word=word.slice(0,1000);
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

export function trimAllSpace(word) {
  if (!word) {
    return "";
  }
  word = word.replace(/\s+/g, " "); //replace whitespace as single space
  word = word.trim(); // remove whitespaces from begin and end of word
  return word;
}

export function filterEmoji(word) {
  word = trimAllSpace(word);
  return word.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
}
export function filterHtmlTag(word) {
  return word.replace(/([<>])/g, "");
}

export function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

export function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text);
}

//rect===============================

export function filterOverlappedRect(rects) {
  //filter duplicate rect
  var rectSet = new Set();
  rects = Array.from(rects).filter((rect) => {
    var key = getRectKey(rect);
    if (!rectSet.has(key)) {
      rectSet.add(key);
      return true;
    }
    return false;
  });

  //filter covered rect by other rect
  rects = rects.filter((rect1) => {
    for (const rect2 of rects) {
      if (getRectKey(rect1) != getRectKey(rect2) && rectCovered(rect1, rect2)) {
        return false;
      }
    }
    return true;
  });

  return rects;
}

function getRectKey(rect) {
  return `${rect.left}${rect.top}${rect.width}${rect.height}`;
}

function rectCovered(rect1, rect2) {
  return (
    rect2.top <= rect1.top &&
    rect1.top <= rect2.bottom &&
    rect2.top <= rect1.bottom &&
    rect1.bottom <= rect2.bottom &&
    rect2.left <= rect1.left &&
    rect1.left <= rect2.right &&
    rect2.left <= rect1.right &&
    rect1.right <= rect2.right
  );
}
function rectCollide(rect1, rect2) {
  return !(
    rect1.top > rect2.bottom ||
    rect1.right < rect2.left ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right
  );
}

// performance=======================================================
export function cacheFn(fn) {
  var cache = {};

  return async function () {
    var args = arguments;
    var key = [].slice.call(args).join("");
    if (10000 < Object.keys(cache).length) {
      cache = {}; //numbers.shift();
    }

    if (cache[key]) {
      return cache[key];
    } else {
      cache[key] = await fn.apply(this, args);
      return cache[key];
    }
  };
}

//base64=================================
export function getBase64(url) {
  return new Promise(function (resolve, reject) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(this.result); // <--- `this.result` contains a base64 data URI
        };
        reader.readAsDataURL(blob);
      })
      .catch(async (error) => {
        resolve("");
      });
  });
}

export function getBase64Url(blob) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = reader.result;
      resolve(dataUrl);
    };
    reader.readAsDataURL(blob);
  });
}

// browser Listener handler========================

//from body to parent or iframe message
export function postFrame(data) {
  if (self == top) {
    window.postMessage(data, "*");
  } else {
    window.postMessage(data, "*");
    window.parent.postMessage(data, "*");
  }
}

export function addFrameListener(type, handler) {
  window.addEventListener("message", function (event) {
    if (event?.data?.type == type) {
      handler(event?.data);
    }
  });
}

//fron content script to background
export async function sendMessage(message) {
  try {
    return await browser.runtime.sendMessage(message);
  } catch (e) {
    console.log(e);
  }
  return {};
}

export async function sendMessageToCurrentTab(message) {
  var tabs = await browser.tabs.query({ active: true, currentWindow: true });
  browser.tabs.sendMessage(tabs?.[0]?.id, message);
}

export function addMessageListener(type, handler) {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == type) {
      handler(message);
      sendResponse({});
    }
  });
}

export function addContextListener(type, handler) {
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == type) {
      handler();
    }
  });
}

export function addCommandListener(type, handler) {
  browser.commands.onCommand.addListener((command) => {
    if (command == type) {
      handler();
    }
  });
}

// remain ===================

export function isRtl(lang) {
  return rtlLangList.includes(lang);
}

export function getRtlDir(lang) {
  return rtlLangList.includes(lang) ? "rtl" : "ltr";
}

export function checkInDevMode() {
  try {
    if (process.env.NODE_ENV == "development") {
      return true;
    }
  } catch (error) {}
  return false;
}

export function getReviewUrl() {
  var extId =
    browser.runtime.id in reviewUrlJson
      ? browser.runtime.id
      : "hmigninkgibhdckiaphhmbgcghochdjc";

  return reviewUrlJson[extId];
}

export function isIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function isEbookReader() {
  return (
    window.location.href == browser.runtime.getURL("/foliate-js/reader.html")
  );
}

export function getEbookIframe() {
  var shadows = getAllShadows();
  var iframe = shadows?.[1]?.querySelectorAll("iframe")[0];
  return iframe;
}

export function isGoogleDoc() {
  return (
    document.location.href.includes("https://docs.google.com/document") ||
    document.location.href.includes("https://docs.google.com/presentation")
  );
}

export async function waitUntilForever(fn) {
  await waitUntil(fn, {
    timeout: WAIT_FOREVER,
  });
}

export function getActiveElement(root = document) {
  const activeEl = root.activeElement;

  if (!activeEl) {
    return null;
  } else if (activeEl.shadowRoot) {
    return getActiveElement(activeEl.shadowRoot);
  } else {
    return activeEl;
  }
}

export function getFocusedWritingBox() {
  //check doucment input box focused
  var writingBox = $(getActiveElement());
  if (writingBox.is(writingField)) {
    return writingBox.get(0);
  }
}

export function isExtensionOnline() {
  return browser.runtime?.id;
}

export function getUrlExt(path) {
  return browser.runtime.getURL(path);
}

export async function hasFilePermission() {
  return await browser.extension.isAllowedFileSchemeAccess();
}

function isBacgroundServiceWorker() {
  try {
    return !document;
  } catch (error) {
    return true;
  }
}

export function detectLangFranc(text) {
  var detectLangData = francAll(text, { minLength: 0 })?.[0]?.[0];
  var lang = iso6393To1[detectLangData];
  return lang;
}

export async function detectLangBrowser(text) {
  var detectLangData = await browser.i18n.detectLanguage(text);
  var lang = detectLangData?.languages?.[0]?.language;
  lang = lang == "zh" ? "zh-CN" : lang;
  return lang;
}

export function getCurrentUrl() {
  return window.location != window.parent.location
    ? document.referrer
    : document.location.href;
}

export function getRangeOption(start, end, incNum = 1, roundOff = 0) {
  return _.keyBy(
    _.range(start, end, incNum)
      .map((num) => num.toFixed(roundOff))
      .map((num) => String(num))
  );
}
export function getRecordNoDate(record) {
  return _.pick(record, [
    "sourceText",
    "sourceLang",
    "targetText",
    "targetLang",
    "actionType",
  ]);
}

export function getRecordID(record) {
  return JSON.stringify(getRecordNoDate(record));
}

export function getDateNow() {
  return new Date().toJSON();
}
export function getDateNowNoTime() {
  var date = new Date(new Date().toDateString());
  return date.toString();
}
export function addDay(date, day) {
  date = new Date(date);
  date.setDate(date.getDate() + day);
  return date.toString();
}
export function adhour(date, hour) {
  date = new Date(date);
  date.setHours(date.getHours() + hour);
  return date.toString();
}

export function getNextDay(day) {
  return addDay(getDateNowNoTime(), day);
}
export function isDueDate(date) {
  if (!date) {
    return true;
  }
  return new Date(date) <= new Date(getDateNowNoTime());
}

export function getDateOrder(date1, date2) {
  date1 = new Date(date1);
  date2 = new Date(date2);
  return date1 - date2 || isNaN(date1) - isNaN(date2);
}

export function isLoadedFromIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function isLocalFileUrl(url) {
  return /^file:\/\//.test(url);
}

export function isCharKey(key) {
  return /Key|Digit|Numpad/.test(key);
}

export function isEdge() {
  return /Edg\//.test(window.navigator.userAgent);
}

export function extractTextFromHtml(html) {
  filterJapanFurigana(html);
  return html.textContent;
}

export function filterJapanFurigana(html) {
  html.querySelectorAll("ruby>rt").forEach((e) => e.remove());
}

//send to background.js for background processing  ===========================================================================

export async function requestTranslate(
  word,
  sourceLang,
  targetLang,
  reverseLang
) {
  return await sendMessage({
    type: "translate",
    data: {
      text: word,
      sourceLang,
      targetLang,
      reverseLang,
    },
  });
}

export async function requestTTS(
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  timestamp = Date.now()
) {
  return await sendMessage({
    type: "tts",
    data: {
      sourceText,
      sourceLang,
      targetText,
      targetLang,
      timestamp,
    },
  });
}

export async function requestImage(text) {
  return await sendMessage({
    type: "translate",
    data: {
      text,
      sourceLang: "auto",
      targetLang: "",
      engine: "googleWebImage",
    },
  });
}

export async function requestTTSSingle(
  sourceText,
  sourceLang,
  timestamp = Date.now()
) {
  return await sendMessage({
    type: "tts",
    data: {
      sourceText,
      sourceLang,
      voiceTarget: "source",
      voiceRepeat: "1",
      timestamp,
    },
  });
}

export async function requestStopTTS(timestamp) {
  return await sendMessage({
    type: "stopTTS",
    data: {
      timestamp,
    },
  });
}

//send history to background.js
export async function requestRecordTooltipText(
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  dict,
  actionType
) {
  return await sendMessage({
    type: "recordTooltipText",
    data: {
      sourceText,
      sourceLang,
      targetText,
      targetLang,
      dict,
      actionType,
    },
  });
}

export async function requestBase64(url) {
  return await sendMessage({
    type: "requestBase64",
    url,
  });
}

export async function requestCreateOffscreen() {
  return await sendMessage({
    type: "createOffscreen",
  });
}

export async function requestStartSpeechRecognitionOffscreen(lang) {
  await requestCreateOffscreen();
  return await sendMessage({
    type: "startSpeechRecognition",
    data: {
      lang,
    },
  });
}

export async function requestStopSpeechRecognitionOffscreen() {
  await requestCreateOffscreen();
  return await sendMessage({
    type: "stopSpeechRecognition",
  });
}

export async function requestPlayTtsOffscreen(source, rate, volume, timestamp) {
  return await sendMessage({
    type: "playAudioOffscreen",
    data: {
      source,
      rate,
      volume,
      timestamp,
    },
  });
}

export async function requestStopTtsOffscreen(timestamp) {
  return await sendMessage({ type: "stopTTSOffscreen", data: { timestamp } });
}

//open side window =======================
// Create the offscreen document
export async function createOffscreen() {
  try {
    await browser?.offscreen?.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "TTS & Speech",
    });
  } catch (error) {
    if (error.message.startsWith("Only a single offscreen")) {
    } else {
      console.log(error);
    }
  }
}
export async function removeOffscreen() {
  return new Promise((resolve, reject) => {
    browser.offscreen.closeDocument(() => resolve());
  });
}

export async function openUrlAsPanel(url) {
  url = getUrlExt(url);
  await removePreviousTab(url);
  openPanel(url);
}
function openPanel(url) {
  var width = Math.round(screen.width * 0.5);
  var height = Math.round(screen.height * 0.15);
  var left = Math.round(screen.width / 2 - width / 2);
  var top = Math.round(screen.height / 2 - height / 2);
  browser.windows.create({
    url,
    type: "panel",
    width,
    height,
    left,
    top,
  });
}

export async function removePreviousTab(url) {
  var urlParsed = new URL(url);
  var urlWithoutParam = urlParsed.origin + urlParsed.pathname;
  var tabs = await browser.tabs.query({ url: urlWithoutParam });

  for (const tab of tabs) {
    if (url == tab.url) {
      await browser.tabs.remove(tab.id);
    }
  }
}

export function openSettingPage() {
  openPage(`chrome://extensions/?id=${browser.runtime?.id}`);
}

export function openAudioPermissionPage() {
  openPage(`chrome://settings/content/microphone`);
}

export function openPage(url) {
  browser.tabs.create({ url });
}

// speech recognition================================

export function initSpeechRecognition(recognitionCallbackFn, finCallbackFn) {
  // future plan, migration to background service worker
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return;
  }
  listenEngine = new SpeechRecognition();
  listenEngine.continuous = true;
  listenEngine.interimResults = true;
  listenEngine.onstart = function () {
    listening = true;
  };
  listenEngine.onerror = function (event) {
    console.log(event);
  };
  listenEngine.onend = function () {
    listening = false;
    finCallbackFn();
  };

  listenEngine.onresult = function (event) {
    var isFinal = false;
    var interimTranscript = "";
    var finalTranscript = "";
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript = event.results[i][0].transcript;
        isFinal = true;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    recognitionCallbackFn(finalTranscript || interimTranscript, isFinal);
    // console.log("-------------------------------");
    // console.log(finalTranscript);
    // console.log(interimTranscript);
  };
}

export function setSpeechRecognitionLang(lang) {
  if (!listenEngine) {
    return;
  }
  listenEngine.lang = lang;
}

export function stopSpeechRecognition() {
  if (!listening) {
    return;
  }
  // console.log("stop listen");
  listenEngine?.stop();
}

export function startSpeechRecognition() {
  if (listening || !listenEngine) {
    return;
  }
  // console.log("start listen");
  listenEngine?.start();
}
