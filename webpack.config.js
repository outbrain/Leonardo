'use strict'
var btoa = require('btoa');
module.exports = {
  entry: {
    'leonardo-api': "./src/leonardo/leonardo.ts",
    'leonardo-ui': "./src/leonardo/ui/ui-root.ts"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    publicPath: 'dist/'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: ['ts-loader']
      },
      {
        test: /\/ace.js/,
        use: [
          'script-loader'
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
    historyApiFallback: {
      index: 'examples/angularIL/index.html'
    },
    open: true,
    port: 9284,
    inline: true
  }
}

function LeonardoIframePlugin(options) {}

LeonardoIframePlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    const apiSrc = compilation.assets['leonardo-api.js'].source();
    const uiSrc = compilation.assets['leonardo-ui.js'].source();
    const leoSrc =`
        ${apiSrc}
        //UI source
        window.__leonardo_UI_src = function() { debugger;${uiSrc}};
        `;
    compilation.assets['leonardo.js'] = {
      source: function() {
        return leoSrc;
      },
      size: function() {
        return leoSrc.length;
      }
    };

    callback();
  });
};

