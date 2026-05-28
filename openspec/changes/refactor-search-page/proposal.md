## 背景

当前 `Search.vue` 页面完全使用 Reka UI 脚手架组件（`@/components/ui` 中的 `Input`、`Card`、`CardContent`、`Badge`、`Empty`、`Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`）和 `lucide-vue-next` 图标（`Search`、`X`、`Package`、`Archive`）。页面风格与已重构的首页、分类管理页等不统一，且依赖即将废弃的 UI 层。本次重构将搜索页全面迁移至目标技术栈，保持现有搜索功能不变。

## 变更内容

- **UI 迁移**：所有 Reka UI 组件替换为 Element Plus 等效组件
- **图标替换**：`lucide-vue-next` 替换为 `@element-plus/icons-vue`
- **样式统一**：背景、卡片、空状态等样式与首页 `fd-home` 的蓝绿色温暖有机风格保持一致
- **搜索逻辑保留**：输入防抖 300ms、物品/储物柜 Tab 切换、关键词过滤、空状态提示
- **分类颜色兼容**：复用首页/分类管理页的温暖有机配色方案，替换原有 Tailwind 渐变

## 能力

### 新增能力
- `search-ui-element-plus`：搜索页面 Element Plus UI 重写

### 修改的能力
- 无现有 spec 需要修改

## 影响面

- `frontend/src/views/Search.vue`：页面重写
- **无** Store/Repository/API 变更，纯 UI 层替换
