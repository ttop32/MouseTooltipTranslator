import SVT from "./svt";
import $ from "jquery";

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

  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static async listenCaptionHover() {
    await this.waitUntil(() => $(this.captionContainerSelector).get(0));

    const container = $(this.captionContainerSelector).get(0);
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;left:0;right:0;bottom:8%;text-align:center;" +
      "z-index:9999;pointer-events:auto;";

    const videoParent = document.querySelector("video")?.parentElement;
    if (videoParent) {
      if (getComputedStyle(videoParent).position === "static") {
        videoParent.style.position = "relative";
      }
      videoParent.appendChild(overlay);
    }
    this.overlay = overlay;

    const styleEl = document.createElement("style");
    styleEl.textContent =
      '#html-subtitles{opacity:0!important;pointer-events:none!important;}';
    document.head.appendChild(styleEl);

    $(overlay)
      .on("mouseenter", () => this.pause())
      .on("mouseleave", () => this.play());

    const updateCaption = () => {
      const text = (container.innerText || container.textContent || "").trim();
      if (text === this.lastText) return;
      this.lastText = text;
      if (!text) {
        this.overlay.replaceChildren();
        return;
      }

      const el = document.createElement("div");
      el.innerText = text;
      this.overlay.replaceChildren(el);
      this.translateInPlace(el, text);
    };
    const observer = new MutationObserver(updateCaption);
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    updateCaption();
  }

  static guessVideoLang() {
    return "sv";
  }

  static guessSubtitleLang() {
    return "sv";
  }
}
