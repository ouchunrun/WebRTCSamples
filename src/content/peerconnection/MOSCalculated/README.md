## 如何将数据包丢失、延迟和抖动数字转换为 MOS 分数？

/**
* PacketLoss:  丢包率
*              这是从未从我们这里到达目标服务器（或中间跃点）然后再次返回的数据包的百分比。如果我们发送了 100 个数据包并且只收到了 97 个（3 个没有成功），那么我们有 3% 的数据包丢失。
* AverageLatency:  平均延迟
*              平均延迟（在 PingPlotter 中）是数据包从您的计算机到达目标服务器然后再次返回所需的平均（平均）时间。
*              平均延迟是所有延迟的总和除以我们正在测量的样本数。如果我们发出 100 个样本并收到 97 个样本，则计算所有延迟的总和并除以 97 得到平均值。
*              5 个具有以下延迟的样本：136、184、115、148、125（按此顺序）。平均延迟为 142 （将它们相加，除以 5）
* Jitter:  抖动
*          “抖动”是通过获取样本之间的差异来计算的。
*          136 至 184，差异 = 48
*          184 至 115，差异 = 69
*          115 到 148，diff = 33
*           148 到 125，diff = 23
*          （注意 5 个样本只有 4 个差异）。总差为 173 - 因此抖动为 173 / 4，即 43.25。
*/

```js
EffectiveLatency = ( AverageLatency + Jitter * 2 + 10 )
if (EffectiveLatency < 160) {
    R = 93.2 - (EffectiveLatency / 40)
}else {
    R = 93.2 - (EffectiveLatency - 120) / 10
}

// Now, let's deduct 2.5 R values per percentage of packet loss 为每百分比的数据包丢失减去 2.5 个 R 值
R = R - (PacketLoss * 2.5)


// 已知的公式
MOS = 1 + (0.035) * R + (.000007) * R * (R-60) * (100-R)
```


## 参考

- [How is MOS calculated in PingPlotter Pro?](http://www.pingman.com/kb/article/how-is-mos-calculated-in-pingplotter-pro-50.html)
