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

export async function loadUiLanguage(lang) {
  if (!lang || lang === "auto") {
    customMessages = null;
    return;
  }
  try {
    const res = await fetch(
      browser.runtime.getURL("_locales/" + lang + "/messages.json")
    );
    customMessages = await res.json();
  } catch (e) {
    console.log(e);
    customMessages = null;
  }
}

export function getMessage(key) {
  return (
    customMessages?.[key]?.message ||
    browser?.i18n?.getMessage(key) ||
    ""
  );
}

// like getMessage but falls back to the key itself (matches the old `... || key`)
export function t(key) {
  return getMessage(key) || key;
}
