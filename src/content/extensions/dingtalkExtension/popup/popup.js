let grpClick2Talk
let popupContent
let loginIdentity
let serverInput
let usernameInput
let pwdInput
let accountSelect
let phoneNumberInput
let submitBtn
let makeCallBtn
let configHead
let linesTable


/************************** 和 backgroundJS 建立长连接*******************************/
let popupPort = chrome.extension.connect({name: 'popup'})

/**
 * 发送消息
 * @param message
 */
function popupSendMessage2Background(message){
	if(!message){
		return
	}

	message.requestType = 'popupMessage2Background'
	popupPort.postMessage(message)
}

/**
 * 处理backgroundJS发送的消息
 */
popupPort.onMessage.addListener(msg => {
	if(!msg){
		return
	}

	switch (msg.cmd){
		case "popupShowConfig":
			console.log('set popup config')
			grpClick2Talk = msg.grpClick2TalObj
			setPopupContent()
			break
		case 'updateLoginStatus':  // 更新当前登录状态
			let data = msg.data
			if(msg.grpClick2TalObj){
				grpClick2Talk = msg.grpClick2TalObj
			}

			if(loginIdentity){
				let className = data.className
				if(data.add){
					loginIdentity.classList.add(className)
					console.info('add class ', className)
				}else {
					loginIdentity.classList.remove(className)
					console.info('remove class ', className)
				}
				// 显示tip 提示
				if(data.message){
					showTipInPage({message: data.message})
				}
				loginIdentity.innerText = grpClick2Talk.loginData?.username
			}
			break
		case 'updateAccountLists':
			if(msg.accountLists){
				grpClick2Talk.loginData.accountLists = msg.accountLists
				accountSelect.innerHTML = getSelectOptions()
			}
			break
		case 'setLineStatus':   // 显示线路信息
			let lines = msg.lines
			if(lines){
				let linesList = document.getElementsByClassName('line')
				if(linesList && linesList.length){
					for(let i = 0; i<lines.length; i++){
						let line = 'line' + lines[i].line
						let lineTD = document.getElementsByClassName(line)
						if(lineTD && lineTD[0]){
							lineTD[0].innerText = lines[i].state  // 更新线路state状态，非idel时添加挂断按钮？？
							if(lines[i].state !== 'idle'){
								lineTD[0].classList.add('lineBusy')
							}else {
								lineTD[0].classList.remove('lineBusy')
							}

							let btn = document.getElementById(line)
							if(btn){
								if(lines[i].state !== 'idle'){
									btn.style.display = 'block'
									btn.onclick = function (){
										popupSendMessage2Background({
											cmd: 'popupHangupLine',
											lineId: lines[i].line,
										})
									}
								}else {
									btn.style.display = 'none'
								}
							}
						}
					}
				}else {
					let lineTrList = ''
					for(let i = 0; i<lines.length; i++){
						let line = lines[i]
						lineTrList = lineTrList + '<tr class="line"><td class="lineLabel">LINE' + line.line +'</td><td class="lineState line'+ line.line  +'">'+ line.state +'</td>' +
							'<td><button style="display:none" id="line'+ line.line  +'">挂断</button></td></tr>'
					}

					linesTable.innerHTML = lineTrList
				}
			}
			break
		default:
			break
	}
})

/**
 * 1.发送消息给backgroundJs，获取用户配置信息
 */
popupSendMessage2Background({cmd: 'popupOnOpen'})

/******************************************** 页面内容显示处理 ********************************************************/

/**
 * 获取已注册的账号列表
 * @returns {string}
 */
function getSelectOptions(){
	// 处理账号下拉框列表
	let options = '<option value="0">First Available</option>'
	let checkOption = ''
	let selectAccount = parseInt(grpClick2Talk.loginData?.selectedAccountId)
	let loginDatas = grpClick2Talk?.loginData
	if(loginDatas && loginDatas.accountLists && loginDatas.accountLists.length){
		for(let i = 0; i<loginDatas.accountLists.length; i++){
			let acct = loginDatas.accountLists[i]
			if(parseInt(acct.reg) === 1){
				let acctId = parseInt(acct.id)
				if(selectAccount && selectAccount === acctId){
					checkOption = '<option value=' + acctId +' selected>Account' + acctId + '_' + acct.sip_id + '</option>'
				}
				options = options + '<option value=' + acctId +'>Account' + acctId + '_' + acct.sip_id + '</option>'
			}else {
				// 0 未注册
			}
		}
	}
	if(checkOption){
		options = checkOption + options
	}

	return options
}

/**
 * 设置popup界面值
 */
function setPopupContent(){
	let langInfo = grpClick2Talk.latestLangInfo
	let configTips = {
		popTitle: langInfo === 'en_US' ? 'Click to Dial' : '点击拨打',
		loginBtnText: langInfo === 'en_US' ? 'Login/Save' : '登录/保存',
		callBtnText: langInfo === 'en_US' ? 'Call' : '呼叫',
		// login status
		username: grpClick2Talk.loginData?.username || '',
		loginTitle: grpClick2Talk.isLogin ? '已登录' : '未登录',
		loginClass: grpClick2Talk.isLogin ? '' : 'grey'
	}

	configHead.innerText = '🎃' + configTips.popTitle
	if(configTips.loginClass){
		// The token provided must not be empty.
		loginIdentity.classList.add(configTips.loginClass)
	}
	loginIdentity.title = configTips.loginTitle
	loginIdentity.innerText = configTips.username

	serverInput.value = grpClick2Talk.loginData?.url || ''
	usernameInput.value =  grpClick2Talk.loginData?.username || ''
	pwdInput.value = grpClick2Talk.loginData?.password || ''

	submitBtn.innerText = configTips.loginBtnText
	makeCallBtn.innerText = configTips.callBtnText

	accountSelect.innerHTML = getSelectOptions()
}


/*******************************************************************************************************************/
/********************************************** 添加页面监听 *********************************************************/

/**
 * 显示提示
 * @param data
 */
function showTipInPage(data){
	if(!data){
		return
	}

	let xMessageTip = document.getElementById('xMessageTip')
	xMessageTip.style.background = '#dfedfa'
	xMessageTip.innerText = data.message

	// clear tip
	setTimeout(function (){
		console.log('clear tip')
		xMessageTip.innerText = ''
		xMessageTip.style.background = ''
	}, 2000)
}

/**
 * 登录或更新登录配置信息
 */
function updateLoginInformation(){
	let server = serverInput.value
	let username = usernameInput.value
	let pwd = pwdInput.value
	if(!server || !username || !pwd){
		showTipInPage({message: 'Address/Username/Password can not be empty'})
		return
	}
	if(server.trim){
		server = server.trim()
	}
	if(username.trim){
		username = username.trim()
	}
	if(pwd.trim){
		pwd = pwd.trim()
	}

	popupSendMessage2Background({
		cmd: 'popupUpdateLoginInfo',
		data: {
			url: server,
			username: username,
			password: pwd
		}
	})
}

/**
 * 呼叫
 */
function call(){
	let phoneNumber = phoneNumberInput.value
	if(!phoneNumber){
		showTipInPage({message: 'account/phoneNumber can not be empty'})
		return
	}

	popupSendMessage2Background({
		cmd: 'popupMakeCall',
		data: {
			phonenumber: phoneNumber?.trim(),
		}
	})
}

function onSelectAccountChange(){
	let index = accountSelect.selectedIndex; // 选中索引
	let selectValue = accountSelect.options[index].value;

	popupSendMessage2Background({
		cmd: 'popupAccountChange',
		data: {
			selectedAccountId: selectValue
		}
	})
}

/**
 * 获取Dom节点
 */
function getDom(){
	popupContent = document.getElementById('popupContent')
	configHead = document.getElementById('configHead')
	loginIdentity = document.getElementById('loginIdentity')
	serverInput = document.getElementById('x-serverAddress')
	usernameInput = document.getElementById('x-userName')
	pwdInput = document.getElementById('x-password')
	accountSelect = document.getElementById('x-account')
	phoneNumberInput = document.getElementById('x-phoneNumber')
	submitBtn = document.getElementById("submitConfig")
	makeCallBtn = document.getElementById('x-makeCall')
	linesTable = document.getElementById('linesTable')

	if(!submitBtn){
		setTimeout(function (){
			getDom()
		}, 1000)
	}else {
		submitBtn.onclick = updateLoginInformation
		makeCallBtn.onclick = call
		accountSelect.onchange = onSelectAccountChange
	}
}

window.onload = function (){
	getDom()
}
