let audio = document.getElementById('audio')
let volume = document.getElementById('volume')
try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioContext = new AudioContext();
} catch (e) {
    alert('Web Audio API not supported.');
}

/**
 * 麦克风音量检测
 * @type stream
 */
function beginDetect(stream) {
    if(!audioContext){
        alert('Web Audio API not supported.');
        return
    }

    let mediaStreamSource = null;
    let scriptProcessor = null;
    // 将麦克风的声音输入这个对象
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    // 创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    // 将该分析对象与麦克风音频进行连接
    mediaStreamSource.connect(scriptProcessor);
    // 此举无甚效果，仅仅是因为解决 Chrome 自身的 bug
    scriptProcessor.connect(audioContext.destination);
    // 开始处理音频
    scriptProcessor.onaudioprocess = (e) => {
        // 获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
        const buffer = e.inputBuffer.getChannelData(0);
        // 获取缓冲区中最大的音量值
        const maxVal = Math.max(...buffer);
        // 显示音量值
        volume.innerText = Math.round(maxVal * 100);
    };
}

/**
 * 设置音量（取值0~1）
 * @param add
 */
function setVolume(add){
    let vol = audio.volume
    if(add){
        // 音量小于1时，每次增加0.1.直到为1
        vol = vol<1 ? (vol*10 +1)/10 : 1;
    }else {
        // 音量大于0时，每次减少0.1，直到为0
        vol = vol>0? (vol*10 -1)/10 : 0;
    }
    console.info("setVolume to", vol)
    audio.volume = vol
}

if(!navigator.getUserMedia){
    alert("您的浏览器不支持获取音频")
}else {
    var constraints =  { audio: true, video: false }
    if ('getUserMedia' in window.navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream){
            audio.srcObject = stream
            beginDetect(stream);
        }).catch(function (error){
            console.error(error)
        });
    } else {
        navigator.getUserMedia(constraints, function (stream){
            audio.srcObject = stream
            beginDetect(stream);
        }, function (error){
            console.error(error)
        })
    }
}



