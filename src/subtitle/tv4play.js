import SVT from "./svt";

// TV4 Play renders captions in the page DOM, so the SVT overlay-based
// translation can be reused without intercepting subtitle network requests.
export default class TV4Play extends SVT {
  static sitePattern = /^https:\/\/(?:www\.)?tv4play\.se(?:\/|$)/;
  static captionRequestPattern = /NEVER_MATCH_TV4PLAY/;
  static baseUrl = "https://www.tv4play.se";
  static captionContainerSelector = "#html-subtitles";
  static nativeSubtitleSelector = "#html-subtitles";
  static captionWindowSelector = "#html-subtitles > *";
  static captionBoxSelector = "#html-subtitles > *";
  static errorLabel = "TV4 Play Translator";

  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static guessVideoLang() {
    return "sv";
  }

  static guessSubtitleLang() {
    return "sv";
  }
}
