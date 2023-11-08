//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import translator from "./translator/index.js";
import { waitUntil } from "async-wait-until";
import * as util from "/src/util";
import browser from "webextension-polyfill";

var setting;
var recentTranslated = {};
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";

addInstallUrl(introSiteUrl);
addUninstallUrl(util.getReviewUrl());
addCopyRequestListener();
injectContentScriptForAllTab();
getSetting();

//listen message from contents js and popup js =========================================================================================================
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
          translatedText: `${setting["translatorVendor"]} is broken`,
          transliteration: "",
          sourceLang: "",
          targetLang: setting["translateTarget"],
          isBroken: true,
        }
      );
    } else if (request.type === "tts") {
      doTts(
        request.sourceText,
        request.sourceLang,
        request.targetText,
        request.targetLang,
        Number(setting["voiceVolume"]),
        Number(setting["voiceRate"]),
        setting["voiceTarget"],
        Number(setting["voiceRepeat"])
      );
      sendResponse({});
    } else if (request.type === "stopTTS") {
      browser.tts.stop();
      sendResponse({});
    } else if (request.type === "recordTooltipText") {
      recordHistory(request);
      updateCopyContext(request);
      sendResponse({});
    } else if (request.type === "removeContextAll") {
      removeContextAll();
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
      sourceLang: request.sourceLang,
      targetLang: request.targetLang,
      date: JSON.stringify(new Date()),
      translator: setting["translatorVendor"],
      actionType: request.actionType,
    });

    //remove when too many list
    if (setting["historyList"].length > 10000) {
      setting["historyList"].pop();
    }
    setting.save();
  }
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

// tts=============================================================================

async function doTts(
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  ttsVolume,
  ttsRate,
  ttsTarget,
  ttsRepeat
) {
  browser.tts.stop(); //remove prev voice

  for (var i = 0; i < ttsRepeat; i++) {
    if (ttsTarget == "source") {
      enqueueTts(sourceText, sourceLang, ttsVolume, ttsRate);
    } else if (ttsTarget == "target") {
      enqueueTts(targetText, targetLang, ttsVolume, ttsRate);
    } else if (ttsTarget == "sourcetarget") {
      enqueueTts(sourceText, sourceLang, ttsVolume, ttsRate);
      enqueueTts(targetText, targetLang, ttsVolume, ttsRate);
    } else if (ttsTarget == "targetsource") {
      enqueueTts(targetText, targetLang, ttsVolume, ttsRate);
      enqueueTts(sourceText, sourceLang, ttsVolume, ttsRate);
    }
  }
}

function enqueueTts(text, lang, volume, rate) {
  browser.tts.speak(text, {
    lang,
    voiceName: setting["ttsVoice_" + lang],
    volume,
    rate,
    enqueue: true,
  });
}

// detect local pdf file and redirect to translated pdf=====================================================================
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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

// ================= Copy

function addCopyRequestListener() {
  // context menu handler for copy
  util.addContextListener("copy", requestCopyForTargetText);
  //command shortcut key handler for copy
  util.addCommandListener("copy-translated-text", requestCopyForTargetText);
}

async function updateCopyContext(request) {
  // remove previous
  await removeContext("copy");
  //create new menu
  browser.contextMenus.create({
    id: "copy",
    title: "Copy : " + util.truncate(request.targetText, 20),
    contexts: ["all"],
    visible: true,
  });
  recentTranslated = request;
}

async function removeContext(id) {
  try {
    await browser.contextMenus.remove(id);
  } catch (error) {}
}
async function removeContextAll(id) {
  await browser.contextMenus.removeAll();
}

function requestCopyForTargetText() {
  requestCopyOnTab(recentTranslated.targetText);
}

function requestCopyOnTab(text) {
  util.sendMessageToCurrentTab({ type: "CopyRequest", text });
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

function addUninstallUrl(url) {
  browser.runtime.setUninstallURL(url);
}

function addInstallUrl(url) {
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason == "install") {
      browser.tabs.create({ url });
    }
  });
}
