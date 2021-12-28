
// 引入ws server
let WebSocketServer = require('ws').Server
// 创建webSocket server 实例
let server = new WebSocketServer({ port: 8080 })
let clients
let currentWsObj = []

server.on('connection', function (ws) {
    clients = server.clients

    ws.on('message', function (message) {
        console.log(`[SERVER] recv message: ${message}`);
        let data;
        try {
            data = JSON.parse(message);
            let currentWsName = data.name
            let targetWsName = data.target
            let targetWsInstance
            switch(data.type){
                case 'login':
                    console.log(`[SERVER] recv Login message: ${message}`);
                    console.log('[SERVER] webSocketName: ', currentWsName)
                    if(currentWsName){
                        currentWsObj[currentWsName] = ws
                        console.log("save webSocket instance!")
                    }else {
                        console.log("current connection webSocket name is not exist!")
                    }
                    break
                case 'offer':
                case 'answer':
                    console.log(`[SERVER] recv offer/answer message: ${message}`);
                    console.log('targetWsName ', targetWsName)
                    if(targetWsName){
                        targetWsInstance = currentWsObj[targetWsName]
                    }else {
                        console.log("current connection webSocket name is not exist!")
                    }
                    if (targetWsInstance) {
                        let message = {
                            type: data.type,
                            sdp: data.sdp,
                            name: targetWsInstance.name
                        }
                        targetWsInstance.send(JSON.stringify(message), (err) => {
                            if (err) {
                                console.log(`[SERVER] error: ${err}`);
                            }
                        });
                    }
                    break
                case 'message':

                    break
                case "sendFile":

                    break;
                case "sendFilesSuccess":

                    break
                default:
                    break
            }

        } catch (error) {
            console.log(`[SERVER] error: ${error}`);
        }
    })
    ws.on('close',function () {
        console.log('断开连接...')
    })

})

console.log("webSocket server is running: ws://localhost:8080/");

