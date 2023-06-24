import * as util from '../util.js';


export default class BaseTranslator {
  static langCodeJson = {};
  static langCodeJsonSwapped = {};

  static async translate(text, fromLang, targetLang) {
    try {
      fromLang = this.encodeLangCode(fromLang);
      targetLang = this.encodeLangCode(targetLang);
      var response = await this.requestTranslate(text, fromLang, targetLang);

      var wrappedResponse = this.wrapResponse(
        response,
        fromLang,
        targetLang
      );

      if(!wrappedResponse){
        throw new Error("Response Crash");
      }
    var { translatedText, detectedLang } = wrappedResponse;
      

      return {
        translatedText,
        sourceLang: this.decodeLangCode(detectedLang),
        targetLang: this.decodeLangCode(targetLang),
      };
    } catch (error) {
      console.log(error);
      return {
        translatedText: "",
        sourceLang: "en",
        targetLang: "en",
      };
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

  static async fetchMessage(url, params, method) {
    return await fetch(url + new URLSearchParams(params), {
      method,
    })
      .then((response) => response.json())
      .catch((err) => console.log(err));
  }
  static async fetchMessageWithBody(url, params, method, body) {
    return await fetch(url + new URLSearchParams(params), {
      method,
      body,
    })
      .then((response) => response.json())
      .catch((err) => console.log(err));
  }

  static async requestTranslate(text, fromLang, targetLang) {
    throw new Error("Not implemented");
  }

  static wrapResponse(res, fromLang, targetLang) {
    throw new Error("Not implemented");
  }
}
