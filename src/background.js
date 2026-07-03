//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import browser from "webextension-polyfill";
import TextUtil from "/src/util/text_util.js";

import TTS from "/src/tts";
import { translate } from "/src/translator/translateCaller.js";
import * as util from "/src/util";
import SettingUtil from "/src/util/setting_util.js";
import _util from "/src/util/lodash_util.js";

var setting;
var recentTranslated = "";
var recentSource = "";
const DEFAULT_WORD_GROUP_ID = 1; // default saved-word group
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";
var recentRecord = {};

(async function backgroundInit() {
  try {
    injectContentScriptForAllTab(); // check extension updated, then re inject content script
    addInstallUrl(introSiteUrl); // check first start and redirect to how to use url
    addUpdateUrl(); // on each update, open a "what's new" tab (changelog + donation)
    // addUninstallUrl(util.getReviewUrl());  //listen extension uninstall and

    await getSetting(); //  load setting
    addCopyRequestListener(); // listen copy / save context menus and shortcut key
    addTabSwitchEventListener(); // listen tab switch for kill tts
    addPdfFileTabListener(); //listen drag and drop pdf
    addFirefoxPdfRedirectListener(); //firefox: redirect web pdf to our viewer
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
        var translatedResult = await translate(request.data, setting);
        sendResponse(translatedResult);
      } else if (request.type === "tts") {
        request.data.setting = setting;
        await TTS.playTtsQueue(request.data);
        sendResponse({});
      } else if (request.type === "stopTTS") {
        TTS.stopTTS(request?.data?.timestamp, request?.data?.force);
        sendResponse({});
      } else if (request.type === "pauseResumeTTS") {
        await TTS.pauseResume();
        sendResponse({});
      } else if (request.type === "recordTooltipText") {
        recordHistory(request.data);
        updateContextMenus(request.data);
        sendResponse({});
      } else if (request.type === "saveTranslation") {
        // in-page save key / Ctrl+Shift+1..5 -> force record into target group
        insertHistory("shortcutkey", request?.data?.groupId);
        sendResponse({});
      } else if (request.type === "requestBase64") {
        var base64Url = await util.getBase64(request.url);
        sendResponse({ base64Url });
      } else if (request.type === "createOffscreen") {
        await util.createOffscreen();
        sendResponse({});
      } else if (request.type === "killAutoReaderTabs") {
        await util.sendMessageToAllContentScripts(
          request,
          sender.tab.id,
          request?.data?.includeCaller
        );
        sendResponse({});
      } else if (request.type === "resetSetting") {
        setting = await SettingUtil.resetSetting();
        sendResponse({ success: true });
      } else if (request.type === "importSetting") {
        setting = await SettingUtil.importSetting(request.data);
        sendResponse({ success: true });
      } else if (request.type === "exportSetting") {
        const settingData = await SettingUtil.exportSetting();
        sendResponse({ settingData });
      }
    })();
    return true;
  });
}

//setting ============================================================

async function getSetting() {
  setting = await SettingUtil.loadSetting(onSettingChanged);
}

// react to live setting changes from the popup / Saved Words page
function onSettingChanged(changes) {
  // "Save to <group>" toggle flipped: rebuild the menus now (Copy stays,
  // group menus added/removed) instead of waiting for the next tooltip.
  if (changes["saveContextMenu"]) {
    updateContextMenus({ targetText: recentTranslated });
  }
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
  insertHistory(); // auto-record path (group decided by each group's key)
}

// which group auto-saves this action ("select"/"mouseover"); null = none.
// a group's key may be "select" / "mouseover" / "both" (exact wins over both)
function getAutoGroupId(action) {
  var groups = setting["wordGroups"] || [];
  var exact = groups.find((g) => g.key === action);
  if (exact) return exact.id;
  var both = groups.find((g) => g.key === "both");
  return both ? both.id : null;
}

function insertHistory(actionType, groupId) {
  var isExplicit = !!actionType; // manual save (Ctrl+Shift+N / right-click)
  var targetGroupId;
  if (isExplicit) {
    targetGroupId = groupId != null ? groupId : DEFAULT_WORD_GROUP_ID;
  } else {
    // auto-record: only when a group is configured to auto-save this action
    targetGroupId = getAutoGroupId(recentRecord.actionType);
    if (targetGroupId == null) {
      return;
    }
  }

  var base = isExplicit
    ? TextUtil.concatJson(recentRecord, { actionType })
    : recentRecord;
  var newRecord = TextUtil.concatJson(base, { groupId: targetGroupId });
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

// ================= Copy / Save context menus

function addCopyRequestListener() {
  util.addCommandListener("copy-translated-text", requestCopyForTargetText); //command shortcut key handler for copy translated
  util.addCommandListener("copy-source-text", requestCopyForSourceText); //command shortcut key handler for copy source (#204, hotkey only)
  // single onClicked handler: "copy" + dynamic "save-group-<id>" menus
  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "copy") {
      requestCopyForTargetText();
    } else if (String(info.menuItemId).startsWith("save-group-")) {
      var gid = parseInt(String(info.menuItemId).replace("save-group-", ""), 10);
      insertHistory("shortcutkey", gid);
    }
  });
}

async function updateContextMenus({ targetText, sourceText }) {
  recentTranslated = targetText;
  recentSource = sourceText ?? recentSource;
  await browser.contextMenus.removeAll();
  // "Copy" is the long-standing default and is always available. The Saved
  // Words page toggle only governs the per-group "Save to <group>" menus.
  browser.contextMenus.create({
    id: "copy",
    title: "Copy : " + TextUtil.truncate(targetText, 20),
    contexts: ["all"],
    visible: true,
  });
  if (!setting["saveContextMenu"]) {
    return;
  }
  for (const group of setting["wordGroups"] || []) {
    browser.contextMenus.create({
      id: "save-group-" + group.id,
      title: "Save to " + group.name,
      contexts: ["all"],
      visible: true,
    });
  }
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

function requestCopyForSourceText() {
  requestCopyOnTab(recentSource);
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

// on extension update, open the "what's new" page (changelog + donation ask).
// only every 10th patch release (…230, …240) so it doesn't nag on every update.
function addUpdateUrl() {
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason != "update") {
      return;
    }
    var patch = parseInt(
      browser.runtime.getManifest().version.split(".").pop(),
      10
    );
    if (Number.isFinite(patch) && patch % 10 === 0) {
      browser.tabs.create({
        url: browser.runtime.getURL("popup.html?whatsnew=1"),
      });
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
    url: util.getPDFUrl(url),
  });
}

//url is end with .pdf, start with file://
function checkIsLocalPdfUrl(url) {
  return /^(file:\/\/).*(\.pdf)$/.test(url?.toLowerCase());
}

// Firefox only: its built-in pdf.js viewer is a privileged page we can't inject
// our tooltip/translation into (bugzilla 1454760, unfixed 7+ yrs). So intercept
// http(s) PDF navigations BEFORE the built-in viewer loads and redirect them to
// our own bundled viewer (a normal extension page where the content script
// runs). Chrome (MV3) can't use blocking webRequest and keeps the embed-swap
// path in contentScript.detectPDF instead.
// Limitation: Firefox webRequest can't intercept file:// requests, so local PDFs
// still open in the built-in viewer.
function addFirefoxPdfRedirectListener() {
  if (!util.isFirefox() || !browser.webRequest?.onBeforeRequest) {
    return;
  }
  browser.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (setting?.detectPDF === "false") {
        return {};
      }
      // never touch our own viewer (it loads the pdf via ?file=) -> no loop
      if (details.url.includes("/pdfjs/web/viewer.html")) {
        return {};
      }
      return { redirectUrl: util.getPDFUrl(details.url) };
    },
    { urls: ["*://*/*.pdf", "*://*/*.pdf?*"], types: ["main_frame"] },
    ["blocking"]
  );
}

//search bar================================================
function addSearchBarListener() {
  browser.omnibox.setDefaultSuggestion({
    description: "search with translator",
  });

  browser.omnibox.onInputEntered.addListener(async (text) => {
    var translatedResult = await translate(
      {
        text,
        sourceLang: "auto",
        targetLang: setting["writingLanguage"],
        reverseLang: setting["translateTarget"],
      },
      setting
    );
    var text = translatedResult.isBroken ? text : translatedResult.targetText;
    //search with default search engine on current tab
    browser.search.query({ text });
  });
}
