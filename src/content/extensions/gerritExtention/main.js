(function () {
	/* Log Debug Start */
	let log = {};
	log.debug = window.debug('gerrit:DEBUG')
	log.log = window.debug('gerrit:LOG')
	log.info = window.debug('gerrit:INFO')
	log.warn = window.debug('gerrit:WARN')
	log.error = window.debug('gerrit:ERROR')
	/* Log Debug End */
	log.info('Gerrit extension load...')

	let Tasks = {
		xGerritAuth: '',
		branch: '',
		version: '',
		isCommitMessageUpdate: false,

		init: function () {
			window.onload = function (){
				// add exportLog button
				let parent = document.querySelector('body')
				let exportLogButton = document.createElement('button')
				exportLogButton.id = 'exportLog'
				exportLogButton.innerHTML = 'exportLog'
				exportLogButton.style.display = 'none'
				exportLogButton.onclick = debug.exportLog
				parent.appendChild(exportLogButton)

				document.onclick = function (event){
					let btnVal = (event.target && event.target.innerText)
					if(!btnVal){
						return
					}

					if(btnVal === 'Cherry Pick' || btnVal.match('Cherry Pick')) {
						Tasks.checkProject(true)
					}
				}

				Tasks.getXGerritAuth()
				// 初始授权
				Tasks.getBranchVersion({branch: 'master'})

				setTimeout(function (){
					Tasks.checkProject()
				}, 1000)
			}

			// 无刷新监听URL的变化
			window.onhashchange=function(event){
				Tasks.checkProject()
			}
		},

		/**
		 * 检查当前是否是GRP项目
		 */
		checkProject: function (cherryPick){
			let anchorEle = document.getElementsByClassName('gwt-Anchor')
			if(anchorEle && anchorEle[0] && anchorEle[0].innerText){
				let changeId = anchorEle[0].innerText
				let url = window.location.origin + '/a/changes/' + changeId + '/detail?O=404'
				let xhr = new XMLHttpRequest();
				xhr.open('GET', url);
				xhr.setRequestHeader('X-Gerrit-Auth', Tasks.xGerritAuth)
				xhr.onreadystatechange = function (){
					if (xhr.readyState === 4 && Tasks.isNxx(2, xhr.status)){
						if(xhr.responseText && xhr.responseText.length > 4){
							let responseInfo = JSON.parse(xhr.responseText.substring(4))  // 去除头部用于防止攻击的 `)]}` 字符
							let project = responseInfo['project']
							let branch = responseInfo['branch']
							if((project && project.startsWith('GRP260X')) || (branch && branch.startsWith('GRP'))){
								log.info('current is GRP project...')
								if(cherryPick){
									Tasks.handleCherryPick()
								}else {
									log.warn("submit....")
									Tasks.changeSubmitClickEvent()
								}
							}
						}
					}
				}
				xhr.send();
			}
		},

		/**
		 * 修改submit onclick事件
		 */
		changeSubmitClickEvent: function (){
			log.info('change submit click event')
			let submitClass = 'com-google-gerrit-client-change-Actions_BinderImpl_GenCss_style-submit'
			let submitButton = document.getElementsByClassName(submitClass)[0]
			let handleCommitButton = function (){
				log.info("submit button innerText: " +  submitButton.innerText)
				if(submitButton.innerText === 'Submit'){
					if(submitButton.className.indexOf('commit-correction') < 0){
						log.info('add commit correction button')
						let parent = document.getElementById('change_actions')
						let newButton = document.createElement('button')
						newButton.id = 'commit-message-correction'
						newButton.innerHTML = '<div style="color: #fff">Submit</div>'
						newButton.style['background-image'] = '-webkit-linear-gradient(top, #4d90fe, #4d90fe)'
						newButton.style['float'] = 'right'
						newButton.style['z-index'] = 999
						parent.appendChild(newButton)

						submitButton.style.display = 'none'
						submitButton.classList.add('commit-correction')

						newButton.onclick = function (){
							log.warn("commit correction trigger click event")
							Tasks.isCommitMessageUpdate = true
							Tasks.checkCommitMessage()
						}
					}
				}else {
					// TODO: 没有显示submit按钮时，需要去除添加的button并恢复submit按钮的样式
					let commitCorrectionDom = document.getElementById('commit-message-correction');
					log.warn("no submit button, recover now.")
					if(commitCorrectionDom){
						log.info('removedNodes')
						commitCorrectionDom.remove()
					}
					submitButton.classList.remove('commit-correction')
				}
			}

			if(submitButton){
				log.info('has submit button...')
				const callback = function(mutationsList) {
					mutationsList.forEach(function(mutation) {
						log.info("mutation.type :", mutation.type)
						log.info('The ' + mutation.attributeName + ' attribute was modified. oldValue, ' + mutation.oldValue);
						switch (mutation.type){
							case 'attributes':
								if(mutation.attributeName === 'style' && mutation.oldValue === 'display: none;'){
									log.warn('show submit button')
									handleCommitButton()
								}
								break
							case 'childList':
								if(mutation.removedNodes && mutation.removedNodes.length){
									log.warn('submit button remove child node')
									handleCommitButton()
								}
								break
							default:
								break
						}
					});
				}
				const config = {
					attributes: true,
					attributeFilter: ["style"],
					attributeOldValue: true,
					attributeName: true,
					attributeNameSpace: true,
					childList: true,
					subtree: true
				}
				const observer = new MutationObserver(callback)
				observer.observe(submitButton, config);
				handleCommitButton()
			}
		},


		/**
		 * cherry-pick时修改分支后同步修改commit message的分支和版本信息
		 */
		handleCherryPick: function (){
			log.info('handle Cherry Pick!')
			let branchInput = document.getElementsByClassName('gwt-SuggestBox')[0]
			if (!branchInput) {
				log.warn('Cherry Pick to Branch is empty!')
				return
			}

			branchInput.onblur = function () {
				// Delete document.onkeyup listener when input loses focus
				document.onkeyup = ''
				Tasks.branch = branchInput.value
				log.info('input onblur..')
				Tasks.cherryPickInputChange()
			}

			// TODO：解决浏览器的自动下拉提示中选取值时，不会触发oninput问题。
			document.onkeyup = function(e) {
				// Compatible with FF, IE and Opera
				let event = e || window.event;
				let key = event.which || event.keyCode || event.charCode;
				if (key === 13) {
					log.info('on enter keyup')
					Tasks.branch = branchInput.value
					Tasks.cherryPickInputChange()
				}
			};
		},

		cherryPickInputChange: function (){
			log.info('Cherry Pick onchange branch: ' + Tasks.branch)
			let commitArea = document.getElementsByClassName('gwt-TextArea')[0]
			if(!commitArea){
				log.info('cherry pick textArea not found!')
				return
			}

			let actionCallback = function (version){
				let commitMessage = commitArea.value
				let lines = commitMessage.split("\n");
				for (let i = 0; i < lines.length; i++){
					if(lines[i].startsWith('Fixed Version')){
						lines[i] = 'Fixed Version: ' + version
					}else if(lines[i].startsWith('Branch')){
						lines[i] = 'Branch: ' + Tasks.branch
					}
				}
				commitArea.value = lines.join("\n");
				log.info('commitArea: \r\n' + commitArea.value)
			}

			Tasks.getBranchVersion({
				branch: Tasks.branch,
				callback: actionCallback
			})
		},

		/**
		 * 处理review后回复并评分
		 */
		checkCommitMessage: function (){
			log.info('check commit message')
			let branch = Tasks.getCommitBranch()

			let actionCallback = function (version){
				log.info('check commit message version:' + version)
				if(version){
					let isChange = false
					let commitMessageDiv = document.getElementsByClassName('com-google-gerrit-client-change-CommitBox_BinderImpl_GenCss_style-text')[0]
					if(!commitMessageDiv){
						log.info('commit message div not exist.')
						return
					}

					let commitMessage = commitMessageDiv.innerText
					let innerTextArr = commitMessage.split('\n')
					for(let i = 0; i<innerTextArr.length; i++){
						if(innerTextArr[i].match('Fixed Version:')){
							let v = innerTextArr[i].split(':')[1].trim()
							if(v !== version){
								isChange = true
								log.info('version not match')
								innerTextArr[i] = 'Fixed Version: ' + version
							}
						}else if(innerTextArr[i].match('Branch:')){
							let b = innerTextArr[i].split(':')[1].trim()
							if(b !== branch){
								isChange = true
								log.info('branch not match')
								innerTextArr[i] = 'Branch: ' + branch
							}
						}
					}

					if(isChange){
						log.info('message is change')
						commitMessage = innerTextArr.join("\n");
						commitMessageDiv.innerText = commitMessage
						Tasks.editMessage(commitMessage)
					}else {
						if(Tasks.isCommitMessageUpdate){
							Tasks.isCommitMessageUpdate = false
							let submitClass = 'com-google-gerrit-client-change-Actions_BinderImpl_GenCss_style-submit'
							let submitButton = document.getElementsByClassName(submitClass)[0]
							if(submitButton){
								log.info('no change happen, submit now')
								submitButton.click()
							}
						}
					}
				}else {
					let submitClass = 'com-google-gerrit-client-change-Actions_BinderImpl_GenCss_style-submit'
					let submitButton = document.getElementsByClassName(submitClass)[0]
					if(submitButton){
						log.info('no version get, submit now')
						submitButton.click()
					}
					Tasks.isCommitMessageUpdate = false
				}
			}

			if(branch){
				Tasks.getBranchVersion({
					branch: branch,
					callback: actionCallback
				})
			}
		},

		/**
		 * commit message 编辑完成后发送PUT请求进行保存
		 * @param messageContent
		 */
		editMessage: function (messageContent){
			log.info('send PUT to edit message')
			let changeId = document.getElementsByClassName('gwt-Anchor')[0].innerText
			let url = window.location.origin + '/a/changes/' + changeId + '/edit:message';
			let xhr = new XMLHttpRequest();
			xhr.open('PUT', url);
			xhr.setRequestHeader('Accept', 'application/json')
			xhr.setRequestHeader('X-Gerrit-Auth', Tasks.xGerritAuth)
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4 && Tasks.isNxx(2, xhr.status)) {
					log.info('edit message success')
					Tasks.publishEdit()
				}
			};
			xhr.send(messageContent);
		},

		/**
		 * commit message编辑完成后，发送publish请求
		 */
		publishEdit: function (){
			log.info('send POST to publish edit message')
			let changeId = document.getElementsByClassName('gwt-Anchor')[0].innerText
			let url = window.location.origin + '/a/changes/' + changeId + '/edit:publish'
			let xhr = new XMLHttpRequest();
			xhr.open('POST', url);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
			xhr.setRequestHeader('X-Gerrit-Auth', Tasks.xGerritAuth)
			xhr.onreadystatechange = function (){
				if (xhr.readyState === 4 && Tasks.isNxx(2, xhr.status)){
					log.info('publish edit success')
					Tasks.getCurrentRevision()
				}
			}
			xhr.send(`{}`);
		},

		/**
		 * publish成功后，需要再次review+2后才能进行submit
		 */
		postReview: function (commitId){
			log.info('post review with commit-id: ' + commitId)
			let changeId = document.getElementsByClassName('gwt-Anchor')[0].innerText
			let url = window.location.origin + '/a/changes/' + changeId + '/revisions/' + commitId + '/review'
			let xhr = new XMLHttpRequest();
			xhr.open('POST', url);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
			xhr.setRequestHeader('X-Gerrit-Auth', Tasks.xGerritAuth)
			xhr.onreadystatechange = function (){
				if (xhr.readyState === 4 && Tasks.isNxx(2, xhr.status)){
					log.info('post review success')
					Tasks.postSubmit(changeId, commitId)
				}
			}

			let data = {
				'comments': {},
				'drafts': 'KEEP',
				'labels': {'Code-Review': 2, 'Verified': 1},
				'strict_labels': true,
			}
			xhr.send(JSON.stringify(data));
		},

		postSubmit: function (changeId, commitId){
			log.info('post submit with commit-id: ' + commitId)
			let url = window.location.origin + '/a/changes/' + changeId + '/revisions/' + commitId + '/submit'
			let xhr = new XMLHttpRequest();
			xhr.open('POST', url);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
			xhr.setRequestHeader('X-Gerrit-Auth', Tasks.xGerritAuth)
			xhr.onreadystatechange = function (){
				if (xhr.readyState === 4 && Tasks.isNxx(2, xhr.status)){
					log.warn('post submit success !!!!!!!!!!! Page reload now')
					window.location.reload(true)
				}
			}

			xhr.send(JSON.stringify({wait_for_merge: true}));
		},

		/**
		 * 完成修改后需要获取commit-id
		 */
		getCurrentRevision: function (){
			let changeId = document.getElementsByClassName('gwt-Anchor')[0].innerText
			let url = window.location.origin + '/a/changes/' + changeId + '/detail?O=404'
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.setRequestHeader('X-Gerrit-Auth', Tasks.xGerritAuth)
			xhr.onreadystatechange = function (){
				if (xhr.readyState === 4 && Tasks.isNxx(2, xhr.status)){
					if(xhr.responseText && xhr.responseText.length > 4){
						let commitInfo = JSON.parse(xhr.responseText.substring(4))  // 去除头部用于防止攻击的 `)]}` 字符
						let currentRevision = commitInfo['current_revision']
						log.info('get current revision success: ' + currentRevision)
						if(commitInfo && currentRevision){
							Tasks.postReview(commitInfo['current_revision'])
						}
					}
				}
			}
			xhr.send();
		},

		/**
		 * 获取某个提交所在的分支
		 * @returns {string}
		 */
		getCommitBranch: function (){
			let branch = ''
			let changeInfoTable = document.getElementById('change_infoTable')
			let rows = changeInfoTable.rows;
			for(let i=0;i<rows.length;i++) {
				for(let j=0;j<rows[i].cells.length;j++) {
					let cell = rows[i].cells[j];
					if(cell.innerHTML === 'Branch'){
						branch = rows[i].cells[j+1].innerText
						log.info('commit branch: ' + branch)
						break
					}
				}
			}
			return branch
		},

		/**
		 * 目前仅GRP支持该接口
		 * @param data
		 */
		getBranchVersion: function (data){
			log.info('get version of branch : ' + data.branch)
			if(!data.branch){
				return
			}
			let httpRequest = new XMLHttpRequest();
			let requestRUL= 'https://192.168.131.8:9443/grp_versions?branch=' + data.branch
			httpRequest.open('GET', requestRUL, true);
			httpRequest.timeout = 3000;
			httpRequest.ontimeout = function (e) {
				log.warn('Timeout: no response to request version within 3 seconds!')
				if(data.callback){
					data.callback()
				}
			};
			httpRequest.onreadystatechange = function () {
				if (httpRequest.readyState === 4 && httpRequest.status === 200) {
					let version = httpRequest.responseText;
					if(version){
						version = version.replace(/^\"|\"$/g,'')  // 去除字符串头尾的双引号
					}else {
						log.warn('Invalid version number: ' + version)
					}

					log.info('get branch version success, version: ' + version)
					if(data.callback){
						data.callback(version)
					}
				}
			}
			httpRequest.onerror = function (event) {
				log.warn("An error occurred during the transaction\r\n", event);
				if (confirm('请点 "确定"按钮 访问https://192.168.131.8:9443 链接以授权获取版本信息') === true){
					window.open('https://192.168.131.8:9443', '_blank');
				}else{
					alert("您已拒绝授权")
				}
			};
			httpRequest.send();
		},

		/**
		 *  Approved web applications running from an allowed origin can rely on
		 *	CORS preflight to authorize requests requiring cookie based
		 *	authentication, or mutations (POST, PUT, DELETE). Mutations require a
		 *	valid XSRF token in the `X-Gerrit-Auth` request header.
		 */
		getXGerritAuth: function (){
			let xhr = new XMLHttpRequest();
			xhr.open('GET', window.location.href);
			xhr.onreadystatechange = function (){
				if(xhr.readyState === 4 && xhr.status === 200){
					try{
						let xmlDocHtml = Tasks.loadXMLString(xhr.responseText)
						let hostPageDataDom = xmlDocHtml.getElementById('gerrit_hostpagedata')
						let gerritHostPageData = hostPageDataDom ? hostPageDataDom.innerHTML : ''
						Tasks.xGerritAuth = Tasks.getValueFromString(gerritHostPageData, 'gerrit_hostpagedata.xGerritAuth')
						if(Tasks.xGerritAuth){
							Tasks.xGerritAuth = Tasks.xGerritAuth.replace(/^\"|\"$/g,'')  // 去除字符串头尾的引号
						}
					}catch (e){
						log.warn('get X-Gerrit-Auth error')
						log.error(e.message)
					}
				}
			}
			xhr.send();
		},

		/**
		 * 从字符串中获取指定key的value
		 * @param targetStr
		 * @param name
		 * @returns {string}
		 */
		getValueFromString: function (targetStr, name){
			const key = name + '=';
			let result = '';
			targetStr.split(';').some(c => {
				c = c.trim();
				if (c.startsWith(key)) {
					result = c.substring(key.length);
					return true;
				}
				return false;
			});
			return result;
		},

		/**
		 * 使用js代码将text字符串变量转为DOM对象。
		 * @param txt
		 * @returns {null|Document|any}
		 */
		loadXMLString: function (txt){
			try { //Internet Explorer
				let xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(txt);
				return(xmlDoc);
			} catch(e) {
				try { //Firefox, Mozilla, Opera, etc.
					let parser = new DOMParser();
					let xmlDoc = parser.parseFromString(txt,'text/html');
					return(xmlDoc);
				} catch(e) {
					log.error(e.message)
				}
			}
			return null;
		},

		/**
		 * 判断返回的状态码是否是Nxx
		 */
		isNxx: function (i, responseCode){
			return ((i * 100) <= responseCode && responseCode <= ((i * 100) + 99))
		}
	}
	Tasks.init();
})();

