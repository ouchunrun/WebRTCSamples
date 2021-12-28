var connectButton = document.querySelector('button#connect');
var hangupButton = document.querySelector('button#hangup');
var cameraPrev = document.getElementById('cameraPrev')
var cameraPrevRes = document.getElementById('cameraPrevRes')
var mediaDevice = null

connectButton.disabled = true;
hangupButton.disabled = true

/***
 * 取流：包括 桌面共享present(window/screen/tab/all)、摄像头共享（audio/video）
 * FAQ： 如何区分预览取流和正常取流（不用区分，都是取流，预览是不存在服务器要求的分辨率的
 */
async function selectDeviceAndGum(){
    var deviceId = getUsingDeviceId()
    console.warn("deviceId: ", deviceId)
    if(deviceId === ""){
        console.warn("请选择有效设备")
        return
    }
    console.log("clear stream first")
    closeStream()

    var gumCallback = function (message) {
        if(message.stream){
            console.warn('selectDeviceAndGum: get stream success');
            localStream = message.stream
            cameraPrev.srcObject = message.stream
            localVideo.srcObject = message.stream;
            connectButton.disabled = false;
        }else if(message.error){
            console.error("getStreamFailed: ", message.error)
        }else {
            console.warn(message)
        }
    }

    var gumData = {
        stream: localStream,
        callback: gumCallback,
        streamType: "video",
        constraintsKeyWord: "exact",
        constraints: {
            aspectRatio: {min: 1.777, max: 1.778},
            frameRate: 30,
            width: 1280,
            height: 720,
            deviceId: deviceId,
        }
    }


    console.warn("getNewStream data: ", JSON.stringify(gumData, null, '  '))
    let param = {
        streamType: gumData.streamType,
        constraintsKeyWord: gumData.constraintsKeyWord,
        deviceId: deviceId,
        frameRate: gumData.constraints.frameRate,
        width: gumData.constraints.width,
        height: gumData.constraints.height,
    }

    let constraints = mediaDeviceInstance.getConstraints(param)
    mediaDeviceInstance.getMedia(gumData, constraints)
}
