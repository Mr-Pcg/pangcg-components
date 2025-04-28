/**
 * 邮箱地址的正则表达式
 */
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * 验证是否为有效的邮箱地址
 * @param value 要验证的邮箱地址
 * @returns 如果是有效的邮箱地址返回 true，否则返回 false
 */
export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}
