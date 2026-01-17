const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devtool: "eval-source-map",
  output: {
    path: path.resolve(__dirname, "../dist"),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        type: "asset/source"
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml|json|atlas)$/i,
        type: "asset/resource"
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*", "!index.html"]
    }),
    new webpack.DefinePlugin({
      __platform__: JSON.stringify("Web"),
      __DEV__: true,
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new HtmlWebpackPlugin({
      template: "./index.html"
    })
  ],
  devServer: {
    open: true,
    port: 8080,
    static: [
      {
        directory: path.join(__dirname, ".."),
        publicPath: "/"
      }
    ]
  }
};
