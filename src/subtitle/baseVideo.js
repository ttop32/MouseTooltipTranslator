export default class BaseVideo {
  static init() {
    listenPlayer();
    listenUrl();
    listenCaptionOnOff();
    listenCaptionHover();
  }
  static getPlayer() {
    throw new Error("Not implemented");
  }
  static getVideoId(url = window.location.href) {
    throw new Error("Not implemented");
  }
  static play() {
    throw new Error("Not implemented");
  }
  static pause() {
    throw new Error("Not implemented");
  }
  static captionOn() {
    throw new Error("Not implemented");
  }
  static captionOff() {
    throw new Error("Not implemented");
  }
  static captionReload() {
    throw new Error("Not implemented");
  }
  static downloadSubtitle(videoId, lang, tlang) {
    throw new Error("Not implemented");
  }
  static mergeCaption(sub1, sub2) {
    throw new Error("Not implemented");
  }
  static interceptCaption() {
    throw new Error("Not implemented");
  }
  static listenPlayer() {
    throw new Error("Not implemented");
  }
  static listenUrl() {
    throw new Error("Not implemented");
  }
  static listenCaptionOnOff() {
    throw new Error("Not implemented");
  }
  static listenCaptionHover() {
    throw new Error("Not implemented");
  }
}
