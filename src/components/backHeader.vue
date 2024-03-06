<template>
  <v-toolbar color="blue" dark dense>
    <v-btn icon @click="$router.go(-1)">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    <v-spacer></v-spacer>

    <slot />
  </v-toolbar>
</template>
<script>
export default {
  name: "BackHeader",
  props: ["title"],
};
</script>
<style>
.scroll-container {
  height: calc(100vh - 64px);
}
</style>
