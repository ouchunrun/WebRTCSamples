'use strict';

let getMediaButton = document.querySelector('button#getMedia');
let connectButton = document.querySelector('button#connect');
let hangupButton = document.querySelector('button#hangup');

getMediaButton.onclick = getMedia;
connectButton.onclick = createPeerConnection;
hangupButton.onclick = hangup;

let local_framesPerSecond = document.querySelector('div#local_framesPerSecond');
let remote_framesPerSecond = document.querySelector('div#remote_framesPerSecond');
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
let remoteStream;
let bytesPrev;
let timestampPrev;

function createPeerConnection() {
    log.info("begin create peerConnections");
    connectButton.disabled = true;
    hangupButton.disabled = false;

    bytesPrev = 0;
    timestampPrev = 0;
    localPeerConnection = new RTCPeerConnection(null);
    remotePeerConnection = new RTCPeerConnection(null);

    if(localStream){
        localStream.getTracks().forEach(
            function(track) {
                log.info("localPeerConnection addTack!");
                localPeerConnection.addTrack(track, localStream);
            }
        );
    }
    if(remoteStream){
        remoteStream.getTracks().forEach(
            function(track) {
                log.info("localPeerConnection addTack!");
                remotePeerConnection.addTrack(track, remoteStream);
            }
        );
    }

    log.info('localPeerConnection creating offer');
    localPeerConnection.onnegotiationeeded = function() {
        log.info('Negotiation needed - localPeerConnection');
    };
    remotePeerConnection.onnegotiationeeded = function() {
        log.info('Negotiation needed - remotePeerConnection');
    };
    localPeerConnection.onicecandidate = function(e) {
        log.info('Candidate localPeerConnection');
        remotePeerConnection.addIceCandidate(e.candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    };
    remotePeerConnection.onicecandidate = function(e) {
        log.info('Candidate remotePeerConnection');
        localPeerConnection.addIceCandidate(e.candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    };

    localPeerConnection.ontrack = function(e) {
        if (localVideo.srcObject !== e.streams[0]) {
            log.info('localPeerConnection got stream ' + e.streams[0].id);
            localVideo.srcObject = e.streams[0];
        }
    };

    remotePeerConnection.ontrack = function(e) {
        if (remoteVideo.srcObject !== e.streams[0]) {
            log.info('remotePeerConnection got stream ' + e.streams[0].id);
            remoteVideo.srcObject = e.streams[0];
        }
    };

    localPeerConnection.createOffer().then(
        function(offer) {
            log.info('localPeerConnection setLocalDescription:\n', offer.sdp);
            localPeerConnection.setLocalDescription(offer).then(function () {
                log.info('setLocalDescription success');
            }).catch(function (error) {
                console.error(error)
            })

            offer.sdp = decorateSdp(offer.sdp)
            log.info(`remotePeerConnection setRemoteDescription : \n${offer.sdp}`);
            remotePeerConnection.setRemoteDescription(offer).then(function () {
                log.info('remotePeerConnection setRemoteDescription success')
            }).catch(function (err) {
                log.error(err)
            })

            remotePeerConnection.createAnswer().then(
                function(answer) {
                    log.info('remotePeerConnection setLocalDescription: \n', answer.sdp);
                    remotePeerConnection.setLocalDescription(answer).then(function () {
                        log.info('setLocalDescription success')
                    }).catch(function (err) {
                        log.error(err)
                    })

                    answer.sdp = decorateSdp(answer.sdp)
                    log.warn(`localPeerConnection setRemoteDescription:\n${answer.sdp}`);
                    localPeerConnection.setRemoteDescription(answer).then(function () {
                        log.info('localPeerConnection setRemoteDescription success')
                    }).catch(function (err) {
                        log.error(err)
                    })
                },
                function(err) {log.info(err);}
            );
        },
        function(err) {log.info(err);}
    );
}

function onAddIceCandidateSuccess() {
    log.info('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    log.info('Failed to add Ice Candidate: ' + error.toString());
}

function hangup() {
    log.info('Ending call');
    localPeerConnection.close();
    remotePeerConnection.close();
    window.location.reload();

    // query stats one last time.
    Promise.all([
        remotePeerConnection.getStats(null).then(showRemoteStats, function(err) {log.info(err);}),
        localPeerConnection.getStats(null).then(showLocalStats, function(err) {log.info(err);})
    ]).then(() => {
        localPeerConnection = null;
        remotePeerConnection = null;
    });

    localStream.getTracks().forEach(function(track) {track.stop();});
    localStream = null;
    hangupButton.disabled = true;
    getMediaButton.disabled = false;
}

/************************************************* 取流部分 *************************************************************/
var getUserMediaConstraintsDiv = document.querySelector('textarea#getUserMediaConstraints');
var defaultCon = {
    audio: false,
    video: {
        frameRate: 30,
        aspectRatio: {
            min: 1.777,
            max: 1.778
        },
        width: 1280,
        height: 720,
    }
};

getUserMediaConstraintsDiv.value = JSON.stringify(defaultCon, null, '    ' );

function getUsingDeviceId () {
    var deviceId = ''
    var selectedIndex = document.getElementById('videoList').options.selectedIndex
    if(selectedIndex < 0){
        selectedIndex = 0
    }
    var selectedOption = document.getElementById('videoList').options[selectedIndex]
    if(selectedOption && selectedOption.value){
        deviceId = selectedOption.value
    }
    console.log('get deviceId: ' + deviceId)
    return deviceId
}

function selectDeviceAndGum(){
    var deviceId = getUsingDeviceId()
    console.warn("deviceId: ", deviceId)
    if(deviceId === ""){
        console.warn("请选择有效设备")
        return
    }
    getMedia()
}

function getMedia() {
    log.warn('GetUserMedia start!');
    console.log("clear stream first")
    closeStream()
    getMediaButton.disabled = true;

    var constraints = JSON.parse(getUserMediaConstraintsDiv.value)
    var deviceId = getUsingDeviceId()
    if(deviceId){
        constraints.video.deviceId = deviceId
    }

    log.warn("getNewStream constraint: \n" + JSON.stringify(constraints, null, '    ') );
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream){
        log.warn('get local media stream succeeded:' , stream.id);
        connectButton.disabled = false;
        localStream = stream;
        localVideo.srcObject = stream;

        // // 获取远端流
        // var selectedIndex = document.getElementById('videoList').options.selectedIndex
        // var options = document.getElementById('videoList').options
        // if(selectedIndex){
        //     for(var i = 0; i<options.length; i++){
        //         if(i !== selectedIndex){
        //             deviceId = options[i].value
        //         }
        //     }
        // }else {
        //     deviceId = options[options.length-1].value
        // }
        // console.warn("deviceId: ", deviceId)
        // if(deviceId){
        //     constraints.video.deviceId = deviceId
        // }
        // navigator.mediaDevices.getUserMedia(constraints).then(function (_stream){
        //     log.warn('get remote media stream succeeded:', _stream.id);
        //     remoteStream = _stream
        //     remoteVideo.srcObject = _stream;
        // }).catch(function(e) {
        //     console.error(e)
        //     log.warn("get remote media stream failed!");
        // });
    }).catch(function(e) {
        console.error(e)
        log.warn("getUserMedia failed!");
        let message = 'getUserMedia error: ' + e.name + '\n' + 'PermissionDeniedError may mean invalid constraints.';
        log.warn(message);
        getMediaButton.disabled = false;
    });
}

function closeStream() {
    // clear first
    var stream = localVideo.srcObject
    if (stream){
        try {
            stream.oninactive = null;
            var tracks = stream.getTracks();
            for (var track in tracks) {
                tracks[track].onended = null;
                log.info("close stream");
                tracks[track].stop();
            }
        }
        catch (error) {
            log.info('closeStream: Failed to close stream');
            log.error(error);
        }
        stream = null;
        localVideo.srcObject = null
    }

    if (localStream) {
        localStream.getTracks().forEach(function(track) {
            track.stop();
        });
        var videoTracks = localStream.getVideoTracks();
        for (var i = 0; i !== videoTracks.length; ++i) {
            videoTracks[i].stop();
        }
    }
}

var mediaDeviceInstance
document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        mediaDeviceInstance = new MediaDevice()
        var videoInputList = []
        // videoInputList.push('<option class="cameraOption" value="">' + "请选择" + '</option>')
        mediaDeviceInstance.enumDevices(deviceInfo => {
            console.log('enumDevices' + JSON.stringify(deviceInfo.cameras))
            if (deviceInfo.cameras) {
                for (var j = 0; j < deviceInfo.cameras.length; j++) {
                    if (!deviceInfo.cameras[j].label) {
                        deviceInfo.cameras[j].label = 'camera' + j
                    }
                    videoInputList.push('<option class="cameraOption" value="' + deviceInfo.cameras[j].deviceId + '">' + deviceInfo.cameras[j].label + '</option>')
                    console.log('camera: ' + deviceInfo.cameras[j].label)
                }
            }
            document.getElementById('videoList').innerHTML = videoInputList.join('')
            getMedia();
        }, function (error) {
            console.error('enum device error: ' + error)
        })
    }
}
