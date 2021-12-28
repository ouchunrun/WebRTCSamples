const localVideo = document.getElementById('localVideo')
const remoteVideo = document.getElementById('remoteVideo')
let localVideoStatsDiv = document.getElementById('localDimensions')
let remoteVideoStatsDiv = document.getElementById('remoteDimensions')
let localbitrate = document.getElementById('localbitrate')
let remotebitrate = document.getElementById('remotebitrate')


let answerIceRestart = false
let localPeerConnection = null
let remotePeerConnection = null
let config = {
	sdpSemantics : 'unified-plan',
	iceTransportPolicy : 'all',
	bundlePolicy: 'max-bundle'
}

let RTCpeerConnectionOptional = {
	optional:[
		{'googDscp': true}, {'googIPv6': true}
	]
}

async function start(){
	localPeerConnection = new RTCPeerConnection(config, RTCpeerConnectionOptional)
	subscribeStreamEvents(localPeerConnection, true)
	localPeerConnection.onicecandidate = localOnIceCandidate
	localPeerConnection.oniceconnectionstatechange = function () {
		console.info('localPeer, iceConnectionState change: ' + localPeerConnection.iceConnectionState)
	}
	localPeerConnection.onconnectionstatechange = function () {
		console.info('localPeer, connectionState change: ' + localPeerConnection.connectionState)
	}

	let localStream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {width: 1280}
	})
	console.warn('localPeerConnection add local stream')
	await localStream.getTracks().forEach(track => localPeerConnection.addTrack(track, localStream))  // main

	remotePeerConnection = new RTCPeerConnection(config)
	subscribeStreamEvents(remotePeerConnection, false)
	remotePeerConnection.onicecandidate = remoteOnIceCandidate
	remotePeerConnection.oniceconnectionstatechange = function () {
		console.info('remote onIceConnectionStateChange: ' + remotePeerConnection.iceConnectionState)
	}
	remotePeerConnection.onconnectionstatechange = function () {
		console.info('remote onConnectionStateChange:: ' + remotePeerConnection.connectionState)
	}
	let remoteStream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {width: 1920}
	})
	console.warn('remotePeerConnection add remote stream')
	await remoteStream.getTracks().forEach(track => remotePeerConnection.addTrack(track, remoteStream))  // main

	try {
		let offerSdp = await localPeerConnection.createOffer()
		console.log('localPeerConnection set local sdp: \r\n', offerSdp.sdp)
		await localPeerConnection.setLocalDescription(offerSdp)
		console.log('localPeerConnection set local success')
		startStatistics()
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
		let offerDesc = localPeerConnection.localDescription
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
		if(answerIceRestart){
			console.warn("answer IceRestart !!!!!!!!!!");
			answerIceRestart = false
			let sdp = remotePeerConnection.currentRemoteDescription.sdp
			let parsedSdp = SDPTools.parseSDP(sdp)
			SDPTools.increaseSessionVersion(parsedSdp)
			// Set fingerprint/icePwd/iceUfrag to session level
			parsedSdp.fingerprint = parsedSdp.fingerprint || parsedSdp.media[0].fingerprint
			parsedSdp.icePwd = parsedSdp.icePwd || parsedSdp.media[0].icePwd
			parsedSdp.iceUfrag = parsedSdp.iceUfrag || parsedSdp.media[0].iceUfrag
			parsedSdp.setup = 'passive'
			console.warn(parsedSdp)
			for (let i = 0; i < parsedSdp.media.length; i++) {
				let media = parsedSdp.media[i]
				delete media.setup
				delete media.ext
			}
			sdp = SDPTools.writeSDP(parsedSdp)

			await remotePeerConnection.setRemoteDescription({type: 'answer', sdp: sdp})
			console.log('answerDoIceRestart: setRemoteDescription')
		}else {
			let answerDesc = remotePeerConnection.localDescription
			console.log('localPeerConnection set remote sdp: \r\n', answerDesc.sdp)
			await localPeerConnection.setRemoteDescription(answerDesc)
			console.log('localPeerConnection set remote success')
		}
	}
}

/**
 * answer 手动ice restart
 * @returns {Promise<void>}
 */
async function answerDoIceRestart(){
	console.log('answerDoIceRestart: createOffer')
	let offerSdp = await remotePeerConnection.createOffer({iceRestart: true})
	await remotePeerConnection.setLocalDescription(offerSdp)
	console.log('answerDoIceRestart: setLocalDescription')
	try{
		answerIceRestart = true
	}catch (e){
		console.warn("e: ", e)
	}
}

/**
 * offer re-invite 重协商
 * @returns {Promise<void>}
 */
async function offerRenegotiation(videoOff){
	if(videoOff){
		console.info('close offer video...')
		let transceiver = localPeerConnection.getTransceivers().find(item =>{return item.mid === '1'});
		await transceiver.sender.replaceTrack(null)
		transceiver.direction = 'recvonly'
	}else {
		console.info('just re-invite...')
	}

	let offerSdp = await localPeerConnection.createOffer()
	console.warn('localPeerConnection videoOff createOffer SDP:\r\n ', offerSdp.sdp)
	await localPeerConnection.setLocalDescription(offerSdp)
	console.log('localPeerConnection set local success')


	console.warn('remotePeerConnection set remote offer sdp: \r\n', offerSdp.sdp)
	await remotePeerConnection.setRemoteDescription(offerSdp)
	console.warn('remotePeerConnection set remote offer success')
	let answerSdp = await remotePeerConnection.createAnswer()
	console.warn("remotePeerConnection iceRestart!!!!!!!!!!!!!!!!!!")
	console.log('remotePeerConnection set local sdp: \r\n', answerSdp.sdp)
	await remotePeerConnection.setLocalDescription(answerSdp)

	await localPeerConnection.setRemoteDescription(answerSdp)
	console.warn('localPeerConnection set remote answer success: \r\n', answerSdp.sdp)
}

/*****************************************************************************/
// Dumping a stats letiable as a string.
// might be named toString?
function dumpStats(results) {
	let statsString = '';
	results.forEach(function(res) {
		statsString += '<h3>Report type=';
		statsString += res.type;
		statsString += '</h3>\n';
		statsString += 'id ' + res.id + '<br>\n';
		statsString += 'time ' + res.timestamp + '<br>\n';
		Object.keys(res).forEach(function(k) {
			if (k !== 'timestamp' && k !== 'type' && k !== 'id') {
				statsString += k + ': ' + res[k] + '<br>\n';
			}
		});
	});
	return statsString;
}

let bytesPrev;
let timestampPrev;
function showRemoteStats(results) {
	// calculate video bitrate
	results.forEach(function(report) {
		let now = report.timestamp;

		let bitrate;
		if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
			let bytes = report.bytesReceived;
			if (timestampPrev) {
				bitrate = 8 * (bytes - bytesPrev) / (now - timestampPrev);
				bitrate = Math.floor(bitrate);
			}
			bytesPrev = bytes;
			timestampPrev = now;

			if (bitrate) {
				bitrate += ' kbits/sec';
				remotebitrate.innerHTML = '<strong>Bitrate:</strong> ' + bitrate;
			}
		}
	})
}


let localBytesPrev;
let localTimestampPrev;
function showLocalStats(results) {
	// calculate video bitrate
	results.forEach(function(report) {
		let now = report.timestamp;
		let bitrate;
		if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
			let bytes = report.bytesReceived;
			if (localTimestampPrev) {
				bitrate = 8 * (bytes - localBytesPrev) / (now - localTimestampPrev);
				bitrate = Math.floor(bitrate);
			}
			localBytesPrev = bytes;
			localTimestampPrev = now;

			if (bitrate) {
				bitrate += ' kbits/sec';
				localbitrate.innerHTML = '<strong>Bitrate:</strong> ' + bitrate;
			}
		}
	})
}

let statisticsInterval
function startStatistics(){
	// Display statistics
	statisticsInterval = setInterval(function() {
		if (localPeerConnection && remotePeerConnection) {
			remotePeerConnection.getStats(null)
				.then(showRemoteStats, function(err) {
					console.info(err);
				});
			localPeerConnection.getStats(null)
				.then(showLocalStats, function(err) {
					console.info(err);
				});
		} else {
			// log.info('Not connected yet');
		}

		// Collect some stats from the video tags.
		if (localVideo.videoWidth) {
			localVideoStatsDiv.innerHTML = '<strong>Video dimensions:</strong> ' +
				localVideo.videoWidth + 'x' + localVideo.videoHeight + 'px';
		}
		if (remoteVideo.videoWidth) {
			remoteVideoStatsDiv.innerHTML = '<strong>Video dimensions:</strong> ' +
				remoteVideo.videoWidth + 'x' + remoteVideo.videoHeight + 'px';
		}

		getPeersIceInfo(localPeerConnection, true)
		getPeersIceInfo(remotePeerConnection, false)
	}, 1000);
}



let localIcePwd = document.getElementById('localIcePwd')
let localIceUfrag = document.getElementById('localIceUfrag')
let localFingerprintHash = document.getElementById('localFingerprintHash')
let localIcePwd2 = document.getElementById('localIcePwd2')
let localIceUfrag2 = document.getElementById('localIceUfrag2')
let localFingerprintHash2 = document.getElementById('localFingerprintHash2')

let remoteIcePwd = document.getElementById('remoteIcePwd')
let remoteIceUfrag = document.getElementById('remoteIceUfrag')
let remoteFingerprintHash = document.getElementById('remoteFingerprintHash')
let remoteIcePwd2 = document.getElementById('remoteIcePwd2')
let remoteIceUfrag2 = document.getElementById('remoteIceUfrag2')
let remoteFingerprintHash2 = document.getElementById('remoteFingerprintHash2')

function getPeersIceInfo(pc, local){
	let offerSDP = pc.localDescription.sdp
	let parsedSdp = SDPTools.parseSDP(offerSDP)
	if(parsedSdp && parsedSdp.media && parsedSdp.media[0]){
		let media = parsedSdp.media[0]
		if(local){
			if(localIcePwd.innerText && localIcePwd.innerText !== ('icePwd: ' + media.icePwd)){
				if(localIceUfrag2.innerText !== ('New icePwd: ' + media.icePwd)){
					localIcePwd2.innerText = 'New icePwd: ' + media.icePwd
					localIceUfrag2.innerText = 'New iceUfrag: ' +  media.iceUfrag
					localFingerprintHash2.innerText = 'New fingerprint: ' + media.fingerprint.hash
				}
			}else {
				localIcePwd.innerText = 'icePwd: ' + media.icePwd
				localIceUfrag.innerText = 'iceUfrag: ' +  media.iceUfrag
				localFingerprintHash.innerText = 'fingerprint: ' + media.fingerprint.hash
			}
		}else {
			if(remoteIcePwd.innerText && remoteIcePwd.innerText !== ('icePwd: ' + media.icePwd)){
				if(remoteIcePwd2.innerText !== ('New icePwd: ' + media.icePwd)){
					remoteIcePwd2.innerText = 'New icePwd: ' + media.icePwd
					remoteIceUfrag2.innerText = 'New iceUfrag: ' +  media.iceUfrag
					remoteFingerprintHash2.innerText = 'New fingerprint: ' + media.fingerprint.hash
				}
			}else {
				remoteIcePwd.innerText = 'icePwd: ' + media.icePwd
				remoteIceUfrag.innerText = 'iceUfrag: ' +  media.iceUfrag
				remoteFingerprintHash.innerText = 'fingerprint: ' + media.fingerprint.hash
			}
		}
	}
}
