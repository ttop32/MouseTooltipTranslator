import google from "../src/translator/google";
import bing from "../src/translator/bing";
import deepl from "../src/translator/deepl";
import yandex from "../src/translator/yandex";
import papago from "../src/translator/papago";
import baidu from "../src/translator/baidu";

// npx jest

describe("Translator - translate", () => {
  test("google translator - translate", async () => {
    const text = "Hello";
    const sourceLang = "en";
    const targetLang = "es";
    const result = await google.translate(text, sourceLang, targetLang);
    expect(result.targetText).toBe("Hola"); // Expected translation
  });

  test("bing translator - translate", async () => {
    const text = "Hello";
    const sourceLang = "en";
    const targetLang = "es";
    bing.customAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
    const result = await bing.translate(text, sourceLang, targetLang);
    expect(result.targetText).toBe("Hola"); // Expected translation
  });

  test("deepl translator - translate", async () => {
    const text = "Hello";
    const sourceLang = "en";
    const targetLang = "es";
    const result = await deepl.translate(text, sourceLang, targetLang);
    expect(result.targetText).toBe("Hola"); // Expected translation
  });

  test("yandex translator - translate", async () => {
    const text = "Hello";
    const sourceLang = "en";
    const targetLang = "es";
    const result = await yandex.translate(text, sourceLang, targetLang);
    expect(result.targetText).toBe("Hola"); // Expected translation
  });

  test("papago translator - translate", async () => {
    const text = "Hello";
    const sourceLang = "en";
    const targetLang = "es";
    const result = await papago.translate(text, sourceLang, targetLang);
    expect(result.targetText).toBe("Hola."); // Expected translation
  });

  test("baidu translator - translate", async () => {
    const text = "Hello";
    const sourceLang = "en";
    const targetLang = "es";
    const result = await baidu.translate(text, sourceLang, targetLang);
    expect(result.targetText).toBe("Hola. Hola."); // Expected translation
  });
});
