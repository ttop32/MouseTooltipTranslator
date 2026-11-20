import DOMSubtitleVideo from "./domSubtitleVideo";

export default class URPlay extends DOMSubtitleVideo {
  static sitePattern = /^https:\/\/(?:www\.)?urplay\.se(?:\/|$)/i;
  static captionRequestPattern = /NEVER_MATCH_URPLAY/;
  static baseUrl = "https://urplay.se";
  static playerSelector = "video";
  static captionContainerSelector = ".jw-text-track-display";
  static nativeSubtitleSelector = ".jw-captions";
  static captionWindowSelector = ".jw-text-track-cue";
  static captionBoxSelector = ".jw-text-track-cue";
  static errorLabel = "UR Play Translator";
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static getSubtitleOverlayParent() {
    const captionContainer = document.querySelector(this.captionContainerSelector);
    if (captionContainer) {
      return captionContainer.closest(".jwplayer") || captionContainer.parentElement;
    }

    const video = document.querySelector(this.playerSelector);
    return video?.closest(".jwplayer") || video?.parentElement;
  }

  static getCaptionObserverRoot(container) {
    return container.closest(".jwplayer") || container;
  }

  static guessVideoLang() { return "sv"; }
  static guessSubtitleLang() { return "sv"; }
}
