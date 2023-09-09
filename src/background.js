//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import translator from "./translator/index.js";
import { waitUntil } from "async-wait-until";
import * as util from "./util.js";
import browser from "webextension-polyfill";

var setting;
var recentTranslated = {};
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";
var reviewUrl = {
  nnodgmifnfgkolmakhcfkkbbjjcobhbl:
    "https://microsoftedge.microsoft.com/addons/detail/mouse-tooltip-translator/nnodgmifnfgkolmakhcfkkbbjjcobhbl",
  hmigninkgibhdckiaphhmbgcghochdjc:
    "https://chrome.google.com/webstore/detail/hmigninkgibhdckiaphhmbgcghochdjc/reviews",
};

addInstallUrl(introSiteUrl);
addUninstallUrl(reviewUrl);
injectContentScriptForAllTab();
getSetting();

//listen message from contents js and popup js =========================================================================================================
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  (async () => {
    // wait setting load
    await waitUntil(() => setting);

    if (request.type === "translate") {
      var translatedResult = await doTranslate(
        request.word,
        request.translateSource,
        request.translateTarget,
        setting["translatorVendor"]
      );

      sendResponse(
        translatedResult || {
          translatedText: "",
          transliteration: "",
          sourceLang: "en",
          targetLang: "en",
        }
      );
    } else if (request.type === "tts") {
      doTts(
        request.word,
        request.lang,
        setting["ttsVolume"],
        setting["ttsRate"]
      );
      sendResponse({});
    } else if (request.type === "stopTTS") {
      browser.tts.stop();
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

function recordHistory(request) {
  if (setting["historyRecordActions"].includes(request.actionType)) {
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
  browser.tts.speak(word, {
    lang: lang,
    voiceName: setting["ttsVoice_" + lang],
    volume: Number(ttsVolume),
    rate: Number(ttsRate),
  });
}

const doTranslate = util.cacheFn(
  async (text, fromLang, targetLang, translatorVendor) => {
    return await translator[translatorVendor].translate(
      text,
      fromLang,
      targetLang
    );
  }
);

// detect local pdf file and redirect to translated pdf=====================================================================
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  // only run when loading and local pdf file
  if (
    changeInfo.status != "loading" ||
    setting?.detectPDF == "false" ||
    !checkIsLocalPdfUrl(changeInfo?.url)
  ) {
    return;
  }

  openPDFViewer(changeInfo.url, tabId);
});

//url is end with .pdf, start with file://
function checkIsLocalPdfUrl(url) {
  return /^(file:\/\/).*(\.pdf)$/.test(url?.toLowerCase());
}

async function openPDFViewer(url, tabId) {
  browser.tabs.update(tabId, {
    url:
      browser.runtime.getURL("/pdfjs/web/viewer.html") +
      "?file=" +
      encodeURIComponent(url),
  });
}

// ================= context menu
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "copy",
    title: "copy",
    contexts: ["all"],
    visible: false,
  });
});

function updateContext(request) {
  browser.contextMenus.update("copy", {
    title: "Copy : " + truncate(request.targetText, 20),
    visible: true,
  });
  recentTranslated = request;
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == "copy") {
    copyOntab(tab, recentTranslated.targetText);
  }
});

function copyText(text) {
  navigator.clipboard.writeText(text);
}

function runFunctionOnTab(tabId, func, args) {
  browser.scripting.executeScript({
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
browser.commands.onCommand.addListener((command) => {
  (async () => {
    if (command == "copy-translated-text") {
      var recentTab = await getCurrentTab();
      copyOntab(recentTab, recentTranslated.targetText);
    }
  })();
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

// ================= contents script reinjection after upgrade or install
async function injectContentScriptForAllTab() {
  browser.runtime.onInstalled.addListener(async (details) => {
    // skip if development mode
    if (util.checkInDevMode()) {
      return;
    }

    // if extension is upgrade or new install, refresh all tab
    for (const cs of browser.runtime.getManifest().content_scripts) {
      for (const tab of await browser.tabs.query({ url: cs.matches })) {
        if (
          /^(chrome:\/\/|edge:\/\/|file:\/\/|https:\/\/chrome\.google\.com\/webstore|chrome-extension:\/\/).*/.test(
            tab.url
          )
        ) {
          continue;
        }

        try {
          //load css and js on opened tab
          browser.scripting.insertCSS({
            target: { tabId: tab.id },
            files: cs.css,
          });
          browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: cs.js,
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
}

function addUninstallUrl(uninstallUrlJson) {
  var urlId =
    browser.runtime.id in uninstallUrlJson
      ? browser.runtime.id
      : "hmigninkgibhdckiaphhmbgcghochdjc";
  browser.runtime.setUninstallURL(uninstallUrlJson[urlId]);
}

function addInstallUrl(url) {
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason == "install") {
      browser.tabs.create({ url });
    }
  });
}
