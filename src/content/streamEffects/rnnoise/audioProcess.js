
/**
 * Creates a new instance of RnnoiseProcessor.
 *
 * @returns {Promise<RnnoiseProcessor>}
 */
function createRnnoiseProcessor() {
	let rnnoiseModule = RNNoiseWasmModule();
	return rnnoiseModule.then(mod => new RnnoiseProcessor(mod));
}

function JitsiConference(){
	let This = this
	this.eventEmitter = new EventEmitter();
	this.audioAnalyser = null

	if(createRnnoiseProcessor){
		this.createVADProcessor = createRnnoiseProcessor;
		// Disable noisy mic detection on safari since it causes the audio input to
		// fail on Safari on iPadOS.
		this.audioAnalyser = new VADAudioAnalyser(this, this.createVADProcessor)
		const vadNoiseDetection = new VADNoiseDetection();
		// 添加监听
		vadNoiseDetection.on(DetectionEvents.VAD_NOISY_DEVICE, () => this.eventEmitter.emit(JitsiConferenceEvents.NOISY_MIC));
		this.audioAnalyser.addVADDetectionService(vadNoiseDetection);
	}else {
		console.warn('No VAD Processor was provided. Noisy microphone detection service was not initialized!');
	}

	this.on(JitsiConferenceEvents.TRACK_MUTE_CHANGED,
		track => {
			console.warn('track mute change: ', track)
			// Hide the notification in case the user mutes the microphone
			if (This.localAudioStream && This.localAudioStream.getAudioTracks().length && !This.localAudioStream.getAudioTracks()[0].enabled) {
				console.warn('Hide the notification in case the user mutes the microphone')
			}
	});

	this.on(JitsiConferenceEvents.NOISY_MIC, async () => {
		console.warn("NOISY_MIC!!!!!!!!!!!!")
		// 加上时间！！
		showLog(tips.toolbar.noisyAudioInputTitle)
	});
}


/**
 * Attaches a handler for events(For example - "participant joined".) in the
 * conference. All possible event are defined in JitsiConferenceEvents.
 * @param eventId the event ID.
 * @param handler handler for the event.
 *
 * Note: consider adding eventing functionality by extending an EventEmitter
 * impl, instead of rolling ourselves
 */
JitsiConference.prototype.on = function(eventId, handler) {
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
JitsiConference.prototype.off = function(eventId, handler) {
	if (this.eventEmitter) {
		this.eventEmitter.removeListener(eventId, handler);
	}
};


let conference
window.onload = function (){
	console.log('window onload...')
	conference = new JitsiConference()
}

/*************************************************************************************************************/

function setupNewTrack(stream){
	if(conference && conference.audioAnalyser){
		conference.localAudioStream = stream
		let audioTrack = stream.getAudioTracks()[0]
		console.log('setup new track, ', audioTrack)
		conference.audioAnalyser._trackAdded(stream)
	}else {
		console.warn("track not found")
	}
}


function trackMuteChanged(stream){
	let track = stream.getAudioTracks()[0]
	console.warn('track.enabled ', track.enabled)
	conference.audioAnalyser._trackMuteChanged(track)
}





