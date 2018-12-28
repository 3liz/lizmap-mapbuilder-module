const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './main.js',
  output: {
    path: __dirname,
    publicPath: '/index.php/jelix/www/getfile?targetmodule=mapBuilder&file=js%2F',
    chunkFilename: '[name].bundle.js',
    filename: 'mapbuilder.js'
  },
  // resolve: {
  //   modules: [
  //     path.resolve('./modules'),
  //     path.resolve('./node_modules')
  //   ]
  // },
  externals: {
      jquery: 'jQuery'
    }
};
