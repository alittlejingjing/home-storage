<script setup lang="ts">
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  inline?: boolean
  class?: string
}>(), {
  inline: false,
})
</script>

<template>
  <code
    :class="cn(
      'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
      inline && 'font-semibold',
      props.class
    )"
  >
    <slot />
  </code>
</template>
