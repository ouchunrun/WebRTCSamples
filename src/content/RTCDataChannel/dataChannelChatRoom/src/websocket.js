
function getWsInstance(url, name) {
    console.log("create webSocket")
    let ws = new WebSocket('ws://localhost:8080/')  //客户端建立websocket连接
    ws.name = name ? name : randomString(8)
    console.warn("selfWsInstance name: ", ws.name)

    ws.onopen = function (event) {
        console.info('websocket onopen: ', ws)
        let data = {
            type: 'login',
            name: ws.name
        }
        console.log("send login message to server: \n", data)
        ws.send(JSON.stringify(data))
    }

    ws.onmessage = function (event){
        let message = JSON.parse(event.data)
        console.warn(ws.name + " RECV: \n", message)

        switch(message.type){
            case 'offer':
                // doAnswer(message.sdp)
                // break
            case 'answer':
                setRemote(message)
                break
            default:
                break
        }
    }
    return ws
}

// 实例1
// let localWsInstance = getWsInstance(url, userName)
// 实例2
// let wsInstance2 = getWsInstance(url, 'wsInstance2')

// let data = {s
//     action: 'offer',
//     webSocketName: wsInstance2.name
// }
// wsInstance2.send(JSON.stringify(data))

function sendToServer(data) {
    console.log("sendToServer", data)
    localWsInstance.send(JSON.stringify(data))
}



