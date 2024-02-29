<template>
  <v-alert
    type="success"
    border="start"
    variant="tonal"
    closable
    close-label="Close Alert"
    :title="title"
  >
    {{ subtitle }}
    <template v-slot:append>
      <v-btn variant="tonal" @click="openUrl(url)">Open</v-btn>
    </template>
  </v-alert>
</template>
<script>
import * as util from "/src/util";
import browser from "webextension-polyfill";

export default {
  name: "CommentBanner",
  props: ["title"],
  data() {
    return {
      title: browser.i18n.getMessage("Review_this"),
      subtitle: browser.i18n.getMessage("Developer_love_criticism"),
      url: util.getReviewUrl(),
    };
  },
  methods: {
    openUrl(newURL) {
      window.open(newURL);
    },
  },
};
</script>
<style></style>
