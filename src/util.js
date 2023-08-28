// import * as util from './util.js';

import { parse } from "bcp-47";
import { Setting } from "./setting";
import isUrl from "is-url";

var defaultData = {
  showTooltipWhen: "always",
  TTSWhen: "ControlLeft",
  translateWhen: "mouseoverselect",
  translateSource: "auto",
  //translateTarget: getDefaultLang(),
  translatorVendor: "google",
  detectType: "sentence",
  keyDownDetectSwap: "null",
  keyDownTranslateWriting: "AltLeft",
  writingLanguage: "en",
  translateReverseTarget: "null",
  detectPDF: "true",
  detectYoutube: "true",
  useTransliteration: "false",
  useOCR: "false",
  ocrDetectionLang: "jpn_vert",
  tooltipFontSize: "14",
  tooltipWidth: "200",
  tooltipDistance: "5",
  tooltipPosition: "follow",
  tooltipTextAlign: "center",
  tooltipBackgroundBlur: "2",
  tooltipFontColor: "#ffffffff",
  tooltipBackgroundColor: "#000000b8",
  ttsVolume: "1.0",
  ttsRate: "1.0",
  historyList: [],
  historyRecordActions: [],
  langExcludeList: [],
  websiteExcludeList: ["*.test.com"],
  ignoreCallbackOptionList: ["historyList"],
};

//setting util======================================

export async function loadSetting(settingUpdateCallbackFn) {
  return await Setting.loadSetting(
    await getDefaultData(),
    settingUpdateCallbackFn
  );
}

export async function getDefaultData() {
  var defaultList = {};
  defaultList = concatJson(defaultList, defaultData);
  defaultList["translateTarget"] = getDefaultLang();
  defaultList = concatJson(defaultList, await getDefaultVoice());
  return defaultList;
}

export function getDefaultLang() {
  var lang = parse(navigator.language).language;
  lang = lang == "zh" ? navigator.language : lang; // chinese lang code fix
  return lang;
}

export async function getDefaultVoice() {
  var voiceList = await getAvailableVoiceList();
  var defaultVoice = {};

  for (var key in voiceList) {
    defaultVoice["ttsVoice_" + key] = voiceList[key][0];
  }
  return defaultVoice;
}

export function getAvailableVoiceList() {
  return new Promise((resolve) => {
    var voiceList = {};

    try {
      // get voice list and sort by remote first
      // get matched lang voice
      chrome.tts.getVoices((voices) => {
        let filtered = voices.filter((e) => {
          return e.remote != null && e.lang != null && e.voiceName != null;
        }); //get one that include remote, lang, voiceName

        filtered.sort((x, y) => {
          return y.remote - x.remote;
        }); //get remote first;

        //find matched lang voice and speak
        for (var item of filtered) {
          var lang = parse(item.lang).language;
          if (voiceList[lang]) {
            voiceList[lang].push(item.voiceName);
          } else {
            voiceList[lang] = [item.voiceName];
          }
        }
        resolve(voiceList);
      });
    } catch (err) {
      resolve(voiceList);
    }
  });
}

// range util====================================================================================
export function caretRangeFromPointOnShadowDom(x, y) {
  var shadows = getAllShadows();
  var textNodes = shadows
    .map((shadow) => Array.from(getAllTextNodes(shadow)))
    .flat();
  var textNodes = textNodes.filter((textNode) =>
    checkXYInElement(getTextRange(textNode), x, y)
  );
  var ranges = textNodes
    .map((textNode) => Array.from(getCharRanges(textNode)))
    .flat();
  var ranges = ranges.filter((range) => checkXYInElement(range, x, y));

  if (ranges.length) {
    // console.log(ranges[0].toString());
    return ranges[0];
  }
}

export function caretRangeFromPoint(x, y) {
  var range = document.caretRangeFromPoint(x, y);
  //if no range or is not text, give null
  if (range == null || range.startContainer.nodeType !== Node.TEXT_NODE) {
    return;
  }
  return range;
}

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

export function getAllTextNodes(el) {
  // https://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
  var n,
    a = [],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while ((n = walk.nextNode())) a.push(n);
  return a;
}

export function getTextRange(textNode) {
  var range = document.createRange();
  range.setStart(textNode, 0);
  range.setEnd(textNode, textNode.length);
  return range;
}

export function getCharRanges(textNode) {
  var ranges = [];
  for (let i = 0; i < textNode.length - 1; i++) {
    var range = document.createRange();
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    ranges.push(range);
  }
  return ranges;
}

export function checkXYInElement(ele, x, y) {
  var rect = ele.getBoundingClientRect(); //mouse in word rect
  if (rect.left > x || rect.right < x || rect.top > y || rect.bottom < y) {
    return false;
  }
  return true;
}

// text util==================================

export function concatJson(x, y) {
  return Object.assign(x, y);
}

export function copyJson(json) {
  return JSON.parse(JSON.stringify(json));
}

export function swapJsonKeyValue(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

export function getJsonFromList(list) {
  var json = {};
  for (const [key, val] of Object.entries(list)) {
    json[val] = val;
  }
  return json;
}

export function filterWord(word) {
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

// inject =================================
export function injectScript(scriptUrl) {
  return new Promise((resolve) => {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL(scriptUrl);
    s.onload = function() {
      this.remove();
      resolve();
    };
    // see also "Dynamic values in the injected code" section in this answer
    (document.head || document.documentElement).appendChild(s);
  });
}

// performance=======================================================
export function cacheFn(fn) {
  var cache = {};

  return async function() {
    var args = arguments;
    var key = [].slice.call(args).join("");
    if (5000 < Object.keys(cache).length) {
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

//image=================================
export function getBase64(url) {
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
        resolve("");
      });
  });
}

export function postMessage(data) {
  var targetWindow = self == top ? window : window.parent;
  targetWindow.postMessage(data, "*");
}
