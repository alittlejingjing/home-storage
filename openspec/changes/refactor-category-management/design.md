## 背景

分类管理是家享收纳 M3 模块，当前页面使用 Reka UI 脚手架组件（`@/components/ui` 中的 `Card`、`Input`、`Button`、`Dialog`、`Empty` 等）和 `lucide-vue-next` 图标。项目目标技术栈要求全面迁移为 **Element Plus（组件）+ Tailwind CSS（布局样式）+ `@element-plus/icons-vue`（图标）**。此外，Store 直接读写 `localStorage`（`STORAGE_KEY = 'jiaxiang-categories'`），未遵循 Repository 模式。本次重构需同时完成 UI 迁移和数据层改造。

## 目标与排除项

**目标：**
1. `Categories.vue` 全面迁移至 Element Plus 组件 + Tailwind 布局 + Element Plus 图标
2. 实现 `ICategoryRepository` 接口及 `LocalCategoryRepository`（V1）
3. `categories.ts` Store 改为通过 Repository 读写数据，不再直接操作 `localStorage`
4. 页面保持现有功能：列表展示、新增、编辑、删除（含 R009 策略）、排序
5. 保证首页仪表盘 `categoriesWithCount` 等外部消费接口签名不变

**排除项：**
1. V2 `HttpCategoryRepository` 及后端 Controller/Service 实现（仅预留接口签名）
2. 完整 HTML5 Drag & Drop 排序（本次仅升级单步箭头为更便捷的排序方式，完整拖拽后续迭代）
3. 分类颜色/图标选择器（保留现有动态配色方案，但配色数据需支持通过 color 字段持久化）
4. 修改除分类管理外的其他页面

## 决策

### 决策 1：Element Plus 组件替换映射
将 Reka UI 组件替换为 Element Plus 等效组件。

- `Card` / `CardContent` → `el-card`（外层 Tailwind 间距）
- `Input` → `el-input`
- `Button`（含 variant/size/icon）→ `el-button`（type/text/circle 等属性）
- `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogFooter` → `ElMessageBox.confirm`（删除确认）或 `el-dialog`（编辑弹窗）
- `Empty` → 自定义空状态（`el-empty` 或 Tailwind 布局 + `el-icon`）
- `useToast` → `ElMessage`

**决策依据**：项目规范要求 Element Plus 负责所有交互组件，禁止继续使用 Reka UI。`ElMessageBox` 更契合移动端删除确认场景（单函数调用，层级管理更简单）。

**备选方案**：使用 `el-dialog` 代替 `ElMessageBox` — 保留，但仅用于编辑弹窗；删除确认用 `ElMessageBox` 更简洁。

### 决策 2：删除确认交互方式
分类删除时（R009）通过 `ElMessageBox.confirm` 展示策略选择。

**决策依据**：原页面使用自定义 Dialog 组件展示二元选择（一并删除/转移至未分类/取消），但 Element Plus 的 `ElMessageBox` 支持 `message` 插槽放入 `el-radio-group`，可在不新增弹窗组件的情况下实现策略选择。

**备选方案**：保留 `el-dialog` 自定义弹窗 — 代码量更大，层级管理复杂，不推荐。

### 决策 3：Store 通过 Repository 间接访问数据
Store 只持有响应式状态，所有 CRUD / 排序操作委托给 `getCategoryRepository()`。

**决策依据**：概要设计 §2.4 要求"Pinia Store / Composable 只依赖 `IItemRepository` 等接口，不感知本地或远程"。单一切换点（`VITE_DATA_SOURCE`）即可在 V2 时切换数据源，无需改动 Store/View 逻辑。

**备选方案**：Store 保留直接 localStorage 逻辑，Repository 只做封装 — 违背设计原则，未来 V2 迁移成本高。

### 决策 4：排序方式维持单步上下移动（UI 升级但排序逻辑不变）
排序仍然调用 `reorderCategories(id, direction)`，页面中使用 `el-button`（文字按钮 / 图标按钮）替代当前的 Reka UI `Button`。

**决策依据**：需求文档和详细设计均未要求拖拽排序，当前上下箭头已满足"可调整顺序"需求。完整拖拽排序涉及 `vuedraggable` 或原生 DnD，引入额外依赖且对移动端体验提升有限（手势误触风险）。

**备选方案**：引入 `vuedraggable` 实现完整拖拽 — 超出本次重构范围，标记为后续迭代。

### 决策 5：Repository 文件与类型定义位置
- 接口：`repositories/types.ts` 中的 `ICategoryRepository`
- 实现：`repositories/local/categoryRepository.ts`
- 类型：`types/category.ts`

**决策依据**：与 `详细设计_前端数据访问层.md` 及现有 `repositories/` 目录规划一致。若 `repositories/types.ts` 尚不存在，则创建该文件并补充接口。

## 风险与权衡

| 风险 | 缓解措施 |
|------|---------|
| Store 接口变更导致外部引用（如 Home.vue）报错 | 保持 `categoriesWithCount`、`sortedCategories` 等 computed 属性签名不变；仅内部实现改为调 Repository |
| Element Plus 组件样式与原 Reka UI 有差异，影响视觉效果 | 用 Tailwind 外层容器包裹 Element 组件，通过 CSS 变量或覆盖类微调 |
| 首次接入 Repository 模式，若 `repositories/index.ts` 工厂函数未就绪 | 在 Store 中内联 `new LocalCategoryRepository()` 作为 fallback，后续统一接入工厂 |
| `ElMessageBox` 在移动端过小 | 通过 Element Plus 的 CSS 变量或全局样式设置移动端弹窗最小宽度 |

## 迁移计划

1. **预备**：确认 `repositories/types.ts`、`repositories/local/` 目录存在
2. **新增文件**：`types/category.ts`、`repositories/local/categoryRepository.ts`（含种子数据初始化 R015）
3. **修改 Store**：`stores/categories.ts` 改为调 Repository
4. **修改页面**：`views/Categories.vue` 替换为 Element Plus 组件 + 图标
5. **验签**：运行 `yarn dev`，验证分类增删改查/排序/删除策略，确认首页分类卡片正常

## 待决策问题

- `repositories/index.ts` 工厂函数是否已存在？若不存在，Store 中如何获取 Repository 实例？
- 当前 `repositories/types.ts` 是否已有 `IItemRepository` 等接口定义？需保持接口命名风格一致。
