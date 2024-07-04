
function shareVideo(){
    closeStream()
    let videoList = document.getElementById('videoList').options
    if(videoList && videoList.length > 0){
        let selectDevice = videoList[videoList.selectedIndex]
        console.warn("selectDevice: ", selectDevice.label)
        var deviceId = selectDevice.value
        console.log("deviceId： ", deviceId)
        if(deviceId === '请选择'){
            console.warn("请先选择摄像头！！！")
            return
        }

        var constraints = {
            audio: false,
            video: {
                width: {
                    exact: 640
                },
                height: {
                    exact: 360
                },
                deviceId: {
                    exact: deviceId
                }
            }
        }

        console.warn('getUserMedia constraints is :' + JSON.stringify(constraints, null, '    '))
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            window.stream = stream
            console.warn("取流成功： ", stream)
            var video = document.querySelector('video');
            video.srcObject = stream;

            video.onloadedmetadata = function (e) {
                console.warn("Stream dimensions for :" + video.videoWidth + "x" + video.videoHeight);
            };
        }).catch(function (error) {
            console.warn("视频取流失败！！")
            console.warn("error name: ", error.name)
            console.error(error.toString())
        })

    }else {
        alert('No device here! plug device and Try again!')
    }
}


function applyConstraints(width, height) {
    var constraints = {
        width: {
            exact: width
        },
        height: {
            exact: height
        }
    };

    var localVideoTrack = window.stream.getVideoTracks()[0];
    localVideoTrack.applyConstraints(constraints).then(function () {
        console.info('applyConstraints succeed', JSON.stringify(constraints, null, '    '));

        var video = document.querySelector('video');
        // 旧的浏览器可能没有srcObject
        if ("srcObject" in video) {
            video.srcObject = stream;
        } else {
            // 防止在新的浏览器里使用它，应为它已经不再支持了
            video.src = window.URL.createObjectURL(stream);
        }
        video.onloadedmetadata = function (e) {
            video.play();
            console.warn("Stream dimensions for :" + video.videoWidth + "x" + video.videoHeight);
        };
    }).catch(function (error) {
        console.info("applyConstraints Error: ", error.name);
    })
}

function getCameraStream(facingMode) {
    closeStream()
    // var constraints = {
    //     audio: false,
    //     video: {
    //         facingMode: {
    //             exact: facingMode
    //         }
    //     }
    // }
    var constraints
    if(facingMode === 'user'){
        constraints = {
            audio: false,
            video: {
                width: {
                    ideal: 320,
                    max: 320
                },
                height: {
                    ideal: 180,
                    max: 180
                },
                facingMode: window.facingModetest ? {ideal: facingMode} :{exact: facingMode}
            }
        }
    }else {
        constraints = {
            audio: false,
            video: {
                width: {
                    exact: 320
                },
                height: {
                    exact: 180
                },
                facingMode: window.facingModetest ? {ideal: facingMode} :{exact: facingMode}
            }
        }
    }


    console.warn('constraints' + JSON.stringify(constraints, null, '    '))
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        window.stream = stream
        console.warn("get stream success: " + JSON.stringify(constraints, null, '    '))
        var video = document.querySelector('video');
        video.srcObject = stream;

        video.onloadedmetadata = function (e) {
            console.warn("Stream dimensions for :" + video.videoWidth + "x" + video.videoHeight);
        };
    }).catch(function (err) {
        console.error(err);
        console.error(err.toString());
    })
}

function closeStream() {
    if(window.stream){
        console.log("清除流！！")
        window.stream.oninactive = null;
        var tracks = window.stream.getTracks();
        for (var track in tracks) {
            tracks[track].onended = null;
            console.info("close stream");
            tracks[track].stop();
        }

        var videoElement = document.getElementById('video')
        videoElement.srcObject = null
    }else {
        console.warn("window.stream: ", window.stream)
    }
}


function initVConsole(){
    console.log('init vConsole')
    let vConsole = new VConsole()
    let VConsoleButton = document.getElementById('__vconsole')
    let checkCount = 0
    if(!VConsoleButton){
        let checkTimer = setInterval(function () {
            VConsoleButton = document.getElementById('__vconsole')
            checkCount++
            if(VConsoleButton || checkCount > 10){
                console.log('clear checkTimer and hide vConsole button.', VConsoleButton)
                clearInterval(checkTimer)
                checkTimer = null

                if(VConsoleButton){
                    // VConsoleButton.style.display = 'none'
                }
            }
        }, 1000)
    }else {
        console.log('hide vConsole button.', VConsoleButton)
        // VConsoleButton.style.display = 'none'
    }
}


let VConsoleTimer = null
let VConsoleWaitTime = 200
let VConsoleWaitTimeLastClickTime = new Date().getTime()
let VConsoleCount = 0
window.addEventListener('click', function (evt) {
    let currentTime = new Date().getTime()
    VConsoleCount = (currentTime - VConsoleWaitTimeLastClickTime) < VConsoleWaitTime ? VConsoleCount + 1 : 1
    VConsoleWaitTimeLastClickTime = new Date().getTime()
    VConsoleTimer = setTimeout(function () {
        clearTimeout(VConsoleTimer)
        console.log('click count:', VConsoleCount)
        if(VConsoleCount >= 3){
            console.log('click more than 4 times')
            // init vConsole
            // let vConsole = new VConsole()
            let VConsoleButton = document.getElementById('__vconsole')
            console.log('VConsoleButton 找到了？？:', VConsoleButton)
            if(VConsoleButton){
                console.warn('显示vConsole button')
                VConsoleButton.style.display = 'block'
            }else {
                console.warn('vConsole button not found!')
            }

        }
    }, VConsoleWaitTime + 10)
});


window.addEventListener('load', function () {
    initVConsole()
})
