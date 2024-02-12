import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
import { debounce } from "throttle-debounce";
import $ from "jquery";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
import * as memoizee from "memoizee";

var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}

export default class BaseVideo {
  static sitePattern = /^(https:\/\/)(example\.com)/;
  static captionRequestPattern = /^(https:\/\/)(example\.com)/;
  static baseUrl = "https://example.com";
  static playerSelector = "video";
  static captionContainerSelector = "";
  static captionWindowSelector = "";
  static captionBoxSelector = "";
  static listenButtonSelector = "";

  static isPaused = false;
  static pausedByExtension = false;
  static isEventListenerLoaded = false;
  static interceptorLoaded = false;
  static scriptUrl = "subtitle.js";
  static interceptKillTime = 1 * 60 * 1000; //1min
  static interceptor = new XMLHttpRequestInterceptor();
  static setting = {};
  static useManualIntercept = false;

  static async handleVideo(setting) {
    if (!this.isVideoSite() || setting["detectSubtitle"] == "null") {
      return;
    }
    this.initVariable(setting);
    await this.initInjectScript(setting);
    await this.loadEventListener();
    this.handleUrlChange();
  }
  static initVariable(setting) {
    this.setting = setting;
  }
  static async loadEventListener() {
    if (this.isEventListenerLoaded) {
      return;
    }
    this.isEventListenerLoaded = true;
    this.listenUrl();
    await this.waitPlayer();
    this.listenPlay();
    this.listenPause();
    this.listenCaptionHover();
    this.listenButton();
    this.listenKey();
  }
  static isVideoSite(url = window.location.href) {
    return this.sitePattern.test(url);
  }
  static getVideoId(url = window.location.href) {
    throw new Error("Not implemented");
  }
  static guessVideoLang(videoId) {
    throw new Error("Not implemented");
  }
  static guessSubtitleLang(url, subtitle) {
    throw new Error("Not implemented");
  }
  static requestSubtitle(subUrl, lang, tlang, videoId) {
    throw new Error("Not implemented");
  }
  static parseSubtitle(sub, lang) {
    throw new Error("Not implemented");
  }
  static mergeSubtitles(sub1, sub2) {
    throw new Error("Not implemented");
  }

  // player control by extension================================
  static play() {
    //play only when paused by extension
    if (this.pausedByExtension == false) {
      return;
    }
    this.pausedByExtension = false;
    this.playPlayer();
  }
  static pause() {
    //if already paused skip
    if (
      this.isPaused == true ||
      this.setting["mouseoverPauseSubtitle"] == "false"
    ) {
      return;
    }
    this.pausedByExtension = true;
    this.pausePlayer();
  }
  static handleUrlChange(url = window.location.href) {
    this.pausedByExtension = false;
  }

  // player control================================
  // html5 video control
  static getPlayer() {
    return $(this.playerSelector)?.get(0);
  }
  static playPlayer() {
    this.getPlayer()?.play();
  }
  static pausePlayer() {
    this.getPlayer()?.pause();
  }
  static checkPlayerReady() {
    return this.getPlayer()?.readyState >= 3;
  }

  // listen=========================================
  static async listenCaptionHover() {
    if (!this.captionContainerSelector) {
      return;
    }
    await this.waitUntilForever(() => $(this.captionContainerSelector).get(0));

    //inject action for hover play stop
    const observer = new MutationObserver((mutations) => {
      // make subtitle selectable
      $(this.captionBoxSelector)
        .off()
        .on("contextmenu", (e) => {
          e.stopPropagation();
        })
        .on("mousedown", (e) => {
          e.stopPropagation();
        });

      // add auto pause when mouseover
      $(this.captionWindowSelector)
        .off()
        .on("mouseenter", (e) => {
          this.pause();
        })
        .on("mouseleave", (e) => {
          this.play();
        })
        .attr("draggable", "false");
    });

    //check subtitle change
    observer.observe($(this.captionContainerSelector).get(0), {
      subtree: true,
      childList: true,
    });
  }

  static listenUrl() {
    navigation.addEventListener("navigate", (e) => {
      this.handleUrlChange(e.destination.url);
    });
  }
  static listenPlay() {
    this.getPlayer()?.addEventListener("play", (e) => {
      this.isPaused = false;
    });
  }
  static listenPause() {
    this.getPlayer()?.addEventListener("pause", (e) => {
      this.isPaused = true;
    });
  }

  static listenButton() {
    $(this.listenButtonSelector).on("click", (e) => {
      this.handleButtonKey(e);
    });
  }
  static listenKey() {
    $(document).on("keydown", (e) => {
      this.handleButtonKey(e);
    });
  }
  static handleButtonKey(e) {}

  //handle dual caption =============================
  static async interceptCaption() {
    if (this.interceptorLoaded) {
      return;
    }
    this.interceptorLoaded = true;
    this.interceptor.apply();
    this.interceptor.on("request", async ({ request, requestId }) => {
      try {
        if (this.captionRequestPattern.test(request.url)) {
          //get source lang sub
          var response = await this.requestSubtitleCached(request.url);
          var targetLang = this.setting["translateTarget"];
          var sourceLang = this.guessSubtitleLang(request.url);
          var sub1 = this.parseSubtitle(response, sourceLang);
          var responseSub = sub1;
          //get target lang sub, if not same lang
          if (
            sourceLang != targetLang &&
            this.setting["detectSubtitle"] == "dualsub"
          ) {
            var sub2 = await this.requestSubtitleCached(
              request.url,
              targetLang
            );
            var sub2 = this.parseSubtitle(sub2, targetLang);
            var mergedSub = this.mergeSubtitles(sub1, sub2);
            responseSub = mergedSub;
          }

          request.respondWith(
            new Response(JSON.stringify(responseSub), response)
          );
        }
      } catch (error) {
        console.log(error);
      }
    });
  }
  static killIntercept() {
    this.interceptor.dispose();
    this.interceptorLoaded = false;
  }
  static killInterceptDebounce = debounce(
    this.interceptKillTime,
    this.killIntercept
  );

  static requestSubtitleCached = memoizee(async function (
    subUrl,
    lang,
    tlang,
    videoId
  ) {
    return await this.requestSubtitle(subUrl, lang, tlang, videoId);
  });

  //util =======================
  static async waitPlayer() {
    await this.waitUntilForever(() => this.getPlayer());
  }
  static async waitPlayerReady() {
    await this.waitUntilForever(() => this.checkPlayerReady());
  }

  static async waitUntilForever(fn) {
    await waitUntil(fn, {
      timeout: WAIT_FOREVER,
    });
  }
  static getUrlParam(url) {
    //get paths
    var pathJson = {};
    var paths = new URL(url).pathname.split("/");
    for (var [index, value] of paths.entries()) {
      pathJson[index] = value;
    }
    //get params
    let params = new URL(url).searchParams;
    var paramsJson = Object.fromEntries(params);
    return this.concatJson(pathJson, paramsJson);
  }
  static concatJson(x, y) {
    return Object.assign(x, y);
  }
  static filterSpecialText(word) {
    return word.replace(/[^a-zA-Z ]/g, "");
  }

  //inject script for handle local function===============================

  static async initInjectScript(setting) {
    await this.injectScript();
    this.resetInjectScript(setting);
  }

  static async resetInject(data) {
    this.initVariable(data);
    if (!this.useManualIntercept) {
      this.interceptCaption();
    }
  }
  static checkIsInjectedScript() {
    return browser?.runtime?.id == null;
  }

  static injectScript(scriptUrl = this.scriptUrl) {
    return new Promise((resolve) => {
      var url = browser.runtime.getURL(scriptUrl);
      var id = this.filterSpecialText(url);
      if (!scriptUrl || $(`#${id}`)?.get(0)) {
        resolve();
        return;
      }

      $("<script>", { id })
        .on("load", () => resolve())
        .appendTo("head")
        .attr("src", url);
    });
  }
  //message between inject script==========================================
  static listenMessageFrameFromInject() {
    if (!this.isVideoSite() || !this.checkIsInjectedScript()) {
      return;
    }
    window.addEventListener("message", ({ data }) => {
      if (data?.type == "resetInjectScript") {
        this?.resetInject(data?.setting);
      } else if (data?.type == "callMethod") {
        this?.[data?.name]?.(...data?.args);
      }
    });
  }
  // handle local function by injecting and call

  static callMethodFromInject(name, ...args) {
    this.sendMessageFrame({ type: "callMethod", name, args });
  }
  static resetInjectScript(setting) {
    this.sendMessageFrame({ type: "resetInjectScript", setting });
  }
  static sendMessageFrame(message) {
    window.postMessage(message, "*");
  }
}
