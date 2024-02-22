<template>
  <popupWindow>
    <v-toolbar color="blue" dark dense>
      <v-btn icon @click="$router.push('/')">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title>History</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="removeAllHistory">
        <v-icon>mdi-trash-can</v-icon>
      </v-btn>
      <v-btn icon @click="downloadCSV">
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list class="scrollList">
      <v-card-text>
        <span class="subheading">Record Text When</span>
        <v-chip-group
          multiple
          active-class="primary--text"
          v-model="setting['historyRecordActions']"
        >
          <v-chip
            v-for="action in historyRecordActionChipList"
            :value="action.name"
            filter
            :key="action.name"
          >
            {{ action.name }}
          </v-chip>
        </v-chip-group>
      </v-card-text>
      <v-divider class="mx-4"></v-divider>

      <v-list-item
        v-for="(history, index) in setting['historyList']"
        :key="history.date"
        :title="history.sourceText"
        :subtitle="history.targetText"
      >
        <template v-slot:append>
          <v-icon
            color="grey lighten-1"
            @click.prevent="removeHistory(index)"
            @mousedown.stop
            @touchstart.native.stop
            >mdi-close</v-icon
          >
        </template>
      </v-list-item>
    </v-list>
  </popupWindow>
</template>
<script>
import { isProxy, toRaw } from "vue";
import { debounce, throttle } from "lodash";

import * as util from "/src/util";

export default {
  name: "HistoryView",
  // components: { AboutPage },
  data() {
    return {
      setting: {},
      historyRecordActionChipList: [
        {
          name: "select",
          icon: "mdi-cursor-text",
        },
        {
          name: "mouseover",
          icon: "mdi-cursor-default-click",
        },
      ],
    };
  },

  async mounted() {
    this.saveSetting = debounce(this.saveSetting, 200);
    this.setting = await util.loadSetting();
  },
  watch: {
    setting: {
      deep: true,
      handler() {
        this.saveSetting();
      },
    },
  },
  methods: {
    saveSetting() {
      toRaw(this.setting).save();
    },
    removeAllHistory() {
      this.setting["historyList"] = [];
    },
    removeHistory(index) {
      this.setting["historyList"] = [
        ...this.setting["historyList"].slice(0, index),
        ...this.setting["historyList"].slice(index + 1),
      ];
    },
    downloadCSV() {
      var headerKey = Object.keys(this.setting["historyList"]?.[0]).map(
        (key) => `${key}`
      );

      var csvContent = this.setting["historyList"].map((history) => {
        var line = "";
        for (var key of headerKey) {
          line +=
            (history?.[key]?.toString().replace(/[,'"]/g, " ") || "") + ",";
        }
        return line;
      });

      csvContent = [headerKey.join(",")].concat(csvContent).join("\n");
      var url = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(csvContent);
      var link = document.createElement("a");
      link.href = url;
      link.download = "Mouse_Tooltip_Translator_History.csv";
      link.click();
    },
  },
};
</script>
<style></style>
