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

getMediaButton.onclick = getMedia;
connectButton.onclick = createPeerConnection;
hangupButton.onclick = hangup;

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
var localReplace = "a=fmtp:107 profile-level-id=42C02A;packetization-mode=1;level-asymmetry-allowed=1";
var remoteReplace = "a=fmtp:107 profile-level-id=42C02A;packetization-mode=1;level-asymmetry-allowed=1";

// sel local profile level
var localLevel = document.getElementById("localLevel");
localLevel.addEventListener('change', function() {
    var _index = this.selectedIndex; // 选中索引,如果是多选，则永远获取第一个
    var _text = this.options[_index].text; // 选中文本
    var level_value = this.options[_index].value; // 选中值

    document.getElementsByClassName('local')[0].innerText= "level 等级："+ _text
        + "\n    level 值：" + level_value;

    localReplace = "a=fmtp:107 profile-level-id=42C0"+ level_value +";packetization-mode=1;level-asymmetry-allowed=1";
});

// set remote profile level
var remoteLevel = document.getElementById("remoteLevel");
remoteLevel.addEventListener('change', function() {
    var _index = this.selectedIndex;
    var _text = this.options[_index].text;
    var level_value = this.options[_index].value;

    document.getElementsByClassName('remote')[0].innerText= "level 等级："+ _text
        + "\n    level 值：" + level_value;

    remoteReplace = "a=fmtp:107 profile-level-id=42C0"+ level_value +";packetization-mode=1;level-asymmetry-allowed=1";
});


var defaultCon = {
    audio: true,
    video: {
        frameRate: { exact: 30 },
        width: {
            exact: 640,
        },
        height: {
            exact: 480,
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
    getMediaButton.disabled = true;
    if (localStream) {
        localStream.getTracks().forEach(function(track) {
            track.stop();
        });
        var videoTracks = localStream.getVideoTracks();
        for (var i = 0; i !== videoTracks.length; ++i) {
            videoTracks[i].stop();
        }
    }
    console.warn(getUserMediaConstraints());
    navigator.mediaDevices.getUserMedia(getUserMediaConstraints())
        .then(gotStream)
        .catch(function(e) {
            console.warn("getUserMedia failed!");
            var message = 'getUserMedia error: ' + e.name + '\n' +
                'PermissionDeniedError may mean invalid constraints.';
            alert(message);
            console.log(message);
            getMediaButton.disabled = false;
        });
}


function gotStream(stream) {
    connectButton.disabled = false;
    console.warn('GetUserMedia succeeded:');
    localStream = stream;
    localVideo.srcObject = stream;
}

function getUserMediaConstraints() {
    var constraints = editGetUserMediaConstraints();
    return constraints;
}

function displayGetUserMediaConstraints() {
    var constraints = getUserMediaConstraints();
    console.log('getUserMedia constraints', constraints);
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
        if (remoteVideo.srcObject !== e.streams[0]) {
            console.log('remotePeerConnection got stream');
            remoteVideo.srcObject = e.streams[0];
        }
    };
    localPeerConnection.createOffer().then(
        function(desc) {
            console.log('localPeerConnection offering');

            // logitech
            desc.sdp = desc.sdp.replace("m=video 9 UDP/TLS/RTP/SAVPF 122 107 100 99 96 123", "m=video 9 UDP/TLS/RTP/SAVPF 107 122 100 99 96 123");
            desc.sdp = desc.sdp.replace("a=fmtp:107 profile-level-id=42C02A;packetization-mode=1;level-asymmetry-allowed=1", localReplace);


            console.log(`Offer from pc1 ${desc.sdp}`);

            localPeerConnection.setLocalDescription(desc);
            remotePeerConnection.setRemoteDescription(desc);
            remotePeerConnection.createAnswer().then(
                function(desc2) {
                    console.log('remotePeerConnection answering');

                    desc2.sdp = desc2.sdp.replace("m=video 9 UDP/TLS/RTP/SAVPF 122 107 100 99 96 123", "m=video 9 UDP/TLS/RTP/SAVPF 107 122 100 99 96 123");
                    desc2.sdp = desc2.sdp.replace("a=fmtp:107 profile-level-id=42C02A;packetization-mode=1;level-asymmetry-allowed=1",remoteReplace);

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
