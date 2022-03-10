

function getLocalSDP(sdp){
    let parsedSdp = SDPTools.parseSDP(sdp)
    SDPTools.setBundleMaxCompat(parsedSdp)
    // delete codec
    trimCodec(parsedSdp)

    sdp = SDPTools.writeSDP(parsedSdp)
    return sdp
}

function trimCodec(parsedSdp){
    console.warn("parsedSdp: ", parsedSdp)
    if (parsedSdp.media && parsedSdp.media.length) {
        for (let i = 0; i < parsedSdp.media.length; i++) {
            let media = parsedSdp.media[i]
            let codec = ['VP8', 'VP9']
            if (media.type === 'audio') {
                codec = ['G722', 'opus', 'PCMU', 'PCMA', 'telephone-event'] // only keep ['G722', 'opus', 'PCMU', 'PCMA', 'telephone-event']
                SDPTools.removeCodecByName(parsedSdp, i, codec, true)
            } else {
                // move red_ulpfec
                if (localStorage.getItem('test_red_ulpfec_enabled') !== 'true') {
                    console.info('move red && ulpfec')
                    codec.push('red', 'ulpfec')
                }

                // trimH264Codec(parsedSdp, i)
                // let media = parsedSdp.media[index]
                // let priorityCodec = getExternalEncoder(media)
                // let h264Codec = SDPTools.getCodecByName(parsedSdp, i, ['H264'])
                // if (h264Codec && h264Codec.length) {
                //     let removeList = []
                //     if (!priorityCodec) {
                //         let topPriorityCodec = h264Codec.splice(1, h264Codec.length)
                //         removeList.push(topPriorityCodec)
                //
                //         // If profile-level-id does not exist, set to 42e028
                //         for (let i = 0; i < media.fmtp.length; i++) {
                //             if (media.fmtp[i].payload === topPriorityCodec) {
                //                 let config = media.fmtp[i].config
                //                 if (config.indexOf('profile-level-id') < 0) {
                //                     config = config + ';profile-level-id=42e028'
                //                 }
                //             }
                //         }
                //     } else {
                //         h264Codec.forEach(function (pt) {
                //             if (pt !== priorityCodec) {
                //                 removeList.push(pt)
                //             }
                //         })
                //     }
                //     console.warn("删除H264编码：", removeList)
                //     SDPTools.removeCodecByPayload(parsedSdp, i, removeList)
                // }

                SDPTools.removeCodecByName(parsedSdp, i, codec)
            }
        }
    } else {
        console.warn('trimCodec error media: ' + parsedSdp.media)
    }

    console.info('remove local goog-remb and transport-cc')
    SDPTools.removeRembAndTransportCC(parsedSdp)
}

function getExternalEncoder(media){
    let codec
    if (media && media.fmtp && media.fmtp.length) {
        for (let i = 0; i < media.fmtp.length; i++) {
            let config = media.fmtp[i].config
            if (config.indexOf('packetization-mode=1') >= 0 && config.indexOf('profile-level-id=42e0') >= 0) {
                codec = media.fmtp[i].payload
                break
            }
        }
        if (!codec) {
            for (let i = 0; i < media.fmtp.length; i++) {
                let config = media.fmtp[i].config
                if (config.indexOf('packetization-mode=1') >= 0 && config.indexOf('profile-level-id=4200') >= 0) {
                    codec = media.fmtp[i].payload
                    break
                }
            }
        }
    }

    return codec
}

/**
 * Control up bitrate bitrateControl, set before setRemoteDescription
 *  B行AS|TIAS计算：(带宽换算 1Mbps=1000Kbps、1Kbps=1000bps)
 *  1、TIAS=获取的值：如 512kbps时，TIAS=512000 bps
 *  2、AS = TIAS/1000 + 192
 * @returns {*}
 */
function getDecorateRo(sdp, maxBitRate){
    if(!maxBitRate){
        return sdp
    }
    let parsedSdp = SDPTools.parseSDP(sdp)
    for (let i = 0; i < parsedSdp.media.length; i++) {
        let media = parsedSdp.media[i]
        if(media.type === 'video'){
            console.warn("设置带宽 maxBitRate: " + maxBitRate);
            SDPTools.setMediaBandwidth(parsedSdp, i, maxBitRate)
            SDPTools.setXgoogleBitrate(parsedSdp, maxBitRate, i)
            SDPTools.removeRembAndTransportCC(parsedSdp, i)
        }
    }

    sdp = SDPTools.writeSDP(parsedSdp)
    return sdp
}