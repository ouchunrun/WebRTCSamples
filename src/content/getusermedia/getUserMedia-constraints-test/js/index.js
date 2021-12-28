/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var getMediaButton = document.querySelector('button#getMedia');
var connectButton = document.querySelector('button#connect');
var hangupButton = document.querySelector('button#hangup');

// getMediaButton.onclick = getMedia;
// connectButton.onclick = createPeerConnection;
// hangupButton.onclick = hangup;

var getUserMediaConstraintsDiv = document.querySelector('textarea#getUserMediaConstraints');
var bitrateDiv = document.querySelector('div#bitrate');
var peerDiv = document.querySelector('div#peer');
var senderStatsDiv = document.querySelector('div#senderStats');
var receiverStatsDiv = document.querySelector('div#receiverStats');

var localVideo = document.querySelector('div#localVideo video');
var remoteVideo = document.querySelector('div#remoteVideo video');
var localVideoStatsDiv = document.querySelector('div#localVideo div');
var remoteVideoStatsDiv = document.querySelector('div#remoteVideo div');

var localPeerConnection;
var remotePeerConnection;
var localStream;
var bytesPrev;
var timestampPrev;

var defaultCon = {
    audio: false,
    video: {
        // deviceId: {
        //     ideal: "CF0BEEA372B937F5649CF62B5DF2CAB79544D045"

            // chrome:
            // exact: '4b46c0218ec92c92aee8900ae76882d7d9b3cd23ce453916fccac2a734aac56d',  // Logitech Webcam C930e (046d:0843)
            // exact: 'dbc2b195d88559bda35947313fd3dd7a888bbe87602303a82b423090a4242d21'  // Aoni HD Camera (1bcf:2283)

            // firefox
            // exact: 'YCmi6k2RbwebS3+bPcGohtj1AIzopOpNMgUNBOl9pk0=',    // Logitech Webcam C930e (046d:0843)
            // exact: 'UCfVazDLpXMY7DQ1s2jUOd5Gm54SMos6kuTSPMxsFAI=',   // Aoni HD Camera (1bcf:2283)

            // // Edge
            // exact: 'D496E1A1-98DD-1ABC-3A8C-BFB41E4573F1',  // Logitech Webcam C930e (046d:0843)
            // exact: '82417060-3702-1EAE-5EEB-2D63EC01F76C'   // Aoni HD Camera (1bcf:2283)
        // },
        frameRate: {
            ideal: 15,
            max: 30
        },
        aspectRatio: {
            min: 1.777,
            max: 1.778
        },
        width: {
            ideal: 1280,
            max: 1280
        },
        height: {
            ideal: 720,
            max: 720
        },
    }
};

getUserMediaConstraintsDiv.value = JSON.stringify(defaultCon, null, '    ' );

main();

function main() {
    displayGetUserMediaConstraints();
}

function getMedia() {
    console.warn('GetUserMedia start!');
    if (localStream) {
        localStream.getTracks().forEach(function(track) {
            track.stop();
        });
        var videoTracks = localStream.getVideoTracks();
        for (var i = 0; i !== videoTracks.length; ++i) {
            videoTracks[i].stop();
        }
    }

    var constraints = getUserMediaConstraints()
    console.warn("getNewStream constraint: \n" + JSON.stringify(constraints, null, '    ') );

    navigator.getUserMedia(constraints, function (stream) {
        gotStream(stream)
    }, function (error) {
        console.error(error)
        console.warn("error.name : ", error.name);
        console.warn("error.message : ", error.message)
    })
}


function gotStream(stream) {
    var tracks = stream.getTracks();
    if(tracks && tracks.length > 0){
        console.warn('set stream onmute');
        tracks[0].onmute = null;
        tracks[0].onmute = function(event){
            console.warn("track onmute: ", event)
        };
    }else{
        console.warn('can not set stream onmute without track');
        return;
    }

    connectButton.disabled = false;
    console.warn('GetUserMedia succeeded:');
    console.warn(localVideo)
    localStream = stream;
    localVideo.srcObject = stream;
}

function getUserMediaConstraints() {
    var constraints = editGetUserMediaConstraints();
    return constraints;
}

function displayGetUserMediaConstraints() {
    var constraints = getUserMediaConstraints();
    getUserMediaConstraintsDiv.value = JSON.stringify(constraints, null, '    ');
}

function editGetUserMediaConstraints() {
    var constraints = { };
    if (getUserMediaConstraintsDiv.value) {
        constraints = JSON.parse(getUserMediaConstraintsDiv.value);
    }
    return constraints;
}


function createPeerConnection() {
    console.log("begin create peerConnections");
    console.log(localStream);
    connectButton.disabled = true;
    hangupButton.disabled = false;

    bytesPrev = 0;
    timestampPrev = 0;
    localPeerConnection = new RTCPeerConnection(null);
    remotePeerConnection = new RTCPeerConnection(null);
    localStream.getTracks().forEach(
        function(track) {
            console.log("localPeerConnection addTack!");
            localPeerConnection.addTrack(
                track,
                localStream
            );
        }
    );
    console.log('localPeerConnection creating offer');
    localPeerConnection.onnegotiationeeded = function() {
        console.log('Negotiation needed - localPeerConnection');
    };
    remotePeerConnection.onnegotiationeeded = function() {
        console.log('Negotiation needed - remotePeerConnection');
    };
    localPeerConnection.onicecandidate = function(e) {
        console.log('Candidate localPeerConnection');
        remotePeerConnection.addIceCandidate(e.candidate)
            .then(
                onAddIceCandidateSuccess,
                onAddIceCandidateError
            );
    };
    remotePeerConnection.onicecandidate = function(e) {
        console.log('Candidate remotePeerConnection');
        localPeerConnection.addIceCandidate(e.candidate)
            .then(
                onAddIceCandidateSuccess,
                onAddIceCandidateError
            );
    };
    remotePeerConnection.ontrack = function(e) {
        console.warn("localPeerConnection iceConnectionState: ", localPeerConnection.iceConnectionState)
        console.warn("remotePeerConnectioniceConnectionState: ", remotePeerConnection.iceConnectionState)
        if (remoteVideo.srcObject !== e.streams[0]) {
            console.log('remotePeerConnection got stream');
            remoteVideo.srcObject = e.streams[0];
        }
    };
    localPeerConnection.createOffer().then(
        function(desc) {
            console.log('localPeerConnection offering');
            console.log(`Offer from pc1 ${desc.sdp}`);

            localPeerConnection.setLocalDescription(desc);
            remotePeerConnection.setRemoteDescription(desc);
            remotePeerConnection.createAnswer().then(
                function(desc2) {
                    // firefox
                    var replacement = 'max-fs=3600';
                    desc2.sdp = desc2.sdp.replace(/max-fs=([a-zA-Z0-9]{3,5})/, replacement);

                    var replacement2 = 'max-fr=15';
                    desc2.sdp = desc2.sdp.replace(/max-fr=([a-zA-Z0-9]{1,3})/, replacement2);

                    // // chrome
                    // var parseSdp = SDPTools.parseSDP(desc2.sdp)
                    // SDPTools.removeCodecByPayload(parseSdp, 0, [97, 98, 99 ,100, 101, 122, 127 ,121, 125 ,107, 108, 109, 124, 120 ,123, 119, 114 ,115, 116])
                    // desc2.sdp = SDPTools.writeSDP(parseSdp)
                    //
                    // var replacement3 = 'profile-level-id=420016';
                    // desc2.sdp = desc2.sdp.replace(/profile-level-id=([a-zA-Z0-9]{6})/, replacement3);
                    // desc2.sdp = desc2.sdp + 'a=imageattr:102 send [x=1920,y=1080] recv [x=1280,y=720]\n'

                    console.log('remotePeerConnection answering');
                    console.log(`Answer from pc2:\n${desc2.sdp}`);
                    
                    remotePeerConnection.setLocalDescription(desc2);
                    localPeerConnection.setRemoteDescription(desc2);
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
}

function onAddIceCandidateSuccess() {
    console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    console.log('Failed to add Ice Candidate: ' + error.toString());
}


function hangup() {
    console.log('Ending call');
    localPeerConnection.close();
    remotePeerConnection.close();
    window.location.reload();

    // query stats one last time.
    Promise.all([
        remotePeerConnection.getStats(null)
            .then(showRemoteStats, function(err) {
                console.log(err);
            }),
        localPeerConnection.getStats(null)
            .then(showLocalStats, function(err) {
                console.log(err);
            })
    ]).then(() => {
        localPeerConnection = null;
        remotePeerConnection = null;
    });

    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localStream = null;

    hangupButton.disabled = true;
    getMediaButton.disabled = false;
}

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

// Dumping a stats variable as a string.1
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

