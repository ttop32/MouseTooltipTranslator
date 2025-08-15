import { Setting } from "./setting.js";
import { defaultData } from "./setting_default.js";
import { parse } from "bcp-47";

import {
  bingTtsVoiceList,
  googleTranslateTtsLangList,
} from "/src/util/lang.js";
import TextUtil from "/src/util/text_util.js";
var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}

// import SettingUtil from "/src/util/setting_util.js";

export default class SettingUtil {
  static async loadSetting(settingUpdateCallbackFn) {
    const settingDefault = await this.getDefaultDataAll();
    return Setting.loadSetting(settingDefault, settingUpdateCallbackFn);
  }

  static async getDefaultDataAll() {
    let defaultList = TextUtil.concatJson({}, defaultData);
    defaultList["translateTarget"] = this.getDefaultLang();
    defaultList = TextUtil.concatJson(
      defaultList,
      await this.getDefaultVoice()
    );
    return defaultList;
  }

  static getDefaultLang() {
    return this.parseLocaleLang(navigator.language);
  }

  static parseLocaleLang(localeLang) {
    const langCovert = {
      zh: "zh-CN",
      he: "iw",
      fil: "tl",
    };
    let lang = parse(localeLang).language;
    lang = langCovert[lang] || lang;
    return localeLang === "zh-TW" ? "zh-TW" : lang;
  }

  static async getDefaultVoice() {
    const defaultVoice = {};
    const voiceList = await this.getAllVoiceList();
    for (const key in voiceList) {
      defaultVoice[`ttsVoice_${key}`] = voiceList[key][0];
    }
    return defaultVoice;
  }

  static async getAllVoiceList() {
    const browserVoices = await this.getBrowserTtsVoiceList();
    const bingVoices = this.getBingTtsVoiceList();
    const googleTranslateVoices = this.getGoogleTranslateTtsVoiceList();
    let voiceList = this.concatVoice(browserVoices, bingVoices);
    voiceList = this.concatVoice(voiceList, googleTranslateVoices);
    return TextUtil.sortJsonByKey(voiceList);
  }

  static getBrowserTtsVoiceList() {
    return new Promise(async (resolve) => {
      const voiceList = {};
      try {
        const voices = await browser?.tts?.getVoices();
        const filtered = voices?.filter(
            (e) => e.remote != null && e.lang != null && e.voiceName != null
          )
          .sort((x, y) => y.remote - x.remote);
        if (!filtered) {
          console.log("No browser tts voice");
          resolve(voiceList);
          return;
        }
        for (const item of filtered) {
          const lang = this.parseLocaleLang(item.lang);
          voiceList[lang] = voiceList[lang] || [];
          voiceList[lang].push(item.voiceName);
        }
      } catch (err) {
        console.log(err);
      }
      resolve(voiceList);
    });
  }

  static getBingTtsVoiceList() {
    const bingTaggedVoiceList = {};
    for (const key in bingTtsVoiceList) {
      const voiceList = bingTtsVoiceList[key].map(
        (voiceName) => `BingTTS_${voiceName}`
      );
      bingTaggedVoiceList[key] = voiceList;
    }
    return bingTaggedVoiceList;
  }

  static getGoogleTranslateTtsVoiceList() {
    const voiceList = {};
    for (const lang of googleTranslateTtsLangList) {
      voiceList[lang] = [`GoogleTranslateTTS_${lang}`];
    }
    return voiceList;
  }

  static concatVoice(voiceList1, voiceList2) {
    const voiceNewList = { ...voiceList1 };
    for (const key in voiceList2) {
      voiceNewList[key] = voiceNewList[key]
        ? voiceNewList[key].concat(voiceList2[key])
        : voiceList2[key];
    }
    return voiceNewList;
  }

  static async getSpeechTTSVoiceList() {
    if (this.isBacgroundServiceWorker()) {
      return {};
    }
    const voiceList = {};
    const voices = await this.getSpeechVoices();
    const filtered = voices
      .filter((i) => i.lang && i.name)
      .sort((x, y) => y.localService - x.localService);
    for (const item of filtered) {
      const lang = this.parseLocaleLang(item.lang);
      voiceList[lang] = voiceList[lang] || [];
      voiceList[lang].push(item.name);
    }
    return voiceList;
  }

  static getSpeechVoices() {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length !== 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        });
      }
    });
  }

  static isBacgroundServiceWorker() {
    try {
      return !document;
    } catch (error) {
      return true;
    }
  }

  static async resetSetting() {
    const resetSetting = await this.loadSetting();
    await resetSetting.clear();
    resetSetting.save();
    const settingInstance = await this.loadSetting();
    settingInstance.save();
    return settingInstance;
  }

  static async importSetting(settingData) {
    const settingInstance = await this.loadSetting();
    settingInstance.loadData(settingData);
    settingInstance.save();
    return settingInstance;
  }

  static async exportSetting() {
    const settingInstance = await this.loadSetting();
    const settingData = JSON.parse(JSON.stringify(settingInstance));
    return settingData;
  }

}
