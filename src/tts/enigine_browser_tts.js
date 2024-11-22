import browser from "webextension-polyfill";
import EngineTTS from "./engine_base.js";

export default class BrowserTTS extends EngineTTS {
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
