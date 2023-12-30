import BaseTTS from "./baseTTS";

export default class GoogleTranslateTTS extends BaseTTS {
  static async playTTSEngine(text, voice, lang, rate, volume) {
    var googleTranslateTtsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${lang}&client=tw-ob`;
    await this.playSound(googleTranslateTtsUrl, rate, volume);
  }
}
