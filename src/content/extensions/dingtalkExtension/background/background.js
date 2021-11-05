/***************************************（一）gsApi创建、注册、呼叫****************************************************/
let grpClick2Talk = {
	isLogin: false,
	gsApi: null,
	loginData: {
		selectedAccount: -1,
		availableAccounts: 0,
		password: "",
		url: "",
		username: ""
	},
	sid: '',
	getLineStatusInterval: null,
	latestLangInfo: ''
}

/**
 * 检查是否已授权访问grp host连接
 */
function permissionCheck(serverURL){
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
			console.info('api-will_login request success')
			accountLogin()
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
			alert("您已拒绝授权")
		}
	};
	httpRequest.send()
}

function getModelDefinesInfo(){
	let xmlHttp = new XMLHttpRequest()
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
			let modelDefines = JSON.parse(xmlHttp.responseText).defines
			if(modelDefines && modelDefines.num_accounts){
				console.info("当前支持的账号数量：", modelDefines.num_accounts)
				grpClick2Talk.loginData.availableAccounts = modelDefines.num_accounts
				localStorage.setItem('XNewestData', JSON.stringify(grpClick2Talk.loginData, null, '   '))

				sendMessageToContentScript({
					cmd:'setAvailableAccountList',
					availableAccounts: modelDefines.num_accounts
				});
			}else {
				console.info("get modelDefines:", modelDefines)
			}
		}
	}
	let requestURL = grpClick2Talk.loginData?.url + '/json/configs/model.define.js'
	xmlHttp.open("GET", requestURL, true)
	xmlHttp.send(null)
}

/**
 * 登录
 */
function accountLogin(){
	let loginData = grpClick2Talk.loginData
	if(!loginData){
		console.info("Invalid parameter for login")
		return
	}

	let config = {
		url: loginData.url,
		username: loginData.username,
		password: loginData.password,
		// requestHeader: {
		// 	'X-Request-Server-Type': 'X-GRP',
		// }
	}
	console.info('login data: \r\n' + JSON.stringify(config, null, '   '))
	if (GsUtils.isNUllOrEmpty(grpClick2Talk.gsApi)) {
		grpClick2Talk.gsApi = new GsApi(config)
	}else {
		console.log('update gsApi config')
		grpClick2Talk.gsApi.updateCfg(config)
	}

	grpClick2Talk.isLogin = false
	grpClick2Talk.gsApi.login({
		onreturn: function (event){
			try{
				if (event.readyState === 4) {
					if(event.response){
						let response = JSON.parse(event.response)
						console.info('login response: \r\n' + JSON.stringify(response, null, '    '))
						if(event.status === 200 && response.response === 'success'){
							grpClick2Talk.sid = response.body.sid
							grpClick2Talk.isLogin = true

							getModelDefinesInfo()  // TODO: 获取当前话机配置的账号个数
						}

						// 【消息提示】 通知页面当前登录状态。或是可以考虑仅background保存，点开popup页面后显示？？？
						sendMessageToContentScript({cmd: 'loginStatus', response: response});
					}else {
						console.info("login return response: ", event)
					}
				}
			}catch (e){
				console.info(e)
			}
		}
	})
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
	if(!grpClick2Talk.isLogin){
		alert('please login first!!!')
		sendMessageToContentScript({cmd:'showConfig'});
		return
	}

	let callCallBack = function (event){
		if (event.readyState === 4) {
			// 200 不代表呼叫成功，只标示cgi请求的成功与否。实际状态需要实时获取线路状态才能知道
			console.info("make call return status code : " + event.status)
			if(event.status === 200){
				grpClick2Talk.remotenumber = data.phonenumber
				monitorLineStatus()
			}else {
				let error = 'call error ' + event.status
				alert(error)
			}
		}
	}

	let callData = {
		account: grpClick2Talk.loginData.selectedAccount,
		phonenumber: data.phonenumber,
		password: grpClick2Talk.loginData.password,
		onreturn: callCallBack
	}
	console.info("gsApi make call data: \r\n" + JSON.stringify(callData, null, '    '))
	grpClick2Talk.gsApi.makeCall(callData)
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
		},
	    {
			acct: 1,
			active: 0,
			conf: 0,
			line: 2,
			remotename: "",
			remotenumber: "",
			state: "idle",
		}
	 ]
 * @type {number}
 */
function monitorLineStatus(){
	// clear first
	clearStatusInterval()

	let count = 0
	grpClick2Talk.getLineStatusInterval = setInterval(function (){
		count++
		if(count > 5){
			console.log('auto clear interval')
			clearStatusInterval()
			return
		}

		grpClick2Talk.gsApi.getLineStatus({
			onreturn: function (event){
				if(event.readyState === 4){
					if(event.response){
						let response = JSON.parse(event.response)
						if(event.status === 200 && response.response === 'success'){
							if(response.body && response.body.length){
								for(let i = 0; i<response.body.length; i++){
									let lineStatus = response.body[i]
									console.info("line " + lineStatus.line + " acct " + lineStatus.acct + " to " + lineStatus.remotenumber + " ", lineStatus.state)
								}
							}
						}
					}else {
						console.info('getLineStatus error: ', event)
					}
				}
			}
		})
	}, 1000)
}

/**
 * 清除获取线路状态的定时器
 */
function clearStatusInterval(){
	if(grpClick2Talk.getLineStatusInterval){
		clearInterval(grpClick2Talk.getLineStatusInterval)
		grpClick2Talk.getLineStatusInterval = null
	}
}

/**
 * 设置登录信息
 * @param data
 */
function updateLoginData(data){
	console.log('set login data: \r\n' + JSON.stringify(data, null, '    '))
	if(!data){
		console.info('Invalid parameter to set for login')
		return
	}

	Object.keys(data).forEach(function (key){
		if(key === 'url'){
			grpClick2Talk.loginData[key] = checkUrlFormat(data[key])
		}else {
			grpClick2Talk.loginData[key] = data[key]
		}
	})


	// TODO: 保存配置信息到localStorage
	let copyLoginData = objectDeepClone(grpClick2Talk.loginData)
	localStorage.setItem('XNewestData', JSON.stringify(copyLoginData, null, '   '))
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
	let currentLoginData = grpClick2Talk.loginData
	if(data.url && data.url !== currentLoginData.url){
		isServerChange = true
	}else if(data.username && data.username !== currentLoginData.username){
		isLoginDataChange = true
	}else if(data.password && data.password !== currentLoginData.password){
		isLoginDataChange = true
	}

	// updateConfig first
	updateLoginData(data)   // 注意仅账号更改时，这里就很重要

	if(isServerChange){
		console.info("Recheck permission of : " + data.url)
		permissionCheck(data.url)
	}else if(isLoginDataChange){
		console.log('username or password had change..')
		accountLogin()
	}
}

/**************************（二）Content-script 和 backgroundJS 间的通信处理*******************************/
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
 * 处理来自content-script的消息
 * @param request
 */
function chromeRuntimeOnMessage(request){
	switch (request.cmd){
		case "contentScriptAutoLogin":
			// 需要区分不同的产品，否则会相互影响
			if(request.DTLatestLangInfo){
				grpClick2Talk.DTLatestLangInfo = request.DTLatestLangInfo
				localStorage.setItem('DTLatestLangInfo', grpClick2Talk.DTLatestLangInfo)
				console.info('set dingTalk latest langInfo', grpClick2Talk.DTLatestLangInfo)
			}
			sendMessageToContentScript({cmd:'updateConfig', data: grpClick2Talk.loginData});


			let loginDatas = grpClick2Talk.loginData
			if(loginDatas && loginDatas.url && loginDatas.username && loginDatas.password){
				console.info('check permission before auto login')
				permissionCheck(loginDatas.url)
			}
			break
		case "contentScriptAccountChange":
		case "contentScriptUpdateLoginInfo":
			updateCallCfg(request.data)
			break
		case "contentScriptMakeCall":
			console.info("request.data:", request.data)
			extMakeCall(request.data)
			break
		case 'contentScriptPageClose':
			// 页面刷新或关闭的时候，如果处于登录状态，清除login定时器
			if(grpClick2Talk && grpClick2Talk.isLogin && grpClick2Talk.gsApi && grpClick2Talk.gsApi.stopKeepAlive){
				console.log('clear keep alive interval')
				grpClick2Talk.gsApi.stopKeepAlive()
			}
			break
		default:
			break
	}
}

/**************************（三）backgroundJS 监听 popup 传递来的消息*******************************/
/**
 *  使用长连接 - 监听 popup 传递来的消息
 */
chrome.extension.onConnect.addListener(port => {
	console.log('连接中------------')
	port.onMessage.addListener(request => {
		if(request && request.requestType === 'popupMessage2Background'){
			chromeExtensionOnMessage(request)
		}

		port.postMessage('popup，我收到了你的信息~')
	})
})

/**
 * 获取所有 tab
 */
function chromeExtensionOnMessage(request) {
	if(!request){
		return
	}

	switch (request.cmd){
		case "popupOnOpen":
			// popup 页面打开
			/* 获取popup页面元素的方式 */
			const views = chrome.extension.getViews({type: 'popup'})
			for (let view of views) {
				console.log('insert element to popup')
				let popupContent = view.document.getElementById('popupContent')
				if(popupContent){
					showConfig(view)
					sendMessageToContentScript({cmd:'popupOpen'});
				}
			}
			break
		case "popupAccountChange":
		case 'popupUpdateLoginInfo':
			// 登录或更新登录信息
			updateCallCfg(request.data)
			// 同步更新content-script中的设置
			sendMessageToContentScript({cmd:'updateConfig', data: request.data});
			break
		case "popupMakeCall":
			console.info("request.data:", request.data)
			extMakeCall(request.data)
			break
		default:
			break
	}
}

/**
 * 在popup 弹框中显示配置
 * @param view
 */
function showConfig(view){
	if(!view){
		return
	}

	let insertParent = view.document.getElementById('popupContent')
	// 根据当前语言设置界面显示【这里还未处理完全】
	let langInfo = grpClick2Talk.latestLangInfo
	let configTips = {
		title: langInfo === 'en_US' ? 'Click to Dial' : '点击拨打',
		loginInnerText: langInfo === 'en_US' ? 'Login/Save' : '登录/保存',
		callInnerText: langInfo === 'en_US' ? 'Call' : '呼叫'
	}

	// 处理账号下拉框列表
	let selectAccount = parseInt(grpClick2Talk.loginData?.selectedAccount)
	let selectOptions
	if(selectAccount >= 0){
		selectOptions = '<option value=' + selectAccount +' selected>Account ' + (selectAccount+1) + '</option><option value="-1">First Available</option>'
	}else {
		selectOptions = '<option value="-1">First Available</option>'
	}
	for(let i = 0; i<grpClick2Talk.loginData.availableAccounts; i++){
		selectOptions = selectOptions + '<option value=' + i +'>Account ' + (i+1) + '</option>'
	}

	let configDiv = document.createElement('div')
	configDiv.id = 'grpCallConfig'
	configDiv.innerHTML = `<div id="configHead">🎃` + configTips.title + `</div>
	<div id="xMessageTip"></div>
	<table id="xConfigTable">
        <tbody>
            <tr>
                <td class="xLabelTip"><label>Address</label></td>
                <td><input type="text" id="x-serverAddress"  value=` + grpClick2Talk.loginData?.url + `></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Username</label></td>
                <td><input type="text" id="x-userName"  value=` + grpClick2Talk.loginData?.username + ` ></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Password</label></td>
                <td><input type="text" id="x-password" value=` + grpClick2Talk.loginData?.password + ` ></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Accounts</label></td>
                <td>
			        <select name="" id="x-account">` + selectOptions + `</select>
			    </td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td>
                    <button id="submitConfig">
                    ` + configTips.loginInnerText + `
                    </button></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Dial Number</label></td>
                <td><input type="text" id="x-phoneNumber" value="359301" placeholder="359301"></td>
                <td>
                    <button id="x-makeCall">
                     ` + configTips.callInnerText + `
                    </button>
                </td>
            </tr>
        </tbody>
    </table>`
	insertParent.appendChild(configDiv);
}

/***************************************（三）修改GRP请求头和响应*******************************************/

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
			if(details && details.url && requestURL && details.url.match(requestURL) && details.initiator.indexOf('chrome-extension') >= 0){
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
				if(details.url.match('api-make_call')){
					if(!requestHeaders.find(function (header){return (header.name === 'Origin')})){
						requestHeaders.push({name: 'Origin', value: requestURL})
						console.info(' add Origin: ', requestURL)

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
						console.log('add cookies header: ', cookie)
					}
				}
			}

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
			if(details && details.url && requestURL && details.url.match(requestURL) && details.initiator.indexOf('chrome-extension') >= 0){
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

/*****************************************************************************************************/
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
