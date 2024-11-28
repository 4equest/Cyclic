import path from 'path';

module.exports = {
    entry: './src/index.ts', // TypeScriptの場合はこちらを指定
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'public/dist'), // 絶対パスに変更
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'], // 必要な拡張子を追加
    },
    devServer: {
      static: './public',
      hot: true, // ホットリロードを有効にする
      devMiddleware: {
        writeToDisk: true, // これを追加
      },
    },
  };
  