<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <thead :class="cn('bg-muted/50 [&_tr]:border-b border-border', $props.class)">
    <slot />
  </thead>
</template>
