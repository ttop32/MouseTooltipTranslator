"use strict";

//handle translation, setting and pdf
//it communicate with popup.js(for setting) and contentScript.js(for translattion and tts)
//for setting, it save and load from chrome storage
//for translation, use fetch to get translated  result

//tooltip background===========================================================================
import { getSettingFromStorage } from "./setting";

var currentSetting = {};
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

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

var bingLangCodeOpposite = swap(bingLangCode); // swap key value
getSetting();

//listen from contents js and background js =========================================================================================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  (async () => {
    if (settingLoaded == false) {
      await getSetting();
    }

    if (request.type === "translate") {
      doTranslate(request, sendResponse);
    } else if (request.type === "tts") {
      doTts(request.word, request.lang);
      sendResponse({});
    } else if (request.type === "stopTTS") {
      chrome.tts.stop();
      sendResponse({});
    } else if (request.type === "saveSetting") {
      saveSetting(request.options);
      sendResponse({});
    } else if (request.type === "recordHistory") {
      recordHistory(request);
      sendResponse({});
    }
  })();

  return true;
});

function saveSetting(inputSettings) {
  chrome.storage.local.set(inputSettings, function() {
    currentSetting = inputSettings;
  });
}

async function getSetting() {
  //load  setting from background js
  currentSetting = await getSettingFromStorage();
  settingLoaded = true;
}

function recordHistory(request) {
  //append history to front
  currentSetting["historyList"].unshift({
    sourceText: request.sourceText,
    targetText: request.targetText,
  });
  //remove when too many list
  if (currentSetting["historyList"].length > 100) {
    currentSetting["historyList"].pop();
  }
  saveSetting(currentSetting);
}

// translate ===========================================================
let bingAccessToken;
let googleBaseUrl =
  "https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&";
let bingBaseUrl = "https://www.bing.com/ttranslatev3?isVertical=1\u0026&";

async function doTranslate(request, sendResponse) {
  try {
    if (currentSetting["translatorVendor"] == "google") {
      var { translatedText, detectedLang } = await translateWithGoogle(
        request.word,
        request.translateTarget
      );
    } else {
      var { translatedText, detectedLang } = await translateWithBing(
        request.word,
        request.translateTarget
      );
    }

    sendResponse({
      translatedText: translatedText,
      sourceLang: detectedLang,
      targetLang: request.translateTarget,
    });
  } catch (error) {
    console.log(error);
    sendResponse({
      translatedText: "",
      sourceLang: "en",
      targetLang: request.translateTarget,
    });
  }
}

async function translateWithGoogle(word, targetLang) {
  let res = await postMessage(googleBaseUrl, {
    q: word,
    sl: currentSetting["translateSource"], //source lang
    tl: targetLang,
  });

  if (res && res.sentences) {
    var translatedText = "";
    res.sentences.forEach(function(sentences) {
      if (sentences.trans) {
        translatedText += sentences.trans;
      }
    });
    var detectedLang = res.src;
    return { translatedText, detectedLang };
  } else {
    return null;
  }
}

async function translateWithBing(word, targetLang) {
  const { token, key, IG, IID } = await getBingAccessToken();

  let res = await postMessage(bingBaseUrl, {
    text: word,
    fromLang: bingLangCode[currentSetting["translateSource"]],
    to: bingLangCode[targetLang],
    token,
    key,
    IG,
    IID: IID && IID.length ? IID + "." + bingAccessToken.count++ : "",
  });
  if (res && res[0]) {
    var detectedLang =
      bingLangCodeOpposite[res[0]["detectedLanguage"]["language"]];
    var translatedText = res[0]["translations"][0]["text"];
    return { translatedText, detectedLang };
  } else {
    return null;
  }
}

async function postMessage(url, params) {
  return await fetch(url + new URLSearchParams(params), {
    method: "POST",
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
