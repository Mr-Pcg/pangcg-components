/**
 * 中国大陆身份证号码的正则表达式
 */
export const ID_CARD_PATTERN = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/

/**
 * 验证是否为有效的中国大陆身份证号码
 * @param value 要验证的身份证号码
 * @returns 如果是有效的身份证号码返回 true，否则返回 false
 */
export function isIDCard(value: string): boolean {
  if (!ID_CARD_PATTERN.test(value)) {
    return false
  }

  // 验证出生日期
  if (value.length === 18) {
    const year = parseInt(value.substr(6, 4))
    const month = parseInt(value.substr(10, 2))
    const day = parseInt(value.substr(12, 2))
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day
  }

  return true
}
