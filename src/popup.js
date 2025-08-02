"use strict";

//interact user setting,
// handle save setting
//use popup.vue file

// load vue and component
import { createApp } from "vue";
import App from "/src/App.vue";
import router from "/src/router";
// import PopupWindow from "/src/components/popupWindow.vue";

//pinia
import { createPinia } from "pinia";

// vuetify main
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "typeface-roboto/index.css"; //font for vuetify
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
import "vuetify/dist/vuetify.min.css"; //vuetify css
// input mask
import { vMaska } from "maska";

import SettingUtil from "/src/util/setting_util.js";

var lang = SettingUtil.getDefaultLang();
var messages = {};
messages[lang] = { open: "Open", close: "Close" };

const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: lang,
    fallback: "en",
    messages,
  },
  theme: {
    defaultTheme: prefersDarkTheme ? "dark" : "light", // Set theme based on OS preference
    themes: {
      dark: {
        colors: {
          primary: "#0D47A1", // Darker blue for primary color
          secondary: "#424242", // Customize secondary color
        },
      },
      light: {
        colors: {
          primary: "#1976D2",
          secondary: "#424242",
        },
      },
    },
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
  // .component("popupWindow", PopupWindow)
  .mount("#app");
