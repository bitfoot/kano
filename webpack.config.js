const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    popup: "./src/scripts/popup.js"
  },
  output: {
    path: path.resolve(__dirname, "dist/js"),
    filename: "[name].js"
  },
  optimization: {
    minimize: true
  }
};
