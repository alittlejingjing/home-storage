<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'destructive'
  class?: string
}>(), {
  variant: 'default',
})

const emit = defineEmits<{ close: [] }>()

const variantClasses: Record<string, string> = {
  default: 'border-border bg-card text-foreground',
  destructive: 'border-destructive/50 bg-destructive text-destructive-foreground',
}
</script>

<template>
  <div
    :class="cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
      variantClasses[variant ?? 'default'],
      props.class
    )"
  >
    <div class="grid gap-1">
      <slot />
    </div>
    <button
      class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      @click="emit('close')"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>
