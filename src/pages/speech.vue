<template>
  <popupWindow>
    <div class="mobile-popup-overlay">
      hello world
      <div class="scroller">
        <div class="scroller-content" id="scrollerContent">
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
          <div class="item">Item 3</div>
          <div class="item">Item 4</div>
          <div class="item">Item 5</div>
          <div class="item">Item 6</div>
          <div class="item">Item 7</div>
          <div class="item">Item 8</div>
          <div class="item">Item 9</div>
          <div class="item">Item 10</div>
        </div>
      </div>
    </div>

    <div
      v-for="translatedData in translatedDataList"
      :key="translatedData.sourceText"
      :style="getFontStyle()"
    >
      {{ translatedData.sourceText }}
      {{ translatedData.targetText }}
    </div>
  </popupWindow>
</template>
<script>
import * as util from "/src/util";

import _ from "lodash";
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";
import { permissions } from "webextension-polyfill";

export default {
  name: "SpeechView",
  data() {
    return {
      fontSize: 14,
      fontColor: "#ffffffff",
      PanelBackgroundColor: "#000000b8",
      translatedDataList: [{ sourceText: "nan", targetText: "veb" }],
    };
  },
  async mounted() {
    await this.waitSettingLoad();
  },

  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
  },

  methods: {
    openUrl(url) {
      window.open(url);
    },
    startRecognition() {
      // start all day
      // do not stop
      // audio permissions
    },
    getFontStyle() {
      var fontSize = this.setting["tooltipFontSize"];
      var fontColor = this.setting["tooltipFontColor"];
      var backgroundColor = this.setting["tooltipBackgroundColor"];
      return `
        font-size: ${fontSize}px;
        color: ${fontColor};
        background-color: ${backgroundColor};
      `;
    },

    async handleTranslate() {
      this.translate();
    },
    async translate(text) {
      var { targetText, sourceLang, targetLang } = await util.requestTranslate(
        text,
        setting["translateSource"],
        setting["translateTarget"],
        setting["translateReverseTarget"]
      );
      return { targetText, sourceLang, targetLang };
    },
  },
};
</script>
<style>
.mobile-popup-overlay {
  top: 0;
  left: 0;
  position: fixed;
  background-color: red;
  opacity: 0.9;
  height: 100vh;
  width: 100vw;
  overflow: visible;
  z-index: 100;
}

#appWindow {
  margin: auto;
  height: 100vh;
  width: 100vw;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
}

.scroller {
  overflow: auto;
  height: 100px;
  display: flex;
  flex-direction: column-reverse;
  overflow-anchor: auto !important; /*  See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor */
}

.scroller .scroller-content .item {
  height: 20px;
  transform: translateZ(
    0
  ); /* fixes a bug in Safari iOS where the scroller doesn't update */
}
</style>
