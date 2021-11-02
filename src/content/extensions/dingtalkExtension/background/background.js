/***************************************（一）gsApi创建、注册、呼叫****************************************************/
let grpClick2Talk = {
	isLogin: false,
	gsApi: null,
	loginData: {},
	sid: '',
	getLineStatusInterval: null,
}

/**
 * 检查是否已授权访问grp host连接
 */
function permissionCheck(serverURL){
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
				sendMessageToContentScript({
					requestType:'GRPClick2talk',
					cmd:'setAccounts',
					num_accounts: modelDefines.num_accounts
				}, function(response) {
					console.log('get response for content: ', response);
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
		password: loginData.password
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
						if(event.status === 200 && response.response === 'success'){
							grpClick2Talk.sid = response.body.sid
							console.log('login success, get sid value: ' + grpClick2Talk.sid)
							grpClick2Talk.isLogin = true

							// todo: 获取当前话机配置的账号个数
							getModelDefinesInfo()
						}else {
							console.error('login failed: \r\n', event.response)
							console.error(response.body)
							alert('login failed!!!')
						}
					}else {
						console.info("login return response: ", event)
					}
				}
			}catch (e){
				console.error(e)
				debugger
			}
		}
	})
}

/**
 * 呼叫指定号码
 * @param data
 */
function makeCall(data){
	if(!data){
		console.info('Invalid phoneNumber parameter to set for make call')
		return
	}
	if(!grpClick2Talk.isLogin){
		alert('please login first!!!')
		return
	}
	console.info("make call data: \r\n" + JSON.stringify(data, null, '    '))
	grpClick2Talk.gsApi.makeCall({
		account: data.account || grpClick2Talk.loginData.account,
		phonenumber: data.phonenumber,
		password: grpClick2Talk.loginData.password,
		onreturn: function (evt){
			if (evt.readyState === 4) {
				// todo: 200 不代表呼叫成功，只标示cgi请求的成功与否
				console.info("make call return status code : " + evt.status)
				grpClick2Talk.remotenumber = data.phonenumber
				monitorLineStatus()
			}
		}
	})
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
		grpClick2Talk.gsApi.getLineStatus({
			onreturn: function (event){
				if(event.readyState === 4){
					if(event.response){
						let response = JSON.parse(event.response)
						if(event.status === 200 && response.response === 'success'){
							if(response.body && response.body.length){
								for(let i = 0; i<response.body.length; i++){
									let lineStatus = response.body[i]
									console.info("line " + lineStatus.line + " state is ", lineStatus.state)
									if(lineStatus.remotenumber === grpClick2Talk.remotenumber){
										switch (lineStatus.state){
											case 'calling':
												// 正在振铃
												break
											case 'connected':
												// 通话已接通
												break
											default:
												// idle/hold/unhold等
												break
										}
									}
								}
							}
						}
					}else {
						console.info('getLineStatus error: ', event)
					}
				}
			}
		})

		if(count > 10){
			console.log('auto clear interval')
			clearStatusInterval()
		}
	}, 1000)
}

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
function setLoginData(data){
	console.log('set login data: \r\n' + JSON.stringify(data, null, '    '))
	if(!data){
		console.info('Invalid parameter to set for login')
		return
	}

	if(!grpClick2Talk.loginData){
		grpClick2Talk.loginData = {}
	}
	Object.keys(data).forEach(function (key){
		if(key === 'account' || key === 'url' || key === 'password' || key === 'username'){
			grpClick2Talk.loginData[key] = data[key]
		}
	})

	if(grpClick2Talk.loginData.account === undefined){
		grpClick2Talk.loginData.account = -1
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

	let isLoginDataChange = false
	let isServerChange = false
	Object.keys(data).forEach(function (key){
		if(key === 'account' || key === 'url' || key === 'password' || key === 'username'){
			if(data[key] !== grpClick2Talk.loginData[key] && (key !== 'account')){
				console.info("login data change")
				isLoginDataChange = true
				if(key === 'url'){
					isServerChange = true
				}
			}
			grpClick2Talk.loginData[key] = data[key]
		}
	})

	if(isLoginDataChange){
		if(isServerChange){ // todo: url 改变时重新检查权限
			console.info("Recheck permissions: " + grpClick2Talk.loginData.url)
			permissionCheck(grpClick2Talk.loginData.url)
		}else {
			console.log('re-login..')
			accountLogin()
		}
	}
}

/*****************************************************************************************************/

/**************************（二）Content-script 和 backgroundJS 间的通信处理*******************************/
/**
 * Chrome插件中有2种通信方式，
 * 一个是短连接（chrome.tabs.sendMessage和chrome.runtime.sendMessage），
 * 一个是长连接（chrome.tabs.connect和chrome.runtime.connect）
 */

/**
 * 接收
 * 短连接: 接收content-script的消息
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(request && request.requestType === 'GRPClick2talk'){
		switch (request.cmd){
			case "login":
				console.log('receive login data: \r\n' + JSON.stringify(request.data, null, '   '))
				if(request.data && request.data.url){
					/* http:// to https:// */
					let url = request.data.url
					if(url.substr(0,7).toLowerCase() === "http://" || url.substr(0,8).toLowerCase() === "https://"){
						request.data.url = url.replace(/http:\/\//, 'https://');
					}else{
						request.data.url = "https://" + url;
					}

					setLoginData(request.data)
					permissionCheck(request.data.url)
				}else {
					alert('server url is request for login!!!')
				}
				break
			case "updateCallConfig":
				updateCallCfg(request.data)
				break
			case "makeCall":
				console.info("request.data:", request.data)
				makeCall(request.data)
				break
			default:
				break
		}

		// send response
		sendResponse({cmd: "GRPClick2talk", status: "OK"});
	}
});


/**
 * 发送 【目前测试没有生效】
 * background.js 向 content 主动发送消息
 * @param message
 * @param callback
 */
function sendMessageToContentScript(message, callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
			if(callback){
				callback(response)
			}
		});
	});
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
	/**
	 * change request header
	 */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
			let requestHeaders = details.requestHeaders

			// TODO: Modify only the request with the specified header field
			let requestURL = grpClick2Talk.loginData?.url
			if(details && details.url && requestURL && details.url.match(requestURL)){
				let accessControl = false
				requestHeaders = details.requestHeaders.map(item => {
					if (item.name === 'Origin') {
						item.value = grpClick2Talk.loginData?.url
						accessControl = true
					}else if(item.name === 'Cookie'){  // cookies add sid
						let sidValue = localStorage.sid
						if(sidValue){
							if(item.value.indexOf('sid=') >= 0){
								let lines = item.value.split(';')
								for(let i = 0; i<lines.length; i++){
									if(lines[i].indexOf('sid=') >= 0){
										let keyValue = lines[i].split('=')
										if(!keyValue[1]){ // sid 为空
											keyValue[1] = sidValue
											lines[i] = keyValue.join('=')
											break
										}
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
					requestHeaders.push({name: 'Origin', value: grpClick2Talk.loginData?.url})
					console.info("add origin header :", grpClick2Talk.loginData?.url)
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
			if(details && details.url && requestURL && details.url.match(requestURL)){
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

