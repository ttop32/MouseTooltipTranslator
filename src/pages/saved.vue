<template>
  <popupWindow>
    <!-- top nav bar -->
    <BackHeader title="Saved Words">
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

    <!-- board style list -->
    <div class="saved-board">
      <v-table density="compact" class="saved-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 48px">#</th>
            <th class="text-left">Source</th>
            <th class="text-left">Translation</th>
            <th class="text-center" style="width: 56px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!savedList.length">
            <td colspan="4" class="text-center text-disabled py-6">
              No saved words yet
            </td>
          </tr>
          <tr v-for="row in pagedRows" :key="row.absoluteIndex">
            <td class="text-center text-disabled">{{ row.no }}</td>
            <td class="text-left">{{ row.item.sourceText }}</td>
            <td class="text-left text-medium-emphasis">
              {{ truncate(row.item.targetText) }}
            </td>
            <td class="text-center">
              <v-btn
                color="grey-lighten-1"
                icon="mdi-close-circle"
                variant="text"
                size="small"
                @click="removeSaved(row.absoluteIndex)"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- numbered pagination (no infinite scroll) -->
      <v-pagination
        v-if="pageCount > 1"
        v-model="page"
        :length="pageCount"
        :total-visible="7"
        density="comfortable"
        class="saved-pagination"
      ></v-pagination>
    </div>
  </popupWindow>
</template>
<script>
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";
import TextUtil from "/src/util/text_util.js";

// every saved/history entry belongs to a group; entries without an
// explicit group are treated as group 0 (the default group)
export const DEFAULT_GROUP_ID = 0;

export default {
  name: "SavedView",
  data() {
    return {
      page: 1,
      itemsPerPage: 20,
      toolbarButtons: {
        remove: {
          name: "Remove all",
          title: "Remove all",
          icon: "mdi-trash-can",
          func: this.removeAllSaved,
        },
        download: {
          name: "Download CSV",
          title: "Download CSV",
          icon: "mdi-download",
          func: this.downloadCSV,
        },
      },
    };
  },
  computed: {
    ...mapState(useSettingStore, ["setting"]),
    savedList() {
      return this.setting["historyList"] || [];
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.savedList.length / this.itemsPerPage));
    },
    pagedRows() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.savedList
        .slice(start, start + this.itemsPerPage)
        .map((item, i) => ({
          item,
          absoluteIndex: start + i,
          no: start + i + 1,
        }));
    },
  },
  watch: {
    // keep page in range when list shrinks (e.g. after deletion)
    pageCount(newCount) {
      if (this.page > newCount) {
        this.page = newCount;
      }
    },
  },
  mounted() {
    this.normalizeGroupId();
  },
  methods: {
    // migration: ensure every entry has a groupId (default group 0)
    normalizeGroupId() {
      const list = this.setting["historyList"];
      if (!list?.length) return;
      let changed = false;
      const normalized = list.map((item) => {
        if (item.groupId == null) {
          changed = true;
          return { ...item, groupId: DEFAULT_GROUP_ID };
        }
        return item;
      });
      if (changed) {
        this.setting["historyList"] = normalized;
      }
    },
    truncate(text) {
      return text?.substring(0, 40) || "";
    },
    removeSaved(index) {
      this.setting["historyList"] = [
        ...this.savedList.slice(0, index),
        ...this.savedList.slice(index + 1),
      ];
    },
    removeAllSaved() {
      this.setting["historyList"] = [];
    },
    getHeaderKey() {
      return [
        "date",
        "sourceLang",
        "targetLang",
        "sourceText",
        "targetText",
        "dict",
        "actionType",
        "translator",
        "groupId",
      ];
    },
    getCsvContent() {
      const headerKey = this.getHeaderKey();
      let csvContent = this.savedList.map((history) => {
        let line = "";
        headerKey.forEach(
          (key) =>
            (line +=
              TextUtil.trimAllSpace(String(history[key] ?? "")).replace(
                /[,#'"]/g,
                " "
              ) + ",")
        );
        return line;
      });
      csvContent = [headerKey.join(",")].concat(csvContent).join("\n");
      return csvContent;
    },
    downloadCSV() {
      const csvContent = this.getCsvContent();
      const url = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(csvContent);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mouse_Tooltip_Translator_Saved.csv";
      link.click();
    },
  },
};
</script>
<style scoped>
.saved-board {
  height: calc(100vh - 64px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.saved-table {
  flex: 1;
}
.saved-pagination {
  padding: 8px 0 16px;
}
</style>
