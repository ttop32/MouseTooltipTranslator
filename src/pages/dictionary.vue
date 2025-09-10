<template>
  <popupWindow>
    <!-- top nav bar -->
    <BackHeader title="Custom Dictionary">
      <v-btn
        v-for="buttonData in Object.values(toolbarButtons)"
        :key="buttonData.name"
        :title="buttonData.title"
        icon
        @click="buttonData.func"
      >
        <v-icon>{{ buttonData.icon }}</v-icon>
      </v-btn>
    </BackHeader>

    <!-- dictionary settings -->
    <v-card-text>
      <v-row>
        <v-col cols="8">
          <v-select
            v-model="currentCategory"
            :items="categoryItems"
            label="Filter by category"
            density="comfortable"
          ></v-select>
        </v-col>
        <v-col cols="4" class="d-flex align-center">
          <v-btn size="small" color="primary" @click="showCategoryDialog = !showCategoryDialog">
            {{ showCategoryDialog ? 'Show Dictionary' : 'Categories' }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider class="mx-4"></v-divider>

    <!-- Toggle between dictionary entries and category management -->
      <!-- dictionary entries list -->
      <v-virtual-scroll :items="filteredEntries">
        <template v-slot:default="{ item, index }">
          <v-list-item
            :title="item.sourceText"
            :subtitle="item.targetText"
            height="60"
          >
            <template v-slot:prepend>
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.category }}
              </v-chip>
            </template>
            <template v-slot:append>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-close-circle"
                variant="text"
                @click="removeEntry(index)"
              ></v-btn>
            </template>
          </v-list-item>
        </template>
      </v-virtual-scroll>

      <!-- Category management (inline) -->
      <v-dialog v-model="showCategoryDialog" max-width="600px">
        <v-card flat>
        <v-card-title>
          Manage Categories
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showCategoryDialog = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
          <v-list-item v-for="(category, index) in dictionaryCategories" :key="index">
            <template v-slot:prepend>
            <v-text-field 
              v-model="dictionaryCategories[index]" 
              density="compact"
              class="mr-2"
              style="width: 150px;"
            ></v-text-field>
            </template>
            <template v-slot:default>
            <v-select
              :value="getCategoryHotkey(category)"
              @update:model-value="(value) => updateCategoryHotkey(category, value)"
              :items="availableHotkeys"
              item-title="title"
              item-value="value"
              label="Hotkey Action"
              density="compact"
              style="width: 250px;"
            >
              <template v-slot:selection="{ item }">
              <span>{{ item.title }}</span>
              </template>
            </v-select>
            </template>
            <template v-slot:append>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              @click="removeCategory(index)"
              :disabled="category === 'General'"
            ></v-btn>
            </template>
          </v-list-item>
          </v-list>
          <v-row>
          <v-col>
            <v-text-field
            v-model="newCategory"
            label="New category"
            density="compact"
            append-icon="mdi-plus"
            @click:append="addCategory"
            @keyup.enter="addCategory"
            ></v-text-field>
          </v-col>
          </v-row>
        </v-card-text>
        </v-card>
      </v-dialog>

  </popupWindow>
</template>

<script>
import _ from "lodash";
import { mapState } from "pinia";
import { useSettingStore } from "/src/stores/setting.js";
import TextUtil from "/src/util/text_util.js";
import BackHeader from "../components/BackHeader.vue";
import PopupWindow from "../components/PopupWindow.vue";

export default {
  name: "DictionaryView",
  components: {
    BackHeader,
    PopupWindow
  },
  data() {
    return {
      // currentCategory removed from data (now a computed property)
      showCategoryDialog: false,
      newCategory: "",
      toolbarButtons: {
        export: {
          name: "Export Dictionary",
          title: "Export Dictionary",
          icon: "mdi-export",
          func: this.exportDictionary,
        },
        import: {
          name: "Import Dictionary",
          title: "Import Dictionary",
          icon: "mdi-import",
          func: this.importDictionary,
        },
        remove: {
          name: "Clear Dictionary",
          title: "Clear Dictionary",
          icon: "mdi-trash-can",
          func: this.clearDictionary,
        }
      },
      
      // Available hotkeys for categories
      availableHotkeys: [
        { title: 'None', value: 'none' },
        { title: 'Mouseover', value: 'mouseover' },
        { title: 'Select', value: 'select' },
        { title: 'Ctrl+Shift+1', value: 'ctrl+shift+1' },
        { title: 'Ctrl+Shift+2', value: 'ctrl+shift+2' },
        { title: 'Ctrl+Shift+3', value: 'ctrl+shift+3' },
        { title: 'Ctrl+Shift+4', value: 'ctrl+shift+4' },
        { title: 'Ctrl+Shift+5', value: 'ctrl+shift+5' },
        { title: 'Ctrl+Shift+6', value: 'ctrl+shift+6' },
        { title: 'Ctrl+Shift+7', value: 'ctrl+shift+7' },
        { title: 'Ctrl+Shift+8', value: 'ctrl+shift+8' },
        { title: 'Ctrl+Shift+9', value: 'ctrl+shift+9' },
        { title: 'Ctrl+Shift+F1', value: 'ctrl+shift+f1' },
        { title: 'Ctrl+Shift+F2', value: 'ctrl+shift+f2' },
        { title: 'Ctrl+Shift+F3', value: 'ctrl+shift+f3' },
        { title: 'Ctrl+Shift+F4', value: 'ctrl+shift+f4' },
        { title: 'Ctrl+Shift+F5', value: 'ctrl+shift+f5' },
        { title: 'Ctrl+Shift+F6', value: 'ctrl+shift+f6' },
        { title: 'Ctrl+Shift+F7', value: 'ctrl+shift+f7' },
        { title: 'Ctrl+Shift+F8', value: 'ctrl+shift+f8' },
        { title: 'Ctrl+Shift+F9', value: 'ctrl+shift+f9' },
        { title: 'Ctrl+Shift+F10', value: 'ctrl+shift+f10' },
        { title: 'Ctrl+Shift+F11', value: 'ctrl+shift+f11' },
        { title: 'Ctrl+Shift+F12', value: 'ctrl+shift+f12' }
      ]
    };
  },
  computed: {
    ...mapState(useSettingStore, ["setting"]),
    
    // Update dictionary accessors to use new flat structure
    dictionaryEntries() {
      // console.log(this.setting.dictionaryEntries)
      return this.setting.dictionaryEntries || [];
      // return this.setting.historyList
    },
    
    dictionaryCategories() {
      return this.setting.dictionaryCategories || ["General"];
    },
    
    currentCategory: {
      get() {
        return this.setting.dictionaryLastFilter || "All";
      },
      set(value) {
        this.setting.dictionaryLastFilter = value;
      }
    },
    
    categoryItems() {
      return ["All", ...this.dictionaryCategories];
    },
    
    filteredEntries() {
        console.log(this.dictionaryEntries)
      if (this.currentCategory === "All") {
        console.log("All categories selected");
        return this.dictionaryEntries;
      }
        console.log("Filtering entries for category:", this.currentCategory);
      return this.dictionaryEntries.filter(
        entry => entry.category === this.currentCategory
      );
    }
  },
  methods: {
    clearDictionary() {
        console.log("Clearing entire dictionary");
      this.setting.dictionaryEntries = [];
    },
    
    removeEntry(index) {
        console.log("Removing entry at index:", index);
      const filteredIndex = this.currentCategory === "All" 
        ? index 
        : this.dictionaryEntries.findIndex(
            entry => entry === this.filteredEntries[index]
          );
          
      if (filteredIndex >= 0) {
        this.setting.dictionaryEntries = [
          ...this.dictionaryEntries.slice(0, filteredIndex),
          ...this.dictionaryEntries.slice(filteredIndex + 1),
        ];
      }
    },
    
    addCategory() {
      // Check if we have input and it's not a duplicate
      if (this.newCategory && !this.dictionaryCategories.includes(this.newCategory)) {
        try {
          // Make sure the array exists
          if (!Array.isArray(this.setting.dictionaryCategories)) {
            this.setting.dictionaryCategories = ["General"];
          }
          
          // Add the new category
          this.setting.dictionaryCategories = [...this.setting.dictionaryCategories, this.newCategory];
          
          // Initialize hotkey for this category
          if (!this.setting.dictionaryHotkeyMap) {
            this.setting.dictionaryHotkeyMap = {};
          }
          this.setting.dictionaryHotkeyMap[this.newCategory] = "none";
          
          // Clear the input field
          this.newCategory = "";
          
          console.log("Added new category:", this.newCategory);
          console.log("Current categories:", this.setting.dictionaryCategories);
        } catch (error) {
          console.error("Error adding category:", error);
        }
      } else {
        // Provide feedback if category already exists
        if (this.dictionaryCategories.includes(this.newCategory)) {
          alert("This category already exists");
        }
      }
    },
    
    removeCategory(index) {
        console.log("Removing category at index:", index);
      const categoryToRemove = this.dictionaryCategories[index];
      
      // Don't allow removing General category
      if (categoryToRemove === "General") {
        return;
      }
      
      // Update entries that use this category
      this.dictionaryEntries.forEach(entry => {
        if (entry.category === categoryToRemove) {
          entry.category = "General";
        }
      });
      
      // Remove the category
      this.setting.dictionaryCategories.splice(index, 1);
    },
    
    exportDictionary() {
      const headers = ["sourceText", "targetText", "sourceLang", "targetLang", "dict", "category", "date"];
      
      const csvContent = this.dictionaryEntries.map(entry => {
        let line = "";
        headers.forEach(key => {
          const value = entry[key] || "";
          line += TextUtil.trimAllSpace(value).replace(/[,#'"]/g, " ") + ",";
        });
        return line;
      });
      
      const finalCsv = [headers.join(",")].concat(csvContent).join("\n");
      
      const url = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURI(finalCsv);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mouse_Tooltip_Translator_Dictionary.csv";
      link.click();
    },
    
    // Get the hotkey for a category
    getCategoryHotkey(category) {
      if (!this.setting.dictionaryHotkeyMap) {
        this.setting.dictionaryHotkeyMap = {};
      }
      return this.setting.dictionaryHotkeyMap[category] || 'none';
    },
    
    // Update the hotkey for a category
    updateCategoryHotkey(category, hotkeyValue) {
      if (!this.setting.dictionaryHotkeyMap) {
        this.setting.dictionaryHotkeyMap = {};
      }
      
      // First remove this hotkey from any other category
      if (hotkeyValue !== 'none') {
        const existingCategory = Object.keys(this.setting.dictionaryHotkeyMap).find(
          cat => this.setting.dictionaryHotkeyMap[cat] === hotkeyValue && cat !== category
        );
        
        if (existingCategory) {
          this.setting.dictionaryHotkeyMap[existingCategory] = 'none';
        }
      }
      
      // Now set the hotkey for this category
      this.setting.dictionaryHotkeyMap[category] = hotkeyValue;
    },
    
    // Add a word to a specific category
    addWordToCategory(sourceText, targetText, sourceLang, targetLang, category) {
      const entry = {
        sourceText,
        targetText,
        sourceLang,
        targetLang,
        dict: "",  // Adding this field to match your structure
        category: category || "General", // Use General as default
        date: new Date().toISOString().split('T')[0]
      };
      
      this.setting.dictionaryEntries.push(entry);
    },
    
    importDictionary() {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv';
      
      // Handle file selection
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            const lines = content.split('\n');
            
            // Parse header row
            const headers = lines[0].split(',');
            const sourceTextIndex = headers.indexOf('sourceText');
            const targetTextIndex = headers.indexOf('targetText');
            const sourceLangIndex = headers.indexOf('sourceLang');
            const targetLangIndex = headers.indexOf('targetLang');
            const dictIndex = headers.indexOf('dict');
            const categoryIndex = headers.indexOf('category');
            const dateIndex = headers.indexOf('date');
            
            // Ensure required fields are present
            if (sourceTextIndex === -1 || targetTextIndex === -1) {
              alert('CSV file must contain "sourceText" and "targetText" columns');
              return;
            }
            
            // Parse data rows
            const newEntries = [];
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue; // Skip empty lines
              
              const values = lines[i].split(',');
              
              // Create entry object
              const entry = {
                sourceText: values[sourceTextIndex]?.trim() || '',
                targetText: values[targetTextIndex]?.trim() || '',
                sourceLang: sourceLangIndex > -1 ? values[sourceLangIndex]?.trim() || 'auto' : 'auto',
                targetLang: targetLangIndex > -1 ? values[targetLangIndex]?.trim() || 'en' : 'en',
                dict: dictIndex > -1 ? values[dictIndex]?.trim() || '' : '',
                category: categoryIndex > -1 ? values[categoryIndex]?.trim() || 'General' : 'General',
                date: dateIndex > -1 ? values[dateIndex]?.trim() || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              };
              
              // Skip entries without source text or target text
              if (entry.sourceText && entry.targetText) {
                newEntries.push(entry);
              }
            }
            
            // Add new entries to dictionary
            if (newEntries.length > 0) {
              this.setting.dictionaryEntries = [...this.dictionaryEntries, ...newEntries];
              alert(`Successfully imported ${newEntries.length} entries`);
            } else {
              alert('No valid entries found in the CSV file');
            }
          } catch (error) {
            console.error('Error parsing CSV file:', error);
            alert('Error parsing CSV file. Please check the format.');
          }
        };
        
        reader.readAsText(file);
      };
      
      // Trigger file selection dialog
      fileInput.click();
    },
  },
  beforeCreate() {
    console.log("Initializing dictionary component");
    // Make sure the setting store is initialized
    const settingStore = useSettingStore();
    
    // Check if entries already exist
    // if (settingStore.setting.historyList && 
    //     (!settingStore.setting.dictionaryEntries || settingStore.setting.dictionaryEntries.length === 0)) {
    //   console.log("Migrating data from historyList to dictionaryEntries");
      
    //   // Create a deep copy of the history list to prevent reference issues
    //   const entries = JSON.parse(JSON.stringify(settingStore.setting.historyList));
      
    //   // Ensure we're setting a new array to trigger reactivity
    //   settingStore.setting.dictionaryEntries = entries;
      
    //   console.log(`Migrated ${entries.length} entries`);
      
    //   // Force persistence if your store supports it
    //   if (typeof settingStore.persist === 'function') {
    //     settingStore.persist();
    //   }
    // }
    
    // // Ensure the array exists even if no migration happened
    // if (!Array.isArray(settingStore.setting.dictionaryEntries)) {
    //   console.log("Creating empty dictionaryEntries array");
    //   settingStore.setting.dictionaryEntries = [];
    // }
    
    // Initialize other dictionary settings with the same safety approach
    if (!Array.isArray(settingStore.setting.dictionaryCategories)) {
      settingStore.setting.dictionaryCategories = ["General", "Academic", "Business", "Culture"];
    }
    
    if (!settingStore.setting.dictionaryLastFilter) {
      settingStore.setting.dictionaryLastFilter = "All";
    }
    
    if (!settingStore.setting.dictionaryHotkeyMap) {
      settingStore.setting.dictionaryHotkeyMap = {
        "General": "ctrl+shift+1",
        "Academic": "ctrl+shift+2",
        "Business": "ctrl+shift+3",
        "Culture": "ctrl+shift+4"
      };
    }
  }
};
</script>

<style scoped>
.v-virtual-scroll {
  height: calc(100vh - 180px);
}


.popupContainer {
  position: absolute;
  margin: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 300px;
}


</style>