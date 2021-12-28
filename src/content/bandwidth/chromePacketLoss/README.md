
## 问题测试背景

- chrome 带宽设置较大时视频出现明显丢包


## 原因

- Google Chrome (Linux, Mac, Windows) 从 83版本开始，默认启用所有变体（ChromeVariations=0）。这些变体功能是不稳定的，并且是随机的。

- 该丢包问题，在Mac/Windows平台，可以通过修改配置文件或者注册表，设置ChromeVariations=1或2来避免，实测有效，推荐设置为1。

- https://bugs.chromium.org/p/chromium/issues/detail?id=1270574

