/**
 * @file generateId.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 本地仓储层唯一 ID 生成工具，兼容非安全上下文（HTTP）与旧版浏览器
 * @updateTime 2026-05-27
 */

/**
 * 生成带业务前缀的唯一 ID
 * crypto.randomUUID 仅在 HTTPS / localhost 等安全上下文中可用
 */
export function generateUniqueId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  const randomPart = Math.random().toString(36).slice(2, 11)
  return `${prefix}-${Date.now()}-${randomPart}`
}
