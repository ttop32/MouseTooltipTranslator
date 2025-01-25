"use strict";

const { merge } = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const common = require("./webpack.common.js");
const PATHS = require("./paths");
var glob = require("glob");
var path = require("path");
const ExtReloader = require("webpack-ext-reloader");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env, argv) => {
  console.log(argv.mode);
  return merge({
    mode: argv.mode || "production",
    entry: glob.sync("./src/**/*.js").reduce(function (obj, el) {
      obj[path.parse(el).name] = el;
      return obj;
    }, {}),
    optimization: {
      minimize: argv.mode === "production",
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: argv.mode === "production",
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
    },
    plugins: [
      argv.mode == "development"
        ? new ExtReloader({
            port: 9090,
            reloadPage: true,
            entries: {
              contentScript: "contentScript",
              background: "background",
            },
          })
        : false,
    ].filter(Boolean),
    devtool: argv.mode == "development" ? "source-map" : false,
  },common);
};
