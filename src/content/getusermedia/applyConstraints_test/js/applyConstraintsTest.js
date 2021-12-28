function applyConstraints360(){
    let constraints = {
        "frameRate": {"max": 15, "ideal": 15},
        "aspectRatio": {"min": 1.777, "max": 1.778},
        "width": {"min": 0, "ideal": 640, "max": 640},
        "height": {"min": 0, "ideal": 360, "max": 360}
    }
    let localVideoTrack = localStream.getVideoTracks()[0];
    localVideoTrack.applyConstraints(constraints).then(function () {
        console.warn('applyConstraints succeed ' + JSON.stringify(constraints, null, '    '));

    }).catch(function (error) {
        console.error("fail to applyConstraints : " + JSON.stringify(constraints, null, '    '));
        console.error("applyConstraints fail name: " + error.name + " ,constraint " + error.constraint);
    });
}

function applyConstraints720(){
    let constraints = {
        "frameRate": {"max": 15, "ideal": 15},
        "aspectRatio": {"min": 1.777, "max": 1.778},
        "width": {"min": 0, "ideal": 1280, "max": 1280},
        "height": {"min": 0, "ideal": 720, "max": 720}
    }
    let localVideoTrack = localStream.getVideoTracks()[0];
    localVideoTrack.applyConstraints(constraints).then(function () {
        console.warn('applyConstraints succeed ' + JSON.stringify(constraints, null, '    '));

    }).catch(function (error) {
        console.error("fail to applyConstraints : " + JSON.stringify(constraints, null, '    '));
        console.error("applyConstraints fail name: " + error.name + " ,constraint " + error.constraint);
    });
}

function applyConstraints1080(){
    let constraints = {
        "frameRate": {"max": 15, "ideal": 15},
        "aspectRatio": {"min": 1.777, "max": 1.778},
        "width": {"min": 0, "ideal": 1920, "max": 1920},
        "height": {"min": 0, "ideal": 1080, "max": 1080}
    }
    let localVideoTrack = localStream.getVideoTracks()[0];
    localVideoTrack.applyConstraints(constraints).then(function () {
        console.warn('applyConstraints succeed ' + JSON.stringify(constraints, null, '    '));

    }).catch(function (error) {
        console.error("fail to applyConstraints : " + JSON.stringify(constraints, null, '    '));
        console.error("applyConstraints fail name: " + error.name + " ,constraint " + error.constraint);
    });
}
