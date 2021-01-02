'use strict';

//interact user setting
//save and load setting from background.js

import './popup.css';

var langList = {
  'afrikaans': 'af',
  'albanian': 'sq',
  'amharic': 'am',
  'arabic': 'ar',
  'armenian': 'hy',
  'azerbaijani': 'az',
  'basque': 'eu',
  'belarusian': 'be',
  'bengali': 'bn',
  'bosnian': 'bs',
  'bulgarian': 'bg',
  'catalan': 'ca',
  'cebuano': 'ceb',
  'chichewa': 'ny',
  'chinese (simplified)': 'zh-cn',
  'chinese (traditional)': 'zh-tw',
  'corsican': 'co',
  'croatian': 'hr',
  'czech': 'cs',
  'danish': 'da',
  'dutch': 'nl',
  'english': 'en',
  'esperanto': 'eo',
  'estonian': 'et',
  'filipino': 'tl',
  'finnish': 'fi',
  'french': 'fr',
  'frisian': 'fy',
  'galician': 'gl',
  'georgian': 'ka',
  'german': 'de',
  'greek': 'el',
  'gujarati': 'gu',
  'haitian creole': 'ht',
  'hausa': 'ha',
  'hawaiian': 'haw',
  'hebrew': 'iw',
  'hindi': 'hi',
  'hmong': 'hmn',
  'hungarian': 'hu',
  'icelandic': 'is',
  'igbo': 'ig',
  'indonesian': 'id',
  'irish': 'ga',
  'italian': 'it',
  'japanese': 'ja',
  'javanese': 'jw',
  'kannada': 'kn',
  'kazakh': 'kk',
  'khmer': 'km',
  'korean': 'ko',
  'kurdish (kurmanji)': 'ku',
  'kyrgyz': 'ky',
  'lao': 'lo',
  'latin': 'la',
  'latvian': 'lv',
  'lithuanian': 'lt',
  'luxembourgish': 'lb',
  'macedonian': 'mk',
  'malagasy': 'mg',
  'malay': 'ms',
  'malayalam': 'ml',
  'maltese': 'mt',
  'maori': 'mi',
  'marathi': 'mr',
  'mongolian': 'mn',
  'myanmar (burmese)': 'my',
  'nepali': 'ne',
  'norwegian': 'no',
  'pashto': 'ps',
  'persian': 'fa',
  'polish': 'pl',
  'portuguese': 'pt',
  'punjabi': 'pa',
  'romanian': 'ro',
  'russian': 'ru',
  'samoan': 'sm',
  'scots gaelic': 'gd',
  'serbian': 'sr',
  'sesotho': 'st',
  'shona': 'sn',
  'sindhi': 'sd',
  'sinhala': 'si',
  'slovak': 'sk',
  'slovenian': 'sl',
  'somali': 'so',
  'spanish': 'es',
  'sundanese': 'su',
  'swahili': 'sw',
  'swedish': 'sv',
  'tajik': 'tg',
  'tamil': 'ta',
  'telugu': 'te',
  'thai': 'th',
  'turkish': 'tr',
  'ukrainian': 'uk',
  'urdu': 'ur',
  'uzbek': 'uz',
  'vietnamese': 'vi',
  'welsh': 'cy',
  'xhosa': 'xh',
  'yiddish': 'yi',
  'yoruba': 'yo',
  'zulu': 'zu'
};
var langListWithAuto = JSON.parse(JSON.stringify(langList)); //copy lang and add auto
langListWithAuto['Auto'] = "auto";
var toggleList = {
  "on": true,
  "off": false
};
var keyList = {
  "None": null,
  "Ctrl": 17,
  "Alt": 18,
  "Shift": 16
};
var settingList = {
  "useTooltip": {
    "description": "Enable tooltip",
    "optionList": toggleList
  },
  "useTTS": {
    "description": "Enable tts",
    "optionList": toggleList
  },
  "translateSource": {
    "description": "Translate from",
    "optionList": langListWithAuto
  },
  "translateTarget": {
    "description": "Translate to",
    "optionList": langList
  },
  "keyDownTooltip": {
    "description": "Tooltip activation hold key",
    "optionList": keyList
  },
  "keyDownTTS": {
    "description": "tts activation hold key",
    "optionList": keyList
  }
}
var selectedList = {};





function loadSettingHtml() {
  //create optionlist
  var settingHtml = ""
  for (var settingListKey in settingList) {
    settingHtml += '<li class="list-group-item">' + settingList[settingListKey]["description"] + '<select id="' + settingListKey + '">';
    for (var optionListKey in settingList[settingListKey]["optionList"]) {
      settingHtml += '<option value="' + settingList[settingListKey]["optionList"][optionListKey] + '">' + optionListKey + '</option>'
    }
    settingHtml += '</select></li>'
  }
  var container = document.getElementById('container');
  container.innerHTML = container.innerHTML + settingHtml;


  //set selected value and change listner
  for (var settingListKey in settingList) {
    var setting = document.getElementById(settingListKey);
    setting.value = selectedList[settingListKey];
    setting.addEventListener("change", changeSetting);
  }
}

function changeSetting() {
  for (var settingListKey in settingList) {
    selectedList[settingListKey] = document.getElementById(settingListKey).value;
  }
  saveSetting();
}

//load setting from chrome storage
//then, load setting html
document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({
      type: 'loadSetting'
    },
    response => {
      selectedList = response;
      loadSettingHtml();
    }
  );
});

function saveSetting() {
  chrome.runtime.sendMessage({
      type: 'saveSetting',
      options: selectedList
    },
    response => {}
  );
}
