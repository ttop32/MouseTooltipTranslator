import BaseTranslator from "./baseTranslator";

import ky from "ky";

const apiPath = "https://lingva.ml/api/v1/";

export default class lingva extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    return await ky(
      `${apiPath}${sourceLang}/${targetLang}/${encodeURIComponent(text)}`
    ).json();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    return {
      targetText: res["translation"],
      detectedLang: res["info"]["translation"],
      transliteration: res["info"]["pronunciation"]["query"],
    };
  }
}
