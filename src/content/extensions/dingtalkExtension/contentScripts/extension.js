
let closeButton
let serverInput
let usernameInput
let pwdInput
let accountSelect
let phoneNumberInput
let submitBtn
let makeCallBtn

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

console.log('load ding talk extension!');
function getUserUid(){
	let avatar = document.getElementsByClassName('avatar user-avatar ng-scope ng-isolate-scope')
	if(avatar && avatar.length) {
		let calleeUID = avatar[0].getAttribute('uid')
		console.log("get calleeUID:", calleeUID)
		let inputEle = document.getElementById('remoteTarget')
		inputEle.value = calleeUID
		inputEle.click()

		let closeIconfont = document.getElementsByClassName('close iconfont')[0]
		if(closeIconfont){
			closeIconfont.click()
		}
	}
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
								callBtn.onclick = getUserUid
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
	let domCheckInterval = setInterval(function (){
		let parent = document.getElementsByClassName('main-menus')[0]
		if(parent){
			clearInterval(domCheckInterval)
			let newItem = document.createElement('li')
			newItem.className = 'menu-item menu-micro-app ng-scope'
			newItem.innerHTML = '<div class="menu-item-content">' +
				'<i class="iconfont icon-modify-alias" style="font-size: 26px;font-weight: bold;color: brown;" title="GRP账号配置"></i>' +
				'</div>'
			newItem.onclick = displayConfigArea
			parent.appendChild(newItem);

			let newItem2 = document.createElement('li')
			newItem2.innerHTML = '<input id="remoteTarget"  style="display: none">' +
				'<input id="callRemoteNumber" style="display: none">'
			parent.appendChild(newItem2);

			let btn = document.getElementById('callRemoteNumber')
			btn.onclick = makeCallWithRemoteNumber
		}
	}, 1000)
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
	maskLayer.onclick = displayConfigArea

	let configDiv = document.createElement('div')
	configDiv.id = 'grpCallConfig'
	configDiv.innerHTML = `<div id="configHead">GRP呼叫配置 <span id="closeFont">X</span></div>
	<table id="xConfigTable">
        <tbody>
            <tr>
                <td class="xLabelTip"><label>Address</label></td>
                <td><input type="text" id="x-serverAddress"  value="" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Username</label></td>
                <td><input type="text" id="x-userName"  value="" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Password</label></td>
                <td><input type="text" id="x-password" value="" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;" ></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Accounts</label></td>
                <td>
			        <select name="" id="x-account" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;border: 1px solid #e1e1e1;">
			            <option value="-1">First Available</option>
			        </select>
			    </td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td><button id="submitConfig" style="margin: 5px 0px;height: 34px;width: 180px;font-family: cursive;border-radius: 15px;font-size: 14px;border: 0;">保存修改</button></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Dial Number</label></td>
                <td><input type="text" id="x-phoneNumber" value="359301" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
             <tr>
                <td></td>
                <td><button id="x-makeCall" style="margin: 5px 0px;border-radius: 15px;font-size: 14px; width: 180px;height: 34px;border: 0;">发起音频呼叫</button></td>
                <td></td>
            </tr>
        </tbody>
    </table>`
	insertParent.appendChild(configDiv);

	// 绑定新增元素的点击事件
	bindingDomEvent()

	// 获取storage里面的值
	getValueFromStorage()
}

function getValueFromStorage(){
	if(!serverInput || !usernameInput || !pwdInput){
		console.info("no server/pwd/username element found.")
		return
	}

	// get value from storage
	serverInput.value = localStorage.getItem('xServer') || ''
	usernameInput.value = localStorage.getItem('xUsername') || ''
	pwdInput.value = window.atob(localStorage.getItem('xPassword') || '')
	accountSelect.value = localStorage.getItem('xAccount') || ''

	if(serverInput.value && usernameInput.value && pwdInput.value){
		console.log('Notify background to register')
		if(window.sendMessageToBackgroundJS){
			sendMessageToBackgroundJS({
				requestType: 'GRPClick2talk',
				cmd: 'login',
				data: {
					url: serverInput.value,
					username: usernameInput.value,
					password: pwdInput.value
				}
			}, function (res){
				console.info("res: ", res)
			})
		}
	}else {
		console.info("server/pwd/username empty!!!")
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
	closeButton = document.getElementById('closeFont')

	closeButton.onclick = hiddenConfigArea
	submitBtn.onclick = updateCallConfig
	makeCallBtn.onclick = checkToMakeCall      // 呼叫
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

/**
 * 点击遮罩层时关闭弹框
 * @param event
 */
window.onclick = function (event){
	if(event.srcElement && event.srcElement.id === 'xConfigMaskLayer'){
		hiddenConfigArea()
	}
}

function makeCallWithRemoteNumber(){
	let phoneNumber = document.getElementById('callRemoteNumber')?.value
	if(!phoneNumber){
		console.info("phoneNumber is empty!!")
		return
	}
	sendMessageToBackgroundJS({
		requestType: 'GRPClick2talk',
		cmd: 'makeCall',
		data: {
			phonenumber: phoneNumber?.trim(),
		}
	}, function (res){
		console.info("res: ", res)
	})

	// 点击呼叫后关闭弹框
	hiddenConfigArea()
}

function checkToMakeCall(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex].value
	let phoneNumber = phoneNumberInput.value
	if(!account || !phoneNumber){
		console.info('account && phoneNumber is require')
		return
	}

	sendMessageToBackgroundJS({
		requestType: 'GRPClick2talk',
		cmd: 'makeCall',
		data: {
			account: account?.trim(),
			phonenumber: phoneNumber?.trim(),
		}
	}, function (res){
		console.info("res: ", res)
	})

	// 点击呼叫后关闭弹框
	hiddenConfigArea()
}

/**
 * 设置使用的分机信息
 */
function updateCallConfig(){
	let selectedIndex = accountSelect.selectedIndex
	let account = accountSelect.options[selectedIndex]?.value || -1
	let server = serverInput.value
	let username = usernameInput.value
	let pwd = pwdInput.value
	if(!server || !username || !pwd){
		alert('invalid parameters')
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
	if(account.trim){
		account = account.trim()
	}

	// TODO: Request by https by default
	if(server.substr(0,7).toLowerCase() === "http://" || server.substr(0,8).toLowerCase() === "https://"){
		server = server.replace(/http:\/\//, 'https://');
	}else{
		server = "https://" + server;
	}
	localStorage.setItem('xServer', server)
	localStorage.setItem('xUsername', username)
	localStorage.setItem('xPassword',  window.btoa(pwd))
	localStorage.setItem('xAccount', account)

	sendMessageToBackgroundJS({
		requestType: 'GRPClick2talk',
		cmd: 'updateCallConfig',
		data: {
			url: server,
			username: username,
			password: pwd,
			account: account
		}
	}, function (res){
		console.info("res: ", res)
	})
}

/**
 * 更新账号列表
 * @param numbers
 */
function setAccountsList(numbers){
	console.log('set account list ' + numbers)
	let options = '<option value="-1">First Available</option>'
	for(let i = 0; i<numbers; i++){
		options = options + '<option value=' + i +'>Account ' + (i+1) + '</option>'
	}
	console.info("options:", options)
	accountSelect.innerHTML = options
}

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
function sendMessageToBackgroundJS(message, callback){
	if(chrome.runtime && chrome.runtime.sendMessage){
		chrome.runtime.sendMessage(message, function(response) {
			console.log('收到来自后台的回复：', response);
			if(callback){
				callback(response)
			}
		});
	}
}


/**
 * 接收
 */
if(chrome.runtime && chrome.runtime.onMessage){
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		console.log("sender：", sender)
		console.info("request:", request)
		if(request && request.requestType === 'GRPClick2talk'){
			if(request.cmd === 'setAccounts' && request.num_accounts){
				console.info("设置当前账号数: " + request.num_accounts)
				setAccountsList(request.num_accounts)
			}
		}
		sendResponse('request success');
	});
}
/*****************************************************************************************************/
