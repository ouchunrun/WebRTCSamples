/***************************************（一）gsApi创建、注册、呼叫****************************************************/
let grpClick2Talk = {
	gsApi: null,
	loginData: {},
	sid: '',
	getLineStatusInterval: null
}

function accountLogin(){
	let loginData = grpClick2Talk.loginData
	if(!loginData){
		console.warn("Invalid parameter for login")
		return
	}

	let config = {
		url: loginData.url,
		username: loginData.username,
		password: loginData.password
	}

	console.warn('login data: \r\n' + JSON.stringify(config, null, '   '))
	if (GsUtils.isNUllOrEmpty(grpClick2Talk.gsApi)) {
		grpClick2Talk.gsApi = new GsApi(config)
	}else {
		console.log('update gsApi config')
		grpClick2Talk.gsApi.updateCfg(config)
	}

	grpClick2Talk.gsApi.login({
		onreturn: function (event){
			if (event.readyState === 4) {
				let response = JSON.parse(event.response)
				if(event.status === 200 && response.response === 'success'){
					grpClick2Talk.sid = response.body.sid
					grpClick2Talk.gsApi.config.account = loginData?.account

					console.log('login success, get sid value: ' + grpClick2Talk.sid)
				}else {
					console.error('login failed: \r\n', event.response)
					console.error(response.body)
				}
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
		console.warn('Invalid phoneNumber parameter to set for make call')
		return
	}
	console.warn("make call data: \r\n" + JSON.stringify(data, null, '    '))
	grpClick2Talk.gsApi.makeCall({
		account: data.account || grpClick2Talk.loginData.account,
		phonenumber: data.phonenumber,
		password: grpClick2Talk.loginData.password,
		sid: grpClick2Talk.sid,
		onreturn: function (evt){
			if (evt.readyState === 4) {
				// todo: 200 不代表呼叫成功
				console.warn("makeCall return status code : " + evt.status)
			}
		}
	})

	if(grpClick2Talk.getLineStatusInterval){
		clearInterval(grpClick2Talk.getLineStatusInterval)
		grpClick2Talk.getLineStatusInterval = null
	}

	grpClick2Talk.getLineStatusInterval = setInterval(function (){
		grpClick2Talk.gsApi.getLineStatus({
			onreturn: function (event){
				if(event.readyState === 4){
					let response = JSON.parse(event.response)
					if(event.status === 200 && response.response === 'success'){
						if(response.body){
							console.warn('get line status: ', response.body)
						}
					}
				}
			}
		})
	}, 5000)
}

/**
 * 设置登录信息
 * @param data
 */
function setLoginData(data){
	console.log('set login data: \r\n' + JSON.stringify(data, null, '    '))
	if(!data){
		console.warn('Invalid parameter to set for login')
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

	if(!grpClick2Talk.loginData.account){
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
		console.warn('Invalid parameter to set update')
		return
	}

	let isLoginDataChange = false
	let isServerChange = false
	Object.keys(data).forEach(function (key){
		if(key === 'account' || key === 'url' || key === 'password' || key === 'username'){
			if(data[key] !== grpClick2Talk.loginData[key] && (key !== 'account')){
				console.warn("登录信息发生改变")
				isLoginDataChange = true
				if(key === 'url'){
					isServerChange = true
				}
			}
			grpClick2Talk.loginData[key] = data[key]
		}
	})

	if(isLoginDataChange){
		console.warn("登录信息改变，需要重新鉴权")
		if(isServerChange){
			// todo: url 改变时重新检查权限
			console.warn("改变时重新检查权限")
			permissionCheck(grpClick2Talk.loginData.url)
		}else {
			accountLogin()
		}
	}
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
		console.warn('Timeout: no response to request version within 3 seconds!')
	};
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === 4 && httpRequest.status === 200) {
			console.info('api-will_login request success')
			accountLogin()
		}
	}
	httpRequest.onerror = function (event) {
		console.warn("An error occurred during the transaction\r\n", event);
		if (confirm('请点 "确定"按钮 访问' + serverURL + '链接以授权') === true){
			window.open(serverURL, '_blank');
		}else{
			alert("您已拒绝授权")
		}
	};
	httpRequest.send()
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
				console.warn("request.data:", request.data)
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
sendMessageToContentScript({cmd:'GRPClick2talk', value:'你好，我是 backgroundJS~~'}, function(response) {
	console.log('来自content的回复：', response);
});


/*****************************************************************************************************/

/***************************************（三）修改GRP请求头和响应*******************************************/
/**
 * 判断时是否是GRP发起的请求
 * @param obj
 * @returns {boolean|boolean}
 */
function isGRPSendRequestHeaders(obj) {
	return (obj.name === 'Request-Server-type' && obj.value === 'X-GRP');
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
			let isGRPRequestHeader = details.requestHeaders.find(isGRPSendRequestHeaders)
			if(isGRPRequestHeader){
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
			let isGRPResponseHeader = details.responseHeaders.find(isGRPSendResponseHeaders)
			if(isGRPResponseHeader){
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

