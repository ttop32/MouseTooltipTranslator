import { isEmpty, invert } from "lodash";

export default class BaseTranslator {
  static langCodeJson = {};
  static langCodeJsonSwapped = {};

  static async translate(text, sourceLang, targetLang) {
    try {
      sourceLang = this.encodeLangCode(sourceLang);
      targetLang = this.encodeLangCode(targetLang);
      var response = await this.requestTranslate(text, sourceLang, targetLang);

      var { translatedText, detectedLang, transliteration, dict, imageUrl } =
        await this.wrapResponse(response, text, sourceLang, targetLang);
      return {
        translatedText,
        transliteration,
        dict,
        imageUrl,
        sourceLang: this.decodeLangCode(detectedLang),
        targetLang: this.decodeLangCode(targetLang),
      };
    } catch (error) {
      console.log(error);
      return;
    }
  }
  static encodeLangCode(lang) {
    return this.langCodeJson[lang] ? this.langCodeJson[lang] : lang;
  }
  static decodeLangCode(lang) {
    if (isEmpty(this.langCodeJsonSwapped)) {
      this.langCodeJsonSwapped = invert(this.langCodeJson);
    }
    return this.langCodeJsonSwapped[lang]
      ? this.langCodeJsonSwapped[lang]
      : lang;
  }

  static async requestTranslate(text, sourceLang, targetLang) {
    throw new Error("Not implemented");
  }

  static async wrapResponse(res, text, sourceLang, targetLang) {
    throw new Error("Not implemented");
  }
}
