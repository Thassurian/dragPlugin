# dragPlugin

可以用来拖动和缩小页面元素的小插件，依赖于jQuery，后续可能会有原生版本（可能...会有的吧... :D）

### 使用方法

```
$('.demo').myDrag({
  scope: '.father', //父级
  handle: '.coor', //管伸缩的手柄
  grid: [number,number], //网格式移动
  deviation: [number, number], //模块可以超出边界的部分像素值
  cbStart: function() {console.log('cbStart')}, //移动前的回调函数
  cbMove: function() {console.log('cbMove')}, //移动中的回调函数
  cbEnd: function() {console.log('cbEnd')}, //移动结束时候的回调函数
  stStart: function() {console.log('stStart')}, //伸缩前的回调函数
  stEnd: function() {console.log('stEnd')}, //伸缩后的回调函数
  stMove: function(){console.log('stMove')}, //伸缩中的回调函数
  ifTop: true, //是否点击置顶
  scale: true, //按宽高比例伸展
})
```
