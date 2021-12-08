/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function t(t, e, n, r) {
	return new (n || (n = Promise))((function (i, o) {
		function s(t) {
			try {
				c(r.next(t))
			} catch (t) {
				o(t)
			}
		}

		function a(t) {
			try {
				c(r.throw(t))
			} catch (t) {
				o(t)
			}
		}

		function c(t) {
			var e;
			t.done ? i(t.value) : (e = t.value, e instanceof n ? e : new n((function (t) {
				t(e)
			}))).then(s, a)
		}

		c((r = r.apply(t, e || [])).next())
	}))
}

function e(t, e, n, r) {
	if ("a" === n && !r) throw new TypeError("Private accessor was defined without a getter");
	if ("function" == typeof e ? t !== e || !r : !e.has(t)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	return "m" === n ? r : "a" === n ? r.call(t) : r ? r.value : e.get(t)
}

function n(t, e, n, r, i) {
	if ("m" === r) throw new TypeError("Private method is not writable");
	if ("a" === r && !i) throw new TypeError("Private accessor was defined without a setter");
	if ("function" == typeof e ? t !== e || !i : !e.has(t)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	return "a" === r ? i.call(t, n) : i ? i.value = n : e.set(t, n), n
	/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
}

var r = function (t, e) {
	return (r = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (t, e) {
		t.__proto__ = e
	} || function (t, e) {
		for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n])
	})(t, e)
};

function i(t, e) {
	if ("function" != typeof e && null !== e) throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");

	function n() {
		this.constructor = t
	}

	r(t, e), t.prototype = null === e ? Object.create(e) : (n.prototype = e.prototype, new n)
}

function o(t, e, n, r) {
	return new (n || (n = Promise))((function (i, o) {
		function s(t) {
			try {
				c(r.next(t))
			} catch (t) {
				o(t)
			}
		}

		function a(t) {
			try {
				c(r.throw(t))
			} catch (t) {
				o(t)
			}
		}

		function c(t) {
			var e;
			t.done ? i(t.value) : (e = t.value, e instanceof n ? e : new n((function (t) {
				t(e)
			}))).then(s, a)
		}

		c((r = r.apply(t, e || [])).next())
	}))
}

function s(t, e) {
	var n, r, i, o, s = {
		label: 0, sent: function () {
			if (1 & i[0]) throw i[1];
			return i[1]
		}, trys: [], ops: []
	};
	return o = {
		next: a(0),
		throw: a(1),
		return: a(2)
	}, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
		return this
	}), o;

	function a(o) {
		return function (a) {
			return function (o) {
				if (n) throw new TypeError("Generator is already executing.");
				for (; s;) try {
					if (n = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
					switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
						case 0:
						case 1:
							i = o;
							break;
						case 4:
							return s.label++, {value: o[1], done: !1};
						case 5:
							s.label++, r = o[1], o = [0];
							continue;
						case 7:
							o = s.ops.pop(), s.trys.pop();
							continue;
						default:
							if (!(i = s.trys, (i = i.length > 0 && i[i.length - 1]) || 6 !== o[0] && 2 !== o[0])) {
								s = 0;
								continue
							}
							if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
								s.label = o[1];
								break
							}
							if (6 === o[0] && s.label < i[1]) {
								s.label = i[1], i = o;
								break
							}
							if (i && s.label < i[2]) {
								s.label = i[2], s.ops.push(o);
								break
							}
							i[2] && s.ops.pop(), s.trys.pop();
							continue
					}
					o = e.call(t, s)
				} catch (t) {
					o = [6, t], r = 0
				} finally {
					n = i = 0
				}
				if (5 & o[0]) throw o[1];
				return {value: o[0] ? o[1] : void 0, done: !0}
			}([o, a])
		}
	}
}

function a(t) {
	var e = "function" == typeof Symbol && Symbol.iterator, n = e && t[e], r = 0;
	if (n) return n.call(t);
	if (t && "number" == typeof t.length) return {
		next: function () {
			return t && r >= t.length && (t = void 0), {value: t && t[r++], done: !t}
		}
	};
	throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.")
}

function c(t, e) {
	var n = "function" == typeof Symbol && t[Symbol.iterator];
	if (!n) return t;
	var r, i, o = n.call(t), s = [];
	try {
		for (; (void 0 === e || e-- > 0) && !(r = o.next()).done;) s.push(r.value)
	} catch (t) {
		i = {error: t}
	} finally {
		try {
			r && !r.done && (n = o.return) && n.call(o)
		} finally {
			if (i) throw i.error
		}
	}
	return s
}

function u(t, e) {
	for (var n = 0, r = e.length, i = t.length; n < r; n++, i++) t[i] = e[n];
	return t
}

function l(t) {
	return this instanceof l ? (this.v = t, this) : new l(t)
}

function h(t, e, n) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var r, i = n.apply(t, e || []), o = [];
	return r = {}, s("next"), s("throw"), s("return"), r[Symbol.asyncIterator] = function () {
		return this
	}, r;

	function s(t) {
		i[t] && (r[t] = function (e) {
			return new Promise((function (n, r) {
				o.push([t, e, n, r]) > 1 || a(t, e)
			}))
		})
	}

	function a(t, e) {
		try {
			(n = i[t](e)).value instanceof l ? Promise.resolve(n.value.v).then(c, u) : h(o[0][2], n)
		} catch (t) {
			h(o[0][3], t)
		}
		var n
	}

	function c(t) {
		a("next", t)
	}

	function u(t) {
		a("throw", t)
	}

	function h(t, e) {
		t(e), o.shift(), o.length && a(o[0][0], o[0][1])
	}
}

function d(t) {
	if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	var e, n = t[Symbol.asyncIterator];
	return n ? n.call(t) : (t = a(t), e = {}, r("next"), r("throw"), r("return"), e[Symbol.asyncIterator] = function () {
		return this
	}, e);

	function r(n) {
		e[n] = t[n] && function (e) {
			return new Promise((function (r, i) {
				(function (t, e, n, r) {
					Promise.resolve(r).then((function (e) {
						t({value: e, done: n})
					}), e)
				})(r, i, (e = t[n](e)).done, e.value)
			}))
		}
	}
}

function p(t) {
	return "function" == typeof t
}

function f(t) {
	var e = t((function (t) {
		Error.call(t), t.stack = (new Error).stack
	}));
	return e.prototype = Object.create(Error.prototype), e.prototype.constructor = e, e
}

var v = f((function (t) {
	return function (e) {
		t(this), this.message = e ? e.length + " errors occurred during unsubscription:\n" + e.map((function (t, e) {
			return e + 1 + ") " + t.toString()
		})).join("\n  ") : "", this.name = "UnsubscriptionError", this.errors = e
	}
}));

function E(t, e) {
	if (t) {
		var n = t.indexOf(e);
		0 <= n && t.splice(n, 1)
	}
}

var g = function () {
	function t(t) {
		this.initialTeardown = t, this.closed = !1, this._parentage = null, this._teardowns = null
	}

	var e;
	return t.prototype.unsubscribe = function () {
		var t, e, n, r, i;
		if (!this.closed) {
			this.closed = !0;
			var o = this._parentage;
			if (o) if (this._parentage = null, Array.isArray(o)) try {
				for (var s = a(o), l = s.next(); !l.done; l = s.next()) {
					l.value.remove(this)
				}
			} catch (e) {
				t = {error: e}
			} finally {
				try {
					l && !l.done && (e = s.return) && e.call(s)
				} finally {
					if (t) throw t.error
				}
			} else o.remove(this);
			var h = this.initialTeardown;
			if (p(h)) try {
				h()
			} catch (t) {
				i = t instanceof v ? t.errors : [t]
			}
			var d = this._teardowns;
			if (d) {
				this._teardowns = null;
				try {
					for (var f = a(d), E = f.next(); !E.done; E = f.next()) {
						var g = E.value;
						try {
							m(g)
						} catch (t) {
							i = null != i ? i : [], t instanceof v ? i = u(u([], c(i)), c(t.errors)) : i.push(t)
						}
					}
				} catch (t) {
					n = {error: t}
				} finally {
					try {
						E && !E.done && (r = f.return) && r.call(f)
					} finally {
						if (n) throw n.error
					}
				}
			}
			if (i) throw new v(i)
		}
	}, t.prototype.add = function (e) {
		var n;
		if (e && e !== this) if (this.closed) m(e); else {
			if (e instanceof t) {
				if (e.closed || e._hasParent(this)) return;
				e._addParent(this)
			}
			(this._teardowns = null !== (n = this._teardowns) && void 0 !== n ? n : []).push(e)
		}
	}, t.prototype._hasParent = function (t) {
		var e = this._parentage;
		return e === t || Array.isArray(e) && e.includes(t)
	}, t.prototype._addParent = function (t) {
		var e = this._parentage;
		this._parentage = Array.isArray(e) ? (e.push(t), e) : e ? [e, t] : t
	}, t.prototype._removeParent = function (t) {
		var e = this._parentage;
		e === t ? this._parentage = null : Array.isArray(e) && E(e, t)
	}, t.prototype.remove = function (e) {
		var n = this._teardowns;
		n && E(n, e), e instanceof t && e._removeParent(this)
	}, t.EMPTY = ((e = new t).closed = !0, e), t
}(), _ = g.EMPTY;

function b(t) {
	return t instanceof g || t && "closed" in t && p(t.remove) && p(t.add) && p(t.unsubscribe)
}

function m(t) {
	p(t) ? t() : t.unsubscribe()
}

var y = {
	onUnhandledError: null,
	onStoppedNotification: null,
	Promise: void 0,
	useDeprecatedSynchronousErrorHandling: !1,
	useDeprecatedNextContext: !1
}, w = function () {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	return setTimeout.apply(void 0, u([], c(t)))
};

function O(t) {
	w((function () {
		throw t
	}))
}

function N() {
}

var C = function (t) {
	function e(e) {
		var n = t.call(this) || this;
		return n.isStopped = !1, e ? (n.destination = e, b(e) && e.add(n)) : n.destination = I, n
	}

	return i(e, t), e.create = function (t, e, n) {
		return new T(t, e, n)
	}, e.prototype.next = function (t) {
		this.isStopped || this._next(t)
	}, e.prototype.error = function (t) {
		this.isStopped || (this.isStopped = !0, this._error(t))
	}, e.prototype.complete = function () {
		this.isStopped || (this.isStopped = !0, this._complete())
	}, e.prototype.unsubscribe = function () {
		this.closed || (this.isStopped = !0, t.prototype.unsubscribe.call(this), this.destination = null)
	}, e.prototype._next = function (t) {
		this.destination.next(t)
	}, e.prototype._error = function (t) {
		try {
			this.destination.error(t)
		} finally {
			this.unsubscribe()
		}
	}, e.prototype._complete = function () {
		try {
			this.destination.complete()
		} finally {
			this.unsubscribe()
		}
	}, e
}(g), T = function (t) {
	function e(e, n, r) {
		var i, o = t.call(this) || this;
		if (p(e)) i = e; else if (e) {
			var s;
			i = e.next, n = e.error, r = e.complete, o && y.useDeprecatedNextContext ? (s = Object.create(e)).unsubscribe = function () {
				return o.unsubscribe()
			} : s = e, i = null == i ? void 0 : i.bind(s), n = null == n ? void 0 : n.bind(s), r = null == r ? void 0 : r.bind(s)
		}
		return o.destination = {next: i ? S(i) : N, error: S(null != n ? n : A), complete: r ? S(r) : N}, o
	}

	return i(e, t), e
}(C);

function S(t, e) {
	return function () {
		for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
		try {
			t.apply(void 0, u([], c(e)))
		} catch (t) {
			O(t)
		}
	}
}

function A(t) {
	throw t
}

var I = {closed: !0, next: N, error: A, complete: N},
	R = "function" == typeof Symbol && Symbol.observable || "@@observable";

function D(t) {
	return t
}

function H(t) {
	return 0 === t.length ? D : 1 === t.length ? t[0] : function (e) {
		return t.reduce((function (t, e) {
			return e(t)
		}), e)
	}
}

var L = function () {
	function t(t) {
		t && (this._subscribe = t)
	}

	return t.prototype.lift = function (e) {
		var n = new t;
		return n.source = this, n.operator = e, n
	}, t.prototype.subscribe = function (t, e, n) {
		var r, i = (r = t) && r instanceof C || function (t) {
			return t && p(t.next) && p(t.error) && p(t.complete)
		}(r) && b(r) ? t : new T(t, e, n), o = this.operator, s = this.source;
		return i.add(o ? o.call(i, s) : s ? this._subscribe(i) : this._trySubscribe(i)), i
	}, t.prototype._deprecatedSyncErrorSubscribe = function (t) {
		var e = t;
		e._syncErrorHack_isSubscribing = !0;
		var n = this.operator;
		if (n) t.add(n.call(t, this.source)); else try {
			t.add(this._subscribe(t))
		} catch (t) {
			e.__syncError = t
		}
		for (var r = e; r;) {
			if ("__syncError" in r) try {
				throw r.__syncError
			} finally {
				t.unsubscribe()
			}
			r = r.destination
		}
		e._syncErrorHack_isSubscribing = !1
	}, t.prototype._trySubscribe = function (t) {
		try {
			return this._subscribe(t)
		} catch (e) {
			t.error(e)
		}
	}, t.prototype.forEach = function (t, e) {
		var n = this;
		return new (e = P(e))((function (e, r) {
			var i;
			i = n.subscribe((function (e) {
				try {
					t(e)
				} catch (t) {
					r(t), null == i || i.unsubscribe()
				}
			}), r, e)
		}))
	}, t.prototype._subscribe = function (t) {
		var e;
		return null === (e = this.source) || void 0 === e ? void 0 : e.subscribe(t)
	}, t.prototype[R] = function () {
		return this
	}, t.prototype.pipe = function () {
		for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
		return t.length ? H(t)(this) : this
	}, t.prototype.toPromise = function (t) {
		var e = this;
		return new (t = P(t))((function (t, n) {
			var r;
			e.subscribe((function (t) {
				return r = t
			}), (function (t) {
				return n(t)
			}), (function () {
				return t(r)
			}))
		}))
	}, t.create = function (e) {
		return new t(e)
	}, t
}();

function P(t) {
	var e;
	return null !== (e = null != t ? t : y.Promise) && void 0 !== e ? e : Promise
}

function k(t) {
	return function (e) {
		if (function (t) {
			return p(null == t ? void 0 : t.lift)
		}(e)) return e.lift((function (e) {
			try {
				return t(e, this)
			} catch (t) {
				this.error(t)
			}
		}));
		throw new TypeError("Unable to lift unknown Observable type")
	}
}

var U = function (t) {
	function e(e, n, r, i, o) {
		var s = t.call(this, e) || this;
		return s.onFinalize = o, s._next = n ? function (t) {
			try {
				n(t)
			} catch (t) {
				e.error(t)
			}
		} : t.prototype._next, s._error = i ? function (t) {
			try {
				i(t)
			} catch (t) {
				e.error(t)
			} finally {
				this.unsubscribe()
			}
		} : t.prototype._error, s._complete = r ? function () {
			try {
				r()
			} catch (t) {
				e.error(t)
			} finally {
				this.unsubscribe()
			}
		} : t.prototype._complete, s
	}

	return i(e, t), e.prototype.unsubscribe = function () {
		var e, n = this.closed;
		t.prototype.unsubscribe.call(this), !n && (null === (e = this.onFinalize) || void 0 === e || e.call(this))
	}, e
}(C), x = f((function (t) {
	return function () {
		t(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed"
	}
})), G = function (t) {
	function e() {
		var e = t.call(this) || this;
		return e.closed = !1, e.observers = [], e.isStopped = !1, e.hasError = !1, e.thrownError = null, e
	}

	return i(e, t), e.prototype.lift = function (t) {
		var e = new F(this, this);
		return e.operator = t, e
	}, e.prototype._throwIfClosed = function () {
		if (this.closed) throw new x
	}, e.prototype.next = function (t) {
		var e, n;
		if (this._throwIfClosed(), !this.isStopped) {
			var r = this.observers.slice();
			try {
				for (var i = a(r), o = i.next(); !o.done; o = i.next()) {
					o.value.next(t)
				}
			} catch (t) {
				e = {error: t}
			} finally {
				try {
					o && !o.done && (n = i.return) && n.call(i)
				} finally {
					if (e) throw e.error
				}
			}
		}
	}, e.prototype.error = function (t) {
		if (this._throwIfClosed(), !this.isStopped) {
			this.hasError = this.isStopped = !0, this.thrownError = t;
			for (var e = this.observers; e.length;) e.shift().error(t)
		}
	}, e.prototype.complete = function () {
		if (this._throwIfClosed(), !this.isStopped) {
			this.isStopped = !0;
			for (var t = this.observers; t.length;) t.shift().complete()
		}
	}, e.prototype.unsubscribe = function () {
		this.isStopped = this.closed = !0, this.observers = null
	}, Object.defineProperty(e.prototype, "observed", {
		get: function () {
			var t;
			return (null === (t = this.observers) || void 0 === t ? void 0 : t.length) > 0
		}, enumerable: !1, configurable: !0
	}), e.prototype._trySubscribe = function (e) {
		return this._throwIfClosed(), t.prototype._trySubscribe.call(this, e)
	}, e.prototype._subscribe = function (t) {
		return this._throwIfClosed(), this._checkFinalizedStatuses(t), this._innerSubscribe(t)
	}, e.prototype._innerSubscribe = function (t) {
		var e = this, n = e.hasError, r = e.isStopped, i = e.observers;
		return n || r ? _ : (i.push(t), new g((function () {
			return E(i, t)
		})))
	}, e.prototype._checkFinalizedStatuses = function (t) {
		var e = this, n = e.hasError, r = e.thrownError, i = e.isStopped;
		n ? t.error(r) : i && t.complete()
	}, e.prototype.asObservable = function () {
		var t = new L;
		return t.source = this, t
	}, e.create = function (t, e) {
		return new F(t, e)
	}, e
}(L), F = function (t) {
	function e(e, n) {
		var r = t.call(this) || this;
		return r.destination = e, r.source = n, r
	}

	return i(e, t), e.prototype.next = function (t) {
		var e, n;
		null === (n = null === (e = this.destination) || void 0 === e ? void 0 : e.next) || void 0 === n || n.call(e, t)
	}, e.prototype.error = function (t) {
		var e, n;
		null === (n = null === (e = this.destination) || void 0 === e ? void 0 : e.error) || void 0 === n || n.call(e, t)
	}, e.prototype.complete = function () {
		var t, e;
		null === (e = null === (t = this.destination) || void 0 === t ? void 0 : t.complete) || void 0 === e || e.call(t)
	}, e.prototype._subscribe = function (t) {
		var e, n;
		return null !== (n = null === (e = this.source) || void 0 === e ? void 0 : e.subscribe(t)) && void 0 !== n ? n : _
	}, e
}(G), M = function (t) {
	function e(e) {
		var n = t.call(this) || this;
		return n._value = e, n
	}

	return i(e, t), Object.defineProperty(e.prototype, "value", {
		get: function () {
			return this.getValue()
		}, enumerable: !1, configurable: !0
	}), e.prototype._subscribe = function (e) {
		var n = t.prototype._subscribe.call(this, e);
		return !n.closed && e.next(this._value), n
	}, e.prototype.getValue = function () {
		var t = this, e = t.hasError, n = t.thrownError, r = t._value;
		if (e) throw n;
		return this._throwIfClosed(), r
	}, e.prototype.next = function (e) {
		t.prototype.next.call(this, this._value = e)
	}, e
}(G), B = {
	now: function () {
		return (B.delegate || Date).now()
	}, delegate: void 0
}, W = function (t) {
	function e(e, n, r) {
		void 0 === e && (e = 1 / 0), void 0 === n && (n = 1 / 0), void 0 === r && (r = B);
		var i = t.call(this) || this;
		return i._bufferSize = e, i._windowTime = n, i._timestampProvider = r, i._buffer = [], i._infiniteTimeWindow = !0, i._infiniteTimeWindow = n === 1 / 0, i._bufferSize = Math.max(1, e), i._windowTime = Math.max(1, n), i
	}

	return i(e, t), e.prototype.next = function (e) {
		var n = this, r = n.isStopped, i = n._buffer, o = n._infiniteTimeWindow, s = n._timestampProvider,
			a = n._windowTime;
		r || (i.push(e), !o && i.push(s.now() + a)), this._trimBuffer(), t.prototype.next.call(this, e)
	}, e.prototype._subscribe = function (t) {
		this._throwIfClosed(), this._trimBuffer();
		for (var e = this._innerSubscribe(t), n = this._infiniteTimeWindow, r = this._buffer.slice(), i = 0; i < r.length && !t.closed; i += n ? 1 : 2) t.next(r[i]);
		return this._checkFinalizedStatuses(t), e
	}, e.prototype._trimBuffer = function () {
		var t = this, e = t._bufferSize, n = t._timestampProvider, r = t._buffer, i = t._infiniteTimeWindow,
			o = (i ? 1 : 2) * e;
		if (e < 1 / 0 && o < r.length && r.splice(0, r.length - o), !i) {
			for (var s = n.now(), a = 0, c = 1; c < r.length && r[c] <= s; c += 2) a = c;
			a && r.splice(0, a + 1)
		}
	}, e
}(G), K = function (t) {
	function e(e, n) {
		return t.call(this) || this
	}

	return i(e, t), e.prototype.schedule = function (t, e) {
		return this
	}, e
}(g), V = function () {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	return setInterval.apply(void 0, u([], c(t)))
}, Y = function (t) {
	return clearInterval(t)
}, j = function (t) {
	function e(e, n) {
		var r = t.call(this, e, n) || this;
		return r.scheduler = e, r.work = n, r.pending = !1, r
	}

	return i(e, t), e.prototype.schedule = function (t, e) {
		if (void 0 === e && (e = 0), this.closed) return this;
		this.state = t;
		var n = this.id, r = this.scheduler;
		return null != n && (this.id = this.recycleAsyncId(r, n, e)), this.pending = !0, this.delay = e, this.id = this.id || this.requestAsyncId(r, this.id, e), this
	}, e.prototype.requestAsyncId = function (t, e, n) {
		return void 0 === n && (n = 0), V(t.flush.bind(t, this), n)
	}, e.prototype.recycleAsyncId = function (t, e, n) {
		if (void 0 === n && (n = 0), null != n && this.delay === n && !1 === this.pending) return e;
		Y(e)
	}, e.prototype.execute = function (t, e) {
		if (this.closed) return new Error("executing a cancelled action");
		this.pending = !1;
		var n = this._execute(t, e);
		if (n) return n;
		!1 === this.pending && null != this.id && (this.id = this.recycleAsyncId(this.scheduler, this.id, null))
	}, e.prototype._execute = function (t, e) {
		var n, r = !1;
		try {
			this.work(t)
		} catch (t) {
			r = !0, n = !!t && t || new Error(t)
		}
		if (r) return this.unsubscribe(), n
	}, e.prototype.unsubscribe = function () {
		if (!this.closed) {
			var e = this.id, n = this.scheduler, r = n.actions;
			this.work = this.state = this.scheduler = null, this.pending = !1, E(r, this), null != e && (this.id = this.recycleAsyncId(n, e, null)), this.delay = null, t.prototype.unsubscribe.call(this)
		}
	}, e
}(K), $ = function () {
	function t(e, n) {
		void 0 === n && (n = t.now), this.schedulerActionCtor = e, this.now = n
	}

	return t.prototype.schedule = function (t, e, n) {
		return void 0 === e && (e = 0), new this.schedulerActionCtor(this, t).schedule(n, e)
	}, t.now = B.now, t
}(), q = new (function (t) {
	function e(e, n) {
		void 0 === n && (n = $.now);
		var r = t.call(this, e, n) || this;
		return r.actions = [], r._active = !1, r._scheduled = void 0, r
	}

	return i(e, t), e.prototype.flush = function (t) {
		var e = this.actions;
		if (this._active) e.push(t); else {
			var n;
			this._active = !0;
			do {
				if (n = t.execute(t.state, t.delay)) break
			} while (t = e.shift());
			if (this._active = !1, n) {
				for (; t = e.shift();) t.unsubscribe();
				throw n
			}
		}
	}, e
}($))(j), z = q, J = new L((function (t) {
	return t.complete()
}));

function X(t, e) {
	return new L((function (n) {
		var r = 0;
		return e.schedule((function () {
			r === t.length ? n.complete() : (n.next(t[r++]), n.closed || this.schedule())
		}))
	}))
}

var Q = function (t) {
	return t && "number" == typeof t.length && "function" != typeof t
};

function Z(t) {
	return p(null == t ? void 0 : t.then)
}

var tt = "function" == typeof Symbol && Symbol.iterator ? Symbol.iterator : "@@iterator";

function et(t, e, n, r) {
	void 0 === r && (r = 0);
	var i = e.schedule((function () {
		try {
			n.call(this)
		} catch (e) {
			t.error(e)
		}
	}), r);
	return t.add(i), i
}

function nt(t, e) {
	if (!t) throw new Error("Iterable cannot be null");
	return new L((function (n) {
		var r = new g;
		return r.add(e.schedule((function () {
			var i = t[Symbol.asyncIterator]();
			r.add(e.schedule((function () {
				var t = this;
				i.next().then((function (e) {
					e.done ? n.complete() : (n.next(e.value), t.schedule())
				}))
			})))
		}))), r
	}))
}

function rt(t) {
	return p(t[R])
}

function it(t) {
	return p(null == t ? void 0 : t[tt])
}

function ot(t) {
	return Symbol.asyncIterator && p(null == t ? void 0 : t[Symbol.asyncIterator])
}

function st(t) {
	return new TypeError("You provided " + (null !== t && "object" == typeof t ? "an invalid object" : "'" + t + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.")
}

function at(t) {
	return h(this, arguments, (function () {
		var e, n, r;
		return s(this, (function (i) {
			switch (i.label) {
				case 0:
					e = t.getReader(), i.label = 1;
				case 1:
					i.trys.push([1, , 9, 10]), i.label = 2;
				case 2:
					return [4, l(e.read())];
				case 3:
					return n = i.sent(), r = n.value, n.done ? [4, l(void 0)] : [3, 5];
				case 4:
					return [2, i.sent()];
				case 5:
					return [4, l(r)];
				case 6:
					return [4, i.sent()];
				case 7:
					return i.sent(), [3, 2];
				case 8:
					return [3, 10];
				case 9:
					return e.releaseLock(), [7];
				case 10:
					return [2]
			}
		}))
	}))
}

function ct(t) {
	return p(null == t ? void 0 : t.getReader)
}

function ut(t, e) {
	if (null != t) {
		if (rt(t)) return function (t, e) {
			return new L((function (n) {
				var r = new g;
				return r.add(e.schedule((function () {
					var i = t[R]();
					r.add(i.subscribe({
						next: function (t) {
							r.add(e.schedule((function () {
								return n.next(t)
							})))
						}, error: function (t) {
							r.add(e.schedule((function () {
								return n.error(t)
							})))
						}, complete: function () {
							r.add(e.schedule((function () {
								return n.complete()
							})))
						}
					}))
				}))), r
			}))
		}(t, e);
		if (Q(t)) return X(t, e);
		if (Z(t)) return function (t, e) {
			return new L((function (n) {
				return e.schedule((function () {
					return t.then((function (t) {
						n.add(e.schedule((function () {
							n.next(t), n.add(e.schedule((function () {
								return n.complete()
							})))
						})))
					}), (function (t) {
						n.add(e.schedule((function () {
							return n.error(t)
						})))
					}))
				}))
			}))
		}(t, e);
		if (ot(t)) return nt(t, e);
		if (it(t)) return function (t, e) {
			return new L((function (n) {
				var r;
				return n.add(e.schedule((function () {
					r = t[tt](), et(n, e, (function () {
						var t = r.next(), e = t.value;
						t.done ? n.complete() : (n.next(e), this.schedule())
					}))
				}))), function () {
					return p(null == r ? void 0 : r.return) && r.return()
				}
			}))
		}(t, e);
		if (ct(t)) return function (t, e) {
			return nt(at(t), e)
		}(t, e)
	}
	throw st(t)
}

function lt(t, e) {
	return e ? ut(t, e) : ht(t)
}

function ht(t) {
	if (t instanceof L) return t;
	if (null != t) {
		if (rt(t)) return r = t, new L((function (t) {
			var e = r[R]();
			if (p(e.subscribe)) return e.subscribe(t);
			throw new TypeError("Provided object does not correctly implement Symbol.observable")
		}));
		if (Q(t)) return dt(t);
		if (Z(t)) return n = t, new L((function (t) {
			n.then((function (e) {
				t.closed || (t.next(e), t.complete())
			}), (function (e) {
				return t.error(e)
			})).then(null, O)
		}));
		if (ot(t)) return pt(t);
		if (it(t)) return e = t, new L((function (t) {
			var n, r;
			try {
				for (var i = a(e), o = i.next(); !o.done; o = i.next()) {
					var s = o.value;
					if (t.next(s), t.closed) return
				}
			} catch (t) {
				n = {error: t}
			} finally {
				try {
					o && !o.done && (r = i.return) && r.call(i)
				} finally {
					if (n) throw n.error
				}
			}
			t.complete()
		}));
		if (ct(t)) return pt(at(t))
	}
	var e, n, r;
	throw st(t)
}

function dt(t) {
	return new L((function (e) {
		for (var n = 0; n < t.length && !e.closed; n++) e.next(t[n]);
		e.complete()
	}))
}

function pt(t) {
	return new L((function (e) {
		(function (t, e) {
			var n, r, i, a;
			return o(this, void 0, void 0, (function () {
				var o, c;
				return s(this, (function (s) {
					switch (s.label) {
						case 0:
							s.trys.push([0, 5, 6, 11]), n = d(t), s.label = 1;
						case 1:
							return [4, n.next()];
						case 2:
							if ((r = s.sent()).done) return [3, 4];
							if (o = r.value, e.next(o), e.closed) return [2];
							s.label = 3;
						case 3:
							return [3, 1];
						case 4:
							return [3, 11];
						case 5:
							return c = s.sent(), i = {error: c}, [3, 11];
						case 6:
							return s.trys.push([6, , 9, 10]), r && !r.done && (a = n.return) ? [4, a.call(n)] : [3, 8];
						case 7:
							s.sent(), s.label = 8;
						case 8:
							return [3, 10];
						case 9:
							if (i) throw i.error;
							return [7];
						case 10:
							return [7];
						case 11:
							return e.complete(), [2]
					}
				}))
			}))
		})(t, e).catch((function (t) {
			return e.error(t)
		}))
	}))
}

function ft(t, e) {
	return e ? X(t, e) : dt(t)
}

function vt(t) {
	return t && p(t.schedule)
}

function Et(t) {
	return t[t.length - 1]
}

function gt(t) {
	return p(Et(t)) ? t.pop() : void 0
}

function _t(t) {
	return vt(Et(t)) ? t.pop() : void 0
}

function bt(t, e) {
	return "number" == typeof Et(t) ? t.pop() : e
}

function mt() {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	var n = _t(t);
	return n ? X(t, n) : ft(t)
}

function yt(t, e) {
	var n = p(t) ? t : function () {
		return t
	}, r = function (t) {
		return t.error(n())
	};
	return new L(e ? function (t) {
		return e.schedule(r, 0, t)
	} : r)
}

var wt = f((function (t) {
	return function () {
		t(this), this.name = "EmptyError", this.message = "no elements in sequence"
	}
}));

function Ot(t, e) {
	var n = "object" == typeof e;
	return new Promise((function (r, i) {
		var o = new T({
			next: function (t) {
				r(t), o.unsubscribe()
			}, error: i, complete: function () {
				n ? r(e.defaultValue) : i(new wt)
			}
		});
		t.subscribe(o)
	}))
}

function Nt(t) {
	return t instanceof Date && !isNaN(t)
}

var Ct = f((function (t) {
	return function (e) {
		void 0 === e && (e = null), t(this), this.message = "Timeout has occurred", this.name = "TimeoutError", this.info = e
	}
}));

function Tt(t, e) {
	var n = Nt(t) ? {first: t} : "number" == typeof t ? {each: t} : t, r = n.first, i = n.each, o = n.with,
		s = void 0 === o ? St : o, a = n.scheduler, c = void 0 === a ? null != e ? e : q : a, u = n.meta,
		l = void 0 === u ? null : u;
	if (null == r && null == i) throw new TypeError("No timeout provided.");
	return k((function (t, e) {
		var n, o, a = null, u = 0, h = function (t) {
			o = et(e, c, (function () {
				n.unsubscribe(), ht(s({meta: l, lastValue: a, seen: u})).subscribe(e)
			}), t)
		};
		n = t.subscribe(new U(e, (function (t) {
			null == o || o.unsubscribe(), u++, e.next(a = t), i > 0 && h(i)
		}), void 0, void 0, (function () {
			(null == o ? void 0 : o.closed) || null == o || o.unsubscribe(), a = null
		}))), h(null != r ? "number" == typeof r ? r : +r - c.now() : i)
	}))
}

function St(t) {
	throw new Ct(t)
}

function At(t, e) {
	return k((function (n, r) {
		var i = 0;
		n.subscribe(new U(r, (function (n) {
			r.next(t.call(e, n, i++))
		})))
	}))
}

function It(t, e, n) {
	return void 0 === n && (n = 1 / 0), p(e) ? It((function (n, r) {
		return At((function (t, i) {
			return e(n, t, r, i)
		}))(ht(t(n, r)))
	}), n) : ("number" == typeof e && (n = e), k((function (e, r) {
		return function (t, e, n, r, i, o, s, a) {
			var c = [], u = 0, l = 0, h = !1, d = function () {
				!h || c.length || u || e.complete()
			}, p = function (t) {
				return u < r ? f(t) : c.push(t)
			}, f = function (t) {
				o && e.next(t), u++;
				var a = !1;
				ht(n(t, l++)).subscribe(new U(e, (function (t) {
					null == i || i(t), o ? p(t) : e.next(t)
				}), (function () {
					a = !0
				}), void 0, (function () {
					if (a) try {
						u--;
						for (var t = function () {
							var t = c.shift();
							s ? e.add(s.schedule((function () {
								return f(t)
							}))) : f(t)
						}; c.length && u < r;) t();
						d()
					} catch (t) {
						e.error(t)
					}
				})))
			};
			return t.subscribe(new U(e, p, (function () {
				h = !0, d()
			}))), function () {
				null == a || a()
			}
		}(e, r, t, n)
	})))
}

function Rt(t) {
	return void 0 === t && (t = 1 / 0), It(D, t)
}

function Dt() {
	return Rt(1)
}

function Ht() {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	return Dt()(ft(t, _t(t)))
}

function Lt(t) {
	return new L((function (e) {
		ht(t()).subscribe(e)
	}))
}

function Pt(t, e, n) {
	void 0 === t && (t = 0), void 0 === n && (n = z);
	var r = -1;
	return null != e && (vt(e) ? n = e : r = e), new L((function (e) {
		var i = Nt(t) ? +t - n.now() : t;
		i < 0 && (i = 0);
		var o = 0;
		return n.schedule((function () {
			e.closed || (e.next(o++), 0 <= r ? this.schedule(void 0, r) : e.complete())
		}), i)
	}))
}

function kt() {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	var n = _t(t), r = bt(t, 1 / 0), i = t;
	return i.length ? 1 === i.length ? ht(i[0]) : Rt(r)(ft(i, n)) : J
}

var Ut, xt, Gt, Ft, Mt, Bt, Wt = new L(N), Kt = Array.isArray;

function Vt(t) {
	return 1 === t.length && Kt(t[0]) ? t[0] : t
}

function Yt(t, e) {
	return function (n, r) {
		return !t.call(e, n, r)
	}
}

function jt(t, e) {
	return k((function (n, r) {
		var i = 0;
		n.subscribe(new U(r, (function (n) {
			return t.call(e, n, i++) && r.next(n)
		})))
	}))
}

function $t() {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	return 1 === (t = Vt(t)).length ? ht(t[0]) : new L(qt(t))
}

function qt(t) {
	return function (e) {
		for (var n = [], r = function (r) {
			n.push(ht(t[r]).subscribe(new U(e, (function (t) {
				if (n) {
					for (var i = 0; i < n.length; i++) i !== r && n[i].unsubscribe();
					n = null
				}
				e.next(t)
			}))))
		}, i = 0; n && !e.closed && i < t.length; i++) r(i)
	}
}

function zt() {
	for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
	var n = gt(t), r = Vt(t);
	return r.length ? new L((function (t) {
		var e = r.map((function () {
			return []
		})), i = r.map((function () {
			return !1
		}));
		t.add((function () {
			e = i = null
		}));
		for (var o = function (o) {
			ht(r[o]).subscribe(new U(t, (function (r) {
				if (e[o].push(r), e.every((function (t) {
					return t.length
				}))) {
					var s = e.map((function (t) {
						return t.shift()
					}));
					t.next(n ? n.apply(void 0, u([], c(s))) : s), e.some((function (t, e) {
						return !t.length && i[e]
					})) && t.complete()
				}
			}), (function () {
				i[o] = !0, !e[o].length && t.complete()
			})))
		}, s = 0; !t.closed && s < r.length; s++) o(s);
		return function () {
			e = i = null
		}
	})) : J
}

function Jt(t) {
	return k((function (e, n) {
		var r, i = null, o = !1;
		i = e.subscribe(new U(n, void 0, void 0, (function (s) {
			r = ht(t(s, Jt(t)(e))), i ? (i.unsubscribe(), i = null, r.subscribe(n)) : o = !0
		}))), o && (i.unsubscribe(), i = null, r.subscribe(n))
	}))
}

function Xt(t, e) {
	return p(e) ? It(t, e, 1) : It(t, 1)
}

function Qt(t) {
	return k((function (e, n) {
		var r = !1;
		e.subscribe(new U(n, (function (t) {
			r = !0, n.next(t)
		}), (function () {
			r || n.next(t), n.complete()
		})))
	}))
}

function Zt(t) {
	return t <= 0 ? function () {
		return J
	} : k((function (e, n) {
		var r = 0;
		e.subscribe(new U(n, (function (e) {
			++r <= t && (n.next(e), t <= r && n.complete())
		})))
	}))
}

function te(t, e) {
	return void 0 === e && (e = D), t = null != t ? t : ee, k((function (n, r) {
		var i, o = !0;
		n.subscribe(new U(r, (function (n) {
			var s = e(n);
			!o && t(i, s) || (o = !1, i = s, r.next(n))
		})))
	}))
}

function ee(t, e) {
	return t === e
}

function ne(t) {
	return void 0 === t && (t = re), k((function (e, n) {
		var r = !1;
		e.subscribe(new U(n, (function (t) {
			r = !0, n.next(t)
		}), (function () {
			return r ? n.complete() : n.error(t())
		})))
	}))
}

function re() {
	return new wt
}

function ie(t, e) {
	var n = arguments.length >= 2;
	return function (r) {
		return r.pipe(t ? jt((function (e, n) {
			return t(e, n, r)
		})) : D, Zt(1), n ? Qt(e) : ne((function () {
			return new wt
		})))
	}
}

function oe(t) {
	return t <= 0 ? function () {
		return J
	} : k((function (e, n) {
		var r = [];
		e.subscribe(new U(n, (function (e) {
			r.push(e), t < r.length && r.shift()
		}), (function () {
			var t, e;
			try {
				for (var i = a(r), o = i.next(); !o.done; o = i.next()) {
					var s = o.value;
					n.next(s)
				}
			} catch (e) {
				t = {error: e}
			} finally {
				try {
					o && !o.done && (e = i.return) && e.call(i)
				} finally {
					if (t) throw t.error
				}
			}
			n.complete()
		}), void 0, (function () {
			r = null
		})))
	}))
}

function se(t) {
	return k((function (e, n) {
		var r, i, o = !1, s = function () {
			r = e.subscribe(new U(n, void 0, void 0, (function (e) {
				i || (i = new G, t(i).subscribe(new U(n, (function () {
					return r ? s() : o = !0
				})))), i && i.next(e)
			}))), o && (r.unsubscribe(), r = null, o = !1, s())
		};
		s()
	}))
}

function ae(t) {
	void 0 === t && (t = {});
	var e = t.connector, n = void 0 === e ? function () {
			return new G
		} : e, r = t.resetOnError, i = void 0 === r || r, o = t.resetOnComplete, s = void 0 === o || o,
		a = t.resetOnRefCountZero, c = void 0 === a || a;
	return function (t) {
		var e = null, r = null, o = null, a = 0, u = !1, l = !1, h = function () {
			null == r || r.unsubscribe(), r = null
		}, d = function () {
			h(), e = o = null, u = l = !1
		}, p = function () {
			var t = e;
			d(), null == t || t.unsubscribe()
		};
		return k((function (t, f) {
			a++, l || u || h();
			var v = o = null != o ? o : n();
			f.add((function () {
				0 !== --a || l || u || (r = ce(p, c))
			})), v.subscribe(f), e || (e = new T({
				next: function (t) {
					return v.next(t)
				}, error: function (t) {
					l = !0, h(), r = ce(d, i, t), v.error(t)
				}, complete: function () {
					u = !0, h(), r = ce(d, s), v.complete()
				}
			}), lt(t).subscribe(e))
		}))(t)
	}
}

function ce(t, e) {
	for (var n = [], r = 2; r < arguments.length; r++) n[r - 2] = arguments[r];
	return !0 === e ? (t(), null) : !1 === e ? null : e.apply(void 0, u([], c(n))).pipe(Zt(1)).subscribe((function () {
		return t()
	}))
}

function ue(t, e, n) {
	var r, i, o, s = !1;
	return t && "object" == typeof t ? (o = null !== (r = t.bufferSize) && void 0 !== r ? r : 1 / 0, e = null !== (i = t.windowTime) && void 0 !== i ? i : 1 / 0, s = !!t.refCount, n = t.scheduler) : o = null != t ? t : 1 / 0, ae({
		connector: function () {
			return new W(o, e, n)
		}, resetOnError: !0, resetOnComplete: !1, resetOnRefCountZero: s
	})
}

function le(t) {
	return jt((function (e, n) {
		return t <= n
	}))
}

function he() {
	return t = D, k((function (n, r) {
		var i = null, o = 0, s = !1, a = function () {
			return s && !i && r.complete()
		};
		n.subscribe(new U(r, (function (n) {
			null == i || i.unsubscribe();
			var s = 0, c = o++;
			ht(t(n, c)).subscribe(i = new U(r, (function (t) {
				return r.next(e ? e(n, t, c, s++) : t)
			}), (function () {
				i = null, a()
			})))
		}), (function () {
			s = !0, a()
		})))
	}));
	var t, e
}

function de(t) {
	return k((function (e, n) {
		ht(t).subscribe(new U(n, (function () {
			return n.complete()
		}), N)), !n.closed && e.subscribe(n)
	}))
}

function pe(t, e, n) {
	var r = p(t) || e || n ? {next: t, error: e, complete: n} : t;
	return r ? k((function (t, e) {
		t.subscribe(new U(e, (function (t) {
			var n;
			null === (n = r.next) || void 0 === n || n.call(r, t), e.next(t)
		}), (function () {
			var t;
			null === (t = r.complete) || void 0 === t || t.call(r), e.complete()
		}), (function (t) {
			var n;
			null === (n = r.error) || void 0 === n || n.call(r, t), e.error(t)
		})))
	})) : D
}

class fe extends Error {
	constructor(t, e) {
		super(t), this.type = e, this.type = e, Object.setPrototypeOf(this, new.target.prototype)
	}
}

function ve(t, e, n = Ut.ERROR, r = xt.JS_LIB) {
	e ? null == e || e.write({level: n, layer: r, message: t}) : e || n !== Ut.ERROR || console.error(t)
}

function Ee(t) {
	return void 0 !== t
}

!function (t) {
	t.ERROR = "error", t.WARNING = "warning", t.INFO = "info"
}(Ut || (Ut = {})), function (t) {
	t.CHROME_EXTENSION = "chrome-extension", t.NATIVE_CONSOLE = "native-console", t.JS_LIB = "js-lib"
}(xt || (xt = {})), function (t) {
	t.SDK_USAGE_ERROR = "sdk-usage-error", t.FEATURE_NOT_SUPPORTED = "feature-not-supported", t.DEVICE_ERROR = "device-error", t.UNEXPECTED_ERROR = "unexpected-error", t.INIT_ERROR = "init-error"
}(Gt || (Gt = {}));

class ge {
	constructor(t, e) {
		this.compare = e, this.remove = new G, this.itemRemoved = this.remove, this.items = new M([]), this.itemList = this.items, this.itemAdded = t.pipe(At((t => (this.addItem(t), t))), ae()), this.itemAdded.subscribe({
			next: t => {
				t.onDisconnect.pipe(ie(), At((() => this.removeItem(t.id))), jt(Ee)).subscribe((t => this.remove.next(t)))
			}, error: N
		}), this.itemRemoved.subscribe({error: N})
	}

	getValue() {
		return [...this.items.getValue()]
	}

	addItem(t) {
		if (this.items.getValue().filter((e => e.id.equals(t.id))).length > 0) throw new fe("This item has already been added.", Gt.UNEXPECTED_ERROR);
		const e = this.items.getValue().concat([t]);
		e.sort(this.compare), this.items.next(e)
	}

	removeItem(t) {
		const e = this.getValue(), n = e.findIndex((e => e.id.equals(t)));
		if (-1 === n) throw new fe("Item not found and therefore cannot be removed.", Gt.UNEXPECTED_ERROR);
		const r = e.splice(n, 1)[0];
		return this.items.next(e), r
	}
}

class _e {
	constructor(t, e) {
		this.sdkVersion = "4.1.0", this.consoleAppVersion = t.pipe(ie((t => "ready" === t.event)), At((t => t.version)), Tt(1e3), ue(1), Jt((() => mt(null)))), this.chromeExtensionVersion = t.pipe(ie((t => "chrome-extension-ready" === t.event)), At((t => t.version)), Tt(1e3), ue(1), Jt((() => mt(null)))), zt(this.consoleAppVersion, this.chromeExtensionVersion).subscribe((t => {
			const n = `sdkVersion: ${this.sdkVersion} | chromeHostVersion: ${t[0]}`;
			let r;
			r = "undefined" != typeof process ? `${n} | nodeVersion: ${process.version} | platform: ${process.platform}` : `${n} | chromeExtensionVersion: ${t[1]} | browserUserAgent: ${window.navigator.userAgent}`, ve(r, e, Ut.INFO)
		}))
	}
}

class be {
	constructor(t, e, r) {
		this.deviceDetector = t, this.deviceAdded = this.deviceDetector.deviceObservables.itemAdded, this.deviceRemoved = this.deviceDetector.deviceObservables.itemRemoved, this.deviceList = this.deviceDetector.deviceObservables.itemList, Ft.set(this, void 0), this._transport = e, this._readyEvents = e.consoleAppEvent.pipe(jt((t => "ready" === t.event || "chrome-extension-ready" === t.event)), ue(2)), this._readyEvents.subscribe(), this._config = r, this.transportContext = e.context, n(this, Ft, new _e(this._readyEvents, null == r ? void 0 : r.logger), "f")
	}

	getVersion() {
		return e(this, Ft, "f").sdkVersion
	}

	getChromehostVersion() {
		return Ot(e(this, Ft, "f").consoleAppVersion)
	}

	getChromeExtensionVersion() {
		return Ot(e(this, Ft, "f").chromeExtensionVersion)
	}
}

Ft = new WeakMap, function (t) {
	t.NODE = "node", t.CHROME_EXTENSION = "chrome-extension", t.WEB_HID = "web-hid"
}(Mt || (Mt = {})), function (t) {
	t.CHROME_EXTENSION = "chrome-extension", t.WEB_HID = "web-hid", t.CHROME_EXTENSION_WITH_WEB_HID_FALLBACK = "chrome-extension-with-web-hid-fallback"
}(Bt || (Bt = {}));
const me = "Failed to dynamically import file. Please contact a Jabra representative as we would love to learn about scenarios where this could happen!";

function ye(e, n = Bt.CHROME_EXTENSION, r) {
	return t(this, void 0, void 0, (function* () {
		if (n !== Bt.WEB_HID) {
			const t = yield import("./chrome-extension-transport-1b253c4b.js").catch((() => {
				throw new fe(me, Gt.UNEXPECTED_ERROR)
			})), i = yield t.TransportChromeExtension.checkInstallation();
			if (i.ok) return ve("Using Chrome extension for transport.", e, Ut.INFO), new t.TransportChromeExtension(e, r);
			if (n === Bt.CHROME_EXTENSION) throw new fe(i.message, Gt.INIT_ERROR);
			n === Bt.CHROME_EXTENSION_WITH_WEB_HID_FALLBACK && ve(i.message, e, Ut.INFO)
		}
		return ve("Using WebHID for transport.", e, Ut.INFO), function (e, n) {
			return t(this, void 0, void 0, (function* () {
				const t = yield import("./init-handler-8a0a1ce2.js").catch((() => {
					throw new fe(me, Gt.UNEXPECTED_ERROR)
				})), r = yield import("./web-hid-transport-3d30e3bd.js").catch((() => {
					throw new fe(me, Gt.UNEXPECTED_ERROR)
				})), i = t.initHandler(e);
				return new r.WebHidTransport(i, e, n)
			}))
		}(e, r)
	}))
}

class we {
	constructor(t, e) {
		this.log = t.consoleAppEvent.pipe(jt((t => "log" === t.event)), At((t => ({
			message: t.message,
			level: t.level,
			layer: t.layer
		})))), this.log.subscribe((t => ve(t.message, e, t.level, t.layer)))
	}
}

const Oe = [0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290, 45419, 49548, 53677, 57806, 61935, 4657, 528, 12915, 8786, 21173, 17044, 29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314, 13379, 1056, 5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153, 58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584, 30423, 26358, 22165, 18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757, 26758, 30887, 2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144, 39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769, 2640, 14899, 10770, 56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684, 23749, 11298, 15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395, 36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826, 7761, 3696, 65439, 61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451, 53516, 49453, 61774, 57711, 4224, 161, 12482, 8419, 20484, 16421, 28742, 24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302, 689, 4752, 8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830, 58703, 54572, 50445, 13538, 9411, 5280, 1153, 29798, 25671, 21540, 17413, 42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066, 1681, 5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305, 47498, 43435, 22596, 18533, 30726, 26663, 6336, 2273, 14466, 10403, 52093, 56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254, 2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424, 36297, 31782, 27655, 23652, 19525, 15522, 11395, 7392, 3265, 61215, 65342, 53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923, 16050, 3793, 7920];

class Ne {
	constructor(t) {
		this.config = t, this.messageShown = !1
	}

	validateOrganizationKey() {
		var t;
		if (!(null === (t = this.config) || void 0 === t ? void 0 : t.partnerKey)) return void this.logWarning("No partner key provided.");
		this.validateCrc(this.config.partnerKey) || this.logWarning("Invalid partner key.")
	}

	validateAppId() {
		var t;
		if (!(null === (t = this.config) || void 0 === t ? void 0 : t.appId)) return void this.logWarning("No app identifier provided.");
		if (this.config.appId.length < 3) return void this.logWarning("The appId should be minimum 3 characters.", !1);
		if (this.config.appId.length > 100) return void this.logWarning("The appId should be less than 100 characters.", !1);
		/^[A-Za-z0-9\-_]+$/.test(this.config.appId) || this.logWarning("The appId is invalid. Should consist of letters, numbers, underscores or dashes", !1)
	}

	validateAppName() {
		var t;
		if (!(null === (t = this.config) || void 0 === t ? void 0 : t.appName)) return void this.logWarning("No app name provided. Will fallback to use appId as name.", !1);
		if (!/^[\x20-\x7F]*$/.test(this.config.appName)) return void this.logWarning("The app name can only contain ASCII characters", !1);
		if (this.config.appName.length > 100) return void this.logWarning("The app name should be less than 100 characters.", !1);
		/^[\p{L}\p{N}]+[\p{L}\p{N}\u0020&-]*$/gu.test(this.config.appName) || this.logWarning("The appName is invalid. Name should consist of numbers, spaces, ampersands and dashes. Name should not begin with spaces, ampersands or dashes.", !1)
	}

	logWarning(t, e = !0) {
		if (this.messageShown) return;
		this.messageShown = !0;
		e ? console.warn(`\n        ${t}\n        \n        Add keys to the config object on initialization.\n        E.g. await init({\n          partnerKey: 'my-partner-key-from-developer-zone',\n          appId: 'my-self-chosen-app-id',\n          appName: 'My App Name'\n        });\n\n        Please obtain a valid partner key from https://developer.jabra.com.\n        The key will ensure interoperability with other Jabra apps and services, and mitigate\n        some co-existence issues with other softphone applications.\n\n        The package will continue to work without the keys, but we do not recommend production release\n        without it. Read more on the Developer Zone.\n      \n      `) : console.warn(t)
	}

	validateCrc(t) {
		const [e, ...n] = t.split("-"), r = function (t) {
			let e, n, r = 65535;
			for (n = 0; n < t.length; n += 1) {
				const i = t.charCodeAt(n);
				if (i > 255) throw new RangeError;
				e = 255 & (i ^ r >> 8), r = Oe[e] ^ r << 8
			}
			return 65535 & (0 ^ r)
		}(n.join("-")).toString(16).padStart(4, "0");
		return e === r
	}
}

var Ce, Te, Se, Ae, Ie, Re, De;
!function (t) {
	t[t.MS_OC = 0] = "MS_OC", t[t.CISCO = 1] = "CISCO", t[t.AVAYA = 2] = "AVAYA", t[t.SIEMENS = 3] = "SIEMENS", t[t.ALCATEL = 4] = "ALCATEL", t[t.IBM = 5] = "IBM", t[t.AASTRA = 6] = "AASTRA", t[t.SKYPE = 7] = "SKYPE", t[t.GENERIC = 8] = "GENERIC", t[t.NORTEL = 9] = "NORTEL", t[t.JABRA = 10] = "JABRA", t[t.NEC = 11] = "NEC", t[t.SHORETEL = 12] = "SHORETEL", t[t.OTHER = 255] = "OTHER"
}(Ce || (Ce = {}));

class He {
	constructor(t, e) {
		this.gnpReadCommand = t, this.serialize = e, this.command = t.command, this.subCommand = t.subCommand
	}

	deserialize(t) {
		return this.gnpReadCommand.deserialize(t)
	}
}

!function (t) {
	t[t.GN_PROTOCOL = 65280] = "GN_PROTOCOL"
}(Te || (Te = {})), function (t) {
	t[t.DATA = 1] = "DATA"
}(Se || (Se = {}));

class Le {
	constructor(t, e, n, r, i, o = new Uint8Array, s = 0) {
		this.destination = t, this.source = e, this.type = n, this.command = r, this.subCommand = i, this.payload = o, this.sequenceNumber = s
	}
}

!function (t) {
	t[t.PC_ADDR = 0] = "PC_ADDR", t[t.BASE_ADDR = 1] = "BASE_ADDR", t[t.HS1_ADDR = 4] = "HS1_ADDR", t[t.HS_BT_USB_ADDR = 8] = "HS_BT_USB_ADDR", t[t.HS_CRADLE_ADDR = 10] = "HS_CRADLE_ADDR", t[t.CRADLE_ADDR = 21] = "CRADLE_ADDR"
}(Ae || (Ae = {})), function (t) {
	t[t.EVENT = 0] = "EVENT", t[t.READ = 1] = "READ", t[t.WRITE = 2] = "WRITE", t[t.REPLY = 3] = "REPLY"
}(Ie || (Ie = {})), function (t) {
	t[t.IDENT = 2] = "IDENT", t[t.DFU = 7] = "DFU", t[t.DEVICE = 13] = "DEVICE", t[t.FWU = 15] = "FWU", t[t.STATUS = 18] = "STATUS", t[t.CONFIG = 19] = "CONFIG", t[t.NACK = 254] = "NACK", t[t.ACK = 255] = "ACK"
}(Re || (Re = {})), function (t) {
	t[t.CONFIG_PREFERRED_SOFTPHONE = 34] = "CONFIG_PREFERRED_SOFTPHONE", t[t.ID = 1] = "ID", t[t.IDENT_GET_AVAILABLE_SOFTPHONES = 16] = "IDENT_GET_AVAILABLE_SOFTPHONES", t[t.TYPE = 2] = "TYPE", t[t.NAME = 0] = "NAME", t[t.PID = 17] = "PID", t[t.ATTACH_EVENT = 1] = "ATTACH_EVENT", t[t.DETACH_EVENT = 2] = "DETACH_EVENT"
}(De || (De = {}));
const Pe = {command: Re.DEVICE, subCommand: De.ATTACH_EVENT, serialize: t => Uint8Array.from([5, 0])};

function ke(t) {
	const e = t.payload, n = e[0], r = e.length - 1;
	if (r !== n) throw new fe(`Invalid response. Expected length: ${n}, actual: ${r}`, Gt.DEVICE_ERROR);
	const i = e.slice(1);
	return String.fromCharCode(...Array.from(i))
}

class Ue {
	constructor() {
		var t;
		this.command = Re.IDENT, this.subCommand = De.IDENT_GET_AVAILABLE_SOFTPHONES, this.deserialize = (t = t => t, e => {
			const n = e.payload, r = n[0], i = n.length - 1;
			if (i !== r) throw new fe(`Invalid response. Expected length: ${r}, actual: ${i}`, Gt.DEVICE_ERROR);
			const o = [];
			return n.slice(1).forEach((e => {
				o.push(t(e))
			})), o
		})
	}
}

const xe = {command: Re.IDENT, subCommand: De.NAME, deserialize: ke}, Ge = {
	command: Re.IDENT, subCommand: De.PID, deserialize: function (t) {
		const e = t instanceof Le ? t.payload : t;
		return new DataView(e.buffer).getUint16(0, !0)
	}
};

class Fe {
	constructor() {
		this.command = Re.CONFIG, this.subCommand = De.CONFIG_PREFERRED_SOFTPHONE, this.deserialize = t => t.payload[0], this.serialize = t => Uint8Array.of(t)
	}
}

class Me {
	constructor() {
		this.command = Re.IDENT, this.subCommand = De.TYPE, this.deserialize = t => t.source
	}
}

const Be = {command: Re.IDENT, subCommand: De.ID, deserialize: ke};
"undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;

function We(t, e, n) {
	return t(n = {
		path: e, exports: {}, require: function (t, e) {
			return function () {
				throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")
			}(null == e && n.path)
		}
	}, n.exports), n.exports
}

var Ke, Ve, Ye = We((function (t) {
	/*!
**  Pure-UUID -- Pure JavaScript Based Universally Unique Identifier (UUID)
**  Copyright (c) 2004-2020 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
	t.exports = function () {
		var t = function (t, e, n, r, i, o) {
				for (var s = function (t, e) {
					var n = t.toString(16);
					return n.length < 2 && (n = "0" + n), e && (n = n.toUpperCase()), n
				}, a = e; a <= n; a++) i[o++] = s(t[a], r);
				return i
			}, e = function (t, e, n, r, i) {
				for (var o = e; o <= n; o += 2) r[i++] = parseInt(t.substr(o, 2), 16)
			}, n = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#".split(""),
			r = [0, 68, 0, 84, 83, 82, 72, 0, 75, 76, 70, 65, 0, 63, 62, 69, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 64, 0, 73, 66, 74, 71, 81, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 77, 0, 78, 67, 0, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 79, 0, 80, 0, 0],
			i = function (t, e) {
				if (e % 4 != 0) throw new Error("z85_encode: invalid input length (multiple of 4 expected)");
				for (var r = "", i = 0, o = 0; i < e;) if (o = 256 * o + t[i++], i % 4 == 0) {
					for (var s = 52200625; s >= 1;) {
						var a = Math.floor(o / s) % 85;
						r += n[a], s /= 85
					}
					o = 0
				}
				return r
			}, o = function (t, e) {
				var n = t.length;
				if (n % 5 != 0) throw new Error("z85_decode: invalid input length (multiple of 5 expected)");
				void 0 === e && (e = new Array(4 * n / 5));
				for (var i = 0, o = 0, s = 0; i < n;) {
					var a = t.charCodeAt(i++) - 32;
					if (a < 0 || a >= r.length) break;
					if (s = 85 * s + r[a], i % 5 == 0) {
						for (var c = 16777216; c >= 1;) e[o++] = Math.trunc(s / c % 256), c /= 256;
						s = 0
					}
				}
				return e
			}, s = function (t, e) {
				var n = {ibits: 8, obits: 8, obigendian: !0};
				for (var r in e) void 0 !== n[r] && (n[r] = e[r]);
				for (var i, o, s, a = [], c = 0, u = 0, l = 0, h = t.length; 0 === u && (o = t.charCodeAt(c++)), i = o >> n.ibits - (u + 8) & 255, u = (u + 8) % n.ibits, n.obigendian ? 0 === l ? s = i << n.obits - 8 : s |= i << n.obits - 8 - l : 0 === l ? s = i : s |= i << l, !(0 == (l = (l + 8) % n.obits) && (a.push(s), c >= h));) ;
				return a
			}, a = function (t, e) {
				var n = {ibits: 32, ibigendian: !0};
				for (var r in e) void 0 !== n[r] && (n[r] = e[r]);
				var i = "", o = 4294967295;
				n.ibits < 32 && (o = (1 << n.ibits) - 1);
				for (var s = t.length, a = 0; a < s; a++) for (var c = t[a] & o, u = 0; u < n.ibits; u += 8) n.ibigendian ? i += String.fromCharCode(c >> n.ibits - 8 - u & 255) : i += String.fromCharCode(c >> u & 255);
				return i
			}, c = 8, u = 8, l = 256, h = function (t, e, n, r, i, o, s, a) {
				return [a, s, o, i, r, n, e, t]
			}, d = function () {
				return h(0, 0, 0, 0, 0, 0, 0, 0)
			}, p = function (t) {
				return t.slice(0)
			}, f = function (t) {
				for (var e = d(), n = 0; n < c; n++) e[n] = Math.floor(t % l), t /= l;
				return e
			}, v = function (t) {
				for (var e = 0, n = c - 1; n >= 0; n--) e *= l, e += t[n];
				return Math.floor(e)
			}, E = function (t, e) {
				for (var n = 0, r = 0; r < c; r++) n += t[r] + e[r], t[r] = Math.floor(n % l), n = Math.floor(n / l);
				return n
			}, g = function (t, e) {
				for (var n = 0, r = 0; r < c; r++) n += t[r] * e, t[r] = Math.floor(n % l), n = Math.floor(n / l);
				return n
			}, _ = function (t, e) {
				var n, r, i, o = new Array(c + c);
				for (n = 0; n < c + c; n++) o[n] = 0;
				for (n = 0; n < c; n++) {
					for (i = 0, r = 0; r < c; r++) i += t[n] * e[r] + o[n + r], o[n + r] = i % l, i /= l;
					for (; r < c + c - n; r++) i += o[n + r], o[n + r] = i % l, i /= l
				}
				for (n = 0; n < c; n++) t[n] = o[n];
				return o.slice(c, c)
			}, b = function (t, e) {
				for (var n = 0; n < c; n++) t[n] &= e[n];
				return t
			}, m = function (t, e) {
				for (var n = 0; n < c; n++) t[n] |= e[n];
				return t
			}, y = function (t, e) {
				var n = d();
				if (e % u != 0) throw new Error("ui64_rorn: only bit rotations supported with a multiple of digit bits");
				for (var r = Math.floor(e / u), i = 0; i < r; i++) {
					for (var o = c - 1 - 1; o >= 0; o--) n[o + 1] = n[o];
					for (n[0] = t[0], o = 0; o < c - 1; o++) t[o] = t[o + 1];
					t[o] = 0
				}
				return v(n)
			}, w = function (t, e) {
				if (e > c * u) throw new Error("ui64_ror: invalid number of bits to shift");
				var n, r = new Array(c + c);
				for (n = 0; n < c; n++) r[n + c] = t[n], r[n] = 0;
				var i = Math.floor(e / u), o = e % u;
				for (n = i; n < c + c - 1; n++) r[n - i] = (r[n] >>> o | r[n + 1] << u - o) & (1 << u) - 1;
				for (r[c + c - 1 - i] = r[c + c - 1] >>> o & (1 << u) - 1, n = c + c - 1 - i + 1; n < c + c; n++) r[n] = 0;
				for (n = 0; n < c; n++) t[n] = r[n + c];
				return r.slice(0, c)
			}, O = function (t, e) {
				if (e > c * u) throw new Error("ui64_rol: invalid number of bits to shift");
				var n, r = new Array(c + c);
				for (n = 0; n < c; n++) r[n + c] = 0, r[n] = t[n];
				var i = Math.floor(e / u), o = e % u;
				for (n = c - 1 - i; n > 0; n--) r[n + i] = (r[n] << o | r[n - 1] >>> u - o) & (1 << u) - 1;
				for (r[0 + i] = r[0] << o & (1 << u) - 1, n = 0 + i - 1; n >= 0; n--) r[n] = 0;
				for (n = 0; n < c; n++) t[n] = r[n];
				return r.slice(c, c)
			}, N = function (t, e) {
				for (var n = 0; n < c; n++) t[n] ^= e[n]
			}, C = function (t, e) {
				var n = (65535 & t) + (65535 & e);
				return (t >> 16) + (e >> 16) + (n >> 16) << 16 | 65535 & n
			}, T = function (t, e) {
				return t << e & 4294967295 | t >>> 32 - e & 4294967295
			}, S = function (t, e) {
				function n(t, e, n, r) {
					return t < 20 ? e & n | ~e & r : t < 40 ? e ^ n ^ r : t < 60 ? e & n | e & r | n & r : e ^ n ^ r
				}

				function r(t) {
					return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514
				}

				t[e >> 5] |= 128 << 24 - e % 32, t[15 + (e + 64 >> 9 << 4)] = e;
				for (var i = Array(80), o = 1732584193, s = -271733879, a = -1732584194, c = 271733878, u = -1009589776, l = 0; l < t.length; l += 16) {
					for (var h = o, d = s, p = a, f = c, v = u, E = 0; E < 80; E++) {
						i[E] = E < 16 ? t[l + E] : T(i[E - 3] ^ i[E - 8] ^ i[E - 14] ^ i[E - 16], 1);
						var g = C(C(T(o, 5), n(E, s, a, c)), C(C(u, i[E]), r(E)));
						u = c, c = a, a = T(s, 30), s = o, o = g
					}
					o = C(o, h), s = C(s, d), a = C(a, p), c = C(c, f), u = C(u, v)
				}
				return [o, s, a, c, u]
			}, A = function (t) {
				return a(S(s(t, {ibits: 8, obits: 32, obigendian: !0}), 8 * t.length), {ibits: 32, ibigendian: !0})
			}, I = function (t, e) {
				function n(t, e, n, r, i, o) {
					return C(T(C(C(e, t), C(r, o)), i), n)
				}

				function r(t, e, r, i, o, s, a) {
					return n(e & r | ~e & i, t, e, o, s, a)
				}

				function i(t, e, r, i, o, s, a) {
					return n(e & i | r & ~i, t, e, o, s, a)
				}

				function o(t, e, r, i, o, s, a) {
					return n(e ^ r ^ i, t, e, o, s, a)
				}

				function s(t, e, r, i, o, s, a) {
					return n(r ^ (e | ~i), t, e, o, s, a)
				}

				t[e >> 5] |= 128 << e % 32, t[14 + (e + 64 >>> 9 << 4)] = e;
				for (var a = 1732584193, c = -271733879, u = -1732584194, l = 271733878, h = 0; h < t.length; h += 16) {
					var d = a, p = c, f = u, v = l;
					a = r(a, c, u, l, t[h + 0], 7, -680876936), l = r(l, a, c, u, t[h + 1], 12, -389564586), u = r(u, l, a, c, t[h + 2], 17, 606105819), c = r(c, u, l, a, t[h + 3], 22, -1044525330), a = r(a, c, u, l, t[h + 4], 7, -176418897), l = r(l, a, c, u, t[h + 5], 12, 1200080426), u = r(u, l, a, c, t[h + 6], 17, -1473231341), c = r(c, u, l, a, t[h + 7], 22, -45705983), a = r(a, c, u, l, t[h + 8], 7, 1770035416), l = r(l, a, c, u, t[h + 9], 12, -1958414417), u = r(u, l, a, c, t[h + 10], 17, -42063), c = r(c, u, l, a, t[h + 11], 22, -1990404162), a = r(a, c, u, l, t[h + 12], 7, 1804603682), l = r(l, a, c, u, t[h + 13], 12, -40341101), u = r(u, l, a, c, t[h + 14], 17, -1502002290), a = i(a, c = r(c, u, l, a, t[h + 15], 22, 1236535329), u, l, t[h + 1], 5, -165796510), l = i(l, a, c, u, t[h + 6], 9, -1069501632), u = i(u, l, a, c, t[h + 11], 14, 643717713), c = i(c, u, l, a, t[h + 0], 20, -373897302), a = i(a, c, u, l, t[h + 5], 5, -701558691), l = i(l, a, c, u, t[h + 10], 9, 38016083), u = i(u, l, a, c, t[h + 15], 14, -660478335), c = i(c, u, l, a, t[h + 4], 20, -405537848), a = i(a, c, u, l, t[h + 9], 5, 568446438), l = i(l, a, c, u, t[h + 14], 9, -1019803690), u = i(u, l, a, c, t[h + 3], 14, -187363961), c = i(c, u, l, a, t[h + 8], 20, 1163531501), a = i(a, c, u, l, t[h + 13], 5, -1444681467), l = i(l, a, c, u, t[h + 2], 9, -51403784), u = i(u, l, a, c, t[h + 7], 14, 1735328473), a = o(a, c = i(c, u, l, a, t[h + 12], 20, -1926607734), u, l, t[h + 5], 4, -378558), l = o(l, a, c, u, t[h + 8], 11, -2022574463), u = o(u, l, a, c, t[h + 11], 16, 1839030562), c = o(c, u, l, a, t[h + 14], 23, -35309556), a = o(a, c, u, l, t[h + 1], 4, -1530992060), l = o(l, a, c, u, t[h + 4], 11, 1272893353), u = o(u, l, a, c, t[h + 7], 16, -155497632), c = o(c, u, l, a, t[h + 10], 23, -1094730640), a = o(a, c, u, l, t[h + 13], 4, 681279174), l = o(l, a, c, u, t[h + 0], 11, -358537222), u = o(u, l, a, c, t[h + 3], 16, -722521979), c = o(c, u, l, a, t[h + 6], 23, 76029189), a = o(a, c, u, l, t[h + 9], 4, -640364487), l = o(l, a, c, u, t[h + 12], 11, -421815835), u = o(u, l, a, c, t[h + 15], 16, 530742520), a = s(a, c = o(c, u, l, a, t[h + 2], 23, -995338651), u, l, t[h + 0], 6, -198630844), l = s(l, a, c, u, t[h + 7], 10, 1126891415), u = s(u, l, a, c, t[h + 14], 15, -1416354905), c = s(c, u, l, a, t[h + 5], 21, -57434055), a = s(a, c, u, l, t[h + 12], 6, 1700485571), l = s(l, a, c, u, t[h + 3], 10, -1894986606), u = s(u, l, a, c, t[h + 10], 15, -1051523), c = s(c, u, l, a, t[h + 1], 21, -2054922799), a = s(a, c, u, l, t[h + 8], 6, 1873313359), l = s(l, a, c, u, t[h + 15], 10, -30611744), u = s(u, l, a, c, t[h + 6], 15, -1560198380), c = s(c, u, l, a, t[h + 13], 21, 1309151649), a = s(a, c, u, l, t[h + 4], 6, -145523070), l = s(l, a, c, u, t[h + 11], 10, -1120210379), u = s(u, l, a, c, t[h + 2], 15, 718787259), c = s(c, u, l, a, t[h + 9], 21, -343485551), a = C(a, d), c = C(c, p), u = C(u, f), l = C(l, v)
				}
				return [a, c, u, l]
			}, R = function (t) {
				return a(I(s(t, {ibits: 8, obits: 32, obigendian: !1}), 8 * t.length), {ibits: 32, ibigendian: !1})
			}, D = function (t) {
				this.mul = h(88, 81, 244, 45, 76, 149, 127, 45), this.inc = h(20, 5, 123, 126, 247, 103, 129, 79), this.mask = h(0, 0, 0, 0, 255, 255, 255, 255), this.state = p(this.inc), this.next(), b(this.state, this.mask), t = f(void 0 !== t ? t >>> 0 : 4294967295 * Math.random() >>> 0), m(this.state, t), this.next()
			};
		D.prototype.next = function () {
			var t = p(this.state);
			_(this.state, this.mul), E(this.state, this.inc);
			var e = p(t);
			w(e, 18), N(e, t), w(e, 27);
			var n = p(t);
			w(n, 59), b(e, this.mask);
			var r = v(n), i = p(e);
			return O(i, 32 - r), w(e, r), N(e, i), v(e)
		};
		var H = new D, L = function (t, e) {
			for (var n = [], r = 0; r < t; r++) n[r] = H.next() % e;
			return n
		}, P = 0, k = 0, U = function () {
			if (1 === arguments.length && "string" == typeof arguments[0]) this.parse.apply(this, arguments); else if (arguments.length >= 1 && "number" == typeof arguments[0]) this.make.apply(this, arguments); else {
				if (arguments.length >= 1) throw new Error("UUID: constructor: invalid arguments");
				for (var t = 0; t < 16; t++) this[t] = 0
			}
		};
		return "undefined" != typeof Uint8Array ? U.prototype = new Uint8Array(16) : Buffer ? U.prototype = Buffer.alloc(16) : U.prototype = new Array(16), U.prototype.constructor = U, U.prototype.make = function (t) {
			var e, n = this;
			if (1 === t) {
				var r = (new Date).getTime();
				r !== P ? k = 0 : k++, P = r;
				var i, o = f(r);
				g(o, 1e4), E(o, h(1, 178, 29, 210, 19, 129, 64, 0)), k > 0 && E(o, f(k)), i = y(o, 8), n[3] = 255 & i, i = y(o, 8), n[2] = 255 & i, i = y(o, 8), n[1] = 255 & i, i = y(o, 8), n[0] = 255 & i, i = y(o, 8), n[5] = 255 & i, i = y(o, 8), n[4] = 255 & i, i = y(o, 8), n[7] = 255 & i, i = y(o, 8), n[6] = 15 & i;
				var s = L(2, 255);
				n[8] = s[0], n[9] = s[1];
				var a = L(6, 255);
				for (a[0] |= 1, a[0] |= 2, e = 0; e < 6; e++) n[10 + e] = a[e]
			} else if (4 === t) {
				var c = L(16, 255);
				for (e = 0; e < 16; e++) this[e] = c[e]
			} else {
				if (3 !== t && 5 !== t) throw new Error("UUID: make: invalid version");
				var u = "",
					l = "object" == typeof arguments[1] && arguments[1] instanceof U ? arguments[1] : (new U).parse(arguments[1]);
				for (e = 0; e < 16; e++) u += String.fromCharCode(l[e]);
				u += arguments[2];
				var d = 3 === t ? R(u) : A(u);
				for (e = 0; e < 16; e++) n[e] = d.charCodeAt(e)
			}
			return n[6] &= 15, n[6] |= t << 4, n[8] &= 63, n[8] |= 128, n
		}, U.prototype.format = function (e) {
			var n, r;
			return "z85" === e ? n = i(this, 16) : "b16" === e ? (r = Array(32), t(this, 0, 15, !0, r, 0), n = r.join("")) : void 0 !== e && "std" !== e || (r = new Array(36), t(this, 0, 3, !1, r, 0), r[8] = "-", t(this, 4, 5, !1, r, 9), r[13] = "-", t(this, 6, 7, !1, r, 14), r[18] = "-", t(this, 8, 9, !1, r, 19), r[23] = "-", t(this, 10, 15, !1, r, 24), n = r.join("")), n
		}, U.prototype.toString = function (t) {
			return this.format(t)
		}, U.prototype.toJSON = function () {
			return this.format("std")
		}, U.prototype.parse = function (t, n) {
			if ("string" != typeof t) throw new Error("UUID: parse: invalid argument (type string expected)");
			if ("z85" === n) o(t, this); else if ("b16" === n) e(t, 0, 35, this, 0); else if (void 0 === n || "std" === n) {
				var r = {
					nil: "00000000-0000-0000-0000-000000000000",
					"ns:DNS": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
					"ns:URL": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
					"ns:OID": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
					"ns:X500": "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
				};
				if (void 0 !== r[t]) t = r[t]; else if (!t.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) throw new Error('UUID: parse: invalid string representation (expected "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")');
				e(t, 0, 7, this, 0), e(t, 9, 12, this, 4), e(t, 14, 17, this, 6), e(t, 19, 22, this, 8), e(t, 24, 35, this, 10)
			}
			return this
		}, U.prototype.export = function () {
			for (var t = Array(16), e = 0; e < 16; e++) t[e] = this[e];
			return t
		}, U.prototype.import = function (t) {
			if (!("object" == typeof t && t instanceof Array)) throw new Error("UUID: import: invalid argument (type Array expected)");
			if (16 !== t.length) throw new Error("UUID: import: invalid argument (Array of length 16 expected)");
			for (var e = 0; e < 16; e++) {
				if ("number" != typeof t[e]) throw new Error("UUID: import: invalid array element #" + e + " (type Number expected)");
				if (!isFinite(t[e]) || Math.floor(t[e]) !== t[e]) throw new Error("UUID: import: invalid array element #" + e + " (Number with integer value expected)");
				if (!(t[e] >= 0 && t[e] <= 255)) throw new Error("UUID: import: invalid array element #" + e + " (Number with integer value in range 0...255 expected)");
				this[e] = t[e]
			}
			return this
		}, U.prototype.compare = function (t) {
			if ("object" != typeof t) throw new Error("UUID: compare: invalid argument (type UUID expected)");
			if (!(t instanceof U)) throw new Error("UUID: compare: invalid argument (type UUID expected)");
			for (var e = 0; e < 16; e++) {
				if (this[e] < t[e]) return -1;
				if (this[e] > t[e]) return 1
			}
			return 0
		}, U.prototype.equal = function (t) {
			return 0 === this.compare(t)
		}, U.prototype.fold = function (t) {
			if (void 0 === t) throw new Error("UUID: fold: invalid argument (number of fold operations expected)");
			if (t < 1 || t > 4) throw new Error("UUID: fold: invalid argument (1-4 fold operations expected)");
			for (var e = 16 / Math.pow(2, t), n = new Array(e), r = 0; r < e; r++) {
				for (var i = 0, o = 0; r + o < 16; o += e) i ^= this[r + o];
				n[r] = i
			}
			return n
		}, U.PCG = D, U
	}(), t.exports.default = t.exports
}));

class je {
	constructor(t) {
		this.transport = t, this.gnpLockAcquired = t.consoleAppEvent.pipe(jt((t => "response-gnp-lock" === t.event)), At((t => t.token)), ue(1)), this.gnpLockAcquired.subscribe()
	}

	acquireGnpLock(t) {
		const e = new Ye(4).toString(), n = {action: "request-gnp-lock", id: t, token: e},
			r = this.gnpLockAcquired.pipe(ie((t => t === e)));
		return this.transport.writeAction(n), r
	}

	releaseGnpLock(t, e) {
		const n = {action: "release-gnp-lock", id: t, token: e};
		this.transport.writeAction(n)
	}
}

!function (t) {
	t[t.INPUT = 0] = "INPUT", t[t.OUTPUT = 1] = "OUTPUT", t[t.FEATURE = 2] = "FEATURE"
}(Ke || (Ke = {})), function (t) {
	t.ABSOLUTE = "absolute", t.RELATIVE = "relative"
}(Ve || (Ve = {}));

class $e {
	constructor(t) {
		this.id = t
	}

	equals(t) {
		return this.id === t.id
	}

	startsWith(t) {
		return this.id.startsWith(t.id)
	}

	toString() {
		return this.id
	}
}

function qe(t, e, n) {
	const r = t.toString(16).padStart(4, "0"), i = e.toString(16).padStart(4, "0");
	return new $e(`${r}:${i}:${n}`)
}

class ze {
	constructor(t, e, n, r) {
		this.id = t, this.usagePage = e, this.usage = n, this.value = r
	}

	isArray() {
		return Array.isArray(this.value)
	}

	static deserialize(t, e) {
		return new ze(new $e(t), e.usagePage, e.usage, e.value)
	}
}

class Je {
	constructor(t, e, n) {
		this.descriptor = e, this.transport = n, this.transportId = t.transportId, this.input = n.consoleAppEvent.pipe(jt((t => t.id === this.transportId)), Je.inputReportsFilter)
	}

	output(t, e, n) {
		const r = {action: "hid-output", id: this.transportId, usagePage: t, usage: e, value: n};
		this.transport.writeAction(r)
	}

	getFeatureReport(t, e) {
		const n = new Ye(4).toString(),
			r = {action: "request-hid-feature", id: this.transportId, token: n, usagePage: t, usage: e};
		return this.transport.writeAction(r), this.transport.consoleAppEvent.pipe(ie((t => "response-hid-feature" === t.event && t.token === n)), At((t => t.value)))
	}

	setFeatureReport(t, e, n) {
		const r = {action: "set-hid-feature", id: this.transportId, usagePage: t, usage: e, value: n};
		this.transport.writeAction(r)
	}

	findDescriptor(t, e, n) {
		return this.descriptor.find((r => r.usagePage === t && r.usage === e && r.reportType === n))
	}
}

function Xe(t) {
	return e => e.pipe(function () {
		for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
		var n = gt(t);
		return k((function (e, r) {
			for (var i = t.length, o = new Array(i), s = t.map((function () {
				return !1
			})), a = !1, l = function (e) {
				ht(t[e]).subscribe(new U(r, (function (t) {
					o[e] = t, a || s[e] || (s[e] = !0, (a = s.every(D)) && (s = null))
				}), N))
			}, h = 0; h < i; h++) l(h);
			e.subscribe(new U(r, (function (t) {
				if (a) {
					var e = u([t], c(o));
					r.next(n ? n.apply(void 0, u([], c(e))) : e)
				}
			})))
		}))
	}(t), jt((([t, e]) => e)), At((([t, e]) => t)))
}

Je.inputReportsFilter = t => t.pipe(jt((t => "hid-input" === t.event)), At((t => ze.deserialize(t.id, t))));

class Qe {
	static typeFromAttr(t) {
		return t >> 6
	}

	static packetLengthFromAttr(t) {
		return t & this.lengthMask
	}

	static deserialize(t) {
		const e = t[0], n = t[1], r = t[2], i = this.typeFromAttr(t[3]), o = t[4], s = t[5],
			a = this.packetLengthFromAttr(t[3]), c = t.slice(6, a);
		return new Le(e, n, i, o, s, c, r)
	}
}

Qe.lengthMask = 63;

class Ze {
	constructor() {
		this.data = []
	}

	hasHeader() {
		return this.data.length >= Ze.gnpPacketHeaderLength
	}

	expectedPacketLength() {
		if (!this.hasHeader()) throw new fe("Unable to get expected packet length without a full header", Gt.UNEXPECTED_ERROR);
		return Qe.packetLengthFromAttr(this.data[3])
	}

	appendData(t) {
		this.hasHeader() && this.expectedPacketLength() > Ze.gnpPacketMaxLength && (this.data = []), this.data = this.data.concat(t)
	}

	hasFullPacket() {
		if (!this.hasHeader()) return !1;
		const t = this.expectedPacketLength();
		return this.data.length >= t
	}

	getPacketAndReset() {
		if (!this.hasFullPacket()) throw new fe("Trying to get packet but buffer is not complete", Gt.UNEXPECTED_ERROR);
		const t = Qe.deserialize(Uint8Array.from(this.data));
		return this.data = [], t
	}
}

Ze.gnpPacketHeaderLength = 6, Ze.gnpPacketMaxLength = 63;
const tn = () => {
};

function en(t) {
	return pe((e => t()), (e => t()), (() => tn))
}

const nn = () => {
		return t = t => t.command === Re.NACK, e = t => new fe(`Got NACK response. Reason: ${t.subCommand}`, Gt.DEVICE_ERROR), n => n.pipe(At((n => t(n) ? yt(e(n)) : mt(n))), he());
		var t, e
	},
	rn = t => ie((e => e.type === Ie.REPLY && e.sequenceNumber === t.sequenceNumber && e.destination === t.source && e.source === t.destination));

class on {
	constructor(t, e, n, r, i = 0) {
		this.hidChannel = t, this.gnpLock = e, this.transportId = n, this.primaryAddress = r, this.lockQueue = [], this.packets = t.input.pipe(on.inputFilter), this.events = this.packets.pipe(on.eventsFilter), this.nextSequenceNumber = i
	}

	static get inputFilter() {
		return t => {
			const e = t.pipe(jt((t => t.usagePage === Te.GN_PROTOCOL && t.usage === Se.DATA && t.isArray()))),
				n = new Ze;
			return e.pipe(It((t => {
				const e = t.value;
				if (n.appendData(e), n.hasFullPacket()) {
					return mt(n.getPacketAndReset())
				}
				return Wt
			})), ae())
		}
	}

	static supportsGnpOverHid(t) {
		return void 0 !== t.findDescriptor(Te.GN_PROTOCOL, Se.DATA, Ke.OUTPUT)
	}

	getNextSequenceNumber() {
		const t = this.nextSequenceNumber;
		return this.nextSequenceNumber = (this.nextSequenceNumber + 1) % 255, t
	}

	doWithGnpLockHeld(t) {
		this.lockQueue.push(t), this.lockQueue.length > 1 || this.processLockQueue()
	}

	processLockQueue() {
		this.gnpLock.acquireGnpLock(this.transportId).subscribe((t => {
			(0, this.lockQueue[0])((t => {
				var e;
				const n = null === (e = this.hidChannel.findDescriptor(Te.GN_PROTOCOL, Se.DATA, Ke.OUTPUT)) || void 0 === e ? void 0 : e.reportSize;
				if (!n) throw new fe("Cannot send GNP packets to this device.", Gt.DEVICE_ERROR);
				const r = class {
					static attrFromTypeAndPayloadLength(t, e) {
						return (t << 6) + (e + 6)
					}

					static serialize(t) {
						const e = new Uint8Array(6);
						e[0] = t.destination, e[1] = t.source, e[2] = t.sequenceNumber, e[3] = this.attrFromTypeAndPayloadLength(t.type, t.payload.length), e[4] = t.command, e[5] = t.subCommand;
						const n = new Uint8Array(e.length + t.payload.length);
						return n.set(e), n.set(t.payload, e.length), n
					}
				}.serialize(t);
				let i = 0;
				do {
					const t = Math.min(r.length - i, n), e = r.subarray(i, i + t);
					i += e.length, this.hidChannel.output(Te.GN_PROTOCOL, Se.DATA, Array.from(e))
				} while (i < r.length)
			}), this.packets, (() => {
				this.gnpLock.releaseGnpLock(this.transportId, t), this.lockQueue.splice(0, 1), this.lockQueue.length > 0 && this.processLockQueue()
			}))
		}))
	}

	sendEvent(t, e, n = this.primaryAddress) {
		const r = new Le(n, Ae.PC_ADDR, Ie.EVENT, t.command, t.subCommand, t.serialize(e), 0);
		this.doWithGnpLockHeld(((t, e, n) => {
			t(r), n()
		}))
	}

	read(t, e = this.primaryAddress, n = 2500) {
		const r = new He(t, (t => new Uint8Array));
		return this.readWithParams(r, null, e, n)
	}

	readWithParams(t, e, n = this.primaryAddress, r = 2500) {
		const i = new Le(n, Ae.PC_ADDR, Ie.READ, t.command, t.subCommand, t.serialize(e), this.getNextSequenceNumber()),
			o = new G;
		return this.doWithGnpLockHeld(((e, n, s) => {
			n.pipe(rn(i), nn(), ie((t => t.command === i.command && t.subCommand === i.subCommand)), Tt(r), en(s), At((e => t.deserialize(e)))).subscribe(o), e(i)
		})), o
	}

	write(t, e, n = this.primaryAddress, r = 2500) {
		const i = new Le(n, Ae.PC_ADDR, Ie.WRITE, t.command, t.subCommand, t.serialize(e), this.getNextSequenceNumber()),
			o = new G;
		return this.doWithGnpLockHeld(((t, e, n) => {
			e.pipe(rn(i), nn(), ie((t => t.command === Re.ACK)), Tt(r), en(n), At((() => !0))).subscribe(o), t(i)
		})), o
	}
}

on.eventsFilter = t => t.pipe(jt((t => t.type === Ie.EVENT)));

class sn {
	constructor(t, e) {
		this.parentGnpChannel = t, this.primaryAddress = e, this.events = t.events.pipe(jt((t => t.source === this.primaryAddress)))
	}

	sendEvent(t, e, n) {
		this.parentGnpChannel.sendEvent(t, e, this.primaryAddress)
	}

	read(t, e, n) {
		return this.parentGnpChannel.read(t, this.primaryAddress, n)
	}

	readWithParams(t, e, n, r) {
		return this.parentGnpChannel.readWithParams(t, e, this.primaryAddress, r)
	}

	write(t, e, n, r) {
		return this.parentGnpChannel.write(t, e, this.primaryAddress, r)
	}
}

function an(t, e, n, r) {
	if (!on.supportsGnpOverHid(t)) return yt((() => new fe("Device does not support GNP commands.", Gt.DEVICE_ERROR)));
	const i = mt(Ae.HS_BT_USB_ADDR, Ae.BASE_ADDR, Ae.CRADLE_ADDR, Ae.HS1_ADDR, Ae.HS_CRADLE_ADDR).pipe(At(((r, i) => Lt((() => {
		const o = new on(t, new je(e), n, r, i), s = new Me;
		return o.read(s, r, 500).pipe(At((t => o)), Jt((() => J)))
	})))), Dt(), Zt(1), ne((() => new fe("GNP probe failed.", Gt.DEVICE_ERROR))));
	return $t(r.pipe(It((t => yt((() => new fe("Device was suddenly disconnected.", Gt.DEVICE_ERROR)))))), i).pipe(ae())
}

function cn(t, e) {
	return new sn(t, e)
}

class un {
	constructor() {
		this.primaryAddress = Ae.BASE_ADDR, this.events = Wt
	}

	subscribeToEvent(t, e) {
		return yt((() => new fe("This device does not support GNP commands.", Gt.FEATURE_NOT_SUPPORTED)))
	}

	sendEvent(t, e, n) {
		throw new fe("This device does not support GNP commands.", Gt.FEATURE_NOT_SUPPORTED)
	}

	read(t, e, n) {
		return yt((() => new fe("This device does not support GNP commands.", Gt.FEATURE_NOT_SUPPORTED)))
	}

	readWithParams(t, e, n, r) {
		return yt((() => new fe("This device does not support GNP commands.", Gt.FEATURE_NOT_SUPPORTED)))
	}

	write(t, e, n, r) {
		return yt((() => new fe("This device does not support GNP commands.", Gt.FEATURE_NOT_SUPPORTED)))
	}
}

class ln {
	constructor(t) {
		this.transportId = t, this.isChild = !1
	}

	equals(t) {
		return this.isChild === t.isChild && this.transportId === t.transportId
	}

	toString() {
		return this.transportId
	}
}

class hn {
	constructor(t, e) {
		this.parentId = t, this.gnpAddress = e, this.isChild = !0, this.transportId = t.transportId
	}

	equals(t) {
		if (this.isChild === t.isChild) {
			const e = t;
			return this.parentId.equals(e.parentId) && this.gnpAddress === e.gnpAddress
		}
		return !1
	}

	toString() {
		return `0x${t = this.gnpAddress,t.toString(16).padStart(2,"0").toUpperCase()}@${this.transportId}`;
		var t
	}
}

var dn, pn, fn;
!function (t) {
	t.NO_TRACKING = "no-tracking", t.TRACK_ERRORS = "track-errors", t.TRACK_USAGE = "track-usage", t.TRACK_ALL = "track-all"
}(dn || (dn = {})), function (t) {
	t[t.BLUETOOTH = 0] = "BLUETOOTH", t[t.INDIRECT = 1] = "INDIRECT", t[t.USB = 2] = "USB"
}(pn || (pn = {})), function (t) {
	t[t.BASE = 0] = "BASE", t[t.HEADSET = 1] = "HEADSET", t[t.DESKSTAND = 2] = "DESKSTAND", t[t.OTHER = 3] = "OTHER", t[t.DONGLE = 4] = "DONGLE", t[t.PC = 5] = "PC", t[t.EHS = 6] = "EHS", t[t.USB = 7] = "USB", t[t.SPEAKER_PHONE = 8] = "SPEAKER_PHONE", t[t.INDICATOR = 9] = "INDICATOR", t[t.MOBILE = 10] = "MOBILE", t[t.NONE = 11] = "NONE", t[t.LOCAL = 12] = "LOCAL", t[t.DISPLAY = 13] = "DISPLAY", t[t.HS_CRADLE = 14] = "HS_CRADLE", t[t.HS_CRADLE2 = 15] = "HS_CRADLE2", t[t.MOBILE_IAP = 16] = "MOBILE_IAP", t[t.CRADLE = 17] = "CRADLE", t[t.VIDEO = 18] = "VIDEO", t[t.NOT_GN = 252] = "NOT_GN", t[t.ANY_GN = 253] = "ANY_GN", t[t.NOT_INIT = 254] = "NOT_INIT", t[t.ANY = 255] = "ANY"
}(fn || (fn = {}));

class vn {
	constructor(t, e, n, r, i, o, s, a, c, u, l) {
		this.id = t, this.type = e, this.hidChannel = n, this.events = r, this.primaryAddress = i, this.sendEvent = o, this.read = s, this.readWithParams = a, this.write = c, this.onDisconnect = u, this.parentConnectionId = l, this.onDisconnect.subscribe({error: N})
	}

	static createConnection(t, e, n, r, i, o) {
		const s = r.sendEvent.bind(r), a = r.read.bind(r), c = r.readWithParams.bind(r), u = r.write.bind(r);
		return new vn(t, e, n, r.events, r.primaryAddress, s, a, c, u, i, o)
	}
}

const En = (t = 3, e = 500) => n => n.pipe(It(((n, r) => {
	const i = r + 1;
	return i > t ? yt((() => n)) : Pt(i * i * e)
})));

function gn(t, e, n, r = 1e3, i = 3, o = 100) {
	return Lt((() => t.read(e, n, r))).pipe(se(En(i, o)))
}

function _n(t, e, n) {
	const {deviceType: r, address: i} = n;
	return {
		transportId: e.transportId,
		vid: e.vid,
		pid: gn(t, Ge, i),
		name: gn(t, xe, i),
		serialNumber: gn(t, Be, i),
		capabilities: e.capabilities,
		deviceType: r,
		connectionGnpAddress: i
	}
}

class bn {
	constructor(t, e, n = _n, r = vn.createConnection, i = cn) {
		this.parentConnection = e, this.connectionCreator = r, this.createChildGnpChannel = i;
		const o = e.events.pipe(jt((t => t.command === Re.DEVICE && t.subCommand === De.ATTACH_EVENT)), At((t => ({
			deviceType: t.payload[0],
			address: t.payload[1]
		})))).pipe(At(n.bind(null, e, t)));
		this.connectionEvents = o.pipe(At((t => {
			const n = $t(e.events.pipe(ie((e => e.command === Re.DEVICE && e.subCommand === De.DETACH_EVENT && e.payload[1] === t.connectionGnpAddress)), At(N)), e.onDisconnect);
			return {attach: t, detach: n}
		})), It((t => zt(mt(t.attach), this.createConnection(t.attach, t.detach)))), At((([t, e]) => ({
			event: t,
			connection: e
		}))), de(e.onDisconnect)), e.sendEvent(Pe, [])
	}

	createConnection(t, e) {
		const n = t.connectionGnpAddress, r = this.createChildGnpChannel(this.parentConnection, n),
			i = new hn(this.parentConnection.id, n);
		return mt(this.connectionCreator(i, pn.INDIRECT, this.parentConnection.hidChannel, r, e, this.parentConnection.id))
	}
}

const mn = {
	command: Re.IDENT, subCommand: De.TYPE, deserialize: t => {
		const {payload: e} = t, n = e[0];
		if (n < 1 || n >= e.length) throw new fe("Cannot get device type.", Gt.DEVICE_ERROR);
		return e[1]
	}
};

function yn(t, e, n, r = Ut.ERROR, i = xt.JS_LIB) {
	ve(`${t} ${function (t) {
		if (t instanceof fe) {
			const e = t;
			return `JabraError: ${e.message} (type: ${e.type})`
		}
		if (t instanceof Error) {
			const e = t;
			return `Error: ${e.message} (name: ${e.name})`
		}
		return `Unknown error: ${t}`
	}(e)}`, n, r, i)
}

function wn(t) {
	return new bn(t.event, t.connection).connectionEvents
}

class On {
	constructor(t, e, n = ((t, e, n) => new Je(t, e, n)), r = an, i = wn, o = vn.createConnection) {
		this.transport = t, this.logger = e, this.createHidChannel = n, this.createRootGnpChannel = r, this.connectionCreator = o;
		const s = this.transport.consoleAppEvent.pipe(jt((t => "attach" === t.event)), At(On.createAttachEvent), Jt(((t, e) => (yn("", t, this.logger), e)))).pipe(At((t => {
				const e = this.transport.consoleAppEvent.pipe(jt((t => "detach" === t.event)), ie((e => On.getTransportId(e) === t.transportId)), At(N), ue());
				return e.subscribe(), {attach: t, detach: e}
			})), It((t => this.createConnection(t.attach, t.detach))), ae()),
			a = s.pipe(jt((t => t.event.deviceType === fn.DONGLE)), jt((t => on.supportsGnpOverHid(t.connection.hidChannel))), It((t => i(t))));
		this.connectionEvents = kt(s, a).pipe(ae())
	}

	static convertToReportType(t) {
		switch (t) {
			case"input":
				return Ke.INPUT;
			case"output":
				return Ke.OUTPUT;
			case"feature":
				return Ke.FEATURE;
			default:
				throw new fe(`${t} is not a valid ReportType`, Gt.UNEXPECTED_ERROR)
		}
	}

	static convertToValueType(t) {
		switch (t) {
			case"absolute":
				return Ve.ABSOLUTE;
			case"relative":
				return Ve.RELATIVE;
			default:
				throw new fe(`${t} Not a valid ValueType`, Gt.UNEXPECTED_ERROR)
		}
	}

	static createDescriptor(t) {
		return t.map((t => ({
			reportType: On.convertToReportType(t.reportType),
			usagePage: t.usagePage,
			usage: t.usage,
			valueType: On.convertToValueType(t.valueType),
			reportSize: t.reportSize
		})))
	}

	static getMandatoryField(t, e) {
		const n = t[e];
		if (void 0 === n) throw new fe(`JSON event lacks required field "${e}: ${JSON.stringify(t)}`, Gt.UNEXPECTED_ERROR);
		return n
	}

	static getTransportId(t) {
		return On.getMandatoryField(t, "id")
	}

	static createAttachEvent(t) {
		return {
			transportId: On.getTransportId(t),
			vid: On.getMandatoryField(t, "vid"),
			pid: mt(On.getMandatoryField(t, "pid")),
			name: mt(On.getMandatoryField(t, "name")),
			serialNumber: mt(On.getMandatoryField(t, "serialNumber")),
			capabilities: On.createDescriptor(On.getMandatoryField(t, "descriptor"))
		}
	}

	createConnection(t, e, n = 3, r = 100) {
		const {capabilities: i, transportId: o} = t, s = new ln(o), a = this.createHidChannel(s, i, this.transport),
			c = this.createRootGnpChannel(a, this.transport, o, e).pipe(Jt(((t, e) => (t.type && t.type === Gt.DEVICE_ERROR && this.transport.context === Mt.WEB_HID && ve("Child devices are not yet supported when using WebHID.", this.logger, Ut.WARNING, xt.JS_LIB), mt(new un)))), ae()),
			u = c.pipe(It((t => t.read(mn))), se(En(n, r)), Jt((t => mt(fn.ANY))));
		return zt(c, u).pipe(de(e), At((([n, r]) => ({
			event: Object.assign(Object.assign({}, t), {
				deviceType: r,
				connectionGnpAddress: n.primaryAddress
			}), connection: this.connectionCreator(s, pn.USB, a, n, e)
		}))))
	}
}

var Nn, Cn, Tn, Sn, An;

class In {
	constructor(t, r, i, o, s, a) {
		this.vendorId = t, this.productId = r, this.serialNumber = i, this.name = o, this.type = s, Cn.set(this, void 0), n(this, Cn, new ge(a, e(In, Nn, "m", Sn)), "f"), this.connectionAdded = e(this, Cn, "f").itemAdded, this.connectionRemoved = e(this, Cn, "f").itemRemoved, this.connectionList = e(this, Cn, "f").itemList, this.onDisconnect = e(this, Cn, "f").itemList.pipe(le(1), ie((t => 0 === t.length)), At(N), ae())
	}

	get id() {
		return qe(this.vendorId, this.productId, this.serialNumber)
	}

	get currentConnections() {
		return e(this, Cn, "f").getValue()
	}

	get browserLabel() {
		return `${this.vendorId.toString(16).padStart(4, "0")}:${this.productId.toString(16).padStart(4, "0")}`
	}
}

Nn = In, Cn = new WeakMap, Sn = function (t, n) {
	return e(In, Nn, "f", Tn).indexOf(t.type) - e(In, Nn, "f", Tn).indexOf(n.type)
}, Tn = {value: [pn.USB, pn.INDIRECT, pn.BLUETOOTH]};

class Rn {
	constructor(t) {
		this.deviceObservables = new ge(t)
	}

	static exceptionToUndefined(t) {
		try {
			return t()
		} catch (t) {
			if (t instanceof fe) return;
			throw t
		}
	}

	connectionExists(t) {
		return void 0 !== Rn.exceptionToUndefined((() => this.findConnectionById(t)))
	}

	findConnectionById(t) {
		for (const e of this.deviceObservables.getValue()) for (const n of e.currentConnections) if (n.id.equals(t)) return n;
		throw new fe(`Could not find connection with id ${t.toString()}`, Gt.UNEXPECTED_ERROR)
	}

	findDeviceByDeviceId(t) {
		return this.deviceObservables.getValue().find((e => e.id.startsWith(t) || t.startsWith(e.id)))
	}
}

class Dn {
	constructor(t, e) {
		this.logger = e;
		const [n, r] = (i = t.pipe(jt((t => !this.deviceCollection.connectionExists(t.connection.id))), Xt((t => this.force(t)))), [jt(o = ({event: t, pid: e, serialNumber: n}) => !this.deviceCollection.findDeviceByDeviceId(qe(t.event.vid, e, n)), s)(ht(i)), jt(Yt(o, s))(ht(i))]);
		var i, o, s;
		const a = n.pipe(At((t => Dn.createDevice(t, r))));
		this.deviceCollection = new Rn(a), this.deviceObservables = this.deviceCollection.deviceObservables
	}

	force(t) {
		const {name: e, pid: n, serialNumber: r} = t.event,
			i = t.connection.onDisconnect.pipe((o = yt((() => new Error(`Connection with ID ${t.connection.id} disconnected`))), p(s) ? Xt((function () {
				return o
			}), s) : Xt((function () {
				return o
			}))));
		var o, s;
		return zt(e, n, r).pipe(At((([e, n, r]) => ({event: t, name: e, pid: n, serialNumber: r}))), function () {
			for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
			return t.length ? k((function (e, n) {
				qt(u([e], c(t)))(n)
			})) : D
		}(i), Jt((t => (ve(`Failed to retrieve child connection information. Error: ${t}`, this.logger, Ut.WARNING, xt.JS_LIB), J))))
	}

	static createDevice(t, e) {
		const {event: n, pid: r, name: i, serialNumber: o} = t, {vid: s, deviceType: a} = n.event,
			c = e.pipe(jt((e => Dn.isSameDevice(t, e))), At((t => t.event.connection))), u = Ht(mt(n.connection), c);
		return new In(s, r, o, i, a, u)
	}

	static isSameDevice(t, e) {
		const n = qe(t.event.event.vid, t.pid, t.serialNumber), r = qe(e.event.event.vid, e.pid, e.serialNumber);
		return n.startsWith(r) || r.startsWith(n)
	}

	static create(t, e) {
		const n = new On(t, e);
		return new Dn(n.connectionEvents)
	}
}

function Hn(e) {
	var n, r, i;
	return t(this, void 0, void 0, (function* () {
		const t = null == e ? void 0 : e.logger;
		ve("Jabra SDK JS starting up...", t, Ut.INFO);
		const o = new Ne(e);
		o.validateOrganizationKey(), o.validateAppId(), o.validateAppName();
		const s = null !== (r = null === (n = null == e ? void 0 : e.internal) || void 0 === n ? void 0 : n.testDeviceTransport) && void 0 !== r ? r : yield ye(t, null == e ? void 0 : e.transport, null === (i = null == e ? void 0 : e.internal) || void 0 === i ? void 0 : i.recorder);
		new we(s, t);
		const a = Dn.create(s, t), c = new be(a, s, e);
		return yield s.connect(), c
	}))
}

class Ln {
	constructor(t, e, n, r) {
		this.deviceId = t, this.usagePage = e, this.usage = n, this.value = r
	}
}

class Pn {
	constructor(t, e) {
		this.token = t, this.value = e
	}
}

!function (t) {
	t.UsageReport = class {
		constructor(t, e) {
			this.usage = t, this.value = e
		}
	}
}(An || (An = {}));
var kn, Un, xn, Gn, Fn, Mn, Bn, Wn, Kn, Vn, Yn = We((function (t) {
	!function (e) {
		var n = function (t, e, n) {
			if (!(t instanceof ArrayBuffer || "undefined" != typeof Buffer && t instanceof Buffer)) throw new Error("Must specify a valid ArrayBuffer or Buffer.");
			e = e || 0, n = n || t.byteLength || t.length, this._view = new Uint8Array(t.buffer || t, e, n), this.bigEndian = !1
		};
		n._scratch = new DataView(new ArrayBuffer(8)), Object.defineProperty(n.prototype, "buffer", {
			get: function () {
				return "undefined" != typeof Buffer ? Buffer.from(this._view.buffer) : this._view.buffer
			}, enumerable: !0, configurable: !1
		}), Object.defineProperty(n.prototype, "byteLength", {
			get: function () {
				return this._view.length
			}, enumerable: !0, configurable: !1
		}), n.prototype._setBit = function (t, e) {
			e ? this._view[t >> 3] |= 1 << (7 & t) : this._view[t >> 3] &= ~(1 << (7 & t))
		}, n.prototype.getBits = function (t, e, n) {
			var r = 8 * this._view.length - t;
			if (e > r) throw new Error("Cannot get " + e + " bit(s) from offset " + t + ", " + r + " available");
			for (var i = 0, o = 0; o < e;) {
				var s = e - o, a = 7 & t, c = this._view[t >> 3], u = Math.min(s, 8 - a);
				this.bigEndian ? (i <<= u, i |= c >> 8 - u - a & ~(255 << u)) : i |= (c >> a & ~(255 << u)) << o, t += u, o += u
			}
			return n ? (32 !== e && i & 1 << e - 1 && (i |= -1 ^ (1 << e) - 1), i) : i >>> 0
		}, n.prototype.setBits = function (t, e, n) {
			var r = 8 * this._view.length - t;
			if (n > r) throw new Error("Cannot set " + n + " bit(s) from offset " + t + ", " + r + " available");
			for (var i = 0; i < n;) {
				var o, s, a, c = n - i, u = 7 & t, l = t >> 3, h = Math.min(c, 8 - u);
				if (this.bigEndian) {
					s = e >> n - i - h & (o = ~(-1 << h));
					var d = 8 - u - h;
					a = ~(o << d), this._view[l] = this._view[l] & a | s << d
				} else s = e & (o = ~(255 << h)), e >>= h, a = ~(o << u), this._view[l] = this._view[l] & a | s << u;
				t += h, i += h
			}
		}, n.prototype.getBoolean = function (t) {
			return 0 !== this.getBits(t, 1, !1)
		}, n.prototype.getInt8 = function (t) {
			return this.getBits(t, 8, !0)
		}, n.prototype.getUint8 = function (t) {
			return this.getBits(t, 8, !1)
		}, n.prototype.getInt16 = function (t) {
			return this.getBits(t, 16, !0)
		}, n.prototype.getUint16 = function (t) {
			return this.getBits(t, 16, !1)
		}, n.prototype.getInt32 = function (t) {
			return this.getBits(t, 32, !0)
		}, n.prototype.getUint32 = function (t) {
			return this.getBits(t, 32, !1)
		}, n.prototype.getFloat32 = function (t) {
			return n._scratch.setUint32(0, this.getUint32(t)), n._scratch.getFloat32(0)
		}, n.prototype.getFloat64 = function (t) {
			return n._scratch.setUint32(0, this.getUint32(t)), n._scratch.setUint32(4, this.getUint32(t + 32)), n._scratch.getFloat64(0)
		}, n.prototype.setBoolean = function (t, e) {
			this.setBits(t, e ? 1 : 0, 1)
		}, n.prototype.setInt8 = n.prototype.setUint8 = function (t, e) {
			this.setBits(t, e, 8)
		}, n.prototype.setInt16 = n.prototype.setUint16 = function (t, e) {
			this.setBits(t, e, 16)
		}, n.prototype.setInt32 = n.prototype.setUint32 = function (t, e) {
			this.setBits(t, e, 32)
		}, n.prototype.setFloat32 = function (t, e) {
			n._scratch.setFloat32(0, e), this.setBits(t, n._scratch.getUint32(0), 32)
		}, n.prototype.setFloat64 = function (t, e) {
			n._scratch.setFloat64(0, e), this.setBits(t, n._scratch.getUint32(0), 32), this.setBits(t + 32, n._scratch.getUint32(4), 32)
		}, n.prototype.getArrayBuffer = function (t, e) {
			for (var n = new Uint8Array(e), r = 0; r < e; r++) n[r] = this.getUint8(t + 8 * r);
			return n
		};
		var r = function (t, e) {
			return function () {
				if (this._index + e > this._length) throw new Error("Trying to read past the end of the stream");
				var n = this._view[t](this._index);
				return this._index += e, n
			}
		}, i = function (t, e) {
			return function (n) {
				this._view[t](this._index, n), this._index += e
			}
		};

		function o(t, e, n) {
			if (0 === e) return "";
			var r = 0, i = [], o = !0, s = !!e;
			for (e || (e = Math.floor((t._length - t._index) / 8)); r < e;) {
				var a = t.readUint8();
				if (0 === a && (o = !1, !s)) break;
				o && i.push(a), r++
			}
			var c = String.fromCharCode.apply(null, i);
			if (!n) return c;
			try {
				return decodeURIComponent(escape(c))
			} catch (t) {
				return c
			}
		}

		var s = function (t, e, r) {
			var i = t instanceof ArrayBuffer || "undefined" != typeof Buffer && t instanceof Buffer;
			if (!(t instanceof n || i)) throw new Error("Must specify a valid BitView, ArrayBuffer or Buffer");
			this._view = i ? new n(t, e, r) : t, this._index = 0, this._startIndex = 0, this._length = 8 * this._view.byteLength
		};
		Object.defineProperty(s.prototype, "index", {
			get: function () {
				return this._index - this._startIndex
			}, set: function (t) {
				this._index = t + this._startIndex
			}, enumerable: !0, configurable: !0
		}), Object.defineProperty(s.prototype, "length", {
			get: function () {
				return this._length - this._startIndex
			}, set: function (t) {
				this._length = t + this._startIndex
			}, enumerable: !0, configurable: !0
		}), Object.defineProperty(s.prototype, "bitsLeft", {
			get: function () {
				return this._length - this._index
			}, enumerable: !0, configurable: !0
		}), Object.defineProperty(s.prototype, "byteIndex", {
			get: function () {
				return Math.ceil(this._index / 8)
			}, set: function (t) {
				this._index = 8 * t
			}, enumerable: !0, configurable: !0
		}), Object.defineProperty(s.prototype, "buffer", {
			get: function () {
				return this._view.buffer
			}, enumerable: !0, configurable: !1
		}), Object.defineProperty(s.prototype, "view", {
			get: function () {
				return this._view
			}, enumerable: !0, configurable: !1
		}), Object.defineProperty(s.prototype, "bigEndian", {
			get: function () {
				return this._view.bigEndian
			}, set: function (t) {
				this._view.bigEndian = t
			}, enumerable: !0, configurable: !1
		}), s.prototype.readBits = function (t, e) {
			var n = this._view.getBits(this._index, t, e);
			return this._index += t, n
		}, s.prototype.writeBits = function (t, e) {
			this._view.setBits(this._index, t, e), this._index += e
		}, s.prototype.readBoolean = r("getBoolean", 1), s.prototype.readInt8 = r("getInt8", 8), s.prototype.readUint8 = r("getUint8", 8), s.prototype.readInt16 = r("getInt16", 16), s.prototype.readUint16 = r("getUint16", 16), s.prototype.readInt32 = r("getInt32", 32), s.prototype.readUint32 = r("getUint32", 32), s.prototype.readFloat32 = r("getFloat32", 32), s.prototype.readFloat64 = r("getFloat64", 64), s.prototype.writeBoolean = i("setBoolean", 1), s.prototype.writeInt8 = i("setInt8", 8), s.prototype.writeUint8 = i("setUint8", 8), s.prototype.writeInt16 = i("setInt16", 16), s.prototype.writeUint16 = i("setUint16", 16), s.prototype.writeInt32 = i("setInt32", 32), s.prototype.writeUint32 = i("setUint32", 32), s.prototype.writeFloat32 = i("setFloat32", 32), s.prototype.writeFloat64 = i("setFloat64", 64), s.prototype.readASCIIString = function (t) {
			return function (t, e) {
				return o(t, e, !1)
			}(this, t)
		}, s.prototype.readUTF8String = function (t) {
			return function (t, e) {
				return o(t, e, !0)
			}(this, t)
		}, s.prototype.writeASCIIString = function (t, e) {
			!function (t, e, n) {
				for (var r = n || e.length + 1, i = 0; i < r; i++) t.writeUint8(i < e.length ? e.charCodeAt(i) : 0)
			}(this, t, e)
		}, s.prototype.writeUTF8String = function (t, e) {
			!function (t, e, n) {
				for (var r = function (t) {
					var e, n, r = [];
					for (e = 0; e < t.length; e++) (n = t.charCodeAt(e)) <= 127 ? r.push(n) : n <= 2047 ? (r.push(n >> 6 | 192), r.push(63 & n | 128)) : n <= 65535 ? (r.push(n >> 12 | 224), r.push(n >> 6 & 63 | 128), r.push(63 & n | 128)) : (r.push(n >> 18 | 240), r.push(n >> 12 & 63 | 128), r.push(n >> 6 & 63 | 128), r.push(63 & n | 128));
					return r
				}(e), i = n || r.length + 1, o = 0; o < i; o++) t.writeUint8(o < r.length ? r[o] : 0)
			}(this, t, e)
		}, s.prototype.readBitStream = function (t) {
			var e = new s(this._view);
			return e._startIndex = this._index, e._index = this._index, e.length = t, this._index += t, e
		}, s.prototype.writeBitStream = function (t, e) {
			var n;
			for (e || (e = t.bitsLeft); e > 0;) n = Math.min(e, 32), this.writeBits(t.readBits(n), n), e -= n
		}, s.prototype.readArrayBuffer = function (t) {
			var e = this._view.getArrayBuffer(this._index, t);
			return this._index += 8 * t, e
		}, s.prototype.writeArrayBuffer = function (t, e) {
			this.writeBitStream(new s(t), 8 * e)
		}, t.exports && (t.exports = {BitView: n, BitStream: s})
	}()
}));

function jn() {
	return t(this, void 0, void 0, (function* () {
		const {hid: t} = window.navigator;
		if (!t) throw new fe("WebHID not supported", Gt.INIT_ERROR);
		yield t.requestDevice({filters: [{vendorId: kn.VENDOR_ID}]});
		new BroadcastChannel(kn.PAIRING_CHANNEL).postMessage(null)
	}))
}

!function (t) {
	t[t.VENDOR_ID = 2830] = "VENDOR_ID", t.PAIRING_CHANNEL = "jabra-webhid-pairing-channel"
}(kn || (kn = {})), function (t) {
	t[t.HOOK_SWITCH = 32] = "HOOK_SWITCH", t[t.FLASH = 33] = "FLASH", t[t.ALT_HOLD = 35] = "ALT_HOLD", t[t.REDIAL = 36] = "REDIAL", t[t.ONLINE = 42] = "ONLINE", t[t.SPEAKER_PHONE = 43] = "SPEAKER_PHONE", t[t.PHONE_MUTE = 47] = "PHONE_MUTE", t[t.SEND = 49] = "SEND", t[t.SPEED_DIAL = 80] = "SPEED_DIAL", t[t.VOICE_MAIL = 112] = "VOICE_MAIL", t[t.ANSWER_ON_OFF = 116] = "ANSWER_ON_OFF", t[t.LINE_BUSY = 151] = "LINE_BUSY", t[t.RINGER = 158] = "RINGER", t[t.PHONE_KEY_0 = 176] = "PHONE_KEY_0", t[t.PHONE_KEY_1 = 177] = "PHONE_KEY_1", t[t.PHONE_KEY_2 = 178] = "PHONE_KEY_2", t[t.PHONE_KEY_3 = 179] = "PHONE_KEY_3", t[t.PHONE_KEY_4 = 180] = "PHONE_KEY_4", t[t.PHONE_KEY_5 = 181] = "PHONE_KEY_5", t[t.PHONE_KEY_6 = 182] = "PHONE_KEY_6", t[t.PHONE_KEY_7 = 183] = "PHONE_KEY_7", t[t.PHONE_KEY_8 = 184] = "PHONE_KEY_8", t[t.PHONE_KEY_9 = 185] = "PHONE_KEY_9", t[t.PHONE_KEY_STAR = 186] = "PHONE_KEY_STAR", t[t.PHONE_KEY_POUND = 187] = "PHONE_KEY_POUND", t[t.ALT_VOLUME_UP = 233] = "ALT_VOLUME_UP", t[t.ALT_VOLUME_DOWN = 234] = "ALT_VOLUME_DOWN", t[t.REJECT_CALL = 65533] = "REJECT_CALL"
}(Un || (Un = {}));

class $n {
	constructor(t, e, n) {
		this.type = t, this.value = e, this.valueType = n
	}

	toString() {
		return void 0 === Un[this.type] ? `Unknown signal: type: ${this.type}, value: ${this.value}, valueType: ${this.valueType}` : `Signal: type: ${Un[this.type]}, value: ${this.value}, valueType: ${this.valueType}`
	}
}

!function (t) {
	t[t.BUTTON = 9] = "BUTTON", t[t.CONSUMER = 12] = "CONSUMER", t[t.LED = 8] = "LED", t[t.TELEPHONY = 11] = "TELEPHONY", t[t.GN_CONSUMER = 65312] = "GN_CONSUMER", t[t.GN_EXT_BUTTONS = 65360] = "GN_EXT_BUTTONS", t[t.GN_LED = 65344] = "GN_LED", t[t.GN_MISC = 65376] = "GN_MISC", t[t.GN_TELEPHONY = 65328] = "GN_TELEPHONY"
}(xn || (xn = {})), function (t) {
	t[t.MUTE = 9] = "MUTE", t[t.OFF_HOOK = 23] = "OFF_HOOK", t[t.RING = 24] = "RING", t[t.MESSAGE_WAIT = 25] = "MESSAGE_WAIT", t[t.HOLD = 32] = "HOLD", t[t.MIC_MUTE = 33] = "MIC_MUTE", t[t.ONLINE = 42] = "ONLINE", t[t.HID_OFFLINE = 43] = "HID_OFFLINE"
}(Gn || (Gn = {})), function (t) {
	t[t.HOOK_SWITCH = 32] = "HOOK_SWITCH", t[t.FLASH = 33] = "FLASH", t[t.HOLD = 35] = "HOLD", t[t.REDIAL = 36] = "REDIAL", t[t.ONLINE = 42] = "ONLINE", t[t.SPEAKER_PHONE = 43] = "SPEAKER_PHONE", t[t.MUTE = 47] = "MUTE", t[t.HID_SEND = 49] = "HID_SEND", t[t.SPEED_DIAL = 80] = "SPEED_DIAL", t[t.VOICE_MAIL = 112] = "VOICE_MAIL", t[t.ANSWER_ON_OFF = 116] = "ANSWER_ON_OFF", t[t.LINE_BUSY = 151] = "LINE_BUSY", t[t.RINGER = 158] = "RINGER", t[t.PHONE_KEY_0 = 176] = "PHONE_KEY_0", t[t.PHONE_KEY_1 = 177] = "PHONE_KEY_1", t[t.PHONE_KEY_2 = 178] = "PHONE_KEY_2", t[t.PHONE_KEY_3 = 179] = "PHONE_KEY_3", t[t.PHONE_KEY_4 = 180] = "PHONE_KEY_4", t[t.PHONE_KEY_5 = 181] = "PHONE_KEY_5", t[t.PHONE_KEY_6 = 182] = "PHONE_KEY_6", t[t.PHONE_KEY_7 = 183] = "PHONE_KEY_7", t[t.PHONE_KEY_8 = 184] = "PHONE_KEY_8", t[t.PHONE_KEY_9 = 185] = "PHONE_KEY_9", t[t.PHONE_KEY_STAR = 186] = "PHONE_KEY_STAR", t[t.PHONE_KEY_POUND = 187] = "PHONE_KEY_POUND", t[t.HID_ALT_VOLUME_UP = 233] = "HID_ALT_VOLUME_UP", t[t.HID_ALT_VOLUME_DOWN = 234] = "HID_ALT_VOLUME_DOWN", t[t.GN_PSEUDO_HOOK_SWITCH = 65531] = "GN_PSEUDO_HOOK_SWITCH", t[t.GN_OUT_OF_RANGE = 65532] = "GN_OUT_OF_RANGE", t[t.GN_REJECT_CALL = 65533] = "GN_REJECT_CALL", t[t.GN_TELEPHONY_CONT_SET = 65535] = "GN_TELEPHONY_CONT_SET"
}(Fn || (Fn = {}));

class qn {
	constructor(t, e, n, r, i) {
		this.hidChannel = t, this.onDisconnect = e, this.isSoftphoneInFocus = n, this.lockHeld = r, this.logger = i, this.cachedSignals = new Map
	}

	setup() {
		const t = this.filter().pipe(ae());
		return t.subscribe(), t
	}

	filter() {
		const t = this.hidChannel.input.pipe(jt((t => t.usagePage === xn.GN_TELEPHONY && !t.isArray())), It((t => {
				const e = this.hidChannel.descriptor.find((e => e.usagePage === t.usagePage && e.usage === t.usage));
				return (null == e ? void 0 : e.valueType) ? mt(Object.assign(Object.assign({}, t), {valueType: e.valueType})) : (yn("", new fe(`Unable to find value-type in descriptor for UsagePage: ${t.usagePage} and Usage: ${t.usage}`, Gt.FEATURE_NOT_SUPPORTED), this.logger), J)
			})), jt((t => {
				if (t.valueType === Ve.RELATIVE) return Boolean(t.value);
				return this.cachedSignals.get(t.usage) !== t.value
			})), pe((t => {
				this.cachedSignals.set(t.usage, t.value)
			})), de(this.onDisconnect), ae()), e = [Un.HOOK_SWITCH, Un.REDIAL],
			n = t.pipe(Xe(this.isSoftphoneInFocus), jt((t => e.includes(t.usage) && !this.lockHeld.getValue())));
		return kt(t.pipe(jt((t => this.lockHeld.getValue()))), n).pipe(At((t => new $n(t.usage, 0 !== t.value, t.valueType))), Jt((t => (ve(t.message, this.logger), J))))
	}
}

class zn {
	constructor(t, r, i, o, s, a) {
		this.device = t, this.onDisconnect = i, Mn.set(this, void 0), Bn.set(this, new M(!1)), Wn.set(this, void 0), Kn.set(this, !1), this.deviceSignals = new G, n(this, Mn, o, "f"), e(this, Mn, "f").lockHeld.subscribe(e(this, Bn, "f")), n(this, Wn, r, "f"), this.onDisconnect.pipe(ie(), At((() => !0))).subscribe((t => {
			n(this, Kn, t, "f")
		}));
		const c = new qn(e(this, Wn, "f"), this.onDisconnect, s, e(this, Bn, "f"), a);
		this.deviceSignals = c.setup()
	}

	checkCallLockHeld(t) {
		if (!e(this, Bn, "f").getValue()) throw new fe(t, Gt.SDK_USAGE_ERROR)
	}

	checkCallLockNotHeld(t) {
		if (e(this, Bn, "f").getValue()) throw new fe(t, Gt.SDK_USAGE_ERROR)
	}

	checkHasDisconnected() {
		if (e(this, Kn, "f")) throw new fe("CallControl cannot be performed as the connection has disconnected.", Gt.SDK_USAGE_ERROR)
	}

	takeCallLock() {
		return this.checkHasDisconnected(), this.checkCallLockNotHeld("Trying to take the call lock, but it is already held!"), function (t, e) {
			var n = "object" == typeof e;
			return new Promise((function (r, i) {
				var o, s = !1;
				t.subscribe({
					next: function (t) {
						o = t, s = !0
					}, error: i, complete: function () {
						s ? r(o) : n ? r(e.defaultValue) : i(new wt)
					}
				})
			}))
		}(e(this, Mn, "f").tryTakeCallLock())
	}

	releaseCallLock() {
		this.checkHasDisconnected(), this.checkCallLockHeld("Trying to release the call lock, but it is not held!"), e(this, Mn, "f").releaseCallLock()
	}

	offHook(t) {
		this.checkHasDisconnected(), this.checkCallLockHeld("Calls can only be started and stopped when the call lock is held.");
		const n = e(this, Wn, "f").findDescriptor(xn.GN_LED, Gn.OFF_HOOK, Ke.OUTPUT);
		if (!n) throw new fe(`Device ${this.device.name} does not support any offHook functionality.`, Gt.FEATURE_NOT_SUPPORTED);
		const r = t ? 1 : 0;
		e(this, Wn, "f").output(n.usagePage, n.usage, r)
	}

	ring(t) {
		this.checkHasDisconnected(), this.checkCallLockHeld("The ringer state can only be modified when the call lock is held.");
		const n = e(this, Wn, "f").findDescriptor(xn.GN_LED, Gn.RING, Ke.OUTPUT),
			r = e(this, Wn, "f").findDescriptor(xn.GN_TELEPHONY, Fn.RINGER, Ke.OUTPUT);
		if (!n && !r) throw new fe(`Device ${this.device.name} does not support any ring functionality.`, Gt.FEATURE_NOT_SUPPORTED);
		if (n) {
			const r = t ? 1 : 0;
			e(this, Wn, "f").output(n.usagePage, n.usage, r)
		}
		if (r) {
			const n = t ? 1 : 0;
			e(this, Wn, "f").output(r.usagePage, r.usage, n)
		}
	}

	mute(t) {
		this.checkHasDisconnected(), this.checkCallLockHeld("The mute state can only be modified when the call lock is held.");
		let n = e(this, Wn, "f").findDescriptor(xn.GN_LED, Gn.MIC_MUTE, Ke.OUTPUT);
		if (n || (n = e(this, Wn, "f").findDescriptor(xn.GN_LED, Gn.MUTE, Ke.OUTPUT)), !n) throw new fe(`Device ${this.device.name} does not support any mute functionality.`, Gt.FEATURE_NOT_SUPPORTED);
		const r = t ? 1 : 0;
		e(this, Wn, "f").output(n.usagePage, n.usage, r)
	}

	hold(t) {
		this.checkHasDisconnected(), this.checkCallLockHeld("The hold state can only be modified when the call lock is held.");
		const n = e(this, Wn, "f").findDescriptor(xn.GN_LED, Gn.HOLD, Ke.OUTPUT);
		if (!n) throw new fe(`Device ${this.device.name} does not support hold functionality.`, Gt.FEATURE_NOT_SUPPORTED);
		const r = t ? 1 : 0;
		e(this, Wn, "f").output(n.usagePage, n.usage, r)
	}
}

Mn = new WeakMap, Bn = new WeakMap, Wn = new WeakMap, Kn = new WeakMap, function (t) {
	t[t.STD_TELEPHONY = 0] = "STD_TELEPHONY", t[t.GN_TELEPHONY = 1] = "GN_TELEPHONY"
}(Vn || (Vn = {}));
const Jn = {
	[Ce.SKYPE]: Vn.GN_TELEPHONY,
	[Ce.CISCO]: Vn.GN_TELEPHONY,
	[Ce.AVAYA]: Vn.GN_TELEPHONY,
	[Ce.SIEMENS]: Vn.GN_TELEPHONY,
	[Ce.IBM]: Vn.GN_TELEPHONY,
	[Ce.AASTRA]: Vn.GN_TELEPHONY,
	[Ce.JABRA]: Vn.GN_TELEPHONY,
	[Ce.NEC]: Vn.GN_TELEPHONY,
	[Ce.SHORETEL]: Vn.GN_TELEPHONY,
	[Ce.MS_OC]: Vn.STD_TELEPHONY,
	[Ce.ALCATEL]: Vn.STD_TELEPHONY,
	[Ce.OTHER]: Vn.STD_TELEPHONY,
	[Ce.NORTEL]: null,
	[Ce.GENERIC]: null
};

function Xn(t, e) {
	const n = t.read(new Fe).pipe(At((t => Jn[t] === e))),
		r = t.read(new Ue).pipe(At((t => t.find((t => Jn[t] === e))))).pipe(At((e => e ? t.write(new Fe, e) : mt(!1))), he());
	return n.pipe((i = mt(!0), o = r, t => t.pipe(At((t => t ? i : o)), he())));
	var i, o
}

class Qn {
	constructor(t, e, n) {
		this.connectionCallLock = t, this.device = e, this.logger = n, this.lockHeld = new M(!1), this.currentLocks = new M([]), this.lockReleaseEvent = new G, this.lockReleaseEvent.subscribe((() => this.lockHeld.next(!1)))
	}

	tryTakeCallLock() {
		const {currentConnections: t} = this.device, e = [],
			n = Lt((() => lt(t).pipe(Xt((t => this.takeSingleCallLock(t))), pe((t => e.push(t)))))).pipe(function (t, e) {
				var n = arguments.length >= 2;
				return function (r) {
					return r.pipe(t ? jt((function (e, n) {
						return t(e, n, r)
					})) : D, oe(1), n ? Qt(e) : ne((function () {
						return new wt
					})))
				}
			}(), Jt((t => mt(""))), At((n => (this.currentLocks.next(e), e.length !== t.length ? (this.releaseCallLock(), !1) : (this.lockHeld.next(!0), !0)))), ae());
		return n.subscribe((t => {
			t && (this.device.connectionAdded.pipe(de(this.lockReleaseEvent)).subscribe((t => {
				this.takeSingleCallLock(t).pipe(At((t => {
					this.currentLocks.getValue().push(t), this.currentLocks.next(this.currentLocks.getValue())
				})), se(En())).subscribe({
					error: t => {
						ve(`Failed to acquire the call lock on a new connection.\n                  Another softphone running an old SDK has most likely acquired this lock.\n                  Full error: ${t}`, this.logger, Ut.WARNING, xt.JS_LIB)
					}
				})
			})), this.device.connectionRemoved.pipe(de(this.lockReleaseEvent)).subscribe((t => this.releaseSingleCallLock(t.id.transportId))))
		})), n
	}

	takeSingleCallLock(t) {
		return Lt((() => this.connectionCallLock.tryTakeCallLock(t.id.transportId))).pipe(At((e => e.acquired ? mt(e.transportId) : yt((() => new fe(`Failed to acquire call lock on connection ${t.id.transportId}`, Gt.SDK_USAGE_ERROR))))), he())
	}

	releaseCallLock() {
		this.lockReleaseEvent.next();
		[...this.currentLocks.getValue()].forEach((t => {
			try {
				this.releaseSingleCallLock(t)
			} catch (t) {
			}
		})), this.currentLocks.next([])
	}

	releaseSingleCallLock(t) {
		this.connectionCallLock.releaseCallLock(t);
		const e = this.currentLocks.getValue().findIndex((e => e === t));
		if (e > -1) {
			const t = this.currentLocks.getValue();
			t.splice(e, 1), this.currentLocks.next(t)
		}
		0 !== this.currentLocks.getValue().length && 0 !== this.device.currentConnections.length || this.lockReleaseEvent.next()
	}
}

class Zn {
	constructor(t) {
		this.transport = t, this.callLockAcquiredResponse = this.transport.consoleAppEvent.pipe(jt((t => "response-call-lock" === t.event)), At((t => ({
			transportId: t.id,
			acquired: t.acquired
		}))))
	}

	tryTakeCallLock(t) {
		const e = {action: "request-call-lock", id: t};
		return this.transport.writeAction(e), this.callLockAcquiredResponse.pipe(ie((e => e.transportId === t)))
	}

	releaseCallLock(t) {
		const e = {action: "release-call-lock", id: t};
		this.transport.writeAction(e)
	}
}

const tr = [{usagePage: xn.GN_LED, usage: Gn.OFF_HOOK, reportType: Ke.OUTPUT}, {
	usagePage: xn.GN_LED,
	usage: Gn.RING,
	reportType: Ke.OUTPUT
}, {usagePage: xn.GN_TELEPHONY, usage: Fn.RINGER, reportType: Ke.OUTPUT}, {
	usagePage: xn.GN_LED,
	usage: Gn.MIC_MUTE,
	reportType: Ke.OUTPUT
}, {usagePage: xn.GN_LED, usage: Gn.MUTE, reportType: Ke.OUTPUT}, {
	usagePage: xn.GN_LED,
	usage: Gn.HOLD,
	reportType: Ke.OUTPUT
}], er = [pn.USB, pn.INDIRECT, pn.BLUETOOTH];

function nr(t, e) {
	const {hidChannel: n} = t;
	return !!function (t) {
		return tr.some((({usagePage: e, usage: n, reportType: r}) => t.findDescriptor(e, n, r)))
	}(n) && (!on.supportsGnpOverHid(n) || e !== fn.DONGLE && e !== fn.OTHER)
}

function rr(t) {
	const {currentConnections: e, type: n} = t;
	var r;
	return (r = e, [...r].sort(((t, e) => er.indexOf(t.type) - er.indexOf(e.type)))).find((t => nr(t, n)))
}

function ir(t, e, n, r, i) {
	const o = rr(t), {hidChannel: s, onDisconnect: a} = o, c = new Qn(new Zn(r), t, i);
	if (e) return mt(new zn(t, s, a, c, n.softphoneInFocus, i));
	if (r.context === Mt.WEB_HID) return mt(new zn(t, s, a, c, n.softphoneInFocus, i));
	return function (t, e) {
		return t.findDescriptor(xn.GN_TELEPHONY, Fn.GN_TELEPHONY_CONT_SET, Ke.FEATURE) ? Lt((() => (t.setFeatureReport(xn.GN_TELEPHONY, Fn.GN_TELEPHONY_CONT_SET, 1), mt(!0)))) : e ? Xn(e, Vn.GN_TELEPHONY) : mt(!1)
	}(s, o).pipe(At((e => new zn(t, s, a, c, n.softphoneInFocus, i))))
}

class or {
	constructor(t) {
		this.devComm = t, this.softphoneInFocus = new L, this.softphoneInFocus = this.devComm.consoleAppEvent.pipe(jt((t => "softphone-in-focus" === t.event)), At((t => t.infocus)), function () {
			for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
			var n = _t(t);
			return k((function (e, r) {
				(n ? Ht(t, e, n) : Ht(t, e)).subscribe(r)
			}))
		}(!1), ue(1)), this.softphoneInFocus.subscribe((() => {
		}))
	}

	setSharedSoftphoneInfo(t) {
		if (!(null == t ? void 0 : t.partnerKey) || !(null == t ? void 0 : t.appId)) return void ve("Unable to register with Jabra Direct: partnerKey or appId missing in config", null == t ? void 0 : t.logger, Ut.WARNING);
		const e = t.partnerKey + t.appId, n = new Ye(5, "ns:OID", e);
		let {appName: r} = t;
		if ((!t.appName || t.appName.length < 3) && (ve("App name missing in config. Fall back to use appId as app name.", null == t ? void 0 : t.logger, Ut.WARNING), r = t.appId), r.length > 100) return void ve("Unable to register with Jabra Direct: appName must be below 100 characters.", null == t ? void 0 : t.logger, Ut.WARNING);
		const i = {action: "set-softphone-info", name: r, id: n.toString()};
		this.devComm.writeAction(i)
	}
}

var sr, ar, cr, ur, lr, hr, dr, pr, fr, vr, Er, gr, _r;

class br {
	constructor(t) {
		var r;
		sr.set(this, void 0), ar.set(this, void 0), cr.set(this, void 0), ur.set(this, void 0), n(this, ar, new or(t._transport), "f"), e(this, ar, "f").setSharedSoftphoneInfo(t._config), n(this, sr, t._transport, "f"), n(this, cr, null === (r = t._config) || void 0 === r ? void 0 : r.logger, "f"), n(this, ur, t._readyEvents.pipe(ie((t => "ready" === t.event)), At((t => t.jabraDirectInstalled))), "f")
	}

	createCallControl(t) {
		if (!this.supportsCallControl(t)) return Promise.reject(new fe(`Device ${t.name} does not support call control.`, Gt.FEATURE_NOT_SUPPORTED));
		return Ot(e(this, ur, "f").pipe(It((n => ir(t, n, e(this, ar, "f"), e(this, sr, "f"), e(this, cr, "f"))))))
	}

	supportsCallControl(t) {
		return void 0 !== rr(t)
	}
}

sr = new WeakMap, ar = new WeakMap, cr = new WeakMap, ur = new WeakMap, function (t) {
	t.HOLD_CURRENT = "hold-current", t.END_CURRENT = "end-current"
}(lr || (lr = {})), function (t) {
	t.MUTED = "muted", t.UNMUTED = "unmuted", t.NO_ONGOING_CALLS = "no-ongoing-calls"
}(hr || (hr = {})), function (t) {
	t.ON_HOLD = "on-hold", t.NOT_ON_HOLD = "not-on-hold", t.NO_ONGOING_CALLS = "no-ongoing-calls"
}(dr || (dr = {})), function (t) {
	t.NO_INCOMING = "no-incoming", t.AWAITING_RESPONSE = "awaiting-response", t.RESOLVING_RESPONSE = "resolving-response", t.RESOLVING_RESPONSE_FROM_DEVICE = "resolving-response-from-device", t.ACCEPTED = "accepted", t.REJECTED = "rejected"
}(pr || (pr = {}));

class mr {
	constructor(t) {
		this.state = t.value, t.subscribe((t => {
			this.state = t
		}))
	}
}

class yr extends mr {
	constructor(t, e, n, r, i, o) {
		super(t), this.commands = e, this.deviceSignals = n, this.enableFlash = r, this.onTeardown = i, this.logger = o
	}

	setupSignalListeners() {
		const e = this.extendedSignals.pipe(jt((t => t.allowed))), n = this.extendedSignals.pipe(jt((t => !t.allowed)));
		e.subscribe((t => {
			ve(`Accepted signal: ${Un[t.type]} [${t.value}]`, null == this ? void 0 : this.logger, Ut.INFO)
		})), n.subscribe((t => {
			ve(`Ignored signal: ${Un[t.type]} [${t.value}]`, null == this ? void 0 : this.logger, Ut.INFO)
		})), e.pipe(jt((t => t.type === Un.HOOK_SWITCH))).subscribe((t => {
			this.state.incomingCall !== pr.AWAITING_RESPONSE ? !1 === t.value && this.state.ongoingCalls > 0 && this.commands.hookHandler.endCall() : this.commands.incomingCallHandler.acceptIncomingCall(lr.END_CURRENT, !0)
		})), e.pipe(jt((t => t.type === Un.PHONE_MUTE))).subscribe((() => {
			const t = this.state.muteState === hr.MUTED ? hr.UNMUTED : hr.MUTED;
			this.commands.muteHandler.setMute(t)
		})), e.pipe(jt((t => t.type === Un.FLASH))).subscribe((() => t(this, void 0, void 0, (function* () {
			if (this.state.incomingCall === pr.AWAITING_RESPONSE) return void (yield this.commands.incomingCallHandler.acceptIncomingCall(lr.HOLD_CURRENT, !0));
			if (this.state.ongoingCalls > 1) return void this.commands.swapHandler.swapCalls();
			const t = this.state.holdState === dr.ON_HOLD ? dr.NOT_ON_HOLD : dr.ON_HOLD;
			this.commands.holdHandler.setHold(t)
		})))), e.pipe(jt((t => t.type === Un.REJECT_CALL))).subscribe((() => {
			this.state.incomingCall === pr.AWAITING_RESPONSE && this.commands.incomingCallHandler.rejectIncomingCall()
		}))
	}

	get extendedSignals() {
		return this.deviceSignals.pipe(It((t => {
			let e = !0;
			return t.type !== Un.FLASH || this.enableFlash || (e = !1), this.state.ignoreSignals && (e = !1), mt(Object.assign(Object.assign({}, t), {allowed: e}))
		})), de(this.onTeardown))
	}
}

class wr {
	constructor(t, r, i, o, s = !0) {
		this.logger = o, fr.set(this, void 0), vr.set(this, void 0), Er.set(this, new G), gr.set(this, !0), this.device = t.device, this.onDisconnect = t.onDisconnect, this.muteState = i.muteState, n(this, fr, r, "f"), n(this, vr, (() => i.unsubscribeState()), "f"), this.onDisconnect.pipe(ie()).subscribe((() => this.teardown(!1)));
		new yr(i.internalState, r, t.deviceSignals, s, e(this, Er, "f"), o).setupSignalListeners()
	}

	endCall() {
		return e(this, fr, "f").hookHandler.endCall()
	}

	signalIncomingCall() {
		return this._checkActive(), e(this, fr, "f").incomingCallHandler.signalIncomingCall()
	}

	rejectIncomingCall() {
		this._checkActive(), e(this, fr, "f").incomingCallHandler.rejectIncomingCall()
	}

	mute() {
		this._checkActive(), e(this, fr, "f").muteHandler.setMute(hr.MUTED)
	}

	unmute() {
		this._checkActive(), e(this, fr, "f").muteHandler.setMute(hr.UNMUTED)
	}

	teardown(t = !0) {
		this._checkActive(), n(this, gr, !1, "f"), e(this, vr, "f").call(this), e(this, Er, "f").next(void 0), t && e(this, fr, "f").callLock.forceReleaseCallLock(), ve("Teardown complete! Create new Easy Call Control instance to continue usage.", null == this ? void 0 : this.logger, Ut.INFO)
	}

	_setInitialState(t, n = !1, r = !1) {
		return 0 === t && (n || r) && ve("\n        Unable to set initial state: muted or onHold cannot be true unless a call is started.\n        Set callActive to true for SingleCallControl, or ongoingCalls to 1 or more for MultiCallControl.\n      ", null == this ? void 0 : this.logger, Ut.WARNING), e(this, fr, "f").deviceState.setInitialState(t, n, r)
	}

	_checkActive() {
		if (!e(this, gr, "f")) throw new fe("\n        Inactive instance. Either device disconnected or teardown was called.\n        Create new EasyCallControl instance to continue usage.", Gt.SDK_USAGE_ERROR)
	}
}

fr = new WeakMap, vr = new WeakMap, Er = new WeakMap, gr = new WeakMap;

class Or extends wr {
	constructor(t, e, r, i) {
		super(t, e, r, i, !0), _r.set(this, void 0), this.ongoingCalls = r.ongoingCalls, this.holdState = r.holdState, this.swapRequest = r.swapEvents, n(this, _r, e, "f")
	}

	startCall() {
		return t(this, void 0, void 0, (function* () {
			return this._checkActive(), e(this, _r, "f").hookHandler.startCall()
		}))
	}

	acceptIncomingCall(t = lr.END_CURRENT) {
		return this._checkActive(), e(this, _r, "f").incomingCallHandler.acceptIncomingCall(t)
	}

	hold() {
		return this._checkActive(), e(this, _r, "f").holdHandler.setHold(dr.ON_HOLD)
	}

	resume() {
		return this._checkActive(), e(this, _r, "f").holdHandler.setHold(dr.NOT_ON_HOLD)
	}
}

_r = new WeakMap;

class Nr extends mr {
	constructor(t, e) {
		super(e), this.callControl = t, this.hasLock = !1
	}

	takeCallLock() {
		return t(this, void 0, void 0, (function* () {
			if (!this.hasLock && (this.hasLock = yield this.callControl.takeCallLock().catch((() => {
				throw new fe("Bad state: device is locked by this application. Try to call endCall on the device or restart the app.", Gt.UNEXPECTED_ERROR)
			})), !this.hasLock)) throw new fe("Device used by another softphone. Only one application can use the device at a time.", Gt.SDK_USAGE_ERROR)
		}))
	}

	releaseCallLock() {
		0 === this.state.ongoingCalls && (this.callControl.releaseCallLock(), this.hasLock = !1)
	}

	forceReleaseCallLock() {
		this.hasLock && this.callControl.releaseCallLock()
	}
}

class Cr extends mr {
	constructor(t, e, n, r) {
		super(r), this.hookHandler = t, this.holdHandler = e, this.muteHandler = n
	}

	setInitialState(e, n, r) {
		return t(this, void 0, void 0, (function* () {
			if (0 === e) return yield this.hookHandler.startCall(), void (yield this.hookHandler.endCall());
			for (let t = 0; t < e; t += 1) yield this.hookHandler.startCall();
			const t = r ? dr.ON_HOLD : dr.NOT_ON_HOLD;
			yield this.holdHandler.setHold(t);
			const i = n ? hr.MUTED : hr.UNMUTED;
			this.muteHandler.setMute(i)
		}))
	}
}

function Tr(t = 1e3) {
	return new Promise((e => {
		setTimeout((() => {
			e()
		}), t)
	}))
}

class Sr extends mr {
	constructor(t, e) {
		super(e), this.callControl = t, this.stateHandler = e
	}

	setHold(e) {
		return t(this, void 0, void 0, (function* () {
			if (0 === this.state.ongoingCalls) throw new fe("No active call to hold", Gt.SDK_USAGE_ERROR);
			this.state.ongoingCalls > 1 && e === dr.NOT_ON_HOLD ? yield this.resumeWhileMultiple() : (this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
				ignoreSignals: !0,
				holdState: e
			})), this.callControl.offHook(e === dr.NOT_ON_HOLD), this.callControl.hold(e === dr.ON_HOLD), yield Tr(1e3), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {ignoreSignals: !1})))
		}))
	}

	resumeWhileMultiple() {
		return t(this, void 0, void 0, (function* () {
			this.callControl.hold(!1), this.callControl.offHook(!0), this.callControl.hold(!0), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {holdState: dr.NOT_ON_HOLD}))
		}))
	}
}

class Ar extends mr {
	constructor(t, e, n, r, i) {
		super(n), this.callControl = t, this.callLock = e, this.stateHandler = n, this.deviceSignals = r, this.logger = i, this.hookSwitchAckTimeoutMs = 1500
	}

	startCall() {
		return t(this, void 0, void 0, (function* () {
			if (this.state.incomingCall === pr.AWAITING_RESPONSE) throw new fe("Cannot start a new call while another call is incoming. If you wish to answer/accept the incoming call, please use acceptIncomingCall instead", Gt.SDK_USAGE_ERROR);
			this.state.holdState === dr.ON_HOLD ? this.startNewCallWhileOnHold() : 0 === this.state.ongoingCalls ? yield this.startFirstCall() : this.startSubsequentCalls(), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {ongoingCalls: this.state.ongoingCalls + 1}))
		}))
	}

	endCall() {
		return t(this, void 0, void 0, (function* () {
			if (this.state.incomingCall === pr.AWAITING_RESPONSE) throw new fe("An incoming call is awaiting response. Please accept or reject the incoming call before ending.", Gt.SDK_USAGE_ERROR);
			if (0 === this.state.ongoingCalls) throw new fe("No calls in progress", Gt.SDK_USAGE_ERROR);
			1 === this.state.ongoingCalls ? yield this.endLastCall() : this.state.holdState === dr.ON_HOLD ? this.endCallWhileOnHold() : yield this.endCurrentCall()
		}))
	}

	startFirstCall() {
		return t(this, void 0, void 0, (function* () {
			yield this.callLock.takeCallLock(), yield this.offHookAndAwaitSignal(!0), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
				holdState: dr.NOT_ON_HOLD,
				muteState: hr.UNMUTED
			}))
		}))
	}

	startSubsequentCalls() {
		this.callControl.hold(!0)
	}

	startNewCallWhileOnHold() {
		this.callControl.hold(!1), this.callControl.offHook(!0), this.callControl.hold(!0), this.callControl.mute(!1), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
			holdState: dr.NOT_ON_HOLD,
			muteState: hr.UNMUTED
		}))
	}

	endLastCall() {
		return t(this, void 0, void 0, (function* () {
			this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
				holdState: dr.NO_ONGOING_CALLS,
				muteState: hr.NO_ONGOING_CALLS,
				ongoingCalls: 0
			})), this.callControl.mute(!1), yield this.offHookAndAwaitSignal(!1), this.callControl.hold(!1), this.callLock.releaseCallLock()
		}))
	}

	endCurrentCall() {
		return t(this, void 0, void 0, (function* () {
			this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
				ignoreSignals: !0,
				ongoingCalls: this.state.ongoingCalls - 1
			})), this.callControl.offHook(!1), this.callControl.hold(!1), this.callControl.offHook(!0), 1 !== this.state.ongoingCalls && this.callControl.hold(!0), yield Tr(1e3), this.callControl.mute(!1), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
				muteState: hr.UNMUTED,
				ignoreSignals: !1
			}))
		}))
	}

	endCallWhileOnHold() {
		this.stateHandler.next(Object.assign(Object.assign({}, this.state), {ongoingCalls: this.state.ongoingCalls - 1}))
	}

	offHookAndAwaitSignal(e) {
		return t(this, void 0, void 0, (function* () {
			this.stateHandler.next(Object.assign(Object.assign({}, this.state), {ignoreSignals: !0}));
			const t = (n = () => this.state.incomingCall === pr.RESOLVING_RESPONSE_FROM_DEVICE, r = mt(new $n(Un.HOOK_SWITCH, !0, Ve.ABSOLUTE)), i = this.deviceSignals.pipe(ie((t => t.type === Un.HOOK_SWITCH)), Tt(this.hookSwitchAckTimeoutMs)), Lt((function () {
				return n() ? r : i
			})));
			var n, r, i;
			this.callControl.offHook(e);
			try {
				yield Ot(t)
			} catch (t) {
				ve("Synchronization mismatch - missing hook signal from device. State recovered.", null == this ? void 0 : this.logger, Ut.INFO)
			}
			this.stateHandler.next(Object.assign(Object.assign({}, this.state), {ignoreSignals: !1}))
		}))
	}
}

class Ir extends mr {
	constructor(t, e, n, r) {
		super(n), this.callControl = t, this.callLock = e, this.stateHandler = n, this.hookHandler = r
	}

	signalIncomingCall() {
		return t(this, void 0, void 0, (function* () {
			return yield this.callLock.takeCallLock(), this.updateIncomingCallState(pr.AWAITING_RESPONSE), this.callControl.ring(!0), new Promise((t => {
				var e, n;
				this.stateHandler.pipe((e = ({incomingCall: t}) => t !== pr.NO_INCOMING, void 0 === n && (n = !1), k((function (t, r) {
					var i = 0;
					t.subscribe(new U(r, (function (t) {
						var o = e(t, i++);
						(o || n) && r.next(t), !o && r.complete()
					})))
				}))), jt((({incomingCall: t}) => t === pr.ACCEPTED || t === pr.REJECTED))).subscribe((({incomingCall: e}) => {
					this.updateIncomingCallState(pr.NO_INCOMING), t(e === pr.ACCEPTED)
				}))
			}))
		}))
	}

	acceptIncomingCall(e, n = !1) {
		return t(this, void 0, void 0, (function* () {
			if (this.state.incomingCall !== pr.AWAITING_RESPONSE) throw new fe("No incoming calls", Gt.SDK_USAGE_ERROR);
			const t = n ? pr.RESOLVING_RESPONSE_FROM_DEVICE : pr.RESOLVING_RESPONSE;
			this.updateIncomingCallState(t), this.callControl.ring(!1), this.state.holdState === dr.ON_HOLD || 0 === this.state.ongoingCalls ? yield this.hookHandler.startCall() : e === lr.END_CURRENT ? (yield this.hookHandler.endCall(), yield this.hookHandler.startCall()) : e === lr.HOLD_CURRENT && (yield this.hookHandler.startCall()), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {
				incomingCall: pr.ACCEPTED,
				holdState: dr.NOT_ON_HOLD
			}))
		}))
	}

	rejectIncomingCall() {
		if (this.state.incomingCall !== pr.AWAITING_RESPONSE) throw new fe("No incoming calls", Gt.SDK_USAGE_ERROR);
		this.callControl.ring(!1), this.updateIncomingCallState(pr.REJECTED), this.callLock.releaseCallLock()
	}

	updateIncomingCallState(t) {
		this.stateHandler.next(Object.assign(Object.assign({}, this.state), {incomingCall: t}))
	}
}

class Rr extends mr {
	constructor(t, e) {
		super(e), this.callControl = t, this.stateHandler = e
	}

	setMute(t) {
		if (0 === this.state.ongoingCalls) throw new fe("You cannot change mute state outside of a call.", Gt.SDK_USAGE_ERROR);
		this.callControl.mute(t === hr.MUTED), this.stateHandler.next(Object.assign(Object.assign({}, this.state), {muteState: t}))
	}
}

class Dr extends mr {
	constructor(t) {
		super(t), this.stateHandler = t
	}

	swapCalls() {
		return t(this, void 0, void 0, (function* () {
			if (this.state.ongoingCalls < 2) throw new fe("No calls to swap between. There should be minimum one current call and one call on hold.", Gt.SDK_USAGE_ERROR);
			this.stateHandler.next(Object.assign(Object.assign({}, this.state), {swapToggle: this.state.swapToggle ? 0 : 1}))
		}))
	}
}

class Hr {
	constructor(t, e, n) {
		this.callLock = new Nr(t, e), this.hookHandler = new Ar(t, this.callLock, e, t.deviceSignals, n), this.muteHandler = new Rr(t, e), this.holdHandler = new Sr(t, e), this.incomingCallHandler = new Ir(t, this.callLock, e, this.hookHandler), this.swapHandler = new Dr(e), this.deviceState = new Cr(this.hookHandler, this.holdHandler, this.muteHandler, e)
	}
}

const Lr = {
	ongoingCalls: 0,
	muteState: hr.NO_ONGOING_CALLS,
	holdState: dr.NO_ONGOING_CALLS,
	incomingCall: pr.NO_INCOMING,
	ignoreSignals: !1,
	swapToggle: 0
};

class Pr {
	constructor() {
		this.internalState = new M(Lr), this.onUnsubscribe = new G;
		const t = this.internalState.pipe(de(this.onUnsubscribe));
		this.ongoingCalls = t.pipe(At((t => t.ongoingCalls)), te()), this.callActive = t.pipe(At((t => 0 !== t.ongoingCalls)), te()), this.muteState = t.pipe(At((t => t.muteState)), te()), this.holdState = t.pipe(At((t => t.holdState)), te()), this.swapEvents = t.pipe(At((t => t.swapToggle)), te(), At((() => {
		})), le(1))
	}

	unsubscribeState() {
		this.onUnsubscribe.next(void 0)
	}
}

var kr, Ur, xr, Gr;

class Fr extends wr {
	constructor(t, e, r, i) {
		super(t, e, r, i, !1), kr.set(this, void 0), Ur.set(this, void 0), this.callActive = r.callActive, n(this, kr, r.internalState, "f"), n(this, Ur, e, "f")
	}

	startCall() {
		return t(this, void 0, void 0, (function* () {
			if (this._checkActive(), 1 === e(this, kr, "f").value.ongoingCalls) throw new fe("Please end the call before starting a new", Gt.SDK_USAGE_ERROR);
			return e(this, Ur, "f").hookHandler.startCall()
		}))
	}

	acceptIncomingCall() {
		return this._checkActive(), e(this, Ur, "f").incomingCallHandler.acceptIncomingCall(lr.END_CURRENT)
	}
}

kr = new WeakMap, Ur = new WeakMap;

class Mr {
	constructor(t) {
		var e;
		xr.set(this, void 0), Gr.set(this, void 0), n(this, xr, new br(t), "f"), n(this, Gr, null === (e = t._config) || void 0 === e ? void 0 : e.logger, "f")
	}

	createSingleCallControl(n, r) {
		return t(this, void 0, void 0, (function* () {
			const t = yield e(this, xr, "f").createCallControl(n), i = new Pr,
				o = new Hr(t, i.internalState, e(this, Gr, "f")), s = new Fr(t, o, i, e(this, Gr, "f"));
			if (r) {
				const t = r.callActive ? 1 : 0;
				yield s._setInitialState(t, r.muted)
			}
			return s
		}))
	}

	createMultiCallControl(n, r) {
		return t(this, void 0, void 0, (function* () {
			const t = yield e(this, xr, "f").createCallControl(n), i = new Pr,
				o = new Hr(t, i.internalState, e(this, Gr, "f")), s = new Or(t, o, i, e(this, Gr, "f"));
			return r && (yield s._setInitialState(r.ongoingCalls, r.muted, r.onHold)), s
		}))
	}

	supportsEasyCallControl(t) {
		return e(this, xr, "f").supportsCallControl(t)
	}
}

xr = new WeakMap, Gr = new WeakMap;
export {
	lr as A,
	br as C,
	$e as D,
	Gt as E,
	dr as H,
	An as I,
	fe as J,
	Ut as L,
	hr as M,
	U as O,
	Ke as R,
	G as S,
	Mt as T,
	Ve as V,
	Ln as W,
	t as _,
	It as a,
	Pt as b,
	Ht as c,
	q as d,
	Pn as e,
	Yn as f,
	kt as g,
	xt as h,
	L as i,
	kn as j,
	Un as k,
	ve as l,
	At as m,
	N as n,
	k as o,
	Bt as p,
	dn as q,
	pn as r,
	fn as s,
	Zt as t,
	Ye as u,
	Hn as v,
	jn as w,
	Mr as x
};
