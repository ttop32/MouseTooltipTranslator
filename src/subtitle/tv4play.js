import DOMSubtitleVideo from "./domSubtitleVideo";

export default class TV4Play extends DOMSubtitleVideo {
  static sitePattern = /^https:\/\/(?:www\.)?tv4play\.se(?:\/|$)/;
  static captionRequestPattern = /NEVER_MATCH_TV4PLAY/;
  static baseUrl = "https://www.tv4play.se";
  static playerSelector = "video";
  static captionContainerSelector = "#html-subtitles";
  static nativeSubtitleSelector = "#html-subtitles";
  static captionWindowSelector = "#html-subtitles > *";
  static captionBoxSelector = "#html-subtitles > *";
  static errorLabel = "TV4 Play Translator";
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static guessVideoLang() { return "sv"; }
  static guessSubtitleLang() { return "sv"; }
}
