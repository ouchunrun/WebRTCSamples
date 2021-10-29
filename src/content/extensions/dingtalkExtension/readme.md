## 问题记录

### 1.chrome扩展插件拦截修改请求头：默认的请求源为chrome://extensions/，登录时请求被回复403拒绝
```
chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    details.requestHeaders.push({
            name: "Origin",    // 要修改的头域
            value: grpHost     // 设置的头域值
        });
        console.warn("details.requestHeaders:", details.requestHeaders)
        return {
            requestHeaders: details.requestHeaders
        };
    },
    {
        urls: ['<all_urls>']
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);
```

### 2.插件请求跨域问题：通过拦截修改服务器响应头，让浏览器认为服务器允许所有请求，从而避免跨域报错

```
chrome.webRequest.onHeadersReceived.addListener(details => {
        let accessControl = false
        const responseHeaders = details.responseHeaders.map(item => {
            if (item.name.toLowerCase() === 'access-control-allow-origin') {
                item.value = '*'
                accessControl = true
            }
            return item
        })
        if(!accessControl){
            responseHeaders.push({name: 'access-control-allow-origin', value: '*'})
        }
        return { responseHeaders };
    },~~~~
    {
        urls: ['<all_urls>']
    },
    ['blocking', 'responseHeaders', 'extraHeaders']
)
```

### 3. 插件通信问题

- 1. content-script主动发消息给后台
    - Error: Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
    - Cause：content_scripts向popup主动发消息的前提是popup必须打开！否则需要利用background作中转；如果background和popup同时监听，那么它们都可以同时收到消息，但是只有一个可以sendResponse，一个先发送了，那么另外一个再发送就无效；

- 2.popup页面不打开时，content-script页面与popup界面无法通信
    - Solution: 使用background.js 处理

### 呼叫分机号码401问题：请求的cookies头域中带了sid但是没有添加值，需要再请求头中手动修改


## 参考

- [chrome.webRequest](https://developer.chrome.com/docs/extensions/reference/webRequest/
