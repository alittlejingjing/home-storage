<template>
  <div
    ref="containerRef"
    class="chart-container"
    :style="{ position: 'relative', height: height }"
  >
    <component
      :is="chartComponent"
      v-if="chartData"
      ref="chartRef"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChartComponentRef } from 'vue-chartjs'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
} from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  PolarAreaController,
  Filler,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js'
import { getThemeColors, getThemeBorderColors, type ChartTheme } from './theme'

const roseCenterHolePlugin: any = {
  id: 'roseCenterHole',
  afterDatasetsDraw(chart: any, _args: unknown, opts: any) {
    if (chart?.config?.type !== 'polarArea') return
    const meta = chart.getDatasetMeta(0)
    const firstArc = meta?.data?.[0]
    if (!firstArc) return
    const radiusRatio = typeof opts?.radiusRatio === 'number' ? opts.radiusRatio : 0.44
    const { x, y, outerRadius } = firstArc
    const holeRadius = outerRadius * radiusRatio
    const { ctx } = chart
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, holeRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  },
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  PolarAreaController,
  Filler,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  roseCenterHolePlugin,
)

export type ChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'rose'
  | 'radar'
  | 'radialBar'
  | 'stackedBar'
  | 'multiLine'

interface Props {
  type: ChartType
  /** 数据源 */
  data: Record<string, unknown>[]
  /** 横轴/分类字段（bar/line/area/stackedBar/multiLine） */
  xKey?: string
  /** 纵轴数值字段，单系列为字符串，多系列为字符串数组 */
  yKey?: string | string[]
  /** 饼图/环形图：名称字段 */
  nameKey?: string
  /** 饼图/环形图：数值字段 */
  valueKey?: string
  /** 配色主题 */
  theme?: ChartTheme
  /** 是否显示图例 */
  showLegend?: boolean
  /** 容器高度，如 300px */
  height?: string
  /** 自定义 class */
  class?: string
  /** 维度/系列中文名称映射（如 { stock: '在库数' }） */
  yLabelMap?: Record<string, string>
  /**
   * 折线/面积图：为 true 时使用一张网大屏样式——横向虚线分割、保留 Y 轴数值但不画左侧 Y 轴线、X 轴线略加粗、Y 向约 5 段刻度
   */
  hideYAxis?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  xKey: 'name',
  yKey: 'value',
  nameKey: 'name',
  valueKey: 'value',
  theme: 'primary',
  showLegend: true,
  height: '300px',
  hideYAxis: false,
})

const chartRef = ref<ChartComponentRef | null>(null)
const containerRef = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | undefined

/** 窗口/容器尺寸变化后统一重算画布尺寸并刷新（仅最大化再还原时 ResizeObserver 可能不完整触发） */
function scheduleChartResize() {
  requestAnimationFrame(() => {
    const chart = chartRef.value?.chart
    if (!chart) return
    chart.resize()
    chart.update('none')
  })
}

onMounted(() => {
  resizeObserver = new ResizeObserver(scheduleChartResize)
  window.addEventListener('resize', scheduleChartResize)
  nextTick(() => {
    const el = containerRef.value
    if (el) resizeObserver?.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', scheduleChartResize)
  resizeObserver?.disconnect()
})

const chartComponents: Record<
  ChartType,
  typeof Bar | typeof Line | typeof Pie | typeof Doughnut | typeof Radar | typeof PolarArea
> = {
  bar: Bar,
  line: Line,
  area: Line,
  pie: Pie,
  donut: Doughnut,
  rose: PolarArea,
  radar: Radar,
  radialBar: Doughnut,
  stackedBar: Bar,
  multiLine: Line,
}

const chartComponent = computed(() => chartComponents[props.type] ?? Bar)

const chartData = computed(() => {
  const { type, data: raw, xKey, yKey, nameKey, valueKey, theme, yLabelMap } = props
  if (!raw?.length) return null

  const isPieLike = type === 'pie' || type === 'donut' || type === 'radialBar' || type === 'rose'
  if (isPieLike) {
    const labels = raw.map((d) => String(d[nameKey] ?? ''))
    const values = raw.map((d) => Number(d[valueKey] ?? 0))
    const colors = getThemeColors(theme, values.length)
    if (type === 'radialBar') {
      const single = values[0] ?? 0
      return {
        labels: [labels[0] ?? '进度', ''],
        datasets: [
          {
            data: [single, Math.max(0, 100 - single)],
            backgroundColor: [colors[0], 'rgba(0,0,0,0.05)'],
            borderWidth: 0,
          },
        ],
      }
    }
    if (type === 'rose') {
      const sliceColors = raw.map((d, i) => {
        const c = (d as Record<string, unknown>).color
        return typeof c === 'string' && c.length > 0 ? c : colors[i]
      })
      const maxValue = Math.max(...values, 1)
      // 视觉映射值：保留相对差异，同时给非 0 值一个最小可见长度，避免被中心留白吞没
      const roseVisualValues = values.map((v) => {
        if (v <= 0) return 0
        const ratio = v / maxValue
        return Number((0.28 + ratio * 0.72).toFixed(4))
      })
      return {
        labels,
        datasets: [
          {
            data: roseVisualValues,
            backgroundColor: sliceColors,
            borderWidth: 1,
            borderColor: '#fff',
            // PolarArea 天生等角度、半径随值变化，天然符合玫瑰图形态
            clip: 2,
          },
        ],
      }
    }
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    }
  }

  if (type === 'radar') {
    const labels = raw.map((d) => String(d[nameKey] ?? d[xKey] ?? ''))
    const values = raw.map((d) => Number(d[valueKey] ?? d[yKey as string] ?? 0))
    const colors = getThemeColors(theme, 1)
    return {
      labels,
      datasets: [
        {
          label: '数值',
          data: values,
          backgroundColor: colors[0].replace('0.8', '0.2'),
          borderColor: colors[0],
          borderWidth: 1,
          pointBackgroundColor: colors[0],
        },
      ],
    }
  }

  const labels = raw.map((d) => String(d[xKey] ?? ''))
  const yKeys = Array.isArray(yKey) ? yKey : [yKey]
  const colors = getThemeColors(theme, yKeys.length)
  const borderColors = getThemeBorderColors(theme, yKeys.length)
  const linePalette = ['#0096FF', '#1EC8A0', '#F3BF42']
  const barPalette = ['#0096FF', '#08D8F5', '#F3BF42']

  const datasets = yKeys.map((key, i) => {
    const values = raw.map((d) => Number(d[key] ?? 0))
    const isArea = type === 'area'
    const isStacked = type === 'stackedBar'
    const isBarLike = type === 'bar' || type === 'stackedBar'
    const isLineLike = type === 'line' || type === 'multiLine' || type === 'area'
    const lineColor = linePalette[i % linePalette.length]
    const barColor = isBarLike ? barPalette[i % barPalette.length] : colors[i]
    const defaultColor = colors[i].replace('0.8', '0.6')
    /** 横向堆叠柱：仅最右段（沿 x 正方向末端）右侧圆角 */
    const stackedBarRadius =
      isStacked && i === yKeys.length - 1
        ? { topRight: 5, bottomRight: 5 }
        : isStacked
          ? 0
          : undefined
    return {
      label: yLabelMap?.[key] ?? key,
      data: values,
      maxBarThickness: isStacked ? 10 : undefined,
      borderRadius: stackedBarRadius,
      backgroundColor: isStacked
        ? barColor
        : isArea && isLineLike
          ? `${lineColor}33`
          : isBarLike
            ? barColor
            : defaultColor,
      borderColor: isLineLike ? lineColor : isBarLike ? barColor : borderColors[i],
      borderWidth: isLineLike ? 2 : 1,
      pointBorderColor: isLineLike ? lineColor : borderColors[i],
      pointBackgroundColor: isLineLike ? '#fff' : borderColors[i],
      fill: isArea,
      tension: 0.3,
      stack: isStacked ? 'stack0' : undefined,
    }
  })

  return { labels, datasets }
})

const chartOptions = computed(() => {
  const { type, showLegend, hideYAxis } = props
  const base: Record<string, unknown> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        backgroundColor: '#fff',
        borderWidth: 2,
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          // 多维度 tooltip：始终展示所有维度，label 已由 yLabelMap 替换为中文
          label(context: any) {
            const label = context.dataset?.label ?? ''
            const value =
              typeof context.parsed === 'object' && context.parsed !== null
                ? context.parsed.y ?? context.parsed.x ?? context.raw
                : context.parsed
            return `${label}: ${value}`
          },
        },
      },
    },
  }
  if (type === 'stackedBar') {
    base.layout = {
      padding: { top: 8, right: 8, bottom: 8, left: 4 },
    }
    base.scales = {
      x: {
        display: false,
        stacked: true,
        beginAtZero: true,
      },
      y: {
        stacked: true,
        ticks: {
          autoSkip: false,
          color: '#4c80b7',
          font: { size: 12 },
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    }
    base.indexAxis = 'y'
  }
  if (type === 'area' || type === 'line' || type === 'multiLine') {
    base.interaction = {
      mode: 'index',
      intersect: false,
    }
    // 一张网大屏：仅横向虚线网格；Y 轴显示数值但不画轴线；刻度约 5～6 段避免过密
    const yScale = hideYAxis
      ? {
          beginAtZero: true,
          grid: {
            display: true,
            color: '#d5deea',
            borderDash: [2, 4],
            drawBorder: false,
          },
          ticks: {
            display: true,
            color: '#6faadf',
            font: { size: 14 },
            maxTicksLimit: 6,
            autoSkip: true,
          },
          border: { display: false },
        }
      : {
          beginAtZero: true,
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#6faadf',
          },
          border: {
            color: '#8ab8f5',
          },
        }
    base.scales = {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#6faadf',
          font: { size: hideYAxis ? 14 : 12 },
        },
        border: hideYAxis
          ? {
              display: true,
              color: '#e5e8ef',
              width: 2,
            }
          : {
              color: '#8ab8f5',
            },
      },
      y: yScale,
    }
    base.plugins = {
      ...(base.plugins as Record<string, unknown>),
      tooltip: {
        ...((base.plugins as Record<string, any>)?.tooltip ?? {}),
        mode: 'index',
        intersect: false,
      },
      legend: {
        display: showLegend,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          padding: 16,
          color: '#4c80b7',
        },
      },
    }
  }
  if (type === 'rose') {
    base.layout = {
      padding: 10,
    }
    base.scales = {
      r: {
        beginAtZero: true,
        ticks: { display: false },
        angleLines: { display: false },
        grid: { display: false },
      },
    }
    base.plugins = {
      ...(base.plugins as Record<string, unknown>),
      legend: { display: showLegend },
      // 稍微缩小内环，给小值扇区更多可见空间
      roseCenterHole: { radiusRatio: 0.4 },
      tooltip: {
        ...((base.plugins as Record<string, unknown>)?.tooltip as object),
        callbacks: {
          ...((base.plugins as Record<string, any>)?.tooltip?.callbacks ?? {}),
          label(ctx: { dataIndex: number; label?: string }) {
            const row = props.data[ctx.dataIndex] as Record<string, unknown> | undefined
            const name = String(row?.[props.nameKey] ?? ctx.label ?? '')
            const pct = row?.percent
            const val = row?.value
            if (pct != null && pct !== '') return `${name}: ${pct}%`
            if (typeof val === 'number') return `${name}: ${val}`
            return name
          },
        },
      },
    }
  }
  return base
})

</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
