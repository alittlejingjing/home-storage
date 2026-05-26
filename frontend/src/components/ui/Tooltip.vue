<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{
  content?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  class?: string
}>()

const visible = ref(false)

const show = () => { visible.value = true }
const hide = () => { visible.value = false }
</script>

<template>
  <div
    class="relative inline-block"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
  >
    <slot />
    <div
      v-if="visible"
      :class="cn(
        'z-50 overflow-hidden rounded-md border border-border/70 bg-popover/95 backdrop-blur px-3 py-1.5 text-sm text-popover-foreground shadow-lg absolute whitespace-nowrap pointer-events-none',
        side === 'bottom' ? 'top-full mt-1 left-1/2 -translate-x-1/2' :
        side === 'left' ? 'right-full mr-1 top-1/2 -translate-y-1/2' :
        side === 'right' ? 'left-full ml-1 top-1/2 -translate-y-1/2' :
        'bottom-full mb-1 left-1/2 -translate-x-1/2',
        $props.class
      )"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </div>
</template>
