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

    <v-tabs-window v-model="currentTab" class="scroll-container">


      

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
};

var langPriorityOptionList = [
  "translateSource",
  "translateTarget",
  "writingLanguage",
  "translateReverseTarget",
];

var toolbarIcons = {
  card: {
    title: "card",
    icon: "mdi-card-multiple",
    path: "/deck",
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
    };
  },
  async mounted() {
    await this.addTtsVoiceTabOption();
    await this.waitSettingLoad();
    this.defaultSettings = await SettingUtil.getDefaultDataAll();
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    settingWrapper() {
      return Object.assign({}, this.setting);
    },
  },
  watch: {
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
      if (iconData.newTab) {
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
      for (var option of langPriorityOptionList) {
        if (
          newSetting[option] != oldSetting[option] &&
          oldSetting[option] != null
        ) {
          var lang = newSetting[option];
          var langPriority = this.setting?.["langPriority"]?.[lang] || 0;
          this.setting["langPriority"][lang] = langPriority + 1;
        }
      }
    },
    async addTtsVoiceTabOption() {
      var voiceTabOption = {};
      var availableVoiceList = await SettingUtil.getAllVoiceList();

      for (var key in langListOpposite) {
        if (!(key in availableVoiceList)) {
          continue;
        }
        var voiceOptionList = TextUtil.getJsonFromList(availableVoiceList[key]);
        voiceTabOption["ttsVoice_" + key] = {
          description:
            this.remainSettingDesc["Voice_for_"] + langListOpposite[key],
          optionList: voiceOptionList,
        };
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
      return isSettingEqual(this.setting[optionName], this.defaultSettings[optionName]);
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
</style>
