/*
 *  Copyright (c) 2020 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);

let startTime;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function() {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('resize', () => {
    console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
    // We'll use the first onsize callback as an indication that video has started
    // playing out.
    if (startTime) {
        const elapsedTime = window.performance.now() - startTime;
        console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
        startTime = null;
    }
});

const codecPreferences = document.querySelector('#codecPreferences');
const supportsSetCodecPreferences = window.RTCRtpTransceiver &&
    'setCodecPreferences' in window.RTCRtpTransceiver.prototype;

let localStream;
let pc1;
let pc2;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}

async function start() {
    console.log('Requesting local stream');
    startButton.disabled = true;
    try {
        // const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const stream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: {
                width: { max: '1920' },
                height: { max: '1080' },
                frameRate: { max: '5' }
            }
        })
        console.log('Received local stream');
        localVideo.srcObject = stream;
        localStream = stream;
        callButton.disabled = false;
    } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
    }
    if (supportsSetCodecPreferences) {
        const {codecs} = RTCRtpSender.getCapabilities('video');
        codecs.forEach(codec => {
            if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
                return;
            }
            const option = document.createElement('option');
            option.value = (codec.mimeType + ' ' + (codec.sdpFmtpLine || '')).trim();
            option.innerText = option.value;
            codecPreferences.appendChild(option);
        });
        codecPreferences.disabled = false;
    }
}

async function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    console.log('Starting call');
    startTime = window.performance.now();
    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();
    if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
    }
    if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    const configuration = {};
    console.log('RTCPeerConnection configuration:', configuration);
    pc1 = new RTCPeerConnection(configuration);
    console.log('Created local peer connection object pc1');
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
    pc2 = new RTCPeerConnection(configuration);
    console.log('Created remote peer connection object pc2');
    pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
    pc2.addEventListener('track', gotRemoteStream);

    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    console.log('Added local stream to pc1');
    if (supportsSetCodecPreferences) {
        const preferredCodec = codecPreferences.options[codecPreferences.selectedIndex];
        if (preferredCodec.value !== '') {
            const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ');
            const {codecs} = RTCRtpSender.getCapabilities('video');
            const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine);
            const selectedCodec = codecs[selectedCodecIndex];
            codecs.splice(selectedCodecIndex, 1);
            codecs.unshift(selectedCodec);
            console.log(codecs);
            const transceiver = pc1.getTransceivers().find(t => t.sender && t.sender.track === localStream.getVideoTracks()[0]);
            transceiver.setCodecPreferences(codecs);
            console.log('Preferred video codec', selectedCodec);
        }
    }
    codecPreferences.disabled = true;

    try {
        console.log('pc1 createOffer start');
        const offer = await pc1.createOffer();
        await onCreateOfferSuccess(offer);
    } catch (e) {
        onCreateSessionDescriptionError(e);
    }
}

function onCreateSessionDescriptionError(error) {
    console.error(`Failed to create session description: ${error.toString()}`);
}

async function onCreateOfferSuccess(desc) {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
        await pc1.setLocalDescription(desc);
        onSetLocalSuccess(pc1);
    } catch (e) {
        onSetSessionDescriptionError();
    }

    console.log('pc2 setRemoteDescription start');
    try {
        // desc.sdp = getLocalSDP(desc.sdp);
        // console.warn(`Offer from pc1 ${desc.sdp}`);
        await pc2.setRemoteDescription(desc);
        onSetRemoteSuccess(pc2);
    } catch (e) {
        onSetSessionDescriptionError();
    }

    console.log('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    try {
        const answer = await pc2.createAnswer();
        await onCreateAnswerSuccess(answer);
    } catch (e) {
        onCreateSessionDescriptionError(e);
    }
}

function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
    // setEncodingParameters(pc1)
}

function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
    if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        console.log('pc2 received remote stream');
    }
}

async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from pc2:\n${desc.sdp}`);
    console.log('pc2 setLocalDescription start');
    try {
        await pc2.setLocalDescription(desc);
        onSetLocalSuccess(pc2);
    } catch (e) {
        onSetSessionDescriptionError(e);
    }
    console.log('pc1 setRemoteDescription start');
    try {

        let maxBitRate = document.getElementById('maxBitRate').value
        if(maxBitRate){
            console.warn('修改带宽：', maxBitRate)
            maxBitRate = parseInt(maxBitRate)
            desc.sdp = getDecorateRo(desc.sdp, maxBitRate)
        }

        await pc1.setRemoteDescription(desc);
        onSetRemoteSuccess(pc1);

        // Display the video codec that is actually used.
        setTimeout(async () => {
            const stats = await pc1.getStats();
            stats.forEach(stat => {
                if (!(stat.type === 'outbound-rtp' && stat.kind === 'video')) {
                    return;
                }
                const codec = stats.get(stat.codecId);
                document.getElementById('actualCodec').innerText = 'Using ' + codec.mimeType +
                    ' ' + (codec.sdpFmtpLine ? codec.sdpFmtpLine + ' ' : '') +
                    ', payloadType=' + codec.payloadType + '. Encoder: ' + stat.encoderImplementation;
            });
        }, 1000);

        P2PStatistics()
    } catch (e) {
        onSetSessionDescriptionError(e);
    }
}

async function onIceCandidate(pc, event) {
    try {
        await (getOtherPc(pc).addIceCandidate(event.candidate));
        onAddIceCandidateSuccess(pc);
    } catch (e) {
        onAddIceCandidateError(pc, e);
    }
    console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
    console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function hangup() {
    console.log('Ending call');
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
    codecPreferences.disabled = false;

    // 清除定时器
    clearInterval(statisticsInterval)
}


/*********************************************************************************/

/**
 * 设置上行编码码率参数
 */
function setEncodingParameters(pc) {
    var sender = pc.getSenders()[0]
    var videoParameters = sender.getParameters();
    if (JSON.stringify(videoParameters) === '{}') {
        videoParameters.encodings = [{}]
    }else if(!videoParameters.encodings.length || !videoParameters.encodings[0]){
        videoParameters.encodings[0] = {}
    }

    videoParameters.encodings[0].maxBitrate = 512000
    videoParameters.degradationPreference = 'maintain-resolution';

    // console.info("set encoding maxBitrate: " +  videoParameters.encodings[0].maxBitrate)
    console.info("set encoding degradationPreference: " +  JSON.stringify(videoParameters, null, '   '))
    sender.setParameters(videoParameters).then(function () {
    }).catch(function (error) {
        console.info('set encoding parameters error')
        console.error(error)
    })
}

var prevTimestamp;
var prevBytes;
var prevFramesEncoded;
var statisticsInterval

function P2PStatistics(){
// Display statistics
    statisticsInterval = setInterval(function() {
        if (pc1) {
            pc1.getStats(null)
            .then(showLocalStats, function(err) {
                console.log(err);
            });
        } else {
            // console.log('Not connected yet');
        }
    }, 1000);
}

function showLocalStats(results){
    results.forEach(function(report) {
        var bitrate;
        var frame
        var now = report
        if (now.type === "outbound-rtp" || now.type === "outboundrtp") {
            var bytes = now.bytesSent;
            if (prevTimestamp) {
                bitrate = 8 * (bytes - prevBytes) / (now.timestamp - prevTimestamp);
                bitrate = Math.floor(bitrate);
                frame = now.framesEncoded - prevFramesEncoded
            }
            prevBytes = bytes;
            prevTimestamp = now.timestamp;
            prevFramesEncoded = now.framesEncoded
            let d = new Date(now.timestamp);
            let currentTime = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()-1} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
            console.warn(currentTime, " framesEncoded count total: " + now.framesEncoded)
        }
        if (bitrate) {
            bitrate += ' kbits/_sec';
            console.info("current bitrate: " + bitrate)
        }
        // if (frame) {
        //     console.info("current frame: " +  frame)
        // }
        // console.info( 'remoteVideo 分辨率 ' + remoteVideo.videoWidth + ' x ' + remoteVideo.videoHeight + ' px ')
    });
}