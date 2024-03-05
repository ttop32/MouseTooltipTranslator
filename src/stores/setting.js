import { defineStore, acceptHMRUpdate } from "pinia";
import { isProxy, toRaw, ref, watch, reactive } from "vue";

// import { useUserStore } from "./user";
import * as util from "/src/util";

export const useSettingStore = defineStore("setting", {
  state: () => {
    return {
      setting: {},
      isLoaded: false,
    };
  },
  actions: {
    async loadSetting() {
      this.setting = await util.loadSetting();
      this.isLoaded = true;
    },
    saveSetting() {
      toRaw(this.setting).save();
    },
    async waitSettingLoad() {
      await util.waitUntilForever(() => this.isLoaded);
    },
  },
});

// export const useSettingStore = defineStore("setting", async () => {
//   // state
//   var setting = reactive(await util.loadSetting());
//   var isLoaded = ref(false);

//   // action
//   var loadSetting = async () => {
//     // setting = await util.loadSetting();
//     isLoaded = true;
//   };

//   var saveSetting = () => {
//     console.log("saveSetting2222222222222222222222");
//     console.log(setting);
//     toRaw(setting).save();
//     console.log("saveSetting");
//   };
//   var waitSettingLoad = async () => {
//     await util.waitUntilForever(() => isLoaded);
//   };

//   // watch
//   // watch(cartIsEmpty, () => {
//   //   if (cartIsEmpty.value === true) {
//   //     fetchItems();
//   //   }
//   // });

//   return { setting, isLoaded, loadSetting, saveSetting, waitSettingLoad };
// });
