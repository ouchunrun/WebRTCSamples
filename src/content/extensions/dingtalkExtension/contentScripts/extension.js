
let closeButton
let serverInput
let usernameInput
let pwdInput
let accountSelect
let phoneNumberInput
let submitBtn
let makeCallBtn

let click2talk = {
	sendRequest : false,
	requestMid: '',
	calleeuid : '',
	socket: null,
}

/****************************************page resize****************************************************/

/**
 * dingtalk auto full screen
 */
function pageResize() {
	let layoutContainer = document.getElementById('layout-container')
	let layoutMainEle = document.getElementById('layout-main')

	let dingBody = document.getElementById('body')
	let headerEle = document.getElementById('header')
	let widthScale = window.screen.width / 1920;

	if(layoutContainer && layoutMainEle){
		let height = ''
		if(window.getComputedStyle && getComputedStyle(headerEle)['height'] && getComputedStyle(headerEle)['height'].split('px').length){
			height = (parseInt(window.innerHeight / widthScale) - getComputedStyle(headerEle)['height'].split('px')[0]) + 'px';
		}else {
			height = (parseInt(window.innerHeight / widthScale) - 59) + 'px';
		}

		layoutContainer.style['display'] = 'block'
		layoutMainEle.style['width'] = '100%'
		dingBody.style['height']= height
	}else {
		setTimeout(function (){
			pageResize()
		}, 1000)
	}
}

window.onresize = function () {
	pageResize();
}
/*****************************************************************************************************/

/****************************************WebSocket override****************************************************/
let origWebSocket = window.WebSocket
_WebSocket = function (url, protocols) {
	let wsInstance = protocols ? new origWebSocket(url, protocols) : new origWebSocket(url)
	wsInstance.addEventListener("open", function () {
		console.info("Socket is open!");
	});
	wsInstance.addEventListener("close", function () {
		console.info("Socket is closed");
	});
	wsInstance.addEventListener("message", function (event) {
		if(click2talk.sendRequest){
			let msgObj = JSON.parse(event.data);
			console.info("get request data: ", msgObj)
			if( msgObj.headers && msgObj.headers.mid === click2talk.requestMid){
				click2talk.sendRequest = false

				let body = msgObj.body
				if(body.orgEmployees && body.orgEmployees.length){
					let orgExtPropertyList = body.orgEmployees[0].orgExtPropertyList
					if(orgExtPropertyList && orgExtPropertyList.length){
						let target = orgExtPropertyList.find(item =>{return item.itemName === "分机号"});
						let ext = target?.itemValue
						console.warn("get ext by uid: ", ext)
						if(ext){
							console.warn("这里通知插件去拨打电话呼叫： ", ext)
						}
					}
				}
			}
		}
	});
	click2talk.socket = wsInstance
	return wsInstance;
}
_WebSocket.prototype = origWebSocket.prototype;
_WebSocket.prototype.send = function (send) {
	return function (data) {
		if(click2talk.sendRequest){
			// let msgObj = JSON.parse(data);
			console.info('send date to request message: \r\n', data);
		}
		return send.apply(this, arguments)
	};
}(WebSocket.prototype.send)

window.WebSocket = _WebSocket
Object.freeze(window.WebSocket)
Object.freeze(WebSocket)
/*****************************************************************************************************/

console.log('load ding talk extension!');
/**
 * get user info by uid
 */
function getUserProfileExtensionByUid(){
	let avatar = document.getElementsByClassName('avatar user-avatar ng-scope ng-isolate-scope')
	console.warn("avatar:", avatar)
	if(avatar && avatar.length){
		console.warn("click2talk.socket:", click2talk.socket)
		if(click2talk.socket){
			// todo: 通过uid获取用户分机号等信息，在websocket onmessage中处理请求结果
			let calleeUID = avatar[0].getAttribute('uid')
			let mid = generateMixedMid(8) + ' 0'
			let getUserProfileExtensionByUidData = {
				lwp: "/r/Adaptor/UserMixI/getUserProfileExtensionByUid",
				body: [calleeUID, null],
				headers: {mid: mid},
			}
			console.info("send request data: ", JSON.stringify(getUserProfileExtensionByUidData, null, '    '))
			click2talk.socket.send(JSON.stringify(getUserProfileExtensionByUidData))
			click2talk.sendRequest = true
			click2talk.requestMid = mid
			click2talk.calleeuid = calleeUID
		}
	}
}

/**
 * @param n 要生成的随机数位数
 * @returns {string}
 */
function generateMixedMid(n) {
	let randomChoice = ['a', 'b', 'c', 'd', 'e', 'f',  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
	let res = "";
	for(let i = 0; i < n ; i++) {
		let id = Math.floor(Math.random()*randomChoice.length);
		res += randomChoice[id];
	}
	return res;
}

/**
 * 监听页面元素变化：动态添加呼叫按钮
 */
function pageMutationObserver(){
	let article = document.body;
	let  options = {'childList': true, 'attributes':true}
	let callback = function (mutationsList){
		mutationsList.forEach(function(mutation) {
			switch (mutation.type){
				case 'childList':
					if(mutation.addedNodes && mutation.addedNodes.length){
						let addedNodes = mutation.addedNodes[0]
						if(addedNodes.className === 'ding-modal fade ng-scope ng-isolate-scope'){
							let selectorContainer = document.getElementsByClassName('selector-container')[0]
							if(selectorContainer){
								console.log("add call button")
								let callBtn = document.createElement('button')
								callBtn.id = 'xCallButton'
								callBtn.type = 'button'
								callBtn.className = 'btn green ng-binding'
								callBtn.innerHTML = '呼叫话机账号'
								callBtn.onclick = getUserProfileExtensionByUid
								selectorContainer.appendChild(callBtn);
							}
						}
					}
					break
				default:
					break
			}
		});
	}
	const observer = new MutationObserver(callback)
	observer.observe(article, options);
}

/****************************************Add button****************************************************/
/**
 * 添加GPR配置页面的控制按钮
 */
function makeGRPConfigBtn(){
	// 添加GRP呼叫配置按钮
	let domCheckInterval = setInterval(function (){
		let parent = document.getElementsByClassName('main-menus')[0]
		if(parent){
			clearInterval(domCheckInterval)
			let newItem = document.createElement('li')
			newItem.className = 'menu-item menu-micro-app ng-scope'
			newItem.innerHTML = '<div class="menu-item-content">' +
								'<i class="iconfont menu-icon tipper-attached" htitle="GRP账号配置" htitle-direction="right"></i>' +
								'</div>'
			newItem.onclick = displayConfigArea
			parent.appendChild(newItem);
		}
	}, 2*1000)
}

function insertConfigArea(){
	/**
	 * 页面插入配置页面
	 * @type {HTMLElement}
	 */
	let insertParent = document.querySelector('body')

	// 添加遮罩层
	let maskLayer = document.createElement('div')
	maskLayer.id = 'xConfigMaskLayer'
	insertParent.appendChild(maskLayer);

	let configDiv = document.createElement('div')
	configDiv.id = 'grpCallConfig'
	configDiv.innerHTML = `<div id="configCloseBtn">X</div>
	<table id="xConfigTable">
        <thead>
            <tr><th colspan="3" style="padding-bottom: 5px;">Server Setting</th></tr>
        </thead>
        <tbody>
            <tr>
                <td class="xLabelTip"><label>Address</label></td>
                <td><input type="text" id="x-serverAddress"  value="https://192.168.131.120" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Username</label></td>
                <td><input type="text" id="x-userName"  value="admin" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Password</label></td>
                <td><input type="text" id="x-password" value="admin123" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;" ></td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td><button id="submitConfig" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;">Submit</button></td>
                <td></td>
            </tr>
             <tr><td colspan="3" style="text-align: center;padding: 15px 0 5px 0;">Call config</td></tr>
            <tr>
                <td class="xLabelTip"><label>Accounts</label></td>
                <td>
                    <select name="" id="x-account" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;">
                        <option value="-1">First Available</option>
                        <option value="0">Account 1</option>
                        <option value="1">Account 2</option>
                    </select>
                </td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Dial Number</label></td>
                <td><input type="text" id="x-phoneNumber" value="3593" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
             <tr>
                <td></td>
                <td><button id="x-makeCall" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;">Call</button></td>
                <td></td>
            </tr>
        </tbody>
    </table>`
	insertParent.appendChild(configDiv);

	// 绑定新增元素的点击事件
	bindingDomEvent()

	if(serverInput && serverInput.value){
		console.log('Notify background to register')
		sendMessageToContentScript({
			requestType: 'GRPClick2talk',
			cmd: 'login',
			data: {
				url: serverInput.value,
				username: usernameInput.value,
				password: pwdInput.value
			}
		}, function (res){
			console.warn("res: ", res)
		})
	}
}

function bindingDomEvent(){
	serverInput = document.getElementById('x-serverAddress')
	usernameInput = document.getElementById('x-userName')
	pwdInput = document.getElementById('x-password')
	accountSelect = document.getElementById('x-account')
	phoneNumberInput = document.getElementById('x-phoneNumber')
	submitBtn = document.getElementById("submitConfig")
	makeCallBtn = document.getElementById('x-makeCall')
	closeButton = document.getElementById('configCloseBtn')

	closeButton.onclick = hiddenConfigArea
	submitBtn.onclick = updateCallConfig;
	accountSelect.onchange = updateUseAccount
	makeCallBtn.onclick = checkToMakeCall
}

function displayConfigArea(){
	let grpCallConfig = document.getElementById('grpCallConfig')
	grpCallConfig.style.opacity = '1'
	grpCallConfig.style['z-index'] = '2050'

	let xConfigMaskLayer = document.getElementById('xConfigMaskLayer')
	xConfigMaskLayer.style.opacity = '0.55'
	xConfigMaskLayer.style['z-index'] = '2040'
}

function hiddenConfigArea(){
	let grpCallConfig = document.getElementById('grpCallConfig')
	grpCallConfig.style.opacity = '0'
	grpCallConfig.style['z-index'] = '-999'

	let xConfigMaskLayer = document.getElementById('xConfigMaskLayer')
	xConfigMaskLayer.style.opacity = '0'
	xConfigMaskLayer.style['z-index'] = '-999'
}

function checkToMakeCall(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex].value
	let phoneNumber = phoneNumberInput.value
	if(!account || !phoneNumber){
		console.warn('account && phoneNumber is require')
		return
	}

	sendMessageToContentScript({
		requestType: 'GRPClick2talk',
		cmd: 'makeCall',
		data: {
			account: account?.trim(),
			phonenumber: phoneNumber?.trim(),
		}
	}, function (res){
		console.warn("res: ", res)
	})
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

	sendMessageToContentScript({
		requestType: 'GRPClick2talk',
		cmd: 'updateCallConfig',
		data: {
			url: server.trim(),
			username: username.trim(),
			password: pwd.trim(),
			account: account.trim()
		}
	}, function (res){
		console.warn("res: ", res)
	})
}

function updateUseAccount(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex].value

	sendMessageToContentScript({
		requestType: 'GRPClick2talk',
		cmd: 'updateCallConfig',
		data: {
			account: account
		}
	}, function (res){
		console.warn("res: ", res)
	})
}

/*****************************************************************************************************/

window.onload = function (){
	insertConfigArea()

	setTimeout(function (){
		pageResize();
		makeGRPConfigBtn()
	}, 2*1000)

	pageMutationObserver()
}

/************************** Content-script 和 backgroundJS 间的通信处理*******************************/

/**
 *  发送
 * @param message 内容
 * @param callback 回调
 */
function sendMessageToContentScript(message, callback){
	chrome.runtime.sendMessage(message, function(response) {
		console.log('收到来自后台的回复：', response);
		if(callback){
			callback(response)
		}
	});
}

/**
 * 接收
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("sender：", sender)
	console.warn("request:", request)
	sendResponse('hi, backgroundJS.我收到了你的消息！');
});

/*****************************************************************************************************/
