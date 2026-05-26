<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <tbody :class="cn('bg-card divide-y divide-border [&_tr:last-child]:border-0', $props.class)">
    <slot />
  </tbody>
</template>
