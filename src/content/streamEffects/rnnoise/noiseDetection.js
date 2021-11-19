

function NoiseDetection(){
	let This = this
	this.eventEmitter = new EventEmitter();
	this.audioAnalyser = null

	this.createVADProcessor = this.createRnNoiseProcessor;
	// Disable noisy mic detection on safari since it causes the audio input to
	// fail on Safari on iPadOS.
	this.audioAnalyser = new VADAudioAnalyser(This, This.createVADProcessor)
	const vadNoiseDetection = new VADNoiseDetection();
	vadNoiseDetection.on(DetectionEvents.VAD_NOISY_DEVICE, () => this.eventEmitter.emit(DetectionEvents.NOISY_MIC));
	this.audioAnalyser.addVADDetectionService(vadNoiseDetection);
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

NoiseDetection.prototype.setupNewTrack = function (stream){
	if(this.audioAnalyser){
		console.log('setup new stream, id ', stream.id)
		this.eventEmitter.emit(DetectionEvents.STREAM_ADDED, stream);
	}else {
		console.warn("track not found")
	}
}

NoiseDetection.prototype.trackMuteChanged = function (stream){
	if(!this.audioAnalyser || !stream){
		return
	}

	let track = stream.getAudioTracks()[0]
	console.log('track.enabled ', track.enabled)
	this.eventEmitter.emit(DetectionEvents.STREAM_MUTE_CHANGED, stream);
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

