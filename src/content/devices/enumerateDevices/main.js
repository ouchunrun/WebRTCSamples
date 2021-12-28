var videoInputList = []
var audioOutputList = []
var audioInputListList = []
var deviceInfoDiv = document.getElementById('deviceInfoDiv')

/**
 * 获取设备枚举列表
 * @param deviceInfoCallback
 */
function enumDevices(deviceInfoCallback) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn("browser don't support enumerateDevices() .");
        return;
    }

    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        var audioinput = []
        var audiooutput = []
        var camera = []
        for (var i = 0; i < deviceInfos.length; i++) {
            var deviceInfo = deviceInfos[i]
            if(deviceInfo.deviceId === 'default' || deviceInfo.deviceId === 'communications'){
                if(localStorage.showDefaultCommunicationsDevice === 'false'){
                    continue
                }
            }
            if (deviceInfo.kind === 'audioinput') {
                audioinput.push({
                    label: deviceInfo.label,
                    deviceId: deviceInfo.deviceId,
                    groupId: deviceInfo.groupId,
                    status: 'available',
                })
            }
            if (deviceInfo.kind === 'audiooutput') {
                audiooutput.push({
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


        if (deviceInfoCallback) {
            deviceInfoCallback({
                audioinput: audioinput,
                audiooutput: audiooutput,
                cameras: camera,
            })
        } else {
            return {
                audioinput: audioinput,
                audiooutput: audiooutput,
                cameras: camera,
            }
        }
    }).catch(function (err) {
        console.error(err)
        deviceInfoCallback(err)
    })
}

/**
 * 在页面显示device信息
 * @param deviceInfo
 */
function handleDeviceData(deviceInfo){
    console.warn("deviceInfo: ", deviceInfo)
    console.warn("deviceInfo: \n", JSON.stringify(deviceInfo, null, '    '))
    deviceInfoDiv.value = JSON.stringify(deviceInfo, null, '    ' );

    if (deviceInfo.cameras) {
        for (var i = 0; i < deviceInfo.cameras.length; i++) {
            if (!deviceInfo.cameras[i].label) {
                deviceInfo.cameras[i].label = 'camera' + i
            }
            videoInputList.push('<option class="cameraOption" value="' + deviceInfo.cameras[i].deviceId + '">' + deviceInfo.cameras[i].label + '</option>')
        }
        document.getElementById('videoList').innerHTML = videoInputList.join('')
    }

    var audioOutput = deviceInfo.audiooutput.length > 0 ? deviceInfo.audiooutput : deviceInfo.audioinput
    if (audioOutput) {
        for (var j = 0; j < audioOutput.length; j++) {
            if (!audioOutput[j].label) {
                audioOutput[j].label = 'audiooutput' + j
            }

            audioOutputList.push('<option class="cameraOption" value="' + audioOutput[j].deviceId + '">' + audioOutput[j].label + '</option>')
        }
        document.getElementById('audioList').innerHTML = audioOutputList.join('')
    }

    var audioinput = deviceInfo.audioinput.length > 0 ? deviceInfo.audioinput : deviceInfo.audioinput
    if (audioinput) {
        for (var j = 0; j < audioinput.length; j++) {
            if (!audioinput[j].label) {
                audioinput[j].label = 'audioinput' + j
            }

            audioInputListList.push('<option class="cameraOption" value="' + audioinput[j].deviceId + '">' + audioinput[j].label + '</option>')
        }
        document.getElementById('audioInputList').innerHTML = audioInputListList.join('')
    }
}

function handleError(error){
    console.error('enum device error: ' + error)
}

window.onload = function (){
    console.warn('load complete ...')
    // 设置是否过滤default 和 communications 类型
    localStorage.showDefaultCommunicationsDevice = 'true'

    enumDevices(handleDeviceData, handleError)
}

