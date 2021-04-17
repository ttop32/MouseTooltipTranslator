'use strict';

//interact user setting,
//save and load setting from background.js

import "typeface-roboto/index.css"; //font for vuetify
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'vuetify/dist/vuetify.min.css'; //vuetify css
import Vue from 'vue'; //vue framework
import Vuetify from 'vuetify'; //vue style


Vue.use(Vuetify);



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
  "On": "true",
  "Off": "false"
};
var keyList = {
  "None": "null",
  "Ctrl": "17",
  "Alt": "18",
  "Shift": "16"
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

var translatorList = {
  "google": "google",
  "bing": "bing"
};

var tooltipFontSizeList = {}; //font size 5 to 20
for (let i = 5; i < 21; i++) {
  tooltipFontSizeList[i] = i;
}


var settingList = {
  "useTooltip": {
    "description": "Enable Tooltip",
    "optionList": toggleList
  },
  "useTTS": {
    "description": "Enable TTS",
    "optionList": toggleList
  },
  "translateSource": {
    "description": "Translate From",
    "optionList": langListWithAuto
  },
  "translateTarget": {
    "description": "Translate Into",
    "optionList": langList
  },
  "translatorVendor": {
    "description": "Translator",
    "optionList": translatorList
  },
  "tooltipFontSize": {
    "description": "Tooltip Font Size",
    "optionList": tooltipFontSizeList
  },
  "keyDownTooltip": {
    "description": "Tooltip Activation Hold Key",
    "optionList": keyList
  },
  "keyDownTTS": {
    "description": "TTS Activation Hold Key",
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
};


var aboutPageList = {
  "extensionSetting": {
    name: "Extension Setting",
    sub_name: chrome.runtime.getManifest().version, //manifest version
    url: "chrome://extensions/?id=hmigninkgibhdckiaphhmbgcghochdjc",
    icon: "mdi-cog"
  },
  "reviewPage": {
    name: "Review Page",
    sub_name: "Comment on this extension",
    url: "https://chrome.google.com/webstore/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
    icon: "mdi-message-draw"
  },
  "sourceCode": {
    name: "Source code",
    sub_name: "Check source code in github",
    url: "https://github.com/ttop32/MouseTooltipTranslator",
    icon: "mdi-github"
  },
  "privacyPolicy": {
    name: "Privacy Policy",
    sub_name: "User privacy policy",
    url: "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/privacy_policy.md",
    icon: "mdi-shield-account"
  },
}



new Vue({
  data: {
    settingList: settingList,
    selectedList: {},
    showAbout: false,
    aboutPageList: aboutPageList,
    currentSetting: {}
  },
  async beforeCreate() {
    //loadSettingFromBackground
    this.currentSetting = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'loadSetting'
      }, response => {
        resolve(response);
      });
    });

    this.loadSelectListFromSetting();
  },
  methods: {
    loadSelectListFromSetting() {
      var result = {}
      //transform currentSetting(name:option_select_id) to selectedList(name:option_select_name)
      for (const [key_option_id, val_selected_id1] of Object.entries(this.currentSetting)) {
        for (const [key_selected_name, val_selected_id2] of Object.entries(settingList[key_option_id]["optionList"])) {
          if (val_selected_id1 == val_selected_id2) {
            result[key_option_id] = key_selected_name;
          }
        }
      }
      this.selectedList = result;
    },
    onSelectChange(event, name) {
      this.currentSetting[name] = settingList[name]["optionList"][event];
      this.changeSetting();
    },
    changeSetting() {
      chrome.runtime.sendMessage({ //save setting from background.js
          type: 'saveSetting',
          options: this.currentSetting
        },
        response => {}
      );
    },
    openUrl(newURL) {
      chrome.tabs.create({
        url: newURL
      });
    },
  },
  el: '#app',
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdi'
    }
  }),
});
