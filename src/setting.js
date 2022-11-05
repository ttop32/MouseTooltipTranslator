// load setting from chrome storage

import { parse } from "bcp-47";

var defaultList = {
  useTooltip: "true",
  useTTS: "false",
  translateWhen: "mouseoverselect",
  translateSource: "auto",
  //translateTarget: getLang(),
  translatorVendor: "google",
  keyDownTooltip: "null",
  keyDownTTS: "null",
  detectType: "sentence",
  translateReverseTarget: "null",
  detectPDF: "true",
  useOCR: "false",
  ocrDetectionLang: "jpn_vert",
  tooltipFontSize: "14",
  tooltipWidth: "200",
  tooltipTextAlign:"center",
  ttsVolume: "1.0",
  ttsRate: "1.0",
  historyList: [],
  historyRecordActions: [],
  langExcludeList: [],
};


// automatic setting update class
export class Setting {
  constructor() {
    this.data = {};
    this.defaultList= {};
    this.voiceList={};
  }

  static async create(settingUpdateCallback = () => {}) {
    const o = new Setting();
    await o.initialize(settingUpdateCallback);
    return o;
  }

  async initialize(settingUpdateCallback) {
    await this.getDefaultSetting();
    this.data = await this.getSettingFromStorage();
    this.initSettingListener(settingUpdateCallback);
  }

  initSettingListener(settingUpdateCallback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {      
      for (var key in changes) {
        this.data[key] = changes[key].newValue;
      }
      settingUpdateCallback(changes);
    });
  }

  save(inputSettings) {
    chrome.storage.local.set(inputSettings, () => {
      this.data = inputSettings;
    });
  }


  //load setting
  //if value exist, load. else load default val
  getSettingFromStorage() {
    return new Promise((resolve, reject) => {
      var defaultVar=this.defaultList;
      chrome.storage.local.get(Object.keys(defaultVar), function(loadedSetting) {
        var currentSetting = {};
        for (var key in defaultVar) {
          currentSetting[key] = loadedSetting[key]
            ? loadedSetting[key]
            : defaultVar[key];
        }
        resolve(currentSetting);
      });
    });
  }

  async getDefaultSetting(){
    this.defaultList=defaultList;
    await this.getDefaultVoice();
    this.defaultList["translateTarget"]=this.getDefaultLang();
  }

  getDefaultLang() {
    var lang = parse(navigator.language).language;
    lang = lang == "zh" ? navigator.language : lang; // chinese lang code fix
    return lang;
  }


  async getDefaultVoice(){
    this.voiceList = await this.updateVoiceList();

    for (var key in this.voiceList) {
      this.defaultList["ttsVoice_"+key]=this.voiceList[key][0]
    }
  }

  updateVoiceList() {
    return new Promise((resolve) => {
    var voiceList={}

    try {
    // get voice list and sort by remote first
    // get matched lang voice
    chrome.tts.getVoices((voices) => {
      
      let filtered = voices.filter((e) => {
        return e.remote != null && e.lang != null && e.voiceName != null;
      }); //get one that include remote, lang, voiceName

      filtered.sort((x, y) => {
        return y.remote - x.remote;
      }); //get remote first;

      //find matched lang voice and speak
      for (var item of filtered) {
        var lang=parse(item.lang).language
        if(voiceList[lang]){
          voiceList[lang].push(item.voiceName)
        }else{
          voiceList[lang]=  [item.voiceName]
        }
      }
      resolve(voiceList);
    });
    }
    catch(err) {
      resolve(voiceList);
    }

    });
  }

}

