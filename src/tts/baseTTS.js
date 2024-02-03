import browser from "webextension-polyfill";

import * as util from "/src/util";

export default class BaseTTS {
  static async playTTS(text, voice, lang, rate, volume) {
    try {
      var volume = Number(volume);
      var rate = Number(rate);
      await this.playTTSEngine(text, voice, lang, rate, volume);
    } catch (error) {
      console.log(error);
    }
  }

  static async playTTSEngine(text, voice, lang, rate, volume) {
    throw new Error("Not implemented");
  }

  static stopTTS() {
    browser?.tts?.stop(); //remove prev voice
    this.stopTtsOffscreen();
  }

  static async playSound(source, rate, volume) {
    await this.createOffscreen();
    await util.sendMessage({
      type: "playAudioOffscreen",
      data: {
        source,
        rate,
        volume,
      },
    });
  }

  static async stopTtsOffscreen() {
    await this.createOffscreen();
    util.sendMessage({ type: "stopTTSOffscreen" });
  }

  // Create the offscreen document
  static async createOffscreen() {
    try {
      await browser?.offscreen?.createDocument({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "play tts", // details for using the API
      });
    } catch (error) {
      if (!error.message.startsWith("Only a single offscreen")) throw error;
    }
  }

  static async removeOffscreen() {
    return new Promise((resolve, reject) => {
      browser.offscreen.closeDocument(() => resolve());
    });
  }
}
