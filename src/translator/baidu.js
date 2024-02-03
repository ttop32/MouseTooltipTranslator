import BaseTranslator from "./baseTranslator";

import ky from "ky";

var baseUrl = "https://fanyi.baidu.com/transapi";
var baiduLangCode = {
  en: "en",
  ja: "jp",
  ko: "kor",
  fr: "fra",
  es: "spa",
  th: "th",
  ar: "ara",
  ru: "ru",
  pt: "pt",
  de: "de",
  it: "it",
  el: "el",
  nl: "nl",
  pl: "pl",
  bg: "bul",
  et: "est",
  da: "dan",
  fi: "fin",
  cs: "cs",
  ro: "rom",
  sl: "slo",
  sv: "swe",
  hu: "hu",
  vi: "vie",
  "zh-CN": "zh",
  "zh-TW": "cht",
};

export default class baidu extends BaseTranslator {
  static langCodeJson = baiduLangCode;

  static async requestTranslate(text, sourceLang, targetLang) {
    return await ky
      .post(baseUrl, {
        searchParams: {
          from: sourceLang,
          to: targetLang,
        },
        body: new URLSearchParams({
          from: sourceLang,
          to: targetLang,
          query: text,
          source: "txt",
        }),
      })
      .json();
  }

  static async wrapResponse(res, text, sourceLang, targetLang) {
    var translatedText = res["data"][0]["result"]
      .map((text) => text?.[1])
      .filter((text) => text)
      .join(" ");
    return {
      translatedText,
      detectedLang: res["from"],
      transliteration: "",
    };
  }
}
