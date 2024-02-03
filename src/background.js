//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import browser from "webextension-polyfill";
import delay from "delay";

import translator from "./translator/index.js";
import tts from "./tts/index.js";
import * as util from "/src/util";

var setting;
var recentTranslated = "";
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";
var stopTtsTimestamp = 0;

(async function backgroundInit() {
  try {
    injectContentScriptForAllTab(); // check extension updated, then re inject content script
    addInstallUrl(introSiteUrl); // check first start and redirect to how to use url
    // addUninstallUrl(util.getReviewUrl());

    await getSetting(); //  load setting
    addCopyRequestListener(); // listen copy context menu and shortcut key
    addTabSwitchEventListener(); // listen tab switch for kill tts
    addPdfFileTabListener(); //listen drag and drop pdf
    addSearchBarListener(); // listen url search bar for translate omnibox
    addMessageListener(); // listen message from content script for handle translate & tts
  } catch (error) {
    console.log(error);
  }
})();

//listen message from contents js and popup js =========================================================================================================
function addMessageListener() {
  browser.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    (async () => {
      if (request.type === "translate") {
        var translatedResult = await translate(request.data);
        sendResponse(translatedResult);
      } else if (request.type === "translateWithReverse") {
        var translatedResult = await translateWithReverse(request.data);
        sendResponse(translatedResult);
      } else if (request.type === "tts") {
        playTtsQueue(request.data);
        sendResponse({});
      } else if (request.type === "stopTTS") {
        stopTts();
        sendResponse({});
      } else if (request.type === "recordTooltipText") {
        recordHistory(request.data);
        updateCopyContext(request.data);
        sendResponse({});
      } else if (request.type === "requestBase64") {
        var base64Url = await util.getBase64(request.url);
        sendResponse({ base64Url });
      }
    })();
    return true;
  });
}

async function getSetting() {
  setting = await util.loadSetting();
}

function recordHistory({
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  actionType,
}) {
  if (setting["historyRecordActions"].includes(actionType)) {
    //append history to front
    setting["historyList"].unshift({
      sourceText,
      sourceLang,
      targetText,
      targetLang,
      actionType,
      date: JSON.stringify(new Date()),
      translator: setting["translatorVendor"],
    });

    //remove when too many list
    if (setting["historyList"].length > 10000) {
      setting["historyList"].pop();
    }
    setting.save();
  }
}

// cached translate function

async function translate({ text, sourceLang, targetLang }) {
  var engine = setting["translatorVendor"];
  return (
    (await getTranslateCached(text, sourceLang, targetLang, engine)) || {
      translatedText: `${engine} is broken`,
      transliteration: "",
      sourceLang: "",
      targetLang: setting["translateTarget"],
      isBroken: true,
    }
  );
}

const getTranslateCached = util.cacheFn(getTranslate);

async function getTranslate(text, sourceLang, targetLang, engine) {
  return await translator[engine].translate(text, sourceLang, targetLang);
}

async function translateWithReverse({
  text,
  sourceLang,
  targetLang,
  reverseLang,
}) {
  var response = await translate({ text, sourceLang, targetLang });
  //if to,from lang are same and reverse translate on
  if (
    !response.isBroken &&
    targetLang == response.sourceLang &&
    reverseLang != "null" &&
    targetLang != reverseLang
  ) {
    response = await translate({
      text,
      sourceLang: response.sourceLang,
      reverseLang,
    });
  }
  return response;
}

// ================= Copy

function addCopyRequestListener() {
  util.addContextListener("copy", requestCopyForTargetText); // context menu handler for copy
  util.addCommandListener("copy-translated-text", requestCopyForTargetText); //command shortcut key handler for copy
}

async function updateCopyContext({ targetText }) {
  // remove previous
  await removeContext("copy");
  //create new menu
  browser.contextMenus.create({
    id: "copy",
    title: "Copy : " + util.truncate(targetText, 20),
    contexts: ["all"],
    visible: true,
  });
  recentTranslated = targetText;
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
  requestCopyOnTab(recentTranslated);
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
          /^(chrome:\/\/|edge:\/\/|file:\/\/|https:\/\/chrome\.google\.com|https:\/\/chromewebstore\.google\.com|chrome-extension:\/\/).*/.test(
            tab.url
          )
        ) {
          continue;
        }

        try {
          //load css and js on opened tab
          if (cs.css) {
            browser.scripting.insertCSS({
              target: { tabId: tab.id },
              files: cs.css,
            });
          }
          if (cs.js) {
            browser.scripting.executeScript({
              target: { tabId: tab.id },
              files: cs.js,
            });
          }
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

// tts=============================================================================

async function playTtsQueue({
  sourceText,
  sourceLang,
  targetText,
  targetLang,
}) {
  // browser.tts.stop(); //remove prev voice
  var ttsTarget = setting["voiceTarget"];
  var ttsRepeat = Number(setting["voiceRepeat"]);
  stopTts();
  await delay(10);
  var startTimeStamp = Date.now();

  for (var i = 0; i < ttsRepeat; i++) {
    if (ttsTarget == "source") {
      await playTts(sourceText, sourceLang, startTimeStamp);
    } else if (ttsTarget == "target") {
      await playTts(targetText, targetLang, startTimeStamp);
    } else if (ttsTarget == "sourcetarget") {
      await playTts(sourceText, sourceLang, startTimeStamp);
      await playTts(targetText, targetLang, startTimeStamp);
    } else if (ttsTarget == "targetsource") {
      await playTts(targetText, targetLang, startTimeStamp);
      await playTts(sourceText, sourceLang, startTimeStamp);
    }
  }
}

function stopTts() {
  stopTtsTimestamp = Date.now();
  tts["BrowserTTS"].stopTTS();
}

async function playTts(text, lang, startTimeStamp) {
  if (startTimeStamp < stopTtsTimestamp) {
    return;
  }
  var volume = setting["voiceVolume"];
  var rate = setting["voiceRate"];
  var voiceFullName = setting?.["ttsVoice_" + lang];
  var isExternalTts = /^(BingTTS|GoogleTranslateTTS).*/.test(voiceFullName);
  var voice = isExternalTts ? voiceFullName.split("_")[1] : voiceFullName;
  var engine = isExternalTts ? voiceFullName.split("_")[0] : "BrowserTTS";
  await tts[engine].playTTS(text, voice, lang, rate, volume);
}

//detect tab swtich ===================================
function addTabSwitchEventListener() {
  browser.tabs.onActivated.addListener(handleTabSwitch);
  browser.tabs.onRemoved.addListener(handleTabSwitch);
  browser.tabs.onUpdated.addListener(handleTabSwitch);
}

function handleTabSwitch() {
  stopTts();
  removeContextAll();
}

// detect local pdf file and redirect to translated pdf=====================================================================
function addPdfFileTabListener() {
  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // only run when loading and local pdf file
    if (changeInfo.status != "loading" || setting?.detectPDF == "false") {
      return;
    }

    openPDFViewer(changeInfo?.url, tabId);
  });
}

async function openPDFViewer(url, tabId) {
  if (!checkIsLocalPdfUrl(url)) {
    return;
  }
  browser.tabs.update(tabId, {
    url: browser.runtime.getURL(
      `/pdfjs/web/viewer.html?file=${encodeURIComponent(url)}`
    ),
  });
}

//url is end with .pdf, start with file://
function checkIsLocalPdfUrl(url) {
  return /^(file:\/\/).*(\.pdf)$/.test(url?.toLowerCase());
}

//search bar================================================

function addSearchBarListener() {
  browser.omnibox.setDefaultSuggestion({
    description: "search with translator",
  });

  browser.omnibox.onInputEntered.addListener(async (text) => {
    var translatedResult = await translateWithReverse({
      text,
      sourceLang: "auto",
      targetLang: setting["writingLanguage"],
      reverseLang: setting["translateTarget"],
    });
    var text = translatedResult.isBroken
      ? text
      : translatedResult.translatedText;
    //search with default search engine on current tab
    browser.search.query({ text });
  });
}
