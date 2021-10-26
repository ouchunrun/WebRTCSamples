let gsApi = null
let serverInput = document.getElementById('x-serverAddress')
let usernameInput = document.getElementById('x-userName')
let pwdInput = document.getElementById('x-password')
let accountSelect = document.getElementById('x-account')
let phoneNumberInput = document.getElementById('x-phoneNumber')
let submitBtn = document.getElementById("submitConfig")
let makeCallBtn = document.getElementById('x-makeCall')

/**
 * 登录
 */
function accountLogin(data){
	console.log('account login')
	let selectedIndex = accountSelect.selectedIndex
	let account = data?.account || accountSelect.options[selectedIndex].value
	let config = {
		url: data?.url || serverInput.value,
		username: data?.username || usernameInput.value,
		password: data?.password || pwdInput.value
	}
	if (GsUtils.isNUllOrEmpty(gsApi)) {
		gsApi = new GsApi(config)
	}else {
		console.log('update gsApi config')
		gsApi.updateCfg(config)
	}

	gsApi.login({
		onreturn: function (event){
			if (event.readyState === 4) {
				let response = JSON.parse(event.response)
				if(event.status === 200 && response.response === 'success'){
					console.warn("login success")
					gsApi.config.account = account || -1
					gsApi.sid = response.body.sid
					console.warn("gsApi.sid: ", gsApi.sid)
				}else {
					console.error('login failed: \r\n', event.response)
					alert(response.body)
				}
			}
		}
	})
}

/**
 * 呼叫指定号码
 */
function makeCall(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex].value
	let phoneNumber = phoneNumberInput.value
	if(!account || !phoneNumber){
		alert('account && phoneNumber is require')
		return
	}

	console.info('account ' + account +' make call to ' + phoneNumber)
	gsApi.makeCall({
		account: account,
		phonenumber: phoneNumber,
		password: gsApi.config.password,
		onreturn: function (evt){
			if (evt.readyState === 4) {
				if(evt.status === 200){
					console.log('call success')
					// chrome.notifications.create(null, {
					// 	type: "basic",
					// 	title: "Primary Title",
					// 	message: "Primary message to display",
					// 	iconUrl: "tx.jpg"
					// });
				}else {
					console.warn('call failed')
					alert('Error code: ' + evt.status)
				}
			}
		}
	})
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

/**
 * 设置使用的分机信息
 */
function updateCallConfig(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex].value
	let server = serverInput.value
	let username = usernameInput.value
	let pwd = pwdInput.value
	if(!server || !username || !pwd){
		alert('invalid parameters')
		return
	}

	let cnf = {
		url: server.trim(),
		username: username.trim(),
		password: pwd.trim(),
		account: account.trim()
	}

	if(gsApi.config.url !== cnf.url || gsApi.config.username !== cnf.username || gsApi.config.password !== cnf.password){
		console.info('update login info: \r\n', JSON.stringify(cnf, null, '   '))
		if(gsApi.config.url !== cnf.url){
			// todo: url 改变时重新检查权限
			permissionCheck(server, cnf)
		}else {
			accountLogin(cnf)
		}
	}
}


function updateUseAccount(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex].value
	gsApi.config.account = account
	console.log('update account config: ' + account)
}


window.onload = function () {
	// 事件绑定
	submitBtn.onclick = updateCallConfig;
	makeCallBtn.onclick = makeCall
	accountSelect.onchange = updateUseAccount

	/**
	 * change request header
	 */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
			let accessControl = false
			const requestHeaders = details.requestHeaders.map(item => {
				if (item.name === 'Origin') {
					item.value = serverInput.value
					accessControl = true
				}
				else if(item.name === 'Cookie'){
					let sidValue = gsApi?.sid || localStorage.sid
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
				requestHeaders.push({name: 'Origin', value: serverInput.value})
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
			let accessControl = false
			const responseHeaders = details.responseHeaders.map(item => {
				if (item.name.toLowerCase() === 'access-control-allow-origin') {
					item.value = '*'
					accessControl = true
				}
				return item
			})
			if(!accessControl){
				responseHeaders.push({name: 'access-control-allow-origin', value: '*'})
			}
			return { responseHeaders };
		},
		{
			urls: ['<all_urls>']
		},
		['blocking', 'responseHeaders', 'extraHeaders']
	)

	permissionCheck(serverInput.value)
}

window.addEventListener('message', function (event){
	console.log(event.data)
}, false)

