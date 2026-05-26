<script setup lang="ts">
import { provide, ref } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  type?: 'single' | 'multiple'
  class?: string
}>(), {
  type: 'single'
})

const openItems = ref<string[]>([])

const toggle = (value: string) => {
  if (props.type === 'single') {
    openItems.value = openItems.value.includes(value) ? [] : [value]
  } else {
    const idx = openItems.value.indexOf(value)
    if (idx > -1) {
      openItems.value.splice(idx, 1)
    } else {
      openItems.value.push(value)
    }
  }
}

provide('accordion', { openItems, toggle })
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <slot />
  </div>
</template>
