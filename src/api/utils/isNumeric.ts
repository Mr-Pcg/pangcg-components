/**
 * 验证字符串是否为有效的数字（整数或小数）
 * @param value 要验证的字符串
 * @returns 如果是有效的数字返回 true，否则返回 false
 */
export function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value))
}
