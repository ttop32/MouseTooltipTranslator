import BaseVideo from "./baseVideo";

// https://github.com/mikesteele/dual-captions/blob/b0ab92e4670100a27b76b2796995ad1be89f1672/site_integrations/netflix/index.js
// https://stackoverflow.com/questions/42105028/netflix-video-player-in-chrome-how-to-seek

export default class Netflix extends BaseVideo {
  static sitePattern = /^(https:\/\/)(www\.netflix\.com)/;
  static captionRequestPattern = /^(https:\/\/).*(nflxvideo\.net)/;
  static baseUrl = "https://www.netflix.com";

  static playerSelector = "";
  static playerApiSelector = "";
  static captionContainerSelector = "";
  static captionWindowSelector = "";
  static captionBoxSelector = "";
}
