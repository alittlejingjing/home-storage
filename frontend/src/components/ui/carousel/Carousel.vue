<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  orientation?: 'horizontal' | 'vertical'
  class?: string
}>(), {
  orientation: 'horizontal',
})

const currentIndex = ref(0)
const totalItems = ref(0)

const canScrollPrev = computed(() => currentIndex.value > 0)
const canScrollNext = computed(() => currentIndex.value < totalItems.value - 1)

const scrollPrev = () => {
  if (canScrollPrev.value) currentIndex.value--
}

const scrollNext = () => {
  if (canScrollNext.value) currentIndex.value++
}

const registerItem = () => {
  totalItems.value++
}

provide('carousel', {
  orientation: props.orientation,
  currentIndex,
  totalItems,
  canScrollPrev,
  canScrollNext,
  scrollPrev,
  scrollNext,
  registerItem,
})
</script>

<template>
  <div
    :class="cn('relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    @keydown.left.prevent="scrollPrev"
    @keydown.right.prevent="scrollNext"
  >
    <slot />
  </div>
</template>
