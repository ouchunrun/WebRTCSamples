import {
	o as e,
	O as t,
	n as s,
	m as i,
	c as o,
	t as r,
	a as n,
	b as a,
	d as u,
	S as c,
	W as d,
	_ as h,
	e as p,
	f as l,
	I as g,
	J as v,
	E as R,
	u as f,
	g as w,
	l as b,
	h as I,
	L as U,
	i as E,
	j as k
} from "./index-697967ac.js";

function m(a, u) {
	return u ? function (i) {
		return o(u.pipe(r(1), e((function (e, i) {
			e.subscribe(new t(i, s))
		}))), i.pipe(m(a)))
	} : n((function (e, t) {
		return a(e, t).pipe(r(1), function (e) {
			return i((function () {
				return e
			}))
		}(e))
	}))
}

function y(e, t) {
	void 0 === t && (t = u);
	var s = a(e, t);
	return m((function () {
		return s
	}))
}

class L {
	static rawUsageFrom(e, t) {
		return (e << 16 | t) >>> 0
	}

	static usagePageFromRaw(e) {
		return e >>> 16
	}

	static usageFromRaw(e) {
		return e << 16 >>> 16
	}
}

class D {
	constructor(e) {
		this.devices = new Map, this.deviceInputSubscriptions = new Map, this.onHidInput = new c, this.onGetFeatureReportResponse = new c;
		const t = new c;
		this.deviceAdded = t;
		const s = new c;
		this.deviceRemoved = s, e.deviceAdded.subscribe((e => {
			if (!this.devices.has(e.id)) {
				this.devices.set(e.id, e);
				const s = e.inputHandler.inputReports.pipe(i((t => new d(e.id, L.usagePageFromRaw(t.usage), L.usageFromRaw(t.usage), t.value)))).subscribe((e => this.onHidInput.next(e)));
				this.deviceInputSubscriptions.set(e.id, s), t.next(e)
			}
		})), e.deviceRemoved.subscribe((e => {
			var t;
			const i = this.devices.get(e);
			i && (this.devices.delete(e), null === (t = this.deviceInputSubscriptions.get(e)) || void 0 === t || t.unsubscribe(), this.deviceInputSubscriptions.delete(e), s.next(i))
		}))
	}

	sendOutputUsage(e, t, s, i) {
		var o;
		const r = L.rawUsageFrom(t, s);
		null === (o = this.devices.get(e)) || void 0 === o || o.outputHandler.sendOutputUsage(r, i)
	}

	setFeatureUsage(e, t, s, i) {
		var o;
		const r = L.rawUsageFrom(t, s);
		null === (o = this.devices.get(e)) || void 0 === o || o.featureHandler.setFeatureUsage(r, i)
	}

	getFeatureUsage(e, t, s, i) {
		var o;
		return h(this, void 0, void 0, (function* () {
			const r = L.rawUsageFrom(s, i),
				n = yield null === (o = this.devices.get(e)) || void 0 === o ? void 0 : o.featureHandler.getFeatureUsage(r);
			void 0 !== n && this.onGetFeatureReportResponse.next(new p(t, n))
		}))
	}
}

class F {
	constructor(e, t) {
		this.device = e, this.inputReportDescriptors = t;
		const s = new Map;
		this.inputReportDescriptors.forEach((e => {
			e.usages.forEach(((e, t) => {
				s.set(t, [0])
			}))
		}));
		const i = new c;
		this.inputReports = i, this.device.oninputreport = e => {
			if (e.currentTarget !== this.device) return;
			const t = this.inputReportDescriptors.get(e.reportId);
			if (!t) return;
			const o = new l.BitView(e.data.buffer);
			o.bigEndian = !1;
			Array.from(t.usages.entries(), F.makeWebHidInputReport.bind(this, o)).filter((e => F.compareReportToCachedValue(e, s))).forEach((e => {
				s.set(e.usage, e.value), i.next(e)
			}))
		}
	}

	static makeWebHidInputReport(e, [t, s]) {
		let i = s.offset, o = s.size, r = [];
		for (; o > 0;) r.push(e.getBits(i, Math.min(o, 8))), i += 8, o -= 8;
		return r = s.onInput(r), new g.UsageReport(t, r)
	}

	static compareReportToCachedValue(e, t) {
		const s = t.get(e.usage);
		if (!s) return !0;
		if (s.length !== e.value.length) return !0;
		return s.some(((t, s) => e.value[s] !== t))
	}
}

class C {
	constructor(e) {
		this.report = e
	}

	reportSizeInBits() {
		return this.report.fullReportSize
	}

	reportSizeInBytes() {
		return Math.ceil(this.reportSizeInBits() / 8)
	}

	createBitViewIfNeeded() {
		if (!this.bitView) {
			const e = this.reportSizeInBytes(), t = new ArrayBuffer(e);
			this.bitView = new l.BitView(t), this.bitView.bigEndian = !1
		}
		return this.bitView
	}

	getUsageInformationOrThrow(e) {
		if (!this.report.usages.has(e)) throw new v(`Unable to write usage (0x${e.toString(16).padStart(8, "0")}). It is not known by the device.`, R.UNEXPECTED_ERROR);
		return this.report.usages.get(e)
	}

	writeUsage(e, t) {
		const s = this.getUsageInformationOrThrow(e);
		let i = this.createBitViewIfNeeded();
		if (!s.absolute) {
			const e = function (e) {
				const t = new ArrayBuffer(e.byteLength);
				return new Uint8Array(t).set(new Uint8Array(e)), t
			}(i.buffer);
			i = new l.BitView(e)
		}
		let o = s.offset, r = s.size;
		return t.forEach((e => {
			i.setBits(o, e, r), o += 8, r -= 8
		})), i.buffer
	}
}

class O {
	constructor(e, t, s) {
		this.device = e, this.outputReports = t, this.outputUsages = s, this.outputCacheByReportId = new Map
	}

	getReportIdForUsage(e) {
		if (!this.outputUsages.has(e)) throw new v(`Unknown usagePage: 0x${e.toString(16).padStart(8, "0")}.`, R.UNEXPECTED_ERROR);
		return this.outputUsages.get(e)
	}

	getReportLayoutForReportId(e) {
		if (!this.outputReports.has(e)) throw new v(`Unknown reportId: ${e}.`, R.UNEXPECTED_ERROR);
		return this.outputReports.get(e)
	}

	getUsageInReportForUsage(e) {
		const t = this.getReportIdForUsage(e), s = this.getReportLayoutForReportId(t);
		if (!s.usages.has(e)) throw new v(`Unknown rawUsage inside ReportLayout: ${e}.`, R.UNEXPECTED_ERROR);
		return s.usages.get(e)
	}

	getOrCreateCacheForReportId(e) {
		if (!this.outputCacheByReportId.has(e)) {
			const t = this.getReportLayoutForReportId(e), s = new C(t);
			this.outputCacheByReportId.set(e, s)
		}
		return this.outputCacheByReportId.get(e)
	}

	sendOutputUsage(e, t) {
		return h(this, void 0, void 0, (function* () {
			const s = this.getReportIdForUsage(e), i = this.getOrCreateCacheForReportId(s),
				o = this.getUsageInReportForUsage(e).onOutput(t), r = i.writeUsage(e, o);
			yield this.device.sendReport(s, r)
		}))
	}
}

class S {
	constructor(e = new Map, t = 0) {
		this.usages = e, this.fullReportSize = t
	}
}

class M {
	constructor(e, t, s) {
		this.offset = e, this.size = t, this.absolute = s
	}

	onInput(e) {
		return e
	}

	onOutput(e) {
		return e
	}
}

class P {
	constructor(e, t, s, i) {
		this.offset = e, this.size = t, this.absolute = s, this.rangeIndex = i
	}

	onInput(e) {
		if (e.length > 1) throw new v(`Usages of type ${P.name} should not hold more than 1 byte of information.`, R.UNEXPECTED_ERROR);
		return e[0] === this.rangeIndex ? [1] : [0]
	}

	onOutput(e) {
		if (e.length > 1) throw new v(`Usages of type ${P.name} should not hold more than 1 byte of information.`, R.UNEXPECTED_ERROR);
		return e[0] > 0 ? [this.rangeIndex] : e
	}
}

class A {
	constructor(e) {
		const t = new Map;
		this.buildReportLayouts(e.collections, "input", t), this.inputReports = t, this.inputUsages = A.buildUsageMap(t);
		const s = new Map;
		this.buildReportLayouts(e.collections, "output", s), this.outputReports = s, this.outputUsages = A.buildUsageMap(s);
		const i = new Map;
		this.buildReportLayouts(e.collections, "feature", i), this.featureReports = i, this.featureUsages = A.buildUsageMap(i)
	}

	static buildUsageMap(e) {
		const t = new Map;
		return e.forEach(((e, s) => {
			e.usages.forEach(((e, i) => {
				t.set(i, s)
			}))
		})), t
	}

	buildReportLayouts(e, t, s) {
		e.forEach((e => {
			var i;
			null === (i = A.reportsOfType(e, t)) || void 0 === i || i.forEach((e => {
				var t;
				const i = e.reportId;
				s.has(i) || s.set(i, new S);
				const o = s.get(i);
				let r = 0;
				null === (t = e.items) || void 0 === t || t.forEach((e => {
					let t = e.usages;
					if (e.isRange) {
						t = [];
						for (let s = e.usageMinimum; s <= e.usageMaximum; s += 1) t.push(s)
					}
					let s, i = r;
					if (e.isRange && e.isArray && (s = 1), t.length > 0) {
						if (t.filter((e => o.usages.has(e))).length === t.length) return
					}
					t.forEach((t => {
						let r;
						r = s ? new P(i, e.reportSize, e.isAbsolute, s) : new M(i, e.reportSize, e.isAbsolute), o.usages.set(t, r), s ? s += 1 : i += e.reportSize
					}));
					const n = e.reportCount * e.reportSize;
					o.fullReportSize += n, r += n
				}))
			})), e.children && this.buildReportLayouts(e.children, t, s)
		}))
	}

	static reportsOfType(e, t) {
		if ("input" === t) return e.inputReports;
		if ("output" === t) return e.outputReports;
		if ("feature" === t) return e.featureReports;
		throw new v(`Unexpected report type: ${t}!`, R.UNEXPECTED_ERROR)
	}
}

class N {
	constructor(e, t, s) {
		this.device = e, this.featureReports = t, this.featureUsages = s, this.outputCacheByReportId = new Map
	}

	getReportIdForUsage(e) {
		if (!this.featureUsages.has(e)) throw new v(`Unknown usagePage: 0x${e.toString(16).padStart(8, "0")}.`, R.UNEXPECTED_ERROR);
		return this.featureUsages.get(e)
	}

	getReportLayoutForReportId(e) {
		if (!this.featureReports.has(e)) throw new v(`Unknown reportId: ${e}.`, R.UNEXPECTED_ERROR);
		return this.featureReports.get(e)
	}

	getUsageInReportForUsage(e) {
		const t = this.getReportIdForUsage(e), s = this.getReportLayoutForReportId(t);
		if (!s.usages.has(e)) throw new v(`Unknown rawUsage inside ReportLayout: ${e}.`, R.UNEXPECTED_ERROR);
		return s.usages.get(e)
	}

	getOrCreateCacheForReportId(e) {
		if (!this.outputCacheByReportId.has(e)) {
			const t = this.getReportLayoutForReportId(e), s = new C(t);
			this.outputCacheByReportId.set(e, s)
		}
		return this.outputCacheByReportId.get(e)
	}

	getFeatureUsage(e) {
		return h(this, void 0, void 0, (function* () {
			const t = this.getReportIdForUsage(e), s = yield this.device.receiveFeatureReport(t),
				i = this.getUsageInReportForUsage(e), o = [];
			for (let e = 1; e <= Math.ceil(i.size / 8); e += 1) o.push(s.getUint8(e));
			return o
		}))
	}

	setFeatureUsage(e, t) {
		return h(this, void 0, void 0, (function* () {
			const s = this.getReportIdForUsage(e), i = this.getOrCreateCacheForReportId(s),
				o = this.getUsageInReportForUsage(e).onOutput(t), r = i.writeUsage(e, o);
			yield this.device.sendFeatureReport(s, r)
		}))
	}
}

class T {
	constructor(e, t, s, i) {
		this.name = e, this.vid = t, this.pid = s, this.id = i.sessionId;
		const o = new A(i);
		this.inputReports = o.inputReports, this.outputReports = o.outputReports, this.featureReports = o.featureReports, this.inputHandler = new F(i, o.inputReports), this.outputHandler = new O(i, o.outputReports, o.outputUsages), this.featureHandler = new N(i, o.featureReports, o.featureUsages)
	}
}

class x {
	constructor(e, t) {
		this.hid = e, this.broadcastChannel = t, this.deviceAddedSubject = new c, this.deviceAdded = this.deviceAddedSubject, this.deviceRemovedSubject = new c, this.deviceRemoved = this.deviceRemovedSubject
	}

	setupListeners() {
		this.hid.onconnect = e => this.onConnect(e), this.hid.ondisconnect = e => this.onDisconnect(e), this.broadcastChannel.onmessage = () => this.getPairedDevices()
	}

	addNewDevice(e) {
		return h(this, void 0, void 0, (function* () {
			if (x.hasGeneratedDeviceId(e)) return;
			x.getOrGenerateDeviceId(e);
			const t = new T(e.productName, e.vendorId, e.productId, e);
			e.opened || (yield e.open()), this.deviceAddedSubject.next(t)
		}))
	}

	onConnect(e) {
		return h(this, void 0, void 0, (function* () {
			setTimeout((() => h(this, void 0, void 0, (function* () {
				yield this.addNewDevice(e.device)
			}))), 1e3)
		}))
	}

	onDisconnect(e) {
		const t = x.getOrGenerateDeviceId(e.device);
		this.deviceRemovedSubject.next(t)
	}

	getPairedDevices() {
		return h(this, void 0, void 0, (function* () {
			(yield this.hid.getDevices()).forEach((e => h(this, void 0, void 0, (function* () {
				yield this.addNewDevice(e)
			}))))
		}))
	}

	static hasGeneratedDeviceId(e) {
		return void 0 !== e.sessionId
	}

	static getOrGenerateDeviceId(e) {
		if (!x.hasGeneratedDeviceId(e)) {
			const t = new f(4).toString();
			return e.sessionId = t, t
		}
		return e.sessionId
	}
}

class B {
	constructor(e, t, s, i, o) {
		this.usagePage = e, this.usage = t, this.valueType = s, this.reportType = i, this.reportSize = o
	}
}

class H {
	constructor(e) {
		this.deviceManagement = e, this.events = new c, this.setupDeviceHandler()
	}

	setupDeviceHandler() {
		this.deviceManagement.deviceAdded.subscribe((e => {
			this.events.next({
				event: "attach",
				id: e.id,
				vid: e.vid,
				pid: e.pid,
				name: e.name,
				serialNumber: e.id,
				descriptor: H.generateDescriptors(e)
			})
		})), this.deviceManagement.deviceRemoved.subscribe((e => {
			this.events.next({event: "detach", id: e.id})
		})), this.deviceManagement.onHidInput.subscribe((e => {
			const t = 1 === e.value.length ? e.value[0] : e.value;
			this.events.next({event: "hid-input", id: e.deviceId, usagePage: e.usagePage, usage: e.usage, value: t})
		})), this.deviceManagement.onGetFeatureReportResponse.subscribe((e => {
			const t = 1 === e.value.length ? e.value[0] : e.value;
			this.events.next({event: "response-hid-feature", token: e.token, value: t})
		}))
	}

	static generateDescriptors(e) {
		let t = H.convertReportLayoutsToDescriptors(e.inputReports, "input");
		return t = t.concat(H.convertReportLayoutsToDescriptors(e.outputReports, "output")), t = t.concat(H.convertReportLayoutsToDescriptors(e.featureReports, "feature")), t
	}

	static convertReportLayoutsToDescriptors(e, t) {
		const s = [];
		return e.forEach((e => {
			e.usages.forEach(((e, i) => {
				const o = L.usagePageFromRaw(i);
				65280 === o && "output" === t || s.push(new B(o, L.usageFromRaw(i), e.absolute ? "absolute" : "relative", t, Math.ceil(e.size / 8)))
			}))
		})), s
	}
}

class z {
	constructor(e, t, s) {
		this.deviceManagement = e, this.callLockManagement = t, this.logger = s, this.gnpLockAcquired = new c, this.callLockAcquired = new c, this.softphoneInFocus = new c, this.events = w(this.gnpLockAcquired.pipe(y(0)), this.callLockAcquired.pipe(y(0)), this.softphoneInFocus)
	}

	onNewSdkInput(e) {
		if (!e.action) throw new v("Provided input has no action property.", R.UNEXPECTED_ERROR);
		switch (e.action) {
			case"hid-output": {
				const t = Array.isArray(e.value) ? e.value : [e.value];
				this.deviceManagement.sendOutputUsage(e.id, e.usagePage, e.usage, t);
				break
			}
			case"request-hid-feature":
				this.deviceManagement.getFeatureUsage(e.id, e.token, e.usagePage, e.usage);
				break;
			case"set-hid-feature": {
				const t = Array.isArray(e.value) ? e.value : [e.value];
				this.deviceManagement.setFeatureUsage(e.id, e.usagePage, e.usage, t);
				break
			}
			case"request-gnp-lock":
				this.gnpLockAcquired.next({
					event: "response-gnp-lock",
					token: e.token
				}), b("GNP lock requested with WebHID backend. This should not happen!", this.logger, U.ERROR, I.NATIVE_CONSOLE);
				break;
			case"release-gnp-lock":
				break;
			case"request-call-lock":
				this.callLockManagement.tryAcquireCallLock(e.id).then((t => {
					this.callLockAcquired.next({event: "response-call-lock", id: e.id, acquired: t})
				}));
				break;
			case"release-call-lock":
				this.callLockManagement.releaseCallLock(e.id);
				break;
			case"set-softphone-info":
				this.softphoneInFocus.next({
					event: "softphone-in-focus",
					infocus: !1
				}), this.softphoneInFocus.complete();
				break;
			default:
				throw new v(`Provided action is not recognized - ${e.action}.`, R.UNEXPECTED_ERROR)
		}
	}
}

class _ {
	constructor(e, t, s) {
		this.navigatorLocks = e, this.logger = s, this.releaseGlobalLock = null, this.localLockedDevices = new Set, t.deviceRemoved.subscribe((e => {
			this.localLockedDevices.has(e.id) && this.releaseCallLock(e.id)
		}))
	}

	tryAcquireCallLock(e) {
		return h(this, void 0, void 0, (function* () {
			return !(yield this.checkWebLocksSupport()) || (this.localLockedDevices.size > 0 && !this.localLockedDevices.has(e) ? (this.localLockedDevices.add(e), !0) : new Promise((t => {
				this.navigatorLocks.request("jabra-call-lock", {ifAvailable: !0}, (s => s ? (this.localLockedDevices.add(e), t(!0), new Promise((e => {
					this.releaseGlobalLock = e
				}))) : (t(!1), Promise.resolve())))
			})))
		}))
	}

	releaseCallLock(e) {
		this.localLockedDevices.delete(e), this.releaseGlobalLock && 0 === this.localLockedDevices.size && this.releaseGlobalLock()
	}

	checkWebLocksSupport() {
		return h(this, void 0, void 0, (function* () {
			const e = yield this.navigatorLocks.query().catch((() => {
				b("WebLocks unsupported. The cross-tab call lock is disabled.", this.logger, U.WARNING)
			}));
			return Boolean(e)
		}))
	}
}

class G {
	constructor(e, t, s, i) {
		this.scanner = e, this.deviceEventHandler = t, this.sdkInputEventHandler = s, this.logger = i, this.readyEvent = new c, this.events = new E, this.events = w(this.readyEvent, this.deviceEventHandler.events, this.sdkInputEventHandler.events)
	}

	start() {
		this.readyEvent.next({
			event: "ready",
			version: null,
			jabraDirectInstalled: !1
		}), this.readyEvent.complete(), this.scanner.getPairedDevices(), this.scanner.setupListeners()
	}

	sendMessage(e) {
		var t;
		null === (t = this.sdkInputEventHandler) || void 0 === t || t.onNewSdkInput(e)
	}
}

function q(e) {
	if ("undefined" == typeof window) throw new v("WebHID is not supported outside of a browser environment.", R.INIT_ERROR);
	if (void 0 === window.navigator || void 0 === window.navigator.hid) throw new v("WebHID is not supported on this platform/browser.", R.INIT_ERROR);
	if (void 0 === window.navigator.locks) throw new v("WebLocks is not supported on this platform/browser.", R.INIT_ERROR);
	const t = window.navigator.hid, s = window.navigator.locks, i = new BroadcastChannel(k.PAIRING_CHANNEL),
		o = new x(t, i), r = new D(o), n = new H(r), a = new z(r, new _(s, r, e));
	return new G(o, n, a, e)
}

export {q as initHandler};
