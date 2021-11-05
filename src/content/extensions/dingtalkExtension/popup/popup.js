

/************************** 和 backgroundJS 建立长连接*******************************/
let popupPort = chrome.extension.connect({name: 'popup'})
/**
 * 处理backgroundJS发送的消息
 */
popupPort.onMessage.addListener(msg => {
	console.log('接收的信息：', msg)
})

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
 * 1.发送消息给backgroundJs，获取用户配置信息
 */
popupSendMessage2Background({cmd: 'popupOnOpen'})

/************************** 添加页面监听 *******************************************/

let serverInput
let usernameInput
let pwdInput
let accountSelect
let phoneNumberInput
let submitBtn
let makeCallBtn

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
	serverInput = document.getElementById('x-serverAddress')
	usernameInput = document.getElementById('x-userName')
	pwdInput = document.getElementById('x-password')
	accountSelect = document.getElementById('x-account')
	phoneNumberInput = document.getElementById('x-phoneNumber')
	submitBtn = document.getElementById("submitConfig")
	makeCallBtn = document.getElementById('x-makeCall')

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
