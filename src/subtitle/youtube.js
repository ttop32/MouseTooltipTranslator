// https://terrillthompson.com/648
// intercept youtube subtitle and concat dual sub
// restart playersubtitle for apply

import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
import { fetch as fetchPolyfill } from "whatwg-fetch";
import { debounce } from "throttle-debounce";
import delay from "delay";

const interceptor = new XMLHttpRequestInterceptor();
interceptor.apply();
var targetLang = "";
var subSetting = "";
var delayTime = 500;

window.addEventListener(
  "message",
  async function({ data }) {
    if (data.type == "initYoutubePlayer") {
      initPlayer(data);
    } else if (data.type == "pausePlayer") {
      pausePlayer();
    } else if (data.type == "playPlayer") {
      playPlayer();
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

      if (lang != targetLang && subSetting == "dualsub") {
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

// listener start ========================================
async function initPlayer(data) {
  targetLang = data.targetLang;
  subSetting = data.subSetting;
  // check change and turn on sub
  addPlayerStartListener();
  addUrlListener();
  await delay(delayTime); // embed video start has delay, we need to wait
  reloadCaption();
  activateCaption();
}

function addPlayerStartListener() {
  handlePlayer((ele) =>
    ele.addEventListener("onStateChange", (e) => {
      // turn on caption when first loads a video
      if (e == -1) {
        activateCaption();
      }
    })
  );
}

function addUrlListener() {
  navigation.addEventListener("navigate", (e) => {
    var url = e.destination.url;
    activateCaption(url);
  });
}

// handle player ==================================================
function handlePlayer(callbackFn) {
  var ele = document.querySelector(".html5-video-player");
  if (ele) {
    callbackFn(ele);
  }
}
function reloadCaption() {
  handlePlayer((ele) => ele.setOption("captions", "reload", true));
}
function pausePlayer() {
  handlePlayer((ele) => ele.pauseVideo());
}
function playPlayer() {
  handlePlayer((ele) => ele.playVideo());
}
function setPlayerCaption(lang, translationLanguage) {
  handlePlayer((ele) =>
    ele.setOption("captions", "track", {
      languageCode: lang,
      translationLanguage,
    })
  );
}

const activateCaption = debounce(
  delayTime,
  async (url = window.location.href) => {
    if (subSetting == "minimized") {
      return;
    }
    var { lang, translationLanguage } = await getVideoLang(url);
    setPlayerCaption(lang, translationLanguage);
  }
);

// concat sub=====================================

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

// getter ===============================

async function getVideoLang(url) {
  var translationLanguage;
  var vParam = getVideoIdParam(url);
  var metaData = await getYoutubeMetaData(vParam);
  var captionMeta =
    metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  // get auto generated lang
  var captionAsr = captionMeta?.filter((sub) => sub.kind);
  var lang = captionAsr?.[0]?.languageCode;
  // get target lang if targetsinglesub setting
  if (subSetting == "targetsinglesub") {
    var caption = captionMeta?.filter((sub) => sub.languageCode == targetLang);
    lang = caption?.[0]?.languageCode || lang;
    translationLanguage =
      lang != targetLang ? { languageCode: targetLang } : "";
  }
  return {
    lang: lang || "en",
    translationLanguage,
  };
}

async function getYoutubeMetaData(vParam) {
  var res = await fetchPolyfill(`https://www.youtube.com/watch?v=${vParam}`); // no override fetch function, we need pure one
  var resText = await res.text();
  var matches = resText.match(
    /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+meta|<\/script|\n)/
  );
  var json = JSON.parse(matches[1]);
  return json;
  // return ytInitialPlayerResponse;  // get metadata from  global variable declaration
}

async function getUserGeneratedSubUrl(v, lang) {
  var metaData = await getYoutubeMetaData(v);
  var captionList =
    metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  var langUrl = captionList.filter(
    (caption) => !caption?.kind && caption.languageCode == lang
  )?.[0]?.baseUrl;
  langUrl = langUrl ? langUrl + "&fmt=json3" : "";
  return langUrl;
}

async function getTranslatedSubtitle(baseUrl, lang) {
  // await delay(delayTime); //prevent google traffic error
  // get user generated sub url if exist
  var v = getVideoIdParam(baseUrl);
  var url = await getUserGeneratedSubUrl(v, lang);
  // get auto translated sub url
  if (!url) {
    var url = new URL(baseUrl);
    url.searchParams.set("tlang", lang);
  }
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
