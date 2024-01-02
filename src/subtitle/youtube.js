import BaseVideo from "./baseVideo";

import $ from "jquery";
import * as memoizee from "memoizee";

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

  //
  static async handleUrlChange(url = window.location.href) {
    this.pausedByExtension = false;
    this.callMethodFromInject("activateCaption", url);
  }

  static async activateCaption(url) {
    // async function activateCaption(url = window.location.href) {
    // skip if user caption off, is shorts skip
    if (this.captionOnStatusByUser == "false" || !this.isVideoUrl(url)) {
      return;
    }
    //get video lang
    var { lang, tlang } = await this.guessVideoLang(url);
    //turn on caption
    this.killInterceptDebounce(); // end caption intercept
    await this.interceptCaption(); // start caption intercept
    await this.waitPlayerReady(); //wait player load
    this.loadCaption(); // turn on caption for embed video
    this.setPlayerCaption(lang, tlang); //turn on caption on specified lang
    this.reloadCaption(); //reset previous caption immediately
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
      this.setting["captionOnStatusByUser"] = $(this.listenButtonSelector).attr(
        "aria-pressed"
      );
      this.setting.save();
    }
  }

  //requestSubtitle=============================
  static async requestSubtitle(baseUrl, lang, tlang, videoId) {
    if (lang) {
      baseUrl = await this.getTranslatedSubtitleUrl(baseUrl, lang);
    }
    try {
      var res = await fetch(this.getTrafficSafeUrl(baseUrl));
    } catch (error) {
      console.log(error);
    }

    // if fail, change base url and try again
    if (res?.status != 200) {
      this.isSubtitleRequestFailed = !this.isSubtitleRequestFailed;
      res = await fetch(this.getTrafficSafeUrl(baseUrl));
    }
    return await res.json();
  }
  static getTrafficSafeUrl(url) {
    return this.isSubtitleRequestFailed
      ? url.replace(
          "www.youtube.com/api/timedtext",
          "video.google.com/timedtext"
        )
      : url;
  }

  static async getTranslatedSubtitleUrl(baseUrl, lang) {
    // get user generated sub url if exist
    var v = this.getVideoId(baseUrl);
    var url = await this.getUserGeneratedSubUrl(v, lang);
    // get auto translated sub url
    if (!url) {
      var url = new URL(baseUrl);
      url.searchParams.set("tlang", lang);
    }
    return url.toString();
  }

  static async getUserGeneratedSubUrl(v, lang) {
    var metaData = await this.getYoutubeMetaDataCached(v);
    var captionList =
      metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    //get one that is selected language sub, not auto generated
    var langUrl = captionList.filter(
      (caption) => !caption?.kind && caption.languageCode == lang
    )?.[0]?.baseUrl;
    return langUrl ? langUrl + "&fmt=json3" : "";
  }

  // concat sub=====================================
  static parseSubtitle(subtitle) {
    var newEvents = [];
    for (var event of subtitle.events) {
      if (!event.segs) {
        continue;
      }
      var oneLineSub = event.segs
        .reduce((acc, cur) => (acc += cur.utf8), "")
        .replace(/\s+/g, " ")
        .trim();

      // if prev sub time overlapped current sub, concat
      if (
        newEvents.length == 0 ||
        // 5000 < newEvents[newEvents.length - 1].dDurationMs ||
        newEvents[newEvents.length - 1].tStartMs +
          newEvents[newEvents.length - 1].dDurationMs <=
          event.tStartMs
      ) {
        newEvents.push({
          tStartMs: event.tStartMs,
          dDurationMs: event.dDurationMs,
          segs: [
            {
              utf8: oneLineSub,
            },
          ],
        });
      } else {
        newEvents[newEvents.length - 1].segs[0].utf8 += oneLineSub
          ? ` ${oneLineSub}`
          : "";
      }
    }

    return {
      events: newEvents,
      pens: [{}],
      wireMagic: "pb3",
      wpWinPositions: [{}],
      wsWinStyles: [{}],
    };
  }

  static mergeSubtitles(sub1, sub2) {
    // fix mismatch length between sub1 sub2
    for (let [i, event] of sub1.events.entries()) {
      var line1 = event.segs[0]["utf8"];
      var line2 = "";
      // get most overlapped sub
      sub2.events.forEach((line) => {
        line.overlap = Math.max(
          event.tStartMs + event.dDurationMs - line.tStartMs,
          line.tStartMs + line.dDurationMs - event.tStartMs
        );
      });
      sub2.events.sort((a, b) => a.overlap - b.overlap);
      if (sub2.events.length && 0 < sub2.events[0].overlap) {
        line2 = sub2.events[0].segs[0]["utf8"];
      }
      event.segs[0]["utf8"] = `${line1}\n${line2 || "\t"}`;
    }
    return sub1;
  }

  // metadata getter ===============================
  static isVideoUrl(url) {
    return this.isShorts(url) || this.isEmbed(url) || this.isMainVideoUrl(url);
  }
  static isMainVideoUrl(url) {
    return url.includes("www.youtube.com/watch");
  }
  static isShorts(url) {
    return url.includes("www.youtube.com/shorts");
  }
  static isEmbed(url) {
    return url.includes("www.youtube.com/embed");
  }
  static getVideoId(url) {
    return this.getUrlParam(url)?.["v"] || this.getUrlParam(url)?.[2]; //2 for shorts and embed
  }
  static guessSubtitleLang(url, subtitle) {
    return this.getUrlParam(url)?.["lang"];
  }

  static getYoutubeMetaDataCached = memoizee(this.getYoutubeMetaData);

  static async getYoutubeMetaData(videoId) {
    // use global variable
    if (ytInitialPlayerResponse?.videoDetails?.videoId == videoId) {
      return ytInitialPlayerResponse;
    }
    // https://github.com/timelens/timelens-youtube/issues/2
    var res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    var resText = await res.text();
    var matches = resText.match(
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+meta|<\/script|\n)/
    );
    var json = JSON.parse(matches[1]);
    return json;
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
    if (this.subSetting == "targetsinglesub") {
      var caption = captionMeta?.filter(
        (sub) => sub.languageCode == this.targetLang
      );
      lang = caption?.[0]?.languageCode || lang;
      tlang = lang != this.targetLang ? { languageCode: this.targetLang } : "";
    }
    return {
      lang: lang || "en",
      tlang,
    };
  }
}
