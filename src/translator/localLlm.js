import ky from "ky";
import BaseTranslator from "./baseTranslator";
import { langList } from "/src/util/lang.js";

const langCodeToName = Object.fromEntries(
  Object.entries(langList).map(([name, code]) => [code, name])
);

function langName(code) {
  return langCodeToName[code] || code;
}

export default class localLlm extends BaseTranslator {
  static apiEndpoint = "";
  static apiKey = "";
  static model = "";

  static setSettings(settings) {
    this.apiEndpoint = settings.llmApiEndpoint || "";
    this.apiKey = settings.llmApiKey || "";
    this.model = settings.llmModel || "";
  }

  static async requestTranslate(text, sourceLang, targetLang) {
    const endpoint = this.apiEndpoint.replace(/\/$/, "");
    const headers = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;

    return await ky
      .post(`${endpoint}/chat/completions`, {
        headers,
        json: {
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are a professional translator. Return only the translated text, no explanations or additional text.",
            },
            {
              role: "user",
              content: `Translate to ${langName(targetLang)}:\n\n${text}`,
            },
          ],
          temperature: 0.1,
        },
      })
      .json();
  }

  static async wrapResponse(res, text, sourceLang, targetLang) {
    const targetText = res.choices?.[0]?.message?.content?.trim() || "";
    return {
      targetText,
      detectedLang: sourceLang,
      transliteration: "",
    };
  }

  static async getModels(endpoint, apiKey) {
    const headers = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await ky
      .get(`${endpoint.replace(/\/$/, "")}/models`, { headers })
      .json();
    return (res.data || res.models || [])
      .map((m) => m.id || m.name)
      .filter(Boolean);
  }
}
