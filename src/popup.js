'use strict';

//interact user setting,
//save and load setting from background.js

import "typeface-roboto/index.css"; //font for vuetify
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
  new Vue({
    render() {
      var selectList = [];
      var thisVue = this;
      Object.keys(this.settingList).forEach(key => {
        // console.log(this.selectedList[key]);
        var changeFunc = function(event) {
          thisVue.onChange(event, key)
        };
        selectList.push(
          <v-list-item>
          <v-select items={Object.keys(this.settingList[key].optionList)} label={this.settingList[key].description}  vModel={this.selectedList[key]} vOn:change={changeFunc}> </v-select>
          </v-list-item>
        );
      });

      return (
        <v-app>
          <v-card tile flat>
            <v-toolbar color="blue" dark dense>
              <v-toolbar-title>
                Mouse Tooltip Translator
              </v-toolbar-title>
            </v-toolbar>
            <v-list flat>
              {selectList}
            </v-list>
          </v-card>
        </v-app>
      );
    },
    vuetify: new Vuetify({
      icons: {
        iconfont: 'mdiSvg'
      }
    }),
    data: {
      settingList: settingList,
      selectedList: getVueSelectList()
    },
    methods: {
      onChange: function(event, name) {
        currentSetting[name] = settingList[name]["optionList"][event];
        changeSetting();
      }
    }
  }).$mount('#app');
}

function getVueSelectList() { //get selected option key dictionary by value
  var result = {}
  Object.keys(currentSetting).forEach(function(key) {
    Object.keys(settingList[key]["optionList"]).forEach(function(selectKey) {
      if (settingList[key]["optionList"][selectKey] == currentSetting[key]) {
        result[key] = selectKey;
      }
    });
  });
  return result;
}

function changeSetting() {
  chrome.runtime.sendMessage({ //save setting from background.js
      type: 'saveSetting',
      options: currentSetting
    },
    response => {}
  );
}
