const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const HtmlWebpackTemplate = require('html-webpack-template');
const poststylus = require('poststylus');
const autoprefixer = require('autoprefixer');

exports.indexTemplate = function indexTemplate(options) {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        template: HtmlWebpackTemplate,
        title: options.title,
        appMountId: options.appMountId,
        inject: false,
      }),
    ],
  };
};

exports.loadJSX = function loadJSX(include) {
  return {
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          // Enable caching for extra performance
          loaders: ['babel?cacheDirectory'],
          include,
        },
      ],
    },
  };
};

exports.loadIsparta = function loadIsparta(include) {
  return {
    module: {
      preLoaders: [
        {
          test: /\.(js|jsx)$/,
          loaders: ['isparta'],
          include,
        },
      ],
    },
  };
};

exports.lintJSX = function lintJSX(include) {
  return {
    module: {
      preLoaders: [
        {
          test: /\.(js|jsx)$/,
          loaders: ['eslint'],
          include,
        },
      ],
    },
  };
};

exports.enableReactPerformanceTools = function enableReactPerformanceTools() {
  return {
    module: {
      loaders: [
        {
          test: require.resolve('react'),
          loader: 'expose?React',
        },
      ],
    },
  };
};

exports.devServer = function devServer(options) {
  const ret = {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,
      inline: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port, // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true,
      }),
    ],
  };

  if (options.poll) {
    ret.watchOptions = {
      // Delay the rebuild after the first change
      aggregateTimeout: 300,
      // Poll using interval (in ms, accepts boolean too)
      poll: 1000,
    };
  }

  return ret;
};

exports.setupCSS = function setupCSS(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.styl/,
          loaders: ['style', 'css', 'stylus'],
          include: paths,
        },
      ],
    },
    stylus: {
      use: [
        poststylus(['autoprefixer']),
      ],
    },
  };
};

exports.minify = function minify() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ],
  };
};

exports.setFreeVariable = function setFreeVariable(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env),
    ],
  };
};

exports.extractBundle = function extractBundle(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting.
    entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest'],

        // options.name modules only
        minChunks: Infinity,
      }),
    ],
  };
};

exports.clean = function clean(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd(),
      }),
    ],
  };
};

exports.extractCSS = function extractCSS(paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.styl/,
          loader: ExtractTextPlugin.extract('style', 'css!stylus-loader'),
          include: paths,
        },
      ],
    },
    stylus: {
      use: [
        poststylus(['autoprefixer']),
      ],
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css'),
    ],
  };
};

exports.npmInstall = function npmInstall(options) {
  options = options || {};

  return {
    plugins: [
      new NpmInstallPlugin(options),
    ],
  };
};
