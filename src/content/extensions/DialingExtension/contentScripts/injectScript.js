/**
 * For dingTalk get user Extension
 */
if(window.location.href.indexOf('im.dingtalk') >= 0) {
	let inject = '(' + function () {
		console.warn("load WebSocket...")
		let socketClick2talk = {
			sendRequest: false,
			requestMid: '',
			calleeuid: '',
			socket: null,
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
				if (socketClick2talk.sendRequest) {
					let msgObj = JSON.parse(event.data);
					console.info("get request data: ", msgObj)
					if (msgObj.headers && msgObj.headers.mid === socketClick2talk.requestMid) {
						socketClick2talk.sendRequest = false
						let body = msgObj.body
						if (body.orgEmployees && body.orgEmployees.length) {
							let orgExtPropertyList = body.orgEmployees[0].orgExtPropertyList
							if (orgExtPropertyList && orgExtPropertyList.length) {
								let target = orgExtPropertyList.find(item => {
									return (item.itemName === "分机号" || item.itemName === "Extension")
								});
								let ext = target?.itemValue
								if (ext) {
									console.warn("get ext by uid: ", ext)
									let remoteNumberBtn = document.getElementById('callRemoteNumber')
									if (remoteNumberBtn) {
										remoteNumberBtn.value = ext
										remoteNumberBtn.click()
									} else {
										console.log('button not found')
									}
								}
							}
						}
					}
				}
			});
			socketClick2talk.socket = wsInstance
			return wsInstance;
		}
		_WebSocket.prototype = origWebSocket.prototype;
		_WebSocket.prototype.send = function (send) {
			return function (data) {
				return send.apply(this, arguments)
			};
		}(WebSocket.prototype.send)

		window.WebSocket = _WebSocket
		Object.freeze(window.WebSocket)
		Object.freeze(WebSocket)

		/*****************************************************************************************************/

		/**
		 * @param n 要生成的随机数位数
		 * @returns {string}
		 */
		function generateMixedMid(n) {
			let randomChoice = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
			let res = "";
			for (let i = 0; i < n; i++) {
				let id = Math.floor(Math.random() * randomChoice.length);
				res += randomChoice[id];
			}
			return res;
		}

		let remoteDomCheckInterval = setInterval(function () {
			let inputEle = document.getElementById('remoteTarget')
			if (inputEle) {
				clearInterval(remoteDomCheckInterval)
				inputEle.onclick = function () {
					if (socketClick2talk.socket) {
						if (socketClick2talk.socket && socketClick2talk.socket.readyState !== 1) {
							console.info('WebSocket is CLOSE!!!')
							if (confirm('检测到WebSocket异常，请刷新重试') === true) {
								window.location.reload(true)
							}
							return
						}

						// todo: 通过uid获取用户分机号等信息，在websocket onmessage中处理请求结果
						let mid = generateMixedMid(8) + ' 0'
						let calleeUID = inputEle.value
						let getUserProfileExtensionByUidData = {
							lwp: "/r/Adaptor/UserMixI/getUserProfileExtensionByUid",
							body: [calleeUID, null],
							headers: {mid: mid},
						}
						console.info("send request data: ", JSON.stringify(getUserProfileExtensionByUidData, null, '    '))
						socketClick2talk.socket.send(JSON.stringify(getUserProfileExtensionByUidData))
						socketClick2talk.sendRequest = true
						socketClick2talk.requestMid = mid
						socketClick2talk.calleeuid = calleeUID
					} else {
						console.warn("socket not exist.")
					}
					return false;
				}
			}
		}, 1000)
	} + ')();';

	let script = document.createElement('script');
	script.textContent = inject;
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}
