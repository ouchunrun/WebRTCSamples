## Description

该demo用于测试本地音视频共享功能


## usage

- 上传本地文件。如果浏览器支持captureStream接口，则能成功建立对等连接，能够发流。


## 支持

- 支持的浏览器：chrome、firefox

说明：

> video.captureStream() 只在chrome和firefox上支持

> canvas.captureStream() 支持firefox 43+, chrome 51+, safari 11+

本地音视频共享采用video.captureStream()实现

## issues

- firefox存在的问题：本地和对端的任何一方静音，视频就会被静音。官方demo测试也是相同的 issues。

- 测试地址:https://webrtc.github.io/samples/src/content/capture/video-pc/

