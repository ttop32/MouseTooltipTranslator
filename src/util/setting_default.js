import TextUtil from "/src/util/text_util.js";
import { langList, ocrLangList, listenLangList } from "/src/util/lang.js";
import _util from "/src/util/lodash_util.js";
var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}

var langListWithAuto = TextUtil.concatJson({ Auto: "auto" }, langList); //copy lang and add auto
var langListWithNone = TextUtil.concatJson({ None: "null" }, langList); //copy lang and add none
var langListWithDefault = TextUtil.concatJson({ Default: "default" }, langList); //copy lang

var toggleList = {
  On: "true",
  Off: "false",
};

var keyList = {
  None: "null",
  Ctrl_Left: "ControlLeft",
  Ctrl_Right: "ControlRight",
  Alt_Left: "AltLeft",
  Alt_Right: "AltRight",
  Shift_Left: "ShiftLeft",
  Shift_Right: "ShiftRight",
  Meta_Left: "MetaLeft",
  Meta_Right: "MetaRight",
  Click_Left: "ClickLeft",
  Click_Middle: "ClickMiddle",
  Click_Right: "ClickRight",
  F2: "F2",
  F8: "F8",
  F9: "F9",
};

var translatorList = {
  google: "google",
  bing: "bing",
  "deepl (Experimental)": "deepl",
  "yandex (Experimental)": "yandex",
  "baidu (Experimental)": "baidu",
  "papago (Experimental)": "papago",
  "browser API (Experimental)": "browserAPI",
  "googleWebImage (Experimental)": "googleWebImage",
  "googleGTX (Experimental)": "googleGTX",
  "googleWeb (Experimental)": "googleWeb",
  "googleV2 (Experimental)": "googleV2",
  // "chatgpt (Experimental)": "chatgpt",
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
  Mouseover_n_Select: "mouseoverselect",
};

var tooltipFontSizeList = _util.getRangeOption(6, 41, 2, 0);
var tooltipWidth = _util.getRangeOption(100, 1001, 100, 0);
var voiceVolumeList = _util.getRangeOption(0, 1.1, 0.1, 1);
var voiceRateList = _util.getRangeOption(0.5, 2.1, 0.1, 1);
var voiceRepeatList = _util.getRangeOption(1, 11);
var tooltipBackgroundBlurList = _util.getRangeOption(0, 21);
var distanceList = _util.getRangeOption(0, 41);
var tooltipIntervalTimeList = _util.getRangeOption(0.1, 2.1, 0.1, 1);

var tooltipPositionList = {
  Follow: "follow",
  Fixed: "fixed",
};
var tooltipAnimationList = {
  None: "",
  Fade: "fade",
  Scale: "scale",
  Shift_away: "shift-away",
  Shift_toward: "shift-toward",
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
  Source_Text: "source",
  Translated_Text: "target",
  Source_n_Translated: "sourcetarget",
  Translated_n_Source: "targetsource",
};

var subtitleTypeList = {
  Dual_Subtitle: "dualsub",
  Target_Single_Subtitle: "targetsinglesub",
  Source_Single_Subtitle: "sourcesinglesub",
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
  Source_n_Translated: "sourcetarget",
};

var defaultDict = {
  Default: "default",
};

var voiceRateListWithDefault = TextUtil.concatJson(defaultDict, voiceRateList);

export var settingDict = {
  // main

  translateSource: {
    default: "auto",
    i18nKey: "Translate_From",
    optionList: langListWithAuto,
    settingTab: "main",
  },
  translateTarget: {
    default: "en",
    i18nKey: "Translate_Into",
    optionList: langList,
    settingTab: "main",
  },
  translatorVendor: {
    default: "google",
    i18nKey: "Translator_Engine",
    optionList: translatorList,
    settingTab: "main",
  },
  translateWhen: {
    default: "mouseoverselect",
    i18nKey: "Translate_When",
    optionList: translateActionList,
    settingTab: "main",
  },
  mouseoverTextType: {
    default: "sentence",
    i18nKey: "Mouseover_Text_Type",
    optionList: detectTypeList,
    settingTab: "main",
  },
  writingLanguage: {
    default: "en",
    i18nKey: "Writing_Language",
    optionList: langList,
    settingTab: "main",
  },
  ocrLang: {
    default: "jpn_vert",
    i18nKey: "OCR_Language",
    optionList: ocrLangList,
    settingTab: "main",
  },
  translateReverseTarget: {
    default: "null",
    i18nKey: "Reverse_Translate_Language",
    optionList: langListWithNone,
    settingTab: "main",
  },
  detectSubtitle: {
    default: "dualsub",
    i18nKey: "Detect_Subtitle",
    optionList: subtitleTypeList,
    settingTab: "main",
  },

  // keyboard
  showTooltipWhen: {
    default: "always",
    i18nKey: "Show_Tooltip_When",
    optionList: keyListWithAlways,
    settingTab: "keyboard",
  },
  TTSWhen: {
    default: "ControlLeft",
    i18nKey: "Voice_When",
    optionList: keyListWithAlwaysSelect,
    settingTab: "keyboard",
  },
  keyDownTranslateWriting: {
    default: "AltRight",
    i18nKey: "Translate_Writing_When",
    optionList: keyList,
    settingTab: "keyboard",
  },
  keyDownAutoReader: {
    default: "F2",
    i18nKey: "Auto_Reader_When",
    optionList: keyList,
    settingTab: "keyboard",
  },
  keyDownOCR: {
    default: "ShiftLeft",
    i18nKey: "OCR_When",
    optionList: keyListWithAlways,
    settingTab: "keyboard",
  },
  keySpeechRecognition: {
    default: "ControlRight",
    i18nKey: "Speech_Recognition_When",
    optionList: keyList,
    settingTab: "keyboard",
  },
  keyToggleMouseoverTextType: {
    default: "F8",
    i18nKey: "Toggle_Mouseover_Text_Type_When",
    optionList: keyList,
    settingTab: "keyboard",
  },

  // voice
  voiceVolume: {
    default: "1.0",
    i18nKey: "Voice_Volume",
    optionList: voiceVolumeList,
    settingTab: "voice",
  },
  voiceRate: {
    default: "1.0",
    i18nKey: "Voice_Speed",
    optionList: voiceRateList,
    settingTab: "voice",
  },
  voiceTarget: {
    default: "source",
    i18nKey: "Voice_Target",
    optionList: voiceTargetList,
    settingTab: "voice",
  },
  voiceRepeat: {
    default: "1",
    i18nKey: "Voice_Repeat",
    optionList: voiceRepeatList,
    settingTab: "voice",
  },

  // graphic
  tooltipFontSize: {
    default: "18",
    i18nKey: "Tooltip_Font_Size",
    optionList: tooltipFontSizeList,
    settingTab: "graphic",
  },
  tooltipWidth: {
    default: "200",
    i18nKey: "Tooltip_Width",
    optionList: tooltipWidth,
    settingTab: "graphic",
  },
  tooltipDistance: {
    default: "20",
    i18nKey: "Tooltip_Distance",
    optionList: distanceList,
    settingTab: "graphic",
  },
  tooltipAnimation: {
    default: "fade",
    i18nKey: "Tooltip_Animation",
    optionList: tooltipAnimationList,
    settingTab: "graphic",
  },
  tooltipPosition: {
    default: "follow",
    i18nKey: "Tooltip_Position",
    optionList: tooltipPositionList,
    settingTab: "graphic",
  },
  tooltipTextAlign: {
    default: "center",
    i18nKey: "Tooltip_Text_Align",
    optionList: textAlignList,
    settingTab: "graphic",
  },
  tooltipBackgroundBlur: {
    default: "6",
    i18nKey: "Tooltip_Background_Blur",
    optionList: tooltipBackgroundBlurList,
    settingTab: "graphic",
  },
  mouseoverHighlightText: {
    default: "false",
    i18nKey: "Mouseover_Highlight_Text",
    optionList: toggleList,
    settingTab: "graphic",
  },
  tooltipFontColor: {
    default: "#ffffffff",
    i18nKey: "Tooltip_Font_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },
  tooltipBackgroundColor: {
    default: "#00000080",
    i18nKey: "Tooltip_Background_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },
  tooltipBorderColor: {
    default: "#ffffff00",
    i18nKey: "Tooltip_Border_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },
  mouseoverTextHighlightColor: {
    default: "#21dc6d40",
    i18nKey: "Mouseover_Text_Highlight_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },


  // exclude
  langExcludeList: {
    default: [],
    i18nKey: "Exclude_Language",
    optionList: langList,
    optionType: "multipleSelect",
    settingTab: "exclude",
  },
  websiteExcludeList: {
    default: ["*.example.com"],
    i18nKey: "Exclude_Website",
    optionList: "",
    optionType: "comboBox",
    settingTab: "exclude",
  },
  websiteWhiteList: {
    default: [],
    i18nKey: "Whitelist_Website",
    optionList: "",
    optionType: "comboBox",
    settingTab: "exclude",
  },
  websiteExcludeBtn: {
    i18nKey: "Block_Current_site",
    optionList: [],
    settingTab: "exclude",
    optionType: "button",
    icon: "mdi-web-cancel",
    color: "red",
    onClick: () => {},
    onClickFuncName: "excludeCurrentWebsiteOnclickFunc",
  },
  websiteWhitelistBtn: {
    i18nKey: "Allow_Current_site",
    optionList: [],
    settingTab: "exclude",
    optionType: "button",
    icon: "mdi-web-check",
    color: "green",
    onClick: () => {},
    onClickFuncName: "includeWhitelistCurrentWebsiteOnclickFunc",
  },
  
  // advanced

  detectPDF: {
    default: "true",
    i18nKey: "Detect_PDF",
    optionList: toggleList,
    settingTab: "advanced",
  },
  mouseoverPauseSubtitle: {
    default: "true",
    i18nKey: "Mouseover_Pause_Subtitle",
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipInfoSourceText: {
    default: "false",
    i18nKey: "Tooltip_Info_Source_Text",
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipInfoSourceLanguage: {
    default: "false",
    i18nKey: "Tooltip_Info_Source_Language",
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipInfoTransliteration: {
    default: "false",
    i18nKey: "Tooltip_Info_Transliteration",
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipWordDictionary: {
    default: "true",
    i18nKey: "Tooltip_Word_Dictionary",
    optionList: toggleList,
    settingTab: "advanced",
  },
  voiceTranslatedRate: {
    default: "default",
    i18nKey: "Voice_Translated_Speed",
    optionList: voiceRateListWithDefault,
    settingTab: "advanced",
  },
  fallbackTranslatorEngine: {
    default: "true",
    i18nKey: "Fallback_Translator_Engine",
    optionList: toggleList,
    settingTab: "advanced",
  },


  // speech
  speechRecognitionLanguage: {
    default: "en-US",
    i18nKey: "Speech_Recognition_Language",
    optionList: listenLangList,
    settingTab: "speech",
  },

  voicePanelTranslateLanguage: {
    default: "default",
    i18nKey: "Voice_Panel_Translate_Language",
    optionList: langListWithDefault,
    settingTab: "speech",
  },
  voicePanelTextTarget: {
    default: "sourcetarget",
    i18nKey: "Voice_Panel_Text_Target",
    optionList: speechTextTargetList,
    settingTab: "speech",
  },
  voicePanelPadding: {
    default: "20",
    i18nKey: "Voice_Panel_Padding",
    optionList: distanceList,
    settingTab: "speech",
  },
  voicePanelTextAlign: {
    default: "center",
    i18nKey: "Voice_Panel_Text_Align",
    optionList: textAlignList,
    settingTab: "speech",
  },
  voicePanelSourceFontSize: {
    default: "18",
    i18nKey: "Voice_Panel_Source_Font_Size",
    optionList: tooltipFontSizeList,
    settingTab: "speech",
  },
  voicePanelTargetFontSize: {
    default: "18",
    i18nKey: "Voice_Panel_Target_Font_Size",
    optionList: tooltipFontSizeList,
    settingTab: "speech",
  },
  voicePanelSourceFontColor: {
    default: "#ffffffff",
    i18nKey: "Voice_Panel_Source_Font_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelTargetFontColor: {
    default: "#ffffffff",
    i18nKey: "Voice_Panel_Target_Font_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelSourceBorderColor: {
    default: "#000000b8",
    i18nKey: "Voice_Panel_Source_Border_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelTargetBorderColor: {
    default: "#000000b8",
    i18nKey: "Voice_Panel_Target_Border_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelBackgroundColor: {
    default: "#333333",
    i18nKey: "Voice_Panel_Background_Color",
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  

  // remains
  subtitleButtonToggle: {
    default: "true",
    i18nKey: "Subtitle_Button_Toggle",
    optionList: toggleList,
    settingTab: "remains",
  },
  historyList: {
    default: [],
    i18nKey: "History_List",
    optionList: [],
    settingTab: "remains",
  },
  historyRecordActions: {
    default: [],
    i18nKey: "History_Record_Actions",
    optionList: [],
    settingTab: "remains",
  },
  ignoreCallbackOptionList: {
    default: ["historyList"],
    i18nKey: "Ignore_Callback_Option_List",
    optionList: [],
    settingTab: "remains",
  },
  popupCount: {
    default: "0",
    i18nKey: "Popup_Count",
    optionList: [],
    settingTab: "remains",
  },
  coffeeCount: {
    default: "0",
    i18nKey: "Coffee_Count",
    optionList: [],
    settingTab: "remains",
  },
  langPriority: {
    default: { auto: 9999999, null: 9999999 },
    i18nKey: "Language_Priority",
    optionList: [],
    settingTab: "remains",
  },
  mouseoverEventInterval: {
    default: "300",
    i18nKey: "Mouseover_Event_Interval",
    optionList: tooltipIntervalTimeList,
    settingTab: "remains",
  },
  cardPlayMeta: {
    default: ["image"],
    i18nKey: "Card_Play_Meta",
    optionList: [],
    settingTab: "remains",
  },
  cardTagSelected: {
    default: [],
    i18nKey: "Card_Tag_Selected",
    optionList: [],
    settingTab: "remains",
  },
  deckStatus: {
    default: {},
    i18nKey: "Deck_Status",
    optionList: [],
    settingTab: "remains",
  },
  cardLen: {
    default: {},
    i18nKey: "Card_Length",
    optionList: [],
    settingTab: "remains",
  },

  importSetting: {
    i18nKey: "Import_Setting",
    optionList: [],
    settingTab: "backup",
    optionType: "button",
    icon: "mdi-file-upload",
    color: "primary",
    onClick: () => {
      importSettingOnclickFunc();
    },
  },
  exportSetting: {
    i18nKey: "Export_Setting",
    optionList: [],
    settingTab: "backup",
    optionType: "button",
    icon: "mdi-content-save",
    color: "green",
    onClick: async () => {
      exportSettingOnclickFunc();
    },
  },
  resetSetting: {
    i18nKey: "Reset_Setting",
    optionList: [],
    settingTab: "backup",
    optionType: "button",
    icon: "mdi-restore",
    color: "red",
    onClick: () => {
      resetSettingOnclickFunc();
    },
  },
};

function importSettingOnclickFunc() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);

          browser.runtime.sendMessage({
            type: "importSetting",
            data: settings,
          });
        } catch (error) {
          console.error("Invalid JSON file:", error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

async function exportSettingOnclickFunc() {
  var data = await browser.runtime.sendMessage({
    type: "exportSetting",
  });
  const settings = JSON.stringify(data?.settingData, null, 2);
  const blob = new Blob([settings], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mouse-tooltip-translator-settings.json";
  a.click();
  URL.revokeObjectURL(url);
}

function resetSettingOnclickFunc() {
  browser.runtime.sendMessage({
    type: "resetSetting",
  });
}

// Default values for settings get only default key
export var defaultData = Object.fromEntries(
  Object.entries(settingDict).map(([key, value]) => [key, value.default])
);
