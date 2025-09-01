import BaseTranslator from "./baseTranslator";
import ky from "ky";


var bingLangCode = {
  auto: "auto-detect",
  af: "af", // Afrikaans
  sq: "sq", // Albanian
  am: "am", // Amharic
  ar: "ar", // Arabic
  hy: "hy", // Armenian
  as: "as", // Assamese
  az: "az", // Azerbaijani
  ba: "ba", // Bashkir
  eu: "eu", // Basque
  bn: "bn", // Bengali
  bho: "bho", // Bhojpuri
  bs: "bs", // Bosnian
  bg: "bg", // Bulgarian
  yue: "yue", // Cantonese
  ca: "ca", // Catalan
  ny: "nya", // Chichewa (Nyanja)
  "zh-CN": "zh-Hans", // Chinese Simplified
  "zh-TW": "zh-Hant", // Chinese Traditional
  hr: "hr", // Croatian
  cs: "cs", // Czech
  da: "da", // Danish
  dv: "dv", // Divehi
  doi: "doi", // Dogri
  nl: "nl", // Dutch
  en: "en", // English
  et: "et", // Estonian
  fj: "fj", // Fijian
  fil: "fil", // Filipino (Tagalog)
  fi: "fi", // Finnish
  fr: "fr", // French
  "fr-FR": "fr", // French (French)
  "fr-CA": "fr-ca", // French (Canadian)
  gl: "gl", // Galician
  lg: "lug", // Ganda (Luganda)
  ka: "ka", // Georgian
  de: "de", // German
  el: "el", // Greek
  gu: "gu", // Gujarati
  ht: "ht", // Haitian Creole
  ha: "ha", // Hausa
  iw: "he", // Hebrew
  hi: "hi", // Hindi
  hmn: "mww", // Hmong
  hu: "hu", // Hungarian
  is: "is", // Icelandic
  ig: "ig", // Igbo
  id: "id", // Indonesian
  ga: "ga", // Irish
  it: "it", // Italian
  ja: "ja", // Japanese
  kn: "kn", // Kannada
  kk: "kk", // Kazakh
  km: "km", // Khmer
  rw: "rw", // Kinyarwanda
  gom: "gom", // Konkani
  ko: "ko", // Korean
  ku: "ku", // Kurdish
  ckb: "ku", // Kurdish (Sorani)
  ky: "ky", // Kyrgyz
  lo: "lo", // Lao
  lv: "lv", // Latvian
  ln: "ln", // Lingala
  lt: "lt", // Lithuanian
  mk: "mk", // Macedonian
  mai: "mai", // Maithili
  mg: "mg", // Malagasy
  ms: "ms", // Malay
  ml: "ml", // Malayalam
  mt: "mt", // Maltese
  mi: "mi", // Maori
  mr: "mr", // Marathi
  mn: "mn-Cyrl", // Mongolian
  my: "my", // Myanmar (Burmese)
  ne: "ne", // Nepali
  nso: "nso", // Northern Sotho (Sepedi)
  no: "nb", // Norwegian
  or: "or", // Odia (Oriya)
  ps: "ps", // Pashto
  fa: "fa", // Persian
  pl: "pl", // Polish
  pt: "pt", // Portuguese
  "pt-PT": "pt-pt", // Portuguese (Portugal)
  "pt-BR": "pt", // Portuguese (Brazil)
  pa: "pa", // Punjabi
  ro: "ro", // Romanian
  rn: "run", // Rundi
  ru: "ru", // Russian
  sm: "sm", // Samoan
  sr: "sr-Cyrl", // Serbian
  st: "st", // Sesotho
  sn: "sn", // Shona
  sd: "sd", // Sindhi
  si: "si", // Sinhala (Sinhalese)
  sk: "sk", // Slovak
  sl: "sl", // Slovenian
  so: "so", // Somali
  es: "es", // Spanish
  sw: "sw", // Swahili
  sv: "sv", // Swedish
  ta: "ta", // Tamil
  tt: "tt", // Tatar
  te: "te", // Telugu
  th: "th", // Thai
  ti: "ti", // Tigrinya
  tn: "tn", // Tswana
  tr: "tr", // Turkish
  tk: "tk", // Turkmen
  uk: "uk", // Ukrainian
  ur: "ur", // Urdu
  ug: "ug", // Uyghur
  uz: "uz", // Uzbek
  vi: "vi", // Vietnamese
  cy: "cy", // Welsh
  xh: "xh", // Xhosa
  yo: "yo", // Yoruba
  yua: "yua", // Yucatec Maya
  zu: "zu", // Zulu
};

export default class bing extends BaseTranslator {
  static bingBaseUrl = "https://www.bing.com/ttranslatev3";
  static bingTokenUrl = "https://www.bing.com/translator";
  static bingChinaBaseUrl = "https://cn.bing.com/ttranslatev3";
  static bingChinaTokenUrl = "https://cn.bing.com/translator";

  static langCodeJson = bingLangCode;
  static bingAccessToken;
  static customAgent;
  static async requestTranslate(text, sourceLang, targetLang) {
    const { token, key, IG, IID } = await this.getBingAccessToken();

    return await ky
      .post(this.bingBaseUrl, {
        headers:{
          "User-Agent": this.customAgent || navigator.userAgent,
        },
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
      var targetText = res[0]["translations"][0]["text"];
      return { targetText, detectedLang, transliteration };
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
