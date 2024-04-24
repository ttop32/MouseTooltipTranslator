<template>
  <div class="scroller" :style="getFontStyle()">
    <div class="scroller-content" id="scrollerContent">
      <div
        v-for="translatedData in translatedDataList"
        :key="translatedData.sourceText"
        class="my-3"
      >
        <div>
          <div :dir="translatedData.mainDir">
            {{ translatedData.mainText }}
          </div>
          <div :dir="translatedData.subDir">
            {{ translatedData.subText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as util from "/src/util";

import _ from "lodash";
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

export default {
  name: "SpeechView",
  data() {
    return {
      fontSize: 14,
      fontColor: "#ffffffff",
      PanelBackgroundColor: "#000000b8",
      translatedDataList: [],

      mainTextDir: "ltr",
      subTextDir: "ltr",
    };
  },
  async mounted() {
    await this.loadSetting();

    util.initSpeechRecognition(this.handleSpeechText, this.handleFinish);
    util.setSpeechRecognitionLang(this.setting["speechRecognitionLanguage"]);
    util.startSpeechRecognition();
  },

  computed: {
    ...mapState(useSettingStore, ["setting", "loadSetting"]),
  },

  methods: {
    async handleSpeechText(text, isFinal) {
      if (isFinal) {
        var { targetText, sourceLang, targetLang } = await this.translate(text);

        var mainDir = util.getRtlDir(sourceLang);
        var subDir = util.getRtlDir(targetLang);

        this.makeTextFinal(text, targetText, mainDir, subDir);
      } else {
        this.addNewTextOnLast(text);
      }
    },
    handleFinish() {
      console.log("fin");
    },
    addNewTextOnLast(text) {
      if (
        this.translatedDataList.length == 0 ||
        this.translatedDataList[this.translatedDataList.length - 1].isFinal
      ) {
        this.translatedDataList.push({});
      }
      var dir = util.getRtlDir(this.setting["speechRecognitionLanguage"]);

      this.translatedDataList[this.translatedDataList.length - 1] = {
        mainText: text,
        subText: "...",
        mainDir: dir,
        subDir: dir,
      };
    },
    makeTextFinal(mainText, subText, mainDir, subDir) {
      this.translatedDataList[this.translatedDataList.length - 1] = {
        mainText,
        subText,
        mainDir,
        subDir,
        isFinal: true,
      };
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

    async translate(text) {
      return await util.requestTranslate(
        text,
        this.setting["translateSource"],
        this.setting["translateTarget"],
        this.setting["translateReverseTarget"]
      );
    },
  },
};
</script>
<style>
html,
body {
  overflow: hidden;
}

.scroller {
  overflow: auto;
  height: 100vh;
  display: flex;
  flex-direction: column-reverse;
  overflow-anchor: auto !important; /*  See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor */
}

.scroller .scroller-content .item {
  height: 20px;
  transform: translateZ(
    0
  ); /* fixes a bug in Safari iOS where the scroller doesn't update */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
}
</style>
