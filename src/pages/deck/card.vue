<template>
  <popupWindow>
    <v-card tile>
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
          v-text="currentCard?.sourceText || 'No Card Data'"
          class="text-white text-wrap text-center"
        ></v-card-title>
      </v-img>

      <v-card-actions>
        <ChipOption
          settingName="cardListen"
          :chipData="cardListenOptions"
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

    <v-bottom-navigation bg-color="blue">
      <v-btn
        v-if="isTargetShow"
        v-for="(buttonData, index) of difficultyButtons"
        :key="buttonData.name"
        :title="'key: ' + buttonData.difficulty"
        :color="buttonData.color"
        :value="buttonData.name"
        @click="handleDifficulty(buttonData.difficulty)"
      >
        <v-icon>{{ buttonData.icon }}</v-icon>
        <span> {{ buttonData.name }} </span>
      </v-btn>

      <v-btn
        v-else
        @click="showTarget"
        title="key: space"
        :value="nextButton.name"
      >
        <v-icon>{{ nextButton.icon }}</v-icon>
        <span> {{ nextButton.name }} </span>
      </v-btn>
    </v-bottom-navigation>
  </popupWindow>
</template>
<script>
import * as util from "/src/util";
import _ from "lodash";
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";
import { useAlertStore } from "/src/stores/alert.js";

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
        color: "cyan",
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

      cardListenOptions: ["source", "target"],
      currentImageUrl: "",
      isTargetShow: null,
      sourceText: "",
      targetText: "",
      deckPath: "/deck",

      newCard: [],
      learningNew: [],
      learningReview: [],
      reviewCard: [],
      card: {
        reviewScheduled: 2,
        interval: 2,
        ease: 2.5,
        step: 0,
        failedNum: 0,
      },
      currentDeck: [],
      currentCard: null,
      cardIndex: 0,

      dayNewCard: 20,
      dayReviewCard: 200,

      easeStarting: 2.5,
      easeMin: 1.3,
      easeModifier: [-0.2, -0.15, 0, 0.15],
      easeMultiplier: [0.8, 1.2, 1.0, 1.3],

      newLearningSteps: [1, 10],
      reLearningSteps: [10],
      graduateIntervalList: [1, 4],
      minInterval: 1,

      cardType: {
        newCard: {
          priority: 1,
        },
        newLearningCard: {
          priority: 2,
        },
        reLearningCard: {
          priority: 2,
        },
        reviewCard: {
          priority: 1,
        },
      },
      finishedPopupInfo: {
        title: "Complete today flashcard",
        description: "Try next day again.",
      },
      learningCategory: {
        newCard: "newLearningCard",
        newLearningCard: "newLearningCard",
        reLearningCard: "reLearningCard",
      },

      progressMain: 0,
      progressSub: 0,
    };
  },

  async mounted() {
    await this.waitSettingLoad();
    await this.loadDeck();
    await this.loadNextCard();
    document.addEventListener("keydown", this.onKeydown);
  },
  async unmounted() {
    document.removeEventListener("keydown", this.onKeydown);
    util.requestStopTTS();
  },

  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    ...mapState(useAlertStore, ["showPopupData"]),
    progressMain() {
      var total =
        this.setting["cardNewStartLen"] +
        this.setting["cardReviewStartLen"] +
        this.setting["cardLearningStartLen"];

      return (this.setting["cardAllFinLen"] / total) * 100;
    },
    progressSub() {
      var subTotal =
        this.setting["cardNewStartLen"] + this.setting["cardReviewStartLen"];
      var subFinNum =
        this.setting["cardNewFinLen"] + this.setting["cardReviewFinLen"];

      return (subFinNum / subTotal) * 100;
    },
    newCardNum() {
      return this.currentDeck.filter((card) => card.type == "newCard").length;
    },
    reviewCardNum() {
      return this.currentDeck.filter((card) => card.type == "reviewCard")
        .length;
    },

    difficultyNameList() {
      return _.keys(this.difficultyButtons);
    },
  },
  watch: {
    async isTargetShow(newValue, oldValue) {
      this.loadImage(newValue?.sourceText);
      util.requestStopTTS();
      if (!newValue && this.setting["cardListen"].includes("source")) {
        this.playSource();
      } else if (newValue && this.setting["cardListen"].includes("target")) {
        this.playTarget();
      }
    },
  },
  methods: {
    checkChanged() {
      return !_.isEqual(this.loadDeckMeta(), this.setting["deckStatus"]);
    },

    loadDeckMeta() {
      return {
        date: util.getDateNowNoTime(),
        tags: _.cloneDeep(this.setting["cardTagSelected"]),
        isFin: false,
      };
    },
    handleFinish() {
      this.openFinishPopup();
      this.recordPlayFinish();
    },
    recordPlayFinish() {
      this.setting["deckStatus"].isFin = true;
    },
    getDueDatedTagCards() {
      var tags = this.setting["cardTagSelected"];
      return this.setting["historyList"]
        .filter(
          (c) => tags?.includes(c.actionType) && tags?.includes(c.sourceLang)
        )
        .filter((c) => util.isDueDate(c.scheduledDate))
        .sort((card1, card2) =>
          util.getDateOrder(card1.scheduledDate, card2.scheduledDate)
        );
    },
    getStagedCards() {
      return this.getDueDatedTagCards().filter((card) => card.isStaged);
    },
    countCardType(type) {
      return this.getStagedCards().filter((card) => card.type.includes(type))
        .length;
    },

    async loadDeck() {
      if (this.checkChanged()) {
        this.setting["cardNewStartLen"] = 0;
        this.setting["cardReviewStartLen"] = 0;
      }

      var filteredDeck = this.getDueDatedTagCards();

      //unload overloaded card
      this.currentDeck = filteredDeck.filter((card) => card.isStaged);
      this.currentDeck
        .filter((card) => card.type == "newCard")
        .slice(this.dayNewCard, this.currentDeck.length)
        .map((c) => (c.isStaged = false));
      this.currentDeck
        .filter((card) => card.type == "reviewCard")
        .slice(this.dayReviewCard, this.currentDeck.length)
        .map((c) => (c.isStaged = false));

      // calculate len
      var newCardLen = this.countCardType("newCard");
      var reviewCardLen = this.countCardType("reviewCard");
      var requiredNewCardLen =
        this.dayNewCard - this.setting["cardNewStartLen"];
      var requiredReviewCardLen =
        this.dayReviewCard - this.setting["cardReviewStartLen"];
      var newCardLenRemain = Math.max(0, newCardLen - requiredNewCardLen);
      var reviewCardLenRemain = Math.max(
        0,
        reviewCardLen - requiredReviewCardLen
      );

      //load new card and  review card
      var addedNewCardNum = filteredDeck
        .filter((card) => !card.isStaged)
        .filter((card) => card.type == "newCard" || card?.type == null)
        .slice(newCardLenRemain)
        .map((card) => this.initCard(card)).length;
      var addedReviewNum = filteredDeck
        .filter((card) => !card.isStaged)
        .filter((card) => card.type == "reviewCard")
        .slice(reviewCardLenRemain)
        .map((card) => (card.isStaged = true)).length;

      if (this.checkChanged()) {
        console.log("change==============================================");
        this.setting["deckStatus"] = this.loadDeckMeta();
        this.setting["cardNewStartLen"] = this.countCardType("newCard");
        this.setting["cardReviewStartLen"] = this.countCardType("reviewCard");
        this.setting["cardLearningStartLen"] =
          this.countCardType("LearningCard");
        this.setting["cardNewFinLen"] = 0;
        this.setting["cardReviewFinLen"] = 0;
        this.setting["cardAllFinLen"] = 0;
      } else {
        console.log("nochange==============================================");

        this.setting["cardNewStartLen"] += addedNewCardNum;
        this.setting["cardReviewStartLen"] += addedReviewNum;
        console.log(
          this.setting["cardNewStartLen"],
          this.setting["cardReviewStartLen"]
        );
      }

      this.setting["deck"] = this.getStagedCards();
      return this.getStagedCards();
    },

    initCard(card) {
      card.scheduledDate = util.getDateNowNoTime();
      card.type = "newCard";
      card.isStaged = true;
      card.step = 0;
    },

    async loadNextCard() {
      this.currentCard = this.setting["deck"].sort((c1, c2) => {
        var isPrevCard = _.isEqual(c1, this.currentCard);
        var dateSort = util.getDateOrder(c1.scheduledDate, c2.scheduledDate);
        var cardTypeSort =
          this.cardType[c1.type].priority - this.cardType[c2.type].priority;
        var cardStepSort = c1.step - c2.step;

        if (isPrevCard != 0) {
          console.log("---------------------");
          console.log(this.currentCard);
          return isPrevCard;
        } else if (dateSort != 0) {
          return dateSort;
        } else if (cardTypeSort != 0) {
          return cardTypeSort;
        }
        return cardStepSort;
      })[0];

      this.isTargetShow = false;
    },
    handleDifficulty(difficulty) {
      if (![1, 2, 3, 4].includes(Number(difficulty)) || !this.isTargetShow) {
        return;
      }
      difficulty = Number(difficulty) - 1;
      this.setCardDifficulty(difficulty);
      this.loadNextCard();
    },

    setCardDifficulty(difficulty) {
      var difficultyName = this.difficultyNameList[difficulty];
      var nextIntervalList = this.getInterval(this.currentCard);
      var nextInterval = nextIntervalList[difficultyName];
      var cardTypePrev = this.currentCard.type;

      Object.keys(nextInterval).forEach((key) => {
        this.currentCard[key] = nextInterval[key];
      });

      this.currentCard.scheduledDate = this.currentCard.isStaged
        ? util.getDateNowNoTime()
        : util.getNextDay(this.currentCard.interval);

      // Object.keys(nextInterval).forEach((key) => {
      //   card[key] = nextInterval[key];
      // });

      // var filteredDeck = this.setting["historyList"];

      // if (this.currentCard.isStaged == false) {
      //   this.setting["cardAllFinLen"] += 1;
      // }
      // if (cardTypePrev == "newCard") {
      //   this.setting["cardNewFinLen"] += 1;
      // } else if (cardTypePrev == "reviewCard") {
      //   this.setting["cardReviewFinLen"] += 1;
      // }
    },
    getInterval(card) {
      if (card.type == "reviewCard") {
        return this.getLongInterval(card.ease, card.interval);
      } else if (["newCard", "newLearningCard"].includes(card.type)) {
        return this.getShortInterval(
          card,
          this.newLearningSteps,
          this.graduateIntervalList,
          this.easeStarting
        );
      } else if (card.type == "reLearningCard") {
        var { good, easy } = this.getLongInterval(card.ease, card.prevInterval);
        return this.getShortInterval(
          card,
          this.reLearningSteps,
          [good, easy],
          card.ease
        );
      }
    },
    getLongInterval(ease, interval) {
      return {
        again: {
          interval: this.reLearningSteps[0],
          ease: Math.max(ease + this.easeModifier[0], this.easeMin),
          isStaged: true,
          type: "reLearningCard",
          prevInterval: Math.max(
            this.minInterval,
            interval * this.easeMultiplier[0]
          ),
          step: 0,
        },
        hard: {
          interval: interval * this.easeMultiplier[1],
          ease: Math.max(ease + this.easeModifier[1], this.easeMin),
          isStaged: false,
          type: "reviewCard",
        },
        good: {
          interval: interval * ease * this.easeMultiplier[2],
          ease: Math.max(ease + this.easeModifier[2], this.easeMin),
          isStaged: false,
          type: "reviewCard",
        },
        easy: {
          interval: interval * ease * this.easeMultiplier[3],
          ease: Math.max(ease + this.easeModifier[3], this.easeMin),
          isStaged: false,
          type: "reviewCard",
        },
      };
    },
    getShortInterval(card, steps, gradDays, ease) {
      var prevStepLevel = Math.max(0, card.step - 1);

      var base = {
        again: {
          interval: steps[prevStepLevel],
          step: prevStepLevel,
          isStaged: true,
          type: this.learningCategory[card.type],
        },
        hard: {
          interval: steps[card.step],
          step: card.step,
          isStaged: true,
          type: this.learningCategory[card.type],
        },
        good: {
          interval: steps[card.step + 1],
          step: card.step + 1,
          isStaged: true,
          type: this.learningCategory[card.type],
        },
        easy: {
          interval: gradDays[1],
          step: 0,
          isStaged: false,
          type: "reviewCard",
          ease,
        },
      };
      if (1 < steps.length && card.step == 0) {
        base.hard.interval = (steps[0] * steps[1]) / 2;
      }
      if (steps.length - 1 == card.step) {
        base.hard.interval = steps[card.step] * 1.5;
        base.good = {
          interval: gradDays[0],
          step: 0,
          isStaged: false,
          type: "reviewCard",
          ease,
        };
      }
      return base;
    },
    getNextEase(card, difficulty) {
      return Math.max(card.ease + this.easeModifier[difficulty], this.easeMin);
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
      if (!text) {
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
  },
};
</script>
<style>
.enableBlur > * {
  backdrop-filter: blur(2px);
}
.textBlur {
  filter: blur(5px);
}
.targetTextField {
  white-space: pre-line !important;
  transition: 0.1s -webkit-filter linear;
}
</style>
