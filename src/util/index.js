
import _ from "lodash";
import { iso6393To1 } from "iso-639-3";
import { francAll } from "franc";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
import TextUtil from "/src/util/text_util.js";

var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}

import {
  rtlLangList,
} from "/src/util/lang.js";

var reviewUrlJson = {
  nnodgmifnfgkolmakhcfkkbbjjcobhbl:
    "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl",
  hmigninkgibhdckiaphhmbgcghochdjc:
    "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
};

export var writingField =
  'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable], [contenteditable="true"], [role=textbox], [spellcheck]';


  
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
  var text=html.textContent;
  text = TextUtil.filterWord(text); //filter out one that is url,no normal char
  return text
}

export function extractTextFromRange(range) {
  var rangeHtml = range.cloneContents();
  return extractTextFromHtml(rangeHtml);
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
