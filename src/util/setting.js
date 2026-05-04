// import browser from "webextension-polyfill";
var browser;
try {
  browser = require("webextension-polyfill");
} catch (error) {}

// load setting from chrome storage
// automatic setting update class===============================
var updateCallbackFn = [];
var defaultSettingList = {};

// renamed setting keys: oldKey -> newKey
// when a user has the old key in storage, copy its value to the new key
// (unless the new key is already set) and remove the old key
const DEPRECATED_KEY_MAP = {
  keyToggleMouseoverTextType: "keyHoldMouseoverTextType",
};

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
    this.loadData(defaultSettingList);
  }

  async loadData(data) {
    for (let [key, value] of Object.entries(data)) {
      if (value != null) {
        this[key] = value;
      }
    }
  }

  async loadStorageData() {
    var settingData = this;
    var keysToFetch = [
      ...Object.keys(settingData),
      ...Object.keys(DEPRECATED_KEY_MAP),
    ];
    var storage = await browser.storage.local.get(keysToFetch);

    var migrated = false;
    for (var [oldKey, newKey] of Object.entries(DEPRECATED_KEY_MAP)) {
      if (storage[oldKey] !== undefined) {
        if (storage[newKey] === undefined) {
          storage[newKey] = storage[oldKey];
        }
        delete storage[oldKey];
        migrated = true;
      }
    }

    this.loadData(storage);

    if (migrated) {
      await browser.storage.local.remove(Object.keys(DEPRECATED_KEY_MAP));
      this.save();
    }
  }

  initSettingListener() {
    browser.storage.onChanged.addListener((changes, namespace) => {
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
    browser.storage.local.set(this);
  }

  async clear() {
    await browser.storage.local.clear();
  }
}
