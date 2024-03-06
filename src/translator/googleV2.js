import ky from "ky";
import BaseTranslator from "./baseTranslator";

var tokenUrl = "https://translate.google.com";
var newGoogleUrl =
  "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute";
var token;
var tokenTTL = 60 * 60 * 1000; //1hour

export default class googleV2 extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    var { sid, bl, at } = await getTokenV2();

    let req = JSON.stringify([
      [
        [
          "MkEWBc",
          JSON.stringify([[text, sourceLang, targetLang, true], [null]]),
          null,
          "generic",
        ],
      ],
    ]);
    return await ky
      .post(newGoogleUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        searchParams: {
          rpcids: "MkEWBc",
          "source-path": "/",
          "f.sid": sid,
          bl,
          hl: "ko",
          "soc-app": 1,
          "soc-platform": 1,
          "soc-device": 1,
          _reqid: Math.floor(10000 + 10000 * Math.random()),
          rt: "c",
        },
        body: new URLSearchParams({ "f.req": req, at }), //
        anonymous: true,
        nocache: true,
      })
      .text();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    var json = JSON.parse(JSON.parse(/\[.*\]/.exec(res))[0][2]);
    var targetText = json[1][0][0][5]
      .map((text) => text?.[0])
      .filter((text) => text)
      .join(" ");

    return {
      targetText,
      detectedLang: json[0][2],
      transliteration: json[1][0][0][1],
    };
  }
}

async function getTokenV2() {
  if (token && token.time + tokenTTL > Date.now()) {
    return token;
  }
  var res = await ky(tokenUrl).text();
  var sid = res.match(/"FdrFJe":"(.*?)"/)[1];
  let bl = res.match(/"cfb2h":"(.*?)"/)[1];
  let at = res.match(/"SNlM0e":"(.*?)"/)?.[1] || "";
  var time = Date.now();
  token = { sid, bl, at, time };
  return token;
}
