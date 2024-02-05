import ky from "ky";
import BaseTranslator from "./baseTranslator";

var apiUrl = "https://translate.googleapis.com/translate_a/single";

export default class googleGTX extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    return await ky(apiUrl, {
      searchParams: {
        client: "gtx",
        q: text,
        sl: sourceLang,
        tl: targetLang,
        dt: "t",
        dj: 1,
      },
    }).json();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    var translatedText = res.sentences
      .map((sentence) => sentence.trans)
      .join(" ");
    var detectedLang = res.src;

    return {
      translatedText,
      detectedLang,
      transliteration: "",
    };
  }
}
