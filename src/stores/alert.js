import { defineStore, acceptHMRUpdate } from "pinia";

export const useAlertStore = defineStore("alert", {
  state: () => {
    return {
      setting: "title",
      description: "description",
      isShowed: false,
    };
  },

  actions: {
    showPopup(title, description) {
      this.title = title;
      this.description = description;
      this.isShowed = true;
    },
    showPopupData(data) {
      this.showPopup(data.title, data.description);
    },
    hidePopup() {
      this.title = "";
      this.description = "";
      this.isShowed = false;
    },
  },
});
