const webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: {
    path: __dirname,
    filename: 'mapbuilder.js'
  },
  externals: {
      jquery: 'jQuery'
    }
};
