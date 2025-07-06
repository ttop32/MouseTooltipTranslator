import translator from "/src/translator/index.js";
import * as util from "/src/util";

var fallbackEngineActList = [
  "google",
  "bing",
  "baidu",
  "papago",
  "deepl",
  "yandex",
];
var fallbackEngineCrashTime = { google: 1, bing: 2, baidu: 3 };
var fallbackEngineCrashCount = {};
var fallbackWaitTime = 1000 * 60 * 60; // 1 hour
var fallbackEngineSwapList = ["google", "bing", "baidu"];
var fallbackMaxRetry = fallbackEngineSwapList.length;

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

  response = wrappingFailTranslateResult(
    response,
    engine,
    sourceLang,
    targetLang,
    text
  );

  return response;
}

async function translateSameLangInReverse({
  response,
  text,
  targetLang,
  reverseLang,
  engine,
}) {
  if (
    targetLang == response?.sourceLang &&
    reverseLang != "null" &&
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
  if (retry > fallbackMaxRetry) return null;

  fallbackEngineCrashCount[engine] ??= 0;
  fallbackEngineCrashTime[engine] ??= 0;

  const isFallbackEnabled =
    setting["fallbackTranslatorEngine"] === "true" &&
    fallbackEngineActList.includes(engine);

  const swapEngine = Object.keys(fallbackEngineCrashTime)
    .filter((e) => fallbackEngineSwapList.includes(e) && e !== engine)
    .sort((a, b) => fallbackEngineCrashTime[a] - fallbackEngineCrashTime[b])[0];

  let translateResult =
    fallbackEngineCrashTime[engine] < Date.now() || !isFallbackEnabled
      ? await getTranslateCached(text, sourceLang, targetLang, engine)
      : null;

  if (isFallbackEnabled && !translateResult) {
    fallbackEngineCrashCount[engine]++;
    fallbackEngineCrashTime[engine] =
      Date.now() + fallbackWaitTime * fallbackEngineCrashCount[engine];
    translateResult = await translateWithFallbackEngine(
      text,
      sourceLang,
      targetLang,
      swapEngine,
      retry + 1
    );
  }

  return translateResult;
}

const getTranslateCached = util.cacheFn(getTranslate);

async function getTranslate(text, sourceLang, targetLang, engine) {
  return await translator[engine].translate(text, sourceLang, targetLang);
}
