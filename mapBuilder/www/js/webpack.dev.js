const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        mapbuilder: './main.js',
        mapbuilderadmin: './mainadmin.js',
        mapbuilderadminpreview: './mainadminpreview.js'
    },
    output: {
        filename: '[name].js',
        path : path.resolve(__dirname, '../../../tests/lizmap/www/mapBuilder/js'),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    externals: {
        jquery: 'jQuery'
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false)
        })
    ]
};
