'use strict';

//interact user setting
//save and load setting from background.js



var langList = {
  Afrikaans: "af",
  Albanian: "sq",
  Amharic: "am",
  Arabic: "ar",
  Armenian: "hy",
  Azerbaijani: "az",
  Basque: "eu",
  Belarusian: "be",
  Bengali: "bn",
  Bosnian: "bs",
  Bulgarian: "bg",
  Catalan: "ca",
  Cebuano: "ceb",
  Chichewa: "ny",
  "Chinese Simplified": "zh-cn",
  "Chinese Traditional": "zh-tw",
  Corsican: "co",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dutch: "nl",
  English: "en",
  Esperanto: "eo",
  Estonian: "et",
  Filipino: "tl",
  Finnish: "fi",
  French: "fr",
  Frisian: "fy",
  Galician: "gl",
  Georgian: "ka",
  German: "de",
  Greek: "el",
  Gujarati: "gu",
  "Haitian Creole": "ht",
  Hausa: "ha",
  Hawaiian: "haw",
  Hebrew: "iw",
  Hindi: "hi",
  Hmong: "hmn",
  Hungarian: "hu",
  Icelandic: "is",
  Igbo: "ig",
  Indonesian: "id",
  Irish: "ga",
  Italian: "it",
  Japanese: "ja",
  Javanese: "jw",
  Kannada: "kn",
  Kazakh: "kk",
  Khmer: "km",
  Korean: "ko",
  "Kurdish (Kurmanji)": "ku",
  Kyrgyz: "ky",
  Lao: "lo",
  Latin: "la",
  Latvian: "lv",
  Lithuanian: "lt",
  Luxembourgish: "lb",
  Macedonian: "mk",
  Malagasy: "mg",
  Malay: "ms",
  Malayalam: "ml",
  Maltese: "mt",
  Maori: "mi",
  Marathi: "mr",
  Mongolian: "mn",
  "Myanmar (Burmese)": "my",
  Nepali: "ne",
  Norwegian: "no",
  Pashto: "ps",
  Persian: "fa",
  Polish: "pl",
  Portuguese: "pt",
  Punjabi: "pa",
  Romanian: "ro",
  Russian: "ru",
  Samoan: "sm",
  "Scots Gaelic": "gd",
  Serbian: "sr",
  Sesotho: "st",
  Shona: "sn",
  Sindhi: "sd",
  Sinhala: "si",
  Slovak: "sk",
  Slovenian: "sl",
  Somali: "so",
  Spanish: "es",
  Sundanese: "su",
  Swahili: "sw",
  Swedish: "sv",
  Tajik: "tg",
  Tamil: "ta",
  Telugu: "te",
  Thai: "th",
  Turkish: "tr",
  Ukrainian: "uk",
  Urdu: "ur",
  Uyghur: "ug",
  Uzbek: "uz",
  Vietnamese: "vi",
  Welsh: "cy",
  Xhosa: "xh",
  Yiddish: "yi",
  Yoruba: "yo",
  Zulu: "zu"
};

var langListWithAuto = JSON.parse(JSON.stringify(langList)); //copy lang and add auto
langListWithAuto['Auto'] = "auto";
var toggleList = {
  "On": true,
  "Off": false
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
    "description": "TTS activation hold key",
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
