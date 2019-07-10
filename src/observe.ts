// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
import { isArray, isString, isInArray, isFunction, _getRootName } from './utils'
// 数组方法
let methods: Array<string> = [
  'concat',
  'copyWithin',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'pop',
  'push',
  'reduce',
  'reduceRight',
  'reverse',
  'shift',
  'slice',
  'some',
  'sort',
  'splice',
  'toLocaleString',
  'toString',
  'unshift',
  'values',
  'size'
]
// 会改变原数组的方法
let triggerStr: string = [
  'concat',
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
  'size'
].join(',')

/**
 * 用于观察值变化并触发回调
 * @param target 观察对象
 * @param arr 观察属性或观察属性数组
 * @param callback 触发回调
 */
export default function observe(target: any, arr?: string | Array<string>, callback?: Function) {
  new Observe(target, arr, callback)
}

class Observe {
  $target: any
  constructor(target: any, arr?: string | Array<string>, callback?: Function) {
    let $target: any = target

    !$target.$observer && ($target.$observer = this)
    var $observer: any = $target.$observer

    var eventPropArr: Array<string> = []
    // 判断是否为数组
    if (isArray($target)) {
      // 空数组赋值
      if ($target.length === 0) {
        $target.$observeProps = {}
        $target.$observeProps.$observerPath = '#'
      }
      // 修改数组的默认方法
      this.mock($target)
    } else {
    }

    // 这里主要是对对象的watch
    for (var prop in $target) {
      if ($target.hasOwnProperty(prop)) {
        if (callback) {
          // 判断 arr 是数组属性还是字符串属性
          if (isArray(arr) && isInArray(arr as Array<string>, prop)) {
            eventPropArr.push(prop)
            this.watch($target, prop)
          } else if (isString(arr) && prop === arr) {
            eventPropArr.push(prop)
            this.watch($target, prop)
          }
        } else {
          eventPropArr.push(prop) // callback 为undefind时，不是没有回调，而是监听所有属性
          this.watch($target, prop)
        }
      } else {
      }
    }
    if (!$observer.propertyChangedHandler) $observer.propertyChangedHandler = []
    var propChanged = callback ? callback : arr
    $observer.propertyChangedHandler.push({
      all: !callback, // 是否监听所有
      propChanged: propChanged, // 即使是监听所有属性，也是一个回调函数
      eventPropArr: eventPropArr
    })
    this.$target = $target // 赋值备用
  }

  onPropertyChanged(prop: string, value: any, oldValue: any, target: any, path: string) {
    if (value !== oldValue && this.$target.$observer.propertyChangedHandler) {
      var rootName = _getRootName(prop, path)
      for (var i = 0, len = this.$target.$observer.propertyChangedHandler.length; i < len; i++) {
        var handler = this.$target.$observer.propertyChangedHandler[i]
        if (
          handler.all ||
          isInArray(handler.eventPropArr, rootName) ||
          rootName.indexOf('Array-') === 0
        ) {
          handler.propChanged.call(target, prop, value, oldValue, path)
        }
      }
    }
    if (prop.indexOf('Array-') !== 0 && typeof value === 'object') {
      this.watch(target, prop, target.$observeProps.$observerPath)
    }
  }
  /**
   * 针对可以改变原数组的方法进行修改，并对原方法进行备份处理
   * @param target
   */
  mock(target: any) {
    var self = this
    methods.forEach(function(item: any, index: number) {
      target[item] = function() {
        var old = Array.prototype.slice.call(this, 0)
        var result = Array.prototype[item].apply(this, Array.prototype.slice.call(arguments))
        // 对会修改原数组的方法，监听值是否发生变化
        if (new RegExp('\\b' + item + '\\b').test(triggerStr)) {
          for (var cprop in this) {
            // 对非方法的值进行监听
            if (this.hasOwnProperty(cprop) && !isFunction(this[cprop])) {
              self.watch(this, cprop, this.$observeProps.$observerPath)
            }
          }
          self.onPropertyChanged('Array-' + item, this, old, this, this.$observeProps.$observerPath)
        }
        return result
      }
    })
  }
  /**
   *
   * @param target 监听目标
   * @param prop 监听目标的属性
   * @param path 属性路径
   */
  watch(target: any, prop: string, path?: string): void {
    if (prop === '$observeProps' || prop === '$observer') return

    // 如果监听的是function则return
    if (isFunction(target[prop])) return

    if (!target.$observeProps) target.$observeProps = {}
    if (path !== undefined) {
      target.$observeProps.$observerPath = path
    } else {
      target.$observeProps.$observerPath = '#'
    }

    var self = this
    var currentValue: any = (target.$observeProps[prop] = target[prop])

    // 数组方法改变不会触发defineProperty
    // 通过 Object.defineProperty 来观察订阅属性的变化
    Object.defineProperty(target, prop, {
      get: function() {
        return this.$observeProps[prop]
      },
      set: function(value) {
        var old = this.$observeProps[prop]
        this.$observeProps[prop] = value
        self.onPropertyChanged(prop, value, old, this, target.$observeProps.$observerPath)
      }
    })

    // 递归监听变化
    if (typeof currentValue == 'object') {
      if (isArray(currentValue)) {
        this.mock(currentValue)
        if (currentValue.length === 0) {
          !currentValue.$observeProps && (currentValue.$observeProps = {})
          if (path !== undefined) {
            currentValue.$observeProps.$observerPath = path
          } else {
            currentValue.$observeProps.$observerPath = '#'
          }
        }
      }
      for (var cprop in currentValue) {
        currentValue.hasOwnProperty(cprop) &&
          this.watch(currentValue, cprop, target.$observeProps.$observerPath + '-' + prop)
      }
    }
  }
}
