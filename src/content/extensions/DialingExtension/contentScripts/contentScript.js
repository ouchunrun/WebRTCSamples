/*******************************************************************************************************************/
/********************************************dingtalk adaptation****************************************************/
/*******************************************************************************************************************/
let dingTalkAdaptation = {
	xConfigObj: {},
	grpCallConfig: null,
	// 配置页面添加的按钮
	serverInput: null,
	usernameInput: null,
	pwdInput: null,
	accountSelect: null,
	phoneNumberInput: null,
	submitBtn: null,
	makeCallBtn: null,
	closeButton: null,
	// 定时器
	toolBarCheckInterval: null,
	chatCallLinkCheckInterval: null,

	/**
	 * dingtalk auto full screen
	 */
	pageResize: function (){
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
				dingTalkAdaptation.pageResize()
			}, 1000)
		}
	},

	getUserUid: function (){
		let avatar = document.getElementsByClassName('avatar user-avatar ng-scope ng-isolate-scope')
		if(avatar && avatar.length) {
			let calleeUID = avatar[0].getAttribute('uid')
			console.log("[EXT] get calleeUID:", calleeUID)
			let inputEle = document.getElementById('remoteTarget')
			inputEle.value = calleeUID
			inputEle.click()

			let closeIconfont = document.getElementsByClassName('close iconfont')[0]
			if(closeIconfont){
				closeIconfont.click()
			}
		}
	},

	/**
	 * 监听页面元素变化：动态添加呼叫按钮
	 */
	pageMutationObserver: function (){
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
									console.log("[EXT] add call button")
									let langInfo = localStorage.getItem('latest_lang_info')
									let callBtn = document.createElement('button')
									callBtn.id = 'xCallButton'
									callBtn.type = 'button'
									callBtn.className = 'btn green ng-binding'
									callBtn.innerHTML = langInfo === 'en_US' ? 'GRP Call' : '呼叫办公账号'
									callBtn.onclick = dingTalkAdaptation.getUserUid
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
	},

	/**
	 * 添加左侧配置按钮
	 */
	insertConfigArea: function (){
		/**
		 * 页面插入配置页面
		 * @type {HTMLElement}
		 */
		let insertParent = document.querySelector('body')
		// 添加遮罩层
		let maskLayer = document.createElement('div')
		maskLayer.id = 'xConfigMaskLayer'
		insertParent.appendChild(maskLayer);
		maskLayer.onclick = this.showConfigArea

		let langInfo = localStorage.getItem('latest_lang_info')
		console.log('[EXT] langInfo:', langInfo)
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
		this.serverInput = document.getElementById('x-serverAddress')
		this.usernameInput = document.getElementById('x-userName')
		this.pwdInput = document.getElementById('x-password')
		this.accountSelect = document.getElementById('x-account')
		this.phoneNumberInput = document.getElementById('x-phoneNumber')
		this.submitBtn = document.getElementById("submitConfig")
		this.makeCallBtn = document.getElementById('x-makeCall')
		this.closeButton = document.getElementById('closeFont')

		this.closeButton.onclick = this.hiddenConfigArea
		this.submitBtn.onclick = this.updateCallConfig
		this.makeCallBtn.onclick = this.checkToMakeCall      // 呼叫
		this.accountSelect.onchange = this.onSelectAccountChange
	},

	/**
	 * 下拉账号发生改变
	 */
	onSelectAccountChange: function (){
		let index = this.accountSelect.selectedIndex; // 选中索引
		let selectValue = this.accountSelect.options[index].value;

		this.xConfigObj.selectedAccountId = selectValue
		sendMessageToBackgroundJS({
			cmd: 'contentScriptAccountChange',
			data: {
				selectedAccountId: selectValue
			}
		})
	},

	/**
	 * 呼叫
	 */
	checkToMakeCall: function (){
		let phoneNumber = this.phoneNumberInput.value
		if(!phoneNumber){
			console.info('[EXT] account && phoneNumber is require')
			return
		}

		sendMessageToBackgroundJS({
			cmd: 'contentScriptMakeCall',
			data: {
				phonenumber: phoneNumber?.trim(),
			}
		})

		// 点击呼叫后关闭弹框
		this.hiddenConfigArea()
	},

	/**
	 * 设置使用的分机信息
	 */
	updateCallConfig: function (){
		let server = dingTalkAdaptation.serverInput.value
		let username = dingTalkAdaptation.usernameInput.value
		let pwd = dingTalkAdaptation.pwdInput.value
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
			console.info("[EXT] res: ", res)
		})
	},

	makeCallWithRemoteNumber: function (){
		let phoneNumber = document.getElementById('callRemoteNumber')?.value
		if(!phoneNumber){
			console.info("[EXT] phoneNumber is empty!!")
			alert('No callable number')
			return
		}
		sendMessageToBackgroundJS({
			cmd: 'contentScriptMakeCall',
			data: {
				phonenumber: phoneNumber?.trim(),
			}
		}, function (res){
			console.info("[EXT] res: ", res)
		})

		// 点击呼叫后关闭弹框
		dingTalkAdaptation.hiddenConfigArea()
	},

	/**
	 * 添加GPR配置页面的控制按钮
	 */
	makeGRPConfigBtn: function (){
		let This = this
		let domCheckInterval = setInterval(function (){
			let parent = document.getElementsByClassName('main-menus')[0]
			if(parent){
				clearInterval(domCheckInterval)
				let langInfo = localStorage.getItem('latest_lang_info')
				let tip = langInfo === 'en_US' ? 'GRPConfig' : 'GRP配置'
				let newItem = document.createElement('li')
				newItem.className = 'menu-item menu-micro-app ng-scope'
				newItem.innerHTML = '<div class="menu-item-content">' + '<i class="iconfont icon-modify-alias" style="font-size: 26px;font-weight: bold;color: brown;" title='+ tip +'></i></div>'
				newItem.onclick = This.showConfigArea
				newItem.style.display = 'none'
				parent.appendChild(newItem);

				let newItem2 = document.createElement('li')
				newItem2.innerHTML = '<input id="remoteTarget" style="display: none"><input id="callRemoteNumber" style="display: none">'
				parent.appendChild(newItem2);

				let btn = document.getElementById('callRemoteNumber')
				btn.onclick = This.makeCallWithRemoteNumber
			}
		}, 1000)
	},

	showConfigArea: function (){
		this.updateInputValue()
		this.accountSelectOptions()

		this.grpCallConfig = this.grpCallConfig || document.getElementById('grpCallConfig')
		if(this.grpCallConfig){
			this.grpCallConfig.style.opacity = '1'
			this.grpCallConfig.style['z-index'] = '2050'
		}

		let xConfigMaskLayer = document.getElementById('xConfigMaskLayer')
		if(xConfigMaskLayer){
			xConfigMaskLayer.style.opacity = '0.55'
			xConfigMaskLayer.style['z-index'] = '2040'
		}
	},

	/**
	 * 点击遮罩层时关闭弹框
	 */
	hiddenConfigArea: function (){
		this.grpCallConfig = this.grpCallConfig || document.getElementById('grpCallConfig')
		if(this.grpCallConfig){
			this.grpCallConfig.style.opacity = '0'
			this.grpCallConfig.style['z-index'] = '-999'
		}

		let xConfigMaskLayer = document.getElementById('xConfigMaskLayer')
		if(xConfigMaskLayer){
			xConfigMaskLayer.style.opacity = '0'
			xConfigMaskLayer.style['z-index'] = '-999'
		}
	},

	checkToolBar: function (){
		let This = this
		if(This.toolBarCheckInterval){
			clearInterval(This.toolBarCheckInterval)
			This.toolBarCheckInterval = null
		}

		let startTime = Date.now()
		This.toolBarCheckInterval = setInterval(function (){
			let endTime = Date.now()
			if(endTime - startTime > 2000){   // 2s
				clearInterval(This.toolBarCheckInterval)
				This.toolBarCheckInterval = null
			}else {
				let chatToolBar = document.getElementsByClassName('tool-bar')[0]
				if(chatToolBar){
					clearInterval(This.toolBarCheckInterval)
					This.inertNewChatCallLink()
				}
			}
		}, 100)
	},

	inertNewChatCallLink: function (){
		let This = this
		if(This.chatCallLinkCheckInterval){
			clearInterval(This.chatCallLinkCheckInterval)
			This.chatCallLinkCheckInterval = null
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
		This.chatCallLinkCheckInterval = setInterval(function (){
			let endTime = Date.now()
			let shortcutCall = document.getElementById('shortcutCall')
			if(endTime - startTime > 2000 || (shortcutCall && shortcutCall.classList.contains('newChatCallLinkFadeIn'))){   // 2s
				clearInterval(This.chatCallLinkCheckInterval)
			}else {
				let chatCallLink = document.getElementsByClassName('chat-call-link')[0]
				if(chatCallLink && chatCallLink.classList.contains('fade-in')){
					clearInterval(This.chatCallLinkCheckInterval)

					if(shortcutCall){
						shortcutCall.onclick = function (){
							chatCallLink.click()
						}
						shortcutCall.classList.add('newChatCallLinkFadeIn')
					}
				}
			}
		}, 100)
	},

	/**
	 * 更新账号选择下拉框选项
	 * [
	 *  {id: 1, sip_server: '192.168.125.254', sip_id: '366102', name: '366102', reg: 1}
	 *  {id: 2, sip_server: '192.168.120.254', sip_id: '3661', name: '3661', reg: 1}
	 * ]
	 */
	accountSelectOptions: function (){
		if(!this.accountSelect){
			return
		}

		let options = '<option value="0">First Available</option>'
		let checkOption = ''
		let selectAccount = parseInt(this.xConfigObj.selectedAccountId)
		if(this.xConfigObj.accountLists && this.xConfigObj.accountLists.length){
			for(let i = 0; i<this.xConfigObj.accountLists.length; i++){
				let acct = this.xConfigObj.accountLists[i]
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
		this.accountSelect.innerHTML = options
	},

	updateInputValue: function (data){
		let This = this
		if(data){
			/*更新 dingTalkAdaptation.xConfigObj配置*/
			if(!This.xConfigObj){
				This.xConfigObj = {}
			}
			Object.keys(data).forEach(function (key){
				This.xConfigObj[key] = data[key]
			})
		}

		if(This.xConfigObj){
			if(This.xConfigObj.url && This.serverInput){
				This.serverInput.value = This.xConfigObj.url
			}
			if(This.xConfigObj.username && This.usernameInput){
				This.usernameInput.value = This.xConfigObj.username
			}
			if(This.xConfigObj.password && This.pwdInput){
				This.pwdInput.value = This.xConfigObj.password
			}
		}
	},

	/**
	 * 页面显示提示
	 */
	showTipInPage: function (data){
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
			console.log('[EXT] clear tip')
			xMessageTip.innerText = ''
			xMessageTip.style.background = ''
		}, 2000)
	}
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
							membersList[member.real_name] = {
								real_name: member.profile.real_name,
								display_name: member.profile.display_name,
								phone: member.profile.phone,
								email: member.profile.email,
								team: member.profile.team,
								id: member.id
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
	 * memberInfo: {
		display_name: "chrou",
		email: "chrou@grandstream.cn",
		id: "U02LWUBFLH4",
		phone: "",
		real_name: "orc",
		team: "U9X6XLVEE",
	 * }
	 */
	slackMakeCall: function (phoneNumber){
		if(!phoneNumber){
			console.log('[EXT] The user does  not configured phone number')
		}else {
			console.log('[EXT] get phoneNumber, ', phoneNumber)
			sendMessageToBackgroundJS({
				cmd: 'contentScriptMakeCall',
				data: {
					phonenumber: phoneNumber?.trim(),
				}
			})
		}
	},

	searchPhoneNumber: function (){
		let phoneNumber
		let memberNameHeader = document.getElementsByClassName('p-view_header__member_name')[0]
		let memberName = memberNameHeader?.innerText
		if(memberName){
			console.log('[EXT] get member name, ', memberName)
			let member = slackAppExpand.teamsMembers && slackAppExpand.teamsMembers[memberName]
			phoneNumber = member?.phone

			if(!phoneNumber && slackAppExpand.teamsMembers){
				phoneNumber = getNumberFromPhoneBook({
					email: member?.email,
					calleeName: member?.real_name
				})
			}
		}

		console.log('[EXT] get phone number, ', phoneNumber)
		return phoneNumber
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
				// 先检查是否能获取到号码，获取不到则不显示呼叫按钮
				let phoneNumber = slackAppExpand.searchPhoneNumber()
				if(!phoneNumber){
					console.log('[EXT] phoneNumber not found')
					if(callOfficeBtn){
						callOfficeBtn.style.display = 'none'
					}
					return
				}

				if(callOfficeBtn){
					callOfficeBtn.style.display = 'block'
				}else {
					// step2: add new call btn in chat bar
					let audioComposerButton = document.getElementsByClassName('p-audio_composer_button')[0]
					if (audioComposerButton) {
						let newChild = document.createElement('button');
						newChild.id = 'callOfficePhone'
						newChild.style.textAlign = 'center'
						newChild.className = 'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_small c-wysiwyg_container__button'
						newChild.ariaLabel = 'Call office phone'
						newChild.innerHTML = '<i class="c-icon c-icon--phone" type="phone" aria-hidden="true"></i>';
						newChild.onclick = function (){
							slackAppExpand.slackMakeCall(phoneNumber)
						}

						let node = document.createElement("div")
						newChild.onmouseover = function (event){
							// Todo: mouseover和mouseenter 冒泡处理（https://cxymm.net/article/cffh_/120227409）
							let target = event.relatedTarget
							while (target) {
								if (this.isEqualNode(target)) {
									return
								}
								target = target.parentNode
							}

							setTimeout(function (){
								// 设置鼠标悬浮时tip提示样式
								node.id = 'callOfficePhoneTip'
								node.className = 'ReactModalPortal'
								let newChildPos = newChild.getBoundingClientRect()
								let tipPosition = {
									left: newChildPos.left - newChildPos.height - 15,
									top: newChildPos.top - newChildPos.height - 19
								}
								node.innerHTML = `
							<div class="ReactModal__Overlay ReactModal__Overlay--after-open c-popover c-popover--no-pointer c-popover--z_above_fs c-popover--fade"
						         style="animation-duration: 80ms;">
						        <div class="ReactModal__Content ReactModal__Content--after-open popover c-popover__content" aria-hidden="true"
						             style="position: absolute; left: `+ tipPosition.left +`px; top:`+ tipPosition.top +`px;outline: none; transition-duration: 80ms;">
						            <div role="presentation">
						                <div id="sk-tooltip-16" role="tooltip" class="c-tooltip__tip c-tooltip__tip--top c-tooltip__tip--small"
						                     data-qa="tooltip-tip" data-sk="tooltip">Call office phone
						                    <div class="c-tooltip__tip__arrow" style="left: 61.3438px; right: initial;"></div>
						                </div>
						            </div>
						        </div>
						    </div>`
								document.body.classList.add('ReactModal__Body--open')
								document.body.appendChild(node)
							}, 500)
						}
						newChild.onmouseout = function (event){
							let target = event.relatedTarget
							while (target) {
								if (this.isEqualNode(target)) {
									return
								}
								target = target.parentNode
							}
							node.parentNode?.removeChild(node)
							document.body.classList.remove('ReactModal__Body--open')
						}
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
/********************************************** 163 qiye mail adaptation********************************************/
/*******************************************************************************************************************/

let company163MailAdaptation = {
	mailLocationMatch: function (){
		if(window.location.href.indexOf('module=mbox.ListModule') >= 0){
			// 检测邮件界面节点变化
			company163MailAdaptation.pageMutationObserver()
		}else if(window.location.href.indexOf('module=outlink.OutlinkModule') >= 0){
			// 检测企业通讯录
			company163MailAdaptation.outLinkModuleAddCallButton()
		}else if(window.location.href.indexOf('module=contact.ContactModule') >= 0){
			// 检测个人通讯录
			company163MailAdaptation.contactModuleAddCallButton()
		}
	},

	// TODO: 收件箱 1.添加页面元素监听，tip提示出来后，添加呼叫连接， 需要根据通讯录查找号码，因为大部分人的邮箱配置里面是没有电话号码的
	pageMutationObserver: function (){
		let pageMutationObserverInterval
		let This = this
		let article = document.getElementById('dvContainer')
		let setObserve = function (){
			if(!article){
				console.log('[EXT] dvContainer NOT EXIST')
				return
			}

			let  options = {'childList': true, 'attributes':true, 'subtree': true,}
			let callback = function (mutationsList){
				mutationsList.forEach(function(mutation) {
					switch (mutation.type){
						case 'childList':
							if(mutation.addedNodes && mutation.addedNodes.length){
								let addedNodes = mutation.addedNodes[0]
								if(addedNodes.id && addedNodes.id.indexOf('_mail_layer') >= 0){
									This.mailPageAddCallButton(addedNodes)
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

		if(!article){
			let count = 0
			// 3秒内没有检查到节点，就不进行观察
			pageMutationObserverInterval = setInterval(function (){
				article = document.getElementById('dvContainer');
				if(article || count > 10){
					clearInterval(pageMutationObserverInterval)
					pageMutationObserverInterval = null

					if(article){
						setObserve()
					}
				}
				count ++
			}, 300)
		}else {
			setObserve()
		}
	},

	// 邮件页面添加拨号按钮
	mailPageAddCallButton: function (nodes){
		let userLayerItem = nodes.getElementsByClassName('nui-userLayer-name nui-userLayer-item')[0]
		if(userLayerItem){
			let userLayerInnerText = userLayerItem.innerText.split('\n')
			if(!userLayerInnerText || !userLayerInnerText.length){
				return
			}

			let name = userLayerInnerText[1] // 获取姓名
			let callBtn = nodes.getElementsByClassName('make-grp-call')[0]
			if(!callBtn && (name !== '我' && name.toLocaleString() !== 'me')){
				let addressItem = nodes.getElementsByClassName('nui-userLayer-address')[0]
				let address = addressItem?.firstChild.innerText
				let phoneNumber = getNumberFromPhoneBook({
					email: address,
					calleeName: name
				})

				if(phoneNumber){
					let newItem = document.createElement('span')
					newItem.style['cursor'] = 'pointer'
					newItem.style['margin-right'] = '5px'
					newItem.className = 'nui-userLayer-item-ext make-grp-call'
					newItem.innerHTML = '<svg class="icon" style="width: 16px;height: 16px;vertical-align: middle;fill: #a1c9eb;position: relative;top: -2px;" viewBox="0 0 1024 1024" p-id="1678"><path d="M732.6 683.6c2.2 0.9 50.8 21 90.5 49.3 14.9 10.8 40 28.8 44 54.3 2.6 17.6-3.9 36.8-20.2 58.9-3.9 5.8-40.3 55.1-109.9 68.3-19.1 3.6-39.2 4.3-60 1.9-21.7-2.5-44.4-8.1-67.3-17-90.1-33.1-164.2-83.9-240.4-164.3-130.9-138.4-158-272.9-162.1-298.5C186.3 319 275 254.3 285.1 247.4c14-9.9 26.6-15.9 38.9-18.2 3.4-0.7 7.1-1.1 11.2-1.1 2.1 0 4.2 0.1 6.2 0.3 11.1 1.2 27.4 6.9 41.2 26.9 19 27.1 39.3 67 56.1 109.9 17.6 44.3-5.6 62.1-28.1 79.4l-0.9 0.6s-40.4 26.7-47.6 31.4c-6.9 4.6-9.4 14-5.3 21.3 27.4 50.7 64.4 101.7 107 147.3 42 44.9 89.4 84.7 137.2 115.1 2.3 1.6 5.3 2.6 8.5 2.6 1 0 2-0.1 2.9-0.3l1.2-0.4c4.8-1.3 8.5-4.8 10.4-9.2 4.6-8.8 12.7-23.2 21.5-35.7 16.9-23.4 33.7-36.4 51.1-39.7 2.7-0.5 5.9-0.9 9.1-0.9 1.9 0 3.8 0.1 5.6 0.3 4.6 0.2 12.4 2.8 21.3 6.6z" p-id="1679"></path></svg>' +
						'<a class="nui-txt-cLink js-component-link " hidefocus="hidefocus">拨号</a>'
					newItem.onclick = function (){
						company163MailAdaptation.mailMakeCall(phoneNumber)
					}
					userLayerItem.appendChild(newItem)
				}else {
					// 通讯录中查不到号码时，不添加拨号按钮
				}
			}else {
				console.log('[EXT] call button is exist')
			}
		}
	},

	/**
	 * 企业通讯录
	 */
	outLinkModuleAddCallButton: function (){
		let mailListBody
		let domInsert = function (trRows){
			for(let i = 0; i<trRows.length; i++){
				let colPhoneTr = trRows[i].getElementsByClassName('Corp-corpCnta-main-colPhone')[0]
				let colJobTr = trRows[i].getElementsByClassName('Corp-corpCnta-main-colJob')[0]


				/* start
				 * ********************************************************************************************
				 * TODO: 163 mail Content rendering misplaced when searching for contacts
				 */
				let phoneTrInnerText = colPhoneTr && colPhoneTr.children[0]?.innerText
				let jobTrInnerText = colJobTr && colJobTr.children[0]?.innerText
				if(phoneTrInnerText){
					if(isNaN(phoneTrInnerText) && jobTrInnerText && !isNaN(jobTrInnerText)){
						colPhoneTr = colJobTr
					}
				}else if(jobTrInnerText && !isNaN(jobTrInnerText)){
					colPhoneTr = colJobTr
				}
				/*end********************************************************************************************/

				let colPhone = colPhoneTr?.innerText
				if(!colPhone){
					let colEmail = trRows[i].getElementsByClassName('Corp-corpCnta-main-colEmail')[0]?.innerText
					if(colEmail){
						colPhone = getNumberFromPhoneBook({
							email: colEmail,
							calleeName: '这里要获取姓名'
						})
						if(colPhone){
							colPhoneTr.firstChild.innerText = colPhone
						}
					}
				}

				if(colPhone && !trRows[i].getElementsByClassName('make-grp-call')[0]){  // 避免重复添加按钮
					let newItem = document.createElement('span')
					newItem.className = 'make-grp-call'
					newItem.style = 'display: inline-block;float: right;width: 18px; height: 18px'
					newItem.title = '点击拨号'
					newItem.innerHTML = '<svg class="icon" style="width: 18px;height: 18px;vertical-align: middle;fill: #36c;overflow: hidden;" viewBox="0 0 1024 1024" p-id="1678"><path d="M732.6 683.6c2.2 0.9 50.8 21 90.5 49.3 14.9 10.8 40 28.8 44 54.3 2.6 17.6-3.9 36.8-20.2 58.9-3.9 5.8-40.3 55.1-109.9 68.3-19.1 3.6-39.2 4.3-60 1.9-21.7-2.5-44.4-8.1-67.3-17-90.1-33.1-164.2-83.9-240.4-164.3-130.9-138.4-158-272.9-162.1-298.5C186.3 319 275 254.3 285.1 247.4c14-9.9 26.6-15.9 38.9-18.2 3.4-0.7 7.1-1.1 11.2-1.1 2.1 0 4.2 0.1 6.2 0.3 11.1 1.2 27.4 6.9 41.2 26.9 19 27.1 39.3 67 56.1 109.9 17.6 44.3-5.6 62.1-28.1 79.4l-0.9 0.6s-40.4 26.7-47.6 31.4c-6.9 4.6-9.4 14-5.3 21.3 27.4 50.7 64.4 101.7 107 147.3 42 44.9 89.4 84.7 137.2 115.1 2.3 1.6 5.3 2.6 8.5 2.6 1 0 2-0.1 2.9-0.3l1.2-0.4c4.8-1.3 8.5-4.8 10.4-9.2 4.6-8.8 12.7-23.2 21.5-35.7 16.9-23.4 33.7-36.4 51.1-39.7 2.7-0.5 5.9-0.9 9.1-0.9 1.9 0 3.8 0.1 5.6 0.3 4.6 0.2 12.4 2.8 21.3 6.6z" p-id="1679"></path></svg>'
					newItem.onclick = function (e){
						e.stopPropagation()
						company163MailAdaptation.mailMakeCall(colPhone)
					}
					colPhoneTr.appendChild(newItem)
				}
			}
		}

		let buttonCheck = function (){
			let trRows = mailListBody.rows
			if(trRows && trRows.length){
				domInsert(trRows)
			}else {
				let callback = function (mutationsList){
					mutationsList.forEach(function(mutation) {
						switch (mutation.type){
							case 'childList':
								if(mutation.addedNodes && mutation.addedNodes.length){
									console.log('[EXT] mutation.addedNodes')
									domInsert(mutation.addedNodes)
								}
								break
							default:
								break
						}
					});
				}
				const observer = new MutationObserver(callback)
				let options = {'childList': true}
				observer.observe(mailListBody, options);
			}
		}

		// 获取联系人列表的table>tbody
		let iframes = document.querySelectorAll('iframe')
		for(let i = 0; i<iframes.length; i++){
			let iframe = iframes[i]
			if(iframe && iframe.style.display !== 'none' && iframe.classList.contains('frame-main-cont-iframe')){
				mailListBody = iframe.contentDocument.getElementsByClassName('nui-table-body')[0]
				if(!mailListBody){
					let count = 0
					let bodyInterval = setInterval(function (){
						mailListBody = iframe.contentDocument.getElementsByClassName('nui-table-body')[0]
						if(count > 15 || mailListBody){
							clearInterval(bodyInterval)
							bodyInterval = null
							if(mailListBody){
								buttonCheck()
							}
						}
						count++
					}, 200)
				}else {
					buttonCheck()
				}
			}
		}
	},

	/**
	 * 个人通讯录界面
	 */
	contactModuleAddCallButton: function (){
		let domInsert = function (trRows){
			for(let i = 0; i<trRows.length; i++){
				let colPhoneTr = trRows[i].getElementsByClassName('nui-table-cell iB0')[0]
				let colPhone = colPhoneTr?.innerText
				if(!colPhone){
					let colEmail = trRows[i].getElementsByClassName('nui-table-cell iA0')[0]?.innerText
					if(colEmail){
						colPhone = getNumberFromPhoneBook({
							email: colEmail,
							calleeName: '这里要获取姓名'
						})
						if(colPhone){
							colPhoneTr.firstChild.innerText = colPhone
						}
					}
				}

				if(colPhone && !trRows[i].getElementsByClassName('make-grp-call')[0]){ // 避免重复添加按钮
					let newItem = document.createElement('span')
					newItem.className = 'make-grp-call'
					newItem.style = 'display: inline-block;float: right;'
					newItem.title = '点击拨号'
					newItem.innerHTML = '<svg class="icon" style="width: 18px;height: 18px;vertical-align: middle;fill: #36c;overflow: hidden;" viewBox="0 0 1024 1024" p-id="1678"><path d="M732.6 683.6c2.2 0.9 50.8 21 90.5 49.3 14.9 10.8 40 28.8 44 54.3 2.6 17.6-3.9 36.8-20.2 58.9-3.9 5.8-40.3 55.1-109.9 68.3-19.1 3.6-39.2 4.3-60 1.9-21.7-2.5-44.4-8.1-67.3-17-90.1-33.1-164.2-83.9-240.4-164.3-130.9-138.4-158-272.9-162.1-298.5C186.3 319 275 254.3 285.1 247.4c14-9.9 26.6-15.9 38.9-18.2 3.4-0.7 7.1-1.1 11.2-1.1 2.1 0 4.2 0.1 6.2 0.3 11.1 1.2 27.4 6.9 41.2 26.9 19 27.1 39.3 67 56.1 109.9 17.6 44.3-5.6 62.1-28.1 79.4l-0.9 0.6s-40.4 26.7-47.6 31.4c-6.9 4.6-9.4 14-5.3 21.3 27.4 50.7 64.4 101.7 107 147.3 42 44.9 89.4 84.7 137.2 115.1 2.3 1.6 5.3 2.6 8.5 2.6 1 0 2-0.1 2.9-0.3l1.2-0.4c4.8-1.3 8.5-4.8 10.4-9.2 4.6-8.8 12.7-23.2 21.5-35.7 16.9-23.4 33.7-36.4 51.1-39.7 2.7-0.5 5.9-0.9 9.1-0.9 1.9 0 3.8 0.1 5.6 0.3 4.6 0.2 12.4 2.8 21.3 6.6z" p-id="1679"></path></svg>'
					newItem.onclick = function (e){
						e.stopPropagation()
						company163MailAdaptation.mailMakeCall(colPhone)
					}
					colPhoneTr.appendChild(newItem)
				}
			}
		}

		let buttonCheck = function (tbody){
			let trRows = tbody.rows
			if(trRows && trRows.length){
				domInsert(trRows)
			}else {
				let callback = function (mutationsList){
					mutationsList.forEach(function(mutation) {
						switch (mutation.type){
							case 'childList':
								if(mutation.addedNodes && mutation.addedNodes.length){
									domInsert(mutation.addedNodes)
								}
								break
							default:
								break
						}
					});
				}
				const observer = new MutationObserver(callback)
				let options = {'childList': true, 'subtree': true }
				observer.observe(tbody, options);
			}
		}

		let mailListBody = document.getElementsByClassName('nui-table-body')[0]
		if(!mailListBody){
			let count = 0
			let bodyInterval = setInterval(function (){
				mailListBody = document.getElementsByClassName('nui-table-body')[0]
				if(count > 15 || mailListBody){
					clearInterval(bodyInterval)
					bodyInterval = null
					if(mailListBody){
						buttonCheck(mailListBody)
					}
				}
				count++
			}, 200)
		}else {
			buttonCheck(mailListBody)
		}
	},

	mailMakeCall: function (phoneNumber){
		if(!phoneNumber){
			console.log('[EXT] not found available phone number')
			return
		}
		console.log('[EXT] do make call with phoneNumber:', phoneNumber)
		sendMessageToBackgroundJS({
			cmd: 'contentScriptMakeCall',
			data: {
				phonenumber: phoneNumber,
			}
		})
	}
}


/**
 * 使用邮箱根据本地通讯录查找号码
 * @param data: {
 *     email: '被叫邮箱',
 *     calleeName: '被叫姓名'
 * }
 */
function getNumberFromPhoneBook(data){
	if(!data || (!data.email && !data.calleeName)){
		console.log('[EXT] There are no parameters to query')
		return ''
	}

	let phoneNumber = ''
	let phoneBooks = JSON.parse(localStorage.getItem('X-extendedContacts'))
	if(phoneBooks){
		if(data.email){
			// 优先查询ldap
			if(phoneBooks.ldap){
				for (let i = 0; i<phoneBooks.ldap.length; i++){
					if(phoneBooks.ldap[i].email === data.email){
						phoneNumber = phoneBooks.ldap[i].AccountNumber
						break
					}
				}
			}

			if(!phoneNumber){
				// 然后再查询本地通讯录
				let key = 'localAddressBook'
				if(phoneBooks.deviceId){
					key = key + '_' + phoneBooks.deviceId.indexOf('://') ? phoneBooks.deviceId.split('://')[1] : phoneBooks.deviceId
				}

				if(phoneBooks[key]){
					let localAddressBook = phoneBooks[key]
					for (let j = 0; j<localAddressBook.length; j++){
						if(localAddressBook[j].email === data.email){
							phoneNumber = localAddressBook[j].Phone?.phonenumber
							break
						}
					}
				}
			}
		}
	}
	return phoneNumber
}


/*******************************************************************************************************************/
/******************************************* window 监听事件 *********************************************************/
/*******************************************************************************************************************/

window.onload = function (){
	let urlMatch = false
	if(window.location.href.indexOf('im.dingtalk') >= 0){          // dingtalk
		urlMatch = true
		dingTalkAdaptation.insertConfigArea()

		setTimeout(function (){
			dingTalkAdaptation.pageResize();
			dingTalkAdaptation.makeGRPConfigBtn()
		}, 2*1000)

		dingTalkAdaptation.pageMutationObserver()

		window.onresize = function () {
			dingTalkAdaptation.pageResize();
		}
	}else if(window.location.href.indexOf('app.slack.com') >= 0){   // slack
		urlMatch = true
		slackAppExpand.getTeamsInfoFromLocalStorage()

		if(slackAppExpand.userTeams){
			slackAppExpand.getTeamsMembers()
		}

		setTimeout(function (){
			console.info('[EXT] add new button if can do ')
			slackAppExpand.checkForAWhile()
		}, 2000)
	}else if(window.location.href.indexOf('mail.qiye.163.com') >= 0 || window.location.href.indexOf('mail.grandstream.cn') >= 0){   // 163 网易企业邮箱
		urlMatch = true
		company163MailAdaptation.mailLocationMatch()
		window.onhashchange = company163MailAdaptation.mailLocationMatch
	}

	if(urlMatch){
		// 发送请求，获取通讯录信息
		sendMessageToBackgroundJS({cmd: 'contentScriptGetPhoneBook'})
	}
}

window.onclick = function (event){
	if(window.location.href.indexOf('im.dingtalk') >= 0){
		if(event.srcElement && event.srcElement.id === 'xConfigMaskLayer'){
			dingTalkAdaptation.hiddenConfigArea()
		}
		dingTalkAdaptation.checkToolBar()
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
			dingTalkAdaptation.checkToolBar()
		}
	}else if(window.location.href.indexOf('app.slack.com') >= 0){
		slackAppExpand.listenHrefChange()
	}
};

window.onmousedown = function (event){
	if(window.location.href.indexOf('im.dingtalk') >= 0){
		if(event && event.button === 0){
			// 换键会存在问题!!
			dingTalkAdaptation.checkToolBar()
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
						if(window.location.href.indexOf('im.dingtalk') >= 0){
							dingTalkAdaptation.updateInputValue(request.data)
						}
					}
					break
				case "loginStatus":
					console.info('[EXT] login return data: ', request.response)
					if(request.response && request.response.response === "error"){
						alert('请点击左上角配置页面进行登录')
					}
					if(window.location.href.indexOf('im.dingtalk') >= 0){
						dingTalkAdaptation.showTipInPage(request.response)
					}
					break
				case 'showTip':  // 显示tip提示
					if(window.location.href.indexOf('im.dingtalk') >= 0){
						dingTalkAdaptation.showTipInPage(request)
					}
					break
				case "updateConfig":  // 通过background js更新和显示配置信息
					if(request.data){
						if(window.location.href.indexOf('im.dingtalk') >= 0){
							dingTalkAdaptation.updateInputValue(request.data)
						}
					}
					break
				case "setAccountLists":
					if(window.location.href.indexOf('im.dingtalk') >= 0){
						dingTalkAdaptation.xConfigObj.accountLists = request.accountLists
					}
					// accountSelectOptions()
					break
				case "showContentConfig":
					console.log('[EXT] login first, show config area')
					if(window.location.href.indexOf('im.dingtalk') >= 0){
						dingTalkAdaptation.showConfigArea()
					}
					break
				case 'popupOpen':
					if(window.location.href.indexOf('im.dingtalk') >= 0){
						dingTalkAdaptation.hiddenConfigArea()
					}
					break
				case "pageReload":
					console.log('[EXT] Reload the page after authorization')
					if(confirm('完成授权后重新加载页面') === true){
						window.location.reload(true)
					}
					break
				case 'phoneBookUpdate':
					if(request.data && request.data.phoneBooks && JSON.stringify(request.data.phoneBooks) !== '{}'){
						let info = request.data.phoneBooks
						info['deviceId'] = request.data.deviceId
						localStorage.setItem('X-extendedContacts', JSON.stringify(info))
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
