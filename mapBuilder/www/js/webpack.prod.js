const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './main.js',
  output: {
    path: __dirname,
    filename: 'mapbuilder.js'
  },
  externals: {
      jquery: 'jQuery'
    }
};
