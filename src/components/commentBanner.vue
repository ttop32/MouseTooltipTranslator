<template>
  <v-alert
    v-if="isNewVisit"
    type="success"
    border="start"
    variant="tonal"
    closable
    close-label="Close Alert"
    :title="title"
  >
    {{ subtitle }}
    <template v-slot:append>
      <v-btn variant="tonal" @click="handleClick(url)">Open</v-btn>
    </template>
  </v-alert>
</template>
<script>
import * as util from "/src/util";
import browser from "webextension-polyfill";
import { useSettingStore } from "/src/stores/setting.js";
import { mapState } from "pinia";

export default {
  name: "CommentBanner",
  emits: ["click"],
  // props: ["title"],
  data() {
    return {
      title: browser.i18n.getMessage("Review_this"),
      subtitle: browser.i18n.getMessage("Developer_love_criticism"),
      url: util.getReviewUrl(),
    };
  },
  async mounted() {
    await this.waitSettingLoad();
    this.increasePopupCount();
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    isNewVisit() {
      var count = Number(this.setting?.["popupCount"]);
      return 1 < count && count < 7;
    },
  },
  methods: {
    openUrl(newURL) {
      window.open(newURL);
    },
    handleClick(newURL) {
      this.openUrl(newURL);
      this.finishPopupCount();
      this.$emit("click");
    },
    increasePopupCount(inc = 1) {
      var count = Number(this.setting["popupCount"]);
      if (count < 10) {
        this.setting["popupCount"] = count + inc;
      }
    },
    finishPopupCount() {
      this.increasePopupCount(100);
    },
  },
};
</script>
<style></style>
