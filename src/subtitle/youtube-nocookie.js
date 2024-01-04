import Youtube from "./youtube";

export default class YoutubeNoCookie extends Youtube {
  static sitePattern = /^(https:\/\/)(www\.youtube\-nocookie\.com)/;
  static captionRequestPattern =
    /^(https:\/\/)(www\.youtube\-nocookie\.com)(\/api\/timedtext)/;
  static baseUrl = "https://www.youtube-nocookie.com";

  static #injectScriptConstructor = (() => {
    this.listenMessageFrameFromInject();
  })();
}
