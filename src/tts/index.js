import browser from "webextension-polyfill";
import * as util from "/src/util";

import TextUtil from "/src/util/text_util.js";
import tts_engine from "/src/tts/tts_engine.js";

export default class TTS {
  static stopTtsTimestamp = 0;
  static noInterrupt = false;

  static async playTtsQueue({
    sourceText,
    sourceLang,
    targetText,
    targetLang,
    voiceTarget,
    voiceRepeat,
    timestamp,
    noInterrupt,
    setting,
  }) {
    this.noInterrupt = noInterrupt;
    var ttsTarget = voiceTarget || setting["voiceTarget"];
    var ttsRepeat = voiceRepeat || setting["voiceRepeat"];

    for (var i = 0; i < Number(ttsRepeat); i++) {
      if (ttsTarget == "source") {
        await this.playTts(sourceText, sourceLang, timestamp, setting);
      } else if (ttsTarget == "target") {
        await this.playTts(targetText, targetLang, timestamp, setting);
      } else if (ttsTarget == "sourcetarget") {
        await this.playTts(sourceText, sourceLang, timestamp, setting);
        await this.playTts(targetText, targetLang, timestamp, setting);
      } else if (ttsTarget == "targetsource") {
        await this.playTts(targetText, targetLang, timestamp, setting);
        await this.playTts(sourceText, sourceLang, timestamp, setting);
      }
    }
  }

  static async playTts(text, lang, timestamp, setting) {
    await this.stopTTS(timestamp);
    if (Number(timestamp) < this.stopTtsTimestamp) {
      return;
    }
    text = TextUtil.filterSpeechText(text);
    if (!text) {
      return;
    }
    var volume = Number(setting["voiceVolume"]);
    var rate = Number(setting["voiceRate"]);
    var voiceFullName = setting?.["ttsVoice_" + lang];
    var isExternalTts = /^(BingTTS|GoogleTranslateTTS).*/.test(voiceFullName);
    var voice = isExternalTts ? voiceFullName.split("_")[1] : voiceFullName;
    var engine = isExternalTts ? voiceFullName.split("_")[0] : "BrowserTTS";
    
    await tts_engine[engine].playTTSEngine(
      text,
      voice,
      lang,
      rate,
      volume,
      timestamp
    );
  }

  static async stopTTS(timestamp = Date.now(), force = false) {
    if (this.noInterrupt && !force) {
      return;
    }

    timestamp = Number(timestamp);
    if (timestamp < this.stopTtsTimestamp) {
      return;
    }
    this.stopTtsTimestamp = timestamp;
    browser?.tts?.stop(); //remove prev voice
    await util.requestStopTtsOffscreen(timestamp);
  }
}
