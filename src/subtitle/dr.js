import DOMSubtitleVideo from "./domSubtitleVideo";

export default class DR extends DOMSubtitleVideo {
  static sitePattern = /^https:\/\/(?:www\.)?dr\.dk(?:\/|$)/i;
  static captionRequestPattern = /NEVER_MATCH_DR/;
  static baseUrl = "https://www.dr.dk";
  static playerSelector = "video";
  static captionContainerSelector = ".vjs-text-track-display";
  static nativeSubtitleSelector = ".vjs-text-track-display";
  static captionWindowSelector = ".vjs-text-track-cue";
  static captionBoxSelector = ".vjs-text-track-cue";
  static errorLabel = "DR Translator";
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static getSubtitleOverlayParent() {
    const video = document.querySelector(this.playerSelector);
    return video?.closest(".video-js") || video?.parentElement;
  }

  static guessVideoLang() { return "da"; }
  static guessSubtitleLang() { return "da"; }
}
