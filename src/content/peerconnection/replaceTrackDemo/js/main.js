/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const upgradeButton = document.getElementById('upgradeButton');
const hangupButton = document.getElementById('hangupButton');
const replaceTrackOpt = document.getElementById('replaceTrackOpt');
callButton.disabled = true;
hangupButton.disabled = true;
upgradeButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
upgradeButton.onclick = upgrade;
hangupButton.onclick = hangup;
replaceTrackOpt.onclick = setTrackOpt;

let startTime;
let videoIsOn = true;
let useReplaceTrack = true;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
  console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function() {
  console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.onresize = () => {
  console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
  console.log('RESIZE', remoteVideo.videoWidth, remoteVideo.videoHeight);
  // We'll use the first onsize callback as an indication that video has started
  // playing out.
  if (startTime) {
    const elapsedTime = window.performance.now() - startTime;
    console.log(`Setup time: ${elapsedTime.toFixed(3)}ms`);
    startTime = null;
  }
};

let localStream = undefined;
let fakeStream  = undefined; 
let remoteStream = undefined;
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

function gotStream(stream) {
  console.log('Received local stream');
  localVideo.srcObject = stream;
  localStream = stream;
  
  if (fakeStream) {
    callButton.disabled = false;
  }
}

function gotFakeStream(stream) {
    console.log('Received fake stream');
    fakeStream = stream;

    if (localStream) {
      callButton.disabled = false;
    }
}

function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: videoIsOn
    })
    .then(gotStream)
    .catch(e => alert(`getUserMedia() error: ${e.name}`));

  /*For remote peerconnection*/
  navigator.mediaDevices
    .getUserMedia( {
        audio: false,
        video: true,
        fake: true
    })
    .then(gotFakeStream)
    .catch(e => alert(`getUserMedia() fake stream error: ${ e.name }`)); 
}

function call() {
  callButton.disabled = true;
  upgradeButton.disabled = false;
  hangupButton.disabled = false;
  console.log('Starting call');
  startTime = window.performance.now();
  const audioTracks = localStream.getAudioTracks();
  if (audioTracks.length > 0) {
    console.log(`Using audio device: ${audioTracks[0].label}`);
  }
  const servers = { sdpSemantics:'unified-plan' };
  pc1 = new RTCPeerConnection(servers);
  console.log('Created local peer connection object pc1');
  pc1.onicecandidate = e => onIceCandidate(pc1, e);

  pc2 = new RTCPeerConnection(servers);
  console.log('Created remote peer connection object pc2');
  pc2.onicecandidate = e => onIceCandidate(pc2, e);
  pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
  pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
  pc2.ontrack = gotRemoteStream;

  console.log('Added local stream to pc1');
  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
  fakeStream.getVideoTracks().forEach(track => pc2.addTrack(track, fakeStream));

  console.log('pc1 createOffer start');
  pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError);

  /*For avoid Safari issue*/
  if (RTCRtpTransceiver.prototype.setDirection) {
      pc1.getTransceivers()[1].setDirection('recvonly');
  }
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
}

function onCreateOfferSuccess(desc) {
  console.log(`Offer from pc1\n${desc.sdp}`);
  console.log('pc1 setLocalDescription start');
  pc1.setLocalDescription(desc).then(() => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
  console.log('pc2 setRemoteDescription start');
  pc2.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc2 createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  pc2.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
  console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
  console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
  console.warn('gotRemoteStream', e.track, e.streams[0]);

  remoteVideo.srcObject = null;

  if (!remoteStream) {
    if ( e.streams[0] ) {
        remoteStream = e.streams[0];
    } else {
        //For work around in Safari
        var newStream = new MediaStream();
        newStream.addTrack(e.track);
        remoteStream = newStream;
    }
  } else {
      remoteStream.addTrack(e.track);
  }

  remoteVideo.srcObject = remoteStream;
}

function onCreateAnswerSuccess(desc) {
  console.log(`Answer from pc2:
${desc.sdp}`);
  console.log('pc2 setLocalDescription start');
  pc2.setLocalDescription(desc).then(() => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
  console.log('pc1 setRemoteDescription start');
  pc1.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc1), onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
  getOtherPc(pc)
    .addIceCandidate(event.candidate)
    .then(() => onAddIceCandidateSuccess(pc), err => onAddIceCandidateError(pc, err));
  //console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
  //console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
  //console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
  }
}

function onNeededNegotiation(  ) {
        pc1.createOffer()
        .then(offer => {
                console.log(`Offer from pc1\n${offer.sdp}`);
                return pc1.setLocalDescription(offer);
        })
        .then(() => pc2.setRemoteDescription(pc1.localDescription))
        .then(() => pc2.createAnswer())
        .then(answer => {
                console.log(`Answer from pc2\n${answer.sdp}`);
                return pc2.setLocalDescription(answer);
        })
        .then(() => pc1.setRemoteDescription(pc2.localDescription));
}

function upgrade() {

    if (!pc1.onnegotiationneeded) {
        /*Avoiding triggered by addTrack...*/
        pc1.onnegotiationneeded = e => onNeededNegotiation(e);
    }

    if (videoIsOn == false) {
        navigator.mediaDevices
        .getUserMedia( { video: true })
        .then(stream => {
            videoIsOn = true;
            upgradeButton.textContent = "Turn off video";

            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                console.log(`Using video device: ${
                    videoTracks[0].label
                }
                `);
            }
            localStream.addTrack(videoTracks[0]);
            localVideo.srcObject = null;
            localVideo.srcObject = localStream;
            if (useReplaceTrack) {
                    if (!RTCRtpTransceiver.prototype.setDirection) {
                        pc1.getSenders()[1].replaceTrack(videoTracks[0]);
                        pc1.getTransceivers()[1].direction = 'sendrecv';
                    } else {
                        if (pc1.getTransceivers().length >= 3) {
                            console.warn("STOP THE 3th TRANSCEIVER!!!!!")
                            pc1.getTransceivers()[2].stop();
                        }
                        pc1.getTransceivers()[1].setDirection('sendrecv');                      
                    }
            } else {
                if (pc1.getTransceivers().length < 2) {
                    pc1.addTrack(videoTracks[0], localStream);
                } else {
                    if (!RTCRtpTransceiver.prototype.setDirection) {
                        pc1.getTransceivers()[1].sender.replaceTrack(videoTracks[0]); 
                        pc1.getTransceivers()[1].direction = 'sendrecv';
                    } else {
                        if (!window.added) {
                            pc1.getTransceivers()[1].sender.replaceTrack(videoTracks[0]);
                            window.added = true;
                        }

                        pc1.getTransceivers()[1].setDirection('sendrecv');
                    }

                } 
            }
        })
    } else {
        videoIsOn = false
        upgradeButton.textContent = "Turn on video";

        if (useReplaceTrack) {
            if (!RTCRtpTransceiver.prototype.setDirection) {
                pc1.getTransceivers()[1].direction = 'recvonly';
                pc1.getTransceivers()[1].sender.replaceTrack(null);
            } else {
                pc1.getTransceivers()[1].setDirection('recvonly');
            }

            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                console.log(`Remove video device: ${
                    videoTracks[0].label
                }`);
            }
            videoTracks.forEach(track => { localStream.removeTrack(track); track.stop(); });

        } else {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                console.log(`Remove video device: ${
                    videoTracks[0].label
                }`);
            }
            pc1.removeTrack(pc1.getSenders()[1]); 
            localStream.removeTrack(videoTracks[0]);
            videoTracks[0].stop();
        }
    }

}

function hangup() {
  console.log('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;

  const tracks = localStream.getTracks();
  tracks.forEach(track => {
    track.stop();
    localStream.removeTrack(track);
  });
  localVideo.srcObject = null;
  localVideo.srcObject = localStream;
  localStream = null;

  hangupButton.disabled = true;
  callButton.disabled = false;
  startButton.disabled = false;
}

function setTrackOpt() {

    switch (replaceTrackOpt.selectedIndex) {
        default:
        case 0:
            /*replaceTrack*/
            useReplaceTrack = true;
            break;
        case 1:
            useReplaceTrack = false;
            break;
    }
}

