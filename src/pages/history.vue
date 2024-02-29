<template>
  <popupWindow>
    <!-- top nav bar -->
    <BackHeader title="History">
      <v-btn
        v-for="buttonData in toolbarButtons"
        :key="buttonData.name"
        :title="buttonData.title"
        icon
        @click="buttonData.func"
      >
        <v-icon>{{ buttonData.icon }}</v-icon>
      </v-btn>
    </BackHeader>

    <!-- history record setting -->
    <v-card-text>
      <span class="subheading">Record Text When</span>
      <ChipOption
        settingName="historyRecordActions"
        :chipData="historyRecordActionChipList"
      ></ChipOption>
    </v-card-text>
    <v-divider class="mx-4"></v-divider>

    <!-- history list  -->
    <v-virtual-scroll :items="setting['historyList']">
      <template v-slot:append>
        <v-btn
          color="grey-lighten-1"
          icon="mdi-close-circle"
          variant="text"
          @click="removeHistory(index)"
        ></v-btn>
      </template>

      <template v-slot:default="{ item, index }">
        <v-list-item
          :title="item.sourceText"
          :subtitle="item?.targetText?.substring(0, 25)"
          height="60"
        >
          <template v-slot:append>
            <v-btn
              color="grey-lighten-1"
              icon="mdi-close-circle"
              variant="text"
              @click="removeHistory(index)"
            ></v-btn>
          </template>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </popupWindow>
</template>
<script>
import _ from "lodash";
import * as util from "/src/util";
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";

export default {
  name: "HistoryView",
  data() {
    return {
      historyRecordActionChipList: ["select", "mouseover"],
      toolbarButtons: {
        remove: {
          name: "Remove history",
          title: "Remove history",
          icon: "mdi-trash-can",
          func: this.removeAllHistory,
        },
        download: {
          name: "Download history",
          title: "Download history",
          icon: "mdi-download",
          func: this.downloadCSV,
        },
      },
    };
  },
  computed: {
    ...mapState(useSettingStore, ["setting"]),
  },
  methods: {
    removeAllHistory() {
      this.setting["historyList"] = [];
    },
    removeHistory(index) {
      this.setting["historyList"] = [
        ...this.setting["historyList"].slice(0, index),
        ...this.setting["historyList"].slice(index + 1),
      ];
    },
    getHeaderKey() {
      // var keySet = this.setting["historyList"]
      //   .map((h) => _.keys(h))
      //   .reduce((acc, cur, idx) => new Set([...acc, ...cur]), new Set());
      // var keyList = [...keySet];
      return [
        "date",
        "sourceLang",
        "targetLang",
        "sourceText",
        "targetText",
        "dict",
        "actionType",
        "translator",
      ];
    },
    getCsvContent() {
      var headerKey = this.getHeaderKey();
      var csvContent = this.setting["historyList"].map((history) => {
        var line = "";
        headerKey.forEach(
          (key) =>
            (line +=
              util.trimAllSpace(history[key]).replace(/[,#'"]/g, " ") + ",")
        );
        return line;
      });
      csvContent = [headerKey.join(",")].concat(csvContent).join("\n");
      return csvContent;
    },
    downloadCSV() {
      var csvContent = this.getCsvContent();
      var url = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(csvContent);
      var link = document.createElement("a");
      link.href = url;
      link.download = "Mouse_Tooltip_Translator_History.csv";
      link.click();
    },
  },
};
</script>
<style scoped>
.v-virtual-scroll {
  height: calc(100vh - 164px);
}
</style>
