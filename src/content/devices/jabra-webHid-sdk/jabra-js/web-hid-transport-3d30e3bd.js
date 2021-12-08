import {S as e, T as t, J as s, E as i, l as r, L as n} from "./index-697967ac.js";

class o {
	constructor(s, i, r) {
		this.webHidHandler = s, this.logger = i, this.recorder = r, this.events = new e, this.consoleAppEvent = this.events, this.webHidConnected = !1, this.context = t.WEB_HID
	}

	connect() {
		return this.webHidConnected ? Promise.reject(new s("Already connected", i.UNEXPECTED_ERROR)) : (this.webHidHandler.events.subscribe((e => {
			var t;
			let s = e;
			this.recorder && (s = null === (t = this.recorder) || void 0 === t ? void 0 : t.recordInput(s)), this.events.next(s)
		})), this.webHidHandler.start(), this.webHidConnected = !0, Promise.resolve())
	}

	writeAction(e) {
		var t;
		if (!this.webHidConnected) {
			const e = "WebHID is uninitialized.";
			throw r(e, this.logger, n.ERROR), new s(e, i.INIT_ERROR)
		}
		null === (t = this.recorder) || void 0 === t || t.recordOutput(e), this.webHidHandler.sendMessage(e)
	}
}

export {o as WebHidTransport};
