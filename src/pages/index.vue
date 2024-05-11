<template>
  <popupWindow>
    <!-- top nav bar -->
    <v-toolbar color="blue" dark dense>
      <v-toolbar-title Class="text-subtitle-1 mx-4 font-weight-bold">
        <div>{{ remainSettingDesc["appName"] }}</div>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        v-for="(iconData, iconId) in toolbarIcons"
        :key="iconId"
        :title="iconData.title"
        icon
        @click="$router.push(iconData.path)"
      >
        <v-icon>{{ iconData.icon }}</v-icon>
      </v-btn>

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
    <v-lazy>
      <v-window v-model="currentTab" class="scroll-container">
        <v-window-item
          v-for="(tabName, tabId) in tabs"
          :key="tabId"
          :value="tabId"
          class="scrollList"
        >
          <!-- comment request banner -->
          <CommentBanner v-if="tabId == 'MAIN'"> </CommentBanner>

          <v-list-item
            v-for="(option, optionName) in tabItems[tabId]"
            :key="optionName"
            flat
          >
            <!-- single select (default null) and multiple select option -->
            <v-select
              v-if="!option.optionType || option.optionType == 'multipleSelect'"
              v-model="setting[optionName]"
              :items="wrapTitleValueJson(option.optionList, optionName)"
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
              :items="wrapTitleValueJson(option.optionList, optionName)"
              :label="option.description"
              item-text="text"
              item-value="val"
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
        </v-window-item>
      </v-window>
    </v-lazy>
  </popupWindow>
</template>
<script>
import browser from "webextension-polyfill";
import { isProxy, toRaw } from "vue";
import _ from "lodash";

import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

import * as util from "/src/util";
import {
  langList,
  langListOpposite,
  ocrLangList,
  listenLangList,
} from "/src/util/lang.js";

var langListWithAuto = util.concatJson({ Auto: "auto" }, langList); //copy lang and add auto
var langListWithNone = util.concatJson({ None: "null" }, langList); //copy lang and add none
var langListWithDefault = util.concatJson({ Default: "default" }, langList); //copy lang

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
var distanceList = util.getRangeOption(0, 41);
var tooltipIntervalTimeList = util.getRangeOption(0.1, 2.1, 0.1, 1);

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

var keyListWithAlwaysSelect = _.cloneDeep(keyList); //copy lang and add auto
keyListWithAlwaysSelect["Select"] = "select";
keyListWithAlwaysSelect["Always"] = "always";

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

var textAlignList = {
  Center: "center",
  Left: "left",
  Right: "right",
  Justify: "justify",
};

var speechTextTargetList = {
  Source: "source",
  Translated: "target",
  "Source & Translated": "sourcetarget",
};

var settingListData = {
  showTooltipWhen: {
    description: browser.i18n.getMessage("Show_Tooltip_When"), // public/_locales/en/messages.json is used
    optionList: keyListWithAlways,
  },
  TTSWhen: {
    description: browser.i18n.getMessage("Voice_When"),
    optionList: keyListWithAlwaysSelect,
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
    optionList: distanceList,
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
    optionList: textAlignList,
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

var speechTabData = {
  speechRecognitionLanguage: {
    description: browser.i18n.getMessage("Speech_Recognition_Language"),
    optionList: listenLangList,
  },
  keySpeechRecognition: {
    description: browser.i18n.getMessage("Speech_Recognition_When"),
    optionList: keyList,
  },
  voicePanelTranslateLanguage: {
    description: browser.i18n.getMessage("Voice_Panel_Translate_Language"),
    optionList: langListWithDefault,
  },
  voicePanelTextTarget: {
    description: browser.i18n.getMessage("Voice_Panel_Text_Target"),
    optionList: speechTextTargetList,
  },
  voicePanelPadding: {
    description: browser.i18n.getMessage("Voice_Panel_Padding"),
    optionList: distanceList,
  },
  voicePanelTextAlign: {
    description: browser.i18n.getMessage("Voice_Panel_Text_Align"),
    optionList: textAlignList,
  },
  voicePanelSourceFontSize: {
    description: browser.i18n.getMessage("Voice_Panel_Source_Font_Size"),
    optionList: tooltipFontSizeList,
  },
  voicePanelTargetFontSize: {
    description: browser.i18n.getMessage("Voice_Panel_Target_Font_Size"),
    optionList: tooltipFontSizeList,
  },
  voicePanelSourceFontColor: {
    description: browser.i18n.getMessage("Voice_Panel_Source_Font_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  voicePanelTargetFontColor: {
    description: browser.i18n.getMessage("Voice_Panel_Target_Font_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  voicePanelSourceBorderColor: {
    description: browser.i18n.getMessage("Voice_Panel_Source_Border_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  voicePanelTargetBorderColor: {
    description: browser.i18n.getMessage("Voice_Panel_Target_Border_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
  },
  voicePanelBackgroundColor: {
    description: browser.i18n.getMessage("Voice_Panel_Background_Color"),
    optionType: "colorPicker",
    menu: false,
    optionList: {},
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
  tooltipEventInterval: {
    description: browser.i18n.getMessage("Tooltip_Interval_Time"),
    optionList: tooltipIntervalTimeList,
  },
  tooltipWordDictionary: {
    description: browser.i18n.getMessage("Tooltip_Word_Dictionary"),
    optionList: toggleList,
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
  SPEECH: speechTabData,
  ADVANCED: advancedTabData,
  EXCLUDE: excludeTabData,
};
var tabs = {
  MAIN: browser.i18n.getMessage("MAIN"),
  GRAPHIC: browser.i18n.getMessage("GRAPHIC"),
  VOICE: browser.i18n.getMessage("VOICE"),
  SPEECH: browser.i18n.getMessage("SPEECH"),
  ADVANCED: browser.i18n.getMessage("ADVANCED"),
  EXCLUDE: browser.i18n.getMessage("EXCLUDE"),
};

var remainSettingDesc = {
  appName: browser.i18n.getMessage("Mouse_Tooltip_Translator"),
  Voice_for_: browser.i18n.getMessage("Voice_for_"),
};

var langPriorityOptionList = [
  "translateSource",
  "translateTarget",
  "writingLanguage",
  "translateReverseTarget",
];

var toolbarIcons = {
  card: {
    title: "card",
    icon: "mdi-card-multiple",
    path: "/deck",
  },
  history: {
    title: "history",
    icon: "mdi-history",
    path: "/history",
  },
  about: {
    title: "about",
    icon: "mdi-menu",
    path: "/about",
  },
};

export default {
  name: "PopupView",
  data() {
    return {
      currentTab: "MAIN",
      tabs,
      tabItems,
      remainSettingDesc,
      options: {
        mask: "!#XXXXXXXX",
        tokens: {
          X: { pattern: /[0-9a-fA-F]/ },
        },
      },
      currentPage: "main",
      toolbarIcons,
    };
  },
  async mounted() {
    await this.addTtsVoiceTabOption();
    await this.waitSettingLoad();
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    settingWrapper() {
      return Object.assign({}, this.setting);
    },
  },
  watch: {
    settingWrapper: {
      deep: true,
      handler(newSetting, oldSetting) {
        // use wrapper to detect new old comparable
        this.checkSettingLangPriority(newSetting, oldSetting);
      },
    },
  },

  methods: {
    wrapTitleValueJson(inputList, optionName) {
      // convert {key:item}  as {title:key, value:item}
      var textValList = [];
      for (const [key2, val2] of Object.entries(inputList)) {
        textValList.push({
          title: key2,
          value: val2,
        });
      }
      //sort priority option
      textValList = this.sortLangOption(textValList, optionName);
      return textValList;
    },
    sortLangOption(textValList, optionName) {
      if (!langPriorityOptionList.includes(optionName)) {
        return textValList;
      }
      textValList.sort((i1, i2) => {
        var i1Priority = this.setting?.["langPriority"]?.[i1.value] || 0;
        var i2Priority = this.setting?.["langPriority"]?.[i2.value] || 0;
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
          optionList: voiceOptionList,
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
<style scoped>
.scroll-container {
  height: calc(100vh - 112px);
}
</style>
