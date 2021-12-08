
1.页面加载完成或url发生变化时检查当前是否处于待Submit状态，如果是，则增加新的按钮覆盖原有的Submit按钮，从而实现Submit时信息更正

2.点击submit时的处理流程
    - (1) 获取当前分支对应的版本号并和commit message中的分支和版本进行对比，commit message中信息与获取的一致则不做处理，直接触发原有的submit click事件进行合入。如果不一致则进入编辑流程
    - (2) 发送 edit:message PUT 请求提交修改
    - (3) 发送 edit:publish POST 请求发布编辑内容
    - (4) 发送 detail?O=404 GET 请求获取修改后的commit-id等信息
    - (5) 根据第4步获取的commitId 发送 review POST 完成reply +2处理
    - (6) 最后发送 submit POST 请求提交修改，把代码合入仓库
    - (7) window.location.reload 刷新页面更新页面信息

3.说明：submit合入时只发送了POST请求，参数为 `JSON.stringify({wait_for_merge: true})`，如果拦截submit请求，也无法修改之前提交的内容，所以还是需要完成以上的编辑操作。

4.目前只处理GRP项目相关提交
