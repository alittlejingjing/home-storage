<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('-mx-1 my-1 h-px bg-muted', $props.class)" />
</template>
