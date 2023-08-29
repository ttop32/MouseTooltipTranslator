// https://stackoverflow.com/questions/9515704/access-variables-and-functions-defined-in-page-context-using-a-content-script/9517879#9517879
// https://stackoverflow.com/questions/18310484/modify-http-responses-from-a-chrome-extension
// https://stackoverflow.com/questions/68537608/youtubes-get-video-info-endpoint-no-longer-working
// https://www.youtube.com/api/timedtext

// intercept youtube subtitle and concat it
// restart playersubtitle for apply

import $ from "jquery";
import { XMLHttpRequestInterceptor } from "@mswjs/interceptors/XMLHttpRequest";
const interceptor = new XMLHttpRequestInterceptor();
interceptor.apply();

window.addEventListener(
  "message",
  async function({ data }) {
    if (data.type == "ytPlayerSetOption") {
      $(".html5-video-player").each((index, element) => {
        element.setOption(...data.args);
      });
    }
  },
  false
);

interceptor.on("request", async ({ request, requestId }) => {
  try {
    if (request.url.includes("api/timedtext")) {
      var response = await fetch(request.clone());
      var sub1 = await response.json();
      var sub1 = concatWordSub(sub1);
      request.respondWith(new Response(JSON.stringify(sub1), response));

      // var targetLang = "en";
      // var sub2 = await getTranslatedSubtitle(request.url, targetLang);
      // var mergedSub = mergeSubtitles(sub1, sub2);
      // request.respondWith(new Response(JSON.stringify(mergedSub), response));
    }
  } catch (error) {
    console.log(error);
  }
});

function concatWordSub(subtitle) {
  for (var event of subtitle.events) {
    if (!event.segs) {
      continue;
    }
    var oneLineSub = event.segs.reduce((acc, cur) => (acc += cur.utf8), "");
    event.segs = [
      {
        utf8: oneLineSub,
      },
    ];
  }
  return subtitle;
}

function mergeSubtitles(sub1, sub2) {
  var sub1 = concatWordSub(sub1);
  var sub2 = concatWordSub(sub2);

  for (let [index, event] of sub1.events.entries()) {
    if (!event.segs || !event.dDurationMs) {
      continue;
    }
    var line1 = event.segs[0]["utf8"].replace(/\s+/g, " ").trim();
    var line2 = sub2.events[index]
      ? sub2.events[index].segs[0]["utf8"].replace(/\s+/g, " ").trim()
      : "";

    event.segs[0]["utf8"] = `${line1}\n${line2 || "\t"}`;
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

function getSubtitleList(metaData) {
  return metaData["captions"]["playerCaptionsTracklistRenderer"][
    "captionTracks"
  ];
}

async function getTranslatedSubtitle(baseUrl, lang) {
  var url = new URL(baseUrl);
  var urlParam = url.searchParams;
  urlParam.set("tlang", lang);
  return await (await fetch(url.toString())).json();
}
