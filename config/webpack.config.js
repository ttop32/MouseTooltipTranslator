"use strict";

const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");
var glob = require("glob");
var path = require("path");

// Merge webpack configuration files
module.exports = (env, argv) => {
  console.log(argv.mode);
  return merge(common, {
    entry: glob.sync("./src/**/*.js").reduce(function(obj, el) {
      //every .js file
      obj[path.parse(el).name] = el;
      return obj;
    }, {}),
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
      },
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      },
    },
  });
};
