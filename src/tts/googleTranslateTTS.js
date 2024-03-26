import BaseTTS from "./baseTTS";

export default class GoogleTranslateTTS extends BaseTTS {
  static async playTTSEngine(text, voice, lang, rate, volume, timestamp) {
    var textList = this.splitText(text, lang);
    for (const sentence of textList) {
      await this.playTTSByGoogle(
        sentence,
        voice,
        lang,
        rate,
        volume,
        timestamp
      );
    }
  }
  static async playTTSByGoogle(text, voice, lang, rate, volume, timestamp) {
    var googleTranslateTtsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${lang}&client=tw-ob`;
    await this.playAudioOffscreen(
      googleTranslateTtsUrl,
      rate,
      volume,
      timestamp
    );
  }

  static splitText(text, lang) {
    var segmenter = new Intl.Segmenter(lang, { granularity: "sentence" });
    var wordsMeta = [...segmenter.segment(text)];
    var wordList = wordsMeta.map((word) => word.segment);
    return wordList;
  }
}
