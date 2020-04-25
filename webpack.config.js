const path = require('path');

module.exports = {
  entry: './client/',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  devServer: {
    // contentBase: path.resolve(__dirname, "build")
    publicPath: "/build/",
    port: 8080,
    proxy: {
      '/': {
        target: 'http://localhost:3000',
        secure: false,
      }
    },
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
}
