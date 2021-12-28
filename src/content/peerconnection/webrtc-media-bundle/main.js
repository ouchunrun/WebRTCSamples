
var mediaDevice = null
var defaultCon = {
    audio: false,
    video: {
        frameRate: 5,
        width: 320,
        height: 180,
    }
};

var getUserMediaConstraintsDiv = document.querySelector('textarea#getUserMediaConstraints');
getUserMediaConstraintsDiv.value = JSON.stringify(defaultCon, null, '    ' );

var mediaDeviceInstance
document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        mediaDeviceInstance = new MediaDevice()
        var videoInputList = []
        videoInputList.push('<option class="cameraOption" value="">' + "请选择" + '</option>')
        mediaDeviceInstance.enumDevices(deviceInfo => {
            console.log('enumDevices' + JSON.stringify(deviceInfo.cameras))
            if (deviceInfo.cameras) {
                for (var j = 0; j < deviceInfo.cameras.length; j++) {
                    if (!deviceInfo.cameras[j].label) {
                        deviceInfo.cameras[j].label = 'camera' + j
                    }
                    videoInputList.push('<option class="cameraOption" value="' + deviceInfo.cameras[j].deviceId + '">' + deviceInfo.cameras[j].label + '</option>')
                    console.log('camera: ' + deviceInfo.cameras[j].label)
                }
            }
            videoInputList.push('<option class="cameraOption" value="presentShare">' + "presentShare" + '</option>')
            document.getElementById('videoList').innerHTML = videoInputList.join('')

            mediaDeviceInstance.checkAvailableDev()
        }, function (error) {
            console.error('enum device error: ' + error)
        })
    }
}
