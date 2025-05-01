import browser from "webextension-polyfill";
import TextUtil from "/src/util/text_util.js";
import {
  langList,
  langListOpposite,
  ocrLangList,
  listenLangList,
} from "/src/util/lang.js";
import _util from "/src/util/lodash_util.js";



var langListWithAuto = TextUtil.concatJson({ Auto: "auto" }, langList); //copy lang and add auto
var langListWithNone = TextUtil.concatJson({ None: "null" }, langList); //copy lang and add none
var langListWithDefault = TextUtil.concatJson({ Default: "default" }, langList); //copy lang

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
  "F2": "F2",
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


var defaultDict={
  "Default": "default",
}

var voiceRateListWithDefault = TextUtil.concatJson(defaultDict, voiceRateList);


export var settingDict = {
  // main
  showTooltipWhen: {
    default: "always",
    description: browser.i18n.getMessage("Show_Tooltip_When"),
    optionList: keyListWithAlways,
    settingTab: "main",
  },
  TTSWhen: {
    default: "ControlLeft",
    description: browser.i18n.getMessage("Voice_When"),
    optionList: keyListWithAlwaysSelect,
    settingTab: "main",
  },
  translateWhen: {
    default: "mouseoverselect",
    description: browser.i18n.getMessage("Translate_When"),
    optionList: translateActionList,
    settingTab: "main",
  },
  translateSource: {
    default: "auto",
    description: browser.i18n.getMessage("Translate_From"),
    optionList: langListWithAuto,
    settingTab: "main",
  },
  translatorVendor: {
    default: "google",
    description: browser.i18n.getMessage("Translator_Engine"),
    optionList: translatorList,
    settingTab: "main",
  },
  mouseoverTextType: {
    default: "sentence",
    description: browser.i18n.getMessage("Mouseover_Text_Type"),
    optionList: detectTypeList,
    settingTab: "main",
  },
  writingLanguage: {
    default: "en",
    description: browser.i18n.getMessage("Writing_Language"),
    optionList: langList,
    settingTab: "main",
  },
  ocrLang: {
    default: "jpn_vert",
    description: browser.i18n.getMessage("OCR_Language"),
    optionList: ocrLangList,
    settingTab: "main",
  },
  translateReverseTarget: {
    default: "null",
    description: browser.i18n.getMessage("Reverse_Translate_Language"),
    optionList: langListWithNone,
    settingTab: "main",
  },

  // voice
  voiceVolume: {
    default: "1.0",
    description: browser.i18n.getMessage("Voice_Volume"),
    optionList: voiceVolumeList,
    settingTab: "voice",
  },
  voiceRate: {
    default: "1.0",
    description: browser.i18n.getMessage("Voice_Speed"),
    optionList: voiceRateList,
    settingTab: "voice",
  },
  voiceTarget: {
    default: "source",
    description: browser.i18n.getMessage("Voice_Target"),
    optionList: voiceTargetList,
    settingTab: "voice",
  },
  voiceRepeat: {
    default: "1",
    description: browser.i18n.getMessage("Voice_Repeat"),
    optionList: voiceRepeatList,
    settingTab: "voice",
  },

  // graphic
  tooltipFontSize: {
    default: "18",
    description: browser.i18n.getMessage("Tooltip_Font_Size"),
    optionList: tooltipFontSizeList,
    settingTab: "graphic",
  },
  tooltipWidth: {
    default: "200",
    description: browser.i18n.getMessage("Tooltip_Width"),
    optionList: tooltipWidth,
    settingTab: "graphic",
  },
  tooltipDistance: {
    default: "20",
    description: browser.i18n.getMessage("Tooltip_Distance"),
    optionList: distanceList,
    settingTab: "graphic",
  },
  tooltipAnimation: {
    default: "fade",
    description: browser.i18n.getMessage("Tooltip_Animation"),
    optionList: tooltipAnimationList,
    settingTab: "graphic",
  },
  tooltipPosition: {
    default: "follow",
    description: browser.i18n.getMessage("Tooltip_Position"),
    optionList: tooltipPositionList,
    settingTab: "graphic",
  },
  tooltipTextAlign: {
    default: "center",
    description: browser.i18n.getMessage("Tooltip_Text_Align"),
    optionList: textAlignList,
    settingTab: "graphic",
  },
  tooltipBackgroundBlur: {
    default: "6",
    description: browser.i18n.getMessage("Tooltip_Background_Blur"),
    optionList: tooltipBackgroundBlurList,
    settingTab: "graphic",
  },
  mouseoverHighlightText: {
    default: "false",
    description: browser.i18n.getMessage("Mouseover_Highlight_Text"),
    optionList: toggleList,
    settingTab: "graphic",
  },
  tooltipFontColor: {
    default: "#ffffffff",
    description: browser.i18n.getMessage("Tooltip_Font_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },
  tooltipBackgroundColor: {
    default: "#00000080",
    description: browser.i18n.getMessage("Tooltip_Background_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },
  tooltipBorderColor: {
    default: "#ffffff00",
    description: browser.i18n.getMessage("Tooltip_Border_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },
  mouseoverTextHighlightColor: {
    default: "#21dc6d40",
    description: browser.i18n.getMessage("Mouseover_Text_Highlight_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "graphic",
  },

  // speech
  speechRecognitionLanguage: {
    default: "en-US",
    description: browser.i18n.getMessage("Speech_Recognition_Language"),
    optionList: listenLangList,
    settingTab: "speech",
  },
  keySpeechRecognition: {
    default: "ControlRight",
    description: browser.i18n.getMessage("Speech_Recognition_When"),
    optionList: keyList,
    settingTab: "speech",
  },
  voicePanelTranslateLanguage: {
    default: "default",
    description: browser.i18n.getMessage("Voice_Panel_Translate_Language"),
    optionList: langListWithDefault,
    settingTab: "speech",
  },
  voicePanelTextTarget: {
    default: "sourcetarget",
    description: browser.i18n.getMessage("Voice_Panel_Text_Target"),
    optionList: speechTextTargetList,
    settingTab: "speech",
  },
  voicePanelPadding: {
    default: "20",
    description: browser.i18n.getMessage("Voice_Panel_Padding"),
    optionList: distanceList,
    settingTab: "speech",
  },
  voicePanelTextAlign: {
    default: "center",
    description: browser.i18n.getMessage("Voice_Panel_Text_Align"),
    optionList: textAlignList,
    settingTab: "speech",
  },
  voicePanelSourceFontSize: {
    default: "18",
    description: browser.i18n.getMessage("Voice_Panel_Source_Font_Size"),
    optionList: tooltipFontSizeList,
    settingTab: "speech",
  },
  voicePanelTargetFontSize: {
    default: "18",
    description: browser.i18n.getMessage("Voice_Panel_Target_Font_Size"),
    optionList: tooltipFontSizeList,
    settingTab: "speech",
  },
  voicePanelSourceFontColor: {
    default: "#ffffffff",
    description: browser.i18n.getMessage("Voice_Panel_Source_Font_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelTargetFontColor: {
    default: "#ffffffff",
    description: browser.i18n.getMessage("Voice_Panel_Target_Font_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelSourceBorderColor: {
    default: "#000000b8",
    description: browser.i18n.getMessage("Voice_Panel_Source_Border_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelTargetBorderColor: {
    default: "#000000b8",
    description: browser.i18n.getMessage("Voice_Panel_Target_Border_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },
  voicePanelBackgroundColor: {
    default: "#002918",
    description: browser.i18n.getMessage("Voice_Panel_Background_Color"),
    optionList: {},
    optionType: "colorPicker",
    menu: false,
    settingTab: "speech",
  },

  // advanced
  keyDownTranslateWriting: {
    default: "AltRight",
    description: browser.i18n.getMessage("Translate_Writing_When"),
    optionList: keyList,
    settingTab: "advanced",
  },
  keyDownOCR: {
    default: "ShiftLeft",
    description: browser.i18n.getMessage("OCR_When"),
    optionList: keyListWithAlways,
    settingTab: "advanced",
  },
  keyDownAutoReader: {
    default: "F2",
    description: browser.i18n.getMessage("Auto_Reader_When"),
    optionList: keyList,
    settingTab: "advanced",
  },
  detectSubtitle: {
    default: "dualsub",
    description: browser.i18n.getMessage("Detect_Subtitle"),
    optionList: subtitleTypeList,
    settingTab: "advanced",
  },
  detectPDF: {
    default: "true",
    description: browser.i18n.getMessage("Detect_PDF"),
    optionList: toggleList,
    settingTab: "advanced",
  },
  mouseoverPauseSubtitle: {
    default: "true",
    description: browser.i18n.getMessage("Mouseover_Pause_Subtitle"),
    optionList: toggleList,
    settingTab: "advanced",
  },
  keyDownMouseoverTextSwap: {
    default: "null",
    description: browser.i18n.getMessage("Mouseover_Text_Type_Swap_Key"),
    optionList: keyList,
    settingTab: "advanced",
  },
  tooltipInfoSourceText: {
    default: "false",
    description: browser.i18n.getMessage("Tooltip_Info_Source_Text"),
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipInfoSourceLanguage: {
    default: "false",
    description: browser.i18n.getMessage("Tooltip_Info_Source_Language"),
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipInfoTransliteration: {
    default: "false",
    description: browser.i18n.getMessage("Tooltip_Info_Transliteration"),
    optionList: toggleList,
    settingTab: "advanced",
  },
  tooltipWordDictionary: {
    default: "true",
    description: browser.i18n.getMessage("Tooltip_Word_Dictionary"),
    optionList: toggleList,
    settingTab: "advanced",
  },
  voiceTranslatedRate: {
    default: "default",
    description: browser.i18n.getMessage("Voice_Translated_Speed"),
    optionList: voiceRateListWithDefault,
    settingTab: "advanced",
  },

  // exclude
  langExcludeList: {
    default: [],
    description: browser.i18n.getMessage("Exclude_Language"),
    optionList: langList,
    optionType: "multipleSelect",
    settingTab: "exclude",
  },
  websiteExcludeList: {
    default: ["*.example.com"],
    description: browser.i18n.getMessage("Exclude_Website"),
    optionList: "",
    optionType: "comboBox",
    settingTab: "exclude",
  },

  // remains
  subtitleButtonToggle: {
    default: "true",
    description: browser.i18n.getMessage("Subtitle_Button_Toggle"),
    optionList: toggleList,
    settingTab: "remains",
  },
  historyList: {
    default: [],
    description: browser.i18n.getMessage("History_List"),
    optionList: [],
    settingTab: "remains",
  },
  historyRecordActions: {
    default: [],
    description: browser.i18n.getMessage("History_Record_Actions"),
    optionList: [],
    settingTab: "remains",
  },
  ignoreCallbackOptionList: {
    default: ["historyList"],
    description: browser.i18n.getMessage("Ignore_Callback_Option_List"),
    optionList: [],
    settingTab: "remains",
  },
  popupCount: {
    default: "0",
    description: browser.i18n.getMessage("Popup_Count"),
    optionList: [],
    settingTab: "remains",
  },
  coffeeCount: {
    default: "0",
    description: browser.i18n.getMessage("Coffee_Count"),
    optionList: [],
    settingTab: "remains",
  },
  langPriority: {
    default: { auto: 9999999, null: 9999999 },
    description: browser.i18n.getMessage("Language_Priority"),
    optionList: [],
    settingTab: "remains",
  },
  tooltipEventInterval: {
    default: "0.3",
    description: browser.i18n.getMessage("Tooltip_Interval_Time"),
    optionList: tooltipIntervalTimeList,
    settingTab: "remains",
  },
  cardPlayMeta: {
    default: ["image"],
    description: browser.i18n.getMessage("Card_Play_Meta"),
    optionList: [],
    settingTab: "remains",
  },
  cardTagSelected: {
    default: [],
    description: browser.i18n.getMessage("Card_Tag_Selected"),
    optionList: [],
    settingTab: "remains",
  },
  deckStatus: {
    default: {},
    description: browser.i18n.getMessage("Deck_Status"),
    optionList: [],
    settingTab: "remains",
  },
  cardLen: {
    default: {},
    description: browser.i18n.getMessage("Card_Length"),
    optionList: [],
    settingTab: "remains",
  },
};


// Default values for settings get only default key
export var defaultData = Object.fromEntries(
  Object.entries(settingDict).map(([key, value]) => [key, value.default])
);
