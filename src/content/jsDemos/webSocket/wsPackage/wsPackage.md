
```javascript
    var websocket=new WebClient();//实例化对象
```


1、连接
可通过调用websocket对象中connect方法进行连接，如方法：connect(url,msgbak,openbak,errorbak,closebak)

- url表示连接地址，必须以ws://开头的连接,如：ws://localhost:8080/HTML5WebSocekt/websocket
- msgbak表示回调函数，就是当网络上有数据时，会自动调用此回调函数
- openbak表示回调函数，就是当网络连接成功时，会自动调用此回调函数
- errorbak表示回调函数，就是当网络连接异常时，会自动调用此回调函数
- closebak表示回调函数，就是当网络关闭连接时，会自动调用此回调函数

如以下四个函数，可通过：websocket.connect("ws://localhost:8080/HTML5WebSocekt/websocket",onMessage,onOpen,onError,onClose);进行连接

```javascript
    function onMessage(data) {
    document.getElementById('messages').innerHTML+= '<br />' + data;
    }
    function onOpen(event) {
    document.getElementById('messages').innerHTML = '连接成功';
    }
    
    
    function onClose() {
    document.getElementById('messages').innerHTML+= '<br />' + "关闭连接";
    }
    function onError(event) {
    document.getElementById('messages').innerHTML+= '<br />' + "连接异常";
    }

```

2、判断是否连接
    - 可通过websocket对象中 isConn()方法来判断连接，返回true表示已连接，返回false表示未连接


3、发送数据
    - 可通过websocket对象中sendData()方法来发送数据，如：websocket.sendData('hello');


4、关闭连接
    - 可通过websocket对象中close()方法来断开连接，如：websocket.close();

```javascript
    function SendData() {
    websocket.sendData('hello');
    }
    
    function Connect()
    {
    var url="ws://localhost:8080/HTML5WebSocekt/websocket";
    websocket.connect(url,onMessage,onOpen,onError,onClose);
    }
    function Close() {
    websocket.close();
    }
```


## 参考

- http://www.zhuzhusoft.com/article.php?id=281