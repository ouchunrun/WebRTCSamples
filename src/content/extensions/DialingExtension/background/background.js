/***************************************（一）gsApi创建、注册、呼叫****************************************************/
let XPopupPort
let grpClick2Talk = {
	isLogin: false,
	permissionCheckRefuse: false,
	gsApi: null,
	loginData: {
		selectedAccountId: 0,  // default
		accountLists: [],
		password: "",
		url: "",
		username: ""
	},
	sid: '',
	latestLangInfo: '',
	call401Authentication: false,
	getLineStatusInterval: null,
	getPhoneStatusInterval: null,
	waitingCall: false,
	getLineIntervalTime: 1000,
	getPhoneIntervalTime: 5*1000,
}

function createGsApiOrUpdateConfig(){
	let loginData = grpClick2Talk.loginData
	if(!loginData || !loginData.url || !loginData.username || !loginData.password){
		console.info("Invalid parameter for login")
		return
	}

	let config = {
		url: loginData.url,
		username: loginData.username,
		password: loginData.password,
		onerror: onErrorCatchHandler
	}
	if (!grpClick2Talk.gsApi) {
		console.info('create new gsApi')
		grpClick2Talk.gsApi = new GsApi(config)
	}else {
		console.log('update gsApi config')
		grpClick2Talk.gsApi.updateCfg(config)
	}
}

/**
 * 错误处理
 * @param event
 */
function onErrorCatchHandler(event){
	console.log('** An error occurred during the transaction, readyState,'+ event.target.readyState +' status ', event.target.status);

	if(grpClick2Talk.loginData && grpClick2Talk.loginData.url){
		console.log('error occurred, check permission!')
		permissionCheck(grpClick2Talk.loginData.url, function (){
			console.log("success!!!!!!!!!!")
		})
	}else {
		console.log('url empty.')
	}
}

/**
 * 检查是否已授权访问grp host连接
 */
function permissionCheck(serverURL, actionCallback){
	if(!serverURL){
		return
	}
	serverURL = checkUrlFormat(serverURL)

	let httpRequest = new XMLHttpRequest();
	let requestRUL= serverURL + '/cgi-bin/api-will_login'
	httpRequest.open('POST', requestRUL, true);
	httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
	httpRequest.timeout = 3000;
	httpRequest.ontimeout = function (e) {
		console.info('Timeout: no response to request version within 3 seconds!')
	};
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === 4 && httpRequest.status === 200) {
			console.info('connection authorized already.')
			grpClick2Talk.permissionCheckRefuse = false
			actionCallback && actionCallback()
		}
	}
	httpRequest.onerror = function (event) {
		console.info("An error occurred during the transaction\r\n", event);
		if (confirm('请点 "确定"按钮 访问' + serverURL + '链接以授权') === true){
			sendMessageToContentScript({
				cmd:'pageReload'
			});
			window.open(serverURL, '_blank');
		}else{
			console.log('permission check refuse')
			grpClick2Talk.permissionCheckRefuse = true
		}
	};
	httpRequest.send()
}

/**
 * 登录
 */
function accountLogin(){
	if(!grpClick2Talk.gsApi){
		createGsApiOrUpdateConfig()

		setTimeout(function (){
			grpClick2Talk.isLogin = false
			grpClick2Talk.gsApi.login({
				onreturn: loginCallback,
				onerror: onErrorCatchHandler
			})
		}, 1000)
	}else {
		grpClick2Talk.isLogin = false
		grpClick2Talk.gsApi.login({
			onreturn: loginCallback,
			onerror: onErrorCatchHandler
		})
	}
}

function loginCallback(event){
	if (event.readyState === 4) {
		if(event.response){
			let response = JSON.parse(event.response)
			console.info('login response:' + response.response)
			if(event.status === 200 && response.response === 'success'){
				grpClick2Talk.sid = response.body.sid
				grpClick2Talk.isLogin = true

				if(XPopupPort){
					sendMessage2Popup({
						cmd: 'updateLoginStatus',
						grpClick2TalObj: grpClick2Talk,
						data: {className: 'grey', add: false, message: response.response}
					})

					// 获取当前话机配置的账号列表及账号是否注册等状态
					getAccounts()
					// 获取线路的状态
					showLineStatus()
					// 获取设备当前登录状态
					getPhoneStatus()
				}

				if(grpClick2Talk.call401Authentication || grpClick2Talk.waitingCall){
					if(grpClick2Talk.waitingCall){
						grpClick2Talk.waitingCall = false
					}else {
						console.log('Call 401, re-authentication success')
					}
					extMakeCall({phonenumber: grpClick2Talk.remotenumber})
				}
			}else if(XPopupPort){
				sendMessage2Popup({
					cmd: 'updateLoginStatus',
					grpClick2TalObj: grpClick2Talk,
					data: {className: 'grey', add: true, message: response.response}
				})
			}

			// 【消息提示】 通知页面当前登录状态。
			if(!XPopupPort){
				sendMessageToContentScript({cmd: 'loginStatus', response: response});
			}
		}else {
			console.info("login return response: ", event)
			if(grpClick2Talk.call401Authentication){
				console.info('call failed')
				grpClick2Talk.call401Authentication = false
			}
		}
	}
}

/**
 * 呼叫指定号码
 * @param data
 */
function extMakeCall(data){
	if(!data){
		console.info('Invalid phoneNumber parameter to set for make call')
		return
	}

	grpClick2Talk.remotenumber = data.phonenumber
	if(!grpClick2Talk.gsApi){
		grpClick2Talk.waitingCall = true
		automaticLoginCheck(true) 	// login first
		return
	}

	let callCallBack = function (event){
		if (event.readyState === 4) {
			// 200 不代表呼叫成功，只标示cgi请求的成功与否。实际状态需要实时获取线路状态才能知道
			console.info("make call return status code : " + event.status)
			if(event.status === 200){
				if(grpClick2Talk.call401Authentication){
					grpClick2Talk.call401Authentication = false
				}

				let response = JSON.parse(event.response)
				let tipMessage = '呼叫失败，请确保设备已解锁并有可用账号且开启点击拨打功能'
				if(response && response.response === 'error'){
					if(XPopupPort){
						/* Invalid Request case:1. 未开启拨打功能  2. 号码为空 3. 找不到可用账号进行呼叫 4. 键盘被锁*/
						if(response.body !== 'Invalid Request'){
							tipMessage = 'call error ' + (response.body || '')
						}
						sendMessage2Popup({
							cmd: 'updateLoginStatus',
							grpClick2TalObj: grpClick2Talk,
							data: {message: tipMessage}
						})
					}else {
						confirm(tipMessage)
					}
				}
			}else if(event.status === 401 && !grpClick2Talk.call401Authentication){
				// 其他地方登录导致sid变化，需要重新登录
				console.info('Authentication information is invalid, login again')
				grpClick2Talk.call401Authentication = true
				accountLogin()
			} else {
				if(grpClick2Talk.call401Authentication){
					grpClick2Talk.call401Authentication = false
				}
			}
		}
	}

	let permissionCheckCallback = function (){
		// 每次呼叫前检查click to dial功能是否开启
		clickToDialFeatureCheck(function (enable){
			console.log('click to dial feature enable ', enable)
			if(enable !== false){
				let accountId = parseInt(grpClick2Talk.loginData.selectedAccountId)
				let callData = {
					account: accountId -1,
					phonenumber: data.phonenumber,
					password: grpClick2Talk.loginData.password,
					onreturn: callCallBack,
					onerror: onErrorCatchHandler
				}
				console.info("gsApi call phone number " + callData.phonenumber)
				grpClick2Talk.gsApi.makeCall(callData)
			}else {
				// 已开启或请求失败（失败时无法正常判断当前是否开启了click to dial功能，按正常呼叫处理，呼叫失败后再做提示）
			}
		})
	}

	// 呼叫前先检查连接是否授权
	permissionCheck(grpClick2Talk.loginData.url, permissionCheckCallback)
}


/**
 * 检查是否开启了 Click-To-Dial Feature 功能
 * @param actionCallback
 */
function clickToDialFeatureCheck(actionCallback){
	if(!grpClick2Talk.gsApi){
		return
	}

	let configGetCallBack = function (ev){
		if (ev.readyState === 4){
			if(ev.status === 200 && ev.response !== 'error'){
				let configs = JSON.parse(ev.response).configs
				if(configs && configs.length && configs[0].pvalue === '1561'){
					console.log('Click-To-Dial Feature enable: ', configs[0].value)
					if(configs[0].value === '1'){
						actionCallback && actionCallback(true)  // 功能已经开启
					}else {
						console.info('Click-To-Dial Feature is not enabled')
						if (confirm('检测到您未开启点击拨打功能，无法正常拨号，是否开启？') === true){
							apiConfigUpdate({callback: actionCallback})
						}else{
							confirm('您已拒绝开启点击拨打功能，无法正常拨号')
						}
					}
				}
			}else {
				console.log('config get response:', ev.response)
				actionCallback && actionCallback(ev.response)
			}
		}
	}

	grpClick2Talk.gsApi.configGet({
		pvalues: '1561',
		onreturn: configGetCallBack,
		onerror: onErrorCatchHandler
	})
}

/**
 * 更新配置
 * @param data
 */
function apiConfigUpdate(data){
	if(!data || !grpClick2Talk.gsApi){
		return
	}
	let actionCallback = data.callback
	let configUpdateCallBack = function (event){
		if (event.readyState === 4){
			if(event.status === 200){
				let response = JSON.parse(event.response)
				if(response && response.body && response.body.status === 'right'){
					console.info('config update success')
					actionCallback && actionCallback(true)
				}else {
					console.info('config update failed: ', response.body.status)
					actionCallback && actionCallback(false)
				}
			}else {
				console.log('config update failed, code: ', event.status)
				actionCallback && actionCallback(false)
			}
		}
	}


	grpClick2Talk.gsApi.configUpdate({
		body: {alias: {}, pvalue: {'1561': "1"},},
		onreturn: configUpdateCallBack,
		onerror: onErrorCatchHandler
	})
}

/**
 * 获取激活的账号列表
 */
function getAccounts(){
	if(!grpClick2Talk.loginData || !grpClick2Talk.loginData.url){
		return
	}

	let xmlHttp = new XMLHttpRequest()
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState === 4){
			if(xmlHttp.status === 200){
				let text = JSON.parse(xmlHttp.responseText)
				if(text.response === "success"){
					if(text.body.length){
						grpClick2Talk.loginData.accountLists = text.body
						sendMessage2Popup({cmd: 'updateAccountLists', accountLists: text.body})

						sendMessageToContentScript({cmd:'setAccountLists', accountLists: text.body});
					}else {
						console.info('account []')
					}
				}
			}else /*if(xmlHttp.status === 401)*/{
				console.info('get account unauthorized')
				sendMessage2Popup({
					cmd: 'updateLoginStatus',
					grpClick2TalObj: grpClick2Talk,
					data: {className: 'grey', add: true, message: 'login unauthorized'}
				})
			}
		}
	}
	let requestURL = grpClick2Talk.loginData?.url + '/cgi-bin/api-get_accounts'
	xmlHttp.open("GET", requestURL, true)
	xmlHttp.send()
}

/**
 * 登录成功后 定时获取设备当前登录状态
 * {
        "response": "success",
        "body": "available",
        // available 登录成功且有账号注册
        // unavailable 登录成功 但账号未注册
        // ringing 话机振铃中
        // busy 话机通话忙碌中
        // unauthorized 登录鉴权失败
        "misc": "1",
        // 1 允许idle call
        // 0 不允许idle call
        "session_expiring": true // 登录有效期超时
    }
 */
function getPhoneStatus(){
	if(!grpClick2Talk.gsApi){
		return
	}
	clearPhoneStatusInterval()

	let getPhoneStatusCallback = function (event){
		if (event.readyState === 4 && event.response){
			let data = JSON.parse(event.response)
			if(data && data.body === 'unauthorized'){  // 登录鉴权失败
				console.log('login authentication failed')
				grpClick2Talk.isLogin = false
				// 鉴权过期，或抢占下线
				clearPhoneStatusInterval()
				// 修改登录状态
				sendMessage2Popup({
					cmd: 'updateLoginStatus',
					grpClick2TalObj: grpClick2Talk,
					data: {className: 'grey', add: true, message: 'login unauthorized'}
				})
			}
		}
	}

	grpClick2Talk.getPhoneStatusInterval = setInterval(function (){
		grpClick2Talk.gsApi.getPhoneStatus({
			onreturn: getPhoneStatusCallback,
			onerror: onErrorCatchHandler
		})
		// 检查设备状态时重新获取账号列表
		getAccounts()
	}, grpClick2Talk.getPhoneIntervalTime)
}

/**
 * getLineStatus 返回数据
 * {
        response: "success",
        body:  [{
			acct: 1,              // 账号id
			active: 0,            // 是否当前线路激活
			conf: 0,              // 是否在会议中
			line: 1,              // 线路id
			remotename: "",       // 远端display name
			remotenumber: "3593", // 远端号码
			state: "connected",   // 线路状态
		}]
 * @type {number}
 */
function showLineStatus(){
	if(!grpClick2Talk.gsApi){
		return
	}
	// clear first
	clearLineStatusInterval()

	let lineStatusCallback = function (event){
		if(event.readyState === 4){
			if(event.status === 200){
				let response = JSON.parse(event.response)
				if(response.body && response.body.length){
					sendMessage2Popup({cmd: 'setLineStatus', lines: response.body})
				}
			}else{
				grpClick2Talk.isLogin = false
				// 鉴权过期
				clearLineStatusInterval()
				// 修改登录状态
				sendMessage2Popup({
					cmd: 'updateLoginStatus',
					grpClick2TalObj: grpClick2Talk,
					data: {className: 'grey', add: true, message: 'login unauthorized'}
				})
			}
		}
	}

	grpClick2Talk.getLineStatusInterval = setInterval(function (){
		grpClick2Talk.gsApi.getLineStatus({
			onreturn: lineStatusCallback,
			onerror: onErrorCatchHandler
		})
	}, grpClick2Talk.getLineIntervalTime)
}

/**
 * 清除获取线路状态的定时器
 */
function clearLineStatusInterval(){
	if(grpClick2Talk.getLineStatusInterval){
		clearInterval(grpClick2Talk.getLineStatusInterval)
		grpClick2Talk.getLineStatusInterval = null
	}
}

/**
 * 清除获取设备当前登录状态的定时器
 */
function clearPhoneStatusInterval(){
	// clear first
	if(grpClick2Talk.getPhoneStatusInterval){
		clearInterval(grpClick2Talk.getPhoneStatusInterval)
		grpClick2Talk.getPhoneStatusInterval = null
	}
}

function clearApiKeepAliveInterval(){
	if(grpClick2Talk.gsApi && grpClick2Talk.gsApi.stopKeepAlive){
		grpClick2Talk.gsApi.stopKeepAlive({
			onerror: onErrorCatchHandler
		})
	}
}

/**
 * 更新登录信息
 * @param data
 */
function updateCallCfg(data){
	console.log('update call data: \r\n' + JSON.stringify(data, null, '    '))
	if(!data){
		console.info('Invalid parameter to set update')
		return
	}
	let isServerChange = false
	let isLoginDataChange = false
	/* update save config and check info change or not */
	Object.keys(data).forEach(function (key){
		if(key === 'url'){
			data[key] = checkUrlFormat(data[key])
			if(data[key] !== grpClick2Talk.loginData.url){
				isServerChange = true
			}
		}else if((key === 'username' || key === 'password') && data[key] !== grpClick2Talk.loginData[key]){
			isLoginDataChange = true
		}
		grpClick2Talk.loginData[key] = data[key]
	})
	/* 保存配置信息到localStorage */
	let copyLoginData = objectDeepClone(grpClick2Talk.loginData)
	localStorage.setItem('XNewestData', JSON.stringify(copyLoginData, null, '   '))
	// update gsApi config
	createGsApiOrUpdateConfig()

	if(isServerChange){
		console.info("Recheck permission of : " + data.url)
		permissionCheck(data.url, accountLogin)
	}else if(isLoginDataChange || !grpClick2Talk.isLogin){
		console.log('username/password change or logout..')
		accountLogin()
	}
}

/*******************************************************************************************************************/
/***************************************（二）Content-script 和 backgroundJS 间的通信处理*******************************/
/**
 * Chrome插件中有2种通信方式，
 * 一个是短连接（chrome.tabs.sendMessage和chrome.runtime.sendMessage），
 * 一个是长连接（chrome.tabs.connect和chrome.runtime.connect）
 */

/**
 * 发送
 * background.js 向 content 主动发送消息
 * @param message
 * @param callback
 */
function sendMessageToContentScript(message, callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if(tabs && tabs.length){
			message.requestType = 'backgroundMessage2ContentScript'
			chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
				if (!window.chrome.runtime.lastError) {
					// message processing code goes here
					if(callback){
						callback(response)
					}
				} else {
					// error handling code goes here
				}
			});
		}
	});
}

/**
 * 接收
 * 短连接: 接收content-script的消息
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(request && request.requestType === 'contentMessage2Background'){
		chromeRuntimeOnMessage(request)
		// send response
		sendResponse({cmd: "backgroundMessage2ContentScript", status: "OK"});
	}
});

/**
 * Http 转换为Https
 * @param url
 * @returns {string}
 */
function checkUrlFormat(url){
	if(url.substr(0,7).toLowerCase() === "http://" || url.substr(0,8).toLowerCase() === "https://"){
		url = url.replace(/http:\/\//, 'https://');
	}else{
		url = "https://" + url;
	}
	return url
}

/**
 * 符合条件时自动登录
 */
function automaticLoginCheck(showAlert){
	let loginDatas = grpClick2Talk.loginData
	if(loginDatas && loginDatas.url && loginDatas.username && loginDatas.password){
		console.info('check permission before auto login')
		permissionCheck(loginDatas.url, accountLogin)
	}else if(showAlert){
		grpClick2Talk.waitingCall = false
		alert('请点击左上角配置页面进行登录')
	}
}

/**
 * 处理来自content-script的消息
 * @param request
 */
function chromeRuntimeOnMessage(request){
	switch (request.cmd){
		case "contentScriptAccountChange":
		case "contentScriptUpdateLoginInfo":
			if(request.data && request.data.url){
				request.data.url = checkUrlFormat(request.data.url)
			}
			updateCallCfg(request.data)
			break
		case "contentScriptMakeCall":
			console.info(" call phonenumber:", request.data.phonenumber)
			extMakeCall(request.data)
			break
		default:
			break
	}
}

/*******************************************************************************************************************/
/**********************************************（三）backgroundJS 监听 popup 传递来的消息*******************************/
/**
 *  使用长连接 - 监听 popup 传递来的消息
 */
chrome.extension.onConnect.addListener(port => {
	XPopupPort = port

	port.onMessage.addListener(request => {
		if(request && request.requestType === 'popupMessage2Background'){
			recvPopupMessage(request, port)
		}
	})

	port.onDisconnect.addListener(function (){
		console.log('onDisconnect, clear interval')
		XPopupPort = null

		// 清除获取线路状态的定时器
		clearLineStatusInterval()
		// 清除获取设备状态的定时器
		clearPhoneStatusInterval()
		// 清除gs API保活定时器
		clearApiKeepAliveInterval()
	})
})

/**
 * 给popup发送消息
 * @param data
 */
function sendMessage2Popup(data){
	if(XPopupPort){
		XPopupPort.postMessage(data)
	}
}

/**
 * 收到popup发送的消息
 */
function recvPopupMessage(request, port) {
	if(!request){
		return
	}

	switch (request.cmd){
		case "popupOnOpen":
			// popup 页面打开
			// 返回当前的配置信息
			console.log('islogin ', grpClick2Talk.isLogin)
			createGsApiOrUpdateConfig()
			port.postMessage({cmd: 'popupShowConfig', grpClick2TalObj: grpClick2Talk})
			// 关闭content-script的配置窗口
			// sendMessageToContentScript({cmd:'popupOpen'});

			if(!grpClick2Talk.isLogin){
				if(grpClick2Talk.permissionCheckRefuse){
					console.log('[EXT] already refuse permission check, do not auto login when popup open')
					return;
				}

				// server/username/password字段都有时，popup打开时自动登录
				automaticLoginCheck()
			}else {
				// 获取线路的状态
				showLineStatus()
				// 获取设备当前登录状态
				getPhoneStatus()
				// 已登录时，检查点击拨打功能是否开启
				// clickToDialFeatureCheck(function (enable){
				// 	console.log('click to dial feature enable ', enable)
				// })
			}
			break
		case "popupAccountChange":
		case 'popupUpdateLoginInfo':
			if(request.data && request.data.url){
				request.data.url = checkUrlFormat(request.data.url)
			}

			// 登录或更新登录信息
			updateCallCfg(request.data)
			// 同步更新content-script中的设置
			// sendMessageToContentScript({cmd:'updateConfig', data: request.data});
			break
		case "popupMakeCall":
			console.info("request.data:", request.data)
			extMakeCall(request.data)
			break
		case 'popupHangupLine':
			/**
			 * 话机部分通话相关操作接口
			 * extend/endcall/holdcall/unhold/acceptcall/rejectcall/cancel
			 * grpClick2Talk.gsApi.phoneOperation
			 */
			console.info('hangup line ', request.lineId)
			grpClick2Talk.gsApi.phoneOperation({
				arg: request.lineId,
				cmd: 'endcall',
				sid: grpClick2Talk.sid,
				onerror: onErrorCatchHandler
			})
			break
		default:
			break
	}
}

/*******************************************************************************************************************/
/***************************************************（三）修改GRP请求头和响应*******************************************/

/**
 * 判断时是否是GRP发起的请求
 * @param obj
 * @returns {boolean|boolean}
 */
function isGRPSendRequestHeaders(obj) {
	return (obj.name === 'X-Request-Server-Type' && obj.value === 'X-GRP');
}

/**
 * 判断是否是来自GRP的相应
 * @param obj
 * @returns {boolean|boolean}
 */
function isGRPSendResponseHeaders(obj) {
	return (obj.name === 'Server' && (obj.value.indexOf('GRP') >= 0));
}

/**
 * 修改请求头
 */
window.onload = function (){
	let XNewestData = localStorage.getItem('XNewestData')
	if(XNewestData){
		console.info('load storage save data')
		grpClick2Talk.loginData = JSON.parse(XNewestData)
	}

	/**
	 * change request header
	 */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
			let requestHeaders = details.requestHeaders

			// TODO: Modify only the request with the specified header field
			let requestURL = grpClick2Talk.loginData?.url
			// let isGRPRequestHeader = details.requestHeaders.find(isGRPSendRequestHeaders)
			// if(isGRPRequestHeader){}
			if(details && details.url && requestURL && details.url.match(requestURL) && details.initiator && details.initiator.indexOf('chrome-extension') >= 0){
				let accessControl = false
				requestHeaders = details.requestHeaders.map(item => {
					if (item.name === 'Origin') {
						item.value = grpClick2Talk.loginData?.url
						accessControl = true
					}else if(item.name === 'Cookie'){  // cookies add sid
						let sidValue = grpClick2Talk.sid
						if(sidValue){
							if(item.value.indexOf('sid=') >= 0){
								let lines = item.value.split(';')
								for(let i = 0; i<lines.length; i++){
									if(lines[i].indexOf('sid=') >= 0){
										let keyValue = lines[i].split('=')
										keyValue[1] = sidValue
										lines[i] = keyValue.join('=')
										break
									}
								}
								item.value = lines.join(';')
							}else {
								// no sid in cookie
								item.value = item.value + '; sid=' + sidValue
							}
						}
					}
					return item
				})
				if(!accessControl){
					requestHeaders.push({name: 'Origin', value: requestURL})
				}

				// TODO: NO origin/cookies header find in requestHeaders list
				// if(details.url.match('api-make_call') || details.url.match('api-get_line_status') || details.url.match('api-get_accounts')){
					if(!requestHeaders.find(function (header){return (header.name === 'Origin')})){
						requestHeaders.push({name: 'Origin', value: requestURL})
						// console.info(' add Origin: ', requestURL)

						if(!requestHeaders.find(function (header){return (header.name === 'Accept')})){
							requestHeaders.push({name: 'Accept', value: "*/*"})
						}
						if(!requestHeaders.find(function (header){return (header.name === 'Sec-Fetch-Site')})){
							requestHeaders.push({name: 'Sec-Fetch-Site', value: "none"})
						}
						if(!requestHeaders.find(function (header){return (header.name === 'Sec-Fetch-Mode')})){
							requestHeaders.push({name: 'Sec-Fetch-Mode', value: "cors"})
						}
						if(!requestHeaders.find(function (header){return (header.name === 'Sec-Fetch-Dest')})){
							requestHeaders.push({name: 'Sec-Fetch-Dest', value: "empty"})
						}
						if(!requestHeaders.find(function (header){return (header.name === 'Accept-Encoding')})){
							requestHeaders.push({name: 'Accept-Encoding', value: "gzip, deflate, br"})
						}
					}
					if(!requestHeaders.find(function (header){return (header.name === 'Cookie')})){
						let cookie = 'session-role=' + grpClick2Talk.loginData.username + '; session-identity=' + grpClick2Talk.sid + '; sid=' + grpClick2Talk.sid + ';'
						requestHeaders.push({name: 'Cookie', value: cookie})
						// console.log('add cookies header: ', cookie)
					}
				}
			// }

			return { requestHeaders };
		},
		{
			urls: ['<all_urls>']
		},
		["blocking", "requestHeaders", "extraHeaders"]
	);

	/**
	 * avoid Cross-Origin Read Blocking(CORB) in a chrome web extension
	 */
	chrome.webRequest.onHeadersReceived.addListener(details => {
			let responseHeaders = details.responseHeaders
			let requestURL = grpClick2Talk.loginData?.url
			// let isGRPResponseHeader = details.responseHeaders.find(isGRPSendResponseHeaders)
			// if(isGRPResponseHeader){}
			if(details && details.url && requestURL && details.url.match(requestURL) && details.initiator && details.initiator.indexOf('chrome-extension') >= 0){
				let accessControl = false
				responseHeaders = details.responseHeaders.map(item => {
					if (item.name.toLowerCase() === 'access-control-allow-origin') {
						item.value = '*'
						accessControl = true
					}
					return item
				})
				if(!accessControl){
					responseHeaders.push({name: 'access-control-allow-origin', value: '*'})
				}
			}

			return { responseHeaders };
		},
		{
			urls: ['<all_urls>']
		},
		['blocking', 'responseHeaders', 'extraHeaders']
	)
}

/*******************************************************************************************************************/
/***
 * Function that deep clone an object.
 * @param obj
 * @returns {*}
 */
function objectDeepClone(obj) {
	if (obj === null || typeof obj !== 'object') {
		return obj
	}

	let copy = function (data) {
		let copy = data.constructor()
		for (let attr in data) {
			if (data.hasOwnProperty(attr)) {
				copy[attr] = data[attr]
			}
		}
		return copy
	}

	if (typeof obj === 'object' && !Array.isArray(obj)) {
		try {
			return JSON.parse(JSON.stringify(obj))
		} catch (err) {
			return copy(obj)
		}
	}

	return copy(obj)
}
