<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{ class?: string }>()
const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <div
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $props.class
    )"
    @click="emit('select')"
  >
    <slot />
  </div>
</template>
