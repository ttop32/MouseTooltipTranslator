import ky from "ky";

// Wiktionary as an alternative tooltip dictionary source (#149).
// Uses the public REST "definition" API (CORS-enabled, no key) which returns
// part-of-speech + English definitions grouped by the headword's language.
// Returns a "pos: def1; def2" string in the same shape as the translator dict,
// or "" when nothing usable is found.
export default class wiktionary {
  static apiUrl = "https://en.wiktionary.org/api/rest_v1/page/definition/";
  static maxDefsPerPos = 3;

  static async getDict(word, sourceLang = "en") {
    word = (word || "").trim();
    if (!word || /\s/.test(word)) {
      return ""; // dictionary lookup only makes sense for a single word
    }
    let res;
    try {
      res = await ky(this.apiUrl + encodeURIComponent(word), {
        headers: { accept: "application/json" },
      }).json();
    } catch (e) {
      console.log(e);
      return "";
    }

    // prefer the section for the hovered word's language, else the first one
    const entries = res?.[sourceLang] || res?.[Object.keys(res || {})[0]];
    if (!Array.isArray(entries)) {
      return "";
    }
    return entries
      .map((entry) => {
        const defs = (entry.definitions || [])
          .map((d) => stripHtml(d.definition))
          .filter(Boolean)
          .slice(0, this.maxDefsPerPos)
          .join("; ");
        return defs ? `${entry.partOfSpeech}: ${defs}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
}

// strip Wiktionary's definition HTML down to plain text (runs in the background
// service worker, so no DOM parser is available)
function stripHtml(html = "") {
  return html
    .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, "") // drop style/script blocks
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
