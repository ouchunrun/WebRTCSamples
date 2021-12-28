
## 说明

- 取流接口：getUserMedia、applyConstraints、getDisplayMedia
- 类型：音频audio、视频video、桌面共享 screenShare
- 关键点：当前分辨率、服务器要求的分辨率、实际取到的分辨率。实际取到的分辨率不超过服务器限制的话就可以
- 策略：取流使用exact取流，exact取分辨率支持列表都失败后使用ideal，ideal都失败后不使用关键字
- 使用Promises方法


### constraints 设置

#### audio constraints

```
 var constraints = {}
  if(options.deviceId){
     constraints = {
         audio: { deviceId: options.deviceId },
         video: false
     }
 }else {
    constraints = { audio: true, video: false }
 }
```

#### video constraints



- 根据服务器要求的分辨率和设备支持的能力获取最佳的分辨率。
- 这里要判断是否使用关键字限制
- 使用exact取流 ==> 失败后使用ideal ==> 失败后不使用关键字（`不使用关键字取流很可能超服务器能力限制，例如超高清会议系统`）



#### screenShare constraints

- 低版本考虑插件
- 高版本需要设置分辨率，例如：

```javascript
var screen_constraints = {
    audio: false,
    video: {
        width: {max: '1920'},
        height: {max: '1080'},
        frameRate: {max: '5'}
    }
};
```
注：是否需要考虑关键字是否支持？？



### getMedia 接口

1、参数

- streamType：audio/video/screenShare 取流类型
- deviceId: 设备ID
- frameRate： 服务器要求的帧率，默认最大30帧
- aspectRatio： 服务器要求的比例，默认16：9
- width：服务器要求的分辨率宽度，默认640
- height: 服务器要求的分辨率高度，默认360
- useKeyWordConstraints: 是否使用exact 等关键字

2、返回值： stream，通过回调的方式调用


3、取流失败类型






