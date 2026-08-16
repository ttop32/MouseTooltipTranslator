import translator from "/src/translator/index.js";
import wiktionary from "/src/translator/wiktionary.js";
import * as util from "/src/util";
import { isSameLanguage, isRedundantTranslation } from "/src/util/lang.js";

var fallbackEngineActList = [
  "google",
  "bing",
  "baidu",
  "papago",
  "deepl",
  "yandex",
];
var fallbackEngineCrashTimeInit = { google: 1, bing: 2, baidu: 3 };
var fallbackEngineCrashTime = { ...fallbackEngineCrashTimeInit };
var fallbackEngineCrashCount = {};
var fallbackWaitTime = 1000 * 60 * 60; // 1 hour
var fallbackEngineSwapList = ["google", "bing", "baidu"];
var fallbackMaxRetry = fallbackEngineSwapList.length;

// A failure is usually about ONE language pair, not the whole engine: deepl
// rejects pt-BR/pt-PT (it only knows PT) and yandex rejects pt-PT, while both
// keep working for every other language. Blaming the engine there benched it
// for an hour across all languages and silently served another engine, so the
// cooldown is remembered per engine+language pair first. The engine itself is
// only benched once it has failed on more than one pair, which is what a real
// outage looks like.
var fallbackPairCrashTime = {};
var fallbackPairCrashCount = {};
var fallbackEngineFailedPairs = {};

function getPairKey(engine, sourceLang, targetLang) {
  return `${engine}|${sourceLang}|${targetLang}`;
}

var setting = {};

export async function translate(
  { text, sourceLang, targetLang, reverseLang, engine },
  currentSetting
) {
  setting = currentSetting || setting;
  var engine = engine || setting["translatorVendor"];
  var response = await translateWithFallbackEngine(
    text,
    sourceLang,
    targetLang,
    engine
  );

  response = await translateSameLangInReverse({
    response,
    text,
    targetLang,
    reverseLang,
    engine,
  });

  response = await applyWiktionaryDict(response, text);

  response = wrappingFailTranslateResult(
    response,
    engine,
    sourceLang,
    targetLang,
    text
  );

  return response;
}

// When the dictionary source is set to Wiktionary, replace the translator's
// dict with Wiktionary definitions for the hovered word (#149).
async function applyWiktionaryDict(response, text) {
  if (
    !response ||
    setting["tooltipWordDictionary"] !== "true" ||
    setting["tooltipWordDictionarySource"] !== "wiktionary"
  ) {
    return response;
  }
  const dict = await wiktionary.getDict(text, response.sourceLang);
  return dict ? { ...response, dict } : response;
}

async function translateSameLangInReverse({
  response,
  text,
  targetLang,
  reverseLang,
  engine,
}) {
  if (
    isRedundantTranslation(
      text,
      response?.targetText,
      response?.sourceLang,
      targetLang
    ) &&
    reverseLang != "null" &&
    !isSameLanguage(reverseLang, targetLang) &&
    reverseLang != targetLang
  ) {
    response = await translateWithFallbackEngine(
      text,
      response.sourceLang,
      reverseLang,
      engine
    );
  }
  return response;
}

function wrappingFailTranslateResult(
  response,
  engine,
  sourceLang,
  targetLang,
  text = ""
) {
  return (
    response || {
      targetText: `${engine} is broken`,
      transliteration: "",
      sourceLang,
      targetLang,
      isBroken: true,
      text,
    }
  );
}

async function translateWithFallbackEngine(
  text,
  sourceLang,
  targetLang,
  engine,
  retry = 0
) {
  // Reset crash times if all engines are in cooldown
  if (retry === 0 && Object.values(fallbackEngineCrashTime).every(time => Date.now() < time)) {
    fallbackEngineCrashTime = { ...fallbackEngineCrashTimeInit };
    fallbackEngineCrashCount = {};
    fallbackPairCrashTime = {};
    fallbackPairCrashCount = {};
    fallbackEngineFailedPairs = {};
  }
  if (retry > fallbackMaxRetry) return null;

  fallbackEngineCrashCount[engine] ??= 0;
  fallbackEngineCrashTime[engine] ??= 0;

  const isFallbackEnabled =
    setting["fallbackTranslatorEngine"] === "true" &&
    fallbackEngineActList.includes(engine);

  const swapEngine = Object.keys(fallbackEngineCrashTime)
    .filter((e) => fallbackEngineSwapList.includes(e) && e !== engine)
    .sort((a, b) => fallbackEngineCrashTime[a] - fallbackEngineCrashTime[b])[0];

  const pairKey = getPairKey(engine, sourceLang, targetLang);
  fallbackPairCrashCount[pairKey] ??= 0;
  fallbackPairCrashTime[pairKey] ??= 0;

  const isCoolingDown =
    fallbackEngineCrashTime[engine] > Date.now() ||
    fallbackPairCrashTime[pairKey] > Date.now();

  let translateResult =
    !isCoolingDown || !isFallbackEnabled
      ? await getTranslateCached(text, sourceLang, targetLang, engine)
      : null;

  if (isFallbackEnabled && !translateResult) {
    // bench this language pair first
    fallbackPairCrashCount[pairKey]++;
    fallbackPairCrashTime[pairKey] =
      Date.now() + fallbackWaitTime * fallbackPairCrashCount[pairKey];

    // bench the engine only when it fails on more than one language pair
    fallbackEngineFailedPairs[engine] ??= new Set();
    fallbackEngineFailedPairs[engine].add(pairKey);
    if (fallbackEngineFailedPairs[engine].size > 1) {
      fallbackEngineCrashCount[engine]++;
      fallbackEngineCrashTime[engine] =
        Date.now() + fallbackWaitTime * fallbackEngineCrashCount[engine];
    }

    translateResult = await translateWithFallbackEngine(
      text,
      sourceLang,
      targetLang,
      swapEngine,
      retry + 1
    );
  } else if (translateResult) {
    // a working answer clears whatever we remembered about this engine
    fallbackPairCrashCount[pairKey] = 0;
    fallbackPairCrashTime[pairKey] = 0;
    fallbackEngineCrashCount[engine] = 0;
    // keep the seed values, they order the swap preference (google, bing, baidu)
    fallbackEngineCrashTime[engine] = fallbackEngineCrashTimeInit[engine] ?? 0;
    fallbackEngineFailedPairs[engine]?.delete(pairKey);
  }

  return translateResult;
}

const getTranslateCached = util.cacheFn(getTranslate);

async function getTranslate(text, sourceLang, targetLang, engine) {
  return await translator[engine].translate(text, sourceLang, targetLang, setting);
}
