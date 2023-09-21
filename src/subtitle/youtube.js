// https://terrillthompson.com/648
// https://developers.google.com/youtube/iframe_api_reference
// intercept youtube subtitle and concat dual sub
// restart playersubtitle for apply

import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
import { fetch as fetchPolyfill } from "whatwg-fetch";
import { debounce } from "throttle-debounce";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
import delay from "delay";

const interceptor = new XMLHttpRequestInterceptor();
interceptor.apply();
var targetLang = "";
var subSetting = "";
var subStartDelayTime = 1500;
var googleTrafficDelayTime = 0;
var failSkipTime = 5000;
var pausedByExtension = false;
var isPaused = false;
var failTimestamp = 0;
var isBaseUrlAltered = false;
var captionOnStatusByUser = "true";
var urlListenerAdded = false;
var activatedVideoId = "";

window.addEventListener(
  "message",
  async function ({ data }) {
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
    // do sub concat when activation subtitle is done
    if (
      request.url.includes("www.youtube.com/api/timedtext") &&
      activatedVideoId == getVideoIdParam(request.url)
    ) {
      //get source lang sub
      var response = await requestSubtitle(request.url);
      var sub1 = await response.json();
      var sub1 = concatWordSub(sub1);
      var lang = getSearchParam(request.url, "lang");
      var responseSub = sub1;

      //get target lang sub, if not same lang
      if (lang != targetLang && subSetting == "dualsub") {
        await delay(googleTrafficDelayTime); //prevent google traffic error
        var sub2 = await getTranslatedSubtitle(request.url, targetLang);
        var mergedSub = mergeSubtitles(sub1, sub2);
        responseSub = mergedSub;
      }

      request.respondWith(new Response(JSON.stringify(responseSub), response));
    }
  } catch (error) {
    console.log(error);
    failTimestamp = Date.now();
    await delay(googleTrafficDelayTime); //prevent traffic error
  }
});

// listener start ========================================
async function initPlayer(data) {
  targetLang = data.targetLang;
  subSetting = data.subSetting;
  captionOnStatusByUser = data.captionOnStatusByUser;
  // check video and turn on sub
  await waitVideoPlayerLoad();
  addPlayerStartListener();
  addUrlListener();
  activateCaption();
}

async function addPlayerStartListener() {
  handlePlayerAll((element) => {
    // check listner already placed
    if (element.getAttribute("listener") != "true") {
      element.setAttribute("listener", "true");
      element.addEventListener("onStateChange", (e) => {
        // turn on caption when first loads a video
        if (e == -1) {
          activateCaption();
        }
        //check pause
        isPaused = e == 2 ? true : false;
      });
    }
  });
}

function addUrlListener() {
  if (urlListenerAdded) {
    return;
  }
  urlListenerAdded = true;
  navigation.addEventListener("navigate", (e) => {
    pausedByExtension = false;
    activateCaption(e.destination.url);
    addPlayerStartListener();
  });
}

// handle player ==================================================
function getVideoPlayer() {
  return document.querySelector(".html5-video-player");
}
function getVideoPlayerAll() {
  return document.querySelectorAll(".html5-video-player");
}

function handlePlayer(callbackFn) {
  var ele = getVideoPlayer();
  if (ele) {
    callbackFn(ele);
  }
}
function handlePlayerAll(callbackFn) {
  // there are three players,  shorts video, main video, preview video
  getVideoPlayerAll().forEach((element) => {
    callbackFn(element);
  });
}

async function waitVideoPlayerLoad() {
  await waitUntil(() => getVideoPlayer(), {
    timeout: WAIT_FOREVER,
    intervalBetweenAttempts: 1000,
  });
}

async function pausePlayer() {
  if (isPaused == true) {
    return;
  }
  pausedByExtension = true;
  handlePlayerAll((element) => element.pauseVideo());
}
async function playPlayer() {
  // only restart when paused by extension
  if (pausedByExtension == false) {
    return;
  }
  pausedByExtension = false;
  handlePlayerAll((element) => element.playVideo());
}

function reloadCaption() {
  handlePlayerAll((element) => element.setOption("captions", "reload", true));
}
function loadCaption() {
  handlePlayerAll((element) => element.loadModule("captions"));
}
function unloadCaption() {
  handlePlayerAll((element) => element.unloadModule("captions"));
}

function setPlayerCaption(lang, translationLanguage) {
  handlePlayerAll((element) => {
    element.setOption("captions", "track", {
      languageCode: lang,
      translationLanguage,
    });
  });
}

const activateCaption = debounce(
  subStartDelayTime,
  async (url = window.location.href) => {
    // do not turn on caption if user off
    // if is shorts skip
    // || isShorts(url)
    if (captionOnStatusByUser == "false" || !isVideoUrl(url)) {
      return;
    }
    activatedVideoId = getVideoIdParam(url);

    var { lang, translationLanguage } = await getVideoLang(url);
    loadCaption(); // turn on caption for embed video
    setPlayerCaption(lang, translationLanguage); //turn on caption on specified lang
    reloadCaption(); //reset previous caption immediately
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
  // get user generated sub url if exist
  var v = getVideoIdParam(baseUrl);
  var url = await getUserGeneratedSubUrl(v, lang);
  // get auto translated sub url
  if (!url) {
    var url = new URL(baseUrl);
    url.searchParams.set("tlang", lang);
    // var url = baseUrl + `&tlang=${lang}`;
  }
  return await (await requestSubtitle(url.toString())).json();
}

function getVideoIdParam(url) {
  if (isShorts(url) || isEmbed(url)) {
    return url.match(/.*\/([^?]+)/)[1];
  }
  return getSearchParam(url, "v");
}
function getSearchParam(url, param) {
  var _url = new URL(url);
  var urlParam = _url.searchParams;
  return urlParam.get(param);
}

function isVideoUrl(url) {
  return isShorts(url) || isEmbed(url) || url.includes("www.youtube.com/watch");
}

function isShorts(url) {
  return url.includes("www.youtube.com/shorts");
}
function isEmbed(url) {
  return url.includes("www.youtube.com/embed");
}
function isFailOccurRecently() {
  return Date.now() < failTimestamp + failSkipTime;
}

//=============================
async function requestSubtitle(url) {
  var failed = false;
  try {
    var res = await fetch(getSubUrl(url));
  } catch (error) {
    failed = true;
  }

  // if fail, change base url and try again
  if (res?.status != 200 || failed) {
    await delay(googleTrafficDelayTime);
    isBaseUrlAltered = !isBaseUrlAltered;
    res = await fetch(getSubUrl(url));
  }
  return res;
}
function getSubUrl(url) {
  return isBaseUrlAltered
    ? url.replace("www.youtube.com/api/timedtext", "video.google.com/timedtext")
    : url;
}
