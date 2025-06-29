import BaseTranslator from "./baseTranslator";
export default class browserAPI extends BaseTranslator {
  static detector = null;
  static translators = {};




  static async requestTranslate(text, sourceLang, targetLang) {
    // Check if the new Chrome translation APIs are available
    if (!Translator || !LanguageDetector) {
      throw new Error("Chrome Translator API not available. Requires Chrome 138+");
    }

    let detectedLang = sourceLang;

    // Always use language detector for better accuracy
    if (sourceLang === "auto") {
      try {
        if (!this.detector) {
          this.detector = await LanguageDetector.create();
        }
        const results = await this.detector.detect(text);

        if (results && results.length > 0 && results[0].confidence > 0.5) {
          detectedLang = results[0].detectedLanguage;
        } else {
          detectedLang = sourceLang === "auto" ? "en" : sourceLang;
        }
      } catch (error) {
        console.warn("Language detection failed:", error);
        detectedLang = sourceLang === "auto" ? "en" : sourceLang;
      }
    }

    // Skip translation if source and target languages are the same
    if (detectedLang === targetLang) {
      return {
        targetText: text,
        detectedLang,
        skipped: true
      };
    }
    // Preload translator availability
    const availability = await Translator.availability({
      sourceLanguage: detectedLang,
      targetLanguage: targetLang
    });

    if (availability === "unavailable") {
      throw new Error(`Translation not available for ${detectedLang} to ${targetLang}`);
    }

    const translatorKey = `${detectedLang}-${targetLang}`;

    // Create translator and monitor download progress
    if (!this.translators[translatorKey]) {
      this.translators[translatorKey] = await Translator.create({
      sourceLanguage: detectedLang,
      targetLanguage: targetLang,
      monitor(monitor) {
        monitor.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${Math.floor(e.loaded * 100)}%`);
          console.log(e)
        });
      },
      });
    }

    const targetText = await this.translators[translatorKey].translate(text);

    return {
      targetText,
      detectedLang,
      skipped: false
    };
  }

  static cleanup() {
    if (this.detector) {
      this.detector.destroy();
      this.detector = null;
    }
    for (const key in this.translators) {
      if (this.translators[key]) {
        this.translators[key].destroy();
        delete this.translators[key];
      }
    }
  }
}
