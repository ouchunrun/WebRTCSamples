
let inject = '(' + function () {

	let click2talk = {
		sendRequest : false,
		requestMid: '',
		calleeuid : '',
		socket: null,
		port: ''
	}

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
		if(avatar && avatar.length){
			// let selfUID = JSON.parse(sessionStorage.getItem('wk_token')).uid   // 钉钉登录用的uid
			if(click2talk.socket){
				// todo: 通过uid获取用户分机号等信息
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

	/**
	 * dingtalk auto full screen
	 */
	function resize() {
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
				resize()
			}, 1000)
		}
	}

	window.onresize = function () {
		resize();
	}
	window.onload = function (){
		setTimeout(function (){
			resize();
		}, 2*1000)

		pageMutationObserver()
	}
} + ')();';

let script = document.createElement('script');
script.textContent = inject;
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);
