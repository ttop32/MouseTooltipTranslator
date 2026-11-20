import DOMSubtitleVideo from "./domSubtitleVideo";

export default class YleAreena extends DOMSubtitleVideo {
  static sitePattern = /^https:\/\/(?:areena|arenan)\.yle\.fi(?:\/|$)/i;
  static captionRequestPattern = /NEVER_MATCH_YLE_AREENA/;
  static baseUrl = "https://areena.yle.fi";
  static playerSelector = "video";
  static captionContainerSelector = '[data-testid="subtitles-wrapper"]';
  static nativeSubtitleSelector = '[data-testid="subtitles-wrapper"]';
  static captionWindowSelector = '[data-testid="subtitle-row"]';
  static captionBoxSelector = '[data-testid="subtitle-row"]';
  static errorLabel = "Yle Areena Translator";
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static getSubtitleOverlayParent() {
    const video = document.querySelector(this.playerSelector);
    return (
      video?.closest('[class*="YlePlayer__VideoContainer"]') ||
      video?.parentElement
    );
  }

  static getCaptionObserverRoot(container) {
    return (
      container.closest('[class*="YlePlayer__VideoContainer"]') ||
      container
    );
  }
}
