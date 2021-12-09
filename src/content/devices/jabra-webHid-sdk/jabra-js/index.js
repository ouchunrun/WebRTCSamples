
import {
	A as AcceptIncomingCallBehavior,
	CallControlFactory,
	r as ConnectionType,
	D as DeviceId,
	s as DeviceType,
	x as EasyCallControlFactory,
	E as ErrorType,
	H as HoldState,
	J as JabraError,
	L as LogLevel,
	M as MuteState,
	R as ReportType,
	p as RequestedBrowserTransport,
	k as SignalType,
	h as StackLayer,
	q as TrackingOptions,
	T as TransportContext,
	V as ValueType,
	init,
	webHidPairing, J
} from "./index-697967ac.js";


function JabraWebHid(){
	this.EVENTS = []
}

JabraWebHid.prototype.init = async function (type){
	let This = this
	let config = {
		appId: "abra WebHid sdk",
		appName: "Jabra WebHid sdk",
		logger: "",   // error、warning、info
		partnerKey: "",
		transport: "web-hid",
	}

	const jabra = await init(config)
	if (!jabra) {
		console.error("The Jabra SDK failed to initialize. See error above for more details.")
		return;
	}

	let ccFactory = null
	switch (type){
		case 'CallControl':
			ccFactory = This.initCallControlFactory(jabra);
			break
		case 'EasyCallControl':
			ccFactory = This.initEasyCallControlFactory(jabra);
			break
		default:
			break
	}

	/**
	 * Display version numbers in log
	 */
	try {
		const sdkVersion = jabra.getVersion();
		console.log(`jabra-js version: ${sdkVersion}`);
		console.log(`Transport context: ${jabra.transportContext}`);

		const chromehostVersion = await jabra.getChromehostVersion();
		console.log(`Chromehost version: ${chromehostVersion}`);

		const chromeExtensionVersion = await jabra.getChromeExtensionVersion();
		console.log(`Chrome Extension version: ${chromeExtensionVersion}`);
	} catch (err) {
		console.error(err);
	}
}

JabraWebHid.prototype.initCallControlFactory = async function (jabra){
	let This = this
	let ccFactory = new CallControlFactory(jabra);
	/**
	 * Subscribe to device attach events
	 */
	jabra.deviceAdded.subscribe(async (device) => {
		// Skip devices that do not support call control
		if (!ccFactory.supportsCallControl(device)) {
			return;
		}

		// Convert the ISdkDevice to a ICallControlDevice
		const ccDevice = await ccFactory.createCallControl(device);
		This.trigger('deviceAdded', ccDevice)
	});

	/**
	 * Subscribe to device detach events
	 */
	await jabra.deviceRemoved.subscribe((removed) => {
		console.warn('removed device id: ', removed.id)
		This.trigger('deviceRemoved', removed)
	});

	return ccFactory
}

JabraWebHid.prototype.initEasyCallControlFactory = async function (jabra){
	let This = this
	const eccFactory = new EasyCallControlFactory(jabra);
	/**
	 * Subscribe to device attach events
	 */
	jabra.deviceAdded.subscribe(async (d) => {
		// Skip devices that do not support call control
		if (!eccFactory.supportsEasyCallControl(d)) {
			return;
		}

		// Convert the ISdkDevice to a ICallControlDevice
		const ccDevice = await eccFactory.createMultiCallControl(d);
		console.warn('ccDevice:', ccDevice)
		This.trigger('deviceAdded', ccDevice)
	});

	/**
	 * Subscribe to device detach events
	 */
	jabra.deviceRemoved.subscribe((removed) => {
		This.trigger('deviceRemoved', removed)
	});
	return eccFactory
}

JabraWebHid.prototype.webHidPairing = async function (){
	console.log('webhid-consent prepare pairing')
	await webHidPairing();
}

JabraWebHid.prototype.on = function (eventName, callback) {
	if (typeof callback === 'function') {
		this.EVENTS[eventName] = []
		this.EVENTS[eventName].push(callback)
	} else {
		throw new Error('Provided parameter is not a function')
	}
}

JabraWebHid.prototype.off = function (eventName, callback) {
	if (!(eventName && typeof eventName === 'string')) {
		this.EVENTS = {}
	} else {
		if (callback === undefined) {
			this.EVENTS[eventName] = []
			return
		}
		let arr = this.EVENTS[eventName] || []

		// unsubscribe events that is triggered always
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === callback) {
				arr.splice(i, 1)
				break
			}
		}
	}
}

JabraWebHid.prototype.trigger = function (eventName) {
	// convert the arguments into an array
	let args = Array.prototype.slice.call(arguments)
	let arr = this.EVENTS[eventName]
	args.shift() // Omit the first argument since it's the event name
	if (arr) {
		// for events subscribed forever
		for (let i = 0; i < arr.length; i++) {
			try {
				if (arr[i].apply(this, args) === false) {
					break
				}
				// 监听事件调用后不删除
				// this.EVENTS[eventName].shift()
			} catch (error) {
				throw error
			}
		}
	}
}

export {JabraWebHid};

