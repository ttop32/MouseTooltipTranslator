import * as util from "/src/util";
import EngineTTS from "./engine_base.js";

export default class SpeechTTS extends EngineTTS {
  static async playTTSEngine(text, voice, lang, rate, volume, timestamp) {
    await util.requestMdfTtsOffscreen(text, voice, lang, rate, volume, timestamp );
  }
}
