import { parse } from "bcp-47";

import * as util from "/src/util";

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

export async function getDefaultDataAll() {
  var defaultList = {};
  defaultList = util.concatJson(defaultList, util.defaultData);
  defaultList["translateTarget"] = getDefaultLang();
  defaultList = util.concatJson(defaultList, await getDefaultVoice());
  return defaultList;
}

export function getDefaultLang() {
  return parseLocaleLang(navigator.language);
}

export function parseLocaleLang(localeLang) {
  var lang = parse(localeLang).language;
  lang = lang == "zh" ? "zh-CN" : lang; // chinese lang code fix
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
  voiceList = util.sortJsonByKey(voiceList);
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
