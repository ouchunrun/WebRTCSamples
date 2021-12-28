// DOM references
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('screenShare');
const switchPresentButton = document.getElementById('switchPresentWidthNewSdp');
const replaceTrackOnly = document.getElementById('switchPresentReplaceTrackOnly');
let remotePeerConnection, localPeerConnection, localStream;
let screen_constraints = {
    audio: false,
    video: true
};


startCallButton.addEventListener('click', initScreenShare);
switchPresentButton.addEventListener('click', switchPresentSource);
replaceTrackOnly.addEventListener('click', switchPresentWithOnlyReplaceTrack);

// 添加/删除流的通用处理函数
function processStream(currentPeerConnection, stream, isAddStream) {
    if(isAddStream){
        console.warn("add stream!");
        if(currentPeerConnection.getTransceivers().length > 0){
            if (!RTCRtpTransceiver.prototype.setDirection){
                console.warn("use replaceTrack");
                currentPeerConnection.getTransceivers()[0].direction = 'sendonly';
                currentPeerConnection.getTransceivers()[0].direction = 'inactive';

                currentPeerConnection.getSenders()[0].replaceTrack(stream.getTracks()[0]);
                console.warn("set direction to sendrecv");
                currentPeerConnection.getTransceivers()[0].direction = 'sendrecv';
            }else{
                currentPeerConnection.getTransceivers()[0].setDirection('sendrecv');
            }
        }else {
            console.warn("use addStream");
            currentPeerConnection.addStream(stream);
        }
    }else {
        console.warn("remove stream!");
        if(currentPeerConnection.getTransceivers().length > 0) {
            if (!RTCRtpTransceiver.prototype.setDirection) {
                console.warn("use replaceTrack");
                currentPeerConnection.getTransceivers()[0].direction = 'sendonly';
                currentPeerConnection.getTransceivers()[0].direction = 'inactive';

                currentPeerConnection.getTransceivers()[0].direction = 'recvonly';
                currentPeerConnection.getSenders()[0].replaceTrack(null);
            } else {
                currentPeerConnection.getTransceivers()[0].setDirection('recvonly');
            }
        }else {
            console.warn("use removeStream");
            currentPeerConnection.removeStream(stream);
        }
    }
}

// 切换演示源，只进行replaceTrack操作;
function switchPresentWithOnlyReplaceTrack() {
    navigator.mediaDevices.getDisplayMedia(screen_constraints)
        .then(function (stream) {
            if(localStream){
                localPeerConnection.onnegotiationneeded = function(){
                    console.warn("localPeerConnection.onnegotiationneeded trigger ...");
                };
                localPeerConnection.getSenders()[0].replaceTrack(stream.getTracks()[0]);
                localPeerConnection.getTransceivers()[0].direction = 'sendonly';
            }else {
                localPeerConnection.addStream(stream);
            }
        })
        .catch(function (error) {
            console.error(error.toString());
        });
}

// 切换演示源，重新生成sdp
function switchPresentSource() {
    navigator.mediaDevices.getDisplayMedia(screen_constraints)
        .then(function (stream) {
            if(localStream){
                console.log("new present stream: ", stream);
                function switchPresentationSourceRemoveStreamOnNegotiationNeeded() {
                    console.warn("onnegotiationneeded trigger with replaceTrack remove stream!");

                    function switchPresentationSourceAddStreamOnNegotiationNeeded() {
                        console.warn("onnegotiationneeded trigger with replaceTrack add stream!");
                        if(localPeerConnection.getSenders().length > 0){
                            console.log("begin createOffer...");
                            localPeerConnection.createOffer(gotLocalDescription, handleError);
                        }
                    }
                    localPeerConnection.onnegotiationneeded = switchPresentationSourceAddStreamOnNegotiationNeeded;
                    processStream(localPeerConnection, stream, true);
                    localVideo.srcObject = stream;
                }

                localPeerConnection.onnegotiationneeded = switchPresentationSourceRemoveStreamOnNegotiationNeeded;
                processStream(localPeerConnection, localStream, false);
            }
        })
        .catch(function (error) {
            console.error(error.toString());
        });
}

// 桌面演示
function initScreenShare() {
    navigator.mediaDevices.getDisplayMedia(screen_constraints)
        .then(function (stream) {
            window._stream = stream;
            console.log('MediaStream obtained and stored to window._stream', stream);
            localVideo.srcObject = stream;
            localStream = stream;
            console.log(
                'MediaStream assigned as srcObject of videoElement', localVideo
            );
            call();
        })
        .catch(function (error) {
            console.error(error.toString());
        });
}


function call() {
    trace("Starting call");
    if (localStream.getVideoTracks().length > 0) {
        trace('Using video device: ' + localStream.getVideoTracks()[0].label);
    }
    if (localStream.getAudioTracks().length > 0) {
        trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
    }


    localPeerConnection = new RTCPeerConnection();
    trace("Created local peer connection object localPeerConnection");
    localPeerConnection.onicecandidate = gotLocalIceCandidate;

    remotePeerConnection = new RTCPeerConnection();
    trace("Created remote peer connection object remotePeerConnection");
    remotePeerConnection.onicecandidate = gotRemoteIceCandidate;


    remotePeerConnection.onaddstream = gotRemoteStream;
    remotePeerConnection.ontrack = gotRemoteStream;
    processStream(localPeerConnection, localStream, true);

    trace("Added localStream to localPeerConnection");
    localPeerConnection.createOffer().then(gotLocalDescription, handleError)
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

function handleError(error) {
    trace(error);
}

function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}


/*显示统计信息*/
var bitrateDiv = document.querySelector('div#bitrate');
var peerDiv = document.querySelector('div#peer');
var bytesPrev;
var timestampPrev;
var senderStatsDiv = document.querySelector('div#senderStats');
var receiverStatsDiv = document.querySelector('div#receiverStats');
var localVideoStatsDiv = document.querySelector('div#localVideoResolution');
var remoteVideoStatsDiv = document.querySelector('div#remoteVideoResolution');

function showRemoteStats(results) {
    var statsString = dumpStats(results);

    receiverStatsDiv.innerHTML = '<h2>Receiver stats</h2>' + statsString;
    // calculate video bitrate
    results.forEach(function(report) {
        var now = report.timestamp;

        var bitrate;
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            var bytes = report.bytesReceived;
            if (timestampPrev) {
                bitrate = 8 * (bytes - bytesPrev) / (now - timestampPrev);
                bitrate = Math.floor(bitrate);
            }
            bytesPrev = bytes;
            timestampPrev = now;
        }
        if (bitrate) {
            bitrate += ' kbits/sec';
            bitrateDiv.innerHTML = '<strong>Bitrate:</strong> ' + bitrate;
        }
    });

    // figure out the peer's ip
    var activeCandidatePair = null;
    var remoteCandidate = null;

    // Search for the candidate pair, spec-way first.
    results.forEach(function(report) {
        if (report.type === 'transport') {
            activeCandidatePair = results.get(report.selectedCandidatePairId);
        }
    });
    // Fallback for Firefox and Chrome legacy stats.
    if (!activeCandidatePair) {
        results.forEach(function(report) {
            if (report.type === 'candidate-pair' && report.selected ||
                report.type === 'googCandidatePair' &&
                report.googActiveConnection === 'true') {
                activeCandidatePair = report;
            }
        });
    }
    if (activeCandidatePair && activeCandidatePair.remoteCandidateId) {
        remoteCandidate = results.get(activeCandidatePair.remoteCandidateId);
    }
    if (remoteCandidate) {
        if (remoteCandidate.ip && remoteCandidate.port) {
            peerDiv.innerHTML = '<strong>Connected to:</strong> ' +
                remoteCandidate.ip + ':' + remoteCandidate.port;
        } else if (remoteCandidate.ipAddress && remoteCandidate.portNumber) {
            // Fall back to old names.
            peerDiv.innerHTML = '<strong>Connected to:</strong> ' +
                remoteCandidate.ipAddress +
                ':' + remoteCandidate.portNumber;
        }
    }
}

function showLocalStats(results) {
    var statsString = dumpStats(results);
    senderStatsDiv.innerHTML = '<h2>Sender stats</h2>' + statsString;
}
// Display statistics
setInterval(function() {
    if (localPeerConnection && remotePeerConnection) {
        remotePeerConnection.getStats(null)
            .then(showRemoteStats, function(err) {
                console.log(err);
            });
        localPeerConnection.getStats(null)
            .then(showLocalStats, function(err) {
                console.log(err);
            });
    } else {
        console.log('Not connected yet');
    }
    // Collect some stats from the video tags.
    if (localVideo.videoWidth) {
        localVideoStatsDiv.innerHTML = '<strong>Video dimensions:</strong> ' +
            localVideo.videoWidth + 'x' + localVideo.videoHeight + 'px';
    }
    if (remoteVideo.videoWidth) {
        remoteVideoStatsDiv.innerHTML = '<strong>Video dimensions:</strong> ' +
            remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight + 'px';
    }
}, 1000);

// Dumping a stats variable as a string.
// might be named toString?
function dumpStats(results) {
    var statsString = '';
    results.forEach(function(res) {
        statsString += '<h3>Report type=';
        statsString += res.type;
        statsString += '</h3>\n';
        statsString += 'id ' + res.id + '<br>\n';
        statsString += 'time ' + res.timestamp + '<br>\n';
        Object.keys(res).forEach(function(k) {
            if (k !== 'timestamp' && k !== 'type' && k !== 'id') {
                statsString += k + ': ' + res[k] + '<br>\n';
            }
        });
    });
    return statsString;
}