<template>
  <v-card v-if="isShowed" class="popupContainer">
    <v-toolbar color="blue" dark>
      <v-card-title class="text-subtitle-1 grey lighten-2">
        {{ title }}
      </v-card-title>
    </v-toolbar>

    <v-card-text>
      {{ description }}
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue" text @click="hidePopup()"> close </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { useAlertStore } from "/src/stores/alert.js";
import { mapState } from "pinia";

export default {
  name: "AlertPopup",
  // props: ["modelValue", "description"],
  // emits: ["update:modelValue"],

  computed: {
    ...mapState(useAlertStore, [
      "title",
      "description",
      "isShowed",
      "hidePopup",
    ]),

    // modelValue: {
    //   get() {
    //     return this.modelValue;
    //   },
    //   set(value) {
    //     this.$emit("update:modelValue", value);
    //   },
    // },
  },
};
</script>
<style>
.popupContainer {
  position: absolute;
  margin: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 300px;
}
</style>
