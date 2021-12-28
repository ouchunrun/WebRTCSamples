## 1.浏览器支持范围

| IPVT支持浏览器范围       | applyConstraints支持浏览器范围 |
| ------------------------ | ------------------------------ |
| IE 11                    | Not Support                    |
| Firefox 52+              | Firefox 52+                    |
| Chrome 52+               | Chrome 63+                     |
| Opera 36+                | Opera 46+                      |
| Microsoft Edge 40.15063+ | All Support                    |
| Safari 11+               |                                |
| MacOS 10+                | _                              |
| Win 7+                   | _                              |
| Android 4.1+             | _                              |
| iOS 9.0+                 | _                              |



## 2. 浏览器使用示例及说明

### 2.1 Edge(18.17763)

#### （1）基本示例：

```javascript
let constraints = {
	frameRate: 30,
	width: 640,
	height: 360
}

let track = localStream.getVideoTracks()[0];
track.applyConstraints(constraints).then(function () {
	console.warn("succeed to applyConstraints : " + JSON.stringify(constraints, null, '    '));
}).catch(function (error) {
	console.error(error)
});
```

#### （2）applyConstraints 不生效

​		constraints 超出设备能力范围时，并不报错，流的分辨率就算改变了也不是constraints 的值，如：

```javascript
 let constraints = {
     frameRate: 50,
     width: 38400,
     height: 21600
 }


 let track = localStream.getVideoTracks()[0];
track.applyConstraints(constraints).then(function () {
    console.warn("succeed to applyConstraints : " + JSON.stringify(constraints, null, '    '));
}).catch(function (error) {
    console.error(error)
});


```

控制台输出结果：

```javascript
succeed to applyConstraints : {
    "frameRate": 50,
    "width": 38400,
    "height": 21600
}
```

​		localVideo 实际尺寸：videoWidth * videoHieght = 640 * 360

>  **原因：Edge支持applyConstraints接口，但是applyConstraints并不生效！**



#### （3）Error示例：

```javascript
// 设置 constraints
let constraints = {
        frameRate: {
            max: 30,
            ideal: 15
        },
        aspectRatio: { min: 1.777, max: 1.778},
        width: {
            min: 0,
            ideal: 640,
            max: 640,
        },
        height: {
            min: 0,
            ideal: 360,
            max: 360,
        }
    }
```

输出结果：

```javascript
[object MediaStreamError]: {constraintName: "width", message: null, name: "ConstraintNotSatisfiedError"}
	constraintName: "width"
	message: null
	name: "ConstraintNotSatisfiedError"
	__proto__: MediaStreamErrorPrototype
```

- constraintName：具体的constraints不满足要求的字段名（width/height/aspectRatio/frameRate等）
- name：错误名



### 2.2 Chrome  + Opera

​	测试版本：chrome 64 / opera 63

#### （1）基本示例：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    aspectRatio: { min: 1.777, max: 1.778},
    width: {
        min: 0,
        ideal: 640,
        max: 640,
    },
    height: {
        min: 0,
        ideal: 360,
        max: 360,
    }
}

 let track = localStream.getVideoTracks()[0];
track.applyConstraints(constraints).then(function () {
    console.warn("succeed to applyConstraints : " + JSON.stringify(constraints, null, '    '));
}).catch(function (error) {
    console.error(error)
});
```

支持min/ideal/max限制

#### （2）exact + max 限制

​		使用exact限制时，max限制无效，如：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    aspectRatio: { min: 1.777, max: 1.778},
    width: {
        min: 0,
        exact: 1920,
        max: 640,
    },
    height: {
        min: 0,
        exact: 1080,
        max: 360,
    }
}
```

输出结果：`Remote video size changed to 1920x1080`

#### （3）ideal 超出max限制 

​		如ideal大于max时，按照max限制范围取流：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    aspectRatio: { min: 1.777, max: 1.778},
    width: {
        min: 0,
        ideal: 1920,
        max: 640,
    },
    height: {
        min: 0,
        ideal: 1080,
        max: 360,
    }
}
```

​	输出结果：`Remote video size changed to 640x360`

#### （4）ideal 超出设备能力

​			constraints 限制使用ideal+max超出设备能力时，取设备支持的最大能力，如：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    aspectRatio: { min: 1.777, max: 1.778},
    width: {
        min: 0,
        ideal: 3840,
        max: 3840,
    },
    height: {
        min: 0,
        ideal: 2160,
        max: 2160,
    }
}

注：测试设备最大支持分辨率为 2304 * 1536
```

输出结果：`Remote video size changed to 2304x1296`

发送的分辨率会变化！

#### （5）ideal 等于 max 限制

​		width + height + frameRate 的ideal等于max，且超出设备能力限制时，不报错

#### （6）Error 示例

​		constraints 限制使用max超出设备能力时，报错， 如constraints设置：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    width: {
        min: 0,
        exact: 3840,
        max: 3840,
    },
    height: {
        min: 0,
        exact: 2160,
        max: 2160,
    }
}
```

输出结果：

```javascript
OverconstrainedError {name: "OverconstrainedError", message: "Cannot satisfy constraints", constraint: "width"}

constraint:"width"
message:"Cannot satisfy constraints"
name:"OverconstrainedError"
__proto__:OverconstrainedError
```

> chrome上使用applyConstraints时，建议使用ideal+max限制，ideal存在的情况下，如果设备能力支持，会取到给定分辨率，max的限制会在ideal取不到给定值时取其他的分辨率值；使用exact只能取到设备能力的一个子集，超出子集范围会报错！

### 2.3 Firefox

#### （1）基本示例

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    width: {
        min: 0,
        ideal: 640,
        max: 640,
    },
    height: {
        min: 0,
        ideal: 640,
        max: 360,
    }
}
```

​		输出结果：`Remote video size changed to 640x360`

#### （2）exact + max 限制

​		和chrome相同，max限制不生效

#### （3）ideal 超出 max 限制

​		和chrome相同，按照max限制范围取流

#### （4）ideal 超出设备能力

​		constraints 限制使用ideal+max超出设备能力时，**最后的分辨率为设备能力的任意值，无法确定**：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    aspectRatio: { min: 1.777, max: 1.778},
    width: {
        min: 0,
        ideal: 3840,
        max: 3840,
    },
    height: {
        min: 0,
        ideal: 2160,
        max: 2160,
    }
}

注：测试设备最大支持分辨率为 2304 * 1536
```

​		输出结果：`Remote video size changed to 1024x576`

#### （5）ideal 等于 max 限制

​		width + height + frameRate 的ideal等于max，且超出设备能力限制时，报错，如：

```javascript
let constraints = {
    frameRate: {
        max: 15,
        ideal: 15
    },
    width: {
        min: 0,
        ideal: 640,
        max: 640,
    },
    height: {
        min: 0,
        ideal: 360,
        max: 360,
    }
}
```

输出结果：

```javascript
MediaStreamError
	constraint: ""
	message: "Constraints could be not satisfied."
	name: "OverconstrainedError"
	stack: ""
```

> 这种情况下，给定constraint中的分辨率找不到对应的帧率，或者说，该帧率找不到对应的分辨率，所以要么调整分辨率，要么调整帧率



#### （6）Error 示例

​			constraints 限制使用max超出设备能力时，报错， 如constraints设置：

```javascript
let constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    width: {
        min: 0,
        exact: 3840,
        max: 3840,
    },
    height: {
        min: 0,
        exact: 2160,
        max: 2160,
    }
}
```

输出结果：

```javascript
MediaStreamError
	constraint: "width"
	message: "Constraints could be not satisfied."
	name: "OverconstrainedError"
	stack: ""
```



### 2.4 Safari 

#### （1）基本示例

​		与chrome/firefox 相同

#### （2）exact 大于 max 限制时报错

​		safari 限制frameRate 的exact 大于 max时，不报错；但限制 width或height的exact 大于 max时，会报错，设置constraints为：

```javascript
var constraints = {
    frameRate: {
        max: 30,
        ideal: 15
    },
    aspectRatio: { min: 1.777, max: 1.778},
    width: {
        min: 0,
        exact: 640,
        max: 640,
    },
    height: {
        min: 0,
        exact: 480,
        max: 360,
    }
};
```

Error 输出结果：

```javascript
OverconstrainedError
	constraint: "height"
	message: "Constraints not supported"
```

#### （3）ideal 超出 max 限制

​		和chrome相同，按照max限制范围取流

#### （4）ideal 超出设备能力

​		和chrome相同，取设备支持的最大能力

#### （5）ideal 等于 max 限制

​		和chrome相同，不报错，超出设备能力时，按照设备最大能力取值

#### （6）Error 示例

​		和（1）exact 大于 max 限制时报错 



注：
1、所有浏览器，如果只是用min和max，分辨率不一定改变，改变也不一定是理想值
2、使用exact如果超出设备能力范围时，不去使用其他分辨率，会直接报错
3、applyConstraints success ，流的分辨率也不一定改变了，因为可能不满足aspectRatio比例要求

