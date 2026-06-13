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

// settings sync (#134): storage.local always holds the full, authoritative data.
// When syncSetting is on we also MIRROR the small config keys to storage.sync so
// they follow the user across devices. These keys never go to sync — too large
// for the 8KB-per-item / 100KB-total sync quota, or per-device:
//   historyList (translation history), wordGroups (saved words), syncSetting itself.
const SYNC_EXCLUDE = ["historyList", "wordGroups", "syncSetting", "lastSettingTab"];
const SYNC_ITEM_MAX = 7000; // bytes; skip any single key bigger than this (under 8KB)

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

    // overlay synced config on top of local, so settings follow the user across
    // devices when sync is enabled on this device (#134). local stays the source
    // of truth for the large/excluded data.
    if (this.syncSetting === "true" && browser?.storage?.sync) {
      try {
        var syncData = await browser.storage.sync.get(null);
        for (var excluded of SYNC_EXCLUDE) {
          delete syncData[excluded];
        }
        this.loadData(syncData);
      } catch (error) {
        console.log(error);
      }
    }

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
    browser.storage.local.set(this); // local = full source of truth (unchanged)
    // mirror the small config subset to storage.sync when enabled (#134)
    if (this.syncSetting === "true" && browser?.storage?.sync) {
      browser.storage.sync
        .set(this.getSyncSubset())
        .catch((error) => console.log(error)); // ignore quota / sync-unavailable
    }
  }

  // small config keys safe to put in storage.sync (excludes large/per-device data
  // and any single key that would bust the per-item quota). (#134)
  getSyncSubset() {
    var data = {};
    for (var key of Object.keys(this)) {
      if (SYNC_EXCLUDE.includes(key) || typeof this[key] === "function") {
        continue;
      }
      try {
        if (JSON.stringify(this[key]).length > SYNC_ITEM_MAX) {
          continue;
        }
      } catch (error) {
        continue;
      }
      data[key] = this[key];
    }
    return data;
  }

  async clear() {
    await browser.storage.local.clear();
  }
}
