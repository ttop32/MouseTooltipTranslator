import BaseTranslator from "./BaseTranslator";

// https://github.com/PinMIlk/nodepapago
import axios from "axios";
import axiosFetchAdapter from "@vespaiach/axios-fetch-adapter";
axios.defaults.adapter = axiosFetchAdapter;
import Translator from "nodepapago";


var papagoLangCode = {
  auto: "detect",
  ar: "ar",
  en: "en",
  fa: "fa",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
  it: "it",
  ja: "ja",
  ko: "ko",
  my: "mm",
  pt: "pt",
  ru: "ru",
  es: "es",
  th: "th",
  vi: "vi",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
};

export default class google extends BaseTranslator {
  static langCodeJson = papagoLangCode;

  static async requestTranslate(text, fromLang, targetLang) {
    return await new Translator({
      parameter: {
        source: fromLang,
        target: targetLang,
        text,
      },
      verbose: true,
    }).translate();
  }
  static wrapResponse(res, fromLang, targetLang) {
    if (res && res["translatedText"]) {
      var translatedText = res["translatedText"];
      var detectedLang = res["srcLangType"];
      return { translatedText, detectedLang };
    }
  }
}
