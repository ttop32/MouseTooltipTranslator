<template>
  <div class="scroller" :style="speechAllTextStyle">
    <div class="scroller-content" id="scrollerContent">
      <div
        v-for="translatedData in speechTextList"
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
      speechTextList: [],
      setting: {},

      isSourceTextShow: true,
      isTargetTextShow: true,
      speechAllTextStyle: "",
      speechBlockStyle: "",
      speechSourceTextStyle: "",
      speechTargetTextStyle: "",

      translateTimeDelay: 1400,
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
    handleFinish() {
      // restart if fin
      util.startSpeechRecognition();
    },
    async handleSpeechText(text, isFinal) {
      var timestamp = Date.now();
      var currentIndex = this.addNewTextBox();
      this.setSourceText(text, currentIndex, isFinal);
      this.updateSubText(text, currentIndex, timestamp, isFinal);
    },
    async updateSubText(text, index, timestamp, isFinal) {
      var currentSpeechItem = this.speechTextList[index];
      var currentTimePassed = Date.now() - currentSpeechItem["timestamp"];
      if (this.translateTimeDelay >= currentTimePassed && !isFinal) {
        return;
      }

      var { targetText } = await this.translate(text);

      if (timestamp < currentSpeechItem["timestamp"]) {
        return;
      }

      this.speechTextList[index]["timestamp"] = timestamp;
      this.speechTextList[index]["subText"] = targetText;
    },

    addNewTextBox() {
      var mainDir = util.getRtlDir(this.setting["speechRecognitionLanguage"]);
      var subDir = util.getRtlDir(this.setting["translateTarget"]);
      if (
        this.speechTextList.length == 0 ||
        this.speechTextList[this.speechTextList.length - 1].isFinal
      ) {
        this.speechTextList.push({
          mainText: "",
          subText: "...",
          mainDir,
          subDir,
          isFinal: false,
          timestamp: 0,
        });
      }
      return this.speechTextList.length - 1;
    },
    setSourceText(text, index, isFinal = false) {
      this.speechTextList[index]["mainText"] = text;
      this.speechTextList[index]["isFinal"] = isFinal;
    },

    async translate(text) {
      var targetLang =
        this.setting["voicePanelTranslateLanguage"] == "default"
          ? this.setting["translateTarget"]
          : this.setting["voicePanelTranslateLanguage"];

      return await util.requestTranslate(
        text,
        this.setting["translateSource"],
        targetLang
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
