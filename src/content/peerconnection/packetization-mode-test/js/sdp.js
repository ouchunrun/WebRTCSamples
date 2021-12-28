function getLocalSDP(sdp){
	let parsedSdp = SDPTools.parseSDP(sdp)
	trimCodec(parsedSdp)
	SDPTools.increaseSessionVersion(parsedSdp)
	// Set fingerprint/icePwd/iceUfrag to session level
	parsedSdp.fingerprint = parsedSdp.fingerprint || parsedSdp.media[0].fingerprint
	parsedSdp.icePwd = parsedSdp.icePwd || parsedSdp.media[0].icePwd
	parsedSdp.iceUfrag = parsedSdp.iceUfrag || parsedSdp.media[0].iceUfrag
	parsedSdp.setup = parsedSdp.setup || parsedSdp.media[0].setup

	if(localStorage.packetizationMode === 'true'){
		console.log('modified packetization-mode')
		trimPacketizationMode(parsedSdp)
	}

	sdp = SDPTools.writeSDP(parsedSdp)
	return sdp
}

/**
 * modified packetization-mode of m-section with mid='1'
 */
function trimPacketizationMode(parsedSdp){
	for (let i = 0; i < parsedSdp.media.length; i++) {
		let media = parsedSdp.media[i]
		delete media.fingerprint
		delete media.icePwd
		delete media.iceUfrag
		delete media.setup

		if(parseInt(media.mid) === 1){
			if(media.fmtp && media.fmtp.length){
				for(let j = 0; j<media.fmtp.length; j++){
					if(media.fmtp[j].config.match('packetization-mode')){
						media.fmtp[j].config = media.fmtp[j].config.replace(/packetization-mode=[0, 1]/g, 'packetization-mode=0')
						console.warn("Set the packetization-mode=0 of the m-section with mid='1'")
					}
				}
			}
		}
	}
}

function trimCodec (parsedSdp){
	if (parsedSdp.media && parsedSdp.media.length) {
		for (let i = 0; i < parsedSdp.media.length; i++) {
			let media = parsedSdp.media[i]
			let codec = ['VP8', 'VP9', 'AV1X']
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
			}
		}
	} else {
		console.warn('trimCodec error media: ' + parsedSdp.media)
	}
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

function getExternalEncoder(media){
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

