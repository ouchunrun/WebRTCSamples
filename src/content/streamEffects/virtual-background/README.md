
## Inspired From

- [Volcomix virtual-background](https://github.com/Volcomix/virtual-background)
  - [online Demo](https://volcomix.github.io/virtual-background/) 
- [jitsi-meet virtual-background](https://github.com/jitsi/jitsi-meet/tree/master/react/features/stream-effects/virtual-background)
  - [online Meet](https://meet.jit.si/?rCounter=1)

> 注意：volcomix 虚拟背景实现存在"页面不处于活跃状态时，视频会卡住" 问题；所以最后选择了jitsi-meet的实现方式（jitsi-meet也是参考volcomix的处理）。

## 固定使用配置如下

| 类型               | 配置               |
|:-----------------|:-----------------|
| Model            | Meet             |
| backend          | WebAssembly SIMD |
| Input resolution | 160x96           |
| Pipeline         | Canvas 2D + CPU  |

## 问题记录

**1.页面不处于活跃状态时，视频会卡住**

- 原因: `requestAnimationFrame`不会继续调用；非活跃状态时使用定时器，画面卡顿明显。（requestAnimationFrame实现，页面非活跃状态时使用1000 / 60定时器处理）
- 处理：查看`jitsi meet`实现编写demo，发现页面不活跃时视频显示正常，所以Wave上使用的SDK是根据jitsi meet修改的

**2.多次开关摄像头后画面卡顿明显问题**

- 原因：关闭时未清除之前的处理
- 处理：关闭摄像头或关闭虚拟背景时添加停止effect处理

## FAQ

- 1.生成后的canvas人像显示尺寸比较小，与img不一致
    - 原因：canvas的样式的height和width跟sourcePlayback设置可能不一样

- 2.tflite `RuntimeError: memory access out of bounds`
    - 原因：没有调用`newSelectedTFLite._loadModel(model.byteLength)` 等方法

- 3.canvas2dCpu配置处理后的结果是 一个image+一个canvas，两个是单独的，这样重新从canvas里面取流就取不到背景图片

- 4.webGL2处理后是单独的canvas，不需要叠加img，但它使用的是openGL算法，需要测试其兼容性

- 5.Uncaught (in promise) RuntimeError: abort(CompileError: WebAssembly.instantiate(): expected magic word 00 61 73 6d, found 41 47 46 7a @+0). Build with -s ASSERTIONS=1 for more info.
    - 原因：wasm 文件不正确

- 6.INVALID_VALUE: tex(Sub)Image2D: video visible size is empty
    - Cause: video没有play

- 7.wasm streaming compile failed: TypeError: Failed to execute 'compile' on 'WebAssembly': Incorrect response MIME type. Expected 'application/wasm'.
  - 通过域名访问时存在报错，使用webstorm直接打开html则不会。
  - 原因：.wasm 文件请求后，服务器响应头中的 `Content-Type` 为 `application/octet-stream`
  - 处理：修改nginx conf/mime.types 文件，添加一行 application/wasm     wasm;  
  - [参考：nginx服务器如何调用和识别wasm文件？](https://blog.csdn.net/qq_27295403/article/details/90760182)

