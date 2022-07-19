/* Log Debug Start */
let log = {}
log.debug = window.debug('sipWebRTC:DEBUG')
log.log = window.debug('sipWebRTC:LOG')
log.info = window.debug('sipWebRTC:INFO')
log.warn = window.debug('sipWebRTC:WARN')
log.error = window.debug('sipWebRTC:ERROR')
/* Log Debug End */

/**
 * 获取video input设备列表
 */
let videoInputList = []
let videoinputList = document.getElementById('videoList')
let originVideo = document.getElementById('originVideo')
let localStream
let virtualBackgroundVideo = document.getElementById('effectVideo')
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

/**
 * 获取选中的下拉列表值
 * @param targetId
 * @returns {*}
 */
function getSelectValue(targetId){
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

/**
 * 切换下拉列表选项
 * @param data
 */
function changeConfig(data){
	switch (data.type){
		case 'resolution':
			let selectRes = getSelectValue('resSelect')
			constraints.video.width = res[selectRes].width
			constraints.video.height = res[selectRes].height
			gum()
			break
		case 'device':
			let deviceId = getSelectValue('videoList')
			constraints.video.deviceId = {
				exact: deviceId
			}
			gum()
			break
		default:
			break
	}
}

window.onload = async function (){
	console.log('window onload, get local Stream')
	window.gsRTC = new GsRTC({})
	gsRTC.deviceInit()
	gum()
}

async function gum(){
	if(localStream){
		console.log('close before stream first')
		localStream.getTracks().forEach(function (track){
			track.stop()
		})
	}
	localStream = await navigator.mediaDevices.getUserMedia(constraints)
	console.log('get stream success: \r\n', JSON.stringify(constraints, null, '    '))

	originVideo.srcObject = localStream
	if(gsRTC.backgroundPreview.backgroundEffectEnabled){
		console.log('切换分辨率或摄像头时，重新设置预览')
		backgroundEffectPreview({
			type: gsRTC.backgroundPreview.virtualBackgroundOption.backgroundType,
			selectedThumbnail: gsRTC.backgroundPreview.virtualBackgroundOption.selectedThumbnail
		})
	}
}

/**
 * 关闭摄像头
 */
function videoOff(){
	if(localStream){
		console.log('close video stream')
		localStream.getTracks().forEach(function (track){
			track.stop()
		})
	}
	originVideo.srcObject = null
	virtualBackgroundVideo.srcObject = null
}

/**
 * 虚拟背景预览设置
 * @param data
 */
async function backgroundEffectPreview(data){
	console.log('backgroundEffectPreview')
	let option = {
		backgroundEffectEnabled: data.type !== 'none',
		backgroundType: data.type,
		virtualSource: null,
		selectedThumbnail: data.selectedThumbnail  // demo测试添加字段
	}
	if(data.type === 'image'){
		option.virtualSource = './images/background-' + data.selectedThumbnail + '.jpg'
	}else if(data.type === 'blur'){
		option.blurValue = data.blurValue || 25
	}

	let previewData = {
		virtualBackgroundOption: option,
		stream: localStream,
		callback: function (event){
			console.warn('preview event:', event)
		}
	}
	let previewStream = await gsRTC.virtualBackgroundPreview(previewData)
	console.log('get preview stream:', previewStream)
	if(previewStream){
		virtualBackgroundVideo.srcObject = previewStream
		gsRTC.backgroundPreview.virtualBackgroundOption = previewData.virtualBackgroundOption
	}
}
