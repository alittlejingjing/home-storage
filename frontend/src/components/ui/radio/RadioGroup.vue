<script setup lang="ts">
import { provide, computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  modelValue?: string
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selected = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val!),
})

provide('radio-group', { selected, select: (val: string) => { selected.value = val } })
</script>

<template>
  <div :class="cn('grid gap-2', props.class)">
    <slot />
  </div>
</template>
