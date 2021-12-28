/**
 * 根据给定字符生成随机字符串
 * @param len
 * @returns {string}
 */
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

/**
 * 动态添加页面元素
 * @param data 内容
 */
function addElement(data) {
    console.warn("data: ", data)
    var parentNode = document.getElementById("outgoing-message");
    var text
    var childNode
    if(data.isSelf){
        text = data.data + " :" + data.name
        childNode = document.createElement('div');
        childNode.innerText = text
        childNode.classList.add("right")
    }else {
        text = data.name + ": " + data.data
        childNode = document.createElement('div');
        childNode.innerText = text
        childNode.classList.add("left")
    }

    parentNode.appendChild(childNode);
}

/**
 * 获取url参数
 * @param name
 * @returns {string|null}
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
    if(r != null){
        return  unescape(r[2])
    }else {
        return null
    }
}