'use strict';
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const capButton = document.getElementById('getCapabilities')
const gumAudio = document.getElementById('gumAudio')

const instantMeter = document.querySelector('#instant meter');
const slowMeter = document.querySelector('#slow meter');
const clipMeter = document.querySelector('#clip meter');
const instantValueDisplay = document.querySelector('#instant .value');
const slowValueDisplay = document.querySelector('#slow .value');
const clipValueDisplay = document.querySelector('#clip .value');
let meterRefresh = null;

// Put variables in global scope to make them available to the browser console.
const constraints = window.constraints = {
	audio: true,
	video: false
};
let audioStream

function getAudioStream() {
	console.log('Requesting local stream');
	startButton.disabled = true;
	stopButton.disabled = false;

	const constraints = {
		audio: {
			noiseSuppression: {
				exact: document.getElementById('noiseSuppression').checked
			},
			echoCancellation: {
				exact: document.getElementById('echoCancellation').checked
			},
			autoGainControl: {
				exact: document.getElementById('autoGainControl').checked
			},
			channelCount: {
				exact: channelCount.value
			},
			volume: volume.value,
			deviceId: audioSource.value,
		},
		video: false
	}

	console.warn('get audio stream constraints: \r\n', constraints)
	navigator.mediaDevices.getUserMedia(constraints)
		.then(function (stream){
			console.log('get stream success', stream)
			audioStream = stream
			// gumAudio.srcObject = stream;
			capButton.disabled = false
			handleGumSuccess()
			creatPeerConnection(stream)
		})
		.catch(handleError);
}

function handleError(error) {
	console.error('error: ', error);
	startButton.disabled = false;
	stopButton.disabled = true;
}

function handleGumSuccess(){
	// Put variables in global scope to make them available to the
	// browser console.
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		window.audioContext = new AudioContext();
	} catch (e) {
		alert('Web Audio API not supported.');
	}
	const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
	soundMeter.connectToSource(audioStream, function(e) {
		if (e) {
			alert(e);
			return;
		}
		meterRefresh = setInterval(() => {
			instantMeter.value = instantValueDisplay.innerText =
				soundMeter.instant.toFixed(2);
			slowMeter.value = slowValueDisplay.innerText =
				soundMeter.slow.toFixed(2);
			clipMeter.value = clipValueDisplay.innerText =
				soundMeter.clip;
		}, 200);
	});
}

function stop() {
	console.log('Stopping local stream');
	startButton.disabled = false;
	stopButton.disabled = true;
	capButton.disabled = true

	console.log('Ending call');
	pc1.close();
	pc2.close();
	pc1 = null;
	pc2 = null;
	window.soundMeter.stop();
	clearInterval(meterRefresh);
	instantMeter.value = instantValueDisplay.innerText = '';
	slowMeter.value = slowValueDisplay.innerText = '';
	clipMeter.value = clipValueDisplay.innerText = '';

	if(window.audioStream){
		window.audioStream.getTracks().forEach(track => track.stop());
	}
}


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
		} else if (deviceInfo.kind === 'videoinput') {
			option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
			videoSelect.appendChild(option);
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	}
	selectors.forEach((select, selectorIndex) => {
		if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
			select.value = values[selectorIndex];
		}
	});
}

window.onload = function () {
	console.log('load device')
	navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

	let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
	// debugger
	let selectOptions = [
		'noiseSuppression',
		'echoCancellation',
		'autoGainControl',
		'channelCount',
		'volume'
	]
	for(let i = 0; i<selectOptions.length; i++){
		if (!supportedConstraints.hasOwnProperty(selectOptions[i])) {
			console.warn(selectOptions[i] + ' is not support!')
			let target = document.getElementById(selectOptions[i])
			target.disabled = true
		}
	}
}

function getCapabilities(){
	if(audioStream && audioStream.getTracks() && audioStream.getTracks().length){
		let result = audioStream.getTracks()[0].getCapabilities()
		console.log('audio support capabilities is: \r\n', JSON.stringify(result, null, '    '))
	}
}
