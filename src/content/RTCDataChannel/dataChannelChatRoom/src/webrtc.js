let role = 'offer'
let receiveChannel


/**
 * 创建DataChannel
 * @param pc
 * @param channelName
 */
function getDataChannel(pc, channelName) {
    let name = channelName ? channelName: 'sendDataChannel'
    let channel = pc.createDataChannel(name);

    channel.onopen = function () {
        console.warn("channel onopen!", channel.label)
    };

    channel.onclose = function (error) {
        console.error("channel onclose: ", error)
        channel.close()
    };

    channel.onmessage = function (data) {
        console.warn("receiveChannel name: ", channel.label)
        console.warn('DataChannel Received Message',  data);
        // let text = event.channel.label + ": " + event.data
        addElement({
            data: event.data,
            isSelf: false,
            name: event.channel.label
        })
    }

    return channel
}

/**
 * ice 收集完成后发送sdp
 * @param pc
 */
function onIceGatheringCompleted(pc) {
    console.warn("onIceGatheringCompleted!")

    let data = {
        name: pc.myUsername,
        target: (!role || role === 'offer') ? 'wsInstance2' : 'wsInstance1',
        type: role,
        sdp: pc.localDescription
    }
    sendToServer(data);
}

function onReceiveChannelStateChange() {
    try {
        const readyState = localConnection.readyState;
        console.log(`Receive channel state is: ${readyState}`);
    }catch (e) {
        console.error(e.toString())
    }
}

/**
 * 创建新的Connection
 */
function getConnection() {
    let myUsername = getQueryString('username')
    console.log('create new PeerConnection, set myUsername ', myUsername)

    const servers = null;
    let pc = new RTCPeerConnection(servers)
    pc.myUsername = myUsername
    // pc.channel = pc.createDataChannel(pc.myUsername);
    pc.channel = getDataChannel(pc, pc.myUsername)

    pc.ondatachannel = function (event) {
        console.log('Data channel is created: ', event.channel.label);
        event.channel.onopen = function() {
            console.log('Data channel is open and ready to be used.');
            const readyState = event.channel.readyState;
            console.log('Send channel state is: ' + readyState);
        };

        event.channel.onclose = onReceiveChannelStateChange

        event.channel.onmessage = function (message) {
            console.warn(message)
            console.warn("label不正确: ", message.target.label)
            console.warn('DataChannel Received Message:',  message.data);
            // let text = event.channel.label + ": " + event.data
            addElement({
                data: message.data,
                isSelf: false,
                name: event.channel.label
            })
        };
    }
    
    pc.onicecandidate = function (event) {
        var iceState = pc.iceGatheringState
        if(event.candidate){
            console.info('Generated ICE candidate' + event.candidate.candidate);
        }else if (iceState === 'complete' || (event && !event.candidate)) {
            console.info('onIceCandidate: ICE GATHERING COMPLETED( PC: ' + pc.myUsername + ' )')
            onIceGatheringCompleted(pc)
        } else if (iceState === 'failed') {
            console.error('onIceCandidate: ice state is failed')
            return false
        }
    }

    pc.onsignalingstatechange = function (){
        console.info('onSignalingStateChange type: ' + pc.type + ', signalingState: ' + pc.onsignalingstatechange)
    }

    pc.onicegatheringstatechange = function(){
        console.info('onSignalingStateChange type: ' + pc.type + ', signalingState: ' + pc.onicegatheringstatechange)
    }

    pc.oniceconnectionstatechange = function(){
        console.info('onSignalingStateChange type: ' + pc.type + ', signalingState: ' + pc.oniceconnectionstatechange)
    }

    pc.onconnectionstatechange = function (event){
        console.info('onSignalingStateChange type: ' + pc.type + ', signalingState: ' + pc.onconnectionstatechange)
    }

    return pc
}

function doOffer(pc) {
    pc.offerConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
    }

    if (pc.signalingState !== 'stable') {
        console.info("Dropping of creating of offer as signalingState is not "+ pc.signalingState);
        return;
    }

    console.info('create offer')
    pc.createOffer(createOfferSuccess, createOfferFailed, pc.offerConstraints);

    function createOfferSuccess(offer){
        console.warn('sessionJsep: createOfferSuccess');
        pc.setLocalDescription(offer, setLocalDescriptionSuccess, setLocalDescriptionFailed);
    }

    function setLocalDescriptionFailed(s_error){
        console.error("sessionJsep setLocalDescriptionFailed: \n" + s_error);
    }

    function createOfferFailed(error){
        console.error("sessionJsep createOfferFailed: \n" + error);
    }

    function setLocalDescriptionSuccess(){
        console.warn("sessionJsep: setLocalDescriptionSuccess");
    }
}

function doAnswer(pc) {
    pc.offerConstraints = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
    }

    if (pc.signalingState !== 'stable') {
        console.info("Dropping of creating of offer as signalingState is not "+ pc.signalingState);
        return;
    }

    console.info('create offer')
    pc.createAnswer().then(createAnswerSuccess).catch(createAnswerFailed);

    function createAnswerSuccess(offer){
        console.warn('sessionJsep: createOfferSuccess');
        pc.setLocalDescription(offer, setLocalDescriptionSuccess, setLocalDescriptionFailed);
    }

    function setLocalDescriptionFailed(s_error){
        console.error("sessionJsep setLocalDescriptionFailed: \n" + s_error);
    }

    function createAnswerFailed(error){
        console.error("sessionJsep createOfferFailed: \n" + error);
    }

    function setLocalDescriptionSuccess(){
        console.warn("sessionJsep: setLocalDescriptionSuccess");
    }
}

function setRemote(data) {
    let desc = data.sdp
    console.log(`sdp from remote: \n`, desc.sdp);

    function setRemoteDescriptionFailed(error){
        console.error("sessionJsep createOfferFailed: \n" + error);
    }

    function setRemoteDescriptionSuccess(){
        console.warn("sessionJsep: setRemoteDescriptionSuccess");
    }

    localPeerConnection.setRemoteDescription(desc).then(setRemoteDescriptionSuccess).catch(setRemoteDescriptionFailed);

    if(desc.type === 'offer'){
        role = 'answer'
        doAnswer(localPeerConnection)
    }else if(desc.type === 'answer'){
        role = 'offer'
    }
}
