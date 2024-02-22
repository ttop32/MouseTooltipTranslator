<template>
  <router-view v-slot="{ Component, route }">
    <v-fade-transition hide-on-leave>
      <component :is="Component" :key="route.path" />
    </v-fade-transition>
  </router-view>
</template>
<script>
import { RouterLink, RouterView } from "vue-router";

import * as util from "/src/util";

export default {
  name: "App",
  // components: { AboutPage },
  async mounted() {
    this.applyRtl(util.getDefaultLang());
  },
  methods: {
    applyRtl(locale) {
      if (util.isRtl(locale) == "rtl") {
        this.$vuetify.locale.current = locale;
      }
    },
  },
};
</script>
<style></style>
