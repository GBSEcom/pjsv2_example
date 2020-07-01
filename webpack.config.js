const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const makeHtmlPlugin = (env) => {
  const cfg = {
    inject: 'body',
  };

  cfg.filename = path.join(__dirname, 'build/public/index.' + env + '.html');
  cfg.template = 'src/client/index.html';
  cfg.chunks = ['vendor', 'common', 'pjs2'];

  cfg.CONTENT_URL = `https://lib.paymentjs.firstdata.com/${env}`;
  cfg.VERSION = '2.0.0';
  cfg.PJS2_ENV = env;

  return new HtmlWebpackPlugin(cfg);
};

const clientPlugins = ['uat', 'prod'].map(makeHtmlPlugin);
clientPlugins.push(
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'src/client/css',
        to: path.join(__dirname, 'build/public/css'),
      },
      {
        from: 'src/client/fonts',
        to: path.join(__dirname, 'build/public/fonts'),
      },
      {
        from: 'src/client/favicon.ico',
        to: path.join(__dirname, 'build/public/favicon.ico'),
      },
    ]
  }),
);

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  context: path.join(__dirname),
  entry: {
    pjs2: [path.resolve(__dirname, 'src/client/index.ts')],
  },
  output: {
    path: path.join(__dirname, 'build/public/js'),
    filename: '[name].js',
    publicPath: '/public/js',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: 'tsconfig.client.json',
          useBabel: true,
          babelCore: "@babel/core"
        },
        exclude: [path.resolve(__dirname, 'src/server')]
      }
    ],
  },
  plugins: clientPlugins,
};
