<template>
  <popupWindow>
    <BackHeader title="Flashcard">
      <v-btn icon @click="resetFlashcard" title="reset progress">
        <v-icon>mdi-recycle-variant</v-icon>
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
          >Play Flashcard</v-btn
        >
      </v-col>

      <div class="subheading text-center">
        <span class="text-green">3</span> / <span class="text-orange">3</span> /
        <span class="text-blue">3</span>
      </div>

      <v-divider class="mx-4"></v-divider>

      <v-card-text>
        <span class="subheading">{{ tagOptionTitle }}</span>
        <ChipOption
          settingName="cardTagSelected"
          :chipData="filterTagOptions"
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
import { langListOpposite } from "/src/util/lang.js";
import * as util from "/src/util";

// popup
// finished popup
// no data popup

// reset progress

//progress
//staged new card
//learning card
//review card
//all possible undo card
//review card total

// back
// start again

// other
// bing dictionary
// record prev page open

// tag
// filter site
// filter word sentence
// only dictionary

// show tag
// get 20 and review

// table view
// add tag all
// remove tag all
// table tag
// source text target text edit
// import  csv export

// day add Math.round

//  reset time 4 am

// load
// filter
// check deleted from history

// additional factor, not study for a while
//hard  (prevInterval + afterday /4) * 1.2
//good (prevInterval + afterday /2) * ease
//easy  (prevInterval + afterday ) * ease

// todo this.reLearnMinInterval

export default {
  name: "FlashCardMenu",
  data() {
    return {
      filterTagOptions: [],
      cardPlayPath: "/deck/card",
      tagOptionTitle: "Select tag to play (Create card using history)",
      popupAlertData: {
        noHistoryData: {
          title: "No History Data",
          description:
            "Flashcard makes card based on history data. Try to turn on history record.",
        },
        noTagSelected: {
          title: "No Tag Selected",
          description: "Check Tags to Play.",
        },
        noActionTagSelected: {
          title: "No Action Tag Selected",
          description: "Check Tags to Play.",
        },
        noLangTagSelected: {
          title: "No Language Tag Selected",
          description: "Check Tags to Play.",
        },
        todayDayPlayDone: {
          title: "Today play is completed",
          description: "Try on next day",
        },
        noMoreCardToLearn: {
          title: "No more card to learn",
          description: "Add more history data to play with",
        },
      },
    };
  },
  async mounted() {
    await this.waitSettingLoad();
    this.filterTagOptions = this.getAllFilterTag(this.setting["historyList"]);
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
      if (this.checkNoHistory()) {
        this.showPopupData(this.popupAlertData.noHistoryData);
      } else if (this.checkNoTag()) {
        this.showPopupData(this.popupAlertData.noTagSelected);
      } else if (this.checkNoActionTag()) {
        this.showPopupData(this.popupAlertData.noActionTagSelected);
      } else if (this.checkNoLangTag()) {
        this.showPopupData(this.popupAlertData.noLangTagSelected);
      } else if (this.checkTodayFlashcardFinish()) {
        this.showPopup(this.popupAlertData.todayDayPlayDone);
      } else if (this.checkNoMoreCard()) {
        this.showPopup(this.popupAlertData.noMoreCardToLearn);
      } else {
        return true;
      }
      return false;
    },
    checkNoHistory() {
      return this.setting["historyList"].length == 0;
    },
    checkNoTag() {
      return this.setting["cardTagSelected"].length == 0;
    },
    checkNoActionTag() {
      return !["mouseover", "select", "shortcutkey"].some((i) =>
        this.setting["cardTagSelected"].includes(i)
      );
    },
    checkNoLangTag() {
      return !this.setting["cardTagSelected"].some((i) => langListOpposite[i]);
    },
    checkTodayFlashcardFinish() {
      return _.isEqual(this.setting["deckMeta"], {
        date: util.getDateNow(),
        tags: this.setting["cardTagSelected"],
        isFin: true,
      });
    },
    checkNoMoreCard() {
      // no new card
      //no learning progress
      //no due review
      return false;
    },
    checkPlayProgress() {},

    getAllFilterTag(deck) {
      var actions = deck.map((c) => c.actionType);
      var sourceLangs = deck.map((c) => c.sourceLang);
      return _.uniq(_.concat(actions, sourceLangs));
    },
    resetFlashcard() {
      this.setting["cardTagSelected"] = [];
      this.setting["historyList"].forEach((card) => {
        card.scheduledDate = util.getDate();
        card.type = "newCard";
        card.isStaged = false;
        card.step = 0;
      });
    },
  },
};
</script>
<style scoped>
.scroll-container {
  height: calc(100vh - 64px);
}
</style>
