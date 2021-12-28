function CreateWebsocket(url, protocol) {
    this.url = url;
    this.protocol = protocol || [];
    this.binaryType = "arraybuffer";
    this.reconnectAttempt = 0;      // 当前重连次数
    this.maxReconnectAttempts = 4;   // 最大重连次数
    this.keepAliveAttempt = 0;      // 当前保活次数
    this.wsKeepAliveTimer = null;    // 保活定时器
    this.wsReconnectTimer = null;    // 重连定时器
    this.ws = this.websocketInstance();
}

CreateWebsocket.prototype.websocketInstance = function () {
    var ws = null;
    try{
        ws = new WebSocket(this.url, "sip");
        console.warn("初始化");
        this.websocketInit(ws, this);
    }catch (e) {
        console.warn("重连");
        this.websocketReconnect(this);
    }
    return ws;
};


CreateWebsocket.prototype.websocketInit = function (ws, This) {
    console.warn("websocketInit");
    ws.binaryType = This.binaryType;
    ws.onopen = function () { This.websocketOpen(This); };
    ws.onerror = function (evt) { This.websocketError(evt, This); };
    ws.onclose = function(){ This.websocketClose(This); };
    ws.onmessage = function (evt) { This.websocketIncomingMessage(evt, This); }
};

CreateWebsocket.prototype.websocketOpen = function (This) {
    console.warn("websocketOpen");
    if(this.ws.readyState !== 1){
        This.websocketStop();
        return;
    }
    if(this.wsKeepAliveTimer === null){
        var data = "\r\n\r\n";
        this.wsKeepAliveTimer = setInterval( function(){ This.websocketSendMessage(data, This);}, 10000 );
    }
    console.warn("websocket connected success ...");

};

CreateWebsocket.prototype.websocketSendMessage = function(data, This){
    console.warn("websocketSendMessage");
    console.warn("data: ", data);

    if(This.ws.readyState !== 1){
        console.warn('transport has been disconnected, can not send message');
        return;
    }

    if(data === "\r\n\r\n"){
        // console.warn("keepAliveAttempt :", this.keepAliveAttempt);
        switch (this.keepAliveAttempt) {
            case 0 :
                /* 保活次数为0， 即 websokect 连接后第一次发送，5s内没有收到服务器的回复，则以5s频率发送保活包 */
                this.wsKeepAliveTimer && clearInterval( this.wsKeepAliveTimer );
                this.wsKeepAliveTimer = setInterval( function(){ This.websocketSendMessage(data, This); }, 5000 );
                this.ws.send(data);
                break;
            case 1:
                /* 保活次数为1，2.5s内没有收到服务器回复，则以2.5s 频率发送保活包，同时清除5s定时器和10s定时器 */
                this.wsKeepAliveTimer && clearInterval( this.wsKeepAliveTimer );
                this.wsKeepAliveTimer = setInterval( function(){ This.websocketSendMessage(data, This); }, 2500 );
                this.ws.send(data);
                break;
            case 2:
            case 3:
                /* 保活次数为2~3s，2.5s内没有收到服务器回复，继续以2.5s 频率发送保活包 */
                this.ws.send(data);
                break;
            case 4:
                console.warn("保活失败，重新建立新的连接！");
                /* webSocket 重发三次不成功即认为失败，断开之前的连接，重新建立新的连接 */
                this.wsKeepAliveTimer && clearInterval( this.wsKeepAliveTimer );
                this.wsKeepAliveTimer = null;

                This.websocketStop(This);
                break;
            default:
                break;
        }
        this.keepAliveAttempt = this.keepAliveAttempt + 1;
    }else {
        // REGISTER  INVITE  ACK  200OK  INFO  SIP/2.0
        console.warn("发送给服务器的保活以外的数据： ", data);
        this.ws.send(data);
    }
};

CreateWebsocket.prototype.websocketIncomingMessage = function (evt, This) {
    console.warn("websocketIncomingMessage");
    console.warn(evt.data);

    if( evt.data === "\r\n"){
        /* websocket保活包 */
        console.warn("receive websocket keep alive!!!收到保活包");
        var data = "\r\n\r\n";
        this.wsKeepAliveTimer && clearInterval(This.wsKeepAliveTimer);
        this.wsKeepAliveTimer = null;
        this.wsReconnectTimer && clearInterval(This.wsReconnectTimer);
        this.wsReconnectTimer = null;

        this.wsKeepAliveTimer = setInterval( function(){ This.websocketSendMessage(data, This); }, 10000 );
        this.keepAliveAttempt = 0;
        this.reconnectAttempt = 0;
    }else {
        console.warn("收到服务器回回来的消息。。。", evt.data);
        /***
         * REGISTER
         * INVITE
         * NOTIFY
         * INFO
         */

    }

};

CreateWebsocket.prototype.websocketReconnect = function(This){
    console.warn("websocketReconnect");
    this.wsKeepAliveTimer && clearInterval(This.wsKeepAliveTimer);
    this.wsKeepAliveTimer = null;
    this.wsReconnectTimer && clearInterval(This.wsReconnectTimer);
    this.wsReconnectTimer = null;
    console.log("this.reconnectAttempt: ", this.reconnectAttempt);
    console.log("this.maxReconnectAttempts: ", this.maxReconnectAttempts);

    if ((this.reconnectAttempt && this.maxReconnectAttempts && (this.reconnectAttempt > this.maxReconnectAttempts))) {
        console.warn("已经尝试 " + this.reconnectAttempt + " 次重连，服务器连接超时，不再重试！");
        this.ws && this.ws.close();
        this.ws = null;
    } else {
        console.log("尝试第" + this.reconnectAttempt + "次连接...");
        /* 保活失败重新建立连接 */
        this.keepAliveAttempt = 0;
        this.reconnectAttempt ++;
        this.wsReconnectTimer = setTimeout(function () { new CreateWebsocket(url, protocol); }, 10000);
    }
};

CreateWebsocket.prototype.websocketError = function (evt, This) {
    console.error("websocketError", evt.data);

};

CreateWebsocket.prototype.websocketClose = function (This) {
    console.warn("websocketClose", this);
    /* websocket异常断开，重新建立连接 */
    console.warn("websocket异常断开，重新建立连接");
    This.websocketReconnect(This);
};

CreateWebsocket.prototype.websocketStop = function (This) {
    console.warn("websocket stop ...");
    if(this.ws){
        this.ws.close();
        this.ws = null;
    }
};
