import DOMSubtitleVideo from "./domSubtitleVideo";

export default class Arte extends DOMSubtitleVideo {
  static sitePattern = /^https:\/\/(?:www\.)?arte\.tv(?:\/|$)/i;
  static captionRequestPattern = /NEVER_MATCH_ARTE/;
  static baseUrl = "https://www.arte.tv";
  static playerSelector = "video";
  static captionContainerSelector = ".vjs-text-track-display";
  static nativeSubtitleSelector = ".vjs-text-track-display";
  static captionWindowSelector = ".vjs-text-track-cue";
  static captionBoxSelector = ".vjs-text-track-cue";
  static errorLabel = "ARTE Translator";
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static getSubtitleOverlayParent() {
    const captionContainer = document.querySelector(this.captionContainerSelector);
    if (captionContainer) {
      return captionContainer.closest(".avp-player") || captionContainer.parentElement;
    }

    const video = document.querySelector(this.playerSelector);
    return video?.closest(".avp-player") || video?.parentElement;
  }

  static getCaptionObserverRoot(container) {
    return container.closest(".avp-player") || container;
  }
}
