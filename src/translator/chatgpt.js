import ky from "ky";
import BaseTranslator from "./baseTranslator";
import { v4 as uuidv4 } from "uuid";

var authUrl = "https://chat.openai.com/api/auth/session";
var modelUrl = "https://chat.openai.com/backend-api/models";
var conversationUrl = "https://chat.openai.com/backend-api/conversation";

export default class chatgpt extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    var { accessToken, expires } = await getToken();

    var parentMessageId = uuidv4();
    var id = uuidv4();

    console.log(accessToken, parentMessageId, id);
    return await ky.post(conversationUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
        Accept: " text/event-stream",
      },
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id,
            role: "user",
            content: { content_type: "text", parts: ["Who are you?"] },
          },
        ],
        conversation_id: null,
        parentMessageId,
        model: "text-davinci-002-render",
      }),
    });
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    console.log(res);
    return {
      translatedText: "",
      detectedLang: "",
      transliteration: "",
    };
  }
}

async function getToken() {
  var res = await ky.get(authUrl).json();
  return res;
}
