/**
 * 验证是否为空（包括 null、undefined、空字符串、空数组、空对象）
 * @param value 要验证的值
 * @returns 如果值为空返回 true，否则返回 false
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}
