'use strict';

//handle translation, setting and pdf
//it communicate with popup.js(for setting) and contentScript.js(for translattion and tts)
//for setting, it save and load from chrome storage
//for translation, use fetch to get translated  result

//tooltip background===========================================================================
import {
  getSettingFromStorage
} from "./setting";

var currentSetting = {};
var settingLoaded = false;
var currentAudio = null;
var bingLangCode = {
  "auto": "auto-detect",
  'af': 'af',
  'am': 'am',
  'ar': 'ar',
  'az': 'az',
  'bg': 'bg',
  'bs': 'bs',
  'ca': 'ca',
  'cs': 'cs',
  'cy': 'cy',
  'da': 'da',
  'de': 'de',
  'el': 'el',
  'en': 'en',
  'es': 'es',
  'et': 'et',
  'fa': 'fa',
  'fi': 'fi',
  'fr': 'fr',
  'ga': 'ga',
  'gu': 'gu',
  'hi': 'hi',
  'hmn': 'mww',
  'hr': 'hr',
  'ht': 'ht',
  'hu': 'hu',
  'hy': 'hy',
  'id': 'id',
  'is': 'is',
  'it': 'it',
  'iw': 'he',
  'ja': 'ja',
  'kk': 'kk',
  'km': 'km',
  'kn': 'kn',
  'ko': 'ko',
  'ku': 'ku',
  'lo': 'lo',
  'lt': 'lt',
  'lv': 'lv',
  'mg': 'mg',
  'mi': 'mi',
  'ml': 'ml',
  'mr': 'mr',
  'ms': 'ms',
  'mt': 'mt',
  'my': 'my',
  'ne': 'ne',
  'nl': 'nl',
  'no': 'nb',
  'pa': 'pa',
  'pl': 'pl',
  'ps': 'ps',
  'pt': 'pt',
  'ro': 'ro',
  'ru': 'ru',
  'sk': 'sk',
  'sl': 'sl',
  'sm': 'sm',
  'sq': 'sq',
  'sr': 'sr-Cyrl',
  'sv': 'sv',
  'sw': 'sw',
  'ta': 'ta',
  'te': 'te',
  'th': 'th',
  'tl': 'fil',
  'tr': 'tr',
  'uk': 'uk',
  'ur': 'ur',
  'vi': 'vi',
  'zh-cn': 'zh-Hans',
  'zh-tw': 'zh-Hant'
};

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

var bingLangCodeOpposite = swap(bingLangCode); // swap key value
getSetting()


//listen from contents js and background js =========================================================================================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  (async () => {
    if (settingLoaded == false) {
      await getSetting();
    }

    if (request.type === 'translate') {
      doTranslate(request, sendResponse);

    } else if (request.type === 'tts') {
      //get avilable voice list
      chrome.tts.getVoices((voices) => {
        let filtered = voices.filter((e) => {
          return e.remote != null && e.lang != null && e.voiceName != null
        }); //get one that include remote, lang, voiceName

        filtered.sort((x, y) => {
          return y.remote - x.remote
        }); //get remote first;

        //find matched lang voice and speak
        for (var item of filtered) {
          if (item.lang.toLowerCase().includes(request.lang.toLowerCase())) {
            chrome.tts.speak(request.word, {
              'lang': request.lang,
              'voiceName': item.voiceName
            });
            break
          }
        }
      })
      sendResponse({});
    } else if (request.type === 'stopTTS') {
      chrome.tts.stop();
      sendResponse({});
    } else if (request.type === 'saveSetting') {
      saveSetting(request.options);
      sendResponse({});
    } else if (request.type === 'recordHistory') {
      //append to front
      currentSetting["historyList"].unshift({
        "sourceText": request.sourceText,
        "targetText": request.targetText
      });
      //remove when too many list
      if (currentSetting["historyList"].length > 100) {
        currentSetting["historyList"].pop();
      }
      saveSetting(currentSetting);
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

async function getSetting() { //load  setting from background js
  currentSetting = await getSettingFromStorage();
  settingLoaded = true;
}


// translate ===========================================================
let bingAccessToken;

async function doTranslate(request, sendResponse) {
  var translatorUrl;
  var params;
  var detectedLang = "";
  var translatedText = "";

  //prepare params
  if (currentSetting["translatorVendor"] == "google") {
    translatorUrl = "https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&";
    params = {
      q: request.word,
      sl: currentSetting["translateSource"], //source lang
      tl: request.translateTarget //target lang
    };
  } else {
    //bing translation
    //if no access token or token is timeout, get new token
    if (!bingAccessToken || Date.now() - bingAccessToken["tokenTs"] > bingAccessToken["tokenExpiryInterval"]) {
      bingAccessToken = await getBingAccessToken();
    }
    translatorUrl = 'https://www.bing.com/ttranslatev3?isVertical=1\u0026&';
    const {
      token,
      key,
      IG,
      IID
    } = bingAccessToken;
    params = {
      text: request.word,
      fromLang: bingLangCode[currentSetting["translateSource"]],
      to: bingLangCode[request.translateTarget],
      token,
      key,
      IG,
      IID: (IID && IID.length ? IID + '.' + (bingAccessToken.count++) : ''),
    }
  }

  //send params to translator site
  try {
    const res = await fetch(translatorUrl + new URLSearchParams(params), {
      method: "POST",
    }).then(response => response.json())

    if (currentSetting["translatorVendor"] == "google") {
      if (res.sentences) {
        res.sentences.forEach(function(sentences) {
          if (sentences.trans) {
            translatedText += sentences.trans;
          }
        })
      }
      detectedLang = res.src;
    } else {
      //bing translation
      detectedLang = bingLangCodeOpposite[res[0]["detectedLanguage"]["language"]];
      translatedText = res[0]["translations"][0]["text"];
    }

    sendResponse({
      "translatedText": translatedText,
      "sourceLang": detectedLang,
      "targetLang": request.translateTarget
    });
  } catch (error) {
    console.log(error);
    sendResponse({
      "translatedText": "",
      "sourceLang": "en",
      "targetLang": request.translateTarget
    });
  }
}

async function getBingAccessToken() {
  // https://github.com/plainheart/bing-translate-api/blob/dd0319e1046d925fa4cd4850e2323c5932de837a/src/index.js#L42
  try {
    const data = await fetch("https://www.bing.com/translator").then(response => response.text());
    const IG = data.match(/IG:"([^"]+)"/)[1]
    const IID = data.match(/data-iid="([^"]+)"/)[1]
    const [_key, _token, interval, _isVertical, _isAuthv2] = JSON.parse(data.match(/params_RichTranslateHelper\s?=\s?([^\]]+\])/)[1]);
    return {
      IG,
      IID,
      key: _key,
      token: _token,
      tokenTs: _key,
      tokenExpiryInterval: interval,
      isAuthv2: undefined,
      count: 0,
    }
  } catch (e) {
    console.log(e);
  }
}
