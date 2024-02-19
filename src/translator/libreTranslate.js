import BaseTranslator from "./baseTranslator";
import ky from "ky";

const apiPath = "https://libretranslate.com/translate";

export default class libreTranslate extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    return await ky
      .post(apiPath, {
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
        }),
      })
      .json();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    return {
      translatedText: res["translatedText"],
      detectedLang: res["detectedLanguage"]["language"],
      transliteration: "",
    };
  }
}
