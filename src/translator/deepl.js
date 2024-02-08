// https://github.com/akl7777777/bob-plugin-akl-deepl-free-translate/blob/fc8460a8e24776e4e95961fc4607f77994f6b2ab/src/main.js#L8

import BaseTranslator from "./baseTranslator";
import ky from "ky";

var deeplLangCode = {
  auto: "auto",
  ar: "AR",
  bg: "BG",
  cs: "CS",
  da: "DA",
  de: "DE",
  el: "EL",
  en: "EN",
  es: "ES",
  et: "ET",
  fi: "FI",
  fr: "FR",
  hu: "HU",
  id: "ID",
  it: "IT",
  ja: "JA",
  ko: "KO",
  lt: "LT",
  lv: "LV",
  no: "NB",
  nl: "NL",
  pl: "PL",
  pt: "PT",
  ro: "RO",
  ru: "RU",
  sk: "SK",
  sl: "SL",
  sv: "SV",
  tr: "TR",
  uk: "UK",
  "zh-CN": "ZH",
};
var deeplBaseUrl = "https://www2.deepl.com/jsonrpc";

export default class deepl extends BaseTranslator {
  static langCodeJson = deeplLangCode;

  static async requestTranslate(text, sourceLang, targetLang) {
    const post_data = initData(text, sourceLang, targetLang);
    post_data.id = getRandomNumber();
    post_data.params.timestamp = getTimeStamp(getICount(text));
    let post_str = getDeeplJsonText(post_data);

    return await ky
      .post(deeplBaseUrl, {
        anonymous: true,
        nocache: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: post_str,
      })
      .json();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    if (res.result) {
      return {
        translatedText: res.result.texts[0].text,
        detectedLang: res.result.lang,
        transliteration: "",
      };
    }
  }
}

function initData(text, source_lang, target_lang) {
  return {
    jsonrpc: "2.0",
    method: "LMT_handle_texts",
    params: {
      splitting: "newlines",
      lang: {
        source_lang_user_selected: source_lang,
        target_lang: target_lang,
      },
      texts: [
        {
          text,
          requestAlternatives: 3,
        },
      ],
    },
  };
}

function getICount(translate_text) {
  return translate_text.split("i").length - 1;
}

function getRandomNumber() {
  const rand = Math.floor(Math.random() * 99999) + 100000;
  return rand * 1000;
}

function getTimeStamp(iCount) {
  const ts = Date.now();
  if (iCount !== 0) {
    iCount = iCount + 1;
    return ts - (ts % iCount) + iCount;
  } else {
    return ts;
  }
}

function getDeeplJsonText(post_data) {
  var id = post_data.id;
  let post_str = JSON.stringify(post_data);
  if ((id + 5) % 29 === 0 || (id + 3) % 13 === 0) {
    post_str = post_str.replace('"method":"', '"method" : "');
  } else {
    post_str = post_str.replace('"method":"', '"method": "');
  }
  return post_str;
}
