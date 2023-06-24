// load setting from chrome storage
// automatic setting update class===============================
export class Setting {
  updateCallbackFnList = [];
  defaultList = {};

  constructor(defaultList={}){
    this.defaultList =defaultList;
  }

  static async loadSetting(defaultList={}) {
    const o = new Setting(defaultList);
    await o.initialize();
    return o;
  }

  async initialize() {
    this.loadDefaultData();
    await this.loadStorageData();
    this.initSettingListener();
  }

  initSettingListener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (var key in changes) {
        this.data[key] = changes[key].newValue;
      }
      settingUpdateCallback(changes);
    });
  }

  async loadDefaultData() {
    for (let [key, value] of Object.entries(this.defaultList)) {
      this[key] = value;
    }
  }
  loadStorageData() {
    var settingData = this;

    return new Promise((resolve, reject) => {
      chrome.storage.local.get(Object.keys(settingData), function(storage) {
        for (var key in settingData) {
          settingData[key] = storage[key] ? storage[key] : settingData[key];
        }
        resolve();
      });
    });
  }

  initSettingListener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (var key in changes) {
        this[key] = changes[key].newValue;
      }

      this.runSettingCallback(changes);
    });
  }

  runSettingCallback(changes) {
    var keys = Object.keys(changes);
    keys = keys.filter((item) => !this["ignoreCallbackOptionList"].includes(item));

    if (keys.length == 0) {
      return;
    }

    for (var fn of this.updateCallbackFnList) {
      fn(changes);
    }
  }

  save() {
    chrome.storage.local.set(this, () => {});
  }

  addUpdateCallback(fn) {
    this.updateCallbackFnList.push(fn);
  }

  ignoreCallbackOption(option) {
    this["ignoreCallbackOptionList"].push(option);
    save();
  }

  getSpecificOptions(keyword){
    var specificOptions={}
    for (var key in this) {
      if(key.includes(keyword)){
        specificOptions[key]=this[key];
      }
    }
    return specificOptions
  }
}

