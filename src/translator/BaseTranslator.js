export default class BaseTranslator {
  static langCodeJson = {};
  static langCodeJsonSwapped = {};

  static async translate(text, fromLang, targetLang) {
    try {
      fromLang = this.encodeLangCode(fromLang);
      targetLang = this.encodeLangCode(targetLang);
      var response = await this.requestTranslate(text, fromLang, targetLang);

      var { translatedText, detectedLang } = this.wrapResponse(
        response,
        fromLang,
        targetLang
      );

      return {
        translatedText,
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
    if (!Object.keys(this.langCodeJsonSwapped)) {
      this.langCodeJsonSwapped = this.util.swapJsonKeyValue(this.langCodeJson);
    }
    return this.langCodeJsonSwapped[lang]
      ? this.langCodeJsonSwapped[lang]
      : lang;
  }

  static async fetchJson(url,  urlParams = "",options = {}) {
    var urlParams = urlParams ? "?" + new URLSearchParams(urlParams) : "";
    return await fetch(url + urlParams, options)
      .then((response) => response.json())
      .catch((err) => console.log(err));
  }
  static async fetchText(url,  urlParams = "",options = {}) {
    var urlParams = urlParams ? "?" + new URLSearchParams(urlParams) : "";
    return await fetch(url + urlParams, options)
      .then((response) => response.text())
      .catch((err) => console.log(err));
  }
  static async requestTranslate(text, fromLang, targetLang) {
    throw new Error("Not implemented");
  }

  static wrapResponse(res, fromLang, targetLang) {
    throw new Error("Not implemented");
  }
}
