## 重构

- 现在的做法：webSocket把所有消息抛给SIP处理
- 重构：webSocket 自己处理收到的消息，通过正则匹配不同的事件，调用不同回调
    - 匹配关键点（类型等）
    - 调用的回调
    - 避免头域过重的overHead问题，后续考虑使用JSON格式传输。
    
- 传输层和信令层分开
- SIP 后续考虑使用别的，如C编译的JS，使用webWorker



## webSocket 流程：

- 创建实例，建立连接 （protocol、url）
  
- 连接成功，发送数据：
    - 保活数据包 (`data == "\r\n\r\n"`)
    - 真实数据 message(INVITE NOTIFIED INFO ...)

- webSocket 重连场景：
    - websocket 保活失败重新建立连接
    - websocket异常断开，重新建立连接
    - 说明：三次重连不成功就表示重连失败
    
- 收到的 webSocket 消息：
    - 保活数据包 (`data == "\r\n"`)
    - 其他数据 (INVITE NOTIFIED INFO ...)
    

## webSocket 收发消息类型


### 客户端和服务器发送消息常用的方法:

| Method   | isUse      | target        |
|----------|------------|---------------|
| MESSAGE  | never meet |               |
| INFO     | use        | client/server |
| OPTIONS  | never meet |               |
| REGISTER | use        | client        |
| INVITE   | use        | client/server |
| NOTIFY   | use        | client/server |

注：如有遗漏，欢迎补充！


### 客户端和服务器发送回复对照示例：

| Client 发送       | CSeq           | Server 发送       | CSeq           |
|-------------------|----------------|-------------------|----------------|
| REGISTER          | 20319 REGISTER | 401 Unauthorized  | 20319 REGISTER |
| REGISTER          | 20320 REGISTER | 200 OK            | 20320 REGISTER |
| INVITE            | 52266 INVITE   | 100 trying        | 52266 INVITE   |
| ---               | ---            | 200 OK            | 52266 INVITE   |
| ACK               | 52266 INVITE   | ---               | ---            |
| ---               | ---            | NOTIFY            | 1000 NOTIFY    |
| 200 OK            | 1000 NOTIFY    | ---               | ---            |
| INFO              | 52267 INFO     | 200 OK            | 52267 INFO     |
| ---               | ---            | INVITE            | 105 INVITE     |
| 100 trying        | 105 INVITE     | ---               | ---            |
| 200 OK            | 105 INVITE     | ---               | ---            |
| ---               | ---            | ACK               | 105 ACK        |


## 保活定时器设计

- websocket向k服务器发起保活的行为：

    - websocket发送 `\r\n\r\n` 的text包给K服务器，K服务器回复 `\r\n`，
    - 浏览器没有提供ping，pong的接口，目前只能通过text包发送给K服务器

- webSocket保活重连设置表

| webSocket保活重连设置 | 说明                                                   |
|-----------------------|--------------------------------------------------------|
| 保活定时器             | 收到服务器发送的保活包重置，收到服务器发送的保活包重置 |
| webSocket重连         | 活失败后进行webSocket重连，重连三次不成功即认为失败    |
     

### 逻辑实现：

- 在websocket的open接口（表示websocket连接成功）开启10秒的间隔定时器（setInterval），发送内容为 `\r\n\r\n` 的保活包;

- 如果重连次数为0，且5s之内没有收到服务器的回复，则按照5s的频率发送﻿保活包 `\r\n\r\n`

- 如果重连次数为1，且2.5s之内没有收到服务器的回复，则按照2.5s的频率发送﻿保活包 `\r\n\r\n`， 此时清除之前的10s间隔定时器

- 如果重连次数为2或3，且2.5s之内没有收到服务器的回复，还是按照2.5s的频率发送﻿保活包 `\r\n\r\n`

- 保活包发送累计4次仍没有收到服务器的回复则认为websocket timeout，然后启动重连websocket机制，建立新的连接；

- 如果在重连或发送过程种收到服务器回复，清除当前保活定时器，继续发送10s间隔的保活包；

- 重连三次不成功即认为失败


### 代码分析

```
/* __tsip_transport_ws_onopen 
 * 设置10s定时发送机制
 */
 if(this.o_transport.ws_keep_timer == null){
    transportlog.info("ws_keep_timer");
    var data = "\r\n\r\n";
    clearInterval(this.o_transport.ws_keep_timer);
    this.o_transport.ws_keep_timer = setInterval( function(){__tsip_transport_ws_send(o_self, data);}, 10000 );
}
    

/* __tsip_transport_ws_send 
 * 保活重连
 */
 if( o_data === "\r\n\r\n" ) {
    if(o_self.ws_keep_flag === 0) {       
        o_self.keep_reconnect_timer = setInterval( function(){__tsip_transport_ws_send(o_self,o_data);}, 5000 );
        o_self.o_ws.send(o_data);
    }
    if(o_self.ws_keep_flag === 1) {   
        clearInterval( o_self.ws_keep_timer );
        o_self.ws_keep_timer = null;
        clearInterval( o_self.keep_reconnect_timer );
        o_self.keep_reconnect_timer = setInterval( function(){__tsip_transport_ws_send(o_self,o_data);}, 2500 );
        o_self.o_ws.send(o_data);
    }
    if( o_self.ws_keep_flag === 2 || o_self.ws_keep_flag === 3 ) {  
        o_self.o_ws.send(o_data);
    }
    if( o_self.ws_keep_flag === 4 ) {    
        if(o_self.keep_reconnect_timer) {
            clearInterval( o_self.keep_reconnect_timer );
            o_self.keep_reconnect_timer = null;
        }
        transportlog.warn('wss failed to keep alive'); 
        o_self.ws_keep_flag = 0;
        o_self.b_started = false;
        __tsip_transport_ws_stop(o_self);
        /* 保活失败重新建立连接 */
        __tsip_transport_ws_re_connect(o_self);
    }
    o_self.ws_keep_flag++;
}


/* __tsip_transport_ws_onmessage 
 * 收到服务器回的消息，清除定时器
 */
 if( evt.data == "\r\n"){   
    /* websocket保活包 */
    var o_self = this.o_transport;
    var data = "\r\n\r\n";
    transportlog.info("receive websocket keep alive!!!");
    clearInterval( this.o_transport.keep_reconnect_timer );
    this.o_transport.keep_reconnect_timer = null;
    clearInterval( this.o_transport.ws_keep_timer );
    this.o_transport.ws_keep_timer = setInterval( function(){__tsip_transport_ws_send(o_self, data);}, 10000 );
    this.o_transport.ws_keep_flag = 0;
}

```


### webSocket 保活重连流程图

![webSocket保活.png](https://i.loli.net/2019/06/20/5d0b49425618253369.png)


## 参考

- https://www.html5rocks.com/en/tutorials/websockets/basics/
- https://zhuanlan.zhihu.com/p/23467317