<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  rows?: number
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :rows="rows"
    :class="cn(
      'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      $props.class
    )"
    @input="handleInput"
  />
</template>
