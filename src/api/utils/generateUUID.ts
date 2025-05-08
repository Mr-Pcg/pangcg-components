/**
 * 生成32位随机字符串（包含数字和字母）
 * @returns {string} 32位随机字符串
 */
export function generateUUID(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);

  return Array.from(array)
    .map((x) => chars[x % chars.length])
    .join('');
}
