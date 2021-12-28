
/***
 * 取流： audio/video/screenShare
 * @param data {
 *      callback: callback,
        streamType: "video",
        constraintsKeyWord: "exact",
        constraints: {
            aspectRatio: {min: 1.777, max: 1.778},
            frameRate: 30,
            width: 1280,
            height: 720,
            deviceId: deviceId,
        }
 * }
 * @param constraints
 */
function getMedia(data, constraints) {
    if (!constraints) {
        constraints = getConstraints(data, true)
    }
    console.warn("getMedia")

    function onGetStreamSuccess(stream) {
        if (!stream) {
            console.log("apply constraints")
            stream = localStream
        }
        data.callback({stream: stream})
    }

    function onGetStreamFailed(error) {
        console.error("get stream error: ", error.name)
        data.settings = constraints
        data.error = error
        if(data.streamType === 'video'){
            switch (error.name) {
                case 'InternalError':
                case 'OverconstrainedError':
                    getMedia(data)
                    break
                case 'NotFoundError':
                case 'NotReadableError':
                case 'NotAllowedError':
                case 'PermissionDeniedError':
                case 'PermissionDismissedError':
                    data.callback({error: error})
                    break
                default:
                    break
            }
        }else {
            data.callback({error: error})
        }
    }

    if (data.streamType === 'audio' || data.streamType === 'video') {
        let videoTrack = null
        if (data.streamType === 'video' && localStream && localStream.getVideoTracks().length && localStream.active === true) {
            videoTrack = localStream.getVideoTracks()[0]
            var constraintsOfApply = constraints.video
            if (videoTrack && videoTrack.applyConstraints) {
                console.warn("use applyConstraints")
                console.info("applyConstraints constraints: ", JSON.stringify(constraintsOfApply, null, '    '))
                videoTrack.applyConstraints(constraintsOfApply).then(onGetStreamSuccess).catch(onGetStreamFailed)
            }
        } else {
            navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
        }
    } else if (data.streamType === 'screenShare') {
        if (navigator.getDisplayMedia) {
            navigator.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed);
        } else if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed);
        } else {
            // 插件
            navigator.getUserMedia(constraints, onGetStreamSuccess, onGetStreamFailed)
        }
    }
}

/***
 * 获取分辨率
 * @param data, eg.{
    constraintsKeyWord: "exact"
    deviceId: "8cd24e4d2ff8de04d9170e94899fdb24a10ac7c9d09cb90bbe796e754f768d03"
    frameRate: 30
    height: 720
    streamType: "video"
    width: 1280
 * }
 * @param reTry
 */
function getConstraints(data, reTry) {
    let constraints = {}
    switch (data.streamType) {
        case 'audio':
            constraints = {
                audio: data.deviceId ? { deviceId: data.deviceId } : true,
                video: false
            }
            break;
        case 'video':
            constraints = getVideoConstraints(data, reTry)
            break
        case 'screenShare':
            constraints = getScreenShareConstraints(data)
            break
        default:
            break
    }

    return constraints
}

/***
 * 获取屏幕共享分辨率
 * @param data
 * @returns {{audio: boolean, video: {frameRate: {max: string}, width: {max: string}, height: {max: string}}}|{audio: boolean, video: {frameRate: {min: string, max: string}, mozMediaSource: *, width: {min: string, max: string}, mediaSource: *, height: {min: string, max: string}}}|{audio: boolean, video: {frameRate: {min: string, max: string}, width: {min: string, max: string}, logicalSurface: boolean, displaySurface: string, height: {min: string, max: string}}}|{audio: boolean, video: {optional: {sourceId: string}[], mandatory: {minFrameRate: number, maxFrameRate: number}}}}
 */
function getScreenShareConstraints(data) {
    let screenConstraints
    /***
     * for all supported getDisplayMedia browser versions
     */
    if (navigator.mediaDevices.getDisplayMedia) {
        screenConstraints = {
            audio: false,
            video: {
                width: {max: '1920'},
                height: {max: '1080'},
                frameRate: {max: '5'}
            }
        };
    }

    /***
     * for Firefox
     */
    if (!!navigator.mozGetUserMedia) {
        screenConstraints = {
            audio: false,
            video: {
                mozMediaSource: source,
                mediaSource: source,
                width: {min: '10', max: '1920'},
                height: {min: '10', max: '1080'},
                frameRate: {min: '1', max: '5'}
            }
        };
    }

    /***
     * for Edge
     */
    if (adapter.browserDetails.browser === "edge") {
        if (adapter.browserDetails.version >= 17134 && !!navigator.getDisplayMedia) {
            screenConstraints = {
                audio: false,
                video: {
                    displaySurface: 'window',
                    logicalSurface: true,
                    width: {min: '10', max: '1920'},
                    height: {min: '10', max: '1080'},
                    frameRate: {min: '1', max: '5'}
                }
            };
        } else {
            console.warn("This version of Edge does not support screen capture feature");
            return;
        }
    }

    /***
     * For IE / Safari which is installed webrtc-everywhere
     */
    if ((adapter.browserDetails.browser === "ie" || adapter.browserDetails.browser === "safari") && adapter.browserDetails.isWebRTCPluginInstalled === true) {
        screenConstraints = {
            audio: false,
            video: {
                optional: [{sourceId: "X978GrandstreamScreenCapturer785"}],
                mandatory: {
                    minFrameRate: 1,
                    maxFrameRate: 5
                }
            }
        };
    }


    return screenConstraints
}

/***
 * 获取video 分辨率
 * @param data 需要得参数
 constraintsKeyWord: "exact"
 deviceId: "8cd24e4d2ff8de04d9170e94899fdb24a10ac7c9d09cb90bbe796e754f768d03"
 frameRate: 15
 height: 720
 streamType: "video"
 width: 1280
 * @param reTry 需要得参数 : true 取流失败重新取流，false 首次取流
 * @returns {{audio: boolean, video: {frameRate: {exact: number}, width: {exact: number}, aspectRatio: {exact: number}, height: {exact: number}}}}
 */
function getVideoConstraints(data, reTry) {
    let matchResolution = {}
    let currentLimit = {}
    let deviceId

    if (reTry) {
        // 这种方式不需要重复获取匹配了
        currentLimit = getNextConstraints(data)
        deviceId = currentLimit.deviceId
        matchResolution = currentLimit
    } else {
        // 默认首次取流都使用exact
        currentLimit = data
        deviceId = currentLimit.deviceId
        console.log("deviceId: ", deviceId)
        if (deviceId) {
            matchResolution = mediaDeviceInstance.getSuitableResolution({
                frameRate: currentLimit.frameRate ? currentLimit.frameRate : 30,
                width: currentLimit.width ? currentLimit.width : 640,
                height: currentLimit.height ? currentLimit.height : 360,
                deviceId: currentLimit.deviceId
            })
            console.warn("match constraints: ", matchResolution)
        }
    }

    console.warn("currentLimit: ", currentLimit)
    let constraints = {
        audio: false,
        video: {
            frameRate: {
                exact: matchResolution.frameRate ? matchResolution.frameRate : currentLimit.frameRate ? currentLimit.frameRate : 30
            },
            aspectRatio: {
                exact: matchResolution.width ? (matchResolution.width / matchResolution.height) : (currentLimit.width / currentLimit.height)
            },
            width: {
                exact: matchResolution.width ? matchResolution.width : currentLimit.width ? currentLimit.width : 640
            },
            height: {
                exact: matchResolution.height ? matchResolution.height : currentLimit.height ? currentLimit.height : 360
            }
        }
    }

    if (deviceId) {
        constraints.video.deviceId = {
            exact: deviceId
        }
    }

    console.log("data.constraintsKeyWord: ", data.constraintsKeyWord)
    if (!data.constraintsKeyWord) {
        console.warn("Do not use keyWord limit")
        constraints.video.frameRate = constraints.video.frameRate.exact
        constraints.video.aspectRatio = constraints.video.aspectRatio.exact
        constraints.video.width = constraints.video.width.exact
        constraints.video.height = constraints.video.height.exact
        if (constraints.video.deviceId.exact || constraints.video.deviceId.ideal) {
            constraints.video.deviceId = constraints.video.deviceId.exact ? constraints.video.deviceId.exact : constraints.video.deviceId.ideal
        }
    } else if (data.constraintsKeyWord === 'ideal') {
        console.warn("Use ideal limit")
        constraints.video.frameRate.ideal = constraints.video.frameRate.exact
        constraints.video.aspectRatio.ideal = constraints.video.aspectRatio.exact
        constraints.video.width.ideal = constraints.video.width.exact
        constraints.video.height.ideal = constraints.video.height.exact
        // 使用max限制来避免超出要求的能力
        constraints.video.frameRate.max = constraints.video.frameRate.exact
        constraints.video.aspectRatio.max = constraints.video.aspectRatio.exact
        constraints.video.width.max = constraints.video.width.exact
        constraints.video.height.max = constraints.video.height.exact
        if (constraints.video.deviceId.exact) {
            constraints.video.deviceId.ideal = constraints.video.deviceId.exact
        }
        // 删除exact属性
        delete constraints.video.frameRate.exact
        delete constraints.video.aspectRatio.exact
        delete constraints.video.width.exact
        delete constraints.video.height.exact
        delete constraints.video.deviceId.exact
    } else if (data.constraintsKeyWord === 'exact') {
        console.warn("Use exact limit")
    }

    console.warn("get new Video Constraints: ", JSON.stringify(constraints, null, '   '))
    return constraints
}

/***
 * 根据设备支持的能力列表获取下一个分辨率
 * @param data = {
 *      callback: ƒ (message)
        constraints: {aspectRatio: {…}, frameRate: 30, width: 1280, height: 720, deviceId: "5e3722883e2e9337040a4f1ababf85a5bd2f6a36afc815fd391424ac05a84ab0"}
        constraintsKeyWord: "ideal"
        error: OverconstrainedError {name: "OverconstrainedError", message: null, constraint: "frameRate"}
        settings: {audio: false, video: {…}}
        streamType: "video"
 * }
 * @returns {{frameRate: number, streamType: string, width: number, deviceId: (*|number|boolean|string|string[]|ConstrainDOMStringParameters|"user"|"environment"|"left"|"right"|VideoFacingModeEnum[]), constraintsKeyWord: (string), height: number}}
 */
function getNextConstraints(data) {
    // 获取上一次取流失败的分辨率限制
    let lastSettings = data.settings
    let settings = {
        frameRate: lastSettings.video.frameRate.exact ? lastSettings.video.frameRate.exact : lastSettings.video.frameRate.ideal ? lastSettings.video.frameRate.ideal : lastSettings.video.frameRate,
        width: lastSettings.video.width.exact ? lastSettings.video.width.exact : lastSettings.video.width.ideal ? lastSettings.video.width.ideal : lastSettings.video.width,
        height: lastSettings.video.height.exact ? lastSettings.video.height.exact : lastSettings.video.height.ideal ? lastSettings.video.height.ideal : lastSettings.video.height,
        deviceId: lastSettings.video.deviceId.exact ? lastSettings.video.deviceId.exact : lastSettings.video.deviceId.ideal ? lastSettings.video.deviceId.ideal : lastSettings.video.deviceId,
    }

    // 获取下一个分辨率
    let deviceId = settings.deviceId ? settings.deviceId : data.deviceId
    let capability = getCapability(deviceId)
    let nextConstraints
    for (let j = 0; j < capability.length; j++) {
        if (capability[j].width === settings.width && capability[j].height === settings.height && capability[j].frameRate === settings.frameRate) {
            nextConstraints = capability[j + 1]
            break
        }
    }

    console.warn("nextConstraints: ", nextConstraints)
    // 如果nextConstraints不存在，说明能力列表全部扫描完成，换其他的限制尝试（exact/ideal/不使用）
    if (!nextConstraints) {
        console.warn("Restricted flow...")
        if (data.constraintsKeyWord === 'exact') {
            console.warn("Exact has been scanned, using ideals")
            data.constraintsKeyWord = 'ideal'
        } else if (data.constraintsKeyWord === 'ideal') {
            console.warn("The ideal has been scanned. Do not use keywords")
            data.constraintsKeyWord = ''
        } else {
            // 取流彻底失败，调用回调返回
            console.warn("The flow failed completely, and the flow was not taken.")
            data.callback({error: data.error})
        }
    }

    return {
        constraintsKeyWord: data.constraintsKeyWord,
        streamType: data.streamType,
        deviceId: settings.deviceId ? settings.deviceId : data.deviceId,
        frameRate: nextConstraints ? nextConstraints.frameRate ? nextConstraints.frameRate : data.constraints.frameRate : data.constraints.frameRate,
        width: nextConstraints ? nextConstraints.width ? nextConstraints.width : data.constraints.width : data.constraints.width,
        height: nextConstraints ? nextConstraints.height ? nextConstraints.height : data.constraints.height : data.constraints.height,
    }
}

/***
 * 获取当前使用的设备所支持的能力列表
 * @returns {Array}
 */
function getCapability(deviceId) {
    let mediaDevice = JSON.parse(localStorage.getItem('mediaDevice'))
    let capability = []
    let cameras = mediaDevice.cameras
    if (cameras && cameras.length) {
        for (let i = 0; i < cameras.length; i++) {
            if (cameras[i].deviceId === deviceId) {
                capability = cameras[i].capability
            }
        }
    }

    if (!capability.length) {
        capability = mediaDeviceInstance.getQuickScanList()
    }
    console.log("capability: ", capability)

    return capability
}
