<template>
  <popupWindow>
    <BackHeader :title="toolbarTitle">
      <v-btn
        v-for="buttonData in toolbarButtons"
        :key="buttonData.name"
        :title="buttonData.title"
        icon
        @click="buttonData.func"
      >
        <v-icon>{{ buttonData.icon }}</v-icon>
      </v-btn>
    </BackHeader>
    <div class="scroll-container">
      <v-col cols="auto">
        <v-btn
          size="x-large"
          class="text-white mb-4"
          color="orange"
          variant="flat"
          block
          @click="playGame"
          >{{ playButtonTitle }}</v-btn
        >
      </v-col>

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

      <v-divider class="mx-4"></v-divider>

      <v-card-text>
        <span class="subheading">{{ tagOptionTitle }}</span>
        <ChipOption
          settingName="cardTagSelected"
          :chipData="filterTagOptions"
          @click="handleTagChanged"
        ></ChipOption>
      </v-card-text>
    </div>
  </popupWindow>
</template>
<script>
import _ from "lodash";
import { mapState } from "pinia";
import { useAlertStore } from "/src/stores/alert.js";
import { useSettingStore } from "/src/stores/setting.js";
import * as util from "/src/util";
import Deck from "../../flashcard/deck";

export default {
  name: "FlashCardMenu",
  data() {
    return {
      toolbarTitle: "Flashcard",
      playButtonTitle: "Play Flashcard",
      toolbarButtons: {
        resetProgress: {
          name: "reset progress",
          title: "reset progress",
          icon: "mdi-recycle-variant",
          func: this.resetFlashcard,
        },
      },

      cardLenList: [],

      filterTagOptions: [],
      cardPlayPath: "/deck/card",
      tagOptionTitle: "Select group to play (saved words)",
      popupAlertData: {
        noHistoryData: {
          title: "No History Data",
          description:
            "Flashcard makes card based on saved words. Try saving some words first.",
          checkFunc: this.checkNoHistory,
        },
        noTagSelected: {
          title: "No Group Selected",
          description: "Check groups to play.",
          checkFunc: this.checkNoTag,
        },
        todayDayPlayDone: {
          title: "Today play is completed",
          description: "Try on next day",
          checkFunc: this.checkTodayFlashcardFinish,
        },
        noMoreCardToLearn: {
          title: "No more card to learn today",
          description: "Add more history data to play with",
          checkFunc: this.checkNoMoreCard,
        },
      },

      playProgressList: {},
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

      progressKey: ["New", "Review", "Learning", "Fin"],
    };
  },
  async mounted() {
    await this.waitSettingLoad();
    this.deck = new Deck();
    await this.deck.loadDeck();
    this.filterTagOptions = this.deck.getAllFilterTag();
    this.updateProgress();
  },

  computed: {
    ...mapState(useAlertStore, ["showPopupData"]),
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
  },
  methods: {
    playGame() {
      if (this.checkPlayable()) {
        this.$router.push(this.cardPlayPath);
      }
    },
    checkPlayable() {
      for (var key in this.popupAlertData) {
        if (this.popupAlertData[key].checkFunc()) {
          this.showPopupData(this.popupAlertData[key]);
          return false;
        }
      }

      return true;
    },
    checkNoHistory() {
      return this.setting["historyList"].length == 0;
    },
    checkNoTag() {
      return this.setting["cardTagSelected"].length == 0;
    },
    checkTodayFlashcardFinish() {
      return this.deck.checkTodayPlayFinish();
    },
    checkNoMoreCard() {
      return this.deck.checkNoMoreCardToPlay();
    },
    updateProgress() {
      this.playProgressList = this.deck.countRemainCard();
    },
    async resetFlashcard() {
      this.deck.resetFlashcard();
      this.$router.go(0);
    },
    async handleTagChanged() {
      await this.deck.loadDeck();
      this.updateProgress();
    },
  },
};
</script>
<style scoped>
.scroll-container {
  height: calc(100vh - 64px);
}
</style>
