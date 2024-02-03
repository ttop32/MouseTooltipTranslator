import browser from "webextension-polyfill";

import BaseTTS from "./baseTTS";

export default class BrowserTTS extends BaseTTS {
  static async playTTSEngine(text, voice, lang, rate, volume) {
    return new Promise((resolve, reject) => {
      browser?.tts?.speak(text, {
        lang,
        voiceName: voice,
        volume,
        rate,
        onEvent: (event) => {
          if (
            ["end", "interrupted", "cancelled", "error"].includes(event.type)
          ) {
            resolve();
          }
        },
      });
    });
  }
}
