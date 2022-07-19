
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof self!=="undefined"){g=self}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.debug = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){},{

}],2:[function(require,module,exports){
/* global self, exports, define */
    !function() {
            'use strict';

            var re = {
                not_string: /[^s]/,
                not_bool: /[^t]/,
                not_type: /[^T]/,
                not_primitive: /[^v]/,
                number: /[diefg]/,
                numeric_arg: /[bcdiefguxX]/,
                json: /[j]/,
                not_json: /[^j]/,
                text: /^[^\x25]+/,
                modulo: /^\x25{2}/,
                placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
                key: /^([a-z_][a-z_\d]*)/i,
                key_access: /^\.([a-z_][a-z_\d]*)/i,
                index_access: /^\[(\d+)\]/,
                sign: /^[\+\-]/
            }

            function sprintf(key) {
                // `arguments` is not an array, but should be fine for this call
                return sprintf_format(sprintf_parse(key), arguments)
            }

            function vsprintf(fmt, argv) {
                return sprintf.apply(null, [fmt].concat(argv || []))
            }

            function sprintf_format(parse_tree, argv) {
                var cursor = 1, tree_length = parse_tree.length, arg, output = '', i, k, match, pad, pad_character, pad_length, is_positive, sign
                for (i = 0; i < tree_length; i++) {
                    if (typeof parse_tree[i] === 'string') {
                        output += parse_tree[i]
                    }
                    else if (Array.isArray(parse_tree[i])) {
                        match = parse_tree[i] // convenience purposes only
                        if (match[2]) { // keyword argument
                            arg = argv[cursor]
                            for (k = 0; k < match[2].length; k++) {
                                if (!arg.hasOwnProperty(match[2][k])) {
                                    throw new Error(sprintf('[sprintf] property "%s" does not exist', match[2][k]))
                                }
                                arg = arg[match[2][k]]
                            }
                        }
                        else if (match[1]) { // positional argument (explicit)
                            arg = argv[match[1]]
                        }
                        else { // positional argument (implicit)
                            arg = argv[cursor++]
                        }

                        if (re.not_type.test(match[8]) && re.not_primitive.test(match[8]) && arg instanceof Function) {
                            arg = arg()
                        }

                        if (re.numeric_arg.test(match[8]) && (typeof arg !== 'number' && isNaN(arg))) {
                            throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
                        }

                        if (re.number.test(match[8])) {
                            is_positive = arg >= 0
                        }

                        switch (match[8]) {
                            case 'b':
                                arg = parseInt(arg, 10).toString(2)
                                break
                            case 'c':
                                arg = String.fromCharCode(parseInt(arg, 10))
                                break
                            case 'd':
                            case 'i':
                                arg = parseInt(arg, 10)
                                break
                            case 'j':
                                arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
                                break
                            case 'e':
                                arg = match[7] ? parseFloat(arg).toExponential(match[7]) : parseFloat(arg).toExponential()
                                break
                            case 'f':
                                arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                                break
                            case 'g':
                                arg = match[7] ? String(Number(arg.toPrecision(match[7]))) : parseFloat(arg)
                                break
                            case 'o':
                                arg = (parseInt(arg, 10) >>> 0).toString(8)
                                break
                            case 's':
                                arg = String(arg)
                                arg = (match[7] ? arg.substring(0, match[7]) : arg)
                                break
                            case 't':
                                arg = String(!!arg)
                                arg = (match[7] ? arg.substring(0, match[7]) : arg)
                                break
                            case 'T':
                                arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
                                arg = (match[7] ? arg.substring(0, match[7]) : arg)
                                break
                            case 'u':
                                arg = parseInt(arg, 10) >>> 0
                                break
                            case 'v':
                                arg = arg.valueOf()
                                arg = (match[7] ? arg.substring(0, match[7]) : arg)
                                break
                            case 'x':
                                arg = (parseInt(arg, 10) >>> 0).toString(16)
                                break
                            case 'X':
                                arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase()
                                break
                        }
                        if (re.json.test(match[8])) {
                            output += arg
                        }
                        else {
                            if (re.number.test(match[8]) && (!is_positive || match[3])) {
                                sign = is_positive ? '+' : '-'
                                arg = arg.toString().replace(re.sign, '')
                            }
                            else {
                                sign = ''
                            }
                            pad_character = match[4] ? match[4] === '0' ? '0' : match[4].charAt(1) : ' '
                            pad_length = match[6] - (sign + arg).length
                            pad = match[6] ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : ''
                            output += match[5] ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg)
                        }
                    }
                }
                return output
            }

            var sprintf_cache = Object.create(null)

            function sprintf_parse(fmt) {
                if (sprintf_cache[fmt]) {
                    return sprintf_cache[fmt]
                }

                var _fmt = fmt, match, parse_tree = [], arg_names = 0
                while (_fmt) {
                    if ((match = re.text.exec(_fmt)) !== null) {
                        parse_tree.push(match[0])
                    }
                    else if ((match = re.modulo.exec(_fmt)) !== null) {
                        parse_tree.push('%')
                    }
                    else if ((match = re.placeholder.exec(_fmt)) !== null) {
                        if (match[2]) {
                            arg_names |= 1
                            var field_list = [], replacement_field = match[2], field_match = []
                            if ((field_match = re.key.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                                while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                    if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                        field_list.push(field_match[1])
                                    }
                                    else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                        field_list.push(field_match[1])
                                    }
                                    else {
                                        throw new SyntaxError('[sprintf] failed to parse named argument key')
                                    }
                                }
                            }
                            else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key')
                            }
                            match[2] = field_list
                        }
                        else {
                            arg_names |= 2
                        }
                        if (arg_names === 3) {
                            throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
                        }
                        parse_tree.push(match)
                    }
                    else {
                        throw new SyntaxError('[sprintf] unexpected placeholder')
                    }
                    _fmt = _fmt.substring(match[0].length)
                }
                return sprintf_cache[fmt] = parse_tree
            }

            /**
             * export to either browser or node.js
             */
            /* eslint-disable quote-props */
            if (typeof exports !== 'undefined') {
                exports['sprintf'] = sprintf
                exports['vsprintf'] = vsprintf
            }
            if (typeof self !== 'undefined') {
                self['sprintf'] = sprintf
                self['vsprintf'] = vsprintf

                if (typeof define === 'function' && define['amd']) {
                    define(function() {
                        return {
                            'sprintf': sprintf,
                            'vsprintf': vsprintf
                        }
                    })
                }
            }
            /* eslint-enable quote-props */
        }()
},{}],3:[function(require,module,exports){
var sprintf = require("sprintf-js").sprintf;

var argsToString = function(args) {
            //sprintf-js did not support %o / %O
            args[0] = args[0] ? args[0].replace(/%o/g, "%s") : "";

            switch (args.length) {
                case 1:
                    return args[0];
                case 2:
                    return sprintf(args[0], args[1]);
                case 3:
                    return sprintf(args[0], args[1], args[2]);
                case 4:
                    return sprintf(args[0], args[1], args[2], args[3]);
                case 5:
                    return sprintf(args[0], args[1], args[2], args[3], args[4]);
                case 6:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5]);
                case 7:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                case 8:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
                case 9:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
                case 10:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
                case 11:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
                case 12:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
                case 13:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
                case 14:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]);
                case 15:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14]);
                case 16:
                    return sprintf(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14], args[15]);
                default:
                    return null;
            }
        };


function beautyDate(date) {
    var yyyy = date.getFullYear();
    var m = date.getMonth() + 1; // getMonth() is zero-based
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();
    var sec = date.getSeconds();
    var msec = date.getMilliseconds();

    var mm  = m < 10 ? "0" + m : m;
    var dd  = d < 10 ? "0" + d : d;
    var hh  = h < 10 ? "0" + h : h;
    var min = mi < 10 ? "0" + mi : mi;
    var ss  = sec < 10 ? "0" + sec : sec;
    var mss = msec < 10 ? "00" + msec : ( msec < 100 ? "0" + msec : msec );

    return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat("@").concat(hh).concat(":").concat(min).concat(":").concat(ss).concat(".").concat(mss);
};

//For catch browser console error events
self.onerror = function(msg, url, lineNo, columnNo, error) {
    var message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
    ].join('\n');

    this.debug('Console:ERROR')(message);
    return false;
};

/***
 * indexedDB Class Model
 * @type {self.DBmanager}
 */
self.DBmanager = class DBmanager {
    constructor(dbName, storeName, version, index) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version || 1;
        this.index = index;
        this.currentDB = null;
        this.indexedDBOnOpen = false
        this.DAY_2_KEEP_LOGS = 7
    }

    /***
     * create database
     */
    openDB() {
        var request = self.indexedDB.open(this.dbName, this.version);
        request.onerror = function (e) {
            console.log(e.currentTarget.error.message);
        }.bind(this);

        request.onsuccess = function (e) {
            this.currentDB = e.target.result;
            console.log(this.currentDB.name + ' database is already opened!');
            this.indexedDBOnOpen = true

            if(this.currentDB.name !== 'DatabaseLists' && !this.isDataCleared){
                console.log('Clear data older than 7 days')
                this.isDataCleared = true
                this.deleteItems(this.DAY_2_KEEP_LOGS)
            }
        }.bind(this);

        request.onupgradeneeded = function (e) {
            console.log('database version is already upgrade to ' + this.version);
            this.currentDB = e.target.result;
            if (!this.currentDB.objectStoreNames.contains(this.storeName)) {
                var objectStore = this.currentDB.createObjectStore(this.storeName, {keyPath: "id", autoIncrement: true});

                // create index
                if(this.index && this.index.length > 0){
                    this.index.forEach(function (item) {
                        objectStore.createIndex(item, item);
                    })
                }
            }
        }.bind(this);
    }

    /***
     * get store by storeName
     * @returns {IDBObjectStore}
     */
    getStoreByName() {
        var objectStore = null
        if(this.currentDB && this.indexedDBOnOpen){
            try {
                objectStore = this.currentDB.transaction(this.storeName, 'readwrite').objectStore(this.storeName)
            }catch (e){
                console.warn('get objectStore error: ', e.message)
            }
        }else {
            console.log('indexedDB is not open now...')
        }
        return objectStore
    }

    /***
     * add one data
     * data should be an object
     * @param data
     */
    setItem(data) {
        var store = this.getStoreByName(this.storeName);

        if (store) {
            store.add(data);

            store.onsuccess = function (event) {
                console.log('Data write succeeded');
            };

            store.onerror = function (event) {
                console.log('Data write failed');
            }
        }
    }

    /***
     * add more than one data
     * data should be array
     * @param items
     */
    setItems(items){
        var store = this.getStoreByName(this.storeName);
        if (store) {
            for(var i = 0; i < items.length; i++){
                store.put(items[i]);
            }
        }
    }

    /***
     * Get a piece of data by key value
     * @param key  Index name
     * @param value
     */
    getItem (key, value) {
        var store = this.getStoreByName(this.storeName);
        if(store){
            var index = store.index(key);
            var request = index.get(value);

            request.onsuccess = function( e) {
                if ( request.result) {
                    console.log(request.result);
                } else {
                    console.log('未获得数据记录');
                }
            };
        }
    }

    /***
     * get all items
     */
    getAllItems() {
        var store = this.getStoreByName(this.storeName);
        if(store){
            var request = store.openCursor();

            request.onsuccess = function (event) {
                var cursor = event.target.result;

                if (cursor) {
                    console.log(cursor.value);
                    cursor.continue();
                } else {
                    console.log('没有更多数据了！');
                }
            };
        }
    }

    /***
     * delete items
     * Save data within 30 days by default
     */
    deleteItems(time = this.DAY_2_KEEP_LOGS) {
        var store = this.getStoreByName(this.storeName);
        if(store){
            console.log('delete ' + this.currentDB.name +' db data within ' + time + ' days')
            var request = store.openCursor();
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                var dateTimeStamp = 1000 * 60 * 60 * 24 * time
                var nowTimeStamp = new Date().getTime()

                if (cursor) {
                    var TS = cursor.value.TS
                    if(nowTimeStamp - TS >= dateTimeStamp){
                        store.delete(cursor.value.id)
                        cursor.continue();
                    }else {
                        console.log('Delete complete.')
                    }
                } else {
                    console.log('Delete complete!');
                }
            };
        }
    }

    /***
     * update data
     * @param newItem
     */
    update(newItem) {
        var store = this.getStoreByName(this.storeName);
        if(store){
            store.put(newItem);

            store.onsuccess = function (event) {
                console.log('data update success');
            };

            store.onerror = function (event) {
                console.log('data update failed');
            }
        }
    }

    clear () {
        var store = this.getStoreByName(this.storeName);
        if(store){
            var request = store.clear();

            request.onsuccess = function (event) {
                console.log('clear Success');
            };
            request.onerror = function (event) {
                console.log('clear Error');
            };
        }
    }
};


/**
 * This is the common logic for both the Node.js and web browser implementations of `debug()`.
 */
module.exports = function setup(env) {
    createDebug.debug = createDebug['default'] = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.sessionStorageSave = sessionStorageSave;
    createDebug.sessionStorageSave()
    createDebug.enabledLocalLog = enabledLocalLog;
    createDebug.enableLocalLog = enableLocalLog;
    createDebug.disableLocalLog = disableLocalLog;
    createDebug.updateConfInfo = updateConfInfo;
    createDebug.getLocalLogs = getLocalLogs;
    createDebug.getAllDatabaseNameList = getAllDatabaseNameList;
    createDebug.deleteDatabases = deleteDatabases;
    createDebug.exportLog = exportLog;
    // createDebug.clearExpiredDatabase = clearExpiredDatabase()

    //The currently state of Local Log.
    createDebug.localLogState = true;
    createDebug.createdDBList = false; //marked the DB List is saved.
    createDebug.logBuffer = [];
    createDebug.dbVersion = 2

    // Function is converted to a function under createDebug, eg useColors、formatArgs ect.
    Object.keys(env).forEach(function(key) {
        createDebug[key] = env[key];
    });

    // create dataBase
    createDebug.dataBaseListDB = new self.DBmanager('DatabaseLists', "keyvaluepairs", createDebug.dbVersion, ["dbName", "TS"]);
    createDebug.dataBaseListDB.openDB();
    // create localLogsDB
    createDebug.localLogsDB = new self.DBmanager(env.sessionStorage.dbName, "localLogs", createDebug.dbVersion, ["cseqNumber", "moduleName", "logLevel", "TS", "content"]);
    createDebug.isDataCleared = false
    createDebug.localLogsDB.openDB();

   // Active `debug` instances.
    createDebug.instances = [ ];
    // The currently active debug mode names, and names to skip.
    createDebug.names = [ ];
    createDebug.skips = [ ];

     // Map of special "%n" handling functions, for the debug "format" argument.
     // Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
    createDebug.formatters = { };
    createDebug.DAY_2_KEEP_LOGS = 7

    /**
     * Select a color.
     * @param {String} namespace
     * @return {Number}
     * @api private
     */
    function selectColor(namespace) {
        var hash = 0, i;

        for (i in namespace) {
            hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }

        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;

    /**
     * Select a background color.
     * @param {String} namespace
     * @return {Number}
     * @api private
     */

    function selectBGColor(namespace) {
        var hash = 0, i;

        var level = namespace.match(/:(\w+)/)[1];
        switch (level) {
        case 'DEBUG':
            i = 0;
            break;
        case 'LOG':
            i = 1;
            break;
        case 'INFO':
            i = 2;
            break;
        case 'WARN':
            i = 3;
            break;
        case 'ERROR':
            i = 4;
            break;
        case 'FATAL':
            i = 5;
            break;
        default:
            i = 2;
            break;
        }

        return createDebug.bgColors[i];
    }
    createDebug.selectBGColor = selectBGColor;

    function destroy() {
        var index = createDebug.instances.indexOf(this);
        if (index !== -1) {
            createDebug.instances.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @api public
     */
    function enable(namespaces) {
        createDebug.save(namespaces);

        createDebug.names = [ ];
        createDebug.skips = [ ];

        var i;
        var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
        var len = split.length;

        for (i = 0; i < len; i++) {
            if (!split[i]) continue; // ignore empty strings
            namespaces = split[i].replace(/\*/g, '.*?');
            if (namespaces[0] === '-') {
                createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
            } else {
                createDebug.names.push(new RegExp('^' + namespaces + '$'));
            }
        }

        for (i = 0; i < createDebug.instances.length; i++) {
            var instance = createDebug.instances[i];
            instance.enabled = createDebug.enabled(instance.namespace);
        }
    }

    /**
     * Disable debug output.
     *
     * @api public
     */

    function disable() {
        createDebug.enable('');
    }

    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     */

    function enabled(name) {
        if (name[name.length - 1] === '*') {
            return true;
        }
        var i, len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
            if (createDebug.skips[i].test(name)) {
                return false;
            }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
            if (createDebug.names[i].test(name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create a debugger with the given `namespace`.
     * @param {String} namespace
     * @return {Function}
     * @api public
     */
    function createDebug(namespace) {
        //var prevTime;
        function debug() {
            var date = new Date();
            // turn the `arguments` into a proper Array
            var args = new Array(arguments.length);
            for (var i = 0; i < args.length; i++) {
                args[i] = arguments[i];
            }
            args[0] = createDebug.coerce(args[0]);

            if ('string' !== typeof args[0]) {
                // anything else let's inspect with %O
                args[0] = JSON.stringify(args[0]);
            }

            if (createDebug.localLogState === true) {
                //Save log into localforage whatever debug is disabled or not.
                var logList = {
                    cseqNumber: createDebug.logIndex,
                    moduleName: namespace.split(":")[0],
                    logLevel: namespace.split(":")[1],
                    TS: (new Date()).getTime(),
                    content: argsToString(args)
                }

                createDebug.logBuffer.push(logList);

                // To avoid writing too often, write data to the database for every 20 data.
                // todo: SIPSTACK log will not be saved when there are less than 20 entries
                if (createDebug.logBuffer.length >= 20 || logList.content === 'saveBeforeExport' || logList.moduleName === 'SIPSTACK') {
                    createDebug.localLogsDB.setItems(createDebug.logBuffer);
                    createDebug.logBuffer = [ ];

                    // save the databaseName into DatabaseLists database if not exist
                    if (!createDebug.createdDBList) {
                        var key = env.sessionStorage.dbName;
                        var store = createDebug.dataBaseListDB.getStoreByName();

                        if (key && store) {
                            var request = store.index('dbName').get(key);
                            var infoJson = {};

                            request.onsuccess = function( e) {
                                if ( !request.result) {
                                    infoJson = {
                                        TS: [new Date().getTime()],
                                        dbName: env.sessionStorage.dbName,
                                        data: {
                                            confID: env.sessionStorage.confID,
                                            userName: self.localStorage.userName,
                                            email: self.localStorage.email
                                        }
                                    };
                                } else {
                                    infoJson = request.result;
                                    var ts = request.result.TS;
                                    if (ts) {
                                        infoJson.TS.push(new Date().getTime());
                                    }
                                }
                                createDebug.dataBaseListDB.update(infoJson);
                                createDebug.createdDBList = true;
                            };
                        }
                    }
                }
                createDebug.logIndex++;

                self.logIndex = createDebug.logIndex;
                self.sessionStorage.dbIndex = self.logIndex;
            }

            // apply env-specific formatting (colors, etc.)
            if (debug.enabled){
                createDebug.logFormatters(args, debug)
            }
        }

        debug.namespace = namespace;
        debug.enabled = createDebug.enabled(namespace);
        debug.useColors = createDebug.useColors();
        debug.color = selectColor(namespace);
        debug.bgColor = selectBGColor(namespace);
        debug.destroy = destroy;

        // env-specific initialization logic for debug instances
        if ('function' === typeof createDebug.init) {
            createDebug.init(debug);
        }

        createDebug.instances.push(debug);

        return debug;
    }

    /**
     * Log formatted output, add color, etc.
     * @param args
     * @param debug
     */
    function logFormatters(args, debug) {
        var self = debug;
        var index = 0;

        args[0] = args[0].replace(/%[a-zA-Z%]/g,function(match, format) {
            // if we encounter an escaped % then don't increase the array index
            if (match === '%%') return match;
            index++;
            var formatter = createDebug.formatters[format];
            if ('function' === typeof formatter) {
                var val = args[index];
                match = formatter.call(self, val);

                // now we need to remove `args[index]` since it's inlined in the `format`
                args.splice(index, 1);
                index--;
            }
            return match;
        });

        // apply env-specific formatting (colors, etc.)
        createDebug.formatArgs.call(self, args);

        var logFn = self.log || createDebug.log;
        logFn.apply(self, args);
    }
    createDebug.logFormatters = logFormatters;

    /***
     * 本地会话存储
     */
    function sessionStorageSave() {
        env.sessionStorage.dbName = 'waveLogs'

        // var tabID = (env.sessionStorage.tabID && env.sessionStorage.closedLastTab !== '2') ? env.sessionStorage.tabID : (env.sessionStorage.tabID = new Date().getTime());
        var tabID = (env.sessionStorage.tabID && env.sessionStorage.closedLastTab !== '2') ? env.sessionStorage.tabID : (env.sessionStorage.tabID = 'waveLogs');
        env.sessionStorage.closedLastTab = '2';
        self.onunload = self.onbeforeunload = function() {
            env.sessionStorage.closedLastTab = '1';
        };

        if (!env.sessionStorage.dbName || !env.sessionStorage.dbName.match(tabID)) {
            console.log("Create dbName !!!!!!!!!!!!!!!!!!!!!!!!!!!!", tabID);
            // env.sessionStorage.dbName = "TS_" + tabID
            env.sessionStorage.dbName = tabID
            env.sessionStorage.dbIndex = "0"
        }

        if (!env.sessionStorage.dbIndex) {
            createDebug.logIndex = 0;
        } else {
            createDebug.logIndex = env.sessionStorage.dbIndex;
        }
        self.logIndex = createDebug.logIndex;
    }

    /**
     * Clear expired database， 有效期为 5 天
     */
    function clearExpiredDatabase () {
        setTimeout(function () {
            console.log('clear expired database')
            createDebug.deleteDatabases(7)
        }, 3*1000)
    }

    /**
   * Enable LocalLog
   *
   * @api public
   */
    function enableLocalLog() {
        createDebug.saveLocalLogState(true);
        createDebug.localLogState = true;
    }

    /**
     * Disable LocalLog.
     *
     * @api public
     */

    function disableLocalLog() {
        createDebug.saveLocalLogState(false);
        createDebug.localLogState = false;
    }

    /**
     * Returns true if the LocalLog is enabled, false otherwise.
     *
     * @return {Boolean}
     * @api public
     */

    function enabledLocalLog() {
        return createDebug.localLogState;
    }

    /**
     * Get the local log
     *
     * @param dbName
     * @param day
     * @param {String} filter  {String} dbName (null means current
     *        DB) {function} callback(logs)
     * @param callback
     * @return {Array} logs self.logs =
     *         self.logs.filter(function(x){return (x !==
     *         (undefined || null || ''));});
     * @api public
     */

    function getLocalLogs(callback, dbName, day, moduleName, logLevel) {
        day = parseInt(day) || 0
        moduleName = moduleName || '*'
        logLevel = logLevel || '*'
        var localLogs = [];
        var skips = [];
        var names = [];
        var db;

        if(createDebug.localLogState && createDebug.logBuffer && createDebug.logBuffer.length){
            console.warn("Save unsaved logs before export")
            var exportLog = {}
            exportLog.info = window.debug('debug:INFO')
            exportLog.info('saveBeforeExport')
        }else if(createDebug.logBuffer){
            console.warn("createDebug.logBuffer: ", createDebug.logBuffer.length)
        }

        if (dbName && dbName !== createDebug.sessionStorage.dbName) {
            db = new self.DBmanager(dbName, "localLogs", createDebug.dbVersion, ["cseqNumber", "moduleName", "logLevel", "TS", "content"]);
        } else {
            db = createDebug.localLogsDB;
        }
        db.openDB();

        function handleFilter (filter){
            if (filter !== '*') {
                //Process filter
                var i = 0;
                var split = (typeof filter === 'string' ? filter : '').split(/[\s,]+/);
                var len = split.length;

                for (i = 0; i < len; i++) {
                    if (!split[i]) continue; // ignore empty strings
                    filter = split[i].replace(/\*/g, '.*?');
                    if (filter[0] === '-') {
                        skips.push(new RegExp('^' + filter.substr(1) + '$'));
                    } else {
                        names.push(new RegExp('^' + filter + '$'));
                    }
                }
            }
        }
        handleFilter(moduleName)
        handleFilter(logLevel)

        console.log('open db ' + db.dbName)
        var request = self.indexedDB.open(db.dbName);
        request.onsuccess = function (e) {
            console.log('open db success')
            try {
                let transaction = db.currentDB.transaction(db.storeName, 'readwrite');
                let store = transaction.objectStore(db.storeName);
                let logStorageFormatTime = null
                let dayTimeStamp = 1000 * 60 * 60 * 24 * day;
                let lowerIndex = 0; // 索引范围起始值
                let upperIndex = 0; // 索引范围结束值
                let totalCount = 0; // 数据总条数
                let lastDataId = 0; // 最后一条数据id
                let index = 0
                // The maximum message size in bytes. Attempting to receive a message of this
                // size or bigger results in a channel error.
                // [chrome]static constexpr size_t kMaximumMessageSize = 128 * 1024 * 1024;
                // [firefox]static constexpr size_t kMaximumMessageSize = 256 * 1024 * 1024;
                let kMaximumMessageSize = 150000;   // 限制单次获取的数量
                let maxNumberOfLogsExported = 300000 // 日志导出支持的最大数量
                function searchItems(lower, upper) {
                    console.log('searchItems lower: ' + lower + ', upper: ' + upper)
                    let range;
                    if (lower && upper) {
                        range = IDBKeyRange.bound(lower, upper)
                    } else if (lower) {
                        range = IDBKeyRange.upperBound(upper)
                    } else if(upper){
                        range = IDBKeyRange.lowerBound(lower)
                    }

                    let getAllRequest = range ? store.getAll(range) : store.getAll()
                    getAllRequest.onsuccess = function (event){
                        for(let i = 0; i<getAllRequest.result.length; i++){
                            let log = getAllRequest.result[i]
                            let namespace = log.moduleName + ':' + log.logLevel + ': '
                            let logTime = new Date(parseInt(log.TS));
                            logTime = beautyDate(logTime);
                            if(!logStorageFormatTime){
                                logStorageFormatTime = logTime  // 导出日志文件命名时使用
                            }

                            let diffValue = new Date().getTime() - log.TS; //时间差
                            if(!dayTimeStamp || (dayTimeStamp && diffValue <= dayTimeStamp)){
                                if(log.moduleName !== moduleName && log.logLevel !== logLevel){
                                    localLogs[index] = '[' + index + ']' + '[' + logTime + '] ' + namespace + log.content + "\r\n";
                                    index++
                                }
                            }
                        }

                        if(upperIndex < lastDataId){
                            lowerIndex = upperIndex + 1
                            upperIndex = upperIndex + 1 + kMaximumMessageSize
                            searchItems(lowerIndex, upperIndex)
                        }else {
                            let et = Date.now()
                            let allTime = (et - st)
                            console.log('localLogs length: ', localLogs.length)
                            console.warn("getAll request data process time: ", allTime/1000 , "(s)")
                            callback && callback(localLogs, logStorageFormatTime, db);
                        }
                    }
                    getAllRequest.onerror = function (event){
                        console.error('getAll request error', event)
                    }
                }

                let st = Date.now()
                let countRequest = store.count()
                countRequest.onsuccess = function(){
                    totalCount = countRequest.result
                    console.info("count: ", totalCount)

                    let cursorRequest = store.openCursor()
                    cursorRequest.onsuccess = function (ev) {
                        console.log('openCursor success')
                        let cursor = cursorRequest.result || ev.target.result;
                        if(!!cursor === false){
                            callback && callback(null, null, db, null)
                            return
                        }

                        lastDataId = totalCount + cursor.value.id - 1
                        if(totalCount > maxNumberOfLogsExported){
                            console.log('Log exceeds limit')
                            lowerIndex = (lastDataId - maxNumberOfLogsExported) + 1   // TODO: 日志超出限制时，取最新的N条日志
                        }else {
                            lowerIndex = cursor.value.id
                        }

                        if(totalCount > kMaximumMessageSize){
                            upperIndex = lowerIndex + kMaximumMessageSize
                            searchItems(lowerIndex, upperIndex)
                        }else {
                            upperIndex = lastDataId
                            searchItems(lowerIndex, upperIndex)
                        }
                    };

                    cursorRequest.onerror = function (event){
                        callback && callback(null, null, db, event.target.error)
                        console.error('objectStore openCursor error: ', event)
                    }

                    cursorRequest.onabort = function(event) {
                        callback && callback(null, null, db, event.target.error)
                        console.error('objectStore openCursor aborted', event)
                    }
                }
                countRequest.onerror = function (event){
                    callback && callback(null, null, db, event.target.error)
                    console.error('objectStore count error: ', event)
                }
            }catch (e){
                console.warn('open db error: ', e.message)
                callback && callback(null, null, db, e.message)
            }
        }

        request.onerror = function (e) {
            callback && callback(null, null, db, e.currentTarget.error.message)
            console.warn(e.currentTarget.error.message);
        }.bind(this);
    }

    /**
     * Get all Database name list
     * @api public
     */

    function getAllDatabaseNameList(callback) {
        var localDBs = [];
        var dbName = createDebug.dataBaseListDB ? createDebug.dataBaseListDB.dbName : 'DatabaseLists'
        var storeName = createDebug.dataBaseListDB ? createDebug.dataBaseListDB.storeName : "keyvaluepairs"
        var request = self.indexedDB.open(dbName);
        var db
        request.onsuccess = function (e) {
            db = request.result;
            var transaction = db.transaction(storeName, 'readwrite');
            var objectStore = transaction.objectStore(storeName);
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    localDBs.push(cursor.value);
                    cursor.continue();
                } else {
                    console.log('no more data!');
                    callback(localDBs);
                }
            };
            objectStore.openCursor().onerror = function (error) {
                console.error(error)
            }
        }.bind(this);

        request.onerror = function (e) {
            console.log(e.currentTarget.error.message);
        }.bind(this);
    }

    /**
     * Update the sipID and confSEQ in dbInformation in database
     * "DatabaseList" .
     * info should be { sipID: XXX, confSEQ: xxx, userName: aaa,
     * email: bbb }
     *
     */
    function updateConfInfo(confInfo) {
        try {
            var store = createDebug.dataBaseListDB.getStoreByName(createDebug.sessionStorage.dbName);
            if(store) {
                var index = store.index("dbName");
                var request = index.get(createDebug.sessionStorage.dbName);
                var infoJson;

                request.onsuccess = function(e) {
                    if (request.result) {
                        if (request.result != null && request.result !== "[object Object]") { //Todo: figure out why info is [object Object], when dbName is not exisit.
                            infoJson = request.result;
                            infoJson.data.confID = createDebug.sessionStorage.confID;
                        } else {
                            infoJson = {
                                TS: [(new Date()).getTime()],
                                dbName: createDebug.sessionStorage.dbName,
                                data: {
                                    confID: createDebug.sessionStorage.confID,
                                    userName: self.localStorage.userName,
                                    email: self.localStorage.email
                                }
                            };
                        }

                        if (confInfo.sipID) {
                            if (!infoJson.sipID) {
                                infoJson.data.sipID = [];
                            }
                            infoJson.data.sipID.push(confInfo.sipID);
                        }

                        if (confInfo.confSEQ) {
                            if (!infoJson.data.confSEQ) {
                                infoJson.data.confSEQ = [];
                            }
                            infoJson.data.confSEQ.push(confInfo.confSEQ);
                        }

                        if (confInfo.userName) {
                            infoJson.data.userName = confInfo.userName;
                        }

                        if (confInfo.email) {
                            infoJson.data.email = confInfo.email;
                        }

                        if (confInfo.confTitle) {
                            infoJson.data.confTitle = confInfo.confTitle;
                        }

                        createDebug.dataBaseListDB.update(infoJson);
                        createDebug.createdDBList = true;
                    }
                };
            }
        } catch (e) {}
    }

    /**
     * Flush buffer into DB
     *将缓冲区刷新到database里
     */
    function flushLogBuffer() {
        try {
            if (createDebug.logBuffer.length > 0) {
                createDebug.logBuffer.push( createDebug.logBuffer);
                createDebug.logBuffer = [ ];
            }

        } catch (e) {}
    }
    createDebug.flushLogBuffer = flushLogBuffer;

    /**
     * 删除数据库
     * @param day(天) 删除的时间节点，如day = 2，表示删除2天之前的数据库。
     * 默认保存7天内数据，超过7天自动删除
     */
    function deleteDatabases(day) {
        if(day !== 0){
            day = day || 7
        }
        let dateTimeStamp = 1000 * 60 * 60 * 24 * day
        let nowTimeStamp = new Date().getTime()
        let deleteDatabase = []

        createDebug.getAllDatabaseNameList(function (databaseList) {
            if(databaseList.length > 0){
                for(let i = databaseList.length - 1; i>=0; i--){
                    let dbName = databaseList[i].dbName
                    let TS = databaseList[i].TS[databaseList[i].TS.length - 1]
                    if(nowTimeStamp - TS >= dateTimeStamp){
                        deleteDatabase.push(dbName)
                        let DBDeleteRequest = indexedDB.deleteDatabase(dbName);
                        DBDeleteRequest.onerror = function(error) {
                            console.log("deleted[" + dbName +"]error");
                        };

                        DBDeleteRequest.onsuccess = function(e) {
                            console.log("deleted[" + dbName +"]success");
                            console.log(e.result); // should be undefined
                            deleteDatabase.push(dbName)
                        };
                    }
                }
            }

            // 清除database对应数据
            let databaseListsRequest = indexedDB.open("DatabaseLists");
            databaseListsRequest.onsuccess = (ev) => {
                let db = ev.target.result;
                let storeName = db.objectStoreNames[0]
                let transaction = db.transaction([storeName], 'readwrite');
                let objectStore = transaction.objectStore(storeName);
                if(deleteDatabase && deleteDatabase.length){
                    objectStore.openCursor().onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            if(deleteDatabase.includes(cursor.value.dbName)){
                                let request = objectStore.delete(cursor.key)
                                request.onsuccess = function (event) {
                                    // delete success
                                    console.log('delete success')
                                };
                            }
                            cursor.continue();
                        } else {
                            console.log('没有更多数据了！');
                        }
                    };
                }
            }
        })
    }

    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */

    function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
    }

    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = ".";
        var seperator2 = "_";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
        return currentdate;
    }

    /**
     * bytes自适应转换到KB,MB,GB
     * @param fileSize
     * @returns {string}
     */
    function formatFileSize(fileSize) {
        if (fileSize < 1024) {
            return fileSize + ' B';
        } else if (fileSize < (1024*1024)) {
            let temp = fileSize / 1024;
            temp = temp.toFixed(2);
            return temp + ' KB';
        } else if (fileSize < (1024*1024*1024)) {
            let temp = fileSize / (1024*1024);
            temp = temp.toFixed(2);
            return temp + ' MB';
        } else {
            let temp = fileSize / (1024*1024*1024);
            temp = temp.toFixed(2);
            return temp + ' GB';
        }
    }

    /**
     * Export the local log
     * 导出日志文件
     * @param exportCallback 日志导出回调
     * @param feedback 问题反馈
     * @param day 要导出的日志时间
     * @param dbName 要导出的数据库名称
     * @param logLevel: 过滤条件。* 表示不过滤
     * @param moduleName: 过滤条件。* 表示不过滤
     */

    function exportLog(exportCallback, feedback, dbName, day, logLevel, moduleName) {
        if(dbName){
            console.log('export ' + dbName + ' log')
        }

        day = parseInt(day) || this.DAY_2_KEEP_LOGS
        moduleName = moduleName || '*'
        logLevel = logLevel || '*'
        createDebug.getLocalLogs(
           function(logs, time, localLogsDB, error) {
                if(logs) {
                    try {
                        console.log('get logs success, prepase download...')
                        let log_file = new Blob(logs, { type: 'text/plain' })
                        console.warn('get logs file size: ', formatFileSize(log_file.size))
                        let hostName = window.location.hostname ? window.location.hostname : localStorage.hostName
                        let formatDate = getNowFormatDate()
                        let fileName = 'GSLog-' + hostName + '-' + formatDate
                        let zip = new JSZip();
                        zip.file(fileName +  '.log', log_file);

                        // 针对wave 桌面版：获取electron日志
                        if (window.ipcRenderer) {
                            if(window.fsExtra){
                                console.log('get core log, start')
                                const electronLogs = window.fsExtra.readFileSync(localStorage.getItem('electronLogPath'), 'utf8')
                                console.log('get core log, end')
                                let electronFile = new Blob([electronLogs], { type: 'text/plain' })
                                let electronFileName = 'core-' +  hostName + '-' + formatDate + '.log'
                                zip.file(electronFileName, electronFile);
                            }else {
                                console.warn('window.fsExtra API not support!')
                            }
                        }

                        console.warn('Start compression');
                        let zipST = Date.now()
                        zip.generateAsync({
                            type: 'blob',
                            compression: "DEFLATE", // STORE：默认不压缩；DEFLATE：需要压缩
                            compressionOptions: { level: 1 } // 压缩等级1~9 1压缩速度最快，9最优压缩方式
                        }).then(function(content) {
                            console.warn('Compression finished and download started')
                            let zipET = Date.now()
                            let allTime = (zipET - zipST)
                            console.warn("file ZIP process time: ", allTime/1000 , "(s)")

                            if(!feedback){
                                let eleLink = document.createElement('a');
                                eleLink.download = fileName +  '.zip';
                                eleLink.href = URL.createObjectURL(content);
                                eleLink.click();
                                console.warn(fileName + ' download complete')
                                exportCallback && exportCallback({ status: 'success'})
                            }else {
                                exportCallback && exportCallback({ status: 'success', data: content})
                            }

                            if(localLogsDB && localLogsDB.deleteItems){
                                localLogsDB.deleteItems(localLogsDB.DAY_2_KEEP_LOGS)
                            }else {
                                console.warn("no db found! ", localLogsDB)
                            }
                        }).catch(function (e) {
                            console.error('File compression failed: ', e)
                            exportCallback && exportCallback({ status: 'failed', error: e})
                        });
                    } catch (e){
                        console.error('Compressed file exception: ', e)
                        exportCallback && exportCallback({ status: 'failed', error: e})
                    }
                }else {
                    console.error('export logs failed: ', error)
                    exportCallback && exportCallback({ status: 'failed', error: error})
                }
           }, dbName, day, moduleName, logLevel);
    }

    createDebug.enable(createDebug.load());

    createDebug.localLogState = createDebug.loadLocalLogState() !== "false" ;

    return createDebug;
}

},{"sprintf-js":2}],4:[function(require,module,exports){
/**
 * This is the web browser implementation of `debug()`.   这是`debug()`的Web浏览器实现。
 */
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();
exports.log = log;
exports.saveLocalLogState = saveLocalLogState;
exports.loadLocalLogState = loadLocalLogState;
exports.sessionStorage = sessionStorage;
/*-------------------------------------------*/

exports.colors = [
    '#295288'
   //'#46A7C9'
    ];

/**
 * Background Colors
 */
exports.bgColors = [
  'inherit', //DEBUG
  'inherit', //LOG
  '#46A7C9', //INFO
  '#D08005;font-size:14px', //WARN
  '#F64863;font-size:16px', //ERROR
  '#F64863;font-size:18px'  //FATAL
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof self !== 'undefined' && self.process && self.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/trident\/(\d+)/)) {
      return false;
  }

  // Rzhang: Edge supports colors since 16215
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/edge\/(\d+)/)
      && (parseInt(navigator.userAgent.toLowerCase().match(/edge\/\d+.(\d+)/)[1]) < 16215)) {
      return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof self !== 'undefined' && self.console && (self.console.firebug || (self.console.exception && self.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ');
    //+ '+' + module.exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: ' + this.bgColor)

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  if (this.bgColor !== debug.bgColors[4]) {
    return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
  } else {
    return 'object' === typeof console
           && console.error
           && Function.prototype.apply.call(console.error, console, arguments);

  }
}

/**
 * Save `namespaces`.
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  //if (!r && typeof process !== 'undefined' && 'env' in process) {
  //  r = process.env.DEBUG;
  //}

  if ( !r ) {
      //Set default namespaces
      r = '*:INFO,*:WARN,*:ERROR';
  }

  return r;
}

/**
 * Save LocalLog enable state.
 * @param {Bool} state
 * @api private
 */
function saveLocalLogState(state) {
  try {
    if (null == state || state != false) {
      exports.storage.setItem('localLog', true);
    } else {
      exports.storage.setItem('localLog', false);
    }
  } catch (e) {
  }
}

/**
 * Load `localLog` setting.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function loadLocalLogState() {
  var r = true;
  try {
      r = exports.storage.localLog;
  } catch (e) {
  }

  // If debug isn't set in LS
  if (!r ) {
    r = true;
  }

  return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return self.localStorage;
  } catch (e) {}
}

module.exports = require('./common')(exports);

var formatters = module.exports.formatters;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};

},{"./common":3}]},{},[4])(4)
});
