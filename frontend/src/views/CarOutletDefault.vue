<template>
  <div :class="outletPlaceholderClass">
    子页面内容区（此处为路由占位，可替换为地图/媒体等）
  </div>
</template>

<script setup lang="ts">
/**
 * 车机模板 layout-car 中部 `<router-view />` 的默认子页（演示占位）。
 */
import { cn } from '@/utils/cn'

/** 与主工程车机占位一致：Tailwind 设计 token */
const outletPlaceholderClass = cn(
  'mx-12 mb-2 flex min-h-[120px] items-center justify-center rounded-lg border border-dashed',
  'border-border/40 bg-card/25 px-4 py-8 text-center text-sm text-muted-foreground backdrop-blur-sm',
)
</script>
