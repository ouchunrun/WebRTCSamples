### 问题背景

> Chrome 硬件编解码存在问题，使用硬件编码或硬件解码后视频流，再次使用P2P发送，` 视频黑屏`，通过定位工具发现，黑屏时，数据收发有在变化，但是`数据量和带宽占用很少`。

-----

### 测试结果

> `无法避免硬件解码`

注：禁用软件编解码方法：`chrome://flags/#disable-accelerated-video-decode` disable `Hardware-accelerated video decode`

----

### 测试说明

结论：

- 使用webRTC Demo 测试，也有相同问题
- 保持编解码一致，只要存在硬件编解码，再次使用P2P发送收到的流就存在黑屏；通过编码和profile-level-id等控制手段，无法规避硬件解码
- 测试环境：`Chrome 83.0.4103.61`


### OpenH264 软件编码支持对比分析

> `说明：以下测试列表中，没有能启用软件解码的组合`


| profile_idc  | profile_iop | packetization-mode   | 编码decoderImplementation | 解码decoderImplementation | 编码 |
|--------------|-------------|----------------------|---------------------------|---------------------------|------|
| 42           | 00          | packetization-mode=1 | ExternalEncoder           | ExternalDecoder           | H264 |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | ExternalEncoder           | ExternalDecoder           | H264 |
|              | e0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | f0          |                      |` OpenH264`                | ExternalDecoder           | H264 |
|              | 00          | packetization-mode=0 | `OpenH264`                | ExternalDecoder           | H264 |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | e0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | f0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
| 4D           | 00          | packetization-mode=1 | ExternalEncoder           | ExternalDecoder           | H264 |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | ExternalEncoder           | ExternalDecoder           | H264 |
|              | e0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | f0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | f0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
| 58           | 00          | packetization-mode=1 | libvpx                    | libvpx                    | H264 |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | f0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | H264 |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
|              | f0          |                      | `OpenH264`                | ExternalDecoder           | H264 |
| 64           | 00          | packetization-mode=1 | ExternalEncoder           | ExternalDecoder           | H264 |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
| 6E           | 00          | packetization-mode=1 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
| 7A           | 00          | packetization-mode=1 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
| 90           | 00          | packetization-mode=1 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
| F4           | 00          | packetization-mode=1 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
| 2C           | 00          | packetization-mode=1 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
|              | 00          | packetization-mode=0 | libvpx                    | libvpx                    | VP8  |
|              | 0c          |                      | libvpx                    | libvpx                    | VP8  |
|              | 10          |                      | libvpx                    | libvpx                    | VP8  |
|              | e0          |                      | libvpx                    | libvpx                    | VP8  |
|              | f0          |                      | libvpx                    | libvpx                    | VP8  |
