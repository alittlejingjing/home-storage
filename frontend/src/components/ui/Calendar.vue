<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/utils/cn'
import Button from './Button.vue'

const props = withDefaults(defineProps<{
  modelValue?: Date
  class?: string
}>(), {})

const emit = defineEmits<{
  'update:modelValue': [date: Date]
}>()

const currentDate = ref(props.modelValue || new Date())

const daysInMonth = computed(() =>
  new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
)

const firstDayOfMonth = computed(() =>
  new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
)

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const handlePrevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const handleNextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const handleDateClick = (day: number) => {
  const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  currentDate.value = newDate
  emit('update:modelValue', newDate)
}

const isSelected = (day: number) => {
  if (!props.modelValue) return false
  return (
    props.modelValue.getDate() === day &&
    props.modelValue.getMonth() === currentDate.value.getMonth() &&
    props.modelValue.getFullYear() === currentDate.value.getFullYear()
  )
}

const isToday = (day: number) => {
  const now = new Date()
  return (
    now.getDate() === day &&
    now.getMonth() === currentDate.value.getMonth() &&
    now.getFullYear() === currentDate.value.getFullYear()
  )
}
</script>

<template>
  <div :class="cn('rounded-md border border-input bg-background p-3', props.class)">
    <div class="flex items-center justify-between mb-4">
      <Button variant="outline" size="icon" class="h-7 w-7" @click="handlePrevMonth">
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <div class="font-semibold">
        {{ currentDate.getFullYear() }}年 {{ monthNames[currentDate.getMonth()] }}
      </div>
      <Button variant="outline" size="icon" class="h-7 w-7" @click="handleNextMonth">
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-medium text-muted-foreground p-2"
      >
        {{ day }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div v-for="i in firstDayOfMonth" :key="'empty-' + i" class="p-2" />
      <button
        v-for="day in daysInMonth"
        :key="day"
        :class="cn(
          'p-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
          isSelected(day) && 'bg-primary text-primary-foreground',
          isToday(day) && !isSelected(day) && 'bg-accent text-accent-foreground font-semibold'
        )"
        @click="handleDateClick(day)"
      >
        {{ day }}
      </button>
    </div>
  </div>
</template>
