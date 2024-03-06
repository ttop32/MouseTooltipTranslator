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
    var AFScript = res.match(/AF_initDataCallback\(([^<]+)\);/g)[1];
    var AFScript1 = AFScript.match(/AF_initDataCallback\(([^<]+)\);/)[1];
    var urlDataText = AFScript1.match(
      /\"b-GRID_STATE0\"(.*)sideChannel:\s?{}}/
    )[0];
    var urlsMeta = urlDataText.match(
      /\[\"(https\:\/\/encrypted-tbn0\.gstatic\.com\/images\?.*?)\",\d+,\d+\]/g
    );
    var imageUrls = urlsMeta.map((urlMeta) => JSON.parse(urlMeta)[0]);
    var detectedLang = await util.detectLangBrowser(text);
    var base64Url = await util.getBase64(imageUrls[0]);

    return {
      targetText: "image",
      detectedLang,
      transliteration: "",
      imageUrl: base64Url,
    };
  }
}
