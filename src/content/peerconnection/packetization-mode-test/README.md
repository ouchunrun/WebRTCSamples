## JSEP Process

### Step one：create p2p connection

```
localPeerConnection                        remotePeerConnection
|
createOffer 
|
setLocalDescription
|
<-------localPeerConnection iceGathering complete, send offer sdp------->
                                                        |
                                             setRemoteDescription (offer sdp)                  
                                                        |
                                                   createAnswer
                                                        |
                                               setLocalDescription
                                                        |
<-------localPeerConnection iceGathering complete, send ansawer sdp------->
|
setRemoteDescription (answer sdp)
|
<-----------------------Media channel establishment----------------------->
```

### Step two：remotePeerConnection close local video and re-invite

```
remotePeerConnection
|
remove video stream
|
createOffer
|
setLocalDescription
|
<-----get Error:Failed to set local video description recv parameters for m-section with mid='2'.------>
```

- Error: createOffer creates an incorrect SDP:
    - (1) There is a duplicate 125 PT in m-section with mid='2'
    - (2) m-section with mid='2' used pt 127 which only exist in m-section with mid='1'
    - SDP example:
```
v=0
o=- 2393033020737798481 3 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1 2
a=extmap-allow-mixed
a=msid-semantic: WMS zOuZiJBpGoeJbb0cGoRBoObM07e1mOlhSkD0
m=audio 51268 UDP/TLS/RTP/SAVPF 111 9 0 8 110 112 113 126 103 104 106 105 13
c=IN IP4 192.168.131.4
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3843951586 1 udp 2122260223 192.168.131.4 51268 typ host generation 0 network-id 1
a=candidate:3221247563 1 udp 2122194687 172.21.16.1 51269 typ host generation 0 network-id 2
a=ice-ufrag:GtES
a=ice-pwd:7fNZBvrrAqX4DOB8QPDhKkL3
a=ice-options:trickle
a=fingerprint:sha-256 68:CE:8D:B6:6E:22:CA:55:DB:03:DC:9F:41:E2:C4:29:09:52:E1:72:C0:9E:9E:14:94:23:85:6A:29:79:4E:50
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=recvonly
a=rtcp-mux
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:9 G722/8000
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:110 telephone-event/48000
a=rtpmap:112 telephone-event/32000
a=rtpmap:113 telephone-event/16000
a=rtpmap:126 telephone-event/8000
a=rtpmap:103 ISAC/16000
a=rtpmap:104 ISAC/32000
a=rtpmap:106 CN/32000
a=rtpmap:105 CN/16000
a=rtpmap:13 CN/8000
m=video 9 UDP/TLS/RTP/SAVPF 125 107 96 97 98 99 100 101 102 120 124 119 127 118 35 36 123 117 122 115 114 109 116
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:GtES
a=ice-pwd:7fNZBvrrAqX4DOB8QPDhKkL3
a=ice-options:trickle
a=fingerprint:sha-256 68:CE:8D:B6:6E:22:CA:55:DB:03:DC:9F:41:E2:C4:29:09:52:E1:72:C0:9E:9E:14:94:23:85:6A:29:79:4E:50
a=setup:actpass
a=mid:1
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:13 urn:3gpp:video-orientation
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:12 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type
a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing
a=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=sendrecv
a=msid:zOuZiJBpGoeJbb0cGoRBoObM07e1mOlhSkD0 dfed785f-f48b-4cc0-addd-8dc2c5c345d4
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:125 H264/90000
a=rtcp-fb:125 goog-remb
a=rtcp-fb:125 transport-cc
a=rtcp-fb:125 ccm fir
a=rtcp-fb:125 nack
a=rtcp-fb:125 nack pli
a=fmtp:125 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f
a=rtpmap:107 rtx/90000
a=fmtp:107 apt=125
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=rtpmap:98 VP9/90000
a=rtcp-fb:98 goog-remb
a=rtcp-fb:98 transport-cc
a=rtcp-fb:98 ccm fir
a=rtcp-fb:98 nack
a=rtcp-fb:98 nack pli
a=fmtp:98 profile-id=0
a=rtpmap:99 rtx/90000
a=fmtp:99 apt=98
a=rtpmap:100 VP9/90000
a=rtcp-fb:100 goog-remb
a=rtcp-fb:100 transport-cc
a=rtcp-fb:100 ccm fir
a=rtcp-fb:100 nack
a=rtcp-fb:100 nack pli
a=fmtp:100 profile-id=2
a=rtpmap:101 rtx/90000
a=fmtp:101 apt=100
a=rtpmap:102 H264/90000
a=rtcp-fb:102 goog-remb
a=rtcp-fb:102 transport-cc
a=rtcp-fb:102 ccm fir
a=rtcp-fb:102 nack
a=rtcp-fb:102 nack pli
a=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f
a=rtpmap:120 rtx/90000
a=fmtp:120 apt=102
a=rtpmap:124 H264/90000
a=rtcp-fb:124 goog-remb
a=rtcp-fb:124 transport-cc
a=rtcp-fb:124 ccm fir
a=rtcp-fb:124 nack
a=rtcp-fb:124 nack pli
a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f
a=rtpmap:119 rtx/90000
a=fmtp:119 apt=124
a=rtpmap:127 H264/90000
a=rtcp-fb:127 goog-remb
a=rtcp-fb:127 transport-cc
a=rtcp-fb:127 ccm fir
a=rtcp-fb:127 nack
a=rtcp-fb:127 nack pli
a=fmtp:127 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f
a=rtpmap:118 rtx/90000
a=fmtp:118 apt=127
a=rtpmap:35 AV1X/90000
a=rtcp-fb:35 goog-remb
a=rtcp-fb:35 transport-cc
a=rtcp-fb:35 ccm fir
a=rtcp-fb:35 nack
a=rtcp-fb:35 nack pli
a=rtpmap:36 rtx/90000
a=fmtp:36 apt=35
a=rtpmap:123 H264/90000
a=rtcp-fb:123 goog-remb
a=rtcp-fb:123 transport-cc
a=rtcp-fb:123 ccm fir
a=rtcp-fb:123 nack
a=rtcp-fb:123 nack pli
a=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
a=rtpmap:117 rtx/90000
a=fmtp:117 apt=123
a=rtpmap:122 H264/90000
a=rtcp-fb:122 goog-remb
a=rtcp-fb:122 transport-cc
a=rtcp-fb:122 ccm fir
a=rtcp-fb:122 nack
a=rtcp-fb:122 nack pli
a=fmtp:122 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f
a=rtpmap:115 rtx/90000
a=fmtp:115 apt=122
a=rtpmap:114 red/90000
a=rtpmap:109 rtx/90000
a=fmtp:109 apt=114
a=rtpmap:116 ulpfec/90000
a=ssrc-group:FID 3187237011 1879749895
a=ssrc:3187237011 cname:y6TyJ9tym+60k0AN
a=ssrc:3187237011 msid:zOuZiJBpGoeJbb0cGoRBoObM07e1mOlhSkD0 dfed785f-f48b-4cc0-addd-8dc2c5c345d4
a=ssrc:3187237011 mslabel:zOuZiJBpGoeJbb0cGoRBoObM07e1mOlhSkD0
a=ssrc:3187237011 label:dfed785f-f48b-4cc0-addd-8dc2c5c345d4
a=ssrc:1879749895 cname:y6TyJ9tym+60k0AN
a=ssrc:1879749895 msid:zOuZiJBpGoeJbb0cGoRBoObM07e1mOlhSkD0 dfed785f-f48b-4cc0-addd-8dc2c5c345d4
a=ssrc:1879749895 mslabel:zOuZiJBpGoeJbb0cGoRBoObM07e1mOlhSkD0
a=ssrc:1879749895 label:dfed785f-f48b-4cc0-addd-8dc2c5c345d4
m=video 9 UDP/TLS/RTP/SAVPF 125 96 97 98 99 100 101 121 102 120 124 119 118 125 107 35 36 123 117 122 115 114 109 116 37
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:GtES
a=ice-pwd:7fNZBvrrAqX4DOB8QPDhKkL3
a=ice-options:trickle
a=fingerprint:sha-256 68:CE:8D:B6:6E:22:CA:55:DB:03:DC:9F:41:E2:C4:29:09:52:E1:72:C0:9E:9E:14:94:23:85:6A:29:79:4E:50
a=setup:actpass
a=mid:2
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:13 urn:3gpp:video-orientation
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:12 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:11 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type
a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing
a=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=extmap:5 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:6 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=recvonly
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:125 H264/90000
a=rtcp-fb:125 goog-remb
a=rtcp-fb:125 transport-cc
a=rtcp-fb:125 ccm fir
a=rtcp-fb:125 nack
a=rtcp-fb:125 nack pli
a=fmtp:125 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f
a=rtpmap:96 VP8/90000
a=rtcp-fb:96 goog-remb
a=rtcp-fb:96 transport-cc
a=rtcp-fb:96 ccm fir
a=rtcp-fb:96 nack
a=rtcp-fb:96 nack pli
a=rtpmap:97 rtx/90000
a=fmtp:97 apt=96
a=rtpmap:98 VP9/90000
a=rtcp-fb:98 goog-remb
a=rtcp-fb:98 transport-cc
a=rtcp-fb:98 ccm fir
a=rtcp-fb:98 nack
a=rtcp-fb:98 nack pli
a=fmtp:98 profile-id=0
a=rtpmap:99 rtx/90000
a=fmtp:99 apt=98
a=rtpmap:100 VP9/90000
a=rtcp-fb:100 goog-remb
a=rtcp-fb:100 transport-cc
a=rtcp-fb:100 ccm fir
a=rtcp-fb:100 nack
a=rtcp-fb:100 nack pli
a=fmtp:100 profile-id=2
a=rtpmap:101 rtx/90000
a=fmtp:101 apt=100
a=rtpmap:121 VP9/90000
a=rtcp-fb:121 goog-remb
a=rtcp-fb:121 transport-cc
a=rtcp-fb:121 ccm fir
a=rtcp-fb:121 nack
a=rtcp-fb:121 nack pli
a=fmtp:121 profile-id=1
a=rtpmap:102 H264/90000
a=rtcp-fb:102 goog-remb
a=rtcp-fb:102 transport-cc
a=rtcp-fb:102 ccm fir
a=rtcp-fb:102 nack
a=rtcp-fb:102 nack pli
a=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f
a=rtpmap:120 rtx/90000
a=fmtp:120 apt=102
a=rtpmap:124 H264/90000
a=rtcp-fb:124 goog-remb
a=rtcp-fb:124 transport-cc
a=rtcp-fb:124 ccm fir
a=rtcp-fb:124 nack
a=rtcp-fb:124 nack pli
a=fmtp:124 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f
a=rtpmap:119 rtx/90000
a=fmtp:119 apt=124
a=rtpmap:118 rtx/90000
a=fmtp:118 apt=127
a=rtpmap:125 H264/90000
a=rtcp-fb:125 goog-remb
a=rtcp-fb:125 transport-cc
a=rtcp-fb:125 ccm fir
a=rtcp-fb:125 nack
a=rtcp-fb:125 nack pli
a=fmtp:125 level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f
a=rtpmap:107 rtx/90000
a=fmtp:107 apt=125
a=rtpmap:35 AV1X/90000
a=rtcp-fb:35 goog-remb
a=rtcp-fb:35 transport-cc
a=rtcp-fb:35 ccm fir
a=rtcp-fb:35 nack
a=rtcp-fb:35 nack pli
a=rtpmap:36 rtx/90000
a=fmtp:36 apt=35
a=rtpmap:123 H264/90000
a=rtcp-fb:123 goog-remb
a=rtcp-fb:123 transport-cc
a=rtcp-fb:123 ccm fir
a=rtcp-fb:123 nack
a=rtcp-fb:123 nack pli
a=fmtp:123 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f
a=rtpmap:117 rtx/90000
a=fmtp:117 apt=123
a=rtpmap:122 H264/90000
a=rtcp-fb:122 goog-remb
a=rtcp-fb:122 transport-cc
a=rtcp-fb:122 ccm fir
a=rtcp-fb:122 nack
a=rtcp-fb:122 nack pli
a=fmtp:122 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=64001f
a=rtpmap:115 rtx/90000
a=fmtp:115 apt=122
a=rtpmap:114 red/90000
a=rtpmap:109 rtx/90000
a=fmtp:109 apt=114
a=rtpmap:116 ulpfec/90000
a=rtpmap:37 flexfec-03/90000
a=rtcp-fb:37 goog-remb
a=rtcp-fb:37 transport-cc
a=fmtp:37 repair-window=10000000
```
