/***
 * 变量初始化
 */
var wsSendrecv = null;
var url = "wss://xmeetings.ipvideotalk.com:443/ws";
var protocol = "wss";

var messageElem = document.getElementById('message');

/***
 * 当前时间格式化处理
 */
function formatDate(now) {
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return year + "-" + (month = month < 10 ? ("0" + month) : month) + "-" + (date = date < 10 ? ("0" + date) : date) + " " + (hour = hour < 10 ? ("0" + hour) : hour) + ":" + (minute = minute < 10 ? ("0" + minute) : minute) + ":" + (second = second < 10 ? ("0" + second) : second);
}

/***
 * 开始 webSocket 连接
 */
function addWebSocket() {
    var wsURL = document.getElementById('wsAddr').value;
    if (!wsURL) {
        console.log("use local server：ws://localhost:3000");
        wsURL = "ws://localhost:3000";
    }
    StartWebSocket(wsURL);
}

/***
 * 建立 webSocket 实例
 */
function StartWebSocket(url) {
    console.warn("Connecting to '" + url);
    wsSendrecv = new WebSocket(url);
    wsSendrecv.onopen = function (evt) {
        websocketOnOpen(evt)
    };
    wsSendrecv.onmessage = function (evt) {
        websocketOnMessage(evt)
    };
    wsSendrecv.onclose = function (evt) {
        websocketOnClose(evt)
    };
    wsSendrecv.onerror = function (evt) {
        websocketOnError(evt)
    };
}

/***
 * websocket 连接成功
 */
function websocketOnOpen() {
    writeToScreen("<span style='color:red'>连接成功，现在你可以发送信息啦！！！</span>");
}

/***
 * 收到服务器的消息
 */
function websocketOnMessage(evt) {
    writeToScreen('<span style="color:blue">服务端回应&nbsp;' + formatDate(new Date()) + '</span><br/><span class="bubble">' + evt.data + '</span>');
}

/***
 * websocket 断开连接
 */
function websocketOnClose() {
    writeToScreen("<span style='color:red'>websocket连接已断开!!!</span>");
    wsSendrecv.close();
}

/***
 * 关闭 webSocket 连接
 */
function closeWebSocket() {
    writeToScreen("<span style='color:#91580f'>websocket连接已关闭!!!</span>");
    wsSendrecv.close();
}

/***
 * websocket 发生错误
 */
function websocketOnError(evt) {
    writeToScreen('<span style="color: red;">发生错误:</span> ' + evt.data);
}

/***
 * 向服务器发送消息
 */
function sendMessage() {
    var message = messageElem.value;
    if (!message) {
        console.log("请先填写发送信息");
        messageElem.focus();
        return false;
    }
    if (!wsSendrecv) {
        console.log("websocket还没有连接，或者连接失败，请检测");
        return false;
    }
    if (wsSendrecv.readyState === 3) {
        console.log("websocket已经关闭，请重新连接");
        return false;
    }
    console.log(wsSendrecv);
    messageElem.value = " ";
    writeToScreen('<span style="color:green">你发送的信息&nbsp;' + formatDate(new Date()) + '</span><br/>' + message);
    wsSendrecv.send(message);
}

/***
 * 连接状态显示
 * @param message
 */
function writeToScreen(message) {
    var parent = document.getElementById('output');
    var newChild = document.createElement("div");
    newChild.innerHTML = message;
    parent.appendChild(newChild);
}

/***
 * 键盘按键监听
 */
document.onkeydown = function () {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        messageElem.focus();
    }

    if (event.which === 13) {
        sendMessage();
    }
}