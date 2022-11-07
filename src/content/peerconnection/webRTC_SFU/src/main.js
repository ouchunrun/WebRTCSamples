
'use strict';

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

const video1 = document.querySelector('video#video1');
const video2 = document.querySelector('video#video2');

let localStream;
let pc1Local;
let pc1Remote;
let pc1RemoteStream

const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

function gotStream(stream) {
    console.log('Received local stream');
    video1.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
}

function start() {
    console.log('Requesting local stream');
    startButton.disabled = true;
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(gotStream)
        .catch(e => console.error('getUserMedia() error: ', e));
}

function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    console.log('Starting calls');
    const audioTracks = localStream.getAudioTracks();
    const videoTracks = localStream.getVideoTracks();
    if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    if (videoTracks.length > 0) {
        console.log(`Using video device: ${videoTracks[0].label}`);
    }
    // Create an RTCPeerConnection via the polyfill.
    const servers = null;
    pc1Local = new RTCPeerConnection(servers);
    pc1Remote = new RTCPeerConnection(servers);
    pc1Remote.ontrack = gotRemoteStream1;
    pc1Local.onicecandidate = iceCallback1Local;
    pc1Remote.onicecandidate = iceCallback1Remote;
    console.log('pc1: created local and remote peer connection objects');

    localStream.getTracks().forEach(track => pc1Local.addTrack(track, localStream));
    console.log('Adding local stream to pc1Local');
    pc1Local.createOffer(offerOptions).then(gotDescription1Local, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

function gotDescription1Local(desc) {
    pc1Local.setLocalDescription(desc);
    console.log(`Offer from pc1Local\n${desc.sdp}`);
    pc1Remote.setRemoteDescription(desc);
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    pc1Remote.createAnswer().then(gotDescription1Remote, onCreateSessionDescriptionError);
}

function gotDescription1Remote(desc) {
    pc1Remote.setLocalDescription(desc);
    console.log(`Answer from pc1Remote\n${desc.sdp}`);
    pc1Local.setRemoteDescription(desc);
}

function hangup() {
    console.log('Ending calls');
    pc1Local.close();
    pc1Remote.close();
    pc1Local = pc1Remote = null;
    hangupButton.disabled = true;
    callButton.disabled = false;

    if(peerArray && peerArray.length){
        peerArray.forEach(function (pc){
            pc.close()
        })
    }
}

function gotRemoteStream1(e) {
    if (video2.srcObject !== e.streams[0]) {
        video2.srcObject = e.streams[0];
        console.log('pc1: received remote stream');
        pc1RemoteStream = e.streams[0]
    }
}

function iceCallback1Local(event) {
    handleCandidate(event.candidate, pc1Remote, 'pc1: ', 'local');
}

function iceCallback1Remote(event) {
    handleCandidate(event.candidate, pc1Local, 'pc1: ', 'remote');
}

function handleCandidate(candidate, dest, prefix, type) {
    dest.addIceCandidate(candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess() {
    console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    console.log(`Failed to add ICE candidate: ${error.toString()}`);
}
