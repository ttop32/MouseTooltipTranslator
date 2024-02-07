import ky from "ky";
import BaseTranslator from "./baseTranslator";

var tokenUrl = "https://translate.google.com";
var newGoogleUrl =
  "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute";
var token;
var tokenTTL = 60 * 60 * 1000; //1hour

var modelUrl = "https://chat.openai.com/backend-api/models";
var conversationUrl = "https://chat.openai.com/backend-api/conversation";

export default class googleV2 extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    var a = {
      action: "next",
      messages: [
        {
          id: "86115b08-73c8-4d05-8c0b-9f9e85f0839e",
          author: { role: "user" },
          content: {
            content_type: "text",
            parts: [
              "Translate the following into Korean and only show me the translated content:\n'''\nGennadiy Golovkin's posts ; Shavkat “Nomad” Rakhmonov · @Rakhmonov1994 · Sep 10, 2023 · Image. 71 ; DAZN Boxing · @DAZNBoxing · Sep 18, 2022 · Image · 153 ; Fred ...\n'''",
            ],
          },
        },
      ],
      conversation_mode: { kind: "primary_assistant" },
      force_paragen: false,
      force_rate_limit: false,
      suggestions: [],
      model: "text-davinci-002-render-sha",
      parent_message_id: "a600c49d-f99e-49ee-8538-47669c10e849",
      timezone_offset_min: -540,
      history_and_training_disabled: true,
      arkose_token: null,
    };

    return await ky
      .post(newGoogleUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({ "f.req": req, at }), //
        anonymous: true,
        nocache: true,
      })
      .text();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    return {
      translatedText,
      detectedLang: json[0][2],
      transliteration: json[1][0][0][1],
    };
  }
}
