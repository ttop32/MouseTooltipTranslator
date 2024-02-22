"use strict";

//interact user setting,
// handle save setting
//use popup.vue file

// load vue and component
import { createApp } from "vue";
import App from "/src/App.vue";
import router from "/src/router";
import PopupWindow from "/src/components/popupWindow.vue";

//pinia
import { createPinia } from "pinia";

// vuetify main
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader

// input mask
import { vMaska } from "maska";

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    options: {
      customProperties: true,
    },
  },
});

createApp(App)
  .directive("maska", vMaska)
  .use(vuetify)
  .use(createPinia())
  .use(router)
  .component("popupWindow", PopupWindow)
  .mount("#app");
