const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/scripts/background.js",
    popup: "./src/scripts/popup.js"
  },
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename: "[name].js"
  },
  optimization: {
    minimize: false
  }
};
