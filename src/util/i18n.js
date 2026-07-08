// Custom UI-language layer (#76).
//
// chrome.i18n.getMessage() always follows the BROWSER UI language and cannot be
// changed at runtime. So when the user picks a UI language we load that locale's
// packaged messages.json ourselves and read from it, falling back to chrome.i18n
// (the browser language) and finally the raw key. loadUiLanguage() must be called
// (and awaited) before the popup mounts so the first render is already localized.
var browser;
try {
  browser = require("webextension-polyfill");
} catch (e) {}

let customMessages = null; // { KEY: { message } } for the chosen locale, or null
let customLang = null; // locale dir name of the loaded customMessages (e.g. "ru", "zh_CN")

export async function loadUiLanguage(lang) {
  if (!lang || lang === "auto") {
    customMessages = null;
    customLang = null;
    return;
  }
  try {
    const res = await fetch(
      browser.runtime.getURL("_locales/" + lang + "/messages.json")
    );
    customMessages = await res.json();
    customLang = lang;
  } catch (e) {
    console.log(e);
    customMessages = null;
    customLang = null;
  }
}

// effective UI language as a BCP47 tag (used for Intl.DisplayNames):
// the custom-picked locale, else the browser UI language
export function getUiLangCode() {
  const lang =
    customLang ||
    browser?.i18n?.getUILanguage?.() ||
    (typeof navigator !== "undefined" ? navigator.language : "") ||
    "en";
  return lang.replace(/_/g, "-");
}

export function getMessage(key) {
  const custom = customMessages?.[key]?.message;
  if (custom) return custom;
  // chrome.i18n rejects names with characters outside [a-zA-Z0-9_@] (e.g.
  // language-list keys like "Chinese (Simplified)") - treat that as "no message"
  try {
    return browser?.i18n?.getMessage(key) || "";
  } catch (e) {
    return "";
  }
}

// like getMessage but falls back to the key itself (matches the old `... || key`)
export function t(key) {
  return getMessage(key) || key;
}
