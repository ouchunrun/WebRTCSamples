/* Log Debug Start */
let log = {}
log.debug = window.debug('webHid:DEBUG')
log.log = window.debug('webHid:LOG')
log.info = window.debug('webHid:INFO')
log.warn = window.debug('webHid:WARN')
log.error = window.debug('webHid:ERROR')
/* Log Debug End */

let webHid
let hookSwitchInput = document.getElementById('hook-switch')
let phoneMuteInput = document.getElementById('phone-mute')


let logElement = document.getElementById('logs');
function showLog(msg) {
	console.log(msg);
	let line = document.createElement('div');
	line.textContent = msg;
	logElement.appendChild(line);
}
function mousedown(target) {
	target.classList.remove('mousedown')
	target.classList.add('mouseup')
}

function mouseup(target) {
	target.classList.remove('mouseup')
	target.classList.add('mousedown')
}

/**************************************************按钮操作*****************************************************/
let ledIncomingCall = document.getElementById('led-incomingcall')
let ledOffHook = document.getElementById('led-off-hook')
let incomingCallBtn = document.getElementById('btnIncomingCall')
let ledMute = document.getElementById('led-mute')

function Answer() {
	if (!webHid.device || !webHid.device.opened) {
		showLog('Connect first!');
		return;
	}
	ledOffHook.checked = true;
	ledIncomingCall.checked = false;
	showLog('OUTPUT : off-hook-led on');
	webHid.sendDeviceReport({ command: 'offHook' })
	incomingCallBtn.disabled = true;
	hookSwitchInput.checked = true
}

function Hangup() {
	if (!webHid.device || !webHid.device.opened) {
		showLog('Connect first!');
		return;
	}
	ledOffHook.checked = false;
	ledIncomingCall.checked = false;
	webHid.sendDeviceReport({ command: 'onHook' })
	incomingCallBtn.disabled = false;
	hookSwitchInput.checked = false
}

function MuteOn() {
	if (!webHid.device || !webHid.device.opened) {
		showLog('Connect first!');
		return;
	}
	ledMute.checked = true;
	webHid.sendDeviceReport({ command: 'muteOn' })
	phoneMuteInput.checked = true
}

function MuteOff() {
	if (!webHid.device || !webHid.device.opened) {
		showLog('Connect first!');
		return;
	}
	ledMute.checked = false;
	webHid.sendDeviceReport({ command: 'muteOff' })
	phoneMuteInput.checked = false
}

/**
 * 亮灯闪烁提示来电，这个功能怎么测出来的？？ 厂家提供的信息
 */
function IncomingCall() {
	if (!webHid.device || !webHid.device.opened) {
		showLog('Connect first!');
		return;
	}
	ledIncomingCall.checked = true

	webHid.sendDeviceReport({ command: 'incomingCall' })
}

function buttonsEnabled(id){
	let target = document.getElementById(id)
	let outputButtons = target.getElementsByTagName('button')
	if (outputButtons && outputButtons.length) {
		for (let i = 0; i < outputButtons.length; i++) {
			let btn = outputButtons[i]
			btn.disabled = false
			btn.classList.remove('button-disabled')
		}
	}
}

async function requestDevice(target){
	 await webHid.requestHidDevices()
	if(!webHid.availableDevices || !webHid.availableDevices.length){
		alert('no hid device found.')
		return
	}

	let device = webHid.availableDevices[0]
	showLog('Connected to device: ' + device.productName);
	await webHid.open({label: device.productName})
	showLog('Connected to device: ' + webHid.device.productName);

	buttonsEnabled('output')
	target.disabled = true
	target.classList.add('button-disabled')

	console.log('Restore the default state of hook and mic LED')
	webHid.resetState()
}

function inputReportRetFunc(data){
	console.info('handle input report: \r\n' + JSON.stringify(data, null, '    '))
	switch (data.eventName){
		case 'ondevicehookswitch':
			if(data.hookStatus === 'on'){
				console.log('挂机')
				hookSwitchInput.checked = false
				ledOffHook.checked = false
				incomingCallBtn.disabled = false
			}else {
				console.log('摘机')
				hookSwitchInput.checked = true
				ledOffHook.checked = true
				incomingCallBtn.disabled = true
				webHid.sendDeviceReport({ command: 'offHook' })
			}
			break
		case 'ondevicemuteswitch':
			if(data.isMute){
				console.log('Mic mute')
			}else {
				console.log('Mic unmute')
			}
			phoneMuteInput.checked = data.isMute
			ledMute.checked = data.isMute
			break
		case 'ondevicevolumechange':
			if(data.volumeStatus === 'up'){
				console.log('音量+')
			}else {
				console.log('音量-')
			}
			break
		default:
			break
	}

	deviceStatusPrint(data)
}

/**
 * 设备 Input 事件
 * @param event
 */
function deviceStatusPrint(event){
	let action = ''
	console.warn("event.deviceStatus:", event.deviceStatus)
	switch (event.deviceStatus){
		case 1:
			action = 'on-hook'
			break
		case 2:
			action = 'mute on-hook'
			break
		case 3:
			action = 'off-hook'
			break
		case 4:
			action = 'mute off-hook'
			break
		case 5:
			action = 'on-hook mute'
			break
		case 6:
			action = 'on-hook unmute'
			break
		case 7:
			action = 'off-hook mute'
			break
		case 8:
			action = 'off-hook unmute'
			break
		case 9:
			action = 'on-hook volume-up'
			break
		case 10:
			action = 'on-hook volume-down'
			break
		case 11:
			action = 'off-hook volume-up'
			break
		case 12:
			action = 'off-hook mute volume-up'
			break
		case 13:
			action = 'off-hook volume-down'
			break
		case 14:
			action = 'off-hook mute volume-down'
			break
		default:
			break
	}

	showLog('INPUT ' + event.reportId + ': ' + action + ' >>>' + event.hexData)
}

window.onload = async function (){
	console.log('windows onload...')
	webHid = new WebHID({
		callback: inputReportRetFunc.bind(this)
	})
}

