// import * as util from './util.js';

import { parse } from "bcp-47";

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

// ===============
//default setting load======================================
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

// caretRangeFromPointOnShadowDom ===========================
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

//==================================

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
