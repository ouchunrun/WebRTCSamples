# 前 言

背景：chrome 75正式版本更新后遇到很多问题，包括onnegotiationneeded在某些场景下不触发，所以写了一个简单的demo测试同样的流程

测试流程：开启桌面共享，切换共享时先删除之前的流，再添加新的流，如果peerConnection里面有流存在，则删除和添加都使用replaceTrack。

测试结果：切换共享时删除流触发onnegotiationneeded，但是再次添加时onnegotiationneeded不触发，也没有重新createOffer

说明：按照之前的处理流程，非暂停情况下切换演示需要重新createOffer，重新发送invite进行sdp的协商，但实际上，使用replaceTrack，sdp是不会有任何改变的，所以不需要重新createOffer，更不需要重新发送invite协商。使用demo验证，replaceTrack后没有执行jsep流程，流也能呗替换，所以后续需要重新设计桌面共享流程！


场景：开摄像头失败，开共享失败，切换共享等情况均不触发onnegotiationneeded

解决方法：不管之前的direction是sendrecv还是recvonly，添加流或删除流之前都先把direction设置为sendonly，再设置为inactive。加流处理代码示例：
注：单独设置其中一个无效，三次direction的设置只会触发一次onnegotiationneeded，所以不用担心多次触发问题。

```javascript
// 新增处理
currentPeerConnection.getTransceivers()[0].direction = 'sendonly';
currentPeerConnection.getTransceivers()[0].direction = 'inactive';

// 原有处理
currentPeerConnection.getSenders()[0].replaceTrack(stream.getTracks()[0]);
currentPeerConnection.getTransceivers()[0].direction = 'sendrecv';
```


# RTCRtpTransceiver.direction

|Value	|RTCRtpSender behavior	|RTCRtpReceiver behavior|
|----|----|----|
|"sendrecv"	|Offers to send RTP data, and will do so if the other peer accepts the connection and at least one of the sender's encodings is active1.	|Offers to receive RTP data, and does so if the other peer accepts.
|"sendonly"	|Offers to send RTP data, and will do so if the other peer accepts the connection and at least one of the sender's encodings is active1.	|Does not offer to receive RTP data and will not do so.
|"recvonly"	|Does not offer to send RTP data, and will not do so.	|Offers to receive RTP data, and will do so if the other peer offers.
|"inactive"	|Does not offer to send RTP data, and will not do so.	|Does not offer to receive RTP data and will not do so.