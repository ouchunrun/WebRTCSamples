/**
 * 获取video input设备列表
 */
let videoInputList = []
let videoinputList = document.getElementById('videoList')
document.onreadystatechange = function () {
	if (document.readyState === "complete") {
		navigator.mediaDevices.enumerateDevices().then(function (deviceInfos){
			let videoinputLists = []
			for (let i = 0; i < deviceInfos.length; i++){
				let deviceInfo = deviceInfos[i]
				if (deviceInfo.kind === 'videoinput') {
					videoinputLists.push({
						label: deviceInfo.label,
						deviceId: deviceInfo.deviceId,
						groupId: deviceInfo.groupId,
					})
				}
			}

			if (videoinputLists.length) {
				for (let j = 0; j < videoinputLists.length; j++) {
					if (!videoinputLists[j].label) {
						videoinputLists[j].label = 'camera' + j
					}
					videoInputList.push('<option class="cameraOption" value="' + videoinputLists[j].deviceId + '">' + videoinputLists[j].label + '</option>')
					console.log('camera: ' + videoinputLists[j].label)
				}
			}
			videoinputList.innerHTML = videoInputList.join('')

		}).catch(function (error){
			console.error(error)
		});
	}
}

function getSelectVaule(targetId){
	let value
	let videoInputList = document.getElementById(targetId)
	let selectedIndex = videoInputList.options.selectedIndex
	let selectedOption = videoInputList.options[selectedIndex]
	if(selectedOption && selectedOption.value){
		console.log('selected ' + targetId + ' value: ', selectedOption.value)
		value = selectedOption.value
	}

	return value
}

let backgroundEffect
let backgroundPreview
window.onload = async function (){
	console.log('window onload, get local Stream')
	backgroundEffect = await new StreamBackgroundEffect()
	backgroundPreview = await new StreamBackgroundEffect()
	gum()
}

let previewVideo = document.getElementById('previewVideo')
let localStream
let effectVideo = document.getElementById('effectVideo')
let effectStream
let virtualBackgroundOption = {
	backgroundEffectEnabled: false,
	backgroundType: undefined,
	blurValue: undefined,
	virtualSource: undefined,
}

let res = {
	360: {width: 640, height: 360},
	720: {width: 1280, height: 720},
	1080: {width: 1920, height: 1080},
}
let constraints = {
	audio: false,
	video: {
		width: 640,
		height: 360
	}
}

async function gum(){
	localStream = await navigator.mediaDevices.getUserMedia(constraints)
	console.log('get stream success: \r\n', JSON.stringify(constraints, null, '    '))

	if(virtualBackgroundOption && virtualBackgroundOption.backgroundEffectEnabled){
		virtualBackgroundPreview({stream: localStream})
	}else {
		previewVideo.srcObject = localStream
	}
}

function changeConfig(data){
	switch (data.type){
		case 'resolution':
			let selectRes = getSelectVaule('resSelect')
			constraints.video.width = res[selectRes].width
			constraints.video.height = res[selectRes].height
			gum()
			break
		case 'device':
			let deviceId = getSelectVaule('videoList')
			constraints.video.deviceId = {
				exact: deviceId
			}
			gum()
			break
		default:
			break
	}
}

function setBackgroundEffect(data){
	let option = {
		backgroundType: data.type,
		backgroundEffectEnabled: data.type !== 'none',
		blurValue: data.type === 'blur' ? 25 : '',
		virtualSource: null
	}
	if(data.type === 'image'){
		option.virtualSource = './images/background-' + data.selectedThumbnail + '.jpg'
	}

	virtualBackgroundOption = option
	console.warn('setBackgroundEffect: \r\n', JSON.stringify(virtualBackgroundOption, null, '    '))
	virtualBackgroundPreview({stream: localStream})
}

async function virtualBackgroundPreview(data){
	if(!data.stream ){
		console.warn('virtual background preview: invalid parameters')
		return
	}

	backgroundPreview.setVirtualBackground(virtualBackgroundOption)
	let stream = await backgroundPreview.startEffect(data.stream)
	console.info('preview stream id: ' + stream.id)
	previewVideo.srcObject = stream
}

async function applyVirtualBackground(){
	backgroundEffect.setVirtualBackground(virtualBackgroundOption)
	effectStream = await backgroundEffect.startEffect(localStream)
	effectVideo.srcObject = effectStream
	console.warn('applyVirtualBackground option: \r\n', JSON.stringify(virtualBackgroundOption, null, '    '))
}
