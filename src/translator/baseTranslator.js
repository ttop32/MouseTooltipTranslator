
export default class BaseTranslator {
  static langCodeJson = {};
  static langCodeJsonSwapped = {};

  static async translate(text, sourceLang, targetLang) {
    try {
      sourceLang = this.encodeLangCode(sourceLang);
      targetLang = this.encodeLangCode(targetLang);
      var response = await this.requestTranslate(text, sourceLang, targetLang);

      var { targetText, detectedLang, transliteration, dict, imageUrl } =
        await this.wrapResponse(response, text, sourceLang, targetLang);
      return {
        targetText,
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
    if (this.isEmpty(this.langCodeJsonSwapped)) {
      this.langCodeJsonSwapped = this.invertJson(this.langCodeJson);
    }
    return this.langCodeJsonSwapped[lang]
      ? this.langCodeJsonSwapped[lang]
      : lang;
  }
  static invertJson(jsonData){
    return Object.fromEntries(Object.entries(jsonData).map(([key, value]) => [value, key]));
  }
  static isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  static async requestTranslate(text, sourceLang, targetLang) {
    throw new Error("Not implemented");
  }

  static async wrapResponse(res, text, sourceLang, targetLang) {
    throw new Error("Not implemented");
  }
}
