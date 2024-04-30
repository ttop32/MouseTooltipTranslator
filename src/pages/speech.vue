<template>
  <div class="scroller" :style="speechAllTextStyle">
    <div class="scroller-content" id="scrollerContent">
      <div
        v-for="translatedData in translatedDataList"
        :key="translatedData.sourceText"
        :style="speechBlockStyle"
      >
        <div
          v-if="isSourceTextShow"
          :dir="translatedData.mainDir"
          :style="speechSourceTextStyle"
        >
          {{ translatedData.mainText }}
        </div>
        <div
          v-if="isTargetTextShow"
          :dir="translatedData.subDir"
          :style="speechTargetTextStyle"
        >
          {{ translatedData.subText }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as util from "/src/util";

import _ from "lodash";

export default {
  name: "SpeechView",
  data() {
    return {
      translatedDataList: [],
      setting: {},

      isSourceTextShow: true,
      isTargetTextShow: true,
      speechAllTextStyle: "",
      speechBlockStyle: "",
      speechSourceTextStyle: "",
      speechTargetTextStyle: "",
    };
  },
  async mounted() {
    this.setting = await util.loadSetting(() => {
      this.initSpeechConfig();
      util.stopSpeechRecognition();
    });
    this.checkMicrophone();
    this.loadSpeechEngine();
    this.initSpeechConfig();
    util.startSpeechRecognition();
  },

  methods: {
    loadSpeechEngine() {
      util.initSpeechRecognition(this.handleSpeechText, this.handleFinish);
    },

    initSpeechConfig() {
      this.initSpeechLang();
      this.initSpeechViewStyle();
    },

    initSpeechViewStyle() {
      this.initIsSourceTextShow();
      this.initIsTargetTextShow();
      this.initSpeechAllTextStyle();
      this.initSpeechBlockStyle();
      this.initSpeechSourceTextStyle();
      this.initSpeechTargetTextStyle();
    },

    initIsSourceTextShow() {
      this.isSourceTextShow =
        this.setting["voicePanelTextTarget"].includes("source");
    },
    initIsTargetTextShow() {
      this.isTargetTextShow =
        this.setting["voicePanelTextTarget"].includes("target");
    },
    initSpeechAllTextStyle() {
      this.speechAllTextStyle = `
        text-align: ${this.setting["voicePanelTextAlign"]};
        background-color: ${this.setting["voicePanelBackgroundColor"]};
      `;
    },
    initSpeechBlockStyle() {
      this.speechBlockStyle = `
        padding: ${this.setting["voicePanelPadding"]}px 0 0 0;
      `;
    },
    initSpeechSourceTextStyle() {
      this.speechSourceTextStyle = `
        font-size: ${this.setting["voicePanelSourceFontSize"]}px;
        color: ${this.setting["voicePanelSourceFontColor"]};
        text-shadow: 0 0 2px ${this.setting["voicePanelSourceBorderColor"]};
      `;
    },
    initSpeechTargetTextStyle() {
      this.speechTargetTextStyle = `
        font-size: ${this.setting["voicePanelTargetFontSize"]}px;
        color: ${this.setting["voicePanelTargetFontColor"]};
        text-shadow: 0 0 2px ${this.setting["voicePanelTargetBorderColor"]};
      `;
    },

    async checkMicrophone() {
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log(stream);
      } catch (error) {
        this.handleMicrophoneError(error);
      }
    },
    handleMicrophoneError(error) {
      var errorText = error.toString();
      if (errorText.includes("Permission denied")) {
        this.warnNoPermission();
      } else if (errorText.includes("Requested device not found")) {
        this.warnNoDevice();
      }
      console.log(error);
    },
    warnNoPermission() {
      alert(`Mouse tooltip translator requires permission for microphone.
This page will be redirected to the permission page after confirm.`);
      util.openAudioPermissionPage();
    },
    warnNoDevice() {
      alert(`There is no microphone.
Check any microphone is correctly connected`);
    },

    initSpeechLang() {
      util.setSpeechRecognitionLang(this.setting["speechRecognitionLanguage"]);
    },
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
      util.startSpeechRecognition();
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
}

.scroller {
  overflow: auto;
  height: 100vh;
  display: flex;
  flex-direction: column-reverse;
  overflow-anchor: auto !important; /*  See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor */
}

.scroller .scroller-content {
  transform: translateZ(
    0
  ); /* fixes a bug in Safari iOS where the scroller doesn't update */
}
</style>
