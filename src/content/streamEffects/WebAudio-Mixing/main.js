let localStream, localPeerConnection, remotePeerConnection;

let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");

let startButton = document.getElementById("startButton");
let callButton = document.getElementById("callButton");
let hangupButton = document.getElementById("hangupButton");
let mute_micStream = document.getElementById("mute_micStream");
let mute_uploadStream = document.getElementById("mute_uploadStream");
let unmute_micStream = document.getElementById("unmute_micStream");
let unmute_uploadStream = document.getElementById("unmute_uploadStream");

startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
mute_micStream.disabled = true;
mute_uploadStream.disabled = true;
unmute_micStream.disabled = true;
unmute_uploadStream.disabled = true;

startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

let conostraints = {video: true, audio: true};
let destination_participant1;

function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}


/* 文件上传 */
let uploadFile = document.getElementById("uploadFile");
let uploadVideo = document.getElementById('uploadVideo');
let fileURL;
let uploadStream = undefined;

uploadFile.addEventListener("change", function () {
    let file = null;
    try {
        file = uploadFile.files[0];
        fileURL = window.URL.createObjectURL(file);
        console.log(fileURL);   // blob:http://localhost:63342/25902f2c-4e57-4c56-b8c5-2bfe024acb36

        let typeJudge = file.type.split("/")[0];
        if (typeJudge === "audio" || typeJudge === "video") {
            uploadVideo.src = fileURL;
            uploadStream = uploadVideo.captureStream();
        } else {
            console.log("please upload video or audio");
        }
    } catch (e) {
        console.log(e.message);
    }
});

/**************************************************************/
let source1,
    source2;

window.AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext);
if(window.AudioContext) {
    context = new window.AudioContext();
} else {
    console.error('not support web audio api');
}


function handleSuccess(stream) {
    trace("Received local stream");
    callButton.disabled = false;
    localStream = stream;
    localVideo.srcObject = stream;
}

function handleError(error) {
    console.log("catch an error: ", error);
}

function start() {
    trace("Requesting local stream");
    startButton.disabled = true;
    navigator.mediaDevices.getUserMedia(conostraints).then(handleSuccess).catch(handleError);
}


/*
* P2P建立
* *************************************************************/
function call() {
    trace("Starting call");
    callButton.disabled = true;
    hangupButton.disabled = false;
    mute_micStream.disabled = false;
    mute_uploadStream.disabled = false;

    /* 混音 */
    destination_participant1 = context.createMediaStreamDestination();
    source1 = context.createMediaStreamSource(localStream);
    source1.connect(destination_participant1);
    if(uploadStream != undefined){
        source2 =  context.createMediaStreamSource( uploadStream );
        source2.connect(destination_participant1);
    }

    if (localStream.getVideoTracks().length > 0) {
        trace('Using video device: ' + localStream.getVideoTracks()[0].label);
    }
    if (localStream.getAudioTracks().length > 0) {
        trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
    }

    var servers = { };

    localPeerConnection = new RTCPeerConnection(servers);//offer方
    trace("Created local peer connection object localPeerConnection");
    localPeerConnection.onicecandidate = gotLocalIceCandidate;//offer方发送ICE  ==> 传输方式

    remotePeerConnection = new RTCPeerConnection(servers);//answer方
    trace("Created remote peer connection object remotePeerConnection");
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;//answer方发送ICE  ==> 传输方式

    // /*
    // * 通道复用
    // * 之前发送stream1，现在要求发送stream2的情况下
    // * *************************************************************/
    // localPeerConnection.onnegotiationneeded = function(){
    //     if(localPeerConnection.getSenders().length > 0){
    //         remotePeerConnection.onaddstream = gotRemoteStream;
    //         localPeerConnection.createOffer(gotLocalDescription, handleError);
    //         // localPeerConnection.setLocalDescription();
    //         // localPeerConnection.setRemoteDescription();
    //         localPeerConnection.onnegotiationneeded = null;
    //     } else{
    //         localPeerConnection.addStream(destination_participant1.stream);
    //         // remotePeerConnection.onaddstream = gotRemoteStream;
    //     }
    // };
    // localPeerConnection.removeStream(destination_participant1.stream);

    /* *************************************************************/

    remotePeerConnection.onaddstream = gotRemoteStream;//设置视频流

    localPeerConnection.addStream(destination_participant1.stream);
    trace("Added localStream to localPeerConnection");
    localPeerConnection.createOffer(gotLocalDescription, handleError);
}

function gotLocalDescription(description) {
    localPeerConnection.setLocalDescription(description);
    trace("Offer from localPeerConnection: \n" + description.sdp);
    remotePeerConnection.setRemoteDescription(description);
    remotePeerConnection.createAnswer(gotRemoteDescription, handleError);
}

function gotRemoteDescription(description) {
    remotePeerConnection.setLocalDescription(description);
    trace("Answer from remotePeerConnection: \n" + description.sdp);
    localPeerConnection.setRemoteDescription(description);
}

function gotRemoteStream(event) {
    remoteVideo.srcObject = event.stream;
    trace("Received remote stream");
}

function gotLocalIceCandidate(event) {
    if (event.candidate) {
        remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));//answer方接收ICE
        trace("Local ICE candidate: \n" + event.candidate.candidate);
    }
}

function gotRemoteIceCandidate(event) {
    if (event.candidate) {
        localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));//offer方接收ICE
        trace("Remote ICE candidate: \n " + event.candidate.candidate);
    }
}

function hangup() {
    trace("Ending call");
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
}

/*
* 设置mic和视频单独静音
* *************************************************************/
mute_micStream.onclick = function (obj) {
    // 设置mic静音
    for ( let i = 0; i < localStream.getAudioTracks().length; i++ ) {
        localStream.getAudioTracks()[i].enabled = false;
    }
    unmute_micStream.disabled = false;
};

unmute_micStream.onclick = function (obj) {
    // 设置mic不静音
    for ( let i = 0; i < localStream.getAudioTracks().length; i++ ) {
        localStream.getAudioTracks()[i].enabled = true;
    }
    mute_micStream.disabled = false;
};

mute_uploadStream.onclick = function (obj) {
    for ( let i = 0; i < uploadStream.getAudioTracks().length; i++ ) {
        uploadStream.getAudioTracks()[i].enabled = false;
    }
    unmute_uploadStream.disabled = false;
};

unmute_uploadStream.onclick = function (obj) {
    for ( let i = 0; i < uploadStream.getAudioTracks().length; i++ ) {
        uploadStream.getAudioTracks()[i].enabled = true;
    }
    mute_uploadStream.disabled = false;
};