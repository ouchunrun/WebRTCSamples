'use strict'

// ______________________
// MediaStreamRecorder.js

function MediaStreamRecorder (mediaStream) {
  if (!mediaStream) {
    throw 'MediaStream is mandatory.'
  }

  // Reference to "MediaRecorder.js"
  let mediaRecorder
  // void start(optional long timeSlice)
  // timestamp to fire "ondataavailable"
  this.start = function (timeSlice) {
    let Recorder

    if (typeof MediaRecorder !== 'undefined') {
      Recorder = MediaRecorderWrapper
    } else if (IsChrome || IsOpera || IsEdge) {
      if (this.mimeType.indexOf('video') !== -1) {
        console.warn('WhammyRecorder')
        Recorder = WhammyRecorder
      } else if (this.mimeType.indexOf('audio') !== -1) {
        console.warn('StereoAudioRecorder')
        Recorder = StereoAudioRecorder
      }
    }

    // video recorder (in GIF format)
    if (this.mimeType === 'image/gif') {
      Recorder = GifRecorder
    }

    // audio/wav is supported only via StereoAudioRecorder
    // audio/pcm (int16) is supported only via StereoAudioRecorder
    if (this.mimeType === 'audio/wav' || this.mimeType === 'audio/pcm') {
      Recorder = StereoAudioRecorder
    }

    // allows forcing StereoAudioRecorder.js on Edge/Firefox
    if (this.recorderType) {
      Recorder = this.recorderType
    }

    mediaRecorder = new Recorder(mediaStream)
    mediaRecorder.blobs = []

    const self = this
    mediaRecorder.ondataavailable = function (data) {
      mediaRecorder.blobs.push(data)
      self.ondataavailable(data)
    }
    mediaRecorder.onstop = this.onstop
    mediaRecorder.onStartedDrawingNonBlankFrames = this.onStartedDrawingNonBlankFrames

    // Merge all data-types except "function"
    mediaRecorder = mergeProps(mediaRecorder, this)

    mediaRecorder.start(timeSlice)
  }

  this.onStartedDrawingNonBlankFrames = function () {}
  this.clearOldRecordedFrames = function () {
    if (!mediaRecorder) {
      return
    }

    mediaRecorder.clearOldRecordedFrames()
  }

  this.stop = function () {
    if (mediaRecorder) {
      mediaRecorder.stop()
    }
  }

  this.ondataavailable = function (blob) {
    if (this.disableLogs) return
    console.log('ondataavailable..', blob)
  }

  this.onstop = function (error) {
    console.warn('stopped..', error)
  }

  this.save = function () {
    if (mediaRecorder.blobs && mediaRecorder.blobs.length) {
      if (!mediaRecorder) {
        return
      }

      ConcatenateBlobs(mediaRecorder.blobs, mediaRecorder.blobs[0].type, function (concatenatedBlob) {
        console.log('concatenatedBlob: ', concatenatedBlob)
        console.log('Concatenated. Resulting blob size:' + bytesToSize(mediaRecorder.blobs[0].size) + 'Playing-back locally in &lt;audio&gt; tag.')

        streamPreview(concatenatedBlob)
        invokeSaveAsDialog(concatenatedBlob)
      })
    } else {
      console.error('mediaRecorder.blobs is empty: ' + mediaRecorder.blobs)
    }
  }

  this.pause = function () {
    if (!mediaRecorder) {
      return
    }
    mediaRecorder.pause()

    if (this.disableLogs) return
    console.log('Paused recording.', this.mimeType || mediaRecorder.mimeType)
  }

  this.resume = function () {
    if (!mediaRecorder) {
      return
    }
    mediaRecorder.resume()

    if (this.disableLogs) return
    console.log('Resumed recording.', this.mimeType || mediaRecorder.mimeType)
  }

  // StereoAudioRecorder || WhammyRecorder || MediaRecorderWrapper || GifRecorder
  this.recorderType = null

  // video/webm;codecs=vp8 or audio/webm or audio/ogg or audio/wav
  this.mimeType = 'video/webm;codecs=vp8'

  // logs are enabled by default
  this.disableLogs = false
}

// ______________________
// MultiStreamRecorder.js

function MultiStreamRecorder (arrayOfMediaStreams, options) {
  arrayOfMediaStreams = arrayOfMediaStreams || []

  if (arrayOfMediaStreams instanceof MediaStream) {
    arrayOfMediaStreams = [arrayOfMediaStreams]
  }

  const self = this
  let mixer
  let mediaRecorder
  const defaultWidth = 1280
  const defaultHeight = 720
  const frameInterval = 10
  options = options || {
    mimeType: 'video/webm;codecs=vp8',
    video: {
      width: 1280,
      height: 720
    }
  }
  if (!options.frameInterval) {
    options.frameInterval = frameInterval
  }
  if (!options.video) {
    options.video = {}
  }
  if (!options.video.width) {
    options.video.width = defaultWidth
  }
  if (!options.video.height) {
    options.video.height = defaultHeight
  }
  console.info('MultiStreamRecorder options: ', JSON.stringify(options, null, '  '))

  this.start = function (timeSlice) {
    console.log('mediaRecorder start ...')
    // github/muaz-khan/MultiStreamsMixer
    mixer = new MultiStreamsMixer(arrayOfMediaStreams, options.video.width, options.video.height)
    self.mixer = mixer

    if (getVideoTracks().length) {
      mixer.frameInterval = options.frameInterval || frameInterval
      mixer.width = options.video.width || defaultWidth
      mixer.height = options.video.height || defaultHeight
      mixer.startDrawingFrames()
    }

    if (typeof self.previewStream === 'function') {
      self.previewStream(mixer.getMixedStream)
    }

    // record using MediaRecorder API
    mediaRecorder = new MediaStreamRecorder(mixer.getMixedStream)

    for (const prop in self) {
      if (typeof self[prop] !== 'function') {
        mediaRecorder[prop] = self[prop]
      }
    }

    mediaRecorder.ondataavailable = function (blob) {
      self.ondataavailable(blob)
    }

    mediaRecorder.onstop = self.onstop
    mediaRecorder.start(timeSlice)
  }

  function getVideoTracks () {
    const tracks = []
    arrayOfMediaStreams.forEach(function (stream) {
      stream.getVideoTracks().forEach(function (track) {
        tracks.push(track)
      })
    })
    return tracks
  }

  this.stop = function (callback) {
    if (!mediaRecorder) {
      return
    }

    mediaRecorder.stop(function (blob) {
      callback(blob)
    })
  }

  this.pause = function () {
    if (mediaRecorder) {
      mediaRecorder.pause()
    }
  }

  this.resume = function () {
    if (mediaRecorder) {
      mediaRecorder.resume()
    }
  }

  this.save = function () {
    if (mediaRecorder) {
      mediaRecorder.save()
    }
  }

  /**
   * 清除录制的数据
   */
  this.clearRecordedData = function () {
    if (mediaRecorder) {
      mediaRecorder.clearRecordedData()
      mediaRecorder = null
    }

    if (mixer) {
      // 释放流
      mixer.releaseStreams()
      mixer = null
    }
  }

  /**
   * 添加流
   * @param streams：单个stream或stream数组
   */
  this.addStreams = function (streams) {
    if (!streams) {
      throw new Error('First parameter is required.')
    }

    if (!(streams instanceof Array)) {
      streams = [streams]
    }
    // arrayOfMediaStreams.concat(streams)

    if (!mediaRecorder || !mixer) {
      return
    }

    mixer.appendStreams(streams)
  }

  this.resetVideoStreams = function (streams) {
    if (!mixer) {
      return
    }

    if (streams && !(streams instanceof Array)) {
      streams = [streams]
    }

    mixer.resetVideoStreams(streams)
  }

  this.ondataavailable = function (blob) {
    if (self.disableLogs) {
      return
    }

    console.log('ondataavailable', blob)
  }

  this.onstop = function () {}
  // for debugging
  this.name = 'MultiStreamRecorder'
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.MultiStreamRecorder = MultiStreamRecorder
}

/**
 * 多流合并为一个流
 * requires: chrome://flags/#enable-experimental-web-platform-features
 * @param arrayOfMediaStreams
 * @param recorderWidth
 * @param recorderHeight
 * @constructor
 */
function MultiStreamsMixer (arrayOfMediaStreams, recorderWidth, recorderHeight) {
  let videos = []
  let isStopDrawingFrames = false

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.style = 'opacity:1;position:absolute;z-index:-1;top: -100000000;left:-1000000000; margin-top:-1000000000;margin-left:-1000000000;';
  document.body.appendChild(canvas)
  console.log('add canvas element')
  this.disableLogs = false
  this.frameInterval = 10

  this.width = recorderWidth
  this.height = recorderHeight
  console.log('create canvas with ' + this.width + '*' + this.height)

  // use gain node to prevent echo
  this.useGainNode = true

  const self = this
  window.Mixer = self

  // _____________________________
  // Cross-Browser-Declarations.js

  // WebAudio API representer
  const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext
  if (!AudioContext) {
    console.error('AudioContext is not supported!')
    return
  }
  /* jshint -W079 */
  const URL = window.URL || window.webkitURL
  // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.webkitGetUserMedia
  const MediaStream = window.MediaStream || window.webkitMediaStream
  /* global MediaStream:true */
  if (typeof MediaStream !== 'undefined') {
    if (!('getVideoTracks' in MediaStream.prototype)) {
      MediaStream.prototype.getVideoTracks = function () {
        if (!this.getTracks) {
          return []
        }

        const tracks = []
        this.getTracks.forEach(function (track) {
          if (track.kind.toString().indexOf('video') !== -1) {
            tracks.push(track)
          }
        })
        return tracks
      }

      MediaStream.prototype.getAudioTracks = function () {
        if (!this.getTracks) {
          return []
        }

        const tracks = []
        this.getTracks.forEach(function (track) {
          if (track.kind.toString().indexOf('audio') !== -1) {
            tracks.push(track)
          }
        })
        return tracks
      }
    }

    // override "stop" method for all browsers
    if (typeof MediaStream.prototype.stop === 'undefined') {
      MediaStream.prototype.stop = function () {
        this.getTracks().forEach(function (track) {
          track.stop()
        })
      }
    }
  }

  const Storage = {}
  Storage.AudioContext = AudioContext || window.webkitAudioContext

  this.startDrawingFrames = function () {
    drawVideosToCanvas()
  }

  function drawVideosToCanvas () {
    if (isStopDrawingFrames) {
      return
    }

    const videosLength = videos.length

    let fullcanvas = false
    const remaining = []
    videos.forEach(function (video) {
      if (!video.stream) {
        video.stream = {}
      }

      if (video.stream.fullcanvas) {
        fullcanvas = video
      } else {
        remaining.push(video)
      }
    })

    if (fullcanvas) {
      canvas.width = fullcanvas.stream.width
      canvas.height = fullcanvas.stream.height
    } else if (remaining.length) {
      canvas.width = videosLength > 1 ? remaining[0].width * 2 : remaining[0].width
      canvas.height = videosLength > 2 ? remaining[0].height * 2 : remaining[0].height
    } else {
      canvas.width = self.width || 360
      canvas.height = self.height || 240
    }

    if (fullcanvas && fullcanvas instanceof HTMLVideoElement) {
      drawImage(fullcanvas)
    }

    remaining.forEach(function (video, idx) {
      drawImage(video, idx)
    })

    setTimeout(drawVideosToCanvas, self.frameInterval)
  }

  function drawImage (video, idx) {
    if (isStopDrawingFrames) {
      return
    }

    let x = 0
    let y = 0
    let width = video.width
    let height = video.height

    if (idx === 1) {
      x = video.width
    }

    if (idx === 2) {
      y = video.height
    }

    if (idx === 3) {
      x = video.width
      y = video.height
    }

    if (typeof video.stream.left !== 'undefined') {
      x = video.stream.left
    }

    if (typeof video.stream.top !== 'undefined') {
      y = video.stream.top
    }

    if (typeof video.stream.width !== 'undefined') {
      width = video.stream.width
    }

    if (typeof video.stream.height !== 'undefined') {
      height = video.stream.height
    }

    context.drawImage(video, x, y, width, height)

    if (typeof video.stream.onRender === 'function') {
      video.stream.onRender(context, x, y, width, height, idx)
    }
  }

  function getMixedStream () {
    isStopDrawingFrames = false
    const mixedVideoStream = getMixedVideoStream()

    const mixedAudioStream = getMixedAudioStream()
    if (mixedAudioStream) {
      mixedAudioStream.getAudioTracks().forEach(function (track) {
        mixedVideoStream.addTrack(track)
      })
    }

    return mixedVideoStream
  }

  function getMixedVideoStream () {
    resetVideoStreams()

    let capturedStream

    if ('captureStream' in canvas) {
      capturedStream = canvas.captureStream()
    } else if ('mozCaptureStream' in canvas) {
      capturedStream = canvas.mozCaptureStream()
    } else if (!self.disableLogs) {
      console.error('Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features')
    }

    const videoStream = new MediaStream()
    capturedStream.getVideoTracks().forEach(function (track) {
      videoStream.addTrack(track)
    })

    canvas.stream = videoStream
    return videoStream
  }

  function getMixedAudioStream () {
    // via: @pehrsons
    if (!Storage.AudioContextConstructor) {
      Storage.AudioContextConstructor = new Storage.AudioContext()
    }

    self.audioContext = Storage.AudioContextConstructor

    self.audioSources = []

    if (self.useGainNode === true) {
      self.gainNode = self.audioContext.createGain()
      self.gainNode.connect(self.audioContext.destination)
      self.gainNode.gain.value = 0 // don't hear self
    }

    let audioTracksLength = 0
    arrayOfMediaStreams.forEach(function (stream) {
      if (!stream.getAudioTracks().length) {
        return
      }

      audioTracksLength++
      const audioSource = self.audioContext.createMediaStreamSource(stream)
      if (self.useGainNode === true) {
        //  将音频输出到一个媒体流节点上
        audioSource.connect(self.gainNode)
      }
      self.audioSources.push(audioSource)
    })

    if (!audioTracksLength) {
      return
    }
    self.audioDestination = self.audioContext.createMediaStreamDestination()
    self.audioSources.forEach(function (audioSource) {
      audioSource.connect(self.audioDestination)
    })
    return self.audioDestination.stream
  }

  function getVideo (stream) {
    const video = document.createElement('video')
    if ('srcObject' in video) {
      video.srcObject = stream
    } else {
      video.src = URL.createObjectURL(stream)
    }

    video.muted = true
    video.volume = 0

    video.width = stream.width || self.width || 360
    video.height = stream.height || self.height || 240

    video.play()

    return video
  }

  this.appendStreams = function (streams) {
    if (!streams) {
      throw 'First parameter is required.'
    }

    if (!(streams instanceof Array)) {
      streams = [streams]
    }
    arrayOfMediaStreams.concat(streams)

    streams.forEach(function (stream) {
      /**
       * 把后续添加的视频流添加到video里面进行recorder
       */
      if (stream.getVideoTracks().length > 0) {
        console.warn('添加新的视频track')
        const video = getVideo(stream)
        video.stream = stream
        videos.push(video)
      }

      /**
       * 处理添加的音频
       */
      if (stream.getAudioTracks().length) {
        if (self.audioSources && self.audioSources.length) {
          console.warn('audioSources exist before')
          if (stream.getAudioTracks().length && self.audioContext) {
            var audioSource = self.audioContext.createMediaStreamSource(stream)
            audioSource.connect(self.audioDestination)
            self.audioSources.push(audioSource)
          }
        } else {
          console.error('audioSources 不存在！！无法添加音频')
          window.alert('audioSources 不存在！！无法添加音频')
        }
        console.warn('self.audioSources: ', self.audioSources)
      }
    })
  }

  this.releaseStreams = function () {
    videos = []
    isStopDrawingFrames = true

    if (self.gainNode) {
      self.gainNode.disconnect()
      self.gainNode = null
    }

    if (self.audioSources.length) {
      self.audioSources.forEach(function (source) {
        source.disconnect()
      })
      self.audioSources = []
    }

    if (self.audioDestination) {
      self.audioDestination.disconnect()
      self.audioDestination = null
    }

    self.audioContext = null

    context.clearRect(0, 0, canvas.width, canvas.height)

    if (canvas.stream) {
      canvas.stream.stop()
      canvas.stream = null
    }
  }

  this.resetVideoStreams = function (streams) {
    if (streams && !(streams instanceof Array)) {
      streams = [streams]
    }

    resetVideoStreams(streams)
  }

  function resetVideoStreams (streams) {
    videos = []
    streams = streams || arrayOfMediaStreams

    // via: @adrian-ber
    streams.forEach(function (stream) {
      if (!stream.getVideoTracks().length) {
        return
      }

      const video = getVideo(stream)
      video.stream = stream
      videos.push(video)
    })
  }

  // for debugging
  this.name = 'MultiStreamsMixer'
  this.toString = function () {
    return this.name
  }

  this.getMixedStream = getMixedStream()
}

// _____________________________
// Cross-Browser-Declarations.js

const browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

(function (that) {
  if (typeof window !== 'undefined') {
    return
  }

  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    global.navigator = {
      userAgent: browserFakeUserAgent,
      getUserMedia: function () {}
    }

    /* global window:true */
    that.window = global
  } else if (typeof window === 'undefined') {
    // window = this;
  }

  if (typeof document === 'undefined') {
    /* global document:true */
    that.document = {}

    document.createElement = document.captureStream = document.mozCaptureStream = function () {
      return {}
    }
  }

  if (typeof location === 'undefined') {
    /* global location:true */
    that.location = {
      protocol: 'file:',
      href: '',
      hash: ''
    }
  }

  if (typeof screen === 'undefined') {
    /* global screen:true */
    that.screen = {
      width: 0,
      height: 0
    }
  }
})(typeof global !== 'undefined' ? global : window)

// WebAudio API representer
const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext
/* jshint -W079 */
const URL = window.URL || window.webkitURL

if (typeof navigator !== 'undefined') {
  navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia
} else {
  navigator = {
    getUserMedia: function () {},
    userAgent: browserFakeUserAgent
  }
}

const IsEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveBlob || !!navigator.msSaveOrOpenBlob)
let IsOpera = false
if (typeof opera !== 'undefined' && navigator.userAgent && navigator.userAgent.indexOf('OPR/') !== -1) {
  IsOpera = true
}
const IsChrome = !IsEdge && !IsEdge && !!navigator.webkitGetUserMedia
let MediaStream = window.MediaStream
if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
  MediaStream = webkitMediaStream
}

/* global MediaStream:true */
if (typeof MediaStream !== 'undefined') {
  if (!('getVideoTracks' in MediaStream.prototype)) {
    MediaStream.prototype.getVideoTracks = function () {
      if (!this.getTracks) {
        return []
      }

      const tracks = []
      this.getTracks.forEach(function (track) {
        if (track.kind.toString().indexOf('video') !== -1) {
          tracks.push(track)
        }
      })
      return tracks
    }

    MediaStream.prototype.getAudioTracks = function () {
      if (!this.getTracks) {
        return []
      }

      const tracks = []
      this.getTracks.forEach(function (track) {
        if (track.kind.toString().indexOf('audio') !== -1) {
          tracks.push(track)
        }
      })
      return tracks
    }
  }

  if (!('stop' in MediaStream.prototype)) {
    MediaStream.prototype.stop = function () {
      this.getAudioTracks().forEach(function (track) {
        if (track.stop) {
          track.stop()
        }
      })

      this.getVideoTracks().forEach(function (track) {
        if (track.stop) {
          track.stop()
        }
      })
    }
  }
}

if (typeof location !== 'undefined') {
  if (location.href.indexOf('file:') === 0) {
    console.error('Please load this HTML file on HTTP or HTTPS.')
  }
}

// Merge all other data-types except "function"

function mergeProps (mergein, mergeto) {
  for (const t in mergeto) {
    if (typeof mergeto[t] !== 'function') {
      mergein[t] = mergeto[t]
    }
  }
  return mergein
}

// "dropFirstFrame" has been added by Graham Roth
// https://github.com/gsroth

function dropFirstFrame (arr) {
  arr.shift()
  return arr
}

/**
 * 生成video，预览本地流
 * @param blobs 获取的blob
 * @param stream 获取的stream
 */
function streamPreview (blobs, stream) {
  const video = document.createElement('video')
  video.style.height = '200px'
  video.controls = true
  video.autoplay = true

  if (blobs) {
    video.src = window.URL.createObjectURL(blobs)
  } else if (stream) {
    video.srcObject = stream
  }

  video.addEventListener('loadedmetadata', function () {
    const res = 'video resolution: ' + video.videoWidth + '*' + video.videoHeight
    console.warn('预览本地流: ' + res)
  })
  video.play()
  document.body.appendChild(video)
}

/**
 * @param {Blob} file - File or Blob object. This parameter is required.
 * @param {string} fileName - Optional file name e.g. "Recorded-Video.webm"
 * @example
 * invokeSaveAsDialog(blob or file, [optional] fileName);
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 */
function invokeSaveAsDialog (file, fileName) {
  if (!file) {
    throw Error('Blob object is required.')
  }

  if (!file.type) {
    try {
      file.type = 'video/webm;codecs=vp8'
    } catch (e) {
      console.error(e)
    }
  }

  let fileExtension = (file.type || 'video/webm;codecs=vp8').split('/')[1]

  if (fileName && fileName.indexOf('.') !== -1) {
    const splitted = fileName.split('.')
    fileName = splitted[0]
    fileExtension = splitted[1]
  }

  const fileFullName = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + fileExtension

  if (typeof navigator.msSaveOrOpenBlob !== 'undefined') {
    return navigator.msSaveOrOpenBlob(file, fileFullName)
  } else if (typeof navigator.msSaveBlob !== 'undefined') {
    return navigator.msSaveBlob(file, fileFullName)
  }
  console.log('download fileFullName: ', fileFullName)

  const hyperlink = document.createElement('a')
  hyperlink.href = window.URL.createObjectURL(file)
  hyperlink.target = '_blank'
  hyperlink.download = fileFullName

  if (navigator.mozGetUserMedia) {
    hyperlink.onclick = function () {
      (document.body || document.documentElement).removeChild(hyperlink)
    };
    (document.body || document.documentElement).appendChild(hyperlink)
  }

  const evt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  })

  hyperlink.dispatchEvent(evt)

  if (!navigator.mozGetUserMedia) {
    URL.revokeObjectURL(hyperlink.href)
  }
}

function bytesToSize (bytes) {
  const k = 1000
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) {
    return '0 Bytes'
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10)
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

// ______________ (used to handle stuff like http://goo.gl/xmE5eg) issue #129
// ObjectStore.js
const ObjectStore = {
  AudioContext: AudioContext
}

function isMediaRecorderCompatible () {
  const isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
  const isChrome = !!window.chrome && !isOpera
  const isFirefox = typeof window.InstallTrigger !== 'undefined'

  if (isFirefox) {
    return true
  }

  if (!isChrome) {
    return false
  }

  const nVer = navigator.appVersion
  const nAgt = navigator.userAgent
  let fullVersion = '' + parseFloat(navigator.appVersion)
  let majorVersion = parseInt(navigator.appVersion, 10)
  let nameOffset, verOffset, ix

  if (isChrome) {
    verOffset = nAgt.indexOf('Chrome')
    fullVersion = nAgt.substring(verOffset + 7)
  }

  // trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(';')) !== -1) {
    fullVersion = fullVersion.substring(0, ix)
  }

  if ((ix = fullVersion.indexOf(' ')) !== -1) {
    fullVersion = fullVersion.substring(0, ix)
  }

  majorVersion = parseInt('' + fullVersion, 10)

  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion)
    majorVersion = parseInt(navigator.appVersion, 10)
  }

  return majorVersion >= 49
}

// ==================
// MediaRecorder.js

/**
 * Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
 * The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
 * a MediaEncoder will be created and accept the mediaStream as input source.
 * Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
 * The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
 * Thread model:
 * When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
 * Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
 */

function MediaRecorderWrapper (mediaStream) {
  const self = this

  /**
   * This method records MediaStream.
   * @method
   * @memberof MediaStreamRecorder
   * @example
   * recorder.start(5000);
   */
  this.start = function (timeSlice, __disableLogs) {
    this.timeSlice = timeSlice || 5000

    if (!self.mimeType) {
      self.mimeType = 'video/webm;codecs=vp8'
    }

    if (self.mimeType.indexOf('audio') !== -1) {
      if (mediaStream.getVideoTracks().length && mediaStream.getAudioTracks().length) {
        let stream
        if (navigator.mozGetUserMedia) {
          stream = new MediaStream()
          stream.addTrack(mediaStream.getAudioTracks()[0])
        } else {
          // webkitMediaStream
          stream = new MediaStream(mediaStream.getAudioTracks())
        }
        mediaStream = stream
      }
    }

    if (self.mimeType.indexOf('audio') !== -1) {
      self.mimeType = IsChrome ? 'audio/webm' : 'audio/ogg'
    }

    self.dontFireOnDataAvailableEvent = false

    let recorderHints = {
      mimeType: self.mimeType
    }

    if (!self.disableLogs && !__disableLogs) {
      console.log('Passing following params over MediaRecorder API.', recorderHints)
    }

    if (mediaRecorder) {
      // mandatory to make sure Firefox doesn't fails to record streams 3-4 times without reloading the page.
      mediaRecorder = null
    }

    if (IsChrome && !isMediaRecorderCompatible()) {
      // to support video-only recording on stable
      recorderHints = 'video/vp8'
    }

    // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
    // https://wiki.mozilla.org/Gecko:MediaRecorder
    // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html

    // starting a recording session; which will initiate "Reading Thread"
    // "Reading Thread" are used to prevent main-thread blocking scenarios
    try {
      mediaRecorder = new MediaRecorder(mediaStream, recorderHints)
    } catch (e) {
      // if someone passed NON_supported mimeType
      // or if Firefox on Android
      mediaRecorder = new MediaRecorder(mediaStream)
    }

    if ('canRecordMimeType' in mediaRecorder && mediaRecorder.canRecordMimeType(self.mimeType) === false) {
      if (!self.disableLogs) {
        console.warn('MediaRecorder API seems unable to record mimeType:', self.mimeType)
      }
    }

    // i.e. stop recording when <video> is paused by the user; and auto restart recording
    // when video is resumed. E.g. yourStream.getVideoTracks()[0].muted = true; // it will auto-stop recording.
    if (self.ignoreMutedMedia === true) {
      //  用以指定 MediaRecorder是否录制无声的输入源. 如果这个属性是false. 录制器对象MediaRecorder  会录制无声的音频或者黑屏的视频, 默认值是false
      mediaRecorder.ignoreMutedMedia = true
    }
    let firedOnDataAvailableOnce = false

    // Dispatching OnDataAvailable Handler
    mediaRecorder.ondataavailable = function (e) {
      if (!mediaRecorder) {
        return
      }
      // how to fix FF-corrupt-webm issues?
      // should we leave this?          e.data.size < 26800
      if (!e.data || !e.data.size || e.data.size < 26800 || firedOnDataAvailableOnce) {
        return
      }
      firedOnDataAvailableOnce = true
      const blob = self.getNativeBlob ? e.data : new window.Blob([e.data], {
        type: self.mimeType || 'video/webm;codecs=vp8'
      })

      self.ondataavailable(blob)

      // self.dontFireOnDataAvailableEvent = true;

      if (!!mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
      mediaRecorder = null

      if (self.dontFireOnDataAvailableEvent) {
        return
      }

      // record next interval
      self.start(timeSlice, '__disableLogs')
    }

    mediaRecorder.onerror = function (error) {
      if (!self.disableLogs) {
        if (error.name === 'InvalidState') {
          console.error('The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.')
        } else if (error.name === 'OutOfMemory') {
          console.error('The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.')
        } else if (error.name === 'IllegalStreamModification') {
          console.error('A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.')
        } else if (error.name === 'OtherRecordingError') {
          console.error('Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.')
        } else if (error.name === 'GenericError') {
          console.error('The UA cannot provide the codec or recording option that has been requested.', error)
        } else {
          console.error('MediaRecorder Error', error)
        }
      }

      // When the stream is "ended" set recording to 'inactive'
      // and stop gathering data. Callers should not rely on
      // exactness of the timeSlice value, especially
      // if the timeSlice value is small. Callers should
      // consider timeSlice as a minimum value

      if (!!mediaRecorder && mediaRecorder.state !== 'inactive' && mediaRecorder.state !== 'stopped') {
        mediaRecorder.stop()
      }
    }

    // void start(optional long mTimeSlice)
    // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
    // handler. "mTimeSlice < 0" means Session object does not push encoded data to
    // onDataAvailable, instead, it passive wait the client side pull encoded data
    // by calling requestData API.
    try {
      mediaRecorder.start()
    } catch (e) {
      mediaRecorder = null
    }

    setTimeout(function () {
      if (!mediaRecorder) {
        return
      }

      if (mediaRecorder.state === 'recording') {
        // "stop" method auto invokes "requestData"!
        mediaRecorder.requestData()
        // mediaRecorder.stop();
      }
    }, timeSlice)

    // Start recording. If timeSlice has been provided, mediaRecorder will
    // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
    // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.
  }

  /**
   * This method stops recording MediaStream.
   * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
   * @method
   * @memberof MediaStreamRecorder
   * @example
   * recorder.stop(function(blob) {
   *     video.src = URL.createObjectURL(blob);
   * });
   */
  this.stop = function (callback) {
    if (!mediaRecorder) {
      return
    }

    // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
    // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

    if (mediaRecorder.state === 'recording') {
      // "stop" method auto invokes "requestData"!
      mediaRecorder.requestData()

      setTimeout(function () {
        self.dontFireOnDataAvailableEvent = true
        if (!!mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
        mediaRecorder = null
        self.onstop()
      }, 2000)
    }
  }

  /**
   * This method pauses the recording process.
   * @method
   * @memberof MediaStreamRecorder
   * @example
   * recorder.pause();
   */
  this.pause = function () {
    if (!mediaRecorder) {
      return
    }

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.pause()
    }

    this.dontFireOnDataAvailableEvent = true
  }

  /**
   * The recorded blobs are passed over this event.
   * @event
   * @memberof MediaStreamRecorder
   * @example
   * recorder.ondataavailable = function(data) {};
   */
  this.ondataavailable = function (blob) {
    console.log('recorded-blob', blob)
  }

  /**
   * This method resumes the recording process.
   * @method
   * @memberof MediaStreamRecorder
   * @example
   * recorder.resume();
   */
  this.resume = function () {
    if (this.dontFireOnDataAvailableEvent) {
      this.dontFireOnDataAvailableEvent = false

      const disableLogs = self.disableLogs
      self.disableLogs = true
      this.start(this.timeslice || 5000)
      self.disableLogs = disableLogs
      return
    }

    if (!mediaRecorder) {
      return
    }

    if (mediaRecorder.state === 'paused') {
      mediaRecorder.resume()
    }
  }

  /**
   * This method resets currently recorded data.
   * @method
   * @memberof MediaStreamRecorder
   * @example
   * recorder.clearRecordedData();
   */
  this.clearRecordedData = function () {
    if (!mediaRecorder) {
      return
    }

    this.pause()

    this.dontFireOnDataAvailableEvent = true
    this.stop()
  }

  this.onstop = function () {

  }

  // Reference to "MediaRecorder" object
  let mediaRecorder

  function isMediaStreamActive () {
    if ('active' in mediaStream) {
      if (!mediaStream.active) {
        return false
      }
    } else if ('ended' in mediaStream) { // old hack
      if (mediaStream.ended) {
        return false
      }
    }
    return true
  }

  // this method checks if media stream is stopped
  // or any track is ended.
  (function looper () {
    if (!mediaRecorder) {
      return
    }

    if (isMediaStreamActive() === false) {
      self.stop()
      return
    }

    setTimeout(looper, 1000) // check every second
  })()
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.MediaRecorderWrapper = MediaRecorderWrapper
}

// ======================
// StereoAudioRecorder.js

function StereoAudioRecorder (mediaStream) {
  // void start(optional long timeSlice)
  // timestamp to fire "ondataavailable"
  this.start = function (timeSlice) {
    timeSlice = timeSlice || 1000

    mediaRecorder = new StereoAudioRecorderHelper(mediaStream, this)

    mediaRecorder.record()

    timeout = setInterval(function () {
      mediaRecorder.requestData()
    }, timeSlice)
  }

  this.stop = function () {
    if (mediaRecorder) {
      mediaRecorder.stop()
      clearTimeout(timeout)
      this.onstop()
    }
  }

  this.pause = function () {
    if (!mediaRecorder) {
      return
    }

    mediaRecorder.pause()
  }

  this.resume = function () {
    if (!mediaRecorder) {
      return
    }

    mediaRecorder.resume()
  }

  this.ondataavailable = function () {}
  this.onstop = function () {}

  // Reference to "StereoAudioRecorder" object
  let mediaRecorder
  let timeout
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.StereoAudioRecorder = StereoAudioRecorder
}

// ============================
// StereoAudioRecorderHelper.js

// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js

function StereoAudioRecorderHelper (mediaStream, root) {
  // letiables
  let deviceSampleRate = 44100 // range: 22050 to 96000
  if (!ObjectStore.AudioContextConstructor) {
    ObjectStore.AudioContextConstructor = new ObjectStore.AudioContext()
  }
  // check device sample rate
  deviceSampleRate = ObjectStore.AudioContextConstructor.sampleRate

  const leftchannel = []
  const rightchannel = []
  let scriptprocessornode
  let recording = false
  let recordingLength = 0
  const sampleRate = root.sampleRate || deviceSampleRate
  const mimeType = root.mimeType || 'audio/wav'
  const isPCM = mimeType.indexOf('audio/pcm') > -1
  const numChannels = root.audioChannels || 2

  this.record = function () {
    recording = true
    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = 0
    recordingLength = 0
  }

  this.requestData = function () {
    if (isPaused) {
      return
    }

    if (recordingLength === 0) {
      requestDataInvoked = false
      return
    }

    requestDataInvoked = true
    // clone stuff
    const internalLeftChannel = leftchannel.slice(0)
    const internalRightChannel = rightchannel.slice(0)
    const internalRecordingLength = recordingLength

    // reset the buffers for the new recording
    leftchannel.length = rightchannel.length = []
    recordingLength = 0
    requestDataInvoked = false

    // we flat the left and right channels down
    const leftBuffer = mergeBuffers(internalLeftChannel, internalRecordingLength)

    let interleaved = leftBuffer

    // we interleave both channels together
    if (numChannels === 2) {
      const rightBuffer = mergeBuffers(internalRightChannel, internalRecordingLength) // bug fixed via #70,#71
      interleaved = interleave(leftBuffer, rightBuffer)
    }

    if (isPCM) {
      // our final binary blob
      const blob = new window.Blob([convertoFloat32ToInt16(interleaved)], {
        type: 'audio/pcm'
      })

      console.debug('audio recorded blob size:', bytesToSize(blob.size))
      root.ondataavailable(blob)
      return
    }

    // we create our wav file
    const buffer = new ArrayBuffer(44 + interleaved.length * 2)
    const view = new DataView(buffer)

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF')

    // -8 (via #97)
    view.setUint32(4, 44 + interleaved.length * 2 - 8, true)

    writeUTFBytes(view, 8, 'WAVE')
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    // stereo (2 channels)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * 2, true) // numChannels * 2 (via #71)
    view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, 16, true)
    // data sub-chunk
    writeUTFBytes(view, 36, 'data')
    view.setUint32(40, interleaved.length * 2, true)

    // write the PCM samples
    const lng = interleaved.length
    let index = 44
    const volume = 1
    for (let i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7FFF * volume), true)
      index += 2
    }

    // our final binary blob
    const blob = new Blob([view], {
      type: 'audio/wav'
    })

    console.debug('audio recorded blob size:', bytesToSize(blob.size))

    root.ondataavailable(blob)
  }

  this.stop = function () {
    // we stop recording
    recording = false
    this.requestData()

    audioInput.disconnect()
    this.onstop()
  }

  function interleave (leftChannel, rightChannel) {
    const length = leftChannel.length + rightChannel.length
    const result = new Float32Array(length)

    let inputIndex = 0

    for (let index = 0; index < length;) {
      result[index++] = leftChannel[inputIndex]
      result[index++] = rightChannel[inputIndex]
      inputIndex++
    }
    return result
  }

  function mergeBuffers (channelBuffer, recordingLength) {
    const result = new Float32Array(recordingLength)
    let offset = 0
    const lng = channelBuffer.length
    for (let i = 0; i < lng; i++) {
      const buffer = channelBuffer[i]
      result.set(buffer, offset)
      offset += buffer.length
    }
    return result
  }

  function writeUTFBytes (view, offset, string) {
    const lng = string.length
    for (let i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  function convertoFloat32ToInt16 (buffer) {
    let l = buffer.length
    const buf = new Int16Array(l)

    while (l--) {
      buf[l] = buffer[l] * 0xFFFF // convert to 16 bit
    }
    return buf.buffer
  }

  // creates the audio context
  const context = ObjectStore.AudioContextConstructor

  // creates a gain node
  ObjectStore.VolumeGainNode = context.createGain()

  const volume = ObjectStore.VolumeGainNode

  // creates an audio node from the microphone incoming stream
  ObjectStore.AudioInput = context.createMediaStreamSource(mediaStream)

  // creates an audio node from the microphone incoming stream
  const audioInput = ObjectStore.AudioInput

  // connect the stream to the gain node
  audioInput.connect(volume)

  /* From the spec: This value controls how frequently the audioprocess event is
  dispatched and how many sample-frames need to be processed each call.
  Lower values for buffer size will result in a lower (better) latency.
  Higher values will be necessary to avoid audio breakup and glitches
  Legal values are 256, 512, 1024, 2048, 4096, 8192, and 16384. */
  let bufferSize = root.bufferSize || 2048
  if (root.bufferSize === 0) {
    bufferSize = 0
  }

  if (context.createJavaScriptNode) {
    scriptprocessornode = context.createJavaScriptNode(bufferSize, numChannels, numChannels)
  } else if (context.createScriptProcessor) {
    scriptprocessornode = context.createScriptProcessor(bufferSize, numChannels, numChannels)
  } else {
    throw 'WebAudio API has no support on this browser.'
  }

  bufferSize = scriptprocessornode.bufferSize

  console.debug('using audio buffer-size:', bufferSize)

  let requestDataInvoked = false

  // sometimes "scriptprocessornode" disconnects from he destination-node
  // and there is no exception thrown in this case.
  // and obviously no further "ondataavailable" events will be emitted.
  // below global-scope letiable is added to debug such unexpected but "rare" cases.
  window.scriptprocessornode = scriptprocessornode

  if (numChannels === 1) {
    console.debug('All right-channels are skipped.')
  }

  let isPaused = false

  this.pause = function () {
    isPaused = true
  }

  this.resume = function () {
    isPaused = false
  }

  this.onstop = function () {}

  // http://webaudio.github.io/web-audio-api/#the-scriptprocessornode-interface
  scriptprocessornode.onaudioprocess = function (e) {
    if (!recording || requestDataInvoked || isPaused) {
      return
    }

    const left = e.inputBuffer.getChannelData(0)
    leftchannel.push(new Float32Array(left))

    if (numChannels === 2) {
      const right = e.inputBuffer.getChannelData(1)
      rightchannel.push(new Float32Array(right))
    }
    recordingLength += bufferSize
  }

  volume.connect(scriptprocessornode)
  scriptprocessornode.connect(context.destination)
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.StereoAudioRecorderHelper = StereoAudioRecorderHelper
}

// ===================
// WhammyRecorder.js

function WhammyRecorder (mediaStream) {
  // void start(optional long timeSlice)
  // timestamp to fire "ondataavailable"
  this.start = function (timeSlice) {
    timeSlice = timeSlice || 1000

    mediaRecorder = new WhammyRecorderHelper(mediaStream, this)

    for (const prop in this) {
      if (typeof this[prop] !== 'function') {
        mediaRecorder[prop] = this[prop]
      }
    }

    mediaRecorder.record()

    timeout = setInterval(function () {
      mediaRecorder.requestData()
    }, timeSlice)
  }

  this.stop = function () {
    if (mediaRecorder) {
      mediaRecorder.stop()
      clearTimeout(timeout)
      this.onstop()
    }
  }

  this.onstop = function () {}

  this.clearOldRecordedFrames = function () {
    if (mediaRecorder) {
      mediaRecorder.clearOldRecordedFrames()
    }
  }

  this.pause = function () {
    if (!mediaRecorder) {
      return
    }

    mediaRecorder.pause()
  }

  this.resume = function () {
    if (!mediaRecorder) {
      return
    }

    mediaRecorder.resume()
  }

  this.ondataavailable = function () {}

  // Reference to "WhammyRecorder" object
  let mediaRecorder
  let timeout
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.WhammyRecorder = WhammyRecorder
}

// ==========================
// WhammyRecorderHelper.js

function WhammyRecorderHelper (mediaStream, root) {
  this.record = function (timeSlice) {
    if (!this.width) {
      this.width = 320
    }
    if (!this.height) {
      this.height = 240
    }

    if (this.video && this.video instanceof HTMLVideoElement) {
      if (!this.width) {
        this.width = video.videoWidth || video.clientWidth || 320
      }
      if (!this.height) {
        this.height = video.videoHeight || video.clientHeight || 240
      }
    }

    if (!this.video) {
      this.video = {
        width: this.width,
        height: this.height
      }
    }

    if (!this.canvas || !this.canvas.width || !this.canvas.height) {
      this.canvas = {
        width: this.width,
        height: this.height
      }
    }

    canvas.width = this.canvas.width
    canvas.height = this.canvas.height

    // setting defaults
    if (this.video && this.video instanceof HTMLVideoElement) {
      this.isHTMLObject = true
      video = this.video.cloneNode()
    } else {
      video = document.createElement('video')
      video.src = URL.createObjectURL(mediaStream)

      video.width = this.video.width
      video.height = this.video.height
    }

    video.muted = true
    video.play()

    lastTime = new Date().getTime()
    whammy = new Whammy.Video(root.speed, root.quality)

    console.log('canvas resolutions', canvas.width, '*', canvas.height)
    console.log('video width/height', video.width || canvas.width, '*', video.height || canvas.height)

    drawFrames()
  }

  this.clearOldRecordedFrames = function () {
    whammy.frames = []
  }

  let requestDataInvoked = false
  this.requestData = function () {
    if (isPaused) {
      return
    }

    if (!whammy.frames.length) {
      requestDataInvoked = false
      return
    }

    requestDataInvoked = true
    // clone stuff
    const internalFrames = whammy.frames.slice(0)

    // reset the frames for the new recording

    whammy.frames = dropBlackFrames(internalFrames, -1)

    whammy.compile(function (whammyBlob) {
      root.ondataavailable(whammyBlob)
      console.debug('video recorded blob size:', bytesToSize(whammyBlob.size))
    })

    whammy.frames = []

    requestDataInvoked = false
  }

  let isOnStartedDrawingNonBlankFramesInvoked = false

  function drawFrames () {
    if (isPaused) {
      lastTime = new Date().getTime()
      setTimeout(drawFrames, 500)
      return
    }

    if (isStopDrawing) {
      return
    }

    if (requestDataInvoked) {
      return setTimeout(drawFrames, 100)
    }

    const duration = new Date().getTime() - lastTime
    if (!duration) {
      return drawFrames()
    }

    // via webrtc-experiment#206, by Jack i.e. @Seymourr
    lastTime = new Date().getTime()

    if (!self.isHTMLObject && video.paused) {
      video.play() // Android
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    if (!isStopDrawing) {
      whammy.frames.push({
        duration: duration,
        image: canvas.toDataURL('image/webp')
      })
    }

    if (!isOnStartedDrawingNonBlankFramesInvoked && !isBlankFrame(whammy.frames[whammy.frames.length - 1])) {
      isOnStartedDrawingNonBlankFramesInvoked = true
      root.onStartedDrawingNonBlankFrames()
    }

    setTimeout(drawFrames, 10)
  }

  let isStopDrawing = false

  this.stop = function () {
    isStopDrawing = true
    this.requestData()
    this.onstop()
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  let video
  let lastTime
  let whammy

  const self = this

  function isBlankFrame (frame, _pixTolerance, _frameTolerance) {
    const localCanvas = document.createElement('canvas')
    localCanvas.width = canvas.width
    localCanvas.height = canvas.height
    const context2d = localCanvas.getContext('2d')

    const sampleColor = {
      r: 0,
      g: 0,
      b: 0
    }
    const maxColorDifference = Math.sqrt(
      Math.pow(255, 2) +
      Math.pow(255, 2) +
      Math.pow(255, 2)
    )
    const pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0
    const frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0

    let matchPixCount, endPixCheck, maxPixCount

    const image = new Image()
    image.src = frame.image
    context2d.drawImage(image, 0, 0, canvas.width, canvas.height)
    const imageData = context2d.getImageData(0, 0, canvas.width, canvas.height)
    matchPixCount = 0
    endPixCheck = imageData.data.length
    maxPixCount = imageData.data.length / 4

    for (let pix = 0; pix < endPixCheck; pix += 4) {
      const currentColor = {
        r: imageData.data[pix],
        g: imageData.data[pix + 1],
        b: imageData.data[pix + 2]
      }
      const colorDifference = Math.sqrt(
        Math.pow(currentColor.r - sampleColor.r, 2) +
        Math.pow(currentColor.g - sampleColor.g, 2) +
        Math.pow(currentColor.b - sampleColor.b, 2)
      )
      // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
      if (colorDifference <= maxColorDifference * pixTolerance) {
        matchPixCount++
      }
    }

    if (maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
      return false
    } else {
      return true
    }
  }

  function dropBlackFrames (_frames, _framesToCheck, _pixTolerance, _frameTolerance) {
    const localCanvas = document.createElement('canvas')
    localCanvas.width = canvas.width
    localCanvas.height = canvas.height
    const context2d = localCanvas.getContext('2d')
    let resultFrames = []

    const checkUntilNotBlack = _framesToCheck === -1
    const endCheckFrame = (_framesToCheck && _framesToCheck > 0 && _framesToCheck <= _frames.length)
      ? _framesToCheck : _frames.length
    const sampleColor = {
      r: 0,
      g: 0,
      b: 0
    }
    const maxColorDifference = Math.sqrt(
      Math.pow(255, 2) +
      Math.pow(255, 2) +
      Math.pow(255, 2)
    )
    const pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0
    const frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0
    let doNotCheckNext = false

    for (let f = 0; f < endCheckFrame; f++) {
      let matchPixCount, endPixCheck, maxPixCount

      if (!doNotCheckNext) {
        const image = new Image()
        image.src = _frames[f].image
        context2d.drawImage(image, 0, 0, canvas.width, canvas.height)
        const imageData = context2d.getImageData(0, 0, canvas.width, canvas.height)
        matchPixCount = 0
        endPixCheck = imageData.data.length
        maxPixCount = imageData.data.length / 4

        for (let pix = 0; pix < endPixCheck; pix += 4) {
          const currentColor = {
            r: imageData.data[pix],
            g: imageData.data[pix + 1],
            b: imageData.data[pix + 2]
          }
          const colorDifference = Math.sqrt(
            Math.pow(currentColor.r - sampleColor.r, 2) +
            Math.pow(currentColor.g - sampleColor.g, 2) +
            Math.pow(currentColor.b - sampleColor.b, 2)
          )
          // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
          if (colorDifference <= maxColorDifference * pixTolerance) {
            matchPixCount++
          }
        }
      }

      if (!doNotCheckNext && maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
        // console.log('removed black frame : ' + f + ' ; frame duration ' + _frames[f].duration);
      } else {
        // console.log('frame is passed : ' + f);
        if (checkUntilNotBlack) {
          doNotCheckNext = true
        }
        resultFrames.push(_frames[f])
      }
    }

    resultFrames = resultFrames.concat(_frames.slice(endCheckFrame))

    if (resultFrames.length <= 0) {
      // at least one last frame should be available for next manipulation
      // if total duration of all frames will be < 1000 than ffmpeg doesn't work well...
      resultFrames.push(_frames[_frames.length - 1])
    }

    return resultFrames
  }

  let isPaused = false

  this.pause = function () {
    isPaused = true
  }

  this.resume = function () {
    isPaused = false
  }

  this.onstop = function () {}
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.WhammyRecorderHelper = WhammyRecorderHelper
}

// --------------
// GifRecorder.js

function GifRecorder (mediaStream) {
  if (typeof GIFEncoder === 'undefined') {
    throw 'Please link: https://cdn.webrtc-experiment.com/gif-recorder.js'
  }

  // void start(optional long timeSlice)
  // timestamp to fire "ondataavailable"
  this.start = function (timeSlice) {
    timeSlice = timeSlice || 1000

    const imageWidth = this.videoWidth || 320
    const imageHeight = this.videoHeight || 240

    canvas.width = video.width = imageWidth
    canvas.height = video.height = imageHeight

    // external library to record as GIF images
    gifEncoder = new GIFEncoder()

    // void setRepeat(int iter)
    // Sets the number of times the set of GIF frames should be played.
    // Default is 1; 0 means play indefinitely.
    gifEncoder.setRepeat(0)

    // void setFrameRate(Number fps)
    // Sets frame rate in frames per second.
    // Equivalent to setDelay(1000/fps).
    // Using "setDelay" instead of "setFrameRate"
    gifEncoder.setDelay(this.frameRate || this.speed || 200)

    // void setQuality(int quality)
    // Sets quality of color quantization (conversion of images to the
    // maximum 256 colors allowed by the GIF specification).
    // Lower values (minimum = 1) produce better colors,
    // but slow processing significantly. 10 is the default,
    // and produces good color mapping at reasonable speeds.
    // Values greater than 20 do not yield significant improvements in speed.
    gifEncoder.setQuality(this.quality || 1)

    // Boolean start()
    // This writes the GIF Header and returns false if it fails.
    gifEncoder.start()

    startTime = Date.now()

    function drawVideoFrame (time) {
      if (isPaused) {
        setTimeout(drawVideoFrame, 500, time)
        return
      }

      lastAnimationFrame = requestAnimationFrame(drawVideoFrame)

      if (typeof lastFrameTime === undefined) {
        lastFrameTime = time
      }

      // ~10 fps
      if (time - lastFrameTime < 90) {
        return
      }

      if (video.paused) {
        video.play() // Android
      }

      context.drawImage(video, 0, 0, imageWidth, imageHeight)

      gifEncoder.addFrame(context)

      // console.log('Recording...' + Math.round((Date.now() - startTime) / 1000) + 's');
      // console.log("fps: ", 1000 / (time - lastFrameTime));

      lastFrameTime = time
    }

    lastAnimationFrame = requestAnimationFrame(drawVideoFrame)

    timeout = setTimeout(doneRecording, timeSlice)
  }

  function doneRecording () {
    endTime = Date.now()

    const gifBlob = new Blob([new Uint8Array(gifEncoder.stream().bin)], {
      type: 'image/gif'
    })
    self.ondataavailable(gifBlob)

    // todo: find a way to clear old recorded blobs
    gifEncoder.stream().bin = []
  }

  this.stop = function () {
    if (lastAnimationFrame) {
      cancelAnimationFrame(lastAnimationFrame)
      clearTimeout(timeout)
      doneRecording()
      this.onstop()
    }
  }

  this.onstop = function () {}

  let isPaused = false

  this.pause = function () {
    isPaused = true
  }

  this.resume = function () {
    isPaused = false
  }

  this.ondataavailable = function () {}
  this.onstop = function () {}

  // Reference to itself
  const self = this

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const video = document.createElement('video')
  video.muted = true
  video.autoplay = true
  video.src = URL.createObjectURL(mediaStream)
  video.play()

  let lastAnimationFrame = null
  let startTime, endTime, lastFrameTime

  let gifEncoder
  let timeout
}

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.GifRecorder = GifRecorder
}

// https://github.com/antimatter15/whammy/blob/master/LICENSE
// _________
// Whammy.js

// todo: Firefox now supports webp for webm containers!
// their MediaRecorder implementation works well!
// should we provide an option to record via Whammy.js or MediaRecorder API is a better solution?

/**
 * Whammy is a standalone class used by {@link RecordRTC} to bring video recording in Chrome. It is written by {@link https://github.com/antimatter15|antimatter15}
 * @summary A real time javascript webm encoder based on a canvas hack.
 * @typedef Whammy
 * @class
 * @example
 * let recorder = new Whammy().Video(15);
 * recorder.add(context || canvas || dataURL);
 * let output = recorder.compile();
 */

const Whammy = (function () {
  // a more abstract-ish API

  function WhammyVideo (duration, quality) {
    this.frames = []
    if (!duration) {
      duration = 1
    }
    this.duration = 1000 / duration
    this.quality = quality || 0.8
  }

  /**
   * Pass Canvas or Context or image/webp(string) to {@link Whammy} encoder.
   * @method
   * @memberof Whammy
   * @example
   * recorder = new Whammy().Video(0.8, 100);
   * recorder.add(canvas || context || 'image/webp');
   * @param {string} frame - Canvas || Context || image/webp
   * @param {number} duration - Stick a duration (in milliseconds)
   */
  WhammyVideo.prototype.add = function (frame, duration) {
    if ('canvas' in frame) { // CanvasRenderingContext2D
      frame = frame.canvas
    }

    if ('toDataURL' in frame) {
      frame = frame.toDataURL('image/webp', this.quality)
    }

    if (!(/^data:image\/webp;base64,/ig).test(frame)) {
      throw 'Input must be formatted properly as a base64 encoded DataURI of type image/webp'
    }
    this.frames.push({
      image: frame,
      duration: duration || this.duration
    })
  }

  function processInWebWorker (_function) {
    const blob = URL.createObjectURL(new Blob([_function.toString(),
      'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
    ], {
      type: 'application/javascript'
    }))

    const worker = new Worker(blob)
    URL.revokeObjectURL(blob)
    return worker
  }

  function whammyInWebWorker (frames) {
    function ArrayToWebM (frames) {
      const info = checkFrames(frames)
      if (!info) {
        return []
      }

      const clusterMaxDuration = 30000

      const EBML = [{
        id: 0x1a45dfa3, // EBML
        data: [{
          data: 1,
          id: 0x4286 // EBMLVersion
        }, {
          data: 1,
          id: 0x42f7 // EBMLReadVersion
        }, {
          data: 4,
          id: 0x42f2 // EBMLMaxIDLength
        }, {
          data: 8,
          id: 0x42f3 // EBMLMaxSizeLength
        }, {
          data: 'webm',
          id: 0x4282 // DocType
        }, {
          data: 2,
          id: 0x4287 // DocTypeVersion
        }, {
          data: 2,
          id: 0x4285 // DocTypeReadVersion
        }]
      }, {
        id: 0x18538067, // Segment
        data: [{
          id: 0x1549a966, // Info
          data: [{
            data: 1e6, // do things in millisecs (num of nanosecs for duration scale)
            id: 0x2ad7b1 // TimecodeScale
          }, {
            data: 'whammy',
            id: 0x4d80 // MuxingApp
          }, {
            data: 'whammy',
            id: 0x5741 // WritingApp
          }, {
            data: doubleToString(info.duration),
            id: 0x4489 // Duration
          }]
        }, {
          id: 0x1654ae6b, // Tracks
          data: [{
            id: 0xae, // TrackEntry
            data: [{
              data: 1,
              id: 0xd7 // TrackNumber
            }, {
              data: 1,
              id: 0x73c5 // TrackUID
            }, {
              data: 0,
              id: 0x9c // FlagLacing
            }, {
              data: 'und',
              id: 0x22b59c // Language
            }, {
              data: 'V_VP8',
              id: 0x86 // CodecID
            }, {
              data: 'VP8',
              id: 0x258688 // CodecName
            }, {
              data: 1,
              id: 0x83 // TrackType
            }, {
              id: 0xe0, // Video
              data: [{
                data: info.width,
                id: 0xb0 // PixelWidth
              }, {
                data: info.height,
                id: 0xba // PixelHeight
              }]
            }]
          }]
        }]
      }]

      // Generate clusters (max duration)
      let frameNumber = 0
      let clusterTimecode = 0
      while (frameNumber < frames.length) {
        const clusterFrames = []
        let clusterDuration = 0
        do {
          clusterFrames.push(frames[frameNumber])
          clusterDuration += frames[frameNumber].duration
          frameNumber++
        } while (frameNumber < frames.length && clusterDuration < clusterMaxDuration)

        const clusterCounter = 0
        const cluster = {
          id: 0x1f43b675, // Cluster
          data: getClusterData(clusterTimecode, clusterCounter, clusterFrames)
        } // Add cluster to segment
        EBML[1].data.push(cluster)
        clusterTimecode += clusterDuration
      }

      return generateEBML(EBML)
    }

    function getClusterData (clusterTimecode, clusterCounter, clusterFrames) {
      return [{
        data: clusterTimecode,
        id: 0xe7 // Timecode
      }].concat(clusterFrames.map(function (webp) {
        const block = makeSimpleBlock({
          discardable: 0,
          frame: webp.data.slice(4),
          invisible: 0,
          keyframe: 1,
          lacing: 0,
          trackNum: 1,
          timecode: Math.round(clusterCounter)
        })
        clusterCounter += webp.duration
        return {
          data: block,
          id: 0xa3
        }
      }))
    }

    // sums the lengths of all the frames and gets the duration

    function checkFrames (frames) {
      if (!frames[0]) {
        postMessage({
          error: 'Something went wrong. Maybe WebP format is not supported in the current browser.'
        })
        return
      }

      const width = frames[0].width
      const height = frames[0].height
      let duration = frames[0].duration

      for (let i = 1; i < frames.length; i++) {
        duration += frames[i].duration
      }
      return {
        duration: duration,
        width: width,
        height: height
      }
    }

    function numToBuffer (num) {
      const parts = []
      while (num > 0) {
        parts.push(num & 0xff)
        num = num >> 8
      }
      return new Uint8Array(parts.reverse())
    }

    function strToBuffer (str) {
      return new Uint8Array(str.split('').map(function (e) {
        return e.charCodeAt(0)
      }))
    }

    function bitsToBuffer (bits) {
      const data = []
      const pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : ''
      bits = pad + bits
      for (let i = 0; i < bits.length; i += 8) {
        data.push(parseInt(bits.substr(i, 8), 2))
      }
      return new Uint8Array(data)
    }

    function generateEBML (json) {
      const ebml = []
      for (let i = 0; i < json.length; i++) {
        let data = json[i].data

        if (typeof data === 'object') {
          data = generateEBML(data)
        }

        if (typeof data === 'number') {
          data = bitsToBuffer(data.toString(2))
        }

        if (typeof data === 'string') {
          data = strToBuffer(data)
        }

        const len = data.size || data.byteLength || data.length
        const zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8)
        const sizeToString = len.toString(2)
        const padded = (new Array((zeroes * 7 + 7 + 1) - sizeToString.length)).join('0') + sizeToString
        const size = (new Array(zeroes)).join('0') + '1' + padded

        ebml.push(numToBuffer(json[i].id))
        ebml.push(bitsToBuffer(size))
        ebml.push(data)
      }

      return new Blob(ebml, {
        type: 'video/webm;codecs=vp8'
      })
    }

    function toBinStrOld (bits) {
      let data = ''
      const pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : ''
      bits = pad + bits
      for (let i = 0; i < bits.length; i += 8) {
        data += String.fromCharCode(parseInt(bits.substr(i, 8), 2))
      }
      return data
    }

    function makeSimpleBlock (data) {
      let flags = 0

      if (data.keyframe) {
        flags |= 128
      }

      if (data.invisible) {
        flags |= 8
      }

      if (data.lacing) {
        flags |= (data.lacing << 1)
      }

      if (data.discardable) {
        flags |= 1
      }

      if (data.trackNum > 127) {
        throw 'TrackNumber > 127 not supported'
      }

      const out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function (e) {
        return String.fromCharCode(e)
      }).join('') + data.frame

      return out
    }

    function parseWebP (riff) {
      const VP8 = riff.RIFF[0].WEBP[0]

      const frameStart = VP8.indexOf('\x9d\x01\x2a') // A VP8 keyframe starts with the 0x9d012a header
      for (let i = 0, c = []; i < 4; i++) {
        c[i] = VP8.charCodeAt(frameStart + 3 + i)
      }

      let width, height, tmp

      // the code below is literally copied verbatim from the bitstream spec
      tmp = (c[1] << 8) | c[0]
      width = tmp & 0x3FFF
      tmp = (c[3] << 8) | c[2]
      height = tmp & 0x3FFF
      return {
        width: width,
        height: height,
        data: VP8,
        riff: riff
      }
    }

    function getStrLength (string, offset) {
      return parseInt(string.substr(offset + 4, 4).split('').map(function (i) {
        const unpadded = i.charCodeAt(0).toString(2)
        return (new Array(8 - unpadded.length + 1)).join('0') + unpadded
      }).join(''), 2)
    }

    function parseRIFF (string) {
      let offset = 0
      const chunks = {}

      while (offset < string.length) {
        const id = string.substr(offset, 4)
        const len = getStrLength(string, offset)
        const data = string.substr(offset + 4 + 4, len)
        offset += 4 + 4 + len
        chunks[id] = chunks[id] || []

        if (id === 'RIFF' || id === 'LIST') {
          chunks[id].push(parseRIFF(data))
        } else {
          chunks[id].push(data)
        }
      }
      return chunks
    }

    function doubleToString (num) {
      return [].slice.call(
        new Uint8Array((new Float64Array([num])).buffer), 0).map(function (e) {
        return String.fromCharCode(e)
      }).reverse().join('')
    }

    const webm = new ArrayToWebM(frames.map(function (frame) {
      const webp = parseWebP(parseRIFF(atob(frame.image.slice(23))))
      webp.duration = frame.duration
      return webp
    }))

    postMessage(webm)
  }

  /**
   * Encodes frames in WebM container. It uses WebWorkinvoke to invoke 'ArrayToWebM' method.
   * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
   * @method
   * @memberof Whammy
   * @example
   * recorder = new Whammy().Video(0.8, 100);
   * recorder.compile(function(blob) {
   *    // blob.size - blob.type
   * });
   */
  WhammyVideo.prototype.compile = function (callback) {
    const webWorker = processInWebWorker(whammyInWebWorker)

    webWorker.onmessage = function (event) {
      if (event.data.error) {
        console.error(event.data.error)
        return
      }
      callback(event.data)
    }

    webWorker.postMessage(this.frames)
  }

  return {
    /**
     * A more abstract-ish API.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * @param {?number} speed - 0.8
     * @param {?number} quality - 100
     */
    Video: WhammyVideo
  }
})()

if (typeof MediaStreamRecorder !== 'undefined') {
  MediaStreamRecorder.Whammy = Whammy
}

// Last time updated at Nov 18, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/ConcatenateBlobs.js

// Muaz Khan    - www.MuazKhan.com
// MIT License  - www.WebRTC-Experiment.com/licence
// Source Code  - https://github.com/muaz-khan/ConcatenateBlobs
// Demo         - https://www.WebRTC-Experiment.com/ConcatenateBlobs/
// ___________________
// ConcatenateBlobs.js

// Simply pass array of blobs.
// This javascript library will concatenate all blobs in single "Blob" object.

(function () {
  window.ConcatenateBlobs = function (blobs, type, callback) {
    var buffers = []

    var index = 0

    function readAsArrayBuffer () {
      if (!blobs[index]) {
        return concatenateBuffers()
      }
      var reader = new window.FileReader()
      reader.onload = function (event) {
        buffers.push(event.target.result)
        index++
        readAsArrayBuffer()
      }
      reader.readAsArrayBuffer(blobs[index])
    }

    readAsArrayBuffer()

    function concatenateBuffers () {
      var byteLength = 0
      buffers.forEach(function (buffer) {
        byteLength += buffer.byteLength
      })

      var tmp = new Uint16Array(byteLength)
      var lastOffset = 0
      buffers.forEach(function (buffer) {
        // BYTES_PER_ELEMENT == 2 for Uint16Array
        var reusableByteLength = buffer.byteLength
        if (reusableByteLength % 2 !== 0) {
          buffer = buffer.slice(0, reusableByteLength - 1)
        }
        tmp.set(new Uint16Array(buffer), lastOffset)
        lastOffset += reusableByteLength
      })

      var blob = new window.Blob([tmp.buffer], {
        type: type
      })

      callback(blob)
    }
  }
})()

// https://github.com/streamproc/MediaStreamRecorder/issues/42
if (typeof module !== 'undefined' /* && !!module.exports */) {
  module.exports = MediaStreamRecorder
}

if (typeof define === 'function' && window.define.amd) {
  window.define('MediaStreamRecorder', [], function () {
    return MediaStreamRecorder
  })
}
