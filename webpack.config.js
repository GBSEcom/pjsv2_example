const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const envData = require('./env');

const makeHtmlPlugin = (env) => {
  const cfg = {
    inject: 'body',
  };

  cfg.filename = path.join(__dirname, 'build/public/index.' + env + '.html');
  cfg.template = 'src/client/index.html';
  cfg.chunks = ['vendor', 'common', 'pjs2'];

  cfg.CONTENT_URL = `https://docs.paymentjs.firstdata.com/lib/${env}`;
  cfg.VERSION = '2.0.0';
  cfg.PJS2_ENV = env;

  return new HtmlWebpackPlugin(cfg);
};

const clientPlugins = ['stg', 'qa', 'uat', 'prod'].map(makeHtmlPlugin);
clientPlugins.push(
    new CopyWebpackPlugin([
      { from: 'src/client/css', to: path.join(__dirname, 'build/public/css') },
      { from: 'src/client/fonts', to: path.join(__dirname, 'build/public/fonts') },
      { from: 'src/client/favicon.ico', to: path.join(__dirname, 'build/public/favicon.ico') },
    ]),
);

const common = {
  devtool: 'inline-source-map',
  mode: 'development',
  resolve: {
    extensions: ['.js', '.ts'],
    modules: [path.resolve(__dirname), 'node_modules'],
  },
  context: path.join(__dirname),
};

const frontend = {
  mode: common.mode,
  target: 'web',
  devtool: common.devtool,
  context: common.context,
  entry: {
    pjs2: [path.resolve(__dirname, 'src/client/index.ts')],
  },
  output: {
    path: path.join(__dirname, 'build/public/js'),
    filename: '[name].js',
    publicPath: '/public/js',
  },
  resolve: {
    extensions: common.resolve.extensions,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: 'tsconfig.client.json',
          ignoreDiagnostics: [2686, 2339, 2304],
          useBabel: true,
          babelCore: "@babel/core"
        },
        exclude: [path.resolve(__dirname, 'src/server')]
      }
    ],
  },
  plugins: clientPlugins,
};

const backend = {
  mode: common.mode,
  target: 'node',
  context: common.context,
  entry: {
    app: [path.resolve(__dirname, 'src/server/index.ts')],
  },
  output: {
    path: path.join(__dirname, 'build/'),
    filename: 'server.js',
  },
  resolve: common.resolve,
  externals: [
    nodeExternals(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: 'tsconfig.server.json',
          ignoreDiagnostics: [2686, 2339, 2304]
        },
        include: [path.resolve(__dirname, 'src')],
        exclude: ['/node_modules/', path.resolve(__dirname, 'src/client')]
      },
    ],
  },
  plugins: [
  ],
};

module.exports = [ frontend, backend ];
