<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <td :class="cn('p-4 align-middle text-foreground [&:has([role=checkbox])]:pr-0', $props.class)">
    <slot />
  </td>
</template>
