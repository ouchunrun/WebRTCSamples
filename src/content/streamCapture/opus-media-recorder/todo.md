- 确定参数OggOpusRecorder（config）  
```
{
	file, // 音频文件
    encoderWorkerPath, //encoderWorker.js 路径
	OggOpusEncoderWasmPath， // OggOpusEncoder.wasm 路径
  	duration,  // 录制多少时间
    progressCallback: function(percent) {},  // percent 百分比（时间模拟） 或者直接播放秒数 
    doneCallBack: function(file){},  // file 转换后的ogg file对象
	errorCallBack: function(error){}
}
```
- GRP 音频文件转换：wav 格式文件转为ogg格式无法正常播放问题
    - 音频文件时长过长或过短，都直接拒绝，抛出异常不处理

- 文件封装为umd格式
    - 参考：https://segmentfault.com/a/1190000020226119?utm_source=tag-newest



