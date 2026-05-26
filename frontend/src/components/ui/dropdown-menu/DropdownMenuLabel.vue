<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  inset?: boolean
  class?: string
}>()
</script>

<template>
  <div :class="cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', $props.class)">
    <slot />
  </div>
</template>
