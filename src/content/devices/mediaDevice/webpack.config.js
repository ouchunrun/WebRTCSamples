module.exports = {
  devtool: 'source-map', // “__dirname”是node.js中的一个全局变量，它指向当前执行脚本所在的目录。
  entry: __dirname.join('/src/mediaDevice/mediaDevice.mediaDevice'), // 入口文件
  output: {
    path: __dirname.join('/release'), // 打包后的文件存放的地方
    filename: 'bundle.mediaDevice'// 打包后输出文件的文件名
  },
  devServer: {
    contentBase: './public', // 本地服务器所加载的页面所在的目录
    historyApiFallback: true, // 不跳转，针对单页开发比较有用
    inline: true, // 实时刷新
    port: 8080 // 可以不写，默认8080
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env', 'react'
            ]
          }
        },
        exclude: /node_modules/
      }
    ]
  }
}
