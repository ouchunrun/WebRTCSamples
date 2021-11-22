/****************************************dingtalk adaptation****************************************************/
let XConfigObj = {}
let closeButton
let serverInput
let usernameInput
let pwdInput
let accountSelect
let phoneNumberInput
let submitBtn
let makeCallBtn
let grpCallConfig

/**
 * dingtalk auto full screen
 */
function pageResize() {
	let layoutContainer = document.getElementById('layout-container')
	let layoutMainEle = document.getElementById('layout-main')

	let dingBody = document.getElementById('body')
	let headerEle = document.getElementById('header')
	let widthScale = window.screen.width / window.screen.availWidth;

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
	if(window.location.href.indexOf('im.dingtalk') >= 0){
		pageResize();
	}
}
/**************************************************************************************************************/

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
								let langInfo = localStorage.getItem('latest_lang_info')
								let callBtn = document.createElement('button')
								callBtn.id = 'xCallButton'
								callBtn.type = 'button'
								callBtn.className = 'btn green ng-binding'
								callBtn.innerHTML = langInfo === 'en_US' ? 'GRP Call' : '呼叫办公账号'
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

/**
 * 添加左侧配置按钮
 */
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
	maskLayer.onclick = showConfigArea

	let langInfo = localStorage.getItem('latest_lang_info')
	console.log('langInfo:', langInfo)
	let configTips = {
		title: langInfo === 'en_US' ? 'GRP call configuration' : 'GRP呼叫配置',
		loginInnerText: langInfo === 'en_US' ? 'Login/Save changes' : '登录/保存修改',
		callInnerText: langInfo === 'en_US' ? 'GRP audio call' : 'GRP音频呼叫'
	}

	let configDiv = document.createElement('div')
	configDiv.id = 'grpCallConfig'
	configDiv.innerHTML = `<div id="configHead">` + configTips.title + `<span id="closeFont">X</span></div>
	<div id="xMessageTip"></div>
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
                <td></td>
                <td>
                    <button id="submitConfig" style="margin: 5px 0px;height: 34px;width: 180px;font-family: cursive;border-radius: 5px;font-size: 14px;border: 0;">
                    ` + configTips.loginInnerText + `
                    </button></td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Accounts</label></td>
                <td>
			        <select name="" id="x-account" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;border: 1px solid #e1e1e1;">
			            <option value="0">First Available</option>
			        </select>
			    </td>
                <td></td>
            </tr>
            <tr>
                <td class="xLabelTip"><label>Dial Number</label></td>
                <td><input type="text" id="x-phoneNumber" value="359301" style="height: 30px; width: 180px;font-family: cursive;font-size: 13px;"></td>
                <td></td>
            </tr>
             <tr>
                <td></td>
                <td>
                    <button id="x-makeCall" style="margin: 5px 0px;border-radius: 5px;font-size: 14px; width: 180px;height: 34px;border: 0;">
                     ` + configTips.callInnerText + `
                    </button></td>
                <td></td>
            </tr>
        </tbody>
    </table>`
	insertParent.appendChild(configDiv);

	// 绑定新增元素的点击事件
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
	accountSelect.onchange = onSelectAccountChange
}

/**
 * 下拉账号发生改变
 */
function onSelectAccountChange(){
	let index = accountSelect.selectedIndex; // 选中索引
	let selectValue = accountSelect.options[index].value;

	XConfigObj.selectedAccountId = selectValue
	sendMessageToBackgroundJS({
		cmd: 'contentScriptAccountChange',
		data: {
			selectedAccountId: selectValue
		}
	})
}

/**
 * 呼叫
 */
function checkToMakeCall(){
	let phoneNumber = phoneNumberInput.value
	if(!phoneNumber){
		console.info('account && phoneNumber is require')
		return
	}

	sendMessageToBackgroundJS({
		cmd: 'contentScriptMakeCall',
		data: {
			phonenumber: phoneNumber?.trim(),
		}
	})

	// 点击呼叫后关闭弹框
	hiddenConfigArea()
}

/**
 * 设置使用的分机信息
 */
function updateCallConfig(){
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

	sendMessageToBackgroundJS({
		cmd: 'contentScriptUpdateLoginInfo',
		data: {
			url: server,
			username: username,
			password: pwd
		}
	}, function (res){
		console.info("res: ", res)
	})
}

function makeCallWithRemoteNumber(){
	let phoneNumber = document.getElementById('callRemoteNumber')?.value
	if(!phoneNumber){
		console.info("phoneNumber is empty!!")
		return
	}
	sendMessageToBackgroundJS({
		cmd: 'contentScriptMakeCall',
		data: {
			phonenumber: phoneNumber?.trim(),
		}
	}, function (res){
		console.info("res: ", res)
	})

	// 点击呼叫后关闭弹框
	hiddenConfigArea()
}

/**
 * 添加GPR配置页面的控制按钮
 */
function makeGRPConfigBtn(){
	let domCheckInterval = setInterval(function (){
		let parent = document.getElementsByClassName('main-menus')[0]
		if(parent){
			clearInterval(domCheckInterval)
			let langInfo = localStorage.getItem('latest_lang_info')
			let tip = langInfo === 'en_US' ? 'GRPConfig' : 'GRP配置'
			let newItem = document.createElement('li')
			newItem.className = 'menu-item menu-micro-app ng-scope'
			newItem.innerHTML = '<div class="menu-item-content">' + '<i class="iconfont icon-modify-alias" style="font-size: 26px;font-weight: bold;color: brown;" title='+ tip +'></i></div>'
			newItem.onclick = showConfigArea
			newItem.style.display = 'none'
			parent.appendChild(newItem);

			let newItem2 = document.createElement('li')
			newItem2.innerHTML = '<input id="remoteTarget"  style="display: none"><input id="callRemoteNumber" style="display: none">'
			parent.appendChild(newItem2);

			let btn = document.getElementById('callRemoteNumber')
			btn.onclick = makeCallWithRemoteNumber
		}
	}, 1000)
}

function showConfigArea(){
	updateInputValue()
	reloadAccountSelectOptions()

	grpCallConfig = grpCallConfig || document.getElementById('grpCallConfig')

	if(grpCallConfig){
		grpCallConfig.style.opacity = '1'
		grpCallConfig.style['z-index'] = '2050'
	}

	let xConfigMaskLayer = document.getElementById('xConfigMaskLayer')
	if(xConfigMaskLayer){
		xConfigMaskLayer.style.opacity = '0.55'
		xConfigMaskLayer.style['z-index'] = '2040'
	}
}

function hiddenConfigArea(){
	grpCallConfig = grpCallConfig || document.getElementById('grpCallConfig')
	if(grpCallConfig){
		grpCallConfig.style.opacity = '0'
		grpCallConfig.style['z-index'] = '-999'
	}

	let xConfigMaskLayer = document.getElementById('xConfigMaskLayer')
	if(xConfigMaskLayer){
		xConfigMaskLayer.style.opacity = '0'
		xConfigMaskLayer.style['z-index'] = '-999'
	}
}

let toolBarCheckInterval
let chatCallLinkCheckInterval
function checkToolBar(){
	if(toolBarCheckInterval){
		clearInterval(toolBarCheckInterval)
		toolBarCheckInterval = null
	}

	let startTime = Date.now()
	toolBarCheckInterval = setInterval(function (){
		let endTime = Date.now()
		if(endTime - startTime > 2000){   // 2s
			clearInterval(toolBarCheckInterval)
			toolBarCheckInterval = null
		}else {
			let chatToolBar = document.getElementsByClassName('tool-bar')[0]
			if(chatToolBar){
				clearInterval(toolBarCheckInterval)
				inertNewChatCallLink()
			}
		}
	}, 100)
}

/**
 * 插入新的呼叫连接
 */
function inertNewChatCallLink(){
	if(chatCallLinkCheckInterval){
		clearInterval(chatCallLinkCheckInterval)
		chatCallLinkCheckInterval = null
	}

	let parent = document.getElementsByClassName('tool-bar')[0]
	if(parent){
		let newChild = document.createElement("li");
		newChild.id = 'shortcutCall'
		newChild.classList.add('tool-item')
		newChild.classList.add('newChatCallLink')
		newChild.innerHTML = '<span class="ng-isolate-scope"><i style="font-size: 17px;font-weight: bold;color: #aaa;" class="iconfont tool-icon ng-scope tipper-attached"></i></span>';
		parent.appendChild(newChild)
	}

	let startTime = Date.now()
	chatCallLinkCheckInterval = setInterval(function (){
		let endTime = Date.now()
		let shortcutCall = document.getElementById('shortcutCall')
		if(endTime - startTime > 2000 || (shortcutCall && shortcutCall.classList.contains('newChatCallLinkFadeIn'))){   // 2s
			clearInterval(chatCallLinkCheckInterval)
		}else {
			let chatCallLink = document.getElementsByClassName('chat-call-link')[0]
			if(chatCallLink && chatCallLink.classList.contains('fade-in')){
				clearInterval(chatCallLinkCheckInterval)

				if(shortcutCall){
					shortcutCall.onclick = function (){
						chatCallLink.click()
					}
					shortcutCall.classList.add('newChatCallLinkFadeIn')
				}
			}
		}
	}, 100)
}

/**
 * 更新账号选择下拉框选项
 * [
 *  {id: 1, sip_server: '192.168.125.254', sip_id: '366102', name: '366102', reg: 1}
 *  {id: 2, sip_server: '192.168.120.254', sip_id: '3661', name: '3661', reg: 1}
 * ]
 */
function reloadAccountSelectOptions(){
	if(!accountSelect){
		return
	}

	let options = '<option value="0">First Available</option>'
	let checkOption = ''
	let selectAccount = parseInt(XConfigObj.selectedAccountId)
	if(XConfigObj.accountLists && XConfigObj.accountLists.length){
		for(let i = 0; i<XConfigObj.accountLists.length; i++){
			let acct = XConfigObj.accountLists[i]
			if(parseInt(acct.reg) === 1){
				let acctId = parseInt(acct.id)
				if(selectAccount && selectAccount === acctId){
					checkOption = '<option value=' + acctId +' selected>Account ' + acctId + '_' + acct.sip_id + '</option>'
				}
				options = options + '<option value=' + acctId +'>Account ' + acctId + '_' + acct.sip_id + '</option>'
			}else {
				// 0 未注册
			}
		}
	}
	if(checkOption){
		options = checkOption + options
	}
	accountSelect.innerHTML = options
}

function updateInputValue(data){
	if(data){
		/*更新 XConfigObj配置*/
		if(!XConfigObj){
			XConfigObj = {}
		}
		Object.keys(data).forEach(function (key){
			XConfigObj[key] = data[key]
		})
	}

	if(XConfigObj){
		if(XConfigObj.url && serverInput){
			serverInput.value = XConfigObj.url
		}
		if(XConfigObj.username && usernameInput){
			usernameInput.value = XConfigObj.username
		}
		if(XConfigObj.password && pwdInput){
			pwdInput.value = XConfigObj.password
		}
	}
}

/**
 * 页面显示提示
 */
function showTipInPage(data){
	let xMessageTip = document.getElementById('xMessageTip')
	if(!data || !xMessageTip){
		return
	}

	xMessageTip.style.background = '#dfedfa'
	if(data.response && data.response === "error"){
		xMessageTip.innerText = data.response + ':' + data.body
	}else {
		xMessageTip.innerText = data.response
	}

	// clear tip
	setTimeout(function (){
		console.log('clear tip')
		xMessageTip.innerText = ''
		xMessageTip.style.background = ''
	}, 2000)
}

/*******************************************************************************************************************/
/********************************************** slack adaptation****************************************************/
/*******************************************************************************************************************/

let slackAppExpand = {
	userTeams: null,
	teamsMembers: null,
	pathname: window.location.pathname,
	headerActionCheckInterval: null,

	getTeamsInfoFromLocalStorage: function (){
		let localConfig = localStorage.getItem('localConfig_v2')
		console.log('[EXT] localConfig:', localConfig)
		if(localConfig){
			localConfig = JSON.parse(localConfig)
			if(localConfig.lastActiveTeamId && localConfig.teams){
				slackAppExpand.userTeams = localConfig.teams[localConfig.lastActiveTeamId]
			}else {
				console.log('[EXT] Authentication token and teams info is not found.')
			}
		}
	},

	/**
	 * 获取团队列表
	 */
	getTeamsMembers: function (){
		let This = this
		let xmlHttp = new XMLHttpRequest()
		xmlHttp.onreadystatechange = function () {
			if (xmlHttp.readyState === 4){
				let response = JSON.parse(xmlHttp.response)
				console.log('[EXT] get teams members success, ', response.ok)
				if(response.ok === true){
					let members = response.members
					let membersList = {}
					if(members && members.length){
						for(let i = 0; i<members.length; i++){
							let member = members[i]
							membersList[member.id] = {
								real_name: member.profile.real_name,
								display_name: member.profile.display_name,
								phone: member.profile.phone,
								email: member.profile.email,
								team: member.profile.team
							}
						}

						slackAppExpand.teamsMembers = membersList
						localStorage.setItem('teamsMembers', JSON.stringify(slackAppExpand.teamsMembers))
						console.log("[EXT] get teams members: ", slackAppExpand.teamsMembers)
					}
				}
			}
		}

		// 没有验证信息时重新获取
		if(!slackAppExpand.userTeams.id || !slackAppExpand.userTeams.token){
			console.info('[EXT] invalid_cursor for request! get from localStorage')
			slackAppExpand.getTeamsInfoFromLocalStorage()
		}

		let url = window.location.origin + '/api/users.list?include_locale=true&pretty=1&team_id=' + slackAppExpand.userTeams.id
		xmlHttp.open("POST", url, true)
		xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
		xmlHttp.withCredentials = true
		let data = "content=null&token=" + slackAppExpand.userTeams.token
		xmlHttp.send(data)
	},

	/**
	 * 发起呼叫
	 */
	makeCall: function (){
		let memberDom = document.getElementsByClassName('c-link c-member_slug')[0]
		if(memberDom){
			let memberDataset = memberDom.dataset
			let memberId = memberDataset?.memberId
			if(memberId){
				let phoneNumber = slackAppExpand.teamsMembers[memberId].phone
				if(!phoneNumber){
					console.log('[EXT] The user does  not configured phone number')
					let real_name = slackAppExpand.teamsMembers[memberId].real_name
					alert(real_name + ' does not configured phone number')
				}else {
					console.log('[EXT] get phoneNumber, ', phoneNumber)
					sendMessageToBackgroundJS({
						cmd: 'contentScriptMakeCall',
						data: {
							phonenumber: phoneNumber?.trim(),
						}
					})
				}
			}
		}else {
			console.info('[EXT] member DOM not found.')
		}
	},

	/**
	 * 根据不同的请求接口添加请求参数
	 * @param method
	 * @param params
	 */
	getRequestURL: function (method, params){
		if(!method){
			return ''
		}

		let url = window.location.origin + '/api/' + method
		switch (method){
			case 'users.list':
				url = url + '?include_locale=true&pretty=1&team_id=' + params.team
				break
			default:
				break
		}
		return url
	},

	/**
	 * step1:
	 * document.getElementsByClassName('p-view_header__actions')[0].children[0].ariaLabel   // 'Call shyzhang'
	 * document.getElementsByClassName('p-view_header__actions')[0].children[0].dataset.qa  // 'channel_header_calls_button'
	 */
	addNewChatCallButton: function (){
		let callOfficeBtn = document.getElementById('callOfficePhone')
		// step1: check call exist or not
		let headerActions = document.getElementsByClassName('p-view_header__actions')[0]
		if(headerActions && headerActions.children && headerActions.children[0]){
			let child = headerActions.children[0]
			if (child.dataset && child.dataset.qa === 'channel_header_calls_button' && child.ariaLabel && child.ariaLabel.indexOf('Call') >= 0) {
				if(callOfficeBtn){
					callOfficeBtn.style.display = 'block'
				}else {
					// step2: add new call btn in chat bar
					let audioComposerButton = document.getElementsByClassName('p-audio_composer_button')[0]
					if (audioComposerButton) {
						let newChild = document.createElement('button');
						newChild.id = 'callOfficePhone'
						newChild.style.textAlign = 'center'
						// TODO: title 提示需要处理!!!
						newChild.title = 'Call office phone'
						newChild.className = 'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_small c-wysiwyg_container__button'
						newChild.ariaLabel = 'Call office phone'
						newChild.innerHTML = '<i class="c-icon c-icon--phone" type="phone" aria-hidden="true"></i>';
						newChild.onclick = slackAppExpand.makeCall
						audioComposerButton.parentElement.appendChild(newChild)
					}
				}
			}else if(callOfficeBtn){
				callOfficeBtn.style.display = 'none'
			}
		}else {
			if(callOfficeBtn){
				callOfficeBtn.style.display = 'none'
			}
		}
	},

	checkForAWhile: function (){
		if(slackAppExpand.headerActionCheckInterval){
			slackAppExpand.clearHeaderActionCheckInterval()
		}

		let count = 0
		slackAppExpand.headerActionCheckInterval = setInterval(function (){
			count++
			if(count > 10){
				slackAppExpand.clearHeaderActionCheckInterval()
			}else {
				slackAppExpand.addNewChatCallButton()
			}
		}, 200)
	},

	clearHeaderActionCheckInterval: function (){
		if(slackAppExpand.headerActionCheckInterval){
			clearInterval(slackAppExpand.headerActionCheckInterval)
			slackAppExpand.headerActionCheckInterval = null
		}
	},

	listenHrefChange: function (){
		if(slackAppExpand.pathname !== location.pathname){
			slackAppExpand.pathname = location.pathname
			slackAppExpand.checkForAWhile()
		}
	}
}


/*******************************************************************************************************************/
/******************************************* window 监听事件 *********************************************************/
/*******************************************************************************************************************/

window.onload = function (){
	if(window.location.href.indexOf('im.dingtalk') >= 0){          // dingtalk
		insertConfigArea()

		setTimeout(function (){
			pageResize();
			makeGRPConfigBtn()
		}, 2*1000)

		pageMutationObserver()
	}else if(window.location.href.indexOf('app.slack.com') >= 0){   // slack
		slackAppExpand.getTeamsInfoFromLocalStorage()

		if(slackAppExpand.userTeams){
			slackAppExpand.getTeamsMembers()
		}

		setTimeout(function (){
			console.info('[EXT] add new button if can do ')
			slackAppExpand.checkForAWhile()
		}, 2000)
	}
}

/**
 * 点击遮罩层时关闭弹框
 * @param event
 */

window.onclick = function (event){
	if(window.location.href.indexOf('im.dingtalk') >= 0){
		if(event.srcElement && event.srcElement.id === 'xConfigMaskLayer'){
			hiddenConfigArea()
		}
		checkToolBar()
	}else if(window.location.href.indexOf('app.slack.com') >= 0){
		slackAppExpand.listenHrefChange()
	}
}
document.onkeyup = function(e) {
	if(window.location.href.indexOf('im.dingtalk') >= 0){
		// 兼容FF和IE和Opera
		let event = e || window.event;
		let key = event.which || event.keyCode || event.charCode;
		if (key === 13) {
			/*Do something. 调用一些方法*/
			checkToolBar()
		}
	}else if(window.location.href.indexOf('app.slack.com') >= 0){
		slackAppExpand.listenHrefChange()
	}
};

window.onmousedown = function (event){
	if(window.location.href.indexOf('im.dingtalk') >= 0){
		if(event && event.button === 0){
			// 换键会存在问题!!
			checkToolBar()
		}
	}else if(window.location.href.indexOf('app.slack.com') >= 0){
		slackAppExpand.listenHrefChange()
	}
}

/*******************************************************************************************************************/
/******************************************* Content-script 和 backgroundJS 间的通信处理*******************************/
/*******************************************************************************************************************/

/**
 *  发送
 * @param message 内容
 * @param callback 回调
 */
function sendMessageToBackgroundJS(message, callback){
	if(chrome.runtime && chrome.runtime.sendMessage){
		// todo: add lang info
		message.latestLangInfo = localStorage.getItem('latest_lang_info')
		message.requestType = 'contentMessage2Background'

		console.log(message)
		chrome.runtime.sendMessage(message, function(response) {
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
		if(request && request.requestType === 'backgroundMessage2ContentScript'){
			switch (request.cmd){
				case "autoLogin":  // 钉钉首次加载页面，获取信息后自动登录
					if(request.data){
						updateInputValue(request.data)
					}
					break
				case "loginStatus":
					console.info('login return data: ', request.response)
					if(request.response && request.response.response === "error"){
						alert('请点击左上角配置页面进行登录')
					}
					showTipInPage(request.response)
					break
				case 'showTip':  // 显示tip提示
					showTipInPage(request)
					break
				case "updateConfig":  // 通过background js更新和显示配置信息
					if(request.data){
						updateInputValue(request.data)
					}
					break
				case "setAccountLists":
					XConfigObj.accountLists = request.accountLists
					// reloadAccountSelectOptions()
					break
				case "showContentConfig":
					console.log('login first, show config area')
					showConfigArea()
					break
				case 'popupOpen':
					hiddenConfigArea()
					break
				case "pageReload":
					console.log('Reload the page after authorization')
					if(confirm('完成授权后重新加载页面') === true){
						window.location.reload(true)
					}
					break
				default:
					break
			}
		}
		sendResponse('request success');
	});
}
/*****************************************************************************************************/
