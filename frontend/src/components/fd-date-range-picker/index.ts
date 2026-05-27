/**
 * @file index.ts
 * @version 1.0.0
 * @author wuwg <wuwg@thunisoft.com>
 * @createTime 2026-05-27
 * @copyright thunisoft fd
 * @see [jsDoc中文文档]{@link http://www.dba.cn/book/jsdoc/JSDOCKuaiBiaoQianBLOCKTAGS/CONSTRUCTS.html}
 * @description 日期范围选择器逻辑，拆分为开始/结束两个单日期选择
 * @updateTime 2026-05-27
 */

import { ref, watch } from 'vue'

export type DateRangeValue = [string, string] | null

export interface FdDateRangePickerProps {
    modelValue?: DateRangeValue
}

export function useFdDateRangePicker(
    props: FdDateRangePickerProps,
    emit: (event: 'update:modelValue', value: DateRangeValue) => void,
) {
    const startDate = ref<string | null>(null)
    const endDate = ref<string | null>(null)

    /**
     * 外部 v-model 同步到内部
     */
    watch(
        () => props.modelValue,
        (value) => {
            startDate.value = value?.[0] || null
            endDate.value = value?.[1] || null
        },
        { immediate: true },
    )

    /**
     * 内部变更回写 v-model
     */
    function syncEmit() {
        const start = startDate.value
        const end = endDate.value
        if (!start && !end) {
            emit('update:modelValue', null)
            return
        }
        emit('update:modelValue', [start || '', end || ''])
    }

    watch(startDate, (start) => {
        if (start && endDate.value && start > endDate.value) {
            endDate.value = start
        }
        syncEmit()
    })

    watch(endDate, (end) => {
        if (end && startDate.value && end < startDate.value) {
            startDate.value = end
        }
        syncEmit()
    })

    return {
        startDate,
        endDate,
    }
}
