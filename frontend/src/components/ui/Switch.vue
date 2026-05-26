<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  disabled?: boolean
  class?: string
}>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checked = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const toggle = () => {
  if (!props.disabled) {
    checked.value = !checked.value
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    :disabled="disabled"
    :class="cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-primary' : 'bg-input',
      props.class
    )"
    @click="toggle"
  >
    <span
      :class="cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )"
    />
  </button>
</template>
