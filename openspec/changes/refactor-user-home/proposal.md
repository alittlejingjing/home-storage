## Why

当前首页 `Home.vue` 仍依赖 `@/components/ui`（Reka UI）与 `lucide-vue-next`，与 `openspec/project.md` 及已完成的登录页重构（Element Plus + 奶油黄温馨毛玻璃风格）不一致。首页是 Tab 首屏，需按《概要设计》M4 与《详细设计_搜索与仪表盘》对齐能力，并建立全站可复用的视觉规范，避免各页风格割裂。

## What Changes

- 将 `frontend/src/views/Home.vue` 重构为 `views/home/` 模块（html / js / css 分离）
- UI 100% 使用 **Element Plus** 组件 + **Tailwind** 布局；图标使用 `@element-plus/icons-vue`
- 视觉延续登录页：**奶油黄主色、温馨舒适、毛玻璃卡片**（抽取共享主题变量）
- 按详细设计实现首页区块：顶栏搜索入口、统计概览、分类统计横滑、快捷入口（全部物品/储物柜）、下拉刷新（**不含最近新增、不含储物柜摘要列表**）
- V1 数据经 `useHomeDashboard` composable 聚合（对接 `IDashboardRepository` 预留点；本期可封装现有 Pinia Store）
- 自定义分类弹窗改用 `el-dialog` + `el-input` + `el-button`
- 路由改为懒加载 `@/views/home/index.vue`；删除旧 `Home.vue`
- 新增共享样式 `assets/css/cozy-theme.less`（CSS 变量），供首页及后续页面复用
- 同步更新 `main.css` 中 `:root` 色板与温馨主题一致（全站 Tailwind 语义色统一）
- 同步更新《详细设计_搜索与仪表盘.md》：移除 `recentItems`、`cabinetSummary` 及对应 UI 区块

## Capabilities

### New Capabilities

- `home-dashboard`: 首页仪表盘展示、导航跳转、下拉刷新、自定义分类入口（M4，不含最近新增与储物柜列表）
- `cozy-visual-theme`: 奶油黄温馨毛玻璃设计令牌（与登录页一致），供首页及全局样式引用

### Modified Capabilities

（无。`openspec/specs/` 下尚无既有 capability。）

## Impact

- **代码**：`frontend/src/views/Home.vue`（删除或替换）、新增 `views/home/`、`assets/css/cozy-theme.less`；可选微调 `views/login/index.less` 引用共享变量
- **路由**：`router/index.ts` 更新 `/home` 懒加载路径
- **依赖**：首页移除 `@/components/ui`、`lucide-vue-next`
- **数据**：`DashboardVO` 仅含 `categoryStats`、`totalItems`、`totalCabinets`；储物柜通过快捷入口跳转 `/cabinets`
- **文档**：《详细设计_搜索与仪表盘.md》移除最近新增与储物柜摘要相关字段与 UI 区块
- **后续**：`MainLayout` 底 Tab、搜索页等可复用 `cozy-visual-theme` 独立变更
