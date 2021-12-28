let websocket = null;
let ws_keep_timer = null
function addWebSocket() {
    let wsAddr =  document.getElementById('wsAddr').value
    if(!wsAddr){
        alert('enter ws value !')
        return
    }
    localStorage.setItem('wsName', wsAddr)
    let wsName = localStorage.getItem('wsName')
    if(wsName){
        document.getElementById('wsAddr').value = wsName
    }

    let protocols = document.getElementById('protocols').value
    if(!protocols){
        websocket = new WebSocket(wsAddr);
    }else {
        websocket = new WebSocket(wsAddr, protocols);
    }

    websocket.onopen = function () {
        console.warn("websocket onopen");
        console.warn('Connecting to ' + wsAddr)
        ws_keep_timer = setInterval(function () {
            keepAlive()
        }, 5000)
    };

    websocket.onerror = function (event) {
        console.error(event)
        console.error("websocket onerror", event.toString());
        websocket = null;
        clearInterval(ws_keep_timer)
    };

    websocket.onclose = function (event) {
        console.error(event)
        websocket = null;
        clearInterval(ws_keep_timer)
    }

    websocket.onmessage = function (event) {
        if(event.data === '\r\n'){
            // 保活包
        }else if (typeof(event.data) === 'string') {
            writeToScreen(event.data, 2);
        }
    }
}

function keepAlive() {
    let data = '\r\n\r\n'
    websocket.send(data);
}

function closeWebSocket() {
    console.warn('close websocket');
    clearInterval(ws_keep_timer)
    websocket.close()
    writeToScreen('WebSocket 已断开连接', 1);
}

function sendMessage(message) {
    if (null !== websocket) {
        writeToScreen(message, 1);
        websocket.send(message);
    } else {
        writeToScreen('未建立WebSocket连接', 1);
    }
}

function sendInputMessage() {
    console.log('send message')
    let message = document.getElementsByClassName('layui-textarea')[0].value;
    sendMessage(message);
    // clear input after message send
    message.value = ""
}

function writeToScreen(info,form) {
    let showMessage = document.getElementById('showMessage');
    let myDate = new Date();
    if(form ===1){
        info="<p><span style=\"color: #FF5722;\">您&nbsp;"+myDate.toLocaleTimeString()+"：</span><br>"+info+"</p>";
    }else{
        info="<p><span style=\"color: #5FB878;\">服务器&nbsp;"+myDate.toLocaleTimeString()+"：</span><br>"+info+"</p>";
    }
    let oldInfo = showMessage.innerHTML
    showMessage.innerHTML = info + oldInfo
}

window.onload = function () {
    let wsName = localStorage.getItem('wsName')
    if(wsName){
        document.getElementById('wsAddr').value = wsName
    }
}
