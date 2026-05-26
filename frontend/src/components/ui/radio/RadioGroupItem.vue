<script setup lang="ts">
import { inject, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  value: string
  disabled?: boolean
  class?: string
}>()

const ctx = inject<any>('radio-group')
const isChecked = computed(() => ctx?.selected.value === props.value)

const handleClick = () => {
  if (!props.disabled) {
    ctx?.select(props.value)
  }
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="isChecked"
    :disabled="disabled"
    :class="cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      props.class
    )"
    @click="handleClick"
  >
    <span v-if="isChecked" class="flex items-center justify-center">
      <span class="h-2.5 w-2.5 rounded-full bg-current" />
    </span>
  </button>
</template>
