# 首页组件（home）

## 描述

家享收纳 Tab 首页仪表盘（M4），采用 **Element Plus** + **奶油黄温馨毛玻璃** 风格，与登录页共享 `cozy-theme.less` 设计令牌。逻辑与样式分离。**不含最近新增、储物柜摘要列表**；储物柜通过快捷入口卡片跳转。

## 设计依据

- 《概要设计.md》M4 搜索与仪表盘
- 《详细设计_搜索与仪表盘.md》§7.1 首页区块
- 《需求文档.md》§2.3 首页交互

## 目录结构

| 文件 | 说明 |
|------|------|
| `index.vue` | 模板：各仪表盘区块 |
| `index.ts` | `useHomeDashboard` composable |
| `index.less` | `fd-home` BEM 样式 |
| `readme.md` | 本文档 |

## 页面区块

| 区块 | 组件 | 行为 |
|------|------|------|
| 下拉刷新 | `Refresh` 图标 | 顶部下拉重新聚合数据 |
| 搜索入口 | 玻璃渐变卡片 | 跳转 `/search` |
| 统计概览 | 三列 `el-card` | 物品/储物柜/分类数量 |
| 分类网格 | 双列 `grid` 卡片 | 点击跳转 `/items?categoryId=` |
| 快捷入口 | 双列卡片 | 全部物品 / 储物柜列表（空间管理） |
| 自定义分类 | `el-dialog` | 调用 categories Store |

## API

### `useHomeDashboard()`

| 返回项 | 类型 | 说明 |
|--------|------|------|
| `dashboard` | `ComputedRef<DashboardVO>` | 仪表盘聚合数据 |
| `stats` | 统计卡片配置 | 含跳转 path |
| `pullState` / `pullDistance` | 下拉刷新状态 | |
| `goToSearch` | `() => void` | 跳转搜索页 |
| `goToItems` | `(categoryId?) => void` | 跳转物品列表 |
| `goToPath` | `(path) => void` | 通用路由跳转 |
| `openCustomCategoryDialog` | `() => void` | 打开分类弹窗 |
| `addCustomCategory` | `() => void` | 新增分类 |

## 数据类型

见 `frontend/src/types/dashboard.ts`（`DashboardVO`、`CategoryStat` 等）。

## 路由

- 路径：`/home`
- 懒加载：`@/views/home/index.vue`

## 后续（V2）

`buildDashboard` 可替换为 `IDashboardRepository.getDashboard()`（`GET /api/dashboard`）。
