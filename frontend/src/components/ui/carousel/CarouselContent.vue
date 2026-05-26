<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()

const ctx = inject<any>('carousel')
const isHorizontal = computed(() => ctx?.orientation === 'horizontal')

const transformStyle = computed(() => {
  const offset = -(ctx?.currentIndex.value ?? 0) * 100
  return isHorizontal.value
    ? `translateX(${offset}%)`
    : `translateY(${offset}%)`
})
</script>

<template>
  <div class="overflow-hidden">
    <div
      :class="cn(
        'flex transition-transform duration-300 ease-in-out',
        !isHorizontal && 'flex-col',
        $props.class
      )"
      :style="{ transform: transformStyle }"
    >
      <slot />
    </div>
  </div>
</template>
