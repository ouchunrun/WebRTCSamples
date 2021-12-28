## 背景

- 测试 `answer` 触发`iceRestart`时，`offer`会不会自动触发`iceRestart`

## 测试流程

- 1.`offer`、`answer` 建立点对点连接

- 2.`answer createOffer` 并设置`iceRestart:true`，完成自身的 `iceRestart`
    - 这里完成后answer的ice info已经发生改变

- 3.`offer` 重新`createOffe`r进行`re-invite`协商（此时`answer`使用的是第二步骤创建出来的新`icePwd、iceUfrag`信息）

## 测试结果

- `offer` 不会自动触发`iceRestart`，音视频显示正常


## 补充

- `offerConstraints.iceRestart` 方式仅使用于 `createOffer`， `createAnswer`设置不生效，所以步骤2中需要执行一个新的JSEP来触发`iceRestart`

- 步骤2中`answer iceRestart`时，`candidate`也已经发生了变化，`candidate`较长，未在页面显示，有必要可以在控制台查看
