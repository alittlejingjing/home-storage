<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  class?: string
}>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const trackRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

const updateValue = (clientX: number) => {
  if (!trackRef.value || props.disabled) return
  const rect = trackRef.value.getBoundingClientRect()
  let ratio = (clientX - rect.left) / rect.width
  ratio = Math.max(0, Math.min(1, ratio))
  const rawValue = props.min + ratio * (props.max - props.min)
  const steppedValue = Math.round(rawValue / props.step) * props.step
  emit('update:modelValue', Math.max(props.min, Math.min(props.max, steppedValue)))
}

const onMouseDown = (e: MouseEvent) => {
  if (props.disabled) return
  isDragging.value = true
  updateValue(e.clientX)
  const onMouseMove = (e: MouseEvent) => updateValue(e.clientX)
  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div
    ref="trackRef"
    :class="cn(
      'relative flex w-full touch-none select-none items-center cursor-pointer',
      disabled && 'opacity-50 cursor-not-allowed',
      props.class
    )"
    @mousedown="onMouseDown"
  >
    <div class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <div class="absolute h-full bg-primary" :style="{ width: percentage + '%' }" />
    </div>
    <div
      class="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2"
      :style="{ left: `calc(${percentage}% - 10px)` }"
    />
  </div>
</template>
