let url = 'ws://localhost:8080/'
let localWsInstance
const dataChannelSend = document.getElementById('dataChannelSend');
let localPeerConnection = getConnection()
let selfName = null

window.onload = function () {
    selfName = getQueryString('username')
    console.warn("selfName: ", getQueryString('username'))
    if(selfName){
        console.log('prepare create webSocket...')
        localWsInstance = getWsInstance(url, selfName)
    }
}
/**
 * create offer
 */
function createOffer() {
    doOffer(localPeerConnection)
}

function sendMessage() {
    let data = dataChannelSend.value
    localPeerConnection.channel.send(data)
    console.log('Sent Data: ' + data);
    // let text = data + ": " + localPeerConnection.channel.label
    addElement({
        data: data,
        isSelf: true,
        name: localPeerConnection.channel.label
    })
}

