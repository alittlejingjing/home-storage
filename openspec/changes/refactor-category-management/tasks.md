## 任务清单

### 1. 准备 Repository 基础设施
- 创建 `frontend/src/types/category.ts`，包含 `Category` 接口和 `CategoryDeleteStrategy` 类型，与 `详细设计_分类管理.md` §3.3 对齐
- 检查/创建 `frontend/src/repositories/types.ts`，添加 `ICategoryRepository` 接口，方法包括：`list()`、`getById()`、`create()`、`update()`、`delete()`、`reorder()`、`getItemCount()`（定义见 `详细设计_分类管理.md` §3.2）
- 创建 `frontend/src/repositories/local/categoryRepository.ts`，实现 `ICategoryRepository`
- 实现 localStorage 持久化，存储键为 `STORAGE_KEYS.CATEGORIES`
- 实现种子数据逻辑：`list()` 被调用且存储为空时，自动创建 3 个默认分类（生活用品、衣物、工具），符合 R015 规则

### 2. 重构分类 Store
- 重写 `frontend/src/stores/categories.ts`，改为调用 `getCategoryRepository()`（若工厂函数未就绪，可内联 `new LocalCategoryRepository()` 作为 fallback）
- 从 Store 中移除所有直接读写 `localStorage` 的代码
- 保持所有导出计算属性（`categories`、`categoryById`、`sortedCategories`、`categoriesWithCount`）的签名不变，确保向后兼容
- 确保 `addCategory`、`updateCategory`、`deleteCategory`、`reorderCategories` 均委托给 Repository 执行
- 物品数量计算可继续使用 `useItemsStore` 过滤，或改用 Repository 的 `getItemCount`

### 3. 使用 Element Plus 重写 Categories.vue
- 将所有 `@/components/ui` 导入替换为 Element Plus 组件（`el-card`、`el-input`、`el-button`、`el-empty`、`el-dialog` 等）
- 将所有 `lucide-vue-next` 图标替换为 `@element-plus/icons-vue` 对应对等图标（`CollectionTag`、`Edit`、`Delete`、`Top`、`Bottom`、`Check`、`Close`、`Plus`）
- 将 `useToast` 替换为 `ElMessage` 处理所有消息通知
- 实现行内编辑模式：使用 `el-input` + 图标按钮（确认/取消）
- 实现底部固定新增栏：使用 `el-input` + `el-button`
- 实现上移/下移排序：使用 `el-button` 配合 `Top`/`Bottom` 图标
- 卡片外层使用 Tailwind CSS 间距（`p-4`、`space-y-3` 等），内部使用 Element Plus 组件
- 确保触控区域最小 44×44px（Tailwind `min-w-11 min-h-11`）

### 4. 实现删除确认及策略选择
- 物品数量为 0 的分类：使用 `ElMessageBox.confirm`，提示"确认删除此分类？删除后不可恢复"
- 物品数量大于 0 的分类：使用 `ElMessageBox.confirm`，在 `message` 中嵌入 `el-radio-group`，提供两个选项："一并删除"（`DELETE_ITEMS`）和 "转移至未分类"（`MOVE_TO_UNCATEGORIZED`）
- 用户必须选择一项后方可确认删除
- 参考 `需求文档.md` §5.1 中的 R009 规则

### 5. 验证与测试
- 运行 `cd frontend && yarn dev` 启动开发服务器
- 手动测试：新增分类、行内编辑分类、删除分类（有物品/无物品）、上移/下移排序、空状态展示
- 验证 Home.vue 分类卡片是否正常显示（确认 Store 外部消费者未受影响）
- 运行 `yarn lint`，修复所有 ESLint 报错
- 检查 TypeScript 编译，确保 `category.ts` 类型文件和 Repository 无类型错误
