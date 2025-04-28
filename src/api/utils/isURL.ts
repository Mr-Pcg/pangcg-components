/**
 * HTTP(S) URL 的正则表达式
 * 匹配规则：
 * 1. 以 http:// 或 https:// 开头
 * 2. 域名部分可以是：
 *    - 普通域名（example.com）
 *    - 子域名（sub.example.com）
 *    - 可选的端口号（:8080）
 * 3. 可选的路径、查询参数和锚点
 */
export const URL_PATTERN =
  /^https?:\/\/([a-zA-Z0-9][a-zA-Z0-9-]*\.)*[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(:\d{1,5})?(\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]*)?$/

/**
 * 验证是否为有效的 HTTP(S) URL
 * @param value 要验证的 URL
 * @returns 如果是有效的 HTTP(S) URL 返回 true，否则返回 false
 */
/**
 * 验证是否为有效的 HTTP(S) URL
 * @param value 要验证的 URL
 * @returns 如果是有效的 HTTP(S) URL 返回 true，否则返回 false
 */
export function isURL(value: unknown): boolean {
  // 1. 基本类型检查
  if (typeof value !== 'string' || !value.trim()) {
    return false
  }

  const str = value.trim()

  // 2. 使用 URL 构造函数进行初步验证
  let url
  try {
    url = new URL(str)
  } catch {
    return false
  }

  // 3. 协议检查（仅允许 http/https）
  if (!['http:', 'https:'].includes(url.protocol)) {
    return false
  }

  // 4. 域名详细验证
  const domain = url.hostname

  // a. 不能包含空格
  if (/\s/.test(domain)) {
    return false
  }

  // b. 不能以点开头或结尾
  if (domain.startsWith('.') || domain.endsWith('.')) {
    return false
  }

  // c. 不能有连续点
  if (/\.\./.test(domain)) {
    return false
  }

  // d. TLD 至少2个字符
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return false
  }

  // 5. 端口验证
  if (url.port) {
    const port = Number(url.port)
    if (isNaN(port) || port <= 0 || port > 65535) {
      return false
    }
  }

  return true
}
