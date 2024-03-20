"use strict";

const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");
var glob = require("glob");
var path = require("path");
const ExtReloader = require("webpack-ext-reloader");

// Merge webpack configuration files
module.exports = (env, argv) => {
  console.log(argv.mode);
  return merge(common, {
    entry: glob.sync("./src/**/*.js").reduce(function (obj, el) {
      //every .js file
      obj[path.parse(el).name] = el;
      return obj;
    }, {}),
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm-bundler.js",
      },
    },
    plugins: [
      argv.mode == "development"
        ? new ExtReloader({
            port: 9090, // Which port use to create the server
            reloadPage: true, // Force the reload of the page also
            entries: {
              contentScript: "contentScript",
              background: "background",
            },
          })
        : false,
    ],
    devtool: argv.mode == "development" ? "source-map" : false,
  });
};
