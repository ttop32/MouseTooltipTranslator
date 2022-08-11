<template>
  <v-app id="app">
    <v-fade-transition hide-on-leave>
      <!-- main page ====================================== -->
      <v-card v-if="currentPage == 'main'" tile flat>
        <v-toolbar color="blue" dark dense>
          <v-toolbar-title>
            <div>Mouse Tooltip Translator</div>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="currentPage = 'history'">
            <v-icon>mdi-history</v-icon>
          </v-btn>
          <v-app-bar-nav-icon
            @click="currentPage = 'about'"
          ></v-app-bar-nav-icon>
        </v-toolbar>

        <v-list v-if="setting.data" id="settingListBox" class="scrollList" flat>
          <v-list-item v-for="(value, name) in settingList" :key="name">
            <v-select
              v-model="setting.data[name]"
              :items="value.optionList"
              item-text="text"
              item-value="val"
              :label="value.description"
              @change="onSelectChange($event, name)"
            ></v-select>
          </v-list-item>

          <v-list-item>
            <v-select
              v-model="setting.data['langExcludeList']"
              :items="langExcludeSelectList"
              item-text="text"
              item-value="val"
              label="Exclude Language"
              multiple
              @change="handleExcludeLang()"
            >
              <template v-slot:selection="{ item, index }">
                <v-chip v-if="index === 0">
                  <span>{{ item.text }}</span>
                </v-chip>
                <span v-if="index === 1" class="grey--text text-caption">
                  (+{{ setting.data["langExcludeList"].length - 1 }} others)
                </span>
              </template>
            </v-select>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- about page ====================================== -->
      <div v-else-if="currentPage == 'about'">
        <!-- about page img====================================== -->
        <v-img src="floating-maple-leaf.jpg" height="300px" dark class="vimage">
          <v-row class="fill-height">
            <v-card-title>
              <v-btn dark icon class="mr-4" @click="currentPage = 'main'">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-card-title class="white--text">
              <div class="text-h4 pl-12 pt-12">
                Mouse Tooltip<br />
                Translator
              </div>
            </v-card-title>
          </v-row>
        </v-img>

        <!-- about page contents list====================================== -->
        <v-list-item-group>
          <v-list-item
            v-for="(value, key) in aboutPageList"
            :key="key"
            @click="openUrl(value.url)"
          >
            <v-list-item-icon>
              <v-icon color="primary">
                {{ value.icon }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ value.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ value.sub_name }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </div>

      <!-- history page ====================================== -->
      <div v-else-if="currentPage == 'history'">
        <v-toolbar color="blue" dark dense>
          <v-btn icon @click="currentPage = 'main'">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-toolbar-title>History</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="removeAllHistory">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
          <v-btn icon @click="downloadCSV">
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </v-toolbar>

        <v-list-item-group class="scrollList">
          <v-card-text>
            <span class="subheading">Record Text When</span>
            <v-chip-group
              multiple
              active-class="primary--text"
              v-model="setting.data['historyRecordActions']"
              @change="changeSetting"
            >
              <v-chip
                v-for="action in historyRecordActionChipList"
                :value="action.name"
                filter
                :key="action.name"
              >
                {{ action.name }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
          <v-divider class="mx-4"></v-divider>

          <!-- name="list" tag="div" -->
            <v-list-item
              v-for="(history, index) in setting.data['historyList']"
              :key="history"
            >
              <v-list-item-content
                @click="copyToClipboard(history.sourceText, history.targetText)"
              >
                <v-list-item-title
                  v-text="history.sourceText"
                ></v-list-item-title>
                <v-list-item-subtitle
                  v-text="history.targetText"
                ></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  @click.prevent="removeHistory(index)"
                  @mousedown.stop
                  @touchstart.native.stop
                >
                  <v-icon color="grey lighten-1">mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
        </v-list-item-group>

        <v-snackbar v-model="copyAlertBar">
          Item Copied
          <template v-slot:action="{ attrs }">
            <v-btn
              color="pink"
              text
              v-bind="attrs"
              @click="copyAlertBar = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </div>
    </v-fade-transition>
  </v-app>
</template>
<script>
import { Setting } from "./setting";

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
  "Chinese Simplified": "zh-CN",
  "Chinese Traditional": "zh-TW",
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
  Zulu: "zu",
};
var langListWithAuto = Object.assign({ Auto: "auto" }, langList); //copy lang and add auto

var toggleList = {
  On: "true",
  Off: "false",
};

var keyList = {
  None: "null",
  "Ctrl Left":"ControlLeft",
  "Ctrl Right":"ControlRight",
  "Alt Left":"AltLeft",
  "Alt Right":"AltRight",
  "Shift Left":"ShiftLeft",
  "Shift Right":"ShiftRight",
  "Meta Left":"MetaLeft",
  "Meta Right":"MetaRight",
};

var ocrLangList = {
  Afrikaans: "afr",
  Albanian: "sqi",
  Amharic: "amh",
  Arabic: "ara",
  Armenian: "hye",
  Azerbaijani: "aze",
  Basque: "eus",
  Belarusian: "bel",
  Bengali: "ben",
  Bosnian: "bos",
  Bulgarian: "bul",
  Burmese: "mya",
  Catalan: "cat",
  Cebuano: "ceb",
  "Chinese Simplified": "chi_sim",
  "Chinese Simplified (vertical)": "chi_sim_vert",
  "Chinese Traditional": "chi_tra",
  "Chinese Traditional (vertical)": "chi_tra_vert",
  Corsican: "cos",
  Croatian: "hrv",
  Czech: "ces",
  Danish: "dan",
  Dutch: "nld",
  English: "eng",
  Esperanto: "epo",
  Estonian: "est",
  Filipino: "fil",
  Finnish: "fin",
  French: "fra",
  Frisian: "fry",
  Galician: "glg",
  Georgian: "kat",
  German: "deu",
  Greek: "ell",
  Gujarati: "guj",
  Haitian: "hat",
  Hebrew: "heb",
  Hindi: "hin",
  Hungarian: "hun",
  Icelandic: "isl",
  Indonesian: "ind",
  Irish: "gle",
  Italian: "ita",
  Japanese: "jpn",
  "Japanese (vertical)": "jpn_vert",
  Javanese: "jav",
  Kannada: "kan",
  Kazakh: "kaz",
  Khmer: "khm",
  Korean: "kor",
  "Korean (vertical)": "kor_vert",
  Kurdish: "kmr",
  Lao: "lao",
  Latin: "lat",
  Latvian: "lav",
  Lithuanian: "lit",
  Luxembourgish: "ltz",
  Macedonian: "mkd",
  Malay: "msa",
  Malayalam: "mal",
  Maltese: "mlt",
  Maori: "mri",
  Marathi: "mar",
  Mongolian: "mon",
  Nepali: "nep",
  Norwegian: "nor",
  Persian: "fas",
  Polish: "pol",
  Portuguese: "por",
  Romanian: "ron",
  Russian: "rus",
  "Scottish Gaelic": "gla",
  Serbian: "srp",
  Sindhi: "snd",
  Sinhala: "sin",
  Slovak: "slk",
  Slovenian: "slv",
  Spanish: "spa",
  Sundanese: "sun",
  Swahili: "swa",
  Swedish: "swe",
  Tajik: "tgk",
  Tamil: "tam",
  Telugu: "tel",
  Thai: "tha",
  Turkish: "tur",
  Ukrainian: "ukr",
  Urdu: "urd",
  Uzbek: "uzb",
  Vietnamese: "vie",
  Welsh: "cym",
  Yiddish: "yid",
  Yoruba: "yor",
};

var translatorList = {
  google: "google",
  bing: "bing",
};

var translateActionList = {
  Select: "select",
  Mouseover: "mouseover",
  "Mouseover & Select": "mouseoverselect",
};

var tooltipFontSizeList = {}; //font size 5 to 25
for (let i = 5; i < 26; i++) {
  tooltipFontSizeList[String(i)] = String(i);
}
var detectTypeList = {
  Word: "word",
  Sentence: "sentence",
  Container: "container",
};

var translateReverseTargetList = JSON.parse(JSON.stringify(langList)); //copy lang and add auto
translateReverseTargetList["None"] = "null";

var tooltipWidth = {};
for (let i = 100; i < 600; i += 100) {
  tooltipWidth[String(i)] = String(i);
}

var settingListData = {
  useTooltip: {
    description: "Enable Tooltip",
    optionList: toggleList,
  },
  useTTS: {
    description: "Enable TTS",
    optionList: toggleList,
  },
  translateWhen: {
    description: "Translate When",
    optionList: translateActionList,
  },
  translateSource: {
    description: "Translate From",
    optionList: langListWithAuto,
  },
  translateTarget: {
    description: "Translate Into",
    optionList: langList,
  },
  translatorVendor: {
    description: "Translator",
    optionList: translatorList,
  },
  keyDownTooltip: {
    description: "Tooltip Activation Hold Key",
    optionList: keyList,
  },
  keyDownTTS: {
    description: "TTS Activation Hold Key",
    optionList: keyList,
  },
  detectType: {
    description: "Text Detect Type",
    optionList: detectTypeList,
  },
  translateReverseTarget: {
    description: "Reverse Translate Language",
    optionList: translateReverseTargetList,
  },
  tooltipFontSize: {
    description: "Tooltip Font Size",
    optionList: tooltipFontSizeList,
  },
  tooltipWidth: {
    description: "Tooltip Width",
    optionList: tooltipWidth,
  },
  detectPDF: {
    description: "Detect PDF",
    optionList: toggleList,
  },
  useOCR: {
    description: "Enable OCR (Experimental)",
    optionList: toggleList,
  },
  ocrDetectionLang: {
    description: "OCR Detection Language",
    optionList: ocrLangList,
  },
};

var aboutPageList = {
  reviewPage: {
    name: "Review Page",
    sub_name: "Comment on this extension",
    url: "https://chrome.google.com/webstore/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
    icon: "mdi-message-draw",
  },
  sourceCode: {
    name: "Source code",
    sub_name: "Check source code in github",
    url: "https://github.com/ttop32/MouseTooltipTranslator",
    icon: "mdi-github",
  },
  privacyPolicy: {
    name: "Privacy Policy",
    sub_name: "User privacy policy",
    url: "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/privacy_policy.md",
    icon: "mdi-shield-account",
  },
};

export default {
  name: "app",
  data: function () {
    return {
      settingList: settingListData,
      aboutPageList: aboutPageList,
      setting: {},
      currentPage: "main",
      historyRecordActionChipList: [
        {
          name: "select",
          icon: "mdi-cursor-text",
        },
        {
          name: "mouseover",
          icon: "mdi-cursor-default-click",
        },
      ],
      copyAlertBar: false,
      langExcludeSelectList: [],
    };
  },
  async mounted() {
    this.setting = await Setting.create();
    this.langExcludeSelectList = this.makeTextValList(langList);
    this.convertOptionListAsTextVal();
  },

  methods: {
    onSelectChange(event, name) {
      this.setting.data[name] = event;
      //when activation hold key is set, turn off permanent feature enable
      if (name == "keyDownTooltip" && event != "null") {
        this.setting.data["useTooltip"] = "false";
      }
      if (name == "keyDownTTS" && event != "null") {
        this.setting.data["useTTS"] = "false";
      }
      this.changeSetting();
    },
    changeSetting() {
      this.setting.save(this.setting.data);
    },
    openUrl(newURL) {
      window.open(newURL);
    },
    removeAllHistory() {
      this.setting.data["historyList"] = [];
      this.changeSetting();
    },
    removeHistory(index) {
      this.setting.data["historyList"].splice(index, 1);
      this.changeSetting();
    },
    downloadCSV() {
      var arr = this.setting.data["historyList"];
      var csv = arr
        .map(function (v) {
          return (
            v["sourceText"].replace(/\n|\r|,|'|"/g, " ") +
            "," +
            v["targetText"].replace(/\n|\r|,|'|"/g, " ")
          );
        })
        .join("\n");
      var link = document.createElement("a");
      link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
      link.download = "export.csv";
      link.click();
    },
    copyToClipboard(sourceText, targetText) {
      var text = sourceText + " \n" + targetText;
      navigator.clipboard.writeText(text).then((response) => {
        this.copyAlertBar = true;
      });
    },

    handleExcludeLang() {
      this.changeSetting();
    },

    makeTextValList(inputList) {
      // convert {key:item}  => {text:key, val:item}
      var textValList = [];
      for (const [key2, val2] of Object.entries(inputList)) {
        textValList.push({
          text: key2,
          val: val2,
        });
      }
      return textValList;
    },
    convertOptionListAsTextVal() {
      for (const [key1, val1] of Object.entries(this.settingList)) {
        this.settingList[key1]["optionList"] = this.makeTextValList(
          this.settingList[key1]["optionList"]
        );
      }
    },
  },
};
</script>
<style>

.v-label {
  font-size: 18px;
}
</style>
