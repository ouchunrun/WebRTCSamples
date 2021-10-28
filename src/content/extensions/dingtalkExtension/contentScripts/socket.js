//
// let inject = '(' + function () {
//
// 	/****************************************WebSocket override****************************************************/
// 	let origWebSocket = window.WebSocket
// 	_WebSocket = function (url, protocols) {
// 		let wsInstance = protocols ? new origWebSocket(url, protocols) : new origWebSocket(url)
// 		wsInstance.addEventListener("open", function () {
// 			console.info("Socket is open!");
// 		});
// 		wsInstance.addEventListener("close", function () {
// 			console.info("Socket is closed");
// 		});
// 		wsInstance.addEventListener("message", function (event) {
// 			if(click2talk.sendRequest){
// 				let msgObj = JSON.parse(event.data);
// 				console.info("get request data: ", msgObj)
// 				if( msgObj.headers && msgObj.headers.mid === click2talk.requestMid){
// 					click2talk.sendRequest = false
//
// 					let body = msgObj.body
// 					if(body.orgEmployees && body.orgEmployees.length){
// 						let orgExtPropertyList = body.orgEmployees[0].orgExtPropertyList
// 						if(orgExtPropertyList && orgExtPropertyList.length){
// 							let target = orgExtPropertyList.find(item =>{return item.itemName === "分机号"});
// 							let ext = target?.itemValue
// 							console.warn("get ext by uid: ", ext)
// 							if(ext){
// 								console.warn("这里通知插件去拨打电话呼叫： ", ext)
// 							}
// 						}
// 					}
// 				}
// 			}
// 		});
// 		click2talk.socket = wsInstance
// 		return wsInstance;
// 	}
// 	_WebSocket.prototype = origWebSocket.prototype;
// 	_WebSocket.prototype.send = function (send) {
// 		return function (data) {
// 			if(click2talk.sendRequest){
// 				// let msgObj = JSON.parse(data);
// 				console.info('send date to request message: \r\n', data);
// 			}
// 			return send.apply(this, arguments)
// 		};
// 	}(WebSocket.prototype.send)
//
// 	window.WebSocket = _WebSocket
// 	Object.freeze(window.WebSocket)
// 	Object.freeze(WebSocket)
// 	/*****************************************************************************************************/
// } + ')();';
//
// let script = document.createElement('script');
// script.textContent = inject;
// (document.head || document.documentElement).appendChild(script);
// script.parentNode.removeChild(script);
