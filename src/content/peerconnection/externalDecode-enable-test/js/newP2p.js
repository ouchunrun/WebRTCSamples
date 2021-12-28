
var p2p_localVideo = document.getElementById('p2p_localVideo')
var p2p_remoteVideo = document.getElementById('p2p_remoteVideo')
var p2pLocalVideoStatsDiv = document.getElementById('p2pLocalVideoStats')
var p2premoteVideoStatsDiv = document.getElementById('p2pRemoteVideoStats')
var localPeer
var remotePeer
var P2PStatisticsInterval

var p2pEcoderImplementation = document.getElementById('p2p_encoderImplementation')
var p2pDecoderImplementation = document.getElementById('p2p_decoderImplementation')
var p2p_local_googCodecName = document.getElementById('p2p_local_googCodecName')
var p2p_remote_googCodecName = document.getElementById('p2p_remote_googCodecName')
var p2p_local_bytesSent = document.getElementById('p2p_local_bytesSent')
var p2p_remote_bytesReceived = document.getElementById('p2p_remote_bytesReceived')


/**
 * 创建新的P2P 链接
 */
function addNewP2pConnection() {
    var stream
    if(remotePeerConnection.getRemoteStreams){
        stream = remotePeerConnection.getRemoteStreams()[0]
    }

    stream = stream || targetPresentStream

    if(!stream){
        alert('remote present 不存在！！')
        return
    }
    p2p_localVideo.srcObject = stream

    localPeer = new RTCPeerConnection(null);
    remotePeer = new RTCPeerConnection(null);
    stream.getTracks().forEach(
        function(track) {
            console.log("localPeer addTack!");
            localPeer.addTrack(track, stream);
        }
    );
    console.log('localPeer creating offer');
    localPeer.onnegotiationeeded = function() {
        console.log('Negotiation needed - localPeer');
    };
    remotePeer.onnegotiationeeded = function() {
        console.log('Negotiation needed - remotePeer');
    };
    localPeer.onicecandidate = function(e) {
        console.log('Candidate localPeer');
        remotePeer.addIceCandidate(e.candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    };
    remotePeer.onicecandidate = function(e) {
        console.log('Candidate remotePeer');
        localPeer.addIceCandidate(e.candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    };
    remotePeer.ontrack = function(e) {
        console.warn("localPeer iceConnectionState: ", localPeer.iceConnectionState)
        console.warn("remotePeericeConnectionState: ", remotePeer.iceConnectionState)
        console.log('remotePeer got stream');
        p2p_remoteVideo.srcObject = e.streams[0];
    };
    localPeer.createOffer().then(
        function(desc) {
            console.log('localPeer offering');
            localPeer.setLocalDescription(desc);

            desc.sdp = setMediaBitrateAndCodecPrioritys(desc.sdp);
            console.log(`Offer from pc1 ${desc.sdp}`);
            remotePeer.setRemoteDescription(desc);
            remotePeer.createAnswer().then(
                function(desc2) {
                    console.log('remotePeer answering');
                    remotePeer.setLocalDescription(desc2);

                    desc2.sdp = setMediaBitrateAndCodecPrioritys(desc2.sdp);
                    console.warn(`Answer from pc2:\n${desc2.sdp}`);
                    localPeer.setRemoteDescription(desc2);
                },
                function(err) {
                    console.log(err);
                }
            );
        },
        function(err) {
            console.log(err);
        }
    );

    displayP2PStatistics()
}

function displayP2PStatistics(){
// Display statistics
    P2PStatisticsInterval = setInterval(function() {
        if (localPeer && remotePeer) {
            remotePeer.getStats(null).then(showP2PRemoteStats, function(err) {
                console.log(err);
            });
            localPeer.getStats(null).then(showP2PLocalStats, function(err) {
                console.log(err);
            });
        } else {
            // console.log('Not connected yet');
        }
        // Collect some stats from the video tags.
        if (p2p_localVideo.videoWidth) {
            p2pLocalVideoStatsDiv.innerHTML = '<strong>Video dimensions:</strong> ' +
            p2p_localVideo.videoWidth + 'x' + p2p_localVideo.videoHeight + 'px';
        }
        if (p2p_remoteVideo.videoWidth) {
            p2premoteVideoStatsDiv.innerHTML = '<strong>Video dimensions:</strong> ' +
            p2p_remoteVideo.videoWidth + 'x' + p2p_remoteVideo.videoHeight + 'px';
        }
    }, 1000);
}

/**
 * 发送端
 * @param results
 */
function showP2PLocalStats(results) {
    results.forEach(function(report) {
        if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            // debugger
            if(report.encoderImplementation){
                // console.warn("decoderImplementation： ", report.decoderImplementation)
                p2pEcoderImplementation.innerHTML =  '<strong>codecImplementationName:</strong> ' + report.encoderImplementation;
            }
            if(report.bytesSent){
                p2p_local_bytesSent.innerHTML = '<strong>bytesSent:</strong> ' + report.bytesSent;
            }
        }
    });
}

/**
 * 接收端
 * @param results
 */
function showP2PRemoteStats(results) {
    results.forEach(function(report) {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            if(report.decoderImplementation){
                // console.warn("decoderImplementation： ", report.decoderImplementation)
                p2pDecoderImplementation.innerHTML =  '<strong>codecImplementationName:</strong> ' + report.decoderImplementation;
            }
            if(report.bytesReceived){
                p2p_remote_bytesReceived.innerHTML = '<strong>bytesReceived:</strong> ' + report.bytesReceived;
            }
        }
    });
}

