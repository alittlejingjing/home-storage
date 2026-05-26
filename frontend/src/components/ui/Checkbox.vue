<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
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
    role="checkbox"
    :aria-checked="checked"
    :disabled="disabled"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      checked && 'bg-primary text-primary-foreground',
      props.class
    )"
    @click="toggle"
  >
    <span v-if="checked" class="flex items-center justify-center text-current">
      <Check class="h-4 w-4" />
    </span>
  </button>
</template>
