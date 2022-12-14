/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const video1 = document.querySelector('video#video1');
const video2 = document.querySelector('video#video2');
const localVideoStatsDiv = document.querySelector('div#localVideo div');
const remoteVideoStatsDiv = document.querySelector('div#remoteVideo div');
const bitrateDiv = document.querySelector('div#bitrate');
const peerDiv = document.querySelector('div#peer');

const startButton = document.querySelector('button#startButton');
const callButton = document.querySelector('button#callButton');
const hangupButton = document.querySelector('button#hangupButton');
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

const pc1SignalStateDiv = document.querySelector('div#pc1SignalState');
const pc1IceStateDiv = document.querySelector('div#pc1IceState');
const pc1ConnStateDiv = document.querySelector('div#pc1ConnState');
const pc2SignalStateDiv = document.querySelector('div#pc2SignalState');
const pc2IceStateDiv = document.querySelector('div#pc2IceState');
const pc2ConnStateDiv = document.querySelector('div#pc2ConnState');

let localStream;
let pc1;
let pc2;
let rtpTimer
let stats = {}
let rtpInfo = {
    audioIn: undefined,
    audioOut: undefined,
    videoIn: undefined,
    videoOut: undefined,
}
let MEDIA_SSRCS = {
    LOCAL_AUDIO_SSRC: null,
    REMOTE_AUDIO_SSRC: null,
    LOCAL_VIDEO_SSRC: null,
    REMOTE_VIDEO_SSRC: null,
    LOCAL_PRESENT_SSRC: null,
    REMOTE_PRESENT_SSRC: null
}
let MEDIA_CODECS = {
    LOCAL_AUDIO_CODEC: null,
    REMOTE_AUDIO_CODEC: null,
    LOCAL_VIDEO_CODEC: null,
    REMOTE_VIDEO_CODEC: null,
    LOCAL_PRESENT_CODEC: null,
    REMOTE_PRESENT_CODEC: null
}

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
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true
        })
        .then(gotStream)
        .catch(e => alert('getUserMedia() error: ', e.name));
}

function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    console.log('Starting call');
    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();
    if (videoTracks.length > 0) {
        console.log(`Using Video device: ${videoTracks[0].label}`);
    }
    if (audioTracks.length > 0) {
        console.log(`Using Audio device: ${audioTracks[0].label}`);
    }
    const servers = null;

    pc1 = new RTCPeerConnection(servers);
    pc1.idx = 1;
    console.log('Created local peer connection object pc1');
    pc1.onsignalingstatechange = stateCallback1;

    pc1SignalStateDiv.textContent = pc1.signalingState;
    pc1IceStateDiv.textContent = pc1.iceConnectionState;
    pc1ConnStateDiv.textContent = pc1.connectionState;

    pc1.oniceconnectionstatechange = iceStateCallback1;
    pc1.onconnectionstatechange = connStateCallback1;
    pc1.onicecandidate = e => onIceCandidate(pc1, e);

    pc2 = new RTCPeerConnection(servers);
    pc2.idx = 2;
    console.log('Created remote peer connection object pc2');
    pc2.onsignalingstatechange = stateCallback2;

    pc2SignalStateDiv.textContent = pc2.signalingState;
    pc2IceStateDiv.textContent = pc2.iceConnectionState;
    pc2ConnStateDiv.textContent = pc2.connectionState;
    pc2.oniceconnectionstatechange = iceStateCallback2;
    pc2.onconnectionstatechange = connStateCallback2;
    pc2.onicecandidate = e => onIceCandidate(pc2, e);
    pc2.ontrack = gotRemoteStream;
    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    console.log('Adding Local Stream to peer connection');
    pc1.createOffer(offerOptions).then(gotDescription1, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

function gotDescription1(description) {
    pc1.setLocalDescription(description);
    console.log(`Offer from pc1:\n${description.sdp}`);
    pc2.setRemoteDescription(description);
    pc2.createAnswer().then(gotDescription2, onCreateSessionDescriptionError);
}

function gotDescription2(description) {
    pc2.setLocalDescription(description);
    console.log(`Answer from pc2\n${description.sdp}`);
    pc1.setRemoteDescription(description);
}

function hangup() {
    console.log('Ending call');
    clearInterval(rtpTimer)
    rtpTimer = null
    pc1.close();
    pc2.close();
    localStream.getTracks().forEach(function (track){
        track.stop()
    })
    pc1SignalStateDiv.textContent += ` => ${pc1.signalingState}`;
    pc2SignalStateDiv.textContent += ` => ${pc2.signalingState}`;
    pc1IceStateDiv.textContent += ` => ${pc1.iceConnectionState}`;
    pc2IceStateDiv.textContent += ` => ${pc2.iceConnectionState}`;
    pc1ConnStateDiv.textContent += ` => ${pc1.connectionState}`;
    pc2ConnStateDiv.textContent += ` => ${pc2.connectionState}`;
    pc1 = null;
    pc2 = null;
    hangupButton.disabled = true;
    callButton.disabled = false;
}

function gotRemoteStream(e) {
    if (video2.srcObject !== e.streams[0]) {
        video2.srcObject = e.streams[0];
        console.log('Got remote stream');
    }
}

function stateCallback1() {
    let state;
    if (pc1) {
        state = pc1.signalingState;
        console.log(`pc1 state change callback, state: ${state}`);
        pc1SignalStateDiv.textContent += ` => ${state}`;
    }
}

function stateCallback2() {
    let state;
    if (pc2) {
        state = pc2.signalingState;
        console.log(`pc2 state change callback, state: ${state}`);
        pc2SignalStateDiv.textContent += ` => ${state}`;
    }
}

function iceStateCallback1() {
    let iceState;
    if (pc1) {
        iceState = pc1.iceConnectionState;
        console.log(`pc1 ICE connection state change callback, state: ${iceState}`);
        pc1IceStateDiv.textContent += ` => ${iceState}`;
    }
}

function iceStateCallback2() {
    let iceState;
    if (pc2) {
        iceState = pc2.iceConnectionState;
        console.log(`pc2 ICE connection state change callback, state: ${iceState}`);
        pc2IceStateDiv.textContent += ` => ${iceState}`;
    }
}

function connStateCallback1() {
    if (pc1) {
        const {connectionState} = pc1;
        console.log(`pc1 connection state change callback, state: ${connectionState}`);
        pc1ConnStateDiv.textContent += ` => ${connectionState}`;

        if(connectionState === 'connected'){
            setRTPInterval()
        }
    }
}

function connStateCallback2() {
    if (pc2) {
        const {connectionState} = pc2;
        console.log(`pc2 connection state change callback, state: ${connectionState}`);
        pc2ConnStateDiv.textContent += ` => ${connectionState}`;
    }
}
function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}

function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function onIceCandidate(pc, event) {
    getOtherPc(pc)
        .addIceCandidate(event.candidate)
        .then(() => onAddIceCandidateSuccess(pc), err => onAddIceCandidateError(pc, err));
    console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess() {
    console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
    console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}

/***************************************************Display statistics************************************************/
function setRTPInterval(){
    if(rtpTimer){
        return
    }

    rtpTimer = setInterval(() => {
        if (pc1 && pc2) {
            showLocalStats()

            // pc1.getStats(null).then(showLocalStats, err => console.log(err));
            // pc2.getStats(null).then(showLocalStats, err => console.log(err));
        } else {
            console.log('Not connected yet');
        }
        // Collect some stats from the video tags.
        if (video1.videoWidth) {
            const width = video1.videoWidth;
            const height = video1.videoHeight;
            localVideoStatsDiv.innerHTML = `<strong>Video dimensions:</strong> ${width}x${height}px`;
        }
        if (video2.videoWidth) {
            const rHeight = video2.videoHeight;
            const rWidth = video2.videoWidth;
            remoteVideoStatsDiv.innerHTML = `<strong>Video dimensions:</strong> ${rWidth}x${rHeight}px`;
        }
    }, 1000);
}

function showLocalStats(){
    pc1.getStats(null).then(function (report) {
        let statsData = {}
        report.forEach(item => {
            statsData[item.id] = deepCopy(item)
        })

        processStats(statsData)
    }, function (error){
        console.error(error)
    })
}

function processStats(report){
    let statsNeed = {}
    for (let key in report) {
        let statstype = (report[key].type === 'inbound-rtp') ? 'local_in' : (report[key].type === 'outbound-rtp') ? 'local_out' : (report[key].type === 'remote-inbound-rtp') ? 'remote_in' : null
        let stats_id = 'ssrc_' + report[key].ssrc

        if (statstype) {
            if(statstype && statstype.indexOf('local') >= 0){
                statsNeed[stats_id] = statsNeed[stats_id] ? objectDeepCopy(report[key], statsNeed[stats_id]) : objectDeepCopy(report[key])
            } else if (statsNeed[stats_id] && statstype === 'remote_in') {
                statsNeed[stats_id].packetsLost = report[key].packetsLost
                if(report[key].hasOwnProperty('fractionLost')){
                    statsNeed[stats_id].fractionLost = report[key].fractionLost
                }
            }
            statsNeed[stats_id].roundTripTime = report[key].hasOwnProperty('roundTripTime') ? Number(report[key].roundTripTime) * 1000 : null
            statsNeed[stats_id].jitter = report[key].hasOwnProperty('jitter') ? Number(report[key].jitter) : null
        }
    }

    for (let key in statsNeed) {
        let codeDetail = report[statsNeed[key].codecId] || null
        let trackDetail = report[statsNeed[key].trackId] || null
        if (codeDetail) {
            for (let keyIn in codeDetail) {
                if (keyIn !== 'id' && keyIn !== 'type' && keyIn !== 'mimeType') {
                    statsNeed[key][keyIn] = codeDetail[keyIn]
                }

                if (keyIn === 'mimeType') {
                    statsNeed[key].codecName = codeDetail[keyIn].split('/')[1]
                }
            }
        }

        if (trackDetail) {
            for (let keyIn in trackDetail) {
                if (keyIn !== 'id' && keyIn !== 'type') {
                    statsNeed[key][keyIn] = trackDetail[keyIn]
                }
            }
        }

        for (let keyId in statsNeed[key]) {
            if (keyId.toLocaleLowerCase().indexOf('id') >= 0 || keyId === 'kind') {
                delete(statsNeed[key][keyId])
            }
        }
    }

    for(let key in statsNeed){
        if(!stats){
            stats = {}
        }
        if(stats[key]){
            if(stats[key].hasOwnProperty('packetsReceived')){
                statsNeed[key].prevPacketsReceived = stats[key].packetsReceived
            }
            if(stats[key].hasOwnProperty('packetsSent')){
                statsNeed[key].prevPacketsSent = stats[key].packetsSent
            }
            if(stats[key].hasOwnProperty('packetsLost')){
                statsNeed[key].prevPacketsLost = stats[key].packetsLost
            }
            if(stats[key].hasOwnProperty('bytesReceived')){
                statsNeed[key].prevBytesReceived = stats[key].bytesReceived
            }
            if(stats[key].hasOwnProperty('bytesSent')){
                statsNeed[key].prevBytesSent = stats[key].bytesSent
            }
            if(stats[key].hasOwnProperty('timestamp')){
                statsNeed[key].prevTimestamp = stats[key].timestamp
            }
        }
    }

    stats = deepCopy(statsNeed)
    rtpInfo = getLossRate(statsNeed)

    console.log('stats:',  JSON.stringify(stats, null, '    '))
    // console.warn('getLossRate rtpInfo:', JSON.stringify(rtpInfo, null, '    '))
    previewGetStatsResult(pc1, rtpInfo)
}

function previewGetStatsResult(peer, result){
    Object.keys(result).forEach(function (item){
        let info = result[item]
        let type = info.mediaType

        document.getElementById('peer' + peer.idx + `-${type}-fractionLost`).innerHTML = info.fractionLost;
        document.getElementById('peer' + peer.idx + `-${type}-lossRate`).innerHTML = info.lossRate
        document.getElementById('peer' + peer.idx + `-${type}-jitter`).innerHTML = info.jitter;
        document.getElementById('peer' + peer.idx + `-${type}-latency`).innerHTML = info.averageLatency + 'ms';
        document.getElementById('peer' + peer.idx + `-${type}-MOS`).innerHTML = calculateMOS(info.averageLatency, info.jitter, info.packetsLossRate);
    })
}

/**
 * PacketLoss:  丢包率
 *              这是从未从我们这里到达目标服务器（或中间跃点）然后再次返回的数据包的百分比。如果我们发送了 100 个数据包并且只收到了 97 个（3 个没有成功），那么我们有 3% 的数据包丢失。
 * AverageLatency:  平均延迟
 *              平均延迟（在 PingPlotter 中）是数据包从您的计算机到达目标服务器然后再次返回所需的平均（平均）时间。
 *              平均延迟是所有延迟的总和除以我们正在测量的样本数。如果我们发出 100 个样本并收到 97 个样本，则计算所有延迟的总和并除以 97 得到平均值。
 *              5 个具有以下延迟的样本：136、184、115、148、125（按此顺序）。平均延迟为 142 （将它们相加，除以 5）
 * Jitter:  抖动
 *          “抖动”是通过获取样本之间的差异来计算的。
 *          136 至 184，差异 = 48
 *          184 至 115，差异 = 69
 *          115 到 148，diff = 33
 *           148 到 125，diff = 23
 *          （注意 5 个样本只有 4 个差异）。总差为 173 - 因此抖动为 173 / 4，即 43.25。
 */
function calculateMOS(latency, jitter, packetsLost){
    // console.log(latency, jitter, packetsLost)
    let R
    let EffectiveLatency = ( latency + jitter * 2 + 10 )
    if (EffectiveLatency < 160) {
        R = 93.2 - (EffectiveLatency / 40)
    }else {
        R = 93.2 - (EffectiveLatency - 120) / 10
    }

    R = R - (packetsLost * 2.5)
    let MOS = 1 + (0.035) * R + (.000007) * R * (R-60) * (100-R)
    return MOS
}

/***
 * 计算丢包率和带宽
 * 丢包率计算：
 *  （1）收流:  (packetsLost - prevPacketsLost)/(packetsReceived - prevPacketsReceived)
 *  (2) 发流: (packetsLost - prevPacketsLost)/(packetsSent - prevPacketsSent)
 * 带宽：(bytesReceived-prevBytesReceived)*8*1000/(timestamp-prevTimestamp)(bps)
 */
function getLossRate(stats){
    let lossRates = {};

    function getBandWidth(stats) {
        let bandWidthObject = {};
        let travelTime;
        let curentBytes;

        if (stats && stats.prevTimestamp) {
            travelTime = Number(stats.timestamp) - Number(stats.prevTimestamp)
        } else {
            travelTime = 0
        }

        if (stats && stats.hasOwnProperty('prevBytesReceived')) {
            curentBytes = Number(stats.bytesReceived) - Number(stats.prevBytesReceived)
        } else if (stats && stats.hasOwnProperty('prevBytesSent')) {
            curentBytes = Number(stats.bytesSent) - Number(stats.prevBytesSent)
        } else {
            curentBytes = 0
        }

        if (curentBytes >= 0 && travelTime > 0) {
            bandWidthObject.bandWidthVal = curentBytes * 8 * 1000/ travelTime
        } else {
            bandWidthObject.bandWidthVal = 0
        }

        bandWidthObject.bandWidthUnit = 'bps'

        return bandWidthObject
    }

    for (let key in stats) {
        let lossRate = {
            bandWidthVal: 0,
            bandWidthUnit: 'bps',
            codecName: '',
            fractionLost: '',
            lossRate: '0.00%',
            packetsLossRate: '',
            averageLatency: '',
            mediaType: '',
            ssrc: key
        };
        let statsNow = stats[key]
        let packetsLossRate;

        if (statsNow.hasOwnProperty('prevPacketsSent') && statsNow.hasOwnProperty('prevPacketsLost')) {
            if(statsNow.hasOwnProperty('fractionLost')){
                packetsLossRate = statsNow.fractionLost
            }else{
                let curSent = Number(statsNow.packetsSent) - Number(statsNow.prevPacketsSent)
                let curLost = Number(statsNow.packetsLost) - Number(statsNow.prevPacketsLost)

                if (curLost >= 0 && curSent > 0) {
                    packetsLossRate = curLost / curSent
                } else if (curSent === 0) {
                    packetsLossRate = 0
                } else {
                    // 因packetsLost和packetsSent都是累积的, 但从浏览器接口getStats获得的参数有时候会出现本次的packetsLost或者packetsSent小于上次stats,
                    // 这种情况下,采用negative表示丢包率计算不准确,这种情况下保持上次丢包率展示
                    packetsLossRate = 'negative'
                }
            }

        } else if (statsNow.hasOwnProperty('prevPacketsReceived') && statsNow.hasOwnProperty('prevPacketsLost')) {
            let curReceived = Number(statsNow.packetsReceived) - Number(statsNow.prevPacketsReceived)
            let curLost = Number(statsNow.packetsLost) - Number(statsNow.prevPacketsLost)

            if(curLost >= 0 && curReceived >= 0){
                if (curReceived === 0 && curLost !== 0 && Number(statsNow.packetsReceived) !== 0 && Number(statsNow.packetsLost) !== 0) {
                    packetsLossRate = 1
                } else {
                    packetsLossRate = curLost / (curReceived + curLost)
                }
            } else {
                // 因packetsLost和packetsReceived都是累积的,但从浏览器接口pc.getStats获得的参数有时候会出现本次的packetsLost和packetsReceived小于上次stats,
                // 这种情况下,采用negative表示丢包率计算不准确,这种情况下保持上次丢包率展示.
                packetsLossRate = 'negative'
            }
        }

        if (typeof(packetsLossRate) === "number" && packetsLossRate.toString() !== 'NaN') {
            if (packetsLossRate > 1) {
                packetsLossRate = 1
            }
            lossRate.lossRate = (packetsLossRate * 100).toFixed(2) + '%'
            lossRate.packetsLossRate = packetsLossRate
        } else {
            lossRate.lossRate = 'negative'
        }

        if (statsNow.codecName) {
            lossRate.codecName = statsNow.codecName.toUpperCase();
        }

        if(statsNow.hasOwnProperty('roundTripTime')){
            lossRate.roundTripTime = statsNow.roundTripTime
        }
        if(statsNow.hasOwnProperty('jitter')){
            lossRate.jitter = statsNow.jitter
        }
        if(statsNow.hasOwnProperty('bytesReceived')){
            lossRate.bytesReceived = statsNow.bytesReceived
        }
        if(statsNow.hasOwnProperty('packetsReceived')){
            lossRate.packetsReceived = statsNow.packetsReceived
        }
        if(statsNow.hasOwnProperty('bytesSent')){
            lossRate.bytesSent = statsNow.bytesSent
        }
        if(statsNow.hasOwnProperty('packetsSent')){
            lossRate.packetsSent = statsNow.packetsSent
        }
        if(statsNow.hasOwnProperty('totalPacketSendDelay')){
            lossRate.averageLatency = (statsNow.totalPacketSendDelay / statsNow.bytesSent) * 1000  // 转换为毫秒
        }
        if(statsNow.hasOwnProperty('mediaType')){
            lossRate.mediaType = statsNow.mediaType
        }
        if(statsNow.hasOwnProperty('fractionLost')){
            lossRate.fractionLost = statsNow.fractionLost
        }

        if (statsNow.frameWidth && statsNow.frameWidth !== '0' && statsNow.frameHeight && statsNow.frameHeight !== '0') {
            lossRate.resolution = statsNow.frameWidth + ' X ' + statsNow.frameHeight
        }

        lossRate.bandWidthVal = getBandWidth(statsNow).bandWidthVal;
        lossRate.bandWidthUnit = getBandWidth(statsNow).bandWidthUnit;

        lossRates[key] = lossRate
    }

    return lossRates
}

function deepCopy (obj) {
    if (getType(obj) === 'nomal') {
        return obj
    } else {
        var newObj = getType(obj) === 'Object' ? {} : []
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = deepCopy(obj[key])
            }
        }
    }
    return newObj
}
function getType (obj) {
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        return 'Object'
    } else if (Object.prototype.toString.call(obj) === '[object Array]') {
        return 'Array'
    } else {
        return 'nomal'
    }
}

function objectDeepCopy(obj, objBefore){
    function getType (obj) {
        if (Object.prototype.toString.call(obj) === '[object Object]') {
            return 'Object'
        } else if (Object.prototype.toString.call(obj) === '[object Array]') {
            return 'Array'
        } else {
            return 'nomal'
        }
    }

    if (getType(obj) === 'nomal') {
        return obj
    } else {
        var newObj = objBefore ? deepCopy(objBefore) : getType(obj) === 'Object' ? {} : []
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = objectDeepCopy(obj[key])
            }
        }
    }
    return newObj
}
