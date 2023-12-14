// https://terrillthompson.com/648
// https://developers.google.com/youtube/iframe_api_reference
// intercept youtube subtitle and concat dual sub
// restart playersubtitle for apply

import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
import { waitUntil } from "async-wait-until";
import { debounce } from "throttle-debounce";

var interceptor = new XMLHttpRequestInterceptor();
var interceptorLoaded = false;
var targetLang = "";
var subSetting = "";
var pausedByExtension = false;
var isPaused = false;
var isBaseUrlAltered = false;
var captionOnStatusByUser = "true";
var urlListenerAdded = false;
var activatedVideoId = "";
var subStartDelayTime = 700;

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

  //if not embed, load interceptor directly else load when start video // embed has interceptor conflict
  if (!isEmbed(window.location.href)) {
    loadInterceptor();
  }
}

async function addPlayerStartListener() {
  handlePlayerAll((element) => {
    // skip if already has listener
    if (element.getAttribute("listener") == "true") {
      return;
    }
    element.setAttribute("listener", "true");
    element.addEventListener("onStateChange", (e) => {
      // turn on caption when first loads a video
      if (e == -1) {
        loadInterceptor();
        activateCaption();
      }
      //check pause
      isPaused = e == 2 ? true : false;
    });
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

//intercept sub request ===================================================================
// check any subtitle request and concat dual sub
function loadInterceptor() {
  if (interceptorLoaded == true) {
    return;
  }
  interceptorLoaded = true;
  interceptor.apply();
  interceptor.on("request", async ({ request, requestId }) => {
    try {
      // do sub concat when activation subtitle is done
      if (
        request.url.includes("www.youtube.com/api/timedtext") &&
        activatedVideoId == getUrlParam(request.url)?.["v"]
      ) {
        //get source lang sub
        var response = await requestSubtitle(request.url);
        var sub1 = await response.json();
        var sub1 = concatWordSub(sub1);
        var { lang } = getUrlParam(request.url);
        var responseSub = sub1;

        //get target lang sub, if not same lang
        if (lang != targetLang && subSetting == "dualsub") {
          var sub2 = await getTranslatedSubtitle(request.url, targetLang);
          var mergedSub = mergeSubtitles(sub1, sub2);
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
  await waitUntil(() => getVideoPlayer());
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
    // async function activateCaption(url = window.location.href) {
    // skip if user caption off, is shorts skip
    if (captionOnStatusByUser == "false" || isShorts(url)) {
      return;
    }

    //get video lang
    var { lang, tlang } = await getVideoLang(url);
    activatedVideoId = getUrlParam(url)?.["v"]; //stage current video id

    //turn on caption
    loadCaption(); // turn on caption for embed video
    setPlayerCaption(lang, tlang); //turn on caption on specified lang
    reloadCaption(); //reset previous caption immediately
  }
);

// getter ===============================

async function getVideoLang(url) {
  var tlang;
  var { v } = getUrlParam(url);
  var metaData = await getYoutubeMetaData(v);
  var captionMeta =
    metaData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  // get auto generated lang
  var captionAsr = captionMeta?.filter((sub) => sub.kind);
  var lang = captionAsr?.[0]?.languageCode;
  // get target lang if targetsinglesub setting
  if (subSetting == "targetsinglesub") {
    var caption = captionMeta?.filter((sub) => sub.languageCode == targetLang);
    lang = caption?.[0]?.languageCode || lang;
    tlang = lang != targetLang ? { languageCode: targetLang } : "";
  }
  return {
    lang: lang || "en",
    tlang,
  };
}

async function getYoutubeMetaData(vParam) {
  var res = await fetch(`https://www.youtube.com/watch?v=${vParam}`);
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
  var { v } = getUrlParam(baseUrl);
  var url = await getUserGeneratedSubUrl(v, lang);
  // get auto translated sub url
  if (!url) {
    var url = new URL(baseUrl);
    url.searchParams.set("tlang", lang);
    // var url = baseUrl + `&tlang=${lang}`;
  }
  return await (await requestSubtitle(url.toString())).json();
}

function getUrlParam(url) {
  var vJson = {};
  if (isShorts(url) || isEmbed(url)) {
    vJson["v"] = url.match(/.*\/([^?]+)/)[1];
  }

  let params = new URL(url).searchParams;
  var paramsJson = Object.fromEntries(params);
  return concatJson(vJson, paramsJson);
}
function isVideoUrl(url) {
  return isShorts(url) || isEmbed(url) || isMainVideoUrl(url);
}

function isMainVideoUrl(url) {
  return url.includes("www.youtube.com/watch");
}

function isShorts(url) {
  return url.includes("www.youtube.com/shorts");
}
function isEmbed(url) {
  return url.includes("www.youtube.com/embed");
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

function concatJson(x, y) {
  return Object.assign(x, y);
}
