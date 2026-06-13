import ky from "ky";
import BaseTranslator from "./baseTranslator";
import { langList } from "/src/util/lang.js";

const langCodeToName = Object.fromEntries(
  Object.entries(langList).map(([name, code]) => [code, name])
);

function langName(code) {
  return langCodeToName[code] || code;
}

// last config we already warned about — only warn again when it changes
let lastWarnConfigKey = null;

export default class localLlm extends BaseTranslator {
  static async translate(text, sourceLang, targetLang, settings) {
    const endpoint = settings?.llmApiEndpoint || "";
    const model = settings?.llmModel || "";
    if (!endpoint || !model) {
      const key = `${endpoint}|${model}`;
      if (lastWarnConfigKey !== key) {
        console.warn(
          "[localLlm] Skipping translation: API endpoint or model not configured"
        );
        lastWarnConfigKey = key;
      }
      return;
    }
    return await super.translate(text, sourceLang, targetLang, settings);
  }

  static async requestTranslate(text, sourceLang, targetLang, settings) {
    const endpoint = (settings?.llmApiEndpoint || "").replace(/\/$/, "");
    const apiKey = settings?.llmApiKey || "";
    const model = settings?.llmModel || "";

    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

    const target = langName(targetLang);
    const instruction =
      sourceLang && sourceLang !== "auto"
        ? `Translate from ${langName(sourceLang)} to ${target}.`
        : `Translate to ${target}.`;

    return await ky
      .post(`${endpoint}/chat/completions`, {
        headers,
        timeout: 60000,
        retry: 0,
        json: {
          model,
          messages: [
            {
              role: "system",
              content:
                "Reply only: source ISO 639-1 code, a tab, then the translation.",
            },
            {
              role: "user",
              content: `${instruction}\n<text>\n${text}\n</text>`,
            },
          ],
          temperature: 0.1,
        },
      })
      .json();
  }

  static async wrapResponse(res, text, sourceLang, targetLang) {
    const raw = res?.choices?.[0]?.message?.content?.trim() || "";
    // expected "<iso code>\t<translation>"; parse tolerantly — if it doesn't
    // match (model ignored the format), treat the whole reply as the translation
    // so nothing regresses. detectedLang lets same-language skip / source TTS work.
    let detectedLang = "";
    let targetText = raw;
    const match = raw.match(/^([a-zA-Z]{2,3}(?:-[a-zA-Z]{2,4})?)[\t\n]+([\s\S]+)$/);
    if (match) {
      detectedLang = match[1].toLowerCase();
      targetText = match[2].trim();
    }
    return {
      targetText,
      detectedLang,
      transliteration: "",
    };
  }

  // Accepts OpenAI ({data:[{id}]}) and Ollama ({models:[{name}]}) shapes;
  // other gateways may use {model:"..."} which we also try.
  static async getModels(endpoint, apiKey) {
    if (!endpoint) throw new Error("LLM API endpoint is not set");
    const headers = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await ky
      .get(`${endpoint.replace(/\/$/, "")}/models`, {
        headers,
        timeout: 15000,
        retry: 0,
      })
      .json();
    return (res.data || res.models || [])
      .map((m) => m.id || m.name || m.model)
      .filter(Boolean);
  }
}
