<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <tr :class="cn('border-b border-border transition-all duration-200 hover:bg-muted/40 data-[state=selected]:bg-muted', $props.class)">
    <slot />
  </tr>
</template>
