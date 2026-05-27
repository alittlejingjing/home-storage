# FdDatePicker 单日期选择器

底部抽屉 + 年/月/日分列选择，适配移动端一屏内操作，避免 Element Plus 日历弹层超出可视区域。

## 功能

- 点击触发器打开底部抽屉
- 年、月、日三个下拉分别选择
- 支持「今天」快捷填充
- 支持清除已选日期
- 输出格式：`YYYY-MM-DD`

## API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string \| null` | `null` | 绑定日期值 |
| placeholder | `string` | `'选择日期'` | 占位文案 |
| disabled | `boolean` | `false` | 是否禁用 |
| clearable | `boolean` | `true` | 是否显示清除按钮 |

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `string \| null` | 日期变更 |

## 使用示例

```vue
<FdDatePicker v-model="storageDate" placeholder="选择存放日期" :clearable="false" />
```
