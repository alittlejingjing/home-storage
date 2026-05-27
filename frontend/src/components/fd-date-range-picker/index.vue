<template>
    <div class="fd-date-range-picker">
        <FdDatePicker v-model="startDate" class="fd-date-range-picker__item" placeholder="开始日期" />
        <span class="fd-date-range-picker__sep">至</span>
        <FdDatePicker v-model="endDate" class="fd-date-range-picker__item" placeholder="结束日期" />
    </div>
</template>

<script setup lang="ts">
import FdDatePicker from '@/components/fd-date-picker/index.vue'
import { useFdDateRangePicker, type FdDateRangePickerProps } from './index.ts'

const props = withDefaults(defineProps<FdDateRangePickerProps>(), {
    modelValue: null,
})

const emit = defineEmits<{
    'update:modelValue': [value: [string, string] | null]
}>()

const { startDate, endDate } = useFdDateRangePicker(props, emit)
</script>

<style lang="less" scoped src="./index.less"></style>
