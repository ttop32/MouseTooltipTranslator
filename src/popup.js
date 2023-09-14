"use strict";

//interact user setting,
// handle save setting
//use popup.vue file

// load vue and component
import { createApp } from "vue";
import App from "./popup.vue";
// Vuetify css
import "typeface-roboto/index.css"; //font for vuetify
import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
import "vuetify/dist/vuetify.min.css"; //vuetify css
// vuetify main
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
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

createApp(App).directive("maska", vMaska).use(vuetify).mount("#app");
