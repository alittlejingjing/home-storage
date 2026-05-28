# 物品列表（items）

## 描述

物品 Tab 列表页，支持关键词、分类、日期范围筛选，卡片式展示物品信息。

## 目录结构

| 文件 | 说明 |
|------|------|
| `index.vue` | 模板：筛选栏、列表、FAB |
| `index.ts` | `useItemList()` composable |
| `index.less` | `fd-items` BEM 样式 |
| `form.vue` / `form.ts` | 新增/编辑物品 |
| `detail.vue` / `detail.ts` | 物品详情 |

## 列表卡片 UI

- **卡片外框**：`fd-items__card-wrap` 带 2px 绿色边框与圆角
- **分类标签**：`fd-items__tag`，按分类 ID 映射 6 种色调（`fd-items__tag--tone-*`）

## API

### `useItemList()`

| 返回项 | 说明 |
|--------|------|
| `displayItems` | 当前分页展示的物品 |
| `getCategoryName` | 分类名称 |
| `getCategoryTagTone` | 分类标签色调索引（0-5） |
| `getCabinetName` | 储物柜名称 |
