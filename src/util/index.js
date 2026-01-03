
// import { iso6393To1 } from "iso-639-3";
// import { francAll } from "franc";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
import TextUtil from "/src/util/text_util.js";
import { WindowPostMessageProxy } from "window-post-message-proxy";

var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}

var windowPostMessageProxy;
try {
  windowPostMessageProxy = new WindowPostMessageProxy({
    suppressWarnings: true,
  });
}catch (error) {}

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

export async function sendMessageToAllContentScripts(message, filterTabId,includeCaller) {
  var tabs = await browser.tabs.query({});
  await Promise.all(
    tabs
      .filter(tab => includeCaller || tab.id != filterTabId)
      .map(tab => browser.tabs.sendMessage(tab.id, message))
  );
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

export function checkInDevMode() {
  try {
    if (process.env.NODE_ENV == "development") {
      return true;
    }
  } catch (error) {}
  return false;
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

export async function getBlobUrl(url) {
  var blob = await fetch(url).then((r) => r.blob());
  var url = URL.createObjectURL(blob);
  return url;
}

export function isPDF() {
  return document?.body?.children?.[0]?.type == "application/pdf";
}


export function getEbookIframe() {
  var shadows = getAllShadows();
  var iframe = shadows?.[1]?.querySelectorAll("iframe")[0];
  return iframe;
}

export function getPDFUrl(url){
  return browser.runtime.getURL(
    `/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`
  )
}

export function isPDFViewer() {
  return document.location.href.includes("pdfjs/web/viewer.html");
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

// export function detectLangFranc(text) {
//   var detectLangData = francAll(text, { minLength: 0 })?.[0]?.[0];
//   var lang = iso6393To1[detectLangData];
//   return lang;
// }

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
  return /Key|Digit|Numpad|Space/.test(key);
}

export function isEdge() {
  return (
    typeof window.StyleMedia !== "undefined" ||
    (typeof window.external === "object" &&
     typeof window.external.AddSearchProvider === "function")
  );
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

export function clearSelection()
{
 if (window.getSelection) {window.getSelection().removeAllRanges();}
 else if (document.selection) {document.selection.empty();}
}

//send to background.js for background processing  ===========================================================================

export async function requestTranslate(
  word,
  sourceLang,
  targetLang,
  reverseLang,
  engine
) {
  return await sendMessage({
    type: "translate",
    data: {
      text: word,
      sourceLang,
      targetLang,
      reverseLang,
      engine,
    },
  });
}

export async function requestTTS(
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  timestamp = Date.now(),
  noInterrupt
) {
  return await sendMessage({
    type: "tts",
    data: {
      sourceText,
      sourceLang,
      targetText,
      targetLang,
      timestamp,
      noInterrupt
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

export async function requestStopTTS(timestamp,force) {
  return await sendMessage({
    type: "stopTTS",
    data: {
      timestamp,
      force
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
  return await sendMessageOffscreen({
    type: "startSpeechRecognition",
    data: {
      lang,
    },
  });
}

export async function requestStopSpeechRecognitionOffscreen() {
  return await sendMessageOffscreen({
    type: "stopSpeechRecognition",
  });
}

export async function requestPlayTtsOffscreen(source, rate, volume, timestamp) {
  return await sendMessageOffscreen({
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
  return await sendMessageOffscreen({ type: "stopTTSOffscreen", data: { timestamp } });
}

export async function requestMdfTtsOffscreen(text, voice, lang, rate, volume, timestamp) {
  return await sendMessageOffscreen({ type: "playMDNTTSOffscreen", data: { text, voice, lang, rate, volume, timestamp } });
}

export async function requestKillAutoReaderTabs(includeCaller) {
  return await sendMessage({ type: "killAutoReaderTabs", data: {includeCaller} });
}


async function sendMessageOffscreen(message) {
  await createOffscreen();
  if (checkFirefox()) {
    return await postMessage(message, getOffscreenIframe());
  }
  return await sendMessage(message);
}


// iframe util=================================================================================================

function checkFirefox() {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

function getOffscreenIframe() {
  return document.querySelector('iframe[src="offscreen.html"]');
}

async function postMessage(data, frame) {
  return await windowPostMessageProxy.postMessage(frame.contentWindow, data);
}


function handleFirefoxOffscreen() {
  if (checkFirefox()) {
    if (!getOffscreenIframe()) {
      let iframe = document.createElement('iframe');
      iframe.src = "offscreen.html";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }
  }
}



//open side window =======================
// Create the offscreen document
export async function createOffscreen() {
  if (typeof browser === "undefined" || !browser.offscreen) {
    handleFirefoxOffscreen();
    return;
  }
  try {
    await browser?.offscreen?.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "TTS & Speech",
    });
  } catch (error) {
    if (!error.message.startsWith("Only a single offscreen")) {
      console.log(error);
    }
  }
}

export async function removeOffscreen() {
  return new Promise((resolve, reject) => {
    browser.offscreen.closeDocument(() => resolve());
  });
}

export function openSettingPage() {
  openPage(`chrome://extensions/?id=${browser.runtime?.id}`);
}

export function openPage(url) {
  browser.tabs.create({ url });
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

export function deepElementFromPoint(x, y) {
  let el = document.elementFromPoint(x, y);
  while (el && el.shadowRoot) {
    const inner = el.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === el) break; // avoid infinite loop
    el = inner;
  }
  return el;
}

export function getPointedImg(x, y) {
  // Check if the primary element is an image
  const primaryElement = deepElementFromPoint(x, y);
  if (checkIsImage(primaryElement)) return primaryElement;

  // Check for an image element in the elements stack
  const elements = document.elementsFromPoint(x, y);
  const imageElement = elements.find(checkIsImage);
  if (imageElement) return imageElement;

  // Check for a CSS background image in the elements stack
  const cssImageElement = elements.find(checkIsCSSImage);
  if (cssImageElement) {
    return createHiddenImageFromCSS(cssImageElement);
  }

  return null;
}

function createHiddenImageFromCSS(element) {
  const url = extractBackgroundImageUrl(element.style.backgroundImage);
  const hiddenImg = document.createElement("img");
  hiddenImg.src = url;
  hiddenImg.style.position = "absolute";
  hiddenImg.style.opacity = "0";
  hiddenImg.style.zIndex = "-999";

  const rect = element.getBoundingClientRect();
  hiddenImg.style.left = `${rect.left + window.scrollX}px`;
  hiddenImg.style.top = `${rect.top + window.scrollY}px`;
  hiddenImg.style.width = `${element.offsetWidth}px`;
  hiddenImg.style.height = `${element.offsetHeight}px`;

  document.body.appendChild(hiddenImg);
  return hiddenImg;
}
function checkIsCSSImage(ele) {
  if (!ele || !ele.style || !ele.style.backgroundImage) return false;
  const url = extractBackgroundImageUrl(ele.style.backgroundImage);
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function extractBackgroundImageUrl(backgroundImage) {
  let url = backgroundImage
    .replace(/^url\(["']?/, "") // Remove 'url("' or "url('" or 'url('
    .replace(/["']?\)$/, "") // Remove '")' or "')" or ')'
    .trim(); // Trim whitespace
    
  if (url.startsWith("//")) {
    url = "https:" + url;
  } else if (url.startsWith("/")) {
    url = window.location.origin + url;
  }  

  return url;
}

function checkIsImage(ele) {

  

  return (
    ele?.tagName == "IMG" &&
    ele?.src &&
    ele?.complete &&
    ele?.naturalHeight !== 0 &&
    ele?.width > 150 &&
    ele?.height > 150
  );
}
