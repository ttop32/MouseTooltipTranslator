import $ from "jquery";
import * as memoizee from "memoizee";

import BaseVideo from "./baseVideo";
import * as util from "/src/util";

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
    try {
      var res = await fetch(this.getTrafficSafeUrl(subUrl));
    } catch (error) {
      console.log(error);
    }

    // if fail, change base url and try again
    if (res?.status != 200) {
      this.isSubtitleRequestFailed = !this.isSubtitleRequestFailed;
      res = await fetch(this.getTrafficSafeUrl(subUrl));
    }
    return await res.json();
  }
  static getTrafficSafeUrl(url) {
    return this.isSubtitleRequestFailed
      ? url.replace(
          `${this.baseUrl}/api/timedtext`,
          "video.google.com/timedtext"
        )
      : url;
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
    //get one that is selected language sub, not auto generated
    var langUrl = captionList.filter(
      (caption) => !caption?.kind && caption.languageCode == lang
    )?.[0]?.baseUrl;
    return langUrl ? langUrl + "&fmt=json3" : "";
  }

  // concat sub=====================================
  static parseSubtitle(subtitle, lang) {
    var isRtl = util.isRtl(lang);
    var newEvents = [];
    for (var event of subtitle.events) {
      if (!event.segs || !event.dDurationMs) {
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
          // wsWinStyleId: isRtl ? 2 : 1,
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
        line2 = sub2.events[0];
        line2.segs[0]["utf8"] = "\n" + line2.segs[0]["utf8"];
      }
      if (line2) {
        event.segs.push(line2.segs[0]);
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

  static getYoutubeMetaDataCached = memoizee(this.getYoutubeMetaData);

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
