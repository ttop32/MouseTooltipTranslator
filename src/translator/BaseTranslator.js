import * as util from "/src/util";

export default class BaseTranslator {
  static langCodeJson = {};
  static langCodeJsonSwapped = {};

  static async translate(text, fromLang, targetLang) {
    try {
      fromLang = this.encodeLangCode(fromLang);
      targetLang = this.encodeLangCode(targetLang);
      var response = await this.requestTranslate(text, fromLang, targetLang);

      var { translatedText, detectedLang, transliteration } = this.wrapResponse(
        response,
        fromLang,
        targetLang
      );
      return {
        translatedText,
        transliteration,
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
    if (util.isEmpty(this.langCodeJsonSwapped)) {
      this.langCodeJsonSwapped = util.swapJsonKeyValue(this.langCodeJson);
    }
    return this.langCodeJsonSwapped[lang]
      ? this.langCodeJsonSwapped[lang]
      : lang;
  }

  static async requestTranslate(text, fromLang, targetLang) {
    throw new Error("Not implemented");
  }

  static wrapResponse(res, fromLang, targetLang) {
    throw new Error("Not implemented");
  }
}
