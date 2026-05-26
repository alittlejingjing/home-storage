<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <tfoot :class="cn('border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0', $props.class)">
    <slot />
  </tfoot>
</template>
