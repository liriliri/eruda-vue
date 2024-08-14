const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const webpack = require('webpack')
const path = require('path')
const pkg = require('./package.json')
const classPrefix = require('postcss-class-prefix')
const TerserPlugin = require('terser-webpack-plugin')

const banner = pkg.name + ' v' + pkg.version + ' ' + pkg.homepage

module.exports = (env, argv) => {
  const config = {
    devtool: 'source-map',
    entry: './src/index.js',
    devServer: {
      static: {
        directory: path.join(__dirname, './'),
      },
      port: 8080,
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules/,
    },
    resolve: {
      extensions: ['.js'],
      fallback: {
        path: require.resolve('path-browserify'),
      },
      alias: {
        '@front': '@vue-devtools/app-frontend/src',
        '@back': '@vue-devtools/app-backend-core/lib',
        '@utils': '@vue-devtools/shared-utils/lib',
      }
    },
    output: {
      path: __dirname,
      filename: 'eruda-vue.js',
      publicPath: '/assets/',
      library: ['erudaVue'],
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime'],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    postcss.plugin('postcss-namespace', function () {
                      // Add '.dev-tools .tools ' to every selector.
                      return function (root) {
                        root.walkRules(function (rule) {
                          if (!rule.selectors) return rule

                          rule.selectors = rule.selectors.map(function (
                            selector
                          ) {
                            return '.dev-tools .tools ' + selector
                          })
                        })
                      }
                    }),
                    classPrefix('eruda-'),
                    autoprefixer,
                  ],
                },
              },
            },
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [new webpack.BannerPlugin(banner)],
  }

  if (argv.mode === 'production') {
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
    }
  }

  return config
}
