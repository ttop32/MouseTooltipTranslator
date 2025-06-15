<template>
  <v-alert
    v-if="isNewVisit"
    type="success"
    border="start"
    variant="tonal"
    closable
    close-label="Close Alert"
    :title="title"
    style="min-height: 90px;"
  >
    {{ subtitle }}
    <template v-slot:append>
      <v-btn
        variant="tonal"
        style="position: absolute; bottom: 10px; right: 10px;"
        @click="handleClick(url)"
      >
        Open
      </v-btn>
    </template>
  </v-alert>
</template>
<script>

import browser from "webextension-polyfill";
import { useSettingStore } from "/src/stores/setting.js";
import { mapState } from "pinia";

export default {
  name: "CommentBanner",
  emits: ["click"],
  // props: ["title"],
  data() {
    return {
      title: browser.i18n.getMessage("Support_this_extension"),
      subtitle: browser.i18n.getMessage("Feed_a_coffee_to_the_extension_devs"),
      url: "https://buymeacoffee.com/ttop324",
    };
  },
  async mounted() {
    await this.waitSettingLoad();
    this.increasePopupCount();
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "waitSettingLoad"]),
    isNewVisit() {
      var count = Number(this.setting?.["coffeeCount"]);
      return 3 < count && count < 15;
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
      var count = Number(this.setting["coffeeCount"]);
      if (count < 17) {
        this.setting["coffeeCount"] = count + inc;
      }
    },
    finishPopupCount() {
      this.increasePopupCount(100);
    },
  },
};
</script>
<style></style>
