import ky from "ky";
import BaseTranslator from "./baseTranslator";
import { v4 as uuidv4 } from "uuid";

var authUrl = "https://chat.openai.com/api/auth/session";
var modelUrl = "https://chat.openai.com/backend-api/models";
var conversationUrl = "https://chat.openai.com/backend-api/conversation";
var parent_message_id = uuidv4();
let abortController = new AbortController();

var token;
var accessTokenExpires;
//https://aletheia.medium.com/demystifing-chatgpt-c9ab468ccc84
// https://getstream.io/blog/build-a-chat-app-with-openai-chatgpt/

export default class chatgpt extends BaseTranslator {
  static async requestTranslate(text, sourceLang, targetLang) {
    // abortController.abort();
    // abortController = new AbortController();
    var chatToken = await getToken();
    var text = "Who are you?";

    return await ky
      .post(conversationUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatToken}`,
          Accept: " text/event-stream",
        },
        body: JSON.stringify({
          action: "next",
          messages: [
            {
              id: uuidv4(),
              role: "user",
              content: { content_type: "text", parts: [text] },
            },
          ],
          conversation_id: undefined,
          parent_message_id,
          model: "text-davinci-002-render",
        }),
        // signal: abortController.signal,
      })
      .text();
  }
  static async wrapResponse(res, text, sourceLang, targetLang) {
    const dataChunks = res.split("data:");
    const responseObjectText = dataChunks[dataChunks.length - 2].trim();
    const responseObject = JSON.parse(responseObjectText);
    var targetText = responseObject.message.content.parts.join(" ");
    var conversation_id = responseObject.conversation_id;
    await deleteConversation(conversation_id);

    console.log(responseObject);
    console.log(conversation_id);

    return {
      targetText,
      detectedLang: "",
      transliteration: "",
    };
  }
}

async function getToken() {
  if (Date.parse(accessTokenExpires) > Date.now()) {
    return token;
  }
  var { accessToken, expires } = await ky.get(authUrl).json();
  token = accessToken;
  accessTokenExpires = expires;
  return token;
}

async function deleteConversation(conversation_id) {
  const chatToken = await getToken();
  return await ky
    .patch(
      `https://chat.openai.com/backend-api/conversation/${conversation_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${chatToken}`,
        },
        body: JSON.stringify({ is_visible: false }),
      }
    )
    .json();
}
