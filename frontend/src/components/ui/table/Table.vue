<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    class?: string
    /** false：仅渲染 table，由外层容器负责滚动（如 sticky 表头） */
    wrap?: boolean
    wrapClass?: string
  }>(),
  { wrap: true },
)
</script>

<template>
  <div
    v-if="wrap"
    :class="cn('relative w-full overflow-auto rounded-lg border border-border bg-card shadow-sm', wrapClass)"
  >
    <table :class="cn('w-full caption-bottom text-sm', $props.class)">
      <slot />
    </table>
  </div>
  <table v-else :class="cn('relative w-full min-w-0 caption-bottom text-sm', $props.class)">
    <slot />
  </table>
</template>
