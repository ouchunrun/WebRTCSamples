
## 运行

1、安装webpack

```
npm install -g webpack    // 全局安装
npm install webpack --save-dev  // 局部安装
npm install webpack-cli --save-dev  // webpack 4.x以上需要安装
```

2、webpack构建本地服务器

```
npm install --save-dev webpack-dev-server
```

3、运行

```
webpack

npm run server
```



## 实践过程

1、新建测试DEMO，目录如下：

```
--|webpack_sourceMap_test
--|--|js
--|--|--|index.js
--|--|--|main.js
--|--|release
--|index.html
```

添加内容：

```
// index.js
var div = document.createElement("div");
div.innerHTML = '<a href="http://www.baidu.com/"><img style="max-width:100%;" src="https://www.baidu.com/img/baidu_jgylogo3.gif"></a>';
div.style.textAlign="center";
document.body.insertBefore(div, document.body.firstElementChild);



// main.js
var div = document.createElement("div");
div.innerHTML = '<a href="http://www.baidu.com/"><img style="max-width:100%;" src="http://www.google.cn/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"></a>';
div.style.textAlign="center";
document.body.insertBefore(div, document.body.firstElementChild);



// index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>webpack source map test</title>
</head>
<body>
    <h1>webpack source map test</h1>
    <script src="./release/index.js"></script>
</body>
</html>

```
这里你可能会比较奇怪，release路径下并没有index.js，为什么会在页面里添加这个路径？这里先保留，后面会讲解。



2、命令行进入webpack_sourceMap_test目录，进行初始化操作，生成package.json，命令如下：
```
npm init
```

3、安装webpack
```
npm install -g webpack    // 全局安装
npm install webpack --save-dev  // 局部安装
npm install webpack-cli --save-dev  // webpack 4.x以上需要安装
```

到这里，文件应该有了node_modules文件夹，也有了package.json文件。


4、webpack构建本地服务器

安装
```
npm install --save-dev webpack-dev-server
```



5、在根目录下新建配置文件 webpack.config.js，并添加配置信息：

```
var path = require('path');
var b_release_mode = true;     // 是否压缩？

var releaseJs = [
    './js/index.js',
    './js/main.js'
]

module.exports = {
    devtool: 'source-map',   // 生成Source Maps
    entry:{   // 入口文件
        index: b_release_mode ? releaseJs : ['./un_release.js'],
    },
    output: {   // 出口文件  
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
```

6、根目录下新建un_release.js文件，添加如下内容：
```

var b_release_mode = false;
var Style_Domain = "http://localhost:8080/";
function add_js_scripts(s_elt) {
    var tag_hdr = document.getElementsByTagName(s_elt)[0];
    for (var i = 1; i < arguments.length; ++i) {
        var tag_script = document.createElement('script');
        tag_script.setAttribute('type', 'text/javascript');
        tag_script.setAttribute('src',Style_Domain + arguments[i] + "?svn=224");
        tag_hdr.appendChild(tag_script);
    }
};

add_js_scripts('head',
    'js/index.js',
    'js/main.js',
);

```

7、package.json添加：
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack -p",
    "start": "webpack -p",
    "server": "webpack-dev-server --open"
  },
```

8、最后，运行

先打包：
```
webpack  
```

完整的目录应该是这样的：
![1.png](https://i.loli.net/2019/03/18/5c8f0b896daf6.png)


可以看到，运行webpack命令之后，release下面自动生成了index.js和index.js.map文件，这两个就是打包后输入的文件。


启动本地服务：
```
npm run server    
```

成功后是这样的：

![2.png](https://i.loli.net/2019/03/18/5c8f0b8988a80.png)

界面的显示是这样的：

![3..png](https://i.loli.net/2019/03/18/5c8f0b898fc71.png)

b_release_mode 是用来判断打包的时候使用压缩脚本还是非压缩脚本，true则为压缩，false则为非压缩。因为前面webpack.config.js设置了 b_release_mode 变量为true，所以这里打包的时候也是用了压缩脚本，上面的界面显示也能看到，页面加载了release下的index.js文件。


为了看一下sourcemap是否有用，我在index里面添加错误脚本，看看报错情况，如下：

![4.png](https://i.loli.net/2019/03/18/5c8f0b898abc5.png)

能够正确显示错误行，sourcemap让代码在压缩情况下也能够正常很好的调试。




修改 b_release_mode 值，重新打包，运行，结果是这样的：
![5..png](https://i.loli.net/2019/03/18/5c8f0b89a261e.png)