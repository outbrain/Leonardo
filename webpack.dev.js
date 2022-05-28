const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require('node:path');

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "./"),
    },
    open: true,
    port: 9284,
  },
});
