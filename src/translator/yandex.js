// https://github.com/vtosters/lite/blob/cf17ed64c759d366ae7121dc61c4328205963ed4/app/src/main/java/ru/vtosters/lite/translators/YandexTranslator.java#L35
import BaseTranslator from "./BaseTranslator";
import { v4 as uuidv4 } from "uuid";
import ky from "ky";

var yandexLangCode = {
  af: "af",
  sq: "sq",
  am: "am",
  ar: "ar",
  hy: "hy",
  az: "az",
  eu: "eu",
  be: "be",
  bn: "bn",
  bs: "bs",
  bg: "bg",
  ca: "ca",
  hr: "hr",
  cs: "cs",
  da: "da",
  nl: "nl",
  en: "en",
  eo: "eo",
  et: "et",
  tl: "tl",
  fi: "fi",
  fr: "fr",
  gl: "gl",
  ka: "ka",
  de: "de",
  el: "el",
  gu: "gu",
  ht: "ht",
  hi: "hi",
  hu: "hu",
  is: "is",
  id: "id",
  ga: "ga",
  it: "it",
  ja: "ja",
  kn: "kn",
  kk: "kk",
  km: "km",
  ko: "ko",
  ky: "ky",
  lo: "lo",
  la: "la",
  lv: "lv",
  lt: "lt",
  lb: "lb",
  mk: "mk",
  mg: "mg",
  ms: "ms",
  ml: "ml",
  mt: "mt",
  mi: "mi",
  mr: "mr",
  mn: "mn",
  my: "my",
  ne: "ne",
  no: "no",
  fa: "fa",
  pl: "pl",
  pt: "pt",
  pa: "pa",
  ro: "ro",
  ru: "ru",
  gd: "gd",
  sr: "sr",
  si: "si",
  sk: "sk",
  sl: "sl",
  es: "es",
  su: "su",
  sw: "sw",
  sv: "sv",
  tg: "tg",
  ta: "ta",
  te: "te",
  th: "th",
  tr: "tr",
  uk: "uk",
  ur: "ur",
  uz: "uz",
  vi: "vi",
  cy: "cy",
  xh: "xh",
  yi: "yi",

  iw: "he",
  jw: "jv",
  "zh-CN": "zh",
};
// 'ba', 'cv', 'tt',
var mainUrl = "https://translate.yandex.net/api/v1/tr.json/translate";

export default class yandex extends BaseTranslator {
  static langCodeJson = yandexLangCode;

  static async requestTranslate(text, fromLang, targetLang) {
    var uuid = uuidv4().replaceAll("-", "");
    var lang = fromLang == "auto" ? targetLang : `${fromLang}-${targetLang}`;

    return await ky
      .post(mainUrl, {
        searchParams: {
          id: `${uuid}-0-0`,
          srv: "android",
        },
        body: new URLSearchParams(`lang=${lang}&text=${text}`),
      })
      .json();
  }

  static wrapResponse(res, fromLang, targetLang) {
    if (res.code == "200") {
      return {
        translatedText: res["text"][0],
        detectedLang: res["lang"].split("-")[0],
        transliteration: "",
      };
    }
  }
}
