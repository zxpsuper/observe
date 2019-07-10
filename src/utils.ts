/*
 * @Author: super
 * @Date: 2019-06-27 16:29:43
 * @Last Modified by: super
 * @Last Modified time: 2019-07-10 17:34:41
 */

/**
 * 判断是否为数组
 * @param obj 任意对象变量
 */
export function isArray(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

/**
 * 判断一个东西是否存在于数组内
 * @param arr 数组
 * @param item 子项
 */
export function isInArray(arr: Array<any>, item: any): boolean {
  for (var i = arr.length; --i > -1; ) {
    if (item === arr[i]) return true
  }
  return false
}

/**
 * 判斷是否是函數
 * Determine if it is a function
 * @param o {function} 函數
 */
export function isFunction(o: any): boolean {
  return typeof o === 'function'
}
/**
 * 判斷是不是字符串
 * Determine if it is a string
 * @param o {string} 字符串
 */
export function isString(o: any): boolean {
  return typeof o === 'string'
}
/**
 * 获取该属性的上一级路径，默认是"#"
 * @param prop 属性值
 * @param path 路径
 */
export function _getRootName(prop: string, path: string): string {
  if (path === '#') {
    return prop
  }
  return path.split('-')[1]
}
