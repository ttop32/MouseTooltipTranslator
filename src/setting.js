// load setting from chrome storage

import {parse} from 'bcp-47'


var defaultList = {
  "useTooltip": "true",
  "useTTS": "false",
  "translateWhen":"mouseoverselect",
  "translateSource": "auto",
  "translateTarget": parse(navigator.language).language,
  "translatorVendor": "google",
  "keyDownTooltip": "null",
  "keyDownTTS": "null",
  'detectType': 'sentence',
  "translateReverseTarget": "null",
  "tooltipFontSize": "14",
  "tooltipWidth": "200",
  "useOCR": "false",
  "ocrDetectionLang": "jpn_vert",
  "historyList": [],
  "historyRecordActions": [],
}


export function getSettingFromStorage(currentSetting) {
  return new Promise((resolve, reject) => {
    if (Object.keys(currentSetting).length != Object.keys(defaultList).length) {
      chrome.storage.local.get(Object.keys(defaultList), function(options) { //load setting
        for (var key in defaultList) {
          if (options[key]) { //if value exist, load. else load defualt val
            currentSetting[key] = options[key];
          } else {
            currentSetting[key] = defaultList[key];
          }
        }
        resolve(currentSetting);
      });
    } else {
      resolve(currentSetting);
    }
  });
}
