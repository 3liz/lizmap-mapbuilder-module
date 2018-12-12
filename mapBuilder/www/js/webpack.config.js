const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './main.js',
  output: {
    path: __dirname,
    filename: 'mapbuilder.js'
  },
  externals: {
      jquery: 'jQuery'
    }
};
