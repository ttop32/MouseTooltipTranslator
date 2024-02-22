<template>
  <popupWindow>
    <!-- main page ====================================== -->
    <div tile flat>
      <v-toolbar color="blue" dark dense>
        <v-toolbar-title>
          <div>{{ remainSettingDesc["appName"] }}</div>
        </v-toolbar-title>
        <v-btn icon @click="$router.push('/history')">
          <v-icon>mdi-history</v-icon>
        </v-btn>
        <v-app-bar-nav-icon
          @click="$router.push('/about')"
        ></v-app-bar-nav-icon>

        <!-- tab header -->
        <template v-slot:extension>
          <v-tabs
            v-model="currentTab"
            center-active
            show-arrows
            slider-color="red"
          >
            <v-tab v-for="(tabName, tabId) in tabs" :key="tabId">
              {{ tabName }}
            </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>

      <!-- main page contents -->
      <v-window v-model="currentTab">
        <v-window-item
          v-for="(tabName, tabId) in tabs"
          :key="tabId"
          :value="tabId"
          class="scrollList"
        >
          <!-- review request alert box -->
          <div v-if="tabId == 'MAIN'">
            <v-alert
              v-if="2 < setting['popupCount'] && setting['popupCount'] < 6"
              type="success"
              border="start"
              variant="tonal"
              closable
              close-label="Close Alert"
              :title="reviewReminder.name"
            >
              {{ reviewReminder.sub_name }}
              <template v-slot:append>
                <v-btn variant="tonal" @click="openUrl(reviewReminder.url)"
                  >Open</v-btn
                >
              </template>
            </v-alert>
          </div>

          <v-list-item
            v-for="(option, optionName) in tabItems[tabId]"
            :key="optionName"
            flat
          >
            <!-- single select (default null) and multiple select option -->
            <v-select
              v-if="!option.optionType || option.optionType == 'multipleSelect'"
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
  </popupWindow>
</template>
<script>
import browser from "webextension-polyfill";
import { isProxy, toRaw } from "vue";
import _ from "lodash";

import * as util from "/src/util";

var langList = util.langList;
var langListWithAuto = util.concatJson({ Auto: "auto" }, langList); //copy lang and add auto
var langListWithNone = util.concatJson({ None: "null" }, langList); //copy lang and add none
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
  "deepl (Experimental)": "deepl",
  "yandex (Experimental)": "yandex",
  "baidu (Experimental)": "baidu",
  "papago (Experimental)": "papago",
  "googleGTX (Experimental)": "googleGTX",
  "googleWeb (Experimental)": "googleWeb",
  "googleV2 (Experimental)": "googleV2",
  "googleWebImage (Experimental)": "googleWebImage",
  // chatgpt: "chatgpt",
  // "lingva (Experimental)": "lingva",
  // "libreTranslate (Experimental)": "libreTranslate",
  // "duckduckgo (Experimental)": "duckduckgo",
  // "myMemory (Experimental)": "myMemory",
  // "watson (Experimental)": "watson",
  // "pixabay (Experimental)": "pixabay",
  // "unsplash (Experimental)": "unsplash",
};

var translateActionList = {
  Select: "select",
  Mouseover: "mouseover",
  "Mouseover & Select": "mouseoverselect",
};

var tooltipFontSizeList = util.getRangeOption(6, 41, 2, 0);
var tooltipWidth = util.getRangeOption(100, 1001, 100, 0);
var voiceVolumeList = util.getRangeOption(0, 1.1, 0.1, 1);
var voiceRateList = util.getRangeOption(0.5, 2.1, 0.1, 1);
var voiceRepeatList = util.getRangeOption(1, 11);
var tooltipBackgroundBlurList = util.getRangeOption(0, 21);
var tooltipDistanceList = util.getRangeOption(0, 41);
var tooltipIntervalTimeList = util.getRangeOption(0.5, 2.1, 0.1, 1);

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

var keyListWithAlways = _.cloneDeep(keyList); //copy lang and add auto
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
    description: browser.i18n.getMessage("Show_Tooltip_When"), // public/_locales/en/messages.json is used
    optionList: keyListWithAlways,
  },
  TTSWhen: {
    description: browser.i18n.getMessage("Voice_When"),
    optionList: keyListWithAlways,
  },
  translateWhen: {
    description: browser.i18n.getMessage("Translate_When"),
    optionList: translateActionList,
  },
  translateSource: {
    description: browser.i18n.getMessage("Translate_From"),
    optionList: langListWithAuto,
  },
  translateTarget: {
    description: browser.i18n.getMessage("Translate_Into"),
    optionList: langList,
  },
  translatorVendor: {
    description: browser.i18n.getMessage("Translator_Engine"),
    optionList: translatorList,
  },
  mouseoverTextType: {
    description: browser.i18n.getMessage("Mouseover_Text_Type"),
    optionList: detectTypeList,
  },
  writingLanguage: {
    description: browser.i18n.getMessage("Writing_Language"),
    optionList: langList,
  },
  ocrLang: {
    description: browser.i18n.getMessage("OCR_Language"),
    optionList: ocrLangList,
  },
  translateReverseTarget: {
    description: browser.i18n.getMessage("Reverse_Translate_Language"),
    optionList: langListWithNone,
  },
};

var graphicTabData = {
  tooltipFontSize: {
    description: browser.i18n.getMessage("Tooltip_Font_Size"),
    optionList: tooltipFontSizeList,
  },
  tooltipWidth: {
    description: browser.i18n.getMessage("Tooltip_Width"),
    optionList: tooltipWidth,
  },
  tooltipDistance: {
    description: browser.i18n.getMessage("Tooltip_Distance"),
    optionList: tooltipDistanceList,
  },
  tooltipAnimation: {
    description: browser.i18n.getMessage("Tooltip_Animation"),
    optionList: tooltipAnimationList,
  },
  tooltipPosition: {
    description: browser.i18n.getMessage("Tooltip_Position"),
    optionList: tooltipPositionList,
  },
  tooltipTextAlign: {
    description: browser.i18n.getMessage("Tooltip_Text_Align"),
    optionList: tooltipTextAlignList,
  },
  tooltipBackgroundBlur: {
    description: browser.i18n.getMessage("Tooltip_Background_Blur"),
    optionList: tooltipBackgroundBlurList,
  },
  mouseoverHighlightText: {
    description: browser.i18n.getMessage("Mouseover_Highlight_Text"),
    optionList: toggleList,
  },
  tooltipFontColor: {
    description: browser.i18n.getMessage("Tooltip_Font_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  tooltipBackgroundColor: {
    description: browser.i18n.getMessage("Tooltip_Background_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  tooltipBorderColor: {
    description: browser.i18n.getMessage("Tooltip_Border_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  mouseoverTextHighlightColor: {
    description: browser.i18n.getMessage("Mouseover_Text_Highlight_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
};

var voiceTabData = {
  voiceVolume: {
    description: browser.i18n.getMessage("Voice_Volume"),
    optionList: voiceVolumeList,
  },
  voiceRate: {
    description: browser.i18n.getMessage("Voice_Speed"),
    optionList: voiceRateList,
  },
  voiceTarget: {
    description: browser.i18n.getMessage("Voice_Target"),
    optionList: voiceTargetList,
  },
  voiceRepeat: {
    description: browser.i18n.getMessage("Voice_Repeat"),
    optionList: voiceRepeatList,
  },
};

var advancedTabData = {
  keyDownTranslateWriting: {
    description: browser.i18n.getMessage("Translate_Writing_When"),
    optionList: keyList,
  },
  keyDownOCR: {
    description: browser.i18n.getMessage("OCR_When"),
    optionList: keyListWithAlways,
  },
  detectSubtitle: {
    description: browser.i18n.getMessage("Detect_Subtitle"),
    optionList: subtitleTypeList,
  },
  detectPDF: {
    description: browser.i18n.getMessage("Detect_PDF"),
    optionList: toggleList,
  },
  mouseoverPauseSubtitle: {
    description: browser.i18n.getMessage("Mouseover_Pause_Subtitle"),
    optionList: toggleList,
  },
  keyDownMouseoverTextSwap: {
    description: browser.i18n.getMessage("Mouseover_Text_Type_Swap_Key"),
    optionList: keyList,
  },
  tooltipInfoSourceText: {
    description: browser.i18n.getMessage("Tooltip_Info_Source_Text"),
    optionList: toggleList,
  },
  tooltipInfoSourceLanguage: {
    description: browser.i18n.getMessage("Tooltip_Info_Source_Language"),
    optionList: toggleList,
  },
  tooltipInfoTransliteration: {
    description:
      browser.i18n.getMessage("Tooltip_Info_Transliteration") +
      " (Experimental)",
    optionList: toggleList,
  },
  tooltipIntervalTime: {
    description: browser.i18n.getMessage("Tooltip_Interval_Time"),
    optionList: tooltipIntervalTimeList,
  },
};

var excludeTabData = {
  langExcludeList: {
    description: browser.i18n.getMessage("Exclude_Language"),
    optionList: langList,
    optionType: "multipleSelect",
  },
  websiteExcludeList: {
    description: browser.i18n.getMessage("Exclude_Website"),
    optionList: "",
    optionType: "comboBox",
  },
};

var tabItems = {
  MAIN: settingListData,
  GRAPHIC: graphicTabData,
  VOICE: voiceTabData,
  ADVANCED: advancedTabData,
  EXCLUDE: excludeTabData,
};
var tabs = {
  MAIN: browser.i18n.getMessage("MAIN"),
  GRAPHIC: browser.i18n.getMessage("GRAPHIC"),
  VOICE: browser.i18n.getMessage("VOICE"),
  ADVANCED: browser.i18n.getMessage("ADVANCED"),
  EXCLUDE: browser.i18n.getMessage("EXCLUDE"),
};

var remainSettingDesc = {
  appName: browser.i18n.getMessage("Mouse_Tooltip_Translator"),
  Voice_for_: browser.i18n.getMessage("Voice_for_"),
};

var reviewReminder = {
  name: browser.i18n.getMessage("Review_this"),
  sub_name: browser.i18n.getMessage("Developer_love_criticism"),
  url: util.getReviewUrl(),
};

var langPriorityOptionList = [
  "translateSource",
  "translateTarget",
  "writingLanguage",
  "translateReverseTarget",
];

export default {
  name: "PopupView",
  data() {
    return {
      currentTab: "MAIN",
      tabs: tabs,
      tabItems: {},
      remainSettingDesc,
      options: {
        mask: "!#XXXXXXXX",
        tokens: {
          X: { pattern: /[0-9a-fA-F]/ },
        },
      },
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
      reviewReminder,
    };
  },
  async mounted() {
    this.setting = await util.loadSetting();
    this.loadTabOptionList();
    await this.addTtsVoiceTabOption();
    this.setting["popupCount"]++;
    this.saveSetting();

    console.log(this.setting);
    console.log(this.tabItems);
  },

  computed: {
    settingWrapper() {
      return Object.assign({}, this.setting);
    },
  },
  watch: {
    settingWrapper: {
      deep: true,
      handler(newSetting, oldSetting) {
        this.checkSettingLangPriority(newSetting, oldSetting);
        this.saveSetting();
      },
    },
  },

  methods: {
    saveSetting() {
      toRaw(this.setting).save();
    },
    openUrl(newURL) {
      window.open(newURL);
    },
    wrapTitleValueJson(inputList, optionName) {
      // convert {key:item}  as {title:key, value:item}
      var textValList = [];
      for (const [key2, val2] of Object.entries(inputList)) {
        textValList.push({
          title: key2,
          value: val2,
        });
      }
      textValList = this.sortLangOption(textValList, optionName);
      return textValList;
    },
    loadTabOptionList() {
      this.tabItems = tabItems;
      for (const [tabKey, tabVal] of Object.entries(this.tabItems)) {
        for (const [key1, val1] of Object.entries(tabVal)) {
          this.tabItems[tabKey][key1]["optionList"] = this.wrapTitleValueJson(
            this.tabItems[tabKey][key1]["optionList"],
            key1
          );
        }
      }
    },
    sortLangOption(textValList, optionName) {
      if (!langPriorityOptionList.includes(optionName)) {
        return textValList;
      }
      textValList.sort((i1, i2) => {
        var i1Priority = this.setting["langPriority"][i1.value] || 0;
        var i2Priority = this.setting["langPriority"][i2.value] || 0;
        return i2Priority - i1Priority;
      });
      return textValList;
    },
    checkSettingLangPriority(newSetting, oldSetting) {
      for (var option of langPriorityOptionList) {
        if (
          newSetting[option] != oldSetting[option] &&
          oldSetting[option] != null
        ) {
          var lang = newSetting[option];
          var langPriority = this.setting?.["langPriority"]?.[lang] || 0;
          this.setting["langPriority"][lang] = langPriority + 1;
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
          optionList: this.wrapTitleValueJson(voiceOptionList),
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
<style></style>
