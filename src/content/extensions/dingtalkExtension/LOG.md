# 2021-11-10

- 1.修改定时获取信息逻辑

# 2021-11-9

- 1.优化content与popup页面账号选择同步逻辑  
- 2.抢占登录下线时鉴权信息改变导致呼叫失败时，收到401重新登录并呼叫一次  
- 3.调用获取设备当前登录状态，添加登录显示  
- 4.完成线路状态显示，popup界面添加挂断处理，去除保活定时器
- 5.聊天窗口添加呼叫按钮
- 6.popup打开时定时获取数据

# 2021-11-5

- 1.添加popup配置页面
- 2.使用账号查询接口，动态获取已注册账号信息

# 2021-11-3

- 1.401跨域问题处理
- 2.动态获取话机配置的账号数 model.define.js 
- 3.插件http请求添加了默认前缀问题  
- 4.密码加密存储: 使用base64加密  
- 5.呼叫时添加是否已成功登录的状态判断 
- 6.实现钉钉一键呼叫
- 7.钉钉页面关闭后清除login keep alive 定时器