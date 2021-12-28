## 代码规范 standard 

- [Standard - JavaScript 代码规范](https://standardjs.com/readme-zhcn.html)

- 检查:
> npm test

- 自动格式化
> standard --fix

- git 添加 pre-commit
> "pre-commit": "standard --verbose | snazzy"

```
  "husky": {
    "hooks": {
      "pre-commit": "standard --verbose | snazzy"
    }
  }
```

- 格式化输出
> standard --verbose | snazzy

- WebStorm standard 配置方法：https://blog.jetbrains.com/webstorm/2017/01/webstorm-2017-1-eap-171-2272/

## 环境安装

> npm install

## 

```javascript
/**
* 下载blob
* @param allChunks blob数据（ondataavailable返回的数据）
*/
function download (allChunks) {
  const blob = new window.Blob(allChunks, { type: 'video/webm' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = Date.now() + '.webm'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 100)
}

```


## 参考

- [MultiStreamRecorder.js & MediaStreamRecorder](https://github.com/streamproc/MediaStreamRecorder)

## FAQ

-  standard 无法检查到调用的外部函数或变量

