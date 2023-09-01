//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import translator from "./translator/index.js";
import openai from "./openai/index.js";
import dictionary from "./dictionary.js";
import { waitUntil } from "async-wait-until";
import * as util from "./util.js";
import { detect } from "detect-browser";

const browser = detect();
var setting;
var recentTranslated = {};
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";
var chromeReviewPage =
  "https://chrome.google.com/webstore/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews";
var edgeReviewPage =
  "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl";

var translateWithCache = util.cacheFn(doTranslate); // make cache args function
addUninstallUrl();
getSetting();

//listen message from contents js and popup js =========================================================================================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  (async () => {
    // wait setting load
    await waitUntil(() => setting);

    if (request.type === "translate") {
      var translatedResult = await translateWithCache(
        // var translatedResult = await doTranslate(
        request.word,
        request.translateSource,
        request.translateTarget,
        setting["translatorVendor"]
      );

      translatedResult = translatedResult
        ? translatedResult
        : {
            translatedText: "",
            transliteration: "",
            sourceLang: "en",
            targetLang: "en",
          };

      sendResponse(translatedResult);
    } else if (request.type === "languageTutor") {
      var translatedResult = await doTranslateWithOpenAI(
        request.word,
        request.translateSource,
        request.translateTarget,
        'chatgpt'
      );

      translatedResult = translatedResult
        ? translatedResult
        : {
            translatedText: "",
            transliteration: "",
            sourceLang: "en",
            targetLang: "en",
          };

      sendResponse(translatedResult);
    } else if (request.type === "pronunciation") {
      var result = await fetchPronunciation(
        request.word,
        request.translateSource
      );
      var strPhonetics = result[0]?.phonetics?.map(ph => ph.text)?.join(' • ');

      translatedResult = {
        translatedText: strPhonetics,
        transliteration: "",
        sourceLang: "en",
        targetLang: "en",
      };

      sendResponse(translatedResult);
    } else if (request.type === "tts") {
      doTts(
        request.word,
        request.lang,
        setting["ttsVolume"],
        setting["ttsRate"]
      );
      sendResponse({});
    } else if (request.type === "stopTTS") {
      chrome.tts.stop();
      sendResponse({});
    } else if (request.type === "historyUpdate") {
      recordHistory(request);
      updateContext(request);
      sendResponse({});
    } else if (request.type === "requestBase64") {
      var base64Url = await util.getBase64(request.url);
      sendResponse({ base64Url });
    }
  })();
  return true;
});

async function getSetting() {
  setting = await util.loadSetting();
}

function recordHistory(request, force = false) {
  if (force || setting["historyRecordActions"].includes(request.actionType)) {
    //append history to front
    setting["historyList"].unshift({
      sourceText: request.sourceText,
      targetText: request.targetText,
    });
    //remove when too many list
    if (setting["historyList"].length > 5000) {
      setting["historyList"].pop();
    }
    setting.save();
  }
}

async function doTts(word, lang, ttsVolume, ttsRate) {
  var voice = setting["ttsVoice_" + lang];

  chrome.tts.speak(word, {
    lang: lang,
    voiceName: voice,
    volume: Number(ttsVolume),
    rate: Number(ttsRate),
  });
}

async function doTranslate(text, fromLang, targetLang, translatorVendor) {
  return translator[translatorVendor].translate(text, fromLang, targetLang);
}

async function doTranslateWithOpenAI(text, fromLang, targetLang, translatorVendor) {
  return openai[translatorVendor].translate(text, fromLang, targetLang);
}

async function fetchPronunciation(text, fromLang) {
  return await dictionary.fetchPronunciation(text, fromLang);
}

// detect local pdf file and redirect to translated pdf=====================================================================
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (
    !changeInfo.url ||
    changeInfo.status != "loading" ||
    (setting && setting["detectPDF"] == "false")
  ) {
    return;
  }

  //check local pdf file, open with viewer
  if (checkIsLocalPdfUrl(changeInfo.url)) {
    openPDFViewer(changeInfo.url, tabId);
  }
});

//url is end with .pdf, start with file://
function checkIsLocalPdfUrl(url) {
  return /^(file:\/\/).*(\.pdf)$/.test(url.toLowerCase());
}
async function openPDFViewer(url, tabId) {
  chrome.tabs.update(tabId, {
    url:
      chrome.runtime.getURL("/pdfjs/web/viewer.html") +
      "?file=" +
      encodeURIComponent(url),
  });
}

// ================= context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copy",
    title: "copy",
    contexts: ["all"],
    visible: false,
  });
});

function updateContext(request) {
  chrome.contextMenus.update("copy", {
    title: "Copy : " + truncate(request.targetText, 20),
    visible: true,
  });
  recentTranslated = request;
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == "copy") {
    copyOntab(tab, recentTranslated.targetText);
  }
});

function copyText(text) {
  navigator.clipboard.writeText(text);
}

function runFunctionOnTab(tabId, func, args) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: func,
    args: args,
  });
}

function copyOntab(tab, text) {
  runFunctionOnTab(tab.id, copyText, [text]);
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "..." : str;
}

//command shortcut key=====================================
chrome.commands.onCommand.addListener((command) => {
  (async () => {
    if (command == "copy-translated-text") {
      var recentTab = await getCurrentTab();
      copyOntab(recentTab, recentTranslated.targetText);
    }
  })();
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// ================= contents script reinjection after upgrade or install
chrome.runtime.onInstalled.addListener(async (details) => {
  // skip if development mode
  if (util.checkInDevMode()) {
    return;
  }

  injectExtensionScriptForAllTab();
  openIntroSite(details.reason);
});

async function injectExtensionScriptForAllTab() {
  // if extension is upgrade or new install, refresh all tab
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({ url: cs.matches })) {
      if (
        /^(chrome:\/\/|edge:\/\/|file:\/\/|https:\/\/chrome\.google\.com\/webstore|chrome-extension:\/\/).*/.test(
          tab.url
        )
      ) {
        continue;
      }

      try {
        //load css and js on opened tab
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: cs.css,
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: cs.js,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
}

function openIntroSite(reason) {
  if (reason == "install") {
    chrome.tabs.create({ url: introSiteUrl }, function(tab) {});
  }
}

function addUninstallUrl() {
  if (util.checkInDevMode()) {
    return;
  }

  var reviewPage =
    browser.name == "edge-chromium" ? edgeReviewPage : chromeReviewPage;
  chrome.runtime.setUninstallURL(reviewPage);
}
