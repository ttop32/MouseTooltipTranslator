import $ from "jquery";
import BaseVideo from "./baseVideo";
import { translate } from "/src/translator/translateCaller.js";

// SVT Play (svtplay.se) subtitle translation.
// Uses DOM observation instead of XHR interception because SVT only
// publishes Swedish subtitles — there is no URL parameter trick to fetch
// them in another language the way YouTube has.
// Approach mirrors the 1.3_0 standalone fork: watch addedNodes, show text
// immediately in overlay, translate in-place.

export default class Svt extends BaseVideo {
  static sitePattern = /^(https:\/\/)(www\.svtplay\.se)/;
  static captionRequestPattern = /NEVER_MATCH_SVTPLAY/;
  static baseUrl = "https://www.svtplay.se";
  static playerSelector = "video";
  static captionContainerSelector = '[data-rt="subtitles-container"]';
  static captionWindowSelector = '[data-rt="subtitles-container"] > *';
  static captionBoxSelector =
    '[data-rt="subtitles-container"] span, [data-rt="subtitles-container"] p';

  static useManualIntercept = true;
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static async initInjectScript(setting) {}

  static async listenCaptionHover() {
    await this.waitUntil(() => $(this.captionContainerSelector).get(0));

    const container = $(this.captionContainerSelector).get(0);

    // Overlay div — same structure as 1.3_0's translatedSubtitles element.
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

    // Hide SVT subtitles visually, keep in DOM so we can observe them.
    const styleEl = document.createElement("style");
    styleEl.textContent =
      '[data-rt="subtitles-container"]{opacity:0!important;pointer-events:none!important;}';
    document.head.appendChild(styleEl);

    $(overlay)
      .on("mouseenter", () => this.pause())
      .on("mouseleave", () => this.play());

    // Exact same observer options as 1.3_0: childList only, no subtree.
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "childList") continue;
        for (const node of m.addedNodes) {
          const text = (node.innerText || node.textContent || "").trim();
          if (!text) continue;
          this.lastText = text;

          // Create el with original text, add to overlay — matches 1.3_0 exactly.
          const el = document.createElement("div");
          el.innerText = text;
          this.overlay.innerHTML = "";
          this.overlay.appendChild(el);

          this.translateInPlace(el, text);
          return;
        }
      }
    });
    observer.observe(container, { childList: true, subtree: false });
  }

  // Synchronous entry point — no async overhead for cached lines.
  static translateInPlace(el, text) {
    const mode = this.setting["detectSubtitle"];

    // sourcesinglesub: show original Swedish only, no translation.
    if (mode === "sourcesinglesub") {
      el.innerHTML = "";
      el.appendChild(this.createSubtitleEl(text));
      return;
    }

    const isDual = mode === "dualsub";
    const cached = this.cache.get(text);

    if (cached) {
      // Same line seen before — update DOM synchronously, zero delay.
      this.applyTranslation(el, text, cached, isDual);
      return;
    }

    // First occurrence: clear el while fetching (mirrors 1.3_0's replaceChildren()).
    el.innerHTML = "";
    this.fetchAndApply(el, text, isDual);
  }

  static async fetchAndApply(el, text, isDual) {
    const sourceLang = this.setting["translateSource"] || "sv";
    const targetLang = this.setting["translateTarget"];
    try {
      const result = await translate(
        { text, sourceLang, targetLang, reverseLang: this.setting["translateReverse"] },
        this.setting
      );
      if (this.lastText !== text) return;
      const translated = result?.targetText || text;
      this.cache.set(text, translated);
      this.applyTranslation(el, text, translated, isDual);
    } catch (e) {
      console.error("[SVT Translator]", e);
    }
  }

  static applyTranslation(el, original, translated, isDual) {
    el.innerHTML = "";
    if (isDual) el.appendChild(this.createSubtitleEl(original));
    el.appendChild(this.createSubtitleEl(translated));
  }

  static createSubtitleEl(text) {
    const p = document.createElement("p");
    p.style.cssText =
      "font-size:24px;margin:0.12em 0;text-align:center;display:block;";
    const span = document.createElement("span");
    span.textContent = text;
    span.style.cssText =
      "color:white;background:rgba(0,0,0,0.75);padding:0.08em 0.4em;" +
      "border-radius:4px;display:inline-block;";
    p.appendChild(span);
    return p;
  }

  static handleUrlChange(url = window.location.href) {
    this.pausedByExtension = false;
    this.lastText = "";
    if (this.overlay) this.overlay.innerHTML = "";
  }

  static getVideoId() { return null; }
  static guessVideoLang() { return "sv"; }
  static guessSubtitleLang() { return "sv"; }
  static async requestSubtitle() { return null; }
  static parseSubtitle(sub) { return sub; }
  static mergeSubtitles(sub1) { return sub1; }
}
