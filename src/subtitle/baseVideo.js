import { BatchInterceptor } from "@mswjs/interceptors";
import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
import { FetchInterceptor } from "@mswjs/interceptors/fetch";
import { debounce } from "throttle-debounce";
import $ from "jquery";
import memoize from "memoizee";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}
import TextUtil from "/src/util/text_util.js";
import { isSameLanguage, isLangExcluded } from "/src/util/lang.js";

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
  // how long the player may be kept waiting for the translated track
  static dualSubDeadline = 5000;
  // a failed timedtext answer must not be remembered forever (see below).
  // NOTE: read once when the shared memo is built, so a subclass cannot
  // override it - there is a single requestSubtitleCached for all sites.
  static subtitleCacheMaxAge = 5 * 60 * 1000; //5min
  // after a failed caption fetch, stop fetching that track for a while and let
  // the player talk to youtube itself; retrying immediately is what gets us
  // rate limited (CLAUDE.md: timedtext blocks out-of-session requests).
  // A single blip should not cost dual subs for the whole video, so the first
  // failure only parks the track briefly and repeats escalate.
  static subtitleFailCooldownFirst = 8 * 1000;
  static subtitleFailCooldown = 60 * 1000; //1min
  static subtitleFailMapMax = 100;
  static subtitleFailures = {};
  // Intercept BOTH XHR and fetch: recent YouTube requests the timedtext caption
  // over fetch, which an XHR-only interceptor silently missed, so the dual
  // subtitle was never assembled (only the native single line showed). The same
  // "request" + request.respondWith() contract applies to both interceptors.
  static interceptor = new BatchInterceptor({
    name: "mtt-subtitle-interceptor",
    interceptors: [
      new XMLHttpRequestInterceptor(),
      new FetchInterceptor(),
    ],
  });
  static setting = {};
  static useManualIntercept = false;
  static subtitleLangDict = {};

  // Native fetch captured at module load — BEFORE interceptCaption() patches the
  // global fetch. Our own timedtext requests (requestSubtitle) go through this so
  // they bypass our interceptor; otherwise the fetch interceptor would re-catch
  // them and recurse forever.
  static originalFetch =
    typeof fetch !== "undefined" ? fetch.bind(globalThis) : null;
  static rawFetch(...args) {
    return (this.originalFetch || fetch)(...args);
  }

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
    this.listenPlayer();
  }
  static async listenPlayer() {
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

  static async getPreferredSourceLang(videoId){
    if (this.setting["detectSubtitle"] == "targetsinglesub") {
      return this.getTargetLangMeta();
    }
    return await this.guessVideoLang(videoId);
  }
  static async getTargetLangMeta() {
    return this.getSettingTargetLang();    
  }
  static getPreferredTargetLang(){
    return this.getSettingTargetLang()
  }
  static getSettingTargetLang() {
    var lang = this.setting["translateTarget"];
    return this.subtitleLangDict[lang] || lang;
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
    await this.waitUntil(() => $(this.captionContainerSelector).get(0));

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
      if (!this.captionRequestPattern.test(request.url)) {
        return;
      }
      // a recent failure for this track: don't touch the endpoint again, let
      // the player's own request go through
      if (this.isSubtitleFailing(request.url)) {
        return;
      }
      // The player is blocked on this request, so it has to be answered. sub1
      // and response are kept outside the try: when anything about the
      // translated track fails (timedtext rate limiting, a parse error, a merge
      // error) we still hand back the original track instead of leaving the
      // player waiting, which showed up as youtube freezing on subtitle enable.
      var sub1 = null;
      var response = null;
      try {
        //get source lang sub
        response = await this.requestSubtitleCached(request.url);
        var targetLang = this.getPreferredTargetLang();
        var sourceLang = this.guessSubtitleLang(request.url);
        sub1 = this.parseSubtitle(response, sourceLang);
        // A failed timedtext fetch parses into an EMPTY track, which is truthy -
        // answering with it left the video with no subtitles at all, and the
        // memoized failure kept it that way. Drop it and let the player's own
        // request through instead.
        if (this.isSubtitleEmpty(sub1)) {
          this.markSubtitleFailed(request.url);
          return;
        }
        this.noteSubtitleSuccess(request.url);
        var responseSub = sub1;
        //get target lang sub, if not same lang
        // skip the translated second line when the subtitle's source language
        // is excluded, matching the tooltip's exclude behavior (#136)
        if (
          !isSameLanguage(sourceLang, targetLang) &&
          this.setting["detectSubtitle"] == "dualsub" &&
          !isLangExcluded(this.setting["langExcludeList"], sourceLang) &&
          // the translated track is parked after its own failures, so skip the
          // wait and the fetch entirely instead of re-learning it every request
          !this.isSubtitleFailing(request.url, targetLang)
        ) {
          var mergedSub = await this.withDeadline(
            (async () => {
              await this.waitRandom(300, 800); //wait for avoid ban
              var sub2 = await this.requestSubtitleCached(
                request.url,
                targetLang
              );
              sub2 = this.parseSubtitle(sub2, targetLang);
              // an empty translated track would merge into a dual sub that is
              // really just the source line; drop it and keep the memo clean
              if (this.isSubtitleEmpty(sub2)) {
                this.markSubtitleFailed(request.url, targetLang);
                return null;
              }
              this.noteSubtitleSuccess(request.url, targetLang);
              return this.mergeSubtitles(sub1, sub2);
            })(),
            this.dualSubDeadline
          );
          // nothing merged in time -> ship the source track on its own
          if (mergedSub) {
            responseSub = mergedSub;
          }
        }

        request.respondWith(new Response(JSON.stringify(responseSub)));
      } catch (error) {
        console.log(error);
        // a throw before the source track parsed means the source fetch itself
        // is unhappy; park it so the next player retry costs nothing
        if (!sub1) {
          this.markSubtitleFailed(request.url);
        }
        this.respondSourceOnly(request, sub1);
      }
    });
  }
  // Answer with the untranslated track we already parsed. Responding with
  // something is what keeps the player from hanging on its own request.
  static respondSourceOnly(request, sub1) {
    if (!sub1) {
      return; // nothing parsed yet: let the original request hit the network
    }
    try {
      request.respondWith(new Response(JSON.stringify(sub1)));
    } catch (error) {
      console.log(error);
    }
  }

  // Cap how long the player is kept waiting for the translated track. Resolves
  // to null when the budget runs out; the pending work is abandoned rather than
  // cancelled, so a late answer still warms requestSubtitleCached.
  static async withDeadline(promise, ms) {
    var timer;
    try {
      return await Promise.race([
        promise,
        new Promise((resolve) => {
          timer = setTimeout(() => resolve(null), ms);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  static killIntercept() {
    this.interceptor.dispose();
    this.interceptorLoaded = false;
  }
  static killInterceptDebounce = debounce(
    this.interceptKillTime,
    this.killIntercept
  );

  // promise:true keeps rejections out of the cache, maxAge keeps a bad answer
  // from sticking for the whole page session (timedtext rate limits come and go)
  static requestSubtitleCached = memoize(
    async function (subUrl, lang, tlang, videoId) {
      return await this.requestSubtitle(...arguments);
    },
    { promise: true, maxAge: BaseVideo.subtitleCacheMaxAge }
  );

  // a resolved-but-useless answer (undefined / empty track) still gets cached by
  // memoizee, so evict it explicitly
  static forgetSubtitle(...args) {
    try {
      this.requestSubtitleCached.delete(...args);
    } catch (error) {
      console.log(error);
    }
  }

  // overridden per site: what "we got no usable subtitle" means
  static isSubtitleEmpty(sub) {
    return !sub;
  }

  // one entry per (track url, translated lang) so a broken translation never
  // parks the source track, and vice versa
  static getFailKey(subUrl, lang) {
    return subUrl + "|" + (lang || "");
  }
  static markSubtitleFailed(subUrl, lang) {
    var key = this.getFailKey(subUrl, lang);
    var previous = this.subtitleFailures[key];
    // youtube never reloads the document, so evict the oldest entry instead of
    // growing the map for a whole autoplay session (and never wipe the map:
    // that would un-park every track at once)
    if (
      !previous &&
      Object.keys(this.subtitleFailures).length >= this.subtitleFailMapMax
    ) {
      var oldestKey = Object.keys(this.subtitleFailures).reduce((a, k) =>
        this.subtitleFailures[k].at < this.subtitleFailures[a].at ? k : a
      );
      delete this.subtitleFailures[oldestKey];
    }
    this.subtitleFailures[key] = {
      at: Date.now(),
      // the count has to survive the cooldown expiring, otherwise every repeat
      // failure looks like a first one and the escalation never happens
      count: (previous?.count || 0) + 1,
    };
    this.forgetSubtitle(subUrl, lang);
  }
  // a track that answers again is not a failing track any more
  static noteSubtitleSuccess(subUrl, lang) {
    delete this.subtitleFailures[this.getFailKey(subUrl, lang)];
  }
  static isSubtitleFailing(subUrl, lang) {
    var failure = this.subtitleFailures[this.getFailKey(subUrl, lang)];
    if (!failure) {
      return false;
    }
    var cooldown =
      failure.count > 1
        ? this.subtitleFailCooldown
        : this.subtitleFailCooldownFirst;
    // past the cooldown we let it through again but keep the count, so the next
    // failure parks it for longer
    return Date.now() - failure.at < cooldown;
  }

  //util =======================
  static async waitPlayer() {
    await this.waitUntil(() => this.getPlayer());
  }
  static async waitPlayerReady() {
    await this.waitUntil(() => this.checkPlayerReady());
  }
  static async wait(time) {
    await new Promise((resolve) => setTimeout(resolve, time));
  }
  static async waitRandom(min, max) {
    const time = Math.random() * (max - min) + min;
    await this.wait(time);
  }


  // the timeout argument used to be dropped (always WAIT_FOREVER), so callers
  // that meant "give up after N ms" hung forever - netflix restored its original
  // text track only after this resolved, leaving the player on the wrong track
  static async waitUntil(fn, time) {
    await waitUntil(fn, {
      timeout: time || WAIT_FOREVER,
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
    return TextUtil.concatJson(pathJson, paramsJson);
  }
  static filterSpecialText(word) {
    return word.replace(/[^a-zA-Z ]/g, "");
  }

  // Pick the target-track line to stack under a given source-track line. The
  // source (original) and target (translation) tracks are fetched and segmented
  // independently — different line counts and boundaries — so they can't be
  // zipped 1:1; each source line needs the translation spoken during it.
  //
  // Rank candidates by real time overlap `min(ends) - max(starts)` and take the
  // largest. `bestOverlap` starts at -Infinity so that when NOTHING truly
  // overlaps we still return the closest line (a negative overlap is just the
  // gap, so least-negative = nearest) instead of dropping the translation. So a
  // source line still always gets a translation (as the original merge did) —
  // only the ranking changed. Returns null only when there are no candidates.
  // Callers pass start/end accessors, so this serves both YouTube json3 events
  // (tStartMs / dDurationMs) and Netflix TTML lines (start / end).
  //
  // History — both mergers previously scored candidates with
  //   score = Math.max(srcEnd - tgtStart, tgtEnd - srcStart)   sorted ascending.
  // By the identity max(e1-s2, e2-s1) = (dur1+dur2)/2 + |mid1-mid2|, that ranked
  // by MIDPOINT DISTANCE (a nearest-center match, biased toward shorter target
  // lines), not by overlap — its `>0` gate was always true, so it too always
  // attached something. The real defect was the ranking: when one long target
  // line spanned several short source lines its center sat far away, so a
  // shorter, less-relevant line won and the dual subtitle looked misaligned.
  // Overlap-max fixes the ranking while keeping the always-attach behaviour.
  static findMostOverlappingLine(start, end, candidates, getStart, getEnd) {
    var best = null;
    var bestOverlap = -Infinity;
    for (var line of candidates || []) {
      var overlap =
        Math.min(end, getEnd(line)) - Math.max(start, getStart(line));
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        best = line;
      }
    }
    return best;
  }

  //inject script for handle local function===============================

  static async initInjectScript(setting) {
    if (this.checkIsInjectedScript()) {
      return;
    }
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
