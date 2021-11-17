
- Using VAD detection for generating talk while muted events
```
if (this.createVADProcessor) {
    console.info('Using VAD detection for generating talk while muted events');
    if (!this._audioAnalyser) {
        this._audioAnalyser = new VADAudioAnalyser(this, this.createVADProcessor);
    }

    const vadTalkMutedDetection = new VADTalkMutedDetection();

    vadTalkMutedDetection.on(DetectionEvents.VAD_TALK_WHILE_MUTED, () =>{
        console.warn('VAD_TALK_WHILE_MUTED')
        handleError(tips.toolbar.talkWhileMutedPopup)
        this.eventEmitter.emit(JitsiConferenceEvents.TALK_WHILE_MUTED)
    });

    this._audioAnalyser.addVADDetectionService(vadTalkMutedDetection);
}
```
