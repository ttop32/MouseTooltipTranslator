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
};

//load setting
//if value exist, load. else load default val
export function getSettingFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Object.keys(defaultList), function(loadedSetting) {
      var currentSetting = {};
      for (var key in defaultList) {
        if (loadedSetting[key]) {
          currentSetting[key] = loadedSetting[key];
        } else {
          currentSetting[key] = defaultList[key];
        }
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
