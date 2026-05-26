<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  href?: string
  class?: string
}>()
</script>

<template>
  <a :href="href" :class="cn('transition-colors hover:text-foreground', $props.class)">
    <slot />
  </a>
</template>
