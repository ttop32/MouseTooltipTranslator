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



          <template v-slot:extension>
            <v-tabs
              v-model="tab"
              align-with-title
            >
              <v-tabs-slider color="red"></v-tabs-slider>
              <v-tab
                v-for="item in tabs"
                :key="item"
              >
                {{ item }}
              </v-tab>
            </v-tabs>
          </template>
        </v-toolbar>


      <!-- tab------------------- -->
      <v-tabs-items v-model="tab">



        <v-tab-item
          v-for="tabItem in tabs"
          :key="tabItem"
        >
        <perfect-scrollbar class="scroll-area" >
          <v-card flat v-if="tabItems[tabItem]">
            <v-list-item v-for="(value, name) in tabItems[tabItem]" :key="name">
            <v-select
              v-model="setting.data[name]"
              :items="value.optionList"
              item-text="text"
              item-value="val"
              :label="value.description"
              @change="onSelectChange($event, name)"
            ></v-select>
          </v-list-item>


          <!-- <v-color-picker
            dot-size="25"
          ></v-color-picker> -->



          <v-list-item v-if="tabItem=='MAIN'">
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

          </v-card>
        </perfect-scrollbar>

        </v-tab-item>
      </v-tabs-items>
      







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
var langListOpposite=swap(langList);

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

var tooltipFontSizeList = getRangeOption(5,26,1,0); //font size 5 to 25
var tooltipWidth = getRangeOption(1,6,100,0);
var ttsVolumeList=getRangeOption(1,11,0.1,1);
var ttsRateList=getRangeOption(5,21,0.1,1);


var detectTypeList = {
  Word: "word",
  Sentence: "sentence",
  Container: "container",
};

var translateReverseTargetList = JSON.parse(JSON.stringify(langList)); //copy lang and add auto
translateReverseTargetList["None"] = "null";

var tooltipTextAlignList={
  Center:"center",
  Left:"left",
  Right:"right",
  Justify:"justify",
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

var visualTabData={
  tooltipFontSize: {
    description: "Tooltip Font Size",
    optionList: tooltipFontSizeList,
  },
  tooltipWidth: {
    description: "Tooltip Width",
    optionList: tooltipWidth,
  },
  tooltipTextAlign: {
    description: "Tooltip Text Align",
    optionList: tooltipTextAlignList,
  },
};

var voiceTabData={
  ttsRate: {
    description: "TTS Speed",
    optionList: ttsRateList,
  },
  ttsVolume: {
    description: "TTS Volume",
    optionList: ttsVolumeList,
  },
};


var tabs=["MAIN","VISUAL","VOICE"];
var tabItems={
  "MAIN":settingListData,
  "VISUAL":visualTabData,
  "VOICE":voiceTabData,
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

function getRangeOption(start,end,scale,roundOff) {
  var optionList={};
  for (let i = start; i < end; i++) {
    var num=String((i*scale).toFixed(roundOff));
    optionList[num] = num;
  }
  return optionList;
} 

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}


export default {
  name: "app",
  data: function () {
    return {
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


      tab: null,
      tabs: tabs,
      tabItems:tabItems,


      color: '#1976D2FF',
      mask: '!#XXXXXXXX',
      menu: false,
    };
  },
  async mounted() {
    this.setting = await Setting.create();
    this.langExcludeSelectList = this.makeTextValList(langList);
    this.convertOptionListAsTextVal();
    this.addTtsVoiceTabOption();
  },
  computed: {
    swatchStyle() {
      const { color, menu } = this
      return {
        backgroundColor: color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderRadius: menu ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out'
      }
    }
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
      for (const [tabKey, tabVal] of Object.entries(this.tabItems)) {
        for (const [key1, val1] of Object.entries(tabVal)) {
          this.tabItems[tabKey][key1]["optionList"] = this.makeTextValList(
            this.tabItems[tabKey][key1]["optionList"]
          );
        }
      }      
    },
    addTtsVoiceTabOption(){
      var voiceTabOption={}
      
      for (var key in this.setting.voiceList) {
        var voiceOptionList={};
        for (const x of this.setting.voiceList[key]) {
          voiceOptionList[x]=x;          
        }
        if(langListOpposite[key]){
          voiceTabOption["ttsVoice_"+key]={
            description: "Voice for " +langListOpposite[key],
            optionList: this.makeTextValList(voiceOptionList),          
          }
        }
      }
      
      //add voice option
      this.tabItems["VOICE"] = Object.assign(this.tabItems["VOICE"], voiceTabOption)
    }
  },
};
</script>
<style>

.v-label {
  font-size: 18px;
}

.scroll-area {
  position: relative;
  margin: auto;
  /* width: 200px; */
  height: 500px;
}

</style>
