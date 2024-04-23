import ky from "ky";

import BaseTranslator from "./baseTranslator.js";
import * as util from "/src/util";

var googleSearchUrl = "https://www.google.com/search";
// https://stackoverflow.com/questions/70638466/how-do-i-scrape-all-the-images-from-a-google-image-search

export default class googleWebImage extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    return await ky(googleSearchUrl, {
      searchParams: {
        q: text,
        tbm: "isch",
      },
    }).text();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    var urlJSONData = res.match(/google.ldi=(\{[^{]+\});/)[1];
    var urlJSON = JSON.parse(urlJSONData);
    var imageUrl = urlJSON[Object.keys(urlJSON)[0]];
    var detectedLang = await util.detectLangBrowser(text);
    var base64Url = await util.getBase64(imageUrl);

    return {
      targetText: "image",
      detectedLang,
      transliteration: "",
      imageUrl: base64Url,
    };
  }
}

// var res = "";
// async function getImageSite() {
//   const response = await fetch("https://www.google.com/search?q=apple&udm=2");
//   res = await response.text();
// }
// getImageSite();
