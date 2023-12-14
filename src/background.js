//handle translation
//it communicate with  contentScript.js(for translation and tts)
//listen context menu, uninstall, first install, extension update

import browser from "webextension-polyfill";
import { waitUntil } from "async-wait-until";
import delay from "delay";

import translator from "./translator/index.js";
import * as util from "/src/util";

var setting;
var recentTranslated = {};
var introSiteUrl =
  "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#how-to-use";
var stopTtsTimestamp = 0;

backgroundInit();

function backgroundInit() {
  getSetting();
  injectContentScriptForAllTab();
  addInstallUrl(introSiteUrl);
  // addUninstallUrl(util.getReviewUrl());
  addCopyRequestListener();
  addTabSwitchEventListener();
  addPdfFileTabListener();
  addMessageListener();
}

//listen message from contents js and popup js =========================================================================================================
function addMessageListener() {
  browser.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
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
        playTtsQueue(
          request.sourceText,
          request.sourceLang,
          request.targetText,
          request.targetLang,
          setting["voiceTarget"],
          Number(setting["voiceRepeat"])
        );
        sendResponse({});
      } else if (request.type === "stopTTS") {
        stopTts();
        sendResponse({});
      } else if (request.type === "recordTooltipText") {
        recordHistory(request);
        updateCopyContext(request);
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

// cached translate function
const doTranslate = util.cacheFn(
  async (text, fromLang, targetLang, translatorVendor) => {
    return await translator[translatorVendor].translate(
      text,
      fromLang,
      targetLang
    );
  }
);

// ================= Copy

function addCopyRequestListener() {
  util.addContextListener("copy", requestCopyForTargetText); // context menu handler for copy
  util.addCommandListener("copy-translated-text", requestCopyForTargetText); //command shortcut key handler for copy
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

async function playTtsQueue(
  sourceText,
  sourceLang,
  targetText,
  targetLang,
  ttsTarget,
  ttsRepeat
) {
  // browser.tts.stop(); //remove prev voice
  stopTts();
  var startTimeStamp = Date.now() + 10;

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
  browser.tts.stop(); //remove prev voice
  stopTtsOffscreen();
}

async function playTts(text, lang, startTimeStamp) {
  if (startTimeStamp < stopTtsTimestamp) {
    return;
  }
  var voice = setting?.["ttsVoice_" + lang];
  var volume = Number(setting["voiceVolume"]);
  var rate = Number(setting["voiceRate"]);

  if (voice?.includes("BingTTS")) {
    await playBingTts(text, voice, rate, volume);
  } else if (voice?.includes("GoogleTranslateTTS_")) {
    await playGoogleTranslateTts(text, lang, rate, volume);
  } else {
    await playBrowserTts(text, lang, voice, rate, volume);
  }
}

function playBrowserTts(text, lang, voiceName, rate, volume) {
  return new Promise((resolve, reject) => {
    browser.tts.speak(text, {
      lang,
      voiceName,
      volume,
      rate,
      onEvent: (event) => {
        if (["end", "interrupted", "cancelled", "error"].includes(event.type)) {
          resolve();
        }
      },
    });
  });
}

async function playBingTts(text, voice, rate, volume) {
  try {
    var ttsBlob = await translator["bing"].requestTts(text, voice, rate);
    var base64Url = await getBase64Url(ttsBlob);
    await playSound(base64Url, 1, volume);
  } catch (error) {
    console.log(error);
  }
}

async function playGoogleTranslateTts(text, lang, rate, volume) {
  try {
    var googleTranslateTtsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${lang}&client=tw-ob`;
    await playSound(googleTranslateTtsUrl, rate, volume);
  } catch (error) {
    console.log(error);
  }
}

function getBase64Url(blob) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onload = function () {
      var dataUrl = reader.result;
      resolve(dataUrl);
    };
    reader.readAsDataURL(blob);
  });
}

async function playSound(source, rate, volume) {
  await createOffscreen();
  await chrome.runtime.sendMessage({
    play: {
      source,
      rate,
      volume,
    },
  });
}

async function stopTtsOffscreen() {
  await createOffscreen();
  await chrome.runtime.sendMessage({ stop: {} });
  // removeOffscreen();
}

// Create the offscreen document
async function createOffscreen() {
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "play tts", // details for using the API
    });
  } catch (error) {
    if (!error.message.startsWith("Only a single offscreen")) throw error;
  }
}

function removeOffscreen() {
  return new Promise((resolve, reject) => {
    chrome.offscreen.closeDocument(() => resolve());
  });
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
