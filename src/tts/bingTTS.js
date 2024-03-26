import ky from "ky";
import bing from "/src/translator/bing";
import BaseTTS from "./baseTTS";

import * as util from "/src/util";

let bingTtsUrl = "https://www.bing.com/tfettts";

export default class BingTTS extends BaseTTS {
  static async playTTSEngine(text, voice, lang, rate, volume, timestamp) {
    var ttsBlob = await this.requestBingTtsBlob(text, voice, rate, volume);
    var base64Url = await util.getBase64Url(ttsBlob);
    await this.playAudioOffscreen(base64Url, 1, volume, timestamp);
  }

  static async requestBingTtsBlob(
    text,
    voice = "en-US-AriaNeural",
    rate,
    volume
  ) {
    const { token, key, IG, IID } = await bing.getBingAccessToken();
    // `<prosody pitch='+${pitch}Hz' rate ='+${rate}%' volume='+${volume}%'></prosody>`
    //  <voice xml:lang='en-US' xml:gender='Female' name='en-US-AriaNeural'></voice>
    var voiceSplit = voice.split("-");
    voiceSplit = voiceSplit.slice(0, -1);
    var locale = voiceSplit.join("-");
    var rate100 = rate * 100 - 100;

    return await ky
      .post(bingTtsUrl, {
        searchParams: {
          IG,
          IID:
            IID && IID.length ? IID + "." + bing.bingAccessToken.count++ : "",
          isVertical: "1",
        },
        body: new URLSearchParams({
          ssml: `<speak version='1.0' xml:lang='${locale}'><voice name='${voice}'><prosody rate='${rate100}%'>${text}</prosody></voice></speak>`,
          token,
          key,
        }),
      })
      .blob();
  }
}
