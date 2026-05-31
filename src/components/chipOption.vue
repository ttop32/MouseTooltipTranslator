<template>
  <v-chip-group
    multiple
    filter
    active-class="primary--text"
    v-model="setting[settingName]"
  >
    <v-chip
      v-for="chip in chipData"
      :value="getChipValue(chip)"
      :key="getChipValue(chip)"
      filter
      @click="handleClick"
    >
      {{ getChipLabel(chip) }}
    </v-chip>
  </v-chip-group>
</template>
<script>
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

export default {
  name: "ChipOption",
  props: ["settingName", "chipData"],
  emits: ["click"],
  computed: {
    ...mapState(useSettingStore, ["setting"]),
  },
  methods: {
    // chipData items may be plain strings or { title, value } objects
    getChipValue(chip) {
      return typeof chip === "object" && chip !== null ? chip.value : chip;
    },
    getChipLabel(chip) {
      return typeof chip === "object" && chip !== null ? chip.title : chip;
    },
    handleClick() {
      this.$emit("click");
    },
  },
};
</script>
<style></style>
