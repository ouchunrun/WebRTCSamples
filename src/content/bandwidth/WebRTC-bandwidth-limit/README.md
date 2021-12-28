# WebRTC Bitrate control

如果启用带宽设，则修改sdp，关闭REMB、修改sdp中 x-google-min-bitrate x-google-max-bitrate x-google-start-bitrate AS TIAS 为相同值 。



二、demo 测试通过修改SDP来限制WebRTC的带宽

demo 地址：https://ouchunrun.github.io/WebRTC-bandwidth-limit/



（一）启用带宽设置

使用说明：启用带宽设置
- 输入ASBitrate设置值
- 点击Get media、connect
- 查看右侧 remoteVideo TIASBitrate，可以看到当前发送的比特率，chrome 也可以通过 chrome://webrtc-internals/ 查看


chrome://webrtc-internals/ 效果查看：
![58b0d0799a115246875b73fdd30ce2b5.png](https://i.loli.net/2019/12/13/CZzqlc4oKf6pjkE.png)