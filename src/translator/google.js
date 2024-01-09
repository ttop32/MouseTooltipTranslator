import BaseTranslator from "./baseTranslator";
import { decode } from "he";
import ky from "ky";

const googleTranslateTKK = "448487.932609646";
const apiPath = "https://translate.googleapis.com/translate_a/t";

var tokenUrl = "https://translate.google.com";
var newGoogleUrl =
  "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute";
var token;
var tokenTTL = 60 * 60 * 1000; //1hour

export default class google extends BaseTranslator {
  static async requestTranslate(text, fromLang, targetLang) {
    // code brought from https://github.com/translate-tools/core/blob/master/src/translators/GoogleTranslator/token.js
    var tk = getToken(text, googleTranslateTKK);
    return await ky(apiPath, {
      searchParams: {
        client: "te_lib",
        sl: fromLang,
        tl: targetLang,
        hl: targetLang,
        anno: 3,
        format: "html",
        v: 1.0,
        tc: 1,
        sr: 1,
        mode: 1,
        q: text,
        tk,
      },
    }).json();
  }
  static wrapResponse(res, fromLang, targetLang) {
    if (res && res[0] && res[0][0]) {
      var translatedText = fromLang == "auto" ? res[0][0] : res[0];
      var detectedLang = fromLang == "auto" ? res[0][1] : fromLang;
      //clear html tag and decode html entity
      var textDecoded = decode(translatedText);
      var textWithoutITag = textDecoded.replace(/(<i>).+?(<\/i>)/gi, " ");
      var textWithoutBTag = textWithoutITag.replace(/<\/?b[^>]*>/g, " ");
      var textWithTrim = textWithoutBTag.replace(/\s\s+/g, " ").trim();
      return {
        translatedText: textWithTrim,
        detectedLang,
        transliteration: "",
      };
    }
  }
}

function shiftLeftOrRightThenSumOrXor(num, optString) {
  for (let i = 0; i < optString.length - 2; i += 3) {
    let acc = optString.charAt(i + 2);
    if ("a" <= acc) {
      acc = acc.charCodeAt(0) - 87;
    } else {
      acc = Number(acc);
    }
    if (optString.charAt(i + 1) == "+") {
      acc = num >>> acc;
    } else {
      acc = num << acc;
    }
    if (optString.charAt(i) == "+") {
      num += acc & 4294967295;
    } else {
      num ^= acc;
    }
  }
  return num;
}

function transformQuery(query) {
  const bytesArray = [];
  let idx = [];
  for (let i = 0; i < query.length; i++) {
    let charCode = query.charCodeAt(i);

    if (128 > charCode) {
      bytesArray[idx++] = charCode;
    } else {
      if (2048 > charCode) {
        bytesArray[idx++] = (charCode >> 6) | 192;
      } else {
        if (
          55296 == (charCode & 64512) &&
          i + 1 < query.length &&
          56320 == (query.charCodeAt(i + 1) & 64512)
        ) {
          charCode =
            65536 + ((charCode & 1023) << 10) + (query.charCodeAt(++i) & 1023);
          bytesArray[idx++] = (charCode >> 18) | 240;
          bytesArray[idx++] = ((charCode >> 12) & 63) | 128;
        } else {
          bytesArray[idx++] = (charCode >> 12) | 224;
        }
        bytesArray[idx++] = ((charCode >> 6) & 63) | 128;
      }
      bytesArray[idx++] = (charCode & 63) | 128;
    }
  }
  return bytesArray;
}

function getToken(query, windowTkk) {
  const tkkSplited = windowTkk.split(".");
  const tkkIndex = Number(tkkSplited[0]) || 0;
  const tkkKey = Number(tkkSplited[1]) || 0;

  const bytesArray = transformQuery(query);

  let encondingRound = tkkIndex;
  for (let i = 0; i < bytesArray.length; i++) {
    encondingRound += bytesArray[i];
    encondingRound = shiftLeftOrRightThenSumOrXor(encondingRound, "+-a^+6");
  }
  encondingRound = shiftLeftOrRightThenSumOrXor(encondingRound, "+-3^+b+-f");

  encondingRound ^= tkkKey;
  if (encondingRound <= 0) {
    encondingRound = (encondingRound & 2147483647) + 2147483648;
  }

  const normalizedResult = encondingRound % 1000000;
  return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex);
}

async function googleTranslateRequestV2(text, fromLang, targetLang) {
  var { sid, bl, at } = await getTokenV2();

  let req = JSON.stringify([
    [
      [
        "MkEWBc",
        JSON.stringify([[text, fromLang, targetLang, true], [null]]),
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
function googleTranslateRequestWrapV2(res) {
  var json = JSON.parse(JSON.parse(/\[.*\]/.exec(res))[0][2]);
  var translatedText = json[1][0][0][5]
    .map((text) => text?.[0])
    .filter((text) => text)
    .join(" ");

  return {
    translatedText,
    detectedLang: json[0][2],
    transliteration: json[1][0][0][1],
  };
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
