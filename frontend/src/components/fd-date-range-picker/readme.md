# FdDateRangePicker 日期范围选择器

将日期范围拆为「开始日期 + 结束日期」两个 `FdDatePicker`，每个独立打开底部抽屉，避免双日历面板超出屏幕。

## 功能

- 开始/结束日期独立选择
- 自动校正：开始晚于结束时同步结束日期，反之亦然
- 输出格式：`[string, string] | null`（与原有 `el-date-picker daterange` 兼容）

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `[string, string] \| null` | `null` | 绑定日期范围 |

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `[string, string] \| null` | 范围变更 |

## 使用示例

```vue
<FdDateRangePicker v-model="dateRange" />
```
