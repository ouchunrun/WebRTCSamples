
function setEncodingParameters(pc, type, maxBitRate){
	console.warn('set encoding parameters maxBitRate: ', maxBitRate)
	console.log('type:', type)
	let sender = pc.getSenders()[0]
	let videoParameters = sender.getParameters();
	if (JSON.stringify(videoParameters) === '{}') {
		videoParameters.encodings = []
		videoParameters.encodings[0] = {}
	}else if(!videoParameters.encodings.length || !videoParameters.encodings[0]){
		videoParameters.encodings[0] = {}
	}

	if(type === 'main'){
		videoParameters.encodings[0].maxBitrate = maxBitRate * 1000
		let videoPreference = localStorage.getItem('videoDegradationPreference')
		if(videoPreference && (videoPreference === 'maintain-framerate' || videoPreference === 'maintain-resolution')){
			videoParameters.degradationPreference = videoPreference;
		}else {
			// If not set, the default a is maintain-framerate
			videoParameters.degradationPreference = 'maintain-framerate';
		}
	}else if(type === 'slides'){
		videoParameters.encodings[0].maxBitrate = maxBitRate * 1000
		let slidesPreference = localStorage.getItem('slidesDegradationPreference')
		if(slidesPreference && (slidesPreference === 'maintain-framerate' || slidesPreference === 'maintain-resolution')){
			videoParameters.degradationPreference = slidesPreference;
		}else {
			// If not set, the default a is maintain-resolution
			videoParameters.degradationPreference = 'maintain-resolution';
		}
	}

	console.warn("set encoding maxBitrate: " +  videoParameters.encodings[0].maxBitrate)
	console.warn("set encoding degradationPreference: " +  videoParameters.degradationPreference)
	sender.setParameters(videoParameters).then(function () {
		console.info('set encoding parameters success')
	}).catch(function (error) {
		console.info('set encoding parameters error')
		console.error(error)
	})
}

function getExternalEncoder(media) {
	let codec
	if (media && media.fmtp && media.fmtp.length) {
		for (let i = 0; i < media.fmtp.length; i++) {
			let config = media.fmtp[i].config
			if (config.indexOf('packetization-mode=1') >= 0 && config.indexOf('profile-level-id=42e0') >= 0) {
				codec = media.fmtp[i].payload
				break
			}
		}
		if (!codec) {
			for (let i = 0; i < media.fmtp.length; i++) {
				let config = media.fmtp[i].config
				if (config.indexOf('packetization-mode=1') >= 0 && config.indexOf('profile-level-id=4200') >= 0) {
					codec = media.fmtp[i].payload
					break
				}
			}
		}
	}

	return codec
}

function trimH264Codec(parsedSdp, index){
	let media = parsedSdp.media[index]
	let priorityCodec = this.getExternalEncoder(media)

	let h264Codec = SDPTools.getCodecByName(parsedSdp, index, ['H264'])
	if (h264Codec && h264Codec.length) {
		let removeList = []
		if (!priorityCodec) {
			let topPriorityCodec = h264Codec.splice(1, h264Codec.length)
			removeList.push(topPriorityCodec)

			// If profile-level-id does not exist, set to 42e028
			for (let i = 0; i < media.fmtp.length; i++) {
				if (media.fmtp[i].payload === topPriorityCodec) {
					let config = media.fmtp[i].config
					if (config.indexOf('profile-level-id') < 0) {
						config = config + ';profile-level-id=42e028'
					}
				}
			}
		} else {
			h264Codec.forEach(function (pt) {
				if (pt !== priorityCodec) {
					removeList.push(pt)
				}
			})
		}
		SDPTools.removeCodecByPayload(parsedSdp, index, removeList)
	}
}

function commonDecorateLo(sdp){
	console.log('remove part of local codec')
	let parsedSdp = SDPTools.parseSDP(sdp)
	if (parsedSdp.media && parsedSdp.media.length) {
		for (let i = 0; i < parsedSdp.media.length; i++) {
			let media = parsedSdp.media[i]
			let codec = ['VP8', 'VP9']
			if (media.type === 'audio') {
				codec = ['G722', 'opus', 'PCMU', 'PCMA', 'telephone-event'] // only keep ['G722', 'opus', 'PCMU', 'PCMA', 'telephone-event']
				SDPTools.removeCodecByName(parsedSdp, i, codec, true)
			} else {
				// move red_ulpfec
				if (localStorage.getItem('test_red_ulpfec_enabled') !== 'true') {
					console.info('move red && ulpfec')
					codec.push('red', 'ulpfec')
				}

				trimH264Codec(parsedSdp, i)
				SDPTools.removeCodecByName(parsedSdp, i, codec)

				//  TODO: 发送出去的remb和transport-cc也需要去除才可以关闭这个功能
				if(!rembAndTransportCCEnabled){
					console.warn("remove remb && transport-cc")
					SDPTools.removeRembAndTransportCC(parsedSdp, i)
				}
			}
		}
	} else {
		console.warn('trimCodec error media: ' + parsedSdp.media)
	}

	sdp = SDPTools.writeSDP(parsedSdp)
	return sdp
}


/**
 * 处理sdp
 * @param sdp
 * @returns {string}
 */
function decorateSdp(sdp){
	let parsedSdp = SDPTools.parseSDP(sdp)
	let bLine = parseInt(document.getElementById('ASBitrate').value)
	let xGoogleMinBitrate = parseInt(document.getElementById('xGoogleMinBitrate').value)
	let xGoogleStartBitrate = parseInt(document.getElementById('xGoogleStartBitrate').value)
	let xGoogleMaxBitrate = parseInt(document.getElementById('xGoogleBitrate').value)

	for(let i = 0; i < parsedSdp.media.length; i++){
		let media = parsedSdp.media[i]

		if(media.type === 'video'){
			console.info('participants: Prepare to set video bitrate')
			if(bLine){
				SDPTools.setMediaBandwidth(parsedSdp, i, bLine)
			}

			if(rembAndTransportCCEnabled){
				console.warn('set x-google-xxx-bitrate value')
				SDPTools.setXgoogleBitrate(parsedSdp, i, xGoogleMaxBitrate, xGoogleMinBitrate, xGoogleStartBitrate)
			}
			// delete media.ext
		}
	}

	sdp = SDPTools.writeSDP(parsedSdp)
	return sdp
}
