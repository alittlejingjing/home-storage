/**
 * @file index.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 底部抽屉式单日期选择器逻辑
 * @updateTime 2026-05-27
 */

import { ref, computed, watch } from 'vue'
import {
    buildYearOptions,
    clampDay,
    formatDateParts,
    getDaysInMonth,
    parseDateString,
} from './dateUtils'

export interface FdDatePickerProps {
    modelValue?: string | null
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
}

export function useFdDatePicker(
    props: FdDatePickerProps,
    emit: (event: 'update:modelValue', value: string | null) => void,
) {
    const drawerVisible = ref(false)
    const today = new Date()

    const year = ref(today.getFullYear())
    const month = ref(today.getMonth() + 1)
    const day = ref(today.getDate())

    const yearOptions = computed(() => buildYearOptions())

    const monthOptions = computed(() => {
        return Array.from({ length: 12 }, (_, index) => index + 1)
    })

    const dayOptions = computed(() => {
        const maxDay = getDaysInMonth(year.value, month.value)
        return Array.from({ length: maxDay }, (_, index) => index + 1)
    })

    const displayText = computed(() => {
        if (!props.modelValue) return ''
        return props.modelValue
    })

    /**
     * 打开抽屉时同步当前值或默认今天
     */
    function openDrawer() {
        if (props.disabled) return
        const parsed = parseDateString(props.modelValue)
        if (parsed) {
            year.value = parsed.year
            month.value = parsed.month
            day.value = parsed.day
        } else {
            year.value = today.getFullYear()
            month.value = today.getMonth() + 1
            day.value = today.getDate()
        }
        drawerVisible.value = true
    }

    function closeDrawer() {
        drawerVisible.value = false
    }

    /**
     * 年月变化时校正日期上限
     */
    watch([year, month], () => {
        day.value = clampDay(year.value, month.value, day.value)
    })

    function confirmSelect() {
        const safeDay = clampDay(year.value, month.value, day.value)
        emit(
            'update:modelValue',
            formatDateParts(year.value, month.value, safeDay),
        )
        closeDrawer()
    }

    function clearValue(event: Event) {
        event.stopPropagation()
        emit('update:modelValue', null)
    }

    function selectToday() {
        year.value = today.getFullYear()
        month.value = today.getMonth() + 1
        day.value = today.getDate()
    }

    return {
        drawerVisible,
        year,
        month,
        day,
        yearOptions,
        monthOptions,
        dayOptions,
        displayText,
        openDrawer,
        closeDrawer,
        confirmSelect,
        clearValue,
        selectToday,
    }
}
