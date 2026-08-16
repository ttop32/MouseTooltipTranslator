import {
  isSameLanguage,
  isRedundantTranslation,
  isLangExcluded,
} from "../src/util/lang.js";

// no network - pure language code handling (#363, #257)
describe("isSameLanguage", () => {
  test("collapses a base code and its regional variant", () => {
    expect(isSameLanguage("pt", "pt-BR")).toBe(true);
    expect(isSameLanguage("pt-BR", "pt")).toBe(true);
    expect(isSameLanguage("fr", "fr-CA")).toBe(true);
  });

  test("keeps two different regional variants apart", () => {
    expect(isSameLanguage("pt-BR", "pt-PT")).toBe(false);
    expect(isSameLanguage("fr-FR", "fr-CA")).toBe(false);
  });

  test("never collapses chinese or script tags", () => {
    expect(isSameLanguage("zh-CN", "zh-TW")).toBe(false);
    expect(isSameLanguage("zh", "zh-CN")).toBe(false);
    expect(isSameLanguage("ms", "ms-Arab")).toBe(false);
    expect(isSameLanguage("pa", "pa-Arab")).toBe(false);
    expect(isSameLanguage("mni-Mtei", "mni")).toBe(false);
  });

  test("normalizes case and underscores, ignores empty/auto", () => {
    expect(isSameLanguage("PT", "pt-br")).toBe(true);
    expect(isSameLanguage("pt_BR", "pt-BR")).toBe(true);
    expect(isSameLanguage("auto", "auto")).toBe(false);
    expect(isSameLanguage("", "")).toBe(false);
    expect(isSameLanguage(undefined, "pt")).toBe(false);
  });
});

describe("isRedundantTranslation", () => {
  const pt = "Em 1815, o Brasil se torna parte de um reino unido com Portugal.";
  const ptPT = "Em 1815, o Brasil passa a fazer parte de um reino unido com Portugal.";

  test("an identical code always counts as redundant", () => {
    expect(isRedundantTranslation(pt, ptPT, "pt", "pt")).toBe(true);
  });

  test("a variant pair is redundant only when the text came back unchanged", () => {
    expect(isRedundantTranslation(pt, pt, "pt", "pt-BR")).toBe(true);
    expect(isRedundantTranslation(pt, ptPT, "pt", "pt-PT")).toBe(false);
  });

  test("whitespace differences do not count as a change", () => {
    expect(isRedundantTranslation("  hello   world ", "hello world", "en", "en-GB")).toBe(true);
  });

  test("different languages are never redundant", () => {
    expect(isRedundantTranslation(pt, "In 1815...", "pt", "en")).toBe(false);
  });
});

describe("isLangExcluded", () => {
  test("matches a regional entry against a detected base code", () => {
    expect(isLangExcluded(["pt-BR"], "pt")).toBe(true);
    expect(isLangExcluded(["pt"], "pt-BR")).toBe(true);
  });

  test("does not over-match", () => {
    expect(isLangExcluded(["pt-BR"], "pt-PT")).toBe(false);
    expect(isLangExcluded(["zh-CN"], "zh-TW")).toBe(false);
    expect(isLangExcluded(["en"], "pt")).toBe(false);
    expect(isLangExcluded([], "pt")).toBe(false);
    expect(isLangExcluded(undefined, "pt")).toBe(false);
  });
});
