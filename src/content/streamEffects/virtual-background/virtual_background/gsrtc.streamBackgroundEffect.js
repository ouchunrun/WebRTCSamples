
/**
 * Represents a modified MediaStream that adds effects to video background.
 * <tt>StreamBackgroundEffect</tt> does the processing of the original
 * video stream.
 */
function StreamBackgroundEffect(virtualBackground){
    this.backgroundEffectEnabled = false
    this.segmentationDimensions = {
        model96: { height: 96, width: 160 },
        model144: { height: 144, width: 256 }
    }
    this._options = {
        ...(this.segmentationDimensions.model96),
        virtualBackground
    }
    if (this._options.virtualBackground && this._options.virtualBackground.backgroundType === 'image') {
        this._virtualImage = document.createElement('img')
        this._virtualImage.crossOrigin = 'anonymous'
        this._virtualImage.src = this._options.virtualBackground.virtualSource
    }
    this._tflite = null
    this._segmentationPixelCount = this._options.width * this._options.height
    // Bind event handler so it is only bound once for every instance.
    this._onMaskFrameTimer = this._onMaskFrameTimer.bind(this)

    // Workaround for FF issue https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
    this._outputCanvasElement = document.createElement('canvas')
    this._outputCanvasElement.getContext('2d')
    this._inputVideoElement = document.createElement('video')

    this.loadTFLite()
}

StreamBackgroundEffect.prototype.loadTFLite = async function(){
    this._tflite = await this.loadTFLiteModel()
}

/**
 * This loads the Meet background model that is used to extract person segmentation.
 * @returns {Promise<*>}
 */
StreamBackgroundEffect.prototype.loadTFLiteModel = async function(){
    if (!MediaStreamTrack.prototype.getSettings && !MediaStreamTrack.prototype.getConstraints) {
        throw new Error('JitsiStreamBackgroundEffect not supported!');
    }
    const models = {
        model96: '/virtual_background/segm_lite_v681.tflite',
    };

    const segmentationDimensions = {
        model96: { height: 96, width: 160 },
        model144: { height: 144, width: 256 }
    }
    let tflite = await createTFLiteModule()

    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    const modelResponse = await fetch(models.model96);

    if (!modelResponse.ok) {
        throw new Error('Failed to download tflite model!');
    }

    const model = await modelResponse.arrayBuffer();
    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    tflite._loadModel(model.byteLength);
    return tflite
}

StreamBackgroundEffect.prototype.setVirtualBackground = function(options) {
    if(!options){
        throw Error('Invalid setting parameters of VirtualBackground')
    }
    if(options.backgroundType === 'image' && !options.virtualSource){
        throw Error('backgroun image source is NEED!')
    }

    this._options.virtualBackground = options
    if (this._options.virtualBackground && this._options.virtualBackground.backgroundType === 'image'){
        if(!this._virtualImage){
            this._virtualImage = document.createElement('img')
            this._virtualImage.crossOrigin = 'anonymous'
        }
        this._virtualImage.src = this._options.virtualBackground.virtualSource
    }

    this.backgroundEffectEnabled = !(options.backgroundType === 'none')
}

/**
 * EventHandler onmessage for the maskFrameTimerWorker WebWorker.
 *
 * @private
 * @param {EventHandler} response - The onmessage EventHandler parameter.
 * @returns {void}
 */
StreamBackgroundEffect.prototype._onMaskFrameTimer = function (response){
    if (response.data.id === TIMEOUT_TICK) {
        this._renderMask();
    }
}

/**
 * Represents the run post processing.
 *
 * @returns {void}
 */
StreamBackgroundEffect.prototype.runPostProcessing = function (){
    this._outputCanvasCtx.globalCompositeOperation = 'copy';

    // Smooth out the edges.
    if (this._options.virtualBackground.backgroundType === 'image') {
        this._outputCanvasCtx.filter = 'blur(4px)';
    } else {
        this._outputCanvasCtx.filter = 'blur(8px)';
    }

    this._outputCanvasCtx.drawImage(
        this._segmentationMaskCanvas,
        0,
        0,
        this._options.width,
        this._options.height,
        0,
        0,
        this._inputVideoElement.width,
        this._inputVideoElement.height
    );
    this._outputCanvasCtx.globalCompositeOperation = 'source-in';
    this._outputCanvasCtx.filter = 'none';

    // Draw the foreground video.
    this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);

    // Draw the background.
    this._outputCanvasCtx.globalCompositeOperation = 'destination-over';
    if (this._options.virtualBackground.backgroundType === 'image') {
        this._outputCanvasCtx.drawImage(
            this._virtualImage,
            0,
            0,
            this._inputVideoElement.width,
            this._inputVideoElement.height
        );
    } else {
        this._outputCanvasCtx.filter = `blur(${this._options.virtualBackground.blurValue}px)`;
        this._outputCanvasCtx.drawImage(this._inputVideoElement, 0, 0);
    }
}

/**
 * Represents the run Tensorflow Interference.
 *
 * @returns {void}
 */
StreamBackgroundEffect.prototype.runInference = function (){
    this._tflite._runInference();
    const outputMemoryOffset = this._tflite._getOutputMemoryOffset() / 4;

    for (let i = 0; i < this._segmentationPixelCount; i++) {
        const background = this._tflite.HEAPF32[outputMemoryOffset + (i * 2)];
        const person = this._tflite.HEAPF32[outputMemoryOffset + (i * 2) + 1];
        const shift = Math.max(background, person);
        const backgroundExp = Math.exp(background - shift);
        const personExp = Math.exp(person - shift);

        // Sets only the alpha component of each pixel.
        this._segmentationMask.data[(i * 4) + 3] = (255 * personExp) / (backgroundExp + personExp);
    }
    this._segmentationMaskCtx.putImageData(this._segmentationMask, 0, 0);
}

/**
 * Loop function to render the background mask.
 *
 * @private
 * @returns {void}
 */
StreamBackgroundEffect.prototype._renderMask = function () {
    this.resizeSource();
    this.runInference();
    this.runPostProcessing();

    this._maskFrameTimerWorker.postMessage({
        id: SET_TIMEOUT,
        timeMs: 1000 / 30
    });
}

/**
 * Represents the resize source process.
 *
 * @returns {void}
 */
StreamBackgroundEffect.prototype.resizeSource = function () {
    this._segmentationMaskCtx.drawImage(
        this._inputVideoElement,
        0,
        0,
        this._inputVideoElement.width,
        this._inputVideoElement.height,
        0,
        0,
        this._options.width,
        this._options.height
    );

    const imageData = this._segmentationMaskCtx.getImageData(
        0,
        0,
        this._options.width,
        this._options.height
    );
    const inputMemoryOffset = this._tflite._getInputMemoryOffset() / 4;

    for (let i = 0; i < this._segmentationPixelCount; i++) {
        this._tflite.HEAPF32[inputMemoryOffset + (i * 3)] = imageData.data[i * 4] / 255;
        this._tflite.HEAPF32[inputMemoryOffset + (i * 3) + 1] = imageData.data[(i * 4) + 1] / 255;
        this._tflite.HEAPF32[inputMemoryOffset + (i * 3) + 2] = imageData.data[(i * 4) + 2] / 255;
    }
}

/**
 * Checks if the local track supports this effect.
 *
 * @param {JitsiLocalTrack} jitsiLocalTrack - Track to apply effect.
 * @returns {boolean} - Returns true if this effect can run on the specified track
 * false otherwise.
 */
StreamBackgroundEffect.prototype.isEnabled = function (jitsiLocalTrack) {
    return jitsiLocalTrack.isVideoTrack() && jitsiLocalTrack.videoType === 'camera';
}

/**
 * Starts loop to capture video frame and render the segmentation mask.
 *
 * @param {MediaStream} stream - Stream to be used for processing.
 * @returns {MediaStream} - The stream with the applied effect.
 */
StreamBackgroundEffect.prototype.startEffect = function (stream) {
    this._maskFrameTimerWorker = new Worker(timerWorkerScript, { name: 'Blur effect worker' });
    this._maskFrameTimerWorker.onmessage = this._onMaskFrameTimer;
    const firstVideoTrack = stream.getVideoTracks()[0];
    const { height, frameRate, width } = firstVideoTrack.getSettings ? firstVideoTrack.getSettings() : firstVideoTrack.getConstraints();

    this._segmentationMask = new ImageData(this._options.width, this._options.height);
    this._segmentationMaskCanvas = document.createElement('canvas');
    this._segmentationMaskCanvas.width = this._options.width;
    this._segmentationMaskCanvas.height = this._options.height;
    this._segmentationMaskCtx = this._segmentationMaskCanvas.getContext('2d');

    this._outputCanvasElement.width = parseInt(width, 10);
    this._outputCanvasElement.height = parseInt(height, 10);
    this._outputCanvasCtx = this._outputCanvasElement.getContext('2d');
    this._inputVideoElement.width = parseInt(width, 10);
    this._inputVideoElement.height = parseInt(height, 10);
    this._inputVideoElement.autoplay = true;
    this._inputVideoElement.srcObject = stream;
    this._inputVideoElement.onloadeddata = () => {
        this._maskFrameTimerWorker.postMessage({
            id: SET_TIMEOUT,
            timeMs: 1000 / 30
        });
    };

    return this._outputCanvasElement.captureStream(parseInt(frameRate, 10));
}

/**
 * Stops the capture and render loop.
 *
 * @returns {void}
 */
StreamBackgroundEffect.prototype.stopEffect = function (){
    this._maskFrameTimerWorker.postMessage({
        id: CLEAR_TIMEOUT
    });

    this._maskFrameTimerWorker.terminate();
}
