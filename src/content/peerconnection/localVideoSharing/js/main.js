let localVideo = document.getElementById('localVideo');
let remoteVideo = document.getElementById('remoteVideo');
let uploadFile = document.getElementById("uploadFile");
let localInfo = document.getElementById('localInfo');
let fileURL = "";

let stream;
let pc1;
let pc2;
let offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
let startTime;
let getUserMediaConstraintsDiv = document.querySelector('div#getUserMediaConstraints');
let widthInput = document.querySelector('div#setWidth input');
let heightInput = document.querySelector('div#setHeight input');
let frameRateInput = document.querySelector('div#frameRate input');
let constraints = {};

widthInput.onclick =
    heightInput.onclick =
        frameRateInput.onclick =  displayRangeValue;

main();

function main() {
    displayGetUserMediaConstraints();
}

function displayGetUserMediaConstraints() {
    constraints = getUserMediaConstraints();
    console.log('getUserMedia constraints', constraints);
    getUserMediaConstraintsDiv.textContent = JSON.stringify(constraints, null, '    ');
};

function getUserMediaConstraints() {
    constraints.video = {};
    constraints.audio = true;

    if (widthInput.value !== '0') {
        constraints.video.width = widthInput.value;
    }
    if (heightInput.value !== '0') {
        constraints.video.height = heightInput.value;
    }

    if (frameRateInput.value !== '0') {
        constraints.video.frameRate = frameRateInput.value;
    }
    return constraints;
}

function displayRangeValue(e) {
    console.log("displayRangeValue console.log");
    let span = e.target.parentElement.querySelector('span');
    span.textContent = e.target.value;
    displayGetUserMediaConstraints();
}

uploadFile.addEventListener("change", function () {
    trace("uploadFile is change!");
    let file = null;
    try {
        file = uploadFile.files[0];
        fileURL = window.URL.createObjectURL(file);

        let typeJudge = file.type.split("/")[0];
        if (typeJudge === "audio" || typeJudge === "video") {
            localVideo.src = fileURL;
        } else {
            console.log("please upload video or audio");
        }
    } catch (e) {
        console.log(e.message);
    }
});

function maybeCreateStream() {
    if (localVideo.captureStream) {
        stream = localVideo.captureStream(5);
        console.log('Captured stream from localVideo with captureStream', stream);
        call(stream);
    } else if (localVideo.mozCaptureStream) {    // firefox
        stream = localVideo.mozCaptureStream(5);
        console.log('Captured stream from localVideo with mozCaptureStream()', stream);
        call(stream);
    } else {
        trace('captureStream() not supported');
    }
}

// oncanplay 事件在用户可以开始播放视频/音频（audio/video）时触发。
// readyState 表示请求在发送中或响应已完成
localVideo.oncanplay = maybeCreateStream;
if (localVideo.readyState >= 3) {
    maybeCreateStream();
}
localVideo.play();


function getcanvasStream() {
    var cavansElement = document.getElementById('canvasEl')
    var stream = cavansElement.captureStream(5);
    call(stream)
}

function call(stream) {
    trace('Starting call');
    if (stream) {
        stream.getVideoTracks()[0].applyConstraints(constraints).then(
            function () {
                console.warn("Apply MediaTrackConstraints: ", JSON.stringify(constraints, null, ' '));
            }
        ).catch(
            function (error) {
                console.log("Can not Apply MediaTrackConstraints: " + error);
            }
        );
    }

    startTime = window.performance.now();

    let servers = null;
    pc1 = new RTCPeerConnection(servers);
    trace('Created local peer connection object pc1');
    pc1.onicecandidate = function (e) {
        onIceCandidate(pc1, e);
    };
    pc2 = new RTCPeerConnection(servers);
    trace('Created remote peer connection object pc2');
    pc2.onicecandidate = function (e) {
        onIceCandidate(pc2, e);
    };

    pc1.oniceconnectionstatechange = function (e) {
        onIceStateChange(pc1, e);
    };
    pc2.oniceconnectionstatechange = function (e) {
        onIceStateChange(pc2, e);
    };
    pc2.ontrack = gotRemoteStream;
    stream.getTracks().forEach(
        function (track) {
            pc1.addTrack(
                track,
                stream
            );
        }
    );
    trace('Added local stream to pc1');
    trace('pc1 createOffer start');
    pc1.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError, offerOptions);
}

function onCreateSessionDescriptionError(error) {
    trace('Failed to create session description: ' + error.toString());
}

function onCreateOfferSuccess(desc) {
    trace('Offer from pc1\n' + desc.sdp);
    trace('pc1 setLocalDescription start');
    pc1.setLocalDescription(desc, function () {
        onSetLocalSuccess(pc1);
    }, onSetSessionDescriptionError);
    trace('pc2 setRemoteDescription start');
    pc2.setRemoteDescription(desc, function () {
        onSetRemoteSuccess(pc2);
    }, onSetSessionDescriptionError);
    trace('pc2 createAnswer start');
    pc2.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
    trace(getName(pc) + ' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
    trace(getName(pc) + ' setRemoteDescription complete');
}

function onSetSessionDescriptionError(error) {
    trace('Failed to set session description: ' + error.toString());
}

function gotRemoteStream(event) {
    if (remoteVideo.srcObject !== event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
        console.log('pc2 received remote stream', event);
    }
}

function onCreateAnswerSuccess(desc) {
    trace('Answer from pc2:\n' + desc.sdp);
    trace('pc2 setLocalDescription start');
    pc2.setLocalDescription(desc, function () {
        onSetLocalSuccess(pc2);
    }, onSetSessionDescriptionError);
    trace('pc1 setRemoteDescription start');
    pc1.setRemoteDescription(desc, function () {
        onSetRemoteSuccess(pc1);
    }, onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
    getOtherPc(pc).addIceCandidate(event.candidate)
        .then(
            function () {
                onAddIceCandidateSuccess(pc);
            },
            function (err) {
                onAddIceCandidateError(pc, err);
            }
        );
    trace(getName(pc) + ' ICE candidate: \n' + (event.candidate ?
        event.candidate.candidate : '(null)'));
}

function onAddIceCandidateSuccess(pc) {
    trace(getName(pc) + ' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
    trace(getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
    if (pc) {
        trace(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
        console.log('ICE state change event: ', event);
    }
}

function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}

/*****************************************************************************/
let senderStatsDiv = document.querySelector('div#senderStats');
let receiverStatsDiv = document.querySelector('div#receiverStats');
let txStatsDiv = document.querySelector('div#txStats');
let rxStatsDiv = document.querySelector('div#rxStats');

setInterval(function () {   // 定时获取SDP信息
    if(pc2 && pc2.getRemoteStreams()[0]){   // 连接已经建立
        // 获取远端
        pc2.getStats(null, remoteGetStatsSuccessCallBack, getStatsError);

        // 获取本地
        pc1.getStats(null, localGetStatsSuccessCallBack, getStatsError);
    }
},1000);

function remoteGetStatsSuccessCallBack(results) {
    let detailInfoString = detailInfo(results);
    let partInfoString = partInfo(results);
    receiverStatsDiv.innerHTML = "<h2>Receiver stats</h2>" + detailInfoString;
    rxStatsDiv.innerHTML = "<h2>Receiver mainly stats</h2>" + partInfoString;
}

function localGetStatsSuccessCallBack(results) {
    let detailInfoString = detailInfo(results);
    let partInfoString = partInfo(results);
    senderStatsDiv.innerHTML = '<h2>Sender stats</h2>' + detailInfoString;
    txStatsDiv.innerHTML = '<h2>Sender mainly stats</h2>' + partInfoString;
}

function detailInfo(results) {
    // 详细信息
    let detailInfoString = '';
    Object.keys(results).forEach(function (key, index) {
        let res = results[key];
        detailInfoString += '<h3>Report ';
        detailInfoString += index;
        detailInfoString += '</h3>\n';
        detailInfoString += 'time ' + res.timestamp + '<br>\n';
        detailInfoString += 'type ' + res.type + '<br>\n';
        Object.keys(res).forEach(function (k) {
            if (k !== 'timestamp' && k !== 'type') {
                detailInfoString += k + ': ' + res[k] + '<br>\n';
            }
        });
        detailInfoString += '<hr>';
    });
    return detailInfoString;
}

function partInfo(results) {
    // 部分信息
    let statsString = '';
    let framerate = 'NaN';
    let bytes = 'NaN';
    let packets = 'NaN';
    let height = 'NaN';
    let width = 'NaN';

    Object.keys(results).forEach(function (key, index) {
        let res = results[key];

        if (adapter.browserDetails.browser == "firefox") {
            if (key.match(/outbound_rtp_video_[\d.]+/)) {
                Object.keys(res).forEach(function (k) {
                    //Local video sent
                    if (k == 'framerateMean') {
                        framerate = Math.round(res[k]);
                    } else if (k == 'bytesSent') {
                        bytes = res[k];
                    } else if (k == 'packetsSent') {
                        packets = res[k];
                    }
                });
            } else if (key.match(/inbound_rtp_video_[\d.]+/)) {
                Object.keys(res).forEach(function (k) {
                    //Local video received
                    if (k == 'framerateMean') {
                        framerate = Math.round(res[k]);
                    } else if (k == 'bytesReceived') {
                        bytes = res[k];
                    } else if (k == 'packetsReceived') {
                        packets = res[k];
                    }
                });
            }
        } else {
            if (res.type == 'ssrc' && res['googFrameHeightReceived'] != undefined) {
                Object.keys(res).forEach(function (k) {
                    //Local video received
                    if (k == 'googFrameRateReceived') {
                        framerate = res[k];
                    } else if (k == 'bytesReceived') {
                        bytes = res[k];
                    } else if (k == 'packetsReceived') {
                        packets = res[k];
                    }else if(k == 'googFrameHeightSent'){
                        height = res[k];
                        if(height == 'undefined'){
                            height = res[googFrameHeightReceived];
                        }
                    }else if(k == 'googFrameWidthSent'){
                        width = res[k];
                        if(width == "undefined"){
                            width = res[googFrameWidthReceived];
                        }
                    }
                });
            } else if (res.type == 'ssrc' && res['googFrameHeightSent'] != undefined) {
                Object.keys(res).forEach(function (k) {
                    //Local video sent
                    if (k == 'googFrameRateSent') {
                        framerate = res[k];
                    } else if (k == 'bytesSent') {
                        bytes = res[k];
                    } else if (k == 'packetsSent') {
                        packets = res[k];
                    }else if(k == 'googFrameHeightSent'){
                        height = res[k];
                        if(height == 'undefined'){
                            height = res[googFrameHeightReceived];
                        }
                    }else if(k == 'googFrameWidthSent'){
                        width = res[k];
                        if(width == "undefined"){
                            width = res[googFrameWidthReceived];
                        }
                    }
                });
            }
        }
    });
    statsString += 'FrameRate: ' + framerate + '<br>\n';
    statsString += 'Height: ' + height + '<br>\n';
    statsString += 'Width: ' + width + '<br>\n';
    statsString += 'Bytes: ' + bytes + '<br>\n';
    statsString += 'Packets: ' + packets + '<br>\n';
    return statsString;
}

function getStatsError(error){
    console.log(error);
}
