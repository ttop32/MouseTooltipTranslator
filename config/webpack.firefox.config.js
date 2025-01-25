const CopyWebpackPlugin = require('copy-webpack-plugin');
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const glob = require("glob");
const path = require("path");

module.exports = (env, argv) => {
    console.log(argv.mode);

    return merge({
        mode: argv.mode,
        entry: glob.sync("./src/**/*.js").reduce((entries, filePath) => {
            entries[path.parse(filePath).name] = filePath;
            return entries;
        }, {}),
        plugins: [
            new CopyWebpackPlugin({ patterns: [
                {
                    from: "**/*",
                    context: "public",
                    filter: (resourcePath) => {
                        const excludeList = ["manifest.json", "compressed.tracemonkey-pldi-09.pdf", ".md", ".map"];
                        return !excludeList.some((excludeItem) => resourcePath.includes(excludeItem));
                    },
                },
                { from: 'public/manifest.firefox.json', to: 'manifest.json' }
            ] })
        ],
    },common);
};
