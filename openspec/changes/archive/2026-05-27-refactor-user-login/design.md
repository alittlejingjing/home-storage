## Context

- 现状：`Login.vue` 单文件组件，使用 `@/components/ui`（Reka UI 封装）与 `lucide-vue-next`，与 `openspec/project.md` 目标栈不符。
- 约束：Vue 3 + TS + Pinia + **Element Plus**（组件）+ **Tailwind**（布局）；html/js/css 分离；演示账号 `admin@example.com` / `password` 不变。
- 鉴权：V1 仍通过 `useAuthStore().login()`；V2 预留 `IAuthRepository`（见 `详细设计_用户与系统.md`）。

## Goals / Non-Goals

**Goals:**

- 登录页 UI 100% 使用 Element Plus 交互组件 + Tailwind 页面布局
- 目录结构 `views/login/{index.vue,index.ts,index.less,readme.md}`
- 表单校验、密码显隐、演示账号填充、ElMessage 提示与路由跳转行为与现版一致
- 移除登录页对 `@/components/ui`、`lucide-vue-next` 的依赖

**Non-Goals:**

- 不实现真实后端登录或 JWT（V2）
- 不重构 `MainLayout` 或其他页面
- 不在此变更中实现完整 `LocalAuthRepository`（可后续独立变更）

## Decisions

### 1. 目录与文件拆分

| 文件 | 职责 |
|------|------|
| `index.vue` | 模板：Tailwind 布局 + `el-form` / `el-input` / `el-button` |
| `index.ts` | `useLoginForm` composable：状态、校验规则、submit、fillDemo |
| `index.less` | `fd-login` BEM 块；Element 深度样式微调（如有） |

**理由**：符合团队 html/js/css 分离规范；逻辑可单测、可复用于 V2 Repository 切换。

**备选**：保留单文件 `Login.vue` — 拒绝，不符合 project.md 规范。

### 2. UI 组件选型

- `el-form` + `el-form-item` + 规则：`email` 必填+格式，`password` 必填
- `el-input`：`show-password` 原生密码显隐（替代手写 Eye 按钮）
- `el-button`：`type="primary"` 提交；`link` 类型演示账号入口
- `ElMessage` / `ElMessage.error` 替代 `toast` from ui

**理由**：与 Element Plus 规范一致，减少自定义交互代码。

### 3. 图标

- Logo 区：`House` from `@element-plus/icons-vue`
- 装饰性文案不用 lucide `Heart`

### 4. 路由

- 更新 `router/index.ts`：`() => import('@/views/login/index.vue')`
- 删除旧 `views/Login.vue`

### 5. 样式

- 外层容器：`fd-login` + Tailwind（`min-h-screen`、`max-w-[430px]`、渐变背景等）
- 不手写原生 `<button>` 替代 `el-button`

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| Element Plus 默认样式与移动端设计稿偏差 | 用 Tailwind 包容器 + 少量 `index.less` 变量覆盖 |
| 全量引入 Element Plus CSS 体积大 | 已在 `main.ts` 全局注册；后续可改按需导入 |
| Store 仍 mock 登录，与详细设计 Repository 不一致 | composable 内封装 `auth.login` 调用点，注释 V2 替换点 |

## Migration Plan

1. 新建 `views/login/` 三文件 + readme
2. 改路由指向新组件
3. 删除 `Login.vue`
4. 本地 `yarn dev` 验证登录/演示账号/错误提示
5. 无数据迁移；失败则恢复旧路由与文件

## Open Questions

- 是否在本次变更中同步抽取 `IAuthRepository` 接口 — **否**，保持 Store 调用，降低范围
