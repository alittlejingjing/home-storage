<template>
  <input
    :type="type"
    :value="modelValue"
    :class="inputClass"
    :disabled="disabled"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

interface Props {
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const inputClass = computed(() =>
  cn(
    'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
)
</script>
