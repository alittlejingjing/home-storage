## 背景

当前储物柜模块（`Cabinets.vue`、`CabinetForm.vue`、`CabinetDetail.vue`）是一个单体原型，缺乏清晰的责任分离。它缺少需求文档中定义的关键功能——照片轮播、时间筛选、柜内物品展示以及物品到储物柜的导航。该模块还违反了项目的目标架构：它使用了 `@/components/ui`（Reka UI，即将废弃）和 `lucide-vue-next`；数据层是内联的 Pinia `localStorage` 写入，没有 Repository 抽象。

物品模块（`views/items/`）和首页（`/home`）已重构为 cozy 蓝绿色视觉主题，遵循 `views/<模块>/` 目录模式（`index.vue` + `index.ts` + `index.less`）。储物柜模块必须与这一标准对齐。

## 目标 / 排除项

**目标：**
- 将储物柜模块拆分到 `views/cabinets/` 下，包含 `index.vue`（列表）、`detail.vue` 和 `form.vue`，遵循已确立的 `index.vue` + `index.ts` + `index.less` 模式。
- 用 Element Plus + `@element-plus/icons-vue` 替换 `@/components/ui` 和 `lucide-vue-next`。
- 实现完整的储物柜 CRUD，支持业务规则 R002（名称长度 2-30）、R005（名称唯一性）、R008（删除前空柜校验）。
- 按照 `详细设计_前端数据访问层.md` 中记录的 Repository 模式，提取 `ICabinetRepository` 接口并实现 `LocalCabinetRepository`。
- 柜内物品展示：详情页调用 `IItemRepository.list({ cabinetId })` 展示关联物品列表，点击跳转物品详情。
- 应用 cozy 蓝绿色主题变量（`--fd-cozy-*`），与物品模块/登录/首页保持视觉一致性。

**排除项：**
- V2 后端 API 实现（保持 V1 纯本地）。
- 重构物品或分类模块（这些是独立的变更）。
- 拖拽排序或滑动删除之外的高级手势。
- 离线同步或冲突解决。

## 决策

### 决策：文件组织 —— `views/cabinets/` 采用 html/js/css 拆分
**决策依据**：物品模块（`views/items/`）和首页（`views/home/`）已成功使用这一模式。它提高了可维护性，并允许使用 scoped BEM 样式而无需深度选择器。每个页面在 `index.ts` 中拥有自身的 composable 逻辑。
**备选方案**：单 `.vue` 文件每页（已拒绝——单体化，难以维护）。分离的 `composables/` 目录（已拒绝——定位页面特定逻辑更困难）。

### 决策：Element Plus 承担所有交互式 UI；Tailwind 仅用于外壳布局
**决策依据**：按照 `project.md` §2.1，Element Plus 覆盖表单、上传、轮播、弹窗、消息框。Tailwind 处理 flex/grid 布局和间距。这完全避免了已废弃的 `@/components/ui`。
**映射关系**：`el-card`（储物柜卡片）、`el-input`、`el-textarea`（表单）、`el-date-picker`（时间筛选）、`el-upload`（照片）、`el-carousel`（详情照片查看器）、`el-dialog`（图片预览）、`ElMessageBox.confirm`（删除）、`ElMessage`（toast）、`el-badge`（物品数量角标）。

### 决策：`ICabinetRepository` 接口 + `LocalCabinetRepository` 实现
**决策依据**：`详细设计_前端数据访问层.md` 规定 V1 store 必须委托给仓库。这将存储逻辑隔离，并使 V2 迁移变得简单（替换为 `HttpCabinetRepository`）。
**接口形态**：`list(query)`、`getById(id)`、`create(dto)`、`update(id, dto)`、`delete(id)`、`listItemsInCabinet(cabinetId)`。删除时内部校验 itemCount，非空则抛错（R008）。

### 决策：日期绑定使用 `value-format="YYYY-MM-DD"` 字符串
**决策依据**：`el-date-picker` 设置 `value-format="YYYY-MM-DD"` 后，绑定值为 `string[]` 而非 `Date[]`。`useCabinetList()` 中 `dateRange` 直接声明为 `[string, string] | null`，作为 `dateStart` / `dateEnd` 的原生字符串直接过滤 `createdAt`，无需 `getFullYear` 等转换。这避免了运行时类型错误并简化 composable 逻辑。（与物品模块已验证模式一致。）

### 决策：统一的创建/编辑表单，通过 `form.vue` 进行基于路由的模式检测
**决策依据**：两个页面共享 90% 的字段。一个单组件配合 `isEdit = computed(() => !!route.params.id)` 可减少重复。表单使用内部 `draft` 对象；编辑加载时同步它。
**页面标题与返回**：`MainLayout` 已根据路由 `meta.title` 和 `meta.showBack` 统一渲染顶部返回栏。`form.vue` 和 `detail.vue` 自身不再包含独立返回栏，避免双层头部。（与物品模块已验证模式一致。）

### 决策：V1 照片存储在 localStorage 中（base64）
**决策依据**：IndexedDB 已规划但增加复杂性。对于 ≤3 张照片每柜 × 压缩后平均 200KB，localStorage 中的 base64 仍在典型的 5-10MB 配额内。V2 将切换到多部分上传 + MinIO。（与物品模块已验证模式一致。）

## 风险与权衡

| 风险 | 缓解措施 |
|------|----------|
| 路由路径变更可能破坏现有书签或测试 | 保持相同路由路径（`/cabinets`、`/cabinets/create`、`/cabinets/:id`、`/cabinets/:id/edit`）；仅组件路径变更 |
| 照片 base64 膨胀 localStorage 并拖慢序列化 | 压缩至宽度 1280px，质量 80%，目标 ≤200KB（比 R007 的 500KB 更严格） |
| 跨 store 依赖：储物柜统计物品数量依赖 `itemsStore` | `LocalCabinetRepository` 通过构造函数注入 `IItemRepository` 依赖，不直接耦合 Pinia store，保持测试性 |
| 表单的未保存更改守卫可能与浏览器返回冲突 | 使用 `onBeforeRouteLeave` 守卫 + `ElMessageBox.confirm`；通过 draft 与原始对象的深等比较追踪脏状态 |
| 删除储物柜时用户不理解为何无法删除 | R008 校验在 UI 层预提示：详情页删除按钮在 `itemCount > 0` 时置灰并显示 tooltip「请先移出物品」；同时操作前二次确认 |

## 迁移计划

1. 创建 `views/cabinets/` 目录，包含 `index.vue`、`index.ts`、`index.less`、`detail.vue`、`form.vue`。
2. 在 `repositories/types.ts` 中定义 `ICabinetRepository` 接口，在 `repositories/local/cabinetRepository.ts` 中实现 `LocalCabinetRepository`。
3. 新增 `types/cabinet.ts` 定义 Cabinet / CabinetVO / CabinetFilters / CabinetCreateInput 类型。
4. 更新 `stores/cabinets.ts` 以委托给仓库（适配层）。
5. 更新 `router/index.ts`：将组件导入替换为新路径。
6. 删除 `views/Cabinets.vue`、`views/CabinetForm.vue`、`views/CabinetDetail.vue`。
7. 验证 `yarn build` 通过。
8. 冒烟测试：创建 → 列表 → 详情 → 编辑 → 删除流程，验证 R008 空柜校验。

## 待决策问题

- 柜内物品列表在详情页采用横向滚动卡片还是垂直列表？**决策**：垂直列表（与物品列表同风格），更适配移动端下滑浏览习惯。
- 时间筛选应使用单个日期范围选择器还是独立的开始/结束选择器？**决策**：`el-date-picker` 配合 `type="daterange"` 以节省空间。（与物品模块一致。）
