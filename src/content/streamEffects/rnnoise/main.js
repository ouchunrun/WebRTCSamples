
/******************************************************************************************************************/
const constraints = window.constraints = {
	audio: true,
	video: false
};
let localAudioStream
let audioEle = document.getElementById('gum-local')
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const selectors = [audioInputSelect, audioOutputSelect];

/**
 * 获取设备列表
 * @param deviceInfos
 */
function gotDevices(deviceInfos) {
	// Handles being called several times to update labels. Preserve values.
	const values = selectors.map(select => select.value);
	selectors.forEach(select => {
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
	});
	for (let i = 0; i !== deviceInfos.length; ++i) {
		const deviceInfo = deviceInfos[i];
		const option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
			audioInputSelect.appendChild(option);
		} else if (deviceInfo.kind === 'audiooutput') {
			option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
			audioOutputSelect.appendChild(option);
		}else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	}
	selectors.forEach((select, selectorIndex) => {
		if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
			select.value = values[selectorIndex];
		}
	});
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

/******************************************************************************************************************/

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
	if (typeof element.sinkId !== 'undefined') {
		element.setSinkId(sinkId)
			.then(() => {
				console.log(`Success, audio output device attached: ${sinkId}`);
			})
			.catch(error => {
				let errorMessage = error;
				if (error.name === 'SecurityError') {
					errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
				}
				console.error(errorMessage);
				// Jump back to first output device in the list as it's the default.
				audioOutputSelect.selectedIndex = 0;
			});
	} else {
		console.warn('Browser does not support output device selection.');
	}
}

/**
 * 获取音频流
 */
function getAudioStream(){
	if (localAudioStream) {
		localAudioStream.getTracks().forEach(track => {
			track.stop();
		});
	}
	const audioSource = audioInputSelect.value;
	const constraints = {
		audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
		video: false
	};

	navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
}

function handleSuccess(stream) {
	const audioTracks = stream.getAudioTracks();
	console.log('Got stream with constraints:', constraints);
	console.log('Using audio device: ' + audioTracks[0].label);
	if(getBrowserDetail().browser === 'firefox'){
		audioTracks[0].onended = function () {
			console.warn('track on ended');
		}
	}else {
		stream.oninactive = function() {
			console.log('Stream ended');
		};
	}

	localAudioStream = stream; // make variable available to browser console
	audioEle.srcObject = stream;

	setupNewTrack(stream)
}

function handleError(error) {
	let errorMessage
	if(error.message && error.name){
		errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
	}else {
		errorMessage = error
	}

	document.getElementById('errorMsg').innerText = errorMessage;
	console.log(errorMessage);
}

function changeAudioDestination() {
	const audioDestination = audioOutputSelect.value;
	attachSinkId(audioEle, audioDestination);
}

audioInputSelect.onchange = getAudioStream;
audioOutputSelect.onchange = changeAudioDestination;

let isMute = false

/**
 * 静音切换
 */
function muteSwitch(){
	if(!localAudioStream){
		return
	}
	if(isMute === false){
		isMute = true
	}

	for (let i = 0; i < localAudioStream.getAudioTracks().length; i++) {
		if (isMute) {
			if (localAudioStream.getAudioTracks()[i].enabled === true) {
				console.info('MuteStream exec mute audio')
				localAudioStream.getAudioTracks()[i].enabled = false
			}
		} else {
			if (localAudioStream.getAudioTracks()[i].enabled === false) {
				console.info('MuteStream exec unmute audio')
				localAudioStream.getAudioTracks()[i].enabled = true
			}
		}
	}

	trackMuteChanged(localAudioStream)
}

/******************************************************************************************************************/
/**
 * userAgent 解析
 * @returns {{}}
 */
function getBrowserDetail() {
	function extractVersion (uastring, expr, pos) {
		let match = uastring.match(expr)
		return match && match.length >= pos && parseInt(match[pos], 10)
	}

	var navigator = window && window.navigator

	// Returned result object.
	var result = {}
	result.browser = null
	result.version = null
	result.UIVersion = null
	result.chromeVersion = null
	result.systemFriendlyName = null

	if(navigator.userAgent.match(/Windows/)){
		result.systemFriendlyName = 'windows'
	}else if(navigator.userAgent.match(/Mac/)){
		result.systemFriendlyName = 'mac'
	}else if(navigator.userAgent.match(/Linux/)){
		result.systemFriendlyName = 'linux'
	}

	// Fail early if it's not a browser
	if (typeof window === 'undefined' || !window.navigator) {
		result.browser = 'Not a browser.'
		return result
	}

	// Edge.
	if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
		result.browser = 'edge'
		result.version = extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2)
		result.UIVersion = navigator.userAgent.match(/Edge\/([\d.]+)/)[1] // Edge/16.17017
	} else if (!navigator.mediaDevices && (!!window.ActiveXObject || 'ActiveXObject' in window || navigator.userAgent.match(/MSIE (\d+)/) || navigator.userAgent.match(/rv:(\d+)/))) {
		// IE
		result.browser = 'ie'
		if (navigator.userAgent.match(/MSIE (\d+)/)) {
			result.version = extractVersion(navigator.userAgent, /MSIE (\d+).(\d+)/, 1)
			result.UIVersion = navigator.userAgent.match(/MSIE ([\d.]+)/)[1] // MSIE 10.6
		} else if (navigator.userAgent.match(/rv:(\d+)/)) {
			/* For IE 11 */
			result.version = extractVersion(navigator.userAgent, /rv:(\d+).(\d+)/, 1)
			result.UIVersion = navigator.userAgent.match(/rv:([\d.]+)/)[1] // rv:11.0
		}

		// Firefox.
	} else if (navigator.mozGetUserMedia) {
		result.browser = 'firefox'
		result.version = extractVersion(navigator.userAgent, /Firefox\/(\d+)\./, 1)
		result.UIVersion = navigator.userAgent.match(/Firefox\/([\d.]+)/)[1] // Firefox/56.0

		// all webkit-based browsers
	} else if (navigator.webkitGetUserMedia && window.webkitRTCPeerConnection) {
		// Chrome, Chromium, Webview, Opera, Vivaldi all use the chrome shim for now
		var isOpera = !!navigator.userAgent.match(/(OPR|Opera).([\d.]+)/)
		// var isVivaldi = navigator.userAgent.match(/(Vivaldi).([\d.]+)/) ? true : false;
		if (isOpera) {
			result.browser = 'opera'
			result.version = extractVersion(navigator.userAgent, /O(PR|pera)\/(\d+)\./, 2)
			result.UIVersion = navigator.userAgent.match(/O(PR|pera)\/([\d.]+)/)[2] // OPR/48.0.2685.39
			if (navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2]) {
				result.chromeVersion = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)
			}
		} else {
			result.browser = 'chrome'
			result.version = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)
			result.UIVersion = navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2] // Chrome/61.0.3163.100
		}
	} else if ((!navigator.webkitGetUserMedia && navigator.userAgent.match(/AppleWebKit\/([0-9]+)\./)) || (navigator.webkitGetUserMedia && !navigator.webkitRTCPeerConnection)) {
		if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
			result.browser = 'safari'
			result.version = extractVersion(navigator.userAgent, /AppleWebKit\/(\d+)\./, 1)
			result.UIVersion = navigator.userAgent.match(/Version\/([\d.]+)/)[1] // Version/11.0.1
		} else { // unknown webkit-based browser.
			result.browser = 'Unsupported webkit-based browser ' + 'with GUM support but no WebRTC support.'
			return result
		}
		// Default fallthrough: not supported.
	} else {
		result.browser = 'Not a supported browser.'
		return result
	}

	return result
}
