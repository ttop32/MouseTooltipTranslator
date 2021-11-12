// load setting from chrome storage

import {
  parse
} from 'bcp-47'


var defaultList = {
  "useTooltip": "true",
  "useTTS": "false",
  "translateWhen": "mouseoverselect",
  "translateSource": "auto",
  "translateTarget": parse(navigator.language).language,
  "translatorVendor": "google",
  "keyDownTooltip": "null",
  "keyDownTTS": "null",
  'detectType': 'sentence',
  "translateReverseTarget": "null",
  "tooltipFontSize": "14",
  "tooltipWidth": "200",
  "detectPDF": "true",
  "useOCR": "false",
  "ocrDetectionLang": "jpn_vert",
  "historyList": [],
  "historyRecordActions": [],
}


export function getSettingFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(Object.keys(defaultList), function(loadedSetting) { //load setting
      var currentSetting = {};
      for (var key in defaultList) {
        if (loadedSetting[key]) { //if value exist, load. else load defualt val
          currentSetting[key] = loadedSetting[key];
        } else {
          currentSetting[key] = defaultList[key];
        }
      }
      resolve(currentSetting);
    });
  });
}
