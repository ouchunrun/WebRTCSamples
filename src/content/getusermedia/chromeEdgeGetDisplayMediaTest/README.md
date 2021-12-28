## Test of navigator.getDisplayMedia ScreenShare

The origin purpose of this repository is to test the implementation of `navigator.getDisplayMedia` in MS Edge.

Now the initial working implementation of getDisplayMedia() is available in the latest canary of Chromium(v70.0.3531.0). Please try out and give us feedback. You can post new Chromium bugs or add to the main tracking bug http://crbug.com/326740.

To try out: 

启用实验性平台：
Start Chromium with flag --enable-experimental-web-platform-features or turn it on via chrome://flags/. 
Go to https://cdn.rawgit.com/uysalere/js-demos/master/getdisplaymedia.html.

Note that it is still WIP and not everything defined in the spec is implemented. See here for the active spec discussion topics.

getDisplayMedia可以在Edge和chrome70+版本使用，都需要HTTPS源

不能实现任何分辨率、帧率控制。

- Edge可以设置constraints的width/height/framerate等参数，但并不能做到任何限制。
- ~~chrome只能设置{audio:false,video:true}或{video:true}，不能设置其他参数（注意：audio要么为false,要么不设置）。~~

    + 新版本已开始支持同时共享音频，但是支持程度还不高。
    + 兼容性参考：https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getDisplayMedia#Browser_compatibility

- 该MediaStream对象将只有一个MediaStreamTrack用于捕获的视频流; 没有MediaStreamTrack对应于捕获的音频流。

getDisplayMedia用法：

```angular2html
Edge: navigator.getDisplayMedia.then().catch()

Chrome: navigator.mediaDevices.getDisplayMedia.then().catch()

```


## Edge和Chrome对于同一个操作的报错类型不完全相同，

### **getDisplayMedia 结论**

---

针对Edge和Chrome 70：

- getDisplayMedia可以在Edge和chrome70+版本使用，都需要`HTTPS`源

- 不能实现任何分辨率、帧率约束。
    - Edge可以设置constraints的width/height/framerate等参数，但并不能做到任何限制。
    - chrome 支持constraints的width/height/framerate等参数设置，但是不能使用exact

- 该MediaStream对象将只有一个MediaStreamTrack用于捕获的视频流; 没有MediaStreamTrack对应于捕获的音频流。

- getDisplayMedia用法：`navigator.getDisplayMedia.then().catch()`

- Edge和Chrome对于同一个操作的报错类型不完全相同，详见后文验证。



### **验证过程**
---


getDisplayMedia Constraints例子
```
 var constraints = {audio: false，video: true}
    navigator.getDisplayMedia(constraints)
      .then(stream => {
        // we have a stream, attach it to a feedback video element
        videoElement.srcObject = stream;
      }, error => {
        console.log("Unable to acquire screen capture", error);
      });
```


#### **一、getDisplayMedia for canary of Chromium(v70.0.3531.0)**
---

配置项说明

在Chrome上提供了配置项来控制是否可以使用getDisaplayMedia来捕获音频和视频，需要在[chrome://flags/](chrome://flags/)中启用实验性Web平台功能：

 # enable-experimental-web-platform-features

> 1、启用正在开发的平台特征 Mac, Windows, Linux, Chrome OS, Android。（它仍然是WIP，并不是规范中定义的所有内容都实现了）
>
> 2、此配置项用于控制是否启用正在开发的平台特征，如屏幕共享。默认是禁用状态Disable


 # disable-audio-support-for-desktop-share Share

> 1、禁止桌面共享功能共享音频 Mac, Windows, Linux, Chrome OS, Android。默认为禁用状态Disable。
> 2、启用此项后，可以使用桌面共享功能共享音频（如果存在用于捕获的音频流的话）


chrome共享类型

> 1、 整个屏幕
> 2、 应用窗口
> 3、 chrome标签页


Constraints控制示例

 通过改变constraints来验证getDisplayMedia的约束，例如，把constraints设置为以下几种形式

```

 var constraints = {audio: true，video: true};  // 第一种  -- `TypeError`
 

 var constraints = {  // 第二种  -- `InvalidAccessError`
    audio: false，
    video: {
        width: 640,
        height: 480,
    },
 } 
 
  var constraints = {   第三种  -- `InvalidAccessError`
    "audio": false,
    "video": {
        "frameRate": {
            "exact": 30
        },
        "width": {
            "exact": 320
        },
        "height": {
            "exact": 240
        }
    }
}
```
使用上面的constraints控制都无法进行屏幕共享。Chrome目前还不支持任何的帧率、分辨率参数，且无论是否启用 #disable-audio-support-for-desktop-share Share 配置项，都必须设置audio为false，因为没有用于捕获的音频源



> **总结**：chrome最新版本canary of Chromium(v70.0.3531.0)在使用getDisplayMedia进行屏幕共享的时候，不能做到也不接受任何形式的帧率、分辨率控制，且必须设置audio:false。


---

### **二、getDisplayMedia for Edge**

---

Edge在使用getDisplayMedia这个API实现了屏幕共享时，添加了一个黄色的边界，来显示用户正在共享的界面，确保用户时刻知道他们在分享哪些部分


Edge不需要设置配置项

Edge调用getDisplayMedia()需要一个HTTPS源。

没有用于捕获的音频源


Edge共享类型

> 1、窗口
> 2、屏幕

在Edge上，支持constraints约束，但实际并不能控制做到帧率、分辨率的控制。

> **综上所述**：Edge在使用getDisplayMedia进行屏幕共享的时候，要求HTTPS源；接受帧率、分辨率参数限制，但实际不能做到帧率、分辨率控制。共享是，正在共享的桌面或应用程序会有一个黄色边框。



---

### **用户权限**


- 当调用getDisplayMedia()时，提示用户允许或拒绝允许屏幕捕获。

- 当用户选择的权限持续存在时，捕获选择器UI将出现在每个getDisplayMedia()调用中。权限可以通过微软Edvices中的站点权限UI（在URL栏中设置或通过站点信息面板）来管理。

- 如果一个网页从iframe调用getDisplayMedia()，我们将根据自己的URL单独管理屏幕捕获设备许可。在iframe来自其父网页的不同域的情况下，这为用户提供了保护。

- 如上所述，不允许MediaStreamConstraints限制影响getDisplayMedia屏幕捕获源的选择。

---

**Edge和chrome简单对比**
| 描述         | Edge             | Chrome                   |
| ------------ | ---------------- | ------------------------ |
| 非HTTPS源请求 | PermissionDeniedError | NotSupportedError        |
| 在选择共享屏幕或程序的时候，关闭选择窗口 | AbortError            | NotAllowedError          |
| audio:true参数                           | 支持                  | TypeError                |
| width/height/frameRate等参数             | 支持                  | InvalidAccessError       |
| 共享屏幕或应用程序时的黄色边界           | 有                    | 无                       |
| 共享标签页                               | 不支持                | 支持，可共享chrome标签页 |
| 获取audio                                | 无aduioTrack可获取    | 无aduioTrack可获取       |


---

### **错误列表**

| 错误类型   | 描述          |
| -------------------- | ---------------------- |
| OverconstrainedError |                                                              |
| NotSupportedError    | 针对chrome，在非HTTPS源下请求，会有这个错误                  |
| TypeError            | If value contains a member named advanced, return a promise rejected with a newly created TypeError. If value contains a member which in turn is a dictionary containing a member named either min or exact, return a promise rejected with a newly created TypeError. |
| InvalidStateError    | If the current settings object's responsible document is NOT fully active, return a promise rejected with a DOMException object whose name attribute has the value InvalidStateError. |
| SecurityError        | If the current settings object's responsible document is NOT allowed to use the feature indicated by Feature Policy [TBD], return a promise rejected with a DOMException object whose name attribute has the value SecurityError. |
| NotFoundError        | If no sources of type T are available, reject p with a new DOMException object whose name attribute has the value NotFoundError. |
| NotReadableError     | If the user grants permission but a hardware error such as an OS/program/webpage lock prevents access, reject p with a new DOMException object whose name attribute has the value NotReadableError and abort these steps. |
| AbortError           | If the result is "granted" but device access fails for any reason other than those listed above, reject p with a new DOMException object whose name attribute has the value AbortError and abort these steps. |
| NotAllowedError      | Permission Failure: Reject p with a new DOMException object whose name attribute has the value NotAllowedError. |
| InvalidAccessError   |                                                              |
