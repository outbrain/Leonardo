module.exports = {
  entry: "./src/leonardo/leonardo.ts",
  output: {
    path: __dirname + "/dist",
    filename: "leonardo.js",
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
  devServer: {
    historyApiFallback: {
      index: 'examples/angularIL/index.html'
    },
    open: true,
    port: 9284,
    inline: true
  }
}
