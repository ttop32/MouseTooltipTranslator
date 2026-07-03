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
    // fetch ALL stored keys (null), not just the default-schema keys. dynamic
    // per-language keys like ttsRate_<lang> / ttsVoice_<lang> aren't in the
    // schema, so a known-key fetch would silently drop them on restart (#338)
    var storage = await browser.storage.local.get(null);

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
    // getPersistData() swaps out any runtime-only override (#262) for its real
    // (global) value, so an in-page per-site setting is never written to storage
    var data = this.getPersistData();
    browser.storage.local.set(data); // local = full source of truth (unchanged)
    // mirror the small config subset to storage.sync when enabled (#134)
    if (this.syncSetting === "true" && browser?.storage?.sync) {
      browser.storage.sync
        .set(this.getSyncSubset(data))
        .catch((error) => console.log(error)); // ignore quota / sync-unavailable
    }
  }

  // own enumerable settings to persist, with any runtime-only override (#262)
  // replaced by the real (global) value. Identical to `this` when no override
  // is active (__overrides is undefined until setLocalOverride is called).
  getPersistData() {
    var data = {};
    for (var key of Object.keys(this)) {
      data[key] =
        this.__overrides && key in this.__overrides
          ? this.__overrides[key]
          : this[key];
    }
    return data;
  }

  // Apply a runtime-only override: reads of `setting[key]` see `value`, but
  // save()/sync persist `globalValue` instead. Used for the per-site translate
  // target (#262) so an in-page override never leaks into the saved global.
  setLocalOverride(key, value, globalValue) {
    if (!this.__overrides) {
      Object.defineProperty(this, "__overrides", {
        value: {},
        enumerable: false, // keep it out of Object.keys / storage serialization
        writable: true,
        configurable: true,
      });
    }
    if (value === globalValue) {
      delete this.__overrides[key]; // no real override — persist normally
    } else {
      this.__overrides[key] = globalValue;
    }
    this[key] = value;
  }

  // small config keys safe to put in storage.sync (excludes large/per-device data
  // and any single key that would bust the per-item quota). (#134)
  getSyncSubset(source) {
    source = source || this;
    var data = {};
    for (var key of Object.keys(source)) {
      if (SYNC_EXCLUDE.includes(key) || typeof source[key] === "function") {
        continue;
      }
      try {
        if (JSON.stringify(source[key]).length > SYNC_ITEM_MAX) {
          continue;
        }
      } catch (error) {
        continue;
      }
      data[key] = source[key];
    }
    return data;
  }

  async clear() {
    await browser.storage.local.clear();
  }
}
