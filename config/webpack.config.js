'use strict';

const {
  merge
} = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
module.exports = (env, argv) => {
  console.log(argv.mode);
  return merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
    },
    resolve: {
      alias: {
        vue: argv.mode == 'production' ? 'vue/dist/vue.min.js' : 'vue/dist/vue.js'
      },
    }
  })
}
