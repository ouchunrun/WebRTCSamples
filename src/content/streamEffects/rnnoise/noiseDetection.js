

function NoiseDetection(){
	this.eventEmitter = new EventEmitter();
	this.audioAnalyser = null

	this.createVADProcessor = this.createRnNoiseProcessor;
	// Disable noisy mic detection on safari since it causes the audio input to
	// fail on Safari on iPadOS.
	this.audioAnalyser = new VADAudioAnalyser(this, this.createVADProcessor)
	const vadNoiseDetection = new VADNoiseDetection();
	// // 添加监听
	vadNoiseDetection.on(NoiseDetection.VAD_NOISY_DEVICE, () => this.eventEmitter.emit(NoiseDetection.NOISY_MIC));
	this.audioAnalyser.addVADDetectionService(vadNoiseDetection);

	this.addNoiseEventListener()
}

/**
 * Creates a new instance of RnnoiseProcessor.
 *
 * @returns {Promise<RnnoiseProcessor>}
 */
NoiseDetection.prototype.createRnNoiseProcessor = function (){
	let rnNoiseModule = RNNoiseWasmModule();
	return rnNoiseModule.then(mod => new RnnoiseProcessor(mod));
}


NoiseDetection.prototype.addNoiseEventListener = function (){
	let This = this
	this.on(DetectionEvents.TRACK_MUTE_CHANGED,
		track => {
			console.warn('track mute change: ', track)
			// Hide the notification in case the user mutes the microphone
			if (This.localAudioStream && This.localAudioStream.getAudioTracks().length && !This.localAudioStream.getAudioTracks()[0].enabled) {
				console.warn('Hide the notification in case the user mutes the microphone')
			}
		});

	this.on(DetectionEvents.NOISY_MIC, async () => {
		console.warn("NOISY_MIC!!!!!!!!!!!!")
		// 加上时间！！
		showLog(tips.toolbar.noisyAudioInputTitle)
	});
}

NoiseDetection.prototype.setupNewTrack = function (stream){
	if(this.audioAnalyser){
		this.localAudioStream = stream
		let audioTrack = stream.getAudioTracks()[0]
		console.log('setup new track, ', audioTrack)
		this.audioAnalyser._trackAdded(stream)
	}else {
		console.warn("track not found")
	}
}

NoiseDetection.prototype.trackMuteChanged = function (stream){
	if(!this.audioAnalyser || !stream){
		return
	}

	let track = stream.getAudioTracks()[0]
	console.warn('track.enabled ', track.enabled)
	this.audioAnalyser._trackMuteChanged(track)
}

/**
 * Attaches a handler for events(For example - "participant joined".) in the
 * conference. All possible event are defined in DetectionEvents.
 * @param eventId the event ID.
 * @param handler handler for the event.
 *
 * Note: consider adding eventing functionality by extending an EventEmitter
 * impl, instead of rolling ourselves
 */
NoiseDetection.prototype.on = function(eventId, handler) {
	if (this.eventEmitter) {
		this.eventEmitter.on(eventId, handler);
	}
};

/**
 * Removes event listener
 * @param eventId the event ID.
 * @param [handler] optional, the specific handler to unbind
 *
 * Note: consider adding eventing functionality by extending an EventEmitter
 * impl, instead of rolling ourselves
 */
NoiseDetection.prototype.off = function(eventId, handler) {
	if (this.eventEmitter) {
		this.eventEmitter.removeListener(eventId, handler);
	}
};

