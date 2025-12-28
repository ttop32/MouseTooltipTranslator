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
        @click="$router.push(iconData.path)"
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
          >
            <v-lazy>

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

            
            <v-list-item-title v-else-if="option.optionType == 'button'" class="ma-2" @click="option.onClickFuncName ? this[option.onClickFuncName]() : null">
              <v-avatar :color="option.color" class="mr-2">
              <v-icon size="25" color="white">{{ option.icon }}</v-icon>
              </v-avatar>
              {{ option.description }}
            </v-list-item-title>


            
          </v-lazy>

          </v-list-item>

          

        </v-tabs-window-item>

        
      </v-tabs-window>



      
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
import { isProxy, toRaw } from "vue";
import _ from "lodash";
import TextUtil from "/src/util/text_util.js";
import SettingUtil from "/src/util/setting_util.js";
import {settingDict} from "/src/util/setting_default.js";
import {
  langListOpposite,
} from "/src/util/lang.js";

import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

function convertOptionI18n(option) {
  return Object.fromEntries(
      Object.entries(option).map(([key, value]) => [
        browser.i18n.getMessage(key) || key,
        value,
      ])
    );
}


// load setting with i18 convert
var tabItems = Object.entries(settingDict).reduce((acc, [key, value]) => {
  const tab = value.settingTab.toUpperCase();
  if (tab === "REMAINS") return acc;
  if (!acc[tab]) acc[tab] = {};

  value.description = browser.i18n.getMessage(value.i18nKey);
  value.optionList = convertOptionI18n(value.optionList);
  acc[tab][key] = value;
  return acc;
}, {});

// convert tab name to i18n
var tabs = Object.keys(tabItems).reduce((acc, tab) => {
  if (tab === "REMAINS") return acc;
  acc[tab] = browser.i18n.getMessage(tab);
  return acc;
}, {});

var remainSettingDesc = {
  appName: browser.i18n.getMessage("Mouse_Tooltip_Translator"),
  Voice_for_: browser.i18n.getMessage("Voice_for_"),
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
  history: {
    title: "history",
    icon: "mdi-history",
    path: "/history",
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
    };
  },
  async mounted() {
    await this.addTtsVoiceTabOption();
    await this.waitSettingLoad();
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
      },
    },
  },

  methods: {
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
  min-height: 18px !important;
  padding-top: 1px !important;
  padding-bottom: 0px !important;
}

</style>
