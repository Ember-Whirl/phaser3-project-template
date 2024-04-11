const merge = require("webpack-merge");
const webpack = require("webpack")
var CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require("path");
const base = require("./base");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(base, {
  mode: "production",
  output: {
    filename: "bundle.min.js"
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __platform__: JSON.stringify("Web"),
      __DEV__: true,
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'src/assets'}
      ]
    })
  ]
});
