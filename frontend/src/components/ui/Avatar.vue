<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <span :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', $props.class)">
    <slot />
  </span>
</template>
