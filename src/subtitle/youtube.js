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
      var json = await response.json();
      var concatSub = concatWordSub(json);
      request.respondWith(new Response(JSON.stringify(concatSub), response));
    }
  } catch (error) {
    console.log(error);
  }
});

function concatWordSub(subtitle) {
  for (var event of subtitle.events) {
    if (!event.segs || event.id) {
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
