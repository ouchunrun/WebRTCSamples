(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
/*
 *  Copyright (c) 2018 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

// Determines the intersection of local and remote capabilities.
module.exports = function(localCapabilities, remoteCapabilities) {
  var commonCapabilities = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: []
  };

  var findCodecByPayloadType = function(pt, codecs) {
    pt = parseInt(pt, 10);
    for (var i = 0; i < codecs.length; i++) {
      if (codecs[i].payloadType === pt ||
          codecs[i].preferredPayloadType === pt) {
        return codecs[i];
      }
    }
  };

  var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
    var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
    var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
    return lCodec && rCodec &&
        lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
  };

  localCapabilities.codecs.forEach(function(lCodec) {
    for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
      var rCodec = remoteCapabilities.codecs[i];
      if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
          lCodec.clockRate === rCodec.clockRate) {
        if (lCodec.name.toLowerCase() === 'rtx' &&
            lCodec.parameters && rCodec.parameters.apt) {
          // for RTX we need to find the local rtx that has a apt
          // which points to the same local codec as the remote one.
          if (!rtxCapabilityMatches(lCodec, rCodec,
              localCapabilities.codecs, remoteCapabilities.codecs)) {
            continue;
          }
        }
        rCodec = JSON.parse(JSON.stringify(rCodec)); // deepcopy
        // number of channels is the highest common number of channels
        rCodec.numChannels = Math.min(lCodec.numChannels,
            rCodec.numChannels);
        // push rCodec so we reply with offerer payload type
        commonCapabilities.codecs.push(rCodec);

        // determine common feedback mechanisms
        rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
          for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
            if (lCodec.rtcpFeedback[j].type === fb.type &&
                lCodec.rtcpFeedback[j].parameter === fb.parameter) {
              return true;
            }
          }
          return false;
        });
        // FIXME: also need to determine .parameters
        //  see https://github.com/openpeer/ortc/issues/569
        break;
      }
    }
  });

  localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
    for (var i = 0; i < remoteCapabilities.headerExtensions.length;
         i++) {
      var rHeaderExtension = remoteCapabilities.headerExtensions[i];
      if (lHeaderExtension.uri === rHeaderExtension.uri) {
        commonCapabilities.headerExtensions.push(rHeaderExtension);
        break;
      }
    }
  });

  // FIXME: fecMechanisms
  return commonCapabilities;
};

},{}],3:[function(require,module,exports){
/*
 *  Copyright (c) 2018 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var util = require('./util');

/* a wrapper around Edge's RTCDtlsTransport that makes it compatible
 * with WebRTC 1.0.
 */
module.exports = function(window) {
  // simple name aliase.
  if (!('onstatechange' in window.RTCDtlsTransport.prototype)) {
    util.aliasEventListener(window.RTCDtlsTransport.prototype,
      'dtlsstatechange', 'statechange');
  }
  return window.RTCDtlsTransport;
};

},{"./util":8}],4:[function(require,module,exports){
/*
 *  Copyright (c) 2018 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

/* a wrapper around Edge's RTCIceGatherer that adds state and onstatechange
 * and hides a bug in getLocalCandidates which throws if called before
 * there was at least one candidate gathered.
 */
module.exports = function(window) {
  var NativeRTCIceGatherer = window.RTCIceGatherer;
  Object.defineProperty(window.RTCIceGatherer.prototype, 'state',
    {value: 'new', writable: true});
  var RTCIceGatherer = function(options) {
    var gatherer = new NativeRTCIceGatherer(options);
    gatherer.addEventListener('localcandidate', function(e) {
      var candidate = e.candidate;
      var end = !candidate || Object.keys(candidate).length === 0;
      if (end) {
        gatherer.state = 'complete';
        gatherer.dispatchEvent(new Event('statechange'));
      } else if (gatherer.state === 'new') {
        gatherer.state = 'gathering';
        gatherer.dispatchEvent(new Event('statechange'));
      }
    });
    return gatherer;
  };
  RTCIceGatherer.prototype = NativeRTCIceGatherer.prototype;

  var origGetLocalCandidates = RTCIceGatherer.prototype.getLocalCandidates;
  RTCIceGatherer.prototype.getLocalCandidates = function() {
    if (this.state === 'new') {
      return [];
    }
    return origGetLocalCandidates.apply(this);
  };
  return RTCIceGatherer;
};

},{}],5:[function(require,module,exports){
/*
 *  Copyright (c) 2018 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var util = require('./util');

/* a wrapper around Edge's RTCIceTransport that makes it compatible
 * with WebRTC 1.0 which merges RTCIceGatherer and RTCIceTransport.
 *
 * Also hides name changes between Edge and the latest specification.
 */
module.exports = function(window) {
  var prototype = window.RTCIceTransport.prototype;
  // provide getLocalCandidates from gatherer, adding the transport component.
  if (!('getLocalCandidates' in prototype)) {
    prototype.getLocalCandidates = function() {
      var transport = this;
      if (this.iceGatherer) {
        return this.iceGatherer.getLocalCandidates().map(function(cand) {
          cand.component = transport.component;
          return cand;
        });
      }
      return [];
    };
  }

  // provide getLocalParameters from gatherer.
  if (!('getLocalParameters' in prototype)) {
    prototype.getLocalParameters = function() {
      if (this.iceGatherer) {
        return this.iceGatherer.getLocalParameters();
      }
      throw(util.makeError('InvalidStateError',
        'Can not call getLocalParameters in this state'));
    };
  }

  // provide gatheringState and gatheringstatechange from gatherer.
  if (!('gatheringState' in prototype)) {
    Object.defineProperty(prototype, 'gatheringState', {
      get: function() {
        return this.iceGatherer ? this.iceGatherer.state : 'new';
      }
    });
    Object.defineProperty(prototype, 'ongatheringstatechange', {
      get: function() {
        return this._ongatheringstatechange;
      },
      set: function(cb) {
        // TODO: this may loose event subscribes when this.gatherer is null
        //  throw a JS error for now.
        if (this._ongatheringstatechange) {
          this.iceGatherer.removeEventListener('statechange',
            this._ongatheringstatechange);
          delete this._ongatheringstatechange;
        }
        if (cb) {
          this.iceGatherer.addEventListener('statechange',
            this._ongatheringstatechange = cb);
        }
      }
    });

    // implement addEventListener('gatheringstatechange', cb)
    ['addEventListener', 'removeEventListener'].forEach(function(method) {
      var nativeMethod = prototype[method];
      prototype[method] = function(eventName, cb) {
        if (eventName === 'gatheringstatechange') {
          if (this.iceGatherer) {
            return this.iceGatherer[method].apply(this.iceGatherer,
                ['statechange', cb]);
          }
        }
        return nativeMethod.apply(this, arguments);
      };
    });
  }

  // simple name aliases.
  if (!('onstatechange' in prototype)) {
    util.aliasEventListener(prototype,
      'icestatechange', 'statechange');
  }

  if (!('getSelectedCandidatePair' in prototype)) {
    prototype.getSelectedCandidatePair =
    prototype.getSelectedCandidatePair = function() {
      return this.getNominatedCandidatePair();
    };
    util.aliasEventListener(prototype,
      'candidatepairchange', 'selectedcandidatepairchange');
  }
  return window.RTCIceTransport;
};

},{"./util":8}],6:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

var SDPUtils = require('sdp');
var shimSenderWithTrackOrKind = require('./rtcrtpsender');
var shimIceGatherer = require('./rtcicegatherer');
var shimIceTransport = require('./rtcicetransport');
var shimDtlsTransport = require('./rtcdtlstransport');
var getCommonCapabilities = require('./getcommoncapabilities');
var writeMediaSection = require('./writemediasection');
var util = require('./util');

module.exports = function(window, edgeVersion) {
  if (window.RTCRtpSender) { // wrap native RTCRtpSender.
    window.RTCRtpSender = shimSenderWithTrackOrKind(window);
  }
  if (window.RTCIceGatherer) { // wrap native RTCIceGatherer.
    window.RTCIceGatherer = shimIceGatherer(window);
  }
  if (window.RTCIceTransport) { // wrap native RTCIceTransport.
    window.RTCIceTransport = shimIceTransport(window);
  }
  if (window.RTCDtlsTransport) { // wrap native RTCDtlsTransport.
    window.RTCDtlsTransport = shimDtlsTransport(window);
  }

  // fix ORTC getStats. Should be moved to adapter.js some day?
  util.fixORTCGetStats(window);

  var RTCPeerConnection = function(config) {
    var pc = this;

    var _eventTarget = document.createDocumentFragment();
    ['addEventListener', 'removeEventListener', 'dispatchEvent']
        .forEach(function(method) {
          pc[method] = _eventTarget[method].bind(_eventTarget);
        });

    this._canTrickleIceCandidates = null;
    this._localDescription = null;
    this._remoteDescription = null;
    this._signalingState = 'stable';
    this._iceConnectionState = 'new';
    this._connectionState = 'new';
    this._iceGatheringState = 'new';

    // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
    // everything that is needed to describe a SDP m-line.
    this._transceivers = [];

    this._sdpSessionId = SDPUtils.generateSessionId();
    this._sdpSessionVersion = 0;

    this._dtlsRole = undefined; // role for a=setup to use in answers.

    this._isClosed = false;
    this._needNegotiation = false;

    this._localStreams = [];
    this._remoteStreams = [];

    this._usingBundle = config ? config.bundlePolicy === 'max-bundle' : false;
    this._iceGatherers = [];

    // process configuration.
    config = JSON.parse(JSON.stringify(config || {}));
    if (config.rtcpMuxPolicy === 'negotiate') {
      throw(util.makeError('NotSupportedError',
          'rtcpMuxPolicy \'negotiate\' is not supported'));
    } else if (!config.rtcpMuxPolicy) {
      config.rtcpMuxPolicy = 'require';
    }

    switch (config.iceTransportPolicy) {
      case 'all':
      case 'relay':
        break;
      default:
        config.iceTransportPolicy = 'all';
        break;
    }

    switch (config.bundlePolicy) {
      case 'balanced':
      case 'max-compat':
      case 'max-bundle':
        break;
      default:
        config.bundlePolicy = 'balanced';
        break;
    }

    config.iceServers = util.filterIceServers(config.iceServers || [],
        edgeVersion);

    if (config.iceCandidatePoolSize) {
      for (var i = config.iceCandidatePoolSize; i > 0; i--) {
        this._iceGatherers.push(new window.RTCIceGatherer({
          iceServers: config.iceServers,
          gatherPolicy: config.iceTransportPolicy
        }));
      }
    } else {
      config.iceCandidatePoolSize = 0;
    }

    this._config = config;
  };

  // set up public properties on the prototype
  ['localDescription', 'remoteDescription', 'signalingState',
    'iceConnectionState', 'connectionState', 'iceGatheringState',
    'canTrickleIceCandidates'].forEach(function(propertyName) {
      Object.defineProperty(RTCPeerConnection.prototype, propertyName, {
        configurable: true,
        get: function() {
          return this['_' + propertyName];
        }
      });
    });

  // set up event handlers on prototype
  ['icecandidate', 'addstream', 'removestream', 'track',
    'signalingstatechange', 'iceconnectionstatechange',
    'connectionstatechange', 'icegatheringstatechange',
    'negotiationneeded', 'datachannel'].forEach(function(eventName) {
      RTCPeerConnection.prototype['on' + eventName] = null;
    });

  // internal helper to create a transceiver object.
  // (which is not yet the same as the WebRTC 1.0 transceiver)
  RTCPeerConnection.prototype._createTransceiver = function(kind, doNotAdd) {
    var hasBundleTransport = this._transceivers.length > 0;
    var transceiver = {
      track: null,
      iceGatherer: null,
      iceTransport: null,
      dtlsTransport: null,
      localCapabilities: null,
      remoteCapabilities: null,
      rtpSender: null,
      rtpReceiver: null,
      kind: kind,
      mid: null,
      sendEncodingParameters: null,
      recvEncodingParameters: null,
      stream: null,
      associatedRemoteMediaStreams: [],
      wantReceive: true
    };
    if (this._usingBundle && hasBundleTransport) {
      transceiver.iceTransport = this._transceivers[0].iceTransport;
      transceiver.dtlsTransport = this._transceivers[0].dtlsTransport;
    } else {
      var transports = this._createIceAndDtlsTransports();
      transceiver.iceTransport = transports.iceTransport;
      transceiver.dtlsTransport = transports.dtlsTransport;
    }
    if (!doNotAdd) {
      this._transceivers.push(transceiver);
    }
    return transceiver;
  };

  RTCPeerConnection.prototype._createIceGatherer = function(sdpMLineIndex,
      usingBundle) {
    if (usingBundle && sdpMLineIndex > 0) {
      return this._transceivers[0].iceGatherer;
    } else if (this._iceGatherers.length) {
      return this._iceGatherers.shift();
    }
    var iceGatherer = new window.RTCIceGatherer({
      iceServers: this._config.iceServers,
      gatherPolicy: this._config.iceTransportPolicy
    });
    return iceGatherer;
  };

  // start gathering from an RTCIceGatherer.
  RTCPeerConnection.prototype._gather = function(mid, sdpMLineIndex) {
    var pc = this;
    var iceGatherer = this._transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer.onlocalcandidate) {
      return;
    }
    iceGatherer.onlocalcandidate = function(evt) {
      if (pc._usingBundle && sdpMLineIndex > 0) {
        // if we know that we use bundle we can drop candidates with
        // ѕdpMLineIndex > 0. If we don't do this then our state gets
        // confused since we dispose the extra ice gatherer.
        return;
      }
      var event = new Event('icecandidate');
      event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

      var cand = evt.candidate;
      // Edge emits an empty object for RTCIceCandidateComplete‥
      var end = !cand || Object.keys(cand).length === 0;
      if (!end) {
        // RTCIceCandidate doesn't have a component, needs to be added
        cand.component = 1;
        // also the usernameFragment. TODO: update SDP to take both variants.
        cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;

        var serializedCandidate = SDPUtils.writeCandidate(cand);
        event.candidate = Object.assign(event.candidate,
            SDPUtils.parseCandidate(serializedCandidate));

        event.candidate.candidate = serializedCandidate;
        event.candidate.toJSON = function() {
          return {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment
          };
        };
      }

      // update local description.
      var sections = SDPUtils.getMediaSections(pc._localDescription.sdp);
      if (!end) {
        sections[event.candidate.sdpMLineIndex] +=
            'a=' + event.candidate.candidate + '\r\n';
      } else {
        sections[event.candidate.sdpMLineIndex] +=
            'a=end-of-candidates\r\n';
      }
      pc._localDescription.sdp =
          SDPUtils.getDescription(pc._localDescription.sdp) +
          sections.join('');

      if (!end) { // Emit candidate.
        pc._updateIceGatheringState('gathering');
        pc._dispatchEvent('icecandidate', event);
      }

      var complete = pc._transceivers.every(function(transceiver) {
        return transceiver.iceGatherer &&
            transceiver.iceGatherer.state === 'complete';
      });
      if (complete) {
        pc._updateIceGatheringState('complete');
      }
    };

    // emit already gathered candidates.
    var gatheredCandidates = iceGatherer.getLocalCandidates();
    var isComplete = iceGatherer.state === 'complete';
    window.setTimeout(function() {
      if (!iceGatherer.onlocalcandidate) {
        return;
      }
      gatheredCandidates.forEach(iceGatherer.onlocalcandidate);
      if (isComplete) {
        iceGatherer.onlocalcandidate({candidate: {}});
      }
    }, 0);
  };

  // Create ICE transport and DTLS transport.
  RTCPeerConnection.prototype._createIceAndDtlsTransports = function() {
    var pc = this;
    var iceTransport = new window.RTCIceTransport(null);
    iceTransport.addEventListener('statechange', function() {
      pc._updateIceConnectionState();
      pc._updateConnectionState();
    });

    var dtlsTransport = new window.RTCDtlsTransport(iceTransport);
    dtlsTransport.addEventListener('statechange', function() {
      pc._updateConnectionState();
    });
    dtlsTransport.addEventListener('error', function() {
      // onerror does not set state to failed by itself.
      Object.defineProperty(dtlsTransport, 'state',
          {value: 'failed', writable: true});
      pc._updateConnectionState();
    });

    return {
      iceTransport: iceTransport,
      dtlsTransport: dtlsTransport
    };
  };

  // Destroy ICE gatherer, ICE transport and DTLS transport.
  // Without triggering the callbacks.
  RTCPeerConnection.prototype._disposeIceAndDtlsTransports = function(
      sdpMLineIndex) {
    var iceGatherer = this._transceivers[sdpMLineIndex].iceGatherer;
    if (iceGatherer) {
      delete iceGatherer.onlocalcandidate;
      delete this._transceivers[sdpMLineIndex].iceGatherer;
    }
    delete this._transceivers[sdpMLineIndex].iceTransport;

    delete this._transceivers[sdpMLineIndex].dtlsTransport;
  };

  // Start the RTP Sender and Receiver for a transceiver.
  RTCPeerConnection.prototype._transceive = function(transceiver,
      send, recv) {
    var params = getCommonCapabilities(transceiver.localCapabilities,
        transceiver.remoteCapabilities);
    if (send && transceiver.rtpSender) {
      params.encodings = transceiver.sendEncodingParameters;
      params.rtcp = {
        cname: SDPUtils.localCName,
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.recvEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
      }
      transceiver.rtpSender.send(params);
    }
    if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
      // remove RTX field in Edge 14942
      if (transceiver.kind === 'video'
          && transceiver.recvEncodingParameters
          && edgeVersion < 15019) {
        transceiver.recvEncodingParameters.forEach(function(p) {
          delete p.rtx;
        });
      }
      if (transceiver.recvEncodingParameters.length) {
        params.encodings = transceiver.recvEncodingParameters;
      } else {
        params.encodings = [{}];
      }
      params.rtcp = {
        compound: transceiver.rtcpParameters.compound
      };
      if (transceiver.rtcpParameters.cname) {
        params.rtcp.cname = transceiver.rtcpParameters.cname;
      }
      if (transceiver.sendEncodingParameters.length) {
        params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
      }
      transceiver.rtpReceiver.receive(params);
    }
  };

  // Update the signaling state.
  RTCPeerConnection.prototype._updateSignalingState = function(newState) {
    if (newState === this._signalingState) {
      return;
    }
    this._signalingState = newState;
    var event = new Event('signalingstatechange');
    this._dispatchEvent('signalingstatechange', event);
  };

  // Determine whether to fire the negotiationneeded event.
  RTCPeerConnection.prototype._maybeFireNegotiationNeeded = function() {
    var pc = this;
    if (this._signalingState !== 'stable' || this._needNegotiation === true) {
      return;
    }
    this._needNegotiation = true;
    window.setTimeout(function() {
      if (pc._needNegotiation) {
        pc._needNegotiation = false;
        var event = new Event('negotiationneeded');
        pc._dispatchEvent('negotiationneeded', event);
      }
    }, 0);
  };

  // Update the ice gathering state. See
  // https://w3c.github.io/webrtc-pc/#update-the-ice-gathering-state
  RTCPeerConnection.prototype._updateIceGatheringState = function(newState) {
    if (newState === this._iceGatheringState) {
      return;
    }
    this._iceGatheringState = newState;

    var event = new Event('icegatheringstatechange');
    this._dispatchEvent('icegatheringstatechange', event);

    if (newState === 'complete') {
      this._dispatchEvent('icecandidate', new Event('icecandidate'));
    }
  };

  // Update the ice connection state.
  RTCPeerConnection.prototype._updateIceConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      checking: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this._transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
    });

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.checking > 0) {
      newState = 'checking';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    } else if (states.completed > 0) {
      newState = 'completed';
    }

    if (newState !== this._iceConnectionState) {
      this._iceConnectionState = newState;
      var event = new Event('iceconnectionstatechange');
      this._dispatchEvent('iceconnectionstatechange', event);
    }
  };

  // Update the connection state.
  RTCPeerConnection.prototype._updateConnectionState = function() {
    var newState;
    var states = {
      'new': 0,
      closed: 0,
      connecting: 0,
      connected: 0,
      completed: 0,
      disconnected: 0,
      failed: 0
    };
    this._transceivers.forEach(function(transceiver) {
      states[transceiver.iceTransport.state]++;
      states[transceiver.dtlsTransport.state]++;
    });
    // ICETransport.completed and connected are the same for this purpose.
    states.connected += states.completed;

    newState = 'new';
    if (states.failed > 0) {
      newState = 'failed';
    } else if (states.connecting > 0) {
      newState = 'connecting';
    } else if (states.disconnected > 0) {
      newState = 'disconnected';
    } else if (states.new > 0) {
      newState = 'new';
    } else if (states.connected > 0) {
      newState = 'connected';
    }

    if (newState !== this._connectionState) {
      this._connectionState = newState;
      var event = new Event('connectionstatechange');
      this._dispatchEvent('connectionstatechange', event);
    }
  };

  RTCPeerConnection.prototype._dispatchEvent = function(name, event) {
    if (this._isClosed) {
      return;
    }
    this.dispatchEvent(event);
    if (typeof this['on' + name] === 'function') {
      this['on' + name](event);
    }
  };

  RTCPeerConnection.prototype._emitTrack = function(track, receiver, streams) {
    var pc = this;
    var trackEvent = new Event('track');
    trackEvent.track = track;
    trackEvent.receiver = receiver;
    trackEvent.transceiver = {receiver: receiver};
    trackEvent.streams = streams;
    pc._dispatchEvent('track', trackEvent);
  };


  RTCPeerConnection.prototype.getConfiguration = function() {
    return this._config;
  };

  RTCPeerConnection.prototype.getLocalStreams = function() {
    return this._localStreams;
  };

  RTCPeerConnection.prototype.getRemoteStreams = function() {
    return this._remoteStreams;
  };

  RTCPeerConnection.prototype.addTrack = function(track, stream) {
    if (this._isClosed) {
      throw util.makeError('InvalidStateError',
          'Attempted to call addTrack on a closed peerconnection.');
    }

    var alreadyExists = this._transceivers.find(function(s) {
      return s.track === track;
    });

    if (alreadyExists) {
      throw util.makeError('InvalidAccessError', 'Track already exists.');
    }

    var transceiver;
    for (var i = 0; i < this._transceivers.length; i++) {
      if (!this._transceivers[i].track &&
          this._transceivers[i].kind === track.kind) {
        transceiver = this._transceivers[i];
      }
    }
    if (!transceiver) {
      transceiver = this._createTransceiver(track.kind);
    }

    this._maybeFireNegotiationNeeded();

    if (this._localStreams.indexOf(stream) === -1) {
      this._localStreams.push(stream);
    }

    transceiver.track = track;
    transceiver.stream = stream;
    transceiver.rtpSender = new window.RTCRtpSender(track);
    return transceiver.rtpSender;
  };

  RTCPeerConnection.prototype.addStream = function(stream) {
    var pc = this;
    if (edgeVersion >= 15025) {
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
    } else {
      // Clone is necessary for local demos mostly, attaching directly
      // to two different senders does not work (build 10547).
      // Fixed in 15025 (or earlier)
      var clonedStream = stream.clone();
      stream.getTracks().forEach(function(track, idx) {
        var clonedTrack = clonedStream.getTracks()[idx];
        track.addEventListener('enabled', function(event) {
          clonedTrack.enabled = event.enabled;
        });
      });
      clonedStream.getTracks().forEach(function(track) {
        pc.addTrack(track, clonedStream);
      });
    }
  };

  RTCPeerConnection.prototype.removeTrack = function(sender) {
    if (this._isClosed) {
      throw util.makeError('InvalidStateError',
          'Attempted to call removeTrack on a closed peerconnection.');
    }

    if (!(sender instanceof window.RTCRtpSender)) {
      throw new TypeError('Argument 1 of RTCPeerConnection.removeTrack ' +
          'does not implement interface RTCRtpSender.');
    }

    var transceiver = this._transceivers.find(function(t) {
      return t.rtpSender === sender;
    });

    if (!transceiver) {
      throw util.makeError('InvalidAccessError',
          'Sender was not created by this connection.');
    }
    var stream = transceiver.stream;

    transceiver.rtpSender.stop();
    transceiver.rtpSender = null;
    transceiver.track = null;
    transceiver.stream = null;

    // remove the stream from the set of local streams
    var localStreams = this._transceivers.map(function(t) {
      return t.stream;
    });
    if (localStreams.indexOf(stream) === -1 &&
        this._localStreams.indexOf(stream) > -1) {
      this._localStreams.splice(this._localStreams.indexOf(stream), 1);
    }

    this._maybeFireNegotiationNeeded();
  };

  RTCPeerConnection.prototype.removeStream = function(stream) {
    var pc = this;
    stream.getTracks().forEach(function(track) {
      var sender = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (sender) {
        pc.removeTrack(sender);
      }
    });
  };

  RTCPeerConnection.prototype.getSenders = function() {
    return this._transceivers.filter(function(transceiver) {
      return !!transceiver.rtpSender;
    })
    .map(function(transceiver) {
      return transceiver.rtpSender;
    });
  };

  RTCPeerConnection.prototype.getReceivers = function() {
    return this._transceivers.filter(function(transceiver) {
      return !!transceiver.rtpReceiver;
    })
    .map(function(transceiver) {
      return transceiver.rtpReceiver;
    });
  };

  RTCPeerConnection.prototype.setLocalDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(util.makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!util.isActionAllowedInSignalingState('setLocalDescription',
        description.type, pc._signalingState) || pc._isClosed) {
      return Promise.reject(util.makeError('InvalidStateError',
          'Can not set local ' + description.type +
          ' in state ' + pc._signalingState));
    }

    var sections;
    var sessionpart;
    if (description.type === 'offer') {
      // VERY limited support for SDP munging. Limited to:
      // * changing the order of codecs
      sections = SDPUtils.splitSections(description.sdp);
      sessionpart = sections.shift();
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var caps = SDPUtils.parseRtpParameters(mediaSection);
        pc._transceivers[sdpMLineIndex].localCapabilities = caps;
      });

      pc._transceivers.forEach(function(transceiver, sdpMLineIndex) {
        pc._gather(transceiver.mid, sdpMLineIndex);
      });
    } else if (description.type === 'answer') {
      sections = SDPUtils.splitSections(pc._remoteDescription.sdp);
      sessionpart = sections.shift();
      var isIceLite = SDPUtils.matchPrefix(sessionpart,
          'a=ice-lite').length > 0;
      sections.forEach(function(mediaSection, sdpMLineIndex) {
        var transceiver = pc._transceivers[sdpMLineIndex];
        var iceGatherer = transceiver.iceGatherer;
        var iceTransport = transceiver.iceTransport;
        var dtlsTransport = transceiver.dtlsTransport;
        var localCapabilities = transceiver.localCapabilities;
        var remoteCapabilities = transceiver.remoteCapabilities;

        // treat bundle-only as not-rejected.
        var rejected = SDPUtils.isRejected(mediaSection) &&
            SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;

        if (!rejected && !transceiver.rejected) {
          if (transceiver.rtpSender && !transceiver.rtpSender.transport) {
            transceiver.rtpSender.setTransport(transceiver.dtlsTransport);
          }
          var remoteIceParameters = SDPUtils.getIceParameters(
              mediaSection, sessionpart);
          var remoteDtlsParameters = SDPUtils.getDtlsParameters(
              mediaSection, sessionpart);
          if (isIceLite) {
            remoteDtlsParameters.role = 'server';
          }

          if (!pc._usingBundle || sdpMLineIndex === 0) {
            pc._gather(transceiver.mid, sdpMLineIndex);
            if (iceTransport.state === 'new') {
              iceTransport.start(iceGatherer, remoteIceParameters,
                  isIceLite ? 'controlling' : 'controlled');
            }
            if (dtlsTransport.state === 'new') {
              dtlsTransport.start(remoteDtlsParameters);
            }
          }

          // Calculate intersection of capabilities.
          var params = getCommonCapabilities(localCapabilities,
              remoteCapabilities);

          // Start the RTCRtpSender. The RTCRtpReceiver for this
          // transceiver has already been started in setRemoteDescription.
          pc._transceive(transceiver,
              params.codecs.length > 0,
              false);
        }
      });
    }

    pc._localDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-local-offer');
    } else {
      pc._updateSignalingState('stable');
    }

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.setRemoteDescription = function(description) {
    var pc = this;

    // Note: pranswer is not supported.
    if (['offer', 'answer'].indexOf(description.type) === -1) {
      return Promise.reject(util.makeError('TypeError',
          'Unsupported type "' + description.type + '"'));
    }

    if (!util.isActionAllowedInSignalingState('setRemoteDescription',
        description.type, pc._signalingState) || pc._isClosed) {
      return Promise.reject(util.makeError('InvalidStateError',
          'Can not set remote ' + description.type +
          ' in state ' + pc._signalingState));
    }

    var streams = {};
    pc._remoteStreams.forEach(function(stream) {
      streams[stream.id] = stream;
    });
    var receiverList = [];
    var sections = SDPUtils.splitSections(description.sdp);
    var sessionpart = sections.shift();
    var isIceLite = SDPUtils.matchPrefix(sessionpart,
        'a=ice-lite').length > 0;
    var usingBundle = SDPUtils.matchPrefix(sessionpart,
        'a=group:BUNDLE ').length > 0;
    pc._usingBundle = usingBundle;
    var iceOptions = SDPUtils.matchPrefix(sessionpart,
        'a=ice-options:')[0];
    if (iceOptions) {
      pc._canTrickleIceCandidates = iceOptions.substr(14).split(' ')
          .indexOf('trickle') >= 0;
    } else {
      pc._canTrickleIceCandidates = false;
    }

    sections.forEach(function(mediaSection, sdpMLineIndex) {
      var lines = SDPUtils.splitLines(mediaSection);
      var kind = SDPUtils.getKind(mediaSection);
      // treat bundle-only as not-rejected.
      var rejected = SDPUtils.isRejected(mediaSection) &&
          SDPUtils.matchPrefix(mediaSection, 'a=bundle-only').length === 0;
      var protocol = lines[0].substr(2).split(' ')[2];

      var direction = SDPUtils.getDirection(mediaSection, sessionpart);
      var remoteMsid = SDPUtils.parseMsid(mediaSection);

      var mid = SDPUtils.getMid(mediaSection) || SDPUtils.generateIdentifier();

      // Reject datachannels which are not implemented yet.
      if ((kind === 'application' && protocol === 'DTLS/SCTP') || rejected) {
        // TODO: this is dangerous in the case where a non-rejected m-line
        //     becomes rejected.
        pc._transceivers[sdpMLineIndex] = {
          mid: mid,
          kind: kind,
          rejected: true
        };
        return;
      }

      if (!rejected && pc._transceivers[sdpMLineIndex] &&
          pc._transceivers[sdpMLineIndex].rejected) {
        // recycle a rejected transceiver.
        pc._transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
      }

      var transceiver;
      var iceGatherer;
      var iceTransport;
      var dtlsTransport;
      var rtpReceiver;
      var sendEncodingParameters;
      var recvEncodingParameters;
      var localCapabilities;

      var track;
      // FIXME: ensure the mediaSection has rtcp-mux set.
      var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
      var remoteIceParameters;
      var remoteDtlsParameters;
      if (!rejected) {
        remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
            sessionpart);
        remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
            sessionpart);
        if (isIceLite) {
          remoteDtlsParameters.role = 'server';
        } /*else {
          remoteDtlsParameters.role = 'client';
        }*/
      }
      recvEncodingParameters =
          SDPUtils.parseRtpEncodingParameters(mediaSection);

      var rtcpParameters = SDPUtils.parseRtcpParameters(mediaSection);

      var isComplete = SDPUtils.matchPrefix(mediaSection,
          'a=end-of-candidates', sessionpart).length > 0;
      var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
          .map(function(cand) {
            return SDPUtils.parseCandidate(cand);
          })
          .filter(function(cand) {
            return cand.component === 1;
          });

      // Check if we can use BUNDLE and dispose transports.
      if ((description.type === 'offer' || description.type === 'answer') &&
          !rejected && usingBundle && sdpMLineIndex > 0 &&
          pc._transceivers[sdpMLineIndex]) {
        pc._disposeIceAndDtlsTransports(sdpMLineIndex);
        pc._transceivers[sdpMLineIndex].iceGatherer =
            pc._transceivers[0].iceGatherer;
        pc._transceivers[sdpMLineIndex].iceTransport =
            pc._transceivers[0].iceTransport;
        pc._transceivers[sdpMLineIndex].dtlsTransport =
            pc._transceivers[0].dtlsTransport;
        if (pc._transceivers[sdpMLineIndex].rtpSender) {
          pc._transceivers[sdpMLineIndex].rtpSender.setTransport(
              pc._transceivers[0].dtlsTransport);
        }
        if (pc._transceivers[sdpMLineIndex].rtpReceiver) {
          pc._transceivers[sdpMLineIndex].rtpReceiver.setTransport(
              pc._transceivers[0].dtlsTransport);
        }
      }
      if (description.type === 'offer' && !rejected) {
        transceiver = pc._transceivers[sdpMLineIndex] ||
            pc._createTransceiver(kind);
        transceiver.mid = mid;

        if (!transceiver.iceGatherer) {
          transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
              usingBundle);
        }

        if (cands.length && transceiver.iceTransport.state === 'new') {
          if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
            transceiver.iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              util.maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        localCapabilities = window.RTCRtpReceiver.getCapabilities(kind);

        // filter RTX until additional stuff needed for RTX is implemented
        // in adapter.js
        if (edgeVersion < 15019) {
          localCapabilities.codecs = localCapabilities.codecs.filter(
              function(codec) {
                return codec.name !== 'rtx';
              });
        }

        sendEncodingParameters = transceiver.sendEncodingParameters || [{
          //ssrc: (2 * sdpMLineIndex + 2) * 1001
          ssrc: parseInt(Math.random() * (9999999999) + 999999999)
        }];

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        var isNewTrack = false;
        if (direction === 'sendrecv' || direction === 'sendonly') {
          isNewTrack = !transceiver.rtpReceiver;
          rtpReceiver = transceiver.rtpReceiver ||
              new window.RTCRtpReceiver(transceiver.dtlsTransport, kind);

          if (isNewTrack) {
            var stream;
            track = rtpReceiver.track;
            // FIXME: does not work with Plan B.
            if (remoteMsid && remoteMsid.stream === '-') {
              // no-op. a stream id of '-' means: no associated stream.
            } else if (remoteMsid) {
              if (!streams[remoteMsid.stream]) {
                streams[remoteMsid.stream] = new window.MediaStream();
                Object.defineProperty(streams[remoteMsid.stream], 'id', {
                  get: function() {
                    return remoteMsid.stream;
                  }
                });
              }
              Object.defineProperty(track, 'id', {
                get: function() {
                  return remoteMsid.track;
                }
              });
              stream = streams[remoteMsid.stream];
            } else {
              if (!streams.default) {
                streams.default = new window.MediaStream();
              }
              stream = streams.default;
            }
            if (stream) {
              util.addTrackToStreamAndFireEvent(track, stream);
              transceiver.associatedRemoteMediaStreams.push(stream);
            }
            receiverList.push([track, rtpReceiver, stream]);
          }
        } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
          transceiver.associatedRemoteMediaStreams.forEach(function(s) {
            var nativeTrack = s.getTracks().find(function(t) {
              return t.id === transceiver.rtpReceiver.track.id;
            });
            if (nativeTrack) {
              util.removeTrackFromStreamAndFireEvent(nativeTrack, s);
            }
          });
          transceiver.associatedRemoteMediaStreams = [];
        }

        transceiver.localCapabilities = localCapabilities;
        transceiver.remoteCapabilities = remoteCapabilities;
        transceiver.rtpReceiver = rtpReceiver;
        transceiver.rtcpParameters = rtcpParameters;
        transceiver.sendEncodingParameters = sendEncodingParameters;
        transceiver.recvEncodingParameters = recvEncodingParameters;

        // Start the RTCRtpReceiver now. The RTPSender is started in
        // setLocalDescription.
        pc._transceive(pc._transceivers[sdpMLineIndex],
            false,
            isNewTrack);
      } else if (description.type === 'answer' && !rejected) {
        transceiver = pc._transceivers[sdpMLineIndex];
        iceGatherer = transceiver.iceGatherer;
        iceTransport = transceiver.iceTransport;
        dtlsTransport = transceiver.dtlsTransport;
        rtpReceiver = transceiver.rtpReceiver;
        sendEncodingParameters = transceiver.sendEncodingParameters;
        localCapabilities = transceiver.localCapabilities;

        pc._transceivers[sdpMLineIndex].recvEncodingParameters =
            recvEncodingParameters;
        pc._transceivers[sdpMLineIndex].remoteCapabilities =
            remoteCapabilities;
        pc._transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;

        if (cands.length && iceTransport.state === 'new') {
          if ((isIceLite || isComplete) &&
              (!usingBundle || sdpMLineIndex === 0)) {
            iceTransport.setRemoteCandidates(cands);
          } else {
            cands.forEach(function(candidate) {
              util.maybeAddCandidate(transceiver.iceTransport, candidate);
            });
          }
        }

        if (!usingBundle || sdpMLineIndex === 0) {
          if (iceTransport.state === 'new') {
            iceTransport.start(iceGatherer, remoteIceParameters,
                'controlling');
          }
          if (dtlsTransport.state === 'new') {
            dtlsTransport.start(remoteDtlsParameters);
          }
        }
        if (transceiver.rtpSender && !transceiver.rtpSender.transport) {
          transceiver.rtpSender.setTransport(transceiver.dtlsTransport);
        }

        pc._transceive(transceiver,
            direction === 'sendrecv' || direction === 'recvonly',
            direction === 'sendrecv' || direction === 'sendonly');

        // TODO: rewrite to use http://w3c.github.io/webrtc-pc/#set-associated-remote-streams
        if (rtpReceiver &&
            (direction === 'sendrecv' || direction === 'sendonly')) {
          track = rtpReceiver.track;
          if (remoteMsid) {
            if (!streams[remoteMsid.stream]) {
              streams[remoteMsid.stream] = new window.MediaStream();
            }
            util.addTrackToStreamAndFireEvent(track,
                streams[remoteMsid.stream]);
            receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
          } else {
            if (!streams.default) {
              streams.default = new window.MediaStream();
            }
            util.addTrackToStreamAndFireEvent(track, streams.default);
            receiverList.push([track, rtpReceiver, streams.default]);
          }
        } else {
          // FIXME: actually the receiver should be created later.
          delete transceiver.rtpReceiver;
        }
      }
    });

    if (pc._dtlsRole === undefined) {
      pc._dtlsRole = description.type === 'offer' ? 'active' : 'passive';
    }

    pc._remoteDescription = {
      type: description.type,
      sdp: description.sdp
    };
    if (description.type === 'offer') {
      pc._updateSignalingState('have-remote-offer');
    } else {
      pc._updateSignalingState('stable');
    }
    Object.keys(streams).forEach(function(sid) {
      var stream = streams[sid];
      if (stream.getTracks().length) {
        if (pc._remoteStreams.indexOf(stream) === -1) {
          pc._remoteStreams.push(stream);
          var event = new Event('addstream');
          event.stream = stream;
          window.setTimeout(function() {
            pc._dispatchEvent('addstream', event);
          });
        }

        receiverList.forEach(function(item) {
          var track = item[0];
          var receiver = item[1];
          if (stream.id !== item[2].id) {
            return;
          }
          pc._emitTrack(track, receiver, [stream]);
        });
      }
    });
    receiverList.forEach(function(item) {
      if (item[2]) {
        return;
      }
      pc._emitTrack(item[0], item[1], []);
    });

    // check whether addIceCandidate({}) was called within four seconds after
    // setRemoteDescription.
    window.setTimeout(function() {
      if (!(pc && pc._transceivers) || pc._isClosed) {
        return;
      }
      pc._transceivers.forEach(function(transceiver) {
        if (transceiver.iceTransport &&
            transceiver.iceTransport.state === 'new' &&
            transceiver.iceTransport.getRemoteCandidates().length > 0) {
          console.warn('Timeout for addRemoteCandidate. Consider sending ' +
              'an end-of-candidates notification');
          transceiver.iceTransport.addRemoteCandidate({});
        }
      });
    }, 4000);

    return Promise.resolve();
  };

  RTCPeerConnection.prototype.close = function() {
    this._transceivers.forEach(function(transceiver) {
      /* not yet
      if (transceiver.iceGatherer) {
        transceiver.iceGatherer.close();
      }
      */
      if (transceiver.iceTransport) {
        transceiver.iceTransport.stop();
      }
      if (transceiver.dtlsTransport) {
        transceiver.dtlsTransport.stop();
      }
      if (transceiver.rtpSender) {
        transceiver.rtpSender.stop();
      }
      if (transceiver.rtpReceiver) {
        transceiver.rtpReceiver.stop();
      }
    });
    // FIXME: clean up tracks, local streams, remote streams, etc
    this._isClosed = true;
    this._updateSignalingState('closed');
    this._iceConnectionState = 'closed';
    this._connectionState = 'closed';
  };

  RTCPeerConnection.prototype.createOffer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(util.makeError('InvalidStateError',
          'Can not call createOffer after close'));
    }

    var numAudioTracks = pc._transceivers.filter(function(t) {
      return t.kind === 'audio';
    }).length;
    var numVideoTracks = pc._transceivers.filter(function(t) {
      return t.kind === 'video';
    }).length;

    // Determine number of audio and video tracks we need to send/recv.
    var offerOptions = arguments[0];
    if (offerOptions) {
      // Reject Chrome legacy constraints.
      if (offerOptions.mandatory || offerOptions.optional) {
        throw new TypeError(
            'Legacy mandatory/optional constraints not supported.');
      }
      if (offerOptions.offerToReceiveAudio !== undefined) {
        if (offerOptions.offerToReceiveAudio === true) {
          numAudioTracks = 1;
        } else if (offerOptions.offerToReceiveAudio === false) {
          numAudioTracks = 0;
        } else {
          numAudioTracks = offerOptions.offerToReceiveAudio;
        }
      }
      if (offerOptions.offerToReceiveVideo !== undefined) {
        if (offerOptions.offerToReceiveVideo === true) {
          numVideoTracks = 1;
        } else if (offerOptions.offerToReceiveVideo === false) {
          numVideoTracks = 0;
        } else {
          numVideoTracks = offerOptions.offerToReceiveVideo;
        }
      }
    }

    pc._transceivers.forEach(function(transceiver) {
      if (transceiver.kind === 'audio') {
        numAudioTracks--;
        if (numAudioTracks < 0) {
          transceiver.wantReceive = false;
        }
      } else if (transceiver.kind === 'video') {
        numVideoTracks--;
        if (numVideoTracks < 0) {
          transceiver.wantReceive = false;
        }
      }
    });

    // Create M-lines for recvonly streams.
    while (numAudioTracks > 0 || numVideoTracks > 0) {
      if (numAudioTracks > 0) {
        pc._createTransceiver('audio');
        numAudioTracks--;
      }
      if (numVideoTracks > 0) {
        pc._createTransceiver('video');
        numVideoTracks--;
      }
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    pc._transceivers.forEach(function(transceiver, sdpMLineIndex) {
      // For each track, create an ice gatherer, ice transport,
      // dtls transport, potentially rtpsender and rtpreceiver.
      var track = transceiver.track;
      var kind = transceiver.kind;
      var mid = transceiver.mid || SDPUtils.generateIdentifier();
      transceiver.mid = mid;

      if (!transceiver.iceGatherer) {
        transceiver.iceGatherer = pc._createIceGatherer(sdpMLineIndex,
            pc._usingBundle);
      }

      var localCapabilities = window.RTCRtpSender.getCapabilities(kind);
      // filter RTX until additional stuff needed for RTX is implemented
      // in adapter.js
      if (edgeVersion < 15019) {
        localCapabilities.codecs = localCapabilities.codecs.filter(
            function(codec) {
              return codec.name !== 'rtx';
            });
      }
      localCapabilities.codecs.forEach(function(codec) {
        // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
        // by adding level-asymmetry-allowed=1
        if (codec.name.toLowerCase() === 'h264' &&
            codec.parameters['level-asymmetry-allowed'] === undefined) {
          codec.parameters['level-asymmetry-allowed'] = '1';
        }

        // for subsequent offers, we might have to re-use the payload
        // type of the last offer.
        if (transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.codecs) {
          transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
            if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() &&
                codec.clockRate === remoteCodec.clockRate) {
              codec.preferredPayloadType = remoteCodec.payloadType;
            }
          });
        }
      });
      localCapabilities.headerExtensions.forEach(function(hdrExt) {
        var remoteExtensions = transceiver.remoteCapabilities &&
            transceiver.remoteCapabilities.headerExtensions || [];
        remoteExtensions.forEach(function(rHdrExt) {
          if (hdrExt.uri === rHdrExt.uri) {
            hdrExt.id = rHdrExt.id;
          }
        });
      });

      // generate an ssrc now, to be used later in rtpSender.send
      var sendEncodingParameters = transceiver.sendEncodingParameters || [{
        //ssrc: (2 * sdpMLineIndex + 1) * 1001
        ssrc: parseInt(Math.random() * (9999999999) + 999999999)
      }];
      if (track) {
        // add RTX
        if (edgeVersion >= 15019 && kind === 'video' &&
            !sendEncodingParameters[0].rtx) {
          sendEncodingParameters[0].rtx = {
            ssrc: sendEncodingParameters[0].ssrc + 1
          };
        }
      }

      if (transceiver.wantReceive) {
        transceiver.rtpReceiver = new window.RTCRtpReceiver(
            transceiver.dtlsTransport, kind);
      }

      transceiver.localCapabilities = localCapabilities;
      transceiver.sendEncodingParameters = sendEncodingParameters;
    });

    // always offer BUNDLE and dispose on return if not supported.
    if (pc._config.bundlePolicy !== 'max-compat') {
      sdp += 'a=group:BUNDLE ' + pc._transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    sdp += 'a=ice-options:trickle\r\n';

    pc._transceivers.forEach(function(transceiver, sdpMLineIndex) {
      sdp += writeMediaSection(transceiver, transceiver.localCapabilities,
          'offer', transceiver.stream, pc._dtlsRole);
      sdp += 'a=rtcp-rsize\r\n';

      if (transceiver.iceGatherer && pc._iceGatheringState !== 'new' &&
          (sdpMLineIndex === 0 || !pc._usingBundle)) {
        transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
          cand.component = 1;
          sdp += 'a=' + SDPUtils.writeCandidate(cand) + '\r\n';
        });

        if (transceiver.iceGatherer.state === 'complete') {
          sdp += 'a=end-of-candidates\r\n';
        }
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'offer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.createAnswer = function() {
    var pc = this;

    if (pc._isClosed) {
      return Promise.reject(util.makeError('InvalidStateError',
          'Can not call createAnswer after close'));
    }

    if (!(pc._signalingState === 'have-remote-offer' ||
        pc._signalingState === 'have-local-pranswer')) {
      return Promise.reject(util.makeError('InvalidStateError',
          'Can not call createAnswer in signalingState ' + pc._signalingState));
    }

    var sdp = SDPUtils.writeSessionBoilerplate(pc._sdpSessionId,
        pc._sdpSessionVersion++);
    if (pc._usingBundle) {
      sdp += 'a=group:BUNDLE ' + pc._transceivers.map(function(t) {
        return t.mid;
      }).join(' ') + '\r\n';
    }
    var mediaSectionsInOffer = SDPUtils.getMediaSections(
        pc._remoteDescription.sdp).length;
    pc._transceivers.forEach(function(transceiver, sdpMLineIndex) {
      if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
        return;
      }
      if (transceiver.rejected) {
        if (transceiver.kind === 'application') {
          sdp += 'm=application 0 DTLS/SCTP 5000\r\n';
        } else if (transceiver.kind === 'audio') {
          sdp += 'm=audio 0 UDP/TLS/RTP/SAVPF 0\r\n' +
              'a=rtpmap:0 PCMU/8000\r\n';
        } else if (transceiver.kind === 'video') {
          sdp += 'm=video 0 UDP/TLS/RTP/SAVPF 120\r\n' +
              'a=rtpmap:120 VP8/90000\r\n';
        }
        sdp += 'c=IN IP4 0.0.0.0\r\n' +
            'a=inactive\r\n' +
            'a=mid:' + transceiver.mid + '\r\n';
        return;
      }

      // FIXME: look at direction.
      if (transceiver.stream) {
        var localTrack;
        if (transceiver.kind === 'audio') {
          localTrack = transceiver.stream.getAudioTracks()[0];
        } else if (transceiver.kind === 'video') {
          localTrack = transceiver.stream.getVideoTracks()[0];
        }
        if (localTrack) {
          // add RTX
          if (edgeVersion >= 15019 && transceiver.kind === 'video' &&
              !transceiver.sendEncodingParameters[0].rtx) {
            transceiver.sendEncodingParameters[0].rtx = {
              ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
            };
          }
        }
      }

      // Calculate intersection of capabilities.
      var commonCapabilities = getCommonCapabilities(
          transceiver.localCapabilities,
          transceiver.remoteCapabilities);

      var hasRtx = commonCapabilities.codecs.filter(function(c) {
        return c.name.toLowerCase() === 'rtx';
      }).length;
      if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
        delete transceiver.sendEncodingParameters[0].rtx;
      }

      sdp += writeMediaSection(transceiver, commonCapabilities,
          'answer', transceiver.stream, pc._dtlsRole);
      if (transceiver.rtcpParameters &&
          transceiver.rtcpParameters.reducedSize) {
        sdp += 'a=rtcp-rsize\r\n';
      }
    });

    var desc = new window.RTCSessionDescription({
      type: 'answer',
      sdp: sdp
    });
    return Promise.resolve(desc);
  };

  RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
    var pc = this;
    var sections;
    if (candidate && !(candidate.sdpMLineIndex !== undefined ||
        candidate.sdpMid)) {
      return Promise.reject(new TypeError('sdpMLineIndex or sdpMid required'));
    }

    // TODO: needs to go into ops queue.
    return new Promise(function(resolve, reject) {
      if (!pc._remoteDescription) {
        return reject(util.makeError('InvalidStateError',
            'Can not add ICE candidate without a remote description'));
      } else if (!candidate || candidate.candidate === '') {
        for (var j = 0; j < pc._transceivers.length; j++) {
          if (pc._transceivers[j].rejected) {
            continue;
          }
          pc._transceivers[j].iceTransport.addRemoteCandidate({});
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[j] += 'a=end-of-candidates\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
          if (pc._usingBundle) {
            break;
          }
        }
      } else {
        var sdpMLineIndex = candidate.sdpMLineIndex;
        if (candidate.sdpMid) {
          for (var i = 0; i < pc._transceivers.length; i++) {
            if (pc._transceivers[i].mid === candidate.sdpMid) {
              sdpMLineIndex = i;
              break;
            }
          }
        }
        var transceiver = pc._transceivers[sdpMLineIndex];
        if (transceiver) {
          if (transceiver.rejected) {
            return resolve();
          }
          var cand = Object.keys(candidate.candidate).length > 0 ?
              SDPUtils.parseCandidate(candidate.candidate) : {};
          // Ignore Chrome's invalid candidates since Edge does not like them.
          if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
            return resolve();
          }
          // Ignore RTCP candidates, we assume RTCP-MUX.
          if (cand.component && cand.component !== 1) {
            return resolve();
          }
          // when using bundle, avoid adding candidates to the wrong
          // ice transport. And avoid adding candidates added in the SDP.
          if (sdpMLineIndex === 0 || (sdpMLineIndex > 0 &&
              transceiver.iceTransport !== pc._transceivers[0].iceTransport)) {
            if (!util.maybeAddCandidate(transceiver.iceTransport, cand)) {
              return reject(util.makeError('OperationError',
                  'Can not add ICE candidate'));
            }
          }

          // update the remoteDescription.
          var candidateString = candidate.candidate.trim();
          if (candidateString.indexOf('a=') === 0) {
            candidateString = candidateString.substr(2);
          }
          sections = SDPUtils.getMediaSections(pc._remoteDescription.sdp);
          sections[sdpMLineIndex] += 'a=' +
              (cand.type ? candidateString : 'end-of-candidates')
              + '\r\n';
          pc._remoteDescription.sdp =
              SDPUtils.getDescription(pc._remoteDescription.sdp) +
              sections.join('');
        } else {
          return reject(util.makeError('OperationError',
              'Can not add ICE candidate'));
        }
      }
      resolve();
    });
  };

  RTCPeerConnection.prototype.getStats = function(selector) {
    if (selector && selector instanceof window.MediaStreamTrack) {
      var senderOrReceiver = null;
      this._transceivers.forEach(function(transceiver) {
        if (transceiver.rtpSender &&
            transceiver.rtpSender.track === selector) {
          senderOrReceiver = transceiver.rtpSender;
        } else if (transceiver.rtpReceiver &&
            transceiver.rtpReceiver.track === selector) {
          senderOrReceiver = transceiver.rtpReceiver;
        }
      });
      if (!senderOrReceiver) {
        throw util.makeError('InvalidAccessError', 'Invalid selector.');
      }
      return senderOrReceiver.getStats();
    }

    var promises = [];
    this._transceivers.forEach(function(transceiver) {
      ['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
          'dtlsTransport'].forEach(function(method) {
            if (transceiver[method]) {
              promises.push(transceiver[method].getStats());
            }
          });
    });

    var fixStatsType = function(stat) {
        return {
               inboundrtp: 'inbound-rtp',
               outboundrtp: 'outbound-rtp',
               candidatepair: 'candidate-pair',
               localcandidate: 'local-candidate',
               remotecandidate: 'remote-candidate'
      }[stat.type] || stat.type;
    };

    var changeStatsId = function(stat) {
        //Process to Make id same as Safari 11
        //"RTCInboundRTPAudioStream_1083123237" type:inbound-rtp
        //"RTCMediaStreamTrack_remote_audio_1933dd34-b9ea-47f9-bb50-8a63066d1040_1083123237" type:track
        //"RTCIceCandidatePair_NdYBJBeB_R6qzWbjo" type:candidate-pair
        //"RTCOutboundRTPVideoStream_516421151" type:outbound-rtp
        var newId;
        //Todo: Added UNknown TYPE.
        var mediaType = stat.mediaType ? (stat.mediaType.charAt(0).toUpperCase() + stat.mediaType.slice(1))
                        : ((stat.codecId && stat.codecId.match(/(vp8|h264|vp9|h265|x-h264uc)/i)) ? 'Video' : 'Audio');
        switch (stat.type) {
          case 'inbound-rtp':
            newId = "RTCInboundRTP" + mediaType + "Stream_" + stat.id;
          case 'outbound-rtp':
            newId = "RTCOutboundRTP" + mediaType + "Stream_" + stat.id;
          case 'track':
            newId = "RTCMediaStreamTrack_" + (stat.remoteSource ? "remote_" : "local_") + mediaType + "_" + stat.id;
            //Todo: Changed all oldId in other object with the newId
            stat.id = newId;
            return newId;
          default:
            //do nothings
            return stat.id;
        }
    }

    return new Promise(function(resolve) {
      // shim getStats with maplike support
      var results = new Map();
      Promise.all(promises).then(function(res) {
        res.forEach(function(result) {
          Object.keys(result).forEach(function(id) {
            result[id].type = fixStatsType(result[id]);
            //results.set(id, result[id]);
            var newId = changeStatsId(result[id]);
            results.set(newId, result[id]);
          });
        });
        resolve(results);
      });
    });
  };

  // legacy callback shims. Should be moved to adapter.js some day?
  util.shimLegacyCallbacks(RTCPeerConnection);

  return RTCPeerConnection;
};

},{"./getcommoncapabilities":2,"./rtcdtlstransport":3,"./rtcicegatherer":4,"./rtcicetransport":5,"./rtcrtpsender":7,"./util":8,"./writemediasection":9,"sdp":10}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2017 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var util = require('./util');

/* a wrapper around Edge's RTCRtpSender that does a lazy construct of
 * of the native sender when all the required parameters (track and
 * transport) are available.
 */
module.exports = function(window) {
  var RTCRtpSender_ = window.RTCRtpSender;
  var RTCRtpSender = function(trackOrKind, transport) {
    this._sender = null;
    this._track = null;
    this._transport = null;

    if (typeof trackOrKind === 'string') {
      this.kind = trackOrKind;
      this._transport = transport || null;
    } else if (!transport) {
      this._track = trackOrKind;
      this.kind = trackOrKind.kind;
    } else {
      this._sender = new RTCRtpSender_(trackOrKind, transport);
      this.kind = trackOrKind.kind;
    }
    this._isStopped = false;
  };

  // ORTC defines the DTMF sender a bit different.
  // https://github.com/w3c/ortc/issues/714
  Object.defineProperty(RTCRtpSender.prototype, 'dtmf', {
    get: function() {
      if (this._dtmf === undefined) {
        if (this.kind === 'audio') {
          if (!this._sender) {
            throw(util.makeError('InvalidStateError',
                'Can not access dtmf in this state'));
          } else {
            this._dtmf = new window.RTCDtmfSender(this._sender);
          }
        } else if (this.kind === 'video') {
          this._dtmf = null;
        }
      }
      return this._dtmf;
    }
  });

  RTCRtpSender.getCapabilities = RTCRtpSender_.getCapabilities;

  Object.defineProperty(RTCRtpSender.prototype, 'track', {
    get: function() {
      return this._sender ? this._sender.track : this._track;
    }
  });

  Object.defineProperty(RTCRtpSender.prototype, 'transport', {
    get: function() {
      return this._sender ? this._sender.transport : this._transport;
    }
  });

  RTCRtpSender.prototype.setTransport = function(transport) {
    if (!this._sender && this._track) {
      this._sender = new RTCRtpSender_(this._track, transport);
    } else if (this._sender) {
      this._sender.setTransport(transport);
    } else {
      this._transport = transport;
    }
  };

  RTCRtpSender.prototype.replaceTrack = function(track) {
    if (track && this.kind !== track.kind) {
      return Promise.reject(new TypeError());
    }
    if (this._sender) {
      this._sender.replaceTrack(track);
    } else if (track && this._transport) {
      this._sender = new RTCRtpSender_(track, this._transport);
    } else {
      this._track = track;
    }
    return Promise.resolve();
  };

  RTCRtpSender.prototype.setTrack = function(track) { // deprecated.
    if (track && this.kind !== track.kind) {
      return Promise.reject(new TypeError());
    }
    if (this._sender) {
      this._sender.setTrack(track);
    } else if (track && this._transport) {
      this._sender = new RTCRtpSender_(track, this._transport);
    } else {
      this._track = track;
    }
    return Promise.resolve();
  };

  RTCRtpSender.prototype.send = function(parameters) {
    if (this._sender) {
      return this._sender.send(parameters);
    }
    return Promise.reject(util.makeError('InvalidStateError',
        'Can not call send in this state'));
  };

  RTCRtpSender.prototype.stop = function() {
    if (this._sender) {
      this._sender.stop();
    }
  };

  RTCRtpSender.prototype.getStats = function() {
    if (this._sender) {
      return this._sender.getStats();
    }
    return Promise.reject(util.makeError('InvalidStateError',
        'Can not call send in this state'));
  };
  return RTCRtpSender;
};

},{"./util":8}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2017 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

/* fixes stat type names */
function fixStatsType(stat) {
  return {
    inboundrtp: 'inbound-rtp',
    outboundrtp: 'outbound-rtp',
    candidatepair: 'candidate-pair',
    localcandidate: 'local-candidate',
    remotecandidate: 'remote-candidate'
  }[stat.type] || stat.type;
}

module.exports = {
  fixStatsType: fixStatsType,
  makeError: function(name, description) {
    var e = new Error(description);
    e.name = name;
    // legacy error codes from https://heycam.github.io/webidl/#idl-DOMException-error-names
    e.code = {
      NotSupportedError: 9,
      InvalidStateError: 11,
      InvalidAccessError: 15,
      TypeError: undefined,
      OperationError: undefined
    }[name];
    return e;
  },
  // Edge does not like
  // 1) stun: filtered after 14393 unless ?transport=udp is present
  // 2) turn: that does not have all of turn:host:port?transport=udp
  // 3) turn: with ipv6 addresses
  // 4) turn: occurring muliple times
  filterIceServers: function(iceServers, edgeVersion) {
    var hasTurn = false;
    iceServers = JSON.parse(JSON.stringify(iceServers));
    return iceServers.filter(function(server) {
      if (server && (server.urls || server.url)) {
        var urls = server.urls || server.url;
        if (server.url && !server.urls) {
          console.warn('RTCIceServer.url is deprecated! Use urls instead.');
        }
        var isString = typeof urls === 'string';
        if (isString) {
          urls = [urls];
        }
        urls = urls.filter(function(url) {
          var validTurn = url.indexOf('turn:') === 0 &&
              url.indexOf('transport=udp') !== -1 &&
              url.indexOf('turn:[') === -1 &&
              !hasTurn;

          if (validTurn) {
            hasTurn = true;
            return true;
          }
          return url.indexOf('stun:') === 0 && edgeVersion >= 14393 &&
              url.indexOf('?transport=udp') === -1;
        });

        delete server.url;
        server.urls = isString ? urls[0] : urls;
        return !!urls.length;
      }
    });
  },

  /* makes ORTC objects return a Map() with hyphenated stats names */
  fixORTCGetStats: function(window) {
    // fix low-level stat names and return Map instead of object.
    var ortcObjects = ['RTCRtpSender', 'RTCRtpReceiver', 'RTCIceGatherer',
      'RTCIceTransport', 'RTCDtlsTransport'];
    ortcObjects.forEach(function(ortcObjectName) {
      var obj = window[ortcObjectName];
      if (obj && obj.prototype && obj.prototype.getStats) {
        var nativeGetstats = obj.prototype.getStats;
        obj.prototype.getStats = function() {
          return nativeGetstats.apply(this)
          .then(function(nativeStats) {
            var mapStats = new Map();
            Object.keys(nativeStats).forEach(function(id) {
              nativeStats[id].type = fixStatsType(nativeStats[id]);
              mapStats.set(id, nativeStats[id]);
            });
            return mapStats;
          });
        };
      }
    });
  },

  /* creates an alias name for an event listener */
  aliasEventListener: function(obj, eventName, alias) {
    ['addEventListener', 'removeEventListener'].forEach(function(method) {
      var nativeMethod = obj[method];
      obj[method] = function(nativeEventName, cb) {
        if (nativeEventName !== alias) {
          return nativeMethod.apply(this, arguments);
        }
        return nativeMethod.apply(this, [eventName, cb]);
      };
    });

    Object.defineProperty(obj, 'on' + alias, {
      get: function() {
        return this['_on' + alias];
      },
      set: function(cb) {
        if (this['_on' + alias]) {
          this.removeEventListener(alias, this['_on' + alias]);
          delete this['_on' + alias];
        }
        if (cb) {
          this.addEventListener(alias, this['_on' + alias] = cb);
        }
      }
    });
  },

  /* adds the track to the stream and dispatches 'addtrack' */
  addTrackToStreamAndFireEvent: function(track, stream) {
    stream.addTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('addtrack',
        {track: track}));
  },

  /* adds the track from the stream and dispatches 'removetrack' */
  removeTrackFromStreamAndFireEvent: function(track, stream) {
    stream.removeTrack(track);
    stream.dispatchEvent(new window.MediaStreamTrackEvent('removetrack',
        {track: track}));
  },

  /* adds a candidate to an iceTransport unless already added */
  maybeAddCandidate: function(iceTransport, candidate) {
    // Edge's internal representation adds some fields therefore
    // not all fieldѕ are taken into account.
    var alreadyAdded = iceTransport.getRemoteCandidates()
        .find(function(remoteCandidate) {
          return candidate.foundation === remoteCandidate.foundation &&
              candidate.ip === remoteCandidate.ip &&
              candidate.port === remoteCandidate.port &&
              candidate.priority === remoteCandidate.priority &&
              candidate.protocol === remoteCandidate.protocol &&
              candidate.type === remoteCandidate.type;
        });
    if (!alreadyAdded) {
      iceTransport.addRemoteCandidate(candidate);
    }
    return !alreadyAdded;
  },

  /* checks if action (e.g. SLD) with type is allowed in signalingState */
  isActionAllowedInSignalingState: function(action, type, signalingState) {
    return {
      offer: {
        setLocalDescription: ['stable', 'have-local-offer'],
        setRemoteDescription: ['stable', 'have-remote-offer']
      },
      answer: {
        setLocalDescription: ['have-remote-offer', 'have-local-pranswer'],
        setRemoteDescription: ['have-local-offer', 'have-remote-pranswer']
      }
    }[type][action].indexOf(signalingState) !== -1;
  },

  /* shims legacy callsback style */
  shimLegacyCallbacks: function(RTCPeerConnection) {
    var methods = ['createOffer', 'createAnswer'];
    methods.forEach(function(method) {
      var nativeMethod = RTCPeerConnection.prototype[method];
      RTCPeerConnection.prototype[method] = function() {
        var args = arguments;
        if (typeof args[0] === 'function' ||
            typeof args[1] === 'function') { // legacy
          return nativeMethod.apply(this, [arguments[2]])
          .then(function(description) {
            if (typeof args[0] === 'function') {
              args[0].apply(null, [description]);
            }
          }, function(error) {
            if (typeof args[1] === 'function') {
              args[1].apply(null, [error]);
            }
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    methods = ['setLocalDescription', 'setRemoteDescription',
        'addIceCandidate'];
    methods.forEach(function(method) {
      var nativeMethod = RTCPeerConnection.prototype[method];
      RTCPeerConnection.prototype[method] = function() {
        var args = arguments;
        if (typeof args[1] === 'function' ||
            typeof args[2] === 'function') { // legacy
          return nativeMethod.apply(this, arguments)
          .then(function() {
            if (typeof args[1] === 'function') {
              args[1].apply(null);
            }
          }, function(error) {
            if (typeof args[2] === 'function') {
              args[2].apply(null, [error]);
            }
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });

    // getStats is special. It doesn't have a spec legacy method yet we support
    // getStats(something, cb) without error callbacks.
    ['getStats'].forEach(function(method) {
      var nativeMethod = RTCPeerConnection.prototype[method];
      RTCPeerConnection.prototype[method] = function() {
        var args = arguments;
        if (typeof args[1] === 'function') {
          return nativeMethod.apply(this, arguments)
          .then(function() {
            if (typeof args[1] === 'function') {
              args[1].apply(null);
            }
          });
        }
        return nativeMethod.apply(this, arguments);
      };
    });
  }
};

},{}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2018 Philipp Hancke. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

var SDPUtils = require('sdp');
/* generates a m= SDP from a transceiver. */
module.exports = function(transceiver, caps, type, stream, dtlsRole) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : dtlsRole);

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender) {
    var trackId = transceiver.rtpSender._initialTrackId ||
        transceiver.rtpSender.track.id;
    transceiver.rtpSender._initialTrackId = trackId;
    // spec.
    var msid = 'msid:' + (stream ? stream.id : '-') + ' ' +
        trackId + '\r\n';
    sdp += 'a=' + msid;

    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc-group:FID ' +
             transceiver.sendEncodingParameters[0].ssrc + ' ' +
             transceiver.sendEncodingParameters[0].rtx.ssrc +
             '\r\n';
    }

    // Original stream information
    // FIXME: this should be written by writeRtpDescription.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
           ' cname:' + SDPUtils.localCName + '\r\n';

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
           ' ' + msid;

    // RTX stream information
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
             ' cname:' + SDPUtils.localCName + '\r\n';
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
             ' ' + msid;
    }
  }

  return sdp;
};

},{"sdp":10}],10:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
    return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
    return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// returns the session description.
SDPUtils.getDescription = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  return sections && sections[0];
};

// returns the individual media sections.
SDPUtils.getMediaSections = function(blob) {
  var sections = SDPUtils.splitSections(blob);
  sections.shift();
  return sections;
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
    return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
    parts = line.substring(12).split(' ');
  } else {
    parts = line.substring(10).split(' ');
  }

  var candidate = {
    foundation: parts[0],
    component: parseInt(parts[1], 10),
    protocol: parts[2].toLowerCase(),
    priority: parseInt(parts[3], 10),
    ip: parts[4],
    port: parseInt(parts[5], 10),
    // skip parts[6] == 'typ'
    type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
    switch (parts[i]) {
      case 'raddr':
        candidate.relatedAddress = parts[i + 1];
        break;
      case 'rport':
        candidate.relatedPort = parseInt(parts[i + 1], 10);
        break;
      case 'tcptype':
        candidate.tcpType = parts[i + 1];
        break;
      case 'ufrag':
        candidate.ufrag = parts[i + 1]; // for backward compability.
        candidate.usernameFragment = parts[i + 1];
        break;
      default: // extension handling, in particular ufrag
        candidate[parts[i]] = parts[i + 1];
        break;
    }
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
      candidate.relatedPort) {
    sdp.push('raddr');
    sdp.push(candidate.relatedAddress); // was: relAddr
    sdp.push('rport');
    sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
    sdp.push('tcptype');
    sdp.push(candidate.tcpType);
  }
  if (candidate.usernameFragment || candidate.ufrag) {
    sdp.push('ufrag');
    sdp.push(candidate.usernameFragment || candidate.ufrag);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an ice-options line, returns an array of option tags.
// a=ice-options:foo bar
SDPUtils.parseIceOptions = function(line) {
  return line.substr(14).split(' ');
}

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
    payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
      (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
// a=extmap:2/sendonly urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
    id: parseInt(parts[0], 10),
    direction: parts[0].indexOf('/') > 0 ? parts[0].split('/')[1] : 'sendrecv',
    uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
      (headerExtension.direction && headerExtension.direction !== 'sendrecv'
          ? '/' + headerExtension.direction
          : '') +
      ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
    kv = parts[j].trim().split('=');
    parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
    var params = [];
    Object.keys(codec.parameters).forEach(function(param) {
      params.push(param + '=' + codec.parameters[param]);
    });
    line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
    type: parts.shift(),
    parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
    pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
    // FIXME: special handling for trr-int?
    codec.rtcpFeedback.forEach(function(fb) {
      lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
      (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
          '\r\n';
    });
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
    ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
    parts.attribute = line.substr(sp + 1, colon - sp - 1);
    parts.value = line.substr(colon + 1);
  } else {
    parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts the MID (RFC 5888) from a media section.
// returns the MID or undefined if no mid line was found.
SDPUtils.getMid = function(mediaSection) {
  var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:')[0];
  if (mid) {
    return mid.substr(6);
  }
}

SDPUtils.parseFingerprint = function(line) {
  var parts = line.substr(14).split(' ');
  return {
    algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
    value: parts[1]
  };
};

SDPUtils.parseDtlsRole = function(line) {
    var parts = line.substr(8);
    return {
           algorithm: parts[0].toLowerCase(), // algorithm is case-sensitive in Edge.
           value: parts[1]
    };
}; 

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=fingerprint:');
  var roleline = SDPUtils.matchPrefix(mediaSection + sessionpart,
      'a=setup:');

  var role = 'auto';
  if (roleline && roleline[0]) {
    var _type = roleline[0].substr(8);
    if (_type === 'passive') {
      role = 'client';
    } else if(_type === 'active') {
      role = 'server';
    } else {
      role = 'auto';
    }
  }
  
  // Note: a=setup line is ignored since we use the 'auto' role.
  // Note2: 'algorithm' is not case sensitive except in Edge.
  return {
    role: role,
    fingerprints: lines.map(SDPUtils.parseFingerprint)
  };
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
    sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
    usernameFragment: lines.filter(function(line) {
      return line.indexOf('a=ice-ufrag:') === 0;
    })[0].substr(12),
    password: lines.filter(function(line) {
      return line.indexOf('a=ice-pwd:') === 0;
    })[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
      'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
    codecs: [],
    headerExtensions: [],
    fecMechanisms: [],
    rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
    var pt = mline[i];
    var rtpmapline = SDPUtils.matchPrefix(
        mediaSection, 'a=rtpmap:' + pt + ' ')[0];
    if (rtpmapline) {
      var codec = SDPUtils.parseRtpMap(rtpmapline);
      var fmtps = SDPUtils.matchPrefix(
          mediaSection, 'a=fmtp:' + pt + ' ');
      // Only the first a=fmtp:<pt> is considered.
      codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
      codec.rtcpFeedback = SDPUtils.matchPrefix(
          mediaSection, 'a=rtcp-fb:' + pt + ' ')
        .map(SDPUtils.parseRtcpFb);
      description.codecs.push(codec);
      // parse FEC mechanisms from rtpmap lines.
      switch (codec.name.toUpperCase()) {
        case 'RED':
        case 'ULPFEC':
          description.fecMechanisms.push(codec.name.toUpperCase());
          break;
        default: // only RED and ULPFEC are recognized as FEC mechanisms.
          break;
      }
    }
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
    description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
    if (codec.preferredPayloadType !== undefined) {
      return codec.preferredPayloadType;
    }
    return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
    sdp += SDPUtils.writeRtpMap(codec);
    sdp += SDPUtils.writeFmtp(codec);
    sdp += SDPUtils.writeRtcpFb(codec);
  });
  var maxptime = 0;
  caps.codecs.forEach(function(codec) {
    if (codec.maxptime > maxptime) {
      maxptime = codec.maxptime;
    }
  });
  if (maxptime > 0) {
    sdp += 'a=maxptime:' + maxptime + '\r\n';
  }
  sdp += 'a=rtcp-mux\r\n';

  caps.headerExtensions.forEach(function(extension) {
    sdp += SDPUtils.writeExtmap(extension);
  });
  // FIXME: write fecMechanisms.
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
    var parts = line.split(' ');
    parts.shift();
    return parts.map(function(part) {
      return parseInt(part, 10);
    });
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
    secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
    if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
      var encParam = {
        ssrc: primarySsrc,
        codecPayloadType: parseInt(codec.parameters.apt, 10),
        rtx: {
          ssrc: secondarySsrc
        }
      };
      encodingParameters.push(encParam);
      if (hasRed) {
        encParam = JSON.parse(JSON.stringify(encParam));
        encParam.fec = {
          ssrc: secondarySsrc,
          mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
        };
        encodingParameters.push(encParam);
      }
    }
  });
  if (encodingParameters.length === 0 && primarySsrc) {
    encodingParameters.push({
      ssrc: primarySsrc
    });
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
    if (bandwidth[0].indexOf('b=TIAS:') === 0) {
      bandwidth = parseInt(bandwidth[0].substr(7), 10);
    } else if (bandwidth[0].indexOf('b=AS:') === 0) {
      // use formula from JSEP to convert b=AS to TIAS value.
      bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1000 * 0.95
          - (50 * 40 * 8);
    } else {
      bandwidth = undefined;
    }
    encodingParameters.forEach(function(params) {
      params.maxBitrate = bandwidth;
    });
  }
  return encodingParameters;
};

// parses http://draft.ortc.org/#rtcrtcpparameters*
SDPUtils.parseRtcpParameters = function(mediaSection) {
  var rtcpParameters = {};

  var cname;
  // Gets the first SSRC. Note that with RTX there might be multiple
  // SSRCs.
  var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
      .map(function(line) {
        return SDPUtils.parseSsrcMedia(line);
      })
      .filter(function(obj) {
        return obj.attribute === 'cname';
      })[0];
  if (remoteSsrc) {
    rtcpParameters.cname = remoteSsrc.value;
    rtcpParameters.ssrc = remoteSsrc.ssrc;
  }

  // Edge uses the compound attribute instead of reducedSize
  // compound is !reducedSize
  var rsize = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-rsize');
  rtcpParameters.reducedSize = rsize.length > 0;
  rtcpParameters.compound = rsize.length === 0;

  // parses the rtcp-mux attrіbute.
  // Note that Edge does not support unmuxed RTCP.
  var mux = SDPUtils.matchPrefix(mediaSection, 'a=rtcp-mux');
  rtcpParameters.mux = mux.length > 0;

  return rtcpParameters;
};

// parses either a=msid: or a=ssrc:... msid lines and returns
// the id of the MediaStream and MediaStreamTrack.
SDPUtils.parseMsid = function(mediaSection) {
  var parts;
  var spec = SDPUtils.matchPrefix(mediaSection, 'a=msid:');
  if (spec.length === 1) {
    parts = spec[0].substr(7).split(' ');
    return {stream: parts[0], track: parts[1]};
  }
  var planB = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
    return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
    return parts.attribute === 'msid';
  });
  if (planB.length > 0) {
    parts = planB[0].value.split(' ');
    return {stream: parts[0], track: parts[1]};
  }
};

// Generate a session ID for SDP.
// https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-20#section-5.2.1
// recommends using a cryptographically random +ve 64-bit value
// but right now this should be acceptable and within the right range
SDPUtils.generateSessionId = function() {
  return Math.random().toString().substr(2, 21);
};

// Write boilder plate for start of SDP
// sessId argument is optional - if not supplied it will
// be generated randomly
// sessVersion is optional and defaults to 2
SDPUtils.writeSessionBoilerplate = function(sessId, sessVer) {
  var sessionId;
  var version = sessVer !== undefined ? sessVer : 2;
  if (sessId) {
    sessionId = sessId;
  } else {
    sessionId = SDPUtils.generateSessionId();
  }
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
      'o=thisisadapterortc ' + sessionId + ' ' + version + ' IN IP4 127.0.0.1\r\n' +
      's=-\r\n' +
      't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
      transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
      transceiver.dtlsTransport.getLocalParameters(),
      type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.direction) {
    sdp += 'a=' + transceiver.direction + '\r\n';
  } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
    sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
    sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
    sdp += 'a=recvonly\r\n';
  } else {
    sdp += 'a=inactive\r\n';
  }

  if (transceiver.rtpSender && transceiver.direction.indexOf('send') > -1 ) {

    // spec.
    var msid = 'msid:' + stream.id + ' ' +
               transceiver.rtpSender.track.id + '\r\n';
    sdp += 'a=' + msid;

    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc-group:FID ' +
             transceiver.sendEncodingParameters[0].ssrc + ' ' +
             transceiver.sendEncodingParameters[0].rtx.ssrc +
             '\r\n';
    }

    // Original stream information
    // FIXME: this should be written by writeRtpDescription.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
          ' cname:' + SDPUtils.localCName + '\r\n';

    // for Chrome.
    sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
          ' ' + msid;

   // RTX stream information
    if (transceiver.sendEncodingParameters[0].rtx) {
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
             ' cname:' + SDPUtils.localCName + '\r\n'; 
      sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].rtx.ssrc +
             ' ' + msid;
    }
  }

  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
    switch (lines[i]) {
      case 'a=sendrecv':
      case 'a=sendonly':
      case 'a=recvonly':
      case 'a=inactive':
        return lines[i].substr(2);
      default:
        // FIXME: What should happen here?
    }
  }
  if (sessionpart) {
    return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

SDPUtils.getKind = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  return mline[0].substr(2);
};

SDPUtils.isRejected = function(mediaSection) {
  return mediaSection.split(' ', 2)[1] === '0';
};

SDPUtils.parseMLine = function(mediaSection) {
  var lines = SDPUtils.splitLines(mediaSection);
  var parts = lines[0].substr(2).split(' ');
  return {
    kind: parts[0],
    port: parseInt(parts[1], 10),
    protocol: parts[2],
    fmt: parts.slice(3).join(' ')
  };
};

SDPUtils.parseOLine = function(mediaSection) {
  var line = SDPUtils.matchPrefix(mediaSection, 'o=')[0];
  var parts = line.substr(2).split(' ');
  return {
    username: parts[0],
    sessionId: parts[1],
    sessionVersion: parseInt(parts[2], 10),
    netType: parts[3],
    addressType: parts[4],
    address: parts[5],
  };
}

// Expose public methods.
if (typeof module === 'object') {
  module.exports = SDPUtils;
}

},{}],11:[function(require,module,exports){
(function (global){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var adapterFactory = require('./adapter_factory.js');
module.exports = adapterFactory({window: global.window});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adapter_factory.js":12}],12:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

var utils = require('./utils');
var statsCollector = require('./stats_collector');
// Shimming starts here.
module.exports = function(dependencies, opts) {
  var window = dependencies && dependencies.window;

  var options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true,
    shimPlugin: true,
  };

  for (var key in opts) {
    if (hasOwnProperty.call(opts, key)) {
      options[key] = opts[key];
    }
  }

  // Utils.
  var logging = utils.log;
  var browserDetails = utils.detectBrowser(window);

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;
  var pluginShim = require('./plugin/plugin_shim') || null; 
  var commonShim = require('./common_shim') || null;

  // Export to the adapter global object visible in the browser.
  window.adapter = {
    browserDetails: browserDetails,
    commonShim: commonShim,
    extractVersion: utils.extractVersion,
    disableLog: utils.disableLog,
    disableWarnings: utils.disableWarnings
  };

  // Shim browser if found.
  switch (browserDetails.browser) {
    case 'chrome':
    case 'opera':
    case 'vivaldi':
      if (!chromeShim || !chromeShim.shimPeerConnection ||
          !options.shimChrome) {
        logging('Chrome shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming ' + browserDetails.browser );
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = chromeShim;
      commonShim.shimCreateObjectURL(window);

      chromeShim.shimGetUserMedia(window);
      chromeShim.shimMediaStream(window);
      chromeShim.shimSourceObject(window);
      chromeShim.shimPeerConnection(window);
      chromeShim.shimOnTrack(window);
      chromeShim.shimAddTrackRemoveTrack(window);
      chromeShim.shimGetSendersWithDtmf(window);
      chromeShim.shimAttachMediaStream(window);


      commonShim.shimRTCIceCandidate(window);

      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);

      adapter.browserDetails.isSupportWebRTC = true;
      adapter.browserDetails.isSupportORTC = false;
      adapter.browserDetails.isWebRTCPluginInstalled = false;
      adapter.browserDetails.WebRTCPluginVersion = undefined;
      break;
    case 'firefox':
      if (!firefoxShim || !firefoxShim.shimPeerConnection ||
          !options.shimFirefox) {
        logging('Firefox shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming firefox.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = firefoxShim;
      commonShim.shimCreateObjectURL(window);

      firefoxShim.shimGetUserMedia(window);
      firefoxShim.shimSourceObject(window);
      firefoxShim.shimPeerConnection(window);
      firefoxShim.shimOnTrack(window);
      firefoxShim.shimRemoveStream(window);
      firefoxShim.shimAttachMediaStream(window);

      commonShim.shimRTCIceCandidate(window);

      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);

      adapter.browserDetails.isSupportWebRTC = true;
      adapter.browserDetails.isSupportORTC = false;
      adapter.browserDetails.isWebRTCPluginInstalled = false;
      adapter.browserDetails.WebRTCPluginVersion = undefined;
      break;
    case 'edge':
      if (!edgeShim || !edgeShim.shimPeerConnection || !options.shimEdge) {
        logging('MS edge shim is not included in this adapter release.');
        return adapter;
      }
      logging('adapter.js shimming edge.');
      // Export to the adapter global object visible in the browser.
      adapter.browserShim = edgeShim;
      commonShim.shimCreateObjectURL(window);

      edgeShim.shimGetUserMedia(window);
      edgeShim.shimPeerConnection(window);
      edgeShim.shimReplaceTrack(window);
      edgeShim.shimAttachMediaStream(window);

      if (adapter.browserDetails.version >= 15009) {
        //New Edge support WebRTC
        adapter.browserDetails.isSupportWebRTC = true;
      } else {
        adapter.browserDetails.isSupportWebRTC = false;
      }
      adapter.browserDetails.isSupportORTC = true;
      adapter.browserDetails.isWebRTCPluginInstalled = false;
      adapter.browserDetails.WebRTCPluginVersion = undefined;

      // the edge shim implements the full RTCIceCandidate object.

      commonShim.shimMaxMessageSize(window);
      commonShim.shimSendThrowTypeError(window);
      break;
    case 'safari':

       if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
              if (!safariShim || !options.shimSafari) {
                  logging('Safari shim is not included in this adapter release.');
                  return adapter;
              }

              adapter.browserDetails.isSupportWebRTC = true;
              adapter.browserDetails.isSupportORTC = false;
              adapter.browserDetails.isWebRTCPluginInstalled = false;
              adapter.browserDetails.WebRTCPluginVersion = undefined;

              logging('adapter.js shimming safari which is support WebRTC.');
              // Export to the adapter global object visible in the browser.
              adapter.browserShim = safariShim;
              commonShim.shimCreateObjectURL(window);

              safariShim.shimRTCIceServerUrls(window);
              safariShim.shimCallbacksAPI(window);
              safariShim.shimLocalStreamsAPI(window);
              safariShim.shimRemoteStreamsAPI(window);
              safariShim.shimTrackEventTransceiver(window);
              safariShim.shimGetUserMedia(window);
              safariShim.shimCreateOfferLegacy(window);
              safariShim.shimAttachMediaStream(window);

              commonShim.shimRTCIceCandidate(window);
              commonShim.shimMaxMessageSize(window);
              commonShim.shimSendThrowTypeError(window);
        } else {
          if (!pluginShim || !options.shimPlugin) {
              logging('Safari Plugin shim is not included in this adapter release.');
              return adapter;
          }

          // init  You need to call loadPlugin() first of all....
          adapter.browserDetails.isSupportWebRTC = false;
          adapter.browserDetails.isSupportORTC = false;
          adapter.browserDetails.isWebRTCPluginInstalled = undefined; //Means the plugin installation is not start yet.
          adapter.browserDetails.WebRTCPluginVersion = undefined;
          // Export to the adapter global object visible in the browser.
          adapter.browserShim = pluginShim;
          commonShim.shimCreateObjectURL(window); 

          //pluginShim.loadPlugin();
          //set function handlers
          pluginShim.shimGetUserMedia(window);
          pluginShim.shimPeerConnection(window);
          pluginShim.shimRTCIceCandidate(window);
          pluginShim.shimRTCSessionDescription(window);
          pluginShim.shimOnTrack(window);

          pluginShim.shimAttachMediaStream(window);
          window.loadWindows = pluginShim.loadWindows;
          window.loadScreens = pluginShim.loadScreens; 

          logging('adapter.js shimming safari with plugin'); 
      }
      break;
    case 'ie':
          if (!pluginShim || !options.shimPlugin) {
              logging('IE Plugin shim is not included in this adapter release.');
              return adapter;
          }

          logging('adapter.js shimming IE!');

          // init  You need to call loadPlugin() first of all....
          adapter.browserDetails.isSupportWebRTC = false;
          adapter.browserDetails.isSupportORTC = false;
          adapter.browserDetails.isWebRTCPluginInstalled = undefined; //Means the plugin installation is not start yet.
          adapter.browserDetails.WebRTCPluginVersion = undefined;
          // Export to the adapter global object visible in the browser.
          adapter.browserShim = pluginShim;
          //pluginShim.loadPlugin();

          //set function handlers
          pluginShim.shimGetUserMedia(window);
          pluginShim.shimPeerConnection(window);
          pluginShim.shimRTCIceCandidate(window);
          pluginShim.shimRTCSessionDescription(window);
          pluginShim.shimOnTrack(window);

          pluginShim.shimAttachMediaStream(window);
          window.loadWindows = pluginShim.loadWindows;
          //window.loadScreens = pluginShim.loadScreens; //Haven't support

          break; 
    default:
      logging('Unsupported browser!');
      break;
  }

  //Lock all details

  if ( adapter.browserDetails.isSupportWebRTC === true 
       || adapter.browserDetails.isSupportORTC === true ) {
      
      statsCollector.shimStatPC(window);
      statsCollector.shimStatGUM(window);
      statsCollector.shimStatInterface(window, adapter);

      if ( adapter.browserDetails.browser != 'ie' ) {
          Object.freeze(adapter.browserDetails.browser)
          Object.freeze(adapter.browserDetails.version)
          Object.freeze(adapter.browserDetails.UIVersion)
      }

      Object.freeze(adapter.browserDetails)
      //For plugin, we need to lock it after plugin installed
  }

  return adapter;
};

},{"./chrome/chrome_shim":13,"./common_shim":15,"./edge/edge_shim":16,"./firefox/firefox_shim":19,"./plugin/plugin_shim":22,"./safari/safari_shim":23,"./stats_collector":24,"./utils":26}],13:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimMediaStream: function(window) {
    window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
          }
          this.addEventListener('track', this._ontrack = f);
        }
      });
      var origSetRemoteDescription =
          window.RTCPeerConnection.prototype.setRemoteDescription;
      window.RTCPeerConnection.prototype.setRemoteDescription = function() {
        var pc = this;
        if (!pc._ontrackpoly) {
          pc._ontrackpoly = function(e) {
            // onaddstream does not fire when a track is added to an existing
            // stream. But stream.onaddtrack is implemented so we use that.
            e.stream.addEventListener('addtrack', function(te) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === te.track.id;
                });
              } else {
                receiver = {track: te.track};
              }

              var event = new Event('track');
              event.track = te.track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            e.stream.getTracks().forEach(function(track) {
              var receiver;
              if (window.RTCPeerConnection.prototype.getReceivers) {
                receiver = pc.getReceivers().find(function(r) {
                  return r.track && r.track.id === track.id;
                });
              } else {
                receiver = {track: track};
              }
              var event = new Event('track');
              event.track = track;
              event.receiver = receiver;
              event.transceiver = {receiver: receiver};
              event.streams = [e.stream];
              pc.dispatchEvent(event);
            });
            };
          pc.addEventListener('addstream', pc._ontrackpoly);
          }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    } else if (!('RTCRtpTransceiver' in window)) {
      utils.wrapPeerConnectionEvent(window, 'track', function(e) {
        if (!e.transceiver) {
          e.transceiver = {receiver: e.receiver};
        }
        return e;
      });
    }
  },

  shimGetSendersWithDtmf: function(window) {
    // Overrides addTrack/removeTrack, depends on shimAddTrackRemoveTrack.
    if (typeof window === 'object' && window.RTCPeerConnection &&
        !('getSenders' in window.RTCPeerConnection.prototype) &&
        'createDTMFSender' in window.RTCPeerConnection.prototype) {
      var shimSenderWithDtmf = function(pc, track) {
        return {
          track: track,
          get dtmf() {
            if (this._dtmf === undefined) {
              if (track.kind === 'audio') {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };

      // augment addTrack when getSenders is not available.
      if (!window.RTCPeerConnection.prototype.getSenders) {
        window.RTCPeerConnection.prototype.getSenders = function() {
          this._senders = this._senders || [];
          return this._senders.slice(); // return a copy of the internal state.
        };
      var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
        window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
          var pc = this;
      var sender = origAddTrack.apply(pc, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(pc, track);
            pc._senders.push(sender);
          }
          return sender;
        };

        var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
        window.RTCPeerConnection.prototype.removeTrack = function(sender) {
          var pc = this;
          origRemoveTrack.apply(pc, arguments);
          var idx = pc._senders.indexOf(sender);
          if (idx !== -1) {
            pc._senders.splice(idx, 1);
          }
        };
      }
      var origAddStream = window.RTCPeerConnection.prototype.addStream;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origAddStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          pc._senders.push(shimSenderWithDtmf(pc, track));
        });
      };

      var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        var pc = this;
        pc._senders = pc._senders || [];
        origRemoveStream.apply(pc, [stream]);
        stream.getTracks().forEach(function(track) {
          var sender = pc._senders.find(function(s) {
            return s.track === track;
          });
          if (sender) {
            pc._senders.splice(pc._senders.indexOf(sender), 1); // remove sender
          }
        });
      };
    } else if (typeof window === 'object' && window.RTCPeerConnection &&
               'getSenders' in window.RTCPeerConnection.prototype &&
               'createDTMFSender' in window.RTCPeerConnection.prototype &&
               window.RTCRtpSender &&
               !('dtmf' in window.RTCRtpSender.prototype)) {
      var origGetSenders = window.RTCPeerConnection.prototype.getSenders;
      window.RTCPeerConnection.prototype.getSenders = function() {
        var pc = this;
        var senders = origGetSenders.apply(pc, []);
        senders.forEach(function(sender) {
          sender._pc = pc;
        });
        return senders;
      };

      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
      }
      });
    }
  },

  shimSourceObject: function(window) {
    var URL = window && window.URL;

    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this._srcObject;
          },
          set: function(stream) {
            var self = this;
            // Use _srcObject as a private property for this shim
            this._srcObject = stream;
            if (this.src) {
              URL.revokeObjectURL(this.src);
            }

            if (!stream) {
              this.src = '';
              return undefined;
            }
            this.src = URL.createObjectURL(stream);
            // We need to recreate the blob url when a track is added or
            // removed. Doing it manually since we want to avoid a recursion.
            stream.addEventListener('addtrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
            stream.addEventListener('removetrack', function() {
              if (self.src) {
                URL.revokeObjectURL(self.src);
              }
              self.src = URL.createObjectURL(stream);
            });
          }
        });
      }
    }
  },

  shimAddTrackRemoveTrackWithNative: function(window) {
    // shim addTrack/removeTrack with native variants in order to make
    // the interactions with legacy getLocalStreams behave as in other browsers.
    // Keeps a mapping stream.id => [stream, rtpsenders...]
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map(function(streamId) {
        return pc._shimmedLocalStreams[streamId][0];
      });
    };

    var origAddTrack = window.RTCPeerConnection.prototype.addTrack;
    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      var sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      var existingSenders = pc.getSenders();
      origAddStream.apply(this, arguments);
      var newSenders = pc.getSenders().filter(function(newSender) {
        return existingSenders.indexOf(newSender) === -1;
      });
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };

    var origRemoveTrack = window.RTCPeerConnection.prototype.removeTrack;
    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach(function(streamId) {
          var idx = pc._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            pc._shimmedLocalStreams[streamId].splice(idx, 1);
            }
          if (pc._shimmedLocalStreams[streamId].length === 1) {
            delete pc._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  },

  shimAddTrackRemoveTrack: function(window) {
    var browserDetails = utils.detectBrowser(window);
    // shim addTrack and removeTrack.
    if (window.RTCPeerConnection.prototype.addTrack &&
        browserDetails.version >= 65) {
      return this.shimAddTrackRemoveTrackWithNative(window);
    }

    // also shim pc.getLocalStreams when addTrack is shimmed
    // to return the original streams.
    var origGetLocalStreams = window.RTCPeerConnection.prototype
        .getLocalStreams;
    window.RTCPeerConnection.prototype.getLocalStreams = function() {
      var pc = this;
      var nativeStreams = origGetLocalStreams.apply(this);
      pc._reverseStreams = pc._reverseStreams || {};
      return nativeStreams.map(function(stream) {
        return pc._reverseStreams[stream.id];
      });
    };

    var origAddStream = window.RTCPeerConnection.prototype.addStream;
    window.RTCPeerConnection.prototype.addStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      stream.getTracks().forEach(function(track) {
        var alreadyExists = pc.getSenders().find(function(s) {
          return s.track === track;
        });
        if (alreadyExists) {
          throw new DOMException('Track already exists.',
              'InvalidAccessError');
        }
      });
      // Add identity mapping for consistency with addTrack.
      // Unless this is being used with a stream from addTrack.
      if (!pc._reverseStreams[stream.id]) {
        var newStream = new window.MediaStream(stream.getTracks());
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(pc, [stream]);
    };

    var origRemoveStream = window.RTCPeerConnection.prototype.removeStream;
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};

      origRemoveStream.apply(pc, [(pc._streams[stream.id] || stream)]);
      delete pc._reverseStreams[(pc._streams[stream.id] ?
          pc._streams[stream.id].id : stream.id)];
      delete pc._streams[stream.id];
    };

    window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      var streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 ||
          !streams[0].getTracks().find(function(t) {
            return t === track;
          })) {
        // this is not fully correct but all we can manage without
        // [[associated MediaStreams]] internal slot.
        throw new DOMException(
          'The adapter.js addTrack polyfill only supports a single ' +
          ' stream which is associated with the specified track.',
          'NotSupportedError');
      }

      var alreadyExists = pc.getSenders().find(function(s) {
        return s.track === track;
      });
      if (alreadyExists) {
        throw new DOMException('Track already exists.',
            'InvalidAccessError');
      }

      pc._streams = pc._streams || {};
      pc._reverseStreams = pc._reverseStreams || {};
      var oldStream = pc._streams[stream.id];
      if (oldStream) {
        // this is using odd Chrome behaviour, use with caution:
        // https://bugs.chromium.org/p/webrtc/issues/detail?id=7815
        // Note: we rely on the high-level addTrack/dtmf shim to
        // create the sender with a dtmf sender.
        oldStream.addTrack(track);

        // Trigger ONN async.
        Promise.resolve().then(function() {
          pc.dispatchEvent(new Event('negotiationneeded'));
    });
      } else {
        var newStream = new window.MediaStream([track]);
        pc._streams[stream.id] = newStream;
        pc._reverseStreams[newStream.id] = stream;
        pc.addStream(newStream);
      }
      return pc.getSenders().find(function(s) {
        return s.track === track;
      });
    };

    // replace the internal stream id with the external one and
    // vice versa.
    function replaceInternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(internalStream.id, 'g'),
            externalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      var sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach(function(internalId) {
        var externalStream = pc._reverseStreams[internalId];
        var internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(new RegExp(externalStream.id, 'g'),
            internalStream.id);
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp: sdp
      });
    }
    ['createOffer', 'createAnswer'].forEach(function(method) {
      var nativeMethod = window.RTCPeerConnection.prototype[method];
      window.RTCPeerConnection.prototype[method] = function() {
        var pc = this;
        var args = arguments;
        var isLegacyCall = arguments.length &&
            typeof arguments[0] === 'function';
        if (isLegacyCall) {
          return nativeMethod.apply(pc, [
            function(description) {
              var desc = replaceInternalStreamId(pc, description);
              args[0].apply(null, [desc]);
            },
            function(err) {
              if (args[1]) {
                args[1].apply(null, err);
              }
            }, arguments[2]
          ]);
        }
        return nativeMethod.apply(pc, arguments)
        .then(function(description) {
          return replaceInternalStreamId(pc, description);
        });
      };
    });

    var origSetLocalDescription =
        window.RTCPeerConnection.prototype.setLocalDescription;
    window.RTCPeerConnection.prototype.setLocalDescription = function() {
      var pc = this;
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(pc, arguments);
      }
      arguments[0] = replaceExternalStreamId(pc, arguments[0]);
      return origSetLocalDescription.apply(pc, arguments);
    };

    // TODO: mangle getStats: https://w3c.github.io/webrtc-stats/#dom-rtcmediastreamstats-streamidentifier

    var origLocalDescription = Object.getOwnPropertyDescriptor(
        window.RTCPeerConnection.prototype, 'localDescription');
    Object.defineProperty(window.RTCPeerConnection.prototype,
        'localDescription', {
          get: function() {
            var pc = this;
            var description = origLocalDescription.get.apply(this);
            if (description.type === '') {
              return description;
            }
            return replaceInternalStreamId(pc, description);
          }
        });

    window.RTCPeerConnection.prototype.removeTrack = function(sender) {
      var pc = this;
      if (pc.signalingState === 'closed') {
        throw new DOMException(
          'The RTCPeerConnection\'s signalingState is \'closed\'.',
          'InvalidStateError');
      }
      // We can not yet check for sender instanceof RTCRtpSender
      // since we shim RTPSender. So we check if sender._pc is set.
      if (!sender._pc) {
        throw new DOMException('Argument 1 of RTCPeerConnection.removeTrack ' +
            'does not implement interface RTCRtpSender.', 'TypeError');
      }
      var isLocal = sender._pc === pc;
      if (!isLocal) {
        throw new DOMException('Sender was not created by this connection.',
            'InvalidAccessError');
      }

      // Search for the native stream the senders track belongs to.
      pc._streams = pc._streams || {};
      var stream;
      Object.keys(pc._streams).forEach(function(streamid) {
        var hasTrack = pc._streams[streamid].getTracks().find(function(track) {
          return sender.track === track;
    });
        if (hasTrack) {
          stream = pc._streams[streamid];
        }
      });

      if (stream) {
        if (stream.getTracks().length === 1) {
          // if this is the last track of the stream, remove the stream. This
          // takes care of any shimmed _senders.
          pc.removeStream(pc._reverseStreams[stream.id]);
        } else {
          // relying on the same odd chrome behaviour as above.
          stream.removeTrack(sender.track);
    }
        pc.dispatchEvent(new Event('negotiationneeded'));
      }
    };
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        // Translate iceTransportPolicy to iceTransports,
        // see https://code.google.com/p/webrtc/issues/detail?id=4869
        // this was fixed in M56 along with unprefixing RTCPeerConnection.
        logging('PeerConnection');
        if (pcConfig && pcConfig.iceTransportPolicy) {
          pcConfig.iceTransports = pcConfig.iceTransportPolicy;
        }

        return new window.webkitRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.webkitRTCPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      if (window.webkitRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.webkitRTCPeerConnection.generateCertificate;
          }
        });
      }
    } else {
      // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
      var OrigPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
          if (pcConfig && pcConfig.iceServers && pcConfig.iceServers.length > 0) {
          var newIceServers = [];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
        return new OrigPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
      // wrap static methods. Currently just generateCertificate.
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }

    var origGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(selector,
        successCallback, errorCallback) {
      var pc = this;
      var args = arguments;

      // If selector is a function then we are in the old style stats so just
      // pass back the original getStats format to avoid breaking old users.
      if (arguments.length > 0 && typeof selector === 'function') {
        return origGetStats.apply(this, arguments);
      }

      // When spec-style getStats is supported, return those when called with
      // either no arguments or the selector argument is null.
      if (/*origGetStats.length === 0 &&*/ (arguments.length === 0 ||
          typeof arguments[0] !== 'function')) {
        return origGetStats.apply(this, [ arguments[1], arguments[0], arguments[2] ]); //Modified by rzhang
      }

      var fixChromeStats_ = function(response) {
        var standardReport = {};
        var reports = response.result();
        reports.forEach(function(report) {
          var standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: 'local-candidate',
              remotecandidate: 'remote-candidate'
            }[report.type] || report.type
          };
          report.names().forEach(function(name) {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });

        return standardReport;
      };

      // shim getStats with maplike support
      var makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map(function(key) {
          return[key, stats[key]];
        }));
      };

      if (arguments.length >= 2) {
        var successCallbackWrapper_ = function(response) {
          args[1](makeMapStats(fixChromeStats_(response)));
        };

        return origGetStats.apply(this, [successCallbackWrapper_,
            arguments[0]]);
      }

      // promise-support
      return new Promise(function(resolve, reject) {
        origGetStats.apply(pc, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          }, reject]);
      }).then(successCallback, errorCallback);
    };

    // add promise support -- natively available in Chrome 51
    if (browserDetails.version < 51) {
      ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
          .forEach(function(method) {
            var nativeMethod = window.RTCPeerConnection.prototype[method];
            window.RTCPeerConnection.prototype[method] = function() {
              var args = arguments;
              var pc = this;
              var promise = new Promise(function(resolve, reject) {
                nativeMethod.apply(pc, [args[0], resolve, reject]);
              });
              if (args.length < 2) {
                return promise;
              }
              return promise.then(function() {
                args[1].apply(null, []);
              },
              function(err) {
                if (args.length >= 3) {
                  args[2].apply(null, [err]);
                }
              });
            };
          });
    }

    // promise support for createOffer and createAnswer. Available (without
    // bugs) since M52: crbug/619289
    if (browserDetails.version < 52) {
      ['createOffer', 'createAnswer'].forEach(function(method) {
        var nativeMethod = window.RTCPeerConnection.prototype[method];
        window.RTCPeerConnection.prototype[method] = function() {
          var pc = this;
          if (arguments.length < 1 || (arguments.length === 1 &&
              typeof arguments[0] === 'object')) {
            var opts = arguments.length === 1 ? arguments[0] : undefined;
            return new Promise(function(resolve, reject) {
              nativeMethod.apply(pc, [resolve, reject, opts]);
            });
          }
          return nativeMethod.apply(this, arguments);
        };
      });
    }

    // shim implicit creation of RTCSessionDescription/RTCIceCandidate
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  },

  // Attach a media stream to an element.
  shimAttachMediaStream: function(window) {
      var browserDetails = utils.detectBrowser(window);

      var attachMediaStream = function(element, stream) {
          element.srcObject = stream;
    }

      window.attachMediaStream = attachMediaStream;
  }
};

},{"../utils.js":26,"./getusermedia":14}],14:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;

  var constraintsToChrome_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
      var remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
      remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
      var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
      var getSupportedFacingModeLies = browserDetails.version < 66;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
            !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
          matches = ['back', 'rear'];
        } else if (face.exact === 'user' || face.ideal === 'user') {
          matches = ['front'];
        }
        if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
              return matches.some(function(match) {
              return d.label.toLowerCase().indexOf(match) !== -1;
              });
            });
            if (!dev && devices.length && matches.indexOf('back') !== -1) {
              dev = devices[devices.length - 1]; // more likely the back cam
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging('chrome: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging('chrome: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {
    return {
      name: {
        PermissionDeniedError: 'NotAllowedError',
        InvalidStateError: 'NotReadableError',
        DevicesNotFoundError: 'NotFoundError',
        ConstraintNotSatisfiedError: 'OverconstrainedError',
        TrackStartError: 'NotReadableError',
        MediaDeviceFailedDueToShutdown: 'NotReadableError',
        MediaDeviceKillSwitchOn: 'NotReadableError'
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraintName,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, function(c) {
      navigator.webkitGetUserMedia(c, onSuccess, function(e) {
        if (onError) {
        onError(shimError_(e));
        }
      });
    });
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {
      getUserMedia: getUserMediaPromise_,
      enumerateDevices: function() {
        return new Promise(function(resolve) {
          var kinds = {audio: 'audioinput', video: 'videoinput'};
          return window.MediaStreamTrack.getSources(function(devices) {
            resolve(devices.map(function(device) {
              return {label: device.label,
                      kind: kinds[device.kind],
                      deviceId: device.id,
                      groupId: ''};
            }));
          });
        });
      },
      getSupportedConstraints: function() {
        return {
          deviceId: true, echoCancellation: true, facingMode: true,
          frameRate: true, height: true, width: true
        };
      }
    };
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      return getUserMediaPromise_(constraints);
    };
  } else {
    // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
    // function which returns a Promise, it does not accept spec-style
    // constraints.
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, function(c) {
        return origGetUserMedia(c).then(function(stream) {
          if (c.audio && !stream.getAudioTracks().length ||
              c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach(function(track) {
              track.stop();
            });
            throw new DOMException('', 'NotFoundError');
          }
          return stream;
        }, function(e) {
          return Promise.reject(shimError_(e));
        });
      });
    };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":26}],15:[function(require,module,exports){
/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var utils = require('./utils');

module.exports = {
  shimRTCIceCandidate: function(window) {
    // foundation is arbitrarily chosen as an indicator for full support for
    // https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
    if (!window.RTCIceCandidate || (window.RTCIceCandidate && 'foundation' in
        window.RTCIceCandidate.prototype)) {
      return;
    }

    var NativeRTCIceCandidate = window.RTCIceCandidate;
    window.RTCIceCandidate = function(args) {
      // Remove the a= which shouldn't be part of the candidate string.
      if (typeof args === 'object' && args.candidate &&
          args.candidate.indexOf('a=') === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }

      if (args.candidate && args.candidate.length) {
        // Augment the native candidate with the parsed fields.
      var nativeCandidate = new NativeRTCIceCandidate(args);
      var parsedCandidate = SDPUtils.parseCandidate(args.candidate);
      var augmentedCandidate = Object.assign(nativeCandidate,
          parsedCandidate);

      // Add a serializer that does not serialize the extra attributes.
      augmentedCandidate.toJSON = function() {
        return {
          candidate: augmentedCandidate.candidate,
          sdpMid: augmentedCandidate.sdpMid,
          sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
          usernameFragment: augmentedCandidate.usernameFragment,
        };
      };
      return augmentedCandidate;
      }
      return new NativeRTCIceCandidate(args);
    };
    window.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;

    // Hook up the augmented candidate in onicecandidate and
    // addEventListener('icecandidate', ...)
    utils.wrapPeerConnectionEvent(window, 'icecandidate', function(e) {
      if (e.candidate) {
        Object.defineProperty(e, 'candidate', {
          value: new window.RTCIceCandidate(e.candidate),
          writable: 'false'
        });
      }
      return e;
    });
  },

  // shimCreateObjectURL must be called before shimSourceObject to avoid loop.

  shimCreateObjectURL: function(window) {
    var URL = window && window.URL;

    if (!(typeof window === 'object' && window.HTMLMediaElement &&
          'srcObject' in window.HTMLMediaElement.prototype &&
        URL.createObjectURL && URL.revokeObjectURL)) {
      // Only shim CreateObjectURL using srcObject if srcObject exists.
      return undefined;
    }

    var nativeCreateObjectURL = URL.createObjectURL.bind(URL);
    var nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    var streams = new Map(), newId = 0;

    URL.createObjectURL = function(stream) {
      if ('getTracks' in stream) {
        var url = 'polyblob:' + (++newId);
        streams.set(url, stream);
        utils.deprecated('URL.createObjectURL(stream)',
            'elem.srcObject = stream');
        return url;
      }
      return nativeCreateObjectURL(stream);
    };
    URL.revokeObjectURL = function(url) {
      nativeRevokeObjectURL(url);
      streams.delete(url);
    };

    var dsc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype,
                                              'src');
    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
      get: function() {
        return dsc.get.apply(this);
      },
      set: function(url) {
        this.srcObject = streams.get(url) || null;
        return dsc.set.apply(this, [url]);
      }
    });

    var nativeSetAttribute = window.HTMLMediaElement.prototype.setAttribute;
    window.HTMLMediaElement.prototype.setAttribute = function() {
      if (arguments.length === 2 &&
          ('' + arguments[0]).toLowerCase() === 'src') {
        this.srcObject = streams.get(arguments[1]) || null;
      }
      return nativeSetAttribute.apply(this, arguments);
    };
  },

  shimMaxMessageSize: function(window) {
    if (window.RTCSctpTransport || !window.RTCPeerConnection) {
      return;
    }
    var browserDetails = utils.detectBrowser(window);

    if (!('sctp' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'sctp', {
        get: function() {
          return typeof this._sctp === 'undefined' ? null : this._sctp;
        }
      });
    }

    var sctpInDescription = function(description) {
      var sections = SDPUtils.splitSections(description.sdp);
      sections.shift();
      return sections.some(function(mediaSection) {
        var mLine = SDPUtils.parseMLine(mediaSection);
        return mLine && mLine.kind === 'application'
            && mLine.protocol.indexOf('SCTP') !== -1;
      });
    };

    var getRemoteFirefoxVersion = function(description) {
      // TODO: Is there a better solution for detecting Firefox?
      var match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (match === null || match.length < 2) {
        return -1;
      }
      var version = parseInt(match[1], 10);
      // Test for NaN (yes, this is ugly)
      return version !== version ? -1 : version;
    };

    var getCanSendMaxMessageSize = function(remoteIsFirefox) {
      // Every implementation we know can send at least 64 KiB.
      // Note: Although Chrome is technically able to send up to 256 KiB, the
      //       data does not reach the other peer reliably.
      //       See: https://bugs.chromium.org/p/webrtc/issues/detail?id=8419
      var canSendMaxMessageSize = 65536;
      if (browserDetails.browser === 'firefox') {
        if (browserDetails.version < 57) {
          if (remoteIsFirefox === -1) {
            // FF < 57 will send in 16 KiB chunks using the deprecated PPID
            // fragmentation.
            canSendMaxMessageSize = 16384;
          } else {
            // However, other FF (and RAWRTC) can reassemble PPID-fragmented
            // messages. Thus, supporting ~2 GiB when sending.
            canSendMaxMessageSize = 2147483637;
          }
        } else {
          // Currently, all FF >= 57 will reset the remote maximum message size
          // to the default value when a data channel is created at a later
          // stage. :(
          // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831
          canSendMaxMessageSize =
            browserDetails.version === 57 ? 65535 : 65536;
        }
      }
      return canSendMaxMessageSize;
    };

    var getMaxMessageSize = function(description, remoteIsFirefox) {
      // Note: 65536 bytes is the default value from the SDP spec. Also,
      //       every implementation we know supports receiving 65536 bytes.
      var maxMessageSize = 65536;

      // FF 57 has a slightly incorrect default remote max message size, so
      // we need to adjust it here to avoid a failure when sending.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1425697
      if (browserDetails.browser === 'firefox'
           && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }

      var match = SDPUtils.matchPrefix(description.sdp, 'a=max-message-size:');
      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === 'firefox' &&
                  remoteIsFirefox !== -1) {
        // If the maximum message size is not present in the remote SDP and
        // both local and remote are Firefox, the remote peer can receive
        // ~2 GiB.
        maxMessageSize = 2147483637;
      }
      return maxMessageSize;
    };

    var origSetRemoteDescription =
        window.RTCPeerConnection.prototype.setRemoteDescription;
    window.RTCPeerConnection.prototype.setRemoteDescription = function() {
      var pc = this;
      pc._sctp = null;

      if (sctpInDescription(arguments[0])) {
        // Check if the remote is FF.
        var isFirefox = getRemoteFirefoxVersion(arguments[0]);

        // Get the maximum message size the local peer is capable of sending
        var canSendMMS = getCanSendMaxMessageSize(isFirefox);

        // Get the maximum message size of the remote peer.
        var remoteMMS = getMaxMessageSize(arguments[0], isFirefox);

        // Determine final maximum message size
        var maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }

        // Create a dummy RTCSctpTransport object and the 'maxMessageSize'
        // attribute.
        var sctp = {};
        Object.defineProperty(sctp, 'maxMessageSize', {
          get: function() {
            return maxMessageSize;
          }
        });
        pc._sctp = sctp;
      }

      return origSetRemoteDescription.apply(pc, arguments);
    };
  },

  shimSendThrowTypeError: function(window) {
    if (!window.RTCPeerConnection) {
      return;
    }

    // Note: Although Firefox >= 57 has a native implementation, the maximum
    //       message size can be reset for all data channels at a later stage.
    //       See: https://bugzilla.mozilla.org/show_bug.cgi?id=1426831

    var origCreateDataChannel =
      window.RTCPeerConnection.prototype.createDataChannel;
    window.RTCPeerConnection.prototype.createDataChannel = function() {
      var pc = this;
      var dataChannel = origCreateDataChannel.apply(pc, arguments);
      var origDataChannelSend = dataChannel.send;

      // Patch 'send' method
      dataChannel.send = function() {
        var dc = this;
        var data = arguments[0];
        var length = data.length || data.size || data.byteLength;
        if (length > pc.sctp.maxMessageSize) {
          throw new DOMException('Message too large (can send a maximum of ' +
            pc.sctp.maxMessageSize + ' bytes)', 'TypeError');
        }
        return origDataChannelSend.apply(dc, arguments);
      };

      return dataChannel;
    };
  }
};

},{"./utils":26,"sdp":10}],16:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var shimRTCPeerConnection = require('rtcpeerconnection-shim');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (window.RTCIceGatherer) {
      // ORTC defines an RTCIceCandidate object but no constructor.
      // Not implemented in Edge.
      if (!window.RTCIceCandidate) {
        window.RTCIceCandidate = function(args) {
          return args;
        };
      }
      // ORTC does not have a session description object but
      // other browsers (i.e. Chrome) that will support both PC and ORTC
      // in the future might have this defined already.
      if (!window.RTCSessionDescription) {
        window.RTCSessionDescription = function(args) {
          return args;
        };
      }
      // this adds an additional event listener to MediaStrackTrack that signals
      // when a tracks enabled property was changed. Workaround for a bug in
      // addStream, see below. No longer required in 15025+
      if (browserDetails.version < 15025) {
        var origMSTEnabled = Object.getOwnPropertyDescriptor(
            window.MediaStreamTrack.prototype, 'enabled');
        Object.defineProperty(window.MediaStreamTrack.prototype, 'enabled', {
          set: function(value) {
            origMSTEnabled.set.call(this, value);
            var ev = new Event('enabled');
            ev.enabled = value;
            this.dispatchEvent(ev);
      }
        });
      }
    }

    // ORTC defines the DTMF sender a bit different.
    // https://github.com/w3c/ortc/issues/714
    if (window.RTCRtpSender && !('dtmf' in window.RTCRtpSender.prototype)) {
      Object.defineProperty(window.RTCRtpSender.prototype, 'dtmf', {
        get: function() {
          if (this._dtmf === undefined) {
            if (this.track.kind === 'audio') {
              this._dtmf = new window.RTCDtmfSender(this);
            } else if (this.track.kind === 'video') {
              this._dtmf = null;
            }
          }
          return this._dtmf;
      }
      });
    }
    window.RTCPeerConnection = shimRTCPeerConnection(window, browserDetails.version);
  },

  shimReplaceTrack: function(window) {
    // ORTC has replaceTrack -- https://github.com/w3c/ortc/issues/614
    if (window.RTCRtpSender && !('replaceTrack' in window.RTCRtpSender.prototype)) {
      window.RTCRtpSender.prototype.replaceTrack =
          window.RTCRtpSender.prototype.setTrack;
    }
  },
  // Attach a media stream to an element.
  shimAttachMediaStream: function(window) {
      var browserDetails = utils.detectBrowser(window);

      var attachMediaStream = function(element, stream) {
    element.src = URL.createObjectURL(stream);
      }

      window.attachMediaStream = attachMediaStream;
  }
};

},{"../utils":26,"./getusermedia":17,"rtcpeerconnection-shim":6}],17:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function(window) {
  var navigator = window && window.navigator;

  var shimError_ = function(e) {
    return {
      name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
      message: e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name;
      }
    };
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
      bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
    return origGetUserMedia(c).catch(function(e) {
      return Promise.reject(shimError_(e));
    });
  };
};

},{}],18:[function(require,module,exports){
(function (process,global){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.ES6Promise=e()}(this,function(){"use strict";function t(t){return"function"==typeof t||"object"==typeof t&&null!==t}function e(t){return"function"==typeof t}function n(t){I=t}function r(t){J=t}function o(){return function(){return process.nextTick(a)}}function i(){return function(){H(a)}}function s(){var t=0,e=new V(a),n=document.createTextNode("");return e.observe(n,{characterData:!0}),function(){n.data=t=++t%2}}function u(){var t=new MessageChannel;return t.port1.onmessage=a,function(){return t.port2.postMessage(0)}}function c(){var t=setTimeout;return function(){return t(a,1)}}function a(){for(var t=0;t<G;t+=2){var e=$[t],n=$[t+1];e(n),$[t]=void 0,$[t+1]=void 0}G=0}function f(){try{var t=require,e=t("vertx");return H=e.runOnLoop||e.runOnContext,i()}catch(n){return c()}}function l(t,e){var n=arguments,r=this,o=new this.constructor(p);void 0===o[et]&&k(o);var i=r._state;return i?!function(){var t=n[i-1];J(function(){return x(i,o,t,r._result)})}():E(r,o,t,e),o}function h(t){var e=this;if(t&&"object"==typeof t&&t.constructor===e)return t;var n=new e(p);return g(n,t),n}function p(){}function v(){return new TypeError("You cannot resolve a promise with itself")}function d(){return new TypeError("A promises callback cannot return that same promise.")}function _(t){try{return t.then}catch(e){return it.error=e,it}}function y(t,e,n,r){try{t.call(e,n,r)}catch(o){return o}}function m(t,e,n){J(function(t){var r=!1,o=y(n,e,function(n){r||(r=!0,e!==n?g(t,n):S(t,n))},function(e){r||(r=!0,j(t,e))},"Settle: "+(t._label||" unknown promise"));!r&&o&&(r=!0,j(t,o))},t)}function b(t,e){e._state===rt?S(t,e._result):e._state===ot?j(t,e._result):E(e,void 0,function(e){return g(t,e)},function(e){return j(t,e)})}function w(t,n,r){n.constructor===t.constructor&&r===l&&n.constructor.resolve===h?b(t,n):r===it?j(t,it.error):void 0===r?S(t,n):e(r)?m(t,n,r):S(t,n)}function g(e,n){e===n?j(e,v()):t(n)?w(e,n,_(n)):S(e,n)}function A(t){t._onerror&&t._onerror(t._result),T(t)}function S(t,e){t._state===nt&&(t._result=e,t._state=rt,0!==t._subscribers.length&&J(T,t))}function j(t,e){t._state===nt&&(t._state=ot,t._result=e,J(A,t))}function E(t,e,n,r){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+rt]=n,o[i+ot]=r,0===i&&t._state&&J(T,t)}function T(t){var e=t._subscribers,n=t._state;if(0!==e.length){for(var r=void 0,o=void 0,i=t._result,s=0;s<e.length;s+=3)r=e[s],o=e[s+n],r?x(n,r,o,i):o(i);t._subscribers.length=0}}function M(){this.error=null}function P(t,e){try{return t(e)}catch(n){return st.error=n,st}}function x(t,n,r,o){var i=e(r),s=void 0,u=void 0,c=void 0,a=void 0;if(i){if(s=P(r,o),s===st?(a=!0,u=s.error,s=null):c=!0,n===s)return void j(n,d())}else s=o,c=!0;n._state!==nt||(i&&c?g(n,s):a?j(n,u):t===rt?S(n,s):t===ot&&j(n,s))}function C(t,e){try{e(function(e){g(t,e)},function(e){j(t,e)})}catch(n){j(t,n)}}function O(){return ut++}function k(t){t[et]=ut++,t._state=void 0,t._result=void 0,t._subscribers=[]}function Y(t,e){this._instanceConstructor=t,this.promise=new t(p),this.promise[et]||k(this.promise),B(e)?(this._input=e,this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?S(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&S(this.promise,this._result))):j(this.promise,q())}function q(){return new Error("Array Methods must be provided an Array")}function F(t){return new Y(this,t).promise}function D(t){var e=this;return new e(B(t)?function(n,r){for(var o=t.length,i=0;i<o;i++)e.resolve(t[i]).then(n,r)}:function(t,e){return e(new TypeError("You must pass an array to race."))})}function K(t){var e=this,n=new e(p);return j(n,t),n}function L(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function N(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function U(t){this[et]=O(),this._result=this._state=void 0,this._subscribers=[],p!==t&&("function"!=typeof t&&L(),this instanceof U?C(this,t):N())}function W(){var t=void 0;if("undefined"!=typeof global)t=global;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}var n=t.Promise;if(n){var r=null;try{r=Object.prototype.toString.call(n.resolve())}catch(e){}if("[object Promise]"===r&&!n.cast)return}t.Promise=U}var z=void 0;z=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)};var B=z,G=0,H=void 0,I=void 0,J=function(t,e){$[G]=t,$[G+1]=e,G+=2,2===G&&(I?I(a):tt())},Q="undefined"!=typeof window?window:void 0,R=Q||{},V=R.MutationObserver||R.WebKitMutationObserver,X="undefined"==typeof self&&"undefined"!=typeof process&&"[object process]"==={}.toString.call(process),Z="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,$=new Array(1e3),tt=void 0;tt=X?o():V?s():Z?u():void 0===Q&&"function"==typeof require?f():c();var et=Math.random().toString(36).substring(16),nt=void 0,rt=1,ot=2,it=new M,st=new M,ut=0;return Y.prototype._enumerate=function(){for(var t=this.length,e=this._input,n=0;this._state===nt&&n<t;n++)this._eachEntry(e[n],n)},Y.prototype._eachEntry=function(t,e){var n=this._instanceConstructor,r=n.resolve;if(r===h){var o=_(t);if(o===l&&t._state!==nt)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(n===U){var i=new n(p);w(i,t,o),this._willSettleAt(i,e)}else this._willSettleAt(new n(function(e){return e(t)}),e)}else this._willSettleAt(r(t),e)},Y.prototype._settledAt=function(t,e,n){var r=this.promise;r._state===nt&&(this._remaining--,t===ot?j(r,n):this._result[e]=n),0===this._remaining&&S(r,this._result)},Y.prototype._willSettleAt=function(t,e){var n=this;E(t,void 0,function(t){return n._settledAt(rt,e,t)},function(t){return n._settledAt(ot,e,t)})},U.all=F,U.race=D,U.resolve=h,U.reject=K,U._setScheduler=n,U._setAsap=r,U._asap=J,U.prototype={constructor:U,then:l,"catch":function(t){return this.then(null,t)}},W(),U.polyfill=W,U.Promise=U,U});
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}],19:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');

module.exports = {
  shimGetUserMedia: require('./getusermedia'),
  shimOnTrack: function(window) {
    if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
        window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
        get: function() {
          return this._ontrack;
        },
        set: function(f) {
          if (this._ontrack) {
            this.removeEventListener('track', this._ontrack);
            this.removeEventListener('addstream', this._ontrackpoly);
          }
          this.addEventListener('track', this._ontrack = f);
          this.addEventListener('addstream', this._ontrackpoly = function(e) {
            e.stream.getTracks().forEach(function(track) {
              var event = new Event('track');
              event.track = track;
              event.receiver = {track: track};
              event.transceiver = {receiver: event.receiver};
              event.streams = [e.stream];
              this.dispatchEvent(event);
            }.bind(this));
          }.bind(this));
        }
      });
    }
    if (typeof window === 'object' && window.RTCTrackEvent &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        !('transceiver' in window.RTCTrackEvent.prototype)) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimSourceObject: function(window) {
    // Firefox has supported mozSrcObject since FF22, unprefixed in 42.
    if (typeof window === 'object') {
      if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
          get: function() {
            return this.mozSrcObject;
          },
          set: function(stream) {
            this.mozSrcObject = stream;
          }
        });
      }
    }
  },

  shimPeerConnection: function(window) {
    var browserDetails = utils.detectBrowser(window);

    if (typeof window !== 'object' || !(window.RTCPeerConnection ||
        window.mozRTCPeerConnection)) {
      return; // probably media.peerconnection.enabled=false in about:config
    }
    // The RTCPeerConnection object.
    if (!window.RTCPeerConnection) {
      window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (browserDetails.version < 38) {
          // .urls is not supported in FF < 38.
          // create RTCIceServers with a single url.
          if (pcConfig && pcConfig.iceServers && pcConfig.iceServers.length > 0) {
            var newIceServers = [ ];
            for (var i = 0; i < pcConfig.iceServers.length; i++) {
              var server = pcConfig.iceServers[i];
              if (server.hasOwnProperty('urls')) {
                for (var j = 0; j < server.urls.length; j++) {
                  var newServer = {
                    url: server.urls[j]
                  };
                  if (server.urls[j].indexOf('turn') === 0) {
                    newServer.username = server.username;
                    newServer.credential = server.credential;
                  }
                  newIceServers.push(newServer);
                }
              } else {
                newIceServers.push(pcConfig.iceServers[i]);
              }
            }
            pcConfig.iceServers = newIceServers;
          }
        }
        return new window.mozRTCPeerConnection(pcConfig, pcConstraints);
      };
      window.RTCPeerConnection.prototype =
          window.mozRTCPeerConnection.prototype;

      // wrap static methods. Currently just generateCertificate.
      if (window.mozRTCPeerConnection.generateCertificate) {
        Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
          get: function() {
            return window.mozRTCPeerConnection.generateCertificate;
          }
        });
      }

      window.RTCSessionDescription = window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.mozRTCIceCandidate;
    }

    // shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
    ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
        .forEach(function(method) {
          var nativeMethod = window.RTCPeerConnection.prototype[method];
          window.RTCPeerConnection.prototype[method] = function() {
            arguments[0] = new ((method === 'addIceCandidate') ?
                window.RTCIceCandidate :
                window.RTCSessionDescription)(arguments[0]);
            return nativeMethod.apply(this, arguments);
          };
        });

    // support for addIceCandidate(null or undefined)
    var nativeAddIceCandidate =
        window.RTCPeerConnection.prototype.addIceCandidate;
    window.RTCPeerConnection.prototype.addIceCandidate = function() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };

    // shim getStats with maplike support
    var makeMapStats = function(stats) {
      var map = new Map();
      Object.keys(stats).forEach(function(key) {
        map.set(key, stats[key]);
        map[key] = stats[key];
      });
      return map;
    };

    var modernStatsTypes = {
      inboundrtp: 'inbound-rtp',
      outboundrtp: 'outbound-rtp',
      candidatepair: 'candidate-pair',
      localcandidate: 'local-candidate',
      remotecandidate: 'remote-candidate'
    };

    var nativeGetStats = window.RTCPeerConnection.prototype.getStats;
    window.RTCPeerConnection.prototype.getStats = function(
      selector,
      onSucc,
      onErr
    ) {
      return nativeGetStats.apply(this, [selector || null])
        .then(function(stats) {
          if (browserDetails.version < 48) {
            stats = makeMapStats(stats);
          }
          if (browserDetails.version < 53 && !onSucc) {
            // Shim only promise getStats with spec-hyphens in type names
            // Leave callback version alone; misc old uses of forEach before Map
            try {
              stats.forEach(function(stat) {
                stat.type = modernStatsTypes[stat.type] || stat.type;
              });
            } catch (e) {
              if (e.name !== 'TypeError') {
                throw e;
              }
              // Avoid TypeError: "type" is read-only, in old versions. 34-43ish
              stats.forEach(function(stat, i) {
                stats.set(i, Object.assign({}, stat, {
                  type: modernStatsTypes[stat.type] || stat.type
                }));
              });
            }
          }
          return stats;
        })
        .then(onSucc, onErr);
    };
  },

  shimRemoveStream: function(window) {
    if (!window.RTCPeerConnection ||
        'removeStream' in window.RTCPeerConnection.prototype) {
      return;
    }
    window.RTCPeerConnection.prototype.removeStream = function(stream) {
      var pc = this;
      utils.deprecated('removeStream', 'removeTrack');
      this.getSenders().forEach(function(sender) {
        if (sender.track && stream.getTracks().indexOf(sender.track) !== -1) {
          pc.removeTrack(sender);
    }
      });
          };
  },

  // Attach a media stream to an element.
  shimAttachMediaStream: function(window) {
      var browserDetails = utils.detectBrowser(window);

      var attachMediaStream = function(element, stream) {
          element.src = URL.createObjectURL(stream);
      }
      window.attachMediaStream = attachMediaStream;
  }

};

},{"../utils":26,"./getusermedia":20}],20:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var utils = require('../utils');
var logging = utils.log;

// Expose public methods.
module.exports = function(window) {
  var browserDetails = utils.detectBrowser(window);
  var navigator = window && window.navigator;
  var MediaStreamTrack = window && window.MediaStreamTrack;

  var shimError_ = function(e) {
    return {
      name: {
        InternalError: 'NotReadableError',
        NotSupportedError: 'TypeError',
        PermissionDeniedError: 'NotAllowedError',
        SecurityError: 'NotAllowedError'
      }[e.name] || e.name,
      message: {
        'The operation is insecure.': 'The request is not allowed by the ' +
        'user agent or the platform in the current context.'
      }[e.message] || e.message,
      constraint: e.constraint,
      toString: function() {
        return this.name + (this.message && ': ') + this.message;
      }
    };
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
    var constraintsToFF37_ = function(c) {
      if (typeof c !== 'object' || c.require) {
        return c;
      }
      var require = [];
      Object.keys(c).forEach(function(key) {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
          return;
        }
        var r = c[key] = (typeof c[key] === 'object') ?
            c[key] : {ideal: c[key]};
        if (r.min !== undefined ||
            r.max !== undefined || r.exact !== undefined) {
          require.push(key);
        }
        if (r.exact !== undefined) {
          if (typeof r.exact === 'number') {
            r. min = r.max = r.exact;
          } else {
            c[key] = r.exact;
          }
          delete r.exact;
        }
        if (r.ideal !== undefined) {
          c.advanced = c.advanced || [];
          var oc = {};
          if (typeof r.ideal === 'number') {
            oc[key] = {min: r.ideal, max: r.ideal};
          } else {
            oc[key] = r.ideal;
          }
          c.advanced.push(oc);
          delete r.ideal;
          if (!Object.keys(r).length) {
            delete c[key];
          }
        }
      });
      if (require.length) {
        c.require = require;
      }
      return c;
    };
    constraints = JSON.parse(JSON.stringify(constraints));
    if (browserDetails.version < 38) {
      logging('spec: ' + JSON.stringify(constraints));
      if (constraints.audio) {
        constraints.audio = constraintsToFF37_(constraints.audio);
      }
      if (constraints.video) {
        constraints.video = constraintsToFF37_(constraints.video);
      }
      logging('ff37: ' + JSON.stringify(constraints));
    }
    return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
      onError(shimError_(e));
    });
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      getUserMedia_(constraints, resolve, reject);
    });
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
      addEventListener: function() { },
      removeEventListener: function() { }
    };
  }
  navigator.mediaDevices.enumerateDevices =
      navigator.mediaDevices.enumerateDevices || function() {
        return new Promise(function(resolve) {
          var infos = [
            {kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
            {kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
          ];
          resolve(infos);
        });
      };

  if (browserDetails.version < 41) {
    // Work around http://bugzil.la/1169665
    var orgEnumerateDevices =
        navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return orgEnumerateDevices().then(undefined, function(e) {
        if (e.name === 'NotFoundError') {
          return [];
        }
        throw e;
      });
    };
  }
  if (browserDetails.version < 49) {
    var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).then(function(stream) {
        // Work around https://bugzil.la/802326
        if (c.audio && !stream.getAudioTracks().length ||
            c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach(function(track) {
            track.stop();
          });
          throw new DOMException('The object can not be found here.',
                                 'NotFoundError');
        }
        return stream;
      }, function(e) {
        return Promise.reject(shimError_(e));
      });
    };
  }
  if (!(browserDetails.version > 55 &&
      'autoGainControl' in navigator.mediaDevices.getSupportedConstraints())) {
    var remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };

    var nativeGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function(c) {
      if (typeof c === 'object' && typeof c.audio === 'object') {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, 'autoGainControl', 'mozAutoGainControl');
        remap(c.audio, 'noiseSuppression', 'mozNoiseSuppression');
      }
      return nativeGetUserMedia(c);
    };

    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      var nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        var obj = nativeGetSettings.apply(this, arguments);
        remap(obj, 'mozAutoGainControl', 'autoGainControl');
        remap(obj, 'mozNoiseSuppression', 'noiseSuppression');
        return obj;
      };
    }

    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      var nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === 'audio' && typeof c === 'object') {
          c = JSON.parse(JSON.stringify(c));
          remap(c, 'autoGainControl', 'mozAutoGainControl');
          remap(c, 'noiseSuppression', 'mozNoiseSuppression');
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
    if (browserDetails.version < 44) {
      return getUserMedia_(constraints, onSuccess, onError);
    }
    // Replace Firefox 44+'s deprecation warning with unprefixed version.
    utils.deprecated('navigator.getUserMedia',
        'navigator.mediaDevices.getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":26}],21:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;

var getPlugin = function () {
        return document.getElementById('IPVTPluginId');
};
var extractPluginObj = function (elt) {
        return elt.isWebRtcPlugin ? elt : elt.pluginObj;
};
var getSources = function (gotSources) { // not part of the standard (at least, haven't found it)
    if (document.readyState !== "complete") {
        console.log("readyState = " + document.readyState + ", delaying getSources...");
        if (!getSourcesDelayed) {
            getSourcesDelayed = true;
            document.addEventListener( "readystatechange", function () {
                if (getSourcesDelayed && document.readyState == "complete") {
                    getSourcesDelayed = false;
                    getPlugin().getSources(gotSources);
                }
            });
        }
    }
    else {
        getPlugin().getSources(gotSources);
    }
};

// Expose public methods.
module.exports = function(window) {
    var browserDetails = utils.detectBrowser(window);
    var navigator = window && window.navigator;

    var constraintsToPlugin_ = function(c) {
    if (typeof c !== 'object' || c.mandatory || c.optional) {
      return c;
    }
    var cc = {};
    Object.keys(c).forEach(function(key) {
      if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
        return;
      }
      var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
      if (r.exact !== undefined && typeof r.exact === 'number') {
        r.min = r.max = r.exact;
      }
      var oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return (name === 'deviceId') ? 'sourceId' : name;
      };
      if (r.ideal !== undefined) {
        cc.optional = cc.optional || [ ];
        var oc = {};
        if (typeof r.ideal === 'number') {
          oc[oldname_('min', key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_('max', key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_('', key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== undefined && typeof r.exact !== 'number') {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_('', key)] = r.exact;
      } else {
        ['min', 'max'].forEach(function(mix) {
          if (r[mix] !== undefined) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || [ ]).concat(c.advanced);
    }
    return cc;
  };

  var shimConstraints_ = function(constraints, func) {
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === 'object') {
            var remap = function(obj, a, b) {
                if (a in obj && !(b in obj)) {
                    obj[b] = obj[a];
                    delete obj[a];
                }
            };
            constraints = JSON.parse(JSON.stringify(constraints));
            remap(constraints.audio, 'autoGainControl', 'googAutoGainControl');
            remap(constraints.audio, 'noiseSuppression', 'googNoiseSuppression');
            constraints.audio = constraintsToPlugin_(constraints.audio);
    }
    if (constraints && typeof constraints.video === 'object') {
      // Shim facingMode for mobile & surface pro.
            var face = constraints.video.facingMode;
      face = face && ((typeof face === 'object') ? face : {ideal: face});
            var getSupportedFacingModeLies = browserDetails.version < 61;

      if ((face && (face.exact === 'user' || face.exact === 'environment' ||
                    face.ideal === 'user' || face.ideal === 'environment')) &&
          !(navigator.mediaDevices.getSupportedConstraints &&
            navigator.mediaDevices.getSupportedConstraints().facingMode &&
                    !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
                var matches;
        if (face.exact === 'environment' || face.ideal === 'environment') {
                    matches = [ 'back', 'rear' ];
                } else if (face.exact === 'user' || face.ideal === 'user') {
                    matches = [ 'front' ];
                }
                if (matches) {
          // Look for matches in label, or use last cam for back (typical).
          return navigator.mediaDevices.enumerateDevices()
          .then(function(devices) {
            devices = devices.filter(function(d) {
              return d.kind === 'videoinput';
            });
            var dev = devices.find(function(d) {
                                    return matches.some(function(match) {
              return d.label.toLowerCase().indexOf(match) !== -1;
            });
                                });
                            if (!dev && devices.length && matches.indexOf('back') !== -1) {
                                dev = devices[devices.length - 1]; // more likely the back cam
                            }
                            if (dev) {
              constraints.video.deviceId = face.exact ? {exact: dev.deviceId} :
                                                        {ideal: dev.deviceId};
            }
            constraints.video = constraintsToPlugin_(constraints.video);
            logging('Plugin: ' + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToPlugin_(constraints.video);
    }
    logging('Plugin: ' + JSON.stringify(constraints));
    return func(constraints);
  };

  var shimError_ = function(e) {

      var errObj = {};
      if (e && typeof e === 'string' && e.match(/(access|denied)/g).length >= 2) {
          /*Permission to access camera/microphone denied*/
          errObj.name = 'NotAllowedError';
          errObj.message = e;
          errObj.constraint = null;
      } else {
          errObj.name = 'OverconstrainedError';
          errObj.message = e;
          errObj.constraint = null;
      }

      errObj.toString = function() {
          return this.name + (this.message && ': ') + this.message;
      }
      
      return errObj;
  };

  var getUserMedia_ = function (constraints, onSuccess, onError) {
        if (document.readyState !== "complete") {
            logging("readyState = " + document.readyState + ", delaying getUserMedia...");
            if ( !getUserMediaDelayed ) {
                getUserMediaDelayed = true;
                this.shimAttachEventListener(document, "readystatechange", function () {
                    if (getUserMediaDelayed && document.readyState == "complete") {
                        getUserMediaDelayed = false;
                        shimConstraints_(constraints, function(c) {
                           getPlugin().getUserMedia(c, onSuccess, function(e) {
                               onError(shimError_(e));
                           });
                        });
                    }
                });
            }
        } else {
            shimConstraints_(constraints, function(c) {
                getPlugin().getUserMedia(c, onSuccess, function(e) {
                    onError(shimError_(e));
                });
            });
       }
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
    return new Promise(function(resolve, reject) {
      navigator.getUserMedia(constraints, resolve, reject);
    });
  };

  //For export the mediaDevices
  if (!navigator.mediaDevices) {
    navigator.mediaDevices = { getUserMedia: function(constraints) {
      return getUserMediaPromise_(constraints);
    },
      enumerateDevices: function() {
          return new Promise(function(resolve) {
                  var kinds = { audio: 'audioinput', video: 'videoinput' };
                  return getSources(function(devices) {
                          resolve(devices.map(function(device) {
                                  return { label: device.label,
                                         kind: kinds[device.kind],
                                         deviceId: device.id,
                                         groupId: '' };
                              }));
                            });
                      });
              },
            getSupportedConstraints: function() {
                return { //Todo: RZHANG check if the plugin is support all?
                       deviceId: true, echoCancellation: true, facingMode: true,
                       frameRate: true, height: true, width: true
                };
      } };
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
    navigator.mediaDevices.addEventListener = function() {
      logging('Dummy mediaDevices.addEventListener called.');
    };
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
    navigator.mediaDevices.removeEventListener = function() {
      logging('Dummy mediaDevices.removeEventListener called.');
    };
  }
};

},{"../utils.js":26}],22:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
/* eslint-env node */
'use strict';
var utils = require('../utils.js');
var logging = utils.log;
var _promise = require('../es6-promise.min.js').Promise;

var getUserMediaDelayed;
var getSourcesDelayed;
var loadCount = 10;

var browserDetails = utils.detectBrowser(window);
var navigator = window && window.navigator;

var getPlugin = function() {
    return document.getElementById('IPVTPluginId');
};
var extractPluginObj = function(elt) {
    return elt.isWebRtcPlugin ? elt : elt.pluginObj;
};

var installPlugin = function(window) {

    var browserDetails = window.adapter.browserDetails

    if (document.getElementById("IPVTPluginId")) {
        if (document.getElementById("IPVTPluginId").versionName != undefined) {
            logging('Allready installed the plugin!! Plugin version is ' + document.getElementById("IPVTPluginId").versionName);
            return { installed: true, version: document.getElementById("IPVTPluginId").versionName };
        } else {

            if (browserDetails.browser === "safari" && navigator.mimeTypes["application/ipvt-plugin"] && navigator.mimeTypes["application/ipvt-plugin"].enabledPlugin) {
                logging('plugin has been installed , waiting for the user to trust the plugin.');
                return { installed: true, version: undefined };
            }

            logging('Waitting for the Plugin installation done');
            return { installed: undefined, version: undefined };
        }
    }

    logging('installPlugin() called');
    var pluginObj = document.createElement('object');
    if (browserDetails.browser === "ie") { 
        //Added promises support    
        Promise = _promise;
        pluginObj.setAttribute('classid', 'CLSID:C14F046D-EC06-4A58-8594-008226370B22');

    } else {
        pluginObj.setAttribute('type', 'application/ipvt-plugin');
    }

    pluginObj.setAttribute('id', 'IPVTPluginId');
    pluginObj.setAttribute('width', '0');
    pluginObj.setAttribute('height', '0');
    document.body.appendChild(pluginObj);

    if (pluginObj.isWebRtcPlugin || (typeof navigator.plugins !== "undefined" && (!!navigator.plugins["IPVideoTalk Plug-in for IE"] || navigator.plugins["IPVideoTalk Plug-in for Safari"]))) {
        logging("adapter version: 5.0.4, Start to load the Plugin!!");
        if (browserDetails.browser === "ie"){
            logging("This appears to be Internet Explorer");
        } else if (browserDetails.browser === "safari"){
            logging("This appears to be Safari");
        } else { // any other NAPAPI-capable browser comes here
        }
    } else {
        logging("Browser does not appear to be WebRTC-capable");
        //Removed the element, if the plugin installing failed
        document.body.removeChild(pluginObj);
    }

    //For telling the result of plugin installing
    if (pluginObj.versionName == undefined) {
        logging("Plugin installing is not finished");

        return { installed: undefined, version: undefined };
    }

    logging("Plugin installation is successful !! version is " + pluginObj.versionName);
    //Set Log severity as Info
    pluginObj.logSeverity = "info";

    return { installed: true, version: pluginObj.versionName };

};



var pluginShim = {
    shimCreateIceServer: function(url, username, password) {
        var url_parts = url.split(':');
        if (url_parts[0].indexOf('stun') === 0) {
            return { 'url': url };
        } else if (url_parts[0].indexOf('turn') === 0) {
            return {
                   'url': url,
                   'credential': password,
                   'username': username
            };
        }
        return null;
    },
    attachEventListener: function(elt, type, listener, useCapture) {
        var _pluginObj = extractPluginObj(elt);
        if (_pluginObj) {
            _pluginObj.bindEventListener(type, listener, useCapture);
        } else {
            if (typeof elt.addEventListener !== "undefined") {
                elt.addEventListener(type, listener, useCapture);
            } else if (typeof elt.addEvent !== "undefined") {
                elt.addEventListener("on" + type, listener, useCapture);
            }
        }
    },

    getPlugin: function() {
        return document.getElementById('IPVTPluginId');
    },
    checkPlugin: function(window) {

        var browserDetails = window.adapter.browserDetails;

        if (browserDetails.browser == "safari") {
            if (navigator.plugins["IPVideoTalk Plug-in for Safari"] != undefined) {
                var version = undefined;
                var v1 = navigator.plugins["IPVideoTalk Plug-in for Safari"];
                if (v1 && v1 != "") {
                    var v2 = v1.description;
                    if (v2 && v2 != "") {
                        version = v2.match(/[.0-9]+/);
                        if (version && version.length > 0) {
                            version = version[0];
                        }
                    }
                }
                if (version == undefined) {
                    version = "1.0.1.3";
                }

                if ( Object.isFrozen(window.adapter.browserDetails) === false ) {
                    browserDetails.WebRTCPluginVersion = version;
                    browserDetails.isWebRTCPluginInstalled = true;
                    browserDetails.isSupportWebRTC = true;

                    //For plugin, we need to lock it after plugin installed
                    Object.freeze(window.adapter.browserDetails.browser)
                    Object.freeze(window.adapter.browserDetails.version)
                    Object.freeze(window.adapter.browserDetails.UIVersion)

                    Object.freeze(window.adapter.browserDetails)
                }
            }

        } else if (browserDetails.browser == "ie") {
            //It said IE11 support navigator.plugins...  just said...
            var result = installPlugin(window);
            //browserDetails.isWebRTCPluginInstalled = result.installed; //installing is undefined
            if (result.installed == true) {

                if ( Object.isFrozen(window.adapter.browserDetails) === false ) {
                    browserDetails.WebRTCPluginVersion = result.version;
                    browserDetails.isSupportWebRTC = true;
                    browserDetails.isWebRTCPluginInstalled = true;

                    //For plugin, we need to lock it after plugin installed
                    //Object.freeze(window.adapter.browserDetails.browser)
                    //Object.freeze(window.adapter.browserDetails.version)
                    //Object.freeze(window.adapter.browserDetails.UIVersion)

                    Object.freeze(window.adapter.browserDetails)
                }
            } else if (result.installed == false) {
                /*Install Plugin failed !!!*/
                browserDetails.WebRTCPluginVersion = null;
                browserDetails.isSupportWebRTC = false;
                browserDetails.isWebRTCPluginInstalled = false;
            }
        }
        logging("checkPlugin >>> Installed: " + browserDetails.isWebRTCPluginInstalled + "   version: " + browserDetails.WebRTCPluginVersion);


        return { "isWebRTCPluginInstalled": browserDetails.isWebRTCPluginInstalled, "WebRTCPluginVersion": browserDetails.WebRTCPluginVersion };

    },
    loadPlugin:  function(window, callback) {

        if (!window.adapter) {
            logging("Adapter did not ready yet.");
            return;
        }

        logging("loadPlugin !!!!!!!");

        var browserDetails = window.adapter.browserDetails;
        if (browserDetails.WebRTCPluginVersion != undefined) {
            if (callback) { //it's mean already installed
                callback();
            }
        } else {
            loadCount--;
            var result = installPlugin(window);

            //plugin installed and needed user to trust the plugin.
            if (result.installed == true && result.version === undefined) {
                loadCount++; //waiting till the user choose trust
                setTimeout(function() {pluginShim.loadPlugin(window, callback);}, 100);
                return;
            }

            browserDetails.isWebRTCPluginInstalled = result.installed; //installing is undefined
            if (result.installed == true) {
                browserDetails.WebRTCPluginVersion = result.version;
                browserDetails.isSupportWebRTC = true;
                
                if (callback) {
                    callback();
                }
            } else if (loadCount <= 0) {
                /*Install Plugin failed !!!*/
                browserDetails.WebRTCPluginVersion = null;
                browserDetails.isSupportWebRTC = false;
                browserDetails.isWebRTCPluginInstalled = false;
                if (callback) {
                    callback("not found plugin");
                }
            } else { //if not get result in this loop, will try later
                setTimeout(function() {pluginShim.loadPlugin(window, callback);}, 100);
            }
        }
    },

    // Attach a media stream to an element.
    shimAttachMediaStream: function(window) {

        var attachMediaStream = function(element, stream) {
            logging("Plugin: Attaching media stream");
            if (stream == null) {
                logging("stream is null");
            }
            if (!element) {
                return null;
            }
            if (element.isWebRtcPlugin) {
                element.src = stream;
                return element;
            } else if (element.nodeName.toLowerCase() === 'video') {
                if (!element.pluginObj && stream) {
                    logging("Plugin: Create plugin Object");

                    var _pluginObj = document.createElement('object');
                    var _isIE = (Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(window, "ActiveXObject")) || ("ActiveXObject" in window);
                    if (_isIE) {
                        // windowless
                        var windowlessParam = document.createElement("param");
                        windowlessParam.setAttribute('name', 'windowless');
                        windowlessParam.setAttribute('value', true);
                        _pluginObj.appendChild(windowlessParam);
                        _pluginObj.setAttribute('classid', 'CLSID:C14F046D-EC06-4A58-8594-008226370B22');
                    } else {
                        _pluginObj.setAttribute('type', 'application/ipvt-plugin');
                    }
                    element.pluginObj = _pluginObj;

                    _pluginObj.setAttribute('className', element.className);
                    _pluginObj.setAttribute('innerHTML', element.innerHTML);

                    var width = element.getAttribute("width");
                    var height = element.getAttribute("height");
                    var bounds = element.getBoundingClientRect();
                    var zindex = element.getAttribute("zindex");
                    if (!width) width = bounds.right - bounds.left;
                    if (!height) height = bounds.bottom - bounds.top;
                    if (!zindex) {
                        _pluginObj.setAttribute('zindex', 1);
                        element.setAttribute('zindex', 0);
                    } else {
                        _pluginObj.setAttribute('zindex', zindex + 1);

                    }

                    if ("getComputedStyle" in window) {
                        var computedStyle = window.getComputedStyle(element, null);
                        if (!width && computedStyle.width != 'auto' && computedStyle.width != '0px') {
                            width = computedStyle.width;
                        }
                        if (!height && computedStyle.height != 'auto' && computedStyle.height != '0px') {
                            height = computedStyle.height;
                        }
                    }
                    if (width) _pluginObj.setAttribute('width', width);
                    else _pluginObj.setAttribute('autowidth', true);
                    if (height) _pluginObj.setAttribute('height', height);
                    else _pluginObj.setAttribute('autoheight', true);

                    //For resizing the plugin video object with id
                    if (element.id) {
                        _pluginObj.id = element.id;
                        //element.id = null;
                    }

                    document.body.appendChild(_pluginObj);
                    if (element.parentNode) {
                        //element.parentNode.replaceChild(_pluginObj, element); // replace (and remove) element
                        // add element again to be sure any query() will succeed
                        //document.body.appendChild(element);
                        element.parentNode.insertBefore(_pluginObj, element);
                        element.style.display = "none";
                        //element.style.visibility = "hidden";
                        //_pluginObj.style.visibility = "hidden";
                    }
                }

                if (element.pluginObj) {

                    element.pluginObj.addEventListener('play', function(objvid) {
                            if (element.pluginObj) {
                                if (element.pluginObj.getAttribute("autowidth") && objvid.videoWidth) {
                                    element.pluginObj.setAttribute('width', objvid.videoWidth);
                                }
                                if (element.pluginObj.getAttribute("autoheight") && objvid.videoHeight) {
                                    element.pluginObj.setAttribute('height', objvid.videoHeight);
                                }
                            }
                        });

                    // TODO: For adjust the video size synced with the original video element (rzhang)
                    var job = window.setInterval(function() {
                            if (element.pluginObj.videoHeight < 100) {
                                console.info("Reattach Media Stream into Object!");
                                element.pluginObj.src = stream;
                            } else {
                                console.info("Attach Media Stream into Object done!");
                                window.clearInterval(job);
                            }

                        }, 500);
                    //after setting src, hide video
                    //if(adapter.browserDetails.browser == 'ie'){
                    //    element.pluginObj.style.display = "none";
                    //}
                    logging("Plugin: Attaching media stream DONE !!!");
                }

                return element.pluginObj;
            } else if (element.nodeName.toLowerCase() === 'audio') {
                return element;
            }
        }

            window.attachMediaStream = attachMediaStream;

    },

    drawImage: function(context, video, x, y, width, height) {
        var pluginObj = extractPluginObj(video);
        if (pluginObj && pluginObj.isWebRtcPlugin && pluginObj.videoWidth > 0 && pluginObj.videoHeight > 0) {
            if (typeof pluginObj.getScreenShot !== "undefined") {
                var bmpBase64 = pluginObj.getScreenShot();
                if (bmpBase64) {
                    var image = new Image();
                    image.onload = function() {
                        context.drawImage(image, 0, 0, width, height);
                    };
                    image.src = "data:image/png;base64," + bmpBase64;
                }
            } else {
                var imageData = context.createImageData(pluginObj.videoWidth, pluginObj.videoHeight);
                if (imageData) {
                    pluginObj.fillImageData(imageData);
                    context.putImageData(imageData, x, y/*, width, height*/);
                }
            }
        }
    },

    // http://www.w3.org/TR/webrtc/#interface-definition
    // http://www.w3.org/TR/webrtc/#rtcpeerconnection-interface-extensions-2
    shimRTCPeerConnection: function(window) {

        var RTCPeerConnection = function(configuration, constraints) {
            return getPlugin().createPeerConnection(configuration, constraints);
        }

            window.RTCPeerConnection = RTCPeerConnection;
    },

    // http://www.w3.org/TR/webrtc/#rtcicecandidate-type
    shimRTCIceCandidate: function(window) {
        var RTCIceCandidate = function(RTCIceCandidateInit) {
            return getPlugin().createIceCandidate(RTCIceCandidateInit);
        }

            window.RTCIceCandidate = RTCIceCandidate;
    },

    // http://www.w3.org/TR/webrtc/#session-description-model
    shimRTCSessionDescription: function(window) {
        var RTCSessionDescription = function(RTCSessionDescriptionInit) {
            return getPlugin().createSessionDescription(RTCSessionDescriptionInit);
        }

            window.RTCSessionDescription = RTCSessionDescription;
    },

    shimOnTrack: function(window) {
        if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
                    window.RTCPeerConnection.prototype)) {
            Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
                get: function() { return this._ontrack; },
                set: function(f) {
                    if (this._ontrack) {
                        this.removeEventListener('track', this._ontrack);
                    }
                    this.addEventListener('track', this._ontrack = f);
                }
            });
            var origSetRemoteDescription =
                window.RTCPeerConnection.prototype.setRemoteDescription;
            window.RTCPeerConnection.prototype.setRemoteDescription = function() {
                var pc = this;
                if (!pc._ontrackpoly) {
                    pc._ontrackpoly = function(e) {
                        // onaddstream does not fire when a track is added to an existing
                        // stream. But stream.onaddtrack is implemented so we use that.
                        e.stream.addEventListener('addtrack', function(te) {
                                var receiver;
                                if (window.RTCPeerConnection.prototype.getReceivers) {
                                    receiver = pc.getReceivers().find(function(r) {
                                            return r.track && r.track.id === te.track.id;
                                        });
                                } else {
                                    receiver = { track: te.track };
                                }

                                var event = new Event('track');
                                event.track = te.track;
                                event.receiver = receiver;
                                event.transceiver = { receiver: receiver };
                                event.streams = [ e.stream ];
                                pc.dispatchEvent(event);
                            });
                        e.stream.getTracks().forEach(function(track) {
                                var receiver;
                                if (window.RTCPeerConnection.prototype.getReceivers) {
                                    receiver = pc.getReceivers().find(function(r) {
                                            return r.track && r.track.id === track.id;
                                        });
                                } else {
                                    receiver = { track: track };
                                }
                                var event = new Event('track');
                                event.track = track;
                                event.receiver = receiver;
                                event.transceiver = { receiver: receiver };
                                event.streams = [ e.stream ];
                                pc.dispatchEvent(event);
                            });
                    };
                    pc.addEventListener('addstream', pc._ontrackpoly);
                }
                return origSetRemoteDescription.apply(pc, arguments);
            };
        }
    },

    shimLoadWindows: function() {
        if (getPlugin()) {
            if (typeof getPlugin().getWindowList !== 'undefined') {
                var windowArray = [ ];
                var windowsStr = getPlugin().getWindowList();
                var windowList = windowsStr.split(/xxz;;;xxz/);
                for (var i = 0; i < windowList.length; ++i) {
                    var windowValues = windowList[i].split(/xxy;;;xxy/);
                    var option = { windowId: "", windowName: "", previewImg64: null };
                    option.windowId = windowValues[0];
                    option.windowName = windowValues[1];
                    option.previewImg64 = windowValues[2]; // Preview encoded as bas64
                    if (option.windowId != "") {
                        windowArray[i] = option;
                    }
                }
                return windowArray;
            } else {
                logging("Plugin with support for getWindowList not installed");
            }
        }
    },
    //For Safari only
    shimLoadScreens: function() {
        if (getPlugin()) {
            if (typeof getPlugin().getScreenList !== 'undefined') {
                var screenArray = [ ];
                var screenStr = getPlugin().getScreenList();
                var screenList = screenStr.split(/xxz;;;xxz/);
                for (var i = 0; i < screenList.length; ++i) {
                    var screenValues = screenList[i].split(/xxy;;;xxy/);
                    var option = { screenId: "", screenName: "", previewImg64: null };
                    option.screenId = screenValues[0];
                    option.screenName = screenValues[1];
                    option.previewImg64 = screenValues[2]; // Preview encoded as bas64
                    if (option.screenId != "") {
                        screenArray[i] = option;
                    }
                }
                return screenArray;
            } else {
                logging("Plugin with support for getScreenList not installed");
            }
        }
    }


};

// Expose public methods.
module.exports = {
    shimOnTrack: pluginShim.shimOnTrack,
    shimPeerConnection: pluginShim.shimRTCPeerConnection,
    shimGetUserMedia: require('./getusermedia'),
    shimAttachMediaStream: pluginShim.shimAttachMediaStream,
    shimRTCIceCandidate: pluginShim.shimRTCIceCandidate,
    shimRTCSessionDescription: pluginShim.shimRTCSessionDescription,
    shimAttachEventListener: pluginShim.attachEventListener,
    loadWindows: pluginShim.shimLoadWindows,
    loadScreens: pluginShim.shimLoadScreens,
    getPlugin: pluginShim.getPlugin,
    checkPlugin: pluginShim.checkPlugin,
    loadPlugin: pluginShim.loadPlugin
};
    
},{"../es6-promise.min.js":18,"../utils.js":26,"./getusermedia":21}],23:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var utils = require('../utils');

module.exports = {
  shimLocalStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getLocalStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getLocalStreams = function() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!('getStreamById' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getStreamById = function(id) {
        var result = null;
        if (this._localStreams) {
          this._localStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        if (this._remoteStreams) {
          this._remoteStreams.forEach(function(stream) {
            if (stream.id === id) {
              result = stream;
            }
          });
        }
        return result;
      };
    }
    if (!('addStream' in window.RTCPeerConnection.prototype)) {
      var _addTrack = window.RTCPeerConnection.prototype.addTrack;
      window.RTCPeerConnection.prototype.addStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (this._localStreams.indexOf(stream) === -1) {
          this._localStreams.push(stream);
        }
        var pc = this;
        stream.getTracks().forEach(function(track) {
          _addTrack.call(pc, track, stream);
        });
      };

      window.RTCPeerConnection.prototype.addTrack = function(track, stream) {
        if (stream) {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (this._localStreams.indexOf(stream) === -1) {
            this._localStreams.push(stream);
          }
        }
        return _addTrack.call(this, track, stream);
      };
    }
    if (!('removeStream' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.removeStream = function(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        var index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        var pc = this;
        var tracks = stream.getTracks();
        this.getSenders().forEach(function(sender) {
          if (tracks.indexOf(sender.track) !== -1) {
            pc.removeTrack(sender);
          }
        });
      };
    }
  },
  shimRemoteStreamsAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    if (!('getRemoteStreams' in window.RTCPeerConnection.prototype)) {
      window.RTCPeerConnection.prototype.getRemoteStreams = function() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!('onaddstream' in window.RTCPeerConnection.prototype)) {
      Object.defineProperty(window.RTCPeerConnection.prototype, 'onaddstream', {
        get: function() {
          return this._onaddstream;
        },
        set: function(f) {
          var pc = this;
          if (this._onaddstream) {
            this.removeEventListener('addstream', this._onaddstream);
            this.removeEventListener('track', this._onaddstreampoly);
          }
          this.addEventListener('addstream', this._onaddstream = f);
          this.addEventListener('track', this._onaddstreampoly = function(e) {
            e.streams.forEach(function(stream) {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
              pc._remoteStreams.push(stream);
            var event = new Event('addstream');
            event.stream = stream;
              pc.dispatchEvent(event);
          });
          });
        }
      });
    }
  },
  shimCallbacksAPI: function(window) {
    if (typeof window !== 'object' || !window.RTCPeerConnection) {
      return;
    }
    var prototype = window.RTCPeerConnection.prototype;
    var createOffer = prototype.createOffer;
    var createAnswer = prototype.createAnswer;
    var setLocalDescription = prototype.setLocalDescription;
    var setRemoteDescription = prototype.setRemoteDescription;
    var addIceCandidate = prototype.addIceCandidate;
    var getStats = prototype.getStats;

    prototype.createOffer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    prototype.createAnswer = function(successCallback, failureCallback) {
      var options = (arguments.length >= 2) ? arguments[2] : arguments[0];
      var promise = createAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };

    var withCallback = function(description, successCallback, failureCallback) {
      var promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;

    withCallback = function(description, successCallback, failureCallback) {
      var promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;

    withCallback = function(candidate, successCallback, failureCallback) {
      var promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;

    withCallback = function(selector, successCallback, failureCallback) {
        var promise = getStats.apply(this, [ selector ]);
        if (!failureCallback) {
          return promise;
        }
        promise.then(successCallback, failureCallback);
        return Promise.resolve();
    };
    prototype.getStats = withCallback;        

  },
  shimGetUserMedia: function(window) {
    var navigator = window && window.navigator;

    if (!navigator.getUserMedia) {
      if (navigator.webkitGetUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      } else if (navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia = function(constraints, cb, errcb) {
          navigator.mediaDevices.getUserMedia(constraints)
          .then(cb, errcb);
        }.bind(navigator);
      }
    }
  },
  shimRTCIceServerUrls: function(window) {
    // migrate from non-spec RTCIceServer.url to RTCIceServer.urls
    var OrigPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(pcConfig, pcConstraints) {
        if (pcConfig && pcConfig.iceServers && pcConfig.iceServers.length > 0) {
          var newIceServers = [ ];
          for (var i = 0; i < pcConfig.iceServers.length; i++) {
            var server = pcConfig.iceServers[i];
            if (!server.hasOwnProperty('urls') &&
                server.hasOwnProperty('url')) {
              utils.deprecated('RTCIceServer.url', 'RTCIceServer.urls');
              server = JSON.parse(JSON.stringify(server));
              server.urls = server.url;
              delete server.url;
              newIceServers.push(server);
            } else {
              newIceServers.push(pcConfig.iceServers[i]);
            }
          }
          pcConfig.iceServers = newIceServers;
        }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    // wrap static methods. Currently just generateCertificate.
    if ('generateCertificate' in window.RTCPeerConnection) {
      Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
        get: function() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  },
  shimTrackEventTransceiver: function(window) {
    // Add event.transceiver member over deprecated event.receiver
    if (typeof window === 'object' && window.RTCPeerConnection &&
        ('receiver' in window.RTCTrackEvent.prototype) &&
        // can't check 'transceiver' in window.RTCTrackEvent.prototype, as it is
        // defined for some reason even when window.RTCTransceiver is not.
        !window.RTCTransceiver) {
      Object.defineProperty(window.RTCTrackEvent.prototype, 'transceiver', {
        get: function() {
          return {receiver: this.receiver};
        }
      });
    }
  },

  shimCreateOfferLegacy: function(window) {
    var origCreateOffer = window.RTCPeerConnection.prototype.createOffer;
    window.RTCPeerConnection.prototype.createOffer = function(offerOptions) {
      var pc = this;
      if (offerOptions) {
        var audioTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'audio';
        });
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === 'sendrecv') {
            if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection('sendonly');
            } else {
              audioTransceiver.direction = 'sendonly';
            }
          } else if (audioTransceiver.direction === 'recvonly') {
            if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection('inactive');
            } else {
              audioTransceiver.direction = 'inactive';
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true &&
            !audioTransceiver) {
          pc.addTransceiver('audio');
      }

        var videoTransceiver = pc.getTransceivers().find(function(transceiver) {
          return transceiver.sender.track &&
              transceiver.sender.track.kind === 'video';
    });
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === 'sendrecv') {
            videoTransceiver.setDirection('sendonly');
          } else if (videoTransceiver.direction === 'recvonly') {
            videoTransceiver.setDirection('inactive');
      }
        } else if (offerOptions.offerToReceiveVideo === true &&
            !videoTransceiver) {
          pc.addTransceiver('video');
        }
      }
      return origCreateOffer.apply(pc, arguments);
      };
  },
  // Attach a media stream to an element.
  shimAttachMediaStream: function(window) {
      var browserDetails = utils.detectBrowser(window);

      var attachMediaStream = function(element, stream) {
          element.src = URL.createObjectURL(stream);
      }

      window.attachMediaStream = attachMediaStream;
  }
};

},{"../utils":26}],24:[function(require,module,exports){
'use strict';

var utils = require('./utils.js');
var logging = utils.log;
var statDisabled_ = window.localStorage.statsSending == "true" ? false : true;
var tracer = require('./trace-ws.js');
tracer.enable(!statDisabled_);
tracer.init(window.localStorage.statsServer ? window.localStorage.statsServer : 'wss://stats.ipvideotalk.com'); 

//Monitoring statsSending
function handleStorage(event) {
    //console.log(event.key + " is " + event.newValue);
    if (event.key == 'statsSending') {
        console.log("Set tracer.enable as " + event.newValue);
        statDisabled_ = event.newValue == "true" ? false : true;
        tracer.enable(!statDisabled_);
    }
};

if(window.addEventListener) { 
    window.addEventListener("storage", handleStorage, false);
} else if (window.attachEvent) {
    window.attachEvent("onstorage", handleStorage);
}

// transforms a maplike to an object. Mostly for getStats +
// JSON.parse(JSON.stringify())
function map2obj(m) {
    if (!m.entries) {
        return m;
    }
    var o = { };
    m.forEach(function(v, k) {
            o[k] = v;
        });
    return o;
}

// apply a delta compression to the stats report. Reduces size by ~90%.
// To reduce further, report keys could be compressed.
function deltaCompression(oldStats, newStats) {
    newStats = JSON.parse(JSON.stringify(newStats));
    Object.keys(newStats).forEach(function(id) {
            if (!oldStats[id]) {
                return;
            }
            var report = newStats[id];
            Object.keys(report).forEach(function(name) {
                    if (report[name] === oldStats[id][name]) {
                        delete newStats[id][name];
                    }
                    delete report.timestamp;
                    if (Object.keys(report).length === 0) {
                        delete newStats[id];
                    }
                });
        });
    // TODO: moving the timestamp to the top-level is not compression but...
    newStats.timestamp = new Date();
    return newStats;
}

function mangleChromeStats(pc, response) {
    var standardReport = { };
    var reports = response.result();
    reports.forEach(function(report) {
            var standardStats = {
                id: report.id,
                timestamp: report.timestamp.getTime(),
                type: report.type,
            };
            report.names().forEach(function(name) {
                    standardStats[name] = report.stat(name);
                });
            // backfill mediaType -- until https://codereview.chromium.org/1307633007/ lands.
            if (report.type === 'ssrc' && !standardStats.mediaType && standardStats.googTrackId) {
                // look up track kind in local or remote streams.
                var streams = pc.getRemoteStreams().concat(pc.getLocalStreams());
                for (var i = 0; i < streams.length && !standardStats.mediaType; i++) {
                    var tracks = streams[i].getTracks();
                    for (var j = 0; j < tracks.length; j++) {
                        if (tracks[j].id === standardStats.googTrackId) {
                            standardStats.mediaType = tracks[j].kind;
                            report.mediaType = tracks[j].kind;
                        }
                    }
                }
            }
            standardReport[standardStats.id] = standardStats;
        });
    return standardReport;
}

function dumpStream(stream) {
    return {
           id: stream.id,
           tracks: stream.getTracks().map(function(track) {
                return {
                       id: track.id,                 // unique identifier (GUID) for the track
                       kind: track.kind,             // `audio` or `video`
                       label: track.label,           // identified the track source
                       enabled: track.enabled,       // application can control it
                       muted: track.muted,           // application cannot control it (read-only)
                       readyState: track.readyState, // `live` or `ended`
                };
            }),
    };
}

/*
function filterBoringStats(results) {
  Object.keys(results).forEach(function(id) {
    switch (results[id].type) {
      case 'certificate':
      case 'codec':
        delete results[id];
        break;
      default:
        // noop
    }
  });
  return results;
}

function removeTimestamps(results) {
  // FIXME: does not work in FF since the timestamp can't be deleted.
  Object.keys(results).forEach(function(id) {
    delete results[id].timestamp;
  });
  return results;
}
*/

var stats_collector = {

    shimStatPC: function(window) {

        //if (statDisabled_) {
        //    return;
        //}

        var browserDetails = utils.detectBrowser(window);

        var origPeerConnection = window.RTCPeerConnection;

        var peerconnection = function(config, constraints) {

            var pc = new origPeerConnection(config, constraints);

            if (!pc.prevStats) {
                //For getStats
                pc.prevStats = { };
            }

            if (constraints && constraints.optional) {
                constraints.optional.forEach(function(a) {
                        if (a.pcName) {
                            pc.pcName = a.pcName;
                        }
                    });
            } 

            if (!pc.pcName){
                pc.pcName = "PC_Unknown_" + Math.random().toString(36).substr(2);
            }
            var id = pc.pcName;

            if (!config) {
                config = { nullConfig: true };
            }

            config = JSON.parse(JSON.stringify(config)); // deepcopy
            // don't log credentials
            ((config && config.iceServers) || [ ]).forEach(function(server) {
                    delete server.credential;
                });

            config.browserDetails = JSON.parse(JSON.stringify(browserDetails)); // deepcopy


            tracer.send('create', id, config);
            // TODO: do we want to log constraints here? They are chrome-proprietary.
            // http://stackoverflow.com/questions/31003928/what-do-each-of-these-experimental-goog-rtcpeerconnectionconstraints-do
            if (constraints) {
                tracer.send('constraints', id, constraints);
            }

            [ 'createDataChannel', 'close', 'addTrack', 'removeTrack' ].forEach(function(method) {
                    if (origPeerConnection.prototype[method]) {
                        var nativeMethod = pc[method];
                        pc[method] = function() {
                            tracer.send(method, id, arguments);
                            return nativeMethod.apply(pc, arguments);
                        };
                    }
                });

            [ 'addStream', 'removeStream' ].forEach(function(method) {
                    if (origPeerConnection.prototype[method]) {
                        var nativeMethod = pc[method];
                        pc[method] = function(stream) {
                            var streamInfo = stream.getTracks().map(function(t) {
                                    return t.kind + ':' + t.id;
                                });

                            tracer.send(method, id, stream.id + ' ' + streamInfo);
                            return nativeMethod.call(pc, stream);
                        };
                    }
                });

            if (adapter.browserDetails.isWebRTCPluginInstalled === false && adapter.browserDetails.browser === 'safari') {

                [ 'createOffer', 'createAnswer' ].forEach(function(method) {
                        if (origPeerConnection.prototype[method]) {
                            var nativeMethod = pc[method];
                            pc[method] = function() {
                                var args = arguments;
                                var opts;
                                if (arguments.length === 1 && typeof arguments[0] === 'object') {
                                    opts = arguments[0];
                                } else if (arguments.length === 3 && typeof arguments[2] === 'object') {
                                    opts = arguments[2];
                                }
                                tracer.send(method, id, opts);
                                return new Promise(function(resolve, reject) {
                                        nativeMethod.apply(pc, [ opts, ]).then(function(description) {
                                                tracer.send(method + 'OnSuccess', id, description);
                                                resolve(description);
                                                if (args.length > 0 && typeof args[0] === 'function') {
                                                    args[0].apply(null, [ description ]);
                                                }
                                            }).catch(function(err) {
                                                tracer.send(method + 'OnFailure', id, err.toString());
                                                reject(err);
                                                if (args.length > 1 && typeof args[1] === 'function') {
                                                    args[1].apply(null, [ err ]);
                                                }
                                            })
                                    });
                            };
                        }
                    });


            } else {
                /* For All browser without Safari 11 */

                [ 'createOffer', 'createAnswer' ].forEach(function(method) {
                        if (origPeerConnection.prototype[method]) {
                            var nativeMethod = pc[method];
                            pc[method] = function() {
                                var args = arguments;
                                var opts;
                                if (arguments.length === 1 && typeof arguments[0] === 'object') {
                                    opts = arguments[0];
                                } else if (arguments.length === 3 && typeof arguments[2] === 'object') {
                                    opts = arguments[2];
                                }
                                tracer.send(method, id, opts);
                                return new Promise(function(resolve, reject) {
                                        nativeMethod.apply(pc, [
                                                               function(description) {
                                                tracer.send(method + 'OnSuccess', id, description);
                                                resolve(description);
                                                if (args.length > 0 && typeof args[0] === 'function') {
                                                    args[0].apply(null, [ description ]);
                                                }
                                            },
                                                               function(err) {
                                                tracer.send(method + 'OnFailure', id, err.toString());
                                                reject(err);
                                                if (args.length > 1 && typeof args[1] === 'function') {
                                                    args[1].apply(null, [ err ]);
                                                }
                                            },
                                                               opts,
                                                               ]);
                                    });
                            };
                        }
                    });


            }

            [ 'setLocalDescription', 'setRemoteDescription', 'addIceCandidate' ].forEach(function(method) {
                    if (origPeerConnection.prototype[method]) {
                        var nativeMethod = pc[method];
                        pc[method] = function() {
                            var args = arguments;
                            tracer.send(method, id, args[0]);
                            return new Promise(function(resolve, reject) {
                                    nativeMethod.apply(pc, [ args[0],
                                                           function() {
                                            tracer.send(method + 'OnSuccess', id);
                                            resolve();
                                            if (args.length >= 2) {
                                                args[1].apply(null, [ ]);
                                            }
                                        },
                                                           function(err) {
                                            tracer.send(method + 'OnFailure', id, err.toString());
                                            reject(err);
                                            if (args.length >= 3) {
                                                args[2].apply(null, [ err ]);
                                            }
                                        } ]
                                                      );
                                });
                        };
                    }
                });

            pc.addEventListener('icecandidate', function(e) {
                    tracer.send('onicecandidate', id, e.candidate);
                });
            pc.addEventListener('addstream', function(e) {
                    tracer.send('onaddstream', id, e.stream.id + ' ' + e.stream.getTracks().map(function(t) { return t.kind + ':' + t.id; }));
                });
            pc.addEventListener('removestream', function(e) {
                    tracer.send('onremovestream', id, e.stream.id + ' ' + e.stream.getTracks().map(function(t) { return t.kind + ':' + t.id; }));
                });
            pc.addEventListener('signalingstatechange', function() {
                    tracer.send('onsignalingstatechange', id, pc.signalingState);
                });
            pc.addEventListener('iceconnectionstatechange', function() {
                    tracer.send('oniceconnectionstatechange', id, pc.iceConnectionState);
                });
            pc.addEventListener('icegatheringstatechange', function() {
                    tracer.send('onicegatheringstatechange', id, pc.iceGatheringState);
                });
            pc.addEventListener('negotiationneeded', function() {
                    tracer.send('onnegotiationneeded', id);
                });
            pc.addEventListener('datachannel', function(event) {
                    tracer.send('ondatachannel', id, [ event.channel.id, event.channel.label ]);
                });




            var statChromeStats = function(pc, res) {
                var now = mangleChromeStats(pc, res);
                tracer.send('getstats', pc.pcName, deltaCompression(pc.prevStats, now));
                pc.prevStats = JSON.parse(JSON.stringify(now));
            };

            var statFirefoxStats = function(pc, res) {
                var now = map2obj(res);
                tracer.send('getstats', pc.pcName, deltaCompression(pc.prevStats, now));
                pc.prevStats = JSON.parse(JSON.stringify(now));
            };

            var statEdgeStats = function(pc, res) {
                //TODO
                var now = map2obj(res);
                tracer.send('getstats', pc.pcName, deltaCompression(pc.prevStats, now));
                pc.prevStats = JSON.parse(JSON.stringify(now));
            };

            var statSafariStats = function(pc, res) {
                //TODO
                var now = map2obj(res);
                tracer.send('getstats', pc.pcName, deltaCompression(pc.prevStats, now));
                pc.prevStats = JSON.parse(JSON.stringify(now));
            };

            var origGetStats = origPeerConnection.prototype['getStats'];
            if (browserDetails.browser != 'edge') {
                pc.getStats = function(selector, successCallback, errorCallback) {
                    var pc = this;
                    
                    return new Promise(function(resolve, reject) {
                        origGetStats.apply(pc, [ selector, function(response) {
                                if (browserDetails.browser === 'chrome' || browserDetails.browser === 'opera') {
                                    statChromeStats(pc, response);
                                } else if (browserDetails.browser === 'firefox') {
                                    statFirefoxStats(pc, response);
                                } else if (browserDetails.browser === 'edge') {
                                    statEdgeStats(pc, response);
                                } else if (browserDetails.isWebRTCPluginInstalled === true) {
                                    //For Plugin
                                    statChromeStats(pc, response);
                                } else if (browserDetails.browser === 'safari') {
                                    statSafariStats(pc, response);
                                } else {
                                    console.warn("Unknow browser!");
                                }
                                resolve(response);
                            }, reject ]);
                        }).then(successCallback, errorCallback)
                }
            } else {
                pc.getStats = function(selector, successCallback, errorCallback) {
                    var pc = this;

                    return new Promise(function(resolve, reject) {
                         origGetStats.apply(pc, [ selector ]).then(function(response) {
                                   statEdgeStats(pc, response);
                                   resolve(response);
                               });
                        }).then(successCallback, errorCallback)
                }
            }

            return pc;
        }

            window.RTCPeerConnection = peerconnection;
    },


    shimStatGUM: function(window) {

        //if (statDisabled_) {
        //    return;
        //}
        var browserDetails = utils.detectBrowser(window);

        //Non-promise
        var nonPromiseGetUserMedia = navigator.getUserMedia;
        var nonPromiseGUM = function() {
            tracer.send('getUserMedia', null, arguments[0]);
            var cb = arguments[1];
            var eb = arguments[2];
            nonPromiseGetUserMedia.call(navigator, arguments[0],
                                   function(stream) {
                                       // we log the stream id, track ids and tracks readystate since that is ended GUM fails
                                       // to acquire the cam (in chrome)
                                       tracer.send('getUserMediaOnSuccess', null, dumpStream(stream));
                                       if (cb) {
                                           cb(stream);
                                       }
                                   },
                                   function(err) {
                                       tracer.send('getUserMediaOnFailure', null, err.name);
                                       if (eb) {
                                           eb(err);
                                       }
                                   });
        };
        navigator.getUserMedia = nonPromiseGUM;

        //Promise
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var promiseGetUserMedia = navigator.mediaDevices.getUserMedia;
            var promiseGUM = function() {
                tracer.send('navigator.mediaDevices.getUserMedia', null, arguments[0]);
                return promiseGetUserMedia.apply(navigator.mediaDevices, arguments)
                       .then(function(stream) {
                        tracer.send('navigator.mediaDevices.getUserMediaOnSuccess', null, dumpStream(stream));
                        return stream;
                    }, function(err) {
                        tracer.send('navigator.mediaDevices.getUserMediaOnFailure', null, err.name);
                        return Promise.reject(err);
                    });
            };
            navigator.mediaDevices.getUserMedia = promiseGUM.bind(navigator.mediaDevices);
        }
    },

    shimStatInterface: function(window, adapter) {

        //if (statDisabled_) {
        //    return;
        //}

        adapter.statsCollector = {
            send: function() {
                if (arguments.length == 1) {
                    tracer.send(arguments[0]);
                } else if(arguments.length == 2) {
                    tracer.send(arguments[0], arguments[1]);
                } else if (arguments.length >= 3) {
                    tracer.send(arguments[0], arguments[1], arguments[2]);
                }
            },

            stop: function() {
                 statDisabled_ = true;
                 tracer.enable(!statDisabled_);
            },

            start: function() {
                statDisabled_ = false;
                tracer.enable(!statDisabled_);
            },
        };



    }

};

// Export.
module.exports = {
    shimStatPC: stats_collector.shimStatPC,
    shimStatGUM: stats_collector.shimStatGUM,
    shimStatInterface: stats_collector.shimStatInterface
};

},{"./trace-ws.js":25,"./utils.js":26}],25:[function(require,module,exports){
var PROTOCOL_VERSION = '1.0';
var buffer = [ ];
var confID = !window.sessionStorage.confID ? "" : "&confid=" + window.sessionStorage.confID;
var email = !window.localStorage.email ? "" : "&email=" + window.localStorage.email;
var id = Math.random().toString(36).substr(2);
var fullURL = null;
var enabled = true;
var connection = null;

function errorProcess(e) {
    console.log('WS ERROR', e);
    return false;
};

function closeProcess() {
    setTimeout(createConnection, 5000);
};

function openProcess() {
    while ( buffer.length ) {
        connection.send(JSON.stringify(buffer.shift()));
    }
};

/*
connection.onmessage = function(msg) {
  // no messages from the server defined yet.
};
*/

function createConnection() {
    if ( enabled ) {

        if ( connection ) {
            connection = null; //delete
        }

        // connect
        console.log("Create stats connection !!!");
        connection = new WebSocket(fullURL, PROTOCOL_VERSION);
        connection.onerror = errorProcess;
        connection.onclose = closeProcess;
        connection.onopen = openProcess;
    }
    return connection;
}

module.exports = {

   init: function(wsURL) {

        fullURL = wsURL + '/stats?id=' + id + confID + email;

        createConnection();
    },

   send: function () {
       //console.log.apply(console, arguments);
       // TODO: drop getStats when not connected?

       if ( enabled ) {
           var args = Array.prototype.slice.call(arguments);
           args.push(new Date().getTime());
           if ( connection.readyState === 1 ) {
               connection.send(JSON.stringify(args));
           } else {
               buffer.push(args);
           }
       }
   },

   enable: function (stat) {
       ex_enabled = enabled;
       enabled = (stat === true ? true : false);

       if ( enabled != ex_enabled ) {
           if ( enabled ) {
               //Start wss
               createConnection();
           } else {
               //Stop wss
               console.log("Closing stats connection");
               if ( connection ) {
                   connection.close();
               }
           }
       }
   },

   enabled: function (){
       return enabled;
   }

}

},{}],26:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = false;
var deprecationWarnings_ = true;

/**
 * Extract browser version out of the provided user agent string.
 *
 * @param {!string} uastring userAgent string.
 * @param {!string} expr Regular expression used as match criteria.
 * @param {!number} pos position in the version string to be returned.
 * @return {!number} browser version.
 */
function extractVersion(uastring, expr, pos) {
  var match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}

// Wraps the peerconnection event eventNameToWrap in a function
// which returns the modified event object.
function wrapPeerConnectionEvent(window, eventNameToWrap, wrapper) {
  if (!window.RTCPeerConnection) {
    return;
  }
  var proto = window.RTCPeerConnection.prototype;
  var nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    var wrappedCallback = function(e) {
      cb(wrapper(e));
    };
    this._eventMap = this._eventMap || {};
    this._eventMap[cb] = wrappedCallback;
    return nativeAddEventListener.apply(this, [nativeEventName,
      wrappedCallback]);
  };

  var nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap
        || !this._eventMap[cb]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    var unwrappedCb = this._eventMap[cb];
    delete this._eventMap[cb];
    return nativeRemoveEventListener.apply(this, [nativeEventName,
      unwrappedCb]);
  };

  Object.defineProperty(proto, 'on' + eventNameToWrap, {
    get: function() {
      return this['_on' + eventNameToWrap];
    },
    set: function(cb) {
      if (this['_on' + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap]);
        delete this['_on' + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap,
            this['_on' + eventNameToWrap] = cb);
      }
    }
  });
}

// Utility methods.
module.exports = {
  extractVersion: extractVersion,
  wrapPeerConnectionEvent: wrapPeerConnectionEvent,
  disableLog: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    logDisabled_ = bool;
    return (bool) ? 'adapter.js logging disabled' :
        'adapter.js logging enabled';
  },

  /**
   * Disable or enable deprecation warnings
   * @param {!boolean} bool set to true to disable warnings.
   */
  disableWarnings: function(bool) {
    if (typeof bool !== 'boolean') {
      return new Error('Argument type: ' + typeof bool +
          '. Please use a boolean.');
    }
    deprecationWarnings_ = !bool;
    return 'adapter.js deprecation warnings ' + (bool ? 'disabled' : 'enabled');
  },

  log: function() {
    if (typeof window === 'object') {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log.apply(console, arguments);
      }
    }
  },

  /**
   * Shows a deprecation warning suggesting the modern and spec-compatible API.
   */
  deprecated: function(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + ' is deprecated, please use ' + newMethod +
        ' instead.');
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *     properties.
   */
  detectBrowser: function(window) {
      var navigator = window && window.navigator;

      // Returned result object.
    var result = {};
    result.browser = null;
    result.version = null;
    result.UIVersion = null;
    result.chromeVersion = null;

    // Fail early if it's not a browser
    if (typeof window === 'undefined' || !window.navigator) {
      result.browser = 'Not a browser.';
      return result;
    }

    // Edge.
     if (navigator.mediaDevices &&
        navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = 'edge';
      result.version = extractVersion(navigator.userAgent,
          /Edge\/(\d+).(\d+)$/, 2);
      result.UIVersion = navigator.userAgent.match(/Edge\/([\d.]+)/)[1]; //Edge/16.17017
    
    } // IE
    else if ( !navigator.mediaDevices && ( !!window.ActiveXObject 
                                         || 'ActiveXObject' in window  ||
                                         navigator.userAgent.match(/MSIE (\d+)/) 
                                         || navigator.userAgent.match(/rv:(\d+)/) ) ) {
      result.browser = 'ie';
      if ( navigator.userAgent.match(/MSIE (\d+)/) ) {
        result.version = extractVersion(navigator.userAgent, /MSIE (\d+).(\d+)/, 1);
        result.UIVersion = navigator.userAgent.match(/MSIE ([\d.]+)/)[1]; //MSIE 10.6

      } else if ( navigator.userAgent.match(/rv:(\d+)/) ) {
          /*For IE 11*/
          result.version = extractVersion(navigator.userAgent, /rv:(\d+).(\d+)/, 1);
          result.UIVersion = navigator.userAgent.match(/rv:([\d.]+)/)[1]; //rv:11.0
      }

      // Firefox.
    } else if (navigator.mozGetUserMedia) {
      result.browser = 'firefox';
      result.version = extractVersion(navigator.userAgent,
          /Firefox\/(\d+)\./, 1);
      result.UIVersion = navigator.userAgent.match(/Firefox\/([\d.]+)/)[1]; //Firefox/56.0

    // all webkit-based browsers
    } else if (navigator.webkitGetUserMedia && window.webkitRTCPeerConnection) {
      // Chrome, Chromium, Webview, Opera, Vivaldi all use the chrome shim for now
      var isOpera = navigator.userAgent.match(/(OPR|Opera).([\d.]+)/) ? true : false;
        //var isVivaldi = navigator.userAgent.match(/(Vivaldi).([\d.]+)/) ? true : false;
        if (isOpera) {
          result.browser = 'opera';
          result.version = extractVersion(navigator.userAgent,
              /O(PR|pera)\/(\d+)\./, 2);
          result.UIVersion = navigator.userAgent.match(/O(PR|pera)\/([\d.]+)/)[2]; //OPR/48.0.2685.39
            if(navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2]){
                result.chromeVersion  = extractVersion(navigator.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
            }
      }/* else if (isVivaldi) {
          result.browser = 'vivaldi';
          result.version = extractVersion(navigator.userAgent,
                                            /(Vivaldi)\/(\d+)\./, 2);
          result.UIVersion = navigator.userAgent.match(/Vivaldi\/([\d.]+)/)[1]; //Vivaldi/1.93.955.38
     }*/ else {
          result.browser = 'chrome';
          result.version = extractVersion(navigator.userAgent,
              /Chrom(e|ium)\/(\d+)\./, 2);
          result.UIVersion = navigator.userAgent.match(/Chrom(e|ium)\/([\d.]+)/)[2]; //Chrome/61.0.3163.100 
      }

    // Safari or unknown webkit-based
    // for the time being Safari has support for MediaStreams but not webRTC
    //Safari without webRTC and with partly webRTC support
    } else if ( (!navigator.webkitGetUserMedia && navigator.userAgent.match(/AppleWebKit\/([0-9]+)\./) ) 
         || (navigator.webkitGetUserMedia && !navigator.webkitRTCPeerConnection) ) {
        // Safari UA substrings of interest for reference:
        // - webkit version:           AppleWebKit/602.1.25 (also used in Op,Cr)
        // - safari UI version:        Version/9.0.3 (unique to Safari)
        // - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
        //
        // if the webkit version and safari UI webkit versions are equals,
        // ... this is a stable version.
        //
        // only the internal webkit version is important today to know if
        // media streams are supported
        //
        if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
          result.browser = 'safari';
          result.version = extractVersion(navigator.userAgent,
            /AppleWebKit\/(\d+)\./, 1);
          result.UIVersion = navigator.userAgent.match(/Version\/([\d.]+)/)[1]; //Version/11.0.1

        } else { // unknown webkit-based browser.
          result.browser = 'Unsupported webkit-based browser ' +
              'with GUM support but no WebRTC support.';
          return result;
        }
    // Default fallthrough: not supported.
    } else {
      result.browser = 'Not a supported browser.';
      return result;
    }

    return result;
  }
};

},{}]},{},[11])(11)
});