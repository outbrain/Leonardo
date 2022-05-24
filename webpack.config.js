const path = require('node:path');

module.exports = {
  mode: 'development',
  entry: {
    'leonardo-api': "./src/leonardo/leonardo.ts",
    'leonardo-ui': "./src/leonardo/ui/index.tsx"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: 'dist/'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
  },

  module: {
    rules: [
      {
        test: /\.ts|.tsx?$/,
        use: ['ts-loader']
      },
      {
        test: /\.gif$/,
        use: [
          "url-loader?mimetype=image/png"

        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9].[0-9].[0-9])?$/,
        use: [
          "url-loader?mimetype=application/font-woff"
        ]
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9].[0-9].[0-9])?$/,
        use: [
          "file-loader?name=[name].[ext]"
        ]
      },
      {
        test: /\.less$/,
        use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "less-loader" // compiles Less to CSS
        }]
      }
    ]
  },
  plugins: [
    new LeonardoIframePlugin()
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
    },
    open: true,
    port: 9284,
  },
};

function LeonardoIframePlugin(options) {}

LeonardoIframePlugin.prototype.apply = function(compiler) {
  compiler.hooks.compilation.tap("LeonardoIframePlugin", function(
    compilation,
    callback
  ) {
    compilation.hooks.processAssets.tap(
      {
        name: "LeonardoIframePlugin",
        stage: compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING,
      },
      (assets) => {
        // this function will be called once with assets added by plugins on prior stages
        const apiSrc = compilation.assets['leonardo-api.js'].source();
        const uiSrc = compilation.assets['leonardo-ui.js'].source();
        const leoSrc = `
            ${apiSrc}
            //UI source
            window.__leonardo_UI_src = function() { ${uiSrc}};
            `;
        assets['leonardo.js'] = {
          source: function () {
            return leoSrc;
          },
          size: function () {
            return leoSrc.length;
          }
        };
      }
    );
  });
};
