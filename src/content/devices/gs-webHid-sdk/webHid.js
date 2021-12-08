/*
 * only support:
 * 1.GUV 3000 {productId: 35, vendorId: 11179}
 * 2.GUV 3005 {productId: 36,vendorId: 11179}
 */

if (!('hid' in navigator)) {
	log.warn('WebHID is not available yet.')
}

function WebHID(props){
	this.hidSupport = !(!window.navigator.hid || !window.navigator.hid.requestDevice)
	this.requestParams = (props && props.deviceFilter) || {
		filters: [
			{productId: 0x22, vendorId: 0x2BAB},
			{productId: 0x23, vendorId: 0x2BAB},
			{productId: 0x24, vendorId: 0x2BAB}
		]
	}
	this.EVENTS = []
	this.device = null
	this.pairedDevices = []    // has previously granted the website access to.
	this.availableDevices = []
	this.inputReportRetFunc = props && props.callback
	log.info('hid device load')
	this.load()
}

WebHID.prototype.load = async function(){
	await this.getPairedDevices()
	if(window.ipcRenderer){
		log.info('request hid devices')
		await this.requestHidDevices()
	}
}

WebHID.prototype.deviceCommand = {
	0x2BAB: {
		outputReport: {
			offHook: {reportId: 0x02, reportData: 0x01},           // 触发Hook LED灯亮------Answer call
			onHook: {reportId: 0x02, reportData: 0x00},            // 触发Hook LED灯灭------Hang up
			muteOn: {reportId: 0x03, reportData: 0x01},            // 触发Mute LED灯亮------Mute on
			muteOff: {reportId: 0x03, reportData: 0x00},           // 触发Mute LED灯灭------Mute off
			incomingCall: {reportId: 0x04, reportData: 0x01},      // 触发Hook LED闪烁------Incoming call
		},
		inputReport: {
			offHook: {reportId: 0x01, reportData: 0x14},            // 摘机
			onHook: {reportId: 0x01, reportData: 0x00},             // 挂机
			onHookMicChange: {reportId: 0x01, reportData: 0x08},    // 在待机时 MIC开启/关闭
			offHookMicChange: {reportId: 0x01, reportData: 0x1c},   // 在通话时 MIC开启/关闭
			onHookVolumeUp: {reportId: 0x05, reportData: 0x01},     // 在待机时 音量+
			onHookVolumeDown: {reportId: 0x05, reportData: 0x02},   // 在待机时 音量-
			offHookVolumeUp: {reportId: 0x05, reportData: 0x15},    // 在通话时 音量+
			offHookVolumeDown: {reportId: 0x05, reportData: 0x16},  // 在通话时 音量-
		}
	}
}

WebHID.prototype.deviceStatus = {
	onHook: 0x01,
	muteOnHook: 0x02,
	offHook: 0x03,
	muteOffHook: 0x04,
	onHookMute: 0x05,
	onHookUnmute: 0x06,
	offHookMute: 0x07,
	offHookUnmute: 0x08,
	onHookVolumeUp: 0x09,
	onHookVolumeDown: 0x0a,
	offHookVolumeUp: 0x0b,
	offHookMuteVolumeUp: 0x0c,
	offHookVolumeDown: 0x0d,
	offHookMuteVolumeDown: 0x0e,
}

/**
 *  Get all devices the user has previously granted the website access to.
 * @returns {Promise<*>}
 */
WebHID.prototype.getPairedDevices = async function (){
	try{
		let devices = await navigator.hid.getDevices()
		devices.forEach(device => {
			log.log(`paired device HID: ${device.productName}`)
		})
		this.pairedDevices = devices
		return devices
	}catch (e){
		log.error(e)
	}
}

WebHID.prototype.requestHidDevices = async function (){
	if (!this.hidSupport) {
		log.warn('The WebHID API is NOT supported!')
		return false
	}
	if(this.device && this.device.opened){
		this.close()
	}

	log.info('device request params: ' + JSON.stringify(this.requestParams, null, '    '))
	let devices = await navigator.hid.requestDevice(this.requestParams)
	if (!devices || !devices.length) {
		log.warn('No HID devices selected.')
		return false
	}
	devices.forEach(device => {
		log.info(`request device HID: ${device.productName}`)
	})
	this.availableDevices = devices
	// await this.getPairedDevices()
	return true
}

/**
 * 获取十六进制字节
 * @param data
 * @returns {string}
 */
WebHID.prototype.getHexByte = function (data){
	let hex = Number(data).toString(16)
	while (hex.length < 2)
		hex = '0' + hex
	return hex
}

/**
 * data 转换为十六进制字节的字符串
 * @param data
 * @returns {string}
 */
WebHID.prototype.getHexByteStr = function (data){
	let string = ''
	for (let i = 0; i < data.byteLength; ++i){
		string += this.getHexByte(data.getUint8(i)) + ' '
	}
	return string
}

WebHID.prototype.open = async function (data){
	try {
		if (!data) {
			log.warn('invalid parameter of device')
			return
		}
		if(window.ipcRenderer){
			// todo: Need to request the device list again after the device is unplugged
			await this.requestHidDevices()
		}
		if(!this.availableDevices || !this.availableDevices.length){
			log.info('No HID device to request')
			return
		}

		if(data.containerId){
			this.device = this.availableDevices.find(device =>{return device.containerId === data.containerId})
			log.info('found device by containerId: ' + data.containerId)
		}else if(data.label){
			this.device = this.availableDevices.find(device =>{return data.label.includes(device.productName)})
			log.info('found device by device label: ' + data.label)
		}
		if(!this.device){
			log.warn('no hid device found for ' + data.label)
		}

		log.info('set current GUV device: ' + this.device.productName)
		await this.device.open()
		//  listen for input reports by registering an oninputreport event listener
		this.device.oninputreport = this.handleInputReport.bind(this)

		// reset device status
		this.resetState()

		// Synchronize the status of the current call line
		if(data.hookStatus === 'off'){
			log.info('Synchronous off-hook status')
			this.sendDeviceReport({ command: 'offHook' })
		}
		if(data.muted === true){
			log.info('Synchronous mute status')
			this.sendDeviceReport({ command: 'muteOn' })
		}
	}catch (e){
		log.error(e)
	}
}

WebHID.prototype.close = async function (){
	try{
		this.resetState()
		if(this.availableDevices){
			log.info('clear available devices list')
			this.availableDevices = []
		}

		if(!this.device){
			return
		}
		log.info('hid device close')
		if (this.device && this.device.opened) {
			log.info('device is open, now close.')
			await this.device.close()
		}
		this.device.oninputreport = null
		this.device = null
	}catch (e){
		log.error(e)
	}
}

WebHID.prototype.resetState = function(){
	if(!this.device || !this.device.opened){
		return
	}
	log.info('state reset.')
	this.sendDeviceReport({command: 'onHook'})
	this.sendDeviceReport({command: 'muteOff'})
}

/**
 * host 向耳机发送指令
 * @param data.command
 */
WebHID.prototype.sendDeviceReport = function (data){
	if(!data || !data.command || !this.device || !this.device.opened){
		return
	}

	let vendorId = this.device.vendorId
	if(this.deviceCommand[vendorId] && this.deviceCommand[vendorId].outputReport && this.deviceCommand[vendorId].outputReport[data.command]){
		let command = this.deviceCommand[this.device.vendorId].outputReport[data.command]
		this.device.sendReport(command.reportId, new Uint8Array([command.reportData]));
	}
	/*
		问题:主机向耳机设备发送命令是inputreport事件触发说明：
			onHook -> onHook         不触发
			offHook -> offHook       不触发
			incomingCall -> onHook   不触发
			incomingCall -> offHook  触发了inputreport事件
			offHook -> onHook        触发了inputreport事件
			onHook  -> offHook       触发了inputreport事件
		Solution:主机向耳机设备发送命令后，需要同步device的muted、hookStatus状态，即可避免inputreport触发导致的误处理事件
	 */
	switch (data.command){
		case 'muteOn':
			this.device.muted = true
			break
		case 'muteOff':
			this.device.muted = false
			break
		case 'onHook':
			this.device.hookStatus = 'on'
			break
		case 'offHook':
			this.device.hookStatus = 'off'
			break
		default:
			break
	}
	log.info('device command ' + data.command + ', muted ' + this.device.muted)
}

WebHID.prototype.handleInputReport = function (event){
	try {
		let This = this
		const {data, device, reportId} = event
		let reportData = data.getUint8(0)
		let vendorId = This.device.vendorId
		log.info('inputReport event reportId ' + reportId + ', reportData ' + reportData)

		let inputReport = This.deviceCommand[vendorId].inputReport
		let eventName = ''
		let deviceStatus = ''
		let volumeStatus = ''
		let hookStatusChange = false
		let muteStatusChange = false
		let volumeStatusChange = false
		if(reportId === 0x01){
			switch (reportData) {
				case inputReport.onHook.reportData:
					if (This.device.hookStatus === 'off') {
						deviceStatus = This.device.muted ? This.deviceStatus.muteOnHook : This.deviceStatus.onHook
						This.device.hookStatus = 'on'
						eventName = 'ondevicehookswitch'
						hookStatusChange = true
					}
					break
				case inputReport.offHook.reportData:
					if (This.device.hookStatus === 'on') {
						deviceStatus = This.device.muted ? This.deviceStatus.muteOffHook : This.deviceStatus.offHook
						This.device.hookStatus = 'off'
						eventName = 'ondevicehookswitch'
						hookStatusChange = true
					}
					break
				case inputReport.onHookMicChange.reportData:
					deviceStatus = This.device.muted ? This.deviceStatus.onHookUnmute : This.deviceStatus.onHookMute
					This.device.muted = !This.device.muted
					eventName = 'ondevicemuteswitch'
					muteStatusChange = true
					break
				case inputReport.offHookMicChange.reportData:
					deviceStatus = This.device.muted ? This.deviceStatus.offHookUnmute : This.deviceStatus.offHookMute
					This.device.muted = !This.device.muted
					eventName = 'ondevicemuteswitch'
					muteStatusChange = true
					break
				default:
					break
			}
		}else if(reportId === 0x05){
			switch (reportData) {
				case inputReport.onHookVolumeUp.reportData:
					deviceStatus = This.deviceStatus.onHookVolumeUp
					volumeStatus = 'up'
					eventName = 'ondevicevolumechange'
					volumeStatusChange = true
					break
				case inputReport.offHookVolumeUp.reportData:
					deviceStatus = This.device.muted ? This.deviceStatus.offHookMuteVolumeUp : This.deviceStatus.offHookVolumeUp
					volumeStatus = 'up'
					eventName = 'ondevicevolumechange'
					volumeStatusChange = true
					break
				case inputReport.onHookVolumeDown.reportData:
					deviceStatus = This.deviceStatus.onHookVolumeDown
					volumeStatus = 'down'
					eventName = 'ondevicevolumechange'
					volumeStatusChange = true
					break
				case inputReport.offHookVolumeDown.reportData:
					deviceStatus = This.device.muted ? This.deviceStatus.offHookMuteVolumeDown : This.deviceStatus.offHookVolumeDown
					volumeStatus = 'down'
					eventName = 'ondevicevolumechange'
					volumeStatusChange = true
					break
				default:
					break
			}
		}

		// 操作静音和音量按键会同时触发Hook事件
		if (!deviceStatus) {
			log.info('Ignore event triggered when the host sends a command!')
			log.log('device muted ' + This.device.muted + ', hookStatus ' + This.device.hookStatus)
			return
		}

		let inputReportData = {
			eventName: eventName,
			productName: device.productName,
			reportId: This.getHexByte(reportId),
			reportData: reportData,
		}
		if(hookStatusChange){          // 接听键状态变化
			inputReportData.hookStatusChange = hookStatusChange
			inputReportData.hookStatus = This.device.hookStatus
			log.info('hook status change: ' + inputReportData.hookStatus)
		}else if(muteStatusChange){    // 静音键状态变化
			inputReportData.muteStatusChange = muteStatusChange
			inputReportData.isMute = This.device.muted
			log.info('mute status change: ' + inputReportData.isMute)
		}else if(volumeStatusChange){  // 音量键操作
			inputReportData.volumeStatusChange = volumeStatusChange
			inputReportData.volumeStatus = volumeStatus
			log.info('volume status change: ' + inputReportData.volumeStatus)
		}

		This.inputReportRetFunc && This.inputReportRetFunc(inputReportData)
	}catch (e){
		log.error(e)
	}
}
