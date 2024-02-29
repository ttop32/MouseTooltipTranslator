<template>
  <v-app id="appWindow">
    <slot />

    <alertPopup></alertPopup>
  </v-app>
</template>
<script>
import { useSettingStore } from "/src/stores/setting.js";
import { mapState } from "pinia";

export default {
  name: "PopupWindow",

  async created() {
    await this.loadSetting();
  },
  async mounted() {
    // this.settingStore = useSettingStore();
    // await     this.settingStore.loadSetting();
    // this.settingStore.$subscribe((mutation, state) => {
    //   console.log("poup9999999999999999999999999999999999999999999999999999");
    //   this.settingStore.saveSetting();
    // });
  },
  computed: {
    ...mapState(useSettingStore, ["setting", "loadSetting", "saveSetting"]),
  },
  watch: {
    setting: {
      deep: true,
      handler() {
        this.saveSetting();
      },
    },
  },
};
</script>
<style>
/* for pop up from popup button */
@media only screen and (max-width: 400px) {
  body {
    width: 392px;
    height: 600px;
    margin: 0;
  }
}
/* for new tab pop up */
@media only screen and (min-width: 400px) {
  body {
    min-width: 380px;
    min-height: 600px;
    margin: 0;
    background-color: rgba(255, 240, 240, 0.1);
  }

  #appWindow {
    margin: auto;
    max-width: 800px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  }
}

.scroll-container {
  height: calc(100vh - 112px);
  flex-direction: column;
  overflow-y: auto;
  padding-top: 0 !important;
}
.v-input .v-label {
  font-size: 16px !important;
}
</style>
