import ky from "ky";
import * as cheerio from "cheerio";

import BaseTranslator from "./baseTranslator.js";
import * as util from "/src/util";

var googleSearchUrl = "https://www.google.com/search";

export default class googleWeb extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    var lang = "en";
    return await ky(googleSearchUrl, {
      searchParams: {
        q: `meaning:${text}`,
        hl: lang,
        lr: `lang_${lang}`,
      },
    }).text();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    const $ = cheerio.load(res);
    var dictAll = $(".eQJLDd");
    var dictFirst = dictAll.children(":first").find("[data-dobid='dfn']");
    var translatedText = dictFirst.text();
    // var detectedLang1 = util.detectLangFranc(text);
    var detectedLang = await util.detectLangBrowser(text);

    return {
      translatedText,
      detectedLang,
      transliteration: "",
    };
  }
}
