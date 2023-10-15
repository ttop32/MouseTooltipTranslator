import $ from "jquery";
import { parse } from "bcp-47";
import { Setting } from "/src/util/setting.js";
import isUrl from "is-url";
import browser from "webextension-polyfill";

var defaultData = {
  showTooltipWhen: "always",
  TTSWhen: "ControlLeft",
  translateWhen: "mouseoverselect",
  translateSource: "auto",
  //translateTarget: getDefaultLang(),
  translatorVendor: "google",
  detectType: "sentence",
  keyDownDetectSwap: "null",
  keyDownTranslateWriting: "AltRight",
  writingLanguage: "en",
  translateReverseTarget: "null",
  detectPDF: "true",
  enableYoutube: "dualsub",
  useTransliteration: "false",
  keyDownOCR: "ShiftLeft",
  ocrDetectionLang: "jpn_vert",
  tooltipFontSize: "14",
  tooltipWidth: "200",
  tooltipDistance: "15",
  tooltipPosition: "follow",
  tooltipTextAlign: "center",
  tooltipBackgroundBlur: "4",
  tooltipFontColor: "#ffffffff",
  tooltipBackgroundColor: "#000000b8",
  voiceVolume: "1.0",
  voiceRate: "1.0",
  voiceTarget: "source",
  voiceRepeat: "1",
  langExcludeList: [],
  websiteExcludeList: ["*.test.com"],

  captionOnStatusByUser: "true",
  historyList: [],
  historyRecordActions: [],
  ignoreCallbackOptionList: ["historyList"],
  popupCount: "0",
};

const PARENT_TAGS_TO_EXCLUDE = ["STYLE", "SCRIPT", "TITLE"];

var reviewUrlJson = {
  nnodgmifnfgkolmakhcfkkbbjjcobhbl:
    "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl",
  hmigninkgibhdckiaphhmbgcghochdjc:
    "https://chrome.google.com/webstore/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
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

export function caretRangeFromPoint(x, y, _document = document) {
  var range = _document.caretRangeFromPoint(x, y);
  //if no range or is not text, give null
  if (range == null || range.startContainer.nodeType !== Node.TEXT_NODE) {
    return;
  }
  return range;
}

export function caretRangeFromPointOnDocument(x, y) {
  var textNodes = textNodesUnder(document.body);
  return getRangeFromTextNodes(x, y, textNodes);
}

export function caretRangeFromPointOnShadowDom(x, y) {
  // get all text from shadows
  var shadows = getAllShadows();
  var textNodes = shadows
    .map((shadow) => Array.from(textNodesUnder(shadow)))
    .flat();

  return getRangeFromTextNodes(x, y, textNodes);
}

function getRangeFromTextNodes(x, y, textNodes) {
  // text node that position in x y
  var textNodes = textNodes.filter((textNode) =>
    checkXYInElement(getTextRange(textNode), x, y)
  );
  // convert text node to char range
  var ranges = textNodes
    .map((textNode) => Array.from(getCharRanges(textNode)))
    .flat();
  // get char range in x y
  var ranges = ranges.filter((range) => checkXYInElement(range, x, y));
  if (ranges.length) {
    return ranges[0];
  }
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

function textNodesUnder(el) {
  return walkNodeTree(el, NodeFilter.SHOW_TEXT, {
    inspect: (textNode) =>
      !PARENT_TAGS_TO_EXCLUDE.includes(textNode.parentElement?.nodeName),
  });
}

function walkNodeTree(
  root,
  whatToShow = NodeFilter.SHOW_ALL,
  { inspect, collect, callback } = {}
) {
  const walker = document.createTreeWalker(root, whatToShow, {
    acceptNode(node) {
      if (inspect && !inspect(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (collect && !collect(node)) {
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    callback?.(n);
    nodes.push(n);
  }

  return nodes;
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

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
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
    $(`#${scriptUrl}`).remove(); //remove prev script
    $("<script>", { id: scriptUrl })
      .on("load", () => resolve())
      .appendTo("head")
      .attr("src", chrome.runtime.getURL(scriptUrl));
  });
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

//image=================================
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

// remain ===================

export function checkInDevMode() {
  try {
    if (process.env.NODE_ENV == "development") {
      return true;
    }
  } catch (error) {}
  return false;
}

export function postMessage(data) {
  if (self == top) {
    window.postMessage(data, "*");
  } else {
    window.postMessage(data, "*");
    window.parent.postMessage(data, "*");
  }
}

export function getReviewUrl() {
  var extId =
    browser.runtime.id in reviewUrlJson
      ? browser.runtime.id
      : "hmigninkgibhdckiaphhmbgcghochdjc";

  return reviewUrlJson[extId];
}
