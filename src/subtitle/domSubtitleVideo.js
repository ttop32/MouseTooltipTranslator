import $ from "jquery";
import BaseVideo from "./baseVideo";
import { translate } from "/src/translator/translateCaller.js";

export default class DOMSubtitleVideo extends BaseVideo {
  static nativeSubtitleSelector = "";
  static errorLabel = "Subtitle Translator";
  static useManualIntercept = true;
  static overlay = null;
  static lastText = "";
  static cache = new Map();

  static async initInjectScript() {}

  static getSubtitleOverlayParent() {
    return document.querySelector("video")?.parentElement;
  }

  static async listenCaptionHover() {
    if (!this.captionContainerSelector) return;
    await this.waitUntil(() => $(this.captionContainerSelector).get(0));
    const container = $(this.captionContainerSelector).get(0);

    this.createOverlay();
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

  static createOverlay() {
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;left:0;right:0;bottom:8%;text-align:center;" +
      "z-index:9999;pointer-events:auto;";

    const videoParent = this.getSubtitleOverlayParent();
    if (videoParent) {
      if (getComputedStyle(videoParent).position === "static") {
        videoParent.style.position = "relative";
      }
      videoParent.appendChild(overlay);
    }
    this.overlay = overlay;

    if (this.nativeSubtitleSelector) {
      const styleEl = document.createElement("style");
      styleEl.textContent =
        `${this.nativeSubtitleSelector}{opacity:0!important;pointer-events:none!important;}`;
      document.head.appendChild(styleEl);
    }

    overlay.addEventListener("mouseenter", () => this.pause());
    overlay.addEventListener("mouseleave", () => this.play());
  }

  static translateInPlace(el, text) {
    const mode = this.setting["detectSubtitle"];
    if (mode === "sourcesinglesub") {
      el.replaceChildren(this.createSubtitleEl(text));
      return;
    }

    const isDual = mode === "dualsub";
    const cached = this.cache.get(text);
    if (cached) {
      this.applyTranslation(el, text, cached, isDual);
      return;
    }

    el.replaceChildren();
    this.fetchAndApply(el, text, isDual);
  }

  static async fetchAndApply(el, text, isDual) {
    const sourceLang = this.setting["translateSource"];
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
    } catch (error) {
      if (this.lastText === text) {
        this.applyTranslation(el, text, text, false);
      }
      console.error(`[${this.errorLabel}]`, error);
    }
  }

  static applyTranslation(el, original, translated, isDual) {
    el.replaceChildren();
    if (isDual) el.appendChild(this.createSubtitleEl(original));
    el.appendChild(this.createSubtitleEl(translated));
  }

  static createSubtitleEl(text) {
    const p = document.createElement("p");
    p.style.cssText =
      `font-size:${Math.round(this.setting["tooltipFontSize"] * 1.5)}px;margin:0.12em 0;text-align:center;display:block;`;
    const span = document.createElement("span");
    span.textContent = text;
    span.style.cssText =
      "color:white;background:rgba(0,0,0,0.75);padding:0.08em 0.4em;" +
      "border-radius:4px;display:inline-block;";
    p.appendChild(span);
    return p;
  }

  static handleUrlChange() {
    this.pausedByExtension = false;
    this.lastText = "";
    if (this.overlay) this.overlay.replaceChildren();
  }

  static getVideoId() { return null; }
  static guessVideoLang() { return null; }
  static guessSubtitleLang() { return null; }
  static async requestSubtitle() { return null; }
  static parseSubtitle(sub) { return sub; }
  static mergeSubtitles(sub1) { return sub1; }
}
