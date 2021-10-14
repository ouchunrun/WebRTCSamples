
let connectButton = document.querySelector('button#connect');
let hangupButton = document.querySelector('button#hangup');

let local_framesPerSecond = document.querySelector('div#local_framesPerSecond');
let remote_framesPerSecond = document.querySelector('div#remote_framesPerSecond');
let send_packetsLost = document.querySelector('div#send_packetsLost')
let recv_packetsLost = document.querySelector('div#recv_packetsLost')
let bitrateDiv = document.querySelector('div#bitrate');
let peerDiv = document.querySelector('div#peer');
let senderStatsDiv = document.querySelector('div#senderStats');
let receiverStatsDiv = document.querySelector('div#receiverStats');

let localVideo = document.querySelector('div#localVideo video');
let remoteVideo = document.querySelector('div#remoteVideo video');
let localVideoStatsDiv = document.querySelector('div#localVideo div');
let remoteVideoStatsDiv = document.querySelector('div#remoteVideo div');

let localPeerConnection;
let remotePeerConnection;
let localStream;
let bytesPrev;
let timestampPrev;
let videoType = ''

let selectObj = document.getElementById('rembAndTransportCC')
let rembAndTransportCCEnabled = true

function setXGoogleSelect(){
    let selectedIndex = selectObj.selectedIndex
    let selectOption = selectObj.options[selectedIndex]
    let xGoogleSelect = document.getElementsByClassName('x-google-set')[0]
    if(selectOption.value === 'false'){
        xGoogleSelect.style.display = 'none'
        rembAndTransportCCEnabled = false
    }else {
        xGoogleSelect.style.display = 'block'
        rembAndTransportCCEnabled = true
    }
}

/************************************************* 取流部分 *************************************************************/

function getVideoMedia() {
    console.info('gum start!');
    closeStream()
    let constraints = {
        audio: false,
        video: {
            width: {max: 1920},
            height: {max: 1080},
            frameRate: { max: 5 }
        }
    }
    console.warn("getNewStream constraint: \n" + JSON.stringify(constraints, null, '    ') );
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream){
        console.warn('get local media stream success: ' , stream.id);
        connectButton.disabled = false;
        localStream = stream;
        localVideo.srcObject = stream;
        videoType = 'main'
    }).catch(function(e) {
        console.error(e)
        console.warn("getUserMedia failed!");
        let message = 'getUserMedia error: ' + e.name + '\n' + 'PermissionDeniedError may mean invalid constraints.';
        console.warn(message);
    });
}

function getScreenCapture(){
    let constraints = {
        audio: true,
        video: {
            width: { max: 1920 },
            height: { max: 1080 },
            frameRate: { max: 5 }
        }
    }
    navigator.mediaDevices.getDisplayMedia(constraints).then(function (stream){
        console.warn('get local media stream success: ' , stream.id);
        connectButton.disabled = false;
        localStream = stream;
        localVideo.srcObject = stream;
        videoType = 'slides'
    }).catch(function(e) {
        console.error(e)
        console.warn("getUserMedia failed!");
        let message = 'getUserMedia error: ' + e.name + '\n' + 'PermissionDeniedError may mean invalid constraints.';
        console.warn(message);
    });
}

function closeStream() {
    console.log("clear stream first")
    // clear first
    let stream = localVideo.srcObject
    if (stream){
        try {
            stream.oninactive = null;
            let tracks = stream.getTracks();
            for (let track in tracks) {
                tracks[track].onended = null;
                console.info("close stream");
                tracks[track].stop();
            }
        }
        catch (error) {
            console.info('closeStream: Failed to close stream');
            console.error(error);
        }
        stream = null;
        localVideo.srcObject = null
    }

    if (localStream) {
        localStream.getTracks().forEach(function(track) {
            track.stop();
        });
        let videoTracks = localStream.getVideoTracks();
        for (let i = 0; i !== videoTracks.length; ++i) {
            videoTracks[i].stop();
        }
    }
}

/************************************************* 创建p2p连接 *************************************************************/

async function createPeerConnection() {
    console.info("begin create peerConnections");
    connectButton.disabled = true;
    hangupButton.disabled = false;

    bytesPrev = 0;
    timestampPrev = 0;
    localPeerConnection = new RTCPeerConnection(null);
    remotePeerConnection = new RTCPeerConnection(null);

    if(localStream){
        localStream.getTracks().forEach(
            function(track) {
                console.info("localPeerConnection addTack!");
                localPeerConnection.addTrack(track, localStream);
            }
        );
    }

    console.info('localPeerConnection creating offer');
    localPeerConnection.onnegotiationeeded = function() {
        console.info('Negotiation needed - localPeerConnection');
    };
    remotePeerConnection.onnegotiationeeded = function() {
        console.info('Negotiation needed - remotePeerConnection');
    };
    localPeerConnection.onicecandidate = function(e) {
        console.info('Candidate localPeerConnection');
        remotePeerConnection.addIceCandidate(e.candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    };
    remotePeerConnection.onicecandidate = function(e) {
        console.info('Candidate remotePeerConnection');
        localPeerConnection.addIceCandidate(e.candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    };

    remotePeerConnection.ontrack = function(e) {
        if (remoteVideo.srcObject !== e.streams[0]) {
            console.info('remotePeerConnection got stream ' + e.streams[0].id);
            remoteVideo.srcObject = e.streams[0];
        }
    };

    try {
        let offer = await localPeerConnection.createOffer()
        console.info('localPeerConnection createOffer success');
        await localPeerConnection.setLocalDescription(offer)
        console.info('localPeerConnection setLocalDescription success, sdp: \r\n', offer.sdp);

        let maxBitRate = parseInt(document.getElementById('maxBitrate').value)
        if(maxBitRate){
            setEncodingParameters(localPeerConnection, videoType, maxBitRate)
        }

        console.log('decorate local offer sdp')
        offer.sdp = commonDecorateLo(offer.sdp)

        console.warn(`remotePeerConnection setRemoteDescription : \n${offer.sdp}`);
        await remotePeerConnection.setRemoteDescription(offer)
        console.info('remotePeerConnection setRemoteDescription success')


        // TODO: create offer process
        let answer = await remotePeerConnection.createAnswer()
        console.info('remotePeerConnection setLocalDescription: \n', answer.sdp);
        await remotePeerConnection.setLocalDescription(answer)
        console.info('remotePeerConnection setLocalDescription success')

        console.log('decorate local answer sdp')
        answer.sdp = decorateSdp(answer.sdp)
        console.warn(`localPeerConnection setRemoteDescription:\n${answer.sdp}`);
        await localPeerConnection.setRemoteDescription(answer)
        console.info('localPeerConnection setRemoteDescription success')
    }catch (e){
        console.error(e.message)
        console.error(e)
    }
}

function onAddIceCandidateSuccess() {
    console.info('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    console.info('Failed to add Ice Candidate: ' + error.toString());
}

function hangup() {
    console.info('Ending call');
    localPeerConnection.close();
    remotePeerConnection.close();

    // query stats one last time.
    Promise.all([
        remotePeerConnection.getStats(null).then(showRemoteStats, function(err) {console.info(err);}),
        localPeerConnection.getStats(null).then(showLocalStats, function(err) {console.info(err);})
    ]).then(() => {
        localPeerConnection = null;
        remotePeerConnection = null;
    });

    localStream.getTracks().forEach(function(track) {track.stop();});
    localStream = null;
    hangupButton.disabled = true;

    clearInterval(statisticsInterval)

    window.location.reload();
}

/**
 * show peer status
 * @param results
 */
function showRemoteStats(results) {
    let statsString = dumpStats(results);

    receiverStatsDiv.innerHTML = '<h2>Receiver stats</h2>' + statsString;
    // calculate video bitrate
    results.forEach(function(report) {
        if(report.framesPerSecond){
            remote_framesPerSecond.innerHTML = '<strong>framesPerSecond:</strong> ' + report.framesPerSecond;
        }
        if(report.framerateMean){
            remote_framesPerSecond.innerHTML = '<strong>framerateMean:</strong> ' + report.framerateMean;
        }
        if(report.packetsLost){
            recv_packetsLost.innerHTML = '<strong style="color: red;">Recv packetsLost:</strong> ' + report.packetsLost;
        }

        let now = report.timestamp;
        let bitrate;
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            let bytes = report.bytesReceived;
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
    let activeCandidatePair = null;
    let remoteCandidate = null;

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
    let statsString = dumpStats(results);
    senderStatsDiv.innerHTML = '<h2>Sender stats</h2>' + statsString;

    results.forEach(function(report) {
        if(report.framesPerSecond){
            local_framesPerSecond.innerHTML = '<strong>framesPerSecond:</strong> ' + report.framesPerSecond;
        }
        if(report.framerateMean){
            local_framesPerSecond.innerHTML = '<strong>framerateMean:</strong> ' + report.framerateMean;
        }

        if(report.packetsLost){
            send_packetsLost.innerHTML = '<strong style="color: red;">Send packetsLost:</strong> ' + report.packetsLost;
        }
    });
}

// Display statistics
let statisticsInterval = setInterval(function() {
    if (localPeerConnection && remotePeerConnection) {
        remotePeerConnection.getStats(null)
            .then(showRemoteStats, function(err) {
                console.info(err);
            });
        localPeerConnection.getStats(null)
            .then(showLocalStats, function(err) {
                console.info(err);
            });
    } else {
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

// Dumping a stats letiable as a string.
// might be named toString?
function dumpStats(results) {
    let statsString = '';
    results.forEach(function(res) {
        if(res.type === 'outbound-rtp' || res.type === 'remote-inbound-rtp' || res.type === 'inbound-rtp' || res.type === 'remote-outbound-rtp'){
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
        }else {

        }
    });
    return statsString;
}
