var websocket = null;
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
    };
    
    websocket.onerror = function (event) {
        console.error(event)
        console.error("websocket onerror", event.toString());
        websocket = null;
    };
    
    websocket.onclose = function (event) {
        console.error(event)
        console.log("websocket onclose",  event.toString());
        websocket = null;
    }
    
    websocket.onmessage = function (event) {
        if (typeof(event.data) === 'string') {
            writeToScreen('<span class="recvMsg">你收到的信息: &nbsp;' + event.data + '</span><br/>');
        }
    }
}

function closeWebSocket() {
    console.warn('close websocket');
}

function sendMessage(message) {
    if (null !== websocket) {
        writeToScreen('<span class="sendMsg" >发送的信息: &nbsp;' + message + '</span><br/>');
        websocket.send(message);
    } else {
        writeToScreen('<span class="sendMsg">未建立WebSocket连接&nbsp;' + '</span><br/>');
    }
}

function sendInputMessage() {
    console.log('send message')
    var message = document.getElementById('message').value;
    sendMessage(message);
    // clear input after message send
    document.getElementById('message').value = ""
}

function writeToScreen(message) {
    var parent = document.getElementById('output');
    var newChild = document.createElement("div");
    newChild.classList.add('msg')
    newChild.innerHTML = message;
    parent.appendChild(newChild);
}

window.onload = function () {
    let wsName = localStorage.getItem('wsName')
    if(wsName){
        document.getElementById('wsAddr').value = wsName
    }
}
