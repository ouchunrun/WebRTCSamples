/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

//Localhost unsecure http connections are allowed
if (document.location.hostname !== "localhost") {
    //check if the user is using http vs. https & redirect to https if needed
    if (document.location.protocol != "https:") {
        $(document).html("This doesn't work well on http. Redirecting to https");
        console.log("redirecting to https");
        document.location.href = "https:" + document.location.href.substring(document.location.protocol.length);
    }
}

let connectButton = document.querySelector('button#connect');
let hangupButton = document.querySelector('button#hangup');
let detailButton = document.querySelector('button#detail');
let limitSelector = document.querySelector('select#frameRateLimit');

let uploadFile = document.getElementById("uploadFile");
let fileURL = "";
let stream = "";

//init
connectButton.disable = true;
hangupButton.disable = true;
detailButton.disable = true;
limitSelector.disable = false;

//GUM, RID, CST(firefox only)
let framerateLimitation = "GUM";
//let framerateLimitation = "RID";

if (adapter.browserDetails.browser != 'firefox') {
    //Remove the MediaTrackConstraints
    limitSelector.remove(6);
}

connectButton.onclick = createPeerConnection;
hangupButton.onclick = hangup;
detailButton.onclick = showDetails;
limitSelector.onchange = setLimitation;

let minWidthInput = document.querySelector('div#minWidth input');
let maxWidthInput = document.querySelector('div#maxWidth input');
let minHeightInput = document.querySelector('div#minHeight input');
let maxHeightInput = document.querySelector('div#maxHeight input');
let minFramerateInput = document.querySelector('div#minFramerate input');
let maxFramerateInput = document.querySelector('div#maxFramerate input');

minWidthInput.onmousedown = maxWidthInput.onmousedown =
    minHeightInput.onmousedown = maxHeightInput.onmousedown =
        minFramerateInput.onmousedown = maxFramerateInput.onmousedown = pressedButton;

minWidthInput.onmouseup = maxWidthInput.onmouseup =
    minHeightInput.onmouseup = maxHeightInput.onmouseup =
        minFramerateInput.onmouseup = maxFramerateInput.onmouseup = releasedButton;

minWidthInput.onmousemove = maxWidthInput.onmousemove =
    minHeightInput.onmousemove = maxHeightInput.onmousemove =
        minFramerateInput.onmousemove = maxFramerateInput.onmousemove = moveSlick;

minWidthInput.onclick = maxWidthInput.onclick =
    minHeightInput.onclick = maxHeightInput.onclick =
        minFramerateInput.onclick = maxFramerateInput.onclick = displayRangeValue;

let selectMinWidth = document.querySelector('div#minWidth select');
let selectMaxWidth = document.querySelector('div#maxWidth select');
let selectMinHeight = document.querySelector('div#minHeight select');
let selectMaxHeight = document.querySelector('div#maxHeight select');

selectMinWidth.onchange = selectMaxWidth.onchange =
    selectMinHeight.onchange = selectMaxHeight.onchange = selectedValue;

let getUserMediaConstraintsDiv = document.querySelector('div#getUserMediaConstraints');
let bitrateDiv = document.querySelector('div#bitrate');
let peerDiv = document.querySelector('div#peer');
let senderStatsDiv = document.querySelector('div#senderStats');
let receiverStatsDiv = document.querySelector('div#receiverStats');
let txStatsDiv = document.querySelector('div#txStats');
let rxStatsDiv = document.querySelector('div#rxStats');

let localVideo = document.querySelector('div#localVideo video');
let remoteVideo = document.querySelector('div#remoteVideo video');
let localVideoStatsDiv = document.querySelector('div#localVideo div');
let remoteVideoStatsDiv = document.querySelector('div#remoteVideo div');

let localPeerConnection;
let remotePeerConnection;
let localStream;
let bytesPrev;
let timestampPrev;

main();

function main() {
    displayGetUserMediaConstraints();
}

function hangup() {
    trace('Ending call');
    localPeerConnection.close();
    remotePeerConnection.close();
    localPeerConnection = null;
    remotePeerConnection = null;

    localStream.getTracks().forEach(function (track) {
        track.stop();
    });
    localStream = null;

    hangupButton.disabled = true;
    detailButton.disabled = true;

    location.reload(true);
}

function setLimitation() {
    this.disabled = true;
    let index = this.selectedIndex;
    framerateLimitation = this.options[index].value;

    if (framerateLimitation == "CST") {
        minWidthInput.onchange = maxWidthInput.onchange =
            minHeightInput.onchange = maxHeightInput.onchange =
                minFramerateInput.onchange = maxFramerateInput.onchange = applyChange;
    } else {
        minWidthInput.onchange = maxWidthInput.onchange =
            minHeightInput.onchange = maxHeightInput.onchange =
                minFramerateInput.onchange = maxFramerateInput.onchange = null;
    }
    //Update the shown
    displayGetUserMediaConstraints();

    console.log("FrameRateLimitation mode is " + this.options[index].text);
}

function showDetails() {

    if (this.innerText == 'Detail') {
        this.innerText = 'Lite';
        document.querySelector('#stats').style.display = "none";
        document.querySelector('#statistics').style.display = "";
    } else {
        this.innerText = 'Detail';
        document.querySelector('#stats').style.display = "";
        document.querySelector('#statistics').style.display = "none";
    }
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
            connectButton.disable = false;
        } else {
            console.log("please upload video or audio");
        }
    } catch (e) {
        console.log(e.message);
    }
});

function maybeCreateStream() {
    if (localVideo.captureStream) {
        stream = localVideo.captureStream(minFramerate.value);
        console.log('Captured stream from localVideo with captureStream', stream);
    } else if (localVideo.mozCaptureStream) {
        stream = localVideo.mozCaptureStream(minFramerate.value);
        console.log('Captured stream from localVideo with mozCaptureStream()', stream);
    } else {
        trace('captureStream() not supported');
    }
    connectButton.disabled = false;
}

localVideo.oncanplay = maybeCreateStream;
if (localVideo.readyState >= 3) {
    maybeCreateStream();
}
localVideo.play();

function getUserMediaConstraints() {
    let constraints = {};
    constraints.video = {};

    if (adapter.browserDetails.isWebRTCPluginInstalled == true) {
        console.log("已安装插件");
        constraints.audio = true;
        constraints.video.optional = [{sourceId: "X978GrandstreamScreenCapturer785"}];

        if (minWidthInput.value !== '0') {
            constraints.video.width = {};
            constraints.video.width.min = minWidthInput.value;
        }
        if (maxWidthInput.value !== '0') {
            constraints.video.width = constraints.video.width || {};
            constraints.video.width.max = maxWidthInput.value;
        }
        if (minHeightInput.value !== '0') {
            constraints.video.height = {};
            constraints.video.height.min = minHeightInput.value;
        }
        if (maxHeightInput.value !== '0') {
            constraints.video.height = constraints.video.height || {};
            constraints.video.height.max = maxHeightInput.value;
        }

        if (framerateLimitation == "GUM") {
            if (minFramerateInput.value !== '0') {
                constraints.video.frameRate = constraints.video.frameRate || {};
                constraints.video.frameRate.min = minFramerateInput.value;
            }
            if (maxFramerateInput.value !== '0') {
                constraints.video.frameRate = constraints.video.frameRate || {};
                constraints.video.frameRate.max = maxFramerateInput.value;
            }
        }

    } else if (adapter.browserDetails.browser == "firefox") {
        console.log("firefox");
        constraints.audio = false;

        constraints.video.mediaSource = "window"/*"screen"*/;

        if (minWidthInput.value !== '0') {
            constraints.video.width = {};
            constraints.video.width.min = minWidthInput.value;
        }
        if (maxWidthInput.value !== '0') {
            constraints.video.width = constraints.video.width || {};
            constraints.video.width.max = maxWidthInput.value;
        }
        if (minHeightInput.value !== '0') {
            constraints.video.height = {};
            constraints.video.height.min = minHeightInput.value;
        }
        if (maxHeightInput.value !== '0') {
            constraints.video.height = constraints.video.height || {};
            constraints.video.height.max = maxHeightInput.value;
        }


        if (framerateLimitation == "GUM") {
            if (minFramerateInput.value !== '0') {
                constraints.video.frameRate = constraints.video.frameRate || {};
                constraints.video.frameRate.min = minFramerateInput.value;
            }
            if (maxFramerateInput.value !== '0') {
                constraints.video.frameRate = constraints.video.frameRate || {};
                constraints.video.frameRate.max = maxFramerateInput.value;
            }
        }

    } else {
        console.log("没有安装插件，也不是火狐！");
        if (true) {
            constraints.audio = false;
        } else {
            constraints.audio = {};
            constraints.audio.mandatory = {};
            constraints.audio.mandatory.chromeMediaSource = "system";
        }

        constraints.video.mandatory = {};


        if (minWidthInput.value !== '0') {
            constraints.video.mandatory.minWidth = minWidthInput.value;
        }
        if (maxWidthInput.value !== '0') {
            constraints.video.mandatory.maxWidth = maxWidthInput.value;
        }
        if (minHeightInput.value !== '0') {
            constraints.video.mandatory.minHeight = minHeightInput.value;
        }
        if (maxHeightInput.value !== '0') {
            constraints.video.mandatory.maxHeight = maxHeightInput.value;
        }

        if (framerateLimitation == "GUM") {
            if (minFramerateInput.value !== '0') {
                constraints.video.mandatory.minFrameRate = minFramerateInput.value;
            }
            if (maxFramerateInput.value !== '0') {
                constraints.video.mandatory.maxFrameRate = maxFramerateInput.value;
            }
        }

    }
    changeSize();
    return constraints;
}

function displayGetUserMediaConstraints() {
    console.log("getUserMediaConstraints()");
    let constraints = getUserMediaConstraints();
    console.log('getUserMedia constraints', constraints);
    getUserMediaConstraintsDiv.textContent =
        JSON.stringify(constraints, null, '    ');
}

function createPeerConnection() {
    console.log("createPeerConnection开始创建对等连接...");
    connectButton.disabled = true;
    detailButton.disabled = false;
    hangupButton.disabled = false;
    bytesPrev = 0;
    timestampPrev = 0;

    if (adapter.browserDetails.isWebRTCPluginInstalled == false) {
        console.log("RTCPeerConnection: ");
        localPeerConnection = new RTCPeerConnection(null);
        remotePeerConnection = new RTCPeerConnection(null);
    } else {
        console.log("window.RTCPeerConnection:" );
        localPeerConnection = new window.RTCPeerConnection(null);   // 创建对等连接
        remotePeerConnection = new window.RTCPeerConnection(null);
    }
    
    remotePeerConnection.ontrack = gotRemoteStream;
    stream.getTracks().forEach(
        function (track) {
            localPeerConnection.addTrack(
                track,
                stream
            );
        }
    );

    console.log('localPeerConnection creating offer');

    localPeerConnection.onicecandidate = function (e) {    // 当icecandidate可用时触发
        console.log('这里Candidate localPeerConnection');
        if (e.candidate) {
            remotePeerConnection.addIceCandidate(
                new RTCIceCandidate(e.candidate)
            ).then(
                onAddIceCandidateSuccess,
                onAddIceCandidateError
            );
        }
    };
    remotePeerConnection.onicecandidate = function (e) {
        console.log('Candidate remotePeerConnection');
        if (e.candidate) {
            let newCandidate = new RTCIceCandidate(e.candidate);
            localPeerConnection.addIceCandidate(
                newCandidate
            ).then(
                onAddIceCandidateSuccess,
                onAddIceCandidateError
            );
        }
    };

    remotePeerConnection.onaddstream = function (e) {
        console.log('remotePeerConnection got stream');
        if (!adapter.browserShim.attachMediaStream) {
            remoteVideo.srcObject = e.stream;
        } else {
            adapter.browserShim.attachMediaStream(remoteVideo, e.stream);
        }
    };

    if (adapter.browserDetails.isWebRTCPluginInstalled == false) {
        localPeerConnection.createOffer().then(
            function (desc) {
                console.log('localPeerConnection offering');
                if (framerateLimitation == 'RID') {
                    desc = framerateLimitationWithRid(desc, "offer");
                } else if (framerateLimitation == 'VP8') {
                    desc = framerateLimitationVP8(desc, undefined);
                } else if (framerateLimitation == 'H264') {
                    desc = framerateLimitationH264(desc, undefined);
                } else if (framerateLimitation == 'IMGVP8') {
                    desc = framerateLimitationIMGVP8(desc, undefined);
                } else if (framerateLimitation == 'IMG264') {
                    desc = framerateLimitationIMG264(desc, undefined);
                } else if (framerateLimitation == 'GUM') {
                    desc = framerateLimitationGUM(desc, undefined);
                }
                localPeerConnection.setLocalDescription(desc);
                remotePeerConnection.setRemoteDescription(desc);
                remotePeerConnection.createAnswer().then(
                    function (desc2) {
                        console.log('remotePeerConnection answering');
                        if (framerateLimitation == 'RID') {
                            desc2 = framerateLimitationWithRid(desc2, "answer");
                        } else if (framerateLimitation == 'VP8') {
                            desc2 = framerateLimitationVP8(desc2, undefined);
                        } else if (framerateLimitation == 'H264') {
                            desc2 = framerateLimitationH264(desc2, undefined);
                        } else if (framerateLimitation == 'IMGVP8') {
                            desc2 = framerateLimitationIMGVP8(desc2, undefined);
                        } else if (framerateLimitation == 'IMG264') {
                            desc2 = framerateLimitationIMG264(desc2, undefined);
                        } else if (framerateLimitation == 'GUM') {
                            desc2 = framerateLimitationGUM(desc2, undefined);
                        }
                        remotePeerConnection.setLocalDescription(desc2);
                        localPeerConnection.setRemoteDescription(desc2);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },
            function (err) {
                console.log(err);
            }
        );
    } else {
        localPeerConnection.createOffer(
            function (desc) {
                console.log('localPeerConnection offering');
                if (framerateLimitation == 'RID') {
                    desc = framerateLimitationWithRid(desc, "offer");
                } else if (framerateLimitation == 'VP8') {
                    desc = framerateLimitationVP8(desc, undefined);
                } else if (framerateLimitation == 'H264') {
                    desc = framerateLimitationH264(desc, undefined);
                } else if (framerateLimitation == 'IMGVP8') {
                    desc = framerateLimitationIMGVP8(desc, undefined);
                } else if (framerateLimitation == 'IMG264') {
                    desc = framerateLimitationIMG264(desc, undefined);
                } else if (framerateLimitation == 'GUM') {
                    desc = framerateLimitationGUM(desc, undefined);
                }
                localPeerConnection.setLocalDescription(desc);
                remotePeerConnection.setRemoteDescription(desc);
                remotePeerConnection.createAnswer(
                    function (desc2) {
                        console.log('remotePeerConnection answering');
                        if (framerateLimitation == 'RID') {
                            desc2 = framerateLimitationWithRid(desc2, "answer");
                        } else if (framerateLimitation == 'VP8') {
                            desc2 = framerateLimitationVP8(desc2, undefined);
                        } else if (framerateLimitation == 'H264') {
                            desc2 = framerateLimitationH264(desc2, undefined);
                        } else if (framerateLimitation == 'IMGVP8') {
                            desc2 = framerateLimitationIMGVP8(desc2, undefined);
                        } else if (framerateLimitation == 'IMG264') {
                            desc2 = framerateLimitationIMG264(desc2, undefined);
                        } else if (framerateLimitation == 'GUM') {
                            desc2 = framerateLimitationGUM(desc2, undefined);
                        }
                        remotePeerConnection.setLocalDescription(desc2);
                        localPeerConnection.setRemoteDescription(desc2);
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },
            function (err) {
                console.log(err);
            }
        );
    }
}

function gotRemoteStream(event) {
    if (remoteVideo.srcObject !== event.streams[0]) {
        remoteVideo.srcObject = event.streams[0];
        console.log('remoteStream received remote stream', event);
    }
}

function onAddIceCandidateSuccess() {
    trace('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    trace('Failed to add Ice Candidate: ' + error.toString());
}

// Display statistics
setInterval(function () {
    if (remotePeerConnection && remotePeerConnection.getRemoteStreams()[0]) {
        remotePeerConnection.getStats(null, function (results) {
            // 第一个参数null是可空的mediaStreamTrack，第二个是成功回调函数（参数是RTCStateReport）
            let statsString = dumpStats(results);
            let tinyString = tinyStats(results);
            receiverStatsDiv.innerHTML = '<h2>Receiver stats</h2>' + statsString;
            rxStatsDiv.innerHTML = '<h2>Receiver mainly stats</h2>' + tinyString;
            // calculate video bitrate
            Object.keys(results).forEach(function (result) {
                let report = results[result];
                let now = report.timestamp;

                let bitrate;
                if (report.type === 'inboundrtp' && report.mediaType === 'video') {
                    // firefox calculates the bitrate for us
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=951496
                    bitrate = Math.floor(report.bitrateMean / 1024);
                } else if (report.type === 'ssrc' && report.bytesReceived &&
                    report.googFrameHeightReceived) {
                    // chrome does not so we need to do it ourselves
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

            // search for the candidate pair
            Object.keys(results).forEach(function (result) {
                let report = results[result];
                if (report.type === 'candidatepair' && report.selected ||
                    report.type === 'googCandidatePair' &&
                    report.googActiveConnection === 'true') {
                    activeCandidatePair = report;
                }
            });
            if (activeCandidatePair && activeCandidatePair.remoteCandidateId) {
                Object.keys(results).forEach(function (result) {
                    let report = results[result];
                    if (report.type === 'remotecandidate' &&
                        report.id === activeCandidatePair.remoteCandidateId) {
                        remoteCandidate = report;
                    }
                });
            }
            if (remoteCandidate && remoteCandidate.ipAddress &&
                remoteCandidate.portNumber) {
                peerDiv.innerHTML = '<strong>Connected to:</strong> ' +
                    remoteCandidate.ipAddress +
                    ':' + remoteCandidate.portNumber;
            }
        }, function (err) {
            console.log(err);
        });
        localPeerConnection.getStats(null, function (results) {
            let statsString = dumpStats(results);    // 详细信息
            let tinyString = tinyStats(results);    // 发送的主要信息
            senderStatsDiv.innerHTML = '<h2>Sender stats</h2>' + statsString;
            txStatsDiv.innerHTML = '<h2>Sender mainly stats</h2>' + tinyString;
        }, function (err) {
            console.log(err);
        });
    } else {
        ;
        //console.log('Not connected yet');
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
    Object.keys(results).forEach(function (key, index) {
        let res = results[key];
        statsString += '<h3>Report ';
        statsString += index;
        statsString += '</h3>\n';
        statsString += 'time ' + res.timestamp + '<br>\n';
        statsString += 'type ' + res.type + '<br>\n';
        Object.keys(res).forEach(function (k) {
            if (k !== 'timestamp' && k !== 'type') {
                statsString += k + ': ' + res[k] + '<br>\n';
            }
        });
    });
    return statsString;
}

function tinyStats(results) {
    let statsString = '';
    let framerate = 'NaN';
    let bytes = 'NaN';
    let packets = 'NaN';

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
                    }
                });
            }
        }
    });
    statsString += 'FrameRate: ' + framerate + '<br>\n';
    statsString += 'Bytes: ' + bytes + '<br>\n';
    statsString += 'Packets: ' + packets + '<br>\n';
    return statsString;
}

function selectedValue(e) {
    console.log("selectedValue ");
    let index = this.selectedIndex;
    let value = this.options[index].value;
    let input = e.target.parentElement.querySelector('input');
    input.value = value;
    let span = e.target.parentElement.querySelector('span');
    span.textContent = value;
    displayGetUserMediaConstraints();
}

function pressedButton(e) {
    this.pressed = true;
}

function releasedButton(e) {
    this.pressed = false;
}

function moveSlick(e) {
    // 鼠标经过type = range的input的时候触发的事件
    if (this.pressed == true) {
        displayRangeValue(e);
    }
}

// Utility to show the value of a range in a sibling span element
function displayRangeValue(e) {    // 改变分辨率和帧率
    console.log("displayRangeValue()");
    let span = e.target.parentElement.querySelector('span');
    span.textContent = e.target.value;
    displayGetUserMediaConstraints();
}

//Limitation with rid. see: https://tools.ietf.org/pdf/draft-ietf-mmusic-rid-07.pdf
function framerateLimitationWithRid(description, mode) {
    let descWithRid = description;
    let direct_1 = "send";
    let direct_2 = "recv";

    if (mode == "offer") {
        //Keep original send or recv
        ;
    } else {
        //Need to reverse send as recv.
        direct_1 = "recv";
        direct_2 = "send";
    }

    if (adapter.browserDetails.browser == 'firefox') {
        if (maxFramerateInput.value !== '0') {
            if (mode == "offer") {
                descWithRid.sdp = description.sdp.replace(/a=mid:sdparta_1\r\n/g, 'a=mid:sdparta_1\r\na=rid:1 ' + direct_1 +
                    ' max-fps=' + maxFramerateInput.value + ';max-br=512000\r\na=rid:2 ' +
                    direct_2 + ' max-fps=' + maxFramerateInput.value + ';max-br=512000\r\na=simulcast: ' + direct_1 + ' rid=1 ' + direct_2 + ' rid=2\r\n');
            } else {
                //Firefox require the media sendrecv must match with the rid send / recv.
                descWithRid.sdp = description.sdp.replace(/a=mid:sdparta_1\r\n/g, 'a=mid:sdparta_1\r\na=rid:1 ' + direct_1 +
                    ' max-fps=' + maxFramerateInput.value + ';max-br=512000\r\na=simulcast: ' + direct_1 + ' rid=1\r\n');
            }
        }
    } else {
        if (maxFramerateInput.value !== '0') {
            descWithRid.sdp = description.sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\na=rid:1 ' + direct_1 +
                ' max-fps=' + maxFramerateInput.value + ';max-br=512000\r\na=rid:2 ' +
                direct_2 + ' max-fps=' + maxFramerateInput.value + ';max-br=512000\r\na=simulcast: ' + direct_1 + ' rid=1 ' + direct_2 + ' rid=2\r\n');
        }
    }
    console.log("The new " + mode + " description: ");
    console.log(descWithRid.sdp);

    return descWithRid;
}

//Apply constraints change, for Firfox only
function applyChange() {
    let constraints = {};
    if (minWidthInput.value !== '0') {
        constraints.width = {};
        constraints.width.min = minWidthInput.value;
    }
    if (maxWidthInput.value !== '0') {
        constraints.width = constraints.width || {};
        constraints.width.max = maxWidthInput.value;
    }
    if (minHeightInput.value !== '0') {
        constraints.height = {};
        constraints.height.min = minHeightInput.value;
    }
    if (maxHeightInput.value !== '0') {
        constraints.height = constraints.height || {};
        constraints.height.max = maxHeightInput.value;
    }

    if (minFramerateInput.value !== '0') {
        constraints.frameRate = constraints.frameRate || {};
        constraints.frameRate.min = minFramerateInput.value;
    }
    if (maxFramerateInput.value !== '0') {
        constraints.frameRate = constraints.frameRate || {};
        constraints.frameRate.max = maxFramerateInput.value;
    }

    if (localStream != undefined) {
        console.log("Apply MediaTrackConstraints: " + constraints);
        localStream.getVideoTracks()[0].applyConstraints(constraints);
    }
    changeSize()
}

function changeSize() {
    localVideo.width = minHeightInput.value;
    localVideo.height = minHeightInput.value;
    remoteVideo.width = minHeightInput.value;
    remoteVideo.height = minHeightInput.value;


}

//Limitation for VP8 with max-fr 
function framerateLimitationVP8(description, payload) {
    let descVP8 = description;

    //Get the right payload type of VP8
    var payload = descVP8.sdp.match(/a=rtpmap:([0-9]*) VP8\/90000/)[1];
    console.log("payload：" + payload);

    let fs;
    if (minHeightInput.value > 0 && minWidthInput.value > 0) {
        fs = parseInt(minHeightInput.value * minWidthInput.value / 256);
    } else {
        fs = parseInt(640 * 480 / 256);
    }

    if (adapter.browserDetails.browser == 'firefox') {
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " max-fs=12288;max-fr=60\r\n";
            let chg = "a=fmtp:" + payload + " max-fs=" + fs + ";max-fr=" + maxFramerateInput.value + "\r\n";

            descVP8.sdp = description.sdp.replace(org, chg);
        }
    } else {
        if (maxFramerateInput.value !== '0') {
            let org = "a=rtpmap:" + payload + " VP8\/90000\r\n";
            let chg = "a=rtpmap:" + payload + " VP8\/90000\r\na=fmtp:" + payload + " max-fs=" + fs + ";max-fr=" + maxFramerateInput.value + "\r\n";

            descVP8.sdp = description.sdp.replace(org, chg);
        }
    }
    console.log("The new VP8 description: ");
    console.log(descVP8.sdp);

    return descVP8;
}

//Limitation for H264 with max-mbps 
function framerateLimitationH264(description, payload) {
    let descH264 = description;

    //Get the right payload type of H264
    var payload = descH264.sdp.match(/a=rtpmap:([0-9]*) H264\/90000/)[1];
    let mLine = descH264.sdp.match(/m=video [0-9]* [A-Z\/]* [0-9 ]*/)[0];
    var payloads = descH264.sdp.match(/m=video [0-9]* [A-Z\/]* ([0-9 ]*)/)[1].split(' ');
    let finalCodecList = payload;
    payloads.forEach(function (_payload) {
        if (_payload != payload) {
            finalCodecList += " " + _payload;
        }
    });
    let newMLine = mLine.match(/m=video [0-9]* [A-Z\/]* /)[0] + finalCodecList;

    //make sure the first video codec is H264
    description.sdp = description.sdp.replace(mLine, newMLine);

    let fs;
    if (minHeightInput.value > 0 && minWidthInput.value > 0) {
        fs = parseInt(minHeightInput.value * minWidthInput.value / 256);
    } else {
        fs = parseInt(640 * 480 / 256);
    }

    let mbps = maxFramerateInput.value * fs;


    if (adapter.browserDetails.browser == 'firefox') {

        //set max-mbps as frameRate * maxWidth * maxHeight  ; max-fs as maxWidth * maxHeight / 16
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1\r\n";
            let chg = "a=fmtp:" + payload + " profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1;max-mbps=" + mbps + ";max-fs=" + fs + "\r\n";
            descH264.sdp = description.sdp.replace(org, chg);
        }
    } else {

        //set max-mbps as frameRate * maxWidth * maxHeight  ; max-fs as maxWidth * maxHeight / 16
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\n";
            let chg = "a=fmtp:" + payload + " level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f;max-mbps=" + mbps + ";max-fs=" + fs + "\r\n";
            descH264.sdp = description.sdp.replace(org, chg);
        }
    }
    console.log("The new H264 description: ");
    console.log(descH264.sdp);

    return descH264;
}

//Limitation for VP8 with imageattr 
function framerateLimitationIMGVP8(description, payload) {
    let descVP8 = description;

    //Get the right payload type of VP8
    var payload = descVP8.sdp.match(/a=rtpmap:([0-9]*) VP8\/90000/)[1];

    if (adapter.browserDetails.browser == 'firefox') {
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " max-fs=12288;max-fr=60\r\n";
            let chg = org + "a=imageattr:" + payload + " send [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "] recv [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "]\r\n";

            descVP8.sdp = description.sdp.replace(org, chg);
        }
    } else {
        if (maxFramerateInput.value !== '0') {
            let org = "a=rtpmap:" + payload + " VP8\/90000\r\n";
            let chg = org + "a=imageattr:" + payload + " send [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "] recv [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "]\r\n";

            descVP8.sdp = description.sdp.replace(org, chg);
        }
    }
    console.log("The new VP8 description: ");
    console.log(descVP8.sdp);

    return descVP8;
}

//Limitation for H264 with imageattr 
function framerateLimitationIMG264(description, payload) {
    let descH264 = description;

    //Get the right payload type of H264
    var payload = descH264.sdp.match(/a=rtpmap:([0-9]*) H264\/90000/)[1];
    let mLine = descH264.sdp.match(/m=video [0-9]* [A-Z\/]* [0-9 ]*/)[0];
    var payloads = descH264.sdp.match(/m=video [0-9]* [A-Z\/]* ([0-9 ]*)/)[1].split(' ');
    let finalCodecList = payload;
    payloads.forEach(function (_payload) {
        if (_payload != payload) {
            finalCodecList += " " + _payload;
        }
    });
    let newMLine = mLine.match(/m=video [0-9]* [A-Z\/]* /)[0] + finalCodecList;

    //make sure the first video codec is H264
    description.sdp = description.sdp.replace(mLine, newMLine);

    if (adapter.browserDetails.browser == 'firefox') {

        //set max-mbps as frameRate * maxWidth * maxHeight  ; max-fs as maxWidth * maxHeight / 16
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " profile-level-id=42e01f;level-asymmetry-allowed=1;packetization-mode=1\r\n";
            let chg = org + "a=imageattr:" + payload + " send [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "] recv [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "]\r\n";
            descH264.sdp = description.sdp.replace(org, chg);
        }
    } else {

        //set max-mbps as frameRate * maxWidth * maxHeight  ; max-fs as maxWidth * maxHeight / 16
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\n";
            let chg = org + "a=imageattr:" + payload + " send [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "] recv [x=" + minWidthInput.value + ",y=" + minHeightInput.value + "]\r\n";
            descH264.sdp = description.sdp.replace(org, chg);
        }
    }
    console.log("The new H264 description: ");
    console.log(descH264.sdp);

    return descH264;
}

//Limitation for VP8 with GUM, and removed the SDP LIMITATION
function framerateLimitationGUM(description, payload) {
    let descVP8 = description;

    //Get the right payload type of VP8
    var payload = descVP8.sdp.match(/a=rtpmap:([0-9]*) VP8\/90000/)[1];

    if (adapter.browserDetails.browser == 'firefox') {
        if (maxFramerateInput.value !== '0') {
            let org = "a=fmtp:" + payload + " max-fs=12288;max-fr=60\r\n";
            let chg = "";

            descVP8.sdp = description.sdp.replace(org, chg);
        }
    } else {
        ; //Do not need to do anything.
    }
    console.log("The new VP8 description: ");
    console.log(descVP8.sdp);

    return descVP8;
}


