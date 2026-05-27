<template>
    <div class="fd-date-picker" :class="{ 'fd-date-picker--disabled': disabled }">
        <div
            class="fd-date-picker__trigger"
            role="button"
            tabindex="0"
            :aria-disabled="disabled"
            @click="openDrawer"
            @keydown.enter.prevent="openDrawer"
            @keydown.space.prevent="openDrawer"
        >
            <el-icon class="fd-date-picker__icon">
                <Calendar />
            </el-icon>
            <span
                class="fd-date-picker__text"
                :class="{ 'fd-date-picker__text--placeholder': !displayText }"
            >
                {{ displayText || placeholder }}
            </span>
            <span
                v-if="clearable && displayText && !disabled"
                class="fd-date-picker__clear"
                role="button"
                tabindex="0"
                aria-label="清除日期"
                @click.stop="clearValue"
                @keydown.enter.stop.prevent="clearValue"
                @keydown.space.stop.prevent="clearValue"
            >
                <el-icon :size="14">
                    <CircleClose />
                </el-icon>
            </span>
        </div>

        <el-drawer
            v-model="drawerVisible"
            direction="btt"
            :with-header="false"
            :size="'auto'"
            append-to-body
            class="fd-date-picker__drawer"
        >
            <div class="fd-date-picker__panel">
                <div class="fd-date-picker__panel-header">
                    <span class="fd-date-picker__panel-title">选择日期</span>
                    <button type="button" class="fd-date-picker__today" @click="selectToday">
                        今天
                    </button>
                </div>

                <div class="fd-date-picker__columns">
                    <div class="fd-date-picker__column">
                        <label class="fd-date-picker__column-label">年</label>
                        <el-select v-model="year" class="fd-date-picker__select" teleported>
                            <el-option
                                v-for="y in yearOptions"
                                :key="y"
                                :label="`${y}年`"
                                :value="y"
                            />
                        </el-select>
                    </div>
                    <div class="fd-date-picker__column">
                        <label class="fd-date-picker__column-label">月</label>
                        <el-select v-model="month" class="fd-date-picker__select" teleported>
                            <el-option
                                v-for="m in monthOptions"
                                :key="m"
                                :label="`${m}月`"
                                :value="m"
                            />
                        </el-select>
                    </div>
                    <div class="fd-date-picker__column">
                        <label class="fd-date-picker__column-label">日</label>
                        <el-select v-model="day" class="fd-date-picker__select" teleported>
                            <el-option
                                v-for="d in dayOptions"
                                :key="d"
                                :label="`${d}日`"
                                :value="d"
                            />
                        </el-select>
                    </div>
                </div>

                <div class="fd-date-picker__preview">
                    {{ formatDateParts(year, month, clampDay(year, month, day)) }}
                </div>

                <div class="fd-date-picker__actions">
                    <el-button class="fd-date-picker__btn" @click="closeDrawer">
                        取消
                    </el-button>
                    <el-button type="primary" class="fd-date-picker__btn" @click="confirmSelect">
                        确定
                    </el-button>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script setup lang="ts">
import { Calendar, CircleClose } from '@element-plus/icons-vue'
import { clampDay, formatDateParts } from './dateUtils'
import { useFdDatePicker, type FdDatePickerProps } from './index.ts'

const props = withDefaults(defineProps<FdDatePickerProps>(), {
  modelValue: null,
  placeholder: '选择日期',
  disabled: false,
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const {
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
} = useFdDatePicker(props, emit)
</script>

<style lang="less" scoped src="./index.less"></style>
