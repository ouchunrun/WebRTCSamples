const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
let localPeerConnection = null
let remotePeerConnection = null
let constraints = {
	audio: false,
	video: true
}
let config = {
	sdpSemantics : 'unified-plan',
	iceTransportPolicy : 'all',
	bundlePolicy: 'max-bundle'
}
let offerConstraints = {
	offerToReceiveAudio: true,
	offerToReceiveVideo: true,
}
let RTCpeerConnectionOptional = {
	optional:[
		{'googDscp': true}, {'googIPv6': true}
	]
}

async function start(set){
	console.log('packetizationMode set ', set)
	localStorage.setItem('packetizationMode', set)

	localPeerConnection = new RTCPeerConnection(config, RTCpeerConnectionOptional)
	subscribeStreamEvents(localPeerConnection, true)
	localPeerConnection.onicecandidate = localOnIceCandidate
	localPeerConnection.oniceconnectionstatechange = function () {
		console.info('localPeer, iceConnectionState change: ' + localPeerConnection.iceConnectionState)
	}
	localPeerConnection.onconnectionstatechange = function () {
		console.info('localPeer, connectionState change: ' + localPeerConnection.connectionState)
	}

	localPeerConnection.addTransceiver('audio')
	let localStream = await navigator.mediaDevices.getUserMedia(constraints)
	console.warn('add local stream')
	await localStream.getTracks().forEach(track => localPeerConnection.addTrack(track, localStream))  // main
	localPeerConnection.addTransceiver('video')  // slides

	remotePeerConnection = new RTCPeerConnection(config)
	subscribeStreamEvents(remotePeerConnection, false)
	remotePeerConnection.onicecandidate = remoteOnIceCandidate
	remotePeerConnection.oniceconnectionstatechange = function () {
		console.info('remote onIceConnectionStateChange: ' + remotePeerConnection.iceConnectionState)
	}
	remotePeerConnection.onconnectionstatechange = function () {
		console.info('remote onConnectionStateChange:: ' + remotePeerConnection.connectionState)
	}
	let remoteStream = await navigator.mediaDevices.getUserMedia(constraints)
	console.warn('add remote stream')
	await remoteStream.getTracks().forEach(track => remotePeerConnection.addTrack(track, remoteStream))  // main

	try {
		let offerSdp = await localPeerConnection.createOffer(offerConstraints)
		console.log('localPeerConnection set local sdp: \r\n', offerSdp.sdp)
		await localPeerConnection.setLocalDescription(offerSdp)
		console.log('localPeerConnection set local success')
	}catch (error){
		console.error(error)
	}
}

function subscribeStreamEvents(pc, local){
	pc.ontrack = function (evt) {
		let stream = evt.streams ? evt.streams[0] : null
		if(stream){
			if(local){
				localVideo.srcObject = stream
				console.warn(' local peerConnection __on_add_track: ', stream)
			}else {
				remoteVideo.srcObject = stream
				console.warn(' remote peerConnection __on_add_track: ', stream)
			}

			stream.onremovetrack = function (evt) {
				if(local){
					localVideo.srcObject = null
					console.log('__on_remove_track')
				}else {
					remoteVideo.srcObject = null
				}
			}
		}
	}
}

async function localOnIceCandidate(event){
	console.log(`ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`)
	let iceState = localPeerConnection.iceGatheringState
	if (iceState === 'failed') {
		console.warn("onIceCandidate: ice state is 'failed'")
		return
	}

	if (iceState === 'completed' || iceState === 'complete' || (event && !event.candidate)) {
		console.warn('localPeerConnection onIceCandidate: ICE GATHERING COMPLETED')
		let offerSdp = getLocalSDP(localPeerConnection.localDescription.sdp)
		let offerDesc = new window.RTCSessionDescription({type: 'offer', sdp: offerSdp})

		// let offerDesc = localPeerConnection.localDescription
		console.warn('remotePeerConnection set remote sdp: \r\n', offerDesc.sdp)
		await remotePeerConnection.setRemoteDescription(offerDesc)
		console.log('remotePeerConnection set remote success')

		let remoteDecs = await remotePeerConnection.createAnswer()
		console.warn('remotePeerConnection set local sdp:\r\n', remoteDecs.sdp)
		await remotePeerConnection.setLocalDescription(remoteDecs)
		console.warn('remotePeerConnection set local success')
	}
}

async function remoteOnIceCandidate(event){
	console.info(`ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`)
	let iceState = remotePeerConnection.iceGatheringState
	if (iceState === 'failed') {
		console.warn("onIceCandidate: ice state is 'failed'")
		return
	}

	if (iceState === 'completed' || iceState === 'complete' || (event && !event.candidate)) {
		console.warn('remotePeerConnection onIceCandidate: ICE GATHERING COMPLETED')
		let answerDesc = remotePeerConnection.localDescription
		console.log('localPeerConnection set remote sdp: \r\n', answerDesc.sdp)
		await localPeerConnection.setRemoteDescription(answerDesc)
		console.log('localPeerConnection set remote success')
		let videoOffBtn = document.getElementById('videoOff')
		videoOffBtn.disabled = false
	}
}

async function videoOff(){
	let transceiver = remotePeerConnection.getTransceivers().find(item =>{return item.mid === '1'});
	await transceiver.sender.replaceTrack(null)
	transceiver.direction = 'recvonly'
	console.info('use replaceTrack to remove stream ')

	let offerSdp = await remotePeerConnection.createOffer()
	console.warn('videoOff createOffer SDP:\r\n ', offerSdp.sdp)
	await remotePeerConnection.setLocalDescription(offerSdp)
	console.log('localPeerConnection set local success')


	console.warn('localPeerConnection set remote offer sdp: \r\n', offerSdp.sdp)
	await localPeerConnection.setRemoteDescription(offerSdp)
	console.warn('localPeerConnection set remote offer success')
	let answerSdp = await localPeerConnection.createAnswer()
	console.log('localPeerConnection set local sdp: \r\n', answerSdp.sdp)
	await localPeerConnection.setLocalDescription(answerSdp)

	await remotePeerConnection.setRemoteDescription(answerSdp)
	console.log('remotePeerConnection set remote answer success')
}

