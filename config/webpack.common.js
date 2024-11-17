"use strict";

const SizePlugin = require("size-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const PATHS = require("./paths");
const ComponentsPlugin = require("unplugin-vue-components/webpack").default;
const AutoImportPlugin = require("unplugin-auto-import/webpack").default;
const VueRouterPlugin = require("unplugin-vue-router/webpack");

const common = {
  output: {
    path: PATHS.build,
    filename: "[name].js",
  },
  stats: {
    all: false,
    errors: true,
    builtAt: true,
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm-bundler.js",
    },
  },
  module: {
    rules: [
      {
        test: /\.s(c|a)ss$/,
        use: [
          "vue-style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sassOptions: {
                indentedSyntax: true,
              },
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: "url-loader?limit=25000",
      },
      {
        test: /\.css$/,
        use: [
          "vue-style-loader",
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "",
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "images",
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new SizePlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "**/*",
          context: "public",
          filter: (resourcePath) => {
            const excludeList = ["compressed.tracemonkey-pldi-09.pdf", ".md", ".map"];
            return !excludeList.some((excludeItem) => resourcePath.includes(excludeItem));
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    ComponentsPlugin({}),
    AutoImportPlugin({
      include: [
        /\.vue$/,
        /\.vue\?vue/,
      ],
      imports: ["vue", "vue-router"],
    }),
    VueRouterPlugin({}),
  ],
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
};

module.exports = common;
