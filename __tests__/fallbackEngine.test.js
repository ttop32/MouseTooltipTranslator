// no network - the translator registry is mocked so only the fallback
// bookkeeping in translateCaller is exercised (#363 follow-up)
const calls = [];

jest.mock("/src/translator/index.js", () => {
  const record = (name) => async (text, sourceLang, targetLang) => {
    calls.push(`${name}:${sourceLang}->${targetLang}`);
    // deepl knows PT but not the regional variants
    if (name === "deepl" && String(targetLang).includes("-")) return undefined;
    return {
      targetText: `${name}(${text})`,
      transliteration: "",
      sourceLang: "en",
      targetLang,
    };
  };
  return {
    __esModule: true,
    default: {
      deepl: { translate: record("deepl") },
      google: { translate: record("google") },
      bing: { translate: record("bing") },
      baidu: { translate: record("baidu") },
    },
  };
});

const { translate } = require("../src/translator/translateCaller.js");

const setting = {
  fallbackTranslatorEngine: "true",
  tooltipWordDictionary: "false",
};

const engineOf = (res) => String(res?.targetText || "").split("(")[0];

describe("fallback engine cooldown", () => {
  beforeEach(() => (calls.length = 0));

  test("an unsupported language pair does not bench the engine for other languages", async () => {
    // pt-BR is not supported by the mocked deepl -> another engine answers
    const first = await translate(
      { text: "hello", sourceLang: "auto", targetLang: "pt-BR", reverseLang: "null", engine: "deepl" },
      setting
    );
    expect(engineOf(first)).not.toBe("deepl");
    expect(calls).toContain("deepl:auto->pt-BR");

    // a different target must still go to deepl (it used to be benched for an hour)
    calls.length = 0;
    const second = await translate(
      { text: "hello", sourceLang: "auto", targetLang: "es", reverseLang: "null", engine: "deepl" },
      setting
    );
    expect(engineOf(second)).toBe("deepl");
    expect(calls).toContain("deepl:auto->es");
  });

  test("the failing pair is not retried while it is cooling down", async () => {
    await translate(
      { text: "second call", sourceLang: "auto", targetLang: "pt-PT", reverseLang: "null", engine: "deepl" },
      setting
    );
    calls.length = 0;
    const again = await translate(
      { text: "third call", sourceLang: "auto", targetLang: "pt-PT", reverseLang: "null", engine: "deepl" },
      setting
    );
    expect(calls).not.toContain("deepl:auto->pt-PT");
    expect(engineOf(again)).not.toBe("deepl");
  });
});
