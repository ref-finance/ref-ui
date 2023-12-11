/* eslint-env node */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const { ProvidePlugin } = require('webpack');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');

// Linting and type checking are only necessary as part of development and testing.
// Omit them from production builds, as they slow down the feedback loop.
const shouldLintOrTypeCheck = !isProduction;
function getCacheDirectory(cacheName) {
  // Include the trailing slash to denote that this is a directory.
  return `${path.join(__dirname, 'node_modules/.cache/', cacheName)}/`;
}

module.exports = {
  eslint: {
    enable: false, // shouldLintOrTypeCheck
    pluginOptions(eslintConfig) {
      return Object.assign(eslintConfig, {
        cache: true,
        cacheLocation: getCacheDirectory('eslint'),
        ignorePath: '.gitignore',
        // Use our own eslint/plugins/config, as overrides interfere with caching.
        // This ensures that `yarn start` and `yarn lint` share one cache.
        eslintPath: require.resolve('eslint'),
        resolvePluginsRelativeTo: null,
        baseConfig: null,
      });
    },
  },
  typescript: {
    enableTypeChecking: false, // shouldLintOrTypeCheck
  },
  webpack: {
    alias: {
      business: process.cwd(),
      src: path.resolve('src'),
    },
    plugins: {
      add: [
        // Webpack 5 does not polyfill node globals, so we do so for those necessary:
        new ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js',
        }),
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new RetryChunkLoadPlugin({
          retryDelay: 2000,
          maxRetries: 3,
        }),
      ],
      remove: ['CaseSensitivePathsPlugin', 'IgnorePlugin'],
    },
    configure: (webpackConfig) => {
      webpackConfig.devtool = 'source-map';

      webpackConfig.optimization.splitChunks = {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-router|react-modal|react-tooltip|lodash|moment)[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 50,
            reuseExistingChunk: true,
          },
          nearWallet: {
            test: /[\\/]node_modules[\\/](@near-wallet-selector|near-api-js|@aurora-is-near)[\\/]/,
            name: 'nw',
            chunks: 'all',
            priority: 40,
            reuseExistingChunk: true,
          },
          echarts: {
            test: /[\\/]node_modules[\\/](echarts|recharts)[\\/]/,
            name: 'ec',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },

          icons: {
            test: /[\\/]src[\\/]components[\\/]icon[\\/].+\.tsx$/,
            chunks: 'all',
            priority: 20,
            name(module) {
              const moduleFileName = module
                .identifier()
                .split('/')
                .reduceRight((item) => item);
              const chunkName = moduleFileName.replace(/\.tsx$/, '');
              // console.log('chunkName', chunkName);
              return `icon-${chunkName}`;
            },
          },
        },
      };

      webpackConfig.output = Object.assign(webpackConfig.output, {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js',
        publicPath: '/',
      });

      // Configure webpack resolution:
      webpackConfig.resolve = Object.assign(webpackConfig.resolve, {
        // Webpack 5 does not resolve node modules, so we do so for those necessary:
        fallback: {
          // - react-markdown requires path
          fs: false,
          path: require.resolve('path-browserify'),
          assert: require.resolve('assert'),
          util: require.resolve('util/'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          // os: require.resolve('os-browserify/browser'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          buffer: require.resolve('buffer/'),
          events: require.resolve('events/'),
          url: require.resolve('url/'),
          zlib: require.resolve('browserify-zlib'),
        },
      });

      // Configure webpack caching:
      webpackConfig.cache = Object.assign(webpackConfig.cache, {
        cacheDirectory: getCacheDirectory('webpack'),
      });

      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      webpackConfig.module.rules = [
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false, // disable the behaviour
          },
          include: [/node_modules/],
        },
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          use: {
            loader: 'babel-loader',
          },
          include: [path.resolve('src')],
          exclude: [/node_modules/, path.resolve('src/charting_library')],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../../',
              },
            },
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../../',
              },
            },
            'css-loader',
            {
              loader: 'less-loader',
            },
          ],
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          use: {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024,
              name: 'static/images/[name].[hash:8].[ext]',
            },
          },
        },

        {
          test: /\.(eot|otf|ttf|woff|woff2)$/,
          type: 'asset',
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
        },
        {
          test: /\.(mp3|ogg|wav)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        },
      ];

      return webpackConfig;
    },
  },
};
