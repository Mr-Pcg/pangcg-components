/**
 * 中国大陆手机号码的正则表达式
 */
export const PHONE_NUMBER_PATTERN = /^1[3-9]\d{9}$/

/**
 * 验证是否为有效的中国大陆手机号码
 * @param value 要验证的手机号码
 * @returns 如果是有效的手机号码返回 true，否则返回 false
 */
export function isPhoneNumber(value: string): boolean {
  return PHONE_NUMBER_PATTERN.test(value)
}
