// text util==================================
import isUrl from "is-url";

// import TextUtil from "/src/util/text_util.js";

export default class TextUtil {
  static concatJson(x, y) {
    return Object.assign(x, y);
  }

  static copyJson(json) {
    return JSON.parse(JSON.stringify(json));
  }

  static sortJsonByKey(json) {
    return Object.keys(json)
      .sort()
      .reduce((obj, key) => {
        obj[key] = json[key];
        return obj;
      }, {});
  }

  static getJsonFromList(list) {
    var json = {};
    for (const [key, val] of Object.entries(list)) {
      json[val] = val;
    }
    return json;
  }

  static filterWord(word) {
    // filter one that only include num,space and special char(include currency sign) as combination
    word = this.trimAllSpace(word);
    // word=word.slice(0,1000);
    if (
      word.length > 1000 || //filter out text that has over 1000length
      isUrl(word) || //if it is url
      !/[^\s\d»«…~`!@#$%^&*()「」‑_+\-=\[\]{};、':"\\|,.<>\/?\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6\p{Extended_Pictographic}]/gu.test(
        word
      )
    ) {
      word = "";
    }
    return word;
  }

  static trimAllSpace(word) {
    if (!word) {
      return "";
    }
    word = word.replace(/\s+/g, " "); //replace whitespace as single space
    word = word.trim(); // remove whitespaces from begin and end of word
    return word;
  }

  static filterSpeechText(text){
    text = this.trimAllSpace(text);
    text=isUrl(text)?'':text; 
    text=this.filterEmoji(text)
    text=this.filterHtmlTag(text)
    text=this.filterNonSoundText(text)
    return text
  }
  static filterNonSoundText(text){
    return text.replace(/[「」»<>«]/g, "");
  }

  static filterEmoji(word) {
    return word.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\p{Extended_Pictographic})/g,
      ""
    );
  }

  static filterHtmlTag(word) {
    return word.replace(/([<>])/g, "");
  }

  

  static truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + "..." : str;
  }

  static copyTextToClipboard(text) {
    navigator.clipboard.writeText(text);
  }
}
