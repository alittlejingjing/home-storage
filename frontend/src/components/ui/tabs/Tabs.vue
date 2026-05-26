<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  modelValue?: string
  defaultValue?: string
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref(props.modelValue || props.defaultValue || '')

watch(() => props.modelValue, (val) => {
  if (val !== undefined) activeTab.value = val
})

const setActiveTab = (value: string) => {
  activeTab.value = value
  emit('update:modelValue', value)
}

provide('tabs', { activeTab, setActiveTab })
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <slot />
  </div>
</template>
