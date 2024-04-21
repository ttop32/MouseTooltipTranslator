import browser from "webextension-polyfill";

import * as util from "/src/util";

export default class BaseTTS {
  static stopTtsTimestamp = 0;

  static async playTTS(text, voice, lang, rate, volume, timestamp) {
    await this.stopTTS(timestamp);
    await this.callTTSEngine(text, voice, lang, rate, volume, timestamp);
  }
  static async callTTSEngine(text, voice, lang, rate, volume, timestamp) {
    if (Number(timestamp) < this.stopTtsTimestamp) {
      return;
    }
    text = util.filterEmoji(text);
    text = util.filterHtmlTag(text);
    volume = Number(volume);
    rate = Number(rate);
    await this.playTTSEngine(text, voice, lang, rate, volume, timestamp);
  }

  static async playTTSEngine(text, voice, lang, rate, volume, timestamp) {
    throw new Error("Not implemented");
  }

  static async stopTTS(timestamp = Date.now()) {
    timestamp = Number(timestamp);
    if (timestamp < this.stopTtsTimestamp) {
      return;
    }
    this.stopTtsTimestamp = timestamp;
    browser?.tts?.stop(); //remove prev voice
    await this.stopTtsOffscreen(timestamp);
  }

  static async playAudioOffscreen(source, rate, volume, timestamp) {
    await util.createOffscreen();
    await util.requestPlayTtsOffscreen(source, rate, volume, timestamp);
  }

  static async stopTtsOffscreen(timestamp) {
    await util.createOffscreen();
    await util.requestStopTtsOffscreen(timestamp);
  }
}
