import { DOQ, getDefaultPrefs } from "./config.js";
import deepmerge from "deepmerge";

/* Preferences */
function readPreferences() {
  const prefs = getDefaultPrefs();
  const theme = getSysTheme();
  const storedData = localStorage.getItem(`doq.preferences.${theme}`);
  const store = storedData ? JSON.parse(storedData) : {};

  // Deep merge with default preferences to prevent loss of properties
  DOQ.preferences = deepmerge(prefs, store);
  return DOQ.preferences;
}

function updatePreference(key, value) {
  const prefs = DOQ.preferences;
  const theme = getSysTheme();

  if (key in prefs.flags) {
    prefs.flags[key] = DOQ.flags[key];
  } else if (key in prefs && typeof value === typeof prefs[key]) {
    prefs[key] = value;
  }
  localStorage.setItem(`doq.preferences.${theme}`, JSON.stringify(prefs));
}

function getSysTheme() {
  const { options, config } = DOQ;
  const light = !options.dynamicTheme || config.sysTheme.matches;
  return light ? "light" : "dark";
}

/* TEMPORARY: keep user prefs while adding Chromium theme */
function migratePrefs() {
  if (localStorage.getItem("doq.migrated-chromium-theme")) {
    return;
  }
  for (const theme of ["light", "dark"]) {
    const storedData = localStorage.getItem(`doq.preferences.${theme}`);
    const store = storedData ? JSON.parse(storedData) : {};
    if (store?.scheme !== undefined) {
      ++store.scheme;
      localStorage.setItem(`doq.preferences.${theme}`, JSON.stringify(store));
    }
  }
  localStorage.setItem("doq.migrated-chromium-theme", "true");
}

function readOptions() {
  const storedData = localStorage.getItem("doq.options");
  const store = storedData ? JSON.parse(storedData) : {};
  const { options } = DOQ;

  for (const key in options) {
    if (typeof options[key] === typeof store?.[key]) {
      options[key] = store[key];
    }
  }
  return options;
}

export { readOptions, readPreferences, updatePreference, migratePrefs };