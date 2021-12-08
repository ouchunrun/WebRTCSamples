
## GUV30xx 按键指令

- 本次测试设备：

|设备型号         |vendorId       |
|:-------------:|:-------------:|
|GUV3000-8#     |  0x2BAB       |
|GUV3005-10#    | 0x2BAB        |

### Output(Host向耳机发送指令) 按键指令

> GUV30xx OutputReport 指令如下：

- 1、发送 reportId = 0x02 && reportData[0] = 0x01  触发Hook LED灯亮------Answer call
- 2、发送 reportId = 0x02 && reportData[0] = 0x00  触发Hook LED灯灭------Hang up
- 3、发送 reportId = 0x03 && reportData[0] = 0x01  触发Mute LED灯亮------Mute on
- 4、发送 reportId = 0x03 && reportData[0] = 0x00  触发Mute LED灯灭------Mute off
- 5、发送 reportId = 0x04 && reportData[0] = 0x01  触发Hook LED闪烁------Incoming call

在耳机上操作时，耳机设备触发 **inputreport** 事件，通过以下事件通知前端：

```
log.info('handle input report: \r\n' + JSON.stringify(data, null, '    '))
switch (data.eventName){
    case 'ondevicehookswitch':  // 摘机 挂机
        This.trigger(data.eventName, { hookStatus: data.hookStatus })  // on/off
        break
    case 'ondevicemuteswitch':  // 静音状态改变
        This.trigger(data.eventName, { isMute: data.isMute })   // true/false
        break
    case 'ondevicevolumechange':  // 音量改变
        This.trigger(data.eventName, { volumeStatus: data.volumeStatus })   // up/down
        break
    default:
        break
}
```

-----------------------------------------------------------------------------------------------------------------------

### Input(耳机向Host发送指令) 按键指令

> GUV30xx InputReport 指令如下：

- 1.对按键offHook:
    - 1.1 Answer: reportId == 0x01 &&  reportData[0] == 0x14;
    - 1.2 Hang up: reportId == 0x01 && reportData[0] == 0x00;
- 2.对按键offHook:
    - 2.1 在待机时 MIC开启/关闭: reportId == 0x01 && reportData[0] == 0x08;
    - 2.2 在通话时 MIC开启/关闭: reportId == 0x01 && reportData[0] == 0x1c;
- 3.对音量按键
    - 3.1 在待机时 音量+: reportId == 0x05 && reportData[0] == 0x01
    - 3.2 在待机时 音量-: reportId == 0x05 && reportData[0] == 0x02
    - 3.3 在通话时 音量+: reportId == 0x05 && reportData[0] == 0x15
    - 3.4 在通话时 音量-: reportId == 0x05 && reportData[0] == 0x16


-----------------------------------------------------------------------------------------------------------------------

### Input 按键测试过程

#### 接听键：answer

|状态        |reportId|uint8Data| hexData                                    |
|:---------:|:------:|:-------:|:------------------------------------------:|
|连接后首次接听|1       |20       |14 00 00 00 20 83 88 08 00 `00` 80 00 00 00 00|
|音量+后接听  |1       |20       |14 00 00 00 20 83 88 08 00 `03` 80 00 00 00 00|
|音量-后接听  |1       |20       |14 00 00 00 20 83 88 08 00 `03` 80 00 00 00 00|
|mute时接听  |1       |20       |14 00 00 00 20 83 88 08 00 `03` 80 00 00 00 00|
|unmute时接听|1       |20       |14 00 00 00 20 83 88 08 00 `03` 80 00 00 00 00|

> 接听键处于非接听状态时连接设备，首次接听，`getUint8(10)` 为0，其他场景为3


#### 接听键：hangup

|状态        |reportId|uint8Data| hexData                                    |
|:---------:|:------:|:-------:|:------------------------------------------:|
|音量+后挂断  |1       |0       |00 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|音量-后挂断  |1       |0       |00 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|mute时挂断  |1       |0       |00 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|unmute时挂断|1       |0       |00 00 00 00 20 83 88 08 00 03 80 00 00 00 00|

> 接听键挂断时，hexData、reportId基本固定，未发现会改变的情况


#### 静音键：mute

|状态        |reportId|uint8Data| hexData                                    |
|:---------:|:------:|:-------:|:------------------------------------------:|
|空闲时mute  |1       |8       |08 00 00 00 20 83 88 08 00 00 80 00 00 00 00 |
|通话中mute  |1       |28      |`1c` 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|音量+后mute |1       |8       |08 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|音量-后mute |1       |8       |08 00 00 00 20 83 88 08 00 03 80 00 00 00 00|

> 接听状态下mute，`getUint8(0)` 为28


#### 静音键：unmute

|状态        |reportId|uint8Data| hexData                                    |
|:---------:|:------:|:-------:|:------------------------------------------:|
|空闲时unmute|1       |8       |08 00 00 00 20 83 88 08 00 03 80 00 00 00 00 |
|接听时unmute|1       |28      |`1c` 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|音量+后mute |1       |8       |08 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|音量-后mute |1       |8       |08 00 00 00 20 83 88 08 00 03 80 00 00 00 00|

> unmute 状态同mute

#### 音量+-

|状态            |reportId|uint8Data| hexData                                    |
|:-------------:|:------:|:-------:|:------------------------------------------:|
|空闲时音量+      |5       |1       |01 00 00 00 20 83 88 08 00 `00` 80 00 00 00 00 |
|空闲时非首次音量+ |5       |1       |01 00 00 00 20 83 88 08 00 `03` 80 00 00 00 00 |
|空闲时音量—      |5       |2       |02 00 00 00 20 83 88 08 00 `00` 80 00 00 00 00|
|空闲时非首次音量- |5       |2       |02 00 00 00 20 83 88 08 00 `03` 80 00 00 00 00|
|接听时音量+      |5       |21      |15 00 00 00 20 83 88 08 00 03 80 00 00 00 00 |
|mute+接听时音量+ |5       |21      |15 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|接听时音量—      |5       |22      |16 00 00 00 20 83 88 08 00 03 80 00 00 00 00|
|mute+接听时音量- |5       |22      |16 00 00 00 20 83 88 08 00 03 80 00 00 00 00|

> 静音键每次都会触发 挂机或摘机事件

## 页面与设备关联操作说明

### web 界面上操作后设备同步状态

- 实现：界面操作后，调用 `webHid.sendDeviceReport` 接口设置设备状态

- webHid.sendDeviceReport command 说明

|   操作       |  command      |
|:-----------:|:-------------:|
|answer       | offHook       |
|hangup       | onHook        |
|Mic静音       | muteOn        |
|取消Mic静音    |muteOff        |
|亮灯闪烁提示来电 |incomingCall   |


## 参考

[WICG/webhid](https://github.com/WICG/webhid/blob/main/EXPLAINER.md#example)
[online demo](https://webhid-joycon-button.glitch.me/)
[Connecting to uncommon HID devices](https://web.dev/hid/#:~:text=The%20navigator.hid.requestDevice%20%28%29%20function%20takes%20a%20mandatory%20object,page%20value%20%28usagePage%29%2C%20and%20a%20usage%20value%20%28usage%29.)

## demos

- https://tomayac.github.io/chrome-dino-webhid/

## FAQ

- 1.'requestDevice' on 'HID': Must be handling a user gesture to show a permission request.


 问题记录

- 2.通过Host先耳机设备发送命令时，部分状态的改变会触发 **inputreport** 事件，如下：
```
// 主机向耳机设备发送命令是inputreport事件触发说明：
onHook -> onHook         不触发
offHook -> offHook       不触发
incomingCall -> onHook   不触发

incomingCall -> offHook  触发了inputreport事件
offHook -> onHook        触发了inputreport事件
onHook  -> offHook       触发了inputreport事件
```

- 问题说明：因为Host向耳机发送命令时只有部分事件会触发 inputreport 事件，而webHid.device的muted和hookStatus状态又是在inputreport中设置的，这就导致Host操作后状态记录不准确问题

- 解决方案：主机向耳机设备发送命令后，需要**同步device的muted、hookStatus状态**，即可避免inputreport触发导致的误处理事件。比如恢复设备状态时需要发送`onHook` 和 `muteOff`命令，发送后将对应的hookStatus设置为on，muted设置为false，这样即使onHook触发，事件也不会被处理。


