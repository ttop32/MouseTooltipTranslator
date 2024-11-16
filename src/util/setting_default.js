export var defaultData = {
  showTooltipWhen: "always",
  TTSWhen: "ControlLeft",
  translateWhen: "mouseoverselect",
  translateSource: "auto",
  //translateTarget: getDefaultLang(),
  translatorVendor: "google",
  mouseoverTextType: "sentence",
  writingLanguage: "en",
  ocrLang: "jpn_vert",
  translateReverseTarget: "null",

  // voice
  voiceVolume: "1.0",
  voiceRate: "1.0",
  voiceTarget: "source",
  voiceRepeat: "1",

  // graphic
  tooltipFontSize: "18",
  tooltipWidth: "200",
  tooltipDistance: "20",
  tooltipAnimation: "fade",
  tooltipPosition: "follow",
  tooltipTextAlign: "center",
  tooltipBackgroundBlur: "6",
  mouseoverHighlightText: "false",
  tooltipFontColor: "#ffffffff",
  tooltipBackgroundColor: "#00000080",
  tooltipBorderColor: "#ffffff00",
  mouseoverTextHighlightColor: "#21dc6d40",

  // speech
  speechRecognitionLanguage: "en-US",
  keySpeechRecognition: "ControlRight",
  voicePanelTranslateLanguage: "default",
  voicePanelTextTarget: "sourcetarget",
  voicePanelPadding: "20",
  voicePanelTextAlign: "center",
  voicePanelSourceFontSize: "18",
  voicePanelTargetFontSize: "18",
  voicePanelSourceFontColor: "#ffffffff",
  voicePanelTargetFontColor: "#ffffffff",
  voicePanelSourceBorderColor: "#000000b8",
  voicePanelTargetBorderColor: "#000000b8",
  voicePanelBackgroundColor: "#002918",

  //advanced
  keyDownTranslateWriting: "AltRight",
  keyDownOCR: "ShiftLeft",
  keyDownAutoReader: "F2",
  detectSubtitle: "dualsub",
  detectPDF: "true",
  mouseoverPauseSubtitle: "true",
  keyDownMouseoverTextSwap: "null",
  tooltipInfoSourceText: "false",
  tooltipInfoSourceLanguage: "false",
  tooltipInfoTransliteration: "false",
  tooltipWordDictionary: "true",

  // exclude
  langExcludeList: [],
  websiteExcludeList: ["*.example.com"],

  // remains
  subtitleButtonToggle: "true",
  historyList: [],
  historyRecordActions: [],
  ignoreCallbackOptionList: ["historyList"],
  popupCount: "0",
  coffeeCount: "0",
  langPriority: { auto: 9999999, null: 9999999 },
  tooltipEventInterval: "0.3",

  cardPlayMeta: ["image"],
  cardTagSelected: [],
  deckStatus: {},
  cardLen: {},
};
