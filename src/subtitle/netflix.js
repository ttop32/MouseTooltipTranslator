import BaseVideo from "./baseVideo";
import $ from "jquery";

// https://github.com/mikesteele/dual-captions/blob/b0ab92e4670100a27b76b2796995ad1be89f1672/site_integrations/netflix/index.js
// https://stackoverflow.com/questions/42105028/netflix-video-player-in-chrome-how-to-seek

export default class Netflix extends BaseVideo {
  static sitePattern = /^(https:\/\/)(www\.netflix\.com)/;
  static captionRequestPattern = /^(https:\/\/).*(nflxvideo\.net)\/\?o=1/;
  static baseUrl = "https://www.netflix.com";

  static playerSelector = "";
  static playerApiSelector = "";
  static captionContainerSelector = "";
  static captionWindowSelector = "";
  static captionBoxSelector = "";
  static sub = {};

  static #injectScriptConstructor = (() => {
    this.listenMessageFrameFromInject();
  })();
  static async listenPlayer() {}
  static async handleUrlChange(url = window.location.href) {
    this.pausedByExtension = false;
    this.callMethodFromInject("activateCaption", url);
  }
  static async activateCaption(url) {
    // skip if user caption off, is shorts skip
    if (!this.isVideoUrl(url)) {
      return;
    }
    await this.waitPlayerReady(); //wait player load
    // get video lang
    var lang = await this.guessVideoLang();
    this.killInterceptDebounce(); // end caption intercept
    await this.interceptCaption(); // start caption intercept
    await this.waitUntilForever(() => this.getVideoId());

    if (this.checkPlayerCaptionOff()) {
      console.log("caption is off");
    } else {
      var videoId = this.getVideoId();
      this.requestTrack(lang, videoId); //turn on caption on specified lang
    }
  }
  static async isVideoUrl(url) {
    return url.includes(`${this.baseUrl}/watch`);
  }
  static async waitPlayerReady() {
    await this.waitUntilForever(() => this.getPlayer());
    var player = this.getPlayer();
    await this.waitUntilForever(() => player.getAudioTrack());
  }
  static setPlayerCaption(lang) {
    this.getPlayer().setTimedTextTrack(lang);
  }
  static setPlayerCaptionOff() {
    var offTrack = this.getPlayer()
      .getTimedTextTrackList()
      .find((track) => track.trackId.includes("NONE"));
    this.getPlayer().setTimedTextTrack(offTrack);
  }
  static checkPlayerCaptionOff() {
    const textTrackList = this.getPlayer().getTimedTextTrackList();
    var currentTrack = this.getPlayer().getTextTrack();
    return !currentTrack || currentTrack.trackId === textTrackList[0]?.trackId;
  }

  static getPlayer() {
    var videoPlayer =
      window?.netflix?.appContext?.state?.playerApp?.getAPI().videoPlayer;
    var playerSessionId = videoPlayer
      ?.getAllPlayerSessionIds()
      .find((s) => s.includes("watch"));
    var player = videoPlayer?.getVideoPlayerBySessionId(playerSessionId);
    return player;
  }
  static getVideoId() {
    return String(this.getPlayer().getMovieId());
  }
  static async guessVideoLang() {
    return this.getPlayer()?.getAudioTrack()?.bcp47;
  }
  static async guessSubtitleLang(url, subtitle) {
    return this.getPlayer()?.getTimedTextTrack()?.bcp47;
  }

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
          var response = await this.requestSubtitle(request.url);
          var targetLang = this.setting["translateTarget"];
          var videoId = this.getVideoId();
          var xml = await response.text();
          var sub1 = this.parseSubtitle(xml, videoId);
          var responseSub = sub1;

          if (sub1.lang != targetLang) {
            var sub2 = await this.requestSubtitleWithReset(targetLang);
            var mergedSub = this.mergeSubtitles(sub1, sub2);
            responseSub = mergedSub;
          }
          var xmlRes = this.encodeMergedSubtitles(responseSub);
          request.respondWith(new Response(xmlRes));
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  static async requestSubtitle(subUrl, lang, tlang, videoId) {
    var res = await fetch(subUrl);
    return res;
  }
  static async requestSubtitleWithReset(lang, videoId) {
    var player = this.getPlayer();
    var prevSub = player.getTimedTextTrack();
    var sub = await this.requestTrack(lang, videoId);
    player.setTextTrack(prevSub);
    return sub;
  }
  static async requestTrack(lang, videoId) {
    var videoId = videoId || this.getVideoId();
    if (this.sub?.[videoId]?.[lang]) {
      return this.sub?.[videoId]?.[lang];
    }
    var player = this.getPlayer();
    var subList = player.getTimedTextTrackList();
    const selectedTimedTextTrack = subList
      .sort((a, b) => (a.trackType === "ASSISTIVE" ? -1 : 1))
      .filter((textTrack) => textTrack.isImageBased=== false)
      .find((textTrack) => textTrack.bcp47 === lang);

    if (!selectedTimedTextTrack) {
      return null;
    }

    player.setTextTrack(selectedTimedTextTrack);
    await this.waitUntilForever(() => {
      return this.sub?.[videoId]?.[lang];
    });
    return this.sub?.[videoId]?.[lang];
  }
  static extractVideoId(url) {
    const match = url.match(/\/watch\/(\d+)/);
    return match ? match[1] : null;
  }

  static parseSubtitle(sub, videoId) {
    var styles ={}
    var regions = {}
    const concatSubtitles = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sub, "text/xml");
    const subtitles = Array.from(xmlDoc.getElementsByTagName("p")).map((p) =>
      p.cloneNode(true)
    );
    var lang = xmlDoc.documentElement.getAttribute("xml:lang");
    // remove div tag
    const div = xmlDoc.querySelector("div");
    div?.parentNode?.removeChild(div);

    // Extract all regions and update their IDs to start with the language code
    const layout = xmlDoc.getElementsByTagName("layout")[0];
    if (layout) {
      var regions = Array.from(layout.getElementsByTagName("region"));
      regions.forEach((region, index) => {
        const newId = `region${index}_${lang}`;
        region.setAttribute("xml:id", newId);
      });
    }

    const styling = xmlDoc.getElementsByTagName("styling")[0];
    if (styling) {
      var styles = Array.from(styling.getElementsByTagName("style"));
      styles.forEach((style) => {
      const newId = `${style.getAttribute("xml:id")}_${lang}`;
      style.setAttribute("xml:id", newId);
      });
    }

    // parse subtitles
    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];
      const start = parseInt(subtitle.getAttribute("begin").replace("t", ""));
      const end = parseInt(subtitle.getAttribute("end").replace("t", ""));
      const text = subtitle.textContent;
      const region = subtitle.getAttribute("region") + "_" + lang;
      const style = subtitle.getElementsByTagName("span")[0]?.getAttribute("style")+"_" + lang;
      var prev = concatSubtitles?.[concatSubtitles.length - 1];
      if (prev && prev.start === start && prev.end === end) {
        prev.text += " " + text;
      } else {
        concatSubtitles.push({ start, end, text, region, style });
      }
    }

    var parsedSubMeta = {
      xmlDoc,
      lang,
      subtitles: concatSubtitles,
      regions,
      styles,
    };
    if (!this.sub[videoId]) {
      this.sub[videoId] = {};
    }
    this.sub[videoId][lang] = parsedSubMeta;
    return parsedSubMeta;
  }

  static mergeSubtitles(sub1Meta, sub2Meta) {
    var mergedSub = [];
    var sub1 = sub1Meta.subtitles;
    var sub2 = sub2Meta.subtitles;
    var mergedSubMeta = { ...sub1Meta };

    const layout = mergedSubMeta?.xmlDoc?.getElementsByTagName("layout")?.[0];

    sub2Meta?.regions?.forEach((region) => {
      layout?.appendChild(region);
    });

    // Merge styles from sub2 into sub1
    const styling = sub1Meta?.xmlDoc?.getElementsByTagName("styling")?.[0];
    sub2Meta?.styles?.forEach((style) => {
      styling?.appendChild(style);
    });

    // fix mismatch length between sub1 sub2
    for (let [i, sub1Line] of sub1.entries()) {
      var line1 = sub1Line;
      var line2 = "";
      // get most overlapped sub
      sub2.forEach((line) => {
        line.overlap = Math.max(
          sub1Line.end - line.start,
          line.end - sub1Line.start
        );
      });
      sub2.sort((a, b) => a.overlap - b.overlap);

      // if sub2 has no overlap, use sub1
      mergedSub.push(line1);
      if (sub2.length && 0 < sub2[0].overlap) {
        line2 = sub2[0];
        let line1Copy = { ...line1 };
        line1Copy.text = line2.text;
        mergedSub.push(line1Copy);
      }
    }

    mergedSubMeta.subtitles = mergedSub;
    return mergedSubMeta;
  }

  static encodeMergedSubtitles(subMeta) {
    var xmlDoc = subMeta.xmlDoc;
    var subtitles = subMeta.subtitles;
    const body = xmlDoc.getElementsByTagName("body")[0];
    let div = body.getElementsByTagName("div")[0];
    if (!div) {
      div = xmlDoc.createElement("div");
      body.appendChild(div);
    }

    subtitles.forEach((sub) => {
      const p = xmlDoc.createElement("p");
      p.setAttribute("xml:id", `subtitle${subtitles.indexOf(sub) + 1}`);
      p.setAttribute("begin", `${sub.start}t`);
      p.setAttribute("end", `${sub.end}t`);
      p.setAttribute("region", sub.region);
      p.setAttribute("style", sub.style);

      const span = xmlDoc.createElement("span");
      span.setAttribute("style", "style0");
      span.textContent = sub.text;

      p.appendChild(span);
      div.appendChild(p);
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  }

  static encodeSubtitle(subtitles) {
    return subtitles;
  }
}