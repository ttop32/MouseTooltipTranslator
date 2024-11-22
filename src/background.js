//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import browser from "webextension-polyfill";
import TextUtil from "/src/util/text_util.js";

import translator from "./translator/index.js";
import TTS from "/src/tts";

import * as util from "/src/util";
import SettingUtil from "/src/util/setting_util.js";
import _util from "/src/util/lodash_util.js";

var setting;
var recentTranslated = "";
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";
var recentRecord = {};

(async function backgroundInit() {
  try {
    injectContentScriptForAllTab(); // check extension updated, then re inject content script
    addInstallUrl(introSiteUrl); // check first start and redirect to how to use url
    // addUninstallUrl(util.getReviewUrl());  //listen extension uninstall and

    await getSetting(); //  load setting
    addCopyRequestListener(); // listen copy context menu and shortcut key
    addSaveTranslationKeyListener(); // listen save translation
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
        var translatedResult = await translateWithReverse(request.data);
        sendResponse(translatedResult);
      } else if (request.type === "tts") {
        request.data.setting=setting
        await TTS.playTtsQueue(request.data);
        sendResponse({});
      } else if (request.type === "stopTTS") {
        TTS.stopTTS(request?.data?.timestamp,request?.data?.force);
        sendResponse({});
      } else if (request.type === "recordTooltipText") {
        recordHistory(request.data);
        updateCopyContext(request.data);
        sendResponse({});
      } else if (request.type === "requestBase64") {
        var base64Url = await util.getBase64(request.url);
        sendResponse({ base64Url });
      } else if (request.type === "createOffscreen") {
        await util.createOffscreen();
        sendResponse({});
      }else if (request.type === "killAutoReaderTabs") {
        await util.sendMessageToAllContentScripts(request,sender.tab.id,request?.data?.includeCaller)
        sendResponse({});
      }
    })();
    return true;
  });
}

//translate function====================================================

async function translate({ text, sourceLang, targetLang, engine }) {
  var engine = engine || setting["translatorVendor"];
  return (
    (await getTranslateCached(text, sourceLang, targetLang, engine)) || {
      targetText: `${engine} is broken`,
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
  engine,
}) {
  var response = await translate({ text, sourceLang, targetLang, engine });
  //if to,from lang are same and reverse translate on
  if (
    !response.isBroken &&
    targetLang == response.sourceLang &&
    // text == response.translatedText &&
    reverseLang != null &&
    reverseLang != "null" &&
    reverseLang != targetLang
  ) {
    response = await translate({
      text,
      sourceLang: response.sourceLang,
      targetLang: reverseLang,
      engine,
    });
  }
  return response;
}

//setting ============================================================

async function getSetting() {
  setting = await SettingUtil.loadSetting();
}

function recordHistory({
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  dict,
  actionType,
}) {
  recentRecord = {
    sourceText,
    sourceLang,
    targetText,
    targetLang,
    dict,
    actionType,
    date: util.getDateNow(),
    translator: setting["translatorVendor"],
  };
  insertHistory();
}


function insertHistory(actionType) {
  if (
    setting["historyRecordActions"].includes(recentRecord.actionType) ||
    actionType
  ) {
    var newRecord = actionType
      ? TextUtil.concatJson(recentRecord, { actionType })
      : recentRecord;
    var prevRecord = setting["historyList"][0];

    //skip if same prev
    if (_util.getRecordID(newRecord) == _util.getRecordID(prevRecord)) {
      return;
    }
    //skip duplicate select
    if (
      newRecord.actionType == "select" &&
      newRecord.sourceText.includes(setting["historyList"]?.[0]?.sourceText)
    ) {
      setting["historyList"].shift();
    }

    // save
    setting["historyList"].unshift(newRecord);
    //remove when too many list
    if (setting["historyList"].length > 10000) {
      setting["historyList"].pop();
    }
    setting.save();
  }
}

function addSaveTranslationKeyListener() {
  util.addCommandListener("save-translation", () =>
    insertHistory("shortcutkey")
  );
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
    title: "Copy : " + TextUtil.truncate(targetText, 20),
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


//detect tab swtich ===================================
function addTabSwitchEventListener() {
  browser.tabs.onActivated.addListener(handleTabSwitch);
  browser.tabs.onRemoved.addListener(handleTabSwitch);
  browser.tabs.onUpdated.addListener(handleTabSwitch);
}

function handleTabSwitch() {
  TTS.stopTTS();
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
    url: util.getPDFUrl(url)
  })
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
    var text = translatedResult.isBroken ? text : translatedResult.targetText;
    //search with default search engine on current tab
    browser.search.query({ text });
  });
}
