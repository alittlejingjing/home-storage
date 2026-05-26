<script setup lang="ts">
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'destructive'
  class?: string
}>(), {
  variant: 'default'
})

const variantClasses: Record<string, string> = {
  default: 'bg-background text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
}
</script>

<template>
  <div
    role="alert"
    :class="cn(
      'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
      variantClasses[variant ?? 'default'],
      props.class
    )"
  >
    <slot />
  </div>
</template>
