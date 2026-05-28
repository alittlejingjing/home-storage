## 背景

搜索页面 (`Search.vue`) 是当前最后一个仍完全依赖 Reka UI 脚手架组件的页面。它使用 `@/components/ui` 的 `Card`、`Input`、`Badge`、`Tabs` 等，以及 `lucide-vue-next` 图标。首页 (`home/index.vue`)、物品列表 (`items/index.vue`)、分类管理 (`Categories.vue`) 已经完成了向 Element Plus + Tailwind CSS 的迁移，视觉风格统一为蓝绿色护眼的温暖有机风格。搜索页需要与之一致。

## 目标与排除项

**目标：**

1. `Search.vue` 全面迁移至 Element Plus 组件 + Tailwind 布局 + `@element-plus/icons-vue`
2. 移除所有 `@/components/ui` 和 `lucide-vue-next` 依赖
3. 样式与首页 `fd-home` 保持一致：蓝绿色背景渐变、毛玻璃卡片、顶部色带装饰
4. 分类标签颜色从 Tailwind 渐变改为温暖有机纯色（与分类管理页兼容）
5. 保持搜索逻辑完整：输入框、防抖 300ms、Tab 切换、结果列表、空状态

**排除项：**

1. 不改动搜索逻辑/算法（关键词过滤仍由 Store 提供）
2. 不改动路由或新增页面
3. 不涉及物品详情页、储物柜详情页

## 决策

### 决策 1：Element Plus 组件替换映射

将 Reka UI 组件替换为 Element Plus 等效组件。

- `Card` / `CardContent` → `el-card`（外层 Tailwind 间距控制，内嵌 Element 组件）
- `Input` → `el-input`（支持 `prefix-icon`、`clearable` 属性）
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` → `el-tabs` / `el-tab-pane`
- `Badge` → 移除，改为 CSS 圆角标签（纯样式）
- `Empty` → 自定义空状态（`el-empty` 或 Tailwind 布局 + 图标）
- `lucide-vue-next` 图标 → `@element-plus/icons-vue`：`Search`→`Search`, `X`→`Close`, `Package`→`Box`, `Archive`→`OfficeBuilding`

**决策依据**：项目规范已明确 Element Plus 负责所有交互组件。`el-tabs` 在移动端表现更稳定，`el-input` 自带 `clearable` 减少代码量。

### 决策 2：页面容器和卡片样式统一

页面采用与首页相同的背景（#f3f9f6 + 径向渐变光晕），卡片使用毛玻璃效果（backdrop-filter + 半透明白底），顶部 3px 渐变装饰色带。

**决策依据**：首页和分类管理页已验证此风格在移动端视觉效果好、护眼、有层次感。保持统一减少用户认知负担。

### 决策 3：分类标签颜色方案

替换 `getCategoryColors` 中返回的 Tailwind 渐变色（`from-amber-200`/`to-orange-300` 等），改为温暖有机纯色方案，与分类管理页的 `warmOrganicPalette` 兼容。

**决策依据**：避免 Tailwind 渐变类与 Element Plus 组件混用，纯色标签更简洁、与墨绿色主调更协调。

### 决策 4：Tab 选中样式

使用 Element Plus `el-tabs` 的自定义样式覆盖默认蓝色下划线，改为墨绿色 `#2d8a78` 下划线 + 选中文字加粗。

**决策依据**：默认 `el-tabs` 的蓝色与项目墨绿色主题不协调。通过 CSS 变量或深度选择器覆盖颜色即可。

## 风险与权衡


| 风险                                         | 缓解措施                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| `el-tabs` 在移动端切换手势不如 Reka UI 的 `Tabs` 组件流畅 | Element Plus `el-tabs` 已内置触摸优化，且搜索页 Tab 仅 2 个（物品/储物柜），切换频率低 |
| `el-input` prefix-icon 风格与原 Reka UI 有差异    | 使用 `el-input` 的 `prefix-icon` 插槽 + `el-icon` 组合，视觉一致        |
| 分类颜色方案变更影响搜索结果页的视觉效果                       | 新配色与分类管理页一致，用户已在分类页建立颜色认知                                   |


## 迁移计划

1. **路径别名确认**：`el-icon` + `@element-plus/icons-vue` 已全局可用
2. **重写 Search.vue**：替换所有组件和样式，保留搜索逻辑
3. **构建验证**：运行 `yarn build` 确保无编译错误
4. **功能测试**：手动测试搜索输入、Tab 切换、点击跳转

## 待决策问题

- 是否需要在搜索结果为空时显示快捷分类标签？（不需要，搜索结果为空的时候直接展示一个占位图就可以）

