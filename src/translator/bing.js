import BaseTranslator from "./baseTranslator";
import ky from "ky";

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
  tr: "tr",
  uk: "uk",
  ur: "ur",
  vi: "vi",

  iw: "he",
  tl: "fil",
  pt: "pt", //PortugueseBrazil
  // "pt-PT": "pt-pt", //PortuguesePortugal
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
};

export default class bing extends BaseTranslator {
  static bingBaseUrl = "https://www.bing.com/ttranslatev3";
  static bingTokenUrl = "https://www.bing.com/translator";
  static bingChinaBaseUrl = "https://cn.bing.com/ttranslatev3";
  static bingChinaTokenUrl = "https://cn.bing.com/translator";

  static langCodeJson = bingLangCode;
  static bingAccessToken;

  static async requestTranslate(text, sourceLang, targetLang) {
    const { token, key, IG, IID } = await this.getBingAccessToken();

    return await ky
      .post(this.bingBaseUrl, {
        searchParams: {
          IG,
          IID:
            IID && IID.length ? IID + "." + this.bingAccessToken.count++ : "",
          isVertical: "1",
        },
        body: new URLSearchParams({
          text,
          fromLang: sourceLang,
          to: targetLang,
          token,
          key,
        }),
      })
      .json();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    if (res && res[0]) {
      var transliteration = "";

      if (res[1]) {
        transliteration = res[1]["inputTransliteration"];
      }

      var detectedLang = res[0]["detectedLanguage"]["language"];
      var translatedText = res[0]["translations"][0]["text"];
      return { translatedText, detectedLang, transliteration };
    }
  }

  static async getBingAccessToken() {
    // https://github.com/plainheart/bing-translate-api/blob/dd0319e1046d925fa4cd4850e2323c5932de837a/src/index.js#L42
    try {
      //if no access token or token is timeout, get new token
      if (
        !this.bingAccessToken ||
        Date.now() - this.bingAccessToken["tokenTs"] >
          this.bingAccessToken["tokenExpiryInterval"]
      ) {
        const data = await ky(this.bingTokenUrl).text();
        const IG = data.match(/IG:"([^"]+)"/)[1];
        const IID = data.match(/data-iid="([^"]+)"/)[1];
        var [_key, _token, interval] = JSON.parse(
          data.match(/params_AbusePreventionHelper\s?=\s?([^\]]+\])/)[1]
        );
        this.bingAccessToken = {
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
      return this.bingAccessToken;
    } catch (e) {
      console.log(e);
    }
  }
}

async function checkChinaFirewall() {
  var res = await ky.get("https://www.bing.com");
  return res.status == 200;
}
