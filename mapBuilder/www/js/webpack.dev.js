const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './main.js',
  output: {
    path: __dirname,
    // on part du principe que le mapBuilder aura toujours une URL finissant par /mapBuilder (à améliorer ?)
    publicPath: '../jelix/www/getfile?targetmodule=mapBuilder&file=js%2F',
    chunkFilename: '[name].bundle.js',
    filename: 'mapbuilder.js'
  },
  externals: {
      jquery: 'jQuery'
    }
};
