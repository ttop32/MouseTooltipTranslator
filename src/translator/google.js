import ky from "ky";
import BaseTranslator from "./baseTranslator";

var apiUrl = "https://translate.googleapis.com/translate_a/single";

export default class google extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    return ;
    var params =
      new URLSearchParams({
        client: "gtx",
        q: text,
        sl: sourceLang,
        tl: targetLang,
        dj: 1,
        hl: targetLang,
      }).toString() + "&dt=rm&dt=bd&dt=t";

    return await ky(`${apiUrl}?${params}`).json();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    var targetText = res.sentences
      ?.map((sentence) => sentence.trans)
      .filter((trans) => trans)
      .join(" ");
    var transliteration = res.sentences
      ?.map((sentence) => sentence.src_translit)
      .filter((translit) => translit)
      .join(" ")
      ?.trim();
    if (targetText) {
      targetText = targetText.replace(/\n /g, "\n");
    }
    if (transliteration) {
      transliteration = transliteration.replace(/\n /g, "\n");
    }

    //slice top 3 dict
    var dict = res.dict
      ?.map(
        (sentence) =>
          `${sentence.pos}: ${sentence.terms.slice(0, 3).join(", ")}`
      )
      .join("\n");
    var detectedLang = res.src;

    return {
      targetText,
      detectedLang,
      transliteration,
      dict,
    };
  }
}
