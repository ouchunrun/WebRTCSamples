# Changelog
All notable changes to this project will be documented in this file.

## [2020-5-5]

### Changed

- minify ES6 functions with gulp-uglify-es.

- generate source maps, use gulp-sourcemaps.

## [2020-4-30]
### Changed

- 替换压缩文件为非压
- 添加webpack打包：不能按照顺序打包，输出文件存在问题，暂时使用gulp打包非压文件

### 踩坑
- event-target-shim 存在和window全局变量重名的函数，使用时报错，查了很久！！！
-  web worker 位于外部文件中，它们无法访问下例 JavaScript 对象：window 对象、document 对象、parent 对象。


## [2020-4-30]
### Issues

- No audio when firefox captureStream form audio element.


## [2020-4-29]
### Added
- 使用FileReader读取上传音频文件数据，使用 decodeAudioData 异步解码音频文件中的 ArrayBuffer。最后生成stream，再转换为ogg.
    - safari 上decodeAudioData接口支持存在问题。

- OpusMediaRecorder.umd.js 替换为 OpusMediaRecorder.js [待处理]

### Issues
- [decodeAudioData example does not work on Safari](https://github.com/mdn/webaudio-examples/issues/5)


## [2020-4-26]
### Added
- 优化铃声录音30时长限制处理：audio播放结束后判断recorder状态，如果recorder没有结束，则调用stop停止recorder。
- 解决上传文件不足30s时没有主动结束录制问题
- 优化代码处理

### Media Capture from DOM Elements API

|                       | Chrome  | Firefox | Edge    | safari                                |
|-----------------------|:-------:|:-------:|:-------:|:-------------------------------------:|
| capture from <audio>  | support | support |  support| Does not support capture from <audio> | 

Not all Chrome/Firefox/Edge support： https://caniuse.com/#search=captureStream


## [2020-4-23]
### Fixed
- First commit [#18].

## 说明

- channelCount: 通过track获取，没有则默认为1.
    - `stream.getAudioTracks().getSettings().channelCount || 1`

- sampleRate: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/sampleRate

    >The sampleRate property of the BaseAudioContext interface returns a floating point number representing the sample rate, 
    > in samples per second, used by all nodes in this audio context. 
    > This limitation means that sample-rate converters are not supported.