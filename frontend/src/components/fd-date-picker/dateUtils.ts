/**
 * @file dateUtils.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 日期选择组件通用工具函数
 * @updateTime 2026-05-27
 */

export const DATE_FORMAT = 'YYYY-MM-DD'

/**
 * 数字补零为两位
 */
export function pad2(num: number): string {
  return String(num).padStart(2, '0')
}

/**
 * 将年月日格式化为 YYYY-MM-DD
 */
export function formatDateParts(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/**
 * 解析 YYYY-MM-DD 字符串
 */
export function parseDateString(value?: string | null): {
  year: number
  month: number
  day: number
} | null {
  if (!value) return null
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!matched) return null
  const year = Number(matched[1])
  const month = Number(matched[2])
  const day = Number(matched[3])
  if (!year || month < 1 || month > 12 || day < 1) return null
  return { year, month, day }
}

/**
 * 获取指定年月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 生成年份选项
 */
export function buildYearOptions(start = 2000, end = 2035): number[] {
  const years: number[] = []
  for (let y = end; y >= start; y -= 1) {
    years.push(y)
  }
  return years
}

/**
 * 校正日期，避免 2 月 30 日等非法组合
 */
export function clampDay(year: number, month: number, day: number): number {
  const maxDay = getDaysInMonth(year, month)
  return Math.min(day, maxDay)
}
