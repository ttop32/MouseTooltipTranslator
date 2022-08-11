// load setting from chrome storage

import { parse } from "bcp-47";

var defaultList = {
  useTooltip: "true",
  useTTS: "false",
  translateWhen: "mouseoverselect",
  translateSource: "auto",
  translateTarget: getLang(),
  translatorVendor: "google",
  keyDownTooltip: "null",
  keyDownTTS: "null",
  detectType: "sentence",
  translateReverseTarget: "null",
  tooltipFontSize: "14",
  tooltipWidth: "200",
  detectPDF: "true",
  useOCR: "false",
  ocrDetectionLang: "jpn_vert",
  historyList: [],
  historyRecordActions: [],
  langExcludeList: [],
};

var oldKeyConvertList = {
  "17": "ControlLeft",
  "18": "AltLeft",
  "16": "ShiftLeft",
  "91": "MetaLeft",
};

// automatic setting update class
export class Setting {
  constructor() {
    this.data = {};
  }

  static async create(settingUpdateCallback = () => {}) {
    const o = new Setting();
    await o.initialize(settingUpdateCallback);
    return o;
  }

  async initialize(settingUpdateCallback) {
    this.data = await getSettingFromStorage();
    this.checkOldSettingData();
    this.initSettingListener(settingUpdateCallback);
  }

  initSettingListener(settingUpdateCallback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (var key in changes) {
        this.data[key] = changes[key].newValue;
      }
      settingUpdateCallback();
    });
  }

  save(inputSettings) {
    chrome.storage.local.set(inputSettings, () => {
      this.data = inputSettings;
    });
  }

  checkOldSettingData() {
    for (const keyDownOption in ["keyDownTooltip", "keyDownTTS"]) {
      if (oldKeyConvertList.hasOwnProperty(this.data[keyDownOption])) {
        this.data[keyDownOption] = oldKeyConvertList[this.data[keyDownOption]];
        this.save(this.data);
      }
    }
  }
}

//load setting
//if value exist, load. else load default val
export function getSettingFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Object.keys(defaultList), function(loadedSetting) {
      var currentSetting = {};
      for (var key in defaultList) {
        currentSetting[key] = loadedSetting[key]
          ? loadedSetting[key]
          : defaultList[key];
      }
      resolve(currentSetting);
    });
  });
}

function getLang() {
  var lang = parse(navigator.language).language;
  lang = lang == "zh" ? navigator.language : lang; // chinese lang code fix
  return lang;
}
