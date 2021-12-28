'use strict';

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;

let startTime;
const localVideo = document.getElementById('localVideo');
const localPresent = document.getElementById('localPresent');
const remoteVideo = document.getElementById('remoteVideo');
const remotePresent = document.getElementById('remotePresent');

let localAudioStream
let localStream;
let presentStream
let capturestream
let capturestream2
let pc1;
let pc2;
const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
  return (pc === pc1) ? pc2 : pc1;
}

/**
 * 判断是否启用一个PeerConnection携带三个媒体行的设置
 * @returns {boolean}
 */
function isMultiStream(){
  let result = false
  let multiStreamOptions = document.getElementById('multiStream').options
  if(multiStreamOptions && multiStreamOptions.length > 0){
    let selectedIndex = multiStreamOptions[multiStreamOptions.selectedIndex]
    result = selectedIndex.value
  }

  return result
}

function getSelectVaule(id){
  let result = false
  let multiStreamOptions = document.getElementById(id).options
  if(multiStreamOptions && multiStreamOptions.length > 0){
    let selectedIndex = multiStreamOptions[multiStreamOptions.selectedIndex]
    result = selectedIndex.value
  }

  return result
}

/**
 * 通过 canvas.captureStream()方式获取流
 */
function getCaptureStream() {
  console.log('set canvas')
  var canvas = document.getElementById('myCanvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#46958e';
  ctx.fillRect(0,0,200,100);

  capturestream = canvas.captureStream();
  console.warn("get capture stream one:  ", capturestream)

  capturestream2 = canvas.captureStream();
  console.warn("get capture stream two:  ", capturestream2)
}

/**
 * 开始时取流
 * @returns {Promise<void>}
 */
async function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  try {
    if(isMultiStream() === 'gum'){
      console.log('isMultiStream: gum')
      const stream = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
      console.warn('get local video stream', stream);
      localVideo.srcObject = stream;
      localStream = stream;

      localAudioStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
      console.warn('get audio stream: ', localAudioStream)

      // get present stream
      var screen_constraints = {
        audio: false,
        video: {
          width: {max: '1920'},
          height: {max: '1080'},
        }
      };
      presentStream = await navigator.mediaDevices.getDisplayMedia(screen_constraints)
      console.warn('get present stream', presentStream);
      localPresent.srcObject = presentStream
    }else if(isMultiStream() === 'captureStream'){
      console.log('isMultiStream: use captureStream')
      getCaptureStream()
    }else if(isMultiStream() === 'addTransceiver'){
      console.log('isMultiStream: use addTransceiver')
    }

    callButton.disabled = false;
  } catch (e) {
    console.error(e)
  }
}

/**
 * 建立 peerConnection 连接
 * @returns {Promise<void>}
 */
async function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  console.log('Starting call');
  startTime = window.performance.now();

  var sdpPlan = getSelectVaule('sdp-plan')
  console.warn("sdpPlan: ",  sdpPlan)

  const configuration = {
    // sdpSemantics:  "unified-plan",
    sdpSemantics:  sdpPlan
  };
  console.log('RTCPeerConnection configuration:', configuration);
  pc1 = new RTCPeerConnection(configuration);
  console.log('Created local peer connection object pc1');
  pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
  pc2 = new RTCPeerConnection(configuration);
  console.log('Created remote peer connection object pc2');
  pc2.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
  pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1, e));
  pc2.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc2, e));
  pc2.addEventListener('track', gotRemoteStream);

  if(isMultiStream() === 'gum'){
    if(localAudioStream){
      localAudioStream.getTracks().forEach(track => pc1.addTrack(track, localAudioStream));
    }
    if(localStream){
      localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    }
    if(presentStream){
      presentStream.getTracks().forEach(track => pc1.addTrack(track, presentStream));
      console.log('Added local stream and presentStream to pc1');
    }
  }else if(isMultiStream() === 'captureStream'){
    if(capturestream){
      capturestream.getTracks().forEach(track => pc1.addTrack(track, capturestream));
    }
    if(capturestream2){
      capturestream2.getTracks().forEach(track => pc1.addTrack(track, capturestream2));
    }
  }else if(isMultiStream() === 'addTransceiver'){
    if( (( adapter.browserDetails.browser === 'chrome' &&  adapter.browserDetails.version >= 72)
        || ( adapter.browserDetails.browser ==="opera" &&  adapter.browserDetails.chromeVersion >= 72)
        || ( adapter.browserDetails.browser === 'firefox'&&  adapter.browserDetails.version >= 59)
        || ( adapter.browserDetails.browser === 'safari' &&  adapter.browserDetails.UIVersion >= "12.1.1")))
    {
      console.log('使用addTransceiver添加Transceiver')
      // 添加audio transceiver ,确保audio媒体行保持在前
      pc1.addTransceiver('audio')
      pc1.addTransceiver('video')
      pc1.addTransceiver('video')
    }else {
      alert("当前浏览器不支持addTransceiver接口，请在其他浏览器版本尝试！")
      return
    }
  }

  try {
    console.log('pc1 createOffer start');
    const offer = await pc1.createOffer(offerOptions);
    await onCreateOfferSuccess(offer);
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }
}

function onCreateSessionDescriptionError(error) {
  console.log(`Failed to create session description: ${error.toString()}`);
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
}

function onSetRemoteSuccess(pc) {
  console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
  console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
  console.log('get remote stream: ', e.streams[0])

  if(e.streams && e.streams[0] && e.streams[0].getVideoTracks().length  > 0){
    if(!remoteVideo.srcObject ){
      console.warn("received video")
      remoteVideo.srcObject = e.streams[0];
    }else if(!remotePresent.srcObject){

      if(remoteVideo.srcObject !== e.streams[0] ){
        console.warn("received present")
        remotePresent.srcObject = e.streams[0]
      }
    }
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
    await pc1.setRemoteDescription(desc);
    onSetRemoteSuccess(pc1);
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

function onIceStateChange(pc, event) {
  if (pc) {
    console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
    console.log('ICE state change event: ', event);
  }
}

function hangup() {
  console.log('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
  window.location.reload(true)
}


localVideo.addEventListener('loadedmetadata', function() {
  console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

localPresent.addEventListener('loadedmetadata', function() {
  console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function() {
  console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remotePresent.addEventListener('loadedmetadata', function() {
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


