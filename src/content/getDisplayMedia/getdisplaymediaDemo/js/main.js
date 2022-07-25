
function onGetStreamSuccess(stream) {
    startButton.disabled = true;
    const video = document.querySelector('video');
    video.srcObject = stream;

    // demonstrates how to detect that the user has stopped
    // sharing the screen via the browser UI.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
        errorMsg('The user has ended sharing the screen');
        startButton.disabled = false;
    });
}

function onGetStreamFailed(error) {
    errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

const startButton = document.getElementById('startButton');
let constraints = {
    // audio: true,
    // video: true,
    video: {
        // width: {max: 1920},
        // height: {max: 1080},
        frameRate: {max: 5}
    }
}
startButton.addEventListener('click', () => {
    console.warn('get display media constraints:\r\n', JSON.stringify(constraints, null, '    '))
    if (navigator.getDisplayMedia) {
        // for Edge old version
        navigator.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
    } else if (navigator.mediaDevices.getDisplayMedia) {
        // for all supported getDisplayMedia browser versions
        navigator.mediaDevices.getDisplayMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
    } else if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(onGetStreamSuccess).catch(onGetStreamFailed)
    } else {
        log.info('getDisplayMedia is not supported by current browser')
    }
});

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    startButton.disabled = false;
} else {
    errorMsg('getDisplayMedia is not supported');
}
