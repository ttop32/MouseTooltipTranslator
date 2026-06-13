<template>
  <popupWindow>
    <!-- top nav bar -->
    <v-toolbar color="primary" dark dense>
      <v-col cols="7">
        <v-toolbar-title Class="text-subtitle-1 ml-3 font-weight-bold">
        <div>{{ remainSettingDesc["appName"] }}</div>
        </v-toolbar-title>
      </v-col>

      <v-spacer></v-spacer>

      <v-btn
        v-for="(iconData, iconId) in toolbarIcons"
        :key="iconId"
        :title="iconData.title"
        icon
        @click="openIcon(iconData)"
      >
        <v-icon>{{ iconData.icon }}</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs
          v-model="currentTab"
          center-active
          show-arrows
          slider-color="red"
          class="custom-tabs"
        >
          <v-tab v-for="(tabName, tabId) in tabs" :key="tabId" :value="tabId" :text="tabName">
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- main page contents -->

    <v-tabs-window
      v-model="currentTab"
      :class="['scroll-container', { 'compact-mode': setting && setting.compactMode === 'true' }]"
    >


      

        <v-tabs-window-item
          v-for="(tabName, tabId) in tabs"
          :key="tabId"
          :value="tabId"
          class="scrollList"
        >
        
          <!-- comment request banner -->
          <CommentBanner v-if="tabId == 'MAIN'"> </CommentBanner>

          <v-list-item
            v-for="(option, optionName) in tabItems[tabId]"
            :key="optionName"
            :flat="!option.onClick"
            @click="option.onClick ? option.onClick() : null"
            class="compact-list-item"
            v-show="!option.visibleWhen || option.visibleWhen(setting)"
          >
          <div class="setting-item">
            <div class="left-space" :class="!isDefaultSetting(optionName) ? 'modified' : ''"></div>
            <v-lazy style="flex: 1;">

            <!-- single select (default null) and multiple select option -->
            <v-select
              v-if="!option.optionType || option.optionType == 'multipleSelect'"
              v-model="setting[optionName]"
              :items="wrapTitleValueJson(option.optionList, optionName)"
              :label="option.description"
              :multiple="option.optionType == 'multipleSelect'"
              :chips="option.optionType == 'multipleSelect'"
              :closable-chips="option.optionType == 'multipleSelect'"
              variant="underlined"
              class="compact-input"
              hide-details="auto"
            >
            </v-select>

            <!-- font family select: render each option (and the selected value)
                 in its own typeface so you can preview fonts (#86) -->
            <v-select
              v-else-if="option.optionType == 'fontSelect'"
              v-model="setting[optionName]"
              :items="wrapTitleValueJson(option.optionList, optionName)"
              :label="option.description"
              variant="underlined"
              class="compact-input"
              hide-details="auto"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :style="{ fontFamily: item.raw.value || 'inherit' }"
                ></v-list-item>
              </template>
              <template v-slot:selection="{ item }">
                <span :style="{ fontFamily: item.raw.value || 'inherit' }">{{ item.title }}</span>
              </template>
            </v-select>

            <!-- combo box option -->
            <v-combobox
              v-else-if="option.optionType == 'comboBox'"
              v-model="setting[optionName]"
              :items="wrapTitleValueJson(option.optionList, optionName)"
              :label="option.description"
              item-text="text"
              item-value="val"
              tabName
              chips
              multiple
              closable-chips
              variant="underlined"
              class="compact-input"
              hide-details="auto"
            >
            </v-combobox>

            <!-- color picker option -->
            <v-text-field
              v-else-if="option.optionType == 'colorPicker'"
              v-model="setting[optionName]"
              :label="option.description"
              variant="underlined"
              v-maska:[options]
              class="compact-input"
              hide-details="auto"
            >
              <template v-slot:append>
                <v-menu v-model="option.menu" :close-on-content-click="false">
                  <template v-slot:activator="{ props }">
                    <div
                      :style="swatchStyle(option, optionName)"
                      v-bind="props"
                      class="ma-1"
                    />
                  </template>
                  <v-card>
                    <v-color-picker
                      v-model="setting[optionName]"
                    ></v-color-picker>
                  </v-card>
                </v-menu>
              </template>
            </v-text-field>

            <!-- plain text / url / password input -->
            <v-text-field
              v-else-if="option.optionType == 'textField'"
              v-model="setting[optionName]"
              :label="option.description"
              :type="option.inputType || 'text'"
              :placeholder="option.placeholder || ''"
              :readonly="!!option.readonlyWhen && option.readonlyWhen(setting)"
              variant="underlined"
              class="compact-input"
              hide-details="auto"
            />

            <!-- LLM model selector with fetch button -->
            <div
              v-else-if="option.optionType == 'llmModelSelect'"
              style="display:flex; align-items:center; flex:1; gap:4px;"
            >
              <v-combobox
                v-model="setting[optionName]"
                :label="option.description"
                :items="llmAvailableModels"
                variant="underlined"
                class="compact-input"
                hide-details="auto"
                style="flex:1;"
              />
              <v-btn
                icon
                size="small"
                :loading="llmModelsFetching"
                @click="fetchLlmModels"
                title="Fetch models from endpoint"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>

            <v-list-item-title v-else-if="option.optionType == 'button'" class="button-item" @click="option.onClickFuncName ? this[option.onClickFuncName]() : null">
              <v-icon size="20" :color="option.color" class="mr-3">{{ option.icon }}</v-icon>
              {{ option.description }}
            </v-list-item-title>


            
            </v-lazy>
            <div class="right-space">
              <div v-if="!isDefaultSetting(optionName)">
                <v-icon @click="setting[optionName] = defaultSettings[optionName]" class="reset-icon">mdi-restore</v-icon>
              </div>
            </div>
          </div>

          </v-list-item>

          

        </v-tabs-window-item>

        
      </v-tabs-window>



      
    <v-snackbar
      v-model="llmFetchErrorShown"
      color="error"
      :timeout="4000"
      location="bottom"
    >
      {{ llmFetchError }}
    </v-snackbar>

    <!-- <v-fab
      :color="open ? '' : 'primary'"
      location="bottom end"
      size="large"
      icon
      app
      class="mr-8"
    >
      <v-icon>{{ open ? 'mdi-close' : 'mdi-dots-vertical' }}</v-icon>

      <v-speed-dial
        v-model="open"
        location="top center"
        transition="slide-y-reverse-transition"
        activator="parent"
      >
        <v-btn
          key="card"
          icon
          color="primary"
          @click="$router.push('/deck')"
          title="flashcard"
        >
          <v-icon>mdi-card-multiple</v-icon>
        </v-btn>

        <v-btn
          key="history"
          icon
          color="primary"
          @click="$router.push('/history')"
          title="history"
        >
          <v-icon>mdi-history</v-icon>
        </v-btn>        
      </v-speed-dial>
    </v-fab> -->

    <!-- "What's New" window shown over the settings after an update (#donation).
         Closable; not a separate page. -->
    <v-dialog v-model="showWhatsNew" max-width="600" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h6">🎉 {{ whatsNewTitle }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="showWhatsNew = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text style="max-height: 50vh;">
          <div v-if="whatsNewLoading" class="text-medium-emphasis">Loading…</div>
          <pre
            v-else-if="whatsNewLog"
            style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0;"
            >{{ whatsNewLog }}</pre>
          <div v-else>
            See the full change log on
            <a :href="whatsNewUrl" target="_blank" rel="noopener">GitHub</a>.
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex flex-column pa-4">
          <div class="text-body-2 mb-2 text-center">
            This extension is free & open-source. Please consider supporting it 💚
          </div>
          <v-btn
            color="brown"
            variant="flat"
            prepend-icon="mdi-coffee-to-go"
            href="https://buymeacoffee.com/ttop324"
            target="_blank"
            rel="noopener"
          >
            {{ remainSettingDesc["Support_this_extension"] || "Buy me a coffee" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </popupWindow>
</template>
<script>



import browser from "webextension-polyfill";
import * as i18n from "/src/util/i18n.js";
import { isProxy, toRaw } from "vue";
import _ from "lodash";
import TextUtil from "/src/util/text_util.js";
import SettingUtil from "/src/util/setting_util.js";
import {settingDict, llmProviderEndpoints} from "/src/util/setting_default.js";
import {
  langListOpposite,
} from "/src/util/lang.js";
import localLlm from "/src/translator/localLlm.js";
import { requestTranslate } from "/src/util";

import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

function convertOptionI18n(option) {
  return Object.fromEntries(
      Object.entries(option).map(([key, value]) => [
        i18n.getMessage(key) || key,
        value,
      ])
    );
}

function isSettingEqual(setting1, setting2) {
  if (setting1 === setting2) return true;
  if (typeof setting1 !== typeof setting2) return false;
  if (Array.isArray(setting1)) {
    if (setting1.length !== setting2.length) return false;
    return setting1.every((item, i) => isSettingEqual(item, setting2[i]));
  }
  return false;
}

// load setting with i18 convert
var tabItems = Object.entries(settingDict).reduce((acc, [key, value]) => {
  const tab = value.settingTab.toUpperCase();
  if (tab === "REMAINS") return acc;
  if (!acc[tab]) acc[tab] = {};

  value.description = i18n.getMessage(value.i18nKey);
  value.optionList = convertOptionI18n(value.optionList);
  acc[tab][key] = value;
  return acc;
}, {});

// convert tab name to i18n
var tabs = Object.keys(tabItems).reduce((acc, tab) => {
  if (tab === "REMAINS") return acc;
  acc[tab] = i18n.getMessage(tab);
  return acc;
}, {});

var remainSettingDesc = {
  appName: i18n.getMessage("Mouse_Tooltip_Translator"),
  Voice_for_: i18n.getMessage("Voice_for_"),
  Voice_speed_for_: i18n.getMessage("Voice_speed_for_"),
  Support_this_extension: i18n.getMessage("Support_this_extension"),
};

var langPriorityOptionList = [
  "translateSource",
  "translateTarget",
  "translateTarget2",
  "writingLanguage",
  "translateReverseTarget",
];

var toolbarIcons = {
  coffee: {
    // donation button moved up to the toolbar for visibility (swapped with the
    // deck button, which moved to the About page)
    title: i18n.getMessage("Support_this_extension") || "Support",
    icon: "mdi-coffee-to-go",
    url: "https://buymeacoffee.com/ttop324",
  },
  saved: {
    title: i18n.getMessage("Saved_Words"),
    icon: "mdi-bookmark-multiple",
    path: "/saved",
    newTab: true, // open saved-words board in a full browser tab
  },
  about: {
    title: "about",
    icon: "mdi-menu",
    path: "/about",
  },
};

export default {
  name: "PopupView",
  data() {
    return {
      currentTab: "MAIN",
      tabs,
      tabItems,
      remainSettingDesc,
      options: {
        mask: "!#XXXXXXXX",
        tokens: {
          X: { pattern: /[0-9a-fA-F]/ },
        },
      },
      currentPage: "main",
      toolbarIcons,
      open: false,
      defaultSettings: {},
      llmAvailableModels: [],
      llmModelsFetching: false,
      llmFetchError: "",
      llmFetchErrorShown: false,
      // "What's New" dialog (shown after an update)
      showWhatsNew: false,
      whatsNewLoading: true,
      whatsNewLog: "",
      whatsNewTitle: "Mouse Tooltip Translator updated",
      whatsNewUrl:
        "https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/description.md#change-log",
    };
  },
  async mounted() {
    await this.addTtsVoiceTabOption();
    await this.addFontFamilyOption();
    await this.waitSettingLoad();
    this.defaultSettings = await SettingUtil.getDefaultDataAll();
    // restore the last-viewed options tab (#83)
    var lastTab = this.setting?.["lastSettingTab"];
    if (lastTab && this.tabs[lastTab]) {
      this.currentTab = lastTab;
    }
    // after an update the background opens this popup with ?whatsnew=1 → show the
    // closable change-log + donation dialog over the settings
    if (new URLSearchParams(location.search).get("whatsnew")) {
      this.openWhatsNew();
    }
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    settingWrapper() {
      return Object.assign({}, this.setting);
    },
  },
  watch: {
    // remember the last-viewed options tab so it reopens there next time (#83)
    currentTab(val) {
      if (this.setting && this.setting["lastSettingTab"] !== val) {
        this.setting["lastSettingTab"] = val;
      }
    },
    // once the "What's New" dialog is closed (button or click-outside), drop the
    // ?whatsnew=1 param so a refresh of this tab won't pop it up again
    showWhatsNew(val) {
      if (!val && new URLSearchParams(location.search).get("whatsnew")) {
        var url = new URL(location.href);
        url.searchParams.delete("whatsnew");
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    },
    settingWrapper: {
      deep: true,
      handler(newSetting, oldSetting) {
        // use wrapper to detect new old comparable
        this.checkSettingLangPriority(newSetting, oldSetting);
        this.applyLlmProviderPreset(newSetting, oldSetting);
        // UI language is applied at startup, so reload to re-localize (#76).
        // Small delay lets the setting persist before the reload.
        if (
          oldSetting?.uiLanguage !== undefined &&
          newSetting.uiLanguage !== oldSetting.uiLanguage
        ) {
          setTimeout(() => location.reload(), 400);
        }
      },
    },
  },

  methods: {
    openIcon(iconData) {
      if (iconData.url) {
        window.open(iconData.url); // external link (e.g. donation)
      } else if (iconData.newTab) {
        browser.tabs.create({
          url: browser.runtime.getURL("popup.html#" + iconData.path),
        });
      } else {
        this.$router.push(iconData.path);
      }
    },
    async getCurrentTabUrl() {
      const tabs1 = await browser.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs1[0];
      const urlObj = new URL(currentTab.url);
      return urlObj.hostname;
    },
    async excludeCurrentWebsiteOnclickFunc() {
      const url = await this.getCurrentTabUrl();
      this.appendSettingOnSettingList("websiteExcludeList", url);
      
    },
    async includeWhitelistCurrentWebsiteOnclickFunc() {
      const url = await this.getCurrentTabUrl();
      this.appendSettingOnSettingList("websiteWhiteList", url);
    },
    async appendSettingOnSettingList(settingName, value) {
      if (this.setting[settingName].includes(value)) {
        return;
      }
      this.setting[settingName] = [...this.setting[settingName], value];
    },


    wrapTitleValueJson(inputList, optionName) {
      // convert {key:item}  as {title:key, value:item}
      var textValList = [];
      for (const [key2, val2] of Object.entries(inputList)) {
        textValList.push({
          title: key2,
          value: val2,
        });
      }
      //sort priority option
      textValList = this.sortLangOption(textValList, optionName);
      return textValList;
    },
    sortLangOption(textValList, optionName) {
      if (!langPriorityOptionList.includes(optionName)) {
        return textValList;
      }
      textValList.sort((i1, i2) => {
        var i1Priority = this.setting?.["langPriority"]?.[i1.value] || 0;
        var i2Priority = this.setting?.["langPriority"]?.[i2.value] || 0;
        return i2Priority - i1Priority;
      });
      return textValList;
    },
    checkSettingLangPriority(newSetting, oldSetting) {
      // explicit language-choice settings: the chosen language (value) scores +1
      for (var option of langPriorityOptionList) {
        if (
          newSetting[option] != oldSetting[option] &&
          oldSetting[option] != null
        ) {
          this.bumpLangPriority(newSetting[option]);
        }
      }
      // per-language voice / speed changes also score the language in the KEY,
      // so adjusting a language's TTS bumps it up the lists too
      for (var key of Object.keys(newSetting)) {
        if (
          (key.startsWith("ttsVoice_") || key.startsWith("ttsRate_")) &&
          oldSetting[key] != null &&
          newSetting[key] != oldSetting[key]
        ) {
          this.bumpLangPriority(key.replace(/^ttsVoice_|^ttsRate_/, ""));
        }
      }
    },
    bumpLangPriority(lang) {
      if (!lang || lang === "null") {
        return;
      }
      if (!this.setting["langPriority"]) {
        this.setting["langPriority"] = {};
      }
      this.setting["langPriority"][lang] =
        (this.setting["langPriority"][lang] || 0) + 1;
    },
    // show the change-log + donation dialog, pulling the log from the repo so it
    // stays current without a rebuild
    async openWhatsNew() {
      this.showWhatsNew = true;
      this.whatsNewLoading = true;
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/ttop32/MouseTooltipTranslator/main/doc/description.md"
        );
        var log = this.extractChangeLog(await res.text());
        this.whatsNewLog = await this.translateChangeLog(log);
      } catch (e) {
        this.whatsNewLog = "";
      } finally {
        this.whatsNewLoading = false;
      }
    },
    // auto-translate the (English) change log into the user's "Translate Into" language
    async translateChangeLog(log) {
      var targetLang = this.setting?.["translateTarget"];
      if (!log || !targetLang || targetLang == "en") {
        return log;
      }
      try {
        var res = await requestTranslate(log, "en", targetLang, targetLang);
        return res?.isBroken || !res?.targetText ? log : res.targetText;
      } catch (e) {
        return log;
      }
    },
    extractChangeLog(md) {
      const start = md.indexOf("# Change Log");
      if (start < 0) return "";
      let section = md.slice(start + "# Change Log".length);
      const next = section.search(/\n#\s/);
      if (next >= 0) section = section.slice(0, next);
      // keep only the latest few versions (top-level "- " entries)
      const out = [];
      let versionCount = 0;
      for (const line of section.split("\n")) {
        if (/^- /.test(line)) {
          versionCount += 1;
          if (versionCount > 4) break;
        }
        out.push(line);
      }
      return out.join("\n").trim();
    },
    // fill the Tooltip Font Family dropdown from the browser's installed fonts
    // (chrome.fontSettings); Firefox lacks the API so fall back to common fonts. (#86)
    async addFontFamilyOption() {
      var fonts = {};
      fonts[i18n.getMessage("Default") || "Default"] = "";
      // CSS generic families (always supported by the browser)
      [
        "sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui",
      ].forEach((g) => (fonts[g] = g));
      // common cross-platform fonts as a baseline, grouped by script so non-Latin
      // languages are covered too (mainly for Firefox / when a font isn't in the
      // system list). On Chrome getFontList() below adds every installed font.
      [
        // Latin / general
        "Arial", "Helvetica", "Verdana", "Tahoma", "Trebuchet MS", "Segoe UI",
        "Roboto", "Open Sans", "Lato", "Calibri", "Cambria", "Georgia",
        "Garamond", "Palatino Linotype", "Times New Roman", "Courier New",
        "Consolas", "Lucida Console", "Comic Sans MS", "Impact",
        "Noto Sans", "Noto Serif",
        // Korean
        "Malgun Gothic", "Nanum Gothic", "Noto Sans KR", "Batang", "Gulim", "Dotum",
        // Japanese
        "Yu Gothic", "Meiryo", "MS Gothic", "MS Mincho", "Noto Sans JP", "Hiragino Sans",
        // Chinese (Simplified / Traditional)
        "Microsoft YaHei", "SimSun", "SimHei", "Microsoft JhengHei",
        "Noto Sans SC", "Noto Sans TC", "PingFang SC",
        // Arabic / Persian
        "Vazirmatn", "Cairo", "Amiri", "Noto Naskh Arabic", "Noto Sans Arabic",
        "Geeza Pro", "Arabic Typesetting",
        // Hebrew
        "Noto Sans Hebrew", "David", "Arial Hebrew",
        // Thai
        "Noto Sans Thai", "Leelawadee UI", "Angsana New",
        // Indic — Nirmala UI covers many of these on Windows; Noto per-script for the rest
        "Nirmala UI",
        "Noto Sans Devanagari", "Mangal", // Hindi / Marathi
        "Noto Sans Bengali", "Vrinda", // Bengali
        "Noto Sans Gujarati", "Shruti", // Gujarati
        "Noto Sans Tamil", "Latha", // Tamil
        "Noto Sans Telugu", "Gautami", // Telugu
        "Noto Sans Kannada", "Tunga", // Kannada
        "Noto Sans Malayalam", "Kartika", // Malayalam
        // Amharic (Ethiopic)
        "Noto Sans Ethiopic", "Nyala", "Abyssinica SIL",
        // Greek
        "Noto Sans Greek",
        // Cyrillic
        "PT Sans", "PT Serif",
      ].forEach((n) => (fonts[n] = n));
      // every font the browser/system actually has (Chrome/Edge)
      try {
        var list = await chrome.fontSettings.getFontList();
        for (var f of list) {
          fonts[f.displayName || f.fontId] = f.fontId;
        }
      } catch (e) {
        // Firefox lacks chrome.fontSettings — the baseline above still applies
      }
      if (this.tabItems?.["GRAPHIC"]?.["tooltipFontFamily"]) {
        this.tabItems["GRAPHIC"]["tooltipFontFamily"].optionList = fonts;
      }
    },
    async addTtsVoiceTabOption() {
      var voiceTabOption = {};
      await this.waitSettingLoad(); // need langPriority to sort the list (#334)
      var availableVoiceList = await SettingUtil.getAllVoiceList();
      // per-language read-aloud speed list; "Default" (label) keeps the global
      // rate, stored as the value "default" (#195, #210)
      var rateOptionList = {
        [i18n.getMessage("Default") || "Default"]: "default",
        ...TextUtil.getJsonFromList([
          "0.25", "0.5", "0.75", "1.0",
          "1.25", "1.5", "1.75", "2.0", "2.5", "3.0",
        ]),
      };

      // order the per-language voice rows by langPriority so frequently used
      // languages (your translate source/target) appear at the top (#334)
      var langKeys = Object.keys(langListOpposite)
        .filter((key) => key in availableVoiceList)
        .sort(
          (a, b) =>
            (this.setting?.["langPriority"]?.[b] || 0) -
            (this.setting?.["langPriority"]?.[a] || 0)
        );

      for (var key of langKeys) {
        var voiceOptionList = TextUtil.getJsonFromList(availableVoiceList[key]);
        voiceTabOption["ttsVoice_" + key] = {
          description:
            this.remainSettingDesc["Voice_for_"] + langListOpposite[key],
          optionList: voiceOptionList,
        };
        // speed dropdown for this language, right after its voice dropdown
        voiceTabOption["ttsRate_" + key] = {
          description:
            this.remainSettingDesc["Voice_speed_for_"] + langListOpposite[key],
          optionList: rateOptionList,
        };
        // show "default" instead of a blank dropdown; "default" = follow the main
        // voice speed (tts/index.js treats "default" like the global rate)
        if (this.setting["ttsRate_" + key] == null) {
          this.setting["ttsRate_" + key] = "default";
        }
      }

      //add voice option
      this.tabItems["VOICE"] = Object.assign(
        this.tabItems["VOICE"],
        voiceTabOption
      );
    },
    swatchStyle(value, name) {
      const color = this.setting[name];
      const menu = value.menu;
      return {
        "box-shadow": "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        backgroundColor: color,
        cursor: "pointer",
        height: "30px",
        width: "30px",
        borderRadius: menu ? "50%" : "4px",
        transition: "border-radius 200ms ease-in-out",
      };
    },
    isDefaultSetting(optionName) {
      var def = this.defaultSettings[optionName];
      // per-language speed defaults to "default" (follow main speed), so don't
      // flag it as modified / show a reset icon when it's at "default"
      if (def === undefined && optionName.startsWith("ttsRate_")) {
        def = "default";
      }
      return isSettingEqual(this.setting[optionName], def);
    },
    async fetchLlmModels() {
      const endpoint = this.setting["llmApiEndpoint"];
      if (!endpoint) {
        this.showLlmFetchError("API endpoint is empty");
        return;
      }
      this.llmModelsFetching = true;
      try {
        this.llmAvailableModels = await localLlm.getModels(endpoint, this.setting["llmApiKey"]);
        if (!this.llmAvailableModels.length) {
          this.showLlmFetchError("No models returned by endpoint");
        }
      } catch (e) {
        console.error("Failed to fetch LLM models:", e);
        this.showLlmFetchError(e?.message || String(e));
      } finally {
        this.llmModelsFetching = false;
      }
    },
    showLlmFetchError(msg) {
      this.llmFetchError = `Failed to fetch LLM models: ${msg}`;
      this.llmFetchErrorShown = true;
    },
    applyLlmProviderPreset(newSetting, oldSetting) {
      const provider = newSetting.llmProvider;
      if (!provider || oldSetting.llmProvider == null) return;
      if (provider === oldSetting.llmProvider) return;

      const prevProvider = oldSetting.llmProvider;
      const savedMap = { ...(this.setting.llmProviderSettings || {}) };
      savedMap[prevProvider] = {
        apiEndpoint: oldSetting.llmApiEndpoint || "",
        apiKey: oldSetting.llmApiKey || "",
        model: oldSetting.llmModel || "",
      };
      this.setting.llmProviderSettings = savedMap;

      const restored = savedMap[provider];
      if (restored) {
        this.setting.llmApiEndpoint = restored.apiEndpoint || "";
        this.setting.llmApiKey = restored.apiKey || "";
        this.setting.llmModel = restored.model || "";
      } else {
        const endpoint = llmProviderEndpoints[provider];
        this.setting.llmApiEndpoint = provider === "custom" ? "" : (endpoint || "");
        this.setting.llmApiKey = "";
        this.setting.llmModel = "";
      }
      this.llmAvailableModels = [];
    },
  },
};
</script>
<style scoped>
.scroll-container {
  height: calc(100vh - 112px);
}

.custom-tabs :deep(.v-tab) {
  font-size: 0.75rem;
  min-width: 60px;
  padding: 0 12px;
}

.compact-list-item {
  padding-inline-start: 0 !important;
  padding-inline-end: 0 !important;
  min-height: 18px !important;
  padding-top: 1px !important;
  padding-bottom: 0px !important;
}

.setting-item {
  display: flex;
  margin: 16px 0;

  .left-space {
    margin: 0 8px;
    border: 2px solid yellow;
    opacity: 0;
  }

  .right-space {
    width: 40px;
    margin: 0 10px 0 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .modified {
    opacity: 0.5;
  }

  .reset-icon {
    padding: 16px;
    background-color: #ffffff11;
    border-radius: 50%;
  }

  .reset-icon:hover {
    background-color: #ffffff55;
  }
}

/* action rows (import/export/reset, block/allow site): keep them quiet so they
   blend with the underlined select rows instead of standing out as big colored
   buttons */
.button-item {
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  opacity: 0.85;
}

.button-item:hover {
  opacity: 1;
}

/* compact mode (#220): shrink the big per-row spacing so many more settings fit
   on one screen. The 16px top/bottom margin is the dominant gap between rows. */
.compact-mode .setting-item {
  margin: 3px 0;
}
</style>
