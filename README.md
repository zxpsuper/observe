# observe

a observe for all type variables

本项目基于 `dntzhang/oba` 改造而来，原项目地址：[https://github.com/dntzhang/oba](https://github.com/dntzhang/oba)

## 对象字面量

```js
var obj = { a: 1 }
observe(obj, function(name, value, old) {
  console.log(name + '__' + value + '__' + old)
})
obj.a = 2 //a__2__1
```

## 数组

```js
var arr = [1, 2, 3]
observe(arr, function(name, value, old) {
  console.log(name + '__' + value + '__' + old)
})
arr.push(4) //Array-push__[1,2,3,4]__[1,2,3]
arr[3] = 5 //3__5__4
```

## 复杂对象

```js
var complexObj = { a: 1, b: 2, c: [{ d: [4] }] }
observe(complexObj, function(name, value, old, path) {
  console.log(name + '__' + value + '__' + old) //d__100__4
  console.log(path) //#-c-0
})
complexObj.c[0].d = 100
```

## 普通对象

```js
var User = function(name, age) {
  this.name = name
  this.age = age
  //只监听name
  observe(this, ['name'], function(name, value, oldValue) {
    console.log(name + '__' + value + '__' + oldValue)
  })
}
var user = new User('lisi', 25)
user.name = 'wangwu' //name__wangwu__lisi
user.age = 20 //什么都输出，因为没有监听age
```
