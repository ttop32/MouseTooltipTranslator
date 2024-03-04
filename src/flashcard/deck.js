import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import * as util from "/src/util";

import { toRaw } from "vue";

// todo
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

// bing dictionary
// record prev page open

// tag
// filter site
// filter word sentence
// only dictionary

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

export default class Deck {
  dayNewCard = 20;
  dayReviewCard = 200;
  cardTypePriority = {
    newCard: 1,
    reviewCard: 1,
    newLearningCard: 2,
    reLearningCard: 2,
  };

  difficultyNameList = ["again", "hard", "good", "easy"];
  easeStarting = 2.5;
  easeMin = 1.3;
  easeModifier = [-0.2, -0.15, 0, 0.15];
  easeMultiplier = [0.8, 1.2, 1.0, 1.3];
  newLearningSteps = [1, 10];
  reLearningSteps = [10];
  graduateIntervalList = [1, 4];
  minInterval = 1;
  learningCategory = {
    newCard: "newLearningCard",
    newLearningCard: "newLearningCard",
    reLearningCard: "reLearningCard",
  };

  constructor() {}

  async loadDeck() {
    this.setting = await util.loadSetting();
    await this.initCardLen();
    await this.unloadPrevLoadCard();
    await this.loadNewCard();
    await this.updateDeckCount();
    this.save();
  }

  async unloadPrevLoadCard() {
    var deck = this.getStagedCards();
    deck
      .filter((card) => card.type == "newCard")
      .slice(this.dayNewCard, deck.length)
      .map((c) => (c.isStaged = false));
    deck
      .filter((card) => card.type == "reviewCard")
      .slice(this.dayReviewCard, deck.length)
      .map((c) => (c.isStaged = false));
  }

  async loadNewCard() {
    var { newCardLen, reviewCardLen } = this.countRemainCard();
    // calculate len
    var newCardLenRemain = Math.max(
      this.dayNewCard - newCardLen - this.setting["cardLen"]["newFin"],
      0
    );
    var reviewCardLenRemain = Math.max(
      this.dayReviewCard - reviewCardLen - this.setting["cardLen"]["reviewFin"],
      0
    );
    // daynew -actual-newFin

    //load new card and  review card
    var unStagedCards = this.getUnStagedCards();

    unStagedCards
      .filter((card) => card?.type == null || card?.type == "newCard")
      .slice(0, newCardLenRemain)
      .map((card) => this.initCard(card));

    unStagedCards
      .filter((card) => card?.type == "reviewCard")
      .slice(0, reviewCardLenRemain)
      .map((card) => (card.isStaged = true));
  }

  async updateDeckCount() {
    var { newCardLen, reviewCardLen, learningCardLen } = this.countRemainCard();

    if (this.checkIsNewLoad()) {
      this.setting["deckStatus"] = this.loadDeckMeta();
      this.setting["cardLen"]["newStart"] = newCardLen;
      this.setting["cardLen"]["reviewStart"] = reviewCardLen;
      this.setting["cardLen"]["learningStart"] = learningCardLen;
    } else {
      this.setting["cardLen"]["newStart"] =
        newCardLen + this.setting["cardLen"]["newFin"];

      this.setting["cardLen"]["reviewStart"] =
        reviewCardLen + this.setting["cardLen"]["reviewFin"];

      var expectedLearningCardNum =
        this.setting["cardLen"]["learningStart"] +
        this.setting["cardLen"]["newFin"] +
        this.setting["cardLen"]["reviewFin"] -
        this.setting["cardLen"]["allFin"];

      this.setting["cardLen"]["learningStart"] -=
        expectedLearningCardNum - learningCardLen;
    }
  }
  initCardLen() {
    if (this.checkIsNewLoad()) {
      this.setting["cardLen"] = {
        newStart: 0,
        reviewStart: 0,
        learningStart: 0,
        newFin: 0,
        reviewFin: 0,
        allFin: 0,
      };
    }
  }

  getStagedCards() {
    return this.getDueDatedTagCards().filter((card) => card.isStaged);
  }
  getUnStagedCards() {
    return this.getDueDatedTagCards().filter((card) => !card.isStaged);
  }
  countStagedCardType(type) {
    return this.getStagedCards().filter((card) => card.type.includes(type))
      .length;
  }
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
  }
  getAllCard() {
    return this.setting["historyList"];
  }

  loadDeckMeta() {
    return {
      date: util.getDateNowNoTime(),
      tags: _.cloneDeep(this.setting["cardTagSelected"]),
      isFin: false,
    };
  }
  initCard(card) {
    card.scheduledDate = util.getDateNowNoTime();
    card.type = "newCard";
    card.isStaged = true;
    card.step = 0;
    card.interval = this.newLearningSteps[card.step];
    card.uuid = uuidv4();
    return card;
  }

  handleDifficulty(card, difficulty) {
    var cardPrevType = card.type;
    var nextInterval = this.getNextInterval(card, difficulty);
    this.updateCard(card.uuid, nextInterval);
    this.updateFinCount(nextInterval.isStaged, cardPrevType);
    this.save();
  }

  updateCard(uuid, cardData) {
    this.setting["historyList"]
      .filter((card) => uuid == card.uuid)
      .map((card) => {
        for (var key in cardData) {
          card[key] = cardData[key];
        }
      });
  }

  updateFinCount(isStaged, cardPrevType) {
    if (isStaged == false) {
      this.setting["cardLen"]["allFin"] += 1;
    }
    if (cardPrevType == "newCard") {
      this.setting["cardLen"]["newFin"] += 1;
    } else if (cardPrevType == "reviewCard") {
      this.setting["cardLen"]["reviewFin"] += 1;
    }
  }
  loadNextCard(prevUuid) {
    // shuffle
    // and sort
    var card = this.getStagedCards().sort((c1, c2) => {
      var isPrevCard = c1.uuid == prevUuid ? 1 : c2.uuid == prevUuid ? -1 : 0;

      var scheduleDateDiff = util.getDateOrder(
        c1.scheduledDate,
        c2.scheduledDate
      );
      var cardTypeDiff =
        this.cardTypePriority[c1.type] - this.cardTypePriority[c2.type];
      var cardIntervalDiff = c1.interval - c2.interval;
      var isLearningCard =
        c1.type.includes("Learning") || c2.type.includes("Learning");
      var cardStepDiff = c1.step - c2.step;

      // skip prev card
      // schduledate asc
      // new card and review card first
      if (isPrevCard != 0) {
        return isPrevCard;
      } else if (scheduleDateDiff != 0) {
        return scheduleDateDiff;
      } else if (cardTypeDiff != 0) {
        return cardTypeDiff;
      } else if (isLearningCard) {
        return cardIntervalDiff;
      }

      return cardStepDiff;
    })[0];

    return card;
  }

  getNextInterval(card, difficulty) {
    var difficultyName = this.difficultyNameList[difficulty];
    var nextIntervalList = this.getAllInterval(card);
    var nextInterval = nextIntervalList[difficultyName];
    nextInterval.scheduledDate = nextInterval.isStaged
      ? util.getDateNowNoTime()
      : util.getNextDay(Math.round(nextInterval.interval));

    return nextInterval;
  }
  getAllInterval(card) {
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
  }
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
  }
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
  }

  getAllProgress() {
    if (!this.setting) {
      return 0;
    }
    var total =
      this.setting["cardLen"]["newStart"] +
      this.setting["cardLen"]["reviewStart"] +
      this.setting["cardLen"]["learningStart"];

    return (this.setting["cardLen"]["allFin"] / total) * 100;
  }
  getNewProgress() {
    if (!this.setting) {
      return 0;
    }

    var subTotal =
      this.setting["cardLen"]["newStart"] +
      this.setting["cardLen"]["reviewStart"];
    var subFinNum =
      this.setting["cardLen"]["newFin"] + this.setting["cardLen"]["reviewFin"];
    return (subFinNum / subTotal) * 100;
  }

  getAllFilterTag() {
    var allCard = this.getAllCard();
    var actions = allCard.map((c) => c.actionType);
    var sourceLangs = allCard.map((c) => c.sourceLang);
    return _.uniq(_.concat(actions, sourceLangs));
  }
  resetFlashcard() {
    this.setting["cardTagSelected"] = [];
    this.setting["deckStatus"] = {};
    this.setting["historyList"].forEach((card) => {
      card.scheduledDate = util.getDate();
      card.type = "newCard";
      card.isStaged = false;
      card.step = 0;
    });
    this.save();
  }

  checkNoMoreCardToPlay() {
    if (
      this.setting["cardLen"]["newStart"] == 0 &&
      this.setting["cardLen"]["reviewStart"] == 0 &&
      this.setting["cardLen"]["learningStart"] == 0
    ) {
      return true;
    }
    return false;
  }

  checkPlayProgress() {
    this.setting["cardLen"]["newStart"];
    this.setting["cardLen"]["reviewStart"];
    this.setting["cardLen"]["learningStart"];

    return this.setting["cardLen"];
  }

  checkIsNewLoad() {
    return !_.isEqual(
      _.pick(this.loadDeckMeta(), ["date", "tags"]),
      _.pick(this.setting["deckStatus"], ["date", "tags"])
    );
  }

  checkTodayPlayFinish() {
    if (
      this.setting["deckStatus"]["isFin"] ||
      (this.getAllProgress() == 100 && this.setting["cardLen"]["allFin"] > 0)
    ) {
      this.setting["deckStatus"]["isFin"] = true;
      this.save();
      return true;
    }

    return false;
  }

  countRemainCard() {
    var newCardLen = this.countStagedCardType("newCard");
    var reviewCardLen = this.countStagedCardType("reviewCard");
    var learningCardLen = this.countStagedCardType("LearningCard");

    return { newCardLen, reviewCardLen, learningCardLen };
  }

  save() {
    toRaw(this.setting).save();
  }
  getCheckNextInterval() {}

  shuffleList(list) {
    return list
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
}
