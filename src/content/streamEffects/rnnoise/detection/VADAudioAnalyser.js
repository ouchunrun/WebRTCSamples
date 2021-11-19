
/**
 * Sample rate of TrackVADEmitter, it defines how many audio samples are processed at a time.
 * @type {number}
 */
const VAD_EMITTER_SAMPLE_RATE = 4096;

/**
 * Connects a TrackVADEmitter to the target noiseDetection local audio track and manages various services that use
 * the data to produce audio analytics (VADTalkMutedDetection and VADNoiseDetection).
 */
class VADAudioAnalyser extends EventEmitter {
    /**
     * Creates <tt>VADAudioAnalyser</tt>
     * @param  noiseDetection - instance that created us.
     * @param {Object} createVADProcessor - Function that creates a Voice activity detection processor. The processor
     * needs to implement the following functions:
     * - <tt>getSampleLength()</tt> - Returns the sample size accepted by getSampleLength.
     * - <tt>getRequiredPCMFrequency()</tt> - Returns the PCM frequency at which the processor operates.
     * - <tt>calculateAudioFrameVAD(pcmSample)</tt> - Process a 32 float pcm sample of getSampleLength size.
     * @constructor
     */
    constructor( noiseDetection, createVADProcessor) {
        super();

        /**
         * Member function that instantiates a VAD processor.
         */
        this._createVADProcessor = createVADProcessor;

        /**
         * Current {@link TrackVADEmitter}. VAD Emitter uses a audioTrack and VAD processor to generate
         * period voice probability scores.
         */
        this._vadEmitter = null;

        /**
         * Current state of the _vadEmitter
         */
        this._isVADEmitterRunning = false;

        /**
         * Array of currently attached VAD processing services.
         */
        this._detectionServices = [];

        /**
         * Promise used to chain create and destroy operations associated with STREAM_ADDED and STREAM_REMOVED events
         * coming from the noiseDetection.
         * Because we have an async created component (VAD Processor) we need to make sure that it's initialized before
         * we destroy it ( when changing the device for instance), or when we use it from an external point of entry
         * i.e. (STREAM_MUTE_CHANGED event callback).
         */
        this._vadInitTracker = Promise.resolve();

        /**
         * Listens for {@link TrackVADEmitter} events and processes them.
         */
        this._processVADScore = this._processVADScore.bind(this);


        noiseDetection.on(DetectionEvents.STREAM_ADDED, this._StreamAdded.bind(this));
        noiseDetection.on(DetectionEvents.STREAM_REMOVED, this._StreamRemoved.bind(this));
        noiseDetection.on(DetectionEvents.STREAM_MUTE_CHANGED, this._StreamMuteChanged.bind(this));
    }

    /**
     * Attach a VAD detector service to the analyser and handle it's state changes.
     *
     * @param {Object} vadTMDetector
     */
    addVADDetectionService(vadService) {
        this._detectionServices.push(vadService);
        vadService.on(DetectionEvents.DETECTOR_STATE_CHANGE, () => {
            // When the state of a detector changes check if there are any active detectors attached so that
            // the _vadEmitter doesn't run needlessly.
            const activeDetector = this._detectionServices.filter(detector => detector.isActive() === true);

            // If there are no active detectors running and the vadEmitter is running then stop the emitter as it is
            // uses a considerable amount of CPU. Otherwise start the service if it's stopped and there is a detector
            // that needs it.
            if (!activeDetector.length && this._isVADEmitterRunning) {
                this._stopVADEmitter();
            } else if (!this._isVADEmitterRunning) {
                this._startVADEmitter();
            }
        });
    }

    /**
     * Start the {@link TrackVADEmitter} and attach the event listener.
     * @returns {void}
     */
    _startVADEmitter() {
        if (this._vadEmitter) {
            this._vadEmitter.on(DetectionEvents.VAD_SCORE_PUBLISHED, this._processVADScore);
            this._vadEmitter.start();
            this._isVADEmitterRunning = true;
        }
    }

    /**
     * Stop the {@link TrackVADEmitter} and detach the event listener.
     * @returns {void}
     */
    _stopVADEmitter() {
        if (this._vadEmitter) {
            this._vadEmitter.removeListener(DetectionEvents.VAD_SCORE_PUBLISHED, this._processVADScore);
            this._vadEmitter.stop();
        }
        this._isVADEmitterRunning = false;
    }

    /**
     * Listens for {@link TrackVADEmitter} events and directs them to attached services as needed.
     *
     * @param {Object} vadScore -VAD score emitted by {@link TrackVADEmitter}
     * @param {Date}   vadScore.timestamp - Exact time at which processed PCM sample was generated.
     * @param {number} vadScore.score - VAD score on a scale from 0 to 1 (i.e. 0.7)
     * @param {Float32Array} pcmData - Raw PCM data with which the VAD score was calculated.
     * @param {string} vadScore.deviceId - Device id of the associated track.
     * @listens VAD_SCORE_PUBLISHED
     */
    _processVADScore(vadScore) {
        for (const detector of this._detectionServices) {
            detector.processVADScore(vadScore);
        }
    }

    /**
     * Change the isMuted state of all attached detection services.
     *
     * @param {boolean} isMuted
     */
    _changeDetectorsMuteState(isMuted) {
        for (const detector of this._detectionServices) {
            detector.changeMuteState(isMuted);
        }
    }

    /**
     * Notifies the detector that a track was added to the associated.
     * Only take into account local audio tracks.
     * @param  stream - The stream track.
     * @returns {void}
     * @listens STREAM_ADDED
     */
    _StreamAdded(stream) {
        // Keep a track promise so we take into account successive TRACK_ADD events being generated so that we
        // destroy/create the processing context in the proper order.
        let track = stream.getAudioTracks()[0]
        this._vadInitTracker = this._vadInitTracker.then(() => this._createVADProcessor())
            .then(vadProcessor =>
                TrackVADEmitter.create(stream, VAD_EMITTER_SAMPLE_RATE, vadProcessor)
            )
            .then(vadEmitter => {
                console.debug('Created VAD emitter for track: ', track);
                this._vadEmitter = vadEmitter;

                // Iterate through the detection services and set their appropriate mute state, depending on
                // service this will trigger a DETECTOR_STATE_CHANGE which in turn might start the _vadEmitter.
                let isMuted = !track['enabled']
                this._changeDetectorsMuteState(isMuted);
            })
            .catch(error => {
                console.warn('Failed to start VADAudioAnalyser', error);
            });
    }

    /**
     * Notifies the detector that the mute state of a track has changed. Only takes into account
     * local audio tracks.
     * @param stream - The track whose mute state has changed.
     * @returns {void}
     * @listens STREAM_MUTE_CHANGED
     */
    _StreamMuteChanged(stream) {
        if(!stream){
            console.warn("stream is null")
            return
        }
        // On a mute toggle reset the state.
        this._vadInitTracker = this._vadInitTracker.then(() => {
            // Set mute status for the attached detection services.
            let track = stream.getAudioTracks()[0]
            if(track){
                let isMuted = !track['enabled']
                console.log('stream mute change, isMute ', isMuted)
                this._changeDetectorsMuteState(isMuted);
            }
        });
    }

    /**
     * Notifies the detector that a track associated with the was removed. Only takes into
     * account local audio tracks. Cleans up resources associated with the track and resets the processing context.
     *
     * @param track - The removed track.
     * @returns {void}
     * @listens STREAM_REMOVED
     */
    _StreamRemoved(track) {
        // Use the promise to make sure operations are in sequence.
        this._vadInitTracker = this._vadInitTracker.then(() => {
            console.debug('Removing track from VAD detection - ', track);

            // Track was removed, clean up and set appropriate states.
            if (this._vadEmitter) {
                this._stopVADEmitter();
                this._vadEmitter.destroy();
                this._vadEmitter = null;
            }

            // Reset state of detectors when active track is removed.
            for (const detector of this._detectionServices) {
                detector.reset();
            }
        });
    }
}
