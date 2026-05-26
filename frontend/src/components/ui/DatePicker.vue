<script setup lang="ts">
import { computed } from 'vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Button from './Button.vue'
import Calendar from './Calendar.vue'
import Popover from './Popover.vue'

const props = withDefaults(defineProps<{
  modelValue?: Date | string
  placeholder?: string
  disabled?: boolean
  class?: string
}>(), {
  placeholder: '选择日期',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [date: Date | undefined]
}>()

const dateValue = computed(() => {
  if (!props.modelValue) return undefined
  const date = props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
  return isNaN(date.getTime()) ? undefined : date
})

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const handleSelect = (date: Date) => {
  emit('update:modelValue', date)
}
</script>

<template>
  <Popover align="start">
    <template #trigger>
      <Button
        variant="outline"
        :class="cn(
          'w-full justify-start text-left font-normal h-10',
          !dateValue && 'text-muted-foreground',
          props.class
        )"
        :disabled="disabled"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ dateValue ? formatDate(dateValue) : placeholder }}
      </Button>
    </template>
    <Calendar
      :model-value="dateValue"
      class="w-auto p-0"
      @update:model-value="handleSelect"
    />
  </Popover>
</template>
