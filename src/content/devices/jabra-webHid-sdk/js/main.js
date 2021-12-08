
import {
	JabraWebHid
} from "../jabra-js/index.js";

/**
 * Initial state
 */
const state = {
	callControlDevices: [],
	callControl: null,
	signalSubscription: null,
};
let jabraWebHidSdk

window.onload = function (){
	jabraWebHidSdk = new JabraWebHid()
	jabraWebHidSdk.on('deviceAdded', function (newCallControl){
		if(!newCallControl){
			console.warn("No device connected");
			return
		}

		state.callControlDevices.push(newCallControl);
		state.callControl = newCallControl
		// Unsubscribe from button clicks from the "old" device
		state.signalSubscription?.unsubscribe();
		// Subscribe to button clicks from the "new" device
		subscribeToDeviceSignals()
		updateUiWithDeviceInfo(newCallControl.device)
	})


	jabraWebHidSdk.on('deviceRemoved', function (removedDevice){
		const index = state.callControlDevices.findIndex((d) =>
			d.device.id.equals(removedDevice.id)
		);

		if (index > -1) {
			state.callControlDevices.splice(index, 1);
		} else {
			console.warn(`Device removed event was not processed, as the removed device (${removedDevice.name}) does not support easy call control.`)
		}
	})
}

/**
 * 页面显示action 操作日志
 * @type {HTMLElement}
 */
let actionLogsWrapper = document.getElementById("action-logs")
function logAction(message) {
	const newElem = document.createElement('span');
	newElem.setAttribute('class','scroll-area');
	newElem.innerText = message.toString()
	actionLogsWrapper.appendChild(newElem);
}

document.getElementById('logClear').onclick = function (){
	console.log('clear log')
	actionLogsWrapper.innerText = ''
}

/**
 * 页面显示设备状态日志
 * @type {HTMLElement}
 */
let signalLogsWrapper = document.getElementById("signal-logs")
function subscribeToDeviceSignals() {
	state.signalSubscription = state.callControl.deviceSignals.subscribe((s) => {
		const newElem = document.createElement('span');
		newElem.setAttribute('class','scroll-area');
		newElem.innerText = s.toString()
		signalLogsWrapper.appendChild(newElem);
	});
}

document.getElementById('signalsClear').onclick = function (){
	console.log('clear signals')
	signalLogsWrapper.innerText = ''
}

/**
 * 页面显示设备名和设备id
 * @param device
 */
function updateUiWithDeviceInfo(device) {
	document.getElementById("device-name").innerText = `${device.name}`;
	document.getElementById('productId').innerText = `ProductId: ${device.productId}`
	document.getElementById('vendorId').innerText = `VendorId: ${device.vendorId}`
	document.getElementById("device-id").innerText = `Device ID: ${device.id}`;
}

// Listen for button clicks and call Jabra SDK commands
document.querySelectorAll("#actions button").forEach((button) => {
	button.onclick = async (event) => {
		try {
			const buttonIds = [
				"sdkInit",
				"pairing",
				"take-call-lock",
				"release-call-lock",
				"start-ringer",
				"stop-ringer",
				"start-call",
				"stop-call",
				"mute",
				"unmute",
				"hold-call",
				"resume-call",
			];
			const [
				sdkInit,
				devicePairing,
				takeCallLock,
				releaseCallLock,
				startRinger,
				stopRinger,
				startCall,
				stopCall,
				mute,
				unmute,
				holdCall,
				resumeCall,
			] = buttonIds;

			switch (event.currentTarget.id) {
				case sdkInit:
					console.log('jabra sdk init')
					logAction('jabra sdk init')
					await jabraWebHidSdk.init()
					break
				case devicePairing:
					console.log('get device pairing')
					logAction('Device pairing')
					await jabraWebHidSdk.webHidPairing()
					break
				case takeCallLock:
					console.log("Take call lock");
					logAction('Take call lock')
					const gotLock = await state.callControl.takeCallLock();

					if (gotLock) {
						console.log("Got the lock success");
						console.log('Got the lock success')
					} else {
						console.error("Unable to get the lock");
						console.log('Unable to get the lock')
					}
					break;
				case releaseCallLock:
					console.log("Release callLock");
					state.callControl.releaseCallLock();
					logAction('Release callLock')
					break;
				case startRinger:
					console.log("Start ringer");
					state.callControl.ring(true);
					logAction('Start ringer')
					break;
				case stopRinger:
					console.log("Stop ringer");
					state.callControl.ring(false);
					logAction('Stop ringer')
					break;
				case startCall:
					console.log("Start call");
					state.callControl.offHook(true);
					logAction('Start call')
					break;
				case stopCall:
					console.log("Stop call");
					state.callControl.offHook(false);
					logAction('Stop call')
					break;
				case mute:
					console.log("Mute");
					state.callControl.mute(true);
					logAction('Mute')
					break;
				case unmute:
					console.log("Unmute");
					state.callControl.mute(false);
					logAction('Unmute')
					break;
				case holdCall:
					console.log("Hold");
					state.callControl.hold(true);
					logAction('Hold')
					break;
				case resumeCall:
					console.log("Resume call");
					state.callControl.hold(false);
					logAction('Resume call')
					break;
			}
		} catch (err) {
			console.error(err);
		}
	};
});

