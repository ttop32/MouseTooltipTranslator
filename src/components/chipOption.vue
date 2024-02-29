<template>
  <v-chip-group
    multiple
    filter
    active-class="primary--text"
    v-model="setting[settingName]"
  >
    <v-chip
      v-for="chipName in chipData"
      :value="chipName"
      :key="chipName"
      filter
    >
      {{ chipName }}
    </v-chip>
  </v-chip-group>
</template>
<script>
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

export default {
  name: "ChipOption",
  props: ["settingName", "chipData"],
  computed: {
    ...mapState(useSettingStore, ["setting"]),
  },
};
</script>
<style></style>
