/**
 * Chart 配色主题（与 vue3-spec 一致）
 * primary | success | warning | danger | purple | cyan | gradient | rainbow
 */
export type ChartTheme =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'cyan'
  | 'gradient'
  | 'rainbow'

const themes: Record<ChartTheme, string[]> = {
  primary: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(96, 165, 250, 0.8)',
    'rgba(147, 197, 253, 0.8)',
    'rgba(191, 219, 254, 0.8)',
  ],
  success: [
    'rgba(34, 197, 94, 0.8)',
    'rgba(74, 222, 128, 0.8)',
    'rgba(134, 239, 172, 0.8)',
    'rgba(187, 247, 208, 0.8)',
  ],
  warning: [
    'rgba(245, 158, 11, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(253, 224, 71, 0.8)',
    'rgba(254, 240, 138, 0.8)',
  ],
  danger: [
    'rgba(239, 68, 68, 0.8)',
    'rgba(248, 113, 113, 0.8)',
    'rgba(252, 165, 165, 0.8)',
    'rgba(254, 202, 202, 0.8)',
  ],
  purple: [
    'rgba(168, 85, 247, 0.8)',
    'rgba(192, 132, 252, 0.8)',
    'rgba(216, 180, 254, 0.8)',
    'rgba(233, 213, 255, 0.8)',
  ],
  cyan: [
    'rgba(6, 182, 212, 0.8)',
    'rgba(34, 211, 238, 0.8)',
    'rgba(103, 232, 249, 0.8)',
    'rgba(165, 243, 252, 0.8)',
  ],
  gradient: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(245, 158, 11, 0.8)',
  ],
  rainbow: [
    'rgba(239, 68, 68, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(168, 85, 247, 0.8)',
  ],
}

export function getThemeColors(theme: ChartTheme, count: number): string[] {
  const palette = themes[theme] ?? themes.primary
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(palette[i % palette.length])
  }
  return result
}

export function getThemeBorderColors(theme: ChartTheme, count: number): string[] {
  return getThemeColors(theme, count).map((c) => c.replace('0.8', '1'))
}
