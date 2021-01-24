'use strict';

//interact user setting, //save and load setting from background.js

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

var ocrLangList = {
  'Afrikaans': 'afr',
  'Albanian': 'sqi',
  'Amharic': 'amh',
  'Arabic': 'ara',
  'Armenian': 'hye',
  'Azerbaijani': 'aze',
  'Basque': 'eus',
  'Belarusian': 'bel',
  'Bengali': 'ben',
  'Bosnian': 'bos',
  'Bulgarian': 'bul',
  'Burmese': 'mya',
  'Catalan': 'cat',
  'Cebuano': 'ceb',
  'Chinese Simplified': 'chi_sim',
  'Chinese Simplified (vertical)': 'chi_sim_vert',
  'Chinese Traditional': 'chi_tra',
  'Chinese Traditional (vertical)': 'chi_tra_vert',
  'Corsican': 'cos',
  'Croatian': 'hrv',
  'Czech': 'ces',
  'Danish': 'dan',
  'Dutch': 'nld',
  'English': 'eng',
  'Esperanto': 'epo',
  'Estonian': 'est',
  'Filipino': 'fil',
  'Finnish': 'fin',
  'French': 'fra',
  'Frisian': 'fry',
  'Galician': 'glg',
  'Georgian': 'kat',
  'German': 'deu',
  'Greek': 'ell',
  'Gujarati': 'guj',
  'Haitian': 'hat',
  'Hebrew': 'heb',
  'Hindi': 'hin',
  'Hungarian': 'hun',
  'Icelandic': 'isl',
  'Indonesian': 'ind',
  'Irish': 'gle',
  'Italian': 'ita',
  'Japanese': 'jpn',
  'Japanese (vertical)': 'jpn_vert',
  'Javanese': 'jav',
  'Kannada': 'kan',
  'Kazakh': 'kaz',
  'Khmer': 'khm',
  'Korean': 'kor',
  'Korean (vertical)': 'kor_vert',
  'Kurdish': 'kmr',
  'Lao': 'lao',
  'Latin': 'lat',
  'Latvian': 'lav',
  'Lithuanian': 'lit',
  'Luxembourgish': 'ltz',
  'Macedonian': 'mkd',
  'Malay': 'msa',
  'Malayalam': 'mal',
  'Maltese': 'mlt',
  'Maori': 'mri',
  'Marathi': 'mar',
  'Mongolian': 'mon',
  'Nepali': 'nep',
  'Norwegian': 'nor',
  'Persian': 'fas',
  'Polish': 'pol',
  'Portuguese': 'por',
  'Romanian': 'ron',
  'Russian': 'rus',
  'Scottish Gaelic': 'gla',
  'Serbian': 'srp',
  'Sindhi': 'snd',
  'Sinhala': 'sin',
  'Slovak': 'slk',
  'Slovenian': 'slv',
  'Spanish': 'spa',
  'Sundanese': 'sun',
  'Swahili': 'swa',
  'Swedish': 'swe',
  'Tajik': 'tgk',
  'Tamil': 'tam',
  'Telugu': 'tel',
  'Thai': 'tha',
  'Turkish': 'tur',
  'Ukrainian': 'ukr',
  'Urdu': 'urd',
  'Uzbek': 'uzb',
  'Vietnamese': 'vie',
  'Welsh': 'cym',
  'Yiddish': 'yid',
  'Yoruba': 'yor'
};


var settingList = {
  "useTooltip": {
    "description": "Enable tooltip",
    "optionList": toggleList
  },
  "useTTS": {
    "description": "Enable TTS",
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
  },
  "useOCR": {
    "description": "Enable OCR (Experimental)",
    "optionList": toggleList
  },
  "ocrDetectionLang": {
    "description": "OCR Detection Language",
    "optionList": ocrLangList
  }
}
var currentSetting;

//load setting from chrome storage
//then, load setting html
document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({
      type: 'loadSetting'
    },
    response => {
      currentSetting = response;
      loadSettingHtml();
    }
  );
});

function loadSettingHtml() {
  //create optionlist
  var settingHtml = ""
  for (var settingListKey in settingList) {
    settingHtml += '<li class="list-group-item list-group-item-action">' + settingList[settingListKey]["description"] + '<select id="' + settingListKey + '">';
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
    setting.value = currentSetting[settingListKey]; //set current selected item
    setting.addEventListener("change", changeSetting); //set value change listner
  }
}

function changeSetting() {
  for (var settingListKey in settingList) { //get all selected list
    currentSetting[settingListKey] = document.getElementById(settingListKey).value;
  }

  chrome.runtime.sendMessage({ //save setting from background.js
      type: 'saveSetting',
      options: currentSetting
    },
    response => {}
  );
}
