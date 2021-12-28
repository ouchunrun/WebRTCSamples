/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';
let connectButton = document.querySelector('button#connect');
let hangupButton = document.querySelector('button#hangup');
let bitrateDiv = document.querySelector('div#bitrate');
let peerDiv = document.querySelector('div#peer');
let senderStatsDiv = document.querySelector('div#senderStats');
let receiverStatsDiv = document.querySelector('div#receiverStats');

let cameraPrev = document.getElementById('cameraPrev')
let localPeerConnection;
let remotePeerConnection;
let localStream;
let audioStream
let remoteStream
let bytesPrev;
let timestampPrev;
let isAddNewStream = false
let videoOn = false


/***
 * 取流：包括 桌面共享present(window/screen/tab/all)、摄像头共享（audio/video）
 * FAQ： 如何区分预览取流和正常取流（不用区分，都是取流，预览是不存在服务器要求的分辨率的
 */

function getUsingDeviceId () {
    let selectedIndex = document.getElementById('videoList').options.selectedIndex
    let selectedOption = document.getElementById('videoList').options[selectedIndex]
    return selectedOption.value
}

async function selectDeviceAndGum(){
    let deviceId = getUsingDeviceId()
    console.warn("deviceId: ", deviceId)
    if(deviceId === ""){
        console.warn("请选择有效设备")
        return
    }
    let constraints = JSON.parse(getUserMediaConstraintsDiv.value)
    constraints.video.deviceId = {
        exact: deviceId
    }
    console.warn('getUserMediaConstraints: ', JSON.stringify(constraints, null, '   '))

    let prevStream = await navigator.mediaDevices.getUserMedia(constraints);
    let cameraPrev = document.getElementById('cameraPrev')
    cameraPrev.srcObject = prevStream

    if(localPeerConnection && remotePeerConnection){
        remoteAddStream(prevStream)
    }
}

let videoIndex = 1
async function createPeerConnection(){
    console.log("begin create peerConnections");
    console.log(localStream);
    connectButton.disabled = true;
    hangupButton.disabled = false;

    bytesPrev = 0;
    timestampPrev = 0;
    let config = {
        sdpSemantics: 'unified-plan',
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle'
    }
    let RTCpeerConnectionOptional = {optional: [{'pcName': 'PC_' + Math.random().toString(36).substr(2)}, {'googDscp': true}, {'googIPv6': false}]}
    console.warn("RTCPeerConnection Config: ", JSON.stringify(config, null, '    '))
    localPeerConnection = new RTCPeerConnection(config, RTCpeerConnectionOptional);

    console.warn("1.localPeerConnection 添加本地音频和视频流")
    audioStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
    localPeerConnection.addStream(audioStream)
    localStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {frameRate: 15, width: 640, height: 360,}
    });
    localPeerConnection.addStream(localStream)
    videoOn = true
    console.warn("添加演示流的Transceiver")
    localPeerConnection.addTransceiver('video')   // slides


    remotePeerConnection = new RTCPeerConnection(config, RTCpeerConnectionOptional);
    audioStream = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
    remotePeerConnection.addStream(audioStream)


    console.log('localPeerConnection creating offer');
    localPeerConnection.onnegotiationeeded = function() {
        console.log('Negotiation needed - localPeerConnection');
    };
    remotePeerConnection.onnegotiationeeded = function() {
        console.log('Negotiation needed - remotePeerConnection');
    };

    localPeerConnection.oniceconnectionstatechange = function(o_event){
        console.warn("localPeerConnection iceConnectionState: ", localPeerConnection.iceConnectionState)
    };
    localPeerConnection.onconnectionstatechange = function(o_event){
        console.warn("localPeerConnection iceConnectionState: ", localPeerConnection.connectionState)
    };

    remotePeerConnection.oniceconnectionstatechange = function(o_event){
        console.warn("remotePeerConnection iceConnectionState: ", remotePeerConnection.iceConnectionState)
    };
    remotePeerConnection.onconnectionstatechange = function(o_event){
        console.warn("remotePeerConnection iceConnectionState: ", remotePeerConnection.connectionState)
    };

    localPeerConnection.onicecandidate = function(e) {
        console.log('Candidate localPeerConnection');
        if(!e.candidate || localPeerConnection.iceGatheringState === 'complete'){
            console.warn("localPeerConnection 收集完成")
            let desc = localPeerConnection.localDescription
            console.warn("desc.sdp: ", desc.sdp)
            // desc.sdp = getLocalSDP(desc.sdp)
            console.warn('remotePeerConnection setRemoteDescription: ', desc.sdp)
            remotePeerConnection.setRemoteDescription(desc);

            console.log(('remotePeerConnection createAnswer'))
            remotePeerConnection.createAnswer().then(
                function(desc2) {
                    console.log(`remotePeerConnection  setLocalDescription\n ${desc2.sdp}`);
                    remotePeerConnection.setLocalDescription(desc2);

                    // Todo: Firefox 不触发 onicecandidate 事件
                    if(navigator.userAgent.indexOf('Firefox') >= 0 && isAddNewStream){
                        console.warn(`Answer from pc2:\n${desc2.sdp}`);
                        localPeerConnection.setRemoteDescription(desc2);
                    }
                },
                function(err) {
                    console.log(err);
                }
            );
        }else {
            console.log('local.candidate:', e.candidate.candidate)
        }
    };

    remotePeerConnection.onicecandidate = function(e) {
        console.log('Candidate remotePeerConnection');
        if(!e.candidate || remotePeerConnection.iceGatheringState === 'complete'){
            console.warn("remotePeerConnection 收集完成")
            let desc2 = remotePeerConnection.localDescription

            let parsedSdp = SDPTools.parseSDP(desc2.sdp)
            for (let i = 0; i < parsedSdp.media.length; i++){
                // if(i>=3){
                    delete parsedSdp.media[i].ext
                    SDPTools.removeCodecByPayload(parsedSdp, i, [96, 97, 98 ,99, 100, 101, 122 ,102 ,121 ,127 ,120, 108 ,109 ,124, 119, 123 ,118, 114 ,115 ,116])
                // }
            }
            desc2.sdp = SDPTools.writeSDP(parsedSdp)

            console.warn(`localPeerConnection.setRemoteDescription:\n${desc2.sdp}`);
            localPeerConnection.setRemoteDescription(desc2);
        }else {
            console.log('remote.candidate:', e.candidate.candidate)
        }
    };

    let localPeerStreamArray = []
    localPeerConnection.ontrack = function(e) {
        let stream = e.streams ? e.streams[0] : null
        console.info('__on_add_track: ', stream)
        if (!stream && e.track) {
            log.info('`stream` is undefined on `ontrack` event in WebRTC', e.track)
            stream = new MediaStream()
            stream.addTrack(e.track)
        }

        console.warn("localPeerConnection.ontrack: ", e)
        if(stream && stream.getVideoTracks().length) {
            if(!localPeerStreamArray.includes(stream)){
                console.warn("localPeerConnection get stream: ", stream)
                let parent = document.getElementById('localPeerStreams')
                let video = document.createElement('video')
                video.id = 'video' + videoIndex
                video.srcObject = stream
                video.autoplay = true
                video.controls = true
                parent.appendChild(video)
                videoIndex++
                localPeerStreamArray.push(stream)
            }else {
                console.log('remotePeerConnection already got this stream ', stream);
            }
        }
    };

    let remotePeerStreamArray = []
    remotePeerConnection.ontrack = function(e) {
        let stream = e.streams ? e.streams[0] : null
        console.info('__on_add_track: ', stream)
        if (!stream && e.track) {
            log.info('`stream` is undefined on `ontrack` event in WebRTC', e.track)
            stream = new MediaStream()
            stream.addTrack(e.track)
        }

        if(stream && stream.getVideoTracks().length) {
            if(!remotePeerStreamArray.includes(stream)){
                console.warn("remotePeerConnection get stream: ", e.streams[0])
                let parent = document.getElementById('remotePeerStreams')
                let video = document.createElement('video')
                video.id = 'video' + videoIndex
                video.srcObject = stream
                video.autoplay = true
                video.controls = true
                parent.appendChild(video)
                videoIndex++
                remotePeerStreamArray.push(stream)
            }else {
                console.log('remotePeerConnection already got this stream ', stream);
            }
        }
    };

    console.log('localPeerConnection createOffer');
    localPeerConnection.createOffer().then(
        function(desc) {
            console.log(`localPeerConnection  setLocalDescription\n ${desc.sdp}`);
            localPeerConnection.setLocalDescription(desc);
        },
        function(err) {
            console.log(err);
        }
    );
}

function hangup() {
    console.log('Ending call');
    localPeerConnection.close();
    remotePeerConnection.close();
    window.location.reload();

    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localStream = null;

    hangupButton.disabled = true;
}

function closeStream() {
    // clear first
    let stream = cameraPrev.srcObject
    if (stream){
        try {
            stream.oninactive = null;
            let tracks = stream.getTracks();
            for (let track in tracks) {
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
        cameraPrev.srcObject = null
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


/*************************************************************************************/
/**
 * 远端peerConnection 添加流
 * @param stream
 * @returns {Promise<void>}
 */
let remoteTransceiverIndex = 2
async function remoteAddStream(stream){
    console.warn("远端peerConnection 添加流...")
    if(!stream){
        let con = {
            audio: false,
            video: {frameRate: 15, width: 640, height: 360,}
        }
        remoteStream = await navigator.mediaDevices.getUserMedia(con)
    }
    console.log('remotePeerConnection addStream', remoteStream);

    remotePeerConnection.addTransceiver('video')
    remoteTransceiverIndex++
    let track = remoteStream.getVideoTracks()[0]
    await remotePeerConnection.getSenders()[remoteTransceiverIndex].replaceTrack(track)
    remotePeerConnection.getTransceivers()[remoteTransceiverIndex].direction = 'sendonly';

    console.log('remotePeerConnection createOffer');
    remotePeerConnection.createOffer().then(
        function(desc) {
            console.log(`remotePeerConnection.setLocalDescription ${desc.sdp}`);
            remotePeerConnection.setLocalDescription(desc).then(function (){
                let parsedSdp = SDPTools.parseSDP(desc.sdp)
                for (let i = 0; i < parsedSdp.media.length; i++){
                    // if(i>=3){
                    delete parsedSdp.media[i].ext
                    SDPTools.removeCodecByPayload(parsedSdp, i, [96, 97, 98 ,99, 100, 101, 122 ,102 ,121 ,127 ,120, 108 ,109 ,124, 119, 123 ,118, 114 ,115 ,116])
                    // }

                    if(i>=3){
                        parsedSdp.media[i].direction = 'sendonly'
                    }
                }
                desc.sdp = SDPTools.writeSDP(parsedSdp)
                console.warn(`localPeerConnection.setRemoteDescription:\n${desc.sdp}`);
                localPeerConnection.setRemoteDescription(desc);

                console.log('localPeerConnection createAnswer')
                localPeerConnection.createAnswer().then(
                    function(desc2) {
                        console.warn(`localPeerConnection.setLocalDescription:\n${desc2.sdp}`);
                        localPeerConnection.setLocalDescription(desc2).then(function (){
                            console.log('remotePeerConnection.setRemoteDescription: ', desc2.sdp);
                            remotePeerConnection.setRemoteDescription(desc2)
                        }).catch(function (error){
                            console.error(error)
                        })
                    },
                    function(err) {
                        console.log(err);
                    }
                );
            }).catch(function (error){
                console.error(error)
            })
        },
        function(err) {
            console.log(err);
        }
    );
    isAddNewStream = true
}

/**
 * 关闭本地视频流
 */
async function closeLocalVideo(){
    console.warn("关闭本地视频流")
    let transceiverTarget = localPeerConnection.getTransceivers()[1]

    transceiverTarget.direction = 'sendonly'
    transceiverTarget.direction = 'inactive'
    transceiverTarget.direction = 'recvonly'
    console.info('sender replaceTrack null')
    await transceiverTarget.sender.replaceTrack(null)

    console.info('close stream')
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localStream = null
    console.info('set video on false')
    videoOn = false

    console.info('create offer')
    localPeerConnection.createOffer().then(
        function(desc) {
            console.log(`localPeerConnection  setLocalDescription\n ${desc.sdp}`);
            localPeerConnection.setLocalDescription(desc);

            desc.sdp = getLocalSDP(desc.sdp)
            console.warn('remotePeerConnection setRemoteDescription: ', desc.sdp)
            remotePeerConnection.setRemoteDescription(desc);

            console.log(('remotePeerConnection createAnswer'))
            remotePeerConnection.createAnswer().then(
                function(desc2) {
                    console.log(`remotePeerConnection  setLocalDescription\n ${desc2.sdp}`);
                    remotePeerConnection.setLocalDescription(desc2);

                    let parsedSdp = SDPTools.parseSDP(desc2.sdp)

                    for (let i = 0; i < parsedSdp.media.length; i++){
                        SDPTools.removeCodecByPayload(parsedSdp, i, [96, 97, 98 ,99, 100, 101, 122 ,102 ,121 ,127 ,120, 108 ,109 ,124, 119, 123 ,118, 114 ,115 ,116])

                        let media = parsedSdp.media[i]
                        delete media.ext
                        delete media.rtcp

                        for(let j = 0; j<media.rtcpFb.length; j++){
                            let rtcpFb = media.rtcpFb[j]
                            if(rtcpFb.type === 'goog-remb' || rtcpFb.type === 'transport-cc'){
                                delete media.rtcpFb[j]
                            }else {
                                rtcpFb.payload = '*'
                            }
                        }
                        if(i>2){
                            // delete media.connection
                            delete media.fingerprint
                            delete media.icePwd
                            delete media.iceUfrag
                        }
                        delete media.rtcpRsize
                        media.connection = 'new'
                        delete media.setup

                        if(media.ssrcs && media.ssrcs.length){
                            media.ssrcs.push({
                                attribute: "msid",
                                id: media.ssrcs[0].id,
                                value: media.msid.msid + ' ' + media.msid.trackid,
                            })

                            media.ssrcs.push({
                                attribute: "msid",
                                id: media.ssrcs[1].id,
                                value: media.msid.msid + ' ' + media.msid.trackid,
                            })
                        }
                        delete media.msid
                        delete media.iceOptions

                        media.fmtp.forEach(function (fmtp){
                            if(fmtp.config.indexOf('profile-level-id') >= 0){
                                fmtp.config = 'packetization-mode=1;level-asymmetry-allowed=1;profile-level-id=42E01F'
                            }
                        })
                    }
                    console.warn(parsedSdp)
                    desc2.sdp = SDPTools.writeSDP(parsedSdp)

                    console.warn(`localPeerConnection.setRemoteDescription:\n${desc2.sdp}`);
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

