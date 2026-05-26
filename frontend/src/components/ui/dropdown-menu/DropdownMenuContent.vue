<script setup lang="ts">
import { inject } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{
  align?: 'start' | 'center' | 'end'
  class?: string
}>()

const ctx = inject<any>('dropdown-menu')
</script>

<template>
  <div
    v-if="ctx?.visible.value"
    :class="cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border/70 bg-popover/95 backdrop-blur p-1.5 text-popover-foreground shadow-xl absolute top-full mt-1',
      align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
      $props.class
    )"
    @click.stop
  >
    <slot />
  </div>
</template>
