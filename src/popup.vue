<template>
  <v-app id="app">
    <v-fade-transition hide-on-leave>
      <!-- main page ====================================== -->
      <div v-if="currentPage == 'main'" tile flat>
        <v-toolbar color="blue" dark dense>
          <v-toolbar-title>
            <div>{{ remainSettingDesc["appName"] }}</div>
          </v-toolbar-title>
          <v-btn icon @click="currentPage = 'history'">
            <v-icon>mdi-history</v-icon>
          </v-btn>
          <v-app-bar-nav-icon
            @click="currentPage = 'about'"
          ></v-app-bar-nav-icon>

          <!-- tab header -->
          <template v-slot:extension>
            <v-tabs
              v-model="currentTab"
              center-active
              show-arrows
              slider-color="red"
            >
              <v-tab v-for="tabName in tabs" :key="tabName">
                {{ tabName }}
              </v-tab>
            </v-tabs>
          </template>
        </v-toolbar>

        <!-- main page contents -->
        <v-window v-model="currentTab">
          <v-window-item
            v-for="tabName in tabs"
            :key="tabName"
            :value="tabName"
            class="scrollList"
          >
            <!-- review request alert box -->
            <div v-if="tabName == 'MAIN'">
              <v-alert
                v-if="2 < setting['popupCount'] && setting['popupCount'] < 6"
                type="success"
                border="start"
                variant="tonal"
                closable
                close-label="Close Alert"
                title="Review this!"
              >
                Developer love criticism
                <template v-slot:append>
                  <v-btn variant="tonal" @click="openUrl(reviewPageUrl)"
                    >Open</v-btn
                  >
                </template>
              </v-alert>
            </div>

            <v-list-item
              v-for="(option, optionName) in tabItems[tabName]"
              :key="optionName"
              flat
            >
              <!-- single select (default null) and multiple select option -->
              <v-select
                v-if="
                  !option.optionType || option.optionType == 'multipleSelect'
                "
                v-model="setting[optionName]"
                :items="option.optionList"
                :label="option.description"
                :multiple="option.optionType == 'multipleSelect'"
                :chips="option.optionType == 'multipleSelect'"
                :closable-chips="option.optionType == 'multipleSelect'"
                variant="underlined"
              >
              </v-select>

              <!-- combo box option -->
              <v-combobox
                v-else-if="option.optionType == 'comboBox'"
                v-model="setting[optionName]"
                :items="option.optionList"
                item-text="text"
                item-value="val"
                :label="option.description"
                tabName
                chips
                multiple
                closable-chips
                variant="underlined"
              >
              </v-combobox>

              <!-- color picker option -->
              <v-text-field
                v-else-if="option.optionType == 'colorPicker'"
                v-model="setting[optionName]"
                :label="option.description"
                variant="underlined"
                v-maska:[options]
              >
                <template v-slot:append>
                  <v-menu v-model="option.menu" :close-on-content-click="false">
                    <template v-slot:activator="{ props }">
                      <div
                        :style="swatchStyle(option, optionName)"
                        v-bind="props"
                        class="ma-1"
                      />
                    </template>
                    <v-card>
                      <v-color-picker
                        v-model="setting[optionName]"
                      ></v-color-picker>
                    </v-card>
                  </v-menu>
                </template>
              </v-text-field>
            </v-list-item>

            <!-- </v-list> -->
            <!-- </v-card> -->
          </v-window-item>
        </v-window>

        <!-- tab body------------------- -->
      </div>

      <!-- about page ====================================== -->
      <div v-else-if="currentPage == 'about'">
        <!-- about page img====================================== -->
        <v-img
          height="200"
          src="floating-maple-leaf.jpg"
          cover
          class="text-white"
        >
          <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
            <template v-slot:prepend>
              <!-- <v-btn icon="$menu"></v-btn> -->
              <v-btn dark icon class="mr-4" @click="currentPage = 'main'">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </template>
          </v-toolbar>
          <!-- <v-card-title>Top 10 Australian beaches</v-card-title> -->
          <v-spacer></v-spacer>
          <v-card-title class="white--text">
            <div class="text-h4 pl-12 pt-12">
              Mouse Tooltip<br />
              Translator
            </div>
          </v-card-title>
        </v-img>

        <!-- about page contents list====================================== -->
        <v-list>
          <v-list-item
            v-for="(aboutPageItem, key) in aboutPageList"
            :key="key"
            @click="openUrl(aboutPageItem.url)"
            :title="aboutPageItem.name"
            :subtitle="aboutPageItem.sub_name"
          >
            <template v-slot:prepend>
              <v-avatar :color="aboutPageItem.color">
                <v-icon size="25" color="white">{{
                  aboutPageItem.icon
                }}</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
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

        <v-list class="scrollList">
          <v-card-text>
            <span class="subheading">Record Text When</span>
            <v-chip-group
              multiple
              active-class="primary--text"
              v-model="setting['historyRecordActions']"
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
            v-for="(history, index) in setting['historyList']"
            :key="history"
            :title="history.sourceText"
            :subtitle="history.targetText"
          >
            <template v-slot:append>
              <v-icon
                color="grey lighten-1"
                @click.prevent="removeHistory(index)"
                @mousedown.stop
                @touchstart.native.stop
                >mdi-close</v-icon
              >
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-fade-transition>
  </v-app>
</template>
<script>
import * as util from "/src/util";
import { isProxy, toRaw } from "vue";

var langList = util.langList;
var langListWithAuto = util.concatJson({ Auto: "auto" }, langList); //copy lang and add auto
var langListOpposite = util.langListOpposite;

var toggleList = {
  On: "true",
  Off: "false",
};

var keyList = {
  None: "null",
  "Ctrl Left": "ControlLeft",
  "Ctrl Right": "ControlRight",
  "Alt Left": "AltLeft",
  "Alt Right": "AltRight",
  "Shift Left": "ShiftLeft",
  "Shift Right": "ShiftRight",
  "Meta Left": "MetaLeft",
  "Meta Right": "MetaRight",
  "Click Left": "ClickLeft",
  "Click Middle": "ClickMiddle",
  "Click Right": "ClickRight",
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
  "papago (Experimental)": "papago",
  "yandex (Experimental)": "yandex",
  "deepl (Experimental)": "deepl",
};

var translateActionList = {
  Select: "select",
  Mouseover: "mouseover",
  "Mouseover & Select": "mouseoverselect",
};

var tooltipFontSizeList = getRangeOption(5, 41, 1, 0); //font size 5 to 25
var tooltipWidth = getRangeOption(1, 11, 100, 0);
var voiceVolumeList = getRangeOption(0, 11, 0.1, 1);
var voiceRateList = getRangeOption(5, 21, 0.1, 1);
var voiceRepeatList = getRangeOption(1, 11, 1, 0);
var tooltipBackgroundBlurList = getRangeOption(0, 21, 1, 0);
var tooltipDistanceList = getRangeOption(0, 41, 1, 0);

var tooltipPositionList = {
  Follow: "follow",
  Fixed: "fixed",
};
var tooltipAnimationList = {
  Fade: "fade",
  Scale: "scale",
  "Shift-away": "shift-away",
  "Shift-toward": "shift-toward",
  Perspective: "perspective",
};

var detectTypeList = {
  Word: "word",
  Sentence: "sentence",
  Container: "container",
};

var translateListWithNone = util.copyJson(langList); //copy lang and add auto
translateListWithNone["None"] = "null";

var keyListWithAlways = util.copyJson(keyList); //copy lang and add auto
keyListWithAlways["Always"] = "always";

var voiceTargetList = {
  "Source Text": "source",
  "Translated Text": "target",
  "Source & Translated": "sourcetarget",
  "Translated & Source": "targetsource",
};

var subtitleTypeList = {
  "Dual Subtitle": "dualsub",
  "Target Single Subtitle": "targetsinglesub",
  "Source Single Subtitle": "sourcesinglesub",
  None: "null",
};

var tooltipTextAlignList = {
  Center: "center",
  Left: "left",
  Right: "right",
  Justify: "justify",
};

var settingListData = {
  showTooltipWhen: {
    description: chrome.i18n.getMessage("Show_Tooltip_When"), // public/_locales/en/messages.json is used
    optionList: keyListWithAlways,
  },
  TTSWhen: {
    description: chrome.i18n.getMessage("Voice_When"),
    optionList: keyListWithAlways,
  },
  translateWhen: {
    description: chrome.i18n.getMessage("Translate_When"),
    optionList: translateActionList,
  },
  translateSource: {
    description: chrome.i18n.getMessage("Translate_From"),
    optionList: langListWithAuto,
  },
  translateTarget: {
    description: chrome.i18n.getMessage("Translate_Into"),
    optionList: langList,
  },
  translatorVendor: {
    description: chrome.i18n.getMessage("Translator_Engine"),
    optionList: translatorList,
  },
  detectType: {
    description: chrome.i18n.getMessage("Text_Detect_Type"),
    optionList: detectTypeList,
  },
  writingLanguage: {
    description: chrome.i18n.getMessage("Writing_Language"),
    optionList: langList,
  },
  ocrDetectionLang: {
    description: chrome.i18n.getMessage("OCR_Detection_Language"),
    optionList: ocrLangList,
  },
};

var visualTabData = {
  tooltipFontSize: {
    description: chrome.i18n.getMessage("Tooltip_Font_Size"),
    optionList: tooltipFontSizeList,
  },
  tooltipWidth: {
    description: chrome.i18n.getMessage("Tooltip_Width"),
    optionList: tooltipWidth,
  },
  tooltipDistance: {
    description: chrome.i18n.getMessage("Tooltip_Distance"),
    optionList: tooltipDistanceList,
  },
  tooltipAnimation: {
    description: chrome.i18n.getMessage("Tooltip_Animation"),
    optionList: tooltipAnimationList,
  },
  tooltipPosition: {
    description: chrome.i18n.getMessage("Tooltip_Position"),
    optionList: tooltipPositionList,
  },
  tooltipTextAlign: {
    description: chrome.i18n.getMessage("Tooltip_Text_Align"),
    optionList: tooltipTextAlignList,
  },
  tooltipBackgroundBlur: {
    description: chrome.i18n.getMessage("Tooltip_Background_Blur"),
    optionList: tooltipBackgroundBlurList,
  },
  tooltipFontColor: {
    description: chrome.i18n.getMessage("Tooltip_Font_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  tooltipBackgroundColor: {
    description: chrome.i18n.getMessage("Tooltip_Background_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  highlightColor: {
    description: chrome.i18n.getMessage("Highlight_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
};

var voiceTabData = {
  voiceVolume: {
    description: chrome.i18n.getMessage("Voice_Volume"),
    optionList: voiceVolumeList,
  },
  voiceRate: {
    description: chrome.i18n.getMessage("Voice_Speed"),
    optionList: voiceRateList,
  },
  voiceTarget: {
    description: chrome.i18n.getMessage("Voice_Target"),
    optionList: voiceTargetList,
  },
  voiceRepeat: {
    description: chrome.i18n.getMessage("Voice_Repeat"),
    optionList: voiceRepeatList,
  },
};

var advancedTabData = {
  keyDownTranslateWriting: {
    description: chrome.i18n.getMessage("Translate_Writing_Hotkey"),
    optionList: keyList,
  },
  keyDownOCR: {
    description: chrome.i18n.getMessage("OCR_When"),
    optionList: keyListWithAlways,
  },
  keyDownDetectSwap: {
    description: chrome.i18n.getMessage("Detect_Type_Swap_Hold_Key"),
    optionList: keyList,
  },
  enableYoutube: {
    description: chrome.i18n.getMessage("Enable_Youtube_Subtitle"),
    optionList: subtitleTypeList,
  },
  detectPDF: {
    description: chrome.i18n.getMessage("Detect_PDF"),
    optionList: toggleList,
  },
  translateReverseTarget: {
    description: chrome.i18n.getMessage("Reverse_Translate_Language"),
    optionList: translateListWithNone,
  },
  useTransliteration: {
    description: "Enable Transliteration (Experimental)",
    optionList: toggleList,
  },
  highlightMouseoverText: {
    description: "Highlight Mouseover Text (Experimental)",
    optionList: toggleList,
  },
  showSourceLang: {
    description: "Show Source Language (Experimental)",
    optionList: toggleList,
  },
};

var excludeTabData = {
  langExcludeList: {
    description: chrome.i18n.getMessage("Exclude_Language"),
    optionList: langList,
    optionType: "multipleSelect",
  },
  websiteExcludeList: {
    description: chrome.i18n.getMessage("Exclude_Website"),
    optionList: "",
    optionType: "comboBox",
  },
};

var tabItems = {
  MAIN: settingListData,
  GRAPHIC: visualTabData,
  VOICE: voiceTabData,
  ADVANCED: advancedTabData,
  EXCLUDE: excludeTabData,
};
var tabs = Object.keys(tabItems);

var remainSettingDesc = {
  appName: chrome.i18n.getMessage("Mouse_Tooltip_Translator"),
  Voice_for_: chrome.i18n.getMessage("Voice_for_"),
};

var aboutPageList = {
  howToUse: {
    name: chrome.i18n.getMessage("How_to_use"),
    sub_name: chrome.i18n.getMessage("Check_how_to_use_this_extension"),
    url: "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use",
    icon: "mdi-help-box",
    color: "green",
  },
  pdfViewer: {
    name: chrome.i18n.getMessage("PDF_Viewer"),
    sub_name: chrome.i18n.getMessage("Translate_local_PDF_file"),
    url:
      chrome.runtime.getURL("/pdfjs/web/viewer.html") + "?file=/pdf_demo.pdf",
    icon: "mdi-file-pdf-box",
    color: "red",
  },
  epub: {
    name: chrome.i18n.getMessage("Ebook_Reader"),
    sub_name: chrome.i18n.getMessage("Translate_local_ebook_file"),
    url: chrome.runtime.getURL("/foliate-js/reader.html"),
    icon: "mdi-book-open-blank-variant",
    color: "orange",
  },
  twitter: {
    name: chrome.i18n.getMessage("Twitter"),
    sub_name: chrome.i18n.getMessage("Retweet_twitter_post"),
    url: "https://twitter.com/MouseTooltip",
    icon: "mdi-twitter",
    color: "cyan",
  },
  reviewPage: {
    name: chrome.i18n.getMessage("Review_Page"),
    sub_name: chrome.i18n.getMessage("Comment_on_this_extension"),
    url: util.getReviewUrl(),
    icon: "mdi-message-draw",
    color: "primary",
  },
  sourceCode: {
    name: chrome.i18n.getMessage("Source_code"),
    sub_name: chrome.i18n.getMessage("Check_source_code_in_github"),
    url: "https://github.com/ttop32/MouseTooltipTranslator",
    icon: "mdi-github",
    color: "black",
  },
  privacyPolicy: {
    name: chrome.i18n.getMessage("Privacy_Policy"),
    sub_name: chrome.i18n.getMessage("User_privacy_policy"),
    url: "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/privacy_policy.md",
    icon: "mdi-shield-account",
    color: "error",
  },
};

function getRangeOption(start, end, scale, roundOff) {
  var optionList = {};
  for (let i = start; i < end; i++) {
    var num = String((i * scale).toFixed(roundOff));
    optionList[num] = num;
  }
  return optionList;
}

export default {
  name: "app",
  data() {
    return {
      currentTab: "MAIN",
      tabs: tabs,
      tabItems: {},
      remainSettingDesc: remainSettingDesc,
      height: window.innerHeight,

      options: {
        mask: "!#XXXXXXXX",
        tokens: {
          X: { pattern: /[0-9a-fA-F]/ },
        },
      },

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
      reviewPageUrl: aboutPageList["reviewPage"]["url"],
    };
  },
  async mounted() {
    this.setting = await util.loadSetting();
    this.loadTabOptionList();
    await this.addTtsVoiceTabOption();
    this.setting["popupCount"]++;
    this.saveSetting();
    this.applyRtl(util.getDefaultLang());
  },
  watch: {
    setting: {
      deep: true,
      handler() {
        console.log(this.setting);
        this.saveSetting();
      },
    },
  },

  methods: {
    applyRtl(locale) {
      if (util.isRtl(locale) == "rtl") {
        this.$vuetify.locale.current = locale;
      }
    },
    saveSetting() {
      toRaw(this.setting).save();
    },
    openUrl(newURL) {
      window.open(newURL);
    },
    removeAllHistory() {
      this.setting["historyList"] = [];
      this.saveSetting();
    },
    removeHistory(index) {
      this.setting["historyList"].splice(index, 1);
      this.saveSetting();
    },
    downloadCSV() {
      var headerKey = Object.keys(this.setting["historyList"]?.[0]).map(
        (key) => `${key}`
      );

      var csvContent = this.setting["historyList"].map((history) => {
        var line = "";
        for (var key of headerKey) {
          line +=
            (history?.[key]?.toString().replace(/[,'"]/g, " ") || "") + ",";
        }
        return line;
      });

      csvContent = [headerKey.join(",")].concat(csvContent).join("\n");
      var url = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(csvContent);
      var link = document.createElement("a");
      link.href = url;
      link.download = "Mouse_Tooltip_Translator_History.csv";
      link.click();
    },
    copyToClipboard(sourceText, targetText) {
      var text = sourceText + " \n" + targetText;
      navigator.clipboard.writeText(text).then((response) => {
        this.copyAlertBar = true;
      });
    },
    wrapWithTitleValueKey(inputList) {
      // convert {key:item}  as {title:key, value:item}
      var textValList = [];
      for (const [key2, val2] of Object.entries(inputList)) {
        textValList.push({
          title: key2,
          value: val2,
        });
      }
      return textValList;
    },
    loadTabOptionList() {
      this.tabItems = tabItems;
      for (const [tabKey, tabVal] of Object.entries(this.tabItems)) {
        for (const [key1, val1] of Object.entries(tabVal)) {
          this.tabItems[tabKey][key1]["optionList"] =
            this.wrapWithTitleValueKey(
              this.tabItems[tabKey][key1]["optionList"]
            );
        }
      }
    },

    async addTtsVoiceTabOption() {
      var voiceTabOption = {};
      var availableVoiceList = await util.getAllVoiceList();

      for (var key in langListOpposite) {
        if (!(key in availableVoiceList)) {
          continue;
        }
        var voiceOptionList = util.getJsonFromList(availableVoiceList[key]);
        voiceTabOption["ttsVoice_" + key] = {
          description:
            this.remainSettingDesc["Voice_for_"] + langListOpposite[key],
          optionList: this.wrapWithTitleValueKey(voiceOptionList),
        };
      }

      //add voice option
      this.tabItems["VOICE"] = Object.assign(
        this.tabItems["VOICE"],
        voiceTabOption
      );
    },
    swatchStyle(value, name) {
      const color = this.setting[name];
      const menu = value.menu;
      return {
        "box-shadow": "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        backgroundColor: color,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: menu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out",
      };
    },
  },
};
</script>
<style>
.v-input .v-label {
  font-size: 16px !important;
}
/* .v-input .v-label--active {
} */
</style>
