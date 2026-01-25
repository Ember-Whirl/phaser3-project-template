const { merge } = require('webpack-merge');
const prodConfig = require('./config.prod.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

console.log('Building for CrazyGames platform...');

module.exports = merge(prodConfig, {
    output: {
        path: path.resolve(process.cwd(), 'dist/crazygames'),
        filename: './bundle.min.js'
    },
    plugins: [
        // Override HtmlWebpackPlugin to inject CrazyGames SDK
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: 'body',
            scriptLoading: 'blocking',
            minify: {
                collapseWhitespace: true,
                keepClosingSlash: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true
            },
            // Inject CrazyGames SDK before our bundle
            templateParameters: {
                crazySDK: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'
            }
        })
    ]
});
