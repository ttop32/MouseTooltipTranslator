<template>
  <v-app id="appWindow">
    <slot />
  </v-app>
</template>
<script>
export default {
  name: "PopupWindow",
};
</script>
<style>
.v-input .v-label {
  font-size: 16px !important;
}
</style>
