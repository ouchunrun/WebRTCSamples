## 2020-6-8

- 将录制结束后的blob数据生成文件保存在本地，页面刷新后重新上传保存的文件，可正常播放
    - 无法做到：将录制的数据定时保存到磁盘内，减少内部消耗和性能开销。因为在录制结束的时候才会触发ondataavailable获得数据，中间过程没有获取数据的接口

## 2020-6-4

- 处理开始录制时不添加audio，后续再单独添加时报错问题   
    - 说明：一开始不添加音频的话，后续也无法添加音频流，因为audioSources无法动态关联。无法处理

- 录制的数据定时保存到磁盘内，减少内部消耗和性能开销


## 2020-6-2

- 优化 canvas 大小参数处理

## 2020-6-1

- 修改video类型，生成`video/webm;codecs=vp8` 格式，下载后可播放

- 添加MediaRecorder类型检测

## 2020-5-31

- 生成.mp4格式文件并且可以选择下载路径
```
/**
 * 创建下载链接
 * @param blob
 */
function download (blob) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.innerHTML = '点击下载'
  a.download = Date.now() + '.webm'
  container.appendChild(a)
  container.appendChild(document.createElement('hr'))
}
```
- 添加桌面共享流

