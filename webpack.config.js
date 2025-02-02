module.exports = {
    mode: 'development', // or 'production'
    // other webpack configuration options

      module: {
        rules: [
          {
            test: /\.json$/,
            loader: 'json-loader',
            type: 'javascript/auto', // or 'json'
          },
        ],
      },
  };