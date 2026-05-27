## 背景

当前物品模块（`Items.vue`、`ItemForm.vue`、`ItemDetail.vue`）是一个单体原型，缺乏清晰的关注点分离，缺少轮播图、时间筛选、分类筛选等关键功能。需要全面重构以对齐需求文档中关于物品增删改查、搜索、筛选以及登录/首页已建立的 cozy 视觉主题。

## 变更内容

- **新目录结构**：将物品模块拆分到 `views/items/` 下，包含 `index.vue`（列表）、`detail.vue`、`form.vue`，遵循首页的文件组织模式。
- **物品列表页**：基于卡片的列表，支持关键字搜索、分类筛选下拉框、时间范围筛选、滑动删除。仅使用 Element Plus 组件。
- **物品详情页**：顶部照片轮播、信息分组卡片（分类、存放时间、储物柜链接、备注）、编辑/删除操作。
- **物品表单页**：统一的创建/编辑表单，支持名称校验（R001）、分类选择器、照片上传（最多 3 张，按 R006/R007 压缩至 ≤500KB）、存放时间选择器（按 R010 默认今天）、储物柜选择器、备注文本框。返回时未保存更改的守卫。
- **仓库层**：提取 `IItemRepository` 接口并实现 `LocalItemRepository`，遵循项目级仓库模式。
- **业务规则**：实现 R001（名称长度）、R010（自动填充日期）、R011（变更储物柜时级联更新数量）、R012（删除后储物柜数量 -1）。
- **视觉对齐**：应用 cozy 蓝绿色主题（`--fd-cozy-*` 变量），使用毛玻璃卡片风格，与登录页/首页保持一致。
- **破坏性变更**：删除 `views/Items.vue`、`views/ItemForm.vue`、`views/ItemDetail.vue` 单体文件，更新 `router/index.ts` 指向新路径。

## 能力

### 新增能力
- `item-list`：物品列表页，支持搜索、分类筛选、时间筛选、卡片列表、滑动删除
- `item-detail`：物品详情页，支持照片轮播、信息分组、储物柜链接跳转
- `item-form`：统一的物品创建/编辑表单，支持校验、照片上传、储物柜选择
- `item-repository`：本地仓库实现物品增删改查，级联更新储物柜计数

### 修改的能力
- `cozy-visual-theme`：扩展共享主题变量以支持物品专属卡片表面和表单输入样式（无破坏性变更，仅新增）

## 影响面

- **路由**：`/items` → `views/items/index.vue`，`/items/create` → `views/items/form.vue`，`/items/:id` → `views/items/detail.vue`，`/items/:id/edit` → `views/items/form.vue`
- **Store**：`useItemsStore` 可能需要适配层以适配仓库模式
- **依赖**：Element Plus（`el-card`、`el-form`、`el-input`、`el-select`、`el-date-picker`、`el-upload`、`el-carousel`、`el-dialog`、`el-message-box`）、`@element-plus/icons-vue`
- **删除**：`views/Items.vue`、`views/ItemForm.vue`、`views/ItemDetail.vue`
