
/**
 * 设置带宽和优先编码
 * @param sdp
 * @param media
 * @param TIASBitrate
 * @param CodecName
 * @returns {string}
 */
function setMediaBitrateAndCodecPriority(sdp, media,TIASBitrate, CodecName) {
    var lines = sdp.split("\n");
    var line = -1;
    var newLinesForBitrate;
    var newLinesForStartBitrate;
    var PTnumber;
    var codecsReorder;
    var codecs = [];
    var priorityCodecs = [];  // An encoder may have multiple PT values
    var serverUsedCode = [];
    var count = 0;
    var ASBitrate = (TIASBitrate / 1000) + 192
    CodecName = 'H264'

    for(var i = 0; i < lines.length; i++){
        if(lines[i].indexOf("m="+media) >= 0) {
            line = i;
            line++;
            while (lines[line].indexOf("i=") >= 0 || lines[line].indexOf("c=") >= 0) {
                line++;
            }
            if (lines[line].indexOf("b=") >= 0) {
                lines[line] = "b=AS:" + ASBitrate + "\r\nb=TIAS:" + TIASBitrate;
                return lines.join("\n");
            }

            newLinesForBitrate = lines.slice(0, line);
            newLinesForBitrate.push("b=AS:" + ASBitrate + "\r\nb=TIAS:" + TIASBitrate);
            newLinesForBitrate = newLinesForBitrate.concat(lines.slice(line, lines.length));
            break;
        }
    }

    for(var j = line; j < lines.length; j++){
        if(lines[j].indexOf("a=rtpmap") >= 0) {
            line = j;
            line++;
            if (lines[j].indexOf("VP8") >= 0) {
                PTnumber = lines[j].substr(9, 3);
                line++;
                newLinesForStartBitrate = newLinesForBitrate.slice(0, line);
                newLinesForStartBitrate.push("a=fmtp:" + PTnumber + " x-google-start-bitrate=" + ASBitrate);
                newLinesForBitrate = newLinesForStartBitrate.concat(
                    newLinesForBitrate.slice(line, newLinesForBitrate.length)
                );
                count++;

                // Use the slide_video_in Codec , only for chrome
                // Currently unable to get the codec type used by firefox
                if(CodecName !== ""){
                    CodecName === "VP8"?serverUsedCode.push(PTnumber):priorityCodecs.push(PTnumber);
                }
            }
            else if (lines[j].indexOf("H264") >= 0) {
                PTnumber = lines[j].substr(9, 3);
                line++;
                line = line + count;
                newLinesForStartBitrate = newLinesForBitrate.slice(0, line);
                newLinesForStartBitrate.push("a=fmtp:" + PTnumber + " x-google-start-bitrate=" + ASBitrate);
                newLinesForBitrate = newLinesForStartBitrate.concat(
                    newLinesForBitrate.slice(line, newLinesForBitrate.length)
                );
                count++;

                // Use the slide_video_in Codec , only for chrome
                // Currently unable to get the codec type used by firefox
                if(CodecName !== "" ){
                    CodecName === "H264"?serverUsedCode.push(PTnumber):priorityCodecs.push(PTnumber);
                }
            }
            else {
                codecs.push(lines[j].substr(9, 3));
            }
        }
    }

    if(CodecName !== "" && media === "video"){
        var mLineRegex = /^m=video\s[0-9]{1,}\s\w{3,5}(\/\w{3,5})*?\s/;
        codecsReorder = serverUsedCode.concat(priorityCodecs.concat(codecs)).join(" ").replace(/\s+/g, " ");
        for(var k = 0; k < newLinesForBitrate.length; k++){
            if(newLinesForBitrate[k].indexOf("m="+media) === 0) {
                newLinesForBitrate[k] = newLinesForBitrate[k].match(mLineRegex)[0] + codecsReorder;
            }
        }
    }
    newLinesForBitrate = trimH264Codec(newLinesForBitrate)
    return newLinesForBitrate.join("\n");
}

function setMediaBitrateAndCodecPrioritys(sdp, CodecName) {
    return setMediaBitrateAndCodecPriority(sdp, "video", 8000000)
}

var profileIdc = document.getElementById('profileIdc').value;
var profileIop = document.getElementById('profileIop').value;
var packetizationMode = document.getElementById('packetizationMode').value;
/**
 * 处理H264编码
 */
function trimH264Codec(lines) {
    if(profileIdc && profileIop && packetizationMode){
        var levelIdReplacement = 'profile-level-id=' + profileIdc + profileIop;
        var modeReplacement = 'packetization-mode=' + packetizationMode;
        console.warn("levelIdReplacement: ", levelIdReplacement)
        console.warn("modeReplacement： ", modeReplacement)

        for(var i = 0; i<lines.length; i++){
            if(lines[i].indexOf('profile-level-id=') >= 0){
                lines[i] = lines[i].replace(/profile-level-id=([a-zA-Z0-9]{4})/, levelIdReplacement);
                lines[i] = lines[i] + ';max-mbps=40800;max-fs=8160;x-google-start-bitrate=2000;x-google-min-bitrate=100;x-google-max-bitrate=8000'
            }

            if(lines[i].indexOf('packetization-mode=' >= 0)){
                lines[i] = lines[i].replace(/packetization-mode=([a-zA-Z0-9]{1})/, modeReplacement);
            }
        }
    }

    return lines
}

/**
 * 设置上行编码码率参数
 */
function setEncodingParameters(pc) {
    var sender = pc.getSenders()[0]
    var videoParameters = sender.getParameters();
    if (JSON.stringify(videoParameters) === '{}') {
        videoParameters.encodings = []
        videoParameters.encodings[0] = {}
    }

    videoParameters.encodings[0].maxBitrate = 1500000
    // videoParameters.encodings[0].degradationPreference = 'maintain-framerate';   // for firefox
    videoParameters.degradationPreference = 'maintain-framerate';
    // videoParameters.degradationPreference = 'maintain-resolution';
    // videoParameters.encodings[0].scaleResolutionDownBy = 2

    // console.info("set encoding maxBitrate: " +  videoParameters.encodings[0].maxBitrate)
    console.info("set encoding degradationPreference: " +  JSON.stringify(videoParameters, null, '   '))
    sender.setParameters(videoParameters).then(function () {
    }).catch(function (error) {
        console.info('set encoding parameters error')
        console.error(error)
    })
}

