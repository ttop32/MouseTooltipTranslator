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
import browser from "webextension-polyfill";
import * as i18n from "/src/util/i18n.js";
import { useAlertStore } from "/src/stores/alert.js";
import { useSettingStore } from "/src/stores/setting.js";
import * as util from "/src/util";
import Deck from "../../flashcard/deck";

const t = (key) => i18n.getMessage(key) || key;

export default {
  name: "FlashCardMenu",
  data() {
    return {
      toolbarTitle: t("Flashcard"),
      playButtonTitle: t("Play_Flashcard"),
      toolbarButtons: {
        resetProgress: {
          name: t("Reset_progress"),
          title: t("Reset_progress"),
          icon: "mdi-recycle-variant",
          func: this.resetFlashcard,
        },
      },

      cardLenList: [],

      filterTagOptions: [],
      cardPlayPath: "/deck/card",
      tagOptionTitle: t("Select_group_to_play"),
      popupAlertData: {
        noHistoryData: {
          title: t("No_History_Data"),
          description: t("Flashcard_makes_cards_from_your_saved_words"),
          checkFunc: this.checkNoHistory,
        },
        noTagSelected: {
          title: t("No_Group_Selected"),
          description: t("Check_groups_to_play"),
          checkFunc: this.checkNoTag,
        },
        todayDayPlayDone: {
          title: t("Today_play_is_completed"),
          description: t("Try_on_next_day"),
          checkFunc: this.checkTodayFlashcardFinish,
        },
        noMoreCardToLearn: {
          title: t("No_more_card_to_learn_today"),
          description: t("Add_more_history_data_to_play_with"),
          checkFunc: this.checkNoMoreCard,
        },
      },

      playProgressList: {},
      progressProperties: {
        newCardLen: {
          text: t("New"),
          color: "text-green",
        },
        reviewCardLen: {
          text: t("Review"),
          color: "text-orange",
        },
        learningCardLen: {
          text: t("Learning"),
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
