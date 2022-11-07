let peerArray = []
let videos = document.getElementById('videos')

let createNewPeerButton = document.getElementById('createNewPeer')
createNewPeerButton.onclick = createNewPeer

function createNewPeer(){
    console.warn('create new peer')
    let localPeer;
    let remotePeer;
    const offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    localPeer = new RTCPeerConnection();
    remotePeer = new RTCPeerConnection();

    let video = document.createElement('video')
    video.controls = true
    video.autoplay = true

    remotePeer.ontrack = function (e){
        if(e.streams && e.streams[0] && e.streams[0].getVideoTracks().length && !video.srcObject){
            console.warn('streams[0] getTracks:', e.streams[0].getTracks())
            video.srcObject = e.streams[0]
            videos.appendChild(video)
        }
    }
    localPeer.onicecandidate = function (event){
        handlePeerCandidate(event.candidate, remotePeer, 'pc2: ', 'local')
    };
    remotePeer.onicecandidate = function (event){
        handlePeerCandidate(event.candidate, localPeer, 'pc2: ', 'remote')
    }
    console.log('pc2: created local and remote peer connection objects');

    // TODO: 方案一：主持人收到音视频流后发送到其他Peer [chrome、firefox 测试可行]
    pc1RemoteStream.getTracks().forEach(track => localPeer.addTrack(track, pc1RemoteStream));
    console.log('Adding pc1 remote stream stream to localPeer');

    localPeer.createOffer(offerOptions).then(function (desc){
        // TODO: 方案二 直接复制SDP中的ssrc/ssrc group信息到新的Peer中  [不可行]
        // desc.sdp = processSdpBeforeSetLocal(desc.sdp)

        localPeer.setLocalDescription(desc);
        console.log(`Offer from localPeer\n${desc.sdp}`);
        remotePeer.setRemoteDescription(desc);
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        remotePeer.createAnswer().then(function (desc){
            remotePeer.setLocalDescription(desc);
            console.log(`Answer from remotePeer\n${desc.sdp}`);
            localPeer.setRemoteDescription(desc);
        }).catch(function (error){
            console.log(`Failed to add ICE candidate: ${error.toString()}`);
        })
    }).catch(function (error){
        console.log(`Failed to add ICE candidate: ${error.toString()}`);
    })

    peerArray.push(localPeer)
    peerArray.push(remotePeer)
}

/**
 * 设置收到的candidate
 * @param candidate
 * @param dest
 * @param prefix
 * @param type
 */
function handlePeerCandidate(candidate, dest, prefix, type) {
    dest.addIceCandidate(candidate).then(onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log(`${prefix}New ${type} ICE candidate: ${candidate ? candidate.candidate : '(null)'}`);
}

/**
 * 获取 msid、ssrc和ssrcGroups 信息
 * @param sdp
 * @returns {*}
 */
function processSdpBeforeSetLocal(sdp){
    let targetSdp = pc1Remote.currentRemoteDescription.sdp
    let parsedSdp = SDPTools.parseSDP(targetSdp)
    console.warn(parsedSdp)
    let offerSdp = SDPTools.parseSDP(sdp)
    for (let i = 0; i < parsedSdp.media.length; i++){
        let media = parsedSdp.media[i]
        if(media.msid){
            offerSdp.media[i].msid = media.msid
        }
        if(media.ssrcs){
            offerSdp.media[i].ssrcs = media.ssrcs
        }
        if(media.ssrcGroups){
            offerSdp.media[i].ssrcGroups = media.ssrcGroups
        }
        offerSdp.media[i].direction = 'sendrecv'
    }

    if(parsedSdp.msidSemantics){
        offerSdp.msidSemantics = parsedSdp.msidSemantics
    }

    sdp = SDPTools.writeSDP(offerSdp)
    console.warn('processed SDP:\r\n', sdp)
    return sdp
}
