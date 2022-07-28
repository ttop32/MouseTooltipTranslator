'use strict';

//interact user setting,
// handle save setting
//use popup.vue file

import "typeface-roboto/index.css"; //font for vuetify
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'vuetify/dist/vuetify.min.css'; //vuetify css
import Vue from 'vue'; //vue framework
import Vuetify from 'vuetify'; //vue style
import App from './popup.vue'
Vue.use(Vuetify);



new Vue({
  el: '#app',
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdi'
    }
  }),
  render: h => h(App),
});
