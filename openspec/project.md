# 家享收纳（home-storage）— 项目上下文

> 供 OpenSpec / AI 生成变更提案与实现任务时阅读。  
> 产品：家庭物品收纳管理 **移动端 Web**（竖屏、底部 Tab）。

---

## 1. 项目简介

| 项 | 说明 |
|----|------|
| 名称 | 家享收纳（jiaxiang-organizer） |
| 域 | 物品、储物柜、分类、首页仪表盘、全局搜索、演示登录、数据备份 |
| 版本策略 | **V1** 纯前端（无后端）；**V2** Spring Boot + MyBatis Plus + PostgreSQL |
| 需求/设计 | 根目录 `需求文档.md`、`概要设计.md`、`详细设计_*.md` |

---

## 2. 技术栈（目标 vs 仓库现状）

### 2.1 目标前端架构（新代码必须遵循）

**标准组合：Vue 3 + TypeScript + Pinia + Element Plus + Tailwind CSS**

| 层级 | 技术 | 版本建议 | 职责划分 |
|------|------|----------|----------|
| 框架 | **Vue 3** | 3.4+ | 组合式 API、`<script setup lang="ts">` |
| 语言 | **TypeScript** | 5.4+ | `strict: true` |
| 状态 | **Pinia** | 2.1+ | 页面状态；业务数据经 Repository |
| **UI 组件库** | **Element Plus** | 2.x | 表单、按钮、弹窗、上传、表格、消息等 **交互组件** |
| **样式方案** | **Tailwind CSS** | 3.4+ | 布局、间距、响应式、主题色、移动端适配等 **原子类样式** |
| 图标 | `@element-plus/icons-vue` | — | 与 Element Plus 配套，**不使用** lucide-vue-next |
| 样式工具 | clsx + tailwind-merge | — | `cn()` 合并类名（`utils/cn.ts`） |
| 路由 | Vue Router | 4.3+ | 见 `frontend/src/router/index.ts` 约定 |
| 构建 | Vite | 5.2+ | 路径别名 `@` → `src`；PostCSS + Autoprefixer |
| HTTP | axios | 1.7+ | **V2** 使用；V1 经 Repository 走本地存储 |
| 工具 | date-fns | 3.x | 日期格式化 |

**Element Plus 与 Tailwind 分工（重要）**

| 场景 | 使用 |
|------|------|
| 输入框、选择器、日期、上传、对话框、消息提示 | **Element Plus** |
| 页面布局（flex/grid）、内外边距、宽高、圆角阴影、安全区、底 Tab 壳层 | **Tailwind CSS** |
| 覆盖组件外观 | 优先 `el-*` 官方属性/ CSS 变量；必要时用 Tailwind 包一层容器，避免深度选择器滥用 |

**明确禁止（新功能 / 重构）**

- ❌ **Reka UI** 及 `@/components/ui` 脚手架组件（历史遗留，逐步替换）
- ❌ 用 Tailwind **重写** Element Plus 已有组件（如手写原生 `<button>` 替代 `el-button`）
- ❌ **lucide-vue-next** 作为标准图标库
- ❌ 在 View/Store 中直接读写 `localStorage`（须经 `repositories/local/*`）

### 2.2 V1 数据层

| 存储 | 用途 |
|------|------|
| localStorage | 物品、储物柜、分类、登录态（`jiaxiang-*` key） |
| IndexedDB | 照片 Blob（库 `jiaxiang-db`，规划见 `详细设计_前端数据访问层.md`） |

切换 V2：`VITE_DATA_SOURCE=remote`，实现 `repositories/http/*`。

### 2.3 V2 后端（规划，本期可不实现）

| 技术 | 说明 |
|------|------|
| Spring Boot | REST，`/api` 前缀，`Result<T>` 统一响应 |
| MyBatis Plus | Entity / Mapper / Service 默认结构 |
| PostgreSQL | DDL：`详细设计_核心数据模型.sql` |
| JWT | 演示登录 `admin@example.com` / `password` |

### 2.4 仓库现状（迁移参考）

| 项 | 现状 | 目标 |
|----|------|------|
| Tailwind | 已配置（`tailwind.config.js`、`assets/css/main.css`） | **保留并继续使用** |
| Element Plus | 尚未接入 | **新增**：`main.ts` 全局注册 + 按需/自动导入 |
| Reka UI + `components/ui` | 页面大量引用 | **废弃**：改为 Element Plus + Tailwind |
| lucide-vue-next | MainLayout 等使用 | 改为 `@element-plus/icons-vue` |

**OpenSpec 任务**：业务页 = **Element Plus（组件）+ Tailwind（布局样式）**，不再依赖 `@/components/ui`。

---

## 3. 仓库目录结构

```
home-storage/
├── 需求文档.md
├── 概要设计.md
├── 详细设计_*.md
├── 详细设计_核心数据模型.sql
├── openspec/                    # OpenSpec 配置与变更
│   ├── config.yaml
│   ├── project.md               # 本文件
│   └── changes/                 # 变更提案（openspec CLI 生成）
└── frontend/                    # 前端工程（主开发目录）
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.ts              # 入口：Pinia、Router、全局样式
        ├── App.vue
        ├── assets/css/          # 全局样式 + Tailwind 入口（main.css）
        ├── router/index.ts      # 路由与鉴权守卫
        ├── views/               # 页面（单文件 .vue，迁移目标可拆 html/js/css）
        ├── components/
        │   ├── layout/          # MainLayout（顶栏 + 内容区 + 底 Tab）
        │   └── ui/              # 【遗留】脚手架 UI，勿在新需求中扩展
        ├── stores/              # Pinia：items、cabinets、categories、auth
        ├── utils/               # cn.ts 等工具
        ├── config/              # 【规划】dataSource、storageKeys
        ├── repositories/        # 【规划】local/ + http/ + types
        ├── api/                 # 【规划】V2 axios 封装
        └── types/               # 【规划】与后端 Entity 对齐的 TS 类型
```

**路径别名**：`@/*` → `frontend/src/*`（`tsconfig.json`、`vite.config.ts`）。

---

## 4. 核心业务模块与页面

| 模块 | Store（现状） | 页面 `views/` | 路由前缀 |
|------|---------------|---------------|----------|
| 物品 | `stores/items.ts` | Items, ItemForm, ItemDetail | `/items` |
| 储物柜 | `stores/cabinets.ts` | Cabinets, CabinetForm, CabinetDetail | `/cabinets` |
| 分类 | `stores/categories.ts` | Categories | `/categories` |
| 仪表盘/搜索 | 聚合各 Store | Home, Search | `/home`, `/search` |
| 用户/系统 | `stores/auth.ts` | Login, Profile, Backup | `/login`, `/profile`, `/backup` |

**布局**：需登录页面挂在 `components/layout/MainLayout.vue` 下；`meta.requiresAuth`、`showTab`、`showBack`、`showAdd`、`title`。

---

## 5. 已有核心组件与资产

### 5.1 布局（Tailwind 布局 + Element Plus 控件）

| 组件 | 路径 | 职责 |
|------|------|------|
| MainLayout | `components/layout/MainLayout.vue` | 移动壳：顶栏/底 Tab 用 **Tailwind** 排版；操作按钮可用 `el-button` / `el-icon` |

### 5.2 业务页面（13+1）

`Login.vue`、`Home.vue`、`Search.vue`、`Items.vue`、`ItemForm.vue`、`ItemDetail.vue`、`Cabinets.vue`、`CabinetForm.vue`、`CabinetDetail.vue`、`Categories.vue`、`Profile.vue`、`Backup.vue`（及示例页 `CarOutletDefault.vue` 可忽略）。

### 5.3 Pinia Stores（现状直接持久化）

| Store | 持久化 | 说明 |
|-------|--------|------|
| `auth` | persist | 演示登录 mock token |
| `items` | localStorage 手写 | 物品 CRUD、筛选 |
| `cabinets` | localStorage 手写 | 储物柜 CRUD |
| `categories` | localStorage 手写 | 分类、排序、配色 |

**目标**：Store 仅调用 `getXxxRepository()`，见 `详细设计_前端数据访问层.md`。

### 5.4 遗留 UI 库（`components/ui/`，勿在新需求依赖）

基于 **Reka UI** 的脚手架（`components/ui/index.ts`），与目标架构不符。**新代码禁止 import `@/components/ui`**。

迁移对照（组件用 Element Plus，外层布局仍可用 Tailwind）：

| 遗留 `@/components/ui` | 目标 |
|------------------------|------|
| Dialog + useToast | `ElMessageBox`、`ElMessage` |
| Input / Select / DatePicker | `el-input`、`el-select`、`el-date-picker` |
| Card | `el-card` + Tailwind 外层间距 |
| Upload | `el-upload` |
| Carousel | `el-carousel` |
| Button | `el-button` |
| 列表容器 / 间距 / 安全区 | Tailwind 工具类 |

---

## 6. 代码规范

### 6.1 Vue / TypeScript

- 使用 **`<script setup lang="ts">`**，优先组合式 API。
- 路由跳转：**`useRouter()`**，禁止 `window.location.href`（见 `router/index.ts` 注释）。
- 路由懒加载：`() => import('@/views/Xxx.vue')`。
- 子路由 `path` 不带前导 `/`（如 `home`、`items/create`）；独立页如 `/login` 可带 `/`。
- 鉴权：`router.beforeEach` 检查 `useAuthStore().isAuthenticated` 与 `meta.requiresAuth`。

### 6.2 组件与样式（团队规范）

- **新页面**：**Element Plus（组件）+ Tailwind CSS（布局与样式）**；复杂业务块可加 **`fd-` 前缀 + BEM** 的 scoped 样式作为补充。
- **类名合并**：使用 `cn()`（`clsx` + `tailwind-merge`）避免 Tailwind 类冲突。
- **Tailwind 配置**：主题色、圆角、安全区等可在 `tailwind.config.js` 扩展；移动端宽度参考 `max-w-[430px]`。
- **目标结构**（新建或重写组件时）：**HTML / JS / CSS 分离**（`index.vue` + `index.ts` + `index.less` 或独立 `.css`）；Tailwind 类主要写在模板，全局入口在 `assets/css/main.css`。
- 避免 `!important`；移动端正文最小 **14px**，触控区域最小 **44×44px**（可用 Tailwind `min-h-11 min-w-11` 等）。
- 注释：**禁止与代码同一行**；注释写在代码上方独立行。
- 新建 `.ts` / `.vue` 逻辑文件 / `.css|less`：文件头使用 JSDoc 块（`@file`、`@author wuwg`、`@createTime` 等，见团队模板）。

### 6.3 日志与工具

- 调试输出使用 **`window.console.log(...)`**，不用裸 `console.log`（避免 ESLint 告警）。
- 包管理：**yarn**（不用 npm install）。
- 异步优先 **async/await**。

### 6.4 数据访问（V1 目标）

- 常量 key 集中在 `config/storageKeys.ts`（如 `jiaxiang-items`）。
- 业务逻辑放在 **Repository**，Pinia 只做状态与 UI 触发。
- 类型定义在 `types/`，字段与 `详细设计_核心数据模型.sql` / 详细设计 Entity 一致（camelCase）。

### 6.5 API / V2 约定

- 路径前缀：`/api`；分页参数 `current`、`size`；响应 `{ code, message, data }`。
- Repository 方法与 REST **一一映射**（见各 `详细设计_*.md` §5、§8）。

### 6.6 文档

- 新建或大幅修改的业务组件目录下补充 **`readme.md`**（功能、API）。
- 功能变更同步相关 `详细设计_*.md`。

### 6.7 Lint / 构建

```bash
cd frontend
yarn install
yarn dev          # 开发
yarn build        # 生产构建
yarn lint         # ESLint .vue,.ts,.tsx
```

`tsconfig`：`strict: true`；`noUnusedLocals` / `noUnusedParameters` 当前为 `false`。

---

## 7. 路由与 meta 约定

| meta 字段 | 含义 |
|-----------|------|
| `requiresAuth` | 需登录（MainLayout 父级） |
| `title` | 顶栏标题 |
| `showTab` | 显示底部 Tab |
| `showBack` | 显示返回 |
| `showAdd` | 显示右上角新增（跳转当前模块 create） |

演示账号：`admin@example.com` / `password`。

---

## 8. OpenSpec 实施时注意

1. **提案与任务**默认技术栈：**Vue 3 + TypeScript + Pinia + Element Plus + Tailwind CSS**。
2. **UI 组件**一律 Element Plus；**布局与样式**优先 Tailwind，禁止新增 Reka UI / `@/components/ui`。
3. 若改动数据读写，对照 `详细设计_前端数据访问层.md` 与对应模块 §8 V1/V2 映射表。
4. 已有页面迁移可拆子任务：「替换为 Element Plus 组件」+「保留/整理 Tailwind 布局类」。
5. 单函数建议 **<200 行**，单文件 **<1000 行**；超出则拆分 composables。
6. 后端相关任务引用 `详细设计_核心数据模型.sql` 与 Spring Boot 包结构（`概要设计.md` §2.3.3）。

---

## 9. 相关文档索引

| 文档 | 用途 |
|------|------|
| `需求文档.md` | 功能与页面需求 |
| `概要设计.md` | 架构、V1/V2、Repository 原则 |
| `详细设计_前端数据访问层.md` | 工厂、目录、切换清单 |
| `详细设计_物品管理.md` | 详细设计章节模板（§1～§9） |
| `详细设计_核心数据模型.sql` | V2 数据库 |
