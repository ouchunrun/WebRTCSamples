function trimCodec(parsedSdp){
	if (parsedSdp.media && parsedSdp.media.length) {
		for (let i = 0; i < parsedSdp.media.length; i++) {
			let media = parsedSdp.media[i]
			let codec = ['VP9']
			if (media.type === 'audio') {
				codec = ['G722', 'opus', 'PCMU', 'PCMA'] // only keep ['G722', 'opus', 'PCMU', 'PCMA']
				SDPTools.removeCodecByName(parsedSdp, i, codec, true)
			} else {
				// move red_ulpfec
				if (localStorage.getItem('test_red_ulpfec_enabled') !== 'true') {
					codec.push('red', 'ulpfec')
				}

				trimH264Codec(parsedSdp, i)
				SDPTools.removeCodecByName(parsedSdp, i, codec)
			}
		}
	} else {
		log.warn('trimCodec error media: ' + parsedSdp.media)
	}
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

function trimH264Codec(parsedSdp, index) {
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

function removeSSRC(parsedSdp){
	let This = this
	for (let i = 0; i < parsedSdp.media.length; i++) {
		let type = parsedSdp.media[i].content || parsedSdp.media[i].type

		if(type !== 'audio'){
			if(type === 'main' && videoOn){
			}else {
				parsedSdp.media[i].direction = 'recvonly'
				delete parsedSdp.media[i].ssrcs
				delete parsedSdp.media[i].ssrcGroups
				delete parsedSdp.media[i].msid
			}
		}
	}
}

function generateUUID() {
	let d = new Date().getTime()
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r = (d + Math.random() * 16) % 16 | 0
		d = Math.floor(d / 16)
		return (c === 'x' ? r : (r && 0x7 | 0x8)).toString(16)
	})
}

function renameMediaMsid(parsedSdp, msid){
	let This = this
	for (let i = 0; i < parsedSdp.media.length; i++) {
		let media = parsedSdp.media[i]
		let randomSuffix = generateUUID()
		if(media.type === 'audio'){
			if(media.ssrcs && media.ssrcs.length){
				media.ssrcs.forEach(function (ssrc){
					if(ssrc.attribute === 'msid'){
						ssrc.value = msid + '_' + randomSuffix + ' audio'
					}
				})
			}
			if(media.msid) {
				media.msid.msid = msid + '_' + randomSuffix
				media.msid.trackid = 'audio'
			}
		}else {
			if (media.content && media.content === 'main') {
				if(media.ssrcs && media.ssrcs.length){
					media.ssrcs.forEach(function (ssrc){
						if(ssrc.attribute === 'msid'){
							ssrc.value = msid + '_' + randomSuffix + ' main-video'
						}
					})
				}
				if(media.msid) {
					media.msid.msid = msid + '_' + randomSuffix
					media.msid.trackid = 'main-video'
				}
			} else if (media.content && media.content === 'slides') {
				if(media.ssrcs && media.ssrcs.length){
					media.ssrcs.forEach(function (ssrc){
						if(ssrc.attribute === 'msid'){
							ssrc.value = msid + '_' + randomSuffix + ' slides-video'
						}
					})
				}
				if(media.msid) {
					media.msid.msid = msid + '_' + randomSuffix
					media.msid.trackid = 'slides-video'
				}
			}
		}
	}
}

function getLocalSDP(sdp){
	let parsedSdp = SDPTools.parseSDP(sdp)

	// set max-compat bundle group
	SDPTools.setMediaContentType(parsedSdp, ['main', 'slides'])

	// delete codec
	trimCodec(parsedSdp)
	// remove ssrc if no stream
	removeSSRC(parsedSdp)
	// save current ssrc and code for getStats
	// This.saveNetStatsUseParam(parsedSdp, true)
	renameMediaMsid(parsedSdp, '1000')
	// Save the session version, plus one for each re-invite
	SDPTools.increaseSessionVersion(parsedSdp)
	// Save the mid of your three media lines
	// This.saveOwnMediasMid(parsedSdp)

	parsedSdp.groups[0].mids = ''

	console.warn('add session ice && fingerprint', parsedSdp)
	// parsedSdp.fingerprint = parsedSdp.media[0].fingerprint
	// parsedSdp.icePwd = parsedSdp.media[0].icePwd
	// parsedSdp.iceUfrag = parsedSdp.media[0].iceUfrag

	for (let i = 0; i < parsedSdp.media.length; i++) {
		let media = parsedSdp.media[i]
		// delete media.fingerprint
		// delete media.icePwd
		// delete media.iceUfrag

		if(!parsedSdp.groups[0].mids){
			parsedSdp.groups[0].mids = parsedSdp.groups[0].mids + media.mid
		}else {
			parsedSdp.groups[0].mids = parsedSdp.groups[0].mids + ' ' + media.mid
		}

		if(media.type === 'audio'){
			if(!audioStream){
				media.direction = 'recvonly'
			}
		} else if (media.content && media.content === 'main') {

			if(!videoOn){
				media.direction = 'inactive'
				log.warn('clear main stream.')
			}else {
				log.info('modified main video direction')
				media.direction = 'sendonly'    // video conference, main only send
			}

		}else if (media.content && media.content === 'slides'){
			media.direction = 'recvonly'
		}
	}

	console.warn("parsedSdp: ", parsedSdp)
	sdp = SDPTools.writeSDP(parsedSdp)
	return sdp
}
