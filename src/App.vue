<template>
  <router-view v-slot="{ Component, route }">
    <v-fade-transition hide-on-leave>
      <component :is="Component" :key="route.path" />
    </v-fade-transition>
  </router-view>
</template>
<script>
import { RouterLink, RouterView } from "vue-router";

export default {
  name: "App",
  // components: { AboutPage },
  async mounted() {},
  methods: {},
};
</script>
<style></style>
