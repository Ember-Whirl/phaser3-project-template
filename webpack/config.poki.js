const { merge } = require('webpack-merge');
const prodConfig = require('./config.prod.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

console.log('Building for Poki platform...');

// Remove HtmlWebpackPlugin from prod config to avoid duplicate index.html emission
const filteredProdConfig = {
    ...prodConfig,
    plugins: prodConfig.plugins.filter(p => !(p instanceof HtmlWebpackPlugin))
};

module.exports = merge(filteredProdConfig, {
    output: {
        path: path.resolve(process.cwd(), 'dist/poki'),
        filename: './bundle.min.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            __platform__: JSON.stringify('Poki')
        }),
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
            templateParameters: {
                pokiSDK: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>'
            }
        })
    ]
});
