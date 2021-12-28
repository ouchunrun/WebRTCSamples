
/**
 * get Cookies
 * @param key
 * @returns {*}
 */
function getConfFromCookies(key) {
    if (!key || key === ""){
        console.warn('INVALID PARAMETER!')
        return undefined
    }

    let result
    if (document.cookie.length > 0) {
        key = key + "=";
        let startIndex = document.cookie.indexOf(key)
        if (startIndex >= 0) {
            result = document.cookie.substring(startIndex + key.length).split(";")[0];
        }
    }
    console.info('Get conf from cookies, ' + key + " " + result)
    return result
}

/**
 *  Use the standard b=AS:BITRATE (Chrome) or b=TIAS:BITRATE (Firefox) attributes in the SDP for the audio or video channel
 * @param sdp
 * @param media
 * @param ASBitrate
 * @returns {*}
 */
function setMaxBitrate(sdp, media, ASBitrate) {
    ASBitrate = ASBitrate ? ASBitrate : getConfFromCookies('maxBitRate')
    if(!ASBitrate){
        console.warn('No bitrate has been set')
        return sdp
    }

    // find m line place
    let line = sdp.indexOf('m=' + media)
    if(line === -1){
        console.warn('Could not find the m line for ' + media)
        return sdp
    }
    console.info('Find the m line for ' + media + ' at line ' + line)

    // add a new b line
    function addNewLine(_sdp, type, bitrate) {
        let lines = _sdp.split("\n")
        let mline = -1

        // find m line place
        for(let i = 0; i<lines.length; i++){
            if(lines[i].indexOf('m=' + media) >= 0){
                mline = i
                break
            }
        }

        // pass the m line
        mline++

        // Ship i and c lines
        while (lines[mline].indexOf('i=') >= 0 || lines[mline].indexOf('c=') >= 0){
            console.info(' Ship i and c lines')
            mline++
        }

        // add a new b=AS or b=TIAS line
        console.warn('Adding new b line before line ' + mline)
        let newLines = lines.slice(0, mline)
        newLines.push('b=' + type + ':' + bitrate)
        newLines = newLines.concat(lines.slice(mline, lines.length))

        return newLines.join('\n')
    }

    let replacement
    if(sdp.indexOf('b=AS') >= 0){
        console.warn('Replaced b=AS line at line '+ line)
        replacement = "b=AS:" + ASBitrate
        sdp = sdp.replace(/b=AS:([a-zA-Z0-9]{3,4})/, replacement);
    }else {
        sdp = addNewLine(sdp, 'AS', ASBitrate)
    }

    let TIASBitrate = ASBitrate * 1000
    if(sdp.indexOf('b=TIAS') >= 0){
        console.warn('Replaced b=TIAS line at line '+ line)
        replacement = "b=TIAS:" + TIASBitrate
        sdp = sdp.replace(/b=TIAS:([a-zA-Z0-9]{6,7})/, replacement);

    }else {
        sdp = addNewLine(sdp, 'TIAS', TIASBitrate)
    }

    return sdp
}

/**
 * set x-google-xxx-bitrate
 * @param sdp
 * @param bitrate
 * @returns {string}
 */
function setXgoogleBitrate(sdp, bitrate) {
    let lines = sdp.split("\n")
    let replacement

    // get all pt number, except rtx\red\ulpfec
    let ptArr = []
    let validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
    sdp.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function(line) {
        if(line.indexOf('a=rtpmap') >= 0 && line.indexOf('rtx') < 0 && line.indexOf('red') < 0 && line.indexOf('ulpfec') < 0){
            let pt =line.split(" ")[0].split(":")[1]
            ptArr.push(pt)
        }
    });
    console.warn(ptArr)

    // add new a=fmtp line if rtpmap is not have a=fmtp line
    for(let j = 0; j<ptArr.length; j++){
        if(sdp.indexOf('a=fmtp:' + ptArr[j]) < 0){
            for(let k = 0; k<lines.length; k++){
                if(lines[k].indexOf('a=rtpmap:' + ptArr[j]) >= 0){
                    // Skip a=rtpmap lines for encoding
                    k++
                    let newLines = lines.slice(0, k)
                    newLines.push('a=fmtp:' + ptArr[j])
                    lines = newLines.concat(lines.slice(k, lines.length))
                }
            }
        }
    }


    // 考虑：a=fmtp:100 这种形式，添加时首个不要分号，要空格
    // 有的PT没有x-google-min-bitrate=1024;x-google-start-bitrate=1536;x-google-max-bitrate=2048字段： 有则修改，没有则添加
    for(let i = 0; i<lines.length; i++){
        if(lines[i].indexOf('a=fmtp:') >= 0){
            // filter rtx and ulpfec
            if(lines[i].indexOf('apt=') >= 0 || lines[i].indexOf('ulpfec') >= 0){
                continue
            }

            // filter a=fmtp:100 format
            if(lines[i].split(' ').length === 1){
                replacement = " x-google-min-bitrate=" + bitrate + ";x-google-start-bitrate=" + bitrate + ";x-google-max-bitrate=" + bitrate
                lines[i] = lines[i] + replacement
            }else {
                if(lines[i].indexOf('x-google-min-bitrate') >= 0){
                    replacement = "x-google-min-bitrate=" + bitrate
                    lines[i] = lines[i].replace(/x-google-min-bitrate=([a-zA-Z0-9]{1,8})/, replacement);
                }else {
                    replacement = ";x-google-min-bitrate=" + bitrate
                    lines[i] = lines[i] + replacement
                }

                if(lines[i].indexOf('x-google-start-bitrate') >= 0){
                    replacement = "x-google-start-bitrate=" + bitrate
                    lines[i] = lines[i].replace(/x-google-start-bitrate=([a-zA-Z0-9]{1,8})/, replacement);
                } else {
                    replacement = ";x-google-start-bitrate=" + bitrate
                    lines[i] = lines[i] + replacement
                }

                if(lines[i].indexOf('x-google-max-bitrate') >= 0){
                    replacement = "x-google-max-bitrate=" + bitrate
                    lines[i] = lines[i].replace(/x-google-max-bitrate=([a-zA-Z0-9]{1,8})/, replacement);
                }else {
                    replacement = ";x-google-max-bitrate=" + bitrate
                    lines[i] = lines[i] + replacement
                }
            }
        }
    }

    return lines.join('\n')
}

/**
 * remove REMB Negotiation
 * @param sdp
 * @returns {string}
 */
function removeREMBField(sdp) {
    let lines = sdp.split("\n")

    for(let i = 0; i<lines.length; i++){
        if (lines[i].indexOf('goog-remb') >= 0 || lines[i].indexOf('transport-cc') >= 0) {
            console.info('remove goog-remb or transport-cc filed')
            lines.splice(i, 1)
            i--
        }
    }
    return lines.join('\n')
}

function removeBLine(sdp) {
    if(!sdp){
        return sdp
    }

    var lines = sdp.split("\n")
    for(var i = 0; i<lines.length; i++){
        if (lines[i].indexOf('b=AS') >= 0 || lines[i].indexOf('b=TIAS') >= 0) {
            lines.splice(i, 1)
            i--
        }
    }
    sdp = lines.join('\n')
    return sdp
}

function removeRembAndTransportCCField(sdp) {
    if(!sdp){
        tsk_utils_log_error("removeRembAndTransportCCField: Invalid argument");
        return sdp
    }

    var lines = sdp.split("\n")

    for(var i = 0; i<lines.length; i++){
        if (lines[i].indexOf('goog-remb') >= 0 || lines[i].indexOf('transport-cc') >= 0) {
            lines.splice(i, 1)
            i--
        }
    }

    sdp = lines.join('\n')
    return sdp
}

function bitrateControl(sdp) {
    if(!sdp){
        console.warn("removeREMBField: Invalid argument");
        return sdp
    }

    let maxBitRate
    let bitrateList = document.getElementById('bitrateEnabled').options
    let select= bitrateList[bitrateList.selectedIndex]
    console.log("select: ", select.value)
    if(select.value === 'true'){
        console.warn('bitrate is enabled')
        maxBitRate = document.getElementById('ASBitrate').value
    }else {
        console.warn('bitrate is disabled')
        return sdp
    }

    console.info('Get maxBitRate, ' + maxBitRate)

    sdp = setMaxBitrate(sdp, 'video', maxBitRate)
    sdp = setXgoogleBitrate(sdp, maxBitRate)
    sdp = removeREMBField(sdp)
    return sdp
}

function setCookie(name, value) {
    let date = new Date();
    let ms = 3000 * 3600 * 1000;
    date.setTime(date.getTime() + ms);
    document.cookie= name + "=" + value + ";expires="+date.toGMTString() +";path=/;domain=.ipvideotalk.com";
}

setCookie('maxBitRate', 2048)
setCookie('maxResolution', 1080)

/**
 * 修改remote SDP 中的profile-level-id
 * @param sdp
 * @returns {*}
 */
function setProfileLevelId(sdp) {
    if(!sdp){
        console.warn("removeREMBField: Invalid argument");
        return sdp
    }

    let levelIdc = document.getElementById('setLevelId').value
    if(!levelIdc){
        console.warn("empty string")
        return
    }
    console.warn("设置的profile-level-id为： ", levelIdc)

    let lines = sdp.split("\n")
    for(let i = 0; i<lines.length; i++){
        if (lines[i].indexOf('profile-level-id=') >= 0 ) {
            let replacement = 'profile-level-id=' + levelIdc
            lines[i] = lines[i].replace(/profile-level-id=([a-zA-Z0-9]{6})/, replacement);
            console.info('修改profile-level-id ')
        }
    }

    sdp = lines.join('\n')
    return sdp
}
