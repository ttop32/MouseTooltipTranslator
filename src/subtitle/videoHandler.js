// https://terrillthompson.com/648
// https://developers.google.com/youtube/iframe_api_reference
// intercept youtube subtitle and concat dual sub
// restart playersubtitle for apply
// caption on off, detect url redirect

import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
import { debounce } from "throttle-debounce";
import $ from "jquery";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";

var interceptor = new XMLHttpRequestInterceptor();
var targetLang = "";
var subSetting = "";
var captionOnStatusByUser = "true";
var pausedByExtension = false;
var isPaused = false;
var activatedVideoId = "";
var interceptKillTime = 5 * 60 * 1000;
var isEventListenerLoaded = false;
var interceptorLoaded = false;
var isBaseUrlAltered = false;
var prevUrl = "";

window.addEventListener(
  "message",
  async function ({ data }) {
    if (data.type == "initPlayer") {
      initPlayer(data);
    }
  },
  false
);

// listener start ========================================
export async function initPlayer(data) {
  targetLang = data.targetLang;
  subSetting = data.subSetting;
  captionOnStatusByUser = data.captionOnStatusByUser;
  prevUrl = "";
  await loadEventListener();
  activateCaption();
}

async function loadEventListener() {
  if (isEventListenerLoaded) {
    return;
  }
  isEventListenerLoaded = true;
  // check video and turn on sub
  await waitVideoPlayerLoad();
  addPlayerStartListener();
  addUrlListener();
  addCaptionButtonListener();
  addSubtitleHoverListener();
}

async function addPlayerStartListener() {
  getVideoPlayer().addEventListener("onStateChange", (e) => {
    // turn on caption when first loads a video
    if (e == -1) {
      activateCaption();
    }
    //check pause
    isPaused = e == 2 ? true : false;
  });
}

function addUrlListener() {
  navigation.addEventListener("navigate", (e) => {
    pausedByExtension = false;
    activateCaption(e.destination.url);
    addPlayerStartListener();
  });
}

async function addCaptionButtonListener() {
  await waitUntilForever(() => $(".ytp-subtitles-button").get(0));
  $(".ytp-subtitles-button").on("click", (e) => {
    handleCaptionOnOff();
  });
  $(document).on("keydown", (e) => {
    if (e.code == "KeyC") {
      handleCaptionOnOff();
    }
  });
}

async function handleCaptionOnOff() {
  captionOnStatusByUser = $(".ytp-subtitles-button").attr("aria-pressed");
  postFrame({ type: "youtubeCaptionOnOff", captionOnStatusByUser });
}

async function addSubtitleHoverListener() {
  await waitCaptionBox();

  const observer = new MutationObserver((mutations) => {
    // make subtitle selectable
    $("#movie_player .ytp-caption-segment")
      .off()
      .on("contextmenu", (e) => {
        e.stopPropagation();
      })
      .on("mousedown", (e) => {
        e.stopPropagation();
      });

    // skip embed video
    if (isEmbed(window.location.href)) {
      return;
    }

    // add auto pause when mouseover
    $("#movie_player .caption-window")
      .off()
      .on("mouseenter", (e) => {
        pausePlayer();
      })
      .on("mouseleave", (e) => {
        playPlayer();
      })
      .attr("draggable", "false");
  });

  observer.observe(
    document.querySelector("#movie_player .ytp-caption-window-container"),
    {
      subtree: true,
      childList: true,
    }
  );
}

//intercept sub request ===================================================================
// check any subtitle request and concat dual sub

//interceptor api has bug that does not pass skipped one
//need to kill this interceptor when done for above reason
async function loadInterceptor() {
  if (interceptorLoaded) {
    return;
  }
  interceptorLoaded = true;
  await waitVideoFrameLoad();
  killIntercept();

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
  return $("#movie_player")?.get(0);
}

async function waitVideoPlayerLoad() {
  await waitUntilForever(() => getVideoPlayer());
}
async function waitVideoFrameLoad() {
  await waitUntilForever(
    () => getVideoPlayer()?.getVideoLoadedFraction() > 0.0000001
  );
}
async function waitCaptionBox() {
  await waitUntilForever(() => $(".ytp-caption-window-container").length);
}

async function pausePlayer() {
  if (isPaused == true) {
    return;
  }
  pausedByExtension = true;
  getVideoPlayer().pauseVideo();
}
async function playPlayer() {
  // only restart when paused by extension
  if (pausedByExtension == false) {
    return;
  }
  pausedByExtension = false;
  getVideoPlayer().playVideo();
}

function reloadCaption() {
  getVideoPlayer().setOption("captions", "reload", true);
}
function loadCaption() {
  getVideoPlayer().loadModule("captions");
}
function unloadCaption() {
  getVideoPlayer().unloadModule("captions");
}

function setPlayerCaption(lang, translationLanguage) {
  getVideoPlayer().setOption("captions", "track", {
    languageCode: lang,
    translationLanguage,
  });
}

async function activateCaption(url = window.location.href) {
  // async function activateCaption(url = window.location.href) {
  // skip if user caption off, is shorts skip
  if (
    captionOnStatusByUser == "false" ||
    isShorts(url) ||
    !isVideoUrl(url) ||
    prevUrl == url
  ) {
    return;
  }
  prevUrl = url;

  //get video lang
  var { lang, tlang } = await getVideoLang(url);
  activatedVideoId = getUrlParam(url)?.["v"]; //stage current video id

  //turn on caption
  await loadInterceptor();
  loadCaption(); // turn on caption for embed video
  setPlayerCaption(lang, tlang); //turn on caption on specified lang
  reloadCaption(); //reset previous caption immediately
}

const killIntercept = debounce(interceptKillTime, () => {
  interceptor.dispose();
  interceptorLoaded = false;
});

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

// util=================================

function concatJson(x, y) {
  return Object.assign(x, y);
}

async function waitUntilForever(fn) {
  await waitUntil(fn, {
    timeout: WAIT_FOREVER,
  });
}

function postFrame(data) {
  if (self == top) {
    window.postMessage(data, "*");
  } else {
    window.postMessage(data, "*");
    window.parent.postMessage(data, "*");
  }
}
