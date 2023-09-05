// intercept youtube subtitle and concat dual sub
// restart playersubtitle for apply

import $ from "jquery";
import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";

const interceptor = new XMLHttpRequestInterceptor();
interceptor.apply();
var targetLang = "";
var enableYoutube = "";
var isEmbed = false;

window.addEventListener(
  "message",
  async function({ data }) {
    if (data.type == "initYoutubePlayer") {
      initPlayer(data);
    } else if (data.type == "reloadCaption") {
      handlePlayer((ele) => ele.setOption("captions", "reload", true));
    } else if (data.type == "activateCaption") {
      activateCaption();
    } else if (data.type == "pausePlayer") {
      handlePlayer((ele) => ele.pauseVideo());
    } else if (data.type == "playPlayer") {
      handlePlayer((ele) => ele.playVideo());
    }
  },
  false
);

// check any subtitle request and concat dual sub
interceptor.on("request", async ({ request, requestId }) => {
  try {
    if (request.url.includes("www.youtube.com/api/timedtext")) {
      var response = await fetch(request.clone());
      var sub1 = await response.json();
      var sub1 = concatWordSub(sub1);
      var lang = getSearchParam(request.url, "lang");
      var responseSub = sub1;

      if (lang != targetLang && enableYoutube == "dualsub") {
        var sub2 = await getTranslatedSubtitle(request.url, targetLang);
        var mergedSub = mergeSubtitles(sub1, sub2);
        responseSub = mergedSub;
      }

      request.respondWith(new Response(JSON.stringify(responseSub), response));
    }
  } catch (error) {
    console.log(error);
  }
});

// check url change and turn on sub
navigation.addEventListener("navigate", (e) => {
  var url = e.destination.url;
  activateCaption(url);
});

// ========================================

function initPlayer(data) {
  targetLang = data.targetLang;
  enableYoutube = data.enableYoutube;
  isEmbed = window.location.href.includes("www.youtube.com/embed");
}

function handlePlayer(callbackFn) {
  if (isEmbed) {
    return;
  }
  var ele = $(".html5-video-player").get(0);
  callbackFn(ele);
}

async function activateCaption(url = window.location.href) {
  if (enableYoutube == "minimized") {
    return;
  }
  // get auto generated lang sub
  // if targetsinglesub, get target lang
  var needTargetLang = enableYoutube == "targetsinglesub";
  var lang = (await getExistSubLang(url, needTargetLang)) || "en";

  // if no target lang sub use translation
  var translationLanguage =
    lang != targetLang && enableYoutube == "targetsinglesub"
      ? { languageCode: targetLang }
      : "";

  // turn on caption with specific lang and translate
  handlePlayer((ele) =>
    ele.setOption("captions", "track", {
      languageCode: lang,
      translationLanguage,
    })
  );
}

async function getExistSubLang(url, needTargetLang = false) {
  var vParam = getVideoIdParam(url);
  var metaData = await getYoutubeMetaData(vParam);
  var captionMeta =
    metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  // get target lang if exist
  if (needTargetLang) {
    var caption = captionMeta?.filter((sub) => sub.languageCode == targetLang);
    if (caption?.length) {
      return caption?.[0]?.languageCode;
    }
  }
  // get auto generated lang
  var captionAsr = captionMeta?.filter((sub) => sub.kind);
  return captionAsr?.[0]?.languageCode;
}

function concatWordSub(subtitle) {
  var newEvents = [];

  for (var event of subtitle.events) {
    if (!event.segs || !event.dDurationMs) {
      continue;
    }

    var oneLineSub = event.segs
      .reduce((acc, cur) => (acc += cur.utf8), "")
      .replace(/\s+/g, " ")
      .trim();

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

function mergeSubtitles(sub1, sub2) {
  var sub1 = concatWordSub(sub1);
  var sub2 = concatWordSub(sub2);

  // fix mismatch length between sub1 sub2
  var j = 0;
  for (let [i, event] of sub1.events.entries()) {
    var line1 = event.segs[0]["utf8"];
    var line2 = "";

    // get sub2 line between tStartMs ~ dDurationMs
    while (j < sub2.events.length && sub2.events[j].tStartMs < event.tStartMs) {
      j++;
    }
    if (
      j < sub2.events.length &&
      sub2.events[j].tStartMs < event.tStartMs + event.dDurationMs
    ) {
      line2 = sub2.events[j].segs[0]["utf8"];
      j++;
    }
    event.segs[0]["utf8"] = `${line1}\n${line2}`;
  }

  return sub1;
}

async function getYoutubeMetaData(vParam) {
  var html = await (
    await fetch(`https://www.youtube.com/watch?v=${vParam}`)
  ).text();
  var matches = html.match(
    /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+meta|<\/script|\n)/
  );
  var json = JSON.parse(matches[1]);
  return json;
}

async function getTranslatedSubtitle(baseUrl, lang) {
  var url = new URL(baseUrl);
  url.searchParams.set("tlang", lang);
  return await (await fetch(url.toString())).json();
}

function getVideoIdParam(url) {
  if (url.includes("www.youtube.com/embed")) {
    return url.match(/.*\/([^?]+)/)[1];
  }
  return getSearchParam(url, "v");
}

function getSearchParam(url, param) {
  var _url = new URL(url);
  var urlParam = _url.searchParams;
  return urlParam.get(param);
}
