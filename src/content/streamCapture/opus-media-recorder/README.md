# opus-media-recorder

## ogg 转换格式说明

- 编码：opus

- channelCount
    > 通过 OpusMediaRecorder.channelCount 设置，默认双声道
    
- SampleRate：
  > 通过 `OPUS_OUTPUT_SAMPLE_RATE` 变量设置


----

## Browser support

- Supported:
    - Chrome 
    - Firefox 

----

## 接口

- recordToOgg
    - 参数：
        - file：上传的文件
        - callback： 回调函数

## Usage

- 文件引入: `<script type="text/javascript" src="dist/OggOpusRecorder.js"></script>`
    - 需要手动修改 encoderWorker.js 所在路径【workerDir】

- 接口使用示例:

```javascript
 uploadFile.addEventListener('change', async function () {
    try {
        let file = this.files[0];
        OggOpusRecorder(file, function (blob) {
            let file = new File([blob], `${fileName}.ogg`, {type: 'audio/ogg;codecs=opus'})
            let url = URL.createObjectURL(blob);
            link.href = url;
            link.download = file.name;
            player.src = url;
        })
    } catch (e) {
        console.error(e.message);
    }
})
```

-----

## 参考

- [opus-media-recorder](https://github.com/kbumsik/opus-media-recorder)