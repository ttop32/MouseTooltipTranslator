import DOMSubtitleVideo from "./domSubtitleVideo";

export default class SVT extends DOMSubtitleVideo {
  static sitePattern = /^(https:\/\/)(www\.svtplay\.se)/;
  static captionRequestPattern = /NEVER_MATCH_SVTPLAY/;
  static baseUrl = "https://www.svtplay.se";
  static playerSelector = "video";
  static captionContainerSelector = '[data-rt="subtitles-container"]';
  static nativeSubtitleSelector = '[data-rt="subtitles-container"]';
  static captionWindowSelector = '[data-rt="subtitles-container"] > *';
  static captionBoxSelector =
    '[data-rt="subtitles-container"] span, [data-rt="subtitles-container"] p';
  static errorLabel = "SVT Translator";
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static guessVideoLang() { return "sv"; }
  static guessSubtitleLang() { return "sv"; }
}
