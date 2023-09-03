// https://terrillthompson.com/648
// intercept youtube subtitle and concat it
// restart playersubtitle for apply

import $ from "jquery";
import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
// import { FetchInterceptor } from "@mswjs/interceptors/fetch";
// const interceptorFetch = new FetchInterceptor();
// interceptorFetch.apply();

const interceptor = new XMLHttpRequestInterceptor();
interceptor.apply();
var targetLang = "";
var enableYoutube = "";

window.addEventListener(
  "message",
  async function({ data }) {
    if (data.type == "initYoutubePlayer") {
      targetLang = data.targetLang;
      enableYoutube = data.enableYoutube;
    } else if (data.type == "reloadCaption") {
      handlePlayer((ele) => ele.setOption("captions", "reload", true));
    } else if (data.type == "activateCaption") {
      activateCaption();
    } else if (data.type == "pausePlayer") {
      handlePlayer((ele) => ele.pauseVideo());
    } else if (data.type == "playPlayer") {
      handlePlayer((ele) => ele.playVideo());
    }
    response({
      windowPostMessageProxy: data.windowPostMessageProxy,
    });
  },
  false
);

// check any subtitle request
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

// check url change
navigation.addEventListener("navigate", (e) => {
  var url = e.destination.url;
  activateCaption(url);
});

// ========================================

function handlePlayer(callbackFn) {
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
  var vParam = getSearchParam(url, "v");
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

  for (let [index, event] of sub1.events.entries()) {
    if (!event.segs || !event.dDurationMs) {
      continue;
    }
    var line1 = event.segs[0]["utf8"];
    var line2 = sub2.events[index] ? sub2.events[index].segs[0]["utf8"] : "\t";
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
  var urlParam = url.searchParams;
  urlParam.set("tlang", lang);
  return await (await fetch(url.toString())).json();
}

function getSearchParam(url, param) {
  var _url = new URL(url);
  var urlParam = _url.searchParams;
  return urlParam.get(param);
}
