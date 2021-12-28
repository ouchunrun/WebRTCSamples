
function enumDevices(deviceInfoCallback) {
    if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined) {
        console.error("browser don't support enumerate devices")
        return
    }

    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        var microphone = []
        var speaker = []
        var camera = []
        var screenResolution = []
        var isConstraintsKeywordSupport = true
        for (var i = 0; i < deviceInfos.length; i++) {
            var deviceInfo = deviceInfos[i]
            // if(deviceInfo.deviceId === 'default' || deviceInfo.deviceId === 'communications'){
            //     continue
            // }
            if (deviceInfo.kind === 'audioinput') {
                microphone.push({
                    label: deviceInfo.label,
                    deviceId: deviceInfo.deviceId,
                    groupId: deviceInfo.groupId,
                    status: 'available',
                })
            }
            if (deviceInfo.kind === 'audiooutput') {
                speaker.push({
                    label: deviceInfo.label,
                    deviceId: deviceInfo.deviceId,
                    groupId: deviceInfo.groupId,
                    status: 'available',
                })
            }
            if (deviceInfo.kind === 'videoinput') {
                camera.push({
                    label: deviceInfo.label,
                    deviceId: deviceInfo.deviceId,
                    groupId: deviceInfo.groupId,
                    status: 'available',
                    capability: []
                })
            }
        }

        screenResolution.push({
            width: window.screen.width,
            height: window.screen.height,
        })

        var result = {
            microphones: microphone,
            speakers: speaker,
            cameras: camera,
            screenResolution: screenResolution,
            isConstraintsKeywordSupport: isConstraintsKeywordSupport
        }

        deviceInfoCallback(result)
        // return result
    }).catch(function (err) {
        console.error(err)
    })
}


window.onload = function () {
    console.warn("windows onload ...")
    enumDevices(deviceInfo => {
        let videoInputList = []
        let audioOutputList = []
        let microphoneList = []
        console.warn("deviceInfo: ", deviceInfo)
        // console.warn('deviceInfo :' + JSON.stringify(deviceInfo, null, '    '))
        if (deviceInfo.cameras) {
            videoInputList.push('<option>请选择</option>>')
            for (let i = 0; i < deviceInfo.cameras.length; i++) {
                var currentCamera = deviceInfo.cameras[i]
                if (!currentCamera.label) {
                    currentCamera.label = 'camera' + i
                }
                videoInputList.push('<option class="cameraOption" value="' + currentCamera.deviceId + '">' + currentCamera.label + '</option>')
                console.log('camera: ' + currentCamera.label)
            }
            document.getElementById('videoList').innerHTML = videoInputList.join('')
        }

        if (deviceInfo.speakers) {
            console.warn("麦克风：", deviceInfo.speakers)
            audioOutputList.push('<option>请选择</option>>')
            for (let j = 0; j < deviceInfo.speakers.length; j++) {
                var currentSpeaker = deviceInfo.speakers[j]
                if (!currentSpeaker.label) {
                    currentSpeaker.label = 'speaker' + j
                }
                audioOutputList.push('<option class="SpeakerOption" value="' + currentSpeaker.deviceId + '">' + currentSpeaker.label + '</option>')
                console.log('speaker: ' + currentSpeaker.label)
            }
            document.getElementById('audioList').innerHTML = audioOutputList.join('')
        }

        if (deviceInfo.microphones) {
            console.warn("扬声器：, ", deviceInfo.microphones)
            microphoneList.push('<option>请选择</option>>')
            for (let k = 0; k < deviceInfo.microphones.length; k++) {
                var currentMicrophones = deviceInfo.microphones[k]
                if (!currentMicrophones.label) {
                    currentMicrophones.label = 'microphone' + k
                }
                microphoneList.push('<option class="microphoneOption" value="' + currentMicrophones.deviceId + '">' + currentMicrophones.label + '</option>')
                console.log('microphone: ' + currentMicrophones.label)
            }
            document.getElementById('microphones').innerHTML = microphoneList.join('')
        }

    }, function (error) {
        console.error('enum device error: ' + error)
    })
}

function audioVideo() {
    let audioList = document.getElementById('audioList').options
    if(audioList && audioList.length > 0){
        let selectDevice = audioList[audioList.selectedIndex]
        console.warn("selectDevice: ", selectDevice.label)
        var deviceId = selectDevice.value
        console.log("deviceId： ", deviceId)
        if(deviceId === '请选择'){
            console.warn("请先选择扬声器！！！")
            return
        }

        getAudioStream(deviceId, '扬声器', true)

    }else {
        alert('No device here! plug device and Try again!')
    }
}


function getmicrophones() {
    let microphonesList = document.getElementById('microphones').options
    if(microphonesList && microphonesList.length > 0){
        let selectDevice = microphonesList[microphonesList.selectedIndex]
        console.warn("selectDevice: ", selectDevice.label)
        var deviceId = selectDevice.value
        console.log("deviceId： ", deviceId, true)
        if(deviceId === '请选择'){
            console.warn("请先选择麦克风！！！")
            return
        }
        getAudioStream(deviceId, '麦克风', true)
    }else {
        alert('No device here! plug device and Try again!')
    }
}

function getAudioStream(deviceId, type, useDeviceId) {
    console.info("is useDeviceId: ", useDeviceId)
    var constraints = {
        audio: useDeviceId ? { deviceId: deviceId} : true,
        video: false
    }

    console.warn('audio constraints is :' + JSON.stringify(constraints, null, '    '))
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        window.audioStream = stream
        console.warn(type + "  取流成功： ", stream)
        var audioElement = document.getElementById('audio')
        audioElement.srcObject = stream;
    }).catch(function (error) {
        console.error("取流失败！！")
        console.warn("error name: ", error.name)
        console.error(error.toString())
    })
}

function gumForAudio() {
    console.warn("直接获取音频，不使用deviceId，因为使用default会出错")
    getAudioStream(null, "随机", false)
}