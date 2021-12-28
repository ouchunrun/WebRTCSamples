
/**
 * 处理sdp
 * @param sdp
 * @returns {string}
 */
function decorateSdp(sdp){
    let parsedSdp = SDPTools.parseSDP(sdp)
    var framerate = document.getElementById('setFramer').value

    // for(let i = 0; i<parsedSdp.media.length; i++){
    //     SDPTools.setResolution(parsedSdp, i, 640, 360)
    //
    //     if(framerate){
    //         console.warn("set framerate...")
    //         SDPTools.setFrameRate(parsedSdp, i, framerate)
    //     }
    // }

    let media = parsedSdp.media[0]
    var vp8PTList = []
    var h264PTList = []
    for(var i = 0; i<media.rtp.length; i++){
        var item = parsedSdp.media[0].rtp[i]
        if(item.codec === 'VP8'){
            vp8PTList.push(item.payload)
        }else if(item.codec === 'H264'){
            h264PTList .push(item.payload)
        }
    }

    // 删除特定编码
    let setDeleteCode = document.getElementById('setDeleteCode').value
    if(setDeleteCode){
        let codec = ['VP9']
        codec.push(setDeleteCode)
        console.warn("删除编码", codec)
        SDPTools.removeCodecByName(parsedSdp, 0, codec)
        media.payloads = media.payloads.trim()
    }

    // 设置max-fs 或 max-mbps
    let maxFs = document.getElementById('setMaxFs').value
    let maxMbps = document.getElementById('setMaxMbps').value
    let maxFr = document.getElementById('setMaxFr').value
    for(var j = 0; j<media.fmtp.length; j++){
        var item_ = media.fmtp[j]
        if(vp8PTList.includes(item_.payload)  && maxFs){
            if(media.fmtp[j].config.split(' ').length <= 1){
                media.fmtp[j].config = media.fmtp[j].config + ' max-fs=' + maxFs
            }else {
                media.fmtp[j].config = media.fmtp[j].config + ';max-fs=' + maxFs
            }
        }else if(h264PTList.includes(item_.payload)){
            if(maxMbps){
                media.fmtp[j].config = media.fmtp[j].config + ';max-mbps=' + maxMbps
            }
            if(maxFs){
                media.fmtp[j].config = media.fmtp[j].config + ';max-fs=' + maxFs
            }
            if(maxFr){
                media.fmtp[j].config = media.fmtp[j].config + ';max-fr=' + maxFr
            }
        }
    }

    var framerate = document.getElementById('setFramer').value
    if(!media.framerate && framerate){
        media.framerate = document.getElementById('setFramer').value
    }

    sdp = SDPTools.writeSDP(parsedSdp)
    return sdp
}


/**
 * 显示 remote status
 * @param results
 */
function showRemoteStats(results) {
    let statsString = dumpStats(results);

    receiverStatsDiv.innerHTML = '<h2>Receiver stats</h2>' + statsString;
    // calculate video bitrate
    results.forEach(function(report) {
        if(report.framesPerSecond){
            remote_framesPerSecond.innerHTML = '<strong>framesPerSecond:</strong> ' + report.framesPerSecond;
        }
        if(report.framerateMean){
            remote_framesPerSecond.innerHTML = '<strong>framerateMean:</strong> ' + report.framerateMean;
        }

        let now = report.timestamp;
        let bitrate;
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
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

/**
 * 显示 local status
 * @param results
 */
function showLocalStats(results) {
    let statsString = dumpStats(results);
    senderStatsDiv.innerHTML = '<h2>Sender stats</h2>' + statsString;

    results.forEach(function(report) {
        if(report.framesPerSecond){
            local_framesPerSecond.innerHTML = '<strong>framesPerSecond:</strong> ' + report.framesPerSecond;
        }
        if(report.framerateMean){
            local_framesPerSecond.innerHTML = '<strong>framerateMean:</strong> ' + report.framerateMean;
        }
    });
}

// Display statistics
setInterval(function() {
    if (localPeerConnection && remotePeerConnection) {
        remotePeerConnection.getStats(null)
            .then(showRemoteStats, function(err) {
                log.info(err);
            });
        localPeerConnection.getStats(null)
            .then(showLocalStats, function(err) {
                log.info(err);
            });
    } else {
        // log.info('Not connected yet');
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
    results.forEach(function(res) {
        if(res.type === 'outbound-rtp' || res.type === 'remote-inbound-rtp' || res.type === 'inbound-rtp' || res.type === 'remote-outbound-rtp'){
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
        }else {

        }
    });
    return statsString;
}
