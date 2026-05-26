<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()

const ctx = inject<any>('carousel')

onMounted(() => {
  ctx?.registerItem()
})
</script>

<template>
  <div
    role="group"
    aria-roledescription="slide"
    :class="cn(
      'min-w-0 shrink-0 grow-0 basis-full',
      ctx?.orientation === 'horizontal' ? 'pl-4' : 'pt-4',
      $props.class
    )"
  >
    <slot />
  </div>
</template>
