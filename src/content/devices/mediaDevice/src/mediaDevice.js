
function MediaDevice () {
  this.deviceCheckTimer = null
}

/***
 * 获取分辨率扫描列表
 */
MediaDevice.prototype.getQuickScanList = function(){
  return [
    {
      'label': '1080p(FHD)',
      'width': 1920,
      'height': 1080,
      'frameRate': 30
    },
    {
      'label': '1080p(FHD)',
      'width': 1920,
      'height': 1080,
      'frameRate': 15
    },
    {
      'label': '720p(HD)',
      'width': 1080,
      'height': 720,
      'frameRate': 30
    },
    {
      'label': '720p(HD)',
      'width': 1080,
      'height': 720,
      'frameRate': 15
    },
    {
      'label': 'VGA',
      'width': 640,
      'height': 480,
      'frameRate': 15
    },
    {
      'label': '360p(nHD)',
      'width': 640,
      'height': 360,
      'frameRate': 15
    },
    {
      'label': 'QVGA',
      'width': 320,
      'height': 240,
      'frameRate': 15
    },
    {
      'label': 'QQVGA',
      'width': 160,
      'height': 120,
      'frameRate': 15
    }
  ]
}

/***
 * 获取音视频设备并进行分类
 * @param deviceInfoCallback
 * @param error
 */
MediaDevice.prototype.enumDevices = function(deviceInfoCallback, error) {
  if (navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined) {
    if (error) {
      error("browser don't support enumerate devices")
    }
    return
  }
  navigator.mediaDevices.enumerateDevices().then(function (deviceInfos) {
    var microphone = []
    var speaker = []
    var camera = []
    var screenResolution = []
    for (var i = 0; i < deviceInfos.length; i++) {
      var deviceInfo = deviceInfos[i]
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
        screenResolution: screenResolution
      })
    }
  }).catch(function (err) {
    if (error) {
      error(err)
    }
  })
}

/***
 * 更新localStorage存储
 * @param deviceInfos 所有的媒体数据
 * @param type ： cameras / microphones / speakers， 更新的类型
 */
MediaDevice.prototype.updateDeviceInfo = function(deviceInfos, type){
  var localStorageDeviceInfo = JSON.parse(localStorage.getItem('mediaDevice'))
  var deviceInfoList = []
  var storageInfoList = []

  switch (type) {
    case 'cameras':
      deviceInfoList = deviceInfos.cameras
      storageInfoList = localStorageDeviceInfo ? localStorageDeviceInfo.cameras ? localStorageDeviceInfo.cameras : [] : []
      break
    case 'microphones':
      deviceInfoList = deviceInfos.microphones
      storageInfoList = localStorageDeviceInfo ? localStorageDeviceInfo.microphones ? localStorageDeviceInfo.microphones : [] : []
      break
    case 'speakers':
      deviceInfoList = deviceInfos.speakers
      storageInfoList = localStorageDeviceInfo? localStorageDeviceInfo.speakers ? localStorageDeviceInfo.speakers : [] : []
      break
    default:
      break
  }

  /***
   * 判断localStorage中的设备是否有还存在，不存在则设置状态为 unavailable，还存在的置为available
   * @param deviceInfoList
   * @param storageInfoList
   */
  function setDeviceStatus (deviceInfoList, storageInfoList) {
    for (var i = 0; i < storageInfoList.length; i++) {
      for(var j = 0; j < deviceInfoList.length; j++){
        if(storageInfoList[i].label === deviceInfoList[j].label){
          if(storageInfoList[i].status === 'unavailable'){
            log.info('set device unavailable to available!')
            storageInfoList[i].status = 'available'
          }
          break
        }
        if(storageInfoList[i].label !== deviceInfoList[j].label && j === deviceInfoList.length - 1 && storageInfoList[i].status !== 'unavailable'){
          log.warn(storageInfoList[i].label + "   device is unavailable")
          storageInfoList[i].status = 'unavailable'
        }
      }
    }
  }

  /***
   * 判断设备是否是新设备，是的话，添加到localStorage中
   * @param deviceInfoList
   * @param storageInfoList
   */
  function addInsertDevice(deviceInfoList, storageInfoList){
    for(var i = 0; i < deviceInfoList.length; i++){
      for(var j = 0; j < storageInfoList.length; j++){
        if(deviceInfoList[i].label === storageInfoList[j].label){
          break
        }
        if( deviceInfoList[i].label !== storageInfoList[j].label && j === storageInfoList.length - 1){
          log.warn("new device has been insert!")
          storageInfoList.push(deviceInfoList[i])
        }
      }
    }
  }

  // 本地存储没有任何值，直接设置获取的设备列表到localStorage中
  if(deviceInfoList.length && !storageInfoList.length){
    log.warn("set new device info list")
    localStorage.setItem('mediaDevice',  JSON.stringify(deviceInfos, null, '    '))
    return
  }

  // 未获取当任何有效的设备列表，localStorage保存的设备全部设置为不可用
  if(!deviceInfoList.length && storageInfoList.length){
    log.warn('set all device to unavailable');
    for (var i = 0; i < storageInfoList.length; i++){
      storageInfoList[i].status = 'unavailable'
    }
    localStorage.setItem('mediaDevice',  JSON.stringify(localStorageDeviceInfo, null, '    '))
    return
  }

  // 获取到设备列表，且localStorage中有设备存储信息
  setDeviceStatus(deviceInfoList, storageInfoList)
  addInsertDevice(deviceInfoList, storageInfoList)
  log.info('update modified device info into localStorage!')
  localStorage.setItem('mediaDevice',  JSON.stringify(localStorageDeviceInfo, null, '    '))
}


/***
 * 设置设备所支持的取流能力：frameRate, width, height
 */
MediaDevice.prototype.setDeviceCapability = async function () {
  var This = this
  var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
  var quickScanList = This.getQuickScanList()

  if(mediaDevice && mediaDevice.cameras.length > 0){
    for(var j = 0; j < mediaDevice.cameras.length; j++){
      // 当前循环设备之前已经有分辨率扫描的记录，不重新扫描
      if(mediaDevice.cameras[j].capability && mediaDevice.cameras[j].capability.length > 0){
        log.info("this device has already get resolution before!")
        continue
      }

      log.warn("Current scan device：", mediaDevice.cameras[j].label)
      var deviceId = mediaDevice.cameras[j].deviceId
      var capability = mediaDevice.cameras[j].capability
      var localStream = null
      function getNewStreamSuccess () {
        capability.push({
          width: quickScanList[i].width,
          height: quickScanList[i].height,
          frameRate: quickScanList[i].frameRate
        })
      }
      function getNewStreamFailed () {
        log.warn('device has not support this resolution: ',
          JSON.stringify({
            width: quickScanList[i].width,
            height: quickScanList[i].height,
            frameRate: quickScanList[i].frameRate
          }, null, '    ')
        )
      }

      for (var i = 0; i < quickScanList.length; i++) {
        var constraints = {
          audio: false,
          video: {
            deviceId: deviceId ? { exact: deviceId } : "",
            frameRate: { exact: quickScanList[i].frameRate },
            width: { exact: quickScanList[i].width },
            height: { exact: quickScanList[i].height }
          }
        }

        if (localStream && localStream.getVideoTracks().length > 0) {
          var videoTrack = localStream.getVideoTracks()[0]
          await videoTrack.applyConstraints(constraints).then(function () {
            log.info('applyConstraints success')
            getNewStreamSuccess(null)
          }).catch(function (error) {
            log.warn('applyConstraints error: ', error.name)
            getNewStreamFailed ()
          })
        }else {
          await navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            log.info("getUserMedia success!")
            localStream = stream
            getNewStreamSuccess()
          }).catch(function (error) {
            log.warn(error.name)
            getNewStreamFailed()
          })
        }
      }
    }
    localStorage.setItem('mediaDevice', JSON.stringify(mediaDevice, null, '    '))
  }else {
    log.warn('no cameras need to resolution scan!')
  }
}

/***
 * 检查可用设备列表
 */
MediaDevice.prototype.checkAvailableDev = function () {
  var This = this

  This.enumDevices(function(deviceInfo){
    // log.info("get device info success: \n", JSON.stringify(deviceInfo))
    function setLabel (devices, type) {
      for (var key = 0; key < devices.length; key++) {
        if (!devices[key].label) {
          devices[key].label = type + key
        }
        log.info(type + " " +devices[key].label)
      }
      return devices
    }

    if(deviceInfo){
      if(deviceInfo.cameras){
        setLabel(deviceInfo.cameras, 'cameras')
      }
      if(deviceInfo.microphones){
        setLabel(deviceInfo.microphones, 'microphones')
      }
      if(deviceInfo.speakers){
        setLabel(deviceInfo.speakers, 'speakers')
      }

      This.updateDeviceInfo(deviceInfo, "cameras")
      This.updateDeviceInfo(deviceInfo, "microphones")
      This.updateDeviceInfo(deviceInfo, "speakers")
    }else {
      log.warn("deviceInfo is null")
    }

  }, function (error) {
    log.error('enum device error: ' + error.toString())
  })
}

/***
 * 设备定时检查开关
 * @param switchOn: true 开启定时器；  false 关闭定时器
 */
MediaDevice.prototype.setDeviceCheckInterval = function (switchOn) {
  var This = this
  if(switchOn){
    clearInterval(This.deviceCheckTimer)
    This.deviceCheckTimer = setInterval(function () {
      This.checkAvailableDev()
    }, 1000)
  }else {
    clearInterval(This.deviceCheckTimer);
    This.deviceCheckTimer = null
  }
}

/***
 * 获取最接近，最合适的设备支持的分辨率
 * @param expectRes 当前希望获取的分辨率，eg {
 *   deviceId: 4b5305afd805f2d8439eac80dc94b14846799929d44d18c7dd8fc97eda75c046
 *   frameRate: 15,
 *   width: 1080,
 *   height: 720
 * }
 */
MediaDevice.prototype.getSuitableResolution = function (expectRes) {
  if(!expectRes.deviceId || !expectRes.width || !expectRes.height || !expectRes.frameRate){
    log.warn('Invalid parameter');
    return
  }

  var mediaDevice =  JSON.parse(localStorage.getItem('mediaDevice'))
  var capability = []
  var sameWidthList = []
  var matchRes = {}

  if(mediaDevice && mediaDevice.cameras.length > 0){
    // 获取给定设备支持的取流能力列表
    for(var i = 0; i < mediaDevice.cameras.length; i++){
      if(mediaDevice.cameras[i].deviceId === expectRes.deviceId){
        capability = mediaDevice.cameras[i].capability
        log.warn("capability: ", capability)
        break
      }
    }

    // 过滤出相同width的分辨率
    if(capability.length > 0){
      for(var j = 0; j < capability.length; j++){
        if(capability[j].width === expectRes.width){
          sameWidthList.push(capability[j])
        }
      }
      log.warn("sameWidthList: ", sameWidthList)
    }

    // 获取最合适的分辨率
    if(sameWidthList.length > 0){
      for(var k = 0; k < sameWidthList.length; k++){
        // 返回width height frameRate 都相同的分辨率
        if(sameWidthList[k].width === expectRes.width && sameWidthList[k].height === expectRes.height && sameWidthList[k].frameRate === expectRes.frameRate){
          log.warn('Returns the resolution of width height frameRate', sameWidthList[k])
          matchRes = sameWidthList[k]
          break
        }
      }

      if(JSON.stringify(matchRes) === "{}"){
        for(var k = 0; k < sameWidthList.length; k++){
          // 返回width height相同， frameRate 小于期望值的的分辨率
          if(sameWidthList[k].width === expectRes.width && sameWidthList[k].height === expectRes.height && sameWidthList[k].frameRate < expectRes.frameRate){
            log.warn('Returns the resolution where the width height is the same and the frameRate is less than the expected value. ', sameWidthList[k])
            matchRes = sameWidthList[k]
            break
          }
        }
      }

      if(JSON.stringify(matchRes) === "{}"){
        for(var k = 0; k < sameWidthList.length; k++){
          // 返回width frameRate 相同， height 小于期望值的的分辨率
          if(sameWidthList[k].width === expectRes.width && sameWidthList[k].height < expectRes.height && sameWidthList[k].frameRate === expectRes.frameRate){
            log.warn('Returns the resolution where the width height is the same and the frameRate is less than the expected value. ', sameWidthList[k])
            matchRes = sameWidthList[k]
            break
          }
        }
      }
    }else {
      log.warn("no same with resolution exist, get other resolution;")
      // 返回设备支持的最大的、width比期望值小的分辨率
      for(var j = 0; j < capability.length; j++){
        if(capability[j].width < expectRes.width){
          log.info('Returns the maximum resolution supported by the device with a smaller width than expected')
          matchRes = capability[j]
          break
        }
      }
    }
    return matchRes
  }
  return matchRes
}
