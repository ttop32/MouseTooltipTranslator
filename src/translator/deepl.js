import BaseTranslator from "./BaseTranslator";
import ky from "ky";

var deeplLangCode = {
  auto: "auto",
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
var deeplBaseUrl = "https://www2.deepl.com/jsonrpc?method=LMT_handle_jobs";

export default class deepl extends BaseTranslator {
  static langCodeJson = deeplLangCode;

  static async requestTranslate(text, fromLang, targetLang) {
    return {};
  }
  static wrapResponse(res, fromLang, targetLang) {
    return {};
  }
}
