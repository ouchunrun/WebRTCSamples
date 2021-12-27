/***************************************（一）gsApi创建、注册、呼叫****************************************************/
let grpDialingApi = {
	popupPort: '',
	isLogin: false,
	permissionCheckRefuse: false,
	gsApi: null,
	loginData: {
		selectedAccountId: 0,  // default
		accountLists: [],
		password: "",
		url: "",
		username: "",
		// ldapConfig
		emailAttributes: 'email',
		nameAttributes: 'CallerIDName'
	},
	sid: '',
	call401Authentication: false,
	getLineStatusInterval: null,
	getPhoneStatusInterval: null,
	waitingCall: false,
	getLineIntervalTime: 1000,
	getPhoneIntervalTime: 5*1000,
	xml2Json: new X2JS(),
	phoneBooks: {},
	phoneBookDB: new self.DBmanager('phoneBookDB', "phoneBook", null, ["phoneBookName", "TS"]),

	/**
	 * gsApi init
	 */
	createGsApiOrUpdateConfig: function (){
		let loginData = grpDialingApi.loginData
		if(!loginData || !loginData.url || !loginData.username || !loginData.password){
			console.info("Invalid parameter for login")
			return
		}

		let config = {
			url: loginData.url,
			username: loginData.username,
			password: loginData.password,
			onerror: grpDialingApi.onErrorCatchHandler
		}
		if (!grpDialingApi.gsApi) {
			console.info('create new gsApi')
			grpDialingApi.gsApi = new GsApi(config)
		}else {
			console.log('update gsApi config')
			grpDialingApi.gsApi.updateCfg(config)
		}
	},

	/**
	 * 错误处理
	 * @param event
	 */
	onErrorCatchHandler: function (event){
		console.log('** An error occurred during the transaction, readyState,'+ event.target.readyState +' status ', event.target.status);

		if(grpDialingApi.loginData && grpDialingApi.loginData.url){
			console.log('error occurred, check permission!')
			grpDialingApi.permissionCheck(grpDialingApi.loginData.url, function (){
				console.log("success!!!!!!!!!!")
			})
		}else {
			console.log('url empty.')
		}
	},

	/**
	 * 检查是否已授权访问grp host连接
	 */
	permissionCheck: function (serverURL, actionCallback){
		if(!serverURL){
			return
		}
		serverURL = grpDialingApi.checkUrlFormat(serverURL)

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
				grpDialingApi.permissionCheckRefuse = false
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
				grpDialingApi.permissionCheckRefuse = true
			}
		};
		httpRequest.send()
	},

	/**
	 * 登录
	 */
	accountLogin: function (){
		if(!grpDialingApi.gsApi){
			grpDialingApi.createGsApiOrUpdateConfig()

			setTimeout(function (){
				grpDialingApi.isLogin = false
				grpDialingApi.gsApi.login({
					onreturn: grpDialingApi.loginCallback,
					onerror: grpDialingApi.onErrorCatchHandler
				})
			}, 1000)
		}else {
			grpDialingApi.isLogin = false
			grpDialingApi.gsApi.login({
				onreturn: grpDialingApi.loginCallback,
				onerror: grpDialingApi.onErrorCatchHandler
			})
		}
	},

	loginCallback: function (event){
		if (event.readyState === 4) {
			if(event.response){
				let response = JSON.parse(event.response)
				console.info('login response:' + response.response)
				if(event.status === 200 && response.response === 'success'){
					grpDialingApi.sid = response.body.sid
					grpDialingApi.isLogin = true
					grpDialingApi.getExtendedContacts()

					if(grpDialingApi.popupPort){
						sendMessage2Popup({
							cmd: 'updateLoginStatus',
							grpClick2TalObj: grpDialingApi,
							data: {className: 'grey', add: false, message: response.response}
						})

						// 获取当前话机配置的账号列表及账号是否注册等状态
						grpDialingApi.getAccounts()
						// 获取线路的状态
						grpDialingApi.showLineStatus()
						// 获取设备当前登录状态
						grpDialingApi.getPhoneStatus()
					}

					if(grpDialingApi.call401Authentication || grpDialingApi.waitingCall){
						if(grpDialingApi.waitingCall){
							grpDialingApi.waitingCall = false
						}else {
							console.log('Call 401, re-authentication success')
						}
						grpDialingApi.extMakeCall({phonenumber: grpDialingApi.remotenumber})
					}
				}else if(grpDialingApi.popupPort){
					sendMessage2Popup({
						cmd: 'updateLoginStatus',
						grpClick2TalObj: grpDialingApi,
						data: {className: 'grey', add: true, message: response.response}
					})
				}

				// 【消息提示】 通知页面当前登录状态。
				if(!grpDialingApi.popupPort){
					sendMessageToContentScript({cmd: 'loginStatus', response: response});
				}
			}else {
				console.info("login return response: ", event)
				if(grpDialingApi.call401Authentication){
					console.info('call failed')
					grpDialingApi.call401Authentication = false
				}
			}
		}
	},

	/**
	 * 呼叫指定号码
	 * @param data
	 */
	extMakeCall: function (data){
		if(!data){
			console.info('Invalid phoneNumber parameter to set for make call')
			return
		}

		grpDialingApi.remotenumber = data.phonenumber
		if(!grpDialingApi.gsApi){
			grpDialingApi.waitingCall = true
			grpDialingApi.automaticLoginCheck(true) 	// login first
			return
		}

		let callCallBack = function (event){
			if (event.readyState === 4) {
				// 200 不代表呼叫成功，只标示cgi请求的成功与否。实际状态需要实时获取线路状态才能知道
				console.info("make call return status code : " + event.status)
				if(event.status === 200){
					if(grpDialingApi.call401Authentication){
						grpDialingApi.call401Authentication = false
					}

					let response = JSON.parse(event.response)
					let tipMessage = '呼叫失败，请确保设备已解锁并有可用账号且开启点击拨打功能'
					if(response && response.response === 'error'){
						if(grpDialingApi.popupPort){
							/* Invalid Request case:1. 未开启拨打功能  2. 号码为空 3. 找不到可用账号进行呼叫 4. 键盘被锁*/
							if(response.body !== 'Invalid Request'){
								tipMessage = 'call error ' + (response.body || '')
							}
							sendMessage2Popup({
								cmd: 'updateLoginStatus',
								grpClick2TalObj: grpDialingApi,
								data: {message: tipMessage}
							})
						}else {
							confirm(tipMessage)
						}
					}
				}else if(event.status === 401 && !grpDialingApi.call401Authentication){
					// 其他地方登录导致sid变化，需要重新登录
					console.info('Authentication information is invalid, login again')
					grpDialingApi.call401Authentication = true
					grpDialingApi.accountLogin()
				} else {
					if(grpDialingApi.call401Authentication){
						grpDialingApi.call401Authentication = false
					}
				}
			}
		}

		let permissionCheckCallback = function (){
			// 每次呼叫前检查click to dial功能是否开启
			grpDialingApi.clickToDialFeatureCheck(function (enable){
				console.log('click to dial feature enable ', enable)
				if(enable !== false){
					let accountId = parseInt(grpDialingApi.loginData.selectedAccountId)
					let callData = {
						account: accountId -1,
						phonenumber: data.phonenumber,
						password: grpDialingApi.loginData.password,
						onreturn: callCallBack,
						onerror: grpDialingApi.onErrorCatchHandler
					}
					console.info("gsApi call phone number " + callData.phonenumber)
					grpDialingApi.gsApi.makeCall(callData)
				}else {
					// 已开启或请求失败（失败时无法正常判断当前是否开启了click to dial功能，按正常呼叫处理，呼叫失败后再做提示）
				}
			})
		}

		// 呼叫前先检查连接是否授权
		grpDialingApi.permissionCheck(grpDialingApi.loginData.url, permissionCheckCallback)
	},

	/**
	 * 检查是否开启了 Click-To-Dial Feature 功能
	 * @param actionCallback
	 */
	clickToDialFeatureCheck: function (actionCallback){
		if(!grpDialingApi.gsApi){
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
								grpDialingApi.apiConfigUpdate({callback: actionCallback})
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

		grpDialingApi.gsApi.configGet({
			pvalues: '1561',
			onreturn: configGetCallBack,
			onerror: grpDialingApi.onErrorCatchHandler
		})
	},

	/**
	 * 更新配置
	 * @param data
	 */
	apiConfigUpdate: function (data){
		if(!data || !grpDialingApi.gsApi){
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

		grpDialingApi.gsApi.configUpdate({
			body: {alias: {}, pvalue: {'1561': "1"},},  // 开启点击拨打功能
			onreturn: configUpdateCallBack,
			onerror: grpDialingApi.onErrorCatchHandler
		})
	},

	/**
	 * 获取激活的账号列表
	 */
	getAccounts: function (){
		if(!grpDialingApi.loginData || !grpDialingApi.loginData.url){
			return
		}

		let xmlHttp = new XMLHttpRequest()
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState === 4){
				if(xmlHttp.status === 200){
					let text = JSON.parse(xmlHttp.responseText)
					if(text.response === "success"){
						if(text.body.length){
							grpDialingApi.loginData.accountLists = text.body
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
						grpClick2TalObj: grpDialingApi,
						data: {className: 'grey', add: true, message: 'login unauthorized'}
					})
				}
			}
		}
		let requestURL = grpDialingApi.loginData?.url + '/cgi-bin/api-get_accounts'
		xmlHttp.open("GET", requestURL, true)
		xmlHttp.send()
	},

	/**
	 * 获取设备当前登录状态
	 */
	getPhoneStatus: function (){
		if(!grpDialingApi.gsApi){
			return
		}
		grpDialingApi.clearPhoneStatusInterval()

		let getPhoneStatusCallback = function (event){
			if (event.readyState === 4 && event.response){
				let data = JSON.parse(event.response)
				if(data && data.body === 'unauthorized'){  // 登录鉴权失败
					console.log('login authentication failed')
					grpDialingApi.isLogin = false
					// 鉴权过期，或抢占下线
					grpDialingApi.clearPhoneStatusInterval()
					// 修改登录状态
					sendMessage2Popup({
						cmd: 'updateLoginStatus',
						grpClick2TalObj: grpDialingApi,
						data: {className: 'grey', add: true, message: 'login unauthorized'}
					})
				}
			}
		}

		grpDialingApi.getPhoneStatusInterval = setInterval(function (){
			grpDialingApi.gsApi.getPhoneStatus({
				onreturn: getPhoneStatusCallback,
				onerror: grpDialingApi.onErrorCatchHandler
			})
			// 检查设备状态时重新获取账号列表
			grpDialingApi.getAccounts()
		}, grpDialingApi.getPhoneIntervalTime)
	},

	/**
	 * 获取线路信息
	 */
	showLineStatus: function (){
		if(!grpDialingApi.gsApi){
			return
		}
		// clear first
		grpDialingApi.clearLineStatusInterval()

		let lineStatusCallback = function (event){
			if(event.readyState === 4){
				if(event.status === 200){
					let response = JSON.parse(event.response)
					if(response.body && response.body.length){
						sendMessage2Popup({cmd: 'setLineStatus', lines: response.body})
					}
				}else{
					grpDialingApi.isLogin = false
					// 鉴权过期
					grpDialingApi.clearLineStatusInterval()
					// 修改登录状态
					sendMessage2Popup({
						cmd: 'updateLoginStatus',
						grpClick2TalObj: grpDialingApi,
						data: {className: 'grey', add: true, message: 'login unauthorized'}
					})
				}
			}
		}

		grpDialingApi.getLineStatusInterval = setInterval(function (){
			grpDialingApi.gsApi.getLineStatus({
				onreturn: lineStatusCallback,
				onerror: grpDialingApi.onErrorCatchHandler
			})
		}, grpDialingApi.getLineIntervalTime)
	},

	/**
	 * 清除获取线路状态的定时器
	 */
	clearLineStatusInterval: function (){
		if(grpDialingApi.getLineStatusInterval){
			clearInterval(grpDialingApi.getLineStatusInterval)
			grpDialingApi.getLineStatusInterval = null
		}
	},

	/**
	 * 清除获取设备当前登录状态的定时器
	 */
	clearPhoneStatusInterval: function (){
		if(grpDialingApi.getPhoneStatusInterval){
			clearInterval(grpDialingApi.getPhoneStatusInterval)
			grpDialingApi.getPhoneStatusInterval = null
		}
	},

	/**
	 * 清除保活定时器
	 */
	clearApiKeepAliveInterval: function (){
		if(grpDialingApi.gsApi && grpDialingApi.gsApi.stopKeepAlive){
			grpDialingApi.gsApi.stopKeepAlive({
				onerror: grpDialingApi.onErrorCatchHandler
			})
		}
	},

	/**
	 * 更新登录信息
	 * @param data
	 */
	updateCallCfg: function (data){
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
				data[key] = grpDialingApi.checkUrlFormat(data[key])
				if(data[key] !== grpDialingApi.loginData.url){
					isServerChange = true
				}
			}else if((key === 'username' || key === 'password') && data[key] !== grpDialingApi.loginData[key]){
				isLoginDataChange = true
			}
			grpDialingApi.loginData[key] = data[key]
		})
		/* 保存配置信息到localStorage */
		let copyLoginData = grpDialingApi.objectDeepClone(grpDialingApi.loginData)
		localStorage.setItem('XNewestData', JSON.stringify(copyLoginData, null, '   '))
		// update gsApi config
		grpDialingApi.createGsApiOrUpdateConfig()

		if(isServerChange){
			console.info("Recheck permission of : " + data.url)
			grpDialingApi.permissionCheck(data.url, grpDialingApi.accountLogin)
		}else if(isLoginDataChange || !grpDialingApi.isLogin){
			console.log('username/password change or logout..')
			grpDialingApi.accountLogin()
		}
	},

	/**
	 * 符合条件时自动登录
	 */
	automaticLoginCheck: function (showAlert){
		let loginDatas = grpDialingApi.loginData
		if(loginDatas && loginDatas.url && loginDatas.username && loginDatas.password){
			console.info('check permission before auto login')
			grpDialingApi.permissionCheck(loginDatas.url, grpDialingApi.accountLogin)
		}else if(showAlert){
			grpDialingApi.waitingCall = false
			alert('请点击左上角配置页面进行登录')
		}
	},

	/**
	 * Http 转换为Https
	 * @param url
	 * @returns {string}
	 */
	checkUrlFormat: function (url){
		if(url.substr(0,7).toLowerCase() === "http://" || url.substr(0,8).toLowerCase() === "https://"){
			url = url.replace(/http:\/\//, 'https://');
		}else{
			url = "https://" + url;
		}
		return url
	},

	/***
	 * Function that deep clone an object.
	 * @param obj
	 * @returns {*}
	 */
	objectDeepClone: function (obj){
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
	},

	/**
	 * 2.获取GRP本地通讯录
	 *    本地通讯录根据IP区分保存： EG.localAddressBook_192.168.131.4
		  [{
		    FirstName: "aaa"
			Frequent: "0"
			LastName: "aaa"
			Phone: {phonenumber: '11111', accountindex: '0', _type: 'Work'}
			Primary: "0"
			id: "122700"
		  }]
	 */
	getLocalPhoneBook: function (){
		console.log('getLocalPhoneBook ', grpDialingApi.isLogin)
		if(!grpDialingApi.gsApi || !grpDialingApi.isLogin){
			return
		}

		// 2.获取GRP本地联系人(兼容GRP261X)
		console.log('获取GRP本地联系人(兼容GRP261X)')
		let phoneBookName = 'localAddressBook_' + grpDialingApi.loginData.url.split('//')[1]
		let getAddressBookCallback = function (event){
			if(event.readyState === 4){
				if(event.status === 200 && event.statusText === 'OK'){
					let responseData
					if(event.response && event.response.startsWith('<?xml')){
						console.log('GET LOCAL ADDRESS BOOK SUCCESS')
						responseData = grpDialingApi.xml2Json.xml_str2json(event.response)
						if(responseData && responseData.AddressBook && responseData.AddressBook.Contact && responseData.AddressBook.Contact.length){
							grpDialingApi.phoneBooks.localAddressBook = responseData.AddressBook.Contact
							grpDialingApi.phoneBookDB.setItems([{
								phoneBookName: phoneBookName,
								content: grpDialingApi.phoneBooks.localAddressBook,
								TS: (new Date()).getTime(),
							}]);

							sendMessageToContentScript({
								cmd:'phoneBookUpdate',
								data: {
									phoneBooks: grpDialingApi.phoneBooks,
									deviceId: grpDialingApi.loginData?.url
								}
							});
						}
					}
				}else {
					console.log('GET AddressBook FAILED, ', event.status)
				}
			}
		}

		grpDialingApi.gsApi.phonebookDownload({
			onreturn: getAddressBookCallback,
			onerror: function (event){
				console.log('errorCallback', event)
			}
		})
	},

	/**
	 * * 获取LDAP扩展联系人
	 * 1.杭州分公司通讯录
	    [{
	        dialAccount: 1,
			ou=hz,dc=pbx,dc=com: {AccountNumber: "3593", CallerIDName: "chrou", email: "chrou@grandstream.cn"}
	    }]
	 */
	getLdap: function (requestData){
		if(!grpDialingApi.gsApi || !grpDialingApi.isLogin){
			return
		}

		console.log('获取杭州分公司ldap 通讯录')
		let getLdapCallback = function (event){
			if(event.readyState === 4){
				if(event.status === 200 && event.statusText === 'OK'){
					let responseData
					console.log('GET LDAP SUCCESS')
					let ldapList = []
					responseData = JSON.parse(event.response)
					Object.keys(responseData).forEach(function (key){
						let accountList = responseData[key]
						if(accountList && accountList.length){   // 可能存在多个电话本
							ldapList = ldapList.concat(accountList)
						}
					})

					if(ldapList.length){
						grpDialingApi.phoneBooks.ldap = ldapList
						grpDialingApi.phoneBookDB.setItems([{
							phoneBookName: 'ldap',
							content: grpDialingApi.phoneBooks.ldap,
							TS: (new Date()).getTime(),
						}]);

						// 重新获取联系人后更新联系人列表
						sendMessageToContentScript({
							cmd:'phoneBookUpdate',
							data: {
								phoneBooks: grpDialingApi.phoneBooks,
								deviceId: grpDialingApi.loginData?.url
							}
						});
					}
				}else {
					console.log('GET LDAP FAILED, ', event.status)
				}
			}
		}

		let keys = ['emailAttributes', 'nameAttributes']
		let returnKey = ''
		Object.keys(grpDialingApi.loginData).forEach(function (key){
			if(keys.includes(key)){
				if(!returnKey){
					returnKey = grpDialingApi.loginData[key]
				}else {
					returnKey = returnKey + ',' + grpDialingApi.loginData[key]
				}
			}
		})
		console.log('returnKey：', returnKey)

		grpDialingApi.gsApi.ldapSearch({
			body: {
				ldapParam: {
					searchWord: requestData?.searchWord || "",
					searchKey: requestData?.searchKey || "",
					returnKey: returnKey || "email,AccountNumber,CallerIDName",
					returnLimit: requestData?.limit || 0
				}
			},
			contentType: 'application/json',
			onreturn: getLdapCallback,
			onerror: function (event){
				console.log('errorCallback', event)
			}
		})
	},

	/**
	 * 获取所有通讯录信息
	 * @param data
	 */
	getExtendedContacts: function (data = {}){
		console.log('get extended contacts.')
		if(!grpDialingApi.gsApi){
			console.log('no login, can not authorized')
			return
		}

		let actionCallback = function (params){
			if(params.isAddressBookNeedUpdated){
				grpDialingApi.getLocalPhoneBook()
			}else {
				console.log('no need update local phone book')
			}

			// if(params.isLdapNeedUpdated){
				grpDialingApi.getLdap()
			// }else {
			// 	console.log('no need update ldap')
			// }
		}

		// 先获取当前数据，判断是否需要更新
		grpDialingApi.getPhoneBookFromDB({callback: actionCallback})
	},

	getPhoneBookFromDB: function (data = {}){
		if(!grpDialingApi.phoneBookDB){
			return
		}

		grpDialingApi.phoneBookDB.getAllItems(function (storeInfos = []){
			let isAddressBookNeedUpdated = true
			let isLdapNeedUpdated = true
			let dayTimeStamp = 1000 * 60 * 60 * 24 * 7;   // 每7天更新一次信息
			let phoneBookName = 'localAddressBook_' + grpDialingApi.loginData.url.split('//')[1]

			if(storeInfos.length){
				console.log('wave extended contacts')
				for(let  i = 0; i<storeInfos.length; i++){
					let name = storeInfos[i].phoneBookName
					grpDialingApi.phoneBooks[name] = storeInfos[i].content
					let diffValue = new Date().getTime() - storeInfos[i].TS; //时间差
					if(name === phoneBookName && diffValue <= dayTimeStamp){
						isAddressBookNeedUpdated = false
					}else if(name === 'ldap' && diffValue <= dayTimeStamp){
						isLdapNeedUpdated = false
					}
				}
			}

			if(data.callback){
				data.callback({
					isAddressBookNeedUpdated: isAddressBookNeedUpdated,
					isLdapNeedUpdated: isLdapNeedUpdated,
				})
			}
		})
	},
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
		console.log('get request: ' ,request)
		chromeRuntimeOnMessage(request)
		// send response
		sendResponse({cmd: "backgroundMessage2ContentScript", status: "OK"});
	}
});

/**
 * 处理来自content-script的消息
 * @param request
 */
function chromeRuntimeOnMessage(request){
	switch (request.cmd){
		case "contentScriptAccountChange":
		case "contentScriptUpdateLoginInfo":
			if(request.data && request.data.url){
				request.data.url = grpDialingApi.checkUrlFormat(request.data.url)
			}
			grpDialingApi.updateCallCfg(request.data)
			break
		case "contentScriptMakeCall":
			console.info("call phonenumber:", request.data.phonenumber)
			grpDialingApi.extMakeCall(request.data)
			break
		case 'contentScriptGetPhoneBook':
			console.log('content get phone book')
			if(JSON.stringify(grpDialingApi.phoneBooks) !== "{}"){
				sendMessageToContentScript({cmd:'phoneBookUpdate', data: {
						phoneBooks: grpDialingApi.phoneBooks,
						deviceId: grpDialingApi.loginData?.url
					}
				});
			}else {
				// search from indexeddb
				grpDialingApi.getPhoneBookFromDB({
					callback: function (){
						if(JSON.stringify(grpDialingApi.phoneBooks) !== "{}"){
							sendMessageToContentScript({cmd:'phoneBookUpdate', data: {
									phoneBooks: grpDialingApi.phoneBooks,
									deviceId: grpDialingApi.loginData?.url
								}
							});
						}
					}
				})
			}
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
	grpDialingApi.popupPort = port

	port.onMessage.addListener(request => {
		if(request && request.requestType === 'popupMessage2Background'){
			recvPopupMessage(request, port)
		}
	})

	port.onDisconnect.addListener(function (){
		console.log('onDisconnect, clear interval')
		grpDialingApi.popupPort = null

		// 清除获取线路状态的定时器
		grpDialingApi.clearLineStatusInterval()
		// 清除获取设备状态的定时器
		grpDialingApi.clearPhoneStatusInterval()
		// 清除gs API保活定时器
		grpDialingApi.clearApiKeepAliveInterval()
	})
})

/**
 * 给popup发送消息
 * @param data
 */
function sendMessage2Popup(data){
	if(grpDialingApi.popupPort){
		grpDialingApi.popupPort.postMessage(data)
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
			console.log('islogin ', grpDialingApi.isLogin)
			grpDialingApi.createGsApiOrUpdateConfig()
			port.postMessage({cmd: 'popupShowConfig', grpClick2TalObj: grpDialingApi})
			// 关闭content-script的配置窗口
			// sendMessageToContentScript({cmd:'popupOpen'});

			if(!grpDialingApi.isLogin){
				if(grpDialingApi.permissionCheckRefuse){
					console.log('[EXT] already refuse permission check, do not auto login when popup open')
					return;
				}

				// server/username/password字段都有时，popup打开时自动登录
				grpDialingApi.automaticLoginCheck()
			}else {
				// 获取线路的状态
				grpDialingApi.showLineStatus()
				// 获取设备当前登录状态
				grpDialingApi.getPhoneStatus()
			}
			break
		case "popupAccountChange":
		case 'popupUpdateLoginInfo':
			if(request.data && request.data.url){
				request.data.url = grpDialingApi.checkUrlFormat(request.data.url)
			}

			// 登录或更新登录信息
			grpDialingApi.updateCallCfg(request.data)
			// 同步更新content-script中的设置
			// sendMessageToContentScript({cmd:'updateConfig', data: request.data});
			break
		case "popupMakeCall":
			console.info("request.data:", request.data)
			grpDialingApi.extMakeCall(request.data)
			break
		case 'popupHangupLine':
			/**
			 * 话机部分通话相关操作接口
			 * extend/endcall/holdcall/unhold/acceptcall/rejectcall/cancel
			 * grpDialingApi.gsApi.phoneOperation
			 */
			console.info('hangup line ', request.lineId)
			grpDialingApi.gsApi.phoneOperation({
				arg: request.lineId,
				cmd: 'endcall',
				sid: grpDialingApi.sid,
				onerror: grpDialingApi.onErrorCatchHandler
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
		grpDialingApi.loginData = JSON.parse(XNewestData)
	}

	console.log('open db!!')
	grpDialingApi.phoneBookDB?.openDB();

	/**
	 * change request header
	 */
	chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
			let requestHeaders = details.requestHeaders

			// TODO: Modify only the request with the specified header field
			let requestURL = grpDialingApi.loginData?.url
			// let isGRPRequestHeader = details.requestHeaders.find(isGRPSendRequestHeaders)
			// if(isGRPRequestHeader){}
			if(details && details.url && requestURL && details.url.match(requestURL) && details.initiator && details.initiator.indexOf('chrome-extension') >= 0){
				let accessControl = false
				requestHeaders = details.requestHeaders.map(item => {
					if (item.name === 'Origin') {
						item.value = grpDialingApi.loginData?.url
						accessControl = true
					}else if(item.name === 'Cookie'){  // cookies add sid
						let sidValue = grpDialingApi.sid
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
						let cookie = 'session-role=' + grpDialingApi.loginData.username + '; session-identity=' + grpDialingApi.sid + '; sid=' + grpDialingApi.sid + ';'
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
			let requestURL = grpDialingApi.loginData?.url
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
