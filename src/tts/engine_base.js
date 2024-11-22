
import * as util from "/src/util";

export default class EngineTTS {
  static async playTTSEngine(text, voice, lang, rate, volume, timestamp) {
    throw new Error("Not implemented");
  }

  static async playAudioOffscreen(source, rate, volume, timestamp) {
    await util.requestPlayTtsOffscreen(source, rate, volume, timestamp);
  }
}
