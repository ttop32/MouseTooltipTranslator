<template>
  <v-alert
    v-if="isBannerVisible"
    :type="alertType"
    border="start"
    variant="tonal"
    closable
    close-label="Close Alert"
    :title="alertTitle"
    style="min-height: 90px;"
  >
    {{ alertSubtitle }}
    <template v-slot:append>
      <v-btn
        variant="tonal"
        style="position: absolute; bottom: 10px; right: 10px;"
        @click="handleClick(alertUrl)"
      >
        {{ buttonText }}
      </v-btn>
    </template>
  </v-alert>
</template>

<script>
import browser from "webextension-polyfill";
import { useSettingStore } from "/src/stores/setting.js";
import { mapState } from "pinia";
import {getReviewUrl} from "/src/util/review_util.js";


export default {
  name: "CommentBanner",
  emits: ["click"],
  data() {
    return {
      messages: {
        title: browser.i18n.getMessage("Support_this_extension"),
        subtitle: browser.i18n.getMessage("Feed_a_coffee_to_the_extension_devs"),
        url: "https://buymeacoffee.com/ttop324",
        reviewTitle: browser.i18n.getMessage("Review_this"),
        reviewSubtitle: browser.i18n.getMessage("Developer_love_criticism"),
        reviewUrl: getReviewUrl(),
      },
      isBannerVisible: false,
      alertType: "",
      alertTitle: "",
      alertSubtitle: "",
      alertUrl: "",
      buttonText: "",
    };
  },
  async mounted() {
    await this.waitSettingLoad();
    this.updateCoffeeCount();
    this.updateBannerProperties();
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    coffeeCount() {
      return Number(this.setting?.["coffeeCount"]);
    },
  },
  methods: {
    handleClick(url) {
      window.open(url);
      this.updateCoffeeCount(10);
      this.updateBannerProperties();
      this.$emit("click");
    },
    updateCoffeeCount(increment = 1) {
      const count = Number(this.setting["coffeeCount"]);
      this.setting["coffeeCount"] = Math.min(count + increment, 11);
    },
    updateBannerProperties() {
      this.isBannerVisible = this.coffeeCount < 10;
      this.alertType = "success";
      this.alertTitle = this.messages.title;
      this.alertSubtitle = this.messages.subtitle;
      this.alertUrl = this.messages.url;
      this.buttonText = "Open";
    },
  },
};
</script>
<style></style>
