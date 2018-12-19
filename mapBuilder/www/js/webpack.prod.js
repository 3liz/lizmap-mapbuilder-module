const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './main.js',
  output: {
    path: __dirname,
    publicPath: '/index.php/jelix/www/getfile?targetmodule=mapBuilder&file=js%2F',
    chunkFilename: '[name].bundle.js',
    filename: 'mapbuilder.js'
  },
  externals: {
      jquery: 'jQuery'
    }
};
