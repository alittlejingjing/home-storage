## Context

- **现状**：`Home.vue` 单文件，使用 Reka UI `Card`/`Dialog`/`Empty` 与 lucide 图标；数据直接读 `useItemsStore` / `useCabinetsStore` / `useCategoriesStore`，未按 Repository 分层。
- **设计依据**：《概要设计.md》M4、《详细设计_搜索与仪表盘.md》§3–§7、《需求文档.md》§2.3 首页交互（顶栏搜索、分类统计横滑、储物柜快捷入口、下拉刷新）。
- **视觉基准**：`views/login/` 已落地的奶油黄温馨毛玻璃（`fd-login` + `index.less`）。
- **约束**：Vue 3 + TS + Pinia + Element Plus + Tailwind；html/js/css 分离；BEM `fd-` 前缀；V1 不经 View 直写 localStorage。

## Goals / Non-Goals

**Goals:**

- 首页 UI/交互符合更新后的详细设计 §7.1（搜索入口、统计概览、分类横滑、快捷入口、下拉刷新）
- 目录 `views/home/{index.vue,index.ts,index.less,readme.md}`
- 抽取 `cozy-theme.less` 共享色板与毛玻璃 mixin 变量，登录页与首页共用
- 同步 `main.css` `:root` 与温馨奶油黄主题一致
- 移除首页对 `@/components/ui`、`lucide-vue-next` 的依赖
- composable `useHomeDashboard` 封装数据加载与刷新，预留 `IDashboardRepository.getDashboard()`

**Non-Goals:**

- 不展示「最近新增物品」区块
- 不展示「储物柜摘要列表」（各柜名称与物品数）；储物柜仅通过快捷入口卡片跳转 `/cabinets`
- 不重构 `Search.vue`、`MainLayout`、物品/储物柜列表页（后续变更）
- 不实现 V2 `DashboardController` / `GET /api/dashboard`
- 不在此变更中新建完整 `repositories/local/dashboardRepository.ts`（可薄封装 Store，接口/types 可占位）

## Decisions

### 1. 目录与文件拆分

| 文件 | 职责 |
|------|------|
| `index.vue` | 模板：各区块 + Element Plus 组件 |
| `index.ts` | `useHomeDashboard`：聚合统计、刷新、分类跳转 |
| `index.less` | `fd-home` BEM；引用 `cozy-theme.less` 变量 |
| `readme.md` | 组件说明、区块、API |

### 2. 数据层（V1）

```typescript
// 与 详细设计_搜索与仪表盘.md DashboardVO 对齐
interface DashboardVO {
  categoryStats: { categoryId: string; name: string; count: number; color?: string; icon?: string }[]
  totalItems: number
  totalCabinets: number
}
```

- `useHomeDashboard` 内从现有 Store 计算 `DashboardVO`（与 `LocalDashboardRepository` 行为等价）
- 下拉刷新：重新触发聚合（可 `await` Store 重载或 tick 重算）
- V2：单行替换为 `dashboardRepository.getDashboard()`

### 3. UI 组件映射（Element Plus）

| 区块 | 组件 |
|------|------|
| 搜索入口 | 玻璃渐变卡片，`@click` → `/search` |
| 分类横滑 | `el-scrollbar` + `el-card` |
| 统计数字 | 三列 `el-card`（物品/储物柜/分类） |
| 快捷入口 | 双列 `el-card`：全部物品 → `/items`；储物柜 → `/cabinets` |
| 自定义分类 | `el-dialog` + `el-form` + `el-input` |
| 下拉刷新 | touch 逻辑；图标 `Refresh` from `@element-plus/icons-vue` |

### 4. 视觉统一（cozy-visual-theme）

- 新建 `frontend/src/assets/css/cozy-theme.less`：定义 `--fd-cozy-*` 变量（奶油黄、蜂蜜琥珀、毛玻璃、暖棕文字）
- `login/index.less` 逐步改为引用 `--fd-cozy-*`（减少重复，任务内可选一步完成）
- `home/index.less` 使用 `fd-home` + 相同变量
- `main.css` `:root` HSL 与 `--fd-cozy-*` 对齐，保证 Tailwind `bg-background` 等与首页一致

### 5. 图标

- 分类图标：Element Plus Icons 映射表，或保留 emoji/首字兜底
- 禁止使用 `lucide-vue-next`

### 6. 路由

- `router/index.ts`：`() => import('@/views/home/index.vue')`
- 删除 `views/Home.vue`

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 全局改 `main.css` 影响其他未重构页 | 色板已向暖黄 ins 靠拢；改动保持与现有 main.css 注释一致 |
| Element Plus `el-scrollbar` 移动端横滑体验 | 加 `-webkit-overflow-scrolling: touch`；必要时保留 Tailwind `overflow-x-auto` 外层 |
| Repository 未落地 | composable 注释 V2 替换点；types 放 `types/dashboard.ts` 可选 |

## Migration Plan

1. 新增 `cozy-theme.less` 并在 `main.css` 引入
2. 新建 `views/home/` 四文件（不含最近新增、储物柜摘要列表）
3. 改路由、删 `Home.vue`
4. 更新 `types/dashboard.ts` 移除 `recentItems`、`cabinetSummary`
5. （可选）登录页 less 改引用共享变量
6. `yarn dev` 验证 `/home` 各区块与下拉刷新、跳转
7. `yarn build` 通过

## Open Questions

- 是否在本次变更同步重构 `MainLayout` 底 Tab 样式 — **否**，Tab 视觉单独变更
- 分类卡片颜色 — 按分类类型使用不同色系，不限于黄色渐变
