"use strict";

//handle translation, setting and pdf
//it communicate with popup.js(for setting) and contentScript.js(for translation and tts)
//for setting, it save and load from chrome storage
//for translation, use fetch to get translated  result

//tooltip background===========================================================================
import { Setting } from "./setting";
var he = require("he");

var setting;
var settingLoaded = false;
var bingLangCode = {
  auto: "auto-detect",
  af: "af",
  am: "am",
  ar: "ar",
  az: "az",
  bg: "bg",
  bs: "bs",
  ca: "ca",
  cs: "cs",
  cy: "cy",
  da: "da",
  de: "de",
  el: "el",
  en: "en",
  es: "es",
  et: "et",
  fa: "fa",
  fi: "fi",
  fr: "fr",
  ga: "ga",
  gu: "gu",
  hi: "hi",
  hmn: "mww",
  hr: "hr",
  ht: "ht",
  hu: "hu",
  hy: "hy",
  id: "id",
  is: "is",
  it: "it",
  iw: "he",
  ja: "ja",
  kk: "kk",
  km: "km",
  kn: "kn",
  ko: "ko",
  ku: "ku",
  lo: "lo",
  lt: "lt",
  lv: "lv",
  mg: "mg",
  mi: "mi",
  ml: "ml",
  mr: "mr",
  ms: "ms",
  mt: "mt",
  my: "my",
  ne: "ne",
  nl: "nl",
  no: "nb",
  pa: "pa",
  pl: "pl",
  ps: "ps",
  pt: "pt",
  ro: "ro",
  ru: "ru",
  sk: "sk",
  sl: "sl",
  sm: "sm",
  sq: "sq",
  sr: "sr-Cyrl",
  sv: "sv",
  sw: "sw",
  ta: "ta",
  te: "te",
  th: "th",
  tl: "fil",
  tr: "tr",
  uk: "uk",
  ur: "ur",
  vi: "vi",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

var bingLangCodeOpposite = swap(bingLangCode); // swap key value
var recentTranslated = {};
getSetting();

//listen message from contents js and popup js =========================================================================================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  (async () => {
    if (settingLoaded == false) {
      await getSetting();
    }

    if (request.type === "translate") {
      var translatedResult = await doTranslate(
        request.word,
        request.translateTarget,
        setting.data["translateSource"],
        setting.data["translatorVendor"]
      );
      sendResponse(translatedResult);
    } else if (request.type === "tts") {
      doTts(request.word, request.lang);
      sendResponse({});
    } else if (request.type === "stopTTS") {
      chrome.tts.stop();
      sendResponse({});
    } else if (request.type === "updateRecentTranslated") {
      recordHistory(request);
      updateContext(request);
      sendResponse({});
    }
  })();

  return true;
});

async function getSetting() {
  setting = await Setting.create();
  settingLoaded = true;
}

function recordHistory(request, force = false) {
  //if action not included
  if (
    force ||
    setting.data["historyRecordActions"].includes(request.actionType)
  ) {
    //append history to front
    setting.data["historyList"].unshift({
      sourceText: request.sourceText,
      targetText: request.targetText,
    });
    //remove when too many list
    if (setting.data["historyList"].length > 100) {
      setting.data["historyList"].pop();
    }
    setting.save(setting.data);
  }
}

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

// translate ===========================================================
let bingAccessToken;
let bingBaseUrl = "https://www.bing.com/ttranslatev3?isVertical=1\u0026&";

async function doTranslate(text, targetLang, fromLang, translatorVendor) {
  try {
    if (translatorVendor == "google") {
      var { translatedText, detectedLang } = await translateWithGoogle(
        text,
        targetLang,
        fromLang
      );
    } else {
      var { translatedText, detectedLang } = await translateWithBing(
        text,
        targetLang,
        fromLang
      );
    }

    return {
      translatedText: translatedText,
      sourceLang: detectedLang,
      targetLang: targetLang,
    };
  } catch (error) {
    console.log(error);
    return {
      translatedText: "",
      sourceLang: "en",
      targetLang: targetLang,
    };
  }
}

async function translateWithBing(word, targetLang, fromLang) {
  const { token, key, IG, IID } = await getBingAccessToken();

  let res = await fetchMessage(
    bingBaseUrl,
    {
      text: word,
      fromLang: bingLangCode[fromLang],
      to: bingLangCode[targetLang],
      token,
      key,
      IG,
      IID: IID && IID.length ? IID + "." + bingAccessToken.count++ : "",
    },
    "POST"
  );
  if (res && res[0]) {
    var detectedLang =
      bingLangCodeOpposite[res[0]["detectedLanguage"]["language"]];
    var translatedText = res[0]["translations"][0]["text"];
    return { translatedText, detectedLang };
  } else {
    return null;
  }
}

async function fetchMessage(url, params, httpMethod) {
  return await fetch(url + new URLSearchParams(params), {
    method: httpMethod,
  })
    .then((response) => response.json())
    .catch((err) => console.log(err));
}

async function getBingAccessToken() {
  // https://github.com/plainheart/bing-translate-api/blob/dd0319e1046d925fa4cd4850e2323c5932de837a/src/index.js#L42
  try {
    //if no access token or token is timeout, get new token
    if (
      !bingAccessToken ||
      Date.now() - bingAccessToken["tokenTs"] >
        bingAccessToken["tokenExpiryInterval"]
    ) {
      const data = await fetch(
        "https://www.bing.com/translator"
      ).then((response) => response.text());
      const IG = data.match(/IG:"([^"]+)"/)[1];
      const IID = data.match(/data-iid="([^"]+)"/)[1];
      const [_key, _token, interval, _isVertical, _isAuthv2] = JSON.parse(
        data.match(/params_RichTranslateHelper\s?=\s?([^\]]+\])/)[1]
      );
      bingAccessToken = {
        IG,
        IID,
        key: _key,
        token: _token,
        tokenTs: _key,
        tokenExpiryInterval: interval,
        isAuthv2: undefined,
        count: 0,
      };
    }
    return bingAccessToken;
  } catch (e) {
    console.log(e);
  }
}

//tts =========================================================================================

var voiceList = {};

async function doTts(word, lang) {
  var voice = await getVoices(lang);
  chrome.tts.speak(word, {
    lang: lang,
    voiceName: voice,
  });
}

function getVoices(lang) {
  return new Promise((resolve) => {
    //if already have voiceName return
    if (voiceList[lang]) {
      resolve(voiceList[lang]);
    } else {
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
          if (item.lang.toLowerCase().includes(lang.toLowerCase())) {
            voiceList[lang] = item.voiceName;
            resolve(voiceList[lang]);
            break;
          }
        }
      });
    }
  });
}

// translateWithGoogle=====================================================================

const googleTranslateTKK = "448487.932609646";
const apiPath = "https://translate.googleapis.com/translate_a/t?";

async function translateWithGoogle(word, targetLang, fromLang) {
  // code brought from https://github.com/translate-tools/core/blob/master/src/translators/GoogleTranslator/token.js

  var translatedText = "";
  var detectedLang = "";
  var tk = getToken(word, googleTranslateTKK);

  const data = {
    client: "te_lib",
    sl: fromLang,
    tl: targetLang,
    hl: targetLang,
    anno: 3,
    format: "html",
    v: 1.0,
    tc: 1,
    sr: 1,
    mode: 1,
    q: word,
    tk,
  };

  var res = await fetchMessage(apiPath, data, "GET");

  if (res && res[0] && res[0][0]) {
    if (fromLang == "auto") {
      translatedText = res[0][0];
      detectedLang = res[0][1];
    } else {
      translatedText = res[0];
      detectedLang = fromLang;
    }

    //clear html tag and decode html entity
    var translatedText = he.decode(translatedText);
    var bTag = translatedText.match(/(?<=<b>).+?(?=<\/b>)/g); //text between <b> </b>
    if (bTag && bTag[0]) {
      translatedText = bTag.join(" ");
    }

    return { translatedText, detectedLang };
  } else {
    return null;
  }
}

function shiftLeftOrRightThenSumOrXor(num, optString) {
  for (let i = 0; i < optString.length - 2; i += 3) {
    let acc = optString.charAt(i + 2);
    if ("a" <= acc) {
      acc = acc.charCodeAt(0) - 87;
    } else {
      acc = Number(acc);
    }
    if (optString.charAt(i + 1) == "+") {
      acc = num >>> acc;
    } else {
      acc = num << acc;
    }
    if (optString.charAt(i) == "+") {
      num += acc & 4294967295;
    } else {
      num ^= acc;
    }
  }
  return num;
}

function transformQuery(query) {
  const bytesArray = [];
  let idx = [];
  for (let i = 0; i < query.length; i++) {
    let charCode = query.charCodeAt(i);

    if (128 > charCode) {
      bytesArray[idx++] = charCode;
    } else {
      if (2048 > charCode) {
        bytesArray[idx++] = (charCode >> 6) | 192;
      } else {
        if (
          55296 == (charCode & 64512) &&
          i + 1 < query.length &&
          56320 == (query.charCodeAt(i + 1) & 64512)
        ) {
          charCode =
            65536 + ((charCode & 1023) << 10) + (query.charCodeAt(++i) & 1023);
          bytesArray[idx++] = (charCode >> 18) | 240;
          bytesArray[idx++] = ((charCode >> 12) & 63) | 128;
        } else {
          bytesArray[idx++] = (charCode >> 12) | 224;
        }
        bytesArray[idx++] = ((charCode >> 6) & 63) | 128;
      }
      bytesArray[idx++] = (charCode & 63) | 128;
    }
  }
  return bytesArray;
}

function getToken(query, windowTkk) {
  const tkkSplited = windowTkk.split(".");
  const tkkIndex = Number(tkkSplited[0]) || 0;
  const tkkKey = Number(tkkSplited[1]) || 0;

  const bytesArray = transformQuery(query);

  let encondingRound = tkkIndex;
  for (let i = 0; i < bytesArray.length; i++) {
    encondingRound += bytesArray[i];
    encondingRound = shiftLeftOrRightThenSumOrXor(encondingRound, "+-a^+6");
  }
  encondingRound = shiftLeftOrRightThenSumOrXor(encondingRound, "+-3^+b+-f");

  encondingRound ^= tkkKey;
  if (encondingRound <= 0) {
    encondingRound = (encondingRound & 2147483647) + 2147483648;
  }

  const normalizedResult = encondingRound % 1000000;
  return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex);
}

// detect local pdf file and redirect to translated pdf=====================================================================
chrome.tabs.onUpdated.addListener(
  //when tab update
  function(tabId, changeInfo, tab) {
    if (
      changeInfo.url &&
      /^(file:\/\/).*(\.pdf)$/.test(changeInfo.url.toLowerCase()) && //url is end with .pdf, start with file://
      !changeInfo.url.includes(
        chrome.runtime.getURL("/pdfjs/web/viewer.html")
      ) && //url is not start with chrome-extension://
      setting.data["detectPDF"] == "true"
    ) {
      openPDFViewer(changeInfo.url, tabId);
    }
  }
);

async function openPDFViewer(url, tabId) {
  chrome.tabs.update(tabId, {
    url:
      chrome.runtime.getURL("/pdfjs/web/viewer.html") +
      "?file=" +
      encodeURIComponent(url),
  });
}

// ================= contents script reinjection after upgrade or install
// https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
chrome.runtime.onInstalled.addListener(async () => {
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({ url: cs.matches })) {
      if (
        /^(chrome:\/\/|edge:\/\/|file:\/\/|https:\/\/chrome\.google\.com\/webstore).*/.test(
          tab.url
        )
      ) {
        continue;
      }

      //load css and js on opened tab
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: cs.css,
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: cs.js,
      });
    }
  }
});

// ================= context menu

chrome.contextMenus.create({
  id: "save",
  title: "save",
  visible: false,
});

function updateContext(request) {
  chrome.contextMenus.update("save", {
    title: "Save : " + truncate(request.sourceText, 12),
    contexts: ["page", "selection"],
    visible: true,
  });
  recentTranslated = request;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == "save") {
    recordHistory(recentTranslated, true);
  }
});

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}
