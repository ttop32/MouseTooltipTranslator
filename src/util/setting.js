// load setting from chrome storage
// automatic setting update class===============================
var updateCallbackFn = [];
var defaultSettingList = {};
export class Setting {
  constructor() {}

  static async loadSetting(defaultList = {}, callbackFn) {
    defaultSettingList = defaultList;
    updateCallbackFn = callbackFn;
    const o = new Setting();
    await o.initialize();
    return o;
  }

  async initialize() {
    this.loadDefaultData();
    await this.loadStorageData();
    this.initSettingListener();
  }

  async loadDefaultData() {
    for (let [key, value] of Object.entries(defaultSettingList)) {
      this[key] = value;
    }
  }

  loadStorageData() {
    var settingData = this;

    return new Promise((resolve, reject) => {
      chrome.storage.local.get(Object.keys(settingData), function (storage) {
        for (var key in storage) {
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
    var keys = Object.keys(changes).filter(
      (item) => !this.ignoreCallbackOptionList.includes(item)
    );
    if (keys.length == 0) {
      return;
    }

    if (updateCallbackFn) {
      updateCallbackFn(changes);
    }
  }

  save() {
    chrome.storage.local.set(this, () => {});
  }
}
