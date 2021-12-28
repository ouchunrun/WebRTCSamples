

## 一、存在流时一个PC携带多个媒体行

分别获取 音频流、视频流、桌面演示流和从capturestream获取流，共 四个流，createOffer之前添加到localPeerConnection中，能够成功实现一个peerConnection携带2个以上媒体行。


**localPeerConnection 和 remotePeerConnection中存在流的情况：**

```
pc1.getLocalStreams()
(4) [MediaStream, MediaStream, MediaStream, MediaStream]
0: MediaStream {id: "USrx8WaMK9MTG78C1U0IGRXS700ot51DmuFY", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
1: MediaStream {id: "Xb4L8zkbl8rbAZpXTbg1TxtnYVmL33izYwU2", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
2: MediaStream {id: "iYexFe3V7QHr3l2EYLKb3t0lofzjisfrsSxZ", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
3: MediaStream {id: "c51fe8ff-5064-4ee1-8dcf-1084b0031db6", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
length: 4
__proto__: Array(0)



pc2.getRemoteStreams()
(4) [MediaStream, MediaStream, MediaStream, MediaStream]
0: MediaStream {id: "USrx8WaMK9MTG78C1U0IGRXS700ot51DmuFY", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
1: MediaStream {id: "Xb4L8zkbl8rbAZpXTbg1TxtnYVmL33izYwU2", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
2: MediaStream {id: "iYexFe3V7QHr3l2EYLKb3t0lofzjisfrsSxZ", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
3: MediaStream {id: "c51fe8ff-5064-4ee1-8dcf-1084b0031db6", active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}
length: 4
__proto__: Array(0)
```


**localPeerConnection 和 remotePeerConnection getTransceivers：**

```
pc1.getTransceivers()
(4) [RTCRtpTransceiver, RTCRtpTransceiver, RTCRtpTransceiver, RTCRtpTransceiver]
0: RTCRtpTransceiver {mid: "0", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
1: RTCRtpTransceiver {mid: "1", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
2: RTCRtpTransceiver {mid: "2", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
3: RTCRtpTransceiver {mid: "3", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
length: 4
__proto__: Array(0)



pc2.getTransceivers()
(4) [RTCRtpTransceiver, RTCRtpTransceiver, RTCRtpTransceiver, RTCRtpTransceiver]
0: RTCRtpTransceiver {mid: "0", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "recvonly", …}
1: RTCRtpTransceiver {mid: "1", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "recvonly", …}
2: RTCRtpTransceiver {mid: "2", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "recvonly", …}
3: RTCRtpTransceiver {mid: "3", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "recvonly", …}
length: 4
__proto__: Array(0)

```

-----


## 二、不存在流时一个PC携带多个媒体行


```
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
```
Q1：offerOptions配置如上时，peerConnection中没有添加视频流时，添加生成的流，媒体行数量保持不变，仍为一个audio，一个video

`Cause：`PeerConnection中有两个sender，一个audio，一个video，在sender中没有流时添加流到PeerConnection是，sender数量不变。**所以要想有三个媒体行，需添加两个流 。**

---

## 三、如何在创建PeerConnection时生成三个Transceiver

**方法一：使用capturestream手动生成流添加到peerConnection中**

- video.captureStream() 只在chrome和firefox上支持

- canvas.captureStream() 支持firefox 43+, chrome 51+, safari 11+，且Android 和 Android browser也是支持的

所有这种方法只能使用canvas.captureStream() 来实现！


**方法二：调用接口直接生成三个 Transceiver。**

> 这种方法和第一种方法区别在于：更标准。

查找资料时找到了addTransceiver这个方法，针对完全没有音视频流的情况下，要创建出三个Transceiver，我是这么做的：
```
const offerOptions = {
  offerToReceiveAudio: true,  // 接收音频
  offerToReceiveVideo: true,   // 接收视频
};


var pc1 = new RTCPeerConnection({});
// 添加两个 video 类型的Transceiver
pc1.addTransceiver('video')  
pc1.addTransceiver('video')  
console.warn("Transceivers： ", pc1.getTransceivers())
  
const offer = await pc1.createOffer(offerOptions);
```

结果证明是可以的：

```
main.js:167 Transceivers：  
(2) [RTCRtpTransceiver, RTCRtpTransceiver]
0: RTCRtpTransceiver {mid: "0", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
1: RTCRtpTransceiver {mid: "1", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
length: 2
__proto__: Array(0)


 Transceivers after createOffer：  
(3) [RTCRtpTransceiver, RTCRtpTransceiver, RTCRtpTransceiver]
0: RTCRtpTransceiver {mid: "0", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
1: RTCRtpTransceiver {mid: "1", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "sendrecv", …}
2: RTCRtpTransceiver {mid: "2", sender: RTCRtpSender, receiver: RTCRtpReceiver, stopped: false, direction: "recvonly", …}
length: 3
__proto__: Array(0)
```

> 注：offerOptions的设置直接影响Transceivers的方向，如设置offerToReceiveVideo为false，那么新增的video Transceiversde 方向均为sendonly，反之，都为sendrecv。



Transceivers 支持版本：

- chrome 72+
- opera chromeVersion 72+
- firefox 59+
- safari 12.1.1+


**Browser compatibility：** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTransceiver






