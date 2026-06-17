import { DOQ, getDefaultPrefs } from "./config.js";

// these files are loaded as raw ES modules in the PDF.js viewer (not webpack
// bundled), so we can't import a bare "deepmerge" specifier here (#339). small
// inline deep merge instead: stored values override defaults, nested plain
// objects are merged so partial saved prefs don't drop keys (#335).
function deepMerge(base, override) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const key in override) {
    const b = base?.[key];
    const o = override[key];
    if (isPlainObject(b) && isPlainObject(o)) {
      out[key] = deepMerge(b, o);
    } else {
      out[key] = o;
    }
  }
  return out;
}
function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

/* Preferences */
function readPreferences() {
  const prefs = getDefaultPrefs();
  const theme = getSysTheme();
  const storedData = localStorage.getItem(`doq.preferences.${theme}`);
  const store = storedData ? JSON.parse(storedData) : {};

  // Deep merge with default preferences to prevent loss of properties
  DOQ.preferences = deepMerge(prefs, store);
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