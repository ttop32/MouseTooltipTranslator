<template>
  <popupWindow>
    <v-card tile :rounded="0">
      <v-img
        :src="currentImageUrl"
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
        height="200px"
        class="enableBlur"
        cover
      >
        <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
          <template v-slot:prepend>
            <v-btn dark icon class="mr-4" @click="$router.go(-1)">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </template>
        </v-toolbar>
        <v-spacer></v-spacer>

        <v-card-title
          :dir="getRtlDir(currentCard?.sourceLang)"
          v-text="currentCard?.sourceText || 'No More Card Data'"
          class="text-white text-wrap text-center"
        ></v-card-title>
      </v-img>

      <v-card-actions>
        <ChipOption
          settingName="cardPlayMeta"
          :chipData="cardPlayMetaOptions"
        ></ChipOption>

        <v-spacer></v-spacer>
        <v-divider vertical></v-divider>

        <v-btn
          v-for="playButton of playButtonData"
          :key="playButton.name"
          :icon="playButton.icon"
          :title="'key: ' + playButton.key"
          @click="playButton.func"
        ></v-btn>
      </v-card-actions>
    </v-card>

    <v-progress-linear
      :model-value="progressMain"
      :buffer-value="progressSub"
      stream
      color="orange"
      :height="12"
    ></v-progress-linear>

    <v-card-title
      transition="fade-transition"
      v-text="currentCard?.dict || currentCard?.targetText"
      :dir="getRtlDir(currentCard?.targetLang)"
      :class="{
        textBlur: !isTargetShow,
        'text-wrap': true,
        'text-center': true,
        targetTextField: true,
      }"
    ></v-card-title>

    <v-spacer vertical></v-spacer>

    <v-bottom-sheet>
      <v-divider class="mx-4"></v-divider>
      <div class="subheading text-center">
        <span v-for="(cardLen, key, index) in playProgressList" :key="key">
          <span :class="progressProperties[key].color"
            >{{ cardLen }} {{ progressProperties[key].text }}</span
          >
          <span v-if="index != Object.keys(playProgressList).length - 1">
            /
          </span>
        </span>
      </div>

      <v-row no-gutters>
        <v-col
          v-if="isTargetShow"
          v-for="(buttonData, key, index) in difficultyButtons"
          cols="3"
        >
          <v-btn
            :rounded="0"
            :key="key"
            size="x-large"
            class="text-white"
            variant="flat"
            block
            :title="'key: ' + buttonData.difficulty"
            :color="buttonData.color"
            :value="buttonData.name"
            @click="handleDifficulty(buttonData.difficulty)"
            :height="70"
          >
            <v-row>
              {{ nextInterval[key]?.interval }}
            </v-row>
            <v-row>
              <span> {{ buttonData.name }} </span>
            </v-row>
          </v-btn>
        </v-col>

        <v-btn
          v-else
          :rounded="0"
          size="x-large"
          class="text-white"
          variant="flat"
          block
          title="key: space"
          :color="nextButton.color"
          :value="nextButton.name"
          @click="showTarget"
          :height="70"
        >
          <v-row>SHOW </v-row>
          <v-row> ANSWER </v-row>
        </v-btn>
      </v-row>
    </v-bottom-sheet>
  </popupWindow>
</template>
<script>
import * as util from "/src/util";
import Deck from "/src/flashcard/deck.js";

import _ from "lodash";
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";
import { useAlertStore } from "/src/stores/alert.js";
import delay from "delay";

export default {
  name: "DeckCard",
  data() {
    return {
      difficultyButtons: {
        again: {
          name: "again",
          difficulty: "1",
          icon: "mdi-autorenew",
          color: "red",
        },
        hard: {
          name: "hard",
          difficulty: "2",
          icon: " mdi-help",
          color: "orange",
        },
        good: {
          name: "good",
          difficulty: "3",
          icon: "mdi-exclamation-thick",
          color: "green",
        },
        easy: {
          name: "easy",
          difficulty: "4",
          icon: "mdi-lightbulb-on",
          color: "cyan",
        },
      },
      nextButton: {
        name: "show",
        icon: "mdi-comment-check",
        color: "blue",
        key: "Space",
      },
      playButtonData: [
        {
          name: "play source",
          icon: "mdi-play",
          key: "5",
          func: this.playSource,
        },
        {
          name: "play target",
          icon: "mdi-play-outline",
          key: "6",
          func: this.playTarget,
        },
      ],

      cardPlayMetaOptions: ["source", "target", "image"],
      currentImageUrl: "",
      isTargetShow: null,
      sourceText: "",
      targetText: "",
      deckPath: "/deck",

      currentDeck: [],
      currentCard: null,

      deck: {},

      finishedPopupInfo: {
        title: "Finish",
        description: "Today Flashcards are Completed",
      },
      progressMain: 0,
      progressSub: 0,

      nextInterval: {},
      intervalTimeList: [],
      playProgressList: [],
      progressProperties: {
        newCardLen: {
          text: "New",
          color: "text-green",
        },
        reviewCardLen: {
          text: "Review",
          color: "text-orange",
        },
        learningCardLen: {
          text: "Learning",
          color: "text-blue",
        },
      },
    };
  },

  async mounted() {
    await this.waitSettingLoad();
    document.addEventListener("keydown", this.onKeydown);

    this.deck = new Deck();
    await this.deck.loadDeck();
    this.updateProgress();
    await this.loadNextCard();
    this.preLoadImage();
  },
  async unmounted() {
    document.removeEventListener("keydown", this.onKeydown);
    util.requestStopTTS();
  },

  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad", "saveSetting"]),
    ...mapState(useAlertStore, ["showPopupData"]),
  },
  watch: {
    async isTargetShow(newValue, oldValue) {
      util.requestStopTTS();
      await delay(50);
      this.loadImage(this.currentCard?.sourceText);
      if (!newValue && this.setting["cardPlayMeta"].includes("source")) {
        this.playSource();
      } else if (newValue && this.setting["cardPlayMeta"].includes("target")) {
        this.playTarget();
      }
    },
  },
  methods: {
    updateProgress() {
      this.progressMain = this.deck.getAllProgress();
      this.progressSub = this.deck.getNewProgress();
    },
    handleFinish() {
      this.openFinishPopup();
      this.recordPlayFinish();
    },
    recordPlayFinish() {
      this.setting["deckStatus"].isFin = true;
    },

    handleNoMoreCard() {
      this.openFinishPopup();
    },

    async loadNextCard() {
      if (this.deck.checkTodayPlayFinish()) {
        this.handleNoMoreCard();
        this.currentCard = null;
        return;
      }

      this.currentCard = this.deck.loadNextCard(this?.currentCard?.uuid);
      this.updateProgressCount();
      this.updateIntervalTime();
      this.isTargetShow = false;
    },

    updateProgressCount() {
      this.playProgressList = this.deck.countRemainCard();
    },
    updateIntervalTime() {
      this.nextInterval = this.deck.getAllInterval(this.currentCard);
    },

    handleDifficulty(difficulty) {
      if (
        ![1, 2, 3, 4].includes(Number(difficulty)) ||
        !this.isTargetShow ||
        !this.currentCard
      ) {
        return;
      }
      difficulty = Number(difficulty) - 1;

      this.deck.handleDifficulty(this.currentCard, difficulty);
      this.updateProgress();
      this.loadNextCard();
    },

    onKeydown(e) {
      if (e.code == "Space") {
        this.showTarget();
      }
      this.handlePlayButton(e.key);
      this.handleDifficulty(e.key);
    },
    handlePlayButton(key) {
      for (var buttonData of this.playButtonData) {
        if (key == buttonData.key) {
          buttonData.func();
        }
      }
    },
    openFinishPopup() {
      this.showPopupData(this.finishedPopupInfo);
    },
    gotoDeckPage() {
      this.$router.push(this.deckPath);
    },
    showTarget() {
      if (this.isTargetShow) {
        return;
      }
      this.isTargetShow = true;
    },
    async loadImage(text) {
      if (!text || !this.setting["cardPlayMeta"].includes("image")) {
        this.currentImageUrl = "";
        return;
      }

      var { imageUrl } = await util.requestImage(text);
      this.currentImageUrl = imageUrl;
    },
    playSource() {
      util.requestTTSSingle(
        this.currentCard?.sourceText,
        this.currentCard?.sourceLang
      );
    },
    playTarget() {
      util.requestTTSSingle(
        this.currentCard?.targetText,
        this.currentCard?.targetLang
      );
    },
    getRtlDir(lang) {
      return util.getRtlDir(lang);
    },
    async preLoadImage() {
      for (var card of this.deck.getStagedCards()) {
        await delay(700);
        await util.requestImage(card.sourceText);
      }
    },
  },
};
</script>
<style>
.enableBlur > * {
  backdrop-filter: blur(3px);
}
.textBlur {
  filter: blur(5px);
}
.targetTextField {
  white-space: pre-line !important;
  transition: 0.1s -webkit-filter linear;
}
</style>
