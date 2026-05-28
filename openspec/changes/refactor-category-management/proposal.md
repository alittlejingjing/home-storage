## 背景

当前 `Categories.vue` 页面使用 Reka UI 脚手架组件（`@/components/ui`）和 `lucide-vue-next` 图标，与项目目标技术栈（Element Plus + Tailwind CSS）不符。同时 Store 直接操作 `localStorage`，未按 Repository 模式实现。本次重构将分类管理页面全面迁移至目标技术栈，并补齐 Repository 数据访问层。

## 变更内容

- **页面 UI 迁移**：`Categories.vue` 中所有 Reka UI 组件替换为 Element Plus 等效组件
- **图标替换**：`lucide-vue-next` 替换为 `@element-plus/icons-vue`
- **Repository 实现**：新增 `ICategoryRepository` 接口、`LocalCategoryRepository` 实现、`types/category.ts`
- **Store 重构**：`categories.ts` 改为调用 Repository，不再直接读写 `localStorage`
- **拖拽排序升级**：当前仅支持上下箭头单步移动，升级为基础拖拽排序（完整排序能力后续迭代）
- **删除确认升级**：分类删除确认弹窗使用 `ElMessageBox` + `el-radio-group` 选择策略（R009）
- **新增区域样式**：底部新增栏改为 Element Plus `el-input` + `el-button`

## 能力

### 新增能力
- `category-repository`：分类数据访问层抽象（Repository 接口 + Local 实现）
- `category-ui-element-plus`：分类管理页面 Element Plus UI 重写

### 修改的能力
- 无现有 spec 需要修改（分类管理此前无独立 spec）

## 影响面

- `frontend/src/views/Categories.vue`：页面重写
- `frontend/src/stores/categories.ts`：Store 逻辑重构，移除 localStorage 直接读写
- **新增**：`frontend/src/repositories/types.ts`（补充 `ICategoryRepository`）
- **新增**：`frontend/src/repositories/local/categoryRepository.ts`
- **新增**：`frontend/src/types/category.ts`
- 首页仪表盘分类卡片展示依赖 `categories` Store，接口签名保持不变
