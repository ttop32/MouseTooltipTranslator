<template>
  <popupWindow>
    <!-- top nav bar (no back button: opened as a standalone tab) -->
    <BackHeader title="Saved Words" :hideBack="true">
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

    <div class="saved-board">
      <!-- group filter + sort + save shortcut key -->
      <div class="saved-controls px-4 pt-2">
        <v-select
          v-model="groupFilter"
          :items="groupFilterOptions"
          label="Group"
          density="compact"
          variant="underlined"
          hide-details
        ></v-select>
        <v-select
          v-model="sortKey"
          :items="sortFieldOptions"
          label="Sort by"
          density="compact"
          variant="underlined"
          hide-details
        ></v-select>
        <v-btn
          :icon="sortDesc ? 'mdi-sort-descending' : 'mdi-sort-ascending'"
          :title="sortDesc ? 'Descending' : 'Ascending'"
          variant="text"
          size="small"
          @click="sortDesc = !sortDesc"
        ></v-btn>
        <v-select
          v-model="setting['keySaveWord']"
          :items="keyOptions"
          label="Save shortcut key"
          density="compact"
          variant="underlined"
          hide-details
        ></v-select>
      </div>

      <!-- board style list -->
      <v-table density="compact" class="saved-table">
        <thead>
          <tr>
            <th class="text-center" style="width: 44px">#</th>
            <th class="text-left">Source</th>
            <th class="text-left">Translation</th>
            <th class="text-left" style="width: 120px">Group</th>
            <th class="text-center" style="width: 48px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredList.length">
            <td colspan="5" class="text-center text-disabled py-6">
              No saved words yet
            </td>
          </tr>
          <tr v-for="row in pagedRows" :key="row.no">
            <td class="text-center text-disabled">{{ row.no }}</td>
            <td class="text-left">
              <span
                class="group-dot"
                :style="{ backgroundColor: getGroupColor(row.item.groupId) }"
              ></span>
              {{ row.item.sourceText }}
            </td>
            <td class="text-left text-medium-emphasis">
              {{ truncate(row.item.targetText) }}
            </td>
            <td class="text-left">
              <v-select
                :model-value="row.item.groupId ?? 0"
                :items="groupSelectOptions"
                density="compact"
                variant="plain"
                hide-details
                class="row-group-select"
                @update:model-value="(v) => assignGroup(row.item, v)"
              ></v-select>
            </td>
            <td class="text-center">
              <v-btn
                color="grey-lighten-1"
                icon="mdi-close-circle"
                variant="text"
                size="small"
                @click="removeSaved(row.item)"
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

    <!-- group management dialog (edits a local buffer, commits on close) -->
    <v-dialog v-model="groupDialog" max-width="460">
      <v-card>
        <v-card-title class="d-flex align-center">
          Manage Groups
          <v-spacer></v-spacer>
          <v-btn icon variant="text" size="small" @click="addGroup">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div
            v-for="group in editGroups"
            :key="group.id"
            class="d-flex align-center my-2 group-row"
          >
            <!-- color swatch + picker -->
            <v-menu :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <div
                  v-bind="props"
                  class="group-swatch mr-3"
                  :style="{ backgroundColor: group.color }"
                ></div>
              </template>
              <v-color-picker
                :model-value="group.color"
                mode="hexa"
                @update:model-value="(c) => (group.color = c)"
              ></v-color-picker>
            </v-menu>

            <!-- name -->
            <v-text-field
              v-model="group.name"
              density="compact"
              variant="underlined"
              hide-details
              :readonly="group.id === DEFAULT_GROUP_ID"
              class="flex-grow-1"
            ></v-text-field>

            <!-- highlight on/off -->
            <v-switch
              v-model="group.enabled"
              color="primary"
              density="compact"
              hide-details
              title="Highlight on page"
              class="ml-3"
            ></v-switch>

            <!-- delete (default group not deletable) -->
            <v-btn
              icon
              variant="text"
              size="small"
              :disabled="group.id === DEFAULT_GROUP_ID"
              @click="removeGroup(group)"
            >
              <v-icon>mdi-trash-can</v-icon>
            </v-btn>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="groupDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </popupWindow>
</template>
<script>
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";
import { settingDict } from "/src/util/setting_default.js";
import TextUtil from "/src/util/text_util.js";

// every saved/history entry belongs to a group; entries without an
// explicit group are treated as group 1 (the default group)
export const DEFAULT_GROUP_ID = 1;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default {
  name: "SavedView",
  data() {
    return {
      DEFAULT_GROUP_ID,
      page: 1,
      itemsPerPage: 20,
      groupFilter: null, // null = all groups
      sortKey: "date",
      sortDesc: true, // newest first by default
      sortFieldOptions: [
        { title: "Date", value: "date" },
        { title: "Source", value: "sourceText" },
        { title: "Translation", value: "targetText" },
        { title: "Source Lang", value: "sourceLang" },
        { title: "Target Lang", value: "targetLang" },
      ],
      groupDialog: false,
      editGroups: [], // local edit buffer for the group dialog
      toolbarButtons: {
        groups: {
          name: "Manage groups",
          title: "Manage groups",
          icon: "mdi-tag-multiple",
          func: this.openGroupDialog,
        },
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
    groups() {
      return this.setting["wordGroups"] || [];
    },
    keyOptions() {
      return Object.entries(settingDict["keySaveWord"].optionList).map(
        ([title, value]) => ({ title, value })
      );
    },
    groupSelectOptions() {
      return this.groups.map((g) => ({ title: g.name, value: g.id }));
    },
    groupFilterOptions() {
      return [{ title: "All", value: null }, ...this.groupSelectOptions];
    },
    filteredList() {
      if (this.groupFilter == null) return this.savedList;
      return this.savedList.filter(
        (item) => (item.groupId ?? DEFAULT_GROUP_ID) === this.groupFilter
      );
    },
    // filtered + sorted; drives both the board and the CSV export
    displayList() {
      const key = this.sortKey;
      const dir = this.sortDesc ? -1 : 1;
      return [...this.filteredList].sort((a, b) => {
        const av = String(a?.[key] ?? "");
        const bv = String(b?.[key] ?? "");
        return dir * av.localeCompare(bv, undefined, { sensitivity: "base" });
      });
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.displayList.length / this.itemsPerPage));
    },
    pagedRows() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.displayList
        .slice(start, start + this.itemsPerPage)
        .map((item, i) => ({ item, no: start + i + 1 }));
    },
  },
  watch: {
    pageCount(newCount) {
      if (this.page > newCount) this.page = newCount;
    },
    groupFilter() {
      this.page = 1;
    },
    sortKey() {
      this.page = 1;
    },
    sortDesc() {
      this.page = 1;
    },
    // commit the local group buffer once when the dialog closes
    groupDialog(open) {
      if (!open) this.commitGroups();
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
        // missing group, or legacy group 0, -> default group 1
        if (item.groupId == null || item.groupId === 0) {
          changed = true;
          return { ...item, groupId: DEFAULT_GROUP_ID };
        }
        return item;
      });
      if (changed) this.setting["historyList"] = normalized;
    },
    getGroupColor(groupId) {
      const group = this.groups.find((g) => g.id === (groupId ?? DEFAULT_GROUP_ID));
      return group?.color || "transparent";
    },
    truncate(text) {
      return text?.substring(0, 40) || "";
    },
    assignGroup(item, groupId) {
      item.groupId = groupId;
    },
    removeSaved(item) {
      this.setting["historyList"] = this.savedList.filter((it) => it !== item);
    },
    removeAllSaved() {
      this.setting["historyList"] = [];
    },
    // ---- group dialog (local buffer, committed on close) ----
    openGroupDialog() {
      this.editGroups = clone(this.groups);
      this.groupDialog = true;
    },
    addGroup() {
      const nextId =
        this.editGroups.reduce((max, g) => Math.max(max, g.id), 0) + 1;
      this.editGroups.push({
        id: nextId,
        name: `Group ${nextId}`,
        color: "#21dc6d40",
        enabled: true,
      });
    },
    removeGroup(group) {
      if (group.id === DEFAULT_GROUP_ID) return;
      this.editGroups = this.editGroups.filter((g) => g.id !== group.id);
    },
    commitGroups() {
      const validIds = new Set(this.editGroups.map((g) => g.id));
      // reassign entries whose group was deleted back to the default group
      this.setting["historyList"] = this.savedList.map((item) =>
        validIds.has(item.groupId ?? DEFAULT_GROUP_ID)
          ? item
          : { ...item, groupId: DEFAULT_GROUP_ID }
      );
      this.setting["wordGroups"] = clone(this.editGroups);
      if (this.groupFilter != null && !validIds.has(this.groupFilter)) {
        this.groupFilter = null;
      }
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
      // export what is currently shown (current group filter + sort order)
      let csvContent = this.displayList.map((history) => {
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
      const groupName =
        this.groupFilter == null
          ? "All"
          : this.groups.find((g) => g.id === this.groupFilter)?.name ||
            this.groupFilter;
      link.download = `Mouse_Tooltip_Translator_Saved_${groupName}.csv`;
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
.saved-controls {
  display: flex;
  gap: 16px;
}
.saved-table {
  flex: 1;
}
.saved-pagination {
  padding: 8px 0 16px;
}
.group-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.group-swatch {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 2px 6px;
}
.row-group-select {
  font-size: 0.8rem;
}
.row-group-select :deep(.v-field__input) {
  padding-top: 0;
  min-height: 28px;
}
</style>
