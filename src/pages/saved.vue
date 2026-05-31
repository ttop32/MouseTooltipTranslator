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
      <!-- group filter -->
      <div class="saved-controls px-4 pt-2">
        <v-select
          v-model="groupFilter"
          :items="groupFilterOptions"
          label="Group"
          density="compact"
          variant="underlined"
          hide-details
        ></v-select>
      </div>

      <!-- bulk action bar (shown when rows are selected) -->
      <div v-if="selected.length" class="saved-bulk px-4 py-1">
        <span class="text-caption">{{ selected.length }} selected</span>
        <v-select
          :model-value="null"
          :items="groupSelectOptions"
          label="Move to group"
          density="compact"
          variant="underlined"
          hide-details
          class="bulk-move-select"
          @update:model-value="moveSelectedToGroup"
        ></v-select>
        <v-btn
          variant="text"
          size="small"
          color="red"
          prepend-icon="mdi-trash-can"
          @click="deleteSelected"
          >Delete</v-btn
        >
        <v-btn variant="text" size="small" @click="clearSelection">Clear</v-btn>
      </div>

      <!-- board style list; click a header to sort by that column -->
      <v-table density="compact" class="saved-table">
        <thead>
          <tr>
            <th style="width: 40px">
              <v-checkbox
                :model-value="allPageSelected"
                :indeterminate="somePageSelected && !allPageSelected"
                density="compact"
                hide-details
                @update:model-value="toggleSelectAllPage"
              ></v-checkbox>
            </th>
            <th class="text-center num-col">#</th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="text-left sortable-th"
              :style="col.width ? { width: col.width } : {}"
              @click="sortBy(col.key)"
            >
              {{ col.label }}
              <v-icon v-if="sortKey === col.key" size="x-small">
                {{ sortDesc ? "mdi-arrow-down" : "mdi-arrow-up" }}
              </v-icon>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!displayList.length">
            <td :colspan="columns.length + 2" class="text-center text-disabled py-6">
              No saved words yet
            </td>
          </tr>
          <tr v-for="row in pagedRows" :key="row.no">
            <td>
              <v-checkbox
                :model-value="isSelected(row.item)"
                density="compact"
                hide-details
                @update:model-value="() => toggleSelect(row.item)"
              ></v-checkbox>
            </td>
            <td class="text-center text-disabled num-col">{{ row.no }}</td>
            <td class="text-left text-medium-emphasis text-no-wrap">
              {{ formatDate(row.item.date) }}
            </td>
            <td class="text-left" :title="row.item.sourceText">
              <span
                class="group-dot"
                :style="{ backgroundColor: getGroupColor(row.item.groupId) }"
              ></span>
              {{ row.item.sourceText }}
            </td>
            <td class="text-left text-medium-emphasis" :title="row.item.targetText">
              {{ row.item.targetText }}
            </td>
            <td class="text-left text-medium-emphasis">
              {{ getGroupName(row.item.groupId) }}
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
    <v-dialog v-model="groupDialog" max-width="560">
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

            <!-- name (group 1 is renamable too; only deletion is blocked) -->
            <v-text-field
              v-model="group.name"
              density="compact"
              variant="underlined"
              hide-details
              class="flex-grow-1"
            ></v-text-field>

            <!-- per-group save shortcut key -->
            <v-select
              v-model="group.key"
              :items="groupKeyOptions"
              label="Save key"
              density="compact"
              variant="underlined"
              hide-details
              class="group-key-select ml-3"
            ></v-select>

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
import { defaultData } from "/src/util/setting_default.js";
import TextUtil from "/src/util/text_util.js";

// every saved/history entry belongs to a group; entries without an
// explicit group are treated as group 1 (the default group)
export const DEFAULT_GROUP_ID = 1;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// a group's effective save shortcut defaults to Ctrl+Shift+<id> when unset
function effectiveGroupKey(group) {
  return group.key ?? "CtrlShift" + group.id;
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
      // data columns (in table order); headers are click-to-sort
      columns: [
        { key: "date", label: "Date", width: "150px" },
        { key: "sourceText", label: "Source" }, // flexible
        { key: "targetText", label: "Translation" }, // flexible
        { key: "groupId", label: "Group", width: "110px" },
      ],
      selected: [], // selected entry references for bulk move
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
    groupKeyOptions() {
      const opts = [{ title: "None", value: "null" }];
      for (let i = 1; i <= 9; i++) {
        opts.push({ title: `Ctrl+Shift+${i}`, value: `CtrlShift${i}` });
      }
      // auto-save triggers (replaces the old global "Record when")
      opts.push({ title: "On Select", value: "select" });
      opts.push({ title: "On Hover", value: "mouseover" });
      opts.push({ title: "On Select + Hover", value: "both" });
      return opts;
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
        if (key === "groupId") {
          return (
            dir * ((a.groupId ?? DEFAULT_GROUP_ID) - (b.groupId ?? DEFAULT_GROUP_ID))
          );
        }
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
    allPageSelected() {
      return (
        this.pagedRows.length > 0 &&
        this.pagedRows.every((r) => this.selected.includes(r.item))
      );
    },
    somePageSelected() {
      return this.pagedRows.some((r) => this.selected.includes(r.item));
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
    this.migrateGroups();
    this.normalizeGroupId();
    this.migrateRecordWhenToGroup1();
    this.updateItemsPerPage();
    window.addEventListener("resize", this.updateItemsPerPage);
    document.body.classList.add("saved-wide"); // widen this tab past popup cap
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateItemsPerPage);
    document.body.classList.remove("saved-wide");
  },
  methods: {
    // fit rows to the viewport so the board paginates instead of scrolling
    updateItemsPerPage() {
      const rowHeight = 40; // approx compact row height
      const reserved = 220; // header + controls + table head + pagination
      const avail = window.innerHeight - reserved;
      this.itemsPerPage = Math.max(5, Math.floor(avail / rowHeight));
    },
    // upgrade stale wordGroups from earlier builds (old "Default" group id 0)
    // to the new 1-5 scheme. Idempotent: no-op once group 0 is gone.
    migrateGroups() {
      const groups = this.groups;
      if (!groups.some((g) => g.id === 0)) return;
      let migrated = groups.map((g) =>
        g.id === 0
          ? { ...g, id: DEFAULT_GROUP_ID, name: g.name === "Default" ? "Group 1" : g.name }
          : g
      );
      // ensure the preset groups 1-5 all exist
      for (const preset of defaultData.wordGroups) {
        if (!migrated.some((g) => g.id === preset.id)) {
          migrated.push({ ...preset });
        }
      }
      this.setting["wordGroups"] = migrated;
    },
    // the old global "Record when" (historyRecordActions) is inherited by the
    // default group 1 as its auto-save trigger, then cleared (run once)
    migrateRecordWhenToGroup1() {
      const actions = this.setting["historyRecordActions"] || [];
      if (!actions.length) return;
      const s = actions.includes("select");
      const m = actions.includes("mouseover");
      const val = s && m ? "both" : s ? "select" : m ? "mouseover" : null;
      if (val) {
        this.setting["wordGroups"] = this.groups.map((g) =>
          g.id === DEFAULT_GROUP_ID ? { ...g, key: val } : g
        );
      }
      this.setting["historyRecordActions"] = []; // consumed
    },
    // migration: ensure every entry has a groupId (default group 1)
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
    getGroupName(groupId) {
      const group = this.groups.find((g) => g.id === (groupId ?? DEFAULT_GROUP_ID));
      return group?.name || "";
    },
    formatDate(date) {
      // ISO (toJSON) -> "YYYY-MM-DD HH:mm"
      return date ? String(date).replace("T", " ").slice(0, 16) : "";
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortKey = key;
        this.sortDesc = false;
      }
    },
    deleteSelected() {
      if (!this.selected.length) return;
      const sel = new Set(this.selected);
      this.setting["historyList"] = this.savedList.filter((it) => !sel.has(it));
      this.clearSelection();
    },
    removeAllSaved() {
      this.setting["historyList"] = [];
      this.clearSelection();
    },
    // ---- selection / bulk move ----
    isSelected(item) {
      return this.selected.includes(item);
    },
    toggleSelect(item) {
      this.selected = this.isSelected(item)
        ? this.selected.filter((it) => it !== item)
        : [...this.selected, item];
    },
    toggleSelectAllPage() {
      const pageItems = this.pagedRows.map((r) => r.item);
      if (this.allPageSelected) {
        this.selected = this.selected.filter((it) => !pageItems.includes(it));
      } else {
        const set = new Set([...this.selected, ...pageItems]);
        this.selected = [...set];
      }
    },
    clearSelection() {
      this.selected = [];
    },
    moveSelectedToGroup(groupId) {
      if (groupId == null || !this.selected.length) return;
      const sel = new Set(this.selected);
      this.setting["historyList"] = this.savedList.map((item) =>
        sel.has(item) ? { ...item, groupId } : item
      );
      this.clearSelection();
    },
    // ---- group dialog (local buffer, committed on close) ----
    openGroupDialog() {
      this.editGroups = clone(this.groups).map((g) => ({
        ...g,
        key: effectiveGroupKey(g), // surface the effective key in the selector
      }));
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
        key: nextId <= 9 ? `CtrlShift${nextId}` : "null",
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.saved-controls {
  display: flex;
  gap: 16px;
}
.saved-bulk {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #00000011;
}
.bulk-move-select {
  max-width: 220px;
}
.saved-table {
  flex: 1;
  overflow: hidden;
}
.saved-table :deep(.v-table__wrapper) {
  overflow: hidden;
}
/* fixed layout + ellipsis so long text never wraps / breaks row height */
.saved-table :deep(table) {
  table-layout: fixed;
  width: 100%;
}
.saved-table :deep(td),
.saved-table :deep(th) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* # number column: never truncate */
.saved-table :deep(.num-col) {
  width: 56px;
  min-width: 56px;
  overflow: visible;
  text-overflow: clip;
}
.sortable-th {
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}
.sortable-th:hover {
  background-color: #00000011;
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
.group-key-select {
  max-width: 130px;
}
</style>
<!-- non-scoped: widen the saved-words tab beyond the popup's 800px cap -->
<style>
body.saved-wide #appWindow {
  max-width: 1400px;
}
</style>
