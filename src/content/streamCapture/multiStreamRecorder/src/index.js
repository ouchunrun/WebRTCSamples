let index = 1
const timeInterval = document.querySelector('#time-interval') ? parseInt(document.querySelector('#time-interval').value) : (60 * 1000)
let multiStreamRecorder
const streamList = []
const recorderOptions = {
  mimeType: 'video/webm;codecs=vp8',
  video: {
    width: 1920,
    height: 1080,
    frameRate: 15
  }
}

/**
 * 停止录制
 * @private
 */
function stopRecording () {
  if (!multiStreamRecorder) {
    return
  }
  multiStreamRecorder.stop()
  multiStreamRecorder.stream.stop()

  // stop all stream
  streamList.forEach(function (stream) {
    stream.getTracks().forEach(function (track) {
      track.stop()
    })
  })

  // 停止录制后删除所有 canvas
  let canvasList = document.getElementsByTagName('canvas')
  for (let i = canvasList.length - 1; i >= 0; i--) {
    let idObject = canvasList[i]
    if (idObject != null) {
      idObject.parentNode.removeChild(idObject)
    }
  }

  // 停止录制之后才可以保存，否则没有数据
  document.getElementById('save').disabled = false
}

/**
 * Audio Record and saving to database
 */
function savingToDatabase () {
  if (!multiStreamRecorder) {
    return
  }
  console.warn('Audio Record and saving to local')
  multiStreamRecorder.save()
}

/**
 * 开始取流和录制
 * @private
 */
async function startRecording () {
  this.disabled = true

  // TODO: 一开始不添加音频的话，后续也无法添加音频流，因为audioSources无法动态关联
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })
  console.warn('get audioStream success: ', audioStream.id)
  streamList.push(audioStream)

  // 获取视频
  const mediaConstraints = {
    audio: false,
    video: {
      width: { max: 640 },
      height: { max: 360 }
    }
  }
  console.log('getUserMedia video constraints: ', JSON.stringify(mediaConstraints, null, '  '))
  const videoStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  streamList.push(videoStream)
  onMediaSuccess(videoStream)
}

/**
 * 取流失败
 * @param e
 */
function onMediaError (e) {
  console.error('media error', e)
}

/**
 * 取流成功
 * @param stream
 * @returns {Promise<void>}
 */
async function onMediaSuccess (stream) {
  let video = document.createElement('video')
  video.autoplay = true
  video = mergeProps(video, {
    controls: true,
    muted: true
  })
  video.srcObject = stream

  video.addEventListener('loadedmetadata', function () {
    console.log('video loadedmetadata resolution: ' + video.videoWidth + '*' + video.videoHeight)
    if (multiStreamRecorder && multiStreamRecorder.stream) return

    console.log('create MultiStreamRecorder...')
    multiStreamRecorder = new MultiStreamRecorder(streamList, recorderOptions)
    // multiStreamRecorder.mimeType = 'audio/wav' // check this line for audio/wav
    multiStreamRecorder.stream = stream

    multiStreamRecorder.previewStream = function (stream) {
      video.srcObject = stream
      video.play()
    }

    multiStreamRecorder.ondataavailable = function (blob) {
      console.log('ondataavailable: ', blob)
      appendLink(blob)
    }
    // get blob after specific time interval
    multiStreamRecorder.start(timeInterval)
  }, false)

  video.play()
  container.appendChild(video)
  container.appendChild(document.createElement('hr'))
}

/**
 * 添加音频流
 */
function addAudioStream () {
  const constraints = {
    audio: true,
    video: false
  }
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    console.log('get audio stream success: ' + stream.id)
    streamList.push(stream)
    console.log('add stream to recorder')
    multiStreamRecorder.addStreams(stream)
  }).catch(onMediaError)
}

/**
 * 添加桌面共享流
 * @private
 */
function addScreenStream () {
  console.log('add stream')
  if (!multiStreamRecorder || !multiStreamRecorder.stream) {
    return
  }
  const screenConstraints = {
    audio: true,
    video: {
      width: { max: '640' },
      height: { max: '360' },
      frameRate: { max: '5' }
    }
  }

  console.log('getDisplayMedia constraints: \n', JSON.stringify(screenConstraints, null, '  '))
  navigator.mediaDevices.getDisplayMedia(screenConstraints).then(function (stream) {
    console.log('getDisplayMedia stream success: ' + stream.id)

    stream.oninactive = function () {
      console.warn('stream: user close share control bar')
      console.log('stop recorder present stream')
    }

    // Todo: Fixed stream.oninactive is not aways trigger when system audio sharing
    stream.getVideoTracks().forEach(function (track) {
      track.onended = function () {
        console.warn('stream video track stop')
        stream.getTracks().forEach(function (mediaTrack) {
          if (mediaTrack.readyState !== 'ended') {
            console.warn('stop track')
            mediaTrack.stop()
          }
        })
      }
    })

    streamList.push(stream)
    multiStreamRecorder.addStreams(stream)
  }).catch(function (error) {
    console.error(error)
  })
}

/**
 * 获取stream列表
 * @returns {Promise<Array>}
 */
async function getStreamList () {
  const localAudioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })

  const remoteAudioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })

  const videoStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 640, height: 360 }
  })

  const presentStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1920, height: 1080 }
  })

  if (localAudioStream) {
    console.warn('add localAudioStream')
    streamList.push(localAudioStream)
  }
  if (remoteAudioStream) {
    console.warn('add remoteAudioStream')
    streamList.push(remoteAudioStream)
  }
  if (videoStream) {
    console.warn('add videoStream')
    streamList.push(videoStream)
    showVideo(videoStream)
  }
  if (presentStream) {
    console.warn('add presentStream')
    streamList.push(presentStream)
    showVideo(presentStream)
  }

  console.warn('get streamList: ', streamList)
  return streamList
}

function showVideo (stream) {
  console.log('show local video')
  const span = document.createElement('span')
  const video = document.createElement('video')
  video.style.width = '200px'
  video.srcObject = stream
  video.addEventListener('loadedmetadata', function () {
    const res = 'video resolution: ' + video.videoWidth + '*' + video.videoHeight
    console.log(res)
    span.innerText = res
  })
  video.play()
  container.appendChild(video)
  container.appendChild(span)
  container.appendChild(document.createElement('hr'))
}

/**
 * 创建在线预览连接
 * @param blob
 */
function appendLink (blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.target = '_blank'
  a.innerHTML = '点击在线预览 ' + (blob.type === 'audio/ogg' ? 'Audio' : 'Video') + ' No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ')'
  a.href = url
  downloadArea.appendChild(a)
  downloadArea.appendChild(document.createElement('hr'))

  download(blob)
  showLocalPreview(url)
}

/**
 * 显示本地录制预览
 * @param url
 */
function showLocalPreview (url) {
  const video = document.getElementsByTagName('video')[0]
  video.src = video.srcObject = null
  video.muted = false
  video.volume = 1
  video.src = url
}

/**
 * 创建下载链接
 * @param blob
 */
function download (blob) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  const fileName = Date.now() + '.mp4'
  a.href = url
  a.innerHTML = '点击下载 ' + fileName
  a.download = fileName
  // 自动下载
  // a.click()
  downloadArea.appendChild(a)
  downloadArea.appendChild(document.createElement('hr'))
}

/**
 * below function via: http://goo.gl/B3ae8c
 * @param bytes
 * @returns {string}
 */
function bytesToSize (bytes) {
  const k = 1000
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10)
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 * below function via: http://goo.gl/6QNDcI
 * @param milliseconds
 * @returns {string}
 */
function getTimeLength (milliseconds) {
  const data = new Date(milliseconds)
  return data.getUTCHours() + ' hours, ' + data.getUTCMinutes() + ' minutes and ' + data.getUTCSeconds() + ' second(s)'
}

/**
 * 处理上传为blob文件：recorder 完成后保存的数据文件
 * @type {HTMLElement}
 */
let input = document.getElementById('readBlobFile')
input.onchange = function () {
  let file = this.files[0]
  console.log('file: ', file)
  if (file) {
    let reader = new FileReader()
    reader.onload = function () {
      let arrayBuffer = this.result
      let blob = new Blob([new Int8Array(arrayBuffer)])
      let blobURL = URL.createObjectURL(blob)
      console.log('blobURL: ', blobURL)

      const video = document.createElement('video')
      video.style.height = '200px'
      video.controls = true
      video.autoplay = true
      video.src = blobURL

      video.addEventListener('loadedmetadata', function () {
        const res = 'video resolution: ' + video.videoWidth + '*' + video.videoHeight
        console.warn('预览本地流: ' + res)
      })
      video.play()
      document.body.appendChild(video)
    }
    reader.readAsArrayBuffer(file)
  }
  input.value = ''
}

window.onload = function () {
  // 输出支持的recorder 类型
  console.log('************************************start****************************')
  var mimeTypes = [
    ['video/webm', ['Chrome', 'Firefox', 'Safari']],
    ['video/mp4', []],
    ['video/mpeg', []],
    ['audio/wav', []],
    ['audio/webm', ['Chrome', 'Firefox', 'Safari']],
    ['audio/ogg', ['Firefox']],
    ['video/webm;codecs=vp8', ['Chrome', 'Firefox', 'Safari']],
    ['video/webm;codecs=vp9', ['Chrome']],
    ['video/webm;codecs=h264', ['Chrome']],
    ['video/x-matroska;codecs=avc1', ['Chrome']]
  ]

  mimeTypes.forEach(item => {
    if (MediaRecorder.isTypeSupported(item[0])) {
      console.log('%c' + item[0] + '%c is Supported for ' + item[1], 'color:blue;', 'color:#05aa9a;')
    } else {
      console.log('%c' + item[0] + `%c is NOT Supported!`, 'color:blue;', 'color:#f00;')
    }
  })
  console.log('************************************end******************************')
}
