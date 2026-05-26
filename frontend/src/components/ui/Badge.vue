<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'warning' | 'success' | 'outline'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClass: Record<string, string> = {
  default: 'bg-primary text-primary-foreground border-transparent',
  secondary: 'bg-secondary text-secondary-foreground border-transparent',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
  warning: 'bg-warning/10 text-warning border-warning/20',
  success: 'bg-success/10 text-success border-success/20',
  outline: 'text-foreground border border-input',
}

const badgeClass = computed(() =>
  cn(
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variantClass[props.variant],
    props.class
  )
)
</script>
