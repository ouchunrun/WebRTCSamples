/**
 * 创建gsRTC实例
 * @param options
 * @constructor
 */
let GsRTC = function (options){
    let This = this
    if(!This.initializeVirtualBackground()){
        log.info('Initialization failed. Reinitialize the virtual background')
        This.initializeVirtualBackground()
    }
}

GsRTC.prototype.CODE_TYPE = {
    // 接口参数错误时的统一错误码
    PARAMETER_ERROR: 16,
    COMMON_ERROR: 17,

    // 业务错误码 100 - 199
    INCOMING_CALL_CANCELED: 101,  // 来电被取消
    COULD_NOT_ESTABLISH_NEW_CALL: 102,
    FAILED_TO_CALL: 103, // 通话失败Code,暂时没有用上
    UNSUPPORT_CALL_TYPE: 104,
    FAILED_TO_REGISTER: 105,
    REQUEST_RESPONSE_TIMEOUT: 106,

    // MIC业务错误码
    FAILED_TO_MUTE_MIC: 110,
    FAILED_TO_UNMUTE_MIC: 111,
    FAILED_TO_GET_AUDIO_STREAM:112,

    // 摄像头业务错误码
    FAILED_TO_ADJUST_RESOLUTION:113,
    FAILED_TO_VIDEO_ON: 114,
    CAMERA_NOT_SUPPORT: 115,
    SERVER_RESOURCE_REACHED_LIMIT: 116,
    FAILED_TO_CLOSE_LOCAL_VIDEO: 117,
    FAILED_TO_OPEN_LOCAL_VIDEO: 118,

    // 服务器错误码
    CODE_NOT_SUPPORT: 119,
    SERVER_CPU_LIMIT: 120,

    // 桌面共享错误码
    CANCEL_TO_SCREEN_SHARE: 121,
    FAILED_TO_SCREEN_SHARE: 122,
    SHARE_STREAM_STOPPED_BY_CONTROL_BAR: 124,
    FAILED_TO_STOP_SCREEN_SHARE: 125,
    FAILED_TO_SWITCH_SCREEN_STREAM: 127,
    FAILED_TO_SWITCH_CALL: 128,

    FAILED_TO_SEND_INFO: 133,
    FAILED_TO_SEND_MESSAGE: 134,
    FAILED_TO_HOLD: 135,
    FAILED_TO_RESUME: 136,

    // websocket重连
    WEBSOCKET_RECONNECTION_FAILED: 137,
    WEBSOCKET_CONNECTING: 138,
    WEBSOCKET_CLOSE: 139,

    // websocket创建失败
    WEBSOCKET_CREATE_FAILED: 140,

    // ICE 重连
    ICE_CONNECTION_FAILED: 151,
    ICE_RECONNECTING: 152,
    ICE_RECONNECTED_FAILED: 153,

    LOCAL_NO_SUPPORT_VIDEO_CODEC: 161,     // 不支持h264
    VIRTUAL_BG_DEPENDENCY_ABNORMAL: 162,  // 虚拟背景模块加载异常

    // 麦克风请求错误码
    MIC_NOT_FOUND: 932,                  // 没有找到可以设备
    MIC_NOT_READABLE: 933,               // 无法读取麦克风设备
    MIC_GUM_TIMEOUT: 934,               // 超时
    MIC_REQUEST_REFUSE: 941,            // 麦克风禁用
    MIC_REQUEST_FAIL: 942,              // 麦克风开启失败
    MIC_REQUEST_CLOSE: 943,
    MIC_TYPE_ERROR: 944,                 // 必须至少请求一个音频或视频

    // 摄像头请求错误码
    VIDEO_REQUEST_REFUSE: 945,           // 摄像头禁用
    VIDEO_REQUEST_OCCUPY: 946,
    VIDEO_GUM_TIMEOUT: 947,               // 超时
    VIDEO_REQUEST_BEYOND: 948,
    VIDEO_REQUEST_FAIL: 949,                // 摄像头开启失败
    VIDEO_NOT_FOUND: 950,                 // 没有找到可以设备
    VIDEO_TYPE_ERROR: 951,                // 必须至少请求一个音频或视频
    VIDEO_NOT_READABLE: 952,              // 无法读取摄像头设备
    VIDEO_REQUEST_OVER_CONSTRAINTS: 953,  // 取流约束超出设备限制能力

    // 共享桌面请求错误码
    SCREEN_NOT_READABLE: 954,
    SCREEN_REQUEST_REFUSE: 955,
    SCREEN_NOT_FOUND: 956,
    SCREEN_INVALID_STATE: 957,
    SCREEN_ABORT_ERROR: 958,
    SCREEN_TYPE_ERROR: 959,
    SCREEN_REQUEST_OVER_CONSTRAINTS: 960,

    // success code
    ACTION_SUCCESS: 999
}

/**
 * initialization the virtual background module
 */
GsRTC.prototype.initializeVirtualBackground = function(){
    let This = this
    if(window.StreamBackgroundEffect){
        log.info('init stream background effect')
        StreamBackgroundEffect.prototype.loadTFLiteModel().then(function(response){
            if(!response){
                log.error('tflite load error')
                return false
            }
            log.info('get tflite and model success')
            This.backgroundEffect = new StreamBackgroundEffect(response)
            This.backgroundPreview = new StreamBackgroundEffect(response)
            return true
        }).catch(function(error){
            log.error('tflite load error:' +  error.message)
            return false
        })
    }
}

GsRTC.prototype.virtualBackgroundPreview = async function(data){
    let This = this
    log.info('virtual background preview', data)
    if(!data.stream || !data.virtualBackgroundOption){
        log.warn('virtual background preview: invalid parameters')
        return
    }
    if(!data.stream.active){
        log.warn('virtual background preview: stream not available')
        return
    }

    if (GsRTC.prototype.getBrowserDetail().browser === 'firefox') {
        let tracks = data.stream.getVideoTracks();
        tracks[0].onended = function () {
            log.warn('track onended: stop preview effect')
            This.backgroundPreview && This.backgroundPreview.stopEffect()
        }
    }else {
        data.stream.oninactive = function () {
            log.warn('stream oninactive: stop preview effect')
            This.backgroundPreview && This.backgroundPreview.stopEffect()
        }
    }

    if(!This.backgroundPreview) {
        log.warn('virtual background preview: invalid dependency reload')
        This.initializeVirtualBackground()
        data && data.callback && data.callback({codeType: This.CODE_TYPE.VIRTUAL_BG_DEPENDENCY_ABNORMAL})
        return data.stream
    }else{
        log.info('stop the previous preview effect processing')
        This.backgroundPreview.stopEffect()
        This.backgroundPreview.setVirtualBackground(data.virtualBackgroundOption)
        let stream = await This.backgroundPreview.startEffect(data.stream)
        log.info('preview stream id: ' + stream.id)
        return stream
    }
}

/**
 * Save virtual background settings
 * @param data
 * @param data.callback: 回调函数
 */
GsRTC.prototype.setBackgroundEffect = function(data){
    let This = this
    log.info('set background effect')
    if(!data || !data.virtualBackgroundOption){
        log.warn('set background effect: invalid parameters')
        return
    }
    if(!This.backgroundEffect){
        log.warn('set background effect: invalid dependency reload')
        This.initializeVirtualBackground()
        data && data.callback && data.callback({codeType: This.CODE_TYPE.VIRTUAL_BG_DEPENDENCY_ABNORMAL})
    }else {
        if(!data.virtualBackgroundOption.backgroundEffectEnabled){
            log.info('stop processing if virtual background not enabled')
            This.backgroundEffect.stopEffect()
        }
        This.backgroundEffect.virtualBackgroundOption = data.virtualBackgroundOption
    }
}


GsRTC.prototype.deviceInit = function (){
    log.info('init device list.')
    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos){
        let videoinputLists = []
        for (let i = 0; i < deviceInfos.length; i++){
            let deviceInfo = deviceInfos[i]
            if (deviceInfo.kind === 'videoinput') {
                videoinputLists.push({
                    label: deviceInfo.label,
                    deviceId: deviceInfo.deviceId,
                    groupId: deviceInfo.groupId,
                })
            }
        }

        if (videoinputLists.length) {
            for (let j = 0; j < videoinputLists.length; j++) {
                if (!videoinputLists[j].label) {
                    videoinputLists[j].label = 'camera' + j
                }
                videoInputList.push('<option class="cameraOption" value="' + videoinputLists[j].deviceId + '">' + videoinputLists[j].label + '</option>')
                console.log('camera: ' + videoinputLists[j].label)
            }
        }
        videoinputList.innerHTML = videoInputList.join('')

    }).catch(function (error){
        console.error(error)
    });
}

/**
 * Browser detector.
 *
 * @return {object} result containing browser and version
 *     properties.
 */
GsRTC.prototype.getBrowserDetail = function () {
    function extractVersion (uastring, expr, pos) {
        let match = uastring.match(expr)
        return match && match.length >= pos && parseInt(match[pos], 10)
    }

    var navigator = window && window.navigator

    // Returned result object.
    var result = {}
    result.browser = null
    result.version = null
    result.UIVersion = null
    result.chromeVersion = null
    result.systemFriendlyName = null

    if(navigator.userAgent.match(/Windows/)){
        result.systemFriendlyName = 'windows'
    }else if(navigator.userAgent.match(/Mac/)){
        result.systemFriendlyName = 'mac'
    }else if(navigator.userAgent.match(/Linux/)){
        result.systemFriendlyName = 'linux'
    }

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
        result.browser = 'Not a browser.'
        return result
    }

    // Edge.
    if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
        result.browser = 'edge'
        result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2)
        result.UIVersion = navigator.userAgent.match(/Edge\/([\d.]+)/)[1] // Edge/16.17017
    } else if (!navigator.mediaDevices && (!!window.ActiveXObject || 'ActiveXObject' in window || navigator.userAgent.match(/MSIE (\d+)/) || navigator.userAgent.match(/rv:(\d+)/))) {
        // IE
        result.browser = 'ie'
        if (navigator.userAgent.match(/MSIE (\d+)/)) {
            result.version = extractVersion(navigator.userAgent, /MSIE (\d+).(\d+)/, 1)
            result.UIVersion = navigator.userAgent.match(/MSIE ([\d.]+)/)[1] // MSIE 10.6
        } else if (navigator.userAgent.match(/rv:(\d+)/)) {
            /* For IE 11 */
            result.version = extractVersion(navigator.userAgent, /rv:(\d+).(\d+)/, 1)
            result.UIVersion = navigator.userAgent.match(/rv:([\d.]+)/)[1] // rv:11.0
        }

        // Firefox.
    } else if (navigator.mozGetUserMedia) {
        result.browser = 'firefox'
        result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1)
        result.UIVersion = navigator.userAgent.match(/Firefox\/([\d.]+)/)[1] // Firefox/56.0

        // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia && window.webkitRTCPeerConnection) {
        // Chrome, Chromium, Webview, Opera, Vivaldi all use the chrome shim for now
        var isOpera = !!navigator.userAgent.match(/(OPR|Opera).([\d.]+)/)
        // var isVivaldi = navigator.userAgent.match(/(Vivaldi).([\d.]+)/) ? true : false;
        if (isOpera) {
            result.browser = 'opera'
            result.version = extractVersion(navigator.userAgent, /O(PR|pera)\/(\d+)\./, 2)
            result.UIVersion = navigator.userAgent.match(/O(PR|pera)\/([\d.]+)/)[2] // OPR/48.0.2685.39
            if (navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2]) {
                result.chromeVersion = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)
            }
        } else {
            result.browser = 'chrome'
            result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)
            result.UIVersion = navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2] // Chrome/61.0.3163.100
        }
    } else if ((!navigator.webkitGetUserMedia && navigator.userAgent.match(/AppleWebKit\/([0-9]+)\./)) || (navigator.webkitGetUserMedia && !navigator.webkitRTCPeerConnection)) {
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
            result.browser = 'safari'
            result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1)
            result.UIVersion = navigator.userAgent.match(/Version\/([\d.]+)/)[1] // Version/11.0.1
        } else { // unknown webkit-based browser.
            result.browser = 'Unsupported webkit-based browser ' + 'with GUM support but no WebRTC support.'
            return result
        }
        // Default fallthrough: not supported.
    } else {
        result.browser = 'Not a supported browser.'
        return result
    }

    return result
}