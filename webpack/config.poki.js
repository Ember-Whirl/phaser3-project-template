const { merge } = require('webpack-merge');
const prodConfig = require('./config.prod.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

console.log('Building for Poki platform...');

module.exports = merge(prodConfig, {
    output: {
        path: path.resolve(process.cwd(), 'dist/poki'),
        filename: './bundle.min.js'
    },
    plugins: [
        // Override HtmlWebpackPlugin to inject Poki SDK
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
            // Inject Poki SDK before our bundle
            templateParameters: {
                pokiSDK: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>'
            }
        })
    ]
});
