import $ from "jquery";
import isUrl from "is-url";
import _ from "lodash";
import { iso6393To1 } from "iso-639-3";
import { francAll } from "franc";
import { parse } from "bcp-47";
import { waitUntil, WAIT_FOREVER } from "async-wait-until";
import { Setting } from "./setting.js";

var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {
  console.log(error);
}

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

  //advanced
  keyDownTranslateWriting: "AltRight",
  keyDownOCR: "ShiftLeft",
  detectSubtitle: "dualsub",
  detectPDF: "true",
  mouseoverPauseSubtitle: "true",
  keyDownMouseoverTextSwap: "null",
  tooltipInfoSourceText: "false",
  tooltipInfoSourceLanguage: "false",
  tooltipInfoTransliteration: "false",

  // graphic
  tooltipFontSize: "14",
  tooltipWidth: "200",
  tooltipDistance: "20",
  tooltipAnimation: "fade",
  tooltipPosition: "follow",
  tooltipTextAlign: "center",
  tooltipBackgroundBlur: "4",
  mouseoverHighlightText: "false",
  tooltipFontColor: "#ffffffff",
  tooltipBackgroundColor: "#000000b8",
  tooltipBorderColor: "#ffffff00",
  mouseoverTextHighlightColor: "#21dc6d40",

  // voice
  voiceVolume: "1.0",
  voiceRate: "1.0",
  voiceTarget: "source",
  voiceRepeat: "1",

  // exclude
  langExcludeList: [],
  websiteExcludeList: ["*.example.com"],

  // remains
  subtitleButtonToggle: "true",
  historyList: [],
  historyRecordActions: [],
  ignoreCallbackOptionList: ["historyList"],
  popupCount: "0",
  langPriority: { auto: 9999999, null: 9999999 },
  tooltipIntervalTime: "0.7",
};

var rtlLangList = [
  "ar", ///Arabic
  "az", ///Azerbaijani
  "bm", ///Bambara
  "dv", ///Dhivehi
  "doi", ///Dogri
  "ha", ///Hausa
  "iw", ///Hebrew
  "kk", ///Kazakh
  "ku", ///Kurdish
  "ckb", ///Kurdish Sorani
  "ky", ///Kyrgyz
  "ml", ///Malayalam
  "ps", ///Pashto
  "fa", ///Persian
  "sd", ///Sindhi
  "so", ///Somali
  "su", ///Sundanese
  "tg", ///Tajik
  "tk", ///Turkmen
  "ur", ///Urdu
  "ug", ///Uyghur
  "uz", ///Uzbek
  "yi", ///Yiddish
  "yo", ///Yoruba
]; //right to left language system list

var reviewUrlJson = {
  nnodgmifnfgkolmakhcfkkbbjjcobhbl:
    "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl",
  hmigninkgibhdckiaphhmbgcghochdjc:
    "https://chromewebstore.google.com/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
};

export var langList = {
  Afrikaans: "af",
  Albanian: "sq",
  Amharic: "am",
  Arabic: "ar",
  Armenian: "hy",
  Assamese: "as",
  Aymara: "ay",
  Azerbaijani: "az",
  Bambara: "bm",
  Basque: "eu",
  Belarusian: "be",
  Bengali: "bn",
  Bhojpuri: "bho",
  Bosnian: "bs",
  Bulgarian: "bg",
  Catalan: "ca",
  Cebuano: "ceb",
  ChineseSimplified: "zh-CN",
  ChineseTraditional: "zh-TW",
  Corsican: "co",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dhivehi: "dv",
  Dogri: "doi",
  Dutch: "nl",
  English: "en",
  Esperanto: "eo",
  Estonian: "et",
  Ewe: "ee",
  Filipino: "tl",
  Finnish: "fi",
  French: "fr",
  Frisian: "fy",
  Galician: "gl",
  Georgian: "ka",
  German: "de",
  Greek: "el",
  Guarani: "gn",
  Gujarati: "gu",
  HaitianCreole: "ht",
  Hausa: "ha",
  Hawaiian: "haw",
  Hebrew: "iw",
  Hindi: "hi",
  Hmong: "hmn",
  Hungarian: "hu",
  Icelandic: "is",
  Igbo: "ig",
  Ilocano: "ilo",
  Indonesian: "id",
  Irish: "ga",
  Italian: "it",
  Japanese: "ja",
  Javanese: "jw",
  Kannada: "kn",
  Kazakh: "kk",
  Khmer: "km",
  Kinyarwanda: "rw",
  Konkani: "gom",
  Korean: "ko",
  Krio: "kri",
  Kurdish: "ku",
  KurdishSorani: "ckb",
  Kyrgyz: "ky",
  Lao: "lo",
  Latin: "la",
  Latvian: "lv",
  Lingala: "ln",
  Lithuanian: "lt",
  Luganda: "lg",
  Luxembourgish: "lb",
  Macedonian: "mk",
  Maithili: "mai",
  Malagasy: "mg",
  Malay: "ms",
  Malayalam: "ml",
  Maltese: "mt",
  Maori: "mi",
  Marathi: "mr",
  // Meiteilon: "mni-Mtei",
  Mizo: "lus",
  Mongolian: "mn",
  Myanmar: "my",
  Nepali: "ne",
  Norwegian: "no",
  Nyanja: "ny",
  Odia: "or",
  Oromo: "om",
  Pashto: "ps",
  Persian: "fa",
  Polish: "pl",
  Portuguese: "pt",
  Punjabi: "pa",
  Quechua: "qu",
  Romanian: "ro",
  Russian: "ru",
  Samoan: "sm",
  Sanskrit: "sa",
  ScotsGaelic: "gd",
  Sepedi: "nso",
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
  Tatar: "tt",
  Telugu: "te",
  Thai: "th",
  Tigrinya: "ti",
  Tsonga: "ts",
  Turkish: "tr",
  Turkmen: "tk",
  Twi: "ak",
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

export var langListOpposite = _.invert(langList);

export var writingField =
  'input[type="text"], input[type="search"], input:not([type]), textarea, [contenteditable], [contenteditable="true"], [role=textbox], [spellcheck]';

var bingTtsVoiceList = {
  af: ["af-ZA-AdriNeural", "af-ZA-WillemNeural"],
  sq: ["sq-AL-AnilaNeural", "sq-AL-IlirNeural"],
  am: ["am-ET-AmehaNeural", "am-ET-MekdesNeural"],
  ar: [
    "ar-DZ-AminaNeural",
    "ar-DZ-IsmaelNeural",
    "ar-BH-AliNeural",
    "ar-BH-LailaNeural",
    "ar-EG-SalmaNeural",
    "ar-EG-ShakirNeural",
    "ar-IQ-BasselNeural",
    "ar-IQ-RanaNeural",
    "ar-JO-SanaNeural",
    "ar-JO-TaimNeural",
    "ar-KW-FahedNeural",
    "ar-KW-NouraNeural",
    "ar-LB-LaylaNeural",
    "ar-LB-RamiNeural",
    "ar-LY-ImanNeural",
    "ar-LY-OmarNeural",
    "ar-MA-JamalNeural",
    "ar-MA-MounaNeural",
    "ar-OM-AbdullahNeural",
    "ar-OM-AyshaNeural",
    "ar-QA-AmalNeural",
    "ar-QA-MoazNeural",
    "ar-SA-HamedNeural",
    "ar-SA-ZariyahNeural",
    "ar-SY-AmanyNeural",
    "ar-SY-LaithNeural",
    "ar-TN-HediNeural",
    "ar-TN-ReemNeural",
    "ar-AE-FatimaNeural",
    "ar-AE-HamdanNeural",
    "ar-YE-MaryamNeural",
    "ar-YE-SalehNeural",
  ],
  az: ["az-AZ-BabekNeural", "az-AZ-BanuNeural"],
  bn: [
    "bn-BD-NabanitaNeural",
    "bn-BD-PradeepNeural",
    "bn-IN-BashkarNeural",
    "bn-IN-TanishaaNeural",
  ],
  bs: ["bs-BA-GoranNeural", "bs-BA-VesnaNeural"],
  bg: ["bg-BG-BorislavNeural", "bg-BG-KalinaNeural"],
  my: ["my-MM-NilarNeural", "my-MM-ThihaNeural"],
  ca: ["ca-ES-EnricNeural", "ca-ES-JoanaNeural"],
  "zh-HK": [
    "zh-HK-HiuGaaiNeural",
    "zh-HK-HiuMaanNeural",
    "zh-HK-WanLungNeural",
  ],
  "zh-CN": [
    "zh-CN-XiaoxiaoNeural",
    "zh-CN-XiaoyiNeural",
    "zh-CN-YunjianNeural",
    "zh-CN-YunxiNeural",
    "zh-CN-YunxiaNeural",
    "zh-CN-YunyangNeural",
  ],
  "zh-CN-liaoning": ["zh-CN-liaoning-XiaobeiNeural"],
  "zh-TW": [
    "zh-TW-HsiaoChenNeural",
    "zh-TW-YunJheNeural",
    "zh-TW-HsiaoYuNeural",
  ],
  "zh-CN-shaanxi": ["zh-CN-shaanxi-XiaoniNeural"],
  hr: ["hr-HR-GabrijelaNeural", "hr-HR-SreckoNeural"],
  cs: ["cs-CZ-AntoninNeural", "cs-CZ-VlastaNeural"],
  da: ["da-DK-ChristelNeural", "da-DK-JeppeNeural"],
  nl: [
    "nl-BE-ArnaudNeural",
    "nl-BE-DenaNeural",
    "nl-NL-ColetteNeural",
    "nl-NL-FennaNeural",
    "nl-NL-MaartenNeural",
  ],
  en: [
    "en-AU-NatashaNeural",
    "en-AU-WilliamNeural",
    "en-CA-ClaraNeural",
    "en-CA-LiamNeural",
    "en-HK-SamNeural",
    "en-HK-YanNeural",
    "en-IN-NeerjaNeural",
    "en-IN-NeerjaNeural",
    "en-IN-PrabhatNeural",
    "en-IE-ConnorNeural",
    "en-IE-EmilyNeural",
    "en-KE-AsiliaNeural",
    "en-KE-ChilembaNeural",
    "en-NZ-MitchellNeural",
    "en-NZ-MollyNeural",
    "en-NG-AbeoNeural",
    "en-NG-EzinneNeural",
    "en-PH-JamesNeural",
    "en-PH-RosaNeural",
    "en-SG-LunaNeural",
    "en-SG-WayneNeural",
    "en-ZA-LeahNeural",
    "en-ZA-LukeNeural",
    "en-TZ-ElimuNeural",
    "en-TZ-ImaniNeural",
    "en-GB-LibbyNeural",
    "en-GB-MaisieNeural",
    "en-GB-RyanNeural",
    "en-GB-SoniaNeural",
    "en-GB-ThomasNeural",
    "en-US-AriaNeural",
    "en-US-AnaNeural",
    "en-US-ChristopherNeural",
    "en-US-EricNeural",
    "en-US-GuyNeural",
    "en-US-JennyNeural",
    "en-US-MichelleNeural",
    "en-US-RogerNeural",
    "en-US-SteffanNeural",
  ],
  et: ["et-EE-AnuNeural", "et-EE-KertNeural"],
  tl: ["fil-PH-AngeloNeural", "fil-PH-BlessicaNeural"],
  fi: ["fi-FI-HarriNeural", "fi-FI-NooraNeural"],
  fr: [
    "fr-BE-CharlineNeural",
    "fr-BE-GerardNeural",
    "fr-CA-AntoineNeural",
    "fr-CA-JeanNeural",
    "fr-CA-SylvieNeural",
    "fr-FR-DeniseNeural",
    "fr-FR-EloiseNeural",
    "fr-FR-HenriNeural",
    "fr-CH-ArianeNeural",
    "fr-CH-FabriceNeural",
  ],
  gl: ["gl-ES-RoiNeural", "gl-ES-SabelaNeural"],
  ka: ["ka-GE-EkaNeural", "ka-GE-GiorgiNeural"],
  de: [
    "de-AT-IngridNeural",
    "de-AT-JonasNeural",
    "de-DE-AmalaNeural",
    "de-DE-ConradNeural",
    "de-DE-KatjaNeural",
    "de-DE-KillianNeural",
    "de-CH-JanNeural",
    "de-CH-LeniNeural",
  ],
  el: ["el-GR-AthinaNeural", "el-GR-NestorasNeural"],
  gu: ["gu-IN-DhwaniNeural", "gu-IN-NiranjanNeural"],
  iw: ["he-IL-AvriNeural", "he-IL-HilaNeural"],
  hi: ["hi-IN-MadhurNeural", "hi-IN-SwaraNeural"],
  hu: ["hu-HU-NoemiNeural", "hu-HU-TamasNeural"],
  is: ["is-IS-GudrunNeural", "is-IS-GunnarNeural"],
  id: ["id-ID-ArdiNeural", "id-ID-GadisNeural"],
  ga: ["ga-IE-ColmNeural", "ga-IE-OrlaNeural"],
  it: ["it-IT-DiegoNeural", "it-IT-ElsaNeural", "it-IT-IsabellaNeural"],
  ja: ["ja-JP-KeitaNeural", "ja-JP-NanamiNeural"],
  jv: ["jv-ID-DimasNeural", "jv-ID-SitiNeural"],
  kn: ["kn-IN-GaganNeural", "kn-IN-SapnaNeural"],
  kk: ["kk-KZ-AigulNeural", "kk-KZ-DauletNeural"],
  km: ["km-KH-PisethNeural", "km-KH-SreymomNeural"],
  ko: ["ko-KR-InJoonNeural", "ko-KR-SunHiNeural"],
  lo: ["lo-LA-ChanthavongNeural", "lo-LA-KeomanyNeural"],
  lv: ["lv-LV-EveritaNeural", "lv-LV-NilsNeural"],
  lt: ["lt-LT-LeonasNeural", "lt-LT-OnaNeural"],
  mk: ["mk-MK-AleksandarNeural", "mk-MK-MarijaNeural"],
  ms: ["ms-MY-OsmanNeural", "ms-MY-YasminNeural"],
  ml: ["ml-IN-MidhunNeural", "ml-IN-SobhanaNeural"],
  mt: ["mt-MT-GraceNeural", "mt-MT-JosephNeural"],
  mr: ["mr-IN-AarohiNeural", "mr-IN-ManoharNeural"],
  mn: ["mn-MN-BataaNeural", "mn-MN-YesuiNeural"],
  ne: ["ne-NP-HemkalaNeural", "ne-NP-SagarNeural"],
  nb: ["nb-NO-FinnNeural", "nb-NO-PernilleNeural"],
  ps: ["ps-AF-GulNawazNeural", "ps-AF-LatifaNeural"],
  fa: ["fa-IR-DilaraNeural", "fa-IR-FaridNeural"],
  pl: ["pl-PL-MarekNeural", "pl-PL-ZofiaNeural"],
  pt: [
    "pt-BR-AntonioNeural",
    "pt-BR-FranciscaNeural",
    "pt-PT-DuarteNeural",
    "pt-PT-RaquelNeural",
  ],
  ro: ["ro-RO-AlinaNeural", "ro-RO-EmilNeural"],
  ru: ["ru-RU-DmitryNeural", "ru-RU-SvetlanaNeural"],
  sr: ["sr-RS-NicholasNeural", "sr-RS-SophieNeural"],
  si: ["si-LK-SameeraNeural", "si-LK-ThiliniNeural"],
  sk: ["sk-SK-LukasNeural", "sk-SK-ViktoriaNeural"],
  sl: ["sl-SI-PetraNeural", "sl-SI-RokNeural"],
  so: ["so-SO-MuuseNeural", "so-SO-UbaxNeural"],
  es: [
    "es-AR-ElenaNeural",
    "es-AR-TomasNeural",
    "es-BO-MarceloNeural",
    "es-BO-SofiaNeural",
    "es-CL-CatalinaNeural",
    "es-CL-LorenzoNeural",
    "es-CO-GonzaloNeural",
    "es-CO-SalomeNeural",
    "es-CR-JuanNeural",
    "es-CR-MariaNeural",
    "es-CU-BelkysNeural",
    "es-CU-ManuelNeural",
    "es-DO-EmilioNeural",
    "es-DO-RamonaNeural",
    "es-EC-AndreaNeural",
    "es-EC-LuisNeural",
    "es-SV-LorenaNeural",
    "es-SV-RodrigoNeural",
    "es-GQ-JavierNeural",
    "es-GQ-TeresaNeural",
    "es-GT-AndresNeural",
    "es-GT-MartaNeural",
    "es-HN-CarlosNeural",
    "es-HN-KarlaNeural",
    "es-MX-DaliaNeural",
    "es-MX-JorgeNeural",
    "es-NI-FedericoNeural",
    "es-NI-YolandaNeural",
    "es-PA-MargaritaNeural",
    "es-PA-RobertoNeural",
    "es-PY-MarioNeural",
    "es-PY-TaniaNeural",
    "es-PE-AlexNeural",
    "es-PE-CamilaNeural",
    "es-PR-KarinaNeural",
    "es-PR-VictorNeural",
    "es-ES-AlvaroNeural",
    "es-ES-ElviraNeural",
    "es-US-AlonsoNeural",
    "es-US-PalomaNeural",
    "es-UY-MateoNeural",
    "es-UY-ValentinaNeural",
    "es-VE-PaolaNeural",
    "es-VE-SebastianNeural",
  ],
  su: ["su-ID-JajangNeural", "su-ID-TutiNeural"],
  sw: [
    "sw-KE-RafikiNeural",
    "sw-KE-ZuriNeural",
    "sw-TZ-DaudiNeural",
    "sw-TZ-RehemaNeural",
  ],
  sv: ["sv-SE-MattiasNeural", "sv-SE-SofieNeural"],
  ta: [
    "ta-IN-PallaviNeural",
    "ta-IN-ValluvarNeural",
    "ta-MY-KaniNeural",
    "ta-MY-SuryaNeural",
    "ta-SG-AnbuNeural",
    "ta-SG-VenbaNeural",
    "ta-LK-KumarNeural",
    "ta-LK-SaranyaNeural",
  ],
  te: ["te-IN-MohanNeural", "te-IN-ShrutiNeural"],
  th: ["th-TH-NiwatNeural", "th-TH-PremwadeeNeural"],
  tr: ["tr-TR-AhmetNeural", "tr-TR-EmelNeural"],
  uk: ["uk-UA-OstapNeural", "uk-UA-PolinaNeural"],
  ur: [
    "ur-IN-GulNeural",
    "ur-IN-SalmanNeural",
    "ur-PK-AsadNeural",
    "ur-PK-UzmaNeural",
  ],
  uz: ["uz-UZ-MadinaNeural", "uz-UZ-SardorNeural"],
  vi: ["vi-VN-HoaiMyNeural", "vi-VN-NamMinhNeural"],
  cy: ["cy-GB-AledNeural", "cy-GB-NiaNeural"],
  zu: ["zu-ZA-ThandoNeural", "zu-ZA-ThembaNeural"],
};

var googleTranslateTtsLangList = [
  "af",
  "sq",
  "ar",
  "bn",
  "bs",
  "bg",
  "ca",
  "zh-CN",
  "zh-TW",
  "hr",
  "cs",
  "da",
  "nl",
  "en",
  "et",
  "tl",
  "fi",
  "fr",
  "de",
  "el",
  "gu",
  "iw",
  "hi",
  "hu",
  "is",
  "id",
  "it",
  "ja",
  "jw",
  "kn",
  "km",
  "ko",
  "la",
  "lv",
  "ms",
  "ml",
  "mr",
  "my",
  "ne",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sr",
  "si",
  "sk",
  "es",
  "su",
  "sw",
  "sv",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "ur",
  "vi",
];

//setting util======================================

export async function loadSetting(settingUpdateCallbackFn) {
  var settingDefault = await getDefaultDataAll();
  return await Setting.loadSetting(settingDefault, settingUpdateCallbackFn);
}

export async function getDefaultDataAll() {
  var defaultList = {};
  defaultList = concatJson(defaultList, defaultData);
  defaultList["translateTarget"] = getDefaultLang();
  defaultList = concatJson(defaultList, await getDefaultVoice());
  return defaultList;
}

export function getDefaultLang() {
  return parseLocaleLang(navigator.language);
}

export function parseLocaleLang(localeLang) {
  var langCovert = {
    zh: "zh-CN",
    he: "iw",
    fil: "tl",
  };
  var lang = parse(localeLang).language;
  lang = langCovert[lang] || lang;
  lang = localeLang == "zh-TW" ? "zh-TW" : lang;
  return lang;
}

export async function getDefaultVoice() {
  var defaultVoice = {};
  var voiceList = await getAllVoiceList();
  for (var key in voiceList) {
    defaultVoice["ttsVoice_" + key] = voiceList[key][0];
  }
  return defaultVoice;
}

export async function getAllVoiceList() {
  var browserVoices = await getBrowserTtsVoiceList();
  var bingVoices = getBingTtsVoiceList();
  var googleTranslateVoices = getgoogleTranslateTtsVoiceList();
  var voiceList = concatVoice(browserVoices, bingVoices);
  var voiceList = concatVoice(voiceList, googleTranslateVoices);
  voiceList = sortJsonByKey(voiceList);
  return voiceList;
}

export function getBrowserTtsVoiceList() {
  return new Promise(async (resolve) => {
    var voiceList = {};
    try {
      // get voice list
      //get one that include remote, lang, voiceName
      //sort remote first;
      var voices = await browser.tts.getVoices();
      let filtered = voices
        .filter((e) => {
          return e.remote != null && e.lang != null && e.voiceName != null;
        })
        .sort((x, y) => {
          return y.remote - x.remote;
        });
      //find matched lang voice and speak
      for (var item of filtered) {
        var lang = parseLocaleLang(item.lang);
        voiceList[lang] = voiceList[lang] || [];
        voiceList[lang].push(item.voiceName);
      }
      resolve(voiceList);
    } catch (err) {
      resolve(voiceList);
    }
  });
}

export async function getSpeechTTSVoiceList() {
  if (isBacgroundServiceWorker()) {
    return {};
  }
  // get voice list
  //get one that include remote, lang, voiceName
  //sort remote first;
  var voiceList = {};
  var voices = await getSpeechVoices();
  let filtered = voices
    .filter((i) => i.lang && i.name)
    .sort((x, y) => {
      return y.localService - x.localService;
    });
  //find matched lang voice and speak
  for (var item of filtered) {
    var lang = parseLocaleLang(item.lang);
    voiceList[lang] = voiceList[lang] || [];
    voiceList[lang].push(item.name);
  }
  return voiceList;
}

export async function getSpeechVoices() {
  return new Promise(function (resolve, reject) {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.addEventListener("voiceschanged", function () {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
}

export function getBingTtsVoiceList() {
  var bingTaggedVoiceList = {};
  for (var key in bingTtsVoiceList) {
    var voiceList = [...bingTtsVoiceList[key]];
    voiceList = voiceList.map((voiceName) => "BingTTS_" + voiceName);
    bingTaggedVoiceList[key] = voiceList;
  }
  return bingTaggedVoiceList;
}

export function getgoogleTranslateTtsVoiceList() {
  var voiceList = {};
  for (var lang of googleTranslateTtsLangList) {
    voiceList[lang] = ["GoogleTranslateTTS_" + lang];
  }
  return voiceList;
}

function concatVoice(voiceList1, voiceList2) {
  var voiceNewList = {};
  for (var key in voiceList1) {
    voiceNewList[key] = voiceList1[key];
  }
  for (var key in voiceList2) {
    if (key in voiceNewList) {
      voiceNewList[key] = voiceNewList[key].concat(voiceList2[key]);
    } else {
      voiceNewList[key] = voiceList2[key];
    }
  }
  return voiceNewList;
}

// range util====================================================================================

export function getAllShadows(el = document.body) {
  // https://stackoverflow.com/questions/38701803/how-to-get-element-in-user-agent-shadow-root-with-javascript
  // recurse on childShadows
  const childShadows = Array.from(el.querySelectorAll("*"))
    .map((el) => el.shadowRoot)
    .filter(Boolean);
  const childResults = childShadows.map((child) => getAllShadows(child));
  const result = Array.from(childShadows);
  return result.concat(childResults).flat();
}

// text util==================================

export function concatJson(x, y) {
  return Object.assign(x, y);
}

export function copyJson(json) {
  return JSON.parse(JSON.stringify(json));
}

export function sortJsonByKey(json) {
  return Object.keys(json)
    .sort()
    .reduce((obj, key) => {
      obj[key] = json[key];
      return obj;
    }, {});
}

export function getJsonFromList(list) {
  var json = {};
  for (const [key, val] of Object.entries(list)) {
    json[val] = val;
  }
  return json;
}

export function filterWord(word) {
  if (!word) {
    return "";
  }
  // filter one that only include num,space and special char(include currency sign) as combination
  word = word.replace(/\s+/g, " "); //replace whitespace as single space
  word = word.trim(); // remove whitespaces from begin and end of word
  // word=word.slice(0,1000);
  if (
    word.length > 1000 || //filter out text that has over 1000length
    isUrl(word) || //if it is url
    !/[^\s\d»«…~`!@#$%^&*()‑_+\-=\[\]{};、':"\\|,.<>\/?\$\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BD\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6\p{Extended_Pictographic}]/gu.test(
      word
    )
  ) {
    word = "";
  }
  return word;
}

export function filterEmoji(word) {
  return word.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  );
}

export function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

export function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text);
}

//rect===============================

export function filterOverlappedRect(rects) {
  //filter duplicate rect
  var rectSet = new Set();
  rects = Array.from(rects).filter((rect) => {
    var key = getRectKey(rect);
    if (!rectSet.has(key)) {
      rectSet.add(key);
      return true;
    }
    return false;
  });

  //filter covered rect by other rect
  rects = rects.filter((rect1) => {
    for (const rect2 of rects) {
      if (getRectKey(rect1) != getRectKey(rect2) && rectCovered(rect1, rect2)) {
        return false;
      }
    }
    return true;
  });

  return rects;
}

function getRectKey(rect) {
  return `${rect.left}${rect.top}${rect.width}${rect.height}`;
}

function rectCovered(rect1, rect2) {
  return (
    rect2.top <= rect1.top &&
    rect1.top <= rect2.bottom &&
    rect2.top <= rect1.bottom &&
    rect1.bottom <= rect2.bottom &&
    rect2.left <= rect1.left &&
    rect1.left <= rect2.right &&
    rect2.left <= rect1.right &&
    rect1.right <= rect2.right
  );
}
function rectCollide(rect1, rect2) {
  return !(
    rect1.top > rect2.bottom ||
    rect1.right < rect2.left ||
    rect1.bottom < rect2.top ||
    rect1.left > rect2.right
  );
}

// performance=======================================================
export function cacheFn(fn) {
  var cache = {};

  return async function () {
    var args = arguments;
    var key = [].slice.call(args).join("");
    if (10000 < Object.keys(cache).length) {
      cache = {}; //numbers.shift();
    }

    if (cache[key]) {
      return cache[key];
    } else {
      cache[key] = await fn.apply(this, args);
      return cache[key];
    }
  };
}

//base64=================================
export function getBase64(url) {
  return new Promise(function (resolve, reject) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(this.result); // <--- `this.result` contains a base64 data URI
        };
        reader.readAsDataURL(blob);
      })
      .catch(async (error) => {
        resolve("");
      });
  });
}

export function getBase64Url(blob) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = reader.result;
      resolve(dataUrl);
    };
    reader.readAsDataURL(blob);
  });
}

// browser Listener handler========================

//from body to parent or iframe message
export function postFrame(data) {
  if (self == top) {
    window.postMessage(data, "*");
  } else {
    window.postMessage(data, "*");
    window.parent.postMessage(data, "*");
  }
}

export function addFrameListener(type, handler) {
  window.addEventListener("message", function (event) {
    if (event?.data?.type == type) {
      handler(event?.data);
    }
  });
}

//fron content script to background
export async function sendMessage(message) {
  try {
    return await browser.runtime.sendMessage(message);
  } catch (e) {
    console.log(e);
  }
  return {};
}

export async function sendMessageToCurrentTab(message) {
  var tabs = await browser.tabs.query({ active: true, currentWindow: true });
  browser.tabs.sendMessage(tabs?.[0]?.id, message);
}

export function addMessageListener(type, handler) {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == type) {
      handler(message);
      sendResponse({});
    }
  });
}

export function addContextListener(type, handler) {
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == type) {
      handler();
    }
  });
}

export function addCommandListener(type, handler) {
  browser.commands.onCommand.addListener((command) => {
    if (command == type) {
      handler();
    }
  });
}

// remain ===================

export function isRtl(lang) {
  return rtlLangList.includes(lang);
}

export function getRtlDir(lang) {
  return rtlLangList.includes(lang) ? "rtl" : "ltr";
}

export function checkInDevMode() {
  try {
    if (process.env.NODE_ENV == "development") {
      return true;
    }
  } catch (error) {}
  return false;
}

export function getReviewUrl() {
  var extId =
    browser.runtime.id in reviewUrlJson
      ? browser.runtime.id
      : "hmigninkgibhdckiaphhmbgcghochdjc";

  return reviewUrlJson[extId];
}

export function isIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function isEbookReader() {
  return (
    window.location.href == browser.runtime.getURL("/foliate-js/reader.html")
  );
}

export function getEbookIframe() {
  var shadows = getAllShadows();
  var iframe = shadows?.[1]?.querySelectorAll("iframe")[0];
  return iframe;
}

export function isGoogleDoc() {
  return (
    document.location.href.includes("https://docs.google.com/document") ||
    document.location.href.includes("https://docs.google.com/presentation")
  );
}

export async function waitUntilForever(fn) {
  await waitUntil(fn, {
    timeout: WAIT_FOREVER,
  });
}

export function getActiveElement(root = document) {
  const activeEl = root.activeElement;

  if (!activeEl) {
    return null;
  } else if (activeEl.shadowRoot) {
    return getActiveElement(activeEl.shadowRoot);
  } else {
    return activeEl;
  }
}

export function getFocusedWritingBox() {
  //check doucment input box focused
  var writingBox = $(getActiveElement());
  if (writingBox.is(writingField)) {
    return writingBox.get(0);
  }
}

export function isExtensionOnline() {
  return browser.runtime?.id;
}

export function openSettingPage() {
  browser.tabs.create({
    url: "chrome://extensions/?id=" + browser.runtime?.id,
  });
}
export function getUrlExt(path) {
  return browser.runtime.getURL(path);
}

export async function hasFilePermission() {
  return await browser.extension.isAllowedFileSchemeAccess();
}

function isBacgroundServiceWorker() {
  try {
    return !document;
  } catch (error) {
    return true;
  }
}

export function detectLangFranc(text) {
  var detectLangData = francAll(text, { minLength: 0 })?.[0]?.[0];
  var lang = iso6393To1[detectLangData];
  return lang;
}

export async function detectLangBrowser(text) {
  var detectLangData = await browser.i18n.detectLanguage(text);
  var lang = detectLangData?.languages?.[0]?.language;
  lang = lang == "zh" ? "zh-CN" : lang;
  return lang;
}

export function getCurrentUrl() {
  return window.location != window.parent.location
    ? document.referrer
    : document.location.href;
}

export function getRangeOption(start, end, incNum = 1, roundOff = 0) {
  return _.keyBy(
    _.range(start, end, incNum)
      .map((num) => num.toFixed(roundOff))
      .map((num) => String(num))
  );
}
