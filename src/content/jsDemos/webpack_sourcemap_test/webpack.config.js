var path = require('path');
var b_release_mode = false;

function test(){
    var releaseJs = [
        './js/index.js',
        './js/main.js'
    ]
    return releaseJs;
}

module.exports = {
    devtool: 'source-map',   // 生成Source Maps
    entry:{
        index: b_release_mode ? test() : ['./un_release.js'],
    },
    output: {
        filename:'[name].js',
        path: path.resolve(__dirname,'release'),
        publicPath: '/release'
    },
    devServer: {
        contentBase: "./",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true//实时刷新
    }

}