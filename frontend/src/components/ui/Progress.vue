<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  modelValue?: number
  class?: string
}>(), {
  modelValue: 0,
})

const transformStyle = computed(() => `translateX(-${100 - (props.modelValue || 0)}%)`)
</script>

<template>
  <div :class="cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', props.class)">
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: transformStyle }"
    />
  </div>
</template>
