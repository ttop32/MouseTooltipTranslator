import $ from "jquery";
import memoize from "memoizee";
import { waitUntil } from "async-wait-until";
import BaseVideo from "./baseVideo";
import * as util from "/src/util";
import { isRtl } from "/src/util/lang.js";

// https://terrillthompson.com/648
// https://developers.google.com/youtube/iframe_api_reference
// intercept youtube subtitle and concat dual sub
// flow
// 1. listen url change
// 2. get video lang from url   from inject script
// 3. turn on caption with given video lang  from inject script
// 4. intercept caption request  from inject script
// 5. modify request output as dual subtitle  from inject script
// other feature
// caption on off detect
// caption hover detect

export default class Youtube extends BaseVideo {
  static sitePattern = /^(https:\/\/)(www\.youtube\.com)/;
  static captionRequestPattern =
    /^(https:\/\/)(www\.youtube\.com)(\/api\/timedtext)/;
  static baseUrl = "https://www.youtube.com";
  static playerSelector = "#movie_player video";
  static playerApiSelector = ".html5-video-player";
  static captionContainerSelector =
    "#movie_player .ytp-caption-window-container";
  static captionWindowSelector = "#movie_player .caption-window";
  static captionBoxSelector = "#movie_player .ytp-caption-segment";
  static listenButtonSelector = ".ytp-subtitles-button";

  static isSubtitleRequestFailed = false;
  static useManualIntercept = true; //interceptor start manually

  // auto start message listener for inject script
  static #injectScriptConstructor = (() => {
    this.listenMessageFrameFromInject();
  })();

  static async handleUrlChange(url = window.location.href) {
    this.pausedByExtension = false;
    this.callMethodFromInject("activateCaption", url);
  }

  static async activateCaption(url) {
    // async function activateCaption(url = window.location.href) {
    // skip if user caption off, is shorts skip
    if (
      this.setting["subtitleButtonToggle"] == "false" ||
      !this.isVideoUrl(url)
    ) {
      return;
    }
    //get video lang
    var { lang, tlang } = await this.guessVideoLang(url);
    //turn on caption
    await this.waitPlayerReady(); //wait player load
    this.killInterceptDebounce(); // end caption intercept
    await this.interceptCaption(); // start caption intercept
    this.loadCaption(); // turn on caption for embed video
    this.setPlayerCaption(lang, tlang); //turn on caption on specified lang
    // wait organically until the caption system is actually loaded, instead of
    // a fixed delay: instant on fast loads, patient on slow ones (the old fixed
    // 4-5s wait was for slow player loads).
    await this.waitCaptionReady();
    this.reloadCaption(); //reset previous caption immediately
  }

  // resolve once the player's caption tracklist is populated (caption system
  // ready). Returns as soon as it's ready, so a generous timeout costs nothing
  // on normal loads and only caps genuinely stuck cases (no caption data / API
  // change): 15s gives slow player loads plenty of room before we reload anyway.
  static async waitCaptionReady() {
    try {
      await waitUntil(
        () => {
          try {
            var api = this.getPlayerApi().get(0);
            return !!(
              api?.getOption &&
              (api.getOption("captions", "tracklist") || []).length
            );
          } catch (e) {
            return false;
          }
        },
        { timeout: 15000, intervalBetweenAttempts: 150 }
      );
    } catch (e) {
      // tracklist never appeared within the timeout — reload anyway
    }
  }

  // player control advance================================
  static getPlayerApi() {
    return $(this.playerApiSelector);
  }
  static reloadCaption() {
    this.getPlayerApi().each((index, ele) => {
      ele.setOption("captions", "reload", true);
    });
  }
  static loadCaption() {
    this.getPlayerApi().each((index, ele) => {
      ele.loadModule("captions");
    });
  }
  static unloadCaption() {
    this.getPlayerApi().each((index, ele) => {
      ele.unloadModule("captions");
    });
  }
  static setPlayerCaption(lang, translationLanguage) {
    this.getPlayerApi().each((index, ele) => {
      ele.setOption("captions", "track", {
        languageCode: lang,
        translationLanguage,
      });
    });
  }

  // additional listen==============================
  static async handleButtonKey(e) {
    this.handleCaptionOnOff(e);
  }
  static async handleCaptionOnOff(e) {
    if (e?.code == "KeyC" || e?.button == 0) {
      this.setting["subtitleButtonToggle"] = $(this.listenButtonSelector).attr(
        "aria-pressed"
      );
      this.setting.save();
    }
  }

  //requestSubtitle=============================
  static async requestSubtitle(subUrl, lang, tlang, videoId) {
    if (lang) {
      subUrl = await this.getTranslatedSubtitleUrl(subUrl, lang);
    }
    var json;
    try {
      // rawFetch = native fetch (bypasses our interceptor) so this timedtext
      // request isn't re-intercepted into infinite recursion now that fetch is
      // intercepted alongside XHR.
      var res = await this.rawFetch(this.getTrafficSafeUrl(subUrl));
      json = await res.json();
    } catch (error) {
      console.log(error);
    }

    try {
      // if fail, change base url and try again
      if (!json) {
        this.isSubtitleRequestFailed = !this.isSubtitleRequestFailed;
        const res = await this.rawFetch(this.getTrafficSafeUrl(subUrl));
        json = await res.json();
      }
    } catch (error) {
      console.error("Failed to fetch subtitle:", error);
    }
    return json;
  }
  static getTrafficSafeUrl(url) {
    if (this.isSubtitleRequestFailed) {
      const urlObj = new URL(url);
      urlObj.hostname = "video.google.com";
      urlObj.pathname = "/timedtext";
      return urlObj.toString();
    }
    return url;
  }

  static async getTranslatedSubtitleUrl(subUrl, lang) {
    // get user generated sub url if exist
    var v = this.getVideoId(subUrl);
    var url = await this.getUserGeneratedSubUrl(v, lang);
    // get auto translated sub url
    if (!url) {
      var url = new URL(subUrl);
      url.searchParams.set("tlang", lang);
    }
    return url.toString();
  }

  static async getUserGeneratedSubUrl(v, lang) {
    var metaData = await this.getYoutubeMetaDataCached(v);
    var captionList =
      metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    //get one that is selected language sub, not auto generated.
    // guard the filter: when the metadata shape lacks captionTracks a bare
    // .filter() throws and silently kills the whole dual-sub assembly; instead
    // fall through (return "") so the caller uses the tlang auto-translated url.
    var langUrl = captionList?.filter(
      (caption) => !caption?.kind && caption.languageCode == lang
    )?.[0]?.baseUrl;
    return langUrl ? langUrl + "&fmt=json3" : "";
  }

  // merge a rolling caption chunk into the accumulated line, removing the
  // overlap so ASR "rolling" captions don't duplicate. Word-level (split on
  // space) so it never merges mid-word. (#90)
  static mergeCaptionText(acc, next) {
    if (!next) return acc;
    if (!acc) return next;
    if (acc.endsWith(next)) return acc; // exact duplicate tail
    if (next.startsWith(acc)) return next; // cumulative — new supersedes old
    var words = next.split(" ");
    for (var i = words.length; i > 0; i--) {
      var head = words.slice(0, i).join(" ");
      if (acc.endsWith(head)) {
        var rest = words.slice(i).join(" ");
        return rest ? `${acc} ${rest}` : acc;
      }
    }
    return `${acc} ${next}`;
  }

  // strip inline caption markup (tags) to plain text; <br> -> space so a line
  // break can't glue words. Whitespace collapsed but NOT trimmed (callers trim
  // where needed) so join spaces between colored runs survive.
  static cleanSubText(s) {
    return String(s)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?[a-zA-Z][^>]*>/g, "")
      .replace(/\s+/g, " ");
  }

  // return (or add) the pen index for an RGB color. pen 0 stays the default.
  static getPenId(pens, rgb) {
    for (var i = 1; i < pens.length; i++) {
      if (pens[i].fcColor === rgb) return i;
    }
    pens.push({ fcColor: rgb });
    return pens.length - 1;
  }

  // Convert inline <font color="#RRGGBB(AA)">...</font> runs into json3 segs
  // that reference a colored pen, so YouTube renders the color instead of us
  // leaking the tag as text (old bug) or stripping the color away. Any other
  // tags are removed. Falls back gracefully: a non-font caption becomes a
  // single plain seg; an unknown pen color just renders uncolored.
  static buildColoredSegs(raw, pens) {
    var parts = [];
    var lastIndex = 0;
    var m;
    var re =
      /<font\b[^>]*?\bcolor\s*=\s*["']?#?([0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?["']?[^>]*>([\s\S]*?)<\/font>/gi;
    while ((m = re.exec(raw)) !== null) {
      parts.push({ t: this.cleanSubText(raw.slice(lastIndex, m.index)), pen: 0 });
      parts.push({ t: this.cleanSubText(m[2]), pen: this.getPenId(pens, parseInt(m[1], 16)) });
      lastIndex = re.lastIndex;
    }
    parts.push({ t: this.cleanSubText(raw.slice(lastIndex)), pen: 0 });
    parts = parts.filter((p) => p.t.length);
    if (parts.length === 0) return [{ utf8: "" }];
    // trim only the outer edges so inter-run join spaces are kept
    parts[0].t = parts[0].t.replace(/^\s+/, "");
    parts[parts.length - 1].t = parts[parts.length - 1].t.replace(/\s+$/, "");
    parts = parts.filter((p) => p.t.length);
    if (parts.length === 0) return [{ utf8: "" }];
    return parts.map((p) => (p.pen ? { utf8: p.t, pPenId: p.pen } : { utf8: p.t }));
  }

  // concat sub=====================================
  static parseSubtitle(subtitle, lang) {
    if (!subtitle?.events) {
      return {events: [], pens: [{}], wireMagic: "pb3", wpWinPositions: [{}], wsWinStyles: [{}]};
    }
    // RTL languages (Arabic, Hebrew, ...) need right justification + RTL base
    // direction so word order, embedded LTR runs (e.g. "LLM") and numbers render
    // correctly. wsWinStyleId 2 carries juJustifCode:1 (rtl). (#206)
    var rtl = isRtl(lang);
    var newEvents = [];
    var pens = [{}]; // pen 0 = default; <font color> runs add entries (below)
    for (var event of subtitle.events) {
      if (!event.segs || !event.dDurationMs) {
        continue;
      }
      var oneLineSub = event.segs
        .reduce((acc, cur) => (acc += cur.utf8), "")
      // plain text (tags stripped) for the dedup / merge / "\n" checks below
      var oneLineSubTrim = this.cleanSubText(oneLineSub).trim();

      // if prev sub time overlapped current sub, concat
      if (
        newEvents.length == 0 ||
        oneLineSub=="\n" ||
        // 5000 < newEvents[newEvents.length - 1].dDurationMs ||
        newEvents[newEvents.length - 1].tStartMs +
          newEvents[newEvents.length - 1].dDurationMs <=
          event.tStartMs
      ) {
        newEvents.push({
          tStartMs: event.tStartMs,
          dDurationMs: event.dDurationMs,
          // only override style for RTL; LTR keeps the previous default so its
          // rendering is byte-for-byte unchanged.
          ...(rtl ? { wsWinStyleId: 2 } : {}),
          // preserve inline <font color> styling as json3 pens so the color
          // renders, instead of leaking the tag as text or stripping the color.
          segs: this.buildColoredSegs(oneLineSub, pens),
        });

        // if prev sub time overlapped current sub(\n case), cut the prev sub
        if (newEvents.length > 2 &&
          newEvents[newEvents.length - 2].tStartMs +
          newEvents[newEvents.length - 2].dDurationMs >
          event.tStartMs
        ) {
          newEvents[newEvents.length - 2].dDurationMs =
            event.tStartMs - newEvents[newEvents.length - 2].tStartMs-1;
        }
      } else {
        // overlapping events get merged into the previous line. Auto-generated
        // (ASR) captions roll the same line repeatedly, so a plain append
        // produced duplicated subtitles like "AA BB"; dedupe the overlap. (#90)
        // rolling ASR lines get merged; collapse the previous (possibly
        // multi-seg colored) line to one plain seg, then dedupe the overlap.
        var prevEv = newEvents[newEvents.length - 1];
        prevEv.segs = [
          {
            utf8: this.mergeCaptionText(
              prevEv.segs.map((s) => s.utf8).join(""),
              oneLineSubTrim
            ),
          },
        ];

        // increase duration upto current sub
        newEvents[newEvents.length - 1].dDurationMs =
          event.tStartMs - newEvents[newEvents.length - 1].tStartMs +
          event.dDurationMs;
      }
    }

    return {
      events: newEvents,
      pens: pens,
      wireMagic: "pb3",
      wpWinPositions: [
        {},
        {
          apPoint: 6,
          ahHorPos: 20,
          avVerPos: 100,
          rcRows: 2,
          ccCols: 40,
        },
      ],
      wsWinStyles: [
        {},
        {
          mhModeHint: 2,
          juJustifCode: 0, //ltr
          sdScrollDir: 3,
        },
        {
          mhModeHint: 2,
          juJustifCode: 1, //rtl
          sdScrollDir: 3,
        },
      ],
    };
  }

  static mergeSubtitles(sub1, sub2) {
    // Stack the translated line under each source line, paired by time overlap
    // via the shared BaseVideo.findMostOverlappingLine (see it for why overlap,
    // not the old midpoint-distance metric). Push a FRESH seg each time — never
    // mutate/share sub2's seg object: prepending "\n" in place and pushing the
    // same reference made the translation accumulate blank lines and duplicate
    // across events, which showed up as bunched-up dual subtitles.
    for (let event of sub1.events) {
      var best = this.findMostOverlappingLine(
        event.tStartMs,
        event.tStartMs + event.dDurationMs,
        sub2.events,
        (l) => l.tStartMs,
        (l) => l.tStartMs + l.dDurationMs
      );
      if (best) {
        // join all of the target's segs (it may be multi-seg when colored) and
        // append as a plain line under the source (which keeps its colored segs).
        var targetText = best.segs.map((s) => s.utf8).join("");
        event.segs.push({ utf8: "\n" + targetText });
      }
    }
    return sub1;
  }
  // metadata getter ===============================
  static isVideoUrl(url) {
    return this.isShorts(url) || this.isEmbed(url) || this.isMainVideoUrl(url);
  }
  static isMainVideoUrl(url) {
    return url.includes(`${this.baseUrl}/watch`);
  }
  static isShorts(url) {
    return url.includes(`${this.baseUrl}/shorts`);
  }
  static isEmbed(url) {
    return url.includes(`${this.baseUrl}/embed`);
  }
  static getVideoId(url) {
    return this.getUrlParam(url)?.["v"] || this.getUrlParam(url)?.[2]; //2 for shorts and embed
  }
  static guessSubtitleLang(url, subtitle) {
    return this.getUrlParam(url)?.["lang"];
  }

  static async guessVideoLang(url) {
    var tlang;
    var v = this.getVideoId(url);
    var metaData = await this.getYoutubeMetaDataCached(v);
    var captionMeta =
      metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    // get auto generated lang
    var captionAsr = captionMeta?.filter((sub) => sub.kind);
    var lang = captionAsr?.[0]?.languageCode;
    // get target lang if targetsinglesub setting
    if (this.setting["detectSubtitle"] == "targetsinglesub") {
      var caption = captionMeta?.filter(
        (sub) => sub.languageCode == this.setting["translateTarget"]
      );
      lang = caption?.[0]?.languageCode || lang;
      tlang =
        lang != this.setting["translateTarget"]
          ? { languageCode: this.setting["translateTarget"] }
          : "";
    }
    return {
      lang: lang || "en",
      tlang,
    };
  }

  static getYoutubeMetaDataCached = memoize(this.getYoutubeMetaData);

  static async getYoutubeMetaData(videoId) {
    // use global variable
    if (window?.ytInitialPlayerResponse?.videoDetails?.videoId == videoId) {
      return window.ytInitialPlayerResponse;
    }
    var metadata = await this.getYoutubeMetaDataFromAPI(videoId);
    if (metadata?.captions) {
      return metadata;
    }
    var metadata = await this.getYoutubeMetaDataFromWatch(videoId);
    return metadata;
  }

  static async getYoutubeMetaDataFromWatch(videoId) {
    try {
      var res = await fetch(`${this.baseUrl}/watch?v=${videoId}`);
      var resText = await res.text();
      var matches = resText.match(
        /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+meta|<\/script|\n)/
      );
      var json = JSON.parse(matches[1]);
      return json;
    } catch (error) {
      return {};
    }
  }

  static async getYoutubeMetaDataFromAPI(videoId) {
    // https://github.com/timelens/timelens-youtube/issues/2
    try {
      let fetch_data = await fetch(
        `${this.baseUrl}/youtubei/v1/player?key=${window.yt.config_.INNERTUBE_API_KEY}`,
        {
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            videoId: videoId,
            context: {
              client: {
                clientName: window.yt.config_.INNERTUBE_CLIENT_NAME,
                clientVersion: window.yt.config_.INNERTUBE_CLIENT_VERSION,
              },
            },
          }),
          method: "POST",
        }
      );
      var json = await fetch_data.json();
      return json;
    } catch (error) {
      return {};
    }
  }
}
