var isUsedPreviewConstraint = false
const applyConstraintsButton = document.getElementById('applyConstraints');
applyConstraintsButton.addEventListener('click', trackApplyConstraints);

/**
 * applyConstraints 编辑区
 * @type {Element}
 */
var constraintsValue = document.querySelector('textarea#getConstraints');
var defaultCon = {
    "frameRate": {
        "ideal": 15
    },
    "aspectRatio": {
        "min": 1.777,
        "max": 1.778
    },
    "width": {
        "ideal": 1280,
        "max": 1280
    },
    "height": {
        "ideal": 720,
        "max": 720
    }
};
constraintsValue.value = JSON.stringify(defaultCon, null, '    ' );
var o_resolution_up_Actual = 720

function editGetConstraints() {
    var constraints = { };
    if (constraintsValue.value) {
        constraints = JSON.parse(constraintsValue.value);
    }
    return constraints;
}

/**
 * applyConstraints 新的分辨率
 */
function trackApplyConstraints() {
    if(!localStream){
        alert("stream is not exist, please click start get stream first!")
        return
    }
    let constraints = editGetConstraints()
    let localVideoTrack = localStream.getVideoTracks()[0];
    console.info("applyConstraints \n" + JSON.stringify(constraints, null, '    ') );

    function applyNewConstraints(){
        localVideoTrack.applyConstraints(constraints).then(function () {
            console.warn('applyConstraints succeed ' + JSON.stringify(constraints, null, '    '));
            // constraints = getVideoConstraints(constraints, {name: 'OverconstrainedError'})
            // console.warn("constraints: ", constraints)
            // if(constraints){
            //     applyNewConstraints()
            // }else {
            //     console.warn("applyConstraints 失败！！！")
            // }
        }).catch(function (error) {
            console.error("fail to applyConstraints : " + JSON.stringify(constraints, null, '    '));
            console.error("applyConstraints fail name: " + error.name + " ,constraint " + error.constraint);

            constraints = getVideoConstraints(constraints, error)
            if(constraints){
                applyNewConstraints()
            }else {
               console.warn("applyConstraints 失败！！！")
            }
        });
    }

    applyNewConstraints()
}

/**
 * 获取新的分辨率
 * @param constraints
 * @param error
 * @returns {*}
 */
function getVideoConstraints(constraints, error){
    // var This = this
    // var maxResolution = 720

    function changeContains(width, height, resolution){
        if(constraints.frameRate.exact){
            constraints.frameRate.max = constraints.frameRate.exact;
            delete constraints.frameRate.exact;
        }
        if(constraints.frameRate.ideal && constraints.frameRate.max){
            delete constraints.frameRate.ideal;
        }

        if(width && height){
            constraints.width.max = width;
            constraints.height.max = height;
            o_resolution_up_Actual = resolution || constraints.height.max;
            console.info('set o_resolution_up_Actual resolution to  ' +  o_resolution_up_Actual)
        }else {
            console.warn("无效参数 ", width, height)
        }
    }

    if(constraints && o_resolution_up_Actual >= 240 && !isUsedPreviewConstraint && (error.name === 'OverconstrainedError' || error.name === 'TrackStartError' || error.name === 'ConstraintNotSatisfiedError' || error.name === 'InternalError')){
        var resolution;
        if(constraints.width.ideal){
            resolution = parseInt(constraints.width.ideal, 10);
        }else if(constraints.width.max){
            resolution = parseInt(constraints.width.max, 10);
        }

        console.info('get Constraints Repeatedly resolution: ' + resolution);
        if(constraints.aspectRatio){
            console.info('do not set aspectRatio');
            delete constraints.aspectRatio;
            o_resolution_up_Actual = constraints.height.exact || constraints.height.ideal || constraints.height.max
        }else if(constraints.width.ideal && constraints.width.max){
            console.info('delete constraints ideal');
            delete constraints.width.ideal
            delete constraints.height.ideal
            o_resolution_up_Actual = constraints.height.max
        }else if(resolution === 1920){
            changeContains(1280, 720);
        } else if(resolution === 1280){
            changeContains(640, 480, 360);
        } else if(resolution === 640){
            changeContains(320, 240);
        } else {
            if(previewConstraint && !isUsedPreviewConstraint){
                console.warn("use preview constraints ...")
                constraints = previewConstraint
                isUsedPreviewConstraint = true
            }else {
                console.warn("Failed to get the video stream of the camera !")
                constraints = null
                o_resolution_up_Actual = null
            }
        }
    }else {
        console.warn('get Constraints Repeatedly，Failed to get the video stream of the camera');
        constraints = null
        o_resolution_up_Actual = null
    }

    console.warn("constraints： " + JSON.stringify(constraints, null, '    '))
    return constraints
}


function getMediaDevice(deviceInfoCallback, error){
    if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined) {
        if (error) {
            error("browser don't support enumerate devices")
        }
        return
    }
    navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
        let microphone = []
        let speaker = []
        let camera = []
        let screenResolution = []
        let isConstraintsKeywordSupport = true
        for (let i = 0; i < deviceInfos.length; i++) {
            let deviceInfo = deviceInfos[i]
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

        if (deviceInfoCallback) {
            deviceInfoCallback({
                microphones: microphone,
                speakers: speaker,
                cameras: camera,
                screenResolution: screenResolution,
                isConstraintsKeywordSupport: isConstraintsKeywordSupport
            })
        }else {
            return {
                microphones: microphone,
                speakers: speaker,
                cameras: camera,
                screenResolution: screenResolution,
                isConstraintsKeywordSupport: isConstraintsKeywordSupport
            }
        }
    }).catch(function (err) {
        if (error) {
            error(err)
        }
    })
}


window.onload = function (){
    let videoInputList = []
    getMediaDevice(deviceInfo => {
        console.log('enumDevices' + JSON.stringify(deviceInfo.cameras))
        if (deviceInfo.cameras) {
            for (let j = 0; j < deviceInfo.cameras.length; j++) {
                if (!deviceInfo.cameras[j].label) {
                    deviceInfo.cameras[j].label = 'camera' + j
                }
                videoInputList.push('<option class="cameraOption" value="' + deviceInfo.cameras[j].deviceId + '">' + deviceInfo.cameras[j].label + '</option>')
                console.log('camera: ' + deviceInfo.cameras[j].label)
            }
        }

        document.getElementById('videoList').innerHTML = videoInputList.join('')

    }, function (error) {
        console.error('enum device error: ' + error)
    })
}
