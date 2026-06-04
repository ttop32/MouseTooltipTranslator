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
  "LLM - OpenAI / Claude / Gemini / Local (Experimental)": "localLlm",
  "deepl (Experimental)": "deepl",
  "yandex (Experimental)": "yandex",
  "baidu (Experimental)": "baidu",
  "papago (Experimental)": "papago",
  "browser API (Experimental)": "browserAPI",
  "googleWebImage (Experimental)": "googleWebImage",
  "googleGTX (Experimental)": "googleGTX",
  "googleWeb (Experimental)": "googleWeb",
  "googleV2 (Experimental)": "googleV2",
  // "duckduckgo (Experimental)": "duckduckgo", // hidden: duck.ai added x-vqd-hash-1 challenge requiring page-context JS execution (impossible from MV3 service worker). deedy5/duckai and gpt4free DDG provider both archived/deprecated. Code retained for reference.
  // "chatgpt (Experimental)": "chatgpt", // hidden: chatgpt.com requires Turnstile/PoW challenges we cannot solve from MV3 service worker. Code retained for reference.
  // "lingva (Experimental)": "lingva",
  // "libreTranslate (Experimental)": "libreTranslate",
  // "myMemory (Experimental)": "myMemory",
  // "watson (Experimental)": "watson",
  // "pixabay (Experimental)": "pixabay",
  // "unsplash (Experimental)": "unsplash",
};

export var llmProviderEndpoints = {
  custom: "",
  openai: "https://api.openai.com/v1",
  claude: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  githubModels: "https://models.inference.ai.azure.com",
  ollama: "http://localhost:11434/v1",
  lmstudio: "http://localhost:1234/v1",
};

var llmProviderList = {
  Custom: "custom",
  "OpenAI (ChatGPT)": "openai",
  "Claude (Anthropic)": "claude",
  "Gemini (Google, free tier available)": "gemini",
  "Groq (free, fast Llama)": "groq",
  "OpenRouter (free models with :free suffix)": "openrouter",
  "GitHub Models (free with GitHub token)": "githubModels",
  "Ollama (local)": "ollama",
  "LM Studio (local)": "lmstudio",
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

var dictionarySourceList = {
  Translator: "translator",
  Wiktionary: "wiktionary",
};

var websiteFilterModeList = {
  Both: "auto", // exclude list blocks; a non-empty whitelist also restricts (legacy)
  Blacklist: "blacklist", // only the exclude list applies (run everywhere else)
  Whitelist: "whitelist", // only the whitelist applies (run nowhere else)
};

// UI language picker (#76). Keys are endonyms (shown as-is); values are the
// _locales directory names. "auto" follows the browser language.
var uiLanguageList = {
  Auto: "auto",
  English: "en",
  "English (UK)": "en_GB",
  "English (US)": "en_US",
  "English (Australia)": "en_AU",
  العربية: "ar",
  አማርኛ: "am",
  Български: "bg",
  বাংলা: "bn",
  Català: "ca",
  Čeština: "cs",
  Dansk: "da",
  Deutsch: "de",
  Ελληνικά: "el",
  Español: "es",
  "Español (Latinoamérica)": "es_419",
  Eesti: "et",
  فارسی: "fa",
  Suomi: "fi",
  Filipino: "fil",
  Français: "fr",
  ગુજરાતી: "gu",
  עברית: "he",
  हिन्दी: "hi",
  Hrvatski: "hr",
  Magyar: "hu",
  "Bahasa Indonesia": "id",
  Italiano: "it",
  日本語: "ja",
  ಕನ್ನಡ: "kn",
  한국어: "ko",
  Lietuvių: "lt",
  Latviešu: "lv",
  മലയാളം: "ml",
  मराठी: "mr",
  "Bahasa Melayu": "ms",
  Nederlands: "nl",
  Norsk: "no",
  Polski: "pl",
  "Português (Brasil)": "pt_BR",
  "Português (Portugal)": "pt_PT",
  Română: "ro",
  Русский: "ru",
  Slovenčina: "sk",
  Slovenščina: "sl",
  Српски: "sr",
  Svenska: "sv",
  Kiswahili: "sw",
  தமிழ்: "ta",
  తెలుగు: "te",
  ไทย: "th",
  Türkçe: "tr",
  Українська: "uk",
  "Tiếng Việt": "vi",
  "中文(简体)": "zh_CN",
  "中文(繁體)": "zh_TW",
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
  translateTarget2: {
    default: "null",
    i18nKey: "Translate_Into_2",
    optionList: langListWithNone,
    settingTab: "main",
  },
  translatorVendor: {
    default: "google",
    i18nKey: "Translator_Engine",
    optionList: translatorList,
    settingTab: "main",
  },
  llmProvider: {
    default: "custom",
    i18nKey: "LLM_Provider",
    optionList: llmProviderList,
    settingTab: "main",
    visibleWhen: (setting) => setting?.translatorVendor === "localLlm",
  },
  llmApiEndpoint: {
    default: "",
    i18nKey: "LLM_Api_Endpoint",
    optionList: {},
    optionType: "textField",
    inputType: "url",
    placeholder: "http://localhost:11434/v1",
    settingTab: "main",
    visibleWhen: (setting) => setting?.translatorVendor === "localLlm",
    readonlyWhen: (setting) =>
      setting?.llmProvider && setting.llmProvider !== "custom",
  },
  llmApiKey: {
    default: "",
    i18nKey: "LLM_Api_Key",
    optionList: {},
    optionType: "textField",
    inputType: "password",
    placeholder: "sk-...",
    settingTab: "main",
    visibleWhen: (setting) => setting?.translatorVendor === "localLlm",
  },
  llmModel: {
    default: "",
    i18nKey: "LLM_Model",
    optionList: {},
    optionType: "llmModelSelect",
    settingTab: "main",
    visibleWhen: (setting) => setting?.translatorVendor === "localLlm",
  },
  llmProviderSettings: {
    default: {},
    i18nKey: "LLM_Provider_Settings",
    optionList: [],
    settingTab: "remains",
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
  keyDownTranslatePage: {
    default: "null",
    i18nKey: "Translate_Page_When",
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
  keyHoldMouseoverTextType: {
    default: "F8",
    i18nKey: "Mouseover_Text_Type_Key_Hold",
    optionList: keyList,
    settingTab: "keyboard",
  },
  keySecondaryLang: {
    default: "null",
    i18nKey: "Secondary_Language_When",
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
  websiteFilterMode: {
    default: "auto",
    i18nKey: "Website_Filter_Mode",
    optionList: websiteFilterModeList,
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
    i18nKey: "Block_Current_Site",
    optionList: [],
    settingTab: "exclude",
    optionType: "button",
    icon: "mdi-web-cancel",
    color: "red",
    onClick: () => {},
    onClickFuncName: "excludeCurrentWebsiteOnclickFunc",
  },
  websiteWhitelistBtn: {
    i18nKey: "Allow_Current_Site",
    optionList: [],
    settingTab: "exclude",
    optionType: "button",
    icon: "mdi-web-check",
    color: "green",
    onClick: () => {},
    onClickFuncName: "includeWhitelistCurrentWebsiteOnclickFunc",
  },

  // advanced

  uiLanguage: {
    default: "auto",
    i18nKey: "UI_Language",
    optionList: uiLanguageList,
    settingTab: "advanced",
  },
  detectPDF: {
    default: "true",
    i18nKey: "Detect_PDF",
    optionList: toggleList,
    settingTab: "advanced",
  },
  mouseoverTextType2: {
    default: "sentence",
    i18nKey: "Mouseover_Text_Type_2",
    optionList: detectTypeList,
    settingTab: "advanced",
  },
  mouseoverPauseSubtitle: {
    default: "true",
    i18nKey: "Mouseover_Pause_Subtitle",
    optionList: toggleList,
    settingTab: "advanced",
  },
  mouseoverWhileWriting: {
    default: "false",
    i18nKey: "Show_Tooltip_While_Typing",
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
  tooltipWordDictionarySource: {
    default: "translator",
    i18nKey: "Tooltip_Word_Dictionary_Source",
    optionList: dictionarySourceList,
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
  wordGroups: {
    // saved-word groups; id 1 is the default group (not deletable).
    // color = in-page highlight background, enabled = highlight on/off.
    // groups start disabled so the whole history isn't highlighted at once.
    // Ctrl+Shift+1..5 save the current translation into group 1..5.
    default: [
      { id: 1, name: "Group 1", color: "#21dc6d40", enabled: false, key: "CtrlShift1" },
      { id: 2, name: "Group 2", color: "#2196f340", enabled: false, key: "CtrlShift2" },
      { id: 3, name: "Group 3", color: "#ff980040", enabled: false, key: "CtrlShift3" },
      { id: 4, name: "Group 4", color: "#9c27b040", enabled: false, key: "CtrlShift4" },
      { id: 5, name: "Group 5", color: "#f4433640", enabled: false, key: "CtrlShift5" },
    ],
    i18nKey: "Word_Groups",
    optionList: [],
    settingTab: "remains",
  },
  saveContextMenu: {
    // global toggle: show "Save to <group>" right-click menus for all groups
    default: false,
    i18nKey: "Save_Context_Menu",
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
  // the anchor must be in the document for the download to fire in some
  // browsers, and the object URL must outlive the click, else the download
  // silently does nothing (#264)
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
